// Centralized lists for categories and lead stages with translations.
// Use these as fallbacks or to enforce consistent labels across the app.

export const CATEGORIES = [
  { key: 'electronics', slug: 'eletronicos', name: 'Eletrônicos' },
  { key: 'home', slug: 'casa', name: 'Casa & Decoração' },
  { key: 'fashion', slug: 'moda', name: 'Moda' },
  { key: 'beauty', slug: 'beleza', name: 'Beleza & Cuidados' },
  { key: 'sports', slug: 'esportes', name: 'Esporte & Lazer' },
  { key: 'pets', slug: 'pets', name: 'Pets' },
  { key: 'office', slug: 'escritorio', name: 'Escritório & Papelaria' },
];

export const LEAD_STAGES = [
  { key: 'new', label: 'Novo' },
  { key: 'qualified', label: 'Qualificado' },
  { key: 'negotiation', label: 'Negociação' },
  { key: 'closed', label: 'Fechado' },
  { key: 'lost', label: 'Perdido' },
];

export const stageLabel = (key) => LEAD_STAGES.find((s) => s.key === key)?.label || key;
