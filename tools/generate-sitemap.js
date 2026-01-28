#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

const SITE_URL = process.env.SITE_URL || 'https://conectaleads.com';
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://ttnqjbqykcexibxbboax.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR0bnFqYnF5a2NleGlieGJib2F4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkyNzk2NzUsImV4cCI6MjA4NDg1NTY3NX0.93NLY--qohP5QbYVQkOKUqP0_9mx0tK1hwdMkcCOvN0';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const baseRoutes = ['/', '/category/gadgets', '/category/beauty', '/category/home'];

async function fetchDynamicRoutes() {
  try {
    const { data: offers } = await supabase.from('offers').select('slug, updated_at, created_at').eq('status', 'published');
    const { data: categories } = await supabase.from('categories').select('slug, updated_at, created_at');

    const offerRoutes = (offers || []).map((offer) => ({
      loc: `/o/${offer.slug}`,
      lastmod: offer.updated_at || offer.created_at
    }));

    const categoryRoutes = (categories || []).map((cat) => ({
      loc: `/category/${cat.slug}`,
      lastmod: cat.updated_at || cat.created_at
    }));

    return [...offerRoutes, ...categoryRoutes];
  } catch (err) {
    console.error('Failed to fetch dynamic routes for sitemap:', err.message);
    return [];
  }
}

function buildXml(routes) {
  const urls = routes.map((route) => {
    const loc = `${SITE_URL}${route}`;
    return `<url><loc>${loc}</loc><changefreq>daily</changefreq><priority>0.8</priority></url>`;
  }).join('');

  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`;
}

async function main() {
  const dynamicRoutes = await fetchDynamicRoutes();
  const allRoutes = [...baseRoutes.map((r) => ({ loc: r })), ...dynamicRoutes];

  const xml = buildXml(allRoutes.map((r) => r.loc));
  const outputPath = path.join(process.cwd(), 'public', 'sitemap.xml');
  fs.writeFileSync(outputPath, xml, 'utf8');
  console.log(`Sitemap gerado em ${outputPath} com ${allRoutes.length} rotas.`);
}

main();
