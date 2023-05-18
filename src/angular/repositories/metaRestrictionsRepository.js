/**
 * Created by szhitenev on 04.05.2016.
 */

var getEntitiesWithoutBaseAttrsList = function () {
    return ['price-history', 'currency-history',
        'price-history-error', 'currency-history-error',
        'complex-transaction'
        , 'transaction', 'balance-report', 'pl-report',
        'transaction-report', 'cash-flow-projection-report',
        'performance-report',
        'audit-transaction', 'audit-instrument',
        'generated-event'];
};

var getEntitiesWithoutDynamicAttrsList = function () {
    return ['price-history', 'currency-history',
        'price-history-error', 'currency-history-error',
        'pricing-policy',
        'strategy-1-group', 'strategy-2-group', 'strategy-3-group',
        'balance-report', 'pl-report',
        'transaction-report', 'cash-flow-projection-report',
        'performance-report',
        'counterparty-group', 'responsible-group', 'tag', 'transaction-type-group',
        'strategy-1-subgroup', 'strategy-2-subgroup', 'strategy-3-subgroup',
        'audit-transaction', 'audit-instrument', 'portfolio-register-record',
        'generated-event']
};

var getRestrictedEntitiesWithTypeField = function () {
    return ['daily_pricing_model', 'payment_size_detail', 'accrued_currency', 'pricing_currency'];
};

export default {
    getEntitiesWithoutDynamicAttrsList: getEntitiesWithoutDynamicAttrsList,
    getEntitiesWithoutBaseAttrsList: getEntitiesWithoutBaseAttrsList,
    getRestrictedEntitiesWithTypeField: getRestrictedEntitiesWithTypeField
}