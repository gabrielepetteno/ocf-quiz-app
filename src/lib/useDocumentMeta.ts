/**
 * Hook per gestire titolo, meta tag, canonical e JSON-LD per pagina.
 *
 * Perché non `react-helmet`/`react-helmet-async`?
 * Per non aggiungere dipendenze: l'app è una SPA con poche pagine, gestire
 * <head> via DOM API è ~50 righe e zero peso al bundle. L'hook è idempotente
 * (riusa i tag esistenti quando possibile) per non sporcare il DOM.
 *
 * Pattern: ogni pagina chiama `useDocumentMeta({...})` in cima al body.
 * In `cleanup` non rimuoviamo i tag — la prossima `useDocumentMeta` li
 * sovrascrive direttamente. Questo evita "flash" di meta vuoti durante le
 * transizioni.
 */
import { useEffect } from "react";

import {
  SITE_DEFAULT_OG_IMAGE,
  SITE_NAME,
  SITE_URL,
  canonicalFor,
} from "./seo";

export interface DocumentMeta {
  /** Path relativo al base (senza leading slash). "" = home. */
  slug: string;
  title: string;
  description: string;
  keywords?: string;
  ogImage?: string;
  /** Se false, emette `noindex` per il robot. */
  indexable?: boolean;
  /** JSON-LD aggiuntivo da iniettare. */
  jsonLd?: Record<string, unknown>[];
}

const MANAGED_ATTR = "data-managed-seo";

function ensureMeta(
  selector: string,
  create: () => HTMLMetaElement,
): HTMLMetaElement {
  const existing = document.head.querySelector<HTMLMetaElement>(selector);
  if (existing) return existing;
  const el = create();
  el.setAttribute(MANAGED_ATTR, "true");
  document.head.appendChild(el);
  return el;
}

function setMetaByName(name: string, content: string) {
  const el = ensureMeta(`meta[name="${name}"]`, () => {
    const m = document.createElement("meta");
    m.setAttribute("name", name);
    return m;
  });
  el.setAttribute("content", content);
}

function setMetaByProperty(property: string, content: string) {
  const el = ensureMeta(`meta[property="${property}"]`, () => {
    const m = document.createElement("meta");
    m.setAttribute("property", property);
    return m;
  });
  el.setAttribute("content", content);
}

function setCanonical(href: string) {
  let link = document.head.querySelector<HTMLLinkElement>(
    'link[rel="canonical"]',
  );
  if (!link) {
    link = document.createElement("link");
    link.setAttribute("rel", "canonical");
    link.setAttribute(MANAGED_ATTR, "true");
    document.head.appendChild(link);
  }
  link.setAttribute("href", href);
}

function setOgUrl(href: string) {
  setMetaByProperty("og:url", href);
  setMetaByProperty("twitter:url", href);
}

function injectJsonLd(blocks: Record<string, unknown>[]) {
  // Rimuovi solo i blocchi precedentemente iniettati dall'hook
  document
    .querySelectorAll<HTMLScriptElement>(
      `script[type="application/ld+json"][${MANAGED_ATTR}="page"]`,
    )
    .forEach((s) => s.remove());

  blocks.forEach((data) => {
    const s = document.createElement("script");
    s.type = "application/ld+json";
    s.setAttribute(MANAGED_ATTR, "page");
    s.textContent = JSON.stringify(data);
    document.head.appendChild(s);
  });
}

export function useDocumentMeta(meta: DocumentMeta) {
  const {
    slug,
    title,
    description,
    keywords,
    ogImage = SITE_DEFAULT_OG_IMAGE,
    indexable = true,
    jsonLd = [],
  } = meta;

  useEffect(() => {
    const canonical = canonicalFor(slug);

    document.title = title;
    setMetaByName("description", description);
    if (keywords) setMetaByName("keywords", keywords);
    setMetaByName(
      "robots",
      indexable
        ? "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1"
        : "noindex, nofollow",
    );

    setMetaByProperty("og:title", title);
    setMetaByProperty("og:description", description);
    setMetaByProperty("og:type", "website");
    setMetaByProperty("og:site_name", SITE_NAME);
    setMetaByProperty("og:locale", "it_IT");
    setMetaByProperty("og:image", ogImage);

    setMetaByName("twitter:card", "summary_large_image");
    setMetaByName("twitter:title", title);
    setMetaByName("twitter:description", description);
    setMetaByName("twitter:image", ogImage);

    setCanonical(canonical);
    setOgUrl(canonical);

    injectJsonLd(jsonLd);
  }, [
    slug,
    title,
    description,
    keywords,
    ogImage,
    indexable,
    // jsonLd è normalmente un array literal in chiamata: per evitare loop
    // useEffect-render, lo serializziamo come chiave di confronto.
    JSON.stringify(jsonLd),
  ]);
}

export const _seoEntry = { SITE_URL };
