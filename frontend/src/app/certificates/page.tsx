import Link from "next/link";
import { Award, BadgeCheck, BookOpen, Lock, Target } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getModuleCertificates, type ModuleCertificate } from "@/lib/certificates/queries";
import { oauthFullName } from "@/lib/auth/profile";
import { MODULE_META, THEME_STYLES } from "@/lib/learn/moduleMeta";
import { Card } from "@/components/ui/card";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
}

function EarnedCertificate({ cert, holder }: { cert: ModuleCertificate; holder: string }) {
  const meta = MODULE_META[cert.module_code];
  const theme = THEME_STYLES[meta?.theme ?? "blue"];
  const Icon = meta?.icon ?? Award;
  return (
    <Card className="relative gap-0 overflow-hidden p-0">
      <div className="h-1.5 w-full" style={{ background: theme.bar }} />
      <div className="relative p-5">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full opacity-60"
          style={{ background: theme.iconBg }}
        />
        <div className="relative flex items-start justify-between gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl" style={{ background: theme.iconBg, color: theme.iconFg }}>
            <Icon className="h-5.5 w-5.5" />
          </div>
          <span className="inline-flex items-center gap-1 rounded-full bg-[var(--marketing-green)]/15 px-2.5 py-1 text-[11px] font-semibold text-[var(--marketing-green)]">
            <BadgeCheck className="h-3.5 w-3.5" /> Earned
          </span>
        </div>
        <p className="relative mt-4 text-[11px] font-semibold uppercase tracking-wider text-[var(--foreground-subtle)]">
          Certificate of Completion
        </p>
        <h3 className="relative mt-1 text-lg font-bold leading-snug text-[var(--foreground)]">{cert.title}</h3>
        <p className="relative mt-1 text-sm text-[var(--foreground-muted)]">
          Awarded to <span className="font-semibold capitalize text-[var(--foreground)]">{holder}</span>
        </p>
        <div className="relative mt-4 grid grid-cols-2 gap-3 border-t border-[var(--border)] pt-4 text-xs">
          <div>
            <p className="text-[var(--foreground-subtle)]">Issued</p>
            <p className="mt-0.5 font-semibold text-[var(--foreground)]">{cert.issuedAt ? formatDate(cert.issuedAt) : "—"}</p>
          </div>
          <div>
            <p className="text-[var(--foreground-subtle)]">Credential ID</p>
            <p className="mt-0.5 font-mono font-semibold text-[var(--foreground)]">{cert.credentialId}</p>
          </div>
          <div>
            <p className="text-[var(--foreground-subtle)]">Lessons</p>
            <p className="mt-0.5 font-semibold text-[var(--foreground)]">{cert.totalLessons} completed</p>
          </div>
          <div>
            <p className="text-[var(--foreground-subtle)]">Challenges</p>
            <p className="mt-0.5 font-semibold text-[var(--foreground)]">{cert.totalChallenges} solved</p>
          </div>
        </div>
      </div>
    </Card>
  );
}

