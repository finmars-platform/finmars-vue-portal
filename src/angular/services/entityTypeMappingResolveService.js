/**
 * Created by szhitenev on 19.08.2016.
 */

import currencyMappingService from './import/mappings/currencyMappingService'
import instrumentTypeMappingService from './import/mappings/instrumentTypeMappingService'
import accrualCalculationModelService from './import/mappings/accrualCalculationModelMappingService'
import instrumentPeriodicityService from './import/mappings/instrumentPeriodicityMappingService'
import instrumentAttributeTypeService from './import/mappings/instrumentAttributeTypeMappingService'

import accountMappingService from './import/mappings/accountMappingService'
import accountTypeMappingService from './import/mappings/accountTypeMappingService'
import instrumentMappingService from './import/mappings/instrumentMappingService'
import counterpartyMappingService from './import/mappings/counterpartyMappingService'
import responsibleMappingService from './import/mappings/responsibleMappingService'
import portfolioMappingService from './import/mappings/portfolioMappingService'

import strategy1MappingService from './import/mappings/strategy1MappingService'
import strategy2MappingService from './import/mappings/strategy2MappingService'
import strategy3MappingService from './import/mappings/strategy3MappingService'

import dailyPricingModelMappingService from './import/mappings/dailyPricingModelMappingService'
import pricingConditionMappingService from './import/mappings/pricingConditionMappingService'
import paymentSizeDetailMappingService from './import/mappings/paymentSizeDetailMappingService'
import priceDownloadSchemeMappingService from './import/mappings/priceDownloadSchemeMappingService'
import pricingPolicyMappingService from './import/mappings/pricingPolicyMappingService'

var getList = function (entityType, options) {


	switch (entityType) {
		case 'currency':
			return currencyMappingService.getList(options)
		case 'instrument-type':
			return instrumentTypeMappingService.getList(options)
		case 'accrual-calculation-model':
			return accrualCalculationModelService.getList(options)
		case 'periodicity':
			return instrumentPeriodicityService.getList(options)
		case 'classifier':
			return instrumentAttributeTypeService.getList(options)
		case 'account':
			return accountMappingService.getList(options)
		case 'account-type':
			return accountTypeMappingService.getList(options)
		case 'instrument':
			return instrumentMappingService.getList(options)
		case 'counterparty':
			return counterpartyMappingService.getList(options)
		case 'responsible':
			return responsibleMappingService.getList(options)
		case 'portfolio':
			return portfolioMappingService.getList(options)
		case 'strategy-1':
			return strategy1MappingService.getList(options)
		case 'strategy-2':
			return strategy2MappingService.getList(options)
		case 'strategy-3':
			return strategy3MappingService.getList(options)
		case 'daily-pricing-model':
			return dailyPricingModelMappingService.getList(options)
		case 'payment-size-detail':
			return paymentSizeDetailMappingService.getList(options)
		case 'pricing-condition':
			return pricingConditionMappingService.getList(options)
		case 'price-download-scheme':
			return priceDownloadSchemeMappingService.getList(options)
		case 'pricing-policy':
			return pricingPolicyMappingService.getList(options)
	}
}

var getByKey = function (entityType, id) {
	switch (entityType) {
		case 'currency':
			return currencyMappingService.getByKey(id)
		case 'instrument-type':
			return instrumentTypeMappingService.getByKey(id)
		case 'accrual-calculation-model':
			return accrualCalculationModelService.getByKey(id)
		case 'periodicity':
			return instrumentPeriodicityService.getByKey(id)
		case 'classifier':
			return instrumentAttributeTypeService.getByKey(id)
		case 'account':
			return accountMappingService.getByKey(id)
		case 'account-type':
			return accountTypeMappingService.getByKey(id)
		case 'instrument':
			return instrumentMappingService.getByKey(id)
		case 'counterparty':
			return counterpartyMappingService.getByKey(id)
		case 'responsible':
			return responsibleMappingService.getByKey(id)
		case 'portfolio':
			return portfolioMappingService.getByKey(id)
		case 'strategy-1':
			return strategy1MappingService.getByKey(id)
		case 'strategy-2':
			return strategy2MappingService.getByKey(id)
		case 'strategy-3':
			return strategy3MappingService.getByKey(id)
		case 'daily-pricing-model':
			return dailyPricingModelMappingService.getByKey(id)
		case 'pricing-condition':
			return pricingConditionMappingService.getByKey(id)
		case 'payment-size-detail':
			return paymentSizeDetailMappingService.getByKey(id)
		case 'price-download-scheme':
			return priceDownloadSchemeMappingService.getByKey(id)
		case 'pricing-policy':
			return pricingPolicyMappingService.getByKey(id)
	}
}

