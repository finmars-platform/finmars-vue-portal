import { ref } from 'vue';
import { defineStore } from 'pinia';
import cloneDeep from 'lodash/cloneDeep';
import { portfolioAttributes } from '~/assets/data/models/portfolioPropsModel';
import { portfolioTypeAttributes } from '~/assets/data/models/portfolioTypePropsModel';
import { portfolioReconcileGroupAttributes } from '~/assets/data/models/portfolioReconcileGroupPropsModel';
import { portfolioRegisterAttributes } from '~/assets/data/models/portfolioRegisterPropsModel';
import { portfolioRegisterRecordAttributes } from '~/assets/data/models/portfolioRegisterRecordPropsModel';
import { portfolioHistoryAttributes } from '~/assets/data/models/portfolioHistoryPropsModel';
import { portfolioReconcileHistoryAttributes } from '~/assets/data/models/portfolioReconcileHistoryPropsModel';
import { auditTransactionAttributes } from '~/assets/data/models/auditTransactionPropsModel';
import { auditInstrumentAttributes } from '~/assets/data/models/auditInstrumentPropsModel';
import { accountAttributes } from '~/assets/data/models/accountPropsModel';
import { tagPropsAttributes } from '~/assets/data/models/tagPropsModel';
import { accountTypeAttributes } from '~/assets/data/models/accountTypePropsModel';
import { counterpartyAttributes } from '~/assets/data/models/counterpartyPropsModel';
import { counterpartyGroupAttributes } from '~/assets/data/models/counterpartyGroupPropsModel';
import { responsibleAttributes } from '~/assets/data/models/responsiblePropsModel';
import { responsibleGroupAttributes } from '~/assets/data/models/responsibleGroupPropsModel';
import { pricingPolicyAttributes } from '~/assets/data/models/pricingPolicyPropsModel';
import { instrumentTypeAttributes } from '~/assets/data/models/instrumentTypePropsModel';
import { instrumentAttributes } from '~/assets/data/models/instrumentPropsModel';
import { generatedEventAttributes } from '~/assets/data/models/generatedEventPropsModel';
import { transactionAttributes } from '~/assets/data/models/transactionPropsModel';
import { transactionTypeGroupAttributes } from '~/assets/data/models/transactionTypeGroupPropsModel';
import { transactionTypeAttributes } from '~/assets/data/models/transactionTypePropsModel';
import { currencyAttributes } from '~/assets/data/models/currencyPropsModel';
import { currencyHistoryAttributes } from '~/assets/data/models/currencyHistoryPropsModel';
import { priceHistoryAttributes } from '~/assets/data/models/priceHistoryPropsModel';
import { strategy1Attributes } from '~/assets/data/models/strategy1PropsModel';
import { strategy2Attributes } from '~/assets/data/models/strategy2PropsModel';
import { strategy3Attributes } from '~/assets/data/models/strategy3PropsModel';
import { strategy1subgroupAttributes } from '~/assets/data/models/strategy1subgroupPropsModel';
import { strategy2subgroupAttributes } from '~/assets/data/models/strategy2subgroupPropsModel';
import { strategy3subgroupAttributes } from '~/assets/data/models/strategy3subgroupPropsModel';
import { strategy1groupAttributes } from '~/assets/data/models/strategy1groupPropsModel';
import { strategy2groupAttributes } from '~/assets/data/models/strategy2groupPropsModel';
import { strategy3groupAttributes } from '~/assets/data/models/strategy3groupPropsModel';
import { complexTransactionAttributes } from '~/assets/data/models/complexTransactionPropsModel';
import { instrumentSchemeAttributes } from '~/assets/data/models/instrumentSchemePropsModel';
import { balanceReportAttributes } from '~/assets/data/models/balanceReportPropsModel';
import { reportAddonPerformanceAttributes } from '~/assets/data/models/reportAddonPerformancePropsModel';
import { reportMismatchAttributes } from '~/assets/data/models/reportMismatchPropsModel';
import { pnlReportAttributes } from '~/assets/data/models/pnlReportPropsModel';
import { reportAddonPerformancePnlAttributes } from '~/assets/data/models/reportAddonPerformancePnlPropsModel';
import { reportMismatchPnlAttributes } from '~/assets/data/models/reportMismatchPnlPropsModel';
import { transactionReportAttributes } from '~/assets/data/models/transactionReportPropsModel';
import { cashFlowProjectionReportAttributes } from '~/assets/data/models/cashFlowProjectionReportPropsModel';
import { performanceReportAttributes } from '~/assets/data/models/performanceReportPropsModel';
import { currencyHistoryErrorAttributes } from '~/assets/data/models/currencyHistoryErrorPropsModel';
import { priceHistoryErrorAttributes } from '~/assets/data/models/priceHistoryErrorPropsModel';
import { transactionClassAttributes } from '~/assets/data/models/transactionClassPropsModel';
import { complextransactionStatusAttributes } from '~/assets/data/models/complextransactionStatusPropsModel';
import { countryAttributes } from '~/assets/data/models/countryPropsModel';
import { complexTransactionImportSchemeAttributes } from '~/assets/data/models/complexTransactionImportSchemePropsModel';
import { csvImportSchemeAttributes } from '~/assets/data/models/csvImportSchemePropsModel';
import { getList as getCustomFieldList } from '~/services/customFieldService';
import { getList as getAttributeTypeList } from '~/services/attributeTypeService';
import {
	findContentTypeByEntity,
	findEntityByContentType
} from '~/services/meta/metaContentTypeService';
import { getInstrumentFieldPrimaryList } from '~/services/uiService';
import { T_TYPE_USER_FIELDS } from '~/constants/attributeData';

