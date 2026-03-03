import { GoogleGenAI } from '@google/genai';
import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';

export interface ProviderAdapter {
  id: string;
  name: string;
  generateTranscription(imageBase64s: string[], prompt: string, apiKey: string, onLog?: (type: 'info' | 'error' | 'warning' | 'success', msg: string, data?: any) => void): Promise<{ text: string; tokens?: { promptTokens: number; completionTokens: number; totalTokens: number } }>;
}

export const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      resolve(reader.result as string);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

function cleanResponse(text: string): string {
  let cleaned = text.replace(/^```[a-z]*\n/i, '');
  cleaned = cleaned.replace(/\n```$/i, '');
  return cleaned.trim();
}

export const geminiAdapter: ProviderAdapter = {
  id: 'gemini-3.1-pro-preview',
  name: 'Gemini 3.1 Pro',
  async generateTranscription(imageBase64s: string[], prompt: string, apiKey: string, onLog?: (type: 'info' | 'error' | 'warning' | 'success', msg: string, data?: any) => void) {
    try {
      const ai = new GoogleGenAI({ apiKey });

      const parts: any[] = imageBase64s.map(img => {
        const base64Data = img.split(',')[1];
        const mimeType = img.split(';')[0].split(':')[1];
        return { inlineData: { data: base64Data, mimeType } };
      });
      const requestPayloadParts: any[] = imageBase64s.map(img => {
        const mimeType = img.split(';')[0].split(':')[1];
        return { inlineData: { data: '<BASE64_IMAGE_DATA_HIDDEN>', mimeType } };
      });

      parts.push({ text: prompt });
      requestPayloadParts.push({ text: prompt });

      const requestPayload = {
        model: 'gemini-3.1-pro-preview',
        contents: {
          parts: requestPayloadParts
        },
        config: {
          responseMimeType: "application/json",
        }
      };

      onLog?.('info', 'Sending request to Gemini API', { payload: requestPayload });

      const response = await ai.models.generateContent({
        model: 'gemini-3.1-pro-preview',
        contents: {
          parts: parts
        },
        config: {
          responseMimeType: "application/json",
        }
      });

      onLog?.('success', 'Received response from Gemini API', {
        rawText: response.text,
        usage: response.usageMetadata
      });

      const usage = response.usageMetadata;
      return {
        text: cleanResponse(response.text || ''),
        tokens: usage ? {
          promptTokens: usage.promptTokenCount || 0,
          completionTokens: usage.candidatesTokenCount || 0,
          totalTokens: usage.totalTokenCount || 0
        } : undefined
      };
    } catch (error: any) {
      console.error("Gemini API Error:", error);
      const errorMessage = error?.message || error?.toString() || "Unknown Gemini API Error";
      onLog?.('error', 'Gemini API Error', { error: errorMessage, stack: error?.stack });
      throw new Error(`Gemini API Error: ${errorMessage}`);
    }
  }
};

export const openaiAdapter: ProviderAdapter = {
  id: 'gpt-5.2',
  name: 'GPT-5.2',
  async generateTranscription(imageBase64s: string[], prompt: string, apiKey: string, onLog?: (type: 'info' | 'error' | 'warning' | 'success', msg: string, data?: any) => void) {
    try {
      const openai = new OpenAI({ apiKey, dangerouslyAllowBrowser: true });

      const contentParts: any[] = [{ type: 'text', text: prompt }];
      const requestPayloadContentParts: any[] = [{ type: 'text', text: prompt }];

      for (const img of imageBase64s) {
        contentParts.push({ type: 'image_url', image_url: { url: img } });
        requestPayloadContentParts.push({ type: 'image_url', image_url: { url: '<BASE64_IMAGE_DATA_HIDDEN>' } });
      }

      const requestPayload = {
        model: 'gpt-5.2',
        messages: [
          {
            role: 'user',
            content: requestPayloadContentParts
          }
        ]
      };

      onLog?.('info', 'Sending request to OpenAI API', { payload: requestPayload });

      const response = await openai.chat.completions.create({
        model: 'gpt-5.2',
        messages: [
          {
            role: 'user',
            content: contentParts
          }
        ]
      });

      onLog?.('success', 'Received response from OpenAI API', {
        rawText: response.choices[0].message.content,
        usage: response.usage
      });

      const usage = response.usage;
      return {
        text: cleanResponse(response.choices[0].message.content || ''),
        tokens: usage ? {
          promptTokens: usage.prompt_tokens,
          completionTokens: usage.completion_tokens,
          totalTokens: usage.total_tokens
        } : undefined
      };
    } catch (error: any) {
      console.error("OpenAI API Error:", error);
      const errorMessage = error?.message || error?.toString() || "Unknown OpenAI API Error";
      onLog?.('error', 'OpenAI API Error', { error: errorMessage, stack: error?.stack });
      throw new Error(`OpenAI API Error: ${errorMessage}`);
    }
  }
};

