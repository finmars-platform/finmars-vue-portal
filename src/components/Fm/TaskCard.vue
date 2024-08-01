<template>
	<div class="task-card">
		<FmIcon icon="close" size="16" @click="close" />
		<div v-if="task">
			<a
				class="task-card-name"
				:href="getUrlToOldApp('/tasks')"
				target="_blank"
			>
				{{ task.verbose_name }} [{{ task.id }}]
			</a>

			<div class="task-card-started-at">
				Started at: <b>{{ dayjs(task.created).format('HH:mm:ss') }}</b>
				<FmTooltip v-if="false" class="tooltip_2" direction="bottom">
					{{ task.created }}
				</FmTooltip>
			</div>

			<div class="task-card-executed-by">
				Executed by: <b>{{ task.member_object?.username }}</b>
			</div>

			<div v-if="task.status === 'P'" class="task-card-progress-block">
				<div
					layout="row"
					layout-sm="column"
					layout-align="space-around"
					class="loader-spinner"
				>
					<FmProgressBar :progress="task.progress_object?.percent || 0" />

					<FmTooltip v-if="false" class="tooltip_2" direction="bottom">
						{{ task.progress_object?.percent }}%
					</FmTooltip>
				</div>

				<div class="task-card-progress-text">
					{{ taskDescriptionPretty }}
				</div>
			</div>

			<div v-if="task.status === 'D'" class="task-card-success-block">
				<div class="task-card-result">Task Finished</div>

				<div class="text-center width-100">
					<span
						class="material-icons task-card-result-icon"
						style="font-size: 40px; margin: 0"
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
						style="font-size: 40px; margin: 0"
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
						style="font-size: 40px; margin: 0"
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
	import { getUrlToOldApp } from '~/composables/useUtils'
	import dayjs from 'dayjs'

	const props = defineProps({
		taskId: Number
	})

	const emit = defineEmits(['removeTaskId', 'update'])

	const taskDescriptionPretty = ref('')
	const task = ref(null)
	const timeOut = ref(null)

	function close() {
		emit('removeTaskId')
	}

	async function getTask() {
		try {
			task.value = await useApi('taskCard.get', {
				params: { taskId: props.taskId }
			})

			if (task.value.progress_object) {
				taskDescriptionPretty.value = splitLongWords(
					task.value.progress_object.description,
					20
				)
			}

			if (task.value.status === 'P' && props.taskId) {
				timeOut.value = setTimeout(() => {
					getTask()
				}, 2000)
			} else {
				emit('update')
			}
		} catch (e) {
			console.warn('Error getTask', e)
		}
	}

	function downloadFile(item) {
		console.log('downloadFile')
	}

	onMounted(() => {
		getTask(props.taskId)
	})

	onUnmounted(() => {
		clearTimeout(timeOut.value)
		timeOut.value = null
	})
</script>

<style scoped lang="scss">
	.task-card {
	}
</style>