function PendingCertificate({ cert }: { cert: ModuleCertificate }) {
  const meta = MODULE_META[cert.module_code];
  const theme = THEME_STYLES[meta?.theme ?? "blue"];
  const Icon = meta?.icon ?? Award;
  const started = cert.percent > 0;
  return (
    <Card className="gap-0 p-5">
      <div className="flex items-start justify-between gap-3">
        <div
          className="flex h-11 w-11 items-center justify-center rounded-xl"
          style={started ? { background: theme.iconBg, color: theme.iconFg } : undefined}
        >
          {started ? <Icon className="h-5.5 w-5.5" /> : <Lock className="h-5 w-5 text-[var(--foreground-subtle)]" />}
        </div>
        <span className="rounded-full bg-[var(--surface-2)] px-2.5 py-1 text-[11px] font-semibold text-[var(--foreground-muted)]">
          {started ? "In progress" : "Not started"}
        </span>
      </div>
      <h3 className="mt-4 text-base font-bold leading-snug text-[var(--foreground)]">{cert.title}</h3>
      <p className="mt-1 text-xs text-[var(--foreground-muted)]">
        Finish every lesson and challenge in this module to earn its certificate.
      </p>
      <div className="mt-4 flex items-center justify-between text-xs">
        <span className="text-[var(--foreground-muted)]">Progress</span>
        <span className="font-semibold text-[var(--foreground)]">{cert.percent}%</span>
      </div>
      <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-[var(--surface-2)]">
        <div className="h-full rounded-full" style={{ width: `${cert.percent}%`, background: theme.bar }} />
      </div>
      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-[var(--foreground-muted)]">
        <span className="inline-flex items-center gap-1">
          <BookOpen className="h-3.5 w-3.5" /> {cert.lessonsRead}/{cert.totalLessons} lessons
        </span>
        <span className="inline-flex items-center gap-1">
          <Target className="h-3.5 w-3.5" /> {cert.challengesPassed}/{cert.totalChallenges} challenges
        </span>
      </div>
      <Link
        href={`/learn/${cert.module_code}`}
        className="mt-4 inline-flex w-fit items-center rounded-lg bg-[var(--marketing-ink)] px-3 py-1.5 text-xs font-semibold text-[var(--background)] transition-opacity hover:opacity-90"
      >
        {started ? "Continue module" : "Start module"}
      </Link>
    </Card>
  );
}

export default async function CertificatesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const certificates = await getModuleCertificates(user.id);
  const earned = certificates.filter((c) => c.earned);
  const pending = certificates.filter((c) => !c.earned);
  const holder = oauthFullName(user) ?? user.email?.split("@")[0] ?? "Qylo learner";

  return (
    <main className="mx-auto max-w-7xl px-6 py-6">
      <h1 className="text-2xl font-bold tracking-tight text-[var(--foreground)]">Certificates</h1>
      <p className="mt-0.5 text-sm text-[var(--foreground-muted)]">
        Earn a certificate for each module by completing all of its lessons and challenges.
      </p>

      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Card className="gap-0 p-4">
          <p className="text-xs font-semibold text-[var(--foreground-muted)]">Certificates Earned</p>
          <p className="mt-0.5 text-xl font-bold text-[var(--foreground)]">
            {earned.length} <span className="text-sm font-medium text-[var(--foreground-subtle)]">of {certificates.length}</span>
          </p>
        </Card>
        <Card className="gap-0 p-4">
          <p className="text-xs font-semibold text-[var(--foreground-muted)]">In Progress</p>
          <p className="mt-0.5 text-xl font-bold text-[var(--foreground)]">{pending.filter((c) => c.percent > 0).length}</p>
        </Card>
        <Card className="gap-0 p-4">
          <p className="text-xs font-semibold text-[var(--foreground-muted)]">Latest</p>
          <p className="mt-0.5 truncate text-xl font-bold text-[var(--foreground)]">
            {earned.length > 0
              ? formatDate(earned.reduce((a, b) => ((a.issuedAt ?? "") > (b.issuedAt ?? "") ? a : b)).issuedAt ?? "")
              : "—"}
          </p>
        </Card>
      </div>

      {earned.length > 0 && (
        <section className="mt-6">
          <h2 className="text-sm font-bold text-[var(--foreground)]">Earned</h2>
          <div className="mt-3 grid grid-cols-1 gap-4 md:grid-cols-2">
            {earned.map((cert) => (
              <EarnedCertificate key={cert.module_code} cert={cert} holder={holder} />
            ))}
          </div>
        </section>
      )}

      {pending.length > 0 && (
        <section className="mt-6">
          <h2 className="text-sm font-bold text-[var(--foreground)]">Up next</h2>
          <div className="mt-3 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {pending.map((cert) => (
              <PendingCertificate key={cert.module_code} cert={cert} />
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
