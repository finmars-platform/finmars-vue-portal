let prefix = '/{client}/api/v1'

export default {
	pricingProc: {
		get: prefix + "/procedures/pricing-procedure/",
		post: prefix + "/procedures/pricing-procedure/{id}/run-procedure/",
		put: '/procedures/pricing-procedure/{id}/'
	},
	pricingProcId: {
		get: prefix + "/procedures/pricing-procedure/{id}/",
		put: prefix + "/procedures/pricing-procedure/{id}/",
	},
	pricingProcInstance: {
		get: prefix + "/procedures/pricing-parent-procedure-instance/",
	},

	instrumentType: {
		get: prefix + '/instruments/instrument-type/'
	},
	instrumentScheme: {
		get: prefix + '/pricing/instrument-pricing-scheme/'
	},
	pricingPolicy: {
		get: prefix + '/instruments/pricing-policy/'
	},
	pricingPoliciesLight: {
		get: prefix + '/instruments/pricing-policy-light/'
	},
	currenciesLight: {
		get: prefix + '/currencies/currency-light/',
	},
	portfolios: {
		get: prefix + '/portfolios/portfolio/',
	},
	currencyScheme: {
		get: prefix + '/pricing/currency-pricing-scheme/',
	},

	importBankProc: {
		get: prefix + '/procedures/request-data-procedure/',
	},
	importBankProcId: {
		get: prefix + '/procedures/request-data-procedure/{id}/',
		put: prefix + '/procedures/request-data-procedure/{id}/',
	},

	dataProvider: {
		get: prefix + '/integrations/data-provider/'
	},

	dataInstance: {
		get: prefix + '/procedures/data-procedure-instance/'
	},
	importSchemeLight: {
		get: prefix + '/import/complex-transaction-import-scheme-light/'
	},
	members: {
		get: prefix + '/users/member/'
	},
	member: {
		get: prefix + '/users/member/{id}/',
		put: prefix + '/users/member/{id}/'
	},

	userGroups: {
		get: prefix + '/users/group/',
	},

	portfolioRegister: {
		post: prefix + '/portfolios/portfolio-register-ev/filtered/',
	},
	performanceReport: {
		post: prefix + '/reports/performance-report/',
	},


	systemMessagesStats: {
		get: prefix + '/system-messages/message/stats/',
	},
	systemMessages: {
		get: prefix + '/system-messages/message/',
	},
	systemMessagesOne: {
		get: prefix + '/system-messages/message/{id}/',
	},
	systemMessagesRead: {
		post: prefix + '/system-messages/message/mark-as-read/',
	},
	systemMessagesPin: {
		post: prefix + '/system-messages/message/pin/',
	},
	systemMessagesUnpin: {
		post: prefix + '/system-messages/message/unpin/',
	},
	systemMessagesSolved: {
		post: prefix + '/system-messages/message/mark-as-solved/',
	},

	instrumentsEvent: {
		get: prefix + '/instruments/generated-event/{id}/',
	},
	instrumentsEventBook: {
		get: prefix + '/instruments/generated-event/{id}/book/',
		put: prefix + '/instruments/generated-event/{id}/book/',
	},
	listLayout: {
		put: prefix + '/ui/list-layout/{id}/',
		post: prefix + '/ui/list-layout/'
	},
	defaultListLayout: {
		get: prefix + '/ui/list-layout/?is_default=2&content_type={contentType}',
	},
	ecosystemDefaults: {
		get: prefix + '/users/ecosystem-default/'
	},
	portfolioBundles: {
		get: prefix + '/portfolios/portfolio-bundle/',
		post: prefix + '/portfolios/portfolio-bundle/',
	},
	performanceFirstTransaction: {
		get: prefix + '/reports/performance-report/first-transaction-date/?bandle={id}'
	},
	interfaceAccess: {
		get: prefix + '/ui/portal-interface-access/'
	},


	// Надо отделить

	widgetsHistory: {
		get: '/client0s6sf5crgw/api/v1/widgets/history/nav/?portfolio=2&date=2022-09-15'
	},
	widgetsStats: {
		get: '/client0s6sf5crgw/api/v1/widgets/stats/?portfolio=2&date=2022-09-15'
	},
}
