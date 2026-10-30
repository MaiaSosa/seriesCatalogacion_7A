import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Series Catalogación 7A",
  description: "Sistema para gestionar plataformas, series y valoraciones."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
