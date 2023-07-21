import React, { useState } from 'react';
import Handsontable from 'handsontable/base';
import { HotTable } from '@handsontable/react';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import { registerAllModules } from 'handsontable/registry';

import { Allotment } from "allotment";
import "allotment/dist/style.css";

import 'handsontable/dist/handsontable.full.min.css';
import 'react-tabs/style/react-tabs.css';
import { read, utils, write } from 'xlsx';
import { saveAs } from 'file-saver';


registerAllModules();

function App() {
  const [hotData, setHotData] = useState({});
  const [previewUrl, setPreviewUrl] = useState('');

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = (evt) => {
      // Parse the file
      const bstr = evt.target.result;
      const wb = read(bstr, { type: 'binary' });

      // Get all worksheets
      const sheetNames = wb.SheetNames;
      let sheetsData = {};

      sheetNames.forEach((name) => {
        const ws = wb.Sheets[name];
        let data = utils.sheet_to_json(ws, { header: 1 });
        data = data.filter((row) => row.length);
        
        sheetsData[name] = data;
      });

      setHotData(sheetsData);
    };
    reader.readAsBinaryString(file);
  }

  const constructSpreadsheet = () => {
    const wb = utils.book_new();
    
    Object.keys(hotData).forEach((sheetName) => {
      const ws = utils.aoa_to_sheet(hotData[sheetName]);
      utils.book_append_sheet(wb, ws, sheetName);
    });

    const wbout = write(wb, { bookType: 'xlsx', bookSST: true, type: 'binary' });
    const buf = new ArrayBuffer(wbout.length);
    const view = new Uint8Array(buf);
    
    for(let i=0; i<wbout.length; i++) view[i] = wbout.charCodeAt(i) & 0xFF;
    const fileBlob = new Blob([buf], {type:"application/octet-stream"});
    return fileBlob;

  }

  const handleFileDownload = () => {
    const fileBlob = constructSpreadsheet();
    saveAs(fileBlob, "spreadsheet.xlsx");
  }

  const handleFilePreview = async () => {
    const fileBlob = constructSpreadsheet();

    let formData = new FormData();
    formData.append("file", fileBlob, "spreadsheet.xlsx");
    try {
      const response = await fetch('https://xlsform-online.fly.dev/api/xform/', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const xml_url = data.xml_url;
      const previewUrl = `https://staging.enketo.getodk.org/preview?form=${xml_url}`;
      setPreviewUrl(previewUrl);

    } catch (error) {
      alert('There was a problem with the request:', error)
    }
  }
 
  return (
    <Allotment defaultSizes={[100, 200]} className='scrollable-allotment'>
      <Allotment.Pane minSize={200} preferredSize="80%">
        <div className="App">
          <input type="file" onChange={handleFileChange} accept=".xls,.xlsx" />
          {Object.keys(hotData).length > 0 && (<button onClick={handleFileDownload}>Download</button>)}
          {Object.keys(hotData).length > 0 && (<button onClick={handleFilePreview}>Preview</button>)}
          <Tabs>
            <TabList>
                {Object.keys(hotData).map((sheetName) => (
                <Tab>{sheetName}</Tab>
                ))}
            </TabList>
            {Object.keys(hotData).map((sheetName) => (
              <TabPanel>
                <HotTable
                  data={hotData[sheetName]}
                  rowHeaders={true}
                  colHeaders={true}
                  height="auto"
                  colWidths={100}
                  licenseKey="non-commercial-and-evaluation" // for non-commercial use only
                />
              </TabPanel>
            ))}
          </Tabs>
        </div>
      </Allotment.Pane>
      {previewUrl && (
        <Allotment.Pane minSize={200}>
          <div>
            {previewUrl && <iframe src={previewUrl} title="Preview" className="full-size-iframe" />}
          </div>
        </Allotment.Pane>
      )}
    </Allotment>
  );
}

export default App;
