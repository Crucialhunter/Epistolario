export function normalizeLiteral(text: string, strict: boolean = false): string {
  if (!text) return '';
  
  let normalized = text;
  
  // Remove line numbers at the start of lines: e.g., "1.", "1-", "1)", "1 "
  normalized = normalized.replace(/^\s*\d+\s*[\.\-:)]?\s*/gm, '');
  
  // Unify newlines
  normalized = normalized.replace(/\r\n/g, '\n');
  
  // Collapse spaces and tabs
  normalized = normalized.replace(/[ \t]+/g, ' ');
  
  // Trim per line and globally
  normalized = normalized.split('\n').map(line => line.trim()).join('\n').trim();
  
  // Remove navigation/UI symbols if they leaked
  normalized = normalized.replace(/Primera « \d+ \d+… Última/g, '');
  
  if (!strict) {
    // Profile A (Benchmark Core): Remove editorial marks that don't affect transcription meaning
    normalized = normalized.replace(/☞/g, '');
    normalized = normalized.replace(/\[\^.*?\^\]/g, ''); // Remove notes [^...^]
  }
  
  return normalized;
}

export function normalizeModernizada(text: string): string {
  if (!text) return '';
  
  let normalized = text;
  
  // Lowercase
  normalized = normalized.toLowerCase();
  
  // Normalize Unicode and remove diacritics
  normalized = normalized.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  
  // Remove punctuation
  normalized = normalized.replace(/[.,;:!?¿¡()]/g, '');
  
  // Remove known editorial marks
  normalized = normalized.replace(/\[\?\?\]/g, '');
  normalized = normalized.replace(/\[\?\]/g, '');
  normalized = normalized.replace(/\[roto\]/g, '');
  normalized = normalized.replace(/\[ilegible\]/g, '');
  normalized = normalized.replace(/\[\^.*?\^\]/g, '');
  normalized = normalized.replace(/☞/g, '');
  
  // Collapse whitespace to a single space
  normalized = normalized.replace(/\s+/g, ' ').trim();
  
  return normalized;
}
