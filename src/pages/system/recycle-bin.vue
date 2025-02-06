<template>
	<div class="p-16">
		<div class="flex items-center mb-8">
			<h1 class="font-[var(--display-small-font)] mr-2">Recycle Bin</h1>

			<fm-tooltip location="top" type="secondary">
				<template #activator="{ props }">
					<fm-icon-button
						icon="mdi-refresh"
						size="small"
						v-bind="props"
						@click="loadDeletedItems"
					/>
				</template>

				<span>Refresh</span>
			</fm-tooltip>
		</div>
		<div class="flex items-center mb-6">
			<div class="w-[250px] mr-2">
				<ui-fm-input-date
					:modelValue="filters.date_from"
					label="Date From"
					@update:model-value="
						(newVal) => updateFiltersDebounce('date_from', newVal)
					"
				/>
			</div>

			<div class="w-[250px] mr-2">
				<ui-fm-input-date
					:model-value="filters.date_to"
					label="Date To"
					@update:model-value="
						(newVal) => updateFiltersDebounce('date_to', newVal)
					"
				/>
			</div>

			<div class="flex flex-shrink basis-full mr-4 max-w-[600px]">
				<fm-text-field
					:model-value="filters.query"
					label="Search"
					outlined
					hide-details
					@update:model-value="
						(newVal) => updateFiltersDebounce('query', newVal)
					"
					class="mr-4"
				/>
			</div>

			<fm-button
				:disabled="!items.length"
				@click="showClearBinWarning = true"
				>Clear Bin
			</fm-button>

			<base-modal
				v-model="showClearBinWarning"
				title="Warning"
				@close="showClearBinWarning = false"
			>
				<div class="pb-4">
					Transactions from {{ filters.date_from }} to
					{{ filters.date_to }} will be <b>Deleted</b>
					completely.
				</div>

				<template #controls="{ cancel }">
					<div class="flex justify-between items-center">
						<fm-button type="secondary" @click="cancel()"
							>Cancel
						</fm-button>

						<div>
							<fm-progress-circular
								v-if="initializingClearing"
								:size="30"
								indeterminate
								class="mr-4"
							/>

							<fm-button
								:disabled="initializingClearing"
								@click="clearBin"
								>OK
							</fm-button>

							<fm-tooltip
								v-if="initializingClearing"
								activator="parent"
								location="top"
								type="secondary"
								>Deletion will start soon
							</fm-tooltip>
						</div>
					</div>
				</template>
			</base-modal>
		</div>

		<div v-if="readyStatus">
			<template v-if="items?.length">
				<ui-fm-pagination
					:model-value="currentPage"
					:total-items="count"
					:items-per-page="pageSize"
					@update:model-value="handlePageChange"
				/>

				<div style="padding: 8px; padding-left: 24px">
					<table class="angularjs-table">
						<thead>
							<tr>
								<th>
									<ui-fm-checkbox
										:model-value="allRowsAreSelected"
										@update:model-value="toggleAll"
										class="w-max"
									/>
								</th>
								<th>Code</th>
								<th>Transaction Unique Code</th>
								<th>Deleted Transaction Unique Code</th>
								<th class="w-[80px]">Date</th>
								<th class="min-w-[140px]">Text</th>
								<th>User Text 1</th>
								<th>User Text 2</th>
								<th>User Text 3</th>
								<th>User Text 4</th>
								<th>User Text 5</th>
								<th class="w-[120px]">Deletion Date</th>
								<th>Journal</th>
							</tr>
						</thead>

						<tbody>
							<tr v-for="item in items" :key="item.id">
								<td>
									<ui-fm-checkbox
										v-model="item.selected"
										class="w-max"
									/>
								</td>
								<td>{{ item.code }}</td>
								<td>{{ item.transaction_unique_code }}</td>
								<td>
									{{ item.deleted_transaction_unique_code }}
								</td>
								<td>{{ item.date }}</td>
								<td>{{ item.text }}</td>
								<td>{{ item.user_text_1 }}</td>
								<td>{{ item.user_text_2 }}</td>
								<td>{{ item.user_text_3 }}</td>
								<td>{{ item.user_text_4 }}</td>
								<td>{{ item.user_text_5 }}</td>
								<td>{{ item.modified_datetime_pretty }}</td>
								<td>
									<!--								<div data-ng-if="item.deleted_transaction_unique_code">
									<a ui-sref="app.portal.journal({query: item.deleted_transaction_unique_code, content_type: 'transactions.complextransaction'})" target="_blank">See Journal</a>
								</div>
								<div data-ng-if="!item.deleted_transaction_unique_code">
									<a ui-sref="app.portal.journal({query: item.code, content_type: 'transactions.complextransaction'})" target="_blank">See Journal</a>
								</div>-->
									<a
										:href="getJournalHref(item)"
										target="_blank"
									>
										<fm-button type="secondary"
											>See Journal
										</fm-button>
									</a>
								</td>
							</tr>
						</tbody>
					</table>
				</div>

				<div>
					<fm-button
						type="secondary"
						:disabled="!selectedItems.length"
						@click="showRestorationWarning = true"
						>Restore Selected
					</fm-button>

					<fm-button
						type="secondary"
						:disabled="!selectedItems.length"
						@click="showDeletionWarning = true"
						>Delete Selected
					</fm-button>

					<base-modal
						v-model="showRestorationWarning"
						title="Warning"
						@close="showRestorationWarning = false"
					>
						<div class="pb-4">
							Transactions could be restored if
							<b>Unique Transaction Code</b> is free to use.<br />
							Transactions that failed restore process will stay
							in Recycle Bin.
						</div>

						<template #controls="{ cancel }">
							<div class="flex justify-between items-center">
								<fm-button type="secondary" @click="cancel()"
									>CANCEL
								</fm-button>

								<div>
									<fm-progress-circular
										v-if="restoringInProgress"
										:size="30"
										indeterminate
										class="mr-4"
									/>

									<fm-button
										:disabled="restoringInProgress"
										@click="restoreSelected"
										>OK
									</fm-button>

									<fm-tooltip
										v-if="restoringInProgress"
										activator="parent"
										location="top"
										type="secondary"
										>Restoring in progress
									</fm-tooltip>
								</div>
							</div>
						</template>
					</base-modal>

					<base-modal
						v-model="showDeletionWarning"
						title="Warning"
						@close="showDeletionWarning = false"
					>
						<div class="pb-4">
							Selected Transactions will be
							<b>Deleted</b> completely.
						</div>

						<template #controls="{ cancel }">
							<div class="flex justify-between items-center">
								<fm-button type="secondary" @click="cancel()"
									>Cancel
								</fm-button>

								<div>
									<fm-progress-circular
										v-if="initializingDeletion"
										:size="30"
										indeterminate
										class="mr-4"
									/>

									<fm-button
										:disabled="initializingDeletion"
										@click="deleteSelected"
										>OK
									</fm-button>

									<fm-tooltip
										v-if="initializingDeletion"
										activator="parent"
										location="top"
										type="secondary"
										>Deletion will start soon
									</fm-tooltip>
								</div>
							</div>
						</template>
					</base-modal>
				</div>

				<ui-fm-pagination
					:model-value="currentPage"
					:total-items="count"
					:items-per-page="pageSize"
					@update:model-value="handlePageChange"
				/>
			</template>
			<div v-else class="flex items-center mb-2">
				<div class="mr-2">No data</div>
			</div>
		</div>

		<div v-else class="loader-container flex flex-center">
			<fm-progress-circular :size="100" indeterminate />
		</div>
	</div>
