"use client";

import { useLocale, useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { cn } from "@/shared/lib/utils";

export function LocaleSwitcher() {
  const pathname = usePathname();
  const activeLocale = useLocale();
  const t = useTranslations("nav");

  return (
    <div
      role="group"
      aria-label={t("changeLanguage")}
      className="flex items-center gap-1"
    >
      {routing.locales.map((locale) => (
        <Link
          key={locale}
          href={pathname}
          locale={locale}
          aria-current={locale === activeLocale ? "true" : undefined}
          className={cn(
            "flex min-h-11 min-w-11 items-center justify-center rounded-md px-2 text-xs font-medium uppercase transition-colors",
            locale === activeLocale
              ? "bg-secondary text-secondary-foreground"
              : "text-muted-foreground hover:bg-muted hover:text-foreground",
          )}
        >
          {locale}
        </Link>
      ))}
    </div>
  );
}
