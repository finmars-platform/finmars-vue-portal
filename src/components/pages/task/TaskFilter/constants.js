export const TASK_STATUSES = [
	{
		value: 'I',
		altValue: 'init',
		title: 'Initializing',
		icon: 'mdi-check-circle',
		color: 'var(--on-secondary-container)',
		bgColor: 'var(--secondary-container)'
	},
	{
		value: 'P',
		altValue: 'progress',
		title: 'Running',
		icon: 'mdi-timer-sand-full',
		color: 'var(--on-secondary-container)',
		bgColor: 'var(--secondary-container)'
	},
	{
		value: 'D',
		altValue: 'success',
		title: 'Success',
		icon: 'mdi-check-circle',
		color: 'var(--on-tertiary-container)',
		bgColor: 'var(--tertiary-container)'
	},
	{
		value: 'E',
		altValue: 'error',
		title: 'Error',
		icon: 'mdi-alert-circle',
		color: 'var(--on-error-container)',
		bgColor: 'var(--error-container)'
	},
	{
		value: 'T',
		altValue: 't',
		title: 'Timed out'
	},
	{
		value: 'C',
		altValue: 'canceled',
		title: 'Canceled',
		icon: 'mdi-cancel',
		color: 'var(--on-secondary-container)',
		bgColor: 'rgba(0, 0, 0, 0.2)'
	},
	{
		value: 'X',
		altValue: 'x',
		title: 'Transaction import aborted'
	},
	{
		value: 'S',
		altValue: 's',
		title: 'Request sent'
	},
	{
		value: 'W',
		altValue: 'w',
		title: 'Awaiting response'
	}
];

export const TASK_TYPES = [
	{
		value: 'attribute_recalculation',
		title: 'attribute_recalculation'
	},
	{
		value: 'bulk_delete',
		title: 'bulk_delete'
	},
	{
		value: 'calculate_balance_report',
		title: 'calculate_balance_report'
	},
	{
		value: 'calculate_pl_report',
		title: 'calculate_pl_report'
	},
	{
		value: 'calculate_portfolio_history',
		title: 'calculate_portfolio_history'
	},
	{
		value: 'calculate_portfolio_reconcile_history',
		title: 'calculate_portfolio_reconcile_history'
	},
	{
		value: 'calculate_portfolio_register_price_history',
		title: 'calculate_portfolio_register_price_history'
	},
	{
		value: 'calculate_portfolio_register_record',
		title: 'calculate_portfolio_register_record'
	},
	{
		value: 'collect_history',
		title: 'collect_history'
	},
	{
		value: 'complex_transaction_user_field_recalculation',
		title: 'complex_transaction_user_field_recalculation'
	},
	{
		value: 'configuration_import',
		title: 'configuration_import'
	},
	{
		value: 'csv_import.simple_import_bulk_insert_final_updates_procedure',
		title: 'csv_import.simple_import_bulk_insert_final_updates_procedure'
	},
	{
		value: 'download_instrument_from_finmars_database',
		title: 'download_instrument_from_finmars_database'
	},
	{
		value: 'execute_expression_procedure',
		title: 'execute_expression_procedure'
	},
	{
		value: 'export_configuration',
		title: 'export_configuration'
	},
	{
		value: 'export_journal_to_storage',
		title: 'export_journal_to_storage'
	},
	{
		value: 'generate_events',
		title: 'generate_events'
	},
	{
		value: 'import_from_database',
		title: 'import_from_database'
	},
	{
		value: 'install_configuration_from_marketplace',
		title: 'install_configuration_from_marketplace'
	},
	{
		value: 'install_initial_configuration',
		title: 'install_initial_configuration'
	},
	{
		value: 'process_bank_file_for_reconcile',
		title: 'process_bank_file_for_reconcile'
	},
	{
		value: 'process_events',
		title: 'process_events'
	},
	{
		value: 'push_configuration_to_marketplace',
		title: 'push_configuration_to_marketplace'
	},
	{
		value: 'simple_import',
		title: 'simple_import'
	},
	{
		value: 'transaction_import',
		title: 'transaction_import'
	},
	{
		value: 'universal_input',
		title: 'universal_input'
	},
	{
		value: 'user_task',
		title: 'user_task'
	},
	{
		value: 'validate_transaction_import',
		title: 'validate_transaction_import'
	}
];

export const TASK_RESULTS = [
	{
		value: 'error',
		title: 'Error'
	},
	{
		value: 'skip',
		title: 'Skip'
	},
	{
		value: 'success',
		title: 'Success'
	}
];
