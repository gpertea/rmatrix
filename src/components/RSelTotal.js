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
  return (
    <div className="row" style={{paddingTop: "1em"}} >
      <div className="col">
        <span>Total selected samples: <b>{total}</b></span>
      </div>
    </div>
  )
}

export default RSelTotal