export const anthropicSonnetAdapter: ProviderAdapter = {
  id: 'claude-4.6-sonnet',
  name: 'Claude 4.6 Sonnet',
  async generateTranscription(imageBase64s: string[], prompt: string, apiKey: string, onLog?: (type: 'info' | 'error' | 'warning' | 'success', msg: string, data?: any) => void) {
    try {
      const anthropic = new Anthropic({ apiKey, dangerouslyAllowBrowser: true });

      const contentParts: any[] = [];
      const requestPayloadContentParts: any[] = [];

      for (const img of imageBase64s) {
        const base64Data = img.split(',')[1];
        const mediaType = img.split(';')[0].split(':')[1] as any;
        contentParts.push({ type: 'image', source: { type: 'base64', media_type: mediaType, data: base64Data } });
        requestPayloadContentParts.push({ type: 'image', source: { type: 'base64', media_type: mediaType, data: '<BASE64_IMAGE_DATA_HIDDEN>' } });
      }
      contentParts.push({ type: 'text', text: prompt });
      requestPayloadContentParts.push({ type: 'text', text: prompt });

      const requestPayload = {
        model: 'claude-4.6-sonnet-20260101',
        max_tokens: 4096,
        messages: [
          {
            role: 'user',
            content: requestPayloadContentParts
          }
        ]
      };

      onLog?.('info', 'Sending request to Anthropic API', { payload: requestPayload });

      const response = await anthropic.messages.create({
        model: 'claude-4.6-sonnet-20260101',
        max_tokens: 4096,
        messages: [
          {
            role: 'user',
            content: contentParts
          }
        ]
      });

      onLog?.('success', 'Received response from Anthropic API', {
        rawText: (response.content[0] as any).text,
        usage: response.usage
      });

      const usage = response.usage;
      return {
        text: cleanResponse((response.content[0] as any).text || ''),
        tokens: usage ? {
          promptTokens: usage.input_tokens,
          completionTokens: usage.output_tokens,
          totalTokens: usage.input_tokens + usage.output_tokens
        } : undefined
      };
    } catch (error: any) {
      console.error("Anthropic API Error:", error);
      const errorMessage = error?.message || error?.toString() || "Unknown Anthropic API Error";
      onLog?.('error', 'Anthropic API Error', { error: errorMessage, stack: error?.stack });
      throw new Error(`Anthropic API Error: ${errorMessage}`);
    }
  }
};

export const anthropicOpusAdapter: ProviderAdapter = {
  id: 'claude-4.6-opus',
  name: 'Claude 4.6 Opus',
  async generateTranscription(imageBase64s: string[], prompt: string, apiKey: string, onLog?: (type: 'info' | 'error' | 'warning' | 'success', msg: string, data?: any) => void) {
    try {
      const anthropic = new Anthropic({ apiKey, dangerouslyAllowBrowser: true });

      const contentParts: any[] = [];
      const requestPayloadContentParts: any[] = [];

      for (const img of imageBase64s) {
        const base64Data = img.split(',')[1];
        const mediaType = img.split(';')[0].split(':')[1] as any;
        contentParts.push({ type: 'image', source: { type: 'base64', media_type: mediaType, data: base64Data } });
        requestPayloadContentParts.push({ type: 'image', source: { type: 'base64', media_type: mediaType, data: '<BASE64_IMAGE_DATA_HIDDEN>' } });
      }
      contentParts.push({ type: 'text', text: prompt });
      requestPayloadContentParts.push({ type: 'text', text: prompt });

      const requestPayload = {
        model: 'claude-4.6-opus-20260101',
        max_tokens: 4096,
        messages: [
          {
            role: 'user',
            content: requestPayloadContentParts
          }
        ]
      };

      onLog?.('info', 'Sending request to Anthropic API (Opus)', { payload: requestPayload });

      const response = await anthropic.messages.create({
        model: 'claude-4.6-opus-20260101',
        max_tokens: 4096,
        messages: [
          {
            role: 'user',
            content: contentParts
          }
        ]
      });

      onLog?.('success', 'Received response from Anthropic API (Opus)', {
        rawText: (response.content[0] as any).text,
        usage: response.usage
      });

      const usage = response.usage;
      return {
        text: cleanResponse((response.content[0] as any).text || ''),
        tokens: usage ? {
          promptTokens: usage.input_tokens,
          completionTokens: usage.output_tokens,
          totalTokens: usage.input_tokens + usage.output_tokens
        } : undefined
      };
    } catch (error: any) {
      console.error("Anthropic API Error:", error);
      const errorMessage = error?.message || error?.toString() || "Unknown Anthropic API Error";
      onLog?.('error', 'Anthropic API Error', { error: errorMessage, stack: error?.stack });
      throw new Error(`Anthropic API Error: ${errorMessage}`);
    }
  }
};

export const providers = [geminiAdapter, openaiAdapter, anthropicSonnetAdapter, anthropicOpusAdapter];
