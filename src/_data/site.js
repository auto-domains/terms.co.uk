// Site-wide settings. Any value read from process.env can be set as an
// environment variable in Cloudflare Pages (Settings > Environment variables)
// instead of editing this file. Set a value to an empty string to turn it off.
const env = process.env;

export default {
  name: "Terms",
  domain: "terms.co.uk",
  url: (env.SITE_URL || "https://terms.co.uk").replace(/\/$/, ""),
  title: "Terms and Conditions Generator Directory",
  description:
    "Independent directory of terms and conditions, terms of service and privacy policy generators and legal template sites, with prices and UK law coverage.",
  lang: "en-GB",
  email: "domains@replies.co.uk",
  year: new Date().getFullYear(),
  version: Date.now().toString(36),

  // The "domain for sale" callout and enquiry page. The Zoho form ID comes from
  // the form's embed code (the part after /formperma/).
  sale: {
    enabled: true,
    path: "/domain-for-sale/",
    zohoForm: "O_c_XkB2NncsZvhCkUn2BiWvMSAdqSrgAGjn3m8UJcM",
    zohoUrl: "https://forms.zohopublic.eu/configservices/form/Domainnames/formperma/",
  },

  // Google Analytics 4 measurement ID (G-XXXXXXXXXX).
  analytics: {
    ga4: env.GA4_ID ?? "G-W3ZRZHX133",
  },

  // Google Ads tag ID (AW-XXXXXXXXXX), used for conversion tracking and
  // remarketing if you run Google Ads campaigns that point at this site.
  googleAds: {
    conversionId: env.GOOGLE_ADS_ID ?? "",
  },

  // Google AdSense. Set the publisher ID (ca-pub-XXXXXXXXXXXXXXXX) to load
  // AdSense (Auto ads work with this alone) and generate /ads.txt. Add ad unit
  // slot IDs to place manual ad units in the positions below.
  adsense: {
    client: env.ADSENSE_CLIENT ?? "",
    slots: {
      listing: env.ADSENSE_SLOT_LISTING ?? "", // home and category pages, between listings
      article: env.ADSENSE_SLOT_ARTICLE ?? "", // service pages, within the article
      sidebar: env.ADSENSE_SLOT_SIDEBAR ?? "", // service pages, below the facts card
    },
  },

  // Google Consent Mode v2. Defaults all Google storage to "denied" until a
  // consent management platform (for example Google's own Privacy and
  // messaging CMP in AdSense) records the visitor's choice. Required for
  // serving personalised ads to UK and EEA visitors.
  consentMode: true,
};
