import React, {useEffect} from 'react'
import './FltMList.css'
import { useRData, rGlobs, dtaNames, useFltCtxUpdate } from './RDataCtx';
import $, { map } from 'jquery'
//import Popper from 'popper.js';
import 'bootstrap/dist/js/bootstrap.bundle.min'

const id2name = { dx : "Diagnosis", age: "Age", race: "Race", 
          sex: "Sex" , dset: "Dataset", proto : "Protocol" };

//return a string obtained by changing character at position i in s with c
function strPut(s, i, c) {
  i=parseInt(i);
  if (i>s.length-1 || i<0) return s;
  let r=s.substring(0, i).concat(c, s.substring(i+1));
  return r;
}

//filtering multi-select list component 
function FltMList( props ) {
  const fltData = useFltCtxUpdate(props.id);
  const onlyData=[]; //array with only selected indexes
  var onlyStates=''; //changing/current selected states
  fltData.map( ()  => onlyStates += '0' );
  var appliedStates=onlyStates; //states as last applied

  var fltChanged=false; //if true, Apply filter needed
  var btnApply=null;
  //const setSelData = useRSelUpdate();
  useEffect(()=> jqRender(props.id, fltData) );

  function jqRender(id, dta) {
    populateList(id, dta);
     //$(document)
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
      fltChanged=false;
      appliedStates=onlyStates;
      e.stopPropagation();
    });

    btnApply.hide();

  }
  
  function filterChanged() { //must apply it
      if (onlyStates===appliedStates) {
        fltChanged=false;
        btnApply.hide();
        return;
      }
      fltChanged=true;
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
    let i = t[0].id;
    onlyData.push(i);

    if (onlyData.length===1) {
      let t=p.append('<span class="lg-only-lb">Only</span>');
      t.children().on('click', function() {
        onlyData.length=0;
        let t=$(this);
        t.parents('.lg-panel').find('.lg-sel').removeClass('lg-sel'); //removeClass('lg-sel');
        t.parent().empty();
        onlyStates='';
        fltData.map( () => onlyStates+='0' );
        filterChanged();
      } );
    }
    p.children().remove('.lg-only-item');
    onlyData.map( o => p.append('<span class="lg-only-item">'+fltData[o].name+'</span>') );

    onlyStates=strPut(onlyStates, i , '1');
    filterChanged();
  }

  function removeOnlyItem(t) {
    let p = t.parents('.lg-panel').find('.lg-only');
    let i = t[0].id;
    //remove item with value i from onlyData
    let ix=onlyData.indexOf(i);
    if (ix>=0) onlyData.splice(ix, 1);

    if (onlyData.length>0) {
      p.children().remove('.lg-only-item');
      onlyData.map( o => p.append('<span class="lg-only-item">'+fltData[o].name+'</span>') );
    } else p.empty();
    onlyStates=strPut(onlyStates, i , '0');
    filterChanged();
  }

  function populateList(id, dta) {
    /* <li class="d-flex justify-content-between lg-item">
      First one <span class="badge-primary badge-pill lg-count">24</span>
      </li> */
    $('#'+id+' .lg-lst').append(
      $.map(dta, function(d,i) { 
         return '<li class="d-flex justify-content-between lg-item" id="'+i+'">'+d.name+
           ' <span class="badge-primary badge-pill lg-count">'+d.num+'</span>'+
           "</li>\n";
      }).join(''));
  }

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

export default FltMList
