import { NextResponse } from 'next/server';

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://arendasv74.ru';
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api';

  try {
    const res = await fetch(`${apiUrl}/cars?per_page=all`, { cache: 'no-store' });
    const cars = await res.json();
    const carData = cars.data || cars;

    let xml = '<?xml version="1.0" encoding="UTF-8"?>';
    xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">';
    
    // Статические страницы
    xml += `<url><loc>${baseUrl}</loc><changefreq>daily</changefreq><priority>1.0</priority></url>`;
    xml += `<url><loc>${baseUrl}/how-it-works</loc><changefreq>weekly</changefreq><priority>0.9</priority></url>`;

    // Динамические страницы автомобилей
    carData.forEach((car: any) => {
      xml += `<url><loc>${baseUrl}/cars/${car.id}</loc><changefreq>weekly</changefreq><priority>0.8</priority></url>`;
    });

    xml += '</urlset>';

    return new NextResponse(xml, {
      status: 200,
      headers: { 'Content-Type': 'application/xml' },
    });
  } catch (error) {
    // Fallback – только статические страницы
    let xml = '<?xml version="1.0" encoding="UTF-8"?>';
    xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">';
    xml += `<url><loc>${baseUrl}</loc><changefreq>daily</changefreq><priority>1.0</priority></url>`;
    xml += `<url><loc>${baseUrl}/how-it-works</loc><changefreq>weekly</changefreq><priority>0.9</priority></url>`;
    xml += '</urlset>';

    return new NextResponse(xml, {
      status: 200,
      headers: { 'Content-Type': 'application/xml' },
    });
  }
}