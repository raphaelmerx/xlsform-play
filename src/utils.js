import { ContextMenu } from 'handsontable/plugins/contextMenu';

export const question_type_autocomplete = [
  'start',
  'end',
  'today',
  'deviceid',
  'phonenumber',
  'username',
  'email',
  'audit',
  'integer',
  'decimal',
  'range',
  'text',
  'select_one [list_name]',
  'select_multiple [list_name]',
  'select_one_from_file [file_name]',
  'select_multiple_from_file [file_name]',
  'rank [options]',
  'note',
  'geopoint',
  'geotrace',
  'geoshape',
  'date',
  'time',
  'dateTime',
  'image',
  'audio',
  'background-audio',
  'video',
  'file',
  'barcode',
  'calculate',
  'acknowledge',
  'hidden',
  'xml-external',
  'begin group',
  'end group',
  'begin repeat',
  'end repeat',
];

const createCallbackInsertRow = row => {
  return function () {
    var latestSelection = this.getSelectedRangeLast().getBottomRightCorner();
    this.alter('insert_row_below', latestSelection.row, 1, 'ContextMenu.rowBelow');
    var newRowIndex = latestSelection.row + 1;
    this.populateFromArray(newRowIndex, 0, [row]);
  };
};

/**
 *
 */
export const surveyContextMenu = {
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
