import type { Metadata } from "next";
import { IBM_Plex_Mono, Source_Sans_3 } from "next/font/google";
import { AuthProvider } from "@/modules/auth/AuthProvider";
import "./globals.css";

const sourceSans = Source_Sans_3({
  variable: "--font-source-sans",
  subsets: ["latin"],
});

const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "Deskflow",
  description: "Company support agents that route questions and answer from your docs.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${sourceSans.variable} ${plexMono.variable} antialiased`}
    >
      <body className="bg-bg text-ink">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
