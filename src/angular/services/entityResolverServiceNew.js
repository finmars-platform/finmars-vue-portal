/**
 * Created by szhitenev on 16.06.2016.
 */

import portfolioService from './portfolioService'
import portfolioRegisterService from './portfolioRegisterService'
import portfolioRegisterRecordService from './portfolioRegisterRecordService'
import accountService from './accountService'
import accountTypeService from './accountTypeService'
import responsibleService from './responsibleService'
import responsibleGroupService from './responsibleGroupService'
import counterpartyService from './counterpartyService'
import counterpartyGroupService from './counterpartyGroupService'
import currencyService from './currencyService'
import transactionService from './transactionService'
// import transactionTypeService from './transactionTypeService';
import transactionClassService from './transaction/transactionClassService'
import transactionTypeGroupService from './transaction/transactionTypeGroupService'

import complexTransactionService from './transaction/complexTransactionService'

import metaEventClassService from './metaEventClassService'
import metaNotificationClassService from './metaNotificationClassService'
import pricingPolicyService from './pricingPolicyService'
import instrumentTypeService from './instrumentTypeService'
import accrualCalculationModelService from './accrualCalculationModelService'
import instrumentPeriodicityService from './instrumentPeriodicityService'

import strategyService from './strategyService'
import strategyGroupService from './strategyGroupService'
import strategySubgroupService from './strategySubgroupService'

import instrumentDailyPricingModelService from './instrument/instrumentDailyPricingModelService'
import instrumentPricingConditionService from './instrument/instrumentPricingConditionService'
import instrumentCountryService from './instrument/instrumentCountryService'
import instrumentPaymentSizeDetailService from './instrument/instrumentPaymentSizeDetailService'
import instrumentClassService from './instrument/instrumentClassService'
import priceDownloadSchemeService from './import/priceDownloadSchemeService'
import csvImportSchemeService from './import/csvImportSchemeService'
import complexImportSchemeService from './import/complexImportSchemeService'
import complexTransactionImportSchemeService from './import/transactionImportSchemeService'

import costMethodService from './instrument/instrumentCostMethodService'

import priceHistoryErrorService from './pricing/priceHistoryErrorService'
import currencyHistoryErrorService from './pricing/currencyHistoryErrorService'

import expressionProcedureService from './procedures/expressionProcedureService'
import dataProcedureService from './procedures/dataProcedureService'
import pricingProcedureService from './procedures/pricingProcedureService'

import scheduleService from './scheduleService'
import auditService from './auditService'

