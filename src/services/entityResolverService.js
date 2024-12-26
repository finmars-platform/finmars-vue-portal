/* eslint-disable no-case-declarations */
import cloneDeep from 'lodash/cloneDeep';
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

import {
	create as csvImportSchemeCreate,
	update as csvImportSchemeUpdate
} from '@/services/csvImportSchemeService';
import {
	create as complexImportSchemeCreate,
	update as complexImportSchemeUpdate
} from '@/services/complexImportSchemeService';
import {
	create as transactionImportSchemeCreate,
	update as transactionImportSchemeUpdate
} from '@/services/transactionImportSchemeService';
import {
	create as portfolioCreate,
	update as portfolioUpdate
} from '@/services/portfolioService';
import {
	create as portfolioTypeCreate,
	update as portfolioTypeUpdate
} from '@/services/portfolioTypeService';
import {
	create as portfolioReconcileGroupCreate,
	update as portfolioReconcileGroupUpdate
} from '@/services/portfolioReconcileGroupService';
import {
	create as portfolioRegisterCreate,
	update as portfolioRegisterUpdate
} from '@/services/portfolioRegisterService';
import {
	create as accountCreate,
	update as accountUpdate
} from '@/services/accountService';
import {
	create as accountTypeCreate,
	update as accountTypeUpdate
} from '@/services/accountTypeService';
import {
	create as responsibleCreate,
	update as responsibleUpdate
} from '@/services/responsibleService';
import {
	create as responsibleGroupCreate,
	update as responsibleGroupUpdate
} from '@/services/responsibleGroupService';
import {
	create as counterpartyCreate,
	update as counterpartyUpdate
} from '@/services/counterpartyService';
import {
	create as counterpartyGroupCreate,
	update as counterpartyGroupUpdate
} from '@/services/counterpartyGroupService';
import {
	create as instrumentCreate,
	update as instrumentUpdate
} from '@/services/instrumentService';
import {
	create as instrumentTypeCreate,
	update as instrumentTypeUpdate
} from '@/services/instrumentTypeService';
import {
	create as currencyCreate,
	update as currencyUpdate
} from '@/services/currencyService';
import {
	create as pricingPolicyCreate,
	update as pricingPolicyUpdate
} from '@/services/pricingPolicyService';
import {
	create as transactionCreate,
	update as transactionUpdate
} from '@/services/transactionService';
import {
	update as complexTransactionUpdate,
	initRebookComplexTransaction,
	rebookComplexTransaction
} from '@/services/complexTransactionService';
import {
	create as transactionTypeCreate,
	update as transactionTypeUpdate
} from '@/services/transactionTypeService';
import {
	create as transactionTypeGroupCreate,
	update as transactionTypeGroupUpdate
} from '@/services/transactionTypeGroupService';
import {
	create as priceHistoryCreate,
	update as priceHistoryUpdate
} from '@/services/priceHistoryService';
import {
	create as portfolioHistoryCreate,
	update as portfolioHistoryUpdate
} from '@/services/portfolioHistoryService';
import {
	create as portfolioReconcileHistoryCreate,
	update as portfolioReconcileHistoryUpdate
} from '@/services/portfolioReconcileHistoryService';
import {
	create as currencyHistoryCreate,
	update as currencyHistoryUpdate
} from '@/services/currencyHistoryService';
import {
	create as strategyCreate,
	update as strategyUpdate
} from '@/services/strategyService';
import {
	create as strategyGroupCreate,
	update as strategyGroupUpdate
} from '@/services/strategyGroupService';
import {
	create as strategySubgroupCreate,
	update as strategySubgroupUpdate
} from '@/services/strategySubgroupService';
import {
	initBookComplexTransaction,
	bookComplexTransaction
} from '@/services/transactionTypeService';
import {
	create as expressionProcedureCreate,
	update as expressionProcedureUpdate
} from '@/services/expressionProcedureService';
import {
	create as dataProcedureCreate,
	update as dataProcedureUpdate
} from '@/services/dataProcedureService';
import {
	create as pricingProcedureCreate,
	update as pricingProcedureUpdate
} from '@/services/pricingProcedureService';
import {
	create as scheduleCreate,
	update as scheduleUpdate
} from '@/services/scheduleService';
import {
	create as configurationCreate,
	update as configurationUpdate
} from '@/services/configurationService';
import { update as priceHistoryErrorUpdate } from '@/services/priceHistoryErrorService';
import { update as currencyHistoryErrorUpdate } from '@/services/currencyHistoryErrorService';
import { updateDashboardLayout } from '@/services/uiService';

