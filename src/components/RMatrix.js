import React, { useEffect, useContext } from 'react';
import { DataCtx } from './DataCtx';
import $ from 'jquery'
import './RMatrix.css';
import * as gu from './gutils'

var globvar=0;
var selcol=0;
var selregs=[]; 
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
             if (v==0) v='';
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
    globvar++;
    if (selregs.length===0) 
       for (var i=0;i<rdata.length;i++) selregs.push(0);
    console.log("jquery Rendering call "+globvar + " (number of rows: "+ rdata.length+")");
    jqFillMatrix(dtypes, rdata); //get data and fill matrix
    //populateFilter('fltDx', dtaDx); //populate Diagnosis filter
    //populateFilter('fltRace', dtaRace); //populate Diagnosis filter
    //populateFilter('fltDataset', dtaDataset); //populate Diagnosis filter
    //populateFilter('fltSex', dtaSex); //populate Diagnosis filter
    //populateFilter('fltProto', dtaProtocol); //populate Diagnosis filter

    //matrix hover behavior
    $("#rxMatrix td").hover(function()  {
        var t=$(this);
        t.siblings('td').each(function() {
          var td=$(this);
          var coln = td.index(); // 1-based !
          var ridx =  td.parent().index();
           tdHighlight(td, ridx, coln);
        });
        var th=t.siblings('th');
        if (selregs[t.parent().index()]) {
          th.css('background-color', clShadeHover);
          th.css('color', clHdrSelFg);
        } else { //regular, not selected region
          th.css('background-color', clShadeHover);
          th.css('color', '#222');
        }

        var ind = t.index()+1;
        //$('#rxMatrix td:nth-child(' + ind + ')').css('background-color', shadeCl);
        $('#rxMatrix td:nth-child(' + ind + ')').each( function() {
          var td=$(this);
          tdHighlight(td, td.parent().index(), td.index());
        });
        //t.css('background-color','#FFFFEE');
        tdHighlight(t, t.parent().index(), ind-1);
        //find the span inside the div
        var ch=$('#rxMatrix th:nth-child(' + ind + ') > div > span');
        if (ind-1===selcol) {
          ch.css('color', clHdrSelFg);
          ch.css('font-weight', 'bold');
        } else {
          ch.css('color', '#222');
          ch.css('font-weight', '600');
        }
      }, function() {
        var t=$(this);
        //t.siblings('td').css('background-color', ''); 
        t.siblings('td').each( function() {
          var td=$(this);
          tdColRestore(td, td.parent().index(), td.index());
        });

        var th=t.siblings('th');
        if (selregs[t.parent().index()]) {
          th.css('color', clHdrSelFg); 
          th.css('background-color', ''); 
        } else {
           th.css('color', ''); 
           th.css('background-color', ''); 
        }
        var ind = t.index()+1;
        //$('#rxMatrix td:nth-child(' + ind + ')').css('background-color', ''); 
        $('#rxMatrix td:nth-child(' + ind + ')').each( function() {
          var td=$(this);
          tdColRestore(td, td.parent().index(), td.index());
        });
        var ch=$('#rxMatrix th:nth-child(' + ind + ') > div > span');
        if (ind-1==selcol) {
          ch.css('color', clHdrSelFg);
          ch.css('font-weight', 'bold');
        } else {
          ch.css('color', '');
        }
      });

      $("#rxMatrix td").click( function() {
        var t=$(this);
        var coln = t.index(); // 1-based !
        var rowidx =  t.parent().index();
        if (selcol>0 && selcol!=coln) return; //ignore click outside the allowed column
        if (selregs[rowidx]) deselectCell(t, rowidx);
                        else selectCell(t, coln, rowidx);
        
        //console.log("Text for selected cell is: "+$t.text()+ " with col index "+colidx+ " and row index "+rowidx);
        //glog("Text for selected cell is: ["+t.text()+ "] with col num "+coln+ " and row index "+rowidx+" (selregs["+rowidx+"]="+selregs[rowidx]+")");
        //alert("Text: "+$t.text());
      });

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

function selectCell(t, cnum, ridx) {
    if (t.html().trim().length===0) return;
    t.css('font-weight','bold');
    t.css('color', '#fff');
    t.css('background-color', clHdrSelFg);
    var th=t.siblings('th')
    th.css('color', clHdrSelFg);
    th.css('font-weight', 'bold');
    selregs[ridx]=1;
    if (selcol===0) {
      var ind=cnum+1;
      var ch=$('#rxMatrix th:nth-child(' + ind + ') > div > span');
      ch.css('color', clHdrSelFg);
      ch.css('font-weight', 'bold');
      selcol=cnum;
    }
  }
  
  function deselectCell(t, ridx) {
    t.css('font-weight','normal');
    var obg=t.prop('obg');
    var ofg=t.prop('ofg');
    if (ofg) t.css('color', ofg);
    if (obg) t.css('background-color', obg);
    
    selregs[ridx]=0;
    var th=t.siblings('th')
    th.css('color', '#222');
    th.css('font-weight', '600');
    var sel=0;
    for (let i=0;i<selregs.length;i++) {
      if (selregs[i]) { sel=1; break; }
    }
    if (sel===0) {
      //deselect column
      if (selcol) {
        var ind=selcol+1;
        var ch=$('#rxMatrix th:nth-child(' + ind + ') > div > span');
        ch.css('color', '#222');
        ch.css('font-weight', '600');
      }
      selcol=0;
    }
  }
  
  function tdHighlight(t) {
    var obg=t.prop('obg');
    if (obg) {
      var nc=gu.blendRGBColors(obg, clShadeHoverRGB, 0.1);
      t.css('background-color', nc );
    }
    else t.css('background-color', clShadeHover);
  }
  
  function tdColRestore(t) {
    var obg=t.prop('obg');
    if (obg) {
       t.css('background-color', obg);
    }
    else t.css('background-color', '');
  }



