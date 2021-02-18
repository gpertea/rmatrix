import { createContext, useContext, useState } from "react";

const dtaXTypes=[ 'RNA-seq', 'DNA methylation', 'long read RNA-seq', 'scRNA-seq', 'micro RNA-seq',
  'WGS', 'ATAC-seq' ];

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

function fetchData() {
    //we can use axios or whatever to fetch data here
    //console.log("region data fetched");
    return [dtaXTypes, dtaRegion];

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

