import MainWrapper from '@/components/MainWrapper';
import NavbarWrapper from '@/components/NavbarWrapper';
import { CartProvider } from '@/lib/cart-context';
import type { Metadata } from 'next';
import WhatsAppButton from '@/components/WhatsAppButton';
import './globals.css';

export const metadata: Metadata = {
  title: 'A&S Branded Collection',
  description: 'Premium fashion, makeup & lifestyle — delivered across Pakistan',
  icons: { icon: '/favicon.ico' },
  keywords: [
    'Skincare Products in Pakistan',
    'Korean Skincare Products in Pakistan',
    'Buy Skincare Online in Pakistan',
    'Medicube Products in Pakistan',
    'Beauty of Joseon Products in Pakistan',
    'CeraVe Products in Pakistan',
    'Original Cosmetics Online in Pakistan',
    'Best Serums for Face in Pakistan',
    'Beauty Products Online in Pakistan',
    'free delivery',
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body>
        <CartProvider>
          <NavbarWrapper />
          <MainWrapper>{children}</MainWrapper>
          <WhatsAppButton />
        </CartProvider>
      </body>
    </html>
  );
}
