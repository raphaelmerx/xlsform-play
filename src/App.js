import React, { useState } from 'react';
import { BaseHotTable, SurveyHotTable, ChoicesHotTable, beginGroupRowRenderer } from './HotTable';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import { registerAllModules } from 'handsontable/registry';
import { registerRenderer } from 'handsontable/renderers';

import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';

import { Allotment } from 'allotment';
import 'allotment/dist/style.css';

import 'handsontable/dist/handsontable.full.min.css';
import 'react-tabs/style/react-tabs.css';
import { constructSpreadsheet, getSheetsData } from './utils';
import { saveAs } from 'file-saver';

registerAllModules();
registerRenderer('beginGroupRowRenderer', beginGroupRowRenderer);

function App() {
  const [hotData, setHotData] = useState({});
  const [colWidths, setColWidths] = useState({});
  const [selectedFile, setSelectedFile] = useState('');
  const [previewUrl, setPreviewUrl] = useState('');
  const [questionIds, setQuestionIds] = useState([]);
  const [listNames, setListNames] = useState([]);

  const updateQuestionIds = () => {
    const newQuestionIds = hotData['survey']
      ?.slice(1)
      .map(row => row[1])
      .filter(Boolean)
      .reverse();

    setQuestionIds(newQuestionIds);
  };

  const updateListNames = () => {
    const newChoices = hotData['choices']
      ?.slice(1)
      .map(row => row[0])
      .filter(Boolean);
    setListNames([...new Set(newChoices)]);
  };

  React.useEffect(() => {
    updateListNames();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hotData.choices]);

  const handleFileUpload = e => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = evt => {
      const bstr = evt.target.result;
      const { sheetsData, sheetColumnWidths } = getSheetsData(bstr);
      setHotData(sheetsData);
      setColWidths(sheetColumnWidths);
    };
    if (file) reader.readAsBinaryString(file);
    setSelectedFile('');
  };

  const handleSelectChange = async event => {
    const fileName = event.target.value;
    setSelectedFile(fileName);
    if (!fileName) return;

    const response = await fetch(`/xlsform_examples/${fileName}`);
    const blob = await response.blob();
    var file = new File([blob], fileName, {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    const reader = new FileReader();
    reader.onload = async evt => {
      const bstr = evt.target.result;
      const { sheetsData, sheetColumnWidths } = getSheetsData(bstr);
      setHotData(sheetsData);
      setColWidths(sheetColumnWidths);
    };
    reader.readAsArrayBuffer(file);
  };

  const handleFileDownload = () => {
    const fileBlob = constructSpreadsheet(hotData);
    saveAs(fileBlob, 'spreadsheet.xlsx');
  };

  const handleFilePreview = async () => {
    const fileBlob = constructSpreadsheet(hotData);

    let formData = new FormData();
    formData.append('file', fileBlob, 'spreadsheet.xlsx');
    try {
      const url =
        process.env.NODE_ENV === 'development'
          ? 'http://localhost:8000/api/xform/'
          : 'https://xlsform-online.fly.dev/api/xform/';
      const response = await fetch(url, {
        method: 'POST',
        body: formData,
      });

      // if it's a 400 error, show the message in response.json()["error"]
      if (response.status === 400) {
        const data = await response.json();
        alert(data['error']);
        return;
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const xml_url = data.xml_url;
      const previewUrl = `https://staging.enketo.getodk.org/preview?form=${xml_url}`;
      setPreviewUrl(previewUrl);
    } catch (error) {
      alert('There was a problem with the request:', error);
    }
  };

  return (
    <Allotment defaultSizes={[100, 200]} className="scrollable-allotment">
      <Allotment.Pane minSize={200} preferredSize="80%">
        <div className="App">
          <Grid container spacing={1} direction="row" alignItems={'center'} marginBottom={2} marginLeft={2}>
            <Grid item md={2} xs={4} textAlign={'left'}>
              <input
                accept=".xls,.xlsx"
                style={{ display: 'none' }}
                id="raised-button-file"
                type="file"
                onChange={handleFileUpload}
              />
              <label htmlFor="raised-button-file">
                <Button variant="outlined" component="span">
                  Upload File
                </Button>
              </label>
            </Grid>
            <Grid item md={1} xs={2} textAlign={'left'}>
              <Box> OR </Box>
            </Grid>
            <Grid item md={5} xs={7} textAlign={'left'}>
              <FormControl variant="standard" sx={{ m: 1, minWidth: 200 }}>
                <InputLabel id="example-file-select">Select an example file</InputLabel>
                <Select labelId="example-file-select" value={selectedFile} onChange={handleSelectChange}>
                  <MenuItem value="starter.xlsx">starter.xlsx</MenuItem>
                  <MenuItem value="anc_visit.xlsx">anc_visit.xlsx</MenuItem>
                  <MenuItem value="baseline_household_survey.xlsx">baseline_household_survey.xlsx</MenuItem>
                  <MenuItem value="fatal_injury_surveillance_form.xlsx">fatal_injury_surveillance_form.xlsx</MenuItem>
                  <MenuItem value="household_water_survey.xlsx">household_water_survey.xlsx</MenuItem>
                  <MenuItem value="monthly_project_report.xlsx">monthly_project_report.xlsx</MenuItem>
                  <MenuItem value="shelter_material_survey.xlsx">shelter_material_survey.xlsx</MenuItem>
                  <MenuItem value="spraying_survey.xlsx">spraying_survey.xlsx</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            {Object.keys(hotData).length > 0 && (
              <>
                <Grid item md={2} xs={6} textAlign={'center'}>
                  <Button variant="outlined" onClick={handleFileDownload}>
                    Download
                  </Button>
                </Grid>
                <Grid item md={2} xs={6} textAlign={'center'}>
                  <Button variant="contained" onClick={handleFilePreview}>
                    Preview
                  </Button>
                </Grid>
              </>
            )}
          </Grid>

          <Tabs>
            <TabList>
              {Object.keys(hotData).map(sheetName => (
                <Tab key={sheetName}>{sheetName}</Tab>
              ))}
            </TabList>
            {Object.keys(hotData).map(sheetName => (
              <TabPanel key={`${selectedFile}_${sheetName}`}>
                {sheetName === 'survey' ? (
                  <SurveyHotTable
                    data={hotData[sheetName]}
                    colWidths={colWidths[sheetName]}
                    updateQuestionIds={updateQuestionIds}
                    questionIds={questionIds}
                    listNames={listNames}
                  />
                ) : sheetName === 'choices' ? (
                  <ChoicesHotTable
                    data={hotData[sheetName]}
                    colWidths={colWidths[sheetName]}
                    updateListNames={updateListNames}
                  />
                ) : (
                  <BaseHotTable data={hotData[sheetName]} />
                )}
              </TabPanel>
            ))}
          </Tabs>
        </div>
      </Allotment.Pane>
      {previewUrl && (
        <Allotment.Pane minSize={200}>
          <div>{previewUrl && <iframe src={previewUrl} title="Preview" className="full-size-iframe" />}</div>
        </Allotment.Pane>
      )}
    </Allotment>
  );
}

export default App;
