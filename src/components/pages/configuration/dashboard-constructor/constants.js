import ControlRelationComponentDialog from '~/components/modal/DashboardConstructor/ControlRelationComponentDialog/ControlRelationComponentDialog.vue';
import ControlDateComponentDialog from '~/components/modal/DashboardConstructor/ControlDateComponentDialog/ControlDateComponentDialog.vue';
import ControlAccordionComponentDialog from '~/components/modal/DashboardConstructor/ControlAccordionComponentDialog/ControlAccordionComponentDialog.vue';
import ReportViewerComponentDialog from '~/components/modal/DashboardConstructor/ReportViewerComponentDialog/ReportViewerComponentDialog.vue';
import ReportViewerMatrixComponentDialog from '~/components/modal/DashboardConstructor/ReportViewerMatrixComponentDialog/ReportViewerMatrixComponentDialog.vue';
import ButtonSetComponentDialog from '~/components/modal/DashboardConstructor/ButtonSetComponentDialog/ButtonSetComponentDialog.vue';
import ApexChartComponentDialog from '~/components/modal/DashboardConstructor/ApexChartComponentDialog/ApexChartComponentDialog.vue';
import IframeComponentDialog from '~/components/modal/DashboardConstructor/IframeComponentDialog/IframeComponentDialog.vue';

export const VERBOSE_NAME_BY_TYPE = {
	report_viewer: 'Report Viewer',
	report_viewer_split_panel: 'Report Viewer',
	report_viewer_grand_total: 'Report Viewer Grand Total',
	report_viewer_bars_chart: 'Report Viewer Charts',
	report_viewer_pie_chart: 'Report Viewer Charts',
	report_viewer_matrix: 'Report Viewer Matrix',
	report_viewer_table_chart: 'Report Viewer Table Chart',
	entity_viewer: 'Entity Viewer',
	entity_viewer_split_panel: 'Entity Viewer Split Panel',
	input_form: 'Input Form',
	accordion: 'Accordion',
	control: 'Control',
	button_set: 'Button Set',
	superset_dashboard: 'Superset Dashboard',
	finmars_widget: 'Finmars Widget',
	apex_chart: 'Apex Chart',
	iframe: 'Iframe'
};

export const DIALOG_COMPONENT_BY_TYPE = {
	control_relation: {
		component: ControlRelationComponentDialog,
		title: 'Control Relation Component'
	},
	control_date: {
		component: ControlDateComponentDialog,
		title: 'Control Date Component'
	},
	accordion: {
		component: ControlAccordionComponentDialog,
		title: 'Control Accordion'
	},
	report_viewer: {
		component: ReportViewerComponentDialog,
		title: 'Report Viewer Component'
	},
	report_viewer_split_panel: {
		component: ReportViewerComponentDialog,
		title: 'Report Viewer Component'
	},
	report_viewer_matrix: {
		component: ReportViewerMatrixComponentDialog,
		title: 'Report Viewer Matrix Component'
	},
	button_set: {
		component: ButtonSetComponentDialog,
		title: 'Button Set Component'
	},
	apex_chart: {
		component: ApexChartComponentDialog,
		title: 'New Apex Chart Component'
	},
	iframe: {
		component: IframeComponentDialog,
		title: 'Iframe Component'
	}
};
