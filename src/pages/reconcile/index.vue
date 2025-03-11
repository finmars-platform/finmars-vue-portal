<template>
	<div class="reconcile-container py-3 px-8 w-full flex flex-col gap-4">
		<span class="text-lg">Reconcile Groups</span>
		<span class="header-decider"></span>
		<div class="grid grid-cols-2 gap-4">
			<div class="flex flex-col gap-4">
				<span><i class="font-bold whitespace-nowrap">Date range:</i></span>
				<div class="grid grid-cols-2 gap-4">
					<FmMenu>
						<template #btn>
							<FmTextField
								v-model="dateRange.date_from"
								@update:model-value="setDatesDebounce('from', $event)"
								label="Start date"
								clearable
								outlined
							></FmTextField>
						</template>
						<template #default>
							<FmDatePicker
								v-model="dateRange.date_from"
								@update:model-value="setDatesDebounce('from', $event)"
								:canWeekendsBeSelected="true"
							/>
						</template>
					</FmMenu>
					<FmMenu>
						<template #btn>
							<FmTextField
								v-model="dateRange.date_to"
								@update:model-value="setDatesDebounce('to', $event)"
								label="End date"
								clearable
								outlined
							></FmTextField>
						</template>
						<template #default>
							<FmDatePicker
								v-model="dateRange.date_to"
								@update:model-value="setDatesDebounce('to', $event)"
								:canWeekendsBeSelected="true"
							/>
						</template>
					</FmMenu>
				</div>
			</div>
			<div class="flex flex-col gap-4">
				<span><i class="font-bold whitespace-nowrap">Portfolio Reconcile Group:</i></span>
				<div class="grid grid-cols-1 mb-4">
					<FmSearch
						v-model="portfoliosGroupToReconcile"
						:items="portfoliosGroupOptions"
						placeholder="Select Groups"
						closable-chips
						multiple
						chips
					/>
				</div>
			</div>
		</div>
		<div class="flex flex-col gap-4 dates-wrapper">
			<div v-if="isLoading" class="w-full min-h-40 flex items-center justify-center">
				<FmProgressCircular :size="34" indeterminate />
			</div>
			<div v-else-if="!datesToReconcile.length">
				<span class="w-full min-h-64 flex items-center justify-center">
				  No data available!
				</span>
			</div>
			<div v-else class="my-4">
				<span><i class="font-bold">Dates to Reconcile:</i></span>
				<div
					class="rec-dates-wrapper scrollable my-2"
					:class="{'grid grid-cols-6 gap-4': Object.keys(groupedDates).length > 1, 'grid grid-cols-[repeat(auto-fit,minmax(160px,1fr))]': Object.keys(groupedDates).length === 1}"
				>
					<template v-if="Object.keys(groupedDates).length > 1">
						<!-- MULTIPLE YEARS -->
						<template v-for="(months, year, yearIndex) in groupedDates" :key="year">
							<div class="year-column">
								<span class="font-bold text-xl block pb-2">{{ year }}</span> <!-- Year Title -->
								<div v-for="(dates, month) in months" :key="month" class="pb-4">
									<span class="font-bold text-lg block pb-2">{{ month }}</span> <!-- Month Title -->
									<div v-for="(date, index) in dates" :key="index" class="pb-2">
										<span><i class="font-bold pr-2">{{ index + 1 }}.</i> {{ date }}</span>
									</div>
								</div>
							</div>

							<!-- Vertical Divider (only if multiple years exist) -->
							<div
								v-if="yearIndex !== Object.keys(groupedDates).length - 1"
								class="divider"
							></div>
						</template>
					</template>

					<template v-else>
						<!-- SINGLE YEAR (DISPLAY MONTHS AS COLUMNS) -->
						<div class="single-year">
							<span class="font-bold text-xl block pb-4">{{ Object.keys(groupedDates)[0] }}</span><!-- Year Title -->
							<div class="grid grid-cols-[repeat(auto-fit,minmax(160px,1fr))] gap-4">
								<div v-for="(dates, month) in Object.values(groupedDates)[0]" :key="month" class="month-column">
									<span class="font-bold text-lg block pb-2">{{ month }}</span> <!-- Month Title -->
									<div v-for="(date, index) in dates" :key="index" class="pb-2">
										<span><i class="font-bold pr-2">{{ index + 1 }}.</i> {{ date }}</span>
									</div>
								</div>
							</div>
						</div>
					</template>
				</div>

				<FmButton
					type="primary"
					@click="reconcile"
					:loading="reconcileBtnLoader"
					:disabled="!datesToReconcile.length || !portfoliosGroupToReconcile.length"
					rounded
				>
					Reconcile
				</FmButton>
			</div>
		</div>
		<FmTaskCard
			v-if="activeTaskId"
			:task-id="activeTaskId"
			@removeTaskId="cancel"
			@update="getTaskResult"
			class="task-card"
		/>
	</div>
</template>

