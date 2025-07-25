<template>
	<div class="task-card">
		<FmIcon icon="close" size="16" @click="close" class="close" />
		<ModalDownloadFile
			v-if="!!downloadFileData"
			@update:modelValue="downloadFileData = null"
			:fileInfo="downloadFileData"
		/>
		<div v-if="task">
			<NuxtLink
				class="task-card-name"
				target="_blank"
				:to="useGetNuxtLink('/system/task', $route.params)"
			>
				{{ task.verbose_name }} [{{ task.id }}]
			</NuxtLink>

			<div v-tooltip="task.created" class="task-card-started-at">
				Started at: <b>{{ dayjs(task.created).format('HH:mm:ss') }}</b>
			</div>

			<div class="task-card-executed-by">
				Executed by: <b>{{ task.member_object?.username }}</b>
			</div>

			<div v-if="task.status === 'P'" class="task-card-progress-block">
				<FmProgressBar
					v-tooltip="task.progress_object?.percent"
					:progress="task.progress_object?.percent || 0"
					class="progress-bar"
				/>

				<div class="task-card-progress-text">
					{{ taskDescriptionPretty }}
				</div>
			</div>

			<div v-if="task.status === 'D'" class="task-card-success-block">
				<div class="task-card-result">Task Finished</div>

				<div class="text-center width-100">
					<span
						class="material-icons task-card-result-icon"
						style="font-size: 40px; margin: 0; color: green"
						>check_circle</span
					>
				</div>

				<div class="task-detail-field" v-if="task.attachments?.length">
					<span class="task-detail-field-definition">Attachments</span>

					<div
						v-for="item in task.attachments"
						:key="item.file_report_object?.name"
					>
						<span
							class="download-file-button"
							@click.prevent.stop="downloadFile(item)"
							>{{ item.file_report_object.name }}</span
						>
					</div>
				</div>
			</div>

			<div v-if="task.status === 'E'" class="task-card-error-block">
				<div class="task-card-result">Error</div>

				<div class="text-center width-100">
					<span
						class="material-icons task-card-result-icon"
						style="font-size: 40px; margin: 0; color: red"
						>error</span
					>
				</div>

				<div class="task-card-error-text">{{ task.error_message }}</div>
			</div>

			<div v-if="task.status === 'C'" class="task-card-warning-block">
				<div class="task-card-result">Canceled</div>

				<div class="text-center width-100">
					<span
						class="material-icons task-card-result-icon"
						style="font-size: 40px; margin: 0; color: orange"
						>warning</span
					>
				</div>
			</div>
		</div>

		<div v-else class="overlay-loader">
			<FmLoader :diameter="50" />
		</div>
	</div>
</template>

<script setup>
	import dayjs from 'dayjs';
	import { useGetNuxtLink } from '~/composables/useMeta';

	const props = defineProps({
		taskId: Number
	});

	const emit = defineEmits(['removeTaskId', 'update']);

	const taskDescriptionPretty = ref('');
	const task = ref(null);
	const timeOut = ref(null);
	const downloadFileData = ref(null);

	function close() {
		emit('removeTaskId');
	}

	async function getTask() {
		try {
			task.value = await useApi('taskCard.get', {
				params: { taskId: props.taskId }
			});

			if (task.value.progress_object) {
				taskDescriptionPretty.value = splitLongWords(
					task.value.progress_object.description,
					20
				);
			}

			if (task.value.status === 'P' && props.taskId) {
				timeOut.value = setTimeout(() => {
					getTask();
				}, 2000);
			} else {
				emit('update', task.value.status);
			}
		} catch (e) {
			console.warn('Error getTask', e);
		}
	}

	async function downloadFile(item) {
		try {
			const response = await useApi('fileReport.get', {
				params: { fileId: item.file_report }
			});

			downloadFileData.value = {
				content: new Blob([response], {
					type: item.file_report_object.content_type
				}),
				info: item
			};
		} catch (e) {
			console.warn('Error downloadFile', e);
		}
	}

	onMounted(() => {
		getTask(props.taskId);
	});

	onUnmounted(() => {
		clearTimeout(timeOut.value);
		timeOut.value = null;
	});
</script>

<style scoped lang="scss">
	.task-card {
		width: 300px;
		min-height: 50px;
		padding: 16px;

		background: var(--dialog-background-color);
		border-radius: 6px;
		box-shadow: 0 1px 22px -12px #607d8b;
		margin: 8px 0;

		.task-card-name {
			margin: 4px 8px 4px 0;
			font-size: 14px;
			cursor: pointer;
			display: block;
			color: var(--secondary-color);

			&:hover {
				text-decoration: underline;
			}
		}

		.task-card-started-at {
			font-size: 11px;
			opacity: 0.7;
		}

		.task-card-executed-by {
			font-size: 11px;
			opacity: 0.7;
			margin: 2px 0;
		}

		.task-card-progress-text {
			font-size: 11px;
			overflow: hidden;
			display: block;
			margin-top: 15px;
			white-space: break-spaces;
			padding-left: 12px;
		}

		.progress-bar {
			margin-top: 12px;
		}

		.task-card-result {
			text-align: center;
			font-size: 16px;
		}

		.close {
			cursor: pointer;
			position: absolute;
			right: 8px;
			top: 16px;
		}
	}
</style>
