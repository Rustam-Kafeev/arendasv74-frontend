// app/sitemap.xml/route.ts
import { NextResponse } from 'next/server';

export async function GET() {
  // Получаем список всех автомобилей из нашего API
  const res = await fetch('http://127.0.0.1:8000/api/cars?per_page=all');
  const cars = await res.json();
  const baseUrl = 'https://arendasv74.ru';

  let xml = '<?xml version="1.0" encoding="UTF-8"?>';
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">';
  
  // Статические страницы
  xml += `<url><loc>${baseUrl}</loc><changefreq>daily</changefreq><priority>1.0</priority></url>`;
  xml += `<url><loc>${baseUrl}/how-it-works</loc><changefreq>weekly</changefreq><priority>0.9</priority></url>`;

  // Динамические страницы автомобилей
  cars?.data?.forEach((car: any) => {
    xml += `<url><loc>${baseUrl}/cars/${car.id}</loc><changefreq>weekly</changefreq><priority>0.8</priority></url>`;
  });

  xml += '</urlset>';

  return new NextResponse(xml, {
    status: 200,
    headers: { 'Content-Type': 'application/xml' },
  });
}