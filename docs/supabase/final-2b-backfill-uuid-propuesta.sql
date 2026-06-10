-- FASE FINAL-2B - BACKFILL UUID MULTIEMPRESA.
-- PROPUESTA PREPARADA / NO EJECUTAR AUTOMATICAMENTE.
--
-- Requisitos previos:
-- - Ejecutar y validar primero final-2b-modelo-base-sin-rls.sql.
-- - Confirmar entorno correcto.
-- - Confirmar respaldo/export de datos.
-- - Confirmar que RLS sigue desactivado.
--
-- Protecciones:
-- - NO activa RLS.
-- - NO crea policies.
-- - NO toca Storage.
-- - NO borra registros.
-- - NO elimina columnas texto historicas.
-- - NO modifica evidencias.
-- - Mantiene snapshot texto empresa/obra/siglas.

-- ==================================================
-- PASO 1: inspeccion previa
-- ==================================================

-- Empresas distintas detectadas por texto.
select
  trim(empresa) as empresa_texto,
  count(*) as hallazgos
from public.hallazgos_central
where nullif(trim(coalesce(empresa, '')), '') is not null
group by trim(empresa)
order by hallazgos desc, empresa_texto;

-- Obras distintas detectadas por empresa + obra.
select
  trim(empresa) as empresa_texto,
  trim(obra) as obra_texto,
  count(*) as hallazgos
from public.hallazgos_central
where nullif(trim(coalesce(empresa, '')), '') is not null
  and nullif(trim(coalesce(obra, '')), '') is not null
group by trim(empresa), trim(obra)
order by empresa_texto, hallazgos desc, obra_texto;

-- Posibles duplicados por mayusculas/minusculas/espacios.
select
  lower(regexp_replace(trim(empresa), '\s+', ' ', 'g')) as empresa_normalizada,
  array_agg(distinct trim(empresa) order by trim(empresa)) as variantes,
  count(*) as hallazgos
from public.hallazgos_central
where nullif(trim(coalesce(empresa, '')), '') is not null
group by lower(regexp_replace(trim(empresa), '\s+', ' ', 'g'))
having count(distinct trim(empresa)) > 1
order by hallazgos desc;

select
  lower(regexp_replace(trim(empresa), '\s+', ' ', 'g')) as empresa_normalizada,
  lower(regexp_replace(trim(obra), '\s+', ' ', 'g')) as obra_normalizada,
  array_agg(distinct trim(obra) order by trim(obra)) as variantes_obra,
  count(*) as hallazgos
from public.hallazgos_central
where nullif(trim(coalesce(empresa, '')), '') is not null
  and nullif(trim(coalesce(obra, '')), '') is not null
group by
  lower(regexp_replace(trim(empresa), '\s+', ' ', 'g')),
  lower(regexp_replace(trim(obra), '\s+', ' ', 'g'))
having count(distinct trim(obra)) > 1
order by hallazgos desc;

-- Registros sin empresa/obra usable.
select
  count(*) as hallazgos_sin_empresa_texto
from public.hallazgos_central
where nullif(trim(coalesce(empresa, '')), '') is null;

select
  count(*) as hallazgos_sin_obra_texto
from public.hallazgos_central
where nullif(trim(coalesce(obra, '')), '') is null;

-- ==================================================
-- PASO 2: creacion controlada de empresas y obras
-- ==================================================

-- Ejecutar solo despues de revisar los resultados de inspeccion.
-- Normaliza espacios para reducir duplicados por captura manual.

insert into public.empresas (nombre, sigla, estado)
select
  empresa_limpia as nombre,
  upper(left(regexp_replace(empresa_limpia, '[^[:alnum:]]+', '', 'g'), 12)) as sigla,
  'activa' as estado
from (
  select distinct regexp_replace(trim(empresa), '\s+', ' ', 'g') as empresa_limpia
  from public.hallazgos_central
  where nullif(trim(coalesce(empresa, '')), '') is not null
) empresas_detectadas
on conflict (nombre) do update
set sigla = coalesce(public.empresas.sigla, excluded.sigla),
    estado = coalesce(public.empresas.estado, excluded.estado);

