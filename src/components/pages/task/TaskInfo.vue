<template>
	<div class="task-info">
		<div class="task-info__header">
			<h1 class="task-info__header-title">
				{{ task?.verbose_name }}
			</h1>

			<div class="task-info__header-actions">
				<FmIconButton
					v-if="showCancelButton"
					variant="text"
					icon="mdi-cancel"
					:disabled="isLoading"
					@click="cancelTask"
				>
					<FmTooltip activator="parent" type="secondary" location="top">
						Cancel
					</FmTooltip>
				</FmIconButton>

				<FmIconButton
					variant="text"
					icon="mdi-refresh"
					:disabled="isLoading"
					@click="loadTaskInfo"
				>
					<FmTooltip activator="parent" type="secondary" location="top">
						Refresh
					</FmTooltip>
				</FmIconButton>
			</div>
		</div>
		<!-- id -->
		<div class="flex justify-start align-center gap-x-1 text-[14px] mb-2">
			<b>Id: </b>
			<span>{{ task?.id }}</span>
		</div>
		<!-- type -->
		<div class="flex justify-start align-center gap-x-1 text-[14px] mb-2">
			<b>Type: </b>
			<span>{{ task?.type }}</span>
		</div>
		<!-- start date -->
		<div class="flex justify-start align-center gap-x-1 text-[14px] mb-2">
			<b>Start Date: </b>
			<span>{{ startDate }}</span>
		</div>
		<!-- start time -->
		<div class="flex justify-start align-center gap-x-1 text-[14px] mb-2">
			<b>Start Time: </b>
			<span>{{ startTime }}</span>
		</div>
		<!-- execution time -->
		<div class="flex justify-start align-center gap-x-1 text-[14px] mb-2">
			<b>Execution Time: </b>
			<span>{{ executionTime }}</span>
		</div>
		<!-- status -->
		<div class="flex justify-start align-center gap-x-1 text-[14px] mb-2">
			<b>Status: </b>
			<TaskListItemStatus :status="task?.status" />
		</div>
		<!-- result -->
		<div class="flex flex-col justify-start items-start text-[14px] mb-2">
			<b class="mb-1">Result: </b>
			<span class="mb-1">
				Total: {{ task?.result_stats?.total_count ?? 0 }}
			</span>
			<span class="mb-1">
				Error: {{ task?.result_stats?.error_count ?? 0 }}
			</span>
			<span class="mb-1">
				Skip: {{ task?.result_stats?.skip_count ?? 0 }}
			</span>
			<span>Success: {{ task?.result_stats?.success_count ?? 0 }}</span>
		</div>
		<!-- member -->
		<div class="flex justify-start align-center gap-x-1 text-[14px] mb-2">
			<b>Member: </b>
			<span>{{ member }}</span>
		</div>
		<!-- worker -->
		<div class="flex justify-start align-center gap-x-1 text-[14px] mb-2">
			<b>Worker: </b>
			<span>{{ task?.worker_name }}</span>
		</div>

		<div class="w-full h-1 mb-2 border-b border-[var(--outline-variant)]" />

		<!-- notes -->
		<div
			v-if="task?.notes"
			class="flex justify-start align-center gap-x-1 text-[14px] mb-2"
		>
			<b>Notes: </b>
			<span>{{ task?.notes }}</span>
		</div>
		<!-- verbose_result -->
		<div
			v-if="task?.verbose_result"
			class="flex justify-start align-center gap-x-1 text-[14px] mb-2"
		>
			<b>Verbose result: </b>
			<span>{{ task?.verbose_result }}</span>
		</div>
		<!-- error_message -->
		<div
			v-if="task?.error_message"
			class="flex justify-start align-center gap-x-1 text-[14px] mb-2"
		>
			<b>Error message: </b>
			<span>{{ task?.error_message }}</span>
		</div>
		<!-- options (object) -->
		<div class="flex flex-col justify-start items-start text-[14px] mb-2">
			<b class="mb-1">Options </b>
			<VAceEditor
				:value="JSON.stringify(task?.options_object, null, 4)"
				lang="json"
				theme="monokai"
				class="task-info__viewer"
			/>
		</div>
		<!-- progress -->
		<div
			v-if="task?.progress_object && ['P', 'progress'].includes(task?.status)"
			class="flex flex-col justify-start items-start text-[14px] mb-2"
		>
			<b class="mb-1">Progress: </b>
			<FmTooltip type="secondary" position="top" class="mb-1">
				<template #activator="{ props }">
					<FmProgressLinear
						v-bind="props"
						:model-value="task.progress_object?.percent"
					/>
				</template>

				<span>{{ task.progress_object?.percent }}%</span>
			</FmTooltip>
			<span>{{ task.description }}</span>
		</div>

		<div class="w-full h-1 mb-2 border-b border-[var(--outline-variant)]" />

		<!-- results (object) -->
		<div class="flex flex-col justify-start items-start text-[14px] mb-2">
			<b class="mb-1">Results </b>
			<VAceEditor
				:value="JSON.stringify(task?.result_object, null, 4)"
				lang="json"
				theme="monokai"
				class="task-info__viewer"
			/>
		</div>
		<!-- attachments -->
		<div
			v-if="!isEmpty(task?.attachments)"
			class="flex flex-col justify-start items-start text-[14px] mb-2"
		>
			<b class="mb-1">Attachments </b>
			<span
				v-for="(item, index) in task?.attachments"
				:key="index"
				class="text-[12px] leading-[20px] cursor-pointer hover:bg-[var(--primary-container)]"
				@click.stop.prevent="_downloadFile(item)"
			>
				{{ item.file_report_object?.name }}
			</span>
		</div>
		<!-- actions -->
		<div
			v-if="showActions"
			class="flex flex-col justify-start items-start text-[14px]"
		>
			<b class="mb-1">Actions:</b>
			<FmButton
				v-if="task?.type === 'transaction_import'"
				class="mb-1"
				@click="abortTransactionImport"
			>
				Abort Transactions
			</FmButton>
		</div>

		<div
			v-if="isLoading"
			class="absolute left-0 top-0 w-full h-full flex justify-center align-center bg-[rgba(0, 0, 0, 0.2)]"
		>
			<FmProgressCircular indeterminate />
		</div>
	</div>
