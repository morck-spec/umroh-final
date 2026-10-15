import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Al-Madinah Tour & Travel | Penyelenggara Resmi Izin Kemenag RI",
  description: "Pelayanan perjalanan ibadah Umroh dan Haji Khusus bertaraf bintang 5 dengan bimbingan muthawif berkompeten dan kepastian jadwal keberangkatan.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className={`${inter.className} min-h-screen antialiased bg-[#F7FAF9] text-[#172B35]`}>
        {children}
      </body>
    </html>
  );
}