insert into public.obras (empresa_id, nombre, sigla, estado)
select
  e.id as empresa_id,
  obras_detectadas.obra_limpia as nombre,
  upper(left(regexp_replace(obras_detectadas.obra_limpia, '[^[:alnum:]]+', '', 'g'), 12)) as sigla,
  'activa' as estado
from (
  select distinct
    regexp_replace(trim(empresa), '\s+', ' ', 'g') as empresa_limpia,
    regexp_replace(trim(obra), '\s+', ' ', 'g') as obra_limpia
  from public.hallazgos_central
  where nullif(trim(coalesce(empresa, '')), '') is not null
    and nullif(trim(coalesce(obra, '')), '') is not null
) obras_detectadas
join public.empresas e on e.nombre = obras_detectadas.empresa_limpia
on conflict (empresa_id, nombre) do update
set sigla = coalesce(public.obras.sigla, excluded.sigla),
    estado = coalesce(public.obras.estado, excluded.estado);

-- ==================================================
-- PASO 3: backfill de UUIDs en hallazgos_central
-- ==================================================

-- Poblar empresa_id sin tocar el texto historico empresa.
update public.hallazgos_central h
set empresa_id = e.id
from public.empresas e
where h.empresa_id is null
  and e.nombre = regexp_replace(trim(h.empresa), '\s+', ' ', 'g');

-- Poblar obra_id sin tocar el texto historico obra.
update public.hallazgos_central h
set obra_id = o.id
from public.obras o
where h.obra_id is null
  and h.empresa_id = o.empresa_id
  and o.nombre = regexp_replace(trim(h.obra), '\s+', ' ', 'g');

-- Opcional posterior: poblar supervisor_user_id/reportante_user_id desde
-- profiles solo cuando existan usuarios reales y mapeo confiable por email.
-- No ejecutar si hay reportantes con emails duplicados o ausentes.
--
-- update public.hallazgos_central h
-- set supervisor_user_id = p.id,
--     reportante_user_id = p.id
-- from public.profiles p
-- where h.supervisor_user_id is null
--   and h.reportante_email is not null
--   and lower(trim(h.reportante_email)) = lower(trim(p.email));

-- ==================================================
-- PASO 4: validaciones despues del backfill
-- ==================================================

select
  count(*) as total_hallazgos,
  count(*) filter (where empresa_id is not null) as con_empresa_id,
  count(*) filter (where empresa_id is null) as sin_empresa_id,
  count(*) filter (where obra_id is not null) as con_obra_id,
  count(*) filter (where obra_id is null) as sin_obra_id
from public.hallazgos_central;

select
  h.empresa,
  h.obra,
  count(*) as sin_uuid
from public.hallazgos_central h
where h.empresa_id is null
   or h.obra_id is null
group by h.empresa, h.obra
order by sin_uuid desc, h.empresa, h.obra;

select
  e.nombre as empresa,
  o.nombre as obra,
  count(h.id) as hallazgos
from public.hallazgos_central h
join public.empresas e on e.id = h.empresa_id
left join public.obras o on o.id = h.obra_id
group by e.nombre, o.nombre
order by hallazgos desc, e.nombre, o.nombre;

select
  h.codigo,
  h.empresa as empresa_snapshot,
  e.nombre as empresa_uuid,
  h.obra as obra_snapshot,
  o.nombre as obra_uuid
from public.hallazgos_central h
left join public.empresas e on e.id = h.empresa_id
left join public.obras o on o.id = h.obra_id
order by h.created_at desc nulls last
limit 50;

-- ==================================================
-- PASO 5: rollback logico si aplica
-- ==================================================

-- No borrar empresas, obras ni hallazgos como rollback inicial.
-- Si el mapeo queda incorrecto, el rollback logico seguro es limpiar solo los
-- UUIDs poblados para repetir el backfill despues de corregir nombres.
-- Ejecutar solo con autorizacion explicita.
--
-- update public.hallazgos_central
-- set empresa_id = null,
--     obra_id = null
-- where empresa_id is not null
--    or obra_id is not null;

