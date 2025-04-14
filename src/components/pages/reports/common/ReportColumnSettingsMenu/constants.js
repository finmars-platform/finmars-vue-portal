export const REPORT_COLUMN_MENU_ITEMS = [
	// {
	// 	type: 'menu-item',
	// 	action: 'subtotal:top',
	// 	title: 'Subtotal on Top',
	// 	available: ['group']
	// },
	// {
	// 	type: 'menu-item',
	// 	action: 'subtotal:bottom',
	// 	title: 'Subtotal on Top and Bottom',
	// 	available: ['group']
	// },
	// {
	// 	type: 'menu-item',
	// 	action: 'subtotal:both',
	// 	title: 'Subtotal on Top',
	// 	available: ['group']
	// },
	{
		type: 'menu-item',
		action: 'rename',
		title: 'Rename',
		available: ['item', 'group']
	},
	{
		type: 'menu-item',
		action: 'remove:group',
		title: 'Upgroup',
		available: ['group']
	},
	{
		type: 'menu-item',
		action: 'add:group',
		title: 'Add to grouping',
		available: ['item']
	},
	{
		type: 'menu-item',
		action: 'add:filter',
		title: 'Add to filters',
		available: ['group', 'item']
	},
	{
		type: 'delimiter',
		action: 'none-1',
		available: ['item']
	},
	{
		type: 'menu-item',
		action: 'alignment',
		available: ['item']
	},
	{
		type: 'delimiter',
		action: 'none-2',
		available: ['item']
	},
	{
		type: 'menu-item',
		action: 'remove',
		title: 'Remove',
		available: ['group', 'item']
	}
];
