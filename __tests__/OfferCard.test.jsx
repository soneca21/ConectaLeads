import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import OfferCard from '@/components/public/OfferCard';
import { LocalizationProvider } from '@/contexts/LocalizationContext';

const renderWithCtx = (ui) =>
  render(
    <MemoryRouter>
      <LocalizationProvider>{ui}</LocalizationProvider>
    </MemoryRouter>
  );

describe('OfferCard', () => {
  const offer = {
    id: '1',
    title: 'Notebook Gamer',
    price: 1000,
    currency: 'BRL',
    category: 'Eletrônicos',
    slug: 'notebook-gamer',
  };

  it('renders title and price', () => {
    renderWithCtx(<OfferCard offer={offer} />);
    expect(screen.getByText(/Notebook Gamer/i)).toBeInTheDocument();
    const prices = screen.getAllByText(/R\$/);
    expect(prices.length).toBeGreaterThan(0);
  });

  it('uses descriptive alt text', () => {
    renderWithCtx(<OfferCard offer={offer} />);
    const img = screen.getByRole('img');
    expect(img).toHaveAttribute('alt', expect.stringContaining('Notebook Gamer'));
  });
});
