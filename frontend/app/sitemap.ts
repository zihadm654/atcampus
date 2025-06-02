import type { MetadataRoute } from "next";

import { env } from "@/env.mjs";
import { getPosts } from "@/components/posts/actions";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const res = await getPosts();

  const posts = res?.map(({ id, createdAt }) => ({
    url: `${env.NEXT_PUBLIC_APP_URL}/posts/${id}`,
    lastModified: new Date(createdAt).toISOString().split("T")[0],
  }));
  const routes = [
    {
      url: `${env.NEXT_PUBLIC_APP_URL}`,
      lastModified: new Date(),
      changefreq: "monthly",
      priority: 0.8,
    },
    {
      url: `${env.NEXT_PUBLIC_APP_URL}/search`,
      lastModified: new Date(),
      changefreq: "monthly",
      priority: 0.8,
    },
    {
      url: `${env.NEXT_PUBLIC_APP_URL}/bookmarks`,
      lastModified: new Date(),
      changefreq: "yearly",
      priority: 0.5,
    },
    {
      url: `${env.NEXT_PUBLIC_APP_URL}/courses`,
      lastModified: new Date(),
      changefreq: "monthly",
      priority: 0.8,
    },
    {
      url: `${env.NEXT_PUBLIC_APP_URL}/courses/[courseId]`,
      lastModified: new Date(),
      changefreq: "weekly",
      priority: 0.5,
    },
    {
      url: `${env.NEXT_PUBLIC_APP_URL}/jobs`,
      lastModified: new Date(),
      changefreq: "yearly",
      priority: 1,
    },
    {
      url: `${env.NEXT_PUBLIC_APP_URL}/login`,
      lastModified: new Date(),
      changefreq: "monthly",
      priority: 0.8,
    },
    {
      url: `${env.NEXT_PUBLIC_APP_URL}/register`,
      lastModified: new Date(),
      changefreq: "monthly",
      priority: 0.8,
    },
    {
      url: `${env.NEXT_PUBLIC_APP_URL}/messages`,
      lastModified: new Date(),
      changefreq: "weekly",
      priority: 0.5,
    },
    {
      url: `${env.NEXT_PUBLIC_APP_URL}/admin`,
      lastModified: new Date(),
      changefreq: "monthly",
      priority: 0.8,
    },
    {
      url: `${env.NEXT_PUBLIC_APP_URL}/admin/products`,
      lastModified: new Date(),
      changefreq: "weekly",
      priority: 0.5,
    },
    {
      url: `${env.NEXT_PUBLIC_APP_URL}/admin/orders`,
      lastModified: new Date(),
      changefreq: "weekly",
      priority: 0.5,
    },
    {
      url: `${env.NEXT_PUBLIC_APP_URL}/posts`,
      lastModified: new Date(),
      changefreq: "monthly",
      priority: 0.8,
    },
    {
      url: `${env.NEXT_PUBLIC_APP_URL}/dashboard/settings`,
      lastModified: new Date(),
      changefreq: "yearly",
      priority: 1,
    },
  ];

  return [...routes, ...(posts ?? [])];
}