</template>

<script setup>
	import { computed, ref, watch } from 'vue';
	import dayjs from 'dayjs';
	import utc from 'dayjs/plugin/utc';
	import { VAceEditor } from 'vue3-ace-editor';
	import isEmpty from 'lodash/isEmpty';
	import 'ace-builds/src-noconflict/mode-json';
	import 'ace-builds/src-noconflict/theme-monokai';
	import useApi from '~/composables/useApi';
	import useConfirm from '~/composables/useConfirm';
	import useNotify from '~/composables/useNotify';
	import {
		FmButton,
		FmIconButton,
		FmProgressCircular,
		FmProgressLinear,
		FmTooltip
	} from '@finmars/ui';
	import { downloadFile } from '~/pages/explorer/helper';
	import TaskListItemStatus from './TaskListItem/TaskListItemStatus.vue';

	dayjs.extend(utc);

	const props = defineProps({
		taskId: {
			type: Number
		}
	});

	const emits = defineEmits(['refresh']);

	const isLoading = ref(false);
	const task = ref(null);

	const showCancelButton = computed(() =>
		['I', 'init', 'P', 'progress', 'W'].includes(task.value?.status)
	);

	const startDate = computed(() => {
		if (!task.value) {
			return '';
		}

		return dayjs(task.value.created_at).format('YYYY-MM-DD');
	});

	const startTime = computed(() => {
		if (!task.value) {
			return '';
		}

		return dayjs(task.value.created_at).format('HH:mm:ss');
	});

	const executionTime = computed(() => {
		if (!task.value || !task.value?.created_at || !task.value?.finished_at) {
			return '';
		}

		const date1 = dayjs(task.value.created_at);
		const date2 = dayjs(task.value.finished_at);
		const diffTime = dayjs(date2).diff(date1, 'ms');

		return dayjs.utc(diffTime).format('HH:mm:ss');
	});

	const member = computed(() =>
		!task.value ? '' : task.value.member_object?.username
	);

	const showActions = computed(() => task.value?.type === 'transaction_import');

	async function loadTaskInfo() {
		try {
			isLoading.value = true;

			task.value = await useApi('task.get', { params: { id: props.taskId } });
		} catch (e) {
			console.error(`The task ${props.taskId} loading error. `, e);
		} finally {
			isLoading.value = false;
		}
	}

	async function cancelTask() {
		try {
			isLoading.value = true;
			const isConfirm = await useConfirm({
				title: 'Warning',
				text: 'Are you sure you want to cancel task?'
			});

			if (!isConfirm) {
				return;
			}

			await useApi('task.put', { params: { id: props.taskId } });
			await loadTaskInfo();
		} catch (e) {
			console.error(`The task ${props.taskId} canceling error. `, e);
		} finally {
			isLoading.value = false;
		}
	}

	async function _downloadFile(item = {}) {
		const { file_report_object } = item;
		if (!file_report_object) {
			return;
		}

		const { file_url, name } = file_report_object || {};
		if (!file_url) {
			return;
		}

		const blob = await useApi('explorerViewFile.get', {
			filters: { path: file_url }
		});
		downloadFile(blob, 'application/json', name);
	}

	async function abortTransactionImport() {
		try {
			isLoading.value = true;
			const isConfirm = await useConfirm({
				title: 'Warning',
				text: 'Are you sure you want to delete imported transactions?'
			});

			if (!isConfirm) {
				return;
			}

			await useApi('taskTransaction.put', { params: { id: props.taskId } });
			await loadTaskInfo();
			emits('refresh');
			useNotify({
				title: 'Transaction import aborted successfully'
			});
		} catch (e) {
			console.error(`The task ${props.taskId} aborting transaction error. `, e);
		} finally {
			isLoading.value = false;
		}
	}

	watch(
		() => props.taskId,
		(val, oldVal) => {
			if (val && val !== oldVal) {
				loadTaskInfo();
			}
		},
		{
			immediate: true
		}
	);
</script>

<style lang="scss" scoped>
	.task-info {
		position: relative;
		width: 100%;
		min-height: 100vh;

		&__header {
			display: flex;
			justify-content: space-between;
			align-items: center;
			margin-bottom: 4px;

			&-title {
				font-size: 24px;
				line-height: 36px;
				flex-grow: 1;
			}

			&-actions {
				display: flex;
				justify-content: center;
				align-items: center;
			}
		}

		&__viewer {
			position: relative;
			width: 100%;
			height: 300px;
			border-radius: 4px;
		}
	}
</style>
