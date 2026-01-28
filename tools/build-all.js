#!/usr/bin/env node

import { execSync } from 'child_process';

const safeRun = (cmd, label) => {
  try {
    execSync(cmd, { stdio: 'inherit' });
  } catch (err) {
    console.warn(`[build] ${label} falhou (${err.status ?? 'unknown'}). Prosseguindo.`);
  }
};

safeRun('node tools/generate-llms.js', 'llms');
safeRun('node tools/generate-sitemap.js', 'sitemap');

execSync('vite build', { stdio: 'inherit' });

