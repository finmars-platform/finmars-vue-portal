<template>
	<section class="data-import">
		<div class="data-import__row">
			<div class="data-import__cell">
				<div
					class="data-import__cell-header"
					@click="toggleBlocks('file')"
				>
					<FmIcon
						:icon="
							blocks.file.show
								? 'mdi-menu-down'
								: 'mdi-menu-right'
						"
						color="var(--on-surface-variant)"
					/>
					Select a file for import
				</div>

				<div
					v-show="blocks.file.show"
					:class="[
						'data-import__cell-body',
						{ 'data-import__cell-body--hidden': !blocks.file.show }
					]"
				>
					<FmInputFiles
						v-model="blocks.file.data"
						info-text="You can select the CSV or XLS/XLSX file"
						allowed-file-types=".csv,.xls,.xlsx"
						class="data-import__cell-input"
						:disabled="disabled || isImporting"
						@error="blocks.file.error = $event"
					/>

					<div
						v-if="blocks.file.error && isEmpty(blocks.file.data)"
						class="data-import__cell-error"
					>
						{{ blocks.file.error }}
					</div>
				</div>

				<div
					v-if="isImporting && !isEmpty(blocks.file.data)"
					class="data-import__cell-loader"
				>
					<FmProgressCircular indeterminate size="120" />
				</div>
			</div>

			<div class="data-import__cell">
				<div
					class="data-import__cell-header"
					@click="toggleBlocks('json')"
				>
					<FmIcon
						:icon="
							blocks.json.show
								? 'mdi-menu-down'
								: 'mdi-menu-right'
						"
						color="var(--on-surface-variant)"
					/>
					Paste JSON for import
				</div>

				<div
					v-show="blocks.json.show"
					:class="[
						'data-import__cell-body',
						'data-import__cell-editor',
						{ 'data-import__cell-body--hidden': !blocks.json.show }
					]"
				>
					<!--					v-model:value="blocks.json.data"-->
					<VAceEditor
						:value="jsonData"
						lang="json"
						theme="monokai"
						:disabled="disabled || isImporting"
						class="data-import__cell-input"
						@init="_onEditorInit"
						@update:value="onJsonUpdate"
					/>

					<div
						v-if="blocks.json.error && isEmpty(blocks.json.data)"
						class="data-import__cell-error"
					>
						{{ blocks.json.error }}
					</div>
				</div>

				<div
					v-if="isImporting && !isEmpty(blocks.json.data)"
					class="data-import__cell-loader"
				>
					<FmProgressCircular indeterminate size="120" />
				</div>
			</div>
		</div>

		<div class="data-import__data-info">
			<template v-if="!isEmpty(blocks.file.data)">
				<b>You have selected the file: </b>
				<span>{{ blocks.file.data[0]?.name }}</span>
			</template>

			<template v-if="!isEmpty(blocks.json.data)">
				<b>You have pasted the JSON data to import</b>
			</template>
		</div>

		<FmButton
			rounded
			:disabled="importButtonDisabled"
			@click.prevent.stop="startImport"
		>
			Import
		</FmButton>

		<div v-if="isImporting" class="data-import__progress">
			<div class="data-import__progress-text">
				Progress
				<span>{{ progress }}</span>
			</div>

			<FmProgressLinear :model-value="process.progress.percent" />

			<div class="data-import__progress-text">
				<span>Status: {{ process.progress.description }}</span>
			</div>
		</div>

		<DataImportResult
			v-if="hasImportDone"
			:import-status="process.status"
			:attachments="attachmentsFiles"
		/>
	</section>
</template>

