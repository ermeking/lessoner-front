import { GraduationCap } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Button } from "@/shared/ui/button";
import { LocaleSwitcher } from "@/shared/ui/locale-switcher";
import { ThemeToggle } from "@/shared/ui/theme-toggle";

export async function Header() {
  const t = await getTranslations("nav");

  return (
    <header className="border-b border-border">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between gap-4 px-4">
        <Link
          href="/"
          aria-label={t("home")}
          className="flex min-h-11 min-w-11 items-center justify-center rounded-md text-foreground"
        >
          <GraduationCap className="size-6" />
        </Link>
        <div className="flex-1" />
        <div className="flex items-center gap-1">
          <LocaleSwitcher />
          <ThemeToggle />
          <Button asChild size="sm" className="ml-1 min-h-11">
            <Link href="/login">{t("login")}</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
