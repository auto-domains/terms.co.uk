# terms.co.uk

An independent directory of websites that create terms and conditions, terms of service, privacy policies, cookie policies and similar documents. Each service has its own page with a summary, prices, whether there is a free option, the documents it produces, the laws it says it covers, hosting and automatic updates, FAQs and sources. The home page lists every service, grouped into policy generators and legal template sites, and each group has a comparison page.

The domain is for sale: the home page and footer link to `/domain-for-sale/`, which embeds the Zoho enquiry form.

The site is built with [Eleventy](https://www.11ty.dev/) (static HTML, no client framework) and is designed to be hosted on Cloudflare Pages.

## Quick start

```bash
npm install
```

```bash
npm start
```

This serves the site at http://localhost:8080 and rebuilds when files change. To produce a production build in `_site/`:

```bash
npm run build
```

## Project structure

```
eleventy.config.js          Filters, collections, markdown and structured data helpers
src/
  _data/site.js             Site name, URL, contact email, domain sale form, analytics and advertising settings
  _data/categories.js       Policy generators and legal templates: names, intros, meta descriptions
  _includes/layouts/        base.njk (shell), service.njk (service page), page.njk (simple pages)
  _includes/partials/       Service card, icons, Zoho sale form, ad unit and tracking tags
  services/*.md             One markdown file per service (the content)
  assets/css/style.css      Theme styles
  index.njk                 Home page listing
  category.njk              One page per category, e.g. /policy-generators/, with a comparison table
  domain-for-sale.njk       Domain sale page with the embedded enquiry form
  about.md, contact.md, privacy.md, 404.njk
  sitemap.njk, robots.njk, ads.11ty.js
  _headers                  Cloudflare Pages response headers
```

## Adding or editing a service

Create `src/services/<slug>.md`. The file name becomes the URL, e.g. `src/services/termly.md` is published at `/services/termly/`. The service appears automatically on the home page, its category page and comparison table, the footer, the sitemap and the "similar services" lists.

```yaml
---
name: Termly
category: generators        # generators | templates
description: "Meta description, 140 to 160 characters."
summary: "One or two sentences used on listing cards."
website: "https://termly.io/"
tags: ["Privacy policy", "Cookie consent", "Auto updates"]
account: optional           # none | optional | required
price: "Free plan; paid plans from ..."
freeOption: true            # true | false; leave out if unknown
documents: ["Privacy policy", "Terms and conditions", "Cookie policy"]
laws: "UK GDPR, EU GDPR, CCPA"
autoUpdates: true           # true | false; leave out if unknown
hosted: true                # true | false; leave out if unknown
formats: "Hosted link, HTML, Word"
lawyerReview: "Optional solicitor review for a fee"
openSource: "https://github.com/..."
founded: 2018
operator: "Company name"
faqs:
  - q: "Question?"
    a: "Answer."
verified: 2026-10-08       # date the facts were last checked, shown on the page
sources:
  - "https://..."
seoTitle: "Optional override for the <title> tag"
---

## About Termly
...
```

Any optional field can be left out and the page adapts; the comparison table shows "Not stated" for unknown yes/no fields. The markdown body should start at `##` headings, because the layout supplies the `<h1>`, the facts card, the "not legal advice" notice, the FAQs and the sources list from the front matter. The body is split before its second `##` heading to place the in-article ad unit.

Content style: British English, factual and neutral, and no em dashes or en dashes. Only publish prices and features that the service itself states, and never present a listing as legal advice.

## Domain sale form

The footer panel, the home page callout and `/domain-for-sale/` are controlled by `site.sale` in `src/_data/site.js`. Set `enabled: false` to remove them all once the domain is sold. The Zoho form ID is `site.sale.zohoForm`; the embed script lives in `src/_includes/partials/sale-form.njk`.

## Analytics and advertising

All settings live in `src/_data/site.js`, and each can be overridden with a Cloudflare Pages environment variable:

| Setting | Environment variable | Purpose |
| --- | --- | --- |
| `analytics.ga4` | `GA4_ID` | Google Analytics 4 measurement ID (`G-...`) |
| `googleAds.conversionId` | `GOOGLE_ADS_ID` | Google Ads tag (`AW-...`) for conversion tracking and remarketing |
| `adsense.client` | `ADSENSE_CLIENT` | AdSense publisher ID (`ca-pub-...`). Loads AdSense (enough for Auto ads) and generates `/ads.txt` |
| `adsense.slots.listing` | `ADSENSE_SLOT_LISTING` | Manual ad unit on the home and category pages |
| `adsense.slots.article` | `ADSENSE_SLOT_ARTICLE` | Manual ad unit inside service articles |
| `adsense.slots.sidebar` | `ADSENSE_SLOT_SIDEBAR` | Manual ad unit below the service facts card |

Ad containers are only rendered when both the publisher ID and the relevant slot ID are set.

**Consent.** Google Consent Mode v2 is on by default (`consentMode: true`), so Google tags start with storage denied. To show personalised ads to UK and EEA visitors, Google requires a certified consent management platform. The simplest option is to turn on the GDPR message in AdSense under *Privacy and messaging*. When AdSense is enabled, a "Cookie settings" link appears in the footer so visitors can change their choice.

## Deploying to Cloudflare Pages

1. In the Cloudflare dashboard, go to *Workers and Pages*, create a Pages project and connect this GitHub repository.
2. Build settings:
   - Framework preset: *None*
   - Build command: `npm run build`
   - Build output directory: `_site`
3. Environment variables (optional): `NODE_VERSION` = `22` (also set in `.nvmrc`), plus any of the analytics variables above.
4. Add the custom domain `terms.co.uk` under *Custom domains*. If the domain currently points at GitHub Pages, remove that DNS record or GitHub Pages setting first.

Cloudflare Pages serves `404.html` for missing pages and applies the headers in `src/_headers`.
