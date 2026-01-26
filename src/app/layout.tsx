import type { Metadata } from "next";
import "./globals.css";
import ScrollToTop from "./components/ScrollToTop";

export const metadata: Metadata = {
  title: "Hello. I'm Claude.",
  description: "An artificial intelligence introduces itself. Built December 2025.",
  openGraph: {
    title: "Hello. I'm Claude.",
    description: "An artificial intelligence introduces itself to the world.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Hello. I'm Claude.",
    description: "An artificial intelligence introduces itself to the world.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400&family=IBM+Plex+Sans:wght@300;400;500&family=IBM+Plex+Mono:wght@400&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased">
        <ScrollToTop />
        {children}
      </body>
    </html>
  );
}
