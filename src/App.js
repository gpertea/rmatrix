import React from 'react';
import './App.css';
import RMatrix from './components/RMatrix';
import FltMList from './components/FltMList';

function Header() {
  return(
    <>
     <div class="row-lg-12 navbar bg-light my-header">
        <img alt="logo" src="logo.svg" class="img-fluid" style={{height: "2.3em", backgroundColor: "azure" }} />
        <div class="col-font-weight-bold text-center" style={{ fontSize: "2.1em", color:"#ed1848"}}> Data Portal </div>
        <img alt="brain" src="brain_with_bg.svg" class="img-fluid" style={{ height:"2.65em", marginTop: "0.3em"}} />
     </div> 
    </>
  )
}

function App() {
  return (
    <>
    <div class="container-fluid"> 
      <Header />
      <div class="row justify-content-center bg-light" style={{marginTop: "10px", border:"4px solid #f8f9fa"}}>
        <div class="col bg-light my-sidebar">
          <div class="row"> 
            <FltMList id="filterDx" />
          </div> 
          <div class="row" style={{height: "2em"}}> </div> 
          <div class="row"> 
            <FltMList id="filterRace" />
          </div> 
          <div class="row" style={{height: "2em"}}> </div> 
          <div class="row"> 
            <FltMList id="filterSex" />
          </div> 
          <div class="row" style={{height: "2em"}}> </div> 
          <div class="row"> 
            <FltMList id="filterDataset" />
          </div> 
        </div>
       <div class="col bg-light">
        <div class="col matrixWrap mx-auto ">
          <h4 style={{marginLeft: "-3.6rem"}}>Region Matrix</h4>
          <RMatrix />
        </div>
        <br/> <br/> <br/> <br/>
        </div>
    </div>
  </div> 
  </>
  )
}

export default App;
