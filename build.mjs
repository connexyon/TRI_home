// Static site generator: src/template.html + src/locales/<code>.mjs  ->  index.html (en), ko/, nl/, fr/, ja/
// Usage: node build.mjs        (no dependencies)
//
// Add a language:  1) create src/locales/<code>.mjs   2) add it to LANGS below   3) run node build.mjs
// Missing keys fall back to English. Keys listed in BLOCKS show the English text with a short
// "English only" note when a locale does not provide them.

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = dirname(fileURLToPath(import.meta.url));

// Set to the deployed origin (e.g. 'https://connexyon.github.io/TRI_home') to emit hreflang links.
const SITE_URL = '';

const LANGS = [
  { code: 'en', name: 'English' },
  { code: 'ko', name: '한국어' },
  { code: 'nl', name: 'Nederlands' },
  { code: 'fr', name: 'Français' },
  { code: 'ja', name: '日本語', head: '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@300;400;500;700&display=swap">' },
];
const DEFAULT = 'en';

const BASE = 'https://torahresourcesinternational.com';
const URLS = {
  donate: `${BASE}/donate/`,
  contact: `${BASE}/contact-us/`,
  books: `${BASE}/books/`,
  tri_home: `${BASE}/`,
  torahportion: `${BASE}/torah-portion/`,
  q7: `${BASE}/7questions/`,
  tekhelet_pdf: `${BASE}/wp-content/uploads/2025/01/tekhelet.pdf`,
  twokingdoms_pdf: `${BASE}/wp-content/uploads/2018/10/two_kingdoms.pdf`,
  howtostudy_pdf: `${BASE}/wp-content/uploads/2018/10/how_to_study_torah.pdf`,
  galatians_pdf: `${BASE}/wp-content/uploads/2018/10/galatians_summary.pdf`,
  thought_pdf: `${BASE}/wp-content/uploads/2025/08/SN_1st_Century_Believing_Community.pdf`,
  triholland_parashot: 'https://www.triholland.nl/product-categorie/parashot/',
  temple_tri: 'https://www.triholland.nl/product-categorie/2024-temple-en/?lang=en',
  identity_tri: 'https://www.triholland.nl/product-categorie/identity-in-messiah/?lang=en',
  torahtruths: 'https://torahtruths.com/',
  book1: 'https://www.amazon.com/dp/0990437876/',
  book2: 'https://www.amazon.com/dp/172605313X/',
  book3: 'https://www.amazon.com/dp/1087386950/',
};

const template = readFileSync(join(ROOT, 'src/template.html'), 'utf8');
const locales = {};
for (const l of LANGS) {
  locales[l.code] = (await import(pathToFileURL(join(ROOT, `src/locales/${l.code}.mjs`)).href)).default;
}
const en = locales[DEFAULT];

const outPath = (code) => (code === DEFAULT ? 'index.html' : `${code}/index.html`);
const rootOf = (code) => (code === DEFAULT ? '' : '../');
const hrefTo = (from, to) => (to === DEFAULT ? (from === DEFAULT ? './' : '../') : `${rootOf(from)}${to}/`);

function render(lang) {
  const dict = locales[lang.code];
  const root = rootOf(lang.code);
  const warnings = [];

  const get = (key) => {
    if (key in dict) return dict[key];
    if (!(key in en)) throw new Error(`Unknown key "${key}" used in template`);
    if (lang.code !== DEFAULT) warnings.push(key);
    return en[key];
  };

  const langMenu =
    `<details class="lang"><summary><span class="sr">${get('lang_label')}: </span>${lang.name}</summary><ul>` +
    LANGS.map((l) => {
      const current = l.code === lang.code ? ' aria-current="true"' : '';
      return `<li><a href="${hrefTo(lang.code, l.code)}" lang="${l.code}" hreflang="${l.code}"${current}>${l.name}</a></li>`;
    }).join('') +
    `</ul></details>`;

  const headExtra = [
    lang.head || '',
    ...(SITE_URL
      ? [
          ...LANGS.map((l) => `<link rel="alternate" hreflang="${l.code}" href="${SITE_URL}/${l.code === DEFAULT ? '' : l.code + '/'}">`),
          `<link rel="alternate" hreflang="x-default" href="${SITE_URL}/">`,
        ]
      : []),
  ].filter(Boolean).join('\n  ');

  let html = template
    .replace(/\{\{block:(\w+)\}\}/g, (_, key) => {
      if (key in dict) return dict[key];
      if (!(key in en)) throw new Error(`Unknown block "${key}"`);
      if (lang.code === DEFAULT) return en[key];
      warnings.push(key);
      return `<p class="en-note">${get('en_note')}</p>\n<div lang="en">${en[key]}</div>`;
    })
    .replace(/\{\{url:(\w+)\}\}/g, (_, key) => {
      if (!(key in URLS)) throw new Error(`Unknown url "${key}"`);
      return URLS[key];
    })
    .replace(/\{\{(\w+)\}\}/g, (_, key) => {
      switch (key) {
        case 'lang': return lang.code;
        case 'root': return root;
        case 'lang_menu': return langMenu;
        case 'head_extra': return headExtra;
        default: return get(key);
      }
    });

  // {a:key}text{/a}  ->  external link
  html = html.replace(/\{a:(\w+)\}([\s\S]*?)\{\/a\}/g, (_, key, text) => {
    if (!(key in URLS)) throw new Error(`Unknown url "${key}"`);
    return `<a href="${URLS[key]}" target="_blank" rel="noopener">${text}</a>`;
  });

  const left = html.match(/\{\{[^}]*\}\}|\{a:/g);
  if (left) throw new Error(`Unresolved placeholders in ${lang.code}: ${left.join(', ')}`);
  return { html, warnings: [...new Set(warnings)] };
}

for (const lang of LANGS) {
  const { html, warnings } = render(lang);
  const file = join(ROOT, outPath(lang.code));
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, html);
  console.log(`${outPath(lang.code).padEnd(14)} ${warnings.length ? `English fallback: ${warnings.join(', ')}` : 'fully translated'}`);
}
