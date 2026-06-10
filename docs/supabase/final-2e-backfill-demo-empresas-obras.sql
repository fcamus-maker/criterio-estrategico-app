-- FASE FINAL-2E - BACKFILL DEMO CONTROLADO EMPRESAS/OBRAS.
-- PREPARADO PARA EJECUCION MANUAL CONTROLADA EN SUPABASE SQL EDITOR.
--
-- Contexto:
-- - Dataset actual autorizado como ficticio/demo.
-- - public.hallazgos_central contiene 33 registros esperados.
-- - Modelo base multiempresa ya existe.
--
-- Alcance permitido:
-- - INSERT controlado en public.empresas.
-- - INSERT controlado en public.obras.
-- - UPDATE controlado solo de empresa_id y obra_id en public.hallazgos_central.
-- - SELECT de validacion.
--
-- Protecciones:
-- - NO activa RLS.
-- - NO crea policies.
-- - NO toca Storage.
-- - NO toca auth.users.
-- - NO toca evidencias.
-- - NO borra registros.
-- - NO modifica textos historicos empresa/obra/siglas.

-- ==================================================
-- A. RESPALDO LOGICO PREVIO / CONTEOS
-- ==================================================

select
  count(*) as total_hallazgos,
  count(*) filter (where empresa_id is not null) as con_empresa_id,
  count(*) filter (where empresa_id is null) as sin_empresa_id,
  count(*) filter (where obra_id is not null) as con_obra_id,
  count(*) filter (where obra_id is null) as sin_obra_id
from public.hallazgos_central;

select
  regexp_replace(trim(coalesce(h.empresa, '')), '\s+', ' ', 'g') as empresa_texto,
  regexp_replace(trim(coalesce(h.obra, '')), '\s+', ' ', 'g') as obra_texto,
  nullif(trim(to_jsonb(h) ->> 'sigla_empresa'), '') as sigla_empresa_texto,
  coalesce(
    nullif(trim(to_jsonb(h) ->> 'sigla_obra'), ''),
    nullif(trim(to_jsonb(h) ->> 'sigla_proyecto'), '')
  ) as sigla_obra_texto,
  count(*) as hallazgos
from public.hallazgos_central h
group by
  regexp_replace(trim(coalesce(h.empresa, '')), '\s+', ' ', 'g'),
  regexp_replace(trim(coalesce(h.obra, '')), '\s+', ' ', 'g'),
  nullif(trim(to_jsonb(h) ->> 'sigla_empresa'), ''),
  coalesce(
    nullif(trim(to_jsonb(h) ->> 'sigla_obra'), ''),
    nullif(trim(to_jsonb(h) ->> 'sigla_proyecto'), '')
  )
order by hallazgos desc, empresa_texto, obra_texto;

-- ==================================================
-- B. CREAR EMPRESAS DEMO FALTANTES
-- ==================================================
-- Estado se guarda como 'activa' para compatibilidad con instalaciones que
-- tengan constraints antiguas. La condicion demo queda dada por el origen de
-- datos ficticios y por esta migracion documentada.

with empresas_detectadas as (
  select
    lower(regexp_replace(trim(coalesce(h.empresa, '')), '\s+', ' ', 'g')) as empresa_key,
    (array_agg(
      regexp_replace(trim(coalesce(h.empresa, '')), '\s+', ' ', 'g')
      order by regexp_replace(trim(coalesce(h.empresa, '')), '\s+', ' ', 'g')
    ))[1] as nombre,
    (array_agg(
      nullif(trim(to_jsonb(h) ->> 'sigla_empresa'), '')
      order by nullif(trim(to_jsonb(h) ->> 'sigla_empresa'), '') nulls last
    ))[1] as sigla_detectada
  from public.hallazgos_central h
  where nullif(trim(coalesce(h.empresa, '')), '') is not null
  group by lower(regexp_replace(trim(coalesce(h.empresa, '')), '\s+', ' ', 'g'))
),
empresas_nuevas as (
  select
    ed.nombre,
    coalesce(
      ed.sigla_detectada,
      upper(left(regexp_replace(ed.nombre, '[^[:alnum:]]+', '', 'g'), 12))
    ) as sigla
  from empresas_detectadas ed
  where not exists (
    select 1
    from public.empresas e
    where lower(regexp_replace(trim(coalesce(e.nombre, '')), '\s+', ' ', 'g')) = ed.empresa_key
  )
)
insert into public.empresas (nombre, sigla, estado)
select
  nombre,
  sigla,
  'activa'