export function getList(mapEntityType, options) {
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

export async function create(entityType, entity) {
	switch (entityType) {
		case 'csv-import-scheme':
			return csvImportSchemeCreate(entity);
		case 'complex-import-scheme':
			return complexImportSchemeCreate(entity);
		case 'complex-transaction-import-scheme':
			return transactionImportSchemeCreate(entity);
		case 'portfolio':
			entity.counterparties = entity.counterparties || [];
			entity.accounts = entity.accounts || [];
			entity.responsibles = entity.responsibles || [];
			entity.transaction_types = entity.transaction_types || [];
			return portfolioCreate(entity);
		case 'portfolio-type':
			return portfolioTypeCreate(entity);
		case 'portfolio-reconcile-group':
			return portfolioReconcileGroupCreate(entity);
		case 'portfolio-register':
			return portfolioRegisterCreate(entity);
		case 'account':
			entity.portfolios = entity.portfolios || [];
			return accountCreate(entity);
		case 'account-type':
			return accountTypeCreate(entity);
		case 'responsible':
			return responsibleCreate(entity);
		case 'responsible-group':
			return responsibleGroupCreate(entity);
		case 'counterparty':
			return counterpartyCreate(entity);
		case 'counterparty-group':
			return counterpartyGroupCreate(entity);
		case 'instrument':
			return instrumentCreate(entity);
		case 'instrument-type':
			return instrumentTypeCreate(entity);
		case 'currency':
			return currencyCreate(entity);
		case 'pricing-policy':
			return pricingPolicyCreate(entity);
		case 'transaction':
			return transactionCreate(entity);
		case 'transaction-type':
			return transactionTypeCreate(entity);
		case 'transaction-type-group':
			return transactionTypeGroupCreate(entity);
		case 'price-history':
			return priceHistoryCreate(entity);
		case 'portfolio-history':
			return portfolioHistoryCreate(entity);
		case 'portfolio-reconcile-history':
			return portfolioReconcileHistoryCreate(entity);
		case 'currency-history':
			return currencyHistoryCreate(entity);
		case 'strategy-1':
			return strategyCreate(1, entity);
		case 'strategy-2':
			return strategyCreate(2, entity);
		case 'strategy-3':
			return strategyCreate(3, entity);
		case 'strategy-1-group':
			return strategyGroupCreate(1, entity);
		case 'strategy-2-group':
			return strategyGroupCreate(2, entity);
		case 'strategy-3-group':
			return strategyGroupCreate(3, entity);
		case 'strategy-1-subgroup':
			return strategySubgroupCreate(1, entity);
		case 'strategy-2-subgroup':
			return strategySubgroupCreate(2, entity);
		case 'strategy-3-subgroup':
			return strategySubgroupCreate(3, entity);
		case 'complex-transaction':
			const res = await initBookComplexTransaction(entity.transaction_type);
			const data = Object.assign(res, entity);
			return bookComplexTransaction(entity.transaction_type, data);
		case 'expression-procedure':
			return expressionProcedureCreate(entity);
		case 'data-procedure':
			return dataProcedureCreate(entity);
		case 'pricing-procedure':
			return pricingProcedureCreate(entity);
		case 'schedule':
			return scheduleCreate(entity);
		case 'configuration':
			return configurationCreate(entity);
	}
}

export async function update(entityType, entity) {
	switch (entityType) {
		case 'csv-import-scheme':
			return csvImportSchemeUpdate(entity);
		case 'complex-import-scheme':
			return complexImportSchemeUpdate(entity);
		case 'complex-transaction-import-scheme':
			return transactionImportSchemeUpdate(entity);
		case 'portfolio':
			return portfolioUpdate(entity);
		case 'portfolio-type':
			return portfolioTypeUpdate(entity);
		case 'portfolio-reconcile-group':
			return portfolioReconcileGroupUpdate(entity);
		case 'portfolio-register':
			return portfolioRegisterUpdate(entity);
		case 'currency':
			return currencyUpdate(entity);
		case 'account':
			return accountUpdate(entity);
		case 'account-type':
			return accountTypeUpdate(entity);
		case 'responsible':
			return responsibleUpdate(entity);
		case 'responsible-group':
			return responsibleGroupUpdate(entity);
		case 'counterparty':
			return counterpartyUpdate(entity);
		case 'counterparty-group':
			return counterpartyGroupUpdate(entity);
		case 'instrument':
			return instrumentUpdate(entity);
		case 'instrument-type':
			return instrumentTypeUpdate(entity);
		case 'transaction':
			return transactionUpdate(entity);
		case 'complex-transaction-default':
			return complexTransactionUpdate(entity);
		case 'complex-transaction':
			const data = await initRebookComplexTransaction(entity.id);
			const updatedEntity = cloneDeep(entity);
			const originValues = cloneDeep(entity.values);
			updatedEntity.values = data.values;
			updatedEntity.complex_transaction = data.complex_transaction;

			const originValuesKeys = Object.keys(originValues);
			const defaultValuesKeys = Object.keys(updatedEntity.values);

			originValuesKeys.forEach((originValKey) => {
				defaultValuesKeys.forEach((defaultValKey) => {
					if (originValKey === originValKey) {
						updatedEntity.values[defaultValKey] = originValues[originValKey];
					}
				});
			});

			return rebookComplexTransaction(updatedEntity);
		case 'transaction-type':
			return transactionTypeUpdate(entity);
		case 'transaction-type-group':
			return transactionTypeGroupUpdate(entity);
		case 'price-history':
			return priceHistoryUpdate(entity);
		case 'portfolio-history':
			return portfolioHistoryUpdate(entity);
		case 'portfolio-reconcile-history':
			return portfolioReconcileHistoryUpdate(entity);
		case 'pricing-policy':
			return pricingPolicyUpdate(entity);
		case 'currency-history':
			return currencyHistoryUpdate(entity);
		case 'strategy-1':
			return strategyUpdate(1, entity);
		case 'strategy-2':
			return strategyUpdate(2, entity);
		case 'strategy-3':
			return strategyUpdate(3, entity);
		case 'strategy-1-group':
			return strategyGroupUpdate(1, entity);
		case 'strategy-2-group':
			return strategyGroupUpdate(2, entity);
		case 'strategy-3-group':
			return strategyGroupUpdate(3, entity);
		case 'strategy-1-subgroup':
			return strategySubgroupUpdate(1, entity);
		case 'strategy-2-subgroup':
			return strategySubgroupUpdate(2, entity);
		case 'strategy-3-subgroup':
			return strategySubgroupUpdate(3, entity);
		case 'price-history-error':
			return priceHistoryErrorUpdate(entity);
		case 'currency-history-error':
			return currencyHistoryErrorUpdate(entity);
		case 'expression-procedure':
			return expressionProcedureUpdate(entity);
		case 'data-procedure':
			return dataProcedureUpdate(entity);
		case 'pricing-procedure':
			return pricingProcedureUpdate(entity);
		case 'schedule':
			return scheduleUpdate(entity);
		case 'configuration':
			return configurationUpdate(entity);
		case 'dashboard-layout':
			return updateDashboardLayout(entity);
	}
}
