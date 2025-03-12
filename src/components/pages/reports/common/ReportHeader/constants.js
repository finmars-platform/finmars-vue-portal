export const MAIN_MENU = [
	{
		type: 'item',
		title: 'New layout',
		icon: 'mdi-plus',
		action: 'layout:create'
	},
	{
		type: 'delimiter',
		action: 'none-1'
	},
	{
		type: 'item',
		title: 'Save',
		icon: 'mdi-content-save-outline',
		action: 'layout:save'
	},
	{
		type: 'item',
		title: 'Save as',
		icon: 'mdi-content-save-outline',
		action: 'layout:save-as'
	},
	{
		type: 'item',
		title: 'Make a copy',
		icon: 'mdi-content-copy',
		action: 'layout:copy'
	},
	{
		type: 'item',
		title: 'Rename',
		icon: 'mdi-rename-outline',
		action: 'layout:rename'
	},
	{
		type: 'item',
		title: 'Edit layout',
		icon: 'mdi-pencil-outline',
		action: 'layout:edit'
	},
	{
		type: 'item',
		title: 'Make default',
		icon: 'mdi-home',
		action: 'layout:make-default'
	},
	{
		type: 'delimiter',
		action: 'none-2'
	},
	{
		type: 'item',
		title: 'Delete',
		icon: 'mdi-delete-outline',
		action: 'layout:delete'
	}
];

export const REPORT_OPTIONS = [
	{
		title: 'AVCO',
		value: 1
	},
	{
		title: 'FIFO',
		value: 2
	}
];
