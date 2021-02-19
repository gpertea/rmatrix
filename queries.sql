--- tab delimited data -- use pullsql
WITH w as (SELECT enumsortorder as id, enumlabel AS dx
  FROM pg_enum e
  JOIN pg_type t ON e.enumtypid = t.oid
  WHERE t.typname = 'subjdx')
 SELECT sample_id as id, dataset_id as dset,
       w.id , p.race, p.sex, TRUNC(p.age::NUMERIC, 1) as age, s.r_id as reg 
       FROM  exp_rnaseq x, samples s, subjects p, w
  WHERE s_id=s.id AND s.subj_id=p.id AND p.dx::text=w.dx

-- Dx table
SELECT enumsortorder as id, enumlabel AS dx
  FROM pg_enum e
  JOIN pg_type t ON e.enumtypid = t.oid
  WHERE t.typname = 'subjdx'

-- datasets
SELECT id, name, public from DATASETS ORDER BY id

-- regions
SELECT id, name, INITCAP(fullname) from regions ORDER BY ID

-- get the json data for React (RNASeq only):
------ large samples table with numeric IDs for dx, region, dataset
WITH w as (SELECT enumsortorder as id, enumlabel AS dx
  FROM pg_enum e
  JOIN pg_type t ON e.enumtypid = t.oid
  WHERE t.typname = 'subjdx')
 SELECT json_agg(j) FROM (SELECT sample_id as id, dataset_id as dset,
       w.id , p.race, p.sex, TRUNC(p.age::NUMERIC, 1) as age, s.r_id as reg 
       FROM  exp_rnaseq x, samples s, subjects p, w
  WHERE s_id=s.id AND s.subj_id=p.id AND p.dx::text=w.dx) j

-- Dx table
select json_agg(j) from (SELECT enumsortorder as id, enumlabel AS dx
  FROM pg_enum e
  JOIN pg_type t ON e.enumtypid = t.oid
  WHERE t.typname = 'subjdx' ) j

-- datasets
SELECT json_agg(j) FROM (SELECT id, name from DATASETS order by ID) j

-- regions
SELECT json_agg(j) FROM (SELECT id, name, INITCAP(fullname) FROM regions ORDER BY id) j

-- or if we want the above as arrays of arrays
