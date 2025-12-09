import React from 'react';
import DataTableContainer from './components/DataTableContainer';
import './styles/DataTable.css';
import AnomalyDetector from './components/AnomalyDetector';
import './components/AnomalyDetector.css';

function App() {
  return (
    <div className="App">
      <AnomalyDetector />
      <DataTableContainer />
      
    </div>
  );
}

export default App;