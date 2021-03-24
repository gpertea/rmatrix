import { createContext, useContext, useState, useRef, useEffect } from "react";
//import allData from '../all_data.json';

export const dtaXTypes=[ 'RNA-seq', 'DNA methylation', 'long read RNA-seq', 'scRNA-seq', 'micro RNA-seq',
  'WGS', 'ATAC-seq' ];

export const rGlobs={
     selXType : 0, //currently targeted experiment/assay type 
     rebuildRMatrix: true
};

//export const dtaRaceIdx={ "AA":1, "AS":2, "CAUC":3, "HISP":4, "Other":5 };
//export const dtaSexIdx={ "F":1, "M":2 };
export const AGE_LAST_RANGE = 60;
//export const dtaAgeRanges = [[-0.1], [0,12.9], [13,18.9],[19,35.9], [36,54.9], [55,74.9], [AGE_LAST_RANGE] ]; //all pre-defined age ranges

export const mxMaxVal = 546;

//WARNING: the name index in each of reg, dx, dset arrays MUST 
//match the numeric values in the dtaXall columns !
export const dtaNames = { 
    reg : ['reg'], // push allData.regions names, index MUST match their IDs
    dx : ['dx' ], //push allData.dx names, index MUST match their IDs in the dtaXd[x] arr rows
    dset: [ 'dset' ], //push allData.dset names 
    dsetp: ['dsetp'], //push allData.dset public flag + 1 (so this will only have 1s and 2s)
    dspub: [ 'dspub', 'restricted', 'public'],
    dspubIdx: { "restricted":1, 'public': 2 }, 
    race : [ 'race', "AA", "AS", "CAUC", "HISP", "Other" ],
    raceIdx : { "AA":1, "AS":2, "CAUC":3, "HISP":4, "Other":5 },
    sex : [ 'sex', "F", "M" ],
    sexIdx : { "F":1, "M":2 },
    age: ['age', 'fetal', '0-1','1-10','11-19', '20-39', '40-59', '60+'], 
    ageRanges: [[-0.1], [0,0.9], [1,10.9],[11,19.9], [20,39.9], [40,59.9], [AGE_LAST_RANGE] ]
};
/*
dtaNames.dx  : array of dx names, dtaDx[0]='dx' followed by dtaDx[dx-code]="dx-name"
dtaNames.dset : array of dataset names  dtaDSet[0]='dset' and dtaDSet[ds-code]="ds-name"
dtaNames.dsetp : array of dataset names public flags dtaDSet[0]='dsetp' then dtaDSet[ds-code]=1 or 1
dtaNames.dspub: ['dspub', 'restricted', 'public']
dtaNames.reg : array of region names dtaReg[0]='reg' and dtaDSet[reg-code]="reg-name"
*/


//fetched allData.sdata arrays, i.e. samples w/metadata 
// for ALL experiment types is loaded here:
export const dtaXall = [  ]; 
/*-------- 1st tier (directly fetched) -----
dtaXall : array of arrays of experiment metadata (samples), one array of rows for each experiment type
   dtaXall[0] : RNASeq sample data  [           
      [sample_id, ds-code, dx-code, race, sex, age, reg-code],
       ...
     ]
  dtaXall[1] : DNA methylation samples = [ 
      [sample_id, ds-code, dx-code, race, sex, age, reg-code],
      ... 
    ]
  
 --------  2nd tier (dynamic, filter-dependent sample counts) ---
 dtXd : has the dtaXall[selXType] sample data for samples that passed the filters!

  dtnDx : counts per Dx, an array of Dx counts for the current selXType experiment type, 
         same order as entries in dtaDx, with the first element [0] being the total
    dtnDx = num samples per Dx counts: [ total, num-w-dx-code-1, num-w-dx-code-2, ...]
    ...
  dtnDSet : counts per dataset - an array of dataset counts for selXType
             dtnDSet = [ 'dset', num-w-ds-code-1, num-w-ds-code-2, etc.] (same order as in  dtaDSet)
  dtnRace  : counts per race - each row is an object for the experiment types, with race as keys and values
            dtnRace = [ 'race', num_AA, num_CAUC, ... }
  dtnSex   : counts per gender, an array of 2 values for the current experiment type
      dtnSex = [total, F-counts, M-counts, Other-counts]
  dtnAge  : counts per age interval sets as defined in dtfAge
  dtnReg  : counts per region, for the currently selected experiment type
     dtnReg = [ total, num-w-reg-code-1, num-w-reg-code-2, ...] 
*/

