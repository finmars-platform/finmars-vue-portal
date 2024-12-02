<template>
	<section class="tasks-page">
		<div class="tasks-page__content">
			<div class="flex justify-start items-center gap-x-2 mb-4">
				<h1 class="text-[20px] font-bold">Tasks</h1>
				<FmIconButton
					class="tasks-page__btn-refresh"
					icon="mdi-refresh"
					:disabled="isTaskListLoading"
					@click="refreshData"
				>
					<FmTooltip activator="parent" type="secondary" location="top">
						Refresh
					</FmTooltip>
				</FmIconButton>
			</div>

			<TaskFilter
				:model-value="filter"
				@update:model-value="updateFilter"
				:disabled="isTaskListLoading"
			/>

			<TaskStats class="mb-6" />

			<div class="tasks-page__table-header">
				<div class="tasks-page__table-th w-[15%]">Status</div>
				<div class="tasks-page__table-th w-[12%]">Result</div>
				<div class="tasks-page__table-th w-[13%]">Date</div>
				<div class="tasks-page__table-th w-[38%]">Task</div>
				<div class="tasks-page__table-th w-[22%]">User</div>
			</div>

			<div class="tasks-page__table-body">
				<TaskListItem
					v-for="task in tasks"
					:key="task.id"
					:task="task"
					:is-selected="task.id === selectedTask?.id"
					@select="selectedTask = $event"
				/>

				<div
					v-if="isTaskListLoading"
					class="absolute left-0 top-0 w-full h-full flex justify-center items-center bg-[var(--tasks-loading-bg)]"
				>
					<FmProgressCircular indeterminate />
				</div>
			</div>

			<div class="tasks-page__table-footer">
				<FmPagination
					v-model="filter.page"
					:items-per-page="20"
					:total-items="totalTasks"
					:disabled="isTaskListLoading"
					@update:model-value="updateFilter({ page: $event })"
				/>
			</div>
		</div>

		<div class="tasks-page__info">
			<div
				v-if="!selectedTask"
				class="tasks-page__info__text"
			>
				Click on event to see details
			</div>

			<TaskInfo v-else :task-id="selectedTask.id" @refresh="refreshData" />
		</div>
	</section>
</template>

<script setup>
	import { ref, onBeforeMount } from 'vue';
	import dayjs from 'dayjs';
	import isEmpty from 'lodash/isEmpty';
	import {
		FmIconButton,
		FmPagination,
		FmProgressCircular,
		FmTooltip
	} from '@finmars/ui';
	import useApi from '@/composables/useApi';
	import TaskFilter from '~/components/pages/task/TaskFilter/TaskFilter.vue';
	import TaskStats from '~/components/pages/task/TaskStats.vue';
	import TaskListItem from '~/components/pages/task/TaskListItem/TaskListItem.vue';
	import TaskInfo from '~/components/pages/task/TaskInfo/TaskInfo.vue';

	definePageMeta({
		middleware: 'auth'
	});

	const dateFormat = 'YYYY-MM-DD';

	const route = useRoute();
	const router = useRouter();

	const isTaskListLoading = ref(false);
	const totalTasks = ref(0);
	const filter = ref({
		date_from: dayjs().subtract(30, 'days').format(dateFormat),
		date_to: dayjs().format(dateFormat),
		query: null,
		statuses: null,
		types: null,
		result: null,
		page: 1
	});
	const tasks = ref([]);
	const selectedTask = ref(null);

	function prepareUrl() {
		const { date_from, date_to, query, result, statuses, types, page } =
			filter.value;

		router.push({
			query: {
				date_from,
				date_to,
				...(query && { query }),
				...(!isEmpty(result) && { result: result.join(',') }),
				...(!isEmpty(statuses) && { statuses: statuses.join(',') }),
				...(!isEmpty(types) && { types: types.join(',') }),
				page
			}
		});
	}

	async function refreshData() {
		selectedTask.value = null;
		await getTaskList();
	}

	async function updateFilter(value) {
		filter.value = {
			...filter.value,
			...value
		};
		prepareUrl();
		await refreshData();
	}

	async function getTaskList() {
		try {
			isTaskListLoading.value = true;
			const { date_from, date_to, query, result, statuses, types, page } =
				filter.value;

			const data = await useApi('taskListLight.get', {
				filters: {
					date_from,
					date_to,
					...(query && { query }),
					...(result && { result }),
					...(statuses && { statuses }),
					...(types && { types }),
					page,
					page_size: 20,
					ordering: '-created_at'
				}
			});

			tasks.value = data?.results || [];
			totalTasks.value = data?.count || 0;
		} catch (e) {
			console.error('TASK LIST LOADING ERROR. ', e);
		} finally {
			isTaskListLoading.value = false;
		}
	}

	onBeforeMount(async () => {
		const { date_from, date_to, query, result, statuses, types, page } =
			route.query;

		date_from && (filter.value.date_from = date_from);
		date_to && (filter.value.date_to = date_to);
		query && (filter.value.query = query);
		page && (filter.value.page = Number(page));
		result && (filter.value.result = result.split(','));
		statuses && (filter.value.statuses = statuses.split(','));
		types && (filter.value.types = types.split(','));

		await getTaskList();
	});
</script>

<style lang="scss" scoped>
	.tasks-page {
		--tasks-page-info-width: 450px;
		--tasks-loading-bg: rgba(0, 0, 0, 0.05);

		position: relative;
		width: 100%;
		height: 100%;
		display: flex;
		justify-content: space-between;
		align-items: stretch;
		color: var(--on-surface);

		&__content {
			position: relative;
			width: calc(100% - var(--tasks-page-info-width));
			height: 100%;
			overflow-y: auto;
			padding: var(--spacing-16);
		}

		&__info {
			position: relative;
			height: 100%;
			width: var(--tasks-page-info-width);
			min-width: var(--tasks-page-info-width);
			overflow-y: auto;
			border-left: 1px solid var(--outline-variant);
			padding: var(--spacing-16);

			&-text {
				font-size: 14px;
				font-weight: 500;
				line-height: 20px;
				color: var(--on-surface);
			}
		}

		&__btn-refresh {
			width: 24px !important;
			height: 24px !important;

			:deep(.v-icon) {
				font-size: 20px !important;
				width: 20px !important;
				height: 20px !important;
			}
		}

		&__table {
			&-header {
				display: flex;
				width: 100%;
				height: 40px;
				justify-content: flex-start;
				align-items: center;
				border-bottom: 1px solid var(--outline-variant);
			}

			&-th {
				display: flex;
				height: 100%;
				justify-content: flex-start;
				align-items: center;
				font-size: 16px;
				font-weight: 700;
				padding-left: 4px;
			}

			&-body {
				position: relative;
				width: 100%;
				min-height: 80px;
			}

			&-footer {
				position: relative;
				width: 100%;
				padding: var(--spacing-24) 0;
			}
		}
	}
</style>
