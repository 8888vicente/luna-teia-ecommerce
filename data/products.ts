export type ProductFamily = 'Rojos' | 'Rosas' | 'Varios' | string;

export interface Product {
  id: string;
  name: string;
  family: ProductFamily;
  category: string;
  price: number;
  colorHex: string;
  imageUrl: string;
  stock?: number;  // piezas disponibles (viene de Supabase)
}


export const FAMILIES: ProductFamily[] = ['Rojos', 'Rosas', 'Varios'];

export const PRODUCTS: Product[] = [
  // ── ROJOS & INTENSOS ──
  { id: 'r1',  name: 'Pasion',        family: 'Rojos',  category: 'Labial Indeleble Mate', price: 100, colorHex: '#d50000', imageUrl: '/Pasion.jpg' },
  { id: 'r2',  name: 'Cereza',        family: 'Rojos',  category: 'Labial Indeleble Mate', price: 100, colorHex: '#c62828', imageUrl: '/Cereza.jpg' },
  { id: 'r3',  name: 'Rojo Quemado',  family: 'Rojos',  category: 'Labial Indeleble Mate', price: 100, colorHex: '#b71c1c', imageUrl: '/Rojo_Quemado.jpg' },
  { id: 'r4',  name: 'Marte',         family: 'Rojos',  category: 'Labial Indeleble Mate', price: 100, colorHex: '#8b1a1a', imageUrl: '/Marte.jpg' },
  { id: 'r5',  name: 'Fresa',         family: 'Rojos',  category: 'Labial Indeleble Mate', price: 100, colorHex: '#e53935', imageUrl: '/Fresa.jpg' },
  { id: 'r6',  name: 'Coral',         family: 'Rojos',  category: 'Labial Indeleble Mate', price: 100, colorHex: '#ff7043', imageUrl: '/Coral.jpg' },
  { id: 'r7',  name: 'Naranja',       family: 'Rojos',  category: 'Labial Indeleble Mate', price: 100, colorHex: '#f4511e', imageUrl: '/Naranja.jpg' },
  { id: 'r8',  name: 'Naranja Mate',  family: 'Rojos',  category: 'Labial Indeleble Mate', price: 100, colorHex: '#e64a19', imageUrl: '/Naranja_Mate.jpg' },
  { id: 'r9',  name: 'Tangerin',      family: 'Rojos',  category: 'Labial Indeleble Mate', price: 100, colorHex: '#ff6d00', imageUrl: '/Tangerin.jpg' },
  { id: 'r10', name: 'Mamey',         family: 'Rojos',  category: 'Labial Indeleble Mate', price: 100, colorHex: '#d84315', imageUrl: '/Mamey_.jpg' },

  // ── ROSAS & FUCSIAS ──
  { id: 'p1',  name: 'Fiusha',        family: 'Rosas',  category: 'Labial Indeleble Mate', price: 100, colorHex: '#e91e8c', imageUrl: '/Fiusha.jpg' },
  { id: 'p2',  name: 'Fiusha Mate',   family: 'Rosas',  category: 'Labial Indeleble Mate', price: 100, colorHex: '#c2185b', imageUrl: '/Fiusha_mate.jpg' },
  { id: 'p3',  name: 'Rosa Neon',     family: 'Rosas',  category: 'Labial Indeleble Mate', price: 100, colorHex: '#f50057', imageUrl: '/Rosa_Neon.jpg' },
  { id: 'p4',  name: 'Rosa Mx',       family: 'Rosas',  category: 'Labial Indeleble Mate', price: 100, colorHex: '#ec407a', imageUrl: '/Rosa_Mx.jpg' },
  { id: 'p5',  name: 'Rose',          family: 'Rosas',  category: 'Labial Indeleble Mate', price: 100, colorHex: '#f06292', imageUrl: '/Rose.jpg' },
  { id: 'p6',  name: 'Rosa Seda',     family: 'Rosas',  category: 'Labial Indeleble Mate', price: 100, colorHex: '#f48fb1', imageUrl: '/Rosa_Seda.jpg' },
  { id: 'p7',  name: 'Palo Rosa',     family: 'Rosas',  category: 'Labial Indeleble Mate', price: 100, colorHex: '#f8bbd0', imageUrl: '/Palo_Rosa.jpg' },
  { id: 'p8',  name: 'Bugambilia',    family: 'Rosas',  category: 'Labial Indeleble Mate', price: 100, colorHex: '#ad1457', imageUrl: '/Bugambilia.jpg' },
  { id: 'p9',  name: 'Anis',          family: 'Rosas',  category: 'Labial Indeleble Mate', price: 100, colorHex: '#d81b60', imageUrl: '/Anis_.jpg' },
  { id: 'p10', name: 'Moon',          family: 'Rosas',  category: 'Labial Indeleble Mate', price: 100, colorHex: '#e8a0bf', imageUrl: '/Moon.jpg' },

  // ── VARIOS: NUDES, OSCUROS & ESPECIALES ──
  { id: 'v1',  name: 'Nature',        family: 'Varios', category: 'Labial Indeleble Mate', price: 100, colorHex: '#d7ccc8', imageUrl: '/Nature.jpg' },
  { id: 'v2',  name: 'Secret',        family: 'Varios', category: 'Labial Indeleble Mate', price: 100, colorHex: '#bcaaa4', imageUrl: '/Secret.jpg' },
  { id: 'v3',  name: 'Terra',         family: 'Varios', category: 'Labial Indeleble Mate', price: 100, colorHex: '#a1887f', imageUrl: '/Terra.jpg' },
  { id: 'v4',  name: 'Caramelo',      family: 'Varios', category: 'Labial Indeleble Mate', price: 100, colorHex: '#bf8c6a', imageUrl: '/Caramelo.jpg' },
  { id: 'v5',  name: 'Moka',          family: 'Varios', category: 'Labial Indeleble Mate', price: 100, colorHex: '#795548', imageUrl: '/Moka.jpg' },
  { id: 'v6',  name: 'Chocolate',     family: 'Varios', category: 'Labial Indeleble Mate', price: 100, colorHex: '#5d4037', imageUrl: '/Chocolate.jpg' },
  { id: 'v7',  name: 'Expresso',      family: 'Varios', category: 'Labial Indeleble Mate', price: 100, colorHex: '#4e342e', imageUrl: '/Expresso.jpg' },
  { id: 'v8',  name: 'Cocoa',         family: 'Varios', category: 'Labial Indeleble Mate', price: 100, colorHex: '#6d4c41', imageUrl: '/Cocoa.jpg' },
  { id: 'v9',  name: 'Ciruela',       family: 'Varios', category: 'Labial Indeleble Mate', price: 100, colorHex: '#6a1b9a', imageUrl: '/Ciruela.jpg' },
  { id: 'v10', name: 'Blackberry',    family: 'Varios', category: 'Labial Indeleble Mate', price: 100, colorHex: '#4a148c', imageUrl: '/Blackberry_.jpg' },
  { id: 'x1',  name: 'Purpura',       family: 'Varios', category: 'Labial Indeleble Mate', price: 100, colorHex: '#7b1fa2', imageUrl: '/Purpura.jpg' },
  { id: 'x2',  name: 'Piñon',         family: 'Varios', category: 'Labial Indeleble Mate', price: 100, colorHex: '#8d6e63', imageUrl: '/Piñon.jpg' },
  { id: 'x3',  name: 'Oro Sol',       family: 'Rojos',  category: 'Labial Indeleble Mate', price: 100, colorHex: '#ffd54f', imageUrl: '/Oro_Sol.jpg' },
];