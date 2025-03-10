export const TABS = [{ label: 'Main' }, { label: 'Default value' }];

export const REPORT_COMPONENT_TABS = [
	{ label: 'Main' },
	{ label: 'Advanced settings' },
	{ label: 'Menu settings' },
	{ label: 'Linking' },
	{ label: 'Calculation' }
];

export const IFRAME_COMPONENT_TABS = [
	{ label: 'Main' },
	{ label: 'Advanced settings' }
];

export const CONTROL_COMPONENT_INITIAL_DEFAULT_SETTINGS = {
	mode: 2,
	entity_type: null,
	layout: null,
	report_field: null,
	setValue: null,
	setValueName: null,
	setValueTitle: null
};

export const CONTENT_TYPES = [
	{
		name: 'Instrument',
		key: 'instruments.instrument'
	},
	{
		name: 'Portfolio',
		key: 'portfolios.portfolio',
		entityType: 'portfolio',
		reportOptionsKey: 'portfolios'
	},
	{
		name: 'Account',
		key: 'accounts.account',
		entityType: 'account',
		reportOptionsKey: 'accounts'
	},
	{
		name: 'Counterparty',
		key: 'counterparties.counterparty'
	},
	{
		name: 'Responsible',
		key: 'counterparties.responsible'
	},
	{
		name: 'Currency',
		key: 'currencies.currency',
		entityType: 'currency',
		reportOptionsKey: 'report_currency'
	},
	{
		name: 'Strategy 1',
		key: 'strategies.strategy1',
		entityType: 'strategy-1',
		reportOptionsKey: 'strategies1'
	},
	{
		name: 'Strategy 2',
		key: 'strategies.strategy2',
		entityType: 'strategy-2',
		reportOptionsKey: 'strategies2'
	},
	{
		name: 'Strategy 3',
		key: 'strategies.strategy3',
		entityType: 'strategy-3',
		reportOptionsKey: 'strategies3'
	},
	{
		name: 'Pricing Policy',
		key: 'instruments.pricingpolicy',
		entityType: 'pricing-policy',
		reportOptionsKey: 'pricing_policy'
	}
];

export const VALUE_TYPES = [
	{ code: 10, name: 'Text' },
	{ code: 20, name: 'Number' },
	{ code: 40, name: 'Date (Deprecated)' },
	{ code: 100, name: 'Relation' }
];

export const REPORT_LAYOUTS_SELECTOR_DATA = [
	{
		key: 'balance-report',
		model: '',
		fieldType: 'dropdownSelect',
		isDefault: true,
		isActive: false,
		sign: '<div class="multitype-field-type-letter">BS</div>',
		name: 'Balance',
		value_type: 100,
		fieldData: {
			smallOptions: { dialogParent: '.dialog-containers-wrap' },
			menuOptions: []
		}
	},
	{
		key: 'pl-report',
		model: '',
		fieldType: 'dropdownSelect',
		isDefault: false,
		isActive: false,
		sign: '<div class="multitype-field-type-letter">PL</div>',
		name: 'Profit & Loss',
		value_type: 100,
		fieldData: {
			smallOptions: { dialogParent: '.dialog-containers-wrap' },
			menuOptions: []
		}
	},
	{
		key: 'transaction-report',
		model: '',
		fieldType: 'dropdownSelect',
		isDefault: false,
		isActive: false,
		sign: '<div class="multitype-field-type-letter">TR</div>',
		name: 'Transactions',
		value_type: 100,
		fieldData: {
			smallOptions: { dialogParent: '.dialog-containers-wrap' },
			menuOptions: []
		}
	}
];

export const DEFAULT_VALUE_REPORT_FIELDS = {
	'balance-report': [{ key: 'report_date', name: 'Date' }],
	'pl-report': [
		{ key: 'pl_first_date', name: 'Date from (excl)' },
		{ key: 'report_date', name: 'Date to (incl)' }
	],
	'transaction-report': [
		{ key: 'begin_date', name: 'Date from (incl)' },
		{ key: 'end_date', name: 'Date to (incl)' }
	]
};

export const COMPONENTS_FOR_LINKING = [
	'report_viewer',
	'report_viewer_split_panel',
	'report_viewer_matrix',
	'report_viewer_bars_chart',
	'report_viewer_pie_chart',
	'report_viewer_grand_total',
	'report_viewer_table_chart'
];

export const ENTITY_TYPE_OPTIONS = [
	{ title: 'Balance Report', value: 'balance' },
	{ title: 'P&L Report', value: 'pl-report' },
	{ title: 'Transaction Report', value: 'transaction-report' }
];

export const TEXT_CELL_ALIGN_STYLES = [
	{ title: 'Left', value: 'left' },
	{ title: 'Center', value: 'center' },
	{ title: 'Right', value: 'right' }
];

export const SUBTOTAL_FORMULA_OPTIONS = [
	{ title: 'SUM', value: 1 },
	{ title: 'Weighted Market Value', value: 2 },
	{ title: 'Weighted Market Value %', value: 3 },
	{ title: 'Weighted Exposure', value: 4 },
	{ title: 'Weighted Exposure %', value: 5 },
	{ title: 'Avg. Weighted Market Value', value: 6 },
	{ title: 'Avg. Weighted Market Value %', value: 7 },
	{ title: 'Avg. Weighted Exposure', value: 8 },
	{ title: 'Avg. Weighted Exposure %', value: 9 }
];

export const MATRIX_TYPE_OPTIONS = [
	{ title: 'Ordinary', value: 'usual' },
	{ title: 'With fixed totals', value: 'fixed-totals' }
];

export const MATRIX_HIDE_EMPTY_COLUMNS_OPTIONS = [
	{ title: 'Hide columns', value: 'columns' },
	{ title: 'Hide rows', value: 'rows' },
	{ title: 'Hide columns and rows', value: 'columns_rows' }
];