export default function ({
	instrumentService,
	transactionTypeService,
	priceHistoryService,
	currencyHistoryService,
	reportService,
}) {
	var getList = function (entityType, options) {

		switch (entityType) {
			case 'portfolio':
				return portfolioService.getList(options);
				break;
			case 'portfolio-register':
				return portfolioRegisterService.getList(options);
				break;
			case 'portfolio-register-record':
				return portfolioRegisterRecordService.getList(options);
				break;
			case 'account':
				return accountService.getList(options);
				break;
			case 'account-type':
				return accountTypeService.getList(options);
				break;
			case 'responsible':
				return responsibleService.getList(options);
				break;
			case 'counterparty':
				return counterpartyService.getList(options);
				break;
			case 'responsible-group':
				return responsibleGroupService.getList(options);
				break;
			case 'counterparty-group':
				return counterpartyGroupService.getList(options);
				break;
			case 'currency':
				return currencyService.getList(options);
				break;
			case 'currency-history':
				return currencyHistoryService.getList(options);
				break;
			case 'instrument':
				return instrumentService.getList(options);
				break;
			case 'instrument-type':
				return instrumentTypeService.getList(options);
				break;
			case 'audit-transaction':
			case 'audit-instrument':
				return auditService.getList(options);
				break;
			case 'transaction':
				return transactionService.getList(options);
				break;
			case 'complex-transaction':
				return complexTransactionService.getList(options);
				break;
			case 'transaction-type':
				return transactionTypeService.getListLight(options);
				break;
			case 'periodicity':
				return instrumentPeriodicityService.getList(options);
				break;
			case 'accrual-calculation-model':
				return accrualCalculationModelService.getList(options);
				break;
			case 'payment-size-detail':
				return instrumentPaymentSizeDetailService.getList(options);
				break;
			case 'pricing-condition':
				return instrumentPricingConditionService.getList(options);
				break;
			case 'country':
				return instrumentCountryService.getList(options);
				break;
			case 'event-class':
				return metaEventClassService.getList(options);
				break;
			case 'notification-class':
				return metaNotificationClassService.getList(options);
				break;
			case 'daily-pricing-model':
				return instrumentDailyPricingModelService.getList(options);
				break;
			case 'price-download-scheme':
				return priceDownloadSchemeService.getList(options);
				break;
			case 'csv-import-scheme':
				return csvImportSchemeService.getList(options);
				break;
			case 'complex-import-scheme':
				return complexImportSchemeService.getList(options);
				break;
			case 'complex-transaction-import-scheme':
				return complexTransactionImportSchemeService.getList(options);
				break;
			case 'transaction-type-group':
				return transactionTypeGroupService.getList(options);
				break;
			case 'strategy-1':
				return strategyService.getList(1);
				break;
			case 'strategy-2':
				return strategyService.getList(2);
				break;
			case 'strategy-3':
				return strategyService.getList(3);
				break;
			case 'strategy-1-subgroup':
				return strategySubgroupService.getList(1);
				break;
			case 'strategy-2-subgroup':
				return strategySubgroupService.getList(2);
				break;
			case 'strategy-3-subgroup':
				return strategySubgroupService.getList(3);
				break;
			case 'instrument-class':
				return instrumentClassService.getList(options);
				break;
			case 'price-history':
				return priceHistoryService.getList(options);
				break;
			case 'pricing-policy':
				return pricingPolicyService.getList(options);
				break;
			case 'cost-method':
				return costMethodService.getList(options);
				break;
			case 'transaction-class':
				return transactionClassService.getList(options)
				break;
			case 'expression-procedure':
				return expressionProcedureService.getList(options)
				break;
			case 'data-procedure':
				return dataProcedureService.getList(options)
				break;
			case 'pricing-procedure':
				return pricingProcedureService.getList(options)
				break;
			case 'balance-report':
				return reportService.getBalanceReport(options);
				break;
			case 'pl-report':
				return reportService.getPnlReport(options);
				break;
			case 'transaction-report':
				return reportService.getTransactionReport(options);
				break;
			case 'performance-report':
				return reportService.getPerformanceReport(options);
				break;
			case 'configuration':
				return configurationService.getList(options)
				break;

			// default:
			//     throw new Error('entityResolverService: Unknown entityType ' + entityType);
		}
	};

	var getListLight = function (entityType, options) {

		switch (entityType) {
			case 'portfolio':
				return portfolioService.getListLight(options);
			case 'portfolio-register':
				return portfolioRegisterService.getListLight(options);
			case 'account':
				return accountService.getListLight(options);
			case 'account-type':
				return accountTypeService.getList(options);
			case 'responsible':
				return responsibleService.getListLight(options);
			case 'counterparty':
				return counterpartyService.getListLight(options);
			case 'currency':
				return currencyService.getListLight(options);
			case 'instrument':
				return instrumentService.getListLight(options);
			case 'instrument-type':
				return instrumentTypeService.getListLight(options);
			case 'instrument-class':
				return instrumentClassService.getList(options);
			case 'transaction-type':
				return transactionTypeService.getListLight(options);
			case 'strategy-1':
				return strategyService.getListLight(1);
			case 'strategy-2':
				return strategyService.getListLight(2);
			case 'strategy-3':
				return strategyService.getListLight(3);
			case 'pricing-policy':
				return pricingPolicyService.getListLight(options);
		}
	};

	var getByKey = function (entityType, id) {
		switch (entityType) {
			case 'portfolio':
				return portfolioService.getByKey(id);
				break;
			case 'portfolio-register':
				return portfolioRegisterService.getByKey(id);
				break;
			case 'portfolio-register-record':
				return portfolioRegisterRecordService.getByKey(id);
				break;
			case 'account':
				return accountService.getByKey(id);
				break;
			case 'account-type':
				return accountTypeService.getByKey(id);
				break;
			case 'responsible':
				return responsibleService.getByKey(id);
				break;
			case 'responsible-group':
				return responsibleGroupService.getByKey(id);
				break;
			case 'counterparty':
				return counterpartyService.getByKey(id);
				break;
			case 'counterparty-group':
				return counterpartyGroupService.getByKey(id);
				break;
			case 'instrument':
				return instrumentService.getByKey(id);
				break;
			case 'instrument-type':
				return instrumentTypeService.getByKey(id);
				break;
			case 'currency':
				return currencyService.getByKey(id);
				break;
			case 'complex-transaction':
				// return complexTransactionService.initRebookComplexTransaction(id); // this one is wrong
				return complexTransactionService.getByKey(id);
				break;
			case 'pricing-policy':
				return pricingPolicyService.getByKey(id);
				break;
			case 'transaction':
				return transactionService.getByKey(id);
				break;
			case 'transaction-type':
				return transactionTypeService.getByKey(id);
				break;
			case 'transaction-type-book':
				return transactionTypeService.initBookComplexTransaction(id);
				break;
			case 'transaction-type-group':
				return transactionTypeGroupService.getByKey(id);
				break;
			case 'price-history':
				return priceHistoryService.getByKey(id);
				break;
			case 'currency-history':
				return currencyHistoryService.getByKey(id);
				break;
			case 'strategy-1':
				return strategyService.getByKey(1, id);
				break;
			case 'strategy-2':
				return strategyService.getByKey(2, id);
				break;
			case 'strategy-3':
				return strategyService.getByKey(3, id);
				break;
			case 'strategy-1-group':
				return strategyGroupService.getByKey(1, id);
				break;
			case 'strategy-2-group':
				return strategyGroupService.getByKey(2, id);
				break;
			case 'strategy-3-group':
				return strategyGroupService.getByKey(3, id);
				break;
			case 'strategy-1-subgroup':
				return strategySubgroupService.getByKey(1, id);
				break;
			case 'strategy-2-subgroup':
				return strategySubgroupService.getByKey(2, id);
				break;
			case 'strategy-3-subgroup':
				return strategySubgroupService.getByKey(3, id);
				break;
			case 'price-history-error':
				return priceHistoryErrorService.getByKey(id);
				break;
			case 'currency-history-error':
				return currencyHistoryErrorService.getByKey(id);
				break;
			case 'csv-import-scheme':
				return csvImportSchemeService.getByKey(id);
				break;
			case 'complex-import-scheme':
				return complexImportSchemeService.getByKey(id);
				break;
			case 'complex-transaction-import-scheme':
				return complexTransactionImportSchemeService.getByKey(id);
				break;
			case 'expression-procedure':
				return expressionProcedureService.getByKey(id);
				break;
			case 'data-procedure':
				return dataProcedureService.getByKey(id);
				break;
			case 'pricing-procedure':
				return pricingProcedureService.getByKey(id);
				break;
			case 'configuration':
				return configurationService.getByKey(id);
				break;
		}
	};

	var create = function (entityType, entity) {


		switch (entityType) {
			case 'csv-import-scheme':
				return csvImportSchemeService.create(entity);
				break;
			case 'complex-import-scheme':
				return complexImportSchemeService.create(entity);
				break;
			case 'complex-transaction-import-scheme':
				return complexTransactionImportSchemeService.create(entity);
				break;
			case 'portfolio':
				entity.counterparties = entity.counterparties || [];
				entity.accounts = entity.accounts || [];
				entity.responsibles = entity.responsibles || [];
				entity.transaction_types = entity.transaction_types || [];
				return portfolioService.create(entity);
				break;
			case 'portfolio-register':
				return portfolioRegisterService.create(entity);
				break;
			case 'account':
				entity.portfolios = entity.portfolios || [];
				return accountService.create(entity);
				break;
			case 'account-type':
				return accountTypeService.create(entity);
				break;
			case 'responsible':
				return responsibleService.create(entity);
				break;
			case 'responsible-group':
				return responsibleGroupService.create(entity);
				break;
			case 'counterparty':
				return counterpartyService.create(entity);
				break;
			case 'counterparty-group':
				return counterpartyGroupService.create(entity);
				break;
			case 'instrument':
				return instrumentService.create(entity);
				break;
			case 'instrument-type':
				return instrumentTypeService.create(entity);
				break;
			case 'currency':
				return currencyService.create(entity);
				break;
			case 'pricing-policy':
				return pricingPolicyService.create(entity);
				break;
			case 'transaction':
				return transactionService.create(entity);
				break;
			case 'transaction-type':
				return transactionTypeService.create(entity);
				break;
			case 'transaction-type-group':
				return transactionTypeGroupService.create(entity);
				break;
			case 'price-history':
				return priceHistoryService.create(entity);
				break;
			case 'currency-history':
				return currencyHistoryService.create(entity);
				break;
			case 'strategy-1':
				return strategyService.create(1, entity);
				break;
			case 'strategy-2':
				return strategyService.create(2, entity);
				break;
			case 'strategy-3':
				return strategyService.create(3, entity);
				break;
			case 'strategy-1-group':
				return strategyGroupService.create(1, entity);
				break;
			case 'strategy-2-group':
				return strategyGroupService.create(2, entity);
				break;
			case 'strategy-3-group':
				return strategyGroupService.create(3, entity);
				break;
			case 'strategy-1-subgroup':
				return strategySubgroupService.create(1, entity);
				break;
			case 'strategy-2-subgroup':
				return strategySubgroupService.create(2, entity);
				break;
			case 'strategy-3-subgroup':
				return strategySubgroupService.create(3, entity);
				break;
			case 'complex-transaction':

				return new Promise(function (resolve, reject) {
					transactionTypeService.initBookComplexTransaction(entity.transaction_type).then(function (data) {

						var res = Object.assign(data, entity);

						transactionTypeService.bookComplexTransaction(entity.transaction_type, res).then(function (data) {
							resolve(data);
						});
					});
				});
			case 'expression-procedure':
				return expressionProcedureService.create(entity);
				break;
			case 'data-procedure':
				return dataProcedureService.create(entity);
				break;
			case 'pricing-procedure':
				return pricingProcedureService.create(entity);
				break;
			case 'schedule':
				return scheduleService.create(entity);
				break;
			case 'configuration':
				return configurationService.create(entity);
				break;


		}
	};

	var update = function (entityType, id, entity) {

		switch (entityType) {
			case 'csv-import-scheme':
				return csvImportSchemeService.update(id, entity);
				break;
			case 'complex-import-scheme':
				return complexImportSchemeService.update(id, entity);
				break;
			case 'complex-transaction-import-scheme':
				return complexTransactionImportSchemeService.update(id, entity);
				break;
			case 'portfolio':
				return portfolioService.update(id, entity);
				break;
			case 'portfolio-register':
				return portfolioRegisterService.update(id, entity);
				break;
			case 'currency':
				return currencyService.update(id, entity);
				break;
			case 'account':
				return accountService.update(id, entity);
				break;
			case 'account-type':
				return accountTypeService.update(id, entity);
				break;
			case 'responsible':
				return responsibleService.update(id, entity);
				break;
			case 'responsible-group':
				return responsibleGroupService.update(id, entity);
				break;
			case 'counterparty':
				return counterpartyService.update(id, entity);
				break;
			case 'counterparty-group':
				return counterpartyGroupService.update(id, entity);
				break;
			case 'instrument':
				return instrumentService.update(id, entity);
				break;
			case 'instrument-type':
				return instrumentTypeService.update(id, entity);
				break;
			case 'transaction':
				return transactionService.update(id, entity);
				break;
			case 'complex-transaction-default':
				return complexTransactionService.update(entity.id, entity);
				break;
			case 'complex-transaction':
				// return complexTransactionService.bookComplexTransaction(entity.id, entity);
				return new Promise(function (resolve, reject) {
					return complexTransactionService.initRebookComplexTransaction(id).then(function (data) {

						var originValues = JSON.parse(JSON.stringify(entity.values));

						// entity.transactions = data.transactions;
						entity.values = data.values;
						entity.complex_transaction = data.complex_transaction; // ?

						var originValuesKeys = Object.keys(originValues);
						var defaultValuesKeys = Object.keys(entity.values);

						originValuesKeys.forEach(function (originVal) {
							defaultValuesKeys.forEach(function (defaultVal) {

								if (originVal === defaultVal) {
									entity.values[defaultVal] = originValues[originVal];
								}

							})
						});

						complexTransactionService.rebookComplexTransaction(id, entity).then(function (data) {
							resolve(data);
						});
					});
				});
				break;
			case 'transaction-type':
				return transactionTypeService.update(id, entity);
				break;
			case 'transaction-type-group':
				return transactionTypeGroupService.update(id, entity);
				break;
			case 'price-history':
				return priceHistoryService.update(id, entity);
				break;
			case 'pricing-policy':
				return pricingPolicyService.update(id, entity);
				break;
			case 'currency-history':
				return currencyHistoryService.update(id, entity);
				break;
			case 'strategy-1':
				return strategyService.update(1, id, entity);
				break;
			case 'strategy-2':
				return strategyService.update(2, id, entity);
				break;
			case 'strategy-3':
				return strategyService.update(3, id, entity);
				break;
			case 'strategy-1-group':
				return strategyGroupService.update(1, id, entity);
				break;
			case 'strategy-2-group':
				return strategyGroupService.update(2, id, entity);
				break;
			case 'strategy-3-group':
				return strategyGroupService.update(3, id, entity);
				break;
			case 'strategy-1-subgroup':
				return strategySubgroupService.update(1, id, entity);
				break;
			case 'strategy-2-subgroup':
				return strategySubgroupService.update(2, id, entity);
				break;
			case 'strategy-3-subgroup':
				return strategySubgroupService.update(3, id, entity);
				break;
			case 'price-history-error':
				return priceHistoryErrorService.update(id, entity);
				break;
			case 'currency-history-error':
				return currencyHistoryErrorService.update(id, entity);
				break;
			case 'expression-procedure':
				return expressionProcedureService.update(id, entity);
				break;
			case 'data-procedure':
				return dataProcedureService.update(id, entity);
				break;
			case 'pricing-procedure':
				return pricingProcedureService.update(id, entity);
				break;
			case 'schedule':
				return scheduleService.update(id, entity);
				break;
			case 'configuration':
				return configurationService.update(id, entity);
				break;
		}
	};

	var updateBulk = function (entityType, entities) {
		switch (entityType) {
			case 'portfolio':
				return portfolioService.updateBulk(entities);
				break;
			case 'portfolio-register':
				return portfolioRegisterService.updateBulk(entities);
				break;
			case 'currency':
				//return currencyService.update(id, entity);
				break;
			case 'account':
				return accountService.updateBulk(entities);
				break;
			case 'account-type':
				return accountTypeService.updateBulk(entities);
				break;
			case 'responsible':
				return responsibleService.updateBulk(entities);
				break;
			case 'responsible-group':
				//return responsibleGroupService.update(id, entity);
				break;
			case 'counterparty':
				return counterpartyService.updateBulk(entities);
				break;
			case 'counterparty-group':
				//return counterpartyGroupService.update(id, entity);
				break;
			case 'instrument':
				return instrumentService.updateBulk(entities);
				break;
			case 'instrument-type':
				return instrumentTypeService.updateBulk(entities);
				break;
			case 'transaction':
				//return transactionService.update(id, entity);
				break;
			case 'complex-transaction':
				return complexTransactionService.updatePropertiesBulk(entities);
			case 'transaction-type':
				// return transactionTypeService.updateBulk(entities);
				return transactionTypeService.updateBulkLight(entities);
			case 'transaction-type-group':
				//return transactionTypeGroupService.update(id, entity);
				break;
			case 'price-history':
				//return priceHistoryService.update(id, entity);
				break;
			case 'pricing-policy':
				//return pricingPolicyService.update(id, entity);
				break;
			case 'currency-history':
				//return currencyHistoryService.update(id, entity);
				break;
			case 'strategy-1':
				return strategyService.updateBulk(1, entities);
				break;
			case 'strategy-2':
				return strategyService.updateBulk(2, entities);
				break;
			case 'strategy-3':
				return strategyService.updateBulk(3, entities);
				break;
			case 'strategy-1-group':
				//return strategyGroupService.update(1, id, entity);
				break;
			case 'strategy-2-group':
				//return strategyGroupService.update(2, id, entity);
				break;
			case 'strategy-3-group':
				//return strategyGroupService.update(3, id, entity);
				break;
			case 'strategy-1-subgroup':
				//return strategySubgroupService.update(1, id, entity);
				break;
			case 'strategy-2-subgroup':
				//return strategySubgroupService.update(2, id, entity);
				break;
			case 'strategy-3-subgroup':
				//return strategySubgroupService.update(3, id, entity);
				break;
		}
	};

	var deleteByKey = function (entityType, id) {
		switch (entityType) {
			case 'portfolio':
				return portfolioService.deleteByKey(id);
				break;
			case 'portfolio-register':
				return portfolioRegisterService.deleteByKey(id);
				break;
			case 'portfolio-register-record':
				return portfolioRegisterRecordService.deleteByKey(id);
				break;
			case 'account':
				return accountService.deleteByKey(id);
				break;
			case 'account-type':
				return accountTypeService.deleteByKey(id);
				break;
			case 'responsible':
				return responsibleService.deleteByKey(id);
				break;
			case 'responsible-group':
				return responsibleGroupService.deleteByKey(id);
				break;
			case 'counterparty':
				return counterpartyService.deleteByKey(id);
				break;
			case 'counterparty-group':
				return counterpartyGroupService.deleteByKey(id);
				break;
			case 'instrument':
				return instrumentService.deleteByKey(id);
				break;
			case 'instrument-type':
				return instrumentTypeService.deleteByKey(id);
				break;
			case 'complex-transaction':
				return complexTransactionService.deleteByKey(id);
				break;
			case 'transaction':
				return transactionService.deleteByKey(id);
				break;
			case 'transaction-type':
				return transactionTypeService.deleteByKey(id);
				break;
			case 'transaction-type-group':
				return transactionTypeGroupService.deleteByKey(id);
				break;
			case 'price-history':
				return priceHistoryService.deleteByKey(id);
				break;
			case 'pricing-policy':
				return pricingPolicyService.deleteByKey(id);
				break;
			case 'currency':
				return currencyService.deleteByKey(id);
				break;
			case 'currency-history':
				return currencyHistoryService.deleteByKey(id);
				break;
			case 'strategy-1':
				return strategyService.deleteByKey(1, id);
				break;
			case 'strategy-2':
				return strategyService.deleteByKey(2, id);
				break;
			case 'strategy-3':
				return strategyService.deleteByKey(3, id);
				break;
			case 'strategy-1-group':
				return strategyGroupService.deleteByKey(1, id);
				break;
			case 'strategy-2-group':
				return strategyGroupService.deleteByKey(2, id);
				break;
			case 'strategy-3-group':
				return strategyGroupService.deleteByKey(3, id);
				break;
			case 'strategy-1-subgroup':
				return strategySubgroupService.deleteByKey(1, id);
				break;
			case 'strategy-2-subgroup':
				return strategySubgroupService.deleteByKey(2, id);
				break;
			case 'strategy-3-subgroup':
				return strategySubgroupService.deleteByKey(3, id);
				break;
			case 'price-history-error':
				return priceHistoryErrorService.deleteByKey(id);
				break;
			case 'currency-history-error':
				return currencyHistoryErrorService.deleteByKey(id);
				break;
			case 'csv-import-scheme':
				return csvImportSchemeService.deleteByKey(id);
				break;
			case 'complex-import-scheme':
				return complexImportSchemeService.deleteByKey(id);
				break;
			case 'complex-transaction-import-scheme':
				return complexTransactionImportSchemeService.deleteByKey(id);
				break;
			case 'expression-procedure':
				return expressionProcedureService.deleteByKey(id);
				break;
			case 'data-procedure':
				return dataProcedureService.deleteByKey(id);
				break;
			case 'pricing-procedure':
				return pricingProcedureService.deleteByKey(id);
				break;
		}
	};

	var deleteBulk = function (entityType, data) {
		switch (entityType) {
			case 'portfolio':
				return portfolioService.deleteBulk(data);
			case 'portfolio-register':
				return portfolioRegisterService.deleteBulk(data);
			case 'portfolio-register-record':
				return portfolioRegisterRecordService.deleteBulk(data);
			case 'currency':
				return currencyService.deleteBulk(data);
			case 'account':
				return accountService.deleteBulk(data);
			case 'account-type':
				return accountTypeService.deleteBulk(data);
			case 'responsible':
				return responsibleService.deleteBulk(data);
			case 'responsible-group':
				return responsibleGroupService.deleteBulk(data);
			case 'counterparty':
				return counterpartyService.deleteBulk(data);
			case 'counterparty-group':
				return counterpartyGroupService.deleteBulk(data);
			case 'instrument':
				return instrumentService.deleteBulk(data);
			case 'instrument-type':
				return instrumentTypeService.deleteBulk(data);
			case 'transaction':
				return transactionService.deleteBulk(data);
			case 'complex-transaction':
				return complexTransactionService.deleteBulk(data);
			case 'transaction-type':
				return transactionTypeService.deleteBulk(data);
			case 'transaction-type-group':
				return transactionTypeGroupService.deleteBulk(data);
			case 'price-history':
				return priceHistoryService.deleteBulk(data);
			case 'pricing-policy':
				return pricingPolicyService.deleteBulk(data);
			case 'currency-history':
				return currencyHistoryService.deleteBulk(data);
			case 'strategy-1':
				return strategyService.deleteBulk(1, data);
			case 'strategy-2':
				return strategyService.deleteBulk(2, data);
			case 'strategy-3':
				return strategyService.deleteBulk(3, data);
			case 'strategy-1-group':
				//return strategyGroupService.deleteBulk(data);
				break;
			case 'strategy-2-group':
				//return strategyGroupService.deleteBulk(data);
				break;
			case 'strategy-3-group':
				//return strategyGroupService.deleteBulk(data);
				break;
			case 'strategy-1-subgroup':
				//return strategySubgroupService.deleteBulk(data);
				break;
			case 'strategy-2-subgroup':
				//return strategySubgroupService.deleteBulk(data);
				break;
			case 'strategy-3-subgroup':
				//return strategySubgroupService.deleteBulk(data);
				break;

			case 'price-history-error':
				return priceHistoryErrorService.deleteBulk(data);
			case 'currency-history-error':
				return currencyHistoryErrorService.deleteBulk(data);
		}
	};

	const selectsMap = {
		'instrumentSelect': ['instrument'],
		'unifiedDataSelect': ['counterparty', 'currency'],
		'entitySearchSelect': ['portfolio', 'account', 'responsible', 'strategy-1', 'strategy-2', 'strategy-3'],
		'dropdownSelect': ['pricing-policy'],
	};

	const getSelectByEntityType = function (entityType) {

		const selectKey = Object.keys(selectsMap).find(select => {
			return selectsMap[select].includes(entityType);
		});

		if (!selectKey) {
			console.error(`There is no selector for entity type: ${entityType}`);
			return;
		}

		return selectKey;

	}

	var request = function (path, method, data) {

		var method = method || 'GET';

		var prefix = baseUrlService.getMasterUserPrefix();
		var apiVersion = baseUrlService.getApiVersion();
		var baseUrl = baseUrlService.resolve();

		if (path[0] !== '/') {
			path.unshift('/');
		}

		var options = {
			method: method,
			credentials: 'include',
			headers: {
				'Authorization': 'Token ' + cookieService.getCookie('access_token'),
				Accept: 'application/json',
				'Content-type': 'application/json'
			}
		}

		if (data) {
			options.body = JSON.stringify(data)
		}

		return xhrService.fetch(baseUrl + '/' + prefix + '/' + apiVersion + path,
			options)

	}

	var getListReportGroups = function (entityType, options) {

		switch (entityType) {

			case 'balance-report':
				return reportService.getBackendBalanceReportGroups(options);
				break;
			case 'pl-report':
				return reportService.getBackendPnlReportGroups(options);
				break;
			case 'transaction-report':
				return reportService.getBackendTransactionReportGroups(options);
				break;

		}
	}

	var getListReportItems =function (entityType, options) {

		switch (entityType) {

			case 'balance-report':
				return reportService.getBackendBalanceReportItems(options);
				break;
			case 'pl-report':
				return reportService.getBackendPnlReportItems(options);
				break;
			case 'transaction-report':
				return reportService.getBackendTransactionReportItems(options);
				break;

		}
	}

	return {
		getList: getList,
		getListLight: getListLight,
		getByKey: getByKey,
		create: create,
		update: update,
		deleteByKey: deleteByKey,
		updateBulk: updateBulk,
		deleteBulk: deleteBulk,

		getSelectByEntityType: getSelectByEntityType,


		getListReportGroups: getListReportGroups,
		getListReportItems: getListReportItems,


		request: request
	}

}
