export default [

    { title: 'Dashboard', link: 'dashboard', icon: 'mdi-view-dashboard', old: true },
    { title: 'Homepage',  link: '/home', icon: 'mdi-home' },
    {
        title: 'Reports',
        icon: 'mdi-chart-bar',
        pages: [
            { title: 'Balance', link: 'report/balance', old: true },
            { title: 'P&L', link: 'report/profit-and-lost', old: true },
            { title: 'Transaction', link: 'report/transaction', old: true },
            { title: 'Performance', link: '/reports/performance' },
            { title: 'Cash flow', link: 'report/cash-flow-projection', old: true },
            { title: 'Events', link: 'report/check-for-events', old: true },
        ]
    },
    {
        title: 'Data',
        icon: 'mdi-database',
        pages: [
            { title: 'Portfolios', link: 'data/portfolio', old: true },
            { title: 'Registers', link: 'data/portfolio-register', old: true },
            { title: 'Accounts', link: 'data/account', old: true },
            { title: 'Instruments', link: 'data/instrument', old: true },
            { title: 'Counterparties', link: 'data/counterparty', old: true },
            { title: 'Responsibles', link: 'data/responsible', old: true },
            { title: 'Currencies', link: 'data/currency', old: true },
            { title: 'Strategies 1', link: 'data/strategy/1', old: true },
            { title: 'Strategies 2', link: 'data/strategy/2', old: true },
            { title: 'Strategies 3', link: 'data/strategy/3', old: true },
            { title: 'Events', link: 'data/generated-event', old: true },

        ]
    },
    {
        title: 'Transactions',
        icon: 'mdi-history',
        pages: [
            { title: 'Transactions', link: 'data/complex-transaction', old: true },
            { title: 'Base transactions', link: 'data/transaction', old: true },
            { title: 'Register records', link: 'data/portfolio-register-record', old: true },
        ]
    },
    {
        title: 'Valuations',
        icon: 'mdi-layers',
        pages: [
            { title: 'Prices', link: 'data/price-history', old: true},
            { title: 'Prices journal', link: 'data/price-history-error', old: true},
            { title: 'FX rates', link: 'data/currency-history', old: true},
            { title: 'FX rates journal', link: 'data/currency-history-error', old: true},
            { title: 'Run pricing', link: '/valuations/run-pricing' }
        ]
    },
    {
        title: 'Import',
        icon: 'mdi-download',
        pages: [
            { title: 'Data (from file)', link: 'import/simple-entity-import', old: true},
            { title: 'Instrument (from file)', link: 'import/unified-entity-import', old: true},
            { title: 'Transactions (from file)', link: 'import/transaction-import', old: true},
            { title: 'Data and transactions (from file)', link: 'import/complex-import', old: true},
            { title: 'Instrument (from provider)', link: 'import/instrument-import', old: true},
            { title: 'Instrument (from finmars database)', link: 'import/instrument-import-cbonds', old: true},
            { title: 'Prices/FX (from provider)', link: 'import/prices-import', old: true},
            { title: 'Import from bank', link: '/import/bank'},

        ]
    },
    {
        title: 'Journal',
        icon: 'mdi-book',
        pages: [
            { title: 'Instruments audit', link: 'data/audit/instrument', old: true},
            { title: 'Transactions audit', link: 'data/audit/transaction', old: true},
            { title: 'Activity log', link: ''},
            { title: 'System files', link: 'system/file-report', old: true},
        ]
    },
    {
        title: 'Settings',
        icon: 'mdi-settings',
        submenu: [
            {
                title: 'Interface',
                pages: [
                    {
                        title: 'Layouts',
                        link: 'data/audit/transactions',
                        old: true,
                        pages: [
                            { title: 'Entity viewer layouts', link: 'settings/layout', old: true},
                            { title: 'Dashboard layouts', link: 'dashboard-layout', old: true},
                            { title: 'Input form layouts', link: 'settings/input-form-layout', old: true},
                            { title: 'Context menu layouts', link: 'context-menu-layout', old: true},
                            { title: 'Manual sorting', link: 'manual-sorting-layout', old: true},

                        ]
                    },
                    { title: 'Notifications', link: 'settings/notifications', old: true},
                    { title: 'Interface complexity', link: 'settings/interface', old: true},
                ]
            },
            {
                title: 'Configuration',
                pages: [
                    {
                        title: 'Data settings',
                        link: 'data/audit/transactions',
                        old: true,
                        pages: [
                            { title: 'Account types', link: 'settings/account-type', old: true},
                            { title: 'Instument types', link: 'settings/instument-type', old: true},
                            { title: 'Transaction types', link: 'settings/transaction-type', old: true},
                            { title: 'User attributes', link: 'settings/entites-custom-attribute', old: true},
                            { title: 'Reference tables', link: 'import/reference-table', old: true},
                            { title: 'Mapping tables', link: 'import/mapping-tables-import', old: true},
                            { title: 'Templates', link: 'template-layouts', old: true},

                        ]
                    },
                    {
                        title: 'Data settings',
                        link: 'data/audit/transactions',
                        old: true,
                        pages: [
                            { title: 'Account types', link: 'settings/account-type', old: true},
                            { title: 'Instument types', link: 'settings/instument-type', old: true}
                        ]
                    },
                ]
            },
        ]
    }

]
