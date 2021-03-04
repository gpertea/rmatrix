import React, {useEffect, useRef} from 'react'
import './FltMList.css'
import {  rGlobs, useRData, getFilterData, applyFilterData,
          useFltCtx, useFltCtxUpdate } from './RDataCtx';
import $, { map } from 'jquery'
//import Popper from 'popper.js';
import 'bootstrap/dist/js/bootstrap.bundle.min'

const id2name = { dx : "Diagnosis", age: "Age", race: "Race", 
          sex: "Sex" , dset: "Dataset", proto : "Protocol", pub : "Public" };

//return a string obtained by changing character at position i in s with c
function strPut(s, i, c) {
  i=parseInt(i);
  if (i>s.length-1 || i<0) return s;
  let r=s.substring(0, i).concat(c, s.substring(i+1));
  return r;
}

//filtering multi-select list component 
function FltMList( props ) {

  // these should persist between re-renders, but should also be 
  const flDt = useRef ({
    onlyDt:[], //onlyData
    onlySt:[''], //onlyStates
    appSt:[''], //appliedStates
    fltDta:[], //[fltNames, fltCounts, fltSet]
    jqCr: [false],
    btnApp: [null]
  });
  const onlyData=flDt.current.onlyDt; //array with only selected indexes
  const onlyStates=flDt.current.onlySt; //changing/current selected states
  const appliedStates=flDt.current.appSt; // selected set as last applied
  const jqCreated=flDt.current.jqCr;
  const btnApply=flDt.current.btnApp;

  const fltData=flDt.current.fltDta; //[fltNames, fltCounts, fltSet]
                                        //     0        1         2
  const [selXType, xdata, countData] = useRData();

  //callback to use to inform other consumers of an applied filter:
  const notifyUpdate = useFltCtxUpdate(); 
  const [fltUpdId, fltFlip] = useFltCtx(); //external update, should update these counts
  const fid=props.id;

  //const isFirstRender=useFirstRender();

  const [fltNames, fltCounts]=getFilterData(fid); 
  if (fltCounts.length!==fltNames.length) 
    console.log(`FltMList ${fid} ERROR: fltNames length ${fltNames.length} != fltCounts length ${fltCounts.length}`);
  if (onlyStates[0].length===0) { //creation time 
    fltNames.slice(1).forEach( ()  => onlyStates[0] += '0' );
    appliedStates[0]=onlyStates[0]; //states as last applied
    console.log(`FltMList ${fid} creation..`);
    fltData[0]=fltNames;
    fltData[1]=fltCounts;
  }

  useEffect(()=> {
    console.log(`FltMList ${fid}: render with fltData len=${fltData[1].length}, already created=${jqCreated}`);
    //if (jqCreated) 
    //  console.log(`FltMList ${fid} counts: ${fltData[1]}`);
    if (fltData.length===0 || fltData[1].length===1) return;
    if (!jqCreated[0]) {
      console.log(`FltMList ${fid} creating with counts: ${fltData[1]}`);
      let jc=jqRender(fid, fltData, notifyUpdate);
      addClickHandler(jc);
      addApplyButton(jc);
      jqCreated[0]=true;
    }
  } );

  useEffect( () =>  { 

    function jqUpdate() { //update values from mxVals
      if (fltData.length===0 || fltData[1].length<=1) return;
      $('#'+fid+' .lg-lst').children().each( 
        function (i, li) {
          var el= $(li).find('.lg-count');
          el.html(fltData[1][i+1]);
       });
    }
  
    //if (isFirstRender) return;
    //-- no need to update if the update was due to self
    if (fid===fltUpdId) return; //self-inflicted update, don't change the counts
    jqUpdate();  //update counts only  
  }, [fltFlip, fid, fltUpdId, fltData] );

  function addApplyButton(jc) {
    btnApply[0] = jc.find('.lg-apply');
    btnApply[0].on('click', function(e) {
      //actually apply the changes
       $(this).hide();
       applyFilter(); //onlyStates string is applied
       e.stopPropagation();
    });
    btnApply[0].hide();
  }
  
  function clearOnlyStates() {
    onlyStates[0]='';
    fltData[0].slice(1).forEach( ()  => onlyStates[0] += '0' );
    onlyData.length=0;
  }

  function applyFilter() { 
    //onlyCounts string should be applied
    if (onlyData.length===onlyStates[0].length) {
      //all selected means none selected
      deselectAll(true);
    }
    applyFilterData(fid, onlyData); //this updates counts, etc.
    appliedStates[0]=onlyStates[0];
    notifyUpdate(fid); //broadcast the new counts update to other components
  }
  
  function filterChanged() { //must apply it
      if (appliedStates[0].indexOf("1")<0 && 
          (onlyStates[0].indexOf("0")<0)) {
            //deal with the silly case when all are selected
            //deselectAll(true);
            btnApply[0].hide();
            return;
      }
      if (onlyStates[0]===appliedStates[0]) {
        btnApply[0].hide();
        return;
      }
      btnApply[0].show();
  }

  function deselectAll(upd) {
    clearOnlyStates();
    $('#'+fid+' .lg-lst').find('.lg-sel').removeClass('lg-sel');
    //t.parents('.lg-panel').find('.lg-sel').removeClass('lg-sel'); //removeClass('lg-sel');
    let p = $('#'+fid).find('.lg-only');
    p.hide(); p.empty();
    if (upd) return;
    filterChanged();
  }

  function addOnlyItem(t) {
    let p = t.parents('.lg-panel').find('.lg-only');
    let i = parseInt(t[0].id); //1-based index
    onlyData.push(i); 
    p.show();
    if (onlyData.length===1) { //first item added
      let to=p.append('<span class="lg-only-lb">Only</span>');
      to.children().on('click', function() {
        //click on the 'only' word clears the filter!
         deselectAll();
      } );
    }
    p.children().remove('.lg-only-item'); //remove all
    onlyData.sort((a, b) => a - b);
    onlyData.forEach( function(o) { 
      p.append('<span class="lg-only-item">'+fltData[0][o]+'</span>') 
    });
    onlyStates[0]=strPut(onlyStates[0], i-1 , '1');
    filterChanged();
  }
  
  function removeOnlyItem(t) {
    let p = t.parents('.lg-panel').find('.lg-only');
    let i = parseInt(t[0].id); //1-based index
    //remove item with value i from onlyData
    let ix=onlyData.indexOf(i);
    if (ix>=0) onlyData.splice(ix, 1);
    if (onlyData.length>0) {
      p.children().remove('.lg-only-item'); //remove all items, re-add them
      onlyData.map( o => p.append('<span class="lg-only-item">'+fltData[0][o]+'</span>') );
    } else { p.hide(); p.empty(); }
    onlyStates[0]=strPut(onlyStates[0], i-1 , '0');
    filterChanged();
  }
  
  function addClickHandler(jc) {
    jc.on('click', '.lg-item', function(e) {
      var t = $(this);
      if(!t.hasClass('lg-sel')) {
      //var p=$this.parents('.panel').find('.panel-body');
      t.addClass('lg-sel');
      addOnlyItem(t);
      //$this.find('b').removeClass('bi-chevron-up').addClass('bi-chevron-down');
    } else {
      t.removeClass('lg-sel');
      //$this.find('b').removeClass('bi-chevron-down').addClass('bi-chevron-up');
      removeOnlyItem(t);
    }
  });
}
  // --- render FltMList ---
  return (
       <div className="lg-panel" id={props.id} style={ props.width ? { width : props.width} : {} }>
        <div className="lg-title">{id2name[props.id]}
           <span className="float-right">
             <span className="lg-apply">Apply</span>
             <span className="coll-glyph">&#x25B3;</span>
           </span>
        </div>
        <div className="collapse show lg-scroller lg-in-shadow">
         <ul className="lg-lst">
         </ul>
        </div>
        <div className="lg-only"></div>
       </div>
     )
}

