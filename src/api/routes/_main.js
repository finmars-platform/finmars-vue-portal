let host = useRuntimeConfig().public.apiURL
let prefix = host + '/{client}/api/v1'
let uDatabasePrefix = 'https://database.finmars.com/api/v1'

export default {
    pricingProc: {
        get: prefix + '/procedures/pricing-procedure/',
        post: prefix + '/procedures/pricing-procedure/{id}/run-procedure/',
        put: prefix + '/procedures/pricing-procedure/{id}/',
    },
    pricingProcId: {
        get: prefix + '/procedures/pricing-procedure/{id}/',
        put: prefix + '/procedures/pricing-procedure/{id}/',
    },
    pricingProcInstance: {
        get: prefix + '/procedures/pricing-parent-procedure-instance/',
    },

    instrumentList: {
        get: prefix + '/instruments/instrument/',
    },
    instrumentListLight: {
        get: prefix + '/instruments/instrument/light/',
    },

    instrumentTypeList: {
        get: prefix + '/instruments/instrument-type/',
    },
    instrumentSizeDetail: {
        get: prefix + '/instruments/payment-size-detail/',
    },
    instrumentPeriodicity: {
        get: prefix + '/instruments/periodicity/',
    },

    instrumentSchemeList: {
        get: prefix + '/pricing/instrument-pricing-scheme/',
    },
    instrumentType: {
        get: prefix + '/instruments/instrument-type/light/',
    },
    instrumentAccrualCalculationModel: {
        get: prefix + '/instruments/accrual-calculation-model/',
    },
    instrumentClass: {
        get: prefix + '/instruments/instrument-class/',
    },
    instrumentPricingСondition: {
        get: prefix + '/instruments/pricing-condition/',
    },

    pricingPolicyList: {
        get: prefix + '/instruments/pricing-policy/',
    },
    pricingPolicyListLight: {
        get: prefix + '/instruments/pricing-policy/light/',
    },
    currencyList: {
        get: prefix + '/currencies/currency/',
    },
    currencyListLight: {
        get: prefix + '/currencies/currency/light/',
    },
    currencySchemeList: {
        get: prefix + '/pricing/currency-pricing-scheme/',
    },
    currencyDatabaseSearch: {
        // get: prefix + '/api/currencies/currency-database-search/',
        get: uDatabasePrefix + '/currency/',
    },
    importCurrencyFmDb: {
        post: prefix + '/import/finmars-database/currency/',
    },
    portfolioList: {
        get: prefix + '/portfolios/portfolio/',
    },
    portfolioListLight: {
        get: prefix + '/portfolios/portfolio/light/',
    },
    accountLight: {
        get: prefix + '/accounts/account/light/',
    },
    accountTypeList: {
        get: prefix + '/accounts/account-type/',
    },
    counterpartyList: {
        get: prefix + '/counterparties/counterparty/',
    },
    counterpartyResponsibleLight: {
        get: prefix + '/counterparties/responsible/light/',
    },
    counterpartyCounterpartyLight: {
        get: prefix + '/counterparties/counterparty/light/',
    },
    counterpartyDatabaseSearch: {
        get: uDatabasePrefix + '/company/',
    },
    importCounterpartyFmDb: {
        post: prefix + '/import/finmars-database/company/',
    },

    importBankProc: {
        get: prefix + '/procedures/request-data-procedure/',
    },
    importBankProcId: {
        get: prefix + '/procedures/request-data-procedure/{id}/',
        put: prefix + '/procedures/request-data-procedure/{id}/',
    },

    dataProvider: {
        get: prefix + '/integrations/data-provider/',
    },

    /* Probably deprecated
    importUnifiedData: {
        post: prefix + 'import/unified-data-provider/',
    },*/

    dataInstance: {
        get: prefix + '/procedures/data-procedure-instance/',
    },
    importSchemeLight: {
        get: prefix + '/import/complex-transaction-import-scheme/light/',
    },
    configurationList: {
        get: prefix + '/configuration/configuration/',
    },
    memberList: {
        get: prefix + '/users/member/',
    },
    member: {
        get: prefix + '/users/member/{id}/',
        post: prefix + '/users/member/',
        delete: prefix + '/users/member/{id}/',
        put: prefix + '/users/member/{id}/',
    },
    memberLayout: {
        get: prefix + '/ui/member-layout/',
        put: prefix + '/ui/member-layout/{id}/',
    },
    memberSendInvite: {
        put: prefix + '/users/member/{id}/send-invite/',
    },
    userGroups: {
        get: prefix + '/users/group/',
    },

    portfolioRegisterList: {
        get: prefix + '/portfolios/portfolio-register/',
        post: prefix + '/portfolios/portfolio-register/',
    },
    portfolioRegisterEvFiltered: {
        post: prefix + '/portfolios/portfolio-register/ev-item/',
    },
    performanceReport: {
        post: prefix + '/reports/performance-report/',
    },
    transactionReport: {
        post: prefix + '/reports/transaction-report/',
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
    instrumentsEventInformed: {
        put: prefix + '/instruments/generated-event/{id}/informed/',
    },
    instrumentUserField:{
        get: prefix + '/ui/instrument-user-field/',
        put: prefix + '/ui/instrument-user-field/{id}/',
        post: prefix + '/ui/instrument-user-field/',
    },

    listLayoutList: {
        get: prefix + '/ui/list-layout/',
    },
    listLayoutListLight: {
        get: prefix + '/ui/list-layout/light/',
    },
    listLayout: {
        get: prefix + '/ui/list-layout/{id}/',
        put: prefix + '/ui/list-layout/{id}/',
        post: prefix + '/ui/list-layout/',
        delete: prefix + '/ui/list-layout/{id}/',
    },
    listLayoutPing: {
        get: prefix + '/ui/list-layout/{id}/ping',
    },
    defaultListLayout: {
        get: prefix + '/ui/list-layout/?is_default=2&content_type={content_type}',
    },
    ecosystemDefaults: {
        get: prefix + '/users/ecosystem-default/',
    },
    balanceReport: {
        get: prefix + 'reports/balance-report/',
    },
    balanceReportAttributes: {
        get: prefix + '/reports/balance-report/attributes/',
    },
    portfolioBundles: {
        get: prefix + '/portfolios/portfolio-bundle/',
        post: prefix + '/portfolios/portfolio-bundle/',
        put: prefix + '/portfolios/portfolio-bundle/{id}/',
        delete: prefix + '/portfolios/portfolio-bundle/{id}/',
    },
    performanceFirstTransaction: {
        get:
            prefix +
            '/reports/performance-report/first-transaction-date/?bundle={id}',
    },
    interfaceAccess: {
        get: prefix + '/ui/portal-interface-access/',
    },
    newMemberSetupConfig: {
        get: prefix + '/configuration/new-member-setup-configuration/',
    },
    unifiedData: {
        get: prefix + '/data/{type}/',
    },

    configSharingConfigFile: {
        get: prefix + '/configuration-sharing/shared-configuration-file/{id}/',
        put: prefix + '/configuration-sharing/shared-configuration-file/{id}/',
        post: prefix + '/configuration-sharing/shared-configuration-file/',
    },
    configSharingInvite: {
        post: prefix + '/configuration-sharing/invites/',
    },
    configSharingMyInvitesList: {
        get: prefix + '/configuration-sharing/my-invites/',
    },
    configurationJson: {
        put: prefix + '/configuration/new-member-setup-configuration/{id}/install/',
    },
    getTask: {
        get: prefix + '/tasks/task/{id}/',
    },
    dashboardLayout: {
        get: prefix + '/ui/dashboard-layout/{id}/',
        put: prefix + '/ui/dashboard-layout/{id}/',
        post: prefix + '/ui/dashboard-layout/',
        delete: prefix + '/ui/dashboard-layout/{id}/',
    },
    dashboardLayoutList: {
        get: prefix + '/ui/dashboard-layout/',
    },
    expression: {
        post: prefix + '/utils/expression/',
    },
    transactionComplexFiltered: {
        post: prefix + '/transactions/complex-transaction/ev-item/',
    },
    systemAttributes: {
        get: prefix + '/ui/system-attributes/',
    },
    task: {
        get: prefix + '/tasks/task/{id}/',
    },

    //# region Entity viewer attribute types
    portfolioAttrTypeList: {
        get: prefix + '/portfolios/portfolio-attribute-type/',
    },
    accountAttrTypeList: {
        get: prefix + '/accounts/account-attribute-type/',
    },

    instrumentAttrTypeList: {
        get: prefix + '/instruments/instrument-attribute-type/',
    },
    instrumentTypeAttrTypeList: {
        get: prefix + '/instruments/instrument-type-attribute-type/',
    },
    responsibleAttrTypeList: {
        get: prefix + '/counterparties/responsible-attribute-type/',
    },
    currencyAttrTypeList: {
        get: prefix + '/currencies/currency-attribute-type/',
    },
    counterpartyAttrTypeList: {
        get: prefix + '/counterparties/counterparty-attribute-type/',
    },
    strategy1AttrTypeList: {
        get: prefix + '/strategies/1/strategy-attribute-type/',
    },
    strategy2AttrTypeList: {
        get: prefix + '/strategies/2/strategy-attribute-type/',
    },
    strategy3AttrTypeList: {
        get: prefix + '/strategies/3/strategy-attribute-type/',
    },

    transactionTypeLight: {
        get: prefix + '/transactions/transaction-type/light/',
    },
    transactionTypeAttrTypeList: {
        get: prefix + '/transactions/complex-transaction-attribute-type/',
    },
    complexTransactionAttrTypeList: {
        get: prefix + '/transactions/complex-transaction-attribute-type/',
    },
    //# endregion Entity viewer attribute types
    balanceReportCustomFieldList: {
        get: prefix + '/reports/balance-report/custom-field/',
    },
    plReportCustomFieldList: {
        get: prefix + '/reports/pl-report/custom-field/',
    },
    transactionReportCustomFieldList: {
        get: prefix + '/reports/transaction-report/custom-field/',
    },
    mobileLayout: {
        get: prefix + '/ui/mobile-layout/',
        post: prefix + '/ui/mobile-layout/',
        put: prefix + '/ui/mobile-layout/{id}/',
    },
    // Надо отделить

    widgetsHistory: {
        get: prefix + '/widgets/history/{type}/',
    },
    widgetsStats: {
        get: prefix + '/widgets/stats/',
    },
    strategiesOneLight: {
        get: prefix + '/strategies/1/strategy/light/',
    },
    strategiesOneSubgroup: {
        get: prefix + '/strategies/1/subgroup/',
    },
    strategiesSecondLight: {
        get: prefix + '/strategies/2/strategy/light/',
    },
    strategiesSecondSubgroup: {
        get: prefix + '/strategies/2/subgroup/',
    },
    strategiesThirdLight: {
        get: prefix + '/strategies/3/strategy/light/',
    },
    strategiesThirdSubgroup: {
        get: prefix + '/strategies/3/subgroup/',
    },
    defaultSettings: {
        put: prefix + '/users/ecosystem-default/{id}/',
    },
    complexTransactionUserField: {
        get: prefix + '/ui/complex-transaction-user-field/',
        put: prefix + '/ui/complex-transaction-user-field/{id}/',
        post: prefix + '/ui/complex-transaction-user-field/',
    },
    transactionUserField: {
        get: prefix + '/ui/transaction-user-field/',
        put: prefix + '/ui/transaction-user-field/{id}/',
        post: prefix + '/ui/transaction-user-field/',
    },

}
