// export const ROLES = [
// 	{
// 		role: 'local.poms.space0i3a2:base-data-manager',
// 		value: [
// 			{
// 				access: true,
// 				key: 'dashboard',
// 				label: 'Dashboard',
// 				icon: 'mdi-view-dashboard',
// 				action: undefined,
// 				to: '',
// 				href: '/dashboard',
// 				style: {},
// 				classes: 'first-side-nav'
// 			},
// 			{
// 				access: true,
// 				key: 'reports',
// 				label: 'Reports',
// 				icon: 'mdi-poll',
// 				action: undefined,
// 				to: '',
// 				href: '',
// 				children: [
// 					{
// 						access: true,
// 						key: 'balance',
// 						label: 'Balance',
// 						action: undefined,
// 						to: '',
// 						href: '/report/balance'
// 					},
// 					{
// 						access: true,
// 						key: 'p&l',
// 						label: 'P&L',
// 						action: undefined,
// 						to: '',
// 						href: '/report/profit-and-lost'
// 					},
// 					{
// 						access: true,
// 						key: 'transaction',
// 						label: 'Transaction',
// 						action: undefined,
// 						to: '',
// 						href: '/report/transaction'
// 					},
// 					{
// 						access: true,
// 						key: 'performance',
// 						label: 'Performance',
// 						action: undefined,
// 						to: '/reports/performance',
// 						href: ''
// 					}
// 				]
// 			},
// 			{
// 				access: true,
// 				key: 'add-ons',
// 				label: 'Add-ons',
// 				icon: 'mdi-puzzle-outline',
// 				action: undefined,
// 				to: '',
// 				href: '',
// 				children: [
// 					{
// 						access: true,
// 						key: 'marketplace',
// 						label: 'Marketplace',
// 						action: undefined,
// 						to: '/marketplace',
// 						href: ''
// 					}
// 				]
// 			}
// 		]
// 	},
// 	{
// 		role: 'local.poms.space0i3a2:member',
// 		value: [{
// 			access: true,
// 			key: 'data',
// 			label: 'Data',
// 			icon: 'mdi-file-tree-outline',
// 			action: undefined,
// 			to: '',
// 			href: '',
// 			children: [
// 				{
// 					access: true,
// 					key: 'portfolios',
// 					label: 'Portfolios',
// 					action: undefined,
// 					to: '',
// 					href: '/data/portfolio'
// 				},
// 				{
// 					access: true,
// 					key: 'registers',
// 					label: 'Registers',
// 					action: undefined,
// 					to: '',
// 					href: '/data/portfolio-register'
// 				},
// 				{
// 					access: true,
// 					key: 'accounts',
// 					label: 'Accounts',
// 					action: undefined,
// 					to: '',
// 					href: '/data/account'
// 				},
// 				{
// 					access: true,
// 					key: 'instruments',
// 					label: 'Instruments',
// 					action: undefined,
// 					to: '',
// 					href: '/data/instrument'
// 				},
// 				{
// 					access: true,
// 					key: 'counterparties',
// 					label: 'Counterparties',
// 					action: undefined,
// 					to: '',
// 					href: '/data/counterparty'
// 				},
// 				{
// 					access: true,
// 					key: 'responsibles',
// 					label: 'Responsibles',
// 					action: undefined,
// 					to: '',
// 					href: '/data/responsible'
// 				},
// 				{
// 					access: true,
// 					key: 'currencies',
// 					label: 'Currencies',
// 					action: undefined,
// 					to: '',
// 					href: '/data/currency'
// 				},
// 				{
// 					access: true,
// 					key: 'strategies',
// 					label: 'Strategies',
// 					action: undefined,
// 					to: '',
// 					href: '/data/strategy/1',
// 					children: [
// 						{
// 							access: true,
// 							key: 'strategies-1',
// 							label: 'Strategies 1',
// 							action: undefined,
// 							to: '',
// 							href: '/data/strategy/1'
// 						},
// 						{
// 							access: true,
// 							key: 'strategies-2',
// 							label: 'Strategies 2',
// 							action: undefined,
// 							to: '',
// 							href: '/data/strategy/2'
// 						},
// 						{
// 							access: true,
// 							key: 'strategies-3',
// 							label: 'Strategies 3',
// 							action: undefined,
// 							to: '',
// 							href: '/data/strategy/3'
// 						}
// 					]
// 				}
// 			]
// 		}, {
// 			access: true,
// 			key: 'transactions',
// 			label: 'Transactions',
// 			icon: 'mdi-swap-vertical',
// 			action: undefined,
// 			to: '',
// 			href: '',
// 			children: [
// 				{
// 					access: true,
// 					key: 'transactions-transactions',
// 					label: 'Transactions',
// 					action: undefined,
// 					to: '',
// 					href: '/data/complex-transaction'
// 				},
// 				{
// 					access: true,
// 					key: 'base-transactions',
// 					label: 'Base Transactions',
// 					action: undefined,
// 					to: '',
// 					href: '/data/transaction'
// 				},
// 				{
// 					access: true,
// 					key: 'register-transactions',
// 					label: 'Register Records',
// 					action: undefined,
// 					to: '',
// 					href: '/data/portfolio-register-record'
// 				}
// 			]
// 		}]
// 	},
// 	{
// 		role: 'local.poms.space0i3a2:full-data-manager',
// 		value: [
// 			{
// 				access: true,
// 				key: 'prices',
// 				label: 'Prices',
// 				action: undefined,
// 				to: '',
// 				href: '/data/price-history'
// 			},
// 			{
// 				access: true,
// 				key: 'import',
// 				label: 'Import',
// 				icon: 'mdi-upload-outline',
// 				action: undefined,
// 				to: '',
// 				href: '',
// 				children: [
// 					{
// 						access: true,
// 						key: 'data-from-file',
// 						label: 'Import data from file',
// 						action: undefined,
// 						to: '/system/simple-import',
// 						href: ''
// 					},
// 					{
// 						access: true,
// 						key: 'transactions-from-file',
// 						label: 'Import transactions from file',
// 						action: undefined,
// 						to: '/system/transaction-import',
// 						href: ''
// 					}
// 				]
// 			}
// 		]
// 	},
// 	{
// 		role: 'local.poms.space0i3a2:configuration-manager',
// 		value: [
// 			{
// 				access: true,
// 				key: 'reconciliation',
// 				label: 'Reconciliation',
// 				icon: 'mdi-scale-balance',
// 				action: undefined,
// 				to: '',
// 				href: '',
// 				children: [
// 					{
// 						access: true,
// 						key: 'Portfolio-Reconcile-Groups',
// 						label: 'Portfolio reconciliation',
// 						action: undefined,
// 						to: '',
// 						href: '/data/portfolio-reconcile-group'
// 					},
// 					{
// 						access: true,
// 						key: 'Reconciliation-History',
// 						label: 'Reconciliation history',
// 						action: undefined,
// 						to: '',
// 						href: '/data/portfolio-reconcile-history'
// 					}
// 				]
// 			},
// 			{
// 				access: true,
// 				key: 'explorer',
// 				label: 'Explorer',
// 				icon: 'mdi-folder-outline',
// 				action: undefined,
// 				to: '/explorer',
// 				classes: 'separator-side-nav',
// 				href: ''
// 			}
// 		]
// 	},
// 	{
// 		role: 'local.poms.space0i3a2:viewer',
// 		value: [{
// 			access: true,
// 			key: 'administration',
// 			label: 'Administration',
// 			icon: 'mdi-shield-account-variant-outline',
// 			action: undefined,
// 			to: '',
// 			href: '',
// 			children: [
// 				{
// 					access: true,
// 					key: 'New-User-Setups',
// 					label: 'New User Setups',
// 					action: undefined,
// 					href: '',
// 					to: '/configuration/initial-setup'
// 				},
// 				{
// 					access: true,
// 					key: 'Permission',
// 					label: 'Permissions',
// 					action: undefined,
// 					to: '',
// 					href: '',
// 					children: [
// 						{
// 							access: true,
// 							key: 'Member',
// 							label: 'Members',
// 							action: undefined,
// 							href: '',
// 							to: '/system/iam/member'
// 						},
// 						{
// 							access: true,
// 							key: 'Group',
// 							label: 'Groups',
// 							action: undefined,
// 							href: '',
// 							to: '/system/iam/group'
// 						},
// 						{
// 							access: true,
// 							key: 'Role',
// 							label: 'Roles',
// 							action: undefined,
// 							href: '',
// 							to: '/system/iam/role'
// 						},
// 						{
// 							access: true,
// 							key: 'Access-policy',
// 							label: 'Access Policy',
// 							action: undefined,
// 							href: '',
// 							to: '/system/iam/access-policy'
// 						},
// 						{
// 							access: true,
// 							key: 'resource-groups',
// 							label: 'Resource Groups',
// 							action: undefined,
// 							href: '',
// 							to: '/system/iam/resource-group'
// 						},
// 						{
// 							access: true,
// 							key: 'navigation',
// 							label: 'Navigation',
// 							action: undefined,
// 							href: '',
// 							to: '/system/iam/navigation'
// 						}
// 					]
// 				},
// 				{
// 					access: true,
// 					key: 'Default-settings',
// 					label: 'Default settings',
// 					action: undefined,
// 					to: '/settings/default-settings',
// 					href: ''
// 				},
// 				{
// 					access: true,
// 					key: 'Recycle-Bin',
// 					label: 'Recycle Bin',
// 					action: undefined,
// 					to: '/system/recycle-bin',
// 					href: ''
// 				},
// 				{
// 					access: true,
// 					key: 'System',
// 					label: 'System',
// 					action: undefined,
// 					to: '/system/dashboard',
// 					href: ''
// 				},
// 				{
// 					access: true,
// 					key: 'Cache',
// 					label: 'Cache',
// 					action: undefined,
// 					to: '',
// 					href: '',
// 					children: [
// 						{
// 							access: true,
// 							key: 'Balance-Report-Instance',
// 							label: 'Balance Report Instance',
// 							action: undefined,
// 							to: '',
// 							href: '/balance-report-instance'
// 						},
// 						{
// 							access: true,
// 							key: 'P&L-Report-Instance',
// 							label: 'P&L Report Instance',
// 							action: undefined,
// 							to: '',
// 							href: '/pl-report-instance'
// 						}
// 					]
// 				},
// 				{
// 					access: true,
// 					key: 'Vault',
// 					label: 'Vault',
// 					action: undefined,
// 					to: '',
// 					href: '',
// 					children: [
// 						{
// 							access: true,
// 							key: 'Vault-Vault',
// 							label: 'Vault',
// 							action: undefined,
// 							to: '',
// 							href: '/vault'
// 						},
// 						{
// 							access: true,
// 							key: 'Vault-Record',
// 							label: 'Vault Record',
// 							action: undefined,
// 							to: '/settings/vault-record',
// 							href: ''
// 						}
// 					]
// 				},
// 				{
// 					access: true,
// 					key: 'Client-Entity',
// 					label: 'Client Entity',
// 					action: undefined,
// 					to: '/settings/client-entity',
// 					href: ''
// 				},
// 				{
// 					access: true,
// 					key: 'White-Label',
// 					label: 'White Label',
// 					action: undefined,
// 					to: '/system/settings/general/',
// 					href: ''
// 				},
// 				{
// 					access: true,
// 					key: 'journal',
// 					label: 'Journal',
// 					action: undefined,
// 					to: '',
// 					href: '/journal'
// 				}
// 			]
// 		}]
// 	}
// ];
//
