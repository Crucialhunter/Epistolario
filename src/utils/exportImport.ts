import { db } from '../db/db';

export async function exportData(includeImages: boolean = false) {
  const data: any = {
    documents: await db.documents.toArray(),
    groundTruths: await db.groundTruths.toArray(),
    imageVariants: await db.imageVariants.toArray(),
    runResults: await db.runResults.toArray(),
    prompts: await db.prompts.toArray(),
  };

  if (!includeImages) {
    // Remove blobs
    data.documents = data.documents.map((d: any) => {
      const { imageBlob, pages, ...rest } = d;
      return rest;
    });
    data.imageVariants = data.imageVariants.map((v: any) => {
      const { imageBlob, ...rest } = v;
      return rest;
    });
  } else {
    // Convert blobs to base64 for export
    const blobToBase64 = (blob: Blob): Promise<string> => {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(blob);
      });
    };

    for (const doc of data.documents) {
      if (doc.pages && doc.pages.length > 0) {
        doc.pagesBase64 = await Promise.all(doc.pages.map((p: Blob) => blobToBase64(p)));
        delete doc.pages;
      }
      if (doc.imageBlob) {
        doc.imageBase64 = await blobToBase64(doc.imageBlob);
        delete doc.imageBlob;
      }
    }
    for (const variant of data.imageVariants) {
      if (variant.imageBlob) {
        variant.imageBase64 = await blobToBase64(variant.imageBlob);
        delete variant.imageBlob;
      }
    }
  }

  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = `paleobench-export-${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export async function importData(file: File) {
  const text = await file.text();
  const data = JSON.parse(text);

  const base64ToBlob = async (base64: string) => {
    const res = await fetch(base64);
    return await res.blob();
  };

  await db.transaction('rw', [db.documents, db.groundTruths, db.imageVariants, db.runResults, db.prompts], async () => {
    if (data.documents) {
      for (const doc of data.documents) {
        if (doc.pagesBase64) {
          doc.pages = await Promise.all(doc.pagesBase64.map((b64: string) => base64ToBlob(b64)));
          delete doc.pagesBase64;
        } else if (doc.imageBase64) {
          doc.pages = [await base64ToBlob(doc.imageBase64)];
          delete doc.imageBase64;
        } else if (!doc.pages) {
          doc.pages = [];
        }
        await db.documents.put(doc);
      }
    }
    if (data.groundTruths) await db.groundTruths.bulkPut(data.groundTruths);
    if (data.imageVariants) {
      for (const variant of data.imageVariants) {
        if (variant.imageBase64) {
          variant.imageBlob = await base64ToBlob(variant.imageBase64);
          delete variant.imageBase64;
        }
        await db.imageVariants.put(variant);
      }
    }
    if (data.runResults) await db.runResults.bulkPut(data.runResults);
    if (data.prompts) await db.prompts.bulkPut(data.prompts);
  });
}
