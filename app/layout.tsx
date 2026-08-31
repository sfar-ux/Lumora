import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Lumoro — SaaS Development Studio",
  description: "We design, build and scale SaaS products for businesses. From architecture to launch.",
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}