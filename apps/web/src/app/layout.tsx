import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Save Our Votes',
  description: 'Secure online voting platform',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
