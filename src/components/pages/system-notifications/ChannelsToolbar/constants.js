export const CHANNEL_ACTIONS = [
	{
		title: 'Mark all as read',
		value: 'mark',
		icon: 'mdi-message-check-outline'
	},
	{
		title: 'Open Channel Details',
		value: 'details',
		icon: 'mdi-information-outline'
	},
	{
		title: 'Notification Settings',
		value: 'settings',
		icon: 'mdi-cog-outline'
	},
	{ title: 'Leave Channel', value: 'leave', icon: 'mdi-logout-variant' }
];

export const CHANNEL_MUTE_ACTIONS = {
	title: 'Mute Channel',
	value: 'mute',
	icon: 'mdi-bell-off-outline',
	children: [
		{
			title: 'Mute for 1 hour',
			value: 'mute:hour',
			icon: 'mdi-bell-off-outline'
		},
		{ title: 'Mute for...', value: 'mute:any', icon: 'mdi-bell-off-outline' },
		{
			title: 'Mute forever',
			value: 'mute:forever',
			icon: 'mdi-bell-off-outline'
		}
	]
};

export const CHANNEL_UNMUTE_ACTIONS = {
	title: 'Unmute Channel',
	value: 'unmute',
	icon: 'mdi-bell-ring-outline'
};

export const MESSAGE_TYPES = [
	{
		title: 'All types',
		value: 'all',
		icon: 'mdi-check-all',
		iconColor: 'var(--tertiary)'
	},
	{
		title: 'Success messages',
		value: 'success',
		icon: 'mdi-check-circle-outline',
		iconColor: 'var(--tertiary)'
	},
	{
		title: 'Warning messages',
		value: 'warning',
		icon: 'mdi-alert-outline',
		iconColor: 'var(--primary)'
	},
	{
		title: 'Error messages',
		value: 'error',
		icon: 'mdi-alert-circle',
		iconColor: 'var(--error)'
	},
	{
		title: 'Information messages',
		value: 'info',
		icon: 'mdi-information-outline',
		iconColor: 'var(--secondary)'
	}
];

export const MODULES = [
	{ title: 'All modules', value: 'all' },
	{ title: 'Module 1', value: 'module1' },
	{ title: 'Module 2', value: 'module2' },
	{ title: 'Module 3', value: 'module3' },
	{ title: 'Module 4', value: 'module4' },
	{ title: 'Module 5', value: 'module5' }
];

export const PORTFOLIOS = [
	{ title: 'All portfolios', value: 'all' },
	{ title: 'Portfolio 1', value: 'portfolio1' },
	{ title: 'Portfolio 2', value: 'portfolio2' },
	{ title: 'Portfolio 3', value: 'portfolio3' },
	{ title: 'Portfolio 4', value: 'portfolio4' },
	{ title: 'Portfolio 5', value: 'portfolio5' }
];
