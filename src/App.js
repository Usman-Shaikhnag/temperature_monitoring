import React, { useState, useRef, useEffect } from 'react';
import ExcelImporter from './components/ExcelImporter';
import ColumnSelector from './components/ColumnSelector';
import ColumnManager from './components/ColumnManager';
import DataGrid from './components/DataGrid';
import LineCharts from './charts/LineCharts';
import WordReport from './components/WordReport';
import html2canvas from 'html2canvas';
import styles from './App.module.css';
import TemperatureMonitoring from './components/TemperatureMonitoring';
import { BrowserRouter, Routes, Route, Link, Outlet } from 'react-router-dom';
import NotFound from './components/NotFound';


const App = () => {

  

  return (
    <>
      <BrowserRouter>
        {/* <TemperatureMonitoring /> */}
        <Routes>
          <Route path="/" element={<TemperatureMonitoring />}/>
          <Route path="/temp_monitoring/*" element={<TemperatureMonitoring />}/>
          <Route path="/*" element={<NotFound />}/>
        </Routes>
      </BrowserRouter>
    </>
  );
};

export default App;
