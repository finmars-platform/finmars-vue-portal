<template>
	<div class="journal-page">
		<FmTopRefresh @refresh="refresh()" />
		<div class="flex flex-column gap-6 px-8 pt-6">
			<div class="flex items-start justify-start flex-wrap gap-2 w-full h-14">
				<div class="min-w-32">
					<FmMenu class="w-full">
						<template #btn>
							<FmTextField
								v-model="journalFilters.date_from"
								@update:model-value="updateFilters('date_from')"
								label="Date From"
								outlined
							></FmTextField>
						</template>
						<template #default>
							<FmDatePicker
								v-model="journalFilters.date_from"
								@update:model-value="updateFilters('date_to')"
							/>
						</template>
					</FmMenu>
				</div>
				<div class="min-w-32">
					<FmMenu class="w-full">
						<template #btn>
							<FmTextField
								v-model="journalFilters.date_to"
								@update:model-value="updateFilters()"
								label="Date To"
								outlined
							></FmTextField>
						</template>
						<template #default>
							<FmDatePicker
								v-model="journalFilters.date_to"
								@update:model-value="updateFilters()"
							/>
						</template>
					</FmMenu>
				</div>
				<div class="min-w-36">
					<FmSelect
						v-model="journalFilters.member"
						:options="members"
						@update:model-value="updateFilters()"
						label="Member"
						variant="outlined"
						clearable
						multiple
					/>
				</div>
				<div class="min-w-36">
					<FmSelect
						v-model="journalFilters.action"
						:options="actions"
						@update:model-value="updateFilters()"
						label="Action"
						variant="outlined"
						clearable
						multiple
					/>
				</div>
				<div class="min-w-36">
					<FmSelect
						v-model="journalFilters.content_type"
						:options="contentTypes"
						@update:model-value="updateFilters()"
						label="Content Type"
						variant="outlined"
						clearable
						multiple
					/>
				</div>
				<div class="min-w-80">
					<FmTextField
						v-model="journalFilters.query"
						@update:model-value="updateFilters('search')"
						outlined
						label="Search"
					/>
				</div>
			</div>
			<span>Records: {{ count }}</span>
			<div class="journal-table">
				<FmProgressCircular v-if="loading" :size="32" indeterminate />
				<div
					v-else-if="!loading && !items.length"
					class="flex flex-col w-full min-h-12 justify-center items-center"
				>
					<span>No History Records Found</span>
				</div>
				<table v-else class="w-full min-h-24 rounded-sm">
					<thead class="text-left">
						<tr>
							<th>Date</th>
							<th>Member</th>
							<th>Action</th>
							<th>User Code</th>
							<th>Content Type</th>
							<th>Context URL</th>
							<th>Notes</th>
							<th>&nbsp;</th>
						</tr>
					</thead>
					<tbody class="text-left">
						<tr v-for="item of items" :key="item">
							<td class="whitespace-nowrap">
								<div v-tooltip="item.created_at">
									{{ item.created_date_pretty }}
								</div>
								<div style="color: green" v-tooltip="item.created_at">
									{{ item.created_time_pretty }}
								</div>
							</td>
							<td class="flex flex-row flex-nowrap items-center gap-1">
								<div class="avatar-wrapper">
									<span class="font-bold text-lg">
										{{ item.member_object.username[0] }}
									</span>
								</div>
								<span>{{ item.member_object.username }}</span>
							</td>
							<td>
								<div v-tooltip="item.action">
									<span v-if="item.action === 'delete'" style="color: red">{{
										item.action
									}}</span>
									<span v-if="item.action === 'create'" style="color: green">{{
										item.action
									}}</span>
									<span v-if="item.action === 'change'">{{ item.action }}</span>
									<span v-if="item.action === 'danger'">{{ item.action }}</span>
									<span
										v-if="item.action === 'recycle_bin'"
										style="color: orange"
										>{{ item.action }}</span
									>
								</div>
							</td>
							<td>{{ item.user_code }}</td>
							<td>
								<div v-tooltip="item.content_type">
									{{ item.content_type_pretty }}
								</div>
							</td>

							<td>
								<div v-tooltip="item.context_url">
									{{ item.context_url_pretty }}
								</div>
							</td>
							<td>
								<div v-if="item.notes" @click="viewNotes(item)" class="notes">
									{{ item.notes }}
								</div>
							</td>
							<td>
								<div
									v-if="item.diff"
									@click="previewDiff(item)"
									v-tooltip="'Click to see full'"
									class="diff-value"
								>
									{{ item.diff_pretty }}
								</div>
							</td>
							<td class="text-right">
								<FmButton
									append-icon="mdi-information-variant"
									type="secondary"
									@click="showRecordData(item)"
									rounded
								>
									Show Data
								</FmButton>
							</td>
						</tr>
					</tbody>
				</table>
				<FmPagination
					class="m-2"
					:with-info="true"
					:total-items="count"
					:items-per-page="pageSize"
					:model-value="currentPage"
					@update:modelValue="handlePageChange"
				/>
			</div>
		</div>

		<BaseModal title="File Preview" v-model="isNotes" style="min-width: 40vw">
			<div class="flex justify-between w-full h-full pb-4">
				<span>{{ modalItem.notes }}</span>
				<div class="copy-wrap" @click="copy(modalItem.notes)">
					<FmTooltip type="secondary">
						<template #activator="{ props }">
							<FmIcon
								v-bind="props"
								icon="mdi-content-copy"
								class="copy-icon"
								:size="20"
								color="var(--on-primary-container)"
							/>
						</template>
						<span>Copy to clipboard</span>
					</FmTooltip>
				</div>
			</div>
			<template #controls>
				<div class="flex-row fc-space-between">
					<FmBtn type="text" @click="download(modalItem.notes, '.txt')"
						>Download</FmBtn
					>
					<FmBtn @click="cancel">Ok</FmBtn>
				</div>
			</template>
		</BaseModal>

		<BaseModal title="File Preview" v-model="isDiff" style="min-width: 40vw">
			<div class="flex justify-between relative w-full h-full pb-4">
				<VAceEditor
					:value="JSON.stringify(JSON.parse(modalItem.diff), null, 4)"
					lang="json"
					theme="monokai"
					class="min-h-80 w-full"
					@init="onEditorInit"
				/>
				<div
					class="copy-wrap absolute top-4 right-4"
					@click="copy(modalItem.diff)"
				>
					<FmTooltip type="secondary">
						<template #activator="{ props }">
							<FmIcon
								v-bind="props"
								icon="mdi-content-copy"
								class="copy-icon"
								:size="20"
								color="var(--on-primary-container)"
							/>
						</template>
						<span>Copy to clipboard</span>
					</FmTooltip>
				</div>
			</div>
			<template #controls>
				<div class="flex-row fc-space-between">
					<FmBtn type="text" @click="download(modalItem.diff, '.json')"
						>Download</FmBtn
					>
					<FmBtn @click="cancel">Ok</FmBtn>
				</div>
			</template>
		</BaseModal>

		<BaseModal title="File Preview" v-model="isData" style="min-width: 40vw">
			<div class="flex justify-between relative w-full h-full pb-4">
				<VAceEditor
					:value="JSON.stringify(JSON.parse(modalItem), null, 4)"
					lang="json"
					theme="monokai"
					class="min-h-80 w-full"
					@init="onEditorInit"
				/>
				<div class="copy-wrap absolute top-4 right-4" @click="copy(modalItem)">
					<FmTooltip type="secondary">
						<template #activator="{ props }">
							<FmIcon
								v-bind="props"
								icon="mdi-content-copy"
								class="copy-icon"
								:size="20"
								color="var(--on-primary-container)"
							/>
						</template>
						<span>Copy to clipboard</span>
					</FmTooltip>
				</div>
			</div>
			<template #controls>
				<div class="flex-row fc-space-between">
					<FmBtn type="text" @click="download(modalItem, '.json')"
						>Download</FmBtn
					>
					<FmBtn @click="cancel">Ok</FmBtn>
				</div>
			</template>
		</BaseModal>
	</div>
