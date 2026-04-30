-- =============================================================================
-- Admin read access — anon SELECT
-- =============================================================================
-- mazy-admin (read-only dashboard) нь login-гүй ажилладаг тул anon role-д
-- SELECT эрх нэмнэ. Энэ нь anon key мэдсэн хэн ч өгөгдлийг уншиж чадна гэсэн
-- үг — тиймээс Vercel deployment-ийн URL-аа нийтлэхгүй байх.
--
-- Production-д үлдээх бол service_role key + server-side query руу шилжих.
-- Run: Supabase Studio → SQL Editor → New query → Paste → Run
-- =============================================================================

create policy "anon read users"          on users          for select to anon using (true);
create policy "anon read screen_views"   on screen_views   for select to anon using (true);
create policy "anon read quiz_attempts"  on quiz_attempts  for select to anon using (true);
create policy "anon read quiz_answers"   on quiz_answers   for select to anon using (true);
create policy "anon read events"         on events         for select to anon using (true);
create policy "anon read sus_responses"  on sus_responses  for select to anon using (true);

-- screens, modules, quiz_questions нь RLS-гүй (public reference data) тул
-- public.v_sus_scores view ч anon-аас уншигдана.
