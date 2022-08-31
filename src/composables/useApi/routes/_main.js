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
	policyFilters: {
		get: prefix + '/instruments/pricing-policy/'
	},
	portfolioFilters: {
		get: prefix + '/portfolios/portfolio/'
	},
	currencyScheme: {
		get: prefix + '/pricing/currency-pricing-scheme/'
	},

	importBankProc: {
		get: prefix + '/procedures/request-data-procedure/'
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

}
