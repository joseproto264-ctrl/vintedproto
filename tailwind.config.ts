import type { Config } from 'tailwindcss';
const config: Config = { content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}', './lib/**/*.{ts,tsx}'], theme: { extend: { boxShadow: { glass: '0 20px 80px rgba(15,23,42,.18)' } } }, plugins: [] };
export default config;
