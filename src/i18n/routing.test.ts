import { describe, expect, it } from "vitest";
import { routing, defaultLocale, locales } from "./routing";

describe("i18n routing", () => {
  it("supports ru, ky and en", () => {
    expect(locales).toEqual(["ru", "ky", "en"]);
  });

  it("defaults to ru", () => {
    expect(defaultLocale).toBe("ru");
    expect(routing.defaultLocale).toBe("ru");
  });

  it("always shows the locale prefix", () => {
    const prefix = routing.localePrefix;
    const mode = typeof prefix === "string" ? prefix : prefix?.mode;
    expect(mode).toBe("always");
  });
});