<script setup>
	import { FmDatePicker, FmSearch, FmButton, FmTextField } from '@finmars/ui';
	import dayjs from 'dayjs';
	import { debounce } from 'lodash';

	const isLoading = ref(false);
	const reconcileBtnLoader = ref(false);
	const activeTaskId = ref(null);

	const datesToReconcile = ref([]);
	const portfoliosGroupToReconcile = ref([]);
	const portfoliosGroupOptions = ref([{
		title: '',
		value: ''
	}]);

	const dateRange = ref({
		date_from: '',
		date_to: ''
	});

	const groupedDates = computed(() => {
		return datesToReconcile.value.reduce((acc, date) => {
			const year = dayjs(date).format('YYYY');
			const month = dayjs(date).format('MMMM');

			if (!acc[year]) acc[year] = {};
			if (!acc[year][month]) acc[year][month] = [];

			acc[year][month].push(date);
			return acc;
		}, {});
	});

	const updateDates = (field, data) => {
		const isValidDate = (date) => {
			const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
			return dateRegex.test(date) && dayjs(date, 'YYYY-MM-DD', true).isValid();
		};

		switch (field) {
			case 'from':
				dateRange.value.date_from = data;
				break;
			case 'to':
				dateRange.value.date_to = data;
				break;
		}

		if (!dateRange.value.date_from || !dateRange.value.date_to) {
			useNotify({ type: 'warning', title: 'Select date range !!!', duration: 4000 });
			return;
		}

		if (!isValidDate(dateRange.value.date_from) || !isValidDate(dateRange.value.date_to)) {
			useNotify({
				type: 'warning',
				title: 'Invalid date format. Please use \'YYYY-MM-DD\' format.',
				duration: 5000
			});
			return;
		}

		if (dateRange.value.date_from > dateRange.value.date_to) {
			useNotify({
				type: 'warning',
				title: '\"Start\" date can\'t be greater than \"End\" date.',
				duration: 5000
			});
			return;
		}

		getDatesToReconcile();
	};

	const setDatesDebounce = debounce(async (field, data) => {
		await updateDates(field, data);
	}, 1200);

	const cancel = () => {
		activeTaskId.value = null;
		reconcileBtnLoader.value = false;
	};

	const getTaskResult = (status) => {
		if (status === 'D') {
			setTimeout(() => {
				cancel();
			}, 4000)
		}
	};

	async function reconcile() {
		reconcileBtnLoader.value = true;

		const payload = {
			reconcile_groups: portfoliosGroupToReconcile.value,
			dates: datesToReconcile.value
		};

		const res = await useApi('portfolioReconcileHistoryBulk.post', { body: payload });
		if (res && res._$error) {
			useNotify({ type: 'error', title: res._$error.error.message || res._$error.error.detail });
			cancel();
		} else {
			activeTaskId.value = res.task_id;
			reconcileBtnLoader.value = false;
		}
	}

	async function getDatesToReconcile() {
		isLoading.value = true;
		const opts = {
			body: {
				start_date: dateRange.value.date_from,
				end_date: dateRange.value.date_to,
				frequency: 'D',
				is_only_bday: false,
				start: false
			}
		};

		const res = await useApi('pickDatesFromRange.post', opts);
		if (res && res._$error) {
			useNotify({ type: 'error', title: res._$error.error.message || res._$error.error.detail });
		} else {
			datesToReconcile.value = res.result;
		}
		isLoading.value = false;
	}

	async function getPortfoliosGroupOptions() {
		const res = await useApi('portfolioReconcileGroups.post');
		if (res && res._$error) {
			useNotify({ type: 'error', title: res._$error.error.message || res._$error.error.detail });
		} else {
			portfoliosGroupOptions.value = res.results.map((result) => {
				return {
					title: `${result.name} (${result.user_code})`,
					value: result.user_code
				};
			});
		}
	}

	async function init() {
		dateRange.value.date_to = dayjs(new Date()).format('YYYY-MM-DD');
		await getPortfoliosGroupOptions();
	}

	init();
</script>

<style scoped lang="scss">
	.reconcile-container {
		min-width: 580px;

		.header-decider {
			width: 100%;
			height: 1px;
			background: var(--border-color);
		}

		.dates-wrapper {
			border: 1px solid var(--border-color);
			border-radius: var(--spacing-16);
			padding: var(--spacing-16) var(--spacing-48);
		}

		.rec-dates-wrapper {
			display: flex;
			flex-wrap: wrap;
			justify-content: space-evenly;
			align-items: flex-start;
			overflow: auto;
			height: calc(100svh - 460px);
			min-height: 320px;
			min-width: 400px;

			.year-column {
				min-width: 160px;
				padding: 16px;
			}

			.month-column {
				min-width: 160px;
				padding: 16px;
			}

			.divider {
				width: 1px;
				background-color: var(--border-color);
				min-height: 100%;
				align-self: stretch;
			}

			.single-year {
				width: 100%;
				text-align: center;
			}
		}

		.task-card {
			position: absolute;
			top: 62px;
			right: 10px;
			z-index: 1;
		}
	}
</style>
