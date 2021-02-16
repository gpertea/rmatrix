import React, {createContext, useContext, useState } from "react";

const RSelCtx = createContext();
const RSelUpdateCtx = createContext();

export function useRSel() {  return useContext(RSelCtx) }
export function useRSelUpdate() {  return useContext(RSelUpdateCtx) }

export function RSelProvider( {children} ) {

  const [rSelData, setRSel] = useState([ 0, [], [] ])
  
  function updateRSel(rsel) { setRSel(rsel)  }
  
  return (
    <RSelCtx.Provider value={rSelData}>
      <RSelUpdateCtx.Provider value={updateRSel}>
      {children}
      </RSelUpdateCtx.Provider>
    </RSelCtx.Provider>
  );
};

