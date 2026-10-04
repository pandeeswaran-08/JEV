import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'JEV Architecture Lab — Interactive Decision Architecture',
  description:
    'Interactive 3D laboratory for understanding the JEV decision architecture. Explore layers, data flow, and decision processes through visual explanation and hand gesture interaction.',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#050816',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-background text-foreground antialiased overflow-hidden select-none font-serif">
        {children}
      </body>
    </html>
  );
}
