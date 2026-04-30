/*
  Lesson + quiz seed data for the 3-day usability test.

  Per PROJECT_PLAN_v2 §6 ("Build vs. fake"):
    - Module 01 "Гэрэл" with 3 unlocked lessons (reflection, propagation, refraction)
    - Quiz of 3 questions for the active lesson
    - 2 additional locked lessons for visual completeness on the Lessons List

  Real persistence (Supabase reads) wires up after the test. For now this
  in-memory data drives every screen so the AI editor can scaffold against it.
*/

export type Lesson = {
  id: string;
  title_mn: string;
  blurb_mn: string;
  minutes: number;
  steps: number;
  xp: number;
  locked?: boolean;
  done?: boolean;
  // What the learner will be able to do after the lesson — drives Lesson Intro
  learnings_mn: string[];
  // v4: each lesson has a single primary lab (the lab IS the lesson). When
  // unset the /lesson/[id]/lab route renders a static placeholder marked
  // with TODO(dw): interactivity below standard.
  lab?: 'reflection' | 'shadow' | 'spherical-mirror';
};

export type LessonStep = {
  id: number;
  title_mn: string;
  body_mn: string;
  // Which simple inline illustration to render; the page picks via switch.
  visual: 'reflection' | 'propagation' | 'refraction' | 'lens';
  // Optional embedded interactive lab (per INTERACTION_REVISION.md: lab IS
  // the step content). When set, the step page swaps the static illustration
  // for the matching seed component. Steps without a slug fall back to the
  // static illustration with a TODO(dw): interactivity below standard.
  lab?: 'reflection' | 'shadow' | 'spherical-mirror';
};

/*
  Quiz items follow the v3 contract — each item is one of three kinds:
    - mcq                : standard 4-option multiple choice
    - dragdrop_fizeau    : drag-drop calculation (Fizeau speed-of-light)
    - ratio_mazaalai     : visual similar-triangles problem (Mazaalai bear)

  The quiz screen dispatches on `kind`. MCQ items drive the existing
  /correct and /wrong feedback routes; the seed-component kinds render
  their own inline feedback and surface a "Дараах" button afterwards.
*/
export type McqItem = {
  kind: 'mcq';
  id: string;
  prompt_mn: string;
  options: { key: 'a' | 'b' | 'c' | 'd'; text_mn: string }[];
  correct_key: 'a' | 'b' | 'c' | 'd';
};

export type SeedQuizItem = {
  kind: 'dragdrop_fizeau' | 'ratio_mazaalai';
  id: string;
};

export type QuizItem = McqItem | SeedQuizItem;

// Back-compat alias — older imports referenced QuizQuestion when MCQ was the
// only kind. Now that we have a union, MCQ === QuizQuestion.
export type QuizQuestion = McqItem;

export const LESSONS: Lesson[] = [
  {
    id: 'reflection',
    title_mn: 'Гэрлийн ойлт',
    blurb_mn: 'Толин дээрх тусах ба ойх өнцгийн зүй тогтол.',
    minutes: 5,
    steps: 3,
    xp: 30,
    lab: 'reflection',
    learnings_mn: [
      'Тусах өнцөг ба ойлтын өнцөг тэнцүү (i = r)',
      'Хэвийн шугам, ойлтын хавтгайг таних',
      'Бодит жишээгээр толины ойлтыг тайлбарлах',
    ],
  },
  {
    id: 'propagation',
    title_mn: 'Гэрлийн тархалт',
    blurb_mn: 'Гэрэл шулуун тархдаг ба сүүдэр үүсгэдэг.',
    minutes: 4,
    steps: 3,
    xp: 25,
    lab: 'shadow',
    learnings_mn: [
      'Гэрэл шулуун замаар тархдаг',
      'Сүүдэр (умбра/пенумбра) хэрхэн үүсдэг',
      'Гэрлийн хурдны хэмжээс (≈ 3·10⁸ м/с)',
    ],
  },
  {
    id: 'refraction',
    title_mn: 'Гэрлийн хугарал',
    blurb_mn: 'Хоёр орчны хилээр гэрэл хугардаг — Снелл.',
    minutes: 6,
    steps: 3,
    xp: 35,
    learnings_mn: [
      'Снеллийн хууль: n₁ sin θ₁ = n₂ sin θ₂',
      'Орчны хугарлын илтгэлцүүр',
      'Эгзэгтэй өнцөг ба бүрэн дотоод ойлт',
    ],
  },
  {
    id: 'lenses',
    title_mn: 'Гүдгэр ба хотгор линз',
    blurb_mn: 'Линзний дүрс үүсгэх зарчим.',
    minutes: 7,
    steps: 4,
    xp: 40,
    locked: true,
    lab: 'spherical-mirror',
    learnings_mn: ['Линз ба фокусын урт', 'Дүрсийн томролт', 'Линзний томьёо'],
  },
  {
    id: 'prism',
    title_mn: 'Призм ба дисперс',
    blurb_mn: 'Цагаан гэрэл 7 өнгөнд задардаг.',
    minutes: 5,
    steps: 3,
    xp: 30,
    locked: true,
    learnings_mn: ['Дисперсийн зарчим', 'Спектр', 'Бодит жишээ — солонго'],
  },
];

