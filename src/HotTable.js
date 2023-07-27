import React from 'react';
import { HotTable } from '@handsontable/react';
import { ContextMenu } from 'handsontable/plugins/contextMenu';

import { xlsform_question_types } from './utils';

export const BaseHotTable = ({ data, ...props }) => (
  <HotTable
    data={data}
    rowHeaders={true}
    colHeaders={true}
    height="100vh"
    licenseKey="non-commercial-and-evaluation" // for non-commercial use only
    dropdownMenu={true}
    manualColumnMove={true}
    manualRowMove={true}
    manualColumnResize={true}
    fixedRowsTop={1}
    contextMenu={true}
    {...props}
  />
);

const createCallbackInsertRow = row => {
  return function () {
    var latestSelection = this.getSelectedRangeLast().getBottomRightCorner();
    this.alter('insert_row_below', latestSelection.row, 1, 'ContextMenu.rowBelow');
    var newRowIndex = latestSelection.row + 1;
    this.populateFromArray(newRowIndex, 0, [row]);
  };
};

export const SurveyHotTable = ({ data, colWidths, updateQuestionIds, questionIds }) => {
  const surveyContextMenu = {
    items: {
      insert_question: {
        name: 'Insert question',
        submenu: {
          items: [
            {
              key: 'insert_question:text',
              name: 'Text',
              callback: createCallbackInsertRow(['text', 'question_id', 'Question Label']),
            },
            {
              key: 'insert_question:select_one',
              name: 'Select one',
              callback: createCallbackInsertRow(['select_one [list_name]', 'question_id', 'Question Label']),
            },
            {
              key: 'insert_question:geopoint',
              name: 'GPS point',
              callback: createCallbackInsertRow(['geopoint', 'store_gps', 'Collect the GPS coordinates of this store']),
            },
            {
              key: 'insert_question:geotrace',
              name: 'GPS trace',
              callback: createCallbackInsertRow(['geotrace', 'pipe', 'Pipeline']),
            },
            {
              key: 'insert_question:image',
              name: 'Image',
              callback: createCallbackInsertRow(['image', 'img', 'Upload an image']),
            },
            {
              key: 'insert_question:audio',
              name: 'Audio',
              callback: createCallbackInsertRow(['audio', 'animal_sound', 'Upload an audio']),
            },
          ],
        },
      },
      insert_group: {
        name: 'Insert group',
        callback: function callback() {
          var latestSelection = this.getSelectedRangeLast().getBottomRightCorner();
          this.alter('insert_row_below', latestSelection.row, 3, 'ContextMenu.rowBelow');

          var groupStartIndex = latestSelection.row + 1;
          this.populateFromArray(groupStartIndex, 0, [['begin group', 'group_id', 'Group label']]);
          this.populateFromArray(groupStartIndex + 1, 0, [['text', 'text_question_id', 'Text question label']]);
          this.populateFromArray(groupStartIndex + 2, 0, [['end group', '', '']]);
        },
      },
      insert_repeat: {
        name: 'Insert repeat',
        callback: function callback() {
          var latestSelection = this.getSelectedRangeLast().getBottomRightCorner();
          this.alter('insert_row_below', latestSelection.row, 3, 'ContextMenu.rowBelow');

          var repeatStartIndex = latestSelection.row + 1;
          this.populateFromArray(repeatStartIndex, 0, [['begin repeat', 'repeat_id', '']]);
          this.populateFromArray(repeatStartIndex + 1, 0, [['text', 'text_question_id', 'Text question label']]);
          this.populateFromArray(repeatStartIndex + 2, 0, [['end repeat', '', '']]);
        },
      },
      sp0: ContextMenu.SEPARATOR,
      row_above: {},
      row_below: {},
      sp1: ContextMenu.SEPARATOR,
      col_left: {},
      col_right: {},
      sp2: ContextMenu.SEPARATOR,
      remove_row: {},
      remove_col: {},
      sp3: ContextMenu.SEPARATOR,
      undo: {},
      redo: {},
      sp4: ContextMenu.SEPARATOR,
      alignment: {},
      copy: {},
      cut: {},
      clear_custom: {
        name: 'Clear all cells (custom)',
        callback: function () {
          this.clear();
        },
      },
    },
  };
  const surveyCellsOption = questionIds => {
    return function (row, col) {
      const cellProperties = {};

      // colour highlighting for groups and repeats
      if (
        ['begin group', 'begin repeat', 'end group', 'end repeat'].indexOf(this.instance.getDataAtCell(row, 0) > -1)
      ) {
        cellProperties.renderer = 'beginGroupRowRenderer';
      }

      // autocomplete using question ids
      if (col === 0) {
        cellProperties.type = 'autocomplete';
        cellProperties.source = xlsform_question_types;
      } else if (col >= 2) {
        cellProperties.type = 'autocomplete';
        cellProperties.source = function (query, process) {
          if (query.includes('${')) {
            process(questionIds.map(value => '${' + value + '}'));
          }
        };
      }

      return cellProperties;
    };
  };
  return (
    <BaseHotTable
      data={data}
      colWidths={colWidths}
      cells={surveyCellsOption(questionIds)}
      contextMenu={surveyContextMenu}
      afterInit={updateQuestionIds}
      afterChange={(changes, source) => {
        changes?.forEach(([row, prop, oldValue, newValue]) => {
          if (prop === 1 && source !== 'loadData') {
            updateQuestionIds();
          }
        });
      }}
    />
  );
};

export const ChoicesHotTable = ({ data, colWidths }) => <BaseHotTable data={data} colWidths={colWidths} />;
