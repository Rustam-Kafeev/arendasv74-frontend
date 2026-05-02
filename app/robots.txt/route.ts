import { NextResponse } from 'next/server';

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://arendasv74.vercel.app';
  const text = `User-agent: *
Allow: /
Disallow: /dashboard
Disallow: /profile
Disallow: /admin
Host: ${baseUrl}
Sitemap: ${baseUrl}/sitemap.xml`;

  return new NextResponse(text, {
    headers: { 'Content-Type': 'text/plain' },
  });
}