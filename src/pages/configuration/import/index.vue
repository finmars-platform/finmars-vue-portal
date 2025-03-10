<template>
	<div class="flex flex-col gap-8 p-5">
		<div class="import-container">
			<div class="page-title">Import Configuration</div>
			<div :class="['upload-container-wrap',{ 'not-complete': isNotComplete }]">
				<FmFileUpload
					@update-files="updateList"
					@show-details="showDetails"
					@incorrect-count="incorrectCount"
					@incorrect-file="incorrectFile"
					:multiple="false"
					:task-object="taskObject"
					type="task"
					variant="large"
					label="Select File"
				/>
			</div>
		</div>
		<div v-if="isDetailsLoading" class="flex w-full justify-center items-center min-w-44 min-h-36">
			<FmProgressCircular :size="32" indeterminate />
		</div>
		<div v-else-if="detailsEditor.data.content" class="details-container">
			<img v-if="detailsEditor.contentType === 'image' && imageUrl" id="preview-image" :src="imageUrl" alt="">
			<template v-else>
				<VAceEditor
					:value="detailsEditor.data.content_formatted || ''"
					:lang="detailsEditor.contentType"
					theme="monokai"
					class="min-h-96 w-full"
					@init="onEditorInit"
				/>
				<div class="copy-wrap absolute top-4 right-4"
					 @click="copyToBuffer(detailsEditor.data.content_formatted)">
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
				<div class="details-controls">
					<FmButton @click="download" rounded>Download</FmButton>
					<FmButton @click="closeDetails" rounded>Ok</FmButton>
				</div>
			</template>
		</div>
	</div>
</template>

