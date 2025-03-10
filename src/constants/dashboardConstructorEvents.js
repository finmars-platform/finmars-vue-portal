export const DASHBOARD_CONSTRUCTOR_EVENTS = {
	UPDATE_DASHBOARD_CONSTRUCTOR: 'UPDATE_DASHBOARD_CONSTRUCTOR',
	UPDATE_GRID_CELLS_SIZE: 'UPDATE_GRID_CELLS_SIZE',
	DRAG_COMPONENT: 'DRAG_COMPONENT',
	DRAGEND_COMPONENT: 'DRAGEND_COMPONENT'
};

export const DASHBOARD_CONSTRUCTOR_COMPONENTS_AVAILABLE_FOR_CREATION = [
	{ title: 'Add Accordion', value: 'accordion' },
	{ title: 'Add Date Control', value: 'control_date' },
	{ title: 'Add Relation Control', value: 'control_relation' },
	{ title: 'Add Button set', value: 'button_set' },
	{ title: 'Report Viewer', value: 'report_viewer' },
	{ title: 'Report Viewer Matrix', value: 'report_viewer_matrix' },
	{ title: 'Apex Chart', value: 'apex_chart' },
	{ title: 'Iframe', value: 'iframe' }
];
