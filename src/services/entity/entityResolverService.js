/* eslint-disable no-case-declarations */
import cloneDeep from 'lodash/cloneDeep';
import * as portfolioService from '~/services/portfolio/portfolioService';
import * as portfolioRegisterService from '~/services/portfolio/portfolioRegisterService';
import * as portfolioRegisterRecordService from '~/services/portfolio/portfolioRegisterRecordService';
import * as accountService from '~/services/account/accountService';
import * as accountTypeService from '~/services/account/accountTypeService';
import * as responsibleService from '~/services/responsible/responsibleService';
import * as counterpartyService from '~/services/counterparty/counterpartyService';
import * as responsibleGroupService from '~/services/responsible/responsibleGroupService';
import * as counterpartyGroupService from '~/services/counterparty/counterpartyGroupService';
import * as currencyService from '~/services/currency/currencyService';
import * as currencyHistoryService from '~/services/currency/currencyHistoryService';
import * as instrumentService from '~/services/instrument/instrumentService';
import * as portfolioTypeService from '~/services/portfolio/portfolioTypeService';
import * as portfolioReconcileGroupService from '~/services/portfolio/portfolioReconcileGroupService';
import * as instrumentTypeService from '~/services/instrument/instrumentTypeService';
import * as auditService from '~/services/auditService';
import * as transactionService from '~/services/transaction/transactionService';
import * as complexTransactionService from '~/services/complex/complexTransactionService';
import * as transactionTypeService from '~/services/transaction/transactionTypeService';
import * as instrumentPeriodicityService from '~/services/instrument/instrumentPeriodicityService';
import * as accrualCalculationModelService from '~/services/accrual-calculation/accrualCalculationModelService';
import * as instrumentPaymentSizeDetailService from '~/services/instrument/instrumentPaymentSizeDetailService';
import * as instrumentPricingConditionService from '~/services/instrument/instrumentPricingConditionService';
import * as instrumentCountryService from '~/services/instrument/instrumentCountryService';
import * as metaEventClassService from '~/services/meta/metaEventClassService';
import * as metaNotificationClassService from '~/services/meta/metaNotificationClassService';
import * as instrumentDailyPricingModelService from '~/services/instrument/instrumentDailyPricingModelService';
import * as priceDownloadSchemeService from '~/services/price/priceDownloadSchemeService';
import * as csvImportSchemeService from '~/services/csvImportSchemeService';
import * as complexImportSchemeService from '~/services/complex/complexImportSchemeService';
import * as transactionImportSchemeService from '~/services/transaction/transactionImportSchemeService';
import * as transactionTypeGroupService from '~/services/transaction/transactionTypeGroupService';
import * as strategyService from '~/services/strategy/strategyService';
import * as strategySubgroupService from '~/services/strategy/strategySubgroupService';
import * as instrumentClassService from '~/services/instrument/instrumentClassService';
import * as portfolioClassService from '~/services/portfolio/portfolioClassService';
import * as priceHistoryService from '~/services/price/priceHistoryService';
import * as portfolioHistoryService from '~/services/portfolio/portfolioHistoryService';
import * as portfolioReconcileHistoryService from '~/services/portfolio/portfolioReconcileHistoryService';
import * as pricingPolicyService from '~/services/pricing/pricingPolicyService';
import * as costMethodService from '~/services/costMethodService';
import * as transactionClassService from '~/services/transaction/transactionClassService';
import * as expressionProcedureService from '~/services/expressionProcedureService';
import * as dataProcedureService from '~/services/dataProcedureService';
import * as pricingProcedureService from '~/services/pricing/pricingProcedureService';
import * as configurationService from '~/services/configurationService';
import * as reportService from '~/services/reportService';
import * as strategyGroupService from '~/services/strategy/strategyGroupService';
import * as scheduleService from '~/services/scheduleService';
import * as priceHistoryErrorService from '~/services/price/priceHistoryErrorService';
import * as currencyHistoryErrorService from '~/services/currency/currencyHistoryErrorService';
import * as uiService from '~/services/uiService';