<script setup>
	import { FmFileUpload, FmTooltip, FmButton, FmIcon, FM_DIALOGS_KEY, FmProgressCircular } from '@finmars/ui';
	import useAceEditor from '~/composables/useAceEditor';
	import { downloadFile } from '~/pages/system/helper';
	import { defineAsyncComponent, inject } from 'vue';

	const dialogService = inject(FM_DIALOGS_KEY);
	const { VAceEditor, onEditorInit } = useAceEditor();

	const taskObject = ref(null);
	const taskObjectId = ref(null);
	const isDetailsLoading = ref(false);
	const isNotComplete = ref(false);
	const pollingInterval = 1000;
	const heightValue = ref('320');
	const contentType = ref('json');
	const imageUrl = ref('');
	const detailsEditor = ref({
		data: {
			info: null,
			content: null,
			file_descriptor: null
		}
	});

	const progressHeightValue = computed(() => (`${heightValue.value}px`));

	const formatCSV = () => {
		let result = '<table><tbody>';
		if (!detailsEditor.value.data.content) return result + '</tbody></table>';
		const lines = detailsEditor.value.data.content.split(/\r?\n/);
		lines.forEach((line) => {
			const pieces = line.split(',');
			result += '<tr>';
			pieces.forEach((piece) => {
				result += `<td>${piece}</td>`;
			});
			result += '</tr>';
		});
		result += '</tbody></table>';
		return result;
	};

	function formatContent() {
		let name = '';

		if (detailsEditor.value.data.file_descriptor) {
			name = detailsEditor.value.data.file_descriptor.name;
		}

		if (detailsEditor.value.data.info && detailsEditor.value.data.info.file_report_object) {
			name = detailsEditor.value.data.info.file_report_object.name;
		}

		if (name.includes('.csv')) {
			contentType.value = 'csv';
			detailsEditor.value.data.content_formatted = formatCSV;
		} else if (name.includes('.json')) {
			contentType.value = 'json';
			detailsEditor.value.data.content_formatted = JSON.stringify(JSON.parse(detailsEditor.value.data.content), null, 4);
		} else if (name.includes('.py')) {
			contentType.value = 'python';
			detailsEditor.value.data.content_formatted = detailsEditor.value.data.content;
		} else if (name.includes('.yml') || name.includes('.yaml')) {
			contentType.value = 'yaml';
			detailsEditor.value.data.content_formatted = detailsEditor.value.data.content;
		} else if (name.includes('.txt') || name.includes('.log')) {
			contentType.value = 'text';
			detailsEditor.value.data.content_formatted = detailsEditor.value.data.content;
		} else if (name.includes('.png') || name.includes('.jpg') || name.includes('.gif')) {
			contentType.value = 'image';

			const urlCreator = window.URL || window.webkitURL;
			imageUrl.value = urlCreator.createObjectURL(detailsEditor.value.data.blob);
		}
	}

	function readBlob() {
		const reader = new FileReader();
		reader.addEventListener('loadend', () => {
			detailsEditor.value.data.content = reader.result;
			formatContent();
		});
		reader.readAsText(detailsEditor.value.data.content);
	}

	function pollTaskStatus(taskId) {
		const intervalId = setInterval(async () => {
			const res = await useApi('activeProcesses.get', { params: { id: taskId } });
			if (res && res?._$error) {
				useNotify({ type: 'error', title: res._$error.error.message || res._$error.error.detail });
				clearInterval(intervalId);
			} else {
				taskObject.value = res;
				heightValue.value = '140';
				if (['D', 'E'].includes(res.status)) {
					clearInterval(intervalId);
					isNotComplete.value = res.status === 'E';
				}
			}
		}, pollingInterval);
	}

	async function updateList(data) {
		if (data?.[0]?.file) {
			const formData = new FormData();
			formData.append('file', data[0].file);
			const res = await useApi('configurationImport.post', { body: formData });
			if (res && res?._$error) {
				useNotify({ type: 'error', title: res._$error.error.message || res._$error.error.detail });
			} else {
				taskObjectId.value = res.task_id;
				pollTaskStatus(taskObjectId.value);
			}
		} else {
			cancel();
		}
	}

	async function showDetails(obj) {
		isDetailsLoading.value = true;
		const res = await useApi('fileReport.get', { params: { fileId: obj.attachments[0].file_report } });
		if (res && res._$error) {
			useNotify({ type: 'error', title: res._$error.error.message || res._$error.error.detail });
		} else {
			detailsEditor.value.data.content = res;
			detailsEditor.value.data.info = obj.attachments[0];
			if (res instanceof Blob) {
				readBlob();
			} else {
				formatContent();
			}
		}
		isDetailsLoading.value = false;
	}

	const openDialog = (text) => {
		const confirmationComponent = defineAsyncComponent(
			() => import('@/components/modal/ConfirmationDialog.vue')
		);
		dialogService.$openDialog({
			component: confirmationComponent,
			componentProps: {
				text: `${text}`
			},
			dialogProps: {
				title: 'Warning'
			}
		});
	};

	const copyToBuffer = async (valueToCopy) => {
		await navigator.clipboard.writeText(valueToCopy);
		useNotify({
			type: 'success',
			title: 'Copied to clipboard'
		});
	};

	const download = () => {
		const fileContent = {
			name: 'file',
			content: detailsEditor.value.data.content,
			mime_type: 'application/force-download'
		};

		if (typeof detailsEditor.value.data.content === 'object') {
			fileContent.content = JSON.stringify(detailsEditor.value.data.content, null, 4);
		}

		if (detailsEditor.value.data.file_descriptor) {
			fileContent.name = detailsEditor.value.data.file_descriptor.name;
		}

		if (detailsEditor.value.data.info && detailsEditor.value.data.info.file_report_object) {
			fileContent.name = detailsEditor.value.data.info.file_report_object.name;
		}
		downloadFile(fileContent.content, fileContent.mime_type, fileContent.name);
	};

	const closeDetails = () => {
		detailsEditor.value = {
			data: {
				info: null,
				content: null,
				file_descriptor: null
			}
		};
		isDetailsLoading.value = false;
	};

	const cancel = () => {
		closeDetails();
		taskObject.value = null;
		taskObjectId.value = null;
		isNotComplete.value = false;
		heightValue.value = '320';
		contentType.value = 'json';
		imageUrl.value = '';
	};

	const incorrectCount = () => {
		openDialog('Can not import more then 1 file.');
		cancel();
	};

	const incorrectFile = () => {
		openDialog('Wrong file extension. Drop .fcfg, .cfg or .zip configuration file to start import.');
		cancel();
	};

</script>

<style scoped lang="scss">
	.upload-container-wrap {
		min-width: 480px;
		max-width: 60%;
		min-height: v-bind(progressHeightValue);

		&.not-complete {
			color: var(--error-color);
			border: 2px solid var(--error-color);
		}

		:deep(.drop-box) {
			min-height: v-bind(progressHeightValue);
		}

		:deep(.progress-state) {
			min-height: v-bind(progressHeightValue);
		}
	}

	.page-title {
		font-size: 24px;
		margin-bottom: var(--spacing-24);
	}

	.details-container {
		position: relative;
		display: flex;
		flex-direction: column;
		gap: var(--spacing-12);

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

		.details-controls {
			display: flex;
			align-items: center;
			justify-content: flex-start;
			gap: var(--spacing-8);
		}
	}
</style>
