import { generateSlug } from '@/utils/slug';

describe('generateSlug', () => {
  it('normalizes accents and whitespace', () => {
    expect(generateSlug('Café com Leite')).toBe('cafe-com-leite');
  });

  it('removes symbols and trims hyphens', () => {
    expect(generateSlug('  --Hello!! World--  ')).toBe('hello-world');
  });

  it('returns empty string for empty input', () => {
    expect(generateSlug('')).toBe('');
  });
});