</template>

<script setup>
	import dayjs from 'dayjs';
	import { debounce } from 'lodash';
	import { downloadFile } from '~/pages/system/helper';
	import useAceEditor from '~/composables/useAceEditor';
	import {
		FmTextField,
		FmPagination,
		FmButton,
		FmDatePicker,
		FmSelect,
		FmIcon,
		FmTooltip
	} from '@finmars/ui';

	const { VAceEditor, onEditorInit } = useAceEditor();

	const route = useRoute();
	const router = useRouter();

	const loading = ref(false);
	const count = ref(0);
	const pageSize = ref(40);
	const currentPage = ref(route.query?.page ? parseInt(route.query.page) : 1);

	const journalFilters = ref({});
	const modalItem = ref({});
	const items = ref([]);
	const members = ref([]);
	const contentTypes = ref([]);
	const isNotes = ref(false);
	const isDiff = ref(false);
	const isData = ref(false);

	const actions = ref([
		{
			title: 'Create',
			value: 'create'
		},
		{
			title: 'Change',
			value: 'change'
		},
		{
			title: 'Delete',
			value: 'delete'
		},
		{
			title: 'Danger',
			value: 'danger'
		},
		{
			title: 'Recycle Bin',
			value: 'recycle_bin'
		}
	]);
	const entityContentTypeList = [
		{
			name: 'Dashboard',
			entity: 'dashboard',
			key: 'ui.dashboard'
		},
		{
			name: 'Account Type',
			entity: 'account-type',
			key: 'accounts.accounttype'
		},
		{
			name: 'Account',
			entity: 'account',
			key: 'accounts.account'
		},
		{
			name: 'Counterparty',
			entity: 'counterparty',
			key: 'counterparties.counterparty'
		},
		{
			name: 'Responsible',
			entity: 'responsible',
			key: 'counterparties.responsible'
		},
		{
			name: 'Currency',
			entity: 'currency',
			key: 'currencies.currency'
		},
		{
			name: 'Currency history',
			entity: 'currency-history',
			key: 'currencies.currencyhistory'
		},
		{
			name: 'Instrument',
			entity: 'instrument',
			key: 'instruments.instrument'
		},
		{
			name: 'Generated Event',
			entity: 'generated-event',
			key: 'instruments.generatedevent'
		},
		{
			name: 'Price History',
			entity: 'price-history',
			key: 'instruments.pricehistory'
		},
		{
			name: 'Portfolio',
			entity: 'portfolio',
			key: 'portfolios.portfolio'
		},
		{
			name: 'Portfolio Type',
			entity: 'portfolio-type',
			key: 'portfolios.portfoliotype'
		},
		{
			name: 'Portfolio Reconcile Group',
			entity: 'portfolio-reconcile-group',
			key: 'portfolios.portfolioreconcilegroup'
		},
		{
			name: 'Portfolio Register',
			entity: 'portfolio-register',
			key: 'portfolios.portfolioregister'
		},
		{
			name: 'Portfolio Register Record',
			entity: 'portfolio-register-record',
			key: 'portfolios.portfolioregisterrecord'
		},
		{
			name: 'Portfolio History',
			entity: 'portfolio-history',
			key: 'portfolios.portfoliohistory'
		},
		{
			name: 'Portfolio Reconcile History',
			entity: 'portfolio-reconcile-history',
			key: 'portfolios.portfolioreconcilehistory'
		},
		{
			name: 'Instrument Type',
			entity: 'instrument-type',
			key: 'instruments.instrumenttype'
		},
		{
			name: 'Transaction',
			entity: 'transaction',
			key: 'transactions.transaction'
		},
		{
			name: 'Transaction Type',
			entity: 'transaction-type',
			key: 'transactions.transactiontype'
		},
		{
			name: 'Transaction Type Group',
			entity: 'transaction-type-group',
			key: 'transactions.transactiontypegroup'
		},
		{
			name: 'Counterparty group',
			entity: 'counterparty-group',
			key: 'counterparties.counterpartygroup'
		},
		{
			name: 'Responsible group',
			entity: 'responsible-group',
			key: 'counterparties.responsiblegroup'
		},
		{
			name: 'Strategy 1',
			entity: 'strategy-1',
			key: 'strategies.strategy1'
		},
		{
			name: 'Strategy 2',
			entity: 'strategy-2',
			key: 'strategies.strategy2'
		},
		{
			name: 'Strategy 3',
			entity: 'strategy-3',
			key: 'strategies.strategy3'
		},
		{
			name: 'Strategy 1 group',
			entity: 'strategy-1-group',
			key: 'strategies.strategy1group'
		},
		{
			name: 'Strategy 2 group',
			entity: 'strategy-2-group',
			key: 'strategies.strategy2group'
		},
		{
			name: 'Strategy 3 group',
			entity: 'strategy-3-group',
			key: 'strategies.strategy3group'
		},
		{
			name: 'Strategy 1 subgroup',
			entity: 'strategy-1-subgroup',
			key: 'strategies.strategy1subgroup'
		},
		{
			name: 'Strategy 2 subgroup',
			entity: 'strategy-2-subgroup',
			key: 'strategies.strategy2subgroup'
		},
		{
			name: 'Strategy 3 subgroup',
			entity: 'strategy-3-subgroup',
			key: 'strategies.strategy3subgroup'
		},
		{
			name: 'Transaction',
			entity: 'complex-transaction',
			key: 'transactions.complextransaction'
		},

		{
			name: 'Daily pricing model',
			entity: 'daily-pricing-model',
			key: 'instruments.dailypricingmodel'
		},
		{
			name: 'Payment size detail',
			entity: 'payment-size-detail',
			key: 'instruments.paymentsizedetail'
		},
		{
			name: 'Price download scheme',
			entity: 'price-download-scheme',
			key: 'integrations.pricedownloadscheme'
		},
		{
			name: 'Pricing policy',
			entity: 'pricing-policy',
			key: 'instruments.pricingpolicy'
		},
		{
			name: 'Periodicity',
			entity: 'periodicity',
			key: 'instruments.periodicity'
		},
		{
			name: 'Accrual calculation model',
			entity: 'accrual-calculation-model',
			key: 'instruments.accrualcalculationmodel'
		},
		{
			name: 'Event Class',
			entity: 'event-class',
			key: 'transactions.eventclass'
		},
		{
			name: 'Notification Class',
			entity: 'notification-class',
			key: 'transactions.notificationclass'
		},
		{
			name: 'Complex Import Scheme',
			entity: 'complex-import-scheme',
			key: 'complex_import.compleximportscheme'
		},
		{
			name: 'Simple Entity Import Scheme',
			entity: 'simple-entity-import-scheme',
			key: 'csv_import.csvimportscheme'
		},
		{
			name: 'Balance report',
			entity: 'balance-report',
			key: 'reports.balancereport'
		},
		{
			name: 'Balance report Performance',
			entity: 'balance-report-performance',
			key: 'reports.balancereportperformance'
		},
		{
			name: 'Balance report Mismatch',
			entity: 'balance-report-mismatch',
			key: 'reports.balancereportmismatch'
		},
		{
			name: 'P&L report',
			entity: 'pl-report',
			key: 'reports.plreport'
		},
		{
			name: 'P&L report Performance',
			entity: 'pl-report-performance',
			key: 'reports.plreportperformance'
		},
		{
			name: 'P&L report Mismatch',
			entity: 'pl-report-mismatch',
			key: 'reports.plreportmismatch'
		},
		{
			name: 'Transaction report',
			entity: 'transaction-report',
			key: 'reports.transactionreport'
		},
		{
			name: 'Cash flow projection report',
			entity: 'cash-flow-projection-report',
			key: 'reports.cashflowreport'
		},
		{
			name: 'Performance report',
			entity: 'performance-report',
			key: 'reports.performancereport'
		},

		{
			name: 'Transaction Class',
			entity: 'transaction-class',
			key: 'transactions.transactionclass'
		},

		{
			name: 'Status',
			entity: 'complex-transaction-status',
			key: 'transactions.complextransactionstatus'
		},

		{
			name: 'Audit transaction',
			entity: 'audit-transaction',
			key: 'audit.objecthistory4entry'
		},

		{
			name: 'Audit instrument',
			entity: 'audit-instrument',
			key: 'audit.objecthistory4entry'
		},
		{
			name: 'Country',
			entity: 'country',
			key: 'instruments.country'
		},
		{
			name: 'Complex Transaction Import Scheme',
			entity: 'complex-transaction-import-scheme',
			key: 'integrations.complextransactionimportscheme'
		},
		{
			name: 'Simple Import Scheme',
			entity: 'csv-import-scheme',
			key: 'csv_import.csvimportscheme'
		}
	];
	const entityContentTypeListForUi = [
		{
			name: 'Dashboard',
			entity: 'dashboard',
			key: 'ui.dashboard'
		},
		{
			name: 'Account Type',
			entity: 'account-type',
			key: 'accounts.accounttype'
		},
		{
			name: 'Account',
			entity: 'account',
			key: 'accounts.account'
		},
		{
			name: 'Counterparty',
			entity: 'counterparty',
			key: 'counterparties.counterparty'
		},
		{
			name: 'Responsible',
			entity: 'responsible',
			key: 'counterparties.responsible'
		},
		{
			name: 'Currency',
			entity: 'currency',
			key: 'currencies.currency'
		},
		{
			name: 'Currency history',
			entity: 'currency-history',
			key: 'currencies.currencyhistory'
		},
		{
			name: 'Instrument',
			entity: 'instrument',
			key: 'instruments.instrument'
		},
		{
			name: 'Generated Event',
			entity: 'generated-event',
			key: 'instruments.generatedevent'
		},
		{
			name: 'Pricing Policy',
			entity: 'pricing-policy',
			key: 'instruments.pricingpolicy'
		},
		{
			name: 'Price History',
			entity: 'price-history',
			key: 'instruments.pricehistory'
		},
		{
			name: 'Portfolio',
			entity: 'portfolio',
			key: 'portfolios.portfolio'
		},
		{
			name: 'Portfolio Type',
			entity: 'portfolio-type',
			key: 'portfolios.portfoliotype'
		},
		{
			name: 'Portfolio Reconcile Group',
			entity: 'portfolio-reconcile-group',
			key: 'portfolios.portfolioreconcilegroup'
		},
		{
			name: 'Portfolio Register',
			entity: 'portfolio-register',
			key: 'portfolios.portfolioregister'
		},
		{
			name: 'Portfolio Register Record',
			entity: 'portfolio-register-record',
			key: 'portfolios.portfolioregisterrecord'
		},
		{
			name: 'Portfolio History',
			entity: 'portfolio-history',
			key: 'portfolios.portfoliohistory'
		},
		{
			name: 'Portfolio Reconcile History',
			entity: 'portfolio-reconcile-history',
			key: 'portfolios.portfolioreconcilehistory'
		},
		{
			name: 'Instrument Type',
			entity: 'instrument-type',
			key: 'instruments.instrumenttype'
		},
		{
			name: 'Transaction',
			entity: 'transaction',
			key: 'transactions.transaction'
		},
		{
			name: 'Transaction Type',
			entity: 'transaction-type',
			key: 'transactions.transactiontype'
		},
		{
			name: 'Transaction Type Group',
			entity: 'transaction-type-group',
			key: 'transactions.transactiontypegroup'
		},
		{
			name: 'Counterparty group',
			entity: 'counterparty-group',
			key: 'counterparties.counterpartygroup'
		},
		{
			name: 'Responsible group',
			entity: 'responsible-group',
			key: 'counterparties.responsiblegroup'
		},
		{
			name: 'Strategy 1',
			entity: 'strategy-1',
			key: 'strategies.strategy1'
		},
		{
			name: 'Strategy 2',
			entity: 'strategy-2',
			key: 'strategies.strategy2'
		},
		{
			name: 'Strategy 3',
			entity: 'strategy-3',
			key: 'strategies.strategy3'
		},
		{
			name: 'Strategy 1 group',
			entity: 'strategy-1-group',
			key: 'strategies.strategy1group'
		},
		{
			name: 'Strategy 2 group',
			entity: 'strategy-2-group',
			key: 'strategies.strategy2group'
		},
		{
			name: 'Strategy 3 group',
			entity: 'strategy-3-group',
			key: 'strategies.strategy3group'
		},
		{
			name: 'Strategy 1 subgroup',
			entity: 'strategy-1-subgroup',
			key: 'strategies.strategy1subgroup'
		},
		{
			name: 'Strategy 2 subgroup',
			entity: 'strategy-2-subgroup',
			key: 'strategies.strategy1subgroup'
		},
		{
			name: 'Strategy 3 subgroup',
			entity: 'strategy-3-subgroup',
			key: 'strategies.strategy1subgroup'
		},
		{
			name: 'Balance report',
			entity: 'balance-report',
			key: 'reports.balancereport'
		},
		{
			name: 'P&L report',
			entity: 'pl-report',
			key: 'reports.plreport'
		},
		{
			name: 'Transaction report',
			entity: 'transaction-report',
			key: 'reports.transactionreport'
		},
		{
			name: 'Cash flow projection report',
			entity: 'cash-flow-projection-report',
			key: 'reports.cashflowreport'
		},
		{
			name: 'Performance report',
			entity: 'performance-report',
			key: 'reports.performancereport'
		},
		{
			name: 'Transaction',
			entity: 'complex-transaction',
			key: 'transactions.complextransaction'
		},
		{
			name: 'Balance Report Custom Field',
			entity: 'balance-report-custom-field',
			key: 'reports.balancereportcustomfield'
		},
		{
			name: 'PL Report Custom Field',
			entity: 'pl-report-custom-field',
			key: 'reports.plreportcustomfield'
		},
		{
			name: 'Transaction Report Custom Field',
			entity: 'transaction-report-custom-field',
			key: 'reports.transactionreportcustomfield'
		},
		{
			name: 'Price History Error',
			entity: 'price-history-error',
			key: 'pricing.pricehistoryerror'
		},
		{
			name: 'Currency History Error',
			entity: 'currency-history-error',
			key: 'pricing.currencyhistoryerror'
		},
		{
			name: 'Audit transaction',
			entity: 'audit-transaction',
			key: 'audit.objecthistory4entry'
		},

		{
			name: 'Audit instrument',
			entity: 'audit-instrument',
			key: 'audit.objecthistory4entry'
		},
		{
			name: 'Complex Transaction Import Scheme',
			entity: 'complex-transaction-import-scheme',
			key: 'integrations.complextransactionimportscheme'
		},
		{
			name: 'Simple Import Scheme',
			entity: 'csv-import-scheme',
			key: 'csv_import.csvimportscheme'
		}
	];

	const getData = async (newPage = 1) => {
		try {
			await router.push({ query: { ...route.query, page: currentPage.value } });
			loading.value = true;
			const payload = {
				page_size: pageSize.value,
				page: newPage,
				...journalFilters.value
			};
			const res = await useApi('journalList.get', {
				filters: payload,
				query: { page: newPage }
			});
			if (res.results) {
				count.value = res.count;
				items.value = res.results;
				items.value.map((item) => {
					item.created_pretty = dayjs(new Date(item.created_at)).format(
						'DD-MM-YYYY HH:mm'
					);
					item.created_date_pretty = dayjs(new Date(item.created_at)).format(
						'YYYY-MM-DD'
					);
					item.created_time_pretty = dayjs(new Date(item.created_at)).format(
						'HH:mm'
					);
					item.content_type_pretty = findEntityByContentType(item.content_type);
					if (!item.content_type_pretty) {
						item.content_type_pretty = item.content_type;
					}
					try {
						const pieces = item.context_url.split('/api/v1');
						if (pieces.length >= 2) {
							item.context_url_pretty = pieces[1];
						} else {
							item.context_url_pretty = pieces[0];
						}
					} catch (e) {
						item.context_url_pretty = item.context_url;
					}
					try {
						item.diff_pretty = JSON.parse(item.diff);
					} catch (e) {
						item.diff_pretty = item.diff;
					}
					return item;
				});
			}
		} catch (e) {
			console.log(`Catch error: ${e}`);
		} finally {
			loading.value = false;
		}
	};

	const getEntityNameByContentType = (contentType) => {
		let result = '';
		switch (contentType) {
			case 'accounts.account':
				result = 'Account';
				break;
			case 'accounts.accounttype':
				result = 'Account Type';
				break;
			case 'counterparties.responsible':
				result = 'Responsible';
				break;
			case 'counterparties.responsiblegroup':
				result = 'Responsible Group';
				break;
			case 'counterparties.counterparty':
				result = 'Counterparty';
				break;
			case 'counterparties.counterpartygroup':
				result = 'Counterparty Group';
				break;
			case 'currencies.currencyhistory':
				result = 'Currency History';
				break;
			case 'currencies.currency':
				result = 'Currencies';
				break;
			case 'instruments.pricingpolicy':
				result = 'Pricing Policy';
				break;
			case 'instruments.instrumenttype':
				result = 'Instrument Type';
				break;
			case 'instruments.pricehistory':
				result = 'Price History';
				break;
			case 'instruments.instrument':
				result = 'Instrument';
				break;
			case 'portfolios.portfolio':
				result = 'Portfolio';
				break;
			case 'ui.listlayout':
				result = 'Layout';
				break;
			case 'ui.reportlayout':
				result = 'Report Layout';
				break;
			case 'ui.editlayout':
				result = 'Form';
				break;
			case 'strategies.strategy1':
				result = 'Strategy 1';
				break;
			case 'strategies.strategy1group':
				result = 'Strategy 1 Group';
				break;
			case 'strategies.strategy1subgroup':
				result = 'Strategy 1 Subgroup';
				break;
			case 'strategies.strategy2':
				result = 'Strategy 2';
				break;
			case 'strategies.strategy2group':
				result = 'Strategy 2 Group';
				break;
			case 'strategies.strategy2subgroup':
				result = 'Strategy 2 Subgroup';
				break;
			case 'strategies.strategy3':
				result = 'Strategy 3';
				break;
			case 'strategies.strategy3group':
				result = 'Strategy 3 Group';
				break;
			case 'strategies.strategy3subgroup':
				result = 'Strategy 3 Subgroup';
				break;
			case 'transactions.transactiontype':
				result = 'Transaction Type';
				break;
			case 'transactions.transactiontypegroup':
				result = 'Transaction Type Group';
				break;
			case 'transactions.complextransaction':
				result = 'Complex Transaction';
				break;
			case 'transactions.transaction':
				result = 'Transaction';
				break;
			case 'integrations.pricedownloadscheme':
				result = 'Price Download Sceme';
				break;
			case 'integrations.complextransactionimportscheme':
				result = 'Complex Transaction Import Scheme';
				break;
			case 'csv_import.csvimportscheme':
				result = 'CSV Import Scheme';
				break;
			case 'integrations.portfoliomapping':
				result = 'Portfolio Mapping';
				break;
			case 'integrations.currencymapping':
				result = 'Currency Mapping';
				break;
			case 'instrumenttypemapping':
				result = 'Instrument Type Mapping';
				break;
			case 'integrations.instrumenttypemapping':
				result = 'Instrument Type Mapping';
				break;
			case 'integrations.accounttypemapping':
				result = 'Account Type Mapping';
				break;
			case 'integrations.pricingpolicymapping':
				result = 'Pricing Policy Mapping';
				break;
			case 'complex_import.compleximportscheme':
				result = 'Complex Import Scheme';
				break;
			case 'integrations.accountmapping':
				result = 'Account Mapping';
				break;
			case 'integrations.instrumentmapping':
				result = 'Instrument Mapping';
				break;
			case 'integrations.counterpartymapping':
				result = 'Counterparty Mapping';
				break;
			case 'integrations.responsiblemapping':
				result = 'Responsible Mapping';
				break;
			case 'integrations.strategy1mapping':
				result = 'Strategy 1 Mapping';
				break;
			case 'integrations.strategy2mapping':
				result = 'Strategy 2 Mapping';
				break;
			case 'integrations.strategy3mapping':
				result = 'Strategy 3 Mapping';
				break;
			case 'integrations.periodicitymapping':
				result = 'Periodicity Mapping';
				break;
			case 'integrations.dailypricingmodelmapping':
				result = 'Daily Pricing Model Mapping';
				break;
			case 'integrations.pricingconditionmapping':
				result = 'Pricing Condition Mapping';
				break;
			case 'integrations.paymentsizedetailmapping':
				result = 'Payment Size Detail Mapping';
				break;
			case 'integrations.accrualcalculationmodelmapping':
				result = 'Accrual Calculation Model Mapping';
				break;
			case 'integrations.pricedownloadschememapping':
				result = 'Price Download Scheme Mapping';
				break;
			case 'obj_attrs.instrumentattributetype':
				result = 'Instrument Attribute Types';
				break;
			case 'obj_attrs.currencyattributetype':
				result = 'Currency Attribute Types';
				break;
			case 'obj_attrs.accountattributetype':
				result = 'Account Attribute Types';
				break;
			case 'integrations.pricingautomatedschedule:':
				result = 'Pricing Download Schedule';
				break;
			case 'ui.transactionuserfieldmodel':
				result = 'Transaction User field';
				break;
			case 'ui.dashboardlayout':
				result = 'Dashboard Layout';
				break;
			case 'reports.balancereportcustomfield':
				result = 'Balance Report Custom Field';
				break;
			case 'integrations.instrumentdownloadscheme':
				result = 'Instrument Download Scheme';
				break;
			case 'ui.instrumentuserfieldmodel':
				result = 'Instrument User Field';
				break;
			case 'reference_tables.referencetable':
				result = 'Reference Table';
				break;
			case 'procedures.pricingprocedure':
				result = 'Pricing Procedure';
				break;
			case 'procedures.requestdatafileprocedure':
				result = 'Data Procedures';
				break;
			case 'pricing.instrumentpricingscheme':
				result = 'Instrument Pricing Scheme';
				break;
			case 'pricing.currencypricingscheme':
				result = 'Currency Pricing Scheme';
				break;
			case 'schedules.schedule':
				result = 'Schedule';
				break;
		}
		if (!result) {
			result = contentType;
		}
		return result;
	};

	const getMembers = async () => {
		try {
			const res = await useApi('memberList.get');
			if (res.results) {
				members.value = res.results.map((member) => ({
					title: member.user.username,
					value: member.user.username
				}));
			}
		} catch (e) {
			console.log(`Catch error: ${e}`);
		}
	};

	const getAvailableContentTypes = async () => {
		try {
			const res = await useApi('availableContentTypes.get');
			if (res.results) {
				contentTypes.value = res.results.map(function (item) {
					item.name = getEntityNameByContentType(item.key);
					if (!item.name) {
						item.name = item.key;
					}
					return item;
				});
			}
		} catch (e) {
			console.log(`Catch error: ${e}`);
		}
	};

	const findEntityByContentType = (contentType, type) => {
		let entity = null;
		const contentTypes =
			type === 'ui' ? entityContentTypeListForUi : entityContentTypeList;
		contentTypes.forEach(function (item) {
			if (item.key === contentType) {
				entity = item.entity;
			}
		});
		return entity;
	};

	const viewNotes = (item) => {
		modalItem.value = item;
		isNotes.value = true;
	};

	const previewDiff = (item) => {
		try {
			modalItem.value = item;
			isDiff.value = true;
		} catch (e) {
			modalItem.value = null;
		}
	};

	const showRecordData = async (record) => {
		try {
			const res = await useApi('historicalRecordData.get', {
				params: { id: record.id }
			});
			if (res.results) {
				modalItem.value = modalItem.value = JSON.stringify(
					res.results,
					null,
					4
				);
				isData.value = true;
			}
		} catch (e) {
			console.log(`Error: ${e}`);
		}
	};

	const download = (downloadItem, fileType = '.txt') => {
		const fileContent = {
			name: modalItem.value.member_object?.username || 'Untitled',
			content: downloadItem,
			mime_type: fileType === '.json' ? 'application/json' : 'text/plain'
		};
		downloadFile(fileContent.content, fileContent.mime_type, fileContent.name);
		cancel();
	};

	const cancel = () => {
		isNotes.value = false;
		isDiff.value = false;
		isData.value = false;
		modalItem.value = null;
	};

	const copy = async (valueToCopy) => {
		await navigator.clipboard.writeText(valueToCopy);
		useNotify({
			type: 'success',
			title: 'Copied to clipboard'
		});
	};

	const setSearchQueryDebounced = debounce(async () => {
		currentPage.value = 1;
		await getData();
	}, 500);

	const updateFilters = async (type = '') => {
		Object.entries(journalFilters.value).forEach(([key, value]) => {
			if (key === 'date_from' || key === 'date_to') {
				if (value) {
					journalFilters.value[key] = dayjs(new Date(value)).format(
						'YYYY-MM-DD'
					);
				} else {
					delete journalFilters.value[key];
				}
			}
			if (
				value === '' ||
				value === null ||
				value === undefined ||
				(Array.isArray(value) && value.length === 0)
			) {
				delete journalFilters.value[key];
			}
		});
		if (type === 'search') {
			setSearchQueryDebounced();
		} else {
			await getData();
		}
	};

	const handlePageChange = (newPage) => {
		currentPage.value = newPage;
		init(currentPage.value);
	};

	const init = (newPage = 1) => {
		getData(newPage);
		getMembers();
		getAvailableContentTypes();
	};

	const refresh = () => {
		init();
	};

	init();
</script>

<style lang="scss" scoped>
	table {
		border-collapse: collapse;
		border-radius: var();
	}
	thead {
		border-bottom: 1px solid var(--border-color);
	}
	th,
	td {
		padding: var(--spacing-8);
	}
	td {
		font-size: var(--spacing-12);
		.notes,
		.diff-value {
			max-height: var(--spacing-48);
			overflow-y: auto;
			cursor: pointer;
			&:hover {
				opacity: 0.7;
			}
		}
		.diff-value {
			background: var(--inverse-primary);
			padding: var(--spacing-4);
		}
	}
	.copy-wrap {
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
		border-radius: var(--spacing-4);
		width: var(--spacing-32);
		height: var(--spacing-32);
		background: var(--secondary-container);
		.copy-icon {
			margin: var(--spacing-8);
		}
	}
	.avatar-wrapper {
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 50%;
		width: var(--spacing-32);
		height: var(--spacing-32);
		background: var(--inverse-primary);
	}
</style>