from empresas_nuevas
order by nombre;

-- Validacion inmediata: empresas demo ahora disponibles para matching.
select
  e.id,
  e.nombre,
  e.sigla,
  e.estado
from public.empresas e
where exists (
  select 1
  from public.hallazgos_central h
  where lower(regexp_replace(trim(coalesce(h.empresa, '')), '\s+', ' ', 'g'))
      = lower(regexp_replace(trim(coalesce(e.nombre, '')), '\s+', ' ', 'g'))
)
order by e.nombre;

-- ==================================================
-- C. CREAR OBRAS DEMO FALTANTES
-- ==================================================

with obras_detectadas as (
  select
    lower(regexp_replace(trim(coalesce(h.empresa, '')), '\s+', ' ', 'g')) as empresa_key,
    lower(regexp_replace(trim(coalesce(h.obra, '')), '\s+', ' ', 'g')) as obra_key,
    (array_agg(
      regexp_replace(trim(coalesce(h.obra, '')), '\s+', ' ', 'g')
      order by regexp_replace(trim(coalesce(h.obra, '')), '\s+', ' ', 'g')
    ))[1] as nombre,
    (array_agg(
      coalesce(
        nullif(trim(to_jsonb(h) ->> 'sigla_obra'), ''),
        nullif(trim(to_jsonb(h) ->> 'sigla_proyecto'), '')
      )
      order by coalesce(
        nullif(trim(to_jsonb(h) ->> 'sigla_obra'), ''),
        nullif(trim(to_jsonb(h) ->> 'sigla_proyecto'), '')
      ) nulls last
    ))[1] as sigla_detectada
  from public.hallazgos_central h
  where nullif(trim(coalesce(h.empresa, '')), '') is not null
    and nullif(trim(coalesce(h.obra, '')), '') is not null
  group by
    lower(regexp_replace(trim(coalesce(h.empresa, '')), '\s+', ' ', 'g')),
    lower(regexp_replace(trim(coalesce(h.obra, '')), '\s+', ' ', 'g'))
),
empresas_catalogo as (
  select
    lower(regexp_replace(trim(coalesce(e.nombre, '')), '\s+', ' ', 'g')) as empresa_key,
    (array_agg(e.id order by e.id::text))[1] as empresa_id,
    count(*) as empresas_candidatas
  from public.empresas e
  group by lower(regexp_replace(trim(coalesce(e.nombre, '')), '\s+', ' ', 'g'))
),
obras_nuevas as (
  select
    ec.empresa_id,
    od.nombre,
    coalesce(
      od.sigla_detectada,
      upper(left(regexp_replace(od.nombre, '[^[:alnum:]]+', '', 'g'), 12))
    ) as sigla
  from obras_detectadas od
  join empresas_catalogo ec on ec.empresa_key = od.empresa_key
  where ec.empresas_candidatas = 1
    and not exists (
      select 1
      from public.obras o
      where o.empresa_id = ec.empresa_id
        and lower(regexp_replace(trim(coalesce(o.nombre, '')), '\s+', ' ', 'g')) = od.obra_key
    )
)
insert into public.obras (empresa_id, nombre, sigla, estado)
select
  empresa_id,
  nombre,
  sigla,
  'activa'
from obras_nuevas
order by nombre;

-- Validacion inmediata: obras demo ahora disponibles para matching.
select
  e.nombre as empresa,
  o.id,
  o.nombre as obra,
  o.sigla,
  o.estado
from public.obras o
join public.empresas e on e.id = o.empresa_id
where exists (
  select 1
  from public.hallazgos_central h
  where lower(regexp_replace(trim(coalesce(h.empresa, '')), '\s+', ' ', 'g'))
      = lower(regexp_replace(trim(coalesce(e.nombre, '')), '\s+', ' ', 'g'))
    and lower(regexp_replace(trim(coalesce(h.obra, '')), '\s+', ' ', 'g'))
      = lower(regexp_replace(trim(coalesce(o.nombre, '')), '\s+', ' ', 'g'))
)
order by e.nombre, o.nombre;

-- ==================================================
-- D. POBLAR hallazgos_central.empresa_id
-- ==================================================

