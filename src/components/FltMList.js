import React, {useEffect} from 'react'
import './FltMList.css'
import {  rGlobs, dtaNames, useFirstRender, useRData, 
         dtFilters, useFltCtx, useFltCtxUpdate, updateCounts } from './RDataCtx';
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

// these should persist between rerenders
const onlyData=[]; //array with only selected indexes
var onlyStates=''; //changing/current selected states
var appliedStates='' // states as last applied
var jqCreated=false;
var isFirstRender=false;

var btnApply=null;
var notifyUpdate=null;

const fltData=[]; //[fltNames, fltCounts, fltSet]
                  //     0,       1,        2
//filtering multi-select list component 
function FltMList( props ) {

  const [selXType, xdata, countData] = useRData();

  //callback to use to inform other consumers of an applied filter:
  notifyUpdate = useFltCtxUpdate(); 
  const fltUpdate = useFltCtx(); //external update, should update these counts
  const fid=props.id;

  isFirstRender=useFirstRender();
  const fltNames=dtaNames[fid]; //eg, ['dx', 'Control, 'Schizo', ...]
  if (!fltNames) console.log("FltMList Error: fltNames not found for id: "+fid);
  const fltSet = dtFilters[fid];
  if (!fltSet) console.log("FltMList Error: fltSet not found for id: "+fid);
  const fltCounts = countData[fid];
  if (!fltCounts) console.log("FltMList Error: fltCounts not found for id: "+fid);
  if (fltCounts.length!==fltNames.length) 
    console.log(`FltMList Error: fltCounts length ${fltCounts.length} != fltNames length ${fltNames.length}`);
  if (onlyStates.length===0) { //creation time 
    fltNames.slice(1).forEach( ()  => onlyStates += '0' );
    appliedStates=onlyStates; //states as last applied
    fltData[0]=fltNames;
    fltData[1]=fltCounts;
    fltData[2]=fltSet;
  }

  useEffect(()=> {
    console.log(`FltMList|${fid}: render with fltData len=${fltData.length}`);
    if (fltData.length===1) return;
    if (!jqCreated) {
      jqRender(fid, fltData);
      jqCreated=true;
    }
  } );

  useEffect( () =>  { 
    //if (isFirstRender) return;
    jqUpdate(fid);  //update counts only  
  }, [fltUpdate, fid] );

   // --- render FltMList ---
  return (
      <div className="row">
       <div className="lg-panel" id={props.id}>
        <div className="lg-title">{id2name[props.id]}
           <span className="float-right">
             <span className="lg-apply">apply filter</span>
             <span className="coll-glyph">&#x25B3;</span>
           </span>
        </div>
        <div className="collapse show lg-scroller lg-in-shadow">
         <ul className="lg-lst">
         </ul>
        </div>
        <div className="lg-only"></div>
       </div>
      </div>
     )
}


function populateList(id, dta) {
  //dta is [fltNames, fltCounts, fltSet]
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


function jqUpdate(id) { //update values from mxVals
  if (isFirstRender || fltData.length===0 || fltData[1].length<=1) return;
  $('#'+id+' .lg-lst').children().each( 
    function (i, li) {
      var el= $(li).find('.lg-count');
      el.html(fltData[1][i+1]);
   });
}

function jqRender(id, dta) {
  if (onlyStates.length) return; //no need to re-render
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

  let jscroller=$('#'+id+' .lg-scroller');
  scrollShader(jscroller);
  jscroller.on('scroll', (e) => scrollShader($(e.target)) );

  btnApply = jc.find('.lg-apply');
  btnApply.on('click', function(e) {
    //actually apply the changes
     $(this).hide();
     applyFilter(); //onlyStates string is applied
     e.stopPropagation();
  });

  btnApply.hide();

}

function applyFilter() { 
  //onlyCounts string should be applied
  if (onlyData.length===onlyStates.length) {
    //all selected means none selected
    onlyStates='';
    fltData[0].slice(1).forEach( ()  => onlyStates += '0' );
    onlyData.length=0;
  }
  if (fltData[0][0]==='sex') {
       fltData[2]='';
       if (onlyData.length) fltData[2]=dtaNames.sexIdx[onlyData[0]];
  } else { //all other filters have sets
     fltData[2].clear();
     onlyData.forEach ( o => fltData[2].add(o) );
  }
 
  appliedStates=onlyStates;
  updateCounts();
  notifyUpdate(); //broadcast the new counts update to other components
}

function filterChanged() { //must apply it
    if (onlyStates===appliedStates) {
      btnApply.hide();
      return;
    }
    btnApply.show();
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

function addOnlyItem(t) {
  let p = t.parents('.lg-panel').find('.lg-only');
  let i = parseInt(t[0].id); //1-based index
  onlyData.push(i); 

  if (onlyData.length===1) { //first item added
    let t=p.append('<span class="lg-only-lb">Only</span>');

    t.children().on('click', function() {
      //click on the 'only' word clears the filter!
      onlyData.length=0;
      let t=$(this);
      t.parents('.lg-panel').find('.lg-sel').removeClass('lg-sel'); //removeClass('lg-sel');
      t.parent().empty();
      onlyStates='';
      fltData.map( () => onlyStates+='0' );
      filterChanged();
    } );
  }
  p.children().remove('.lg-only-item'); //remove all
  onlyData.sort((a, b) => a - b);
  onlyData.forEach( function(o) { 
    p.append('<span class="lg-only-item">'+fltData[0][o]+'</span>') 
  });

  onlyStates=strPut(onlyStates, i-1 , '1');
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
  } else p.empty();
  onlyStates=strPut(onlyStates, i-1 , '0');
  filterChanged();
}

export default FltMList