export function getLesson(id: string): Lesson | undefined {
  return LESSONS.find((l) => l.id === id);
}

export const STEPS_BY_LESSON: Record<string, LessonStep[]> = {
  reflection: [
    {
      id: 1,
      title_mn: 'Тусах ба ойлтын өнцөг',
      body_mn:
        'Шар бөмбөгийг чирж тусах өнцгийг өөрчил. Ойлтын өнцөг нь үргэлж адил утгатай байгааг өөрөө нээ.',
      visual: 'reflection',
      lab: 'reflection',
    },
    {
      id: 2,
      title_mn: 'Хэвийн шугам',
      body_mn:
        'Тусах цэг дээр толины гадаргуутай перпендикуляр зурагдсан шугамыг хэвийн шугам гэнэ. Бүх өнцөг үүнээс хэмжигдэнэ.',
      visual: 'reflection',
    },
    {
      id: 3,
      title_mn: 'Бодит жишээ',
      body_mn:
        'Шилэн толь, усны гадаргуу, гялгар металл — бүгд ижил хууль дагана.',
      visual: 'reflection',
    },
  ],
  propagation: [
    {
      id: 1,
      title_mn: 'Шулуун тархалт',
      body_mn: 'Гэрэл нэг төрлийн орчинд шулуун замаар тархдаг.',
      visual: 'propagation',
    },
    {
      id: 2,
      title_mn: 'Сүүдэр',
      body_mn:
        'Хоёр гэрэл үүсвэрийг чирж умбра (бүтэн сүүдэр) ба пенумбра (хагас сүүдэр) хэрхэн үүсэхийг ажигла.',
      visual: 'propagation',
      lab: 'shadow',
    },
    {
      id: 3,
      title_mn: 'Гэрлийн хурд',
      body_mn: 'c ≈ 3·10⁸ м/с — Дэлхийн эргэн тойронд секундэд 7.5 удаа эргэдэг.',
      visual: 'propagation',
    },
  ],
  refraction: [
    {
      id: 1,
      title_mn: 'Хоёр орчны хил',
      body_mn:
        'Гэрэл нэг орчноос нөгөөд орохдоо хурд өөрчлөгдөж, замын чиглэл хугардаг.',
      visual: 'refraction',
    },
    {
      id: 2,
      title_mn: 'Снеллийн хууль',
      body_mn: 'n₁ sin θ₁ = n₂ sin θ₂ — өнцөг ба орчны хугарлын илтгэлцүүрийн холбоо.',
      visual: 'refraction',
    },
    {
      id: 3,
      title_mn: 'Эгзэгтэй өнцөг',
      body_mn:
        'Тодорхой өнцгөөс эхлэн гэрэл хоёр дахь орчинд гарахаа болино — бүрэн дотоод ойлт.',
      visual: 'refraction',
    },
  ],
};

