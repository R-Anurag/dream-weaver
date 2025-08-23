
import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "next-themes";
import { Alegreya, Architects_Daughter, Caveat } from 'next/font/google';

const alegreya = Alegreya({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-alegreya',
});

const architectsDaughter = Architects_Daughter({
    subsets: ['latin'],
    weight: '400',
    variable: '--font-architects-daughter',
});

const caveat = Caveat({
    subsets: ['latin'],
    variable: '--font-caveat',
});

export const metadata: Metadata = {
  title: 'Dream Weaver',
  description: 'A creative digital canvas and vision board to help you visualize your goals, find inspiration, and collaborate with others to bring your dreams to life.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={`${alegreya.variable} ${architectsDaughter.variable} ${caveat.variable}`}>
      <body className="font-body antialiased">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
