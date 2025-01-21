<template>
	<div class="reference-table-import-dialog">
		<div class="reference-table-import-dialog__body">
			<div class="reference-table-import-dialog__content">
				<FmInputFiles
					v-model="file"
					info-text="You can select the CSV file"
					allowed-file-types=".csv"
					:disabled="isProcessing"
					@update:model-value="onLoad"
					@error="onError"
				/>

				<div
					v-if="infoText || errorMessage"
					:class="[
						'reference-table-import-dialog__info',
						{
							'reference-table-import-dialog__info--error':
								!!errorMessage
						}
					]"
				>
					{{ infoText || errorMessage }}
				</div>
			</div>

			<FmSelect
				v-model="mode"
				:options="IMPORT_MODE_OPTIONS"
				variant="outlined"
				label="Mode"
			/>
		</div>

		<div class="reference-table-import-dialog__actions">
			<FmButton
				type="secondary"
				rounded
				@click.stop.prevent="emits('close')"
			>
				Close
			</FmButton>

			<FmButton
				rounded
				:disabled="isProcessing || !!errorMessage"
				@click.stop.prevent="runImport"
			>
				Import
			</FmButton>
		</div>

		<div v-if="isProcessing" class="reference-table-import-dialog__loader">
			<FmProgressCircular indeterminate size="80" />
		</div>
	</div>
</template>

<script setup>
	import { onBeforeMount, ref } from 'vue';
	import size from 'lodash/size';
	import { FmButton, FmProgressCircular, FmSelect } from '@finmars/ui';
	import useNotify from '~/composables/useNotify';
	import { getByKey, update } from '~/services/referenceTablesService';
	import FmInputFiles from '~/components/Fm/InputFiles/InputFiles.vue';
	import { IMPORT_MODE_OPTIONS } from '~/constants';

	const props = defineProps({
		item: {
			type: Object,
			default: () => ({})
		}
	});

	const emits = defineEmits(['close', 'confirm']);

	const isProcessing = ref(false);
	const mode = ref('skip');
	const file = ref([]);
	const referenceTable = ref();

	const errorMessage = ref(null);
	const infoText = ref('');

	function onLoad(val) {
		const { name } = val[0];
		errorMessage.value = null;
		infoText.value = `The file "${name}" was selected.`;
	}

	function onError(err) {
		infoText.value = null;
		errorMessage.value = err;
	}

	function prepareFile(evt) {
		try {
			const processedFile = evt.target.result;
			const lines = processedFile.split(/\r\n|\n|\r/);
			lines.splice(0, 1);

			if (mode.value === 'skip') {
				processDataIfSkip(lines);
			} else {
				processDataIfOverwrite(lines);
			}
		} catch (error) {
			useNotify({
				type: 'error',
				title: 'Unable to read it. This file is corrupted.'
			});
			console.error(error);
		}
	}

	async function processDataIfSkip(data = []) {
		const allCurrentKeys = (referenceTable.value.rows || []).map(
			(r) => r.key
		);
		data.forEach((line) => {
			const [lineKey, lineValue] = line.split(',');

			if (!allCurrentKeys.includes(lineKey)) {
				referenceTable.value.rows?.push({
					key: lineKey,
					value: lineValue
				});
			}
		});

		const updatedTable = {
			...referenceTable.value,
			rows: (referenceTable.value.rows || []).filter(
				(r) => !!r.key && !!r.value
			)
		};
		await updateTable(updatedTable);
	}

	async function processDataIfOverwrite(data = []) {
		const rows = [];
		data.forEach((line) => {
			const [lineKey, lineValue] = line.split(',');
			rows.push({
				key: lineKey,
				value: lineValue
			});
		});

		const updatedTable = {
			...referenceTable.value,
			rows: rows.filter((r) => !!r.key && !!r.value)
		};
		await updateTable(updatedTable);
	}

	async function updateTable(updatedData) {
		try {
			isProcessing.value = true;
			await update(updatedData);

			useNotify({
				type: 'success',
				title: 'You are successfully import Reference Table.'
			});
			emits('confirm');
		} catch (err) {
			useNotify({
				type: 'error',
				title: 'Unable to read it. This file is corrupted.'
			});
			console.error(err);
		} finally {
			isProcessing.value = false;
		}
	}

	function runImport() {
		if (size(file.value) !== 1) {
			return;
		}

		const reader = new FileReader();
		reader.onload = (evt) => prepareFile(evt);
		reader.readAsText(file.value[0]);
	}

	onBeforeMount(async () => {
		try {
			isProcessing.value = true;
			referenceTable.value = await getByKey(props.item.id);
		} finally {
			isProcessing.value = false;
		}
	});
</script>

<style lang="scss" scoped>
	.reference-table-import-dialog {
		position: relative;
		width: 100%;
		border-radius: 24px;

		&__body {
			position: relative;
			width: 100%;
			padding: 24px;
			font: var(--body-large-font);
			color: var(--on-surface);
		}

		&__content {
			position: relative;
			width: 100%;
			aspect-ratio: 4/3;
			border-radius: 4px;
			opacity: 1;
			transition: all 0.4s ease-in-out;
			padding-bottom: 24px;
			margin-bottom: 16px;
		}

		&__info {
			position: absolute;
			left: 0;
			width: 100%;
			bottom: 0;
			height: 24px;
			padding: 0 12px;
			display: flex;
			justify-content: flex-start;
			align-items: center;
			font-size: 16px;
			font-weight: 600;
			color: var(--on-surface);

			&--error {
				color: var(--error);
			}
		}

		&__actions {
			position: relative;
			width: 100%;
			height: 64px;
			padding: 0 24px;
			display: flex;
			justify-content: space-between;
			align-items: center;
			border-top: 1px solid var(--outline-variant);

			button {
				text-transform: none;
			}
		}

		&__loader {
			position: absolute;
			inset: 0;
			z-index: 5;
			pointer-events: none;
			display: flex;
			justify-content: center;
			align-items: center;
		}
	}
</style>
