<template>
	<section class="classifier-import-dialog__wrapper">
		<div class="classifier-import-dialog">
			<div class="classifier-import-dialog__header">
				<span>Import Classifier</span>

				<FmIconButton
					icon="mdi-close"
					variant="text"
					@click.stop.prevent="emits('close', false)"
				/>
			</div>

			<div class="classifier-import-dialog__body">
				<div class="classifier-import-dialog__content">
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
							'classifier-import-dialog__info',
							{ 'classifier-import-dialog__info--error': !!errorMessage }
						]"
					>
						{{ infoText || errorMessage }}
					</div>
				</div>

				<FmSelect
					v-model="mode"
					:options="MODE_OPTIONS"
					variant="outlined"
					label="Mode"
				/>
			</div>

			<div class="classifier-import-dialog__actions">
				<FmButton type="secondary" rounded @click.stop.prevent="emits('close')">
					Close
				</FmButton>

				<FmButton
					rounded
					:disabled="isProcessing || !!errorMessage"
					@click.stop.prevent="runImport"
				>
					Export
				</FmButton>
			</div>

			<div v-if="isProcessing" class="classifier-import-dialog__loader">
				<FmProgressCircular indeterminate size="80" />
			</div>
		</div>
	</section>
</template>

<script setup>
	import { onBeforeMount, ref } from 'vue';
	import size from 'lodash/size';
	import {
		FmButton,
		FmIconButton,
		FmProgressCircular,
		FmSelect
	} from '@finmars/ui';
	import useNotify from '~/composables/useNotify';
	import { getByKey, update } from '~/services/attributeTypeService';
	import FmInputFiles from '~/components/Fm/InputFiles/InputFiles.vue';
	import { MODE_OPTIONS } from './constants';

	const props = defineProps({
		entityType: {
			type: String
		},
		item: {
			type: Object,
			default: () => ({})
		}
	});

	const emits = defineEmits(['close']);

	const isProcessing = ref(false);
	const mode = ref('skip');
	const file = ref([]);
	const classifier = ref();

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
		const allCurrentClassifiersNames = (classifier.value.classifiers || []).map(
			(c) => c.name
		);
		data.forEach((line) => {
			if (!allCurrentClassifiersNames.includes(line)) {
				classifier.value.classifiers.push({ name: line });
			}
		});
		await updateClassifier();
	}

	async function processDataIfOverwrite(data = []) {
		try {
			isProcessing.value = true;
			classifier.value.classifiers = [];
			classifier.value.classifiers_flat = [];
			await update(props.entityType, classifier.value);
			classifier.value.classifiers = data.map((line) => ({ name: line }));
			await updateClassifier();
		} finally {
			isProcessing.value = false;
		}
	}

	async function updateClassifier() {
		try {
			isProcessing.value = true;
			await update(props.entityType, classifier.value);

			useNotify({
				type: 'success',
				title: 'You are successfully import classifiers.'
			});
			emits('close', true);
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

		console.info('Importing ...');
		const reader = new FileReader();
		reader.onload = (evt) => prepareFile(evt);
		reader.readAsText(file.value[0]);
	}

	onBeforeMount(async () => {
		try {
			isProcessing.value = true;
			classifier.value = await getByKey(props.entityType, props.item.id);
		} finally {
			isProcessing.value = false;
		}
	});
</script>

<style lang="scss" scoped>
	.classifier-import-dialog__wrapper {
		position: fixed;
		inset: 0;
		background-color: rgba(0, 0, 0, 0.2);
		display: flex;
		justify-content: center;
		align-items: center;
		z-index: 1000;
	}

	.classifier-import-dialog {
		position: relative;
		width: 480px;
		border-radius: 24px;
		background-color: var(--surface);
		box-shadow:
			0 1px 3px 0 rgba(0, 0, 0, 0.3),
			0 4px 8px 3px rgba(0, 0, 0, 0.15);

		&__header {
			position: relative;
			display: flex;
			width: 100%;
			height: 64px;
			padding: 0 24px;
			justify-content: space-between;
			align-items: center;
			border-bottom: 1px solid var(--outline-variant);
			font-size: 18px;
			font-weight: 600;
			line-height: 24px;
		}

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
