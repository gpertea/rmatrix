import React, { useEffect, useRef } from 'react';
import { useRData, rGlobs, dtaNames, dtaXTypes, mxMaxVal, useFltCtx } from './RDataCtx';
import { useRSelUpdate } from './RSelCtx';
import $ from 'jquery'
import './RMatrix.css';
import * as gu from './gutils'

//var globvar=0;
var selcol=0;
var selregs=[];
var mxVals=[]; //array with counts (assay_types x regions)

// if any of these changes, we'll rebuild/refill the matrix
// otherwise we should just update the numbers
var numRegs=0; 
var numXTypes=0;

const clShadeHover='#FFF4F4';
const clShadeHoverRGB='rgb(255,240,240)';
//const clHdrSelFg='#A00';
const clHdrSelFg='#ed1848';

var setSelData=null;
var isFirstRender=false;

function RMatrix( props ) {
    const [selXType, xdata, counts] = useRData();
    const fltUpdate = useFltCtx(); //fltUpd is just a flip-flop
    isFirstRender=useFirstRender(); //only true for the first render!
    console.log(`RMatrix rendering requested: fltUpdate=${fltUpdate} data length: ${xdata.length}`);
    //const setSelDataFunc = useRSelUpdate();
    setSelData = useRSelUpdate();

    useEffect( () =>  { 
        console.log('RMatrix: render requested due to RData update')
        if (rGlobs.rebuildRMatrix) {
              mxVals=[];
              numRegs=0;numXTypes=0;
              jqRender(dtaXTypes, counts.reg); 
            }
        } );

        useEffect( () =>  { 
           //if (isFirstRender) return;
           jqUpdate();    
        }, [fltUpdate] );


    if (xdata.length===0) return (<div>. . . L O A D I N G . . . </div>);
 
    return (
        <>
        <div className="col matrixWrap mx-auto">
          <h4 style={{marginLeft: "-2.4em"}}>Region Matrix</h4>
          <table id="rxMatrix">
            <thead>
              
            </thead>
            <tbody>
            </tbody>
          </table>
        </div> 
        </>
    )
};

function updateRSel() {
  setSelData([selcol, selregs, mxVals]);
}

function jqFillMatrix(xt, rn) { //takes values from mxVals!
  //populate top header 
  let th=$('#rxMatrix > thead');
  th.empty();
  th.append('<tr><th class="cr" style="width:8rem;"></th>'+
     $.map(xt, function(xt) { 
        return '<th class="rt"><div><span>'+xt+'</span></div></th>';
     }).join()+'</tr>');
     //populate rows:
 let tb= $('#rxMatrix > tbody');
 tb.empty();
 numRegs=rn.length;
 numXTypes=xt.length;
 tb.append(
       $.map(rn, function(r, i) { 
         return '<tr><th>'+r+'</th>'+
            $.map(xt, function(x,j) {
              let v=mxVals[i][j];
              if (v===0) v='';
              return '<td>'+v+'</td>';
            }).join() + "</tr>\n";
      }).join());
      // now iterate through all cells to record their original color values
 $('#rxMatrix td').each(function() {
          let t=$(this);
          let v=t.html();
          shadeCell(t,v)
   }); 
 }
 
 function shadeCell(t, v) {
  if (v>0) {
    let psh=v/(mxMaxVal*4.1); 
    let bc=gu.shadeRGBColor('rgb(240,240,240)', -psh);
    let fg=(gu.getRGBLuminance(bc)<120)? '#fff':'#000';
    t.prop('obg', bc);
    t.css('background-color', bc);
    t.prop('ofg',fg);
    t.css('color', fg);
    t.css('cursor', 'pointer');
  } else { 
    t.removeProp('obg');
    t.removeProp('ofg');
    t.css('cursor', 'default');
    t.css('background-color', '');
    t.css('color', '');
  }

 }

 function jqUpdate() { //update values from mxVals
   //let rix=0, cix=0;
   if (isFirstRender || mxVals.length===0) return;
   $('#rxMatrix > tbody > tr').each( function(rix, tr ) {
     $(tr).find('td').each( function (cix, td){
       let v=mxVals[rix][cix];
       //console.log(`rix=${rix}, cix=${cix}`)
       //let v=rix.toString()+'.'+cix.toString();
       let t=$(td);
       t.html((v===0)?'':v);
       shadeCell(t,v);
       if (cix+1===selcol && selregs[rix]) {
              selectCell(t, rix, cix, 1);
        }
     });
   });
   updateRSel();
 
 }
 
 function useFirstRender() {
   const isFirstRef = useRef(true);
   useEffect(() => {
     isFirstRef.current = false;
   }, []);
   return isFirstRef.current;
 };

