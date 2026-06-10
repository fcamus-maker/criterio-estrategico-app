-- FASE FINAL-2D - PREVIEW UUID EMPRESA/OBRA.
-- SOLO LECTURA PARA EJECUCION MANUAL EN SUPABASE SQL EDITOR.
-- Este archivo contiene exclusivamente consultas SELECT.

-- A. Textos unicos empresa/obra usados en hallazgos_central.
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

-- B. Comparacion de textos contra empresas y obras ya existentes.
with hallazgos_texto as (
  select
    lower(regexp_replace(trim(coalesce(h.empresa, '')), '\s+', ' ', 'g')) as empresa_key,
    lower(regexp_replace(trim(coalesce(h.obra, '')), '\s+', ' ', 'g')) as obra_key,
    regexp_replace(trim(coalesce(h.empresa, '')), '\s+', ' ', 'g') as empresa_texto,
    regexp_replace(trim(coalesce(h.obra, '')), '\s+', ' ', 'g') as obra_texto,
    count(*) as hallazgos
  from public.hallazgos_central h
  group by
    lower(regexp_replace(trim(coalesce(h.empresa, '')), '\s+', ' ', 'g')),
    lower(regexp_replace(trim(coalesce(h.obra, '')), '\s+', ' ', 'g')),
    regexp_replace(trim(coalesce(h.empresa, '')), '\s+', ' ', 'g'),
    regexp_replace(trim(coalesce(h.obra, '')), '\s+', ' ', 'g')
),
empresas_match as (
  select
    lower(regexp_replace(trim(coalesce(e.nombre, '')), '\s+', ' ', 'g')) as empresa_key,
    array_agg(e.id order by e.nombre) as empresa_ids,
    array_agg(e.nombre order by e.nombre) as empresas_catalogo,
    count(*) as empresas_candidatas
  from public.empresas e
  group by lower(regexp_replace(trim(coalesce(e.nombre, '')), '\s+', ' ', 'g'))
),
obras_match as (
  select
    lower(regexp_replace(trim(coalesce(e.nombre, '')), '\s+', ' ', 'g')) as empresa_key,
    lower(regexp_replace(trim(coalesce(o.nombre, '')), '\s+', ' ', 'g')) as obra_key,
    array_agg(o.id order by o.nombre) as obra_ids,
    array_agg(o.nombre order by o.nombre) as obras_catalogo,
    count(*) as obras_candidatas
  from public.obras o
  join public.empresas e on e.id = o.empresa_id
  group by
    lower(regexp_replace(trim(coalesce(e.nombre, '')), '\s+', ' ', 'g')),
    lower(regexp_replace(trim(coalesce(o.nombre, '')), '\s+', ' ', 'g'))
)
select
  ht.empresa_texto,
  em.empresa_ids,
  em.empresas_catalogo,
  em.empresas_candidatas,
  ht.obra_texto,
  om.obra_ids,
  om.obras_catalogo,
  om.obras_candidatas,
  ht.hallazgos
from hallazgos_texto ht
left join empresas_match em on em.empresa_key = ht.empresa_key
left join obras_match om on om.empresa_key = ht.empresa_key
  and om.obra_key = ht.obra_key
order by ht.hallazgos desc, ht.empresa_texto, ht.obra_texto;

-- C. Empresas escritas en hallazgos sin match en public.empresas.
with hallazgos_empresas as (
  select
    lower(regexp_replace(trim(coalesce(h.empresa, '')), '\s+', ' ', 'g')) as empresa_key,
    regexp_replace(trim(coalesce(h.empresa, '')), '\s+', ' ', 'g') as empresa_texto,
    count(*) as hallazgos
  from public.hallazgos_central h
  group by
    lower(regexp_replace(trim(coalesce(h.empresa, '')), '\s+', ' ', 'g')),
    regexp_replace(trim(coalesce(h.empresa, '')), '\s+', ' ', 'g')
)
select
  he.empresa_texto,
  he.hallazgos
from hallazgos_empresas he
where he.empresa_key <> ''
  and not exists (
    select 1
    from public.empresas e
    where lower(regexp_replace(trim(coalesce(e.nombre, '')), '\s+', ' ', 'g')) = he.empresa_key
  )
order by he.hallazgos desc, he.empresa_texto;

-- D. Obras escritas en hallazgos sin match en public.obras para su empresa.
with hallazgos_obras as (
  select
    lower(regexp_replace(trim(coalesce(h.empresa, '')), '\s+', ' ', 'g')) as empresa_key,
    lower(regexp_replace(trim(coalesce(h.obra, '')), '\s+', ' ', 'g')) as obra_key,
    regexp_replace(trim(coalesce(h.empresa, '')), '\s+', ' ', 'g') as empresa_texto,
    regexp_replace(trim(coalesce(h.obra, '')), '\s+', ' ', 'g') as obra_texto,
    count(*) as hallazgos
  from public.hallazgos_central h
  group by
    lower(regexp_replace(trim(coalesce(h.empresa, '')), '\s+', ' ', 'g')),
    lower(regexp_replace(trim(coalesce(h.obra, '')), '\s+', ' ', 'g')),
    regexp_replace(trim(coalesce(h.empresa, '')), '\s+', ' ', 'g'),
    regexp_replace(trim(coalesce(h.obra, '')), '\s+', ' ', 'g')
)
select
  ho.empresa_texto,
  ho.obra_texto,
  ho.hallazgos