with empresas_catalogo as (
  select
    lower(regexp_replace(trim(coalesce(e.nombre, '')), '\s+', ' ', 'g')) as empresa_key,
    (array_agg(e.id order by e.id::text))[1] as empresa_id,
    count(*) as empresas_candidatas
  from public.empresas e
  group by lower(regexp_replace(trim(coalesce(e.nombre, '')), '\s+', ' ', 'g'))
),
match_empresa as (
  select
    h.id as hallazgo_id,
    ec.empresa_id
  from public.hallazgos_central h
  join empresas_catalogo ec
    on ec.empresa_key = lower(regexp_replace(trim(coalesce(h.empresa, '')), '\s+', ' ', 'g'))
  where h.empresa_id is null
    and ec.empresas_candidatas = 1
)
update public.hallazgos_central h
set empresa_id = me.empresa_id
from match_empresa me
where h.id = me.hallazgo_id
  and h.empresa_id is null;

-- Validacion inmediata de empresa_id.
select
  count(*) as total_hallazgos,
  count(*) filter (where empresa_id is not null) as con_empresa_id,
  count(*) filter (where empresa_id is null) as sin_empresa_id
from public.hallazgos_central;

-- ==================================================
-- E. POBLAR hallazgos_central.obra_id
-- ==================================================

with obras_catalogo as (
  select
    o.empresa_id,
    lower(regexp_replace(trim(coalesce(o.nombre, '')), '\s+', ' ', 'g')) as obra_key,
    (array_agg(o.id order by o.id::text))[1] as obra_id,
    count(*) as obras_candidatas
  from public.obras o
  group by
    o.empresa_id,
    lower(regexp_replace(trim(coalesce(o.nombre, '')), '\s+', ' ', 'g'))
),
match_obra as (
  select
    h.id as hallazgo_id,
    oc.obra_id
  from public.hallazgos_central h
  join obras_catalogo oc
    on oc.empresa_id = h.empresa_id
   and oc.obra_key = lower(regexp_replace(trim(coalesce(h.obra, '')), '\s+', ' ', 'g'))
  where h.obra_id is null
    and h.empresa_id is not null
    and oc.obras_candidatas = 1
)
update public.hallazgos_central h
set obra_id = mo.obra_id
from match_obra mo
where h.id = mo.hallazgo_id
  and h.obra_id is null;

-- Validacion inmediata de obra_id.
select
  count(*) as total_hallazgos,
  count(*) filter (where obra_id is not null) as con_obra_id,
  count(*) filter (where obra_id is null) as sin_obra_id
from public.hallazgos_central;

-- ==================================================
-- F. VALIDACIONES POSTERIORES
-- ==================================================

select
  count(*) as total_hallazgos,
  count(*) filter (where empresa_id is not null) as con_empresa_id,
  count(*) filter (where empresa_id is null) as sin_empresa_id,
  count(*) filter (where obra_id is not null) as con_obra_id,
  count(*) filter (where obra_id is null) as sin_obra_id
from public.hallazgos_central;

select
  h.codigo,
  h.empresa,
  h.obra,
  h.empresa_id,
  h.obra_id
from public.hallazgos_central h
where h.empresa_id is null
   or h.obra_id is null
order by h.codigo;

select
  e.nombre as empresa_catalogo,
  o.nombre as obra_catalogo,
  count(h.id) as hallazgos
from public.hallazgos_central h
left join public.empresas e on e.id = h.empresa_id
left join public.obras o on o.id = h.obra_id
group by e.nombre, o.nombre
order by hallazgos desc, empresa_catalogo, obra_catalogo;

select
  h.codigo,
  h.empresa as empresa_snapshot,
  e.nombre as empresa_uuid,
  h.obra as obra_snapshot,
  o.nombre as obra_uuid,
  h.empresa_id,
  h.obra_id
from public.hallazgos_central h
left join public.empresas e on e.id = h.empresa_id
left join public.obras o on o.id = h.obra_id
order by h.codigo;

-- ==================================================
-- G. ROLLBACK LOGICO OPCIONAL - NO EJECUTAR AUTOMATICAMENTE
-- ==================================================
-- Si el mapeo demo quedara incorrecto, el rollback logico recomendado es
-- limpiar solo los UUIDs de hallazgos para repetir el mapeo. No borra empresas,
-- obras, hallazgos, textos historicos ni evidencias.
--
-- update public.hallazgos_central
-- set empresa_id = null,
--     obra_id = null
-- where empresa_id is not null
--    or obra_id is not null;

