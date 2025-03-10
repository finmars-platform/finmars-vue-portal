export const portfolioReconcileHistoryAttributes = [
	{
		key: 'id',
		name: 'ID',
		value_type: 20
	},
	{
		key: 'user_code',
		name: 'User code',
		value_type: 10
	},
	{
		key: 'error_message',
		name: 'Error Message',
		value_type: 10
	},
	{
		key: 'verbose_result',
		name: 'Verbose Result',
		value_type: 10
	},
	{
		key: 'status',
		name: 'Status',
		value_type: 10
	},
	{
		key: 'portfolio_reconcile_group',
		name: 'Portfolio Reconcile Group',
		value_content_type: 'portfolios.portfolioreconcilegroup',
		value_entity: 'portfolio-reconcile-group',
		code: 'user_code',
		value_type: 'field'
	},
	{
		key: 'date',
		name: 'Date',
		value_type: 40
	},
	{
		key: 'file_report',
		name: 'File Report',
		value_type: 'attachment'
	}
];
