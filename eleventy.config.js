import categories from "./src/_data/categories.js";

const categoriesByKey = new Map(categories.map((category) => [category.key, category]));

const ACCOUNT_LABELS = {
  none: "Not needed",
  optional: "Optional",
  required: "Required",
};

function slugify(text) {
  return String(text)
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/&[a-z]+;/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function toDate(value) {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function isoDate(value) {
  const date = toDate(value);
  return date ? date.toISOString().slice(0, 10) : "";
}

function displayUrl(url) {
  return String(url || "").replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "");
}

// Removes empty values so structured data only contains real information.
function stripEmpty(value) {
  if (Array.isArray(value)) {
    const items = value.map(stripEmpty).filter((item) => item !== undefined);
    return items.length ? items : undefined;
  }
  if (value instanceof Date) return isoDate(value);
  if (value && typeof value === "object") {
    const out = {};
    for (const [key, item] of Object.entries(value)) {
      const cleaned = stripEmpty(item);
      if (cleaned !== undefined) out[key] = cleaned;
    }
    const keys = Object.keys(out);
    return keys.length && !(keys.length === 1 && keys[0] === "@type") ? out : undefined;
  }
  return value === null || value === undefined || value === "" || value === false ? undefined : value;
}

function breadcrumbs(id, items) {
  return {
    "@type": "BreadcrumbList",
    "@id": id,
    itemListElement: items.map(([name, item], index) => ({ "@type": "ListItem", position: index + 1, name, item })),
  };
}

function faqPage(id, faqs) {
  if (!faqs || !faqs.length) return null;
  return {
    "@type": "FAQPage",
    "@id": id,
    mainEntity: faqs.map((faq) => ({ "@type": "Question", name: faq.q, acceptedAnswer: { "@type": "Answer", text: faq.a } })),
  };
}

function itemList(site, services) {
  return {
    "@type": "ItemList",
    numberOfItems: services.length,
    itemListElement: services.map((service, index) => ({
      "@type": "ListItem",
      position: index + 1,
      url: site.url + service.url,
      name: service.data.name,
    })),
  };
}

export default function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy({
    "src/assets": "assets",
    "src/_headers": "_headers",
    "src/favicon.svg": "favicon.svg",
  });

  // Give h2 and h3 headings in markdown an id so pages can link to sections.
  eleventyConfig.amendLibrary("md", (md) => {
    md.set({ typographer: false });
    md.renderer.rules.heading_open = (tokens, idx, options, env, self) => {
      const token = tokens[idx];
      if ((token.tag === "h2" || token.tag === "h3") && !token.attrGet("id")) {
        const text = tokens[idx + 1].children
          .filter((child) => child.type === "text" || child.type === "code_inline")
          .map((child) => child.content)
          .join("");
        token.attrSet("id", slugify(text));
      }
      return self.renderToken(tokens, idx, options);
    };
  });

  eleventyConfig.addCollection("services", (api) =>
    api.getFilteredByGlob("./src/services/*.md").sort((a, b) => a.data.name.localeCompare(b.data.name, "en-GB")),
  );

  eleventyConfig.addFilter("displayUrl", displayUrl);
  eleventyConfig.addFilter("isoDate", isoDate);
  eleventyConfig.addFilter("readableDate", (value) => {
    const date = toDate(value);
    return date ? date.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }) : "";
  });
  eleventyConfig.addFilter("accountLabel", (value) => ACCOUNT_LABELS[value] || "");
  // Yes or no for optional booleans; an empty string when the fact is unknown.
  eleventyConfig.addFilter("yesNo", (value) => (value === true ? "Yes" : value === false ? "No" : ""));

  eleventyConfig.addFilter("categoryByKey", (key) => categoriesByKey.get(key));
  eleventyConfig.addFilter("byCategory", (services, key) => services.filter((s) => s.data.category === key));
  eleventyConfig.addFilter("related", (services, service, limit = 4) =>
    services.filter((s) => s.url !== service.url && s.data.category === service.category).slice(0, limit),
  );
  eleventyConfig.addFilter("searchText", (service) => {
    const d = service.data;
    const category = categoriesByKey.get(d.category);
    return [d.name, displayUrl(d.website), category && category.name, d.laws, ...(d.tags || []), ...(d.documents || [])]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
  });

  // Content helpers for the service layout.
  eleventyConfig.addFilter("toc", (html) =>
    [...String(html).matchAll(/<h2 id="([^"]+)">(.*?)<\/h2>/g)].map((m) => ({ id: m[1], text: m[2] })),
  );
  eleventyConfig.addFilter("splitContent", (html, nth = 2) => {
    const source = String(html);
    let index = -1;
    let from = 0;
    for (let i = 0; i < nth; i++) {
      index = source.indexOf("<h2", from);
      if (index === -1) return [source, ""];
      from = index + 3;
    }
    return [source.slice(0, index), source.slice(index)];
  });

  // Structured data (JSON-LD).
  eleventyConfig.addFilter("jsonLd", (data) => JSON.stringify(stripEmpty(data)).replace(/</g, "\\u003c"));

  eleventyConfig.addFilter("serviceSchema", (d) => {
    const category = categoriesByKey.get(d.category);
    const pageUrl = d.site.url + d.page.url;
    return {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "WebApplication",
          "@id": `${pageUrl}#service`,
          name: d.name,
          description: d.summary,
          url: d.website,
          applicationCategory: "BusinessApplication",
          operatingSystem: "Any (web browser)",
          sameAs: [d.openSource].filter(Boolean),
          foundingDate: d.founded && String(d.founded),
        },
        {
          "@type": "WebPage",
          "@id": pageUrl,
          url: pageUrl,
          name: d.title,
          description: d.description,
          inLanguage: d.site.lang,
          dateModified: d.verified,
          isPartOf: { "@id": `${d.site.url}/#website` },
          about: { "@id": `${pageUrl}#service` },
          breadcrumb: { "@id": `${pageUrl}#breadcrumb` },
        },
        breadcrumbs(`${pageUrl}#breadcrumb`, [
          ["Home", `${d.site.url}/`],
          [category.name, `${d.site.url}/${category.slug}/`],
          [d.name, pageUrl],
        ]),
        faqPage(`${pageUrl}#faq`, d.faqs),
      ],
    };
  });

  eleventyConfig.addFilter("homeSchema", (services, d) => ({
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${d.site.url}/#website`,
        url: `${d.site.url}/`,
        name: d.site.name,
        alternateName: d.site.domain,
        description: d.site.description,
        inLanguage: d.site.lang,
      },
      { "@type": "CollectionPage", "@id": `${d.site.url}/`, name: d.title, description: d.description, mainEntity: itemList(d.site, services) },
      faqPage(`${d.site.url}/#faq`, d.faqs),
    ],
  }));

  eleventyConfig.addFilter("categorySchema", (services, category, d) => {
    const pageUrl = `${d.site.url}/${category.slug}/`;
    return {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "CollectionPage",
          "@id": pageUrl,
          url: pageUrl,
          name: category.heading,
          description: category.metaDescription,
          isPartOf: { "@id": `${d.site.url}/#website` },
          mainEntity: itemList(d.site, services),
        },
        breadcrumbs(`${pageUrl}#breadcrumb`, [
          ["Home", `${d.site.url}/`],
          [category.name, pageUrl],
        ]),
      ],
    };
  });
}

export const config = {
  dir: {
    input: "src",
    includes: "_includes",
    data: "_data",
    output: "_site",
  },
  markdownTemplateEngine: false,
  htmlTemplateEngine: "njk",
  templateFormats: ["md", "njk", "11ty.js"],
};
