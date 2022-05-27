export default [

	{ title: 'Dashboard', link: '/dashboard', icon: 'mdi-view-dashboard', old: true },
	{ title: 'Homepage',  link: '/', icon: 'mdi-home' },
	{
		title: 'Reports',
		icon: 'mdi-chart-bar',
		pages: [
			{ title: 'Homepage', link: '/user/test' }
		]
	},
	{
		title: 'Data',
		icon: 'mdi-database',
		pages: [
			{ title: 'Homepage', link: '/user/test' }
		]
	},
	{
		title: 'Transactions',
		icon: 'mdi-history',
		pages: [
			{ title: 'Homepage', link: '/user/test' }
		]
	},
	{
		title: 'Valuations',
		icon: 'mdi-layers',
		pages: [
			{ title: 'Prices', link: '/a/#!/data/pricing' },
			{ title: 'Run pricing', link: '/valuations/run-pricing' }
		]
	},
	{
		title: 'Import',
		icon: 'mdi-download',
		pages: [
			{ title: 'Import from bank', link: '/import/bank' }
		]
	},
	{
		title: 'Journal',
		icon: 'mdi-book',
		pages: [
			{ title: 'Homepage', link: '/user/test' }
		]
	},
	{ title: 'Settings', link: '/user/test', icon: 'mdi-settings' }

]
