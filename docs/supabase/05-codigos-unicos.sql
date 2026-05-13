-- Plataforma Hallazgos - propuesta codigos unicos centralizados.
-- NO EJECUTAR TODAVIA.

create table if not exists public.hallazgos_correlativos (
  id uuid primary key default gen_random_uuid(),
  empresa text not null,
  obra text not null,
  prefijo text not null,
  ultimo_numero integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (empresa, obra, prefijo)
);

create or replace function public.reservar_codigo_hallazgo(
  p_empresa text,
  p_obra text,
  p_prefijo text default 'CE'
)
returns text
language plpgsql
security definer
as $$
declare
  v_numero integer;
  v_codigo text;
begin
  insert into public.hallazgos_correlativos (empresa, obra, prefijo, ultimo_numero)
  values (p_empresa, p_obra, p_prefijo, 0)
  on conflict (empresa, obra, prefijo) do nothing;

  update public.hallazgos_correlativos
  set ultimo_numero = ultimo_numero + 1,
      updated_at = now()
  where empresa = p_empresa
    and obra = p_obra
    and prefijo = p_prefijo
  returning ultimo_numero into v_numero;

  v_codigo :=
    p_prefijo || '-' ||
    upper(regexp_replace(p_obra, '[^a-zA-Z0-9]+', '', 'g')) || '/' ||
    upper(regexp_replace(p_empresa, '[^a-zA-Z0-9]+', '', 'g')) || '-' ||
    lpad(v_numero::text, 4, '0');

  return v_codigo;
end;
$$;

-- Estrategia offline recomendada:
-- 1. App movil V2 conserva codigo local temporal en codigo_local.
-- 2. Al sincronizar, Supabase reserva codigo central con RPC.
-- 3. Tabla mantiene codigo_local para trazabilidad y codigo central unique.
-- 4. Si hay conflicto, reintentar reserva en transaccion.
-- 5. UUID interno id sigue siendo identidad primaria estable.
