/*
  Phase 3 — "Дасгал" Duolingo-style practice drills.

  Per mazy_lesson_master_prompt §3: drills mix interaction kinds (tap-pair,
  swipe-yes-no, sequence) so muscle memory consolidates the takeaways. Wrong
  answers shake + show a Mascot bubble; the student must re-attempt — no
  "Submit" button, no "Wrong" text.
*/

export type PracticeDrill =
  | {
      kind: 'tap_match';
      id: string;
      title_mn: string;
      pairs: { left: string; right: string }[];
      mascot_error_mn: string;
      linked_takeaway?: string;
    }
  | {
      kind: 'true_false';
      id: string;
      title_mn: string;
      statements: { text_mn: string; correct: boolean }[];
      mascot_error_mn: string;
      linked_takeaway?: string;
    }
  | {
      kind: 'sequence';
      id: string;
      title_mn: string;
      steps: string[];
      mascot_error_mn: string;
      linked_takeaway?: string;
    };

export const PRACTICE_BY_LESSON: Record<string, PracticeDrill[]> = {
  reflection: [
    {
      kind: 'tap_match',
      id: 'rfl_d1',
      title_mn: 'Хосыг таарууллаа.',
      pairs: [
        { left: 'Тусах өнцөг 30°', right: 'Ойлтын өнцөг 30°' },
        { left: 'Тусах өнцөг 45°', right: 'Ойлтын өнцөг 45°' },
        { left: 'Тусах өнцөг 60°', right: 'Ойлтын өнцөг 60°' },
      ],
      mascot_error_mn: 'Тусах ба ойлтын өнцөг ҮРГЭЛЖ тэнцүү шүү!',
    },
    {
      kind: 'true_false',
      id: 'rfl_d2',
      title_mn: 'Тийм ч, Үгүй ч?',
      statements: [
        { text_mn: 'Бүх өнцөг хэвийн шугамаас хэмжигддэг.', correct: true },
        { text_mn: 'Тусах ба ойлтын өнцөг үргэлж тэнцүү байна.', correct: true },
        { text_mn: 'Толин дээрх ойлт зөвхөн металд тохиолдоно.', correct: false },
      ],
      mascot_error_mn: 'Хэвийн шугамаас хэмжигдэнэ — гадаргуунаас биш!',
    },
    {
      kind: 'sequence',
      id: 'rfl_d3',
      title_mn: 'Гэрлийн зам — дарааллаар.',
      steps: ['Гэрэл туссан', 'Хэвийн шугамыг таалаа', 'Ижил өнцгөөр ойсон'],
      mascot_error_mn: 'Эхлээд тусч, дараа нь ойдог шүү!',
    },
  ],
  propagation: [
    {
      kind: 'tap_match',
      id: 'pr_d1',
      title_mn: 'Орчин болон гэрлийн хурдыг тааруул.',
      pairs: [
        { left: 'Вакуум', right: '300 000 км/с' },
        { left: 'Ус', right: '226 000 км/с' },
        { left: 'Шил', right: '197 000 км/с' },
        { left: 'Алмаз', right: '125 000 км/с' },
      ],
      mascot_error_mn: 'Нягт орчинд гэрэл удаашрана!',
    },
    {
      kind: 'true_false',
      id: 'pr_d2',
      title_mn: 'Сүүдрийн тухай.',
      statements: [
        { text_mn: 'Хоёр сүүдэр давхцсан хэсэг — Бүтэн сүүдэр.', correct: true },
        { text_mn: 'Хагас сүүдэр гэрэлгүй харанхуй хэсэг.', correct: false },
        { text_mn: 'Сар хиртэлт = Сар Дэлхийн сүүдэрт орох.', correct: true },
      ],
      mascot_error_mn: 'Хагас сүүдэр нь зарим талаас гэрэл хүрнэ шүү.',
    },
    {
      kind: 'sequence',
      id: 'pr_d3',
      title_mn: 'Дараалал — Сүүдэр үүсэх.',
      steps: ['Гэрэл үүсгэгч', 'Гэрэл шулуун тарх', 'Бие саадлав', 'Сүүдэр үүсэв'],
      mascot_error_mn: 'Эхлээд гэрэл, дараа нь саад, эцэст нь сүүдэр.',
    },
  ],
  refraction: [
    {
      kind: 'tap_match',
      id: 'rf_d1',
      title_mn: 'Орчны хугарлын илтгэлцүүр.',
      pairs: [
        { left: 'Вакуум', right: 'n = 1.00' },
        { left: 'Ус', right: 'n ≈ 1.33' },
        { left: 'Шил', right: 'n ≈ 1.50' },
        { left: 'Алмаз', right: 'n ≈ 2.42' },
      ],
      mascot_error_mn: 'n илүү бол гэрэл илүү удаан тархана.',
    },
    {
      kind: 'true_false',
      id: 'rf_d2',
      title_mn: 'Хугарлын дүрэм.',
      statements: [
        { text_mn: 'Эгзэгтэй өнцгөөс хэтрэвэл — бүрэн дотоод ойлт.', correct: true },
        { text_mn: 'Снеллийн хууль: n₁ sin θ₁ = n₂ sin θ₂.', correct: true },
        { text_mn: 'Нягт орчноос сийрэг рүү — хэвийн руу хугарна.', correct: false },
      ],
      mascot_error_mn: 'Нягт→сийрэг үед хэвийн ШУГАМААС ХОЛДОНО!',
    },
  ],
  lenses: [
    {
      kind: 'tap_match',
      id: 'l_d1',
      title_mn: 'Цацраг — ойлтын зам.',
      pairs: [
        { left: 'Параллел туссан', right: 'Фокус (F) дайрна' },
        { left: 'Фокус (F) дайрсан', right: 'Параллел болж ойн' },
        { left: 'Төв (C) дайрсан', right: 'Буцаад өөрөө очно' },
      ],
      mascot_error_mn: 'Параллел туссан гэрэл үргэлж F дээр цуглардаг!',
    },
    {
      kind: 'true_false',
      id: 'l_d2',
      title_mn: 'Толь хэрэглээ.',
      statements: [
        { text_mn: 'Машины ар талын толь — Гүдгэр.', correct: true },
        { text_mn: 'Хүнхэр толь нь өргөн талбай харуулна.', correct: false },
        { text_mn: '1/a + 1/b = 1/f — бөмбөлөг толины томьёо.', correct: true },
      ],
      mascot_error_mn: 'Гүдгэр толь өргөн талбай харуулна; хүнхэр биш!',
    },
    {
      kind: 'sequence',
      id: 'l_d3',
      title_mn: 'Параллел цацрагийн зам.',
      steps: [
        'Параллел тэнхлэгтэй тусав',
        'Толь руу хүрэв',
        'Ойж Фокусаар (F) дайрав',
      ],
      mascot_error_mn: 'Тэнхлэгтэй параллел → F → ой.',
    },
  ],
  prism: [
    {
      kind: 'true_false',
      id: 'p_d1',
      title_mn: 'Призм ба өнгө.',
      statements: [
        { text_mn: 'Цагаан гэрэл бол 7 өнгөний нийлбэр.', correct: true },
        { text_mn: 'Призм гэрлийг өнгөнд задалдаг.', correct: true },
        { text_mn: 'Солонго бороогүй өдөр л үүсдэг.', correct: false },
      ],
      mascot_error_mn: 'Солонго ус, гэрэл хоёроос үүсдэг — бороо хэрэгтэй!',
    },
    {
      kind: 'sequence',
      id: 'p_d2',
      title_mn: 'Дисперсийн дараалал.',
      steps: ['Цагаан гэрэл туссан', 'Призмээр дамжсан', '7 өнгөнд задарсан'],
      mascot_error_mn: 'Эхлээд тусна, дараа нь задарна.',
    },
  ],
};

export function getPractice(lessonId: string): PracticeDrill[] {
  return PRACTICE_BY_LESSON[lessonId] ?? [];
}
