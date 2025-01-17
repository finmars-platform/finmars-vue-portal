export const CHANNEL_ACTIONS = [
	{
		title: 'Mark all as read',
		value: 'mark',
		icon: 'mdi-message-check-outline',
		disabled: true
	},
	{
		title: 'Open Channel Details',
		value: 'details',
		icon: 'mdi-information-outline'
	},
	{
		title: 'Notification Settings',
		value: 'settings',
		icon: 'mdi-cog-outline',
		disabled: true
	},
	{ title: 'Leave Channel', value: 'leave', icon: 'mdi-logout-variant' }
];

export const CHANNEL_MUTE_ACTIONS = {
	title: 'Mute Channel',
	value: 'mute',
	icon: 'mdi-bell-off-outline',
	disabled: true,
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
	icon: 'mdi-bell-ring-outline',
	disabled: true
};
