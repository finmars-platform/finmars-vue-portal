import { getList as portfolioGetList } from '@/services/portfolioService';
import { getList as portfolioRegisterGetList } from '@/services/portfolioRegisterService';
import { getList as portfolioRegisterRecordGetList } from '@/services/portfolioRegisterRecordService';
import { getList as accountGetList } from '@/services/accountService';
import { getList as accountTypeGetList } from '@/services/accountTypeService';
import { getList as responsibleGetList } from '@/services/responsibleService';
import { getList as counterpartyGetList } from '@/services/counterpartyService';
import { getList as responsibleGroupGetList } from '@/services/responsibleGroupService';
import { getList as counterpartyGroupGetList } from '@/services/counterpartyGroupService';
import { getList as currencyGetList } from '@/services/currencyService';
import { getList as currencyHistoryGetList } from '@/services/currencyHistoryService';
import { getList as instrumentGetList } from '@/services/instrumentService';
import { getList as portfolioTypeGetList } from '@/services/portfolioTypeService';
import { getList as portfolioReconcileGroupGetList } from '@/services/portfolioReconcileGroupService';
import { getList as instrumentTypeGetList } from '@/services/instrumentTypeService';
import { getList as auditGetList } from '@/services/auditService';
import { getList as transactionGetList } from '@/services/transactionService';
import { getList as complexTransactionGetList } from '@/services/complexTransactionService';
import { getList as transactionTypeGetList } from '@/services/transactionTypeService';
import { getList as instrumentPeriodicityGetList } from '@/services/instrumentPeriodicityService';
import { getList as accrualCalculationModelGetList } from '@/services/accrualCalculationModelService';
import { getList as instrumentPaymentSizeDetailGetList } from '@/services/instrumentPaymentSizeDetailService';
import { getList as instrumentPricingConditionGetList } from '@/services/instrumentPricingConditionService';
import { getList as instrumentCountryGetList } from '@/services/instrumentCountryService';
import { getList as metaEventClassGetList } from '@/services/metaEventClassService';
import { getList as metaNotificationClassGetList } from '@/services/metaNotificationClassService';
import { getList as instrumentDailyPricingModelGetList } from '@/services/instrumentDailyPricingModelService';
import { getList as priceDownloadSchemeGetList } from '@/services/priceDownloadSchemeService';
import { getList as csvImportSchemeGetList } from '@/services/csvImportSchemeService';
import { getList as complexImportSchemeGetList } from '@/services/complexImportSchemeService';
import { getList as transactionImportSchemeGetList } from '@/services/transactionImportSchemeService';
import { getList as transactionTypeGroupGetList } from '@/services/transactionTypeGroupService';
import { getList as strategyGetList } from '@/services/strategyService';
import { getList as strategySubgroupGetList } from '@/services/strategySubgroupService';
import { getList as instrumentClassGetList } from '@/services/instrumentClassService';
import { getList as portfolioClassGetList } from '@/services/portfolioClassService';
import { getList as priceHistoryGetList } from '@/services/priceHistoryService';
import { getList as portfolioHistoryGetList } from '@/services/portfolioHistoryService';
import { getList as portfolioReconcileHistoryGetList } from '@/services/portfolioReconcileHistoryService';
import { getList as pricingPolicyGetList } from '@/services/pricingPolicyService';
import { getList as costMethodGetList } from '@/services/costMethodService';
import { getList as transactionClassGetList } from '@/services/transactionClassService';
import { getList as expressionProcedureGetList } from '@/services/expressionProcedureService';
import { getList as dataProcedureGetList } from '@/services/dataProcedureService';
import { getList as pricingProcedureGetList } from '@/services/pricingProcedureService';
import { getList as configurationGetList } from '@/services/configurationService';
import {
	getBalanceReport,
	getPerformanceReport,
	getPnlReport,
	getTransactionReport
} from '@/services/reportService';
import { getList as currencyMappingGetList } from '@/services/currencyMappingService';
import { getList as instrumentTypeMappingGetList } from '@/services/instrumentTypeMappingService';
import { getList as accrualCalculationModelMappingGetList } from '@/services/accrualCalculationModelMappingService';
import { getList as instrumentPeriodicityMappingGetList } from '@/services/instrumentPeriodicityMappingService';
import { getList as instrumentAttributeTypeMappingGetList } from '@/services/instrumentAttributeTypeMappingService';
import { getList as accountMappingGetList } from '@/services/accountMappingService';

