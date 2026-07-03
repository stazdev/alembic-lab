import { ProfileView } from "@/components/features/profile/ProfileView";

export default function ProfilePage() {
  return (
    <>
      <div className="mt-8">
        <p className="mb-2 text-sm font-medium text-ink-2">Alembic · Account</p>
        <h1 className="text-4xl font-semibold tracking-tight text-ink lg:text-5xl">
          Profile
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-ink-2">
          Your local learner profile and activity across the lab.
        </p>
      </div>

      <ProfileView />

      <footer className="mt-12 border-t border-line pt-6 text-center text-xs text-ink-3">
        Alembic · Account
      </footer>
    </>
  );
}
