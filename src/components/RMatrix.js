import React, { useEffect, useContext } from 'react';
import { DataCtx } from './DataCtx';
import $ from 'jquery'
import './RMatrix.css';
import * as gu from './gutils'

var globvar=0;
var selcol=0;
var selregs=[];
var mxVals=[]; //array with counts (assay_types x regions)
var mxMaxVal = 146; //maximum value in the matrix (for shading)
const clShadeHover='#FFF4F4';
const clShadeHoverRGB='rgb(255,240,240)';
const clHdrSelFg='#A00';

function jqFillMatrix(xt, rd) {
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
tb.append(
      $.map(rd, function(r, i) { 
        return '<tr><th>'+r.name+'</th>'+
           $.map(xt, function(x,j) {
             var v=0;
             if (j>0) { //generate randomly
               v=Math.floor(Math.random() * mxMaxVal);
               if (v%3===0) v=Math.floor(Math.random() * mxMaxVal);
                else v=0;
             } else {
               v=r.num;
             }
             mxVals[i][j]=v;
             if (v===0) v='';
             return '<td>'+v+'</td>';
           }).join() + "</tr>\n";
     }).join());
     // now iterate through all cells to record their original color values
$('#rxMatrix td').each(function() {
         var v=$(this).html();
         if (v>0) {
          var psh=v/(mxMaxVal*4.1); 
          var bc=gu.shadeRGBColor('rgb(240,240,240)', -psh);
          var fg=(gu.getRGBLuminance(bc)<120)? '#fff':'#000';
           $(this).prop('obg', bc);
           $(this).css('background-color', bc);
           $(this).prop('ofg',fg);
           $(this).css('color', fg);
         }
  }); 
}

function jqRender(dtypes, rdata) {
    //this should only be called when matrix data is refereshed (dtypes or rdata change)
    globvar++;
    selregs=[];
    for (var i=0;i<rdata.length;i++) {
        selregs.push(0);
        mxVals[i]=Array(dtypes.length).fill(0);
    }
    console.log("jquery Rendering call "+ globvar + " (number of rows: "+ rdata.length+")");
    jqFillMatrix(dtypes, rdata); //get data and fill matrix

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
        if (selcol>0 && selcol!=coln) return; //ignore click outside the allowed column
        if (selregs[rowidx]) deselectCell(t, rowidx);
                        else selectCell(t, rowidx, coln);
        
        //console.log("Text for selected cell is: "+$t.text()+ " with col index "+colidx+ " and row index "+rowidx);
        //glog("Text for selected cell is: ["+t.text()+ "] with col num "+coln+ " and row index "+rowidx+" (selregs["+rowidx+"]="+selregs[rowidx]+")");
        //alert("Text: "+$t.text());
      });

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


export default function RMatrix() {
    const [dtypes, rdata] = useContext(DataCtx);
    useEffect(()=> jqRender(dtypes, rdata) );

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
}

//--- jquery utility functions

function selectTH(th) {
    th.css('color', clHdrSelFg); //dark grey
    th.css('font-weight', 'bold'); //semi-bold
}
function deselectTH(th) {
    th.css('color', '#222'); //dark grey
    th.css('font-weight', '600'); //semi-bold
}

function hoverTH(th, out) {
  if (out) {
    th.css('color', ''); 
    th.css('background-color', ''); 
    th.css('font-weight', '600');
  } else {
    th.css('color', '#222');
    th.css('font-weight', '600');
  }
}

function selectCell(t, ridx, cnum) {
    if (t.html().trim().length===0) return;
    t.css('font-weight','bold');
    t.css('color', '#fff');
    t.css('background-color', clHdrSelFg);
    var th=t.siblings('th')
    th.css('color', clHdrSelFg);
    th.css('font-weight', 'bold');
    selregs[ridx]=1;
    if (selcol===0) {
        selectTH($('#rxMatrix th:nth-child(' + (cnum+1) + ') > div > span'))
        selcol=cnum;
    }
    console.log("selected @ col "+cnum+", row "+ridx+" : "+mxVals[ridx][cnum-1]+", selcol="+cnum);
  }

  function deselectCell(t, ridx) {
    t.css('font-weight','normal');
    var obg=t.prop('obg');
    var ofg=t.prop('ofg');
    if (ofg) t.css('color', ofg);
    if (obg) t.css('background-color', obg);
    
    selregs[ridx]=0;
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
  }
  
  function hoverCell(t, r, c, out) {
    if (out) {
       var obg=t.prop('obg');
       if (obg) {
          t.css('background-color', obg);
       }
       else t.css('background-color', '');
    } else {
        var obg=t.prop('obg');
        if (obg) {
        var nc=gu.blendRGBColors(obg, clShadeHoverRGB, 0.1);
        t.css('background-color', nc );
        }
        else t.css('background-color', clShadeHover);
    }
  }
  



