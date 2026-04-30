'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronRight, BookOpen, Target, Bell, Sparkles, Languages, MessageCircle, HelpCircle, Flame, Star, LogOut } from 'lucide-react';
import { BottomTab } from '@/components/BottomTab';
import { track, useTimeOnScreen } from '@/lib/analytics';

/*
  16 · Profile (/profile) — Tab 4

  Avatar with initial. Stat chips (streak + XP). 7 settings rows:
    Сэдэв · Өдрийн зорилго · Сануулга · Анимацийн чанар · Хэл · Багшид илгээх · Тусламж
  v1.0 footer.

  // TODO(dw): Each row is a TODO link for the 3-day test (per §6 "Fake/skip"
  // — read-only profile, editable settings deferred to v2).
*/

const ROWS = [
  { icon: BookOpen, label: 'Сэдэв', value: 'Гэрэл' },
  { icon: Target, label: 'Өдрийн зорилго', value: '5 минут' },
  { icon: Bell, label: 'Сануулга', value: 'Унтраалттай' },
  { icon: Sparkles, label: 'Анимацийн чанар', value: 'Стандарт' },
  { icon: Languages, label: 'Хэл', value: 'Монгол' },
  { icon: MessageCircle, label: 'Багшид илгээх', value: '' },
  { icon: HelpCircle, label: 'Тусламж', value: '' },
];

export default function ProfilePage() {
  const router = useRouter();
  const [userName, setUserName] = useState('');
  const [userInitial, setUserInitial] = useState('');
  const [userGrade, setUserGrade] = useState('9');
  
  useTimeOnScreen('profile');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedName = window.localStorage.getItem('mzl_user_name');
      const storedGrade = window.localStorage.getItem('mzl_grade') || '9';
      
      if (storedName) {
        setUserName(storedName);
        setUserInitial(storedName.charAt(0).toUpperCase());
        setUserGrade(storedGrade);
      } else {
        router.replace('/login');
      }
    }
  }, [router]);

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem('mzl_uid');
      window.localStorage.removeItem('mzl_level_set');
      window.localStorage.removeItem('mzl_user_name');
      window.localStorage.removeItem('mzl_grade');
      window.localStorage.removeItem('mzl_level');
      window.localStorage.removeItem('mzl_goal_min');
      router.push('/login');
    }
  };

  return (
    <>
      <div className="flex flex-1 flex-col gap-5 px-5 pt-8 pb-6">
        <header>
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-500">
            16 · ПРОФАЙЛ
          </p>
        </header>

        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-100 font-display text-2xl font-extrabold text-ink-900">
            {userInitial || 'Т'}
          </div>
          <div>
            <p className="font-display text-lg font-bold text-ink-900">
              {userName || 'Тэмүүлэн'}
            </p>
            <p className="text-xs text-ink-500">{userGrade}-р анги · Гэрэл сэдэв</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Stat icon={<Flame size={18} className="text-heat-fg" />} v="1" l="хоног" />
          <Stat icon={<Star size={18} className="text-brand-500" />} v="30" l="XP" />
        </div>

        <ul className="space-y-2">
          {ROWS.map(({ icon: Icon, label, value }) => (
            <li key={label}>
              <button
                type="button"
                onClick={() =>
                  track('cta_tap', { surface: 'profile', label: 'row', row: label })
                }
                className="flex w-full items-center gap-3 rounded-card border border-ink-300/60 bg-paper px-4 py-3 text-left"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-100">
                  <Icon size={18} strokeWidth={2} className="text-ink-900" />
                </span>
                <div className="flex-1">
                  <p className="font-display text-sm font-semibold text-ink-900">
                    {label}
                  </p>
                  {value && <p className="text-xs text-ink-500">{value}</p>}
                </div>
                <ChevronRight size={18} className="text-ink-500" />
              </button>
            </li>
          ))}
          <li>
            <button
              type="button"
              onClick={handleLogout}
              className="flex w-full items-center gap-3 rounded-card border border-ink-300/60 bg-red-50 px-4 py-3 text-left"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-red-100">
                <LogOut size={18} strokeWidth={2} className="text-red-600" />
              </span>
              <div className="flex-1">
                <p className="font-display text-sm font-semibold text-red-600">
                  Гарах (Logout)
                </p>
              </div>
            </button>
          </li>
        </ul>

        <p className="mt-auto pt-4 text-center font-mono text-[10px] uppercase tracking-wider text-ink-500">
          Mazy v1.0 · Физик · Гэрэл
        </p>
      </div>

      <BottomTab />
    </>
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
