let host = useRuntimeConfig().public.apiURL;
let prefix = host + '/{client}/api/v1';
let uDatabasePrefix = 'https://database.finmars.com/api/v1';

export default {
	pricingProc: {
		get: prefix + '/procedures/pricing-procedure/',
		post: prefix + '/procedures/pricing-procedure/{id}/run-procedure/',
		put: prefix + '/procedures/pricing-procedure/{id}/'
	},
	pricingProcId: {
		get: prefix + '/procedures/pricing-procedure/{id}/',
		put: prefix + '/procedures/pricing-procedure/{id}/'
	},
	pricingProcInstance: {
		get: prefix + '/procedures/pricing-parent-procedure-instance/'
	},

	instrumentList: {
		get: prefix + '/instruments/instrument/'
	},
	instrumentListLight: {
		get: prefix + '/instruments/instrument/light/'
	},

	instrumentTypeList: {
		get: prefix + '/instruments/instrument-type/'
	},
	instrumentSizeDetail: {
		get: prefix + '/instruments/payment-size-detail/'
	},
	instrumentPeriodicity: {
		get: prefix + '/instruments/periodicity/'
	},

	instrumentSchemeList: {
		get: prefix + '/pricing/instrument-pricing-scheme/'
	},
	instrumentType: {
		get: prefix + '/instruments/instrument-type/light/'
	},
	instrumentAccrualCalculationModel: {
		get: prefix + '/instruments/accrual-calculation-model/'
	},
	instrumentClass: {
		get: prefix + '/instruments/instrument-class/'
	},

	instrumentPricingCondition: {
		get: prefix + '/instruments/pricing-condition/'
	},

	pricingPolicyList: {
		get: prefix + '/instruments/pricing-policy/'
	},
	pricingPolicy: {
		get: prefix + '/instruments/pricing-policy/{id}/',
		post: prefix + '/instruments/pricing-policy/',
		delete: prefix + '/instruments/pricing-policy/{id}/',
		put: prefix + '/instruments/pricing-policy/{id}/'
	},
	pricingPolicyListLight: {
		get: prefix + '/instruments/pricing-policy/light/'
	},
	currencyList: {
		get: prefix + '/currencies/currency/'
	},
	currencyListLight: {
		get: prefix + '/currencies/currency/light/'
	},
	currencySchemeList: {
		get: prefix + '/pricing/currency-pricing-scheme/'
	},
	currencyDatabaseSearch: {
		// get: prefix + '/api/currencies/currency-database-search/',
		get: uDatabasePrefix + '/currency/'
	},
	importCurrencyFmDb: {
		post: prefix + '/import/finmars-database/currency/'
	},
	portfolioList: {
		get: prefix + '/portfolios/portfolio/'
	},
	portfolioListLight: {
		get: prefix + '/portfolios/portfolio/light/'
	},
	accountLight: {
		get: prefix + '/accounts/account/light/'
	},
	accountTypeList: {
		get: prefix + '/accounts/account-type/'
	},
	counterpartyList: {
		get: prefix + '/counterparties/counterparty/'
	},
	counterpartyResponsibleLight: {
		get: prefix + '/counterparties/responsible/light/'
	},
	responsibleGroupList: {
		get: prefix + '/counterparties/responsible-group/'
	},
	counterpartyCounterpartyLight: {
		get: prefix + '/counterparties/counterparty/light/'
	},
	counterpartyDatabaseSearch: {
		get: uDatabasePrefix + '/company/'
	},
	counterpartyGroupList: {
		get: prefix + '/counterparties/counterparty-group/'
	},
	importCounterpartyFmDb: {
		post: prefix + '/import/finmars-database/company/'
	},

	complexTransactionBulkRestore: {
		post: prefix + '/transactions/complex-transaction/bulk-restore/'
	},
	complexTransactionBulkDelete: {
		post: prefix + '/transactions/complex-transaction/bulk-delete/'
	},

	importBankProc: {
		get: prefix + '/procedures/request-data-procedure/'
	},
	importBankProcId: {
		get: prefix + '/procedures/request-data-procedure/{id}/',
		put: prefix + '/procedures/request-data-procedure/{id}/'
	},

	dataProvider: {
		get: prefix + '/integrations/data-provider/'
	},

	/* Probably deprecated
	importUnifiedData: {
		post: prefix + 'import/unified-data-provider/',
	},*/

	dataInstance: {
		get: prefix + '/procedures/data-procedure-instance/'
	},
	importSchemeLight: {
		get: prefix + '/import/complex-transaction-import-scheme/light/'
	},
	importSchemeInstance: {
		get: prefix + '/import/complex-transaction-import-scheme/{id}/',
		post: prefix + '/import/complex-transaction-import-scheme/',
		patch: prefix + `/import/complex-transaction-import-scheme/{id}/`
	},
	configurationList: {
		get: prefix + '/configuration/configuration/'
	},
	memberList: {
		get: prefix + '/users/member/'
	},
	member: {
		get: prefix + '/users/member/{id}/',
		post: prefix + '/users/member/',
		delete: prefix + '/users/member/{id}/',
		put: prefix + '/users/member/{id}/'
	},
	memberLayout: {
		get: prefix + '/ui/member-layout/',
		put: prefix + '/ui/member-layout/{id}/'
	},
	memberSendInvite: {
		put: prefix + '/users/member/{id}/send-invite/'
	},
	userGroups: {
		get: prefix + '/iam/group/'
	},

	portfolioRegisterList: {
		get: prefix + '/portfolios/portfolio-register/',
		post: prefix + '/portfolios/portfolio-register/'
	},
	portfolioRegisterEvFiltered: {
		post: prefix + '/portfolios/portfolio-register/ev-item/'
	},
	performanceReport: {
		post: prefix + '/reports/performance-report/'
	},
	transactionReport: {
		post: prefix + '/reports/transaction-report/'
	},
	systemMessagesStats: {
		get: prefix + '/system-messages/message/stats/'
	},
	systemMessages: {
		get: prefix + '/system-messages/message/'
	},
	systemMessagesOne: {
		get: prefix + '/system-messages/message/{id}/'
	},
	systemMessagesRead: {
		post: prefix + '/system-messages/message/mark-as-read/'
	},
	systemMessagesPin: {
		post: prefix + '/system-messages/message/pin/'
	},
	systemMessagesUnpin: {
		post: prefix + '/system-messages/message/unpin/'
	},
	systemMessagesSolved: {
		post: prefix + '/system-messages/message/mark-as-solved/'
	},

	instrumentsEvent: {
		get: prefix + '/instruments/generated-event/{id}/'
	},
	instrumentsEventBook: {
		get: prefix + '/instruments/generated-event/{id}/book/',
		put: prefix + '/instruments/generated-event/{id}/book/'
	},
	instrumentsEventInformed: {
		put: prefix + '/instruments/generated-event/{id}/informed/'
	},
	instrumentUserFieldList: {
		get: prefix + '/ui/instrument-user-field/'
	},
	instrumentUserField: {
		put: prefix + '/ui/instrument-user-field/{id}/',
		post: prefix + '/ui/instrument-user-field/'
	},

	listLayoutList: {
		get: prefix + '/ui/list-layout/'
	},
	listLayoutListLight: {
		get: prefix + '/ui/list-layout/light/'
	},
	listLayout: {
		get: prefix + '/ui/list-layout/{id}/',
		put: prefix + '/ui/list-layout/{id}/',
		post: prefix + '/ui/list-layout/',
		delete: prefix + '/ui/list-layout/{id}/'
	},
	listLayoutPing: {
		get: prefix + '/ui/list-layout/{id}/ping'
	},
	defaultListLayout: {
		get: prefix + '/ui/list-layout/?is_default=2&content_type={content_type}'
	},
	ecosystemDefaults: {
		get: prefix + '/users/ecosystem-default/'
	},
	balanceReport: {
		get: prefix + 'reports/balance-report/'
	},
	balanceReportAttributes: {
		get: prefix + '/reports/balance-report/attributes/'
	},
	portfolioBundleRegistersList: {
		get: prefix + '/portfolios/portfolio-bundle/{id}/portfolio-registers/'
	},
	portfolioBundleList: {
		get: prefix + '/portfolios/portfolio-bundle/'
	},
	portfolioBundle: {
		post: prefix + '/portfolios/portfolio-bundle/',
		get: prefix + '/portfolios/portfolio-bundle/{id}/',
		put: prefix + '/portfolios/portfolio-bundle/{id}/',
		delete: prefix + '/portfolios/portfolio-bundle/{id}/'
	},
	performanceFirstTransaction: {
		get:
			prefix + '/reports/performance-report/first-transaction-date/?bundle={id}'
	},
	interfaceAccess: {
		get: prefix + '/ui/portal-interface-access/'
	},
	newMemberSetupConfig: {
		get: prefix + '/configuration/new-member-setup-configuration/',
		put: prefix + '/configuration/new-member-setup-configuration/{id}/',
		post: prefix + '/configuration/new-member-setup-configuration/',
		delete: prefix + '/configuration/new-member-setup-configuration/{id}/'
	},
	installNewMemberSetupConfig: {
		put: prefix + '/configuration/new-member-setup-configuration/{id}/install/'
	},
	unifiedData: {
		get: prefix + '/data/{type}/'
	},

	configSharingConfigFile: {
		get: prefix + '/configuration-sharing/shared-configuration-file/{id}/',
		put: prefix + '/configuration-sharing/shared-configuration-file/{id}/',
		post: prefix + '/configuration-sharing/shared-configuration-file/'
	},
	configSharingInvite: {
		post: prefix + '/configuration-sharing/invites/'
	},
	configSharingMyInvitesList: {
		get: prefix + '/configuration-sharing/my-invites/'
	},
	configurationJson: {
		put: prefix + '/configuration/new-member-setup-configuration/{id}/install/'
	},
	getTask: {
		get: prefix + '/tasks/task/{id}/'
	},
	dashboardLayout: {
		get: prefix + '/ui/dashboard-layout/{id}/',
		put: prefix + '/ui/dashboard-layout/{id}/',
		post: prefix + '/ui/dashboard-layout/',
		delete: prefix + '/ui/dashboard-layout/{id}/'
	},
	dashboardLayoutList: {
		get: prefix + '/ui/dashboard-layout/'
	},
	expression: {
		post: prefix + '/utils/expression/'
	},
	exprCalcPeriodDate: {
		post: prefix + '/utils/date/calc-period-date/'
	},
	transactionComplexFiltered: {
		post: prefix + '/transactions/complex-transaction/ev-item/'
	},
	systemAttributes: {
		get: prefix + '/ui/system-attributes/'
	},
	taskListLight: {
		get: prefix + '/tasks/task/light/'
	},
	taskStats: {
		get: prefix + '/tasks/stats/'
	},
	task: {
		get: prefix + '/tasks/task/{id}/',
		put: prefix + '/tasks/task/{id}/cancel'
	},
	taskTransaction: {
		put: prefix + '/tasks/task/{id}/abort-transaction-import'
	},

	//# region Entity viewer attribute types
	portfolioAttrTypeList: {
		get: prefix + '/portfolios/portfolio-attribute-type/'
	},
	accountAttrTypeList: {
		get: prefix + '/accounts/account-attribute-type/'
	},
	accountTypeAttrTypeList: {
		get: prefix + '/accounts/account-type-attribute-type/'
	},

	instrumentAttrTypeList: {
		get: prefix + '/instruments/instrument-attribute-type/'
	},
	instrumentTypeAttrTypeList: {
		get: prefix + '/instruments/instrument-type-attribute-type/'
	},
	responsibleAttrTypeList: {
		get: prefix + '/counterparties/responsible-attribute-type/'
	},
	currencyAttrTypeList: {
		get: prefix + '/currencies/currency-attribute-type/'
	},
	counterpartyAttrTypeList: {
		get: prefix + '/counterparties/counterparty-attribute-type/'
	},
	strategy1AttrTypeList: {
		get: prefix + '/strategies/1/strategy-attribute-type/'
	},
	strategy2AttrTypeList: {
		get: prefix + '/strategies/2/strategy-attribute-type/'
	},
	strategy3AttrTypeList: {
		get: prefix + '/strategies/3/strategy-attribute-type/'
	},

	transactionTypeLight: {
		get: prefix + '/transactions/transaction-type/light/'
	},
	transactionType: {
		get: prefix + '/transactions/transaction-type/'
	},

	transactionTypeAttrTypeList: {
		get: prefix + '/transactions/transaction-type-attribute-type/'
	},
	complexTransactionAttrTypeList: {
		get: prefix + '/transactions/complex-transaction-attribute-type/'
	},
	//# endregion Entity viewer attribute types
	balanceReportCustomFieldList: {
		get: prefix + '/reports/balance-report/custom-field/'
	},
	balanceReportCustomField: {
		post: prefix + '/reports/balance-report/custom-field/',
		put: prefix + '/reports/balance-report/custom-field/{id}/',
		delete: prefix + '/reports/balance-report/custom-field/{id}/'
	},
	plReportCustomFieldList: {
		get: prefix + '/reports/pl-report/custom-field/'
	},
	plReportCustomField: {
		post: prefix + '/reports/pl-report/custom-field/',
		put: prefix + '/reports/pl-report/custom-field/{id}/'
	},
	transactionReportCustomFieldList: {
		get: prefix + '/reports/transaction-report/custom-field/'
	},
	transactionReportCustomField: {
		post: prefix + '/reports/transaction-report/custom-field/',
		put: prefix + '/reports/transaction-report/custom-field/{id}/'
	},
	mobileLayout: {
		get: prefix + '/ui/mobile-layout/',
		post: prefix + '/ui/mobile-layout/',
		put: prefix + '/ui/mobile-layout/{id}/'
	},
	// Надо отделить

	widgetsHistory: {
		get: prefix + '/widgets/history/{type}/'
	},
	widgetsStats: {
		get: prefix + '/widgets/stats/'
	},
	strategies1ListLight: {
		get: prefix + '/strategies/1/strategy/light/'
	},
	strategies1SubgroupList: {
		get: prefix + '/strategies/1/subgroup/'
	},
	strategies2ListLight: {
		get: prefix + '/strategies/2/strategy/light/'
	},
	strategies2SubgroupList: {
		get: prefix + '/strategies/2/subgroup/'
	},
	strategies3ListLight: {
		get: prefix + '/strategies/3/strategy/light/'
	},
	strategies3SubgroupList: {
		get: prefix + '/strategies/3/subgroup/'
	},
	defaultSettings: {
		put: prefix + '/users/ecosystem-default/{id}/'
	},
	/*complexTransactionUserField: {
		get: prefix + '/ui/complex-transaction-user-field/',
		put: prefix + '/ui/complex-transaction-user-field/{id}/',
		post: prefix + '/ui/complex-transaction-user-field/',
	},*/
	complexTransactionUserFieldList: {
		get: prefix + '/ui/complex-transaction-user-field/'
	},
	complexTransactionUserField: {
		put: prefix + '/ui/complex-transaction-user-field/{id}/',
		post: prefix + '/ui/complex-transaction-user-field/'
	},
	/*transactionUserField: {
		get: prefix + '/ui/transaction-user-field/',
		put: prefix + '/ui/transaction-user-field/{id}/',
		post: prefix + '/ui/transaction-user-field/',
	},*/
	transactionUserFieldList: {
		get: prefix + '/ui/transaction-user-field/'
	},
	transactionUserField: {
		put: prefix + '/ui/transaction-user-field/{id}/',
		post: prefix + '/ui/transaction-user-field/'
	},
	transactionTypeGroupList: {
		get: prefix + '/transactions/transaction-type-group/'
	},
	transactionTypeGroup: {
		put: prefix + '/transactions/transaction-type-group/{id}/',
		post: prefix + '/transactions/transaction-type-group/',
		delete: prefix + '/transactions/transaction-type-group/{id}/'
	},
	specificDataValuesForSelect: {
		/* *
		 * Used to get unique values of attribute from rv / ev rows.
		 * Requires next query parameters:
		 *
		 * content_type: String - content_type of rv or ev
		 * key: String - Key of an attribute whose value to aggregate
		 * value_type: Number - value_type of an attribute
		 * */
		get: prefix + '/specific-data/values-for-select/'
	},
	marketplaceList: {
		get: 'https://marketplace.finmars.com/api/v1/configuration/'
	},
	marketplaceItem: {
		get: 'https://marketplace.finmars.com/api/v1/configuration/{id}/'
	},
	marketplaceItemVersion: {
		get: 'https://marketplace.finmars.com/api/v1/configuration-release/'
	},
	marketplaceInstall: {
		post:
			prefix +
			'/configuration/configuration/install-configuration-from-marketplace/'
	},
	taskCard: {
		get: prefix + '/tasks/task/{taskId}/'
	},
	fileReport: {
		get: prefix + '/file-reports/file-report/{fileId}/view/'
	},
	vaultRecord: {
		get: prefix + '/vault/vault-record/',
		post: prefix + '/vault/vault-record/',
		put: prefix + '/vault/vault-record/{id}/',
		delete: prefix + '/vault/vault-record/{id}/'
	},
	explorerViewFile: {
		get: prefix + '/explorer/view/'
	},
	explorer: {
		get: prefix + '/explorer/explorer/',
		post: prefix + '/explorer/move/'
	},
	explorerFolder: {
		post: prefix + '/explorer/create-folder/'
	},
	explorerFile: {
		post: prefix + '/explorer/upload/'
	},
	explorerSync: {
		post: prefix + '/explorer/sync/'
	},
	explorerSearch: {
		get: prefix + '/explorer/search/'
	},
	explorerDownloadAsZip: {
		post: prefix + '/explorer/download-as-zip/'
	},
	explorerDownload: {
		post: prefix + '/explorer/download/'
	},
	explorerDeleteFolder: {
		post: prefix + '/explorer/delete-folder/'
	},
	explorerDelete: {
		post: prefix + '/explorer/delete/'
	},
	explorerRename: {
		post: prefix + '/explorer/rename/'
	},
	systemWhiteLabel: {
		get: prefix + '/system/whitelabel/',
		post: prefix + '/system/whitelabel/'
	},
	systemWhiteLabelById: {
		get: prefix + '/system/whitelabel/{id}/',
		patch: prefix + '/system/whitelabel/{id}/',
		delete: prefix + '/system/whitelabel/{id}/'
	},
	resourceGroup: {
		get: prefix + '/iam/resource-group/',
		post: prefix + '/iam/resource-group/'
	},
	resourceGroupDetails: {
		get: prefix + '/iam/resource-group/{id}/',
		delete: prefix + '/iam/resource-group/{id}/',
		put: prefix + '/iam/resource-group/{id}/'
	},
	draft: {
		get: prefix + '/ui/draft/',
		post: prefix + '/ui/draft/',
		put: prefix + '/ui/draft/{id}/'
	},
	clientEntity: {
		get: prefix + '/clients/client/',
		post: prefix + '/clients/client/',
		put: prefix + '/clients/client/{id}/',
		delete: prefix + '/clients/client/{id}/'
	},
	manageConfigurationList: {
		get: prefix + '/configuration/configuration/'
	},
	manageConfigurationListById: {
		get: prefix + '/configuration/configuration/{id}/'
	},
	exportConfiguration: {
		get: prefix + '/configuration/configuration/{id}/export-configuration/'
	},
	pushConfigurationToMarketplace: {
		put:
			prefix +
			'/configuration/configuration/{id}/push-configuration-to-marketplace/'
	},
	setConfiguration: {
		put: prefix + '/configuration/configuration/{id}/',
		post: prefix + '/configuration/configuration/',
		delete: prefix + '/configuration/configuration/{id}/'
	},
	journalList: {
		get: prefix + '/history/historical-record/'
	},
	availableContentTypes: {
		get: prefix + '/history/historical-record/content-types/'
	},
	historicalRecordData: {
		get: prefix + '/history/historical-record/{id}/data'
	},
	masterUserInfo: {
		get: prefix + '/users/master-user/get/',
		post: prefix + '/users/master-user/update/'
	},
	systemInfo: {
		get: prefix + '/utils/system-info/'
	},
	systemLogs: {
		get: prefix + '/utils/system-logs/'
	},
	tablesSize: {
		get: prefix + '/utils/tables-size/'
	},
	viewLog: {
		get: prefix + '/utils/system-logs/view-log/'
	},
	contextMenuLayoutList: {
		get: prefix + '/ui/context-menu-layout/',
		post: prefix + '/ui/context-menu-layout/',
		put: prefix + '/ui/context-menu-layout/{id}/',
		delete: prefix + '/ui/context-menu-layout/{id}/'
	},
	contextMenuLayout: {
		get: prefix + '/ui/context-menu-layout/{id}/'
	},

	activeProcesses: {
		get: prefix + '/active_processes/active_processes/{id}/'
	},
	transactionImport: {
		post: prefix + '/import/complex-transaction-csv-file-import/'
	},
	importSchemeDryRun: {
		post: prefix + '/import/transaction-import/dry-run/'
	},

	recycleBin: {
		get: prefix + '/utils/recycle-bin/'
	},
	clearRecycleBin: {
		post: prefix + '/utils/recycle-bin/clear-bin/'
	}
};
