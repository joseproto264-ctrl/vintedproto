import { Listing } from './types';
const caps = (s:string) => s.trim().replace(/\s+/g,' ').replace(/\b\w/g,c=>c.toUpperCase());
export function reviseListing(input: Listing){
 const keywords = [input.brand, input.colour, input.category, input.size, 'authentic', 'wardrobe essential'].filter(Boolean);
 const title = caps([input.brand, input.title || input.category, input.colour, input.size].filter(Boolean).join(' ')).slice(0,80);
 const base = input.description || `${input.title} by ${input.brand}.`;
 const description = `${base.trim().replace(/\s+/g,' ')}\n\nProfessionally presented and ready to wear. ${input.condition ? `Condition: ${input.condition}.` : ''} Features: ${keywords.join(', ')}. Carefully packed for dispatch.`;
 const n = Number(input.price) || 20; const priceRange = `£${Math.max(1, Math.round(n*.85))} - £${Math.round(n*1.15)}`;
 const category = input.category || (/shoe|trainer|boot/i.test(input.title) ? 'Shoes' : /bag|purse/i.test(input.title) ? 'Bags' : 'Clothing');
 const condition = input.condition === 'Good' ? 'Good - light signs of wear, plenty of life left' : input.condition;
 return { title, description, priceRange, category, condition, keywords };
}
