import { portfolioAttributes } from '@/assets/data/models/portfolioPropsModel';
import { auditTransactionAttributes } from '@/assets/data/models/auditTransactionPropsModel';
import { auditInstrumentAttributes } from '@/assets/data/models/auditInstrumentPropsModel';
import { accountAttributes } from '@/assets/data/models/accountPropsModel';
import { accountTypeAttributes } from '@/assets/data/models/accountTypePropsModel';
import { counterpartyAttributes } from '@/assets/data/models/counterpartyPropsModel';
import { counterpartyGroupAttributes } from '@/assets/data/models/counterpartyGroupPropsModel';
import { responsibleAttributes } from '@/assets/data/models/responsiblePropsModel';
import { responsibleGroupAttributes } from '@/assets/data/models/responsibleGroupPropsModel';
import { pricingPolicyAttributes } from '@/assets/data/models/pricingPolicyPropsModel';
import { instrumentTypeAttributes } from '@/assets/data/models/instrumentTypePropsModel';
import { instrumentAttributes } from '@/assets/data/models/instrumentPropsModel';
import { generatedEventAttributes } from '@/assets/data/models/generatedEventPropsModel';
import { countryAttributes } from '@/assets/data/models/countryPropsModel';
import { transactionAttributes } from '@/assets/data/models/transactionPropsModel';
import { transactionClassAttributes } from '@/assets/data/models/transactionClassPropsModel';
import { transactionTypeGroupAttributes } from '@/assets/data/models/transactionTypeGroupPropsModel';
import { transactionTypeAttributes } from '@/assets/data/models/transactionTypePropsModel';
import { complexTransactionAttributes } from '@/assets/data/models/complexTransactionPropsModel';
import { currencyAttributes } from '@/assets/data/models/currencyPropsModel';
import { currencyHistoryAttributes } from '@/assets/data/models/currencyHistoryPropsModel';
import { priceHistoryAttributes } from '@/assets/data/models/priceHistoryPropsModel';
import { strategy1Attributes } from '@/assets/data/models/strategy1PropsModel';
import { strategy2Attributes } from '@/assets/data/models/strategy2PropsModel';
import { strategy3Attributes } from '@/assets/data/models/strategy3PropsModel';
import { strategy1subgroupAttributes } from '@/assets/data/models/strategy1subgroupPropsModel';
import { strategy2subgroupAttributes } from '@/assets/data/models/strategy2subgroupPropsModel';
import { strategy3subgroupAttributes } from '@/assets/data/models/strategy3subgroupPropsModel';
import { strategy1groupAttributes } from '@/assets/data/models/strategy1groupPropsModel';
import { strategy2groupAttributes } from '@/assets/data/models/strategy2groupPropsModel';
import { strategy3groupAttributes } from '@/assets/data/models/strategy3groupPropsModel';
import { balanceReportAttributes } from '@/assets/data/models/balanceReportPropsModel';
import { reportAddonPerformanceAttributes } from '@/assets/data/models/reportAddonPerformancePropsModel';
import { reportMismatchAttributes } from '@/assets/data/models/reportMismatchPropsModel';
import { pnlReportAttributes } from '@/assets/data/models/pnlReportPropsModel';
import { reportAddonPerformancePnlAttributes } from '@/assets/data/models/reportAddonPerformancePnlPropsModel';
import { reportMismatchPnlAttributes } from '@/assets/data/models/reportMismatchPnlPropsModel';
import { transactionReportAttributes } from '@/assets/data/models/transactionReportPropsModel';
import { cashFlowProjectionReportAttributes } from '@/assets/data/models/cashFlowProjectionReportPropsModel';
import { performanceReportAttributes } from '@/assets/data/models/performanceReportPropsModel';

export const DEPRECATED_ENTITY_FIELDS = {
	'instruments.instrument': ['price_download_scheme']
};

export const MODELS = {
	'portfolios.portfolio': portfolioAttributes,
	'audit.transactionaudit': auditTransactionAttributes,
	'audit.instrumentaudit': auditInstrumentAttributes,
	'accounts.account': accountAttributes,
	'accounts.accounttype': accountTypeAttributes,
	'counterparties.counterparty': counterpartyAttributes,
	'counterparties.counterpartygroup': counterpartyGroupAttributes,
	'counterparties.responsible': responsibleAttributes,
	'counterparties.responsiblegroup': responsibleGroupAttributes,
	'instruments.pricingpolicy': pricingPolicyAttributes,
	'instruments.instrumenttype': instrumentTypeAttributes,
	'instruments.instrument': instrumentAttributes,
	'instruments.generatedevent': generatedEventAttributes,
	'instruments.country': countryAttributes,
	'transactions.transaction': transactionAttributes,
	'transactions.transactionclass': transactionClassAttributes,
	'transactions.transactiontypegroup': transactionTypeGroupAttributes,
	'transactions.transactiontype': transactionTypeAttributes,
	'transactions.complextransaction': complexTransactionAttributes,
	'currencies.currency': currencyAttributes,
	'currencies.currencyhistory': currencyHistoryAttributes,
	'instruments.pricehistory': priceHistoryAttributes,
	'strategies.strategy1': strategy1Attributes,
	'strategies.strategy2': strategy2Attributes,
	'strategies.strategy3': strategy3Attributes,
	'strategies.strategy1subgroup': strategy1subgroupAttributes,
	'strategies.strategy2subgroup': strategy2subgroupAttributes,
	'strategies.strategy3subgroup': strategy3subgroupAttributes,
	'strategies.strategy1group': strategy1groupAttributes,
	'strategies.strategy2group': strategy2groupAttributes,
	'strategies.strategy3group': strategy3groupAttributes,
	'reports.balancereport': balanceReportAttributes,
	'reports.balancereportperformance': reportAddonPerformanceAttributes,
	'reports.balancereportmismatch': reportMismatchAttributes,
	'reports.plreport': pnlReportAttributes,
	'reports.plreportperformance': reportAddonPerformancePnlAttributes,
	'reports.plreportmismatch': reportMismatchPnlAttributes,
	'reports.transactionreport': transactionReportAttributes,
	'reports.cashflowreport': cashFlowProjectionReportAttributes,
	'reports.performancereport': performanceReportAttributes
};
