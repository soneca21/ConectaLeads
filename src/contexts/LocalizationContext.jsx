import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

const DEFAULT_LANGUAGE = 'pt';
const DEFAULT_CURRENCY = 'BRL';

const EXCHANGE_RATES = {
  BRL: 1,
  USD: 0.20,
  EUR: 0.18,
  GBP: 0.16
};

const TRANSLATIONS = {
  pt: {
    hero_headline: 'Os melhores achados de',
    hero_subheadline: 'Curadoria diária de gadgets, beleza e utilidades domésticas com os melhores preços. Prós, contras e tudo que você precisa saber antes de comprar.',
    explore_categories: 'Explorar Categorias',
    weekly_deals: 'Achados da Semana',
    see_all: 'Ver todos',
    free_shipping: 'Frete Grátis',
    buy_now: 'Comprar na Shopee',
    whatsapp_cta: 'Falar no WhatsApp',
    faq_title: 'Perguntas frequentes',
    reviews_title: 'Avaliações de clientes',
    price_history: 'Histórico de preço',
    related_products: 'Pessoas também viram',
    stock_label: 'Estoque',
    available: 'Disponível',
    out_of_stock: 'Indisponível',
    filters: 'Filtros',
    min_price: 'Preço mín.',
    max_price: 'Preço máx.',
    apply_filters: 'Aplicar filtros',
    category: 'Categoria',
    tags: 'Tags',
    language: 'Idioma',
    currency: 'Moeda',
    seo_default_desc: 'Curadoria diária de ofertas com tecnologia, beleza e casa — com reviews, histórico de preço e links verificados.'
  },
  en: {
    hero_headline: 'The best curated finds in',
    hero_subheadline: 'Daily curation of gadgets, beauty and home goods with the best prices. Pros, cons and everything you need to know before buying.',
    explore_categories: 'Browse categories',
    weekly_deals: 'Weekly finds',
    see_all: 'See all',
    free_shipping: 'Free shipping',
    buy_now: 'Buy on Shopee',
    whatsapp_cta: 'Chat on WhatsApp',
    faq_title: 'Frequently asked questions',
    reviews_title: 'Customer reviews',
    price_history: 'Price history',
    related_products: 'People also viewed',
    stock_label: 'Stock',
    available: 'Available',
    out_of_stock: 'Out of stock',
    filters: 'Filters',
    min_price: 'Min price',
    max_price: 'Max price',
    apply_filters: 'Apply filters',
    category: 'Category',
    tags: 'Tags',
    language: 'Language',
    currency: 'Currency',
    seo_default_desc: 'Daily curated offers for tech, beauty and home — with reviews, price history and verified links.'
  }
};

const LocalizationContext = createContext();

export const LocalizationProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => localStorage.getItem('lang') || DEFAULT_LANGUAGE);
  const [currency, setCurrency] = useState(() => localStorage.getItem('currency') || DEFAULT_CURRENCY);

  useEffect(() => {
    localStorage.setItem('lang', language);
  }, [language]);

  useEffect(() => {
    localStorage.setItem('currency', currency);
  }, [currency]);

  const t = (key, fallback) => TRANSLATIONS[language]?.[key] || fallback || TRANSLATIONS[DEFAULT_LANGUAGE][key] || key;

  const convertPrice = (value, from = DEFAULT_CURRENCY, to = currency) => {
    const base = EXCHANGE_RATES[from] || 1;
    const target = EXCHANGE_RATES[to] || 1;
    return (Number(value) || 0) * (target / base);
  };

  const formatPrice = (value, opts = {}) => {
    const targetCurrency = opts.currency || currency;
    const converted = convertPrice(value, opts.from || DEFAULT_CURRENCY, targetCurrency);
    const locale = language === 'pt' ? 'pt-BR' : 'en-US';
    return new Intl.NumberFormat(locale, { style: 'currency', currency: targetCurrency }).format(converted);
  };

  const value = useMemo(() => ({
    language,
    currency,
    setLanguage,
    setCurrency,
    t,
    formatPrice,
    availableLanguages: Object.keys(TRANSLATIONS),
    availableCurrencies: Object.keys(EXCHANGE_RATES)
  }), [language, currency]);

  return (
    <LocalizationContext.Provider value={value}>
      {children}
    </LocalizationContext.Provider>
  );
};

export const useLocalization = () => useContext(LocalizationContext);

