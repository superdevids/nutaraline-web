import { Suspense } from "react";
import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import { HeaderSkeleton, FooterSkeleton } from "@/components/layout/chrome-skeletons";
import { SiteHeaderBar } from "@/components/layout/site-shell";
import { DemoBar } from "@/components/layout/demo-bar";
import { BottomNav } from "@/components/layout/bottom-nav";
import { Footer } from "@/components/layout/footer";
import { ContactButton } from "@/components/layout/contact-button";
import { mainNav } from "@/lib/navigation";
import { defaultLocale } from "@/lib/i18n";
import { getDictionaryFor } from "@/lib/i18n/dictionary";
import { getDictionary } from "@/lib/i18n/server";
import { isDemoBuild } from "@/lib/env";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  display: "swap",
});

const fallbackDict = getDictionaryFor(defaultLocale);

export const metadata: Metadata = {
  title: {
    default: fallbackDict.meta.title,
    template: fallbackDict.meta.titleTemplate,
  },
  description: fallbackDict.meta.description,
  keywords: fallbackDict.meta.keywords,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang={defaultLocale} className={`${jakarta.variable} h-full`}>
      <body className="flex min-h-full flex-col bg-bg font-sans text-text">
        <div aria-hidden className="page-backdrop" />

        <Suspense fallback={<HeaderSkeleton />}>
          <HeaderRoute />
        </Suspense>

        <div aria-hidden className="h-16" />

        {isDemoBuild ? (
          <Suspense fallback={null}>
            <DemoBarRoute />
          </Suspense>
        ) : null}

        <main className="flex-1 pb-[calc(3.5rem+env(safe-area-inset-bottom))] md:pb-0">
          {children}
        </main>

        <Suspense fallback={<FooterSkeleton />}>
          <FooterRoute />
        </Suspense>

        <BottomNav
          items={mainNav(fallbackDict)}
          label={fallbackDict.nav.mainNavigation}
        />

        <ContactButton dict={fallbackDict} />
      </body>
    </html>
  );
}
async function HeaderRoute() {
  const { dict, locale } = await getDictionary();
  return <SiteHeaderBar dict={dict} locale={locale} />;
}

async function DemoBarRoute() {
  const { dict } = await getDictionary();
  return <DemoBar dict={dict} />;
}

async function FooterRoute() {
  const { dict } = await getDictionary();
  return <Footer dict={dict} />;
}
