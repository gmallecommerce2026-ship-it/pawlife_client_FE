import type { MetadataRoute } from "next";
import { ROUTES, SITE_URL } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const paths = ["/", ROUTES.contact, ROUTES.support, ROUTES.deleteAccount, ROUTES.privacy, ROUTES.terms];
  return paths.map((p) => ({ url: `${SITE_URL}${p}`, lastModified: new Date() }));
}