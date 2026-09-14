const TEST_STRING = "Өнөр, үй, таң";

export default function DevFontsPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-10 px-4 py-16">
      <div>
        <h1 className="text-2xl font-semibold">Fonts check</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Dev-only page (404 outside NODE_ENV=development). Verifies that ө,
          ү, ң render with the loaded font, not a system fallback.
        </p>
      </div>

      <section className="space-y-3">
        <h2 className="text-sm font-medium text-muted-foreground">
          Sans — body text
        </h2>
        <p className="font-sans text-3xl">{TEST_STRING}</p>
        <p className="font-sans text-base">{TEST_STRING}</p>
        <p className="font-sans text-base font-bold">{TEST_STRING}</p>
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-medium text-muted-foreground">
          Mono — code
        </h2>
        <p className="font-mono text-3xl">{TEST_STRING}</p>
        <p className="font-mono text-base">{TEST_STRING}</p>
      </section>
    </div>
  );
}