function populateList(id, dta) {
  //dta is [fltNames, fltCounts ]
  /* <li class="d-flex justify-content-between lg-item">
    First one <span class="badge-primary badge-pill lg-count">24</span>
    </li> */
  $('#'+id+' .lg-lst').append(
    $.map(dta[0], function(d,i) { 
       return i ? '<li class="d-flex justify-content-between lg-item" id="'+i+'">'+d+
         ' <span class="badge-primary badge-pill lg-count">'+dta[1][i]+'</span>'+
         "</li>\n" : '';
    }).join(''));
}

function jqRender(id, dta) {
  populateList(id, dta);
  let jc=$('#'+id);
  
  jc.on('click', '.lg-title', function(e) {
      var t = $(this);
      var p = t.parents('.lg-panel').find('.lg-scroller');
      if(!t.hasClass('lg-collapsed')) {
        p.collapse('hide');
        t.addClass('lg-collapsed');
        t.removeClass('lg-b-shadow');
        t.find('.coll-glyph').html("&#x25BD;")
        //$this.find('b').removeClass('bi-chevron-up').addClass('bi-chevron-down');
      } else {
        p.collapse('show');
        t.removeClass('lg-collapsed');
        scrollShader(p);
        t.find('.coll-glyph').html("&#x25B3;")
        //$this.find('b').removeClass('bi-chevron-down').addClass('bi-chevron-up');
      }
    });
  let jscroller=$('#'+id+' .lg-scroller');
  scrollShader(jscroller);
  jscroller.on('scroll', (e) => scrollShader($(e.target)) );
  return jc;
}


function scrollShader(t) {
  var y = t.scrollTop();
  var p = t.parents('.lg-panel').find('.lg-title');
  var l = t.parents('.lg-panel').find('.lg-lst');
  if (y>2) {
     p.addClass('lg-b-shadow');
  }
  else {
     p.removeClass('lg-b-shadow');
  }
  if (y+t.innerHeight()>=l.outerHeight()) {
    t.removeClass('lg-in-shadow');
  } else {
    t.addClass('lg-in-shadow');
  }
}

export default FltMList
