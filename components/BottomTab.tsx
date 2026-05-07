'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, BookOpen, BarChart3, User, type LucideIcon } from 'lucide-react';
import { track } from '@/lib/analytics';

/*
  Bottom tab nav per hi-fi screens 04, 05, 09, 15, 16.
  Active tab uses a light-blue circular pill behind the icon (info-bg + info-fg).
  Hidden on modal-style screens (Motion Player, Quiz feedback, Streak modal).
*/

type Tab = {
  href: string;
  label: string;
  Icon: LucideIcon;
};

const TABS: Tab[] = [
  { href: '/',         label: 'Нүүр',    Icon: Home },
  { href: '/lessons',  label: 'Хичээл',  Icon: BookOpen },
  { href: '/progress', label: 'Ахиц',    Icon: BarChart3 },
  { href: '/profile',  label: 'Профайл', Icon: User },
];

export function BottomTab() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Үндсэн навигаци"
      className="sticky bottom-0 z-10 mt-auto flex h-[72px] items-stretch border-t border-ink-300/60 bg-paper"
    >
      {TABS.map(({ href, label, Icon }) => {
        const isActive = pathname === href;

        return (
          <Link
            key={href}
            href={href}
            onClick={() => track('tab_tap', { tab: label, from: pathname })}
            className="flex flex-1 flex-col items-center justify-center gap-1 pt-2 pb-3 transition-transform active:scale-95"
          >
            <span
              className={`flex h-9 w-9 items-center justify-center rounded-full transition-colors ${
                isActive ? 'bg-info-bg' : ''
              }`}
            >
              <Icon
                size={22}
                strokeWidth={isActive ? 2.2 : 2.0}
                // Tailwind can't read CSS vars on SVG `color`, so we set inline
                style={{
                  color: isActive
                    ? 'rgb(var(--color-info-fg))'
                    : 'rgb(var(--color-ink-700))',
                }}
              />
            </span>
            <span
              className={`font-mono text-[11px] tracking-wide ${
                isActive ? 'text-info-fg font-semibold' : 'text-ink-700'
              }`}
            >
              {label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
