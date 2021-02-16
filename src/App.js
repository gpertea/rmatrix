import 'bootstrap/dist/css/bootstrap.min.css';
//import $ from 'jquery';
//import Popper from 'popper.js';
//import 'bootstrap/dist/js/bootstrap.bundle.min';
import React, {useState} from 'react';
import './App.css';
import RMatrix from './components/RMatrix';
import RSelTotal from './components/RSelTotal';

import FltMList from './components/FltMList';
import {DataCtxProvider} from './components/DataCtx';
import {RSelProvider} from './components/RSelCtx';


function Header() {
  return(
    <>
     <div className="row-lg-12 navbar bg-light my-header">
        <img alt="logo" src="logo.svg" className="img-fluid" style={{height: "2.3em", backgroundColor: "azure" }} />
        <div className="col-font-weight-bold text-center" style={{ fontSize: "2.1em", color:"#ed1848"}}> Data Portal </div>
        <img alt="brain" src="brain_with_bg.svg" className="img-fluid" style={{ height:"2.65em", marginTop: "0.3em"}} />
     </div> 
    </>
  )
}

var rSelCol=0;
var rSelRegs=[]; 
var rMxVals=[];

var selRegsStr="";

function App() {
  // [ selcol, selregs[], mxVals[][] ]
  const [change, setChange] = useState( false) ;

  function onRSelChange(r) { 
    if (r.length!==3) return;
    [ rSelCol, rSelRegs, rMxVals] = r;
    console.log("selection change! selCol="+rSelCol);
    selRegsStr="";
    for (let i=0;i<rSelRegs.length;i++) selRegsStr+=rSelRegs[i];
    console.log("    App selRegsStr: "+selRegsStr);
  }
  
  return (
    <>
    <div className="container-fluid"> 
      <Header />
      <div className="row justify-content-center bg-light" style={{marginTop: "10px", border:"4px solid #f8f9fa"}}>
        <div className="col bg-light my-sidebar">
          <div className="row"> 
            <FltMList id="filterDx" />
          </div> 
          <div className="row" style={{height: "2em"}}> </div> 
          <div className="row"> 
            <FltMList id="filterRace" />
          </div> 
          <div className="row" style={{height: "2em"}}> </div> 
          <div className="row"> 
            <FltMList id="filterSex" />
          </div> 
          <div className="row" style={{height: "2em"}}> </div> 
          <div className="row"> 
            <FltMList id="filterDataset" />
          </div> 
          <div className="row"> 
            <button onClick={()=>setChange(change=>!change)}>Render ALL</button>
          </div>
        </div>
       <div className="col bg-light">
        <div className="col matrixWrap mx-auto ">
          <DataCtxProvider>
          <RSelProvider>
             <RMatrix onSelChange={ onRSelChange }/>
             <RSelTotal />
           </RSelProvider>
          </DataCtxProvider>
          
        </div>

        <br/> <br/> <br/> 
        <span>{rSelRegs.map( (v) => v+"nbsp;")} </span>
        <br/>
        </div>
    </div>
  </div> 
  </>
  )
}

export default App;