var create = function (entityType, map) {
	switch (entityType) {
		case 'currency':
			return currencyMappingService.create(map)
		case 'instrument-type':
			return instrumentTypeMappingService.create(map)
		case 'accrual-calculation-model':
			return accrualCalculationModelService.create(map)
		case 'periodicity':
			return instrumentPeriodicityService.create(map)
		case 'classifier':
			return instrumentAttributeTypeService.create(map)
		case 'account':
			return accountMappingService.create(map)
		case 'account-type':
			return accountTypeMappingService.create(map)
		case 'instrument':
			return instrumentMappingService.create(map)
		case 'counterparty':
			return counterpartyMappingService.create(map)
		case 'responsible':
			return responsibleMappingService.create(map)
		case 'portfolio':
			return portfolioMappingService.create(map)
		case 'strategy-1':
			return strategy1MappingService.create(map)
		case 'strategy-2':
			return strategy2MappingService.create(map)
		case 'strategy-3':
			return strategy3MappingService.create(map)
		case 'daily-pricing-model':
			return dailyPricingModelMappingService.create(map)
		case 'pricing-condition':
			return pricingConditionMappingService.create(map)
		case 'payment-size-detail':
			return paymentSizeDetailMappingService.create(map)
		case 'price-download-scheme':
			return priceDownloadSchemeMappingService.create(map)
		case 'pricing-policy':
			return pricingPolicyMappingService.create(map)
	}
}

var update = function (entityType, id, map) {
	switch (entityType) {
		case 'currency':
			return currencyMappingService.update(id, map)
		case 'instrument-type':
			return instrumentTypeMappingService.update(id, map)
		case 'accrual-calculation-model':
			return accrualCalculationModelService.update(id, map)
		case 'periodicity':
			return instrumentPeriodicityService.update(id, map)
		case 'classifier':
			return instrumentAttributeTypeService.update(id, map)
		case 'account':
			return accountMappingService.update(id, map)
		case 'account-type':
			return accountTypeMappingService.update(id, map)
		case 'instrument':
			return instrumentMappingService.update(id, map)
		case 'counterparty':
			return counterpartyMappingService.update(id, map)
		case 'responsible':
			return responsibleMappingService.update(id, map)
		case 'portfolio':
			return portfolioMappingService.update(id, map)
		case 'strategy-1':
			return strategy1MappingService.update(id, map)
		case 'strategy-2':
			return strategy2MappingService.update(id, map)
		case 'strategy-3':
			return strategy3MappingService.update(id, map)
		case 'daily-pricing-model':
			return dailyPricingModelMappingService.update(id, map)
		case 'pricing-condition':
			return pricingConditionMappingService.update(id, map)
		case 'payment-size-detail':
			return paymentSizeDetailMappingService.update(id, map)
		case 'price-download-scheme':
			return priceDownloadSchemeMappingService.update(id, map)
		case 'pricing-policy':
			return pricingPolicyMappingService.update(id, map)
	}
}

var deleteByKey = function (entityType, id) {
	switch (entityType) {
		case 'currency':
			return currencyMappingService.deleteByKey(id)
		case 'instrument-type':
			return instrumentTypeMappingService.deleteByKey(id)
		case 'accrual-calculation-model':
			return accrualCalculationModelService.deleteByKey(id)
		case 'periodicity':
			return instrumentPeriodicityService.deleteByKey(id)
		case 'classifier':
			return instrumentAttributeTypeService.deleteByKey(id)
		case 'account':
			return accountMappingService.deleteByKey(id)
		case 'account-type':
			return accountTypeMappingService.deleteByKey(id)
		case 'instrument':
			return instrumentMappingService.deleteByKey(id)
		case 'counterparty':
			return counterpartyMappingService.deleteByKey(id)
		case 'responsible':
			return responsibleMappingService.deleteByKey(id)
		case 'portfolio':
			return portfolioMappingService.deleteByKey(id)
		case 'strategy-1':
			return strategy1MappingService.deleteByKey(id)
		case 'strategy-2':
			return strategy2MappingService.deleteByKey(id)
		case 'strategy-3':
			return strategy3MappingService.deleteByKey(id)
		case 'daily-pricing-model':
			return dailyPricingModelMappingService.deleteByKey(id)
		case 'pricing-condition':
			return pricingConditionMappingService.deleteByKey(id)
		case 'payment-size-detail':
			return paymentSizeDetailMappingService.deleteByKey(id)
		case 'price-download-scheme':
			return priceDownloadSchemeMappingService.deleteByKey(id)
		case 'pricing-policy':
			return pricingPolicyMappingService.deleteByKey(id)
	}
}

export default {
	getList: getList,
	getByKey: getByKey,
	create: create,
	update: update,
	deleteByKey: deleteByKey,
}
