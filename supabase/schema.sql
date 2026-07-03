-- GLG Dashboard: 계정 승인/권한 + 공유 조직도 데이터 스키마
-- Supabase 대시보드 > SQL Editor 에서 전체를 한 번에 실행하세요.

create extension if not exists "pgcrypto";

-- ── 계정(승인/권한) ─────────────────────────────────────────
create table if not exists app_users (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid unique references auth.users(id) on delete cascade,
  email text unique not null,
  name text,
  avatar_url text,
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  role text not null default 'viewer' check (role in ('viewer','editor','admin')),
  requested_at timestamptz not null default now(),
  approved_at timestamptz,
  last_login_at timestamptz
);

-- ── 조직도/대시보드 공유 데이터 (JSON 한 덩어리로 저장) ─────
create table if not exists org_state (
  id text primary key,
  data jsonb not null,
  updated_at timestamptz not null default now(),
  updated_by text
);

-- ── 저장된 버전(체크포인트) ─────────────────────────────────
create table if not exists org_checkpoints (
  id text primary key,
  label text not null,
  saved_by text,
  saved_at timestamptz not null default now(),
  data jsonb not null
);

alter table app_users enable row level security;
alter table org_state enable row level security;
alter table org_checkpoints enable row level security;

-- ── 권한 판별 함수 (SECURITY DEFINER로 RLS 재귀 방지) ───────
create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from app_users where auth_user_id = auth.uid() and role = 'admin' and status = 'approved'
  );
$$;

create or replace function public.is_editor()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from app_users
    where auth_user_id = auth.uid() and status = 'approved' and role in ('editor','admin')
  );
$$;

create or replace function public.is_approved()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from app_users where auth_user_id = auth.uid() and status = 'approved'
  );
$$;

-- ── 최초 로그인 시 자동 등록 (관리자 이메일은 자동 승인) ────
-- ⚠️ 아래 이메일을 실제 관리자 구글 계정으로 바꿔서 실행하세요.
create or replace function public.self_register()
returns void language plpgsql security definer set search_path = public as $$
declare
  uid uuid := auth.uid();
  uemail text;
  admin_flag boolean;
begin
  select email into uemail from auth.users where id = uid;
  admin_flag := lower(uemail) = lower('yh04174e@gmail.com');

  insert into app_users (auth_user_id, email, name, avatar_url, status, role, approved_at, last_login_at)
  select
    uid,
    uemail,
    u.raw_user_meta_data->>'full_name',
    u.raw_user_meta_data->>'avatar_url',
    case when admin_flag then 'approved' else 'pending' end,
    case when admin_flag then 'admin' else 'viewer' end,
    case when admin_flag then now() else null end,
    now()
  from auth.users u where u.id = uid
  on conflict (auth_user_id) do update set last_login_at = now();
end;
$$;

-- ── app_users 정책 ───────────────────────────────────────────
drop policy if exists "self can read own row" on app_users;
create policy "self can read own row" on app_users for select using (auth_user_id = auth.uid());

drop policy if exists "admin can read all" on app_users;
create policy "admin can read all" on app_users for select using (is_admin());

drop policy if exists "admin can update all" on app_users;
create policy "admin can update all" on app_users for update using (is_admin());

-- ── org_state 정책 ───────────────────────────────────────────
drop policy if exists "approved can read org_state" on org_state;
create policy "approved can read org_state" on org_state for select using (is_approved());

drop policy if exists "editors can write org_state" on org_state;
create policy "editors can write org_state" on org_state for all using (is_editor()) with check (is_editor());

-- ── org_checkpoints 정책 ─────────────────────────────────────
drop policy if exists "approved can read checkpoints" on org_checkpoints;
create policy "approved can read checkpoints" on org_checkpoints for select using (is_approved());

drop policy if exists "editors can write checkpoints" on org_checkpoints;
create policy "editors can write checkpoints" on org_checkpoints for all using (is_editor()) with check (is_editor());
