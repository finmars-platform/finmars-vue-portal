export default {
	CELL_VALUE_CHANGED: 'CELL_VALUE_CHANGED',
	SELECTOR_INSIDE_CELL_OPENED: 'SELECTOR_INSIDE_CELL_OPENED',
	UPDATE_CELLS_CONTENT: 'UPDATE_CELLS_CONTENT', // use to update visible content of cells, if data changed outside grid table
	ROW_ADDED: 'ROW_ADDED',
	ROW_DELETED: 'ROW_DELETED',

	ROW_SELECTION_TOGGLED: 'ROW_SELECTION_TOGGLED',
	SORTING_SETTINGS_CHANGED: 'SORTING_SETTINGS_CHANGED',

	REDRAW_TABLE: 'REDRAW_TABLE', // property 'key' of rows and columns used to find matching data inside gridTableData
}
