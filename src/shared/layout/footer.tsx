import { getTranslations } from "next-intl/server";

export async function Footer() {
  const t = await getTranslations("common");
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border">
      <div className="mx-auto flex max-w-5xl flex-col gap-1 px-4 py-6 text-sm text-muted-foreground">
        <p>{t("tagline")}</p>
        <p>{t("footerCopyright", { year })}</p>
      </div>
    </footer>
  );
}
