import * as currencyMappingService from '@/services/currencyMappingService';
import * as instrumentTypeMappingService from '@/services/instrumentTypeMappingService';
import * as accrualCalculationModelService from '@/services/accrualCalculationModelService';
import * as instrumentPeriodicityMappingService from '@/services/instrumentPeriodicityMappingService';
import * as instrumentAttributeTypeMappingService from '@/services/instrumentAttributeTypeMappingService';
import * as accountMappingService from '@/services/accountMappingService';
import * as accountTypeMappingService from '@/services/accountTypeMappingService';
import * as instrumentMappingService from '@/services/instrumentMappingService';
import * as counterpartyMappingService from '@/services/counterpartyMappingService';
import * as responsibleMappingService from '@/services/responsibleMappingService';
import * as portfolioMappingService from '@/services/portfolioMappingService';
import * as strategy1MappingService from '@/services/strategy1MappingService';
import * as strategy2MappingService from '@/services/strategy2MappingService';
import * as strategy3MappingService from '@/services/strategy3MappingService';
import * as dailyPricingModelMappingService from '@/services/dailyPricingModelMappingService';
import * as pricingConditionMappingService from '@/services/pricingConditionMappingService';
import * as paymentSizeDetailMappingService from '@/services/paymentSizeDetailMappingService';
import * as priceDownloadSchemeMappingService from '@/services/priceDownloadSchemeMappingService';
import * as pricingPolicyMappingService from '@/services/pricingPolicyMappingService';

export async function create(entityType, map) {
	switch (entityType) {
		case 'currency':
			return currencyMappingService.create(map);
		case 'instrument-type':
			return instrumentTypeMappingService.create(map);
		case 'accrual-calculation-model':
			return accrualCalculationModelService.create(map);
		case 'periodicity':
			return instrumentPeriodicityMappingService.create(map);
		case 'classifier':
			return instrumentAttributeTypeMappingService.create(map);
		case 'account':
			return accountMappingService.create(map);
		case 'account-type':
			return accountTypeMappingService.create(map);
		case 'instrument':
			return instrumentMappingService.create(map);
		case 'counterparty':
			return counterpartyMappingService.create(map);
		case 'responsible':
			return responsibleMappingService.create(map);
		case 'portfolio':
			return portfolioMappingService.create(map);
		case 'strategy-1':
			return strategy1MappingService.create(map);
		case 'strategy-2':
			return strategy2MappingService.create(map);
		case 'strategy-3':
			return strategy3MappingService.create(map);
		case 'daily-pricing-model':
			return dailyPricingModelMappingService.create(map);
		case 'pricing-condition':
			return pricingConditionMappingService.create(map);
		case 'payment-size-detail':
			return paymentSizeDetailMappingService.create(map);
		case 'price-download-scheme':
			return priceDownloadSchemeMappingService.create(map);
		case 'pricing-policy':
			return pricingPolicyMappingService.create(map);
	}
}

export async function deleteByKey(entityType, id) {
	switch (entityType) {
		case 'currency':
			return currencyMappingService.deleteByKey(id);
		case 'instrument-type':
			return instrumentTypeMappingService.deleteByKey(id);
		case 'accrual-calculation-model':
			return accrualCalculationModelService.deleteByKey(id);
		case 'periodicity':
			return instrumentPeriodicityService.deleteByKey(id);
		case 'classifier':
			return instrumentAttributeTypeService.deleteByKey(id);
		case 'account':
			return accountMappingService.deleteByKey(id);
		case 'account-type':
			return accountTypeMappingService.deleteByKey(id);
		case 'instrument':
			return instrumentMappingService.deleteByKey(id);
		case 'counterparty':
			return counterpartyMappingService.deleteByKey(id);
		case 'responsible':
			return responsibleMappingService.deleteByKey(id);
		case 'portfolio':
			return portfolioMappingService.deleteByKey(id);
		case 'strategy-1':
			return strategy1MappingService.deleteByKey(id);
		case 'strategy-2':
			return strategy2MappingService.deleteByKey(id);
		case 'strategy-3':
			return strategy3MappingService.deleteByKey(id);
		case 'daily-pricing-model':
			return dailyPricingModelMappingService.deleteByKey(id);
		case 'pricing-condition':
			return pricingConditionMappingService.deleteByKey(id);
		case 'payment-size-detail':
			return paymentSizeDetailMappingService.deleteByKey(id);
		case 'price-download-scheme':
			return priceDownloadSchemeMappingService.deleteByKey(id);
		case 'pricing-policy':
			return pricingPolicyMappingService.deleteByKey(id);
	}
}

export async function update(entityType, map) {
	switch (entityType) {
		case 'currency':
			return currencyMappingService.update(map);
		case 'instrument-type':
			return instrumentTypeMappingService.update(map);
		case 'accrual-calculation-model':
			return accrualCalculationModelService.update(map);
		case 'periodicity':
			return instrumentPeriodicityMappingService.update(map);
		case 'classifier':
			return instrumentAttributeTypeMappingService.update(map);
		case 'account':
			return accountMappingService.update(map);
		case 'account-type':
			return accountTypeMappingService.update(map);
		case 'instrument':
			return instrumentMappingService.update(map);
		case 'counterparty':
			return counterpartyMappingService.update(map);
		case 'responsible':
			return responsibleMappingService.update(map);
		case 'portfolio':
			return portfolioMappingService.update(map);
		case 'strategy-1':
			return strategy1MappingService.update(map);
		case 'strategy-2':
			return strategy2MappingService.update(map);
		case 'strategy-3':
			return strategy3MappingService.update(map);
		case 'daily-pricing-model':
			return dailyPricingModelMappingService.update(map);
		case 'pricing-condition':
			return pricingConditionMappingService.update(map);
		case 'payment-size-detail':
			return paymentSizeDetailMappingService.update(map);
		case 'price-download-scheme':
			return priceDownloadSchemeMappingService.update(map);
		case 'pricing-policy':
			return pricingPolicyMappingService.update(map);
	}
}
