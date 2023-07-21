import React, { useState } from 'react';
import Handsontable from 'handsontable/base';
import { HotTable } from '@handsontable/react';
import { registerAllModules } from 'handsontable/registry';
import { read, utils } from 'xlsx';

import logo from './logo.svg';
import './App.css';
import 'handsontable/dist/handsontable.full.min.css';


registerAllModules();


function App() {
  const [hotData, setHotData] = useState([]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = (evt) => {
      // Parse the file
      const bstr = evt.target.result;
      const wb = read(bstr, { type: 'binary' });

      // Get first worksheet
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      let data = utils.sheet_to_json(ws, { header: 1 });
      data = data.filter((row) => row.length);

      setHotData(data);
    };
    reader.readAsBinaryString(file);
  }

  return (
    <div className="App">
      <input type="file" onChange={handleFileChange} accept=".xls,.xlsx" />
      <HotTable
        data={hotData}
        rowHeaders={true}
        colHeaders={true}
        height="auto"
        colWidths={100}
        licenseKey="non-commercial-and-evaluation" // for non-commercial use only
      />
    </div>
  );
}

export default App;