function jqRender(xtypes, rdata) {
  //this should only be called when matrix data is refereshed (xtypes or rdata change)
  //should have a better check for data refresh (e.g. resetting mxVals.length after a refresh should do it)
  //if (mxVals===rdata && numRegs===rdata.length && numXTypes===dtaXTypes.length) return; 
  if (rdata.length===0) return; 

  rGlobs.rebuildRMatrix=false;

  mxVals=rdata; 
  
  selregs=[];
  for (var i=0;i<rdata.length;i++) {
      selregs.push(0);
  }
  jqFillMatrix(xtypes, dtaNames.reg.slice(1)); //get data and fill matrix

  //matrix hover behavior
  $("#rxMatrix td").hover(function()  {
      handleHover($(this), 0);
    }, function() { 
      handleHover($(this), 1);
    });

    $("#rxMatrix td").click( function() {
      var t=$(this);
      var coln = t.index(); // 1-based !
      var rowidx =  t.parent().index();
      if (selcol>0 && selcol!==coln) return; //ignore click outside the allowed column
      if (selregs[rowidx]) deselectCell(t, rowidx, coln);
                      else if (t.html()>0) selectCell(t, rowidx, coln);
      
    });
    $("#rxMatrix th").hover( function()  {
      handleTHover($(this), 0);
    }, function() {
      handleTHover($(this), 1);
    });

    //top header click behavior: toggle select/deselect all
    $("#rxMatrix th").click( function() {
      let t=$(this);
      let cix=t.index();
      if (t.hasClass("rt")) { // assay type header click
         if (selcol>0 && selcol!==cix) return;
         if (selcol>0) {
           for (let r=0;r<selregs.length;r++) {
                   if (selregs[r]>0) {
                        deselectCell(null, r, cix, 1);
                   }
           }
         } else { //select all ?
          for (let r=0;r<selregs.length;r++) {
                 selectCell(null, r, cix, 1);
          } 
        }
        updateRSel();
      } else { // region header
        let rix=t.parent().index();
        console.log(`clicked region header rix ${rix}, selcol=${selcol}`);
        if (selcol>0) {
          if (selregs[rix]) deselectCell(null, rix, selcol);
                         else selectCell(null, rix, selcol);
        }
      }
    });

}

function hoverCell(t, r, c, out) {
    var obg=t.prop('obg');
    if (out) {
       if (obg) {
          t.css('background-color', obg);
       }
       else t.css('background-color', '');
    } else {
        if (obg) {
        var nc=gu.blendRGBColors(obg, clShadeHoverRGB, 0.1);
        t.css('background-color', nc );
        }
        else t.css('background-color', clShadeHover);
    }
}

  //--- jquery utility functions
  function handleTHover(t, out) {
    if (t.hasClass("rt")) {
      if (selcol>0) return;
    } else {
      //region hover
      let rix=t.parent().index();
      if (selcol>0 && selregs[rix]) return;
    }
    hoverTH(t, out);
  }

  function handleHover(t, out) {
    var cix = t.index(); //column index
    var rix = t.parent().index(); //row index
    //highlight row
    t.siblings('td').each(function() {
        var td=$(this);
        var c=td.index();
        if (c!==selcol || !selregs[rix])
          hoverCell(td, rix, c, out);
    });
    if (selregs[rix]) selectTH(t.siblings('th'))
    else hoverTH(t.siblings('th'), out) //regular, not selected region
   
    // highlight column, unless locked on one
    if (selcol===0 || selcol===cix) {
      $('#rxMatrix td:nth-child(' + (cix+1) + ')').each( function() {
          var td=$(this);
          var r=td.parent().index();
          if (cix!==selcol || !selregs[r])
            hoverCell(td, r, cix, out);
      });
      if (cix!==selcol || !selregs[rix])
        hoverCell(t, t.parent().index(), cix, out);
      //highlight column
      var ch=$('#rxMatrix th:nth-child(' + (cix+1) + ') > div > span');
      if (cix===selcol) {
          selectTH(ch);
      } else {
          hoverTH(ch, out);
      }
    }
  }

  function selectTH(th) {
    if (th.hasClass("rt")) {
       th.css('color', clHdrSelFg); 
    }  else {
      th.css('color', '#fff');
      th.css('background-color', clHdrSelFg);
    }
  }

  function deselectTH(th) {
      th.css('color', ''); 
      th.css('background-color', '');
  }

  function hoverTH(th, out) {
    if (out) {
      th.css('color', ''); 
      th.css('background-color', ''); 
    } else {
      th.css('color', '#222');
    }
  }

  function selectCell(t, ridx, cix, noupd) {
    if (t==null) {
      t=$('table#rxMatrix tr').eq(ridx+1).find('td').eq(cix-1);
    }
    //if (t==null || t.html().trim().length===0) return;
    if (t==null) return;
    t.css('font-weight','bold');
    t.css('color', '#fff');
    t.css('background-color', clHdrSelFg);
    var th=t.siblings('th')
    selectTH(th);
    //th.css('font-weight', 'bold');
    selregs[ridx]=1;
    if (selcol===0) {
        selectTH($('#rxMatrix th:nth-child(' + (cix+1) + ') > div > span'))
        selcol=cix;
    }
    if (!noupd) updateRSel();
  }

  function deselectCell(t, ridx, cix, noupd) {
    if (t==null) {
       t=$('table#rxMatrix tr').eq(ridx+1).find('td').eq(cix-1);
    }
    if (t == null) return;
    t.css('font-weight','normal');
    var obg=t.prop('obg');
    var ofg=t.prop('ofg');
    if (ofg) t.css('color', ofg); else t.css('color', '');
    if (obg) t.css('background-color', obg); 
           else t.css('background-color', '');
    
    selregs[ridx]=0;
    //if (noupd) hoverTH(t.siblings('th'), 1);
         // else 
    deselectTH(t.siblings('th'));
    var sel=0;
    for (let i=0;i<selregs.length;i++) {
      if (selregs[i]) { sel=1; break; }
    }
    if (sel===0) { //deselect whole column
      if (selcol)  
        deselectTH($('#rxMatrix th:nth-child(' + (selcol+1) + ') > div > span'));
      selcol=0;
    }
    if (!noupd) 
      updateRSel();
  }

export default RMatrix;