import { SettingsView } from "@/components/features/settings/SettingsView";

export default function SettingsPage() {
  return (
    <>
      <div className="mt-8">
        <p className="mb-2 text-sm font-medium text-ink-2">
          Alembic · Preferences
        </p>
        <h1 className="text-4xl font-semibold tracking-tight text-ink lg:text-5xl">
          Settings
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-ink-2">
          Appearance, accessibility, and your local data — all stored in this
          browser.
        </p>
      </div>

      <SettingsView />

      <footer className="mt-12 border-t border-line pt-6 text-center text-xs text-ink-3">
        Alembic · Preferences
      </footer>
    </>
  );
}
