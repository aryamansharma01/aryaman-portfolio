import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Newsreader } from "next/font/google";
import { TopNav } from "@/components/nav/TopNav";
import { Footer } from "@/components/footer/Footer";
import { siteConfig } from "@/lib/constants";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const newsreader = Newsreader({
  variable: "--font-newsreader",
  subsets: ["latin"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: {
    default: siteConfig.title,
    template: `%s — ${siteConfig.name}`,
  },
  description: siteConfig.description,
  metadataBase: new URL(siteConfig.url),
  openGraph: {
    title: siteConfig.title,
    description: siteConfig.description,
    url: siteConfig.url,
    siteName: siteConfig.name,
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#faf8f4" },
    { media: "(prefers-color-scheme: dark)", color: "#111214" },
  ],
};

// Runs before first paint so the saved (or system) theme is applied without a flash,
// and handles clicks on [data-theme-toggle] so the toggle doesn't depend on hydration.
const themeScript = `(function(){var d=document.documentElement;try{var t=localStorage.getItem("theme");if(t!=="light"&&t!=="dark")t=matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light";d.setAttribute("data-theme",t)}catch(e){}document.addEventListener("click",function(e){if(!e.target.closest||!e.target.closest("[data-theme-toggle]"))return;var n=d.getAttribute("data-theme")==="dark"?"light":"dark";d.setAttribute("data-theme",n);try{localStorage.setItem("theme",n)}catch(e){}})})()`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      data-theme="light"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} ${newsreader.variable} h-full antialiased`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="mx-auto flex min-h-full max-w-2xl flex-col px-6 font-sans">
        <TopNav />
        <main className="flex-1 py-10 sm:py-14">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