</template>

<script setup>
	import dayjs from 'dayjs';
	import {
		FmCheckbox as UiFmCheckbox,
		FmInputDate as UiFmInputDate,
		FmPagination as UiFmPagination
	} from '@finmars/ui';

	definePageMeta({
		middleware: 'auth',
		bread: [
			{
				text: 'Recyle Bin',
				to: '/system/recycle-bin',
				disabled: true
			}
		]
	});

	//# region variables, refs, computed
	const route = useRoute();

	const readyStatus = ref(false);

	const filters = ref({
		date_from: dayjs(new Date()).subtract(1, 'month').format('YYYY-MM-DD'),
		date_to: dayjs(new Date()).format('YYYY-MM-DD')
	});

	const items = ref([]);
	const count = ref(0);

	const pageSize = ref(100);
	const currentPage = ref(1);

	const allRowsAreSelected = computed(() => {
		if (!items.value.length) {
			return false;
		}

		const notSelected = items.value.find((item) => !item.selected);

		return !notSelected;
	});

	const selectedItems = computed(() =>
		items.value.filter((item) => item.selected)
	);

	//# endregion

	const showClearBinWarning = ref(false);
	const initializingClearing = ref(false);

	async function clearBin() {
		const opts = {
			body: {
				date_from: filters.value.date_from,
				date_to: filters.value.date_to
			}
		};

		initializingClearing.value = true;

		const res = await useApi('clearRecycleBin.post', opts);
		initializingClearing.value = false;

		if (!res._$error) {
			useNotify({
				type: 'success',
				title: 'Deletion of transactions started. You can see its progress inside the tasks page.'
			});

			showClearBinWarning.value = false;
		}
	}

	function toggleAll(isSelected) {
		items.value = items.value.map((item) => {
			item.selected = isSelected;
			return item;
		});
	}

	function getJournalHref(item) {
		let queryParams = 'content_type=transactions.complextransaction';

		queryParams =
			queryParams +
			`&query=${item.deleted_transaction_unique_code ? item.deleted_transaction_unique_code : item.code}`;

		return getUrlToOldApp(`/journal?${queryParams}`);
	}

	let abortController = new AbortController();
	let abortSignal = abortController.signal;

	async function fetchDeletedItems() {
		abortController.abort({ key: 'ABORTED_BY_CLIENT' });

		abortController = new AbortController();
		abortSignal = abortController.signal;

		const opts = {
			filters: {
				...JSON.parse(JSON.stringify(filters.value)),
				page_size: pageSize.value,
				page: currentPage.value,
				ordering: `-created_at` // sort in descending order by `created_at`
			},
			signal: abortSignal
		};

		// Fetch deleted complex transactions
		const res = await useApi('recycleBin.get', opts);

		if (res._$error) {
			throw res._$error;
		} else if (res._$abort) {
			throw 'ABORTED_BY_CLIENT';
		}

		res.results.forEach((item) => {
			item.modified_datetime_pretty = dayjs(
				new Date(item.modified_at)
			).format('DD-MM-YYYY HH:mm');
		});

		readyStatus.value = true;

		return {
			items: res.results,
			count: res.count
		};
	}

	async function loadDeletedItems() {
		readyStatus.value = false;

		try {
			const res = await fetchDeletedItems();

			items.value = res.items;
			count.value = res.count;
		} catch (e) {
			if (e !== 'ABORTED_BY_CLIENT') {
				console.error(e);
			}
		}

		readyStatus.value = true;
	}

	async function handlePageChange(newPage) {
		currentPage.value = newPage;

		await loadDeletedItems();
	}

	const updateFiltersDebounce = useDebounce(async function (key, newVal) {
		currentPage.value = 1;
		route.query.page = '' + currentPage.value;

		filters.value[key] = newVal;

		// router.replace()
		await navigateTo({
			query: JSON.parse(JSON.stringify(filters.value)),
			replace: true
		});

		await loadDeletedItems();
	}, 500);

	const showRestorationWarning = ref(false);
	const restoringInProgress = ref(false);

	async function restoreSelected() {
		restoringInProgress.value = true;

		const ids = selectedItems.value.map((item) => item.id);

		const res = await useApi('complexTransactionBulkRestore.post', {
			body: { ids }
		});

		restoringInProgress.value = false;

		if (!res._$error) {
			useNotify({ type: 'success', title: 'Transactions were restored' });

			currentPage.value = 1;

			await loadDeletedItems();
		}

		showRestorationWarning.value = false;
	}

	const showDeletionWarning = ref(false);
	const initializingDeletion = ref(false);

	async function deleteSelected() {
		initializingDeletion.value = true;

		const data = {
			ids: selectedItems.value.map((item) => item.id)
		};

		const res = await useApi('complexTransactionBulkDelete.post', {
			body: data
		});

		if (!res._$error) {
			useNotify({
				type: 'success',
				title: 'Deletion of transactions started. You can see its progress inside the tasks page.'
			});

			currentPage.value = 1;

			await loadDeletedItems();
		}

		initializingDeletion.value = false;
		showDeletionWarning.value = false;
	}

	async function init() {
		if (route.query.page) {
			currentPage.value = route.query.page;
		}

		if (route.query.query) {
			filters.value.query = route.query.query;
		}

		if (route.query.date_from) {
			filters.value.date_from = route.query.date_from;
		}

		if (route.query.date_to) {
			filters.value.date_to = route.query.date_to;
		}

		await loadDeletedItems();
	}

	init();
</script>

<style scoped lang="scss">
	table {
		font-size: 12px;
	}
</style>
