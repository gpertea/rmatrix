import 'bootstrap/dist/css/bootstrap.min.css';
//import $ from 'jquery';
//import Popper from 'popper.js';
//import 'bootstrap/dist/js/bootstrap.bundle.min';
import React, {useState} from 'react';
import './App.css';
import RMatrix from './components/RMatrix';
import RSelTotal from './components/RSelTotal';

import FltMList from './components/FltMList';
import {RDataProvider, FltCtxProvider, useFltCtxUpdate, useRData, updateCounts} from './components/RDataCtx';
import {RSelProvider} from './components/RSelCtx';
//import {FltDataProvider} from './components/FltDataCtx';

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


function RefreshButton() {
  
  const [selXType, xdata, countData] = useRData();
  const notifyFltUpdate=useFltCtxUpdate();

  function ClickUpdate() {
    updateCounts();
    console.log('sending notifyFltUpdate');
    notifyFltUpdate('test'); 
  }

  return (<div className="row justify-content-md-center" style={{height: "2em"}}> 
    <button onClick={ClickUpdate}>Force Update</button>
    </div>)
}


function App() {
  return (
    <>
    <div className="container-fluid"> 
      <Header />
      <div className="row justify-content-center bg-light" 
           style={{marginTop: "10px", border:"4px solid #f8f9fa"}}>
      <FltCtxProvider>
      <RDataProvider>
        <div className="col overflow-auto my-sidebar">
           <RefreshButton/>
          <div className="row">
             <FltMList id="dx" />
          </div>
          <div className="row"> 
            <FltMList id="sex" width="8rem"/>
          </div>
           <div className="row"> 
            <FltMList id="race" width="10rem"/>
          </div>
          <div className="row"> 
            <FltMList id="age" />
          </div> 
          <div className="row"> 
            <FltMList id="dset" />
          </div>
          {/*
          <div className="row"> 
            <FltMList id="age" />
          </div> 
          */}     
 {/*  </FltDataProvider> */}
       </div>
       <div className="col bg-light">
        <div className="col matrixWrap mx-auto ">
         
          <RSelProvider>
             <RMatrix />
             <RSelTotal />
           </RSelProvider>
         </div>
      </div>
      </RDataProvider>
      </FltCtxProvider>
    </div>
    
  </div> 
  </>
  )
}

export default App;