export const QUIZ_BY_LESSON: Record<string, QuizItem[]> = {
  reflection: [
    {
      kind: 'mcq',
      id: 'q1',
      prompt_mn:
        'Тусах өнцөг 35° байх үед ойлтын өнцөг хэдэн градус байх вэ?',
      options: [
        { key: 'a', text_mn: '0°' },
        { key: 'b', text_mn: '35°' },
        { key: 'c', text_mn: '55°' },
        { key: 'd', text_mn: '70°' },
      ],
      correct_key: 'b',
    },
    {
      kind: 'mcq',
      id: 'q2',
      prompt_mn: 'Бүх өнцөг алинаас хэмжигддэг вэ?',
      options: [
        { key: 'a', text_mn: 'Толины гадаргуунаас' },
        { key: 'b', text_mn: 'Хэвийн шугамаас' },
        { key: 'c', text_mn: 'Туяаны замаас' },
        { key: 'd', text_mn: 'Хэвтээ шугамаас' },
      ],
      correct_key: 'b',
    },
    {
      kind: 'mcq',
      id: 'q3',
      prompt_mn: 'Гэрлийн ойлтын хууль алинд хамаарагдах вэ?',
      options: [
        { key: 'a', text_mn: 'Зөвхөн хавтгай толинд' },
        { key: 'b', text_mn: 'Гялгар бүх гадаргуунд' },
        { key: 'c', text_mn: 'Зөвхөн металд' },
        { key: 'd', text_mn: 'Зөвхөн усанд' },
      ],
      correct_key: 'b',
    },
  ],
  // Propagation is the v3 mixed-quiz exemplar: MCQ + visual ratio + drag-drop.
  // Q2 → Mazaalai bear similar-triangles problem.
  // Q3 → Fizeau drag-drop calculation for c = 4·N·n·l.
  propagation: [
    {
      kind: 'mcq',
      id: 'q1',
      prompt_mn: 'Гэрэл нэг төрлийн орчинд хэрхэн тархах вэ?',
      options: [
        { key: 'a', text_mn: 'Долгионтой муруйгаар' },
        { key: 'b', text_mn: 'Шулуун замаар' },
        { key: 'c', text_mn: 'Спираль хэлбэрээр' },
        { key: 'd', text_mn: 'Биеийг тойрч' },
      ],
      correct_key: 'b',
    },
    { kind: 'ratio_mazaalai', id: 'mazaalai_q5' },
    { kind: 'dragdrop_fizeau', id: 'fizeau_q7' },
  ],
  refraction: [
    {
      kind: 'mcq',
      id: 'q1',
      prompt_mn: 'Снеллийн хуулийг ил тод бичвэл аль нь зөв вэ?',
      options: [
        { key: 'a', text_mn: 'n₁ + n₂ = θ₁ − θ₂' },
        { key: 'b', text_mn: 'n₁ sin θ₁ = n₂ sin θ₂' },
        { key: 'c', text_mn: 'n₁ θ₁ = n₂ θ₂' },
        { key: 'd', text_mn: 'sin θ₁ = sin θ₂' },
      ],
      correct_key: 'b',
    },
    {
      kind: 'mcq',
      id: 'q2',
      prompt_mn: 'Бүрэн дотоод ойлт хэзээ үүсэх вэ?',
      options: [
        { key: 'a', text_mn: 'Тусах өнцөг 0° үед' },
        { key: 'b', text_mn: 'Эгзэгтэй өнцгөөс хэтэрсэн үед' },
        { key: 'c', text_mn: 'Хоёр орчны n тэнцүү үед' },
        { key: 'd', text_mn: 'Хэзээ ч үүсдэггүй' },
      ],
      correct_key: 'b',
    },
    {
      kind: 'mcq',
      id: 'q3',
      prompt_mn: 'Гэрэл нягт орчноос сийрэг рүү орохдоо хэрхэн хугарах вэ?',
      options: [
        { key: 'a', text_mn: 'Хэвийн шугам руу' },
        { key: 'b', text_mn: 'Хэвийн шугамаас холдох тал руу' },
        { key: 'c', text_mn: 'Хугардаггүй' },
        { key: 'd', text_mn: 'Үргэлж 90°-аар' },
      ],
      correct_key: 'b',
    },
  ],
};

export function getQuiz(lessonId: string): QuizItem[] {
  return QUIZ_BY_LESSON[lessonId] ?? [];
}

export function getSteps(lessonId: string): LessonStep[] {
  return STEPS_BY_LESSON[lessonId] ?? [];
}
