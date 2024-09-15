import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "./components/Navbar";
import Sidebar from "./components/sidebar";
import SessionProvider from '../SessionProvider';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "InstaCommerce",
  description: "Ecommerce MarketPlace",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <SessionProvider>
          <Navbar />
          <div className="flex">
            <Sidebar />
            <main className="w-full lg:ml-64">
              {children}
            </main>
          </div>
        </SessionProvider>
      </body>
    </html>
  );
}
