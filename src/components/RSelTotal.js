import React from 'react'
import { useRSel } from './RSelCtx';

function RSelTotal() {

  const [selcol, selregs, mxvals] = useRSel();

   var total=0;
   if (selcol>0) {
     for (var i=0;i<selregs.length; i++) {
       if (selregs[i]) total+=mxvals[i][selcol-1];
     }
   }
  return (<div>
        <span style={{fontSize:"1rem"}}>Selected samples:  </span>
        <span className="sel-total">{total}</span>
        </div>
  )
}

export default RSelTotal
