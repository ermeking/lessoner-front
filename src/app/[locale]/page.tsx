import { getTranslations, setRequestLocale } from "next-intl/server";
import type { AppLocale } from "@/i18n/routing";

type Props = {
  params: Promise<{ locale: AppLocale }>;
};

export default async function HomePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("seo");

  return (
    <div className="mx-auto max-w-5xl px-4 py-16">
      <h1 className="text-3xl font-semibold text-balance">
        {t("defaultTitle")}
      </h1>
      <p className="mt-2 text-lg text-muted-foreground text-balance">
        {t("defaultDescription")}
      </p>
    </div>
  );
}
