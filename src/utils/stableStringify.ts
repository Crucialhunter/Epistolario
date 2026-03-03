export function normalizeVariantIds(obj: any): Record<string, string> {
    if (obj === null || obj === undefined) return {};
    if (typeof obj !== 'object' || Array.isArray(obj)) return {};

    const normalized: Record<string, string> = {};
    for (const key of Object.keys(obj)) {
        if (obj[key] !== undefined) {
            normalized[String(key)] = String(obj[key]);
        }
    }
    return normalized;
}

export function stableStringify(obj: any): string {
    if (obj === null || obj === undefined) return '{}';
    const normalized = normalizeVariantIds(obj);
    const keys = Object.keys(normalized).sort();
    const sortedObj: Record<string, string> = {};
    for (const key of keys) {
        sortedObj[key] = normalized[key];
    }
    return JSON.stringify(sortedObj);
}
