import type { Metadata } from "next";
import { Inter, Cormorant_Garamond, JetBrains_Mono, Oswald } from "next/font/google";
import "./globals.css";


import Navbar from "../component/Navbar/Navbar";
import Footer from "../component/Footer";
import ZipperScrollbar from "../component/ZipperScrollbar";
import MobileBottomNav from "../component/Navbar/MobileBottomNav";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

const cormorant = Cormorant_Garamond({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  style: ["normal", "italic"],
});

const jetbrains = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

const oswald = Oswald({
  variable: "--font-oswald",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ONLY DENIMS | Premium Denim India",
  description: "ONLY DENIMS: Premium Indian Denim, crafted through generations. Sourced from the legendary mills of India, spun on vintage shuttle looms. Shop raw onlydenims and only-denims online.",
  openGraph: {
    title: "ONLY DENIMS | Premium Denim India",
    description: "ONLY DENIMS: Premium Indian Denim, crafted through generations. Sourced from the legendary mills of India, spun on vintage shuttle looms. Shop raw onlydenims and only-denims online.",
    url: "https://onlydenims.com",
    siteName: "ONLY DENIMS",
    locale: "en_IN",
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

import { ThemeProvider } from "./theme-provider";
import { ToastProvider } from "../context/ToastContext";
import { CartProvider } from "../context/CartContext";
import CartDrawer from "../component/CartDrawer";
import PasswordGate from "../component/PasswordGate";
import ChatBotWidget from "../component/ChatBotWidget";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${cormorant.variable} ${jetbrains.variable} ${oswald.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  document.documentElement.classList.add('light');
                  document.documentElement.classList.remove('dark');
                  localStorage.setItem('theme', 'light');
                } catch (e) {}
              })();
            `
          }}
        />
      </head>
      <body className="min-h-screen flex flex-col bg-background text-foreground transition-colors duration-400">
        <ThemeProvider>
          <PasswordGate />
          <ToastProvider>
            <CartProvider>
              <ZipperScrollbar />
              <Navbar />

              <div className="flex-1 flex flex-col">
                {children}
              </div>

              <Footer />
              <CartDrawer />
              <MobileBottomNav />
              <ChatBotWidget />
            </CartProvider>
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}