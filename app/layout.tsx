import './globals.css';
import type { Metadata } from 'next';
export const metadata: Metadata = { title: 'AutoVinted AI', description: 'Local-first Vinted listing assistant' };
export default function RootLayout({ children }: { children: React.ReactNode }) { return <html lang="en"><body>{children}</body></html>; }
