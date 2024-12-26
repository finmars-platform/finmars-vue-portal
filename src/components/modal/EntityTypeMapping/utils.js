import { getList as currencyMappingGetList } from '@/services/currencyMappingService';
import { getList as instrumentTypeMappingGetList } from '@/services/instrumentTypeMappingService';
import { getList as accrualCalculationModelMappingGetList } from '@/services/accrualCalculationModelMappingService';
import { getList as instrumentPeriodicityMappingGetList } from '@/services/instrumentPeriodicityMappingService';
import { getList as instrumentAttributeTypeMappingGetList } from '@/services/instrumentAttributeTypeMappingService';
import { getList as accountMappingGetList } from '@/services/accountMappingService';
import { getList as accountTypeMappingGetList } from '@/services/accountTypeMappingService';
import { getList as instrumentMappingGetList } from '@/services/instrumentMappingService';
import { getList as counterpartyMappingGetList } from '@/services/counterpartyMappingService';
import { getList as responsibleMappingGetList } from '@/services/responsibleMappingService';
import { getList as portfolioMappingGetList } from '@/services/portfolioMappingService';
import { getList as strategy1MappingGetList } from '@/services/strategy1MappingService';
import { getList as strategy2MappingGetList } from '@/services/strategy2MappingService';
import { getList as strategy3MappingGetList } from '@/services/strategy3MappingService';
import { getList as dailyPricingModelMappingGetList } from '@/services/dailyPricingModelMappingService';
import { getList as paymentSizeDetailMappingGetList } from '@/services/paymentSizeDetailMappingService';
import { getList as pricingConditionMappingGetList } from '@/services/pricingConditionMappingService';
import { getList as priceDownloadSchemeMappingGetList } from '@/services/priceDownloadSchemeMappingService';
import { getList as pricingPolicyMappingGetList } from '@/services/pricingPolicyMappingService';

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
			return accountTypeMappingGetList(options);
		case 'instrument':
			return instrumentMappingGetList(options);
		case 'counterparty':
			return counterpartyMappingGetList(options);
		case 'responsible':
			return responsibleMappingGetList(options);
		case 'portfolio':
			return portfolioMappingGetList(options);
		case 'strategy-1':
			return strategy1MappingGetList(options);
		case 'strategy-2':
			return strategy2MappingGetList(options);
		case 'strategy-3':
			return strategy3MappingGetList(options);
		case 'daily-pricing-model':
			return dailyPricingModelMappingGetList(options);
		case 'payment-size-detail':
			return paymentSizeDetailMappingGetList(options);
		case 'pricing-condition':
			return pricingConditionMappingGetList(options);
		case 'price-download-scheme':
			return priceDownloadSchemeMappingGetList(options);
		case 'pricing-policy':
			return pricingPolicyMappingGetList(options);
	}
}
