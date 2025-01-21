let host = useRuntimeConfig().public.apiURL;
let prefix = host + '/{client}/api/v1';
let uDatabasePrefix = 'https://database.finmars.com/api/v1';

export default {
	auditHistoryList: {
		get: prefix + '/audit/history/'
	},

	expressionProcedureList: {
		get: prefix + '/procedures/expression-procedure/',
		post: prefix + '/procedures/expression-procedure/',
		put: prefix + '/procedures/expression-procedure/{id}/'
	},
	pricingProc: {
		get: prefix + '/procedures/pricing-procedure/',
		post: prefix + '/procedures/pricing-procedure/',
		put: prefix + '/procedures/pricing-procedure/{id}/'
	},
	pricingProcId: {
		get: prefix + '/procedures/pricing-procedure/{id}/',
		post: prefix + '/procedures/pricing-procedure/{id}/run-procedure/',
		put: prefix + '/procedures/pricing-procedure/{id}/'
	},
	pricingProcInstance: {
		get: prefix + '/procedures/pricing-parent-procedure-instance/'
	},

	accrualCalculationModelMappingList: {
		get: prefix + '/import/accrual-calculation-model-mapping/',
		post: prefix + '/import/accrual-calculation-model-mapping/',
		put: prefix + '/import/accrual-calculation-model-mapping/{id}/',
		delete: prefix + '/import/accrual-calculation-model-mapping/{id}/'
	},

	instrumentPeriodicityMappingList: {
		get: prefix + '/import/periodicity-mapping/',
		post: prefix + '/import/periodicity-mapping/',
		put: prefix + '/import/periodicity-mapping/{id}/',
		delete: prefix + '/import/periodicity-mapping/{id}/'
	},
	instrumentAttributeTypeMappingList: {
		get: prefix + '/import/instrument-attribute-value-mapping/',
		post: prefix + '/import/instrument-attribute-value-mapping/',
		put: prefix + '/import/instrument-attribute-value-mapping/{id}/',
		delete: prefix + '/import/instrument-attribute-value-mapping/{id}/'
	},

	instrumentCostMethodList: {
		get: prefix + '/instruments/cost-method/'
	},
	instrumentPriceHistoryList: {
		get: prefix + '/instruments/price-history/',
		post: prefix + '/instruments/price-history/',
		put: prefix + '/instruments/price-history/{id}/'
	},
	instrumentList: {
		get: prefix + '/instruments/instrument/',
		post: prefix + '/instruments/instrument/',
		put: prefix + '/instruments/instrument/{id}/'
	},
	instrumentListLight: {
		get: prefix + '/instruments/instrument/light/'
	},
	instrumentClassifierMappingList: {
		get: prefix + '/import/instrument-classifier-mapping/'
	},
	instrumentClassifierMappingInstance: {
		get: prefix + '/import/instrument-classifier-mapping/{id}/',
		post: prefix + '/import/instrument-classifier-mapping/',
		put: prefix + '/import/instrument-classifier-mapping/{id}/',
		delete: prefix + '/import/instrument-classifier-mapping/{id}/'
	},
	instrumentTypeList: {
		get: prefix + '/instruments/instrument-type/',
		post: prefix + '/instruments/instrument-type/',
		put: prefix + '/instruments/instrument-type/{id}/'
	},
	instrumentSizeDetail: {
		get: prefix + '/instruments/payment-size-detail/'
	},
	paymentSizeDetailMappingList: {
		get: prefix + '/import/payment-size-detail-mapping/',
		post: prefix + '/import/payment-size-detail-mapping/',
		put: prefix + '/import/payment-size-detail-mapping/{id}/',
		delete: prefix + '/import/payment-size-detail-mapping/{id}/'
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

	instrumentCountryList: {
		get: prefix + '/instruments/country/'
	},
	instrumentPricingCondition: {
		get: prefix + '/instruments/pricing-condition/'
	},
	pricingConditionMappingList: {
		get: prefix + '/import/pricing-condition-mapping/',
		post: prefix + '/import/pricing-condition-mapping/',
		put: prefix + '/import/pricing-condition-mapping/{id}/',
		delete: prefix + '/import/pricing-condition-mapping/{id}/'
	},
	instrumentDailyPricingModelList: {
		get: prefix + '/instruments/daily-pricing-model/'
	},
	instrumentMappingList: {
		get: prefix + '/import/instrument-mapping/',
		post: prefix + '/import/instrument-mapping/',
		put: prefix + '/import/instrument-mapping/{id}/',
		delete: prefix + '/import/instrument-mapping/{id}/'
	},
	dailyPricingModelMappingList: {
		get: prefix + '/import/daily-pricing-model-mapping/',
		post: prefix + '/import/daily-pricing-model-mapping/',
		put: prefix + '/import/daily-pricing-model-mapping/{id}/',
		delete: prefix + '/import/daily-pricing-model-mapping/{id}/'
	},

	pricingPolicyList: {
		get: prefix + '/instruments/pricing-policy/',
		post: prefix + '/instruments/pricing-policy/',
		put: prefix + '/instruments/pricing-policy/{id}/'
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
	pricingPolicyMappingList: {
		get: prefix + '/import/pricing-policy-mapping/',
		post: prefix + '/import/pricing-policy-mapping/',
		put: prefix + '/import/pricing-policy-mapping/{id}/',
		delete: prefix + '/import/pricing-policy-mapping/{id}/'
	},
	currencyList: {
		get: prefix + '/currencies/currency/',
		post: prefix + '/currencies/currency/',
		put: prefix + '/currencies/currency/{id}/'
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
	currencyHistoryList: {
		get: prefix + 'currencies/currency-history/',
		post: prefix + '/currencies/currency-history/',
		put: prefix + '/currencies/currency-history/{id}/'
	},
	importCurrencyFmDb: {
		post: prefix + '/import/finmars-database/currency/'
	},
	importPriceDownloadSchemeList: {
		get: prefix + '/import/price-download-scheme/'
	},
	priceDownloadSchemeMappingList: {
		get: prefix + '/import/price-download-scheme-mapping/',
		post: prefix + '/import/price-download-scheme-mapping/',
		put: prefix + '/import/price-download-scheme-mapping/{id}/',
		delete: prefix + '/import/price-download-scheme-mapping/{id}/'
	},
	portfolioList: {
		get: prefix + '/portfolios/portfolio/',
		post: prefix + '/portfolios/portfolio/',
		put: prefix + '/portfolios/portfolio/{id}/'
	},
	portfolioListLight: {
		get: prefix + '/portfolios/portfolio/light/'
	},
	portfolioMappingList: {
		get: prefix + '/import/portfolio-mapping/',
		post: prefix + '/import/portfolio-mapping/',
		put: prefix + '/import/portfolio-mapping/{id}/',
		delete: prefix + '/import/portfolio-mapping/{id}/'
	},
	portfolioClassifierMappingList: {
		get: prefix + '/import/portfolio-classifier-mapping/'
	},
	portfolioClassifierMappingInstance: {
		get: prefix + '/import/portfolio-classifier-mapping/{id}',
		post: prefix + '/import/portfolio-classifier-mapping/',
		put: prefix + '/import/portfolio-classifier-mapping/{id}/',
		delete: prefix + '/import/portfolio-classifier-mapping/{id}/'
	},
	accountLight: {
		get: prefix + '/accounts/account/light/'
	},
	account: {
		get: prefix + '/accounts/account/',
		post: prefix + '/accounts/account/',
		put: prefix + '/accounts/account/{id}/'
	},
	accountTypeList: {
		get: prefix + '/accounts/account-type/',
		post: prefix + '/accounts/account-type/',
		put: prefix + '/accounts/account-type/{id}/'
	},
	accountMappingList: {
		get: prefix + '/import/account-mapping/',
		post: prefix + '/import/account-mapping/',
		put: prefix + '/import/account-mapping/{id}/',
		delete: prefix + '/import/account-mapping/{id}/'
	},
	accountTypeMappingList: {
		get: prefix + '/import/account-type-mapping/',
		post: prefix + '/import/account-type-mapping/',
		put: prefix + '/import/account-type-mapping/{id}/',
		delete: prefix + '/import/account-type-mapping/{id}/'
	},
	accountClassifierMappingList: {
		get: prefix + '/import/account-classifier-mapping/'
	},
	accountClassifierMappingInstance: {
		get: prefix + '/import/account-classifier-mapping/{id}/',
		post: prefix + '/import/account-classifier-mapping/',
		put: prefix + '/import/account-classifier-mapping/{id}/',
		delete: prefix + '/import/account-classifier-mapping/{id}/'
	},
	counterpartyList: {
		get: prefix + '/counterparties/counterparty/',
		post: prefix + '/counterparties/counterparty/',
		put: prefix + '/counterparties/counterparty/{id}/'
	},
	counterpartyResponsible: {
		get: prefix + '/counterparties/responsible/',
		post: prefix + '/counterparties/responsible/',
		put: prefix + '/counterparties/responsible/{id}/'
	},
	counterpartyClassifierMappingList: {
		get: prefix + '/import/counterparty-classifier-mapping/'
	},
	counterpartyClassifierMappingInstance: {
		get: prefix + '/import/counterparty-classifier-mapping/{id}',
		post: prefix + '/import/counterparty-classifier-mapping/',
		put: prefix + '/import/counterparty-classifier-mapping/{id}/',
		delete: prefix + '/import/counterparty-classifier-mapping/{id}/'
	},
	counterpartyResponsibleLight: {
		get: prefix + '/counterparties/responsible/light/'
	},
	responsibleGroupList: {
		get: prefix + '/counterparties/responsible-group/',
		post: prefix + '/counterparties/responsible-group/',
		put: prefix + '/counterparties/responsible-group/{id}/'
	},
	responsibleMappingList: {
		get: prefix + '/import/responsible-mapping/',
		post: prefix + '/import/responsible-mapping/',
		put: prefix + '/import/responsible-mapping/{id}/',
		delete: prefix + '/import/responsible-mapping/{id}/'
	},
	counterpartyCounterpartyLight: {
		get: prefix + '/counterparties/counterparty/light/'
	},
	counterpartyDatabaseSearch: {
		get: uDatabasePrefix + '/company/'
	},
	counterpartyGroupList: {
		get: prefix + '/counterparties/counterparty-group/',
		post: prefix + '/counterparties/counterparty-group/',
		put: prefix + '/counterparties/counterparty-group/{id}/'
	},
	importCounterpartyFmDb: {
		post: prefix + '/import/finmars-database/company/'
	},
	counterpartyMappingList: {
		get: prefix + '/import/counterparty-mapping/',
		post: prefix + '/import/counterparty-mapping/',
		put: prefix + '/import/counterparty-mapping/{id}/',
		delete: prefix + '/import/counterparty-mapping/{id}/'
	},

	complexTransactionList: {
		get: prefix + '/transactions/complex-transaction/',
		post: prefix + '/transactions/complex-transaction/',
		put: prefix + '/transactions/complex-transaction/{id}/'
	},
	complexTransactionRebook: {
		get: prefix + '/transactions/complex-transaction/{id}/rebook/',
		put: prefix + '/transactions/complex-transaction/{id}/rebook/'
	},
	complexTransactionBulkRestore: {
		post: prefix + '/transactions/complex-transaction/bulk-restore/'
	},
	complexTransactionBulkDelete: {
		post: prefix + '/transactions/complex-transaction/bulk-delete/'
	},

	importBankProc: {
		get: prefix + '/procedures/request-data-procedure/',
		post: prefix + '/procedures/request-data-procedure/',
		put: prefix + '/procedures/request-data-procedure/{id}/'
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
	currencyMappingImportList: {
		get: prefix + '/import/currency-mapping/',
		post: prefix + '/import/currency-mapping/',
		put: prefix + '/import/currency-mapping/{id}/',
		delete: prefix + '/import/currency-mapping/{id}/'
	},
	importSchemeLight: {
		get: prefix + '/import/complex-transaction-import-scheme/light/'
	},
	importSchemeInstance: {
		get: prefix + '/import/complex-transaction-import-scheme/{id}/',
		post: prefix + '/import/complex-transaction-import-scheme/',
		patch: prefix + `/import/complex-transaction-import-scheme/{id}/`
	},
	simpleImportSchemeList: {
		get: prefix + '/import/csv/scheme/'
	},
	simpleImportSchemeLight: {
		get: prefix + '/import/csv/scheme/light/'
	},
	simpleImport: {
		post: prefix + '/import/csv/'
	},
	simpleImportSchemeInstance: {
		get: prefix + '/import/csv/scheme/{id}/',
		post: prefix + '/import/csv/scheme/',
		patch: prefix + '/import/csv/scheme/{id}/'
	},
	configurationList: {
		get: prefix + '/configuration/configuration/',
		post: prefix + '/configuration/configuration/',
		put: prefix + '/configuration/configuration/{id}/'
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

	portfolioHistoryList: {
		get: prefix + '/portfolios/portfolio-history/',
		post: prefix + '/portfolios/portfolio-history/',
		put: prefix + '/portfolios/portfolio-history/{id}/'
	},
	portfolioReconcileHistoryList: {
		get: prefix + '/portfolios/portfolio-reconcile-history/',
		post: prefix + '/portfolios/portfolio-reconcile-history/',
		put: prefix + '/portfolios/portfolio-reconcile-history/{id}/'
	},
	portfolioClassList: {
		get: prefix + '/portfolios/portfolio-class/'
	},
	portfolioRegisterList: {
		get: prefix + '/portfolios/portfolio-register/',
		post: prefix + '/portfolios/portfolio-register/',
		put: prefix + '/portfolios/portfolio-register/{id}/'
	},
	portfolioRegisterEvFiltered: {
		post: prefix + '/portfolios/portfolio-register/ev-item/'
	},
	portfolioRegisterRecordList: {
		get: prefix + '/portfolios/portfolio-register-record/'
	},
	portfolioTypeList: {
		get: prefix + '/portfolios/portfolio-type/',
		post: prefix + '/portfolios/portfolio-type/',
		put: prefix + '/portfolios/portfolio-type/{id}/'
	},
	portfolioReconcileGroupList: {
		get: prefix + 'portfolios/portfolio-reconcile-group/',
		post: prefix + '/portfolios/portfolio-reconcile-group/',
		put: prefix + '/portfolios/portfolio-reconcile-group/{id}/'
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
		get: prefix + '/ui/instrument-user-field/',
		put: prefix + '/ui/instrument-user-field/{id}/',
		post: prefix + '/ui/instrument-user-field/'
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
		get:
			prefix + '/ui/list-layout/?is_default=2&content_type={content_type}'
	},
	ecosystemDefaults: {
		get: prefix + '/users/ecosystem-default/'
	},
	balanceReport: {
		get: prefix + 'reports/balance-report/',
		post: prefix + 'reports/balance-report/'
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
			prefix +
			'/reports/performance-report/first-transaction-date/?bundle={id}'
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
	newMemberConfig: {
		get: prefix + '/configuration/new-member-setup-configuration/{id}/'
	},
	installNewMemberSetupConfig: {
		put:
			prefix +
			'/configuration/new-member-setup-configuration/{id}/install/'
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
		put:
			prefix +
			'/configuration/new-member-setup-configuration/{id}/install/'
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
	instrumentTypeMappingList: {
		get: prefix + '/import/instrument-type-mapping/',
		post: prefix + '/import/instrument-type-mapping/',
		put: prefix + '/import/instrument-type-mapping/{id}/',
		delete: prefix + '/import/instrument-type-mapping/{id}/'
	},
	instrumentTypeAttrTypeList: {
		get: prefix + '/instruments/instrument-type-attribute-type/'
	},
	responsibleAttrTypeList: {
		get: prefix + '/counterparties/responsible-attribute-type/'
	},
	responsibleClassifierMappingList: {
		get: prefix + '/import/responsible-classifier-mapping/'
	},
	responsibleClassifierMappingInstance: {
		get: prefix + '/import/responsible-classifier-mapping/{id}/',
		post: prefix + '/import/responsible-classifier-mapping/',
		put: prefix + '/import/responsible-classifier-mapping/{id}/',
		delete: prefix + '/import/responsible-classifier-mapping/{id}/'
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
	strategy1MappingList: {
		get: prefix + '/import/strategy1-mapping/',
		post: prefix + '/import/strategy1-mapping/',
		put: prefix + '/import/strategy1-mapping/{id}/',
		delete: prefix + '/import/strategy1-mapping/{id}/'
	},
	strategy2MappingList: {
		get: prefix + '/import/strategy2-mapping/',
		post: prefix + '/import/strategy2-mapping/',
		put: prefix + '/import/strategy2-mapping/{id}/',
		delete: prefix + '/import/strategy2-mapping/{id}/'
	},
	strategy3MappingList: {
		get: prefix + '/import/strategy3-mapping/',
		post: prefix + '/import/strategy3-mapping/',
		put: prefix + '/import/strategy3-mapping/{id}/',
		delete: prefix + '/import/strategy3-mapping/{id}/'
	},

	transactionEventClass: {
		get: prefix + '/transactions/event-class/'
	},
	transactionNotificationClass: {
		get: prefix + '/transactions/notification-class/'
	},
	transactionList: {
		get: prefix + '/transactions/transaction/',
		post: prefix + '/transactions/transaction/',
		put: prefix + '/transactions/transaction/{id}'
	},
	transactionClassList: {
		get: prefix + '/transactions/transaction-class/'
	},
	transactionTypeLight: {
		get: prefix + '/transactions/transaction-type/light/'
	},
	transactionType: {
		get: prefix + '/transactions/transaction-type/',
		post: prefix + '/transactions/transaction-type/',
		put: prefix + '/transactions/transaction-type/{id}'
	},
	bookComplexTransaction: {
		get: prefix + '/transactions/transaction-type/{id}/book/',
		put: prefix + '/transactions/transaction-type/{id}/book/'
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
	pnlReport: {
		post: prefix + '/reports/pl-report/'
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
	strategySubGroupList: {
		get: prefix + '/strategies/{strategyNumber}/subgroup/',
		post: prefix + '/strategies/{strategyNumber}/subgroup/',
		put: prefix + '/strategies/{strategyNumber}/subgroup/{id}/'
	},
	strategyList: {
		get: prefix + '/strategies/{strategyNumber}/strategy/',
		post: prefix + '/strategies/{strategyNumber}/strategy/',
		put: prefix + '/strategies/{strategyNumber}/strategy/{id}/'
	},
	strategyGroup: {
		post: prefix + '/strategies/{strategyNumber}/group/',
		put: prefix + '/strategies/{strategyNumber}/group/{id}/'
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
		get: prefix + '/ui/complex-transaction-user-field/',
		put: prefix + '/ui/complex-transaction-user-field/{id}/',
		post: prefix + '/ui/complex-transaction-user-field/'
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
		get: prefix + '/ui/transaction-user-field/',
		put: prefix + '/ui/transaction-user-field/{id}/',
		post: prefix + '/ui/transaction-user-field/'
	},
	transactionUserField: {
		put: prefix + '/ui/transaction-user-field/{id}/',
		post: prefix + '/ui/transaction-user-field/'
	},
	transactionTypeGroupList: {
		get: prefix + '/transactions/transaction-type-group/',
		post: prefix + '/transactions/transaction-type-group/',
		put: prefix + '/transactions/transaction-type-group/{id}/'
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
	},
	complexImportSchemeList: {
		get: prefix + '/import/complex/scheme/',
		post: prefix + '/import/complex/scheme/',
		put: prefix + '/import/complex/scheme/{id}'
	},
	transactionImportSchemeList: {
		get: prefix + '/import/complex-transaction-import-scheme/',
		post: prefix + '/import/complex-transaction-import-scheme/',
		patch: prefix + '/import/complex-transaction-import-scheme/{id}'
	},

	schedule: {
		post: prefix + '/schedules/schedule/',
		put: prefix + '/schedules/schedule/{id}'
	},

	priceHistoryError: {
		put: prefix + '/pricing/price-history-error/{id}/'
	},

	currencyHistoryError: {
		put: prefix + '/pricing/currency-history-error/{id}/'
	},

	referenceTablesList: {
		get: prefix + '/reference-tables/reference-table/'
	},
	referenceTable: {
		get: prefix + '/reference-tables/reference-table/{id}/',
		post: prefix + '/reference-tables/reference-table/',
		put: prefix + '/reference-tables/reference-table/{id}/',
		delete: prefix + '/reference-tables/reference-table/{id}/'
	}
};