from hallazgos_obras ho
where ho.empresa_key <> ''
  and ho.obra_key <> ''
  and not exists (
    select 1
    from public.obras o
    join public.empresas e on e.id = o.empresa_id
    where lower(regexp_replace(trim(coalesce(e.nombre, '')), '\s+', ' ', 'g')) = ho.empresa_key
      and lower(regexp_replace(trim(coalesce(o.nombre, '')), '\s+', ' ', 'g')) = ho.obra_key
  )
order by ho.hallazgos desc, ho.empresa_texto, ho.obra_texto;

-- E. Filas que ya tienen UUID.
select
  count(*) as hallazgos_con_empresa_id
from public.hallazgos_central
where empresa_id is not null;

select
  count(*) as hallazgos_con_obra_id
from public.hallazgos_central
where obra_id is not null;

select
  codigo,
  empresa,
  obra,
  empresa_id,
  obra_id
from public.hallazgos_central
where empresa_id is not null
   or obra_id is not null
order by codigo;

-- F. Filas pendientes de UUID.
select
  count(*) as hallazgos_sin_empresa_id
from public.hallazgos_central
where empresa_id is null;

select
  count(*) as hallazgos_sin_obra_id
from public.hallazgos_central
where obra_id is null;

select
  codigo,
  empresa,
  obra,
  empresa_id,
  obra_id
from public.hallazgos_central
where empresa_id is null
   or obra_id is null
order by codigo;

-- G. Conteo total de seguridad.
select
  count(*) as total_hallazgos,
  count(*) filter (where empresa_id is not null) as con_empresa_id,
  count(*) filter (where empresa_id is null) as sin_empresa_id,
  count(*) filter (where obra_id is not null) as con_obra_id,
  count(*) filter (where obra_id is null) as sin_obra_id
from public.hallazgos_central;

-- H. Simulacion de resultado esperado por match actual.
with empresas_candidatas as (
  select
    lower(regexp_replace(trim(coalesce(nombre, '')), '\s+', ' ', 'g')) as empresa_key,
    (array_agg(id order by id::text))[1] as empresa_id_preview,
    count(*) as empresas_candidatas
  from public.empresas
  group by lower(regexp_replace(trim(coalesce(nombre, '')), '\s+', ' ', 'g'))
),
obras_candidatas as (
  select
    lower(regexp_replace(trim(coalesce(e.nombre, '')), '\s+', ' ', 'g')) as empresa_key,
    lower(regexp_replace(trim(coalesce(o.nombre, '')), '\s+', ' ', 'g')) as obra_key,
    (array_agg(o.id order by o.id::text))[1] as obra_id_preview,
    count(*) as obras_candidatas
  from public.obras o
  join public.empresas e on e.id = o.empresa_id
  group by
    lower(regexp_replace(trim(coalesce(e.nombre, '')), '\s+', ' ', 'g')),
    lower(regexp_replace(trim(coalesce(o.nombre, '')), '\s+', ' ', 'g'))
),
hallazgos_match as (
  select
    h.id,
    h.empresa_id,
    h.obra_id,
    case
      when ec.empresas_candidatas = 1 then ec.empresa_id_preview
      else null
    end as empresa_id_preview,
    case
      when ec.empresas_candidatas = 1 and oc.obras_candidatas = 1 then oc.obra_id_preview
      else null
    end as obra_id_preview
  from public.hallazgos_central h
  left join empresas_candidatas ec
    on ec.empresa_key = lower(regexp_replace(trim(coalesce(h.empresa, '')), '\s+', ' ', 'g'))
  left join obras_candidatas oc
    on oc.empresa_key = lower(regexp_replace(trim(coalesce(h.empresa, '')), '\s+', ' ', 'g'))
   and oc.obra_key = lower(regexp_replace(trim(coalesce(h.obra, '')), '\s+', ' ', 'g'))
)
select
  count(*) as total_hallazgos,
  count(*) filter (where empresa_id is not null) as ya_con_empresa_id,
  count(*) filter (where empresa_id is null and empresa_id_preview is not null) as quedarian_con_empresa_id,
  count(*) filter (where empresa_id is null and empresa_id_preview is null) as quedarian_sin_empresa_id,
  count(*) filter (where obra_id is not null) as ya_con_obra_id,
  count(*) filter (where obra_id is null and obra_id_preview is not null) as quedarian_con_obra_id,
  count(*) filter (where obra_id is null and obra_id_preview is null) as quedarian_sin_obra_id,
  count(*) filter (
    where empresa_id_preview is null
       or obra_id_preview is null
  ) as pendientes_revision_manual
from hallazgos_match;

-- I. Ambiguedades por nombres normalizados en catalogos.
select
  lower(regexp_replace(trim(coalesce(nombre, '')), '\s+', ' ', 'g')) as empresa_key,
  array_agg(id order by nombre) as empresa_ids,
  array_agg(nombre order by nombre) as empresas,
  count(*) as candidatas
from public.empresas
group by lower(regexp_replace(trim(coalesce(nombre, '')), '\s+', ' ', 'g'))
having count(*) > 1
order by candidatas desc, empresa_key;

select
  e.nombre as empresa,
  lower(regexp_replace(trim(coalesce(o.nombre, '')), '\s+', ' ', 'g')) as obra_key,
  array_agg(o.id order by o.nombre) as obra_ids,
  array_agg(o.nombre order by o.nombre) as obras,
  count(*) as candidatas
from public.obras o
join public.empresas e on e.id = o.empresa_id
group by e.nombre, lower(regexp_replace(trim(coalesce(o.nombre, '')), '\s+', ' ', 'g'))
having count(*) > 1
order by candidatas desc, empresa, obra_key;
