import { getRequestConfig } from "next-intl/server";
import { hasLocale } from "next-intl";
import { routing, defaultLocale } from "./routing";

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested)
    ? requested
    : routing.defaultLocale;

  const messages = (await import(`../../messages/${locale}.json`)).default;
  const fallbackMessages =
    locale === defaultLocale
      ? messages
      : (await import(`../../messages/${defaultLocale}.json`)).default;

  return {
    locale,
    messages,
    getMessageFallback({ key, namespace }) {
      const path = namespace ? `${namespace}.${key}` : key;
      const fallback = getFromMessages(fallbackMessages, path);
      if (process.env.NODE_ENV === "development") {
        console.warn(
          `[i18n] Missing key "${path}" for locale "${locale}", falling back to "${defaultLocale}"`,
        );
      }
      return fallback ?? path;
    },
  };
});

function getFromMessages(
  messages: Record<string, unknown>,
  path: string,
): string | undefined {
  const value = path
    .split(".")
    .reduce<unknown>(
      (acc, part) =>
        acc && typeof acc === "object"
          ? (acc as Record<string, unknown>)[part]
          : undefined,
      messages,
    );
  return typeof value === "string" ? value : undefined;
}
