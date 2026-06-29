import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/lib/auth-context';

export const metadata: Metadata = {
  title: 'Drover — Australian beef supply-chain margins',
  description:
    'Drover tracks live buy prices and trade margins across every stage of the Australian beef supply chain — post-breeding, backgrounding, feedlot and processing.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-AU">
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
