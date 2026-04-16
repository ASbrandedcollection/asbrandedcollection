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
