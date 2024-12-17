<template>
	<section class="transaction-import-page">
		<div class="transaction-import-page__header">
			<FmSearch
				v-model="selectedTransactionScheme"
				placeholder="Select import scheme"
				width="320"
				hide-details
				return-object
				prepend-inner-icon=""
				:loading="isSchemeListLoading"
				:items="transactionSchemeList"
				:disabled="isImporting"
				class="transaction-import-page__schemes"
			/>

			<FmIconButton
				icon="mdi-developer-board"
				:disabled="schemeEditButtonDisabled"
				@click.stop.prevent="isSchemeEditorOpen = true"
			>
				<FmTooltip activator="parent" type="secondary" location="top">
					Edit scheme
				</FmTooltip>
			</FmIconButton>
		</div>

		<div class="transaction-import-page__row">
			<div class="transaction-import-page__cell">
				<div
					class="transaction-import-page__cell-header"
					@click="toggleBlocks('file')"
				>
					<FmIcon
						:icon="blocks.file.show ? 'mdi-menu-down' : 'mdi-menu-right'"
						color="var(--on-surface-variant)"
					/>
					Select a file for import
				</div>

				<div
					v-show="blocks.file.show"
					:class="[
						'transaction-import-page__cell-body',
						{ 'transaction-import-page__cell-body--hidden': !blocks.file.show }
					]"
				>
					<FmInputFiles
						v-model="blocks.file.data"
						info-text="You can select the CSV or XLS/XLSX file"
						allowed-file-types=".csv,.xls,.xlsx"
						class="transaction-import-page__cell-input"
						:disabled="isImporting"
					/>
				</div>

				<div
					v-if="isImporting && !isEmpty(blocks.file.data)"
					class="transaction-import-page__cell-loader"
				>
					<FmProgressCircular indeterminate size="120" />
				</div>
			</div>

			<div class="transaction-import-page__cell">
				<div
					class="transaction-import-page__cell-header"
					@click="toggleBlocks('json')"
				>
					<FmIcon
						:icon="blocks.json.show ? 'mdi-menu-down' : 'mdi-menu-right'"
						color="var(--on-surface-variant)"
					/>
					Paste JSON for import
				</div>

				<div
					v-show="blocks.json.show"
					:class="[
						'transaction-import-page__cell-body',
						'transaction-import-page__cell-editor',
						{ 'transaction-import-page__cell-body--hidden': !blocks.json.show }
					]"
				>
					<VAceEditor
						v-model="blocks.json.data"
						lang="json"
						theme="monokai"
						:disabled="isImporting"
						class="transaction-import-page__cell-input"
						@init="_onEditorInit"
					/>
				</div>

				<div
					v-if="isImporting && !isEmpty(blocks.json.data)"
					class="transaction-import-page__cell-loader"
				>
					<FmProgressCircular indeterminate size="120" />
				</div>
			</div>
		</div>

		<div class="transaction-import-page__data-info">
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

		<div v-if="isImporting" class="transaction-import-page__progress">
			<div class="transaction-import-page__progress-text">
				Progress
				<span>{{ progress }}</span>
			</div>

			<FmProgressLinear :model-value="process.progress.percent" />

			<div class="transaction-import-page__progress-text">
				<span>Status: {{ process.progress.description }}</span>
			</div>
		</div>

		<TransactionImportResult
			v-if="hasImportDone"
			:import-status="process.status"
			:attachments="attachmentsFiles"
		/>

		<TransactionImportScheme
			v-if="isSchemeEditorOpen"
			:scheme-id="selectedTransactionScheme?.id"
			:initial-scheme="copiedScheme"
			@close="closeSchemeEditor"
			@copy="makeSchemeCopy"
		/>
	</section>
</template>