<script setup>
	import { computed, nextTick, onBeforeUnmount, ref } from 'vue';
	import isEmpty from 'lodash/isEmpty';
	import {
		FmButton,
		FmIcon,
		FmProgressCircular,
		FmProgressLinear
	} from '@finmars/ui';
	import useAceEditor from '@/composables/useAceEditor';
	import useApi from '~/composables/useApi';
	import useNotify from '~/composables/useNotify';
	import FmInputFiles from '@/components/Fm/InputFiles/InputFiles.vue';
	import DataImportResult from '@/components/common/DataImportResult.vue';
	import { wrapperStringify } from './utils';

	const props = defineProps({
		schemeId: {
			type: Number
		},
		apiUrl: {
			type: String
		},
		disabled: {
			type: Boolean
		}
	});

	const emits = defineEmits(['update:importingFlag', 'complete:import']);

	const { VAceEditor, onEditorInit } = useAceEditor();

	const isImporting = ref(false);
	const hasImportDone = ref(false);
	const blocks = ref({
		file: {
			show: true,
			data: [],
			error: ''
		},
		json: {
			show: false,
			data: null,
			error: ''
		}
	});
	const jsonData = ref(wrapperStringify(''));
	const aceEditor = ref();
	const process = ref({
		taskId: null,
		status: null,
		progress: {
			current: 0,
			description: '',
			percent: 0,
			total: 0
		}
	});
	const poolingInterval = ref(null);
	const attachmentsFiles = ref([]);

	const importButtonDisabled = computed(
		() =>
			(isEmpty(blocks.value.file.data) &&
				isEmpty(blocks.value.json.data)) ||
			(!!blocks.value.file.error && isEmpty(blocks.value.file.data)) ||
			!props.schemeId ||
			isImporting.value
	);

	const progress = computed(() => {
		if (!process.value.progress.current || !process.value.progress.total) {
			return '';
		}

		return `${process.value.progress.current} / ${process.value.progress.total}`;
	});

	function toggleBlocks(block) {
		if (
			blocks.value[block].show ||
			props.isProcessing ||
			isImporting.value
		) {
			return;
		}

		const hiddenBlock = block === 'file' ? 'json' : 'file';
		blocks.value[block].show = true;
		blocks.value[block].data = block === 'file' ? [] : null;
		blocks.value[block].error = '';
		blocks.value[hiddenBlock].show = false;
		blocks.value[hiddenBlock].data = hiddenBlock === 'file' ? [] : null;
		blocks.value[hiddenBlock].error = '';
		if (hiddenBlock === 'json') {
			jsonData.value = '';
		}
		if (hiddenBlock === 'file') {
			nextTick(() => {
				aceEditor.value.focus();
			});
		}
	}

	function onPaste(value) {
		try {
			jsonData.value = wrapperStringify('');
			nextTick(() => {
				const data = wrapperStringify(JSON.parse(value.text));
				jsonData.value = data;
			});
		} catch (e) {
			jsonData.value = value.text.replaceAll('\n', '');
		}
	}

	function onJsonUpdate(val) {
		blocks.value.json.error = '';
		if (!val) {
			blocks.value.json.data = '';
			jsonData.value = wrapperStringify('');
			return;
		}
		try {
			blocks.value.json.data = JSON.parse(val);
		} catch (e) {
			blocks.value.json.data = null;
			blocks.value.json.error = 'This is erroneous JSON.';
			console.warn('This is erroneous JSON. ', e);
		}
	}

	function _onEditorInit(editor) {
		aceEditor.value = editor;
		editor.getSession().setUseWorker(false);
		editor.setOptions({
			enableBasicAutocompletion: true,
			enableSnippets: true
		});
		onEditorInit(editor);
		aceEditor.value.setValue(blocks.value.json.data);

		aceEditor.value.on('paste', onPaste);
	}

	async function getActiveProcessInfo() {
		try {
			const res = await useApi('activeProcesses.get', {
				params: { id: process.value.taskId }
			});
			if (res) {
				process.value.status = res.status;
				res.progress_object &&
					(process.value.progress = res.progress_object);

				if (['D', 'E'].includes(res.status)) {
					clearInterval(poolingInterval.value);
					poolingInterval.value = null;
					hasImportDone.value = true;
					emits('complete:import');
					blocks.value = {
						file: {
							show: false,
							data: [],
							error: ''
						},
						json: {
							show: false,
							data: null,
							error: ''
						}
					};
					jsonData.value = wrapperStringify('');

					attachmentsFiles.value =
						res.status === 'D'
							? res.attachments
							: [
									{
										file_report_object: {
											name: `Result (Task ${res.id})`,
											content_type_verbose: 'json',
											info: res.result_object ?? {}
										}
									}
								];
					isImporting.value = false;
					emits('update:importingFlag', false);
				}
			}
		} catch (e) {
			isImporting.value = false;
			emits('update:importingFlag', false);
			console.error(
				'The error getting information about active process. ',
				e
			);
			useNotify({
				type: 'error',
				title: 'The error getting information about active process.',
				text: e.message
			});
		}
	}

	async function startImport() {
		if (
			(isEmpty(blocks.value.file.data) &&
				isEmpty(blocks.value.json.data)) ||
			(!!blocks.value.file.error && isEmpty(blocks.value.file.data)) ||
			!props.schemeId ||
			!props.apiUrl
		) {
			return;
		}

		try {
			isImporting.value = true;
			emits('update:importingFlag', true);
			hasImportDone.value = false;
			attachmentsFiles.value = [];
			process.value.status = null;
			process.value.progress = {
				current: 0,
				description: '',
				percent: 0,
				total: 0
			};

			const file = isEmpty(blocks.value.file.data)
				? new Blob([wrapperStringify(blocks.value.json.data)], {
						type: 'application/json'
					})
				: blocks.value.file.data[0];

			const formData = new FormData();
			formData.append('scheme', props.schemeId);
			formData.append('file', file, file.name || 'input.json');

			const res = await useApi(props.apiUrl, { body: formData });
			res && (process.value.taskId = res.task_id);

			getActiveProcessInfo();

			poolingInterval.value = setInterval(() => {
				getActiveProcessInfo();
			}, 1000);
		} catch (e) {
			isImporting.value = false;
			emits('update:importingFlag', false);
			console.error('The transaction import error. ', e);
			useNotify({
				type: 'error',
				title: 'The transaction import error.',
				text: e.message
			});
		}
	}

	onBeforeUnmount(() => {
		aceEditor.value.off('paste', onPaste);

		if (poolingInterval.value) {
			clearInterval(poolingInterval.value);
			poolingInterval.value = null;
		}
	});
