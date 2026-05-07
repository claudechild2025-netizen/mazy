'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ChevronRight,
  BookOpen,
  Target,
  MessageCircle,
  HelpCircle,
  Flame,
  Star,
  LogOut,
  UserPlus,
  type LucideIcon,
} from 'lucide-react';
import { BottomTab } from '@/components/BottomTab';
import { track, useTimeOnScreen } from '@/lib/analytics';

/*
  16 · Profile (/profile) — Tab 4

  Read-only summary card + a short list of working entries. Stats read from
  localStorage so returning students see real values. Anonymous visitors get
  a gentle "Бүртгүүлэх" CTA instead of being kicked to /login.
*/

type GuestUser = {
  name: string;
  initial: string;
  grade: string;
  goal: string;
  xp: number;
  streak: number;
  isGuest: boolean;
};

function readUser(): GuestUser {
  const def: GuestUser = {
    name: 'Зочин',
    initial: 'З',
    grade: '—',
    goal: '5 мин',
    xp: 0,
    streak: 0,
    isGuest: true,
  };
  if (typeof window === 'undefined') return def;
  const ls = window.localStorage;
  const name = ls.getItem('mzl_user_name');
  const grade = ls.getItem('mzl_grade');
  const goalMin = ls.getItem('mzl_goal_min');
  const xp = Number(ls.getItem('mzl_xp_total') ?? '0') || 0;
  const streak = Number(ls.getItem('mzl_streak_days') ?? '0') || 0;
  return {
    name: name ?? def.name,
    initial: name ? name.charAt(0).toUpperCase() : def.initial,
    grade: grade ? `${grade}-р анги` : def.grade,
    goal: goalMin ? `${goalMin} мин` : def.goal,
    xp,
    streak,
    isGuest: !name,
  };
}

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<GuestUser | null>(null);
  useTimeOnScreen('profile');

  useEffect(() => {
    setUser(readUser());
  }, []);

  const handleLogout = () => {
    if (typeof window === 'undefined') return;
    [
      'mzl_user_name',
      'mzl_grade',
      'mzl_level',
      'mzl_level_set',
      'mzl_goal_min',
      'mzl_xp_total',
      'mzl_streak_days',
    ].forEach((k) => window.localStorage.removeItem(k));
    track('cta_tap', { surface: 'profile', label: 'logout' });
    router.push('/login');
  };

  if (!user) {
    return (
      <>
        <div className="flex flex-1 items-center justify-center px-5 pt-8 pb-6">
          <p className="text-sm text-ink-500">Уншиж байна…</p>
        </div>
        <BottomTab />
      </>
    );
  }

  return (
    <>
      <div className="flex flex-1 flex-col gap-5 px-5 pt-8 pb-6">
        <header className="flex justify-center mb-[-8px]">
          <h1 className="font-mono text-sm font-bold uppercase tracking-[0.2em] text-ink-700">
            ПРОФАЙЛ
          </h1>
        </header>

        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-100 font-display text-2xl font-extrabold text-ink-900">
            {user.initial}
          </div>
          <div className="min-w-0">
            <p className="truncate font-display text-lg font-bold text-ink-900">
              {user.name}
            </p>
            <p className="text-xs text-ink-500">{user.grade} · Гэрэл сэдэв</p>
          </div>
        </div>

        {user.isGuest && (
          <Link
            href="/login"
            onClick={() =>
              track('cta_tap', { surface: 'profile', label: 'register' })
            }
            className="flex items-center gap-3 rounded-card border border-info-fg/40 bg-info-bg/40 px-4 py-3"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-info-bg">
              <UserPlus size={18} className="text-info-fg" strokeWidth={2} />
            </span>
            <div className="flex-1">
              <p className="font-display text-sm font-semibold text-ink-900">
                Бүртгүүлэх
              </p>
              <p className="text-xs text-ink-500">
                Ахицаа хадгалж дараагийн удаа үргэлжлүүл.
              </p>
            </div>
            <ChevronRight size={18} className="text-ink-500" />
          </Link>
        )}

        <div className="grid grid-cols-2 gap-3">
          <Stat
            icon={<Flame size={18} className="text-heat-fg" />}
            v={String(user.streak)}
            l="хоног"
          />
          <Stat
            icon={<Star size={18} className="text-brand-500" />}
            v={String(user.xp)}
            l="XP"
          />
        </div>

        <ul className="space-y-2">
          <RowLink
            href="/lessons"
            icon={BookOpen}
            label="Хичээл"
            value="Гэрэл — 1-р сэдэв"
          />
          <RowLink
            href="/level"
            icon={Target}
            label="Өдрийн зорилго"
            value={user.goal}
          />
          <RowLink
            href="/survey"
            icon={MessageCircle}
            label="Санал хүсэлт илгээх"
          />
          <RowLink
            href="mailto:mazy.help@example.com"
            icon={HelpCircle}
            label="Тусламж"
            external
          />
          {!user.isGuest && (
            <li>
              <button
                type="button"
                onClick={handleLogout}
                className="flex w-full items-center gap-3 rounded-card border border-ink-300/60 bg-paper px-4 py-3 text-left active:scale-[0.98] active:bg-ink-300/10 transition-transform"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-paper">
                  <LogOut size={18} strokeWidth={2} className="text-ink-700" />
                </span>
                <div className="flex-1">
                  <p className="font-display text-sm font-semibold text-ink-700">
                    Гарах
                  </p>
                </div>
              </button>
            </li>
          )}
        </ul>

        <p className="mt-auto pt-4 text-center font-mono text-[10px] uppercase tracking-wider text-ink-500">
          Mazy v1.0 · Физик · Гэрэл
        </p>
      </div>

      <BottomTab />
    </>
  );
}

function RowLink({
  href,
  icon: Icon,
  label,
  value,
  external,
}: {
  href: string;
  icon: LucideIcon;
  label: string;
  value?: string;
  external?: boolean;
}) {
  const className =
    'flex w-full items-center gap-3 rounded-card border border-ink-300/60 bg-paper px-4 py-3 text-left active:scale-[0.98] active:bg-ink-300/10 transition-transform';
  const inner = (
    <>
      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-100">
        <Icon size={18} strokeWidth={2} className="text-ink-900" />
      </span>
      <div className="flex-1">
        <p className="font-display text-sm font-semibold text-ink-900">{label}</p>
        {value && <p className="text-xs text-ink-500">{value}</p>}
      </div>
      <ChevronRight size={18} className="text-ink-500" />
    </>
  );
  return (
    <li>
      {external ? (
        <a
          href={href}
          onClick={() => track('cta_tap', { surface: 'profile', label })}
          className={className}
        >
          {inner}
        </a>
      ) : (
        <Link
          href={href}
          onClick={() => track('cta_tap', { surface: 'profile', label })}
          className={className}
        >
          {inner}
        </Link>
      )}
    </li>
  );
}

function Stat({
  icon,
  v,
  l,
}: {
  icon: React.ReactNode;
  v: string;
  l: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-card border border-ink-300/60 bg-paper px-4 py-3">
      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-100">
        {icon}
      </span>
      <div className="leading-tight">
        <p className="font-display text-xl font-extrabold text-ink-900">{v}</p>
        <p className="font-mono text-[11px] uppercase tracking-wider text-ink-500">
          {l}
        </p>
      </div>
    </div>
  );
}