export const useAttributes = defineStore('attributes', () => {
	const attributesByEntityType = ref({});
	const reportsEntityTypes = ['balance-report', 'pl-report', 'transaction-report'];
	const entityAttributesData = ref({
		portfolio: cloneDeep(portfolioAttributes),
		'portfolio-type': cloneDeep(portfolioTypeAttributes),
		'portfolio-reconcile-group': cloneDeep(portfolioReconcileGroupAttributes),
		'portfolio-register': cloneDeep(portfolioRegisterAttributes),
		'portfolio-register-record': cloneDeep(portfolioRegisterRecordAttributes),
		'portfolio-history': cloneDeep(portfolioHistoryAttributes),
		'portfolio-reconcile-history': cloneDeep(portfolioReconcileHistoryAttributes),
		'audit-transaction': cloneDeep(auditTransactionAttributes),
		'audit-instrument': cloneDeep(auditInstrumentAttributes),
		account: cloneDeep(accountAttributes),
		tag: cloneDeep(tagPropsAttributes),
		'account-type': cloneDeep(accountTypeAttributes),
		counterparty: cloneDeep(counterpartyAttributes),
		'counterparty-group': cloneDeep(counterpartyGroupAttributes),
		responsible: cloneDeep(responsibleAttributes),
		'responsible-group': cloneDeep(responsibleGroupAttributes),
		'pricing-policy': cloneDeep(pricingPolicyAttributes),
		'instrument-type': cloneDeep(instrumentTypeAttributes),
		instrument: cloneDeep(instrumentAttributes),
		'generated-event': cloneDeep(generatedEventAttributes),
		transaction: cloneDeep(transactionAttributes),
		'transaction-type-group': cloneDeep(transactionTypeGroupAttributes),
		'transaction-type': cloneDeep(transactionTypeAttributes),
		currency: cloneDeep(currencyAttributes),
		'currency-history': cloneDeep(currencyHistoryAttributes),
		'price-history': cloneDeep(priceHistoryAttributes),
		'strategy-1': cloneDeep(strategy1Attributes),
		'strategy-2': cloneDeep(strategy2Attributes),
		'strategy-3': cloneDeep(strategy3Attributes),
		'strategy-1-subgroup': cloneDeep(strategy1subgroupAttributes),
		'strategy-2-subgroup': cloneDeep(strategy2subgroupAttributes),
		'strategy-3-subgroup': cloneDeep(strategy3subgroupAttributes),
		'strategy-1-group': cloneDeep(strategy1groupAttributes),
		'strategy-2-group': cloneDeep(strategy2groupAttributes),
		'strategy-3-group': cloneDeep(strategy3groupAttributes),
		'complex-transaction': cloneDeep(complexTransactionAttributes),
		'instrument-scheme': cloneDeep(instrumentSchemeAttributes),
		'balance-report': cloneDeep(balanceReportAttributes),
		'balance-report-performance': cloneDeep(reportAddonPerformanceAttributes),
		'balance-report-mismatch': cloneDeep(reportMismatchAttributes),
		'pl-report': cloneDeep(pnlReportAttributes),
		'pl-report-performance': cloneDeep(reportAddonPerformancePnlAttributes),
		'pl-report-mismatch': cloneDeep(reportMismatchPnlAttributes),
		'transaction-report': cloneDeep(transactionReportAttributes),
		'cash-flow-projection-report': cloneDeep(cashFlowProjectionReportAttributes),
		'performance-report': cloneDeep(performanceReportAttributes),
		'currency-history-error': cloneDeep(currencyHistoryErrorAttributes),
		'price-history-error': cloneDeep(priceHistoryErrorAttributes),
		'transaction-class': cloneDeep(transactionClassAttributes),
		'complex-transaction-status': cloneDeep(complextransactionStatusAttributes),
		country: cloneDeep(countryAttributes),
		'complex-transaction-import-scheme': cloneDeep(complexTransactionImportSchemeAttributes),
		'csv-import-scheme': cloneDeep(csvImportSchemeAttributes)
	});
	const customFieldsData = ref({});
	const dynamicAttributesData = ref({});
	const instrumentUserFieldsData = ref([]);
	const transactionUserFieldsData = ref([]);
	const complexTransactionUserFieldsData = ref([]);
	const reconciliationAttributes = ref([]);
	const attributesAvailableForColumns = ref([]);

	async function downloadCustomFieldsByEntityType(entityType) {
		const data = await getCustomFieldList(entityType, { pageSize: 1000 });
		customFieldsData.value[entityType] = data.results || [];
		return data.results || [];
	}

	async function downloadDynamicAttributesByEntityType(entityType) {
		const data = await getAttributeTypeList(entityType, { pageSize: 1000 });
		dynamicAttributesData.value[entityType] = data?.results || [];
		return data.results || [];
	}

	async function downloadInstrumentUserFields() {
		const data = await getInstrumentFieldPrimaryList({ pageSize: 1000 });
		instrumentUserFieldsData.value = data?.results || [];
		return instrumentUserFieldsData.value;
	}

	function appendEntityAttribute(entityType, field) {
		if (entityAttributesData.value[entityType]) {
			entityAttributesData.value[entityType].push(field);
		} else {
			console.error(`Can't append field`);
		}
	}

	function getAllAttributesByEntityType(entityType, viewContext) {
		console.log('getAllAttributesByEntityType => ', entityType);
		if (viewContext === 'reconciliation_viewer') {
			return reconciliationAttributes.value;
		}

		if (entityType === 'balance-report') {
			const res = _getBalanceReportAttributes();
			attributesByEntityType[entityType] = res;
			return res;
		}

		if (entityType === 'pl-report') {
			const res = _getPlReportAttributes();
			attributesByEntityType[entityType] = res;
			return res;
		}

		if (entityType === 'transaction-report') {
			const res = _getTransactionReportAttributes();
			attributesByEntityType[entityType] = res;
			return res;
		}

		const contentType = findContentTypeByEntity(entityType);
		console.log('111 => ', contentType);
		const entityAttrs = getEntityAttributesByEntityType(entityType);
		console.log('222 => ', entityAttrs);
		entityAttrs.forEach((item) => {
			const { key, value_entity } = item;
			if (key === 'subgroup' && value_entity.includes('strategy')) {
				item.name = 'Group';
			}
			item.entity = entityType;
		});

		const dynamicAttrs = !dynamicAttributesData.value[entityType]
			? []
			: cloneDeep(dynamicAttributesData.value[entityType]).map((attr) => ({
					attribute_type: attr,
					value_type: attr.value_type,
					content_type: contentType,
					key: `attributes.${attr.user_code}`,
					name: attr.name
				}));

		const res = [...entityAttrs, ...dynamicAttrs];
		attributesByEntityType[entityType] = res;
		return res;
	}

	/* auxiliary functions  */
	function _getBalanceReportAttributes() {
		const balanceMismatchAttrs = getAllAttributesAsFlatList(
			'reports.balancereportmismatch',
			'',
			'Mismatch',
			{ maxDepth: 1 }
		);

		const balancePerformanceAttrs = getAllAttributesAsFlatList(
			'reports.balancereportperformance',
			'',
			'Performance',
			{ maxDepth: 1 }
		);

		const instrumentAttrsData = getAllAttributesAsFlatList(
			'instruments.instrument',
			'instrument',
			'Instrument',
			{ maxDepth: 1 }
		);
		const instrumentAttrs = applyAliasesToAttrs(
			instrumentAttrsData,
			'instruments.instrument',
			'instrument.',
			'Instrument. '
		);

		const linkedInstrumentAttrsData = getAllAttributesAsFlatList(
			'instruments.instrument',
			'linked_instrument',
			'Linked Instrument',
			{ maxDepth: 1 }
		);
		const linkedInstrumentAttrs = applyAliasesToAttrs(
			linkedInstrumentAttrsData,
			'instruments.instrument',
			'linked_instrument.',
			'Linked Instrument. '
		);

		const allocationAttrsData = getAllAttributesAsFlatList(
			'instruments.instrument',
			'allocation',
			'Allocation',
			{ maxDepth: 1 }
		);
		const allocationAttrs = applyAliasesToAttrs(
			allocationAttrsData,
			'instruments.instrument',
			'allocation.',
			'Allocation. '
		);

		const currencyAttrs = getAllAttributesAsFlatList(
			'currencies.currency',
			'currency',
			'Currency',
			{ maxDepth: 1 }
		);

		const accountAttrs = getAllAttributesAsFlatList('accounts.account', 'account', 'Account', {
			maxDepth: 1
		});

		const portfolioAttrs = getAllAttributesAsFlatList(
			'portfolios.portfolio',
			'portfolio',
			'Portfolio',
			{ maxDepth: 1 }
		);

		const strategy1attrs = getAllAttributesAsFlatList(
			'strategies.strategy1',
			'strategy1',
			'Strategy 1',
			{ maxDepth: 1 }
		);

		const strategy2attrs = getAllAttributesAsFlatList(
			'strategies.strategy2',
			'strategy2',
			'Strategy 2',
			{ maxDepth: 1 }
		);

		const strategy3attrs = getAllAttributesAsFlatList(
			'strategies.strategy3',
			'strategy3',
			'Strategy 3',
			{ maxDepth: 1 }
		);

		const balanceAttrs = getAllAttributesAsFlatList('reports.balancereport', '', 'Balance', {
			maxDepth: 1
		}).filter((bAttr) => {
			const cAttr = currencyAttrs.find((a) => a.key === bAttr.key);
			return !cAttr;
		});

		const custom = !customFieldsData.value['balance-report']
			? []
			: cloneDeep(customFieldsData.value['balance-report']).map((ci) => ({
					...ci,
					custom_field: ci,
					key: `custom_fields.${ci.user_code}`,
					name: `Custom Field. ${ci.name}`
				}));

		const portfolioDynamicAttrs = cloneDeep(dynamicAttributesData.value.portfolio) || [];
		const accountDynamicAttrs = cloneDeep(dynamicAttributesData.value.account) || [];
		const instrumentDynamicAttrs = cloneDeep(dynamicAttributesData.value.instrument) || [];
		const allocationDynamicAttrs = cloneDeep(dynamicAttributesData.value.instrument) || [];
		const linkedInstrumentDynamicAttrs = cloneDeep(dynamicAttributesData.value.instrument) || [];

		const portfolioDynamicAttrsFormatted = formatAttributeTypes(
			portfolioDynamicAttrs,
			'portfolios.portfolio',
			'portfolio',
			'Portfolio'
		);
		const accountDynamicAttrsFormatted = formatAttributeTypes(
			accountDynamicAttrs,
			'accounts.account',
			'account',
			'Account'
		);
		const currencyDynamicAttrsFormatted = formatAttributeTypes(
			accountDynamicAttrs,
			'currencies.currency',
			'currency',
			'Currency'
		);
		const instrumentDynamicAttrsFormatted = formatAttributeTypes(
			instrumentDynamicAttrs,
			'instruments.instrument',
			'instrument',
			'Instrument'
		);
		const allocationDynamicAttrsFormatted = formatAttributeTypes(
			allocationDynamicAttrs,
			'instruments.instrument',
			'allocation',
			'Allocation'
		);
		const linkedInstrumentDynamicAttrsFormatted = formatAttributeTypes(
			linkedInstrumentDynamicAttrs,
			'instruments.instrument',
			'linked_instrument',
			'Linked Instrument'
		);

		return [
			...balanceAttrs,
			...balanceMismatchAttrs,
			...balancePerformanceAttrs,
			...allocationAttrs,
			...instrumentAttrs,
			...linkedInstrumentAttrs,
			...currencyAttrs,
			...accountAttrs,
			...portfolioAttrs,
			...strategy1attrs,
			...strategy2attrs,
			...strategy3attrs,
			...custom,
			...portfolioDynamicAttrsFormatted,
			...accountDynamicAttrsFormatted,
			...currencyDynamicAttrsFormatted,
			...instrumentDynamicAttrsFormatted,
			...allocationDynamicAttrsFormatted,
			...linkedInstrumentDynamicAttrsFormatted
		];
	}

	function _getPlReportAttributes() {
		let result = [];

		const balanceAttrs = getAllAttributesAsFlatList('reports.plreport', '', 'Balance', {
			maxDepth: 1
		});

		const balanceMismatchAttrs = getAllAttributesAsFlatList(
			'reports.plreportmismatch',
			'',
			'Mismatch',
			{ maxDepth: 1 }
		);

		const balancePerformanceAttrs = getAllAttributesAsFlatList(
			'reports.plreportperformance',
			'',
			'Performance',
			{ maxDepth: 1 }
		);

		const instrumentAttrsData = getAllAttributesAsFlatList(
			'instruments.instrument',
			'instrument',
			'Instrument',
			{ maxDepth: 1 }
		);
		const instrumentAttrs = applyAliasesToAttrs(
			instrumentAttrsData,
			'instruments.instrument',
			'instrument.',
			'Instrument. '
		);

		const linkedInstrumentAttrsData = getAllAttributesAsFlatList(
			'instruments.instrument',
			'linked_instrument',
			'Linked Instrument',
			{ maxDepth: 1 }
		);
		const linkedInstrumentAttrs = applyAliasesToAttrs(
			linkedInstrumentAttrsData,
			'instruments.instrument',
			'linked_instrument.',
			'Linked Instrument. '
		);

		const allocationAttrsData = getAllAttributesAsFlatList(
			'instruments.instrument',
			'allocation',
			'Allocation',
			{ maxDepth: 1 }
		);
		const allocationAttrs = applyAliasesToAttrs(
			allocationAttrsData,
			'instruments.instrument',
			'allocation.',
			'Allocation. '
		);

		const accountAttrs = getAllAttributesAsFlatList('accounts.account', 'account', 'Account', {
			maxDepth: 1
		});

		const portfolioAttrs = getAllAttributesAsFlatList(
			'portfolios.portfolio',
			'portfolio',
			'Portfolio',
			{ maxDepth: 1 }
		);

		const strategy1attrs = getAllAttributesAsFlatList(
			'strategies.strategy1',
			'strategy1',
			'Strategy 1',
			{ maxDepth: 1 }
		);

		const strategy2attrs = getAllAttributesAsFlatList(
			'strategies.strategy2',
			'strategy2',
			'Strategy 2',
			{ maxDepth: 1 }
		);

		const strategy3attrs = getAllAttributesAsFlatList(
			'strategies.strategy3',
			'strategy3',
			'Strategy 3',
			{ maxDepth: 1 }
		);

		result = [
			...balanceAttrs,
			...balanceMismatchAttrs,
			...balancePerformanceAttrs,
			...allocationAttrs,
			...instrumentAttrs,
			...linkedInstrumentAttrs,
			...accountAttrs,
			...portfolioAttrs,
			...strategy1attrs,
			...strategy2attrs,
			...strategy3attrs
		].filter((attr) => !attr.key.includes('return'));

		const custom = !customFieldsData.value['pl-report']
			? []
			: cloneDeep(customFieldsData.value['pl-report']).map((ci) => ({
					...ci,
					custom_field: ci,
					key: `custom_fields.${ci.user_code}`,
					name: `Custom Field. ${ci.name}`
				}));

		const portfolioDynamicAttrs = cloneDeep(dynamicAttributesData.value.portfolio) || [];
		const accountDynamicAttrs = cloneDeep(dynamicAttributesData.value.account) || [];
		const instrumentDynamicAttrs = cloneDeep(dynamicAttributesData.value.instrument) || [];
		const allocationDynamicAttrs = cloneDeep(dynamicAttributesData.value.instrument) || [];
		const linkedInstrumentDynamicAttrs = cloneDeep(dynamicAttributesData.value.instrument) || [];

		const portfolioDynamicAttrsFormatted = formatAttributeTypes(
			portfolioDynamicAttrs,
			'portfolios.portfolio',
			'portfolio',
			'Portfolio'
		);
		const accountDynamicAttrsFormatted = formatAttributeTypes(
			accountDynamicAttrs,
			'accounts.account',
			'account',
			'Account'
		);
		const instrumentDynamicAttrsFormatted = formatAttributeTypes(
			instrumentDynamicAttrs,
			'instruments.instrument',
			'instrument',
			'Instrument'
		);
		const allocationDynamicAttrsFormatted = formatAttributeTypes(
			allocationDynamicAttrs,
			'instruments.instrument',
			'allocation',
			'Allocation'
		);
		const linkedInstrumentDynamicAttrsFormatted = formatAttributeTypes(
			linkedInstrumentDynamicAttrs,
			'instruments.instrument',
			'linked_instrument',
			'Linked Instrument'
		);

		return [
			...result,
			...custom,
			...portfolioDynamicAttrsFormatted,
			...accountDynamicAttrsFormatted,
			...instrumentDynamicAttrsFormatted,
			...allocationDynamicAttrsFormatted,
			...linkedInstrumentDynamicAttrsFormatted
		];
	}

	function _getTransactionReportAttributes() {
		const transactionAttrsData = getAllAttributesAsFlatList(
			'reports.transactionreport',
			'',
			'Transaction',
			{ maxDepth: 1 }
		);
		const transactionAttrs = applyAliasesToAttrs(
			transactionAttrsData,
			'transactions.transaction',
			'',
			'Transaction. '
		);

		const complexTransactionAttrsData = getAllAttributesAsFlatList(
			'transactions.complextransaction',
			'complex_transaction',
			'Complex Transaction',
			{ maxDepth: 1 }
		);
		const complexTransactionAttrsDataFiltered = complexTransactionAttrsData.filter(
			(attr) => !T_TYPE_USER_FIELDS.includes(attr.key)
		);
		const complexTransactionAttrs = applyAliasesToAttrs(
			complexTransactionAttrsDataFiltered,
			'transactions.complextransaction',
			'complex_transaction.',
			'Complex Transaction. '
		);

		const portfolioAttrs = getAllAttributesAsFlatList(
			'portfolios.portfolio',
			'portfolio',
			'Portfolio',
			{ maxDepth: 1 }
		);

		const instrumentAttrsData = getAllAttributesAsFlatList(
			'instruments.instrument',
			'instrument',
			'Instrument',
			{ maxDepth: 1 }
		);
		const instrumentAttrs = applyAliasesToAttrs(
			instrumentAttrsData,
			'instruments.instrument',
			'instrument.',
			'Instrument. '
		);

		const responsibleAttrs = getAllAttributesAsFlatList(
			'counterparties.responsible',
			'responsible',
			'Responsible',
			{ maxDepth: 1 }
		);

		const counterpartyAttrs = getAllAttributesAsFlatList(
			'counterparties.counterparty',
			'counterparty',
			'Counterparty',
			{ maxDepth: 1 }
		);

		const linkedInstrumentAttrsData = getAllAttributesAsFlatList(
			'instruments.instrument',
			'linked_instrument',
			'Linked Instrument',
			{ maxDepth: 1 }
		);
		const linkedInstrumentAttrs = applyAliasesToAttrs(
			linkedInstrumentAttrsData,
			'instruments.instrument',
			'linked_instrument.',
			'Linked Instrument. '
		);

		const allocationBalanceAttrsData = getAllAttributesAsFlatList(
			'instruments.instrument',
			'allocation_balance',
			'Allocation Balance',
			{ maxDepth: 1 }
		);
		const allocationBalanceAttrs = applyAliasesToAttrs(
			allocationBalanceAttrsData,
			'instruments.instrument',
			'allocation_balance.',
			'Allocation Balance. '
		);

		const allocationPlAttrsData = getAllAttributesAsFlatList(
			'instruments.instrument',
			'allocation_pl',
			'Allocation P&L',
			{ maxDepth: 1 }
		);
		const allocationPlAttrs = applyAliasesToAttrs(
			allocationPlAttrsData,
			'instruments.instrument',
			'allocation_pl.',
			'Allocation P&L. '
		);

		const transactionCurrencyAttrs = getAllAttributesAsFlatList(
			'currencies.currency',
			'transaction_currency',
			'Transaction currency',
			{ maxDepth: 1 }
		);

		const settlementCurrencyAttrs = getAllAttributesAsFlatList(
			'currencies.currency',
			'settlement_currency',
			'Settlement currency',
			{ maxDepth: 1 }
		);

		const accountPositionAttrs = getAllAttributesAsFlatList(
			'accounts.account',
			'account_position',
			'Account Position',
			{ maxDepth: 1 }
		);

		const accountCashAttrs = getAllAttributesAsFlatList(
			'accounts.account',
			'account_cash',
			'Account Cash',
			{ maxDepth: 1 }
		);

		const accountInterimAttrs = getAllAttributesAsFlatList(
			'accounts.account',
			'account_interim',
			'Account Interim',
			{ maxDepth: 1 }
		);

		const strategy1cashAttrs = getAllAttributesAsFlatList(
			'strategies.strategy1',
			'strategy1_cash',
			'Strategy 1 Cash',
			{ maxDepth: 1 }
		);

		const strategy1positionAttrs = getAllAttributesAsFlatList(
			'strategies.strategy1',
			'strategy1_position',
			'Strategy 1 Position',
			{ maxDepth: 1 }
		);

		const strategy2cashAttrs = getAllAttributesAsFlatList(
			'strategies.strategy2',
			'strategy2_cash',
			'Strategy 2 Cash',
			{ maxDepth: 1 }
		);

		const strategy2positionAttrs = getAllAttributesAsFlatList(
			'strategies.strategy2',
			'strategy2_position',
			'Strategy 2 Position',
			{ maxDepth: 1 }
		);

		const strategy3cashAttrs = getAllAttributesAsFlatList(
			'strategies.strategy3',
			'strategy3_cash',
			'Strategy 3 Cash',
			{ maxDepth: 1 }
		);

		const strategy3positionAttrs = getAllAttributesAsFlatList(
			'strategies.strategy3',
			'strategy3_position',
			'Strategy 3 Position',
			{ maxDepth: 1 }
		);

		const custom = !customFieldsData.value['transaction-report']
			? []
			: cloneDeep(customFieldsData.value['transaction-report']).map((ci) => ({
					...ci,
					custom_field: ci,
					key: `custom_fields.${ci.user_code}`,
					name: `Custom Field. ${ci.name}`
				}));

		const portfolioDynamicAttrs = cloneDeep(dynamicAttributesData.value.portfolio) || [];
		const complexTransactionDynamicAttrs =
			cloneDeep(dynamicAttributesData.value['complex-transaction']) || [];
		const transactionTypeDynamicAttrs =
			cloneDeep(dynamicAttributesData.value['transaction-type']) || [];
		const responsibleDynamicAttrs = cloneDeep(dynamicAttributesData.value.responsible) || [];
		const counterpartyDynamicAttrs = cloneDeep(dynamicAttributesData.value.counterparty) || [];
		const instrumentDynamicAttrs = cloneDeep(dynamicAttributesData.value.instrument) || [];
		const linkedInstrumentDynamicAttrs = cloneDeep(dynamicAttributesData.value.instrument) || [];
		const allocationBalanceDynamicAttrs = cloneDeep(dynamicAttributesData.value.instrument) || [];
		const allocationPlDnymaicAttrs = cloneDeep(dynamicAttributesData.value.instrument) || [];

		const accountPositionDynamicAttrs = cloneDeep(dynamicAttributesData.value.account) || [];
		const accountCashDynamicAttrs = cloneDeep(dynamicAttributesData.value.account) || [];
		const accountInterimDynamicAttrs = cloneDeep(dynamicAttributesData.value.account) || [];

		const portfolioDynamicAttrsFormatted = formatAttributeTypes(
			portfolioDynamicAttrs,
			'portfolios.portfolio',
			'portfolio',
			'Portfolio'
		);
		const complexTransactionDynamicAttrsFormatted = formatAttributeTypes(
			complexTransactionDynamicAttrs,
			'transactions.complextransaction',
			'complex_transaction',
			'Complex Transaction'
		);
		const transactionTypeDynamicAttrsFormatted = formatAttributeTypes(
			transactionTypeDynamicAttrs,
			'transactions.transactiontype',
			'transaction_type',
			'Transaction Type'
		);
		const responsibleDynamicAttrsFormatted = formatAttributeTypes(
			responsibleDynamicAttrs,
			'counterparties.responsible',
			'responsible',
			'Responsible'
		);
		const counterpartyDynmicAttrsFormatted = formatAttributeTypes(
			counterpartyDynamicAttrs,
			'counterparties.counterparty',
			'counterparty',
			'Counterparty'
		);
		const instrumentDynamicAttrsFormatted = formatAttributeTypes(
			instrumentDynamicAttrs,
			'instruments.instrument',
			'instrument',
			'Instrument'
		);
		const linkedInstrumentDynamicAttrsFormatted = formatAttributeTypes(
			linkedInstrumentDynamicAttrs,
			'instruments.instrument',
			'linked_instrument',
			'Linked Instrument'
		);
		const allocationBalanceDynamicAttrsFormatted = formatAttributeTypes(
			allocationBalanceDynamicAttrs,
			'instruments.instrument',
			'allocation_balance',
			'Allocation Balance'
		);
		const allocationPlDnymaicAttrsFormatted = formatAttributeTypes(
			allocationPlDnymaicAttrs,
			'instruments.instrument',
			'allocation_pl',
			'Allocation P&L'
		);
		const accountPositionDynamicAttrsFormatted = formatAttributeTypes(
			accountPositionDynamicAttrs,
			'accounts.account',
			'account_position',
			'Account Position'
		);
		const accountCashDynamicAttrsFormatted = formatAttributeTypes(
			accountCashDynamicAttrs,
			'accounts.account',
			'account_cash',
			'Account Cash'
		);
		const accountInterimDynamicAttrsFormatted = formatAttributeTypes(
			accountInterimDynamicAttrs,
			'accounts.account',
			'account_interim',
			'Account Interim'
		);

		return [
			...transactionAttrs,
			...complexTransactionAttrs,
			...portfolioAttrs,
			...instrumentAttrs,
			...responsibleAttrs,
			...counterpartyAttrs,
			...linkedInstrumentAttrs,
			...allocationBalanceAttrs,
			...allocationPlAttrs,
			...transactionCurrencyAttrs,
			...settlementCurrencyAttrs,
			...accountPositionAttrs,
			...accountCashAttrs,
			...accountInterimAttrs,
			...strategy1cashAttrs,
			...strategy1positionAttrs,
			...strategy2cashAttrs,
			...strategy2positionAttrs,
			...strategy3cashAttrs,
			...strategy3positionAttrs,
			...custom,
			...portfolioDynamicAttrsFormatted,
			...complexTransactionDynamicAttrsFormatted,
			...transactionTypeDynamicAttrsFormatted,
			...responsibleDynamicAttrsFormatted,
			...counterpartyDynmicAttrsFormatted,
			...instrumentDynamicAttrsFormatted,
			...linkedInstrumentDynamicAttrsFormatted,
			...allocationBalanceDynamicAttrsFormatted,
			...allocationPlDnymaicAttrsFormatted,
			...accountPositionDynamicAttrsFormatted,
			...accountCashDynamicAttrsFormatted,
			...accountInterimDynamicAttrsFormatted
		];
	}

	function getAllAttributesAsFlatList(rootContentType, rootKey, rootName, options) {
		const _options = {
			maxDepth: 1,
			...options
		};

		const result = [];
		_getAttributesRecursive(result, 0, rootContentType, rootKey, rootName, _options);

		return result;
	}

	function _getAttributesRecursive(
		result,
		currentLevel,
		contentType,
		parentKey,
		parentName,
		options
	) {
		const entityType = findEntityByContentType(contentType);
		const attributes = getEntityAttributesByEntityType(entityType);

		if (!attributes) {
			console.warn(`Can't find attributes for content type: ${contentType}`);
			return;
		}

		let key;
		let name;
		let resultAttr;
		attributes.forEach((attribute) => {
			const { name: attrName, key: attrKey, value_type, code } = attribute;

			name = `${parentName}. ${attrName}`;
			key = parentKey ? `${parentKey}.${attrKey}` : attrKey;
			if (value_type === 'field' && code === 'user_code' && currentLevel < options.maxDepth) {
				_getAttributesRecursive(
					result,
					currentLevel + 1,
					attribute.value_content_type,
					key,
					name,
					options
				);
			} else if (value_type === 'field' && code === 'user_code') {
				resultAttr = { ...attribute };
				resultAttr.content_type = contentType;
				resultAttr.name = `${name}. Name`;
				resultAttr.key = `${key}.name`;
				result.push(resultAttr);
			} else if (value_type !== 'mc_field') {
				resultAttr = { ...attribute };
				resultAttr.content_type = contentType;
				resultAttr.name = name;
				resultAttr.key = key;
				result.push(resultAttr);
			}
		});
	}

	function getEntityAttributesByEntityType(entityType) {
		if (!entityAttributesData.value[entityType]) {
			return [];
		}

		const attrs = cloneDeep(entityAttributesData.value[entityType]);
		const contentType = findContentTypeByEntity(entityType);
		return applyAliasesToAttrs(attrs, contentType);
	}

	function applyAliasesToAttrs(attributes = [], contentType, keyPrefix = '', namePrefix = '') {
		let userFields = [];
		switch (contentType) {
			case 'transactions.transaction':
				userFields = cloneDeep(transactionUserFieldsData.value);
				break;
			case 'transactions.complextransaction':
				userFields = cloneDeep(complexTransactionUserFieldsData.value);
				break;
			case 'instruments.instrument':
				userFields = cloneDeep(instrumentUserFieldsData.value);
				break;
		}

		return userFields.reduce((res, field) => {
			res.forEach((attr) => {
				if (attr.key === `${keyPrefix}${field.key}`) {
					attr.name = `${namePrefix}${field.name}`;
				}
			});

			return res;
		}, cloneDeep(attributes));
	}

	function formatAttributeTypes(attributes = [], contentType, rootKey, rootName) {
		return attributes.map((attribute) => ({
			attribute_type: attribute,
			value_type: attribute.value_type,
			content_type: contentType,
			key: `${rootKey}.attributes.${attribute.user_code}`,
			name: `${rootName}. ${attribute.name}`
		}));
	}

	/***********************/

	return {
		attributesByEntityType,
		reportsEntityTypes,
		entityAttributesData,
		customFieldsData,
		dynamicAttributesData,
		instrumentUserFieldsData,
		transactionUserFieldsData,
		complexTransactionUserFieldsData,
		reconciliationAttributes,
		attributesAvailableForColumns,
		downloadCustomFieldsByEntityType,
		downloadDynamicAttributesByEntityType,
		downloadInstrumentUserFields,
		getAllAttributesByEntityType,
		_getBalanceReportAttributes,
		_getPlReportAttributes,
		_getTransactionReportAttributes,
		getEntityAttributesByEntityType,
		getAllAttributesAsFlatList,
		appendEntityAttribute,
		formatAttributeTypes
	};
});
