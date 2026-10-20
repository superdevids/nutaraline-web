import { SiteHeader } from "./site-header";
import { mainNav } from "@/lib/navigation";
import type { Dictionary, Locale } from "@/lib/i18n";

export async function SiteHeaderBar({
  dict,
  locale,
}: {
  dict: Dictionary;
  locale: Locale;
}) {
  return (
    <SiteHeader
      items={mainNav(dict)}
      locale={locale}
      labels={{
        mainNavigation: dict.nav.mainNavigation,
        switchLanguage: dict.nav.switchLanguage,
        brand: dict.common.appName,
        notifications: dict.nav.notification,
      }}
    />
  );
}
