import type { Metadata } from "next";
import { AppShell } from "@/components/layout/app-shell";
import { AppProviders } from "@/components/app-providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "Base Agency Accounting CRM",
  description: "Accounting and CRM system for Base Agency"
};

const themeScript = `
(function () {
  try {
    var theme = localStorage.getItem("base-agency-theme");
    if (theme === "dark") document.documentElement.classList.add("dark");
    var language = localStorage.getItem("base-agency-language");
    if (language === "ku-sorani" || language === "ku-behdini" || language === "ar") {
      document.documentElement.dir = "rtl";
      document.documentElement.lang = language;
    } else if (language === "en") {
      document.documentElement.dir = "ltr";
      document.documentElement.lang = "en";
    }
  } catch (e) {}
})();
`;

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" dir="ltr" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="bg-surface-page text-ink-body antialiased" suppressHydrationWarning>
        <AppProviders>
          <AppShell>{children}</AppShell>
        </AppProviders>
      </body>
    </html>
  );
}
