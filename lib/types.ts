export type ListingStatus = 'Draft' | 'Ready' | 'Uploaded';
export type Listing = { id:string; photos:string[]; title:string; brand:string; category:string; size:string; colour:string; condition:string; price:string; description:string; status:ListingStatus; createdAt:string; updatedAt:string };
export const emptyListing = (): Listing => ({ id: crypto.randomUUID(), photos: [], title: '', brand: '', category: '', size: '', colour: '', condition: 'Good', price: '', description: '', status: 'Draft', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
