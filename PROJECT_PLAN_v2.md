# MAZY — Microlearning Platform (v2, hi-fi-aligned)

> **Subject:** Физик · Гэрэл (Light Physics)
> **Audience:** Grade 9–10, Mongolia (~14–16 yrs)
> **Stack:** Next.js 14 (App Router) · TypeScript · Tailwind · Supabase · Vercel
> **Reference:** Hi-fi prototype (Mazy Prototype.html, 16 screens + 9 interactive labs)
> **Aesthetic:** Duolingo-adjacent — warm yellow brand, black CTAs, friendly mascot, gamified retention loop

---

## 0. Why this v2 supersedes v1

The earlier plan assumed a 3-screen minimal IA with sand/electric-blue tokens and a serif display font. The hi-fi disagrees in five productive ways and the AI editor must follow the hi-fi:

1. **Brand identity is fully formed** — Mazy + lightbulb mascot + warm yellow.
2. **Scope is full product** — 16 screens + 9 labs, not a slice.
3. **Auth & gamification exist** — sign-up, streaks, XP, badges.
4. **Typography is Nunito + DM Mono** (matches DW's brand kit).
5. **Color is polychromatic by design** — yellow brand, black CTAs, blue/green/red as state signals.

The schema (`supabase/schema.sql`) and analytics layer (`lib/analytics.ts`) from v1 carry over with small additions. Everything else in this folder is the new source of truth.

---

## 1. AI editor — execution order (read first)

```bash
# 1. Scaffold
npx create-next-app@latest mazy --typescript --tailwind --app --src-dir=false --import-alias="@/*" --eslint --no-turbopack
cd mazy

# 2. Dependencies
npm install @supabase/supabase-js @supabase/ssr framer-motion lucide-react clsx tailwind-merge
npm install -D @types/node

# 3. Replace/create files (this folder)
#    app/layout.tsx, app/page.tsx, app/globals.css, tailwind.config.ts
#    components/BottomTab.tsx, components/Mascot.tsx
#    lib/analytics.ts, supabase/schema.sql

# 4. Reference the hi-fi
#    Save Mazy Prototype.html to reference/mazy_prototype.html
#    Use it as the visual source of truth for every screen below

# 5. Env
#    .env.local with NEXT_PUBLIC_SUPABASE_URL + NEXT_PUBLIC_SUPABASE_ANON_KEY

# 6. Build verification (must pass before moving on)
npm run build      # zero errors
npm run dev        # http://localhost:3000 renders Home (04) at viewport 390×844
```

**Verification checklist:**
- [ ] Home (`/`) renders the yellow "today's lesson" card + streak/XP stats + bottom tabs
- [ ] Bottom tab active state uses light-blue circle + blue icon (per hi-fi 04, 09, 15, 16)
- [ ] All screens are mobile-first; no horizontal scroll at 320px
- [ ] Nunito + DM Mono load from Google Fonts with full Cyrillic
- [ ] `track()` from `lib/analytics.ts` logs in dev console
- [ ] Supabase schema runs cleanly; v_sus_scores view exists

---

## 2. Information Architecture (hi-fi-aligned)

```
A · ENTRY
   00 Splash          /                       (1.6s auto-advance)
   01 Onboarding      /welcome                (3 panels, blue CTA)
   02 Sign-in/Sign-up /auth                   (Шинэ / Нэвтрэх tabs)
   03 Level Pick      /level                  (3 levels + daily goal)

B · HOME & LESSON
   04 Home            /home                   (Tab 1 of 4)
   05 Lessons List    /lessons                (Tab 2)
   06 Lesson Intro    /lesson/[id]
   07 Motion Player   /lesson/[id]/play       (modal, dark theme)
   08 Lesson Step     /lesson/[id]/step/[n]
   09 Recap           /lesson/[id]/recap

C · QUIZ
   10 Quiz            /lesson/[id]/quiz
   11 Correct         /lesson/[id]/quiz/correct
   12 Wrong           /lesson/[id]/quiz/wrong
   13 Lesson Complete /lesson/[id]/complete

D · PROGRESS & PROFILE
   14 Streak Modal    (modal, triggered)
   15 Progress        /progress               (Tab 3)
   16 Profile         /profile                (Tab 4)

★ INTERACTIVE LABS  /lab/[slug]
   L1 Reflection      i = r
   L2 Refraction      Snell's law (water/glass/diamond)
   L3 TIR             Critical angle ≈ 41.8°
   L4 Lenses          Convex/concave + image
   L5 Prism           White → 7 colors
   L6 RGB Mix         Additive color
   L7 Shadow          Umbra + penumbra
   L8 Speed of Light  Earth → Moon, 1.28s
   L9 Moon Phases     Drag to orbit
```

**Bottom tabs** (persistent on 04, 05, 15, 16, and labs):
`Нүүр · Хичээл · Ахиц · Профайл` — active tab uses light-blue circular pill behind icon.

**Modal screens** (no bottom tabs): 07 Motion Player, 14 Streak Modal, 12 Wrong, 11 Correct.

---

## 3. Visual System (hi-fi-derived tokens)

| Token | Hex | Where it appears in the hi-fi |
|---|---|---|
| `--paper` | `#FFFFFF` | Default page bg |
| `--cream-50` | `#FFFCF5` | Soft page tint on Onboarding |
| `--brand-50` | `#FEF9E7` | Yellow card top of gradient |
| `--brand-100` | `#FCEDA0` | Yellow card body, lesson thumbnails |
| `--brand-300` | `#F4D63B` | Mascot body, primary brand yellow |
| `--brand-500` | `#E8B400` | Badge/star/streak gold |
| `--ink-900` | `#1A1A1A` | Primary CTA pill bg, headings |
| `--ink-700` | `#4A4A4A` | Body text |
| `--ink-500` | `#8A8A8A` | Secondary text, mono labels |
| `--info-bg` | `#DBEAFE` | Selected quiz option, active tab pill |
| `--info-fg` | `#2563EB` | Onboarding CTA, audio play, info text |
| `--success-bg` | `#DCFCE7` | Correct answer screen bg |
| `--success-fg` | `#16A34A` | Correct text, progress fill, check icons |
| `--error-bg` | `#FCE7E5` | Wrong answer screen bg |
| `--error-fg` | `#DC2626` | Wrong text, X icon |
| `--heat-bg` | `#FFEAD5` | Streak flame chip |
| `--heat-fg` | `#F97316` | Streak flame icon |

**Rule of three for buttons:**
1. **Black pill** = primary commitment ("Хичээлийг эхлэх", "Эхлэх", "Үргэлжлүүлэх →")
2. **Blue pill** = soft progression on guided flows ("Үргэлжлүүлэх" on Onboarding & Sign-up)
3. **Color pill matching state** = post-feedback ("Дараагийн асуулт" on Correct = green)

**Rule of three for surfaces:**
1. **White** = default canvas
2. **Yellow card** (`brand-100` bg) = lesson illustration container, "today's task" hero
3. **Dark surface** (`ink-900`) = motion player only (07)

**Typography:**
- **Display** — `Nunito`, weights 700/800, full Cyrillic
- **Body** — `Nunito`, weights 400/500/600
- **Mono** — `DM Mono` for screen labels (`ӨНӨӨДРИЙН ХИЧЭЭЛ`, `АСУУЛТ 2/3`, `00 · SPLASH`)

---

## 4. Theoretical foundation (revised for thesis defense)

The hi-fi accepts a deliberate trade-off the v1 plan didn't: **gamification mechanics** (streaks, XP, badges) add Extraneous Cognitive Load per Sweller (1988). Defend it explicitly:

> "We accept a measured increase in extraneous load through gamification scaffolding (streaks, XP, badges) in exchange for documented adherence and retention benefits in microlearning contexts (cf. Duolingo studies, e.g., Vesselinov & Grego 2012; Munday 2016). The trade-off is bounded: gamification chrome is constrained to the home/progress surfaces and is removed from the active learning surfaces (Motion Player 07, Lesson Step 08, Quiz 10), which preserve single-task focus."

| Decision in hi-fi | Theory cited | Reference |
|---|---|---|
| Single-concept Lesson Step (08), one principle + adjacent illustration | Cognitive Load Theory | Sweller (1988) |
| Angle labels (i, r, θ₁, θ₂) **on** the canvas, next to the arc they describe | Spatial Contiguity Principle | Mayer (2009) |
| Color carries categorical meaning (yellow=topic, green=correct, red=wrong, blue=info) | Signaling Principle | Mayer & Fiorella (2014) |
| Streak/XP/badges on home & progress surfaces only | Self-Determination + adherence research | Vesselinov & Grego (2012); Ryan & Deci (2000) |
| 4-tab bottom nav (Нүүр/Хичээл/Ахиц/Профайл) | Hick's Law (n=4 is well within working memory) | Hick (1952); Miller (1956) |
| 5-min daily goal default | Microlearning + Pomodoro-adjacent | Hug (2005); Cirillo (2006) |
| SUS post-session as evaluation instrument | System Usability Scale | Brooke (1996); threshold ≥68 per Bangor et al. (2009) |

---

## 5. Screen-by-screen build notes (selected)

The AI editor should treat the hi-fi as the visual source of truth. These notes flag specifics that won't be obvious from the screenshot alone.

**00 Splash** — Yellow vertical gradient `--brand-50 → --brand-100`. Mascot scales 0.9 → 1.0 over 600ms. Loading bar at bottom is `--brand-500` over a `--brand-50/40` track. Auto-redirect to `/welcome` after 1600ms.

**01 Onboarding** — 3 panels with horizontal swipe + dot indicators. CTA is **blue** here (deliberate — softer commitment than the black pill at later decision points).

**02 Sign-up** — **Add a "Зочин эхлэх" link below the form.** This is a thesis-required affordance: the 3-day usability test cannot gate participants on email signup. Guest path skips 02 → goes to 03.

**03 Level Pick** — Three knowledge cards + three time-goal pills. Selected state: blue border + blue check chip. Black CTA "Эхлэх".

**04 Home** — The hero card is yellow gradient with the day's lesson + black pill CTA. Two stat chips (streak + XP) below. "Үргэлжлүүлэх" resume card is white with thumbnail + progress bar. Bottom tabs persistent.

**05 Lessons List** — Filter pills (Бүгд / Дуусаагүй / Дууссан / Хаалттай). 3 unlocked + 2 locked cards in the visible state. Locked cards reduced opacity, lock icon visible.

**06 Lesson Intro** — Yellow illustration card top. Three meta chips: time, steps, XP reward. Numbered "ЧИ ЮУ СУРАХ ВЭ" list.

**07 Motion Player** — **Only screen with dark theme.** Background `--ink-900`. Yellow play/pause button. Caption track in yellow-bordered chip below illustration. Implementation: use Framer Motion to animate the light ray for the 3-day prototype; **defer Rive integration to v2** (Rive needs a separate runtime + asset pipeline, not testing-window-friendly).

**08 Lesson Step** — Progress dots top. Yellow illustration card. Audio "Сонсох" pill is light-blue (info-bg/fg). Black CTA bottom.

**09 Recap** — Numbered list with green circular numbers. Yellow callout for "Бодит жишээ".

**10 Quiz** — Green progress bar + timer chip top right. **Selected option uses blue ring (info-fg) + blue radio dot.** Black CTA at bottom (commitment).

**11 Correct** — Full screen `--success-bg`. Green circle check with confetti dots. Green pill CTA "Дараагийн асуулт →".

**12 Wrong** — Full screen `--error-bg`. Soft tone — "Зүгээр, дахин үзье. Алдах нь сурахын нэг хэсэг." (preserve verbatim — psychology matters). Black CTA "Үргэлжлүүлэх →" (not red — recovery, not punishment).

**13 Lesson Complete** — Yellow background. Trophy emoji or SVG. Three stat tiles. Badge unlock card. Black CTA + plain text link "Нүүр буцах".

**14 Streak Modal** — Bottom sheet over `--ink-900/40` backdrop. Orange flame circle. 7 day-of-week chips, completed = orange filled, today = white outlined.

**15 Progress** — Filter pills (7 хоног / Сар / Бүгд). Bar chart for weekly lessons (light green bars, today highlighted blue). Subject mastery card (yellow bg, % big number). Badge grid with locked/unlocked states.

**16 Profile** — Avatar with initial. Stat chips. List of 7 settings rows (Сэдэв, Өдрийн зорилго, Сануулга, Анимацийн чанар, Хэл, Багшид илгээх, Тусламж). v1.0 footer.

**Labs L1–L9** — Shared layout: top breadcrumb back, horizontal-scroll lab tab pills, title + description, **interactive canvas (yellow bg)**, parameter readout, formula chip, hint. Use `<input type="range">` for the drag controls — sufficient for thesis testing; build proper drag handles in v2.

---

## 6. What to build vs. what to fake (for the 3-day test)

You have **3 days for usability testing.** Build the happy path, fake everything else.

| Build | Fake/skip |
|---|---|
| Splash → Welcome → Level Pick (skip Sign-up via Guest) | Real Sign-up persistence |
| Home with hardcoded streak=1, XP=0 | Working notification bell |
| Lessons List with 3 unlocked = `Гэрэл` lesson 01–03 | Locked lesson states (just visual) |
| Lesson Intro → Motion Player (Framer Motion, not Rive) → Lesson Step ×3 → Recap | Audio narration ("Сонсох" can be a deferred TODO) |
| Quiz (3 questions) → Correct/Wrong → Lesson Complete | More than 1 module |
| Labs L1, L2, L4 only (Reflection, Refraction, Lenses) | L3, L5–L9 (link to "coming soon" empty state) |
| Progress (read from `screen_views` + `quiz_attempts`) | Long-term streak history (just current week) |
| Profile (read-only) | Editable settings (each row is a TODO link) |

This shrinks 16+9 = 25 screens to **~14 screens for the test build**. Realistic for the window.

---

## 7. Database additions (v2)

The base schema in `supabase/schema.sql` is unchanged. Add these for streaks/XP/badges:

```sql
-- Append to schema.sql
alter table users
  add column display_name   text,
  add column avatar_initial text,
  add column daily_goal_min int default 5,
  add column streak_days    int default 0,
  add column streak_last    date,
  add column xp_total       int default 0;

create table badges (
  id          uuid primary key default gen_random_uuid(),
  slug        text unique not null,
  title_mn    text not null,
  description_mn text,
  icon_emoji  text
);

create table user_badges (
  user_id     uuid references users(id) on delete cascade,
  badge_id    uuid references badges(id) on delete cascade,
  earned_at   timestamptz not null default now(),
  primary key (user_id, badge_id)
);

insert into badges (slug, title_mn, description_mn, icon_emoji) values
  ('mirror-master', 'Толины мастер', 'Гэрлийн ойлтыг эзэмшсэн', '🪞'),
  ('prism-master', 'Призмийн мастер', 'Призмийн дисперсийг ойлгосон', '🌈'),
  ('light-master', 'Гэрлийн мастер', 'Гэрэл сэдэв 100% дууссан', '💡'),
  ('lens-master', 'Линзний мастер', 'Линз ба дүрсийг эзэмшсэн', '🔬');
```

---

## 8. Out of scope (be honest with the AI editor)

- ✘ Real Rive animation runtime (use Framer Motion for ray demos)
- ✘ Real auth (use Guest mode + anonymous Supabase row)
- ✘ Real audio narration (mark "Сонсох" as TODO)
- ✘ Push notifications (Профайл сануулга is a UI-only setting)
- ✘ Багшид илгээх integration (link is a TODO)
- ✘ The 6 deferred labs (L3, L5–L9)
- ✘ Sound effects on Correct/Wrong (visual-only feedback)

---

## 9. SUS evaluation prep (carries from v1)

Unchanged. Use `lib/analytics.ts` `track()` for every CTA tap and `useTimeOnScreen()` on every page mount. After Lesson Complete (13), trigger a 10-question SUS modal. View `v_sus_scores` in Supabase computes the score per user automatically.

For the thesis cross-tabulation:
1. Time-on-task (mean ms per screen) from `screen_views`
2. Error rate from `quiz_answers.is_correct`
3. SUS score from `v_sus_scores`
4. Repeat-tap heatmap from `events` filtered to `event = 'cta_tap'`

If the data shows **longer time-on-task correlates with lower SUS**, that's a publishable finding (cognitive efficiency vs. perceived usability) for МУИС МХТС defense.

---

*This v2 plan is the new contract. The hi-fi is the visual source of truth for any pixel decision; this document is the contract for behavior, scope, and architecture.*
