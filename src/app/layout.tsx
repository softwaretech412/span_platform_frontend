import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Span28 Configurator",
  description: "Australian outdoor structure configurator with council compliance",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
