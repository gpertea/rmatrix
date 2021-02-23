import { createContext, useContext, useState } from "react";
import allData from '../all_data.json';

export const dtaXTypes=[ 'RNA-seq', 'DNA methylation', 'long read RNA-seq', 'scRNA-seq', 'micro RNA-seq',
  'WGS', 'ATAC-seq' ];

export var selXType = 0; //currently targeted experiment/assay type 

export const dtaRaceIdx={ "AA":1, "AS":2, "CAUC":3, "HISP":4, "Other":5 };
export const dtaRace = [ 'race', "AA", "AS", "CAUC", "HISP", "Other" ];
export const dtaSexIdx={ "F":1, "M":2 };
export const dtaSex = [ 'sex', "F", "M" ];

export const dtaDx   = ['dx' ]; //push allData.dx names
export const dtaDSet = ['dset']; //push allData.dset names and public flag
export const dtaReg  = ['reg']; // push allData.regions names
export const dtaAge = ['age', 'fetal', '0-12','13-18','19-35', '36-54', '55-74', '75+']; //push age range labels corresponding to dtaAgeRanges
const AGE_LAST_RANGE = 75
export const dtaAgeRanges = [[-0.1], [0,12.9], [13,18.9],[19,35.9], [36,54.9], [55,74.9], [AGE_LAST_RANGE] ]; //all pre-defined age ranges
export const dtaXd = [  ]; //push allData.sdata rows, samples w/metadata for all experiment types

/*-------- 1st tier (directly fetched) -----
dtaXd : array of arrays of experiment metadata (samples), one array of rows for each experiment type
   dtaXd[0] : RNASeq sample data  [           
      [sample_id, ds-code, dx-code, race, sex, age, reg-code],
       ...
     ]
  dtaXd[1] : DNA methylation samples = [ 
      [sample_id, ds-code, dx-code, race, sex, age, reg-code],
      ... 
    ]
  dtaRaceIdx={ "AA":1, "AS":2, "CAUC":3, "HISP":4, "Other":5 } //key for the dtaRace array order
  dtaRace = [ 'race', "AA", "AS", "CAUC", "HISP", "Other" ]
  dtaSexIdx={ "F":1, "M":2 } 
  dtaSex=['sex', 'F', 'M']
  dtaDx  : array of dx names, dtaDx[0]='dx' followed by dtaDx[dx-code]="dx-name"
  dtaDSet : array of dataset names and public flag, dtaDSet[0]='dset' and dtaDSet[ds-code]=["ds-name", isPublic]
  dtaReg : array of region names dtaReg[0]='reg' and dtaDSet[reg-code]="reg-name"
  
 --------  2nd tier (dynamic, filter inter-dependent experiment counts) ---
  dtXd : has the dtaXd[selXType] samples data that passed the filters!
  dtnDx : counts per Dx, an array of Dx counts for the current selXType experiment type, 
         same order as entries in dtaDx, with the first element [0] being the total
    dtnDx = num samples per Dx counts: [ total, num-w-dx-code-1, num-w-dx-code-2, ...]
    ...
  dtnDSet : counts per dataset - an array of dataset counts for selXType
             dtnDSet = [ total, num-w-ds-code-1, num-w-ds-code-2, etc.] (same order as in  dtaDSet)
  dtnRace  : counts per race - each row is an object for the experiment types, with race as keys and values
            dtnRace = { "AA": num_AA, "CAUC":num_CAUC, ... }
  dtnSex   : counts per gender, an array of 2 values for the current experiment type
      dtnSex = [total, F-counts, M-counts, Other-counts]
  dtnAge  : counts per age interval sets as defined in dtfAge
  dtnReg  : counts per region, for the currently selected experiment type
     dtnReg = [ total, num-w-reg-code-1, num-w-reg-code-2, ...] 
*/

export const dtXd = []; //all samples data for the current experiment type as filtered with the dtf* filters
//-- dynamically updated COUNTS (depending on the filters):
//-- counts for the currently targeted experiment type (selXType), for all categories
// in most of these arrays, element [0] has the total count, same for all when all filters are applied
export const dtnDx = []; 
export const dtnDSet = [];
export const dtnRace = []; 
export const dtnAge = []; //total, counts for each age range in dtaAgeRanges
export const dtnSex = []; //[total, F-counts, M-counts]
export const dtnReg = []; //counts for each regions, according to applied filters 
//---
/*  ------- filters reflect the selections in various FltMList ----
  Filters are generally sets of indexes (-codes) in the various dta* arrays, except for Age, Race and Sex filters
   dtfDx : Set[ dx-code-1, dx-code-2, ...] 
   dtfDset : Set[ ds-code-1, ds-code-2, ... ]
   dtfRace : [ "AA", "CAUC", ...]
   dtfSex :  '', 'F'  or 'M' 
   dtfAge : [ [a1, a2], [a3, a4] .. ] set of age ranges
*/// -- filters, always dynamic, for the currently selected experiment type
export const dtfDx = new Set(); 
//export const dtfPublicStatus=0; //1 = public-only, 2 = restricted only
export const dtfDSet = new Set();
export const dtfRace = new Set(); //set of race literals ("AA", "CAUC" etc.)
export const dtfSex = ''; //can be only '', 'M' or 'F'
export const dtfAge = new Set(); // set of selected indexes in dtaAgeRanges (1-based)
//=======================
/*
const dtaRegion = [{"id":1,"name":"Amygdala","num":548}, 
  {"id":2,"name":"BasoAmyg","num":318}, 
  {"id":3,"name":"Caudate","num":464}, 
  {"id":4,"name":"dACC","num":322}, 
  {"id":5,"name":"DentateGyrus","num":263}, 
  {"id":6,"name":"DLPFC","num":1599}, 
  {"id":7,"name":"Habenula","num":69}, 
  {"id":8,"name":"HIPPO","num":539}, 
  {"id":9,"name":"MedialAmyg","num":322}, 
  {"id":10,"name":"mPFC","num":297}, 
  {"id":11,"name":"NAc","num":235}, 
  {"id":12,"name":"sACC","num":560}
];
*/
export function fetchData() {
    //we can use axios or whatever to fetch and/or adjust the data here
    //in the object allData
    console.log("allData fetched");
    allData.regions.forEach( function(it) {
      if (dtaReg.length!==it[0]) console.log("Error: mismatch region index in dtaReg!");
       dtaReg.push(it[1]);
    });
    allData.datasets.forEach( function(it) {
      if (dtaDSet.length!==it[0]) console.log("Error: mismatch dataset index in dtaReg!");
       dtaDSet.push( [it[1], it[2] ]);
    });
    allData.dx.forEach( function(it) {
      if (dtaDx.length!==it[0]) console.log("Error: mismatch dx index in dtaReg!");
       dtaDx.push( it[1] );
    });

    allData.sdata.forEach( function(it) {
       dtaXd.push( it );
    });
    // free memory
    allData=null;
    selXType=0
    updateCounts();

    // returns the selected experiment type for filter counts display
    return [selXType, dtXd, dtnReg, dtnDx, dtnDSet, dtnRace, dtnSex, dtnAge ];
}

function ageWithin(a) {
  //TODO: implement age check in all dtaAgeRanges[ each dtfAge[] ] 
  //special cases when only one value in range array!
  for (let i=0;i<dtfAge.length;++i) {
    let ar=dtaAgeRanges[dtfAge[i]];
    if (ar.length===1) {
      if (a<0 && ar[0]<0) return true;
      if (ar[0]>0 && a>=ar[0]) return true;
      continue;
    }
    if (a>=ar[0] && a<=ar[1]) return true;
  }
  return false;
}

function age2RangeIdx(a) { //age is converted in a 1-based index into a dtaAge label index
  if (a<0) return 1; //fetal
  let len=dtaAgeRanges.length;
  if (a>=75) return len;
  --len;
  for (let i=1;i<len;++i) {
    let ar=dtaAgeRanges[i];
    if (a>=ar[0] && a<=ar[1]) return i+1;
  }
  return 0;
}

export function updateCounts() {
   //fills all dtn* arrays according to the dtf* filters, from dtaXd[selXType]
   dtXd.length=0; //will populate
   let z=dtnDx.length; while(--z>=0) dtnDx[z]=0;
   z=dtnDSet.length; while(--z>=0) dtnDSet[z]=0;
   z=dtnRace.length; while(--z>=0) dtnRace[z]=0;
   z=dtnSex.length;while(--z>=0) dtnSex[z]=0;
   z=dtnAge.length;while(--z>=0) dtnAge[z]=0;
   z=dtnReg.length;while(--z>=0) dtnReg[z]=0;
   const aXd=dtaXd[selXType];
   if (!aXd) return;
   const len=aXd.length;
   for (let i=0;i<len;++i) {
      const [sid, d, dx, r, s, a, rg] = aXd[i];
      if (!(dtfDx.size && dtfDx.has(dx))) continue;
      if (!(dtfRace.size && dtfRace.has(r))) continue;
      if (!(dtfSex.size && dtfSex===s)) continue;
      if (!(dtfDSet.size && dtfDSet.has(d))) continue;
      //TODO: implement public/restricted dataset filter?
      let ax=0;
      if (!dtfAge.size) {
        ax=age2RangeIdx(rg);
        if (dtfAge.has(ax)) continue;
      }
      if (ax===0) {
        ax=age2RangeIdx(rg);
      }
      if (ax===0) console.log("Error: could not get an age range index from "+ax);
      dtnAge[ax]++;dtnAge[0]++;
      dtnRace[dtaRaceIdx[r]]++; dtnRace[0]++;
      dtnSex[dtaSexIdx[s]]++; dtnSex[0]++;
      dtnDx[dx]++;dtnDx[0]++;
      dtnReg[rg]++;dtnReg[0]++;
      dtnDSet[d]++;dtnDSet[0]++;
      dtXd.push([sid, d, dx, r, s, a, rg]);
   }
   
}

const RDataCtx = createContext();
const RDataUpdateCtx = createContext();

export function useRData() {  return useContext(RDataCtx) }
export function useRDataUpdate() {  return useContext(RDataUpdateCtx) }

export function RDataProvider( {children} ) {
  //rData is [dtaXtypes, dtaRegion]
  const [rData, setRData] = useState(() => fetchData())
  
  function updateRData(rd) { setRData(rd)  }
  
  return (
    <RDataCtx.Provider value={rData}>
      <RDataUpdateCtx.Provider value={updateRData}>
      {children}
      </RDataUpdateCtx.Provider>
    </RDataCtx.Provider>
  );
};

