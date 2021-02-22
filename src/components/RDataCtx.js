import { createContext, useContext, useState } from "react";
import allData from '../all_data.json';

export const dtaXTypes=[ 'RNA-seq', 'DNA methylation', 'long read RNA-seq', 'scRNA-seq', 'micro RNA-seq',
  'WGS', 'ATAC-seq' ];

export var selXType = 0; //currently targeted experiment/assay type 

export const dtaRaceIdx={ "AA":1, "AS":2, "CAUC":3, "HISP":4, "Other":5 };
export const dtaRace = [ 'race', "AA", "AS", "CAUC", "HISP", "Other" ];
export const dtaSexIdx={ "F":1, "M":2 };
export const dtaSex = [ 'sex', "F", "M" ];

export const dtaDx   = ['dx' ]; //push allData.dx items
export const dtaDSet = ['dset']; //push allData.dset items
export const dtaReg  = ['reg']; // push allData.regions items
export const dtaXd = [  ]; //push allData.sdata items

/*
-------- 1st tier (directly fetched) -----
dtaDx  : array of dx names, dtaDx[0]='dx' followed by dtaDx[dx-code]="dx-name"
dtaDSet : array of dataset names and public flag, dtaDSet[0]='dset' and dtaDSet[ds-code]=["ds-name", isPublic]
dtaReg : array of region names dtaReg[0]='reg' and dtaDSet[reg-code]="reg-name"
dtaXd : array of arrays of experiment metadata (samples), one array of rows for each experiment type
   dtaXd[0] : RNASeq sample data  [           
      [sample_id, ds-code, dx-code, race, sex, age, reg-code],
       ...
     ]
  dtaXd[1] : DNA methylation samples = [ 
      [sample_id, ds-code, dx-code, race, sex, age, reg-code],
      ... 
    ]
  dtaRaceIdx={ "AA":1, "AS":2, "CAUC":3, "HISP":4, "Other":5 }
  dtaRace = [ 'race', "AA", "AS", "CAUC", "HISP", "Other" ]
 dtaRaceIdx["AA"]=1, dtaRace["CAUC"]=2 .. key for the dtaRace array order
--------  2nd tier (dynamic, filter inter-dependent experiment counts) ---

  dtnDx : counts per Dx, an array of Dx counts for the current selXType experiment type, 
         same order as entries in dtaDx, with the first element [0] being the total
    dtnDx = num samples per Dx counts: [ total, num-w-dx-code-1, num-w-dx-code-2, ...]
    ...
  dtnDSet : counts per dataset - an array of dataset counts for selXType
             dtnDSet = [ total, num-w-ds-code-1, num-w-ds-code-2, etc.] (same order as in  dtaDSet)
  dtnRace  : counts per race - each row is an object for the experiment types, with race as keys and values
            dtnRace = { "AA": num_AA, "CAUC":num_CAUC, ... }
  dtnSex   : counts per gender, an array of 2 values for the current experiment type
      dtnSex = [F-counts, M-counts]
  dtnAge  : counts per age interval sets as defined in dtfAge
  dtnReg  : counts per region, for the currently selected experiment type
     dtnReg = [ total, num-w-reg-code-1, num-w-reg-code-2, ...] 

  ------- filters reflect the selections in various FltMList ----
  Filters are arrays of indexes (-codes) in the various dta* arrays, except for Age, Race and Sex filters
   dtfDx : [ dx-code-1, dx-code-2, ...] (empty array means no filter)
   dtfDset : [ ds-code-1, ds-code-2, ... ]
   dtfRace : [ "AA", "CAUC", ...]
   dtfSex : [ "M" ] or [ "F"] 
   dtfAge : [ [a1, a2], [a3, a4] .. ] set of age ranges
*/

//-- dynamically updated counts (depending on the filters):
// counts for the currently targeted experiment type (selXType)
export const dtnDx = [];
export const dtnDSet = [];
export const dtnRace = [];
export const dtnSex = [];
export const dtnAge = [];
export const dtnReg = [];

// -- filters (always dynamic)
export const dtfDx = [];
export const dtfDSet = [];
export const dtfRace = [];
export const dtfSex = [];
export const dtfAge = [];

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
    return [selXType, dtnReg, dtnDx, dtnDSet, dtnRace, dtnSex, dtnAge ];
 
}

export function updateCounts() {
   //fills all dtn* arrays according to the dtf* filters, from dtaXd[selXType]

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

