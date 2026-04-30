# INTERACTION REVISION (v3 patch on v2)

> Hand this file to the AI agent **before** it starts implementing screens.
> It overrides the parts of `PROJECT_PLAN_v2.md` that treat lessons and
> labs as separate surfaces. They are not separate. Lab IS the lesson.

---

## Why this revision

The hi-fi prototype shows a textbook flow: **read text → watch animation → multiple-choice quiz → done**. That is passive consumption with a phone-shaped wrapper. It violates the active-learning premise of the thesis. The Spatial Contiguity Principle (Mayer 2009) only delivers a learning gain when the *learner* is the one making the elements relate — pointing, dragging, comparing. A student watching a pre-baked animation with adjacent labels is at best a 1.2× improvement over plain text. A student dragging the angle and watching α₁ track α in real time is closer to 2× — and is the standard Mongolian physics teachers already use with chalkboard demos. Mazy should match that, not diminish it.

## The new mental model

```
OLD (v1, v2, hi-fi):
  Lesson Intro → Motion Player (passive video) → Lesson Step (text+image) → Quiz (MCQ) → Complete

NEW (v3):
  Lesson Intro → Interactive Lab (the explanation IS the manipulation) → Mixed Quiz (MCQ + drag-drop calc + visual ratio) → Complete
```

The "Motion Player" screen (07 in hi-fi) is **demoted**. It still exists for students who want a guided walkthrough, but the primary path is direct manipulation. Recap (09) condenses the lesson — the student already learned by doing.

## Component contract

Every interactive component conforms to this minimal interface — so the agent can wire any of them into any lesson:

```ts
type LabProps = {
  // Where to fire analytics events
  surface: string;
  // What the student is meant to discover (drives the title + caption)
  goal_mn: string;
  // Called once when the student has reached the conceptual aha
  // (e.g., when they've seen reflection at 3+ different angles)
  onMastery?: () => void;
};

type QuizProps = {
  surface: string;
  question_id: string;
  prompt_mn: string;
  onSubmit: (args: { is_correct: boolean; time_to_answer_ms: number }) => void;
};
```

Both shapes match the schema in `supabase/schema.sql` (no migrations needed).

## What the agent builds (in this order)

1. **Replace** `app/lab/[slug]/page.tsx` route with the Lab components below
2. **Embed** the relevant Lab inside `app/lesson/[id]/step/[n]/page.tsx` — the lab IS the step content
3. **Replace** the MCQ-only Quiz screen (10) with a Quiz component that picks one of three question types per item: MCQ / DragDropCalculation / VisualRatio
4. Keep Recap (09) — it's still useful, but tighten the copy: "Чи just өөрөө нээсэн зүйлс…"

## Five components delivered (in this folder)

| File | Textbook page | Pattern |
|---|---|---|
| `components/labs/ReflectionLab.tsx` | 147 | Drag the incident ray, α₁ tracks α |
| `components/labs/ShadowLab.tsx` | 140 | Drag two light sources, watch umbra/penumbra emerge |
| `components/labs/SphericalMirrorLab.tsx` | 151–152 | Drag object along axis; a, b, magnification, image type update via 1/a + 1/b = 1/f |
| `components/quiz/FizeauDragDrop.tsx` | 145 (Q7) | Drag values into the formula c = 4Nnl |
| `components/quiz/MazaalaiRatioProblem.tsx` | 145 (Q5) | Visual similar-triangles problem with the bear |

For Q6 (theory MCQ) reuse a simple `<MultipleChoice>` component — the existing Quiz screen already covers this pattern; no new build needed.

## Pedagogical defense (for thesis §4.2)

- Each lab embodies **embodied cognition** (Barsalou 2008) — students learn by physically simulating the manipulation, not abstracting from a static diagram.
- Real-time numerical readouts adjacent to the manipulation deliver **Spatial Contiguity** in its strongest form (Mayer 2009 §6).
- Drag-drop calculation problems test **transfer**, not just **retention** — the student must recognize which value goes in which variable slot, demonstrating conceptual understanding rather than pattern matching (Bransford et al. 2000).
- The visual ratio problem with the Mazaalai bear maintains **cultural authenticity** in the problem context — relevant for educational technology in Mongolia (Resnick 1987 on situated cognition; Henning 2004 on culturally-grounded math problems).

## What does NOT change from v2

- All design tokens (`brand-100`, `ink-900`, `info-fg`, etc.) — already correct
- The schema and analytics layer — already capture timing and clicks needed for the SUS analysis
- The 14-screen happy path scope for the 3-day usability test — still tight
- The bottom-tab nav — still correct
- The Mazy lightbulb mascot for branding — still correct (the bear appears only as a problem-context illustration in MazaalaiRatioProblem)

## What the agent should NOT do

- Do not gate access to labs behind lesson completion. Labs should be openable from Lessons List as standalone explorations.
- Do not require students to read all the text before they can interact. The first thing on every lab/step screen should be the canvas, with the explanation below or beside it.
- Do not auto-advance after a "correct" feedback in 1.2s — let the student see WHY they were correct. 2.5s minimum, with a "Дараах" button always available immediately for fast students.
