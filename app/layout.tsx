import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/lib/auth';
import Header from '@/components/Layout/Header';
import Footer from '@/components/Layout/Footer';
import { ChatProvider } from '@/components/ChatContext';
import ChatPopup from '@/components/ChatPopup';

const inter = Inter({ subsets: ['latin', 'cyrillic'] });

export const metadata: Metadata = {
  title: 'Аренда авто с выкупом',
  description: 'Найдите автомобиль в аренду с правом выкупа',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru">
      <body className={`${inter.className} bg-white text-gray-900`}>
        <AuthProvider>
          <ChatProvider>
            <div className="flex flex-col min-h-screen">
              <Header />
              <main className="flex-grow container mx-auto px-4 py-8">
                {children}
              </main>
              <Footer />
            </div>
            <ChatPopup />
          </ChatProvider>
        </AuthProvider>
      </body>
    </html>
  );
}