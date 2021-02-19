#!/bin/bash

pullsql -b rse << 'EOT' > regions.tab
SELECT id, name, INITCAP(fullname) FROM regions ORDER BY id
EOT

pullsql -b rse << 'EOT' > datasets.tab
SELECT id, name, public FROM datasets ORDER BY id
EOT

pullsql -b rse << 'EOT' > dx.tab
SELECT enumsortorder as id, enumlabel AS dx
  FROM pg_enum e
  JOIN pg_type t ON e.enumtypid = t.oid
  WHERE t.typname = 'subjdx'
EOT

pullsql -b rse << 'EOT' > samples.tab
WITH w as (SELECT enumsortorder as id, enumlabel AS dx
  FROM pg_enum e
  JOIN pg_type t ON e.enumtypid = t.oid
  WHERE t.typname = 'subjdx')
 SELECT sample_id as id, dataset_id as dset,
       w.id , p.race, p.sex, TRUNC(p.age::NUMERIC, 1) as age, s.r_id as reg 
       FROM  exp_rnaseq x, samples s, subjects p, w
  WHERE s_id=s.id AND s.subj_id=p.id AND p.dx::text=w.dx
EOT

