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
    /* updateCounts();
    console.log('sending notifyFltUpdate');
    notifyFltUpdate('test'); 
    */
    window.location.reload(false);
  }

  return (<div className="row justify-content-md-center" style={{height: "2em"}}> 
    <button onClick={ClickUpdate}>Clear</button>
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
            <FltMList id="sex" type="toggle"/>
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
             <div className="row" style={{paddingTop: "0.4rem" }} >
               <div className="col-2">
               </div>
               <div className="col-8 checkout-area">
                 <div className="row" style={{padding: "0.4rem 4rem 0.8rem 6.2rem" }} > <RSelTotal /> </div>
                 <div className="row" >
                   <div className="col-2">
                   </div>
                   <div className="col-5" style={{ paddingLeft: "1.8rem"}}>
                     <button className="btn checkout-btn btn-light"><b>Download &#x02228;</b></button>
                   </div>
                  <div className="col-4">
                    <button className="btn checkout-btn btn-light" style={{ width: "7.6rem"}} ><b>Explore &#x021D2;</b></button>
                  </div>
               </div>
               </div>
               <div className="col-2">
               </div>
             </div> 
             <div className="row" style={{paddingTop: "1em"}} >
             </div>
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
