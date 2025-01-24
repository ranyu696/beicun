import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { AuthProvider } from '@/lib/auth'
import { ThemeProvider } from 'next-themes'
import { Suspense } from "react";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "杯村测评",
  description: "杯村测评 杯村测评 杯村测评",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`} >
        <ThemeProvider attribute="class" defaultTheme="light">
        <AuthProvider>
          <div className="min-h-screen flex flex-col">
          <Suspense>
            <Navbar />
            </Suspense>

            
            <main className="flex-1 bg-gradient-to-b from-gray-50 to-white">
              {children}
            </main>
            <footer className="bg-gray-800 text-white py-8">
              <div className="container mx-auto px-4 text-center">
                <p>&copy; 2024 杯村. 保留所有权利。</p>
              </div>
            </footer>
          </div>
        </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
