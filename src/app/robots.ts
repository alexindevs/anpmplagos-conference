import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // Sponsors section is for signed-in users only — keep it out of search engines.
        disallow: ["/sponsors", "/sponsors/"],
        // NOTE: /company/<slug> profiles are also signed-in only but were already indexed. They are
        // marked noindex (meta + X-Robots-Tag) and must stay crawlable until Google drops them;
        // add "/company/" here afterwards, otherwise the noindex can never be re-read.
      },
    ],
  };
}