export const dtXs = []; //a dynamic table with all experiment samples metadata (table) for the
    //current experiment type AFTER filtering with the current dtFilters

//-- dynamically updated COUNTS (depending on the filters):
//-- except for dtCounts.reg, the other are counts for the currently targeted
//   experiment type (selXType) for the specific category
//  dtCounts.reg has the region counts for ALL experiment types in the matrix!
export const dtCounts = {
   reg: [ ], //array of arrays (exp_types x regions)
    dx: ['dx'], 
  dset: ['dset'], 
  dspub: ['dspub'], //will push counts for restricted and then public datasets
  race: ['race'],
  age: ['age'], // will push counts for each age range in dtaAgeRanges
  sex: ['sex'] //+ F-counts, M-counts
}
//---
/*  ------- filters reflect the selections in various FltMList ----
  Filters are generally sets of indexes in the various dta* arrays, except for the sex filter
     .dx :  Set[ dx-code-1, dx-code-2, ...] 
   .dset :  Set[ ds-code-1, ds-code-2, ... ]
    .age :  [ age-range-idx-1, age-range-idx-2,  .. ] set of indexes in dtAgeRanges
   .race :  Set[ "AA", "CAUC", ...] 
    .sex :  '', 'F'  or 'M' 
*/// -- filters, always dynamic, for the currently selected experiment type
export const dtFilters = {
    dx: new Set(),
  dset: new Set(),
  dspub: new Set(), //for now it can only be [1] or [2]
   age: new Set(),
  race: new Set(), //this has a set of strings ("AA", "CAUC", ...)
   sex: '' //can only be 'F' or 'M'
}
//=======================

export function loadData(allData) {
    //after data was fetched in allData
    
    let nreg=dtaNames.reg;
    allData.regions.forEach( function(it) {
      if (nreg.length!==it[0]) console.log("Error: mismatch region index in data!");
      nreg.push(it[1]);
    });
    console.log("allData fetched:" + nreg);

    let ndx=dtaNames.dx;
    allData.dx.forEach( function(it) {
      if (ndx.length!==it[0]) console.log("Error: mismatch dx index in data!");
      ndx.push( it[1] );
    });
    let nds=dtaNames.dset;
    let ndsp=dtaNames.dsetp;
    allData.datasets.forEach( function(it) {
      if (nds.length!==it[0]) console.log("Error: mismatch dataset index in data!");
      nds.push( it[1] );
      ndsp.push( it[2]+1 ); //simply add public status value code +1  (1=restricted, 2=public)
    });

    allData.sdata.forEach( function(it) {
       dtaXall.push( it ); //collecting data for all sample types
    });

    // free memory from loaded/fetched JSON bulk data
    allData=null;
    rGlobs.selXType=0;

    //initialize counts : just push 0 
   ["dx", "dset", "dspub", "age", "sex", "race"].forEach (
    function (e) { 
      let dt=dtCounts[e], z=dtaNames[e].length;
      while(--z) dt.push(0);
      //console.log("dtCounts["+e+"] initialized to: "+ dtCounts[e] );
    });
    // dtCounts.reg is initialized differently, it is a matrix exp_types x regions
    //     each row holds all counts (for all experiment types) for a single region 
    let nr=dtaNames.reg.length-1;
    let rd=dtCounts.reg;
    let nxt=dtaXTypes.length;

    for (let i=0;i<nr;i++) {
        rd[i]=new Array(nxt).fill(0);
    }
    
    updateCounts();

    // returns [ the selected experiment type, list of samples for the current exp type,
    //   counts data (dtCounts.reg has the whole region matrix data!) ];
    rGlobs.rebuildRMatrix=true;
    return [ rGlobs.selXType, dtXs, dtCounts ];
}

