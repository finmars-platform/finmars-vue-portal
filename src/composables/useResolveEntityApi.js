const contentTypeToApiMap = {
	'portfolios.portfolio': 'portfolio',
	'portfolios.portfolioregister': 'portfolioRegister',
	'portfolios.portfolioregisterrecord': '',
	'accounts.account': '',
	'accounts.accounttype': '',
	'counterparties.responsible': '',
	'counterparties.counterparty': 'counterparty',
	'counterparties.responsiblegroup': '',
	'counterparties.counterpartygroup': '',
	'currencies.currency': 'currency',
	'instruments.instrument': 'instruments',
	'instruments.instrumenttype': 'instrumentType',
	'transactions.transactiontype': '',
	'periodicity': '',
	'accrual-calculation-model': '',
	'payment-size-detail': '',
	'pricing-condition': '',
	'country': '',
	'event-class': '',
	'notification-class': '',
	'daily-pricing-model': '',
	'price-download-scheme': '',
	'csv-import-scheme': '',
	'complex-import-scheme': '',
	'complex-transaction-import-scheme': '',
	'transactions.transactiontypegroup': '',
	'strategies.strategy1': '',
	'strategies.strategy2': '',
	'strategies.strategy3': '',
	'strategies.strategy1subgroup': '',
	'strategies.strategy2subgroup': '',
	'strategies.strategy3subgroup': '',
	'instrument-class': '',
	'instruments.pricingpolicy': 'pricingPolicy',
	'cost-method': '',
	'transaction-class': '',
	'expression-procedure': '',
	'data-procedure': '',
	'pricing-procedure': '',
};

export default function (content_type, method, options) {

	if (!options) options = {};

	let entityApi = contentTypeToApiMap[content_type];

	if (!entityApi) {
		throw new Error("There is no api for such entity");
	}

	if (options.lightList) entityApi += 'Light';

	const routeOpt = entityApi + '.' + method;

	const apiOptions = {
		params: options.params,
		body: options.body,
		filters: options.filters || {},
		headers: options.headers || {},
	};

	return useApi(routeOpt, apiOptions);

}