</script>

<style lang="scss">
	.data-import {
		position: relative;
		width: 100%;

		&__row {
			width: 100%;
			display: flex;
			justify-content: flex-start;
			align-items: flex-start;
			column-gap: 16px;
			margin-bottom: 16px;
		}

		&__cell {
			position: relative;
			width: calc(50% - 8px);

			&-header {
				display: flex;
				justify-content: flex-start;
				align-items: center;
				column-gap: 8px;
				cursor: pointer;
				font-size: 16px;
				font-weight: 600;
				line-height: 24px;
				color: var(--on-surface);
				margin-bottom: 8px;
			}

			&-body {
				position: relative;
				width: 100%;
				aspect-ratio: 4/3;
				border-radius: 4px;
				padding-bottom: 24px;
				opacity: 1;
				transition: all 0.4s ease-in-out;

				&--hidden {
					opacity: 0;
				}
			}

			&-editor {
				padding: 11px 11px 36px 11px;
			}

			&-input {
				--fmInputFiles-border-radius: 12px !important;

				position: relative;
				width: 100%;
				height: 100%;
				border-radius: 12px;
			}

			&-error {
				position: absolute;
				left: 0;
				bottom: 0;
				width: 100%;
				height: 24px;
				display: flex;
				justify-content: flex-start;
				align-items: center;
				padding: 0 8px;
				font: var(--body-large-font);
				color: var(--error);
			}

			&-loader {
				position: absolute;
				inset: 0;
				background-color: rgba(0, 0, 0, 0.2);
				display: flex;
				justify-content: center;
				align-items: center;
				z-index: 10;
			}
		}

		&__data-info {
			font: var(--body-large-font);
			margin-bottom: 24px;
		}

		&__progress {
			position: relative;
			width: 100%;
			padding: 16px 0;

			&-text {
				display: flex;
				justify-content: space-between;
				align-items: center;
				font-size: 16px;
				font-weight: 500;
				line-height: 32px;
			}
		}
	}
</style>
