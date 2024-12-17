export const ERROR_HANDLER_OPTIONS = [
	{ title: 'Continue', value: 'continue' },
	{ title: 'Break on first error', value: 'break' }
];

export const SEPARATORS_OPTIONS = [
	{ title: 'Comma (,)', value: ',' },
	{ title: 'Semicolon (;)', value: ';' },
	{ title: 'Tab', value: '\t' }
];

export const DATA_HANDLER_OPTIONS = [
	{ title: 'Treat as Error', value: 'throw_error' },
	{ title: 'Replace with Default Value', value: 'set_defaults' }
];

export const COLUMN_MATCHER_OPTIONS = [
	{ title: 'Index', value: 'index' },
	{ title: 'Name', value: 'name' }
];

export const BOOK_UNIQUENESS_OPTIONS = [
	{ title: 'Skip', value: 1 },
	{ title: 'Book without Unique Code', value: 2 },
	{ title: 'Overwrite', value: 3 },
	{ title: 'Treat as error', value: 4 }
];
