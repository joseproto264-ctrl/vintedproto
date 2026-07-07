declare module 'vinted-api' { export function search(url: string): Promise<unknown>; const api: { search: typeof search }; export default api; }
