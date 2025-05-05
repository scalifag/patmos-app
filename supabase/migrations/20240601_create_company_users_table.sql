-- 1. Tabla intermedia: company_users
create table public.company_users (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamp with time zone default now(),
  unique (company_id, user_id)
);

-- 2. Habilitar RLS
alter table public.company_users enable row level security;

-- 3. Política: Permitir que el owner de la compañía agregue usuarios
-- Permitir que el owner de la compañía cree la relación
create policy "Allow company owner to assign users"
on public.company_users
for insert
with check (
  exists (
    select 1
    from public.companies c
    where c.id = company_users.company_id
      and c.user_id = auth.uid()
  )
);


-- 4. Política: Permitir leer solo relaciones del propio usuario
create policy "Allow users to see their own company assignments"
on public.company_users
for select
using (
  user_id = auth.uid()
);

-- 5. Política: Permitir borrar asignaciones si sos el owner de la empresa
create policy "Allow owner to remove users"
on public.company_users
for delete
using (
  exists (
    select 1
    from public.companies c
    where c.id = company_users.company_id
      and c.user_id = auth.uid()
  )
);
