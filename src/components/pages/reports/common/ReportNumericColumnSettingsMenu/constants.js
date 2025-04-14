export const REPORT_NUMERIC_COLUMN_MENU_ITEMS = [
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
		available: ['group', 'item']
	},
	{
		type: 'menu-item',
		action: 'format:number',
		title: 'Number Format',
		available: ['group', 'item']
	},
	{
		type: 'delimiter',
		action: 'none-2',
		available: ['group', 'item']
	},
	{
		type: 'menu-item',
		action: 'subtotal:sum',
		title: 'Subtotal SUM',
		available: ['group', 'item']
	},
	{
		type: 'menu-item',
		action: 'subtotal:weighted',
		title: 'Subtotal Weighted',
		available: ['group', 'item']
	},
	{
		type: 'menu-item',
		action: 'subtotal:av-weighted',
		title: 'Subtotal Avg. Weighted',
		available: ['group', 'item']
	},
	{
		type: 'menu-item',
		action: 'hide:total',
		title: ['Show Grand Total', 'Hide Grand Total'],
		available: ['group', 'item']
	},
	{
		type: 'delimiter',
		action: 'none-3',
		available: ['group', 'item']
	},
	{
		type: 'menu-item',
		action: 'format:number:market',
		title: 'Market Value',
		available: ['group', 'item']
	},
	{
		type: 'menu-item',
		action: 'format:number:market:percentage',
		title: 'Market Value %',
		available: ['group', 'item']
	},
	{
		type: 'menu-item',
		action: 'format:number:exposure',
		title: 'Exposure',
		available: ['group', 'item']
	},
	{
		type: 'menu-item',
		action: 'format:number:exposure:percentage',
		title: 'Exposure %',
		available: ['group', 'item']
	},
	{
		type: 'delimiter',
		action: 'none-4',
		available: ['group', 'item']
	},
	{
		type: 'menu-item',
		action: 'alignment',
		available: ['item']
	},
	{
		type: 'delimiter',
		action: 'none-5',
		available: ['group', 'item']
	},
	{
		type: 'menu-item',
		action: 'remove',
		title: 'Remove',
		available: ['group', 'item']
	}
];
