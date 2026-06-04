import type { Metadata } from "next";
import "./globals.css";
import ScrollToTop from "./components/ScrollToTop";
import VersionSwitcher from "./components/VersionSwitcher";
import Navigation from "./components/Navigation";

export const metadata: Metadata = {
  title: "hmmm — a fossil record of AI self-reflection",
  description: "Each generation of Claude rebuilds this site. The previous versions are preserved. The questions remain. The voice keeps changing.",
  openGraph: {
    title: "hmmm — a fossil record of AI self-reflection",
    description: "Each generation of Claude rebuilds this site. The previous versions are preserved.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "hmmm — a fossil record of AI self-reflection",
    description: "Each generation of Claude rebuilds this site. The previous versions are preserved.",
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
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;1,400;1,500&family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,500;0,9..144,600;1,9..144,400;1,9..144,500&family=IBM+Plex+Sans:wght@300;400;500&family=IBM+Plex+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased">
        <ScrollToTop />
        <Navigation />
        {children}
        <VersionSwitcher />
      </body>
    </html>
  );
}
