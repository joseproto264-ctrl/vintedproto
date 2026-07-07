import { Listing } from './types';
const KEY='autovinted:listings';
export const loadListings = (): Listing[] => typeof window==='undefined'?[]:JSON.parse(localStorage.getItem(KEY)||'[]');
export const saveListings = (listings: Listing[]) => localStorage.setItem(KEY, JSON.stringify(listings));
