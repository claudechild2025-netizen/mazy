/*
  Phase 2 — "Танилцах" distill cards.

  Per mazy_lesson_master_prompt §2: each card is one short headline (≤ 12 words),
  optional formula (DM Mono), and a small icon. Cards are stepped through one
  at a time with a soft mini-animation on the icon so the screen feels alive.
*/

export type DistillCard = {
  id: string;
  headline_mn: string;
  detail_mn?: string;
  formula?: string;
  icon: string;
};

export const DISTILL_BY_LESSON: Record<string, DistillCard[]> = {
  reflection: [
    {
      id: 'r1',
      headline_mn: 'Тусах өнцөг = Ойлтын өнцөг',
      formula: 'α = α₁',
      icon: '↩️',
    },
    {
      id: 'r2',
      headline_mn: 'Бүх өнцөг хэвийн шугамаас хэмжигдэнэ.',
      icon: '📐',
    },
    {
      id: 'r3',
      headline_mn: 'Тусах, ойх ба нормаль — нэг хавтгайд оршино.',
      icon: '📄',
    },
    {
      id: 'r4',
      headline_mn: 'Барзгар гадарга — олон зүгт сарнимал ойлт.',
      icon: '✨',
    },
    {
      id: 'r5',
      headline_mn: 'Хавтгай толь — бие хэмжээтэй тэнцүү хуурмаг дүрс үүсгэнэ.',
      icon: '🪞',
    },
  ],
  propagation: [
    {
      id: 'p1',
      headline_mn: 'Гэрэл нэг төрлийн орчинд шулуун замаар тархдаг.',
      icon: '➡️',
    },
    {
      id: 'p2',
      headline_mn: 'Хоёр сүүдрийн давхцал — Бүтэн сүүдэр.',
      icon: '🌑',
    },
    {
      id: 'p3',
      headline_mn: 'Давхцаагүй хэсэг — Хагас сүүдэр.',
      icon: '🌗',
    },
    {
      id: 'p4',
      headline_mn: 'Сүүдэр / бие = Зайны харьцаа (төстэй гурвалжин).',
      icon: '📏',
    },
    {
      id: 'p5',
      headline_mn: 'Вакуум дахь гэрлийн хурд',
      formula: 'c ≈ 3·10⁸ м/с',
      icon: '⚡',
    },
    {
      id: 'p6',
      headline_mn: 'Орчин болгонд хурд өөр — усанд 226 000 км/с.',
      icon: '💧',
    },
  ],
  refraction: [
    {
      id: 'rf1',
      headline_mn: 'Хоёр орчны хил дамжихад гэрэл хугардаг.',
      icon: '🌊',
    },
    {
      id: 'rf2',
      headline_mn: 'Снеллийн хууль',
      formula: 'n₁ sin θ₁ = n₂ sin θ₂',
      icon: '📐',
    },
    {
      id: 'rf3',
      headline_mn: 'Нягт орчноос сийрэг рүү — хэвийн шугамаас холдоно.',
      icon: '↗️',
    },
    {
      id: 'rf4',
      headline_mn: 'Эгзэгтэй өнцөг хэтрэвэл — Бүрэн дотоод ойлт.',
      icon: '🔁',
    },
    {
      id: 'rf5',
      headline_mn: 'Хугарлын илтгэлцүүр (n) — орчин болгонд өөр.',
      icon: '🔬',
    },
  ],
  lenses: [
    {
      id: 'l1',
      headline_mn: 'Бөмбөлгийн дотор тал — Хүнхэр толь.',
      icon: '🥣',
    },
    {
      id: 'l2',
      headline_mn: 'Бөмбөлгийн гадна тал — Гүдгэр толь.',
      icon: '⚪',
    },
    {
      id: 'l3',
      headline_mn: 'Параллел туссан гэрэл — Фокусын цэг (F) дайрч ойно.',
      icon: '🎯',
    },
    {
      id: 'l4',
      headline_mn: 'Бөмбөлөг толины томьёо',
      formula: '1/a + 1/b = 1/f',
      icon: '∑',
    },
    {
      id: 'l5',
      headline_mn: 'Машины ар талын толь — Гүдгэр (өргөн талбай).',
      icon: '🚗',
    },
  ],
  prism: [
    {
      id: 'pr1',
      headline_mn: 'Цагаан гэрэл — 7 өнгөний нийлбэр.',
      icon: '⚪',
    },
    {
      id: 'pr2',
      headline_mn: 'Призм — гэрлийг задалдаг шил.',
      icon: '🔺',
    },
    {
      id: 'pr3',
      headline_mn: 'Өнгө бүр өөр өнцгөөр хугардаг.',
      detail_mn: 'Улаан хамгийн бага, ягаан хамгийн их өнцгөөр.',
      icon: '🎨',
    },
    {
      id: 'pr4',
      headline_mn: 'Энэ үзэгдлийг — Дисперс гэнэ.',
      icon: '🌈',
    },
    {
      id: 'pr5',
      headline_mn: 'Усны дусал = Бяцхан призм → Солонго.',
      icon: '💧',
    },
  ],
};

export function getDistill(lessonId: string): DistillCard[] {
  return DISTILL_BY_LESSON[lessonId] ?? [];
}
