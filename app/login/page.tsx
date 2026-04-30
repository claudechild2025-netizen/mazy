'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { getUserId, track } from '@/lib/analytics';

export default function LoginPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [grade, setGrade] = useState(9);
  const [loading, setLoading] = useState(false);

  // If already logged in, redirect to home
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const existingName = window.localStorage.getItem('mzl_user_name');
      if (existingName) {
        router.replace('/');
      }
    }
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);

    const uid = getUserId();
    
    try {
      // Upsert user into Supabase if we have valid creds (skip for stub)
      if (isSupabaseConfigured) {
        const { error } = await supabase.from('users').upsert({
          client_uid: uid,
          display_name: name,
          grade: grade,
        }, { onConflict: 'client_uid' });
        
        if (error) {
          console.error('Supabase Error:', error);
        }
      }
      
      // Save locally
      window.localStorage.setItem('mzl_user_name', name);
      window.localStorage.setItem('mzl_grade', String(grade));
      
      track('login', { name, grade });
      
      router.push('/');
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  return (
    <main className="flex flex-1 flex-col px-6 pt-12 pb-8">
      <div className="flex-1 flex flex-col justify-center">
        <h1 className="font-display text-4xl font-extrabold leading-tight text-ink-900 text-center">
          Тавтай морил
        </h1>
        <p className="mt-2 text-center text-sm text-ink-700">
          Судалгаанд оролцохын тулд мэдээллээ оруулна уу
        </p>

        <form onSubmit={handleLogin} className="mt-8 flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <label htmlFor="name" className="font-display text-sm font-semibold text-ink-900">
              Нэр (эсвэл хоч)
            </label>
            <input
              id="name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Сүхбат"
              className="h-12 rounded-card border border-ink-300 px-4 text-base focus:border-info-fg focus:outline-none focus:ring-1 focus:ring-info-fg"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="grade" className="font-display text-sm font-semibold text-ink-900">
              Анги
            </label>
            <select
              id="grade"
              value={grade}
              onChange={(e) => setGrade(Number(e.target.value))}
              className="h-12 rounded-card border border-ink-300 px-4 text-base focus:border-info-fg focus:outline-none focus:ring-1 focus:ring-info-fg bg-white"
            >
              {[7, 8, 9, 10, 11, 12].map((g) => (
                <option key={g} value={g}>{g}-р анги</option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-6 flex h-12 w-full items-center justify-center rounded-pill bg-ink-900 px-5 font-display text-base font-semibold text-paper disabled:opacity-50"
          >
            {loading ? 'Түр хүлээнэ үү...' : 'Нэвтрэх'}
          </button>
        </form>
      </div>
    </main>
  );
}
