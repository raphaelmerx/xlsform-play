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

/**
 *
 */
export const surveyContextMenu = {
  items: {
    insert_text_question: {
      name: 'Insert text question',
      callback: function callback() {
        var latestSelection = this.getSelectedRangeLast().getBottomRightCorner();
        this.alter('insert_row_below', latestSelection.row, 1, 'ContextMenu.rowBelow');
        var newRowIndex = latestSelection.row + 1;
        this.populateFromArray(newRowIndex, 0, [['text', 'my_id', 'My Label']]);
      },
    },
    insert_select_one_question: {
      name: 'Insert select one question',
      callback: function callback() {
        var latestSelection = this.getSelectedRangeLast().getBottomRightCorner();
        this.alter('insert_row_below', latestSelection.row, 1, 'ContextMenu.rowBelow');
        var newRowIndex = latestSelection.row + 1;
        this.populateFromArray(newRowIndex, 0, [['select_one [list_name]', 'my_id', 'My Label']]);
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
    sp0: ContextMenu.SEPARATOR,
    row_above: {},
    row_below: {},
    sp1: ContextMenu.SEPARATOR,
    column_left: {},
    column_right: {},
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