export function getEntityList(mapEntityType) {
	const options = { page: 1, pageSize: 1000 };
	switch (mapEntityType) {
		case 'portfolio':
			return portfolioGetList(options);
		case 'portfolio-register':
			return portfolioRegisterGetList(options);
		case 'portfolio-register-record':
			return portfolioRegisterRecordGetList(options);
		case 'account':
			return accountGetList(options);
		case 'account-type':
			return accountTypeGetList(options);
		case 'responsible':
			return responsibleGetList(options);
		case 'counterparty':
			return counterpartyGetList(options);
		case 'responsible-group':
			return responsibleGroupGetList(options);
		case 'counterparty-group':
			return counterpartyGroupGetList(options);
		case 'currency':
			return currencyGetList(options);
		case 'currency-history':
			return currencyHistoryGetList(options);
		case 'instrument':
			return instrumentGetList(options);
		case 'portfolio-type':
			return portfolioTypeGetList(options);
		case 'portfolio-reconcile-group':
			return portfolioReconcileGroupGetList(options);
		case 'instrument-type':
			return instrumentTypeGetList(options);
		case 'audit-transaction':
		case 'audit-instrument':
			return auditGetList(options);
		case 'transaction':
			return transactionGetList(options);
		case 'complex-transaction':
			return complexTransactionGetList(options);
		case 'transaction-type':
			return transactionTypeGetList(options);
		case 'periodicity':
			return instrumentPeriodicityGetList(options);
		case 'accrual-calculation-model':
			return accrualCalculationModelGetList(options);
		case 'payment-size-detail':
			return instrumentPaymentSizeDetailGetList(options);
		case 'pricing-condition':
			return instrumentPricingConditionGetList(options);
		case 'country':
			return instrumentCountryGetList(options);
		case 'event-class':
			return metaEventClassGetList(options);
		case 'notification-class':
			return metaNotificationClassGetList(options);
		case 'daily-pricing-model':
			return instrumentDailyPricingModelGetList(options);
		case 'price-download-scheme':
			return priceDownloadSchemeGetList(options);
		case 'csv-import-scheme':
			return csvImportSchemeGetList(options);
		case 'complex-import-scheme':
			return complexImportSchemeGetList(options);
		case 'complex-transaction-import-scheme':
			return transactionImportSchemeGetList(options);
		case 'transaction-type-group':
			return transactionTypeGroupGetList(options);
		case 'strategy-1':
			return strategyGetList(1, options);
		case 'strategy-2':
			return strategyGetList(2, options);
		case 'strategy-3':
			return strategyGetList(3, options);
		case 'strategy-1-subgroup':
			return strategySubgroupGetList(1, options);
		case 'strategy-2-subgroup':
			return strategySubgroupGetList(2, options);
		case 'strategy-3-subgroup':
			return strategySubgroupGetList(3, options);
		case 'instrument-class':
			return instrumentClassGetList(options);
		case 'portfolio-class':
			return portfolioClassGetList(options);
		case 'price-history':
			return priceHistoryGetList(options);
		case 'portfolio-history':
			return portfolioHistoryGetList(options);
		case 'portfolio-reconcile-history':
			return portfolioReconcileHistoryGetList(options);
		case 'pricing-policy':
			return pricingPolicyGetList(options);
		case 'cost-method':
			return costMethodGetList(options);
		case 'transaction-class':
			return transactionClassGetList(options);
		case 'expression-procedure':
			return expressionProcedureGetList(options);
		case 'data-procedure':
			return dataProcedureGetList(options);
		case 'pricing-procedure':
			return pricingProcedureGetList(options);
		case 'balance-report':
			return getBalanceReport(options);
		case 'pl-report':
			return getPnlReport(options);
		case 'transaction-report':
			return getTransactionReport(options);
		case 'performance-report':
			return getPerformanceReport(options);
		case 'configuration':
			return configurationGetList(options);
	}
}

export function getEntityTypeList(mapEntityType) {
	const options = { page: 1, pageSize: 1000 };
	switch (mapEntityType) {
		case 'currency':
			return currencyMappingGetList(options);
		case 'instrument-type':
			return instrumentTypeMappingGetList(options);
		case 'accrual-calculation-model':
			return accrualCalculationModelMappingGetList(options);
		case 'periodicity':
			return instrumentPeriodicityMappingGetList(options);
		case 'classifier':
			return instrumentAttributeTypeMappingGetList(options);
		case 'account':
			return accountMappingGetList(options);
		case 'account-type':
			return [];
		case 'instrument':
			return [];
		case 'counterparty':
			return [];
		case 'responsible':
			return [];
		case 'portfolio':
			return [];
		case 'strategy-1':
			return [];
		case 'strategy-2':
			return [];
		case 'strategy-3':
			return [];
		case 'daily-pricing-model':
			return [];
		case 'payment-size-detail':
			return [];
		case 'pricing-condition':
			return [];
		case 'price-download-scheme':
			return [];
		case 'pricing-policy':
			return [];
	}
}
