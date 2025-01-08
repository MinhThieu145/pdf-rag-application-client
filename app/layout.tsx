import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Navigation from "@/components/Navigation";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Learning Management App",
  description: "A modern learning management system",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className={`${inter.className} min-h-screen bg-gray-50 dark:bg-gray-900`}>
        <Navigation />
        <main className="mt-16 p-4">
          {children}
        </main>
      </body>
    </html>
  );
}