export function getList(mapEntityType, options) {
	switch (mapEntityType) {
		case 'portfolio':
			return portfolioService.getList(options);
		case 'portfolio-register':
			return portfolioRegisterService.getList(options);
		case 'portfolio-register-record':
			return portfolioRegisterRecordService.getList(options);
		case 'account':
			return accountService.getList(options);
		case 'account-type':
			return accountTypeService.getList(options);
		case 'responsible':
			return responsibleService.getList(options);
		case 'counterparty':
			return counterpartyService.getList(options);
		case 'responsible-group':
			return responsibleGroupService.getList(options);
		case 'counterparty-group':
			return counterpartyGroupService.getList(options);
		case 'currency':
			return currencyService.getList(options);
		case 'currency-history':
			return currencyHistoryService.getList(options);
		case 'instrument':
			return instrumentService.getList(options);
		case 'portfolio-type':
			return portfolioTypeService.getList(options);
		case 'portfolio-reconcile-group':
			return portfolioReconcileGroupService.getList(options);
		case 'instrument-type':
			return instrumentTypeService.getList(options);
		case 'audit-transaction':
		case 'audit-instrument':
			return auditService.getList(options);
		case 'transaction':
			return transactionService.getList(options);
		case 'complex-transaction':
			return complexTransactionService.getList(options);
		case 'transaction-type':
			return transactionTypeService.getList(options);
		case 'periodicity':
			return instrumentPeriodicityService.getList(options);
		case 'accrual-calculation-model':
			return accrualCalculationModelService.getList(options);
		case 'payment-size-detail':
			return instrumentPaymentSizeDetailService.getList(options);
		case 'pricing-condition':
			return instrumentPricingConditionService.getList(options);
		case 'country':
			return instrumentCountryService.getList(options);
		case 'event-class':
			return metaEventClassService.getList(options);
		case 'notification-class':
			return metaNotificationClassService.getList(options);
		case 'daily-pricing-model':
			return instrumentDailyPricingModelService.getList(options);
		case 'price-download-scheme':
			return priceDownloadSchemeService.getList(options);
		case 'csv-import-scheme':
			return csvImportSchemeService.getList(options);
		case 'complex-import-scheme':
			return complexImportSchemeService.getList(options);
		case 'complex-transaction-import-scheme':
			return transactionImportSchemeService.getList(options);
		case 'transaction-type-group':
			return transactionTypeGroupService.getList(options);
		case 'strategy-1':
			return strategyService.getList(1, options);
		case 'strategy-2':
			return strategyService.getList(2, options);
		case 'strategy-3':
			return strategyService.getList(3, options);
		case 'strategy-1-subgroup':
			return strategySubgroupService.getList(1, options);
		case 'strategy-2-subgroup':
			return strategySubgroupService.getList(2, options);
		case 'strategy-3-subgroup':
			return strategySubgroupService.getList(3, options);
		case 'instrument-class':
			return instrumentClassService.getList(options);
		case 'portfolio-class':
			return portfolioClassService.getList(options);
		case 'price-history':
			return priceHistoryService.getList(options);
		case 'portfolio-history':
			return portfolioHistoryService.getList(options);
		case 'portfolio-reconcile-history':
			return portfolioReconcileHistoryService.getList(options);
		case 'pricing-policy':
			return pricingPolicyService.getList(options);
		case 'cost-method':
			return costMethodService.getList(options);
		case 'transaction-class':
			return transactionClassService.getList(options);
		case 'expression-procedure':
			return expressionProcedureService.getList(options);
		case 'data-procedure':
			return dataProcedureService.getList(options);
		case 'pricing-procedure':
			return pricingProcedureService.getList(options);
		case 'balance-report':
			return reportService.getBalanceReport(options);
		case 'pl-report':
			return reportService.getPnlReport(options);
		case 'transaction-report':
			return reportService.getTransactionReport(options);
		case 'performance-report':
			return reportService.getPerformanceReport(options);
		case 'configuration':
			return configurationService.getList(options);
	}
}

export async function create(entityType, entity) {
	switch (entityType) {
		case 'csv-import-scheme':
			return csvImportSchemeService.create(entity);
		case 'complex-import-scheme':
			return complexImportSchemeService.create(entity);
		case 'complex-transaction-import-scheme':
			return transactionImportSchemeService.create(entity);
		case 'portfolio':
			entity.counterparties = entity.counterparties || [];
			entity.accounts = entity.accounts || [];
			entity.responsibles = entity.responsibles || [];
			entity.transaction_types = entity.transaction_types || [];
			return portfolioService.create(entity);
		case 'portfolio-type':
			return portfolioTypeService.create(entity);
		case 'portfolio-reconcile-group':
			return portfolioReconcileGroupService.create(entity);
		case 'portfolio-register':
			return portfolioRegisterService.create(entity);
		case 'account':
			entity.portfolios = entity.portfolios || [];
			return accountService.create(entity);
		case 'account-type':
			return accountTypeService.create(entity);
		case 'responsible':
			return responsibleService.create(entity);
		case 'responsible-group':
			return responsibleGroupService.create(entity);
		case 'counterparty':
			return counterpartyService.create(entity);
		case 'counterparty-group':
			return counterpartyGroupService.create(entity);
		case 'instrument':
			return instrumentService.create(entity);
		case 'instrument-type':
			return instrumentTypeService.create(entity);
		case 'currency':
			return currencyService.create(entity);
		case 'pricing-policy':
			return pricingPolicyService.create(entity);
		case 'transaction':
			return transactionService.create(entity);
		case 'transaction-type':
			return transactionTypeService.create(entity);
		case 'transaction-type-group':
			return transactionTypeGroupService.create(entity);
		case 'price-history':
			return priceHistoryService.create(entity);
		case 'portfolio-history':
			return portfolioHistoryService.create(entity);
		case 'portfolio-reconcile-history':
			return portfolioReconcileHistoryService.create(entity);
		case 'currency-history':
			return currencyHistoryService.create(entity);
		case 'strategy-1':
			return strategyService.create(1, entity);
		case 'strategy-2':
			return strategyService.create(2, entity);
		case 'strategy-3':
			return strategyService.create(3, entity);
		case 'strategy-1-group':
			return strategyGroupService.create(1, entity);
		case 'strategy-2-group':
			return strategyGroupService.create(2, entity);
		case 'strategy-3-group':
			return strategyGroupService.create(3, entity);
		case 'strategy-1-subgroup':
			return strategySubgroupService.create(1, entity);
		case 'strategy-2-subgroup':
			return strategySubgroupService.create(2, entity);
		case 'strategy-3-subgroup':
			return strategySubgroupService.create(3, entity);
		case 'complex-transaction':
			const res = await transactionTypeService.initBookComplexTransaction(entity.transaction_type);
			const data = Object.assign(res, entity);
			return transactionTypeService.bookComplexTransaction(entity.transaction_type, data);
		case 'expression-procedure':
			return expressionProcedureService.create(entity);
		case 'data-procedure':
			return dataProcedureService.create(entity);
		case 'pricing-procedure':
			return pricingProcedureService.create(entity);
		case 'schedule':
			return scheduleService.create(entity);
		case 'configuration':
			return configurationService.create(entity);
	}
}

