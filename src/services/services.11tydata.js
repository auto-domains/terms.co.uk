// Defaults for every service page in this folder.
export default {
  layout: "layouts/service.njk",
  ogType: "article",
  eleventyComputed: {
    permalink: (data) => `/services/${data.page.fileSlug}/`,
    // Set `seoTitle` in a service's front matter to override this pattern.
    title: (data) =>
      data.seoTitle ||
      `${data.name}: ${data.category === "generators" ? "Terms and Policy Generator" : "Legal Templates"} Review, Prices and Features`,
  },
};
