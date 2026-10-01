# TRI

Torah Resources International — multilingual static site.

| Language | URL path | Source |
|---|---|---|
| English (default) | `/` → `index.html` | `src/locales/en.mjs` |
| 한국어 | `/ko/` | `src/locales/ko.mjs` |
| Nederlands | `/nl/` | `src/locales/nl.mjs` |
| Français | `/fr/` | `src/locales/fr.mjs` |
| 日本語 | `/ja/` | `src/locales/ja.mjs` |

## Edit and build

The HTML files are **generated**. Edit the sources, then rebuild:

```
node build.mjs
```

- `src/template.html` — page structure (shared by every language)
- `src/locales/<code>.mjs` — all text for one language
- `styles.css`, `script.js`, `assets/` — shared by every language

English is the source. A key missing from another locale falls back to English (blocks such as
`thought_body` then show the English text with a short “English only” note). All five languages are
currently fully translated.

## Add a language

1. Copy `src/locales/en.mjs` to `src/locales/<code>.mjs` and translate it.
2. Add `{ code, name }` to `LANGS` in `build.mjs`.
3. Run `node build.mjs`.

## Notes

- Translations of the short copy were drafted by Claude and need review by a native speaker,
  especially the theological terms.
- Set `SITE_URL` in `build.mjs` once the site is deployed to emit `hreflang` links for search engines.