/*function ageWithin(a) {
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
}*/
const dtaAgeRanges=dtaNames.ageRanges;

export function getFilterData(fid) {
  const fltNames=dtaNames[fid];
  const fltCounts=dtCounts[fid];
  //const fltSet=dtFilters[fid];
  if (!fltNames) 
     throw new Error(`Error: could not find data for filter name "${fid}"`);
  return [fltNames, fltCounts];
}

export function applyFilterData(fid, fArr) {
  const fltSet=dtFilters[fid];
  if (fltSet==null)
     throw new Error(`Error: cannot applyFilterData for "${fid}"`);
  //console.log(`Applying filter set for "${fid}": (${fArr})`);
  if (fid==='sex') {
    dtFilters.sex='';
    if (fArr.length===1)  {
       dtFilters.sex=dtaNames.sex[fArr[0]];
      }
    else if (fArr.length>1) 
      throw new Error(`Error: invalid filter set for "${fid}" (${fArr})`);
  } else { //all other filters have sets
    fltSet.clear();
    if (fid==='race') {
        let dRace=dtaNames.race;
        fArr.forEach ( o => fltSet.add(dRace[o]) );
      }
      else 
        fArr.forEach ( o => fltSet.add(o) );
  }
  updateCounts();
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

const dtaRaceIdx=dtaNames.raceIdx; //maps race literal to index
const dtaSexIdx=dtaNames.sexIdx; //maps sex literal to index
const dsetIdx=dtaNames.dsetp; //maps dataset index to dtCounts.dspub[] index (1 or 2)
export function updateCounts() {
   //fills all dtn* arrays according to the dtf* filters, from dtaXall[selXType]
   dtXs.length=0; //will populate
   //reset counts
   ["dx", "dset", "dspub", "age", "sex", "race"].forEach (
     function (e) {
       let dt=dtCounts[e], z=dt.length;
       while(--z) dt[z]=0;
     });
    //clear region counts 
    let rd=dtCounts.reg;
    let nr=dtaNames.reg.length-1;
    for (let i=0;i<nr;i++) {
         rd[i].fill(0);
     }
   let selXType=rGlobs.selXType;
   //console.log(`dtFilters.age set to: [${[...dtFilters.age].join(' ')}]`);
   for (let xt=0;xt<dtaXTypes.length;xt++) { //for each exp type
    let aXd=dtaXall[xt];
    if (!aXd || aXd.length===0) { //no data available (yet) for this experiment type
      if (xt===selXType) {
        console.log(`Error: no data found for selXType ${selXType} : ${dtaXTypes[xt]}`);
        continue;
      }
      // generate some random region counts and exit
      for (let rg=0;rg<dtaNames.reg.length-1;++rg) {
        let v=Math.floor(Math.random() * mxMaxVal);
        if (v%3 === 0) v=0;
        //fill the column with random values
        dtCounts.reg[rg][xt]=v;
      }
      continue;
    }
    const len=aXd.length;

    for (let i=0;i<len;++i) { //for each sample data row
        const [sid, d, dx, r, s, a, rg] = aXd[i];
        if (dtFilters.dx.size && !dtFilters.dx.has(dx)) continue;
        if (dtFilters.race.size && !dtFilters.race.has(r)) continue;
        if (dtFilters.dset.size && !dtFilters.dset.has(d)) continue;
        if (dtFilters.dspub.size && !dtFilters.dspub.has(dsetIdx[d])) continue;
        if (dtFilters.sex && dtFilters.sex!==s) continue;
        //TODO: implement public/restricted dataset filter?
        let ax=0;
        if (dtFilters.age.size) { //any age filter set?
          ax=age2RangeIdx(a);
          if (ax===0) console.log(">>>>>>> WARNING: could not get an age range index from age "+rg);
          //else if (a<0) console.log(`for ${sid} age ${a} got ax=${ax}`);
          if (!dtFilters.age.has(ax)) continue;
        }
        //update region counts for all exp types in the matrix!
        dtCounts.reg[rg-1][xt]++;

        //only update phenotype counts for current selXType 
        if (xt!==selXType) continue;
        if (ax===0)
            ax=age2RangeIdx(a);
        if (ax===0) console.log(">>>>>>> WARNING: could not get an age range index from age"+rg);
            else dtCounts.age[ax]++;
        let rix=dtaRaceIdx[r];
        dtCounts.race[rix]++;
        //if (rix>0) console.log(`incremented counts for race ${r}, rix=${rix}`);
        dtCounts.sex[dtaSexIdx[s]]++;
        dtCounts.dx[dx]++;
        dtCounts.dset[d]++;
        dtCounts.dspub[dsetIdx[d]]++;
        dtXs.push([sid, d, dx, r, s, a, rg]); //metadata for each sample that passed
    }
    console.log(`dtCounts.race is: ${dtCounts.race}`);
  }
    //return [selXType, dtXs, dtCounts ] 
}

const RDataCtx = createContext();
const RDataUpdateCtx = createContext();

export function useRData() {  return useContext(RDataCtx) }
export function useRDataUpdate() {  return useContext(RDataUpdateCtx) }

export function RDataProvider( {children} ) {
  //rcData is [selXType, dtXs, dtCounts ]
  const [rcData, setRData] = useState([rGlobs.selXType, dtXs, dtCounts]);
  const [query, setQuery] = useState('all_data.json');
  
  function updateRData(qry, dta) { 
      setQuery(qry);
      setRData(dta);
  }
  
  useEffect( ()=> {
    fetch(query) //must be in ./public folder
      .then( r => r.json())
      .then( res => {
        setRData(loadData(res)); 
     })
    .catch(error => console.log(error));
  }, [query]);

  return (
    <RDataCtx.Provider value={rcData}>
      <RDataUpdateCtx.Provider value={updateRData}>
      {children}
      </RDataUpdateCtx.Provider>
    </RDataCtx.Provider>
  );
};


export function useFirstRender() {
  const isFirstRef = useRef(true);
  useEffect(() => {
    isFirstRef.current = false;
  }, []);
  return isFirstRef.current;
};

const FltCtx = createContext();
const FltCtxUpdate = createContext();

export function useFltCtx() { 
    const ctx=useContext(FltCtx);
    //making sure this is not used outside a provider
    if (ctx === undefined) {
        throw new Error(`useFltCtx must be used within FltCtxProvider!`)
    }
    return ctx; 
}
export function useFltCtxUpdate() { 
    const ctx=useContext(FltCtxUpdate);  
    //making sure this is not used outside a provider
    if (ctx === undefined) {
        throw new Error(`useFltCtxUpdate must be used within FltCtxProvider!`)
    }
    return ctx; 
}

export function FltCtxProvider (props) {
    // fltUpdated is [fltId, fltFlip]  
    // so notifyFltChange is just a state change notifier and 
    // should be called after calling updateCounts(fltId)
    // so dtCounts global object should have been updated already
    const [fltUpdInfo,  notifyFltChange] = useState(['dx', false])
    console.log(`FltCtxProvider state change (${fltUpdInfo})`);
    if (fltUpdInfo) {
      const [fltUpdId, fltFlip] = fltUpdInfo;
      console.log(`FltCtxProvider state change: ${fltUpdId} (${fltFlip})`);
    }
    
    //-- this should be called by the context consumer (filter being changed)
    //   to signal an update of dtCounts after that filter is applied
    function filterUpdated(fId) { //flip update and set fId
      console.log(`FltCtxProvider: requested update of [${fltUpdInfo}] by "${fId}"`);
      notifyFltChange( s => [ fId,  !s[1]]);
    }

    return (
     <FltCtx.Provider value={fltUpdInfo}>
         <FltCtxUpdate.Provider value={filterUpdated}>
             {props.children}
         </FltCtxUpdate.Provider>
     </FltCtx.Provider>
    )
}
