import type { Metadata, Viewport } from "next";
import { Archivo, Cormorant_Garamond, Pinyon_Script } from "next/font/google";
import "./globals.css";

// Substitutas gratuitas das fontes da marca (IvyOra Display, Termina, Nautica)
const display = Cormorant_Garamond({
  variable: "--nf-display",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  style: ["normal", "italic"],
});

const sans = Archivo({
  variable: "--nf-sans",
  subsets: ["latin"],
  axes: ["wdth"],
});

const script = Pinyon_Script({
  variable: "--nf-script",
  subsets: ["latin"],
  weight: "400",
});

export const metadata: Metadata = {
  title: "DDD Private · Aplicação",
  description:
    "Aplicação para a DDD Private, mentoria individual de e-commerce com Matheus Porto. Vagas limitadas.",
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: "#0F0E0E",
  colorScheme: "dark",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="pt-BR"
      className={`${display.variable} ${sans.variable} ${script.variable} h-full antialiased`}
    >
      <body className="min-h-dvh">{children}</body>
    </html>
  );
}