export async function update(entityType, entity) {
	switch (entityType) {
		case 'csv-import-scheme':
			return csvImportSchemeService.update(entity);
		case 'complex-import-scheme':
			return complexImportSchemeService.update(entity);
		case 'complex-transaction-import-scheme':
			return transactionImportSchemeService.update(entity);
		case 'portfolio':
			return portfolioService.update(entity);
		case 'portfolio-type':
			return portfolioTypeService.update(entity);
		case 'portfolio-reconcile-group':
			return portfolioReconcileGroupService.update(entity);
		case 'portfolio-register':
			return portfolioRegisterService.update(entity);
		case 'currency':
			return currencyService.update(entity);
		case 'account':
			return accountService.update(entity);
		case 'account-type':
			return accountTypeService.update(entity);
		case 'responsible':
			return responsibleService.update(entity);
		case 'responsible-group':
			return responsibleGroupService.update(entity);
		case 'counterparty':
			return counterpartyService.update(entity);
		case 'counterparty-group':
			return counterpartyGroupService.update(entity);
		case 'instrument':
			return instrumentService.update(entity);
		case 'instrument-type':
			return instrumentTypeService.update(entity);
		case 'transaction':
			return transactionService.update(entity);
		case 'complex-transaction-default':
			return complexTransactionService.update(entity);
		case 'complex-transaction':
			const data = await complexTransactionService.initRebookComplexTransaction(entity.id);
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

			return complexTransactionService.rebookComplexTransaction(updatedEntity);
		case 'transaction-type':
			return transactionTypeService.update(entity);
		case 'transaction-type-group':
			return transactionTypeGroupService.update(entity);
		case 'price-history':
			return priceHistoryService.update(entity);
		case 'portfolio-history':
			return portfolioHistoryService.update(entity);
		case 'portfolio-reconcile-history':
			return portfolioReconcileHistoryService.update(entity);
		case 'pricing-policy':
			return pricingPolicyService.update(entity);
		case 'currency-history':
			return currencyHistoryService.update(entity);
		case 'strategy-1':
			return strategyService.update(1, entity);
		case 'strategy-2':
			return strategyService.update(2, entity);
		case 'strategy-3':
			return strategyService.update(3, entity);
		case 'strategy-1-group':
			return strategyGroupService.update(1, entity);
		case 'strategy-2-group':
			return strategyGroupService.update(2, entity);
		case 'strategy-3-group':
			return strategyGroupService.update(3, entity);
		case 'strategy-1-subgroup':
			return strategySubgroupService.update(1, entity);
		case 'strategy-2-subgroup':
			return strategySubgroupService.update(2, entity);
		case 'strategy-3-subgroup':
			return strategySubgroupService.update(3, entity);
		case 'price-history-error':
			return priceHistoryErrorService.update(entity);
		case 'currency-history-error':
			return currencyHistoryErrorService.update(entity);
		case 'expression-procedure':
			return expressionProcedureService.update(entity);
		case 'data-procedure':
			return dataProcedureService.update(entity);
		case 'pricing-procedure':
			return pricingProcedureService.update(entity);
		case 'schedule':
			return scheduleService.update(entity);
		case 'configuration':
			return configurationService.update(entity);
		case 'dashboard-layout':
			return uiService.updateDashboardLayout(entity);
	}
}

export async function getListReportGroups(entityType, options = {}) {
	switch (entityType) {
		case 'balance-report':
			return reportService.getBackendBalanceReportGroups(options);
		case 'pl-report':
			return reportService.getBackendPnlReportGroups(options);
		case 'transaction-report':
			return reportService.getBackendTransactionReportGroups(options);
	}
}

export async function getListReportItems(entityType, options = {}) {
	try {
		switch (entityType) {
			case 'balance-report':
				return reportService.getBackendBalanceReportItems(options);
			case 'pl-report':
				return reportService.getBackendPnlReportItems(options);
			case 'transaction-report':
				return reportService.getBackendTransactionReportItems(options);
		}
	} catch (error) {
		console.log('### getListReportItems => ', error);
	}
}
