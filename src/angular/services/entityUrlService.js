/**
 * Created by szhitenev on 07.12.2016.
 */

var resolve = function (entityType) {
	switch (entityType) {
		case 'portfolio':
			return 'portfolios/portfolio'
		case 'portfolio-register':
			return 'portfolios/portfolio-register'
		case 'portfolio-register-record':
			return 'portfolios/portfolio-register-record'
		case 'account':
			return 'accounts/account'
		case 'account-type':
			return 'accounts/account-type'
		case 'responsible':
			return 'counterparties/responsible'
		case 'responsible-group':
			return 'counterparties/responsible-group'
		case 'counterparty':
			return 'counterparties/counterparty'
		case 'counterparty-group':
			return 'counterparties/counterparty-group'
		case 'instrument':
			return 'instruments/instrument'
		case 'generated-event':
			return 'instruments/generated-event'
		case 'instrument-type':
			return 'instruments/instrument-type'
		case 'price-history':
			return 'instruments/price-history'
		case 'transaction':
			return 'transactions/transaction'
		case 'transaction-type':
			return 'transactions/transaction-type'
		case 'transaction-type-group':
			return 'transactions/transaction-type-group'
		case 'complex-transaction':
			return 'transactions/complex-transaction'
		case 'currency':
			return 'currencies/currency'
		case 'currency-history':
			return 'currencies/currency-history'
		case 'pricing-policy':
			return 'instruments/pricing-policy'
		case 'strategy-1':
			return 'strategies/1/strategy'
		case 'strategy-1-subgroup':
			return 'strategies/1/subgroup'
		case 'strategy-1-group':
			return 'strategies/1/group'
		case 'strategy-2':
			return 'strategies/2/strategy'
		case 'strategy-2-subgroup':
			return 'strategies/2/subgroup'
		case 'strategy-2-group':
			return 'strategies/2/group'
		case 'strategy-3':
			return 'strategies/3/strategy'
		case 'strategy-3-subgroup':
			return 'strategies/3/subgroup'
		case 'strategy-3-group':
			return 'strategies/3/group'
		case 'price-history-error':
			return 'pricing/price-history-error'
		case 'currency-history-error':
			return 'pricing/currency-history-error'
		case 'audit-instrument':
			return 'audit/history'
		case 'audit-transaction':
			return 'audit/history'
	}

	/*switch (entityType) {

            case 'portfolio':
                return 'portfolios/portfolio-with-fllters';
            case 'account':
                return 'accounts/account-with-fllters';
            case 'account-type':
                return 'accounts/account-type-with-fllters';
            case 'responsible':
                return 'counterparties/responsible-with-fllters';
            case 'responsible-group':
                return 'counterparties/responsible-group-with-fllters';
            case 'counterparty':
                return 'counterparties/counterparty-with-fllters';
            case 'counterparty-group':
                return 'counterparties/counterparty-group-with-fllters';
            case 'instrument':
                return 'instruments/instrument-with-fllters';
            case 'instrument-type':
                return 'instruments/instrument-type-with-fllters';
            case 'price-history':
                return 'instruments/price-history-with-fllters';
            case 'transaction':
                return 'transactions/transaction-with-fllters';
            case 'transaction-type':
                return 'transactions/transaction-type-with-fllters';
            case 'transaction-type-group':
                return 'transactions/transaction-type-group-with-fllters';
            case 'complex-transaction':
                return 'transactions/complex-transaction-with-fllters';
            case 'currency':
                return 'currencies/currency-with-fllters';
            case 'currency-history':
                return 'currencies/currency-history-with-fllters';
            case 'pricing-policy':
                return 'instruments/pricing-policy-with-fllters';
            case 'strategy-1':
                return 'strategies/1/strategy-with-fllters';
            case 'strategy-2':
                return 'strategies/2/strategy-with-fllters';
            case 'strategy-3':
                return 'strategies/3/strategy-with-fllters';

        }*/
}

export default {
	resolve: resolve,
}