<script setup>
	import { computed, nextTick, onBeforeMount, ref } from 'vue';
	import isEmpty from 'lodash/isEmpty';
	import omit from 'lodash/omit';
	import {
		FmButton,
		FmIcon,
		FmIconButton,
		FmProgressCircular,
		FmProgressLinear,
		FmSearch,
		FmTooltip
	} from '@finmars/ui';
	import useApi from '@/composables/useApi';
	import useAceEditor from '@/composables/useAceEditor';
	import useNotify from '~/composables/useNotify';
	import FmInputFiles from '@/components/Fm/InputFiles/InputFiles.vue';
	import TransactionImportResult from '@/components/pages/transaction-import/TransactionImportResult.vue';
	import TransactionImportScheme from '@/components/modal/TransactionImportScheme/TransactionImportScheme.vue';

	const { VAceEditor, onEditorInit } = useAceEditor();

	const isSchemeListLoading = ref(false);
	const isImporting = ref(false);
	const hasImportDone = ref(false);
	const transactionSchemeList = ref([]);
	const selectedTransactionScheme = ref(null);
	const blocks = ref({
		file: {
			show: true,
			data: []
		},
		json: {
			show: false,
			data: []
		}
	});
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

	const isSchemeEditorOpen = ref(false);
	const copiedScheme = ref({});

	const schemeEditButtonDisabled = computed(
		() =>
			isSchemeListLoading.value ||
			isImporting.value ||
			!selectedTransactionScheme.value
	);

	const importButtonDisabled = computed(
		() =>
			(isEmpty(blocks.value.file.data) && isEmpty(blocks.value.json.data)) ||
			!selectedTransactionScheme.value ||
			isImporting.value
	);

	const progress = computed(() => {
		if (!process.value.progress.current || !process.value.progress.total) {
			return '';
		}

		return `${process.value.progress.current} / ${process.value.progress.total}`;
	});

	const userCodesOfExistingTransactionImportSchemes = computed(() =>
		transactionSchemeList.value.map((s) => s.user_code)
	);

	async function getTransactionSchemeList() {
		try {
			isSchemeListLoading.value = true;
			const data = await useApi('importSchemeLight.get');
			transactionSchemeList.value =
				data?.results.map((r) => ({
					...r,
					title: r.name
				})) || [];
		} catch (e) {
			console.error('The transaction scheme list loading error. ', e);
		} finally {
			isSchemeListLoading.value = false;
		}
	}

	function toggleBlocks(block) {
		if (blocks.value[block].show || isImporting.value) {
			return;
		}

		const hiddenBlock = block === 'file' ? 'json' : 'file';
		blocks.value[block].show = true;
		blocks.value[block].data = [];
		blocks.value[hiddenBlock].show = false;
		blocks.value[hiddenBlock].data = [];
	}

	function onPaste(value) {
		blocks.value.json.data = value.text.replaceAll('\n', '');
	}

	function _onEditorInit(editor) {
		aceEditor.value = editor;
		editor.getSession().setUseWorker(false);
		editor.setOptions({
			enableBasicAutocompletion: true,
			enableSnippets: true
		});
		onEditorInit(editor);

		editor.on('paste', onPaste);
	}

	async function getActiveProcessInfo() {
		try {
			const res = await useApi('activeProcesses.get', {
				params: { id: process.value.taskId }
			});
			if (res) {
				process.value.status = res.status;
				process.value.progress = res.progress_object;

				if (['D', 'E'].includes(res.status)) {
					clearInterval(poolingInterval.value);
					poolingInterval.value = null;
					hasImportDone.value = true;
					selectedTransactionScheme.value = null;
					blocks.value = {
						file: {
							show: false,
							data: []
						},
						json: {
							show: false,
							data: []
						}
					};
					attachmentsFiles.value = res.attachments;
					isImporting.value = false;
				}
			}
		} catch (e) {
			isImporting.value = false;
			console.error('The error getting information about active process. ', e);
			useNotify({
				type: 'error',
				title: 'The error getting information about active process.',
				text: e.message
			});
		}
	}

	async function startImport() {
		if (isEmpty(blocks.value.file.data) && isEmpty(blocks.value.json.data)) {
			return;
		}

		try {
			isImporting.value = true;
			process.value.status = null;
			process.value.progress = {
				current: 0,
				description: '',
				percent: 0,
				total: 0
			};

			const file = isEmpty(blocks.value.file.data)
				? new Blob([JSON.stringify(JSON.parse(blocks.value.json.data))], {
						type: 'application/json'
					})
				: blocks.value.file.data[0];

			const formData = new FormData();
			formData.append('scheme', selectedTransactionScheme.value.id);
			formData.append('file', file, file.name || 'input.json');

			const res = await useApi('transactionImport.post', { body: formData });
			res && (process.value.taskId = res.task_id);

			getActiveProcessInfo();

			poolingInterval.value = setInterval(() => {
				getActiveProcessInfo();
			}, 1000);
		} catch (e) {
			isImporting.value = false;
			console.error('The transaction import error. ', e);
			useNotify({
				type: 'error',
				title: 'The transaction import error.',
				text: e.message
			});
		}
	}

	function closeSchemeEditor(shouldRefresh) {
		isSchemeEditorOpen.value = false;
		if (shouldRefresh) {
			getTransactionSchemeList();
			selectedTransactionScheme.value = null;
		}
	}

	function createUserCodeForCopiedScheme(oldUserCode) {
		let isUserCodeUnique = false;
		let newUserCode = oldUserCode;
		while (!isUserCodeUnique) {
			newUserCode = `${newUserCode}_copy`;
			if (
				!userCodesOfExistingTransactionImportSchemes.value.includes(newUserCode)
			) {
				isUserCodeUnique = true;
			}
		}
		return newUserCode;
	}

	function makeSchemeCopy(scheme) {
		isSchemeEditorOpen.value = false;
		selectedTransactionScheme.value = null;
		nextTick(() => {
			setTimeout(() => {
				copiedScheme.value = omit(scheme, 'id');
				copiedScheme.value.user_code = createUserCodeForCopiedScheme(
					copiedScheme.value.user_code
				);
				copiedScheme.value.inputs.forEach((i) => delete i.id);
				copiedScheme.value.calculated_inputs.forEach((i) => delete i.id);
				copiedScheme.value.rule_scenarios.forEach((i) => delete i.id);
				isSchemeEditorOpen.value = true;
			}, 500);
		});
	}

	onBeforeMount(async () => {
		await getTransactionSchemeList();
	});

	onBeforeUnmount(() => {
		aceEditor.value.off('paste', onPaste);
	});
</script>

<style lang="scss" scoped>
	.transaction-import-page {
		position: relative;
		width: 100%;
		height: 100%;
		padding: 24px;

		&__header {
			display: flex;
			justify-content: flex-start;
			align-items: center;
			column-gap: 16px;
			margin-bottom: 16px;
		}

		&__schemes {
			max-width: 320px;

			:deep(.v-input__control) {
				.v-field.v-field--rounded {
					border-radius: 4px;
				}
			}
		}

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
				opacity: 1;
				transition: all 0.4s ease-in-out;

				&--hidden {
					opacity: 0;
				}
			}

			&-editor {
				padding: 11px;
			}

			&-input {
				--fmInputFiles-border-radius: 12px !important;

				position: relative;
				width: 100%;
				height: 100%;
				border-radius: 12px;
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
			font-size: 16px;
			line-height: 24px;
			margin-bottom: 16px;
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
