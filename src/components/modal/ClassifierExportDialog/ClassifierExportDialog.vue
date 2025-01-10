<template>
	<section class="classifier-export-dialog__wrapper">
		<div class="classifier-export-dialog">
			<div class="classifier-export-dialog__header">
				<span>Export Classifier</span>

				<FmIconButton
					icon="mdi-close"
					variant="text"
					@click.stop.prevent="emits('close', false)"
				/>
			</div>

			<div class="classifier-export-dialog__body">
				<FmTextField
					v-model="fileName"
					outlined
					compact
					label="File Name"
					hide-details
					:disabled="isProcessing"
				/>
			</div>

			<div class="classifier-export-dialog__actions">
				<FmButton type="secondary" rounded @click.stop.prevent="emits('close')">
					Close
				</FmButton>

				<FmButton
					rounded
					:disabled="isProcessing"
					@click.stop.prevent="runExport"
				>
					Export
				</FmButton>
			</div>

			<div v-if="isProcessing" class="classifier-export-dialog__loader">
				<FmProgressCircular indeterminate size="80" />
			</div>
		</div>
	</section>
</template>

<script setup>
	import { onBeforeMount, ref } from 'vue';
	import {
		FmButton,
		FmIconButton,
		FmProgressCircular,
		FmTextField
	} from '@finmars/ui';
	import { getByKey } from '~/services/attributeTypeService';
	import { capitalizeFirstLetter, downloadFile } from '~/utils/commonHelper';

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
	const fileName = ref('');
	const classifier = ref();

	async function runExport() {
		try {
			isProcessing.value = true;

			const entityTypeBeauty = capitalizeFirstLetter(
				props.entityType.replaceAll('-', ' ')
			);
			let text = `User Attribute for ${entityTypeBeauty}: ${props.item.user_code} (${props.item.name})\n`;
			(classifier.value?.classifiers || []).forEach((c) => {
				text = `${text}${c.name}\n`;
			});
			const downloadFileName = fileName.value
				? `${fileName.value}.csv`
				: 'classifiers.csv';

			downloadFile(text, 'text/plain', downloadFileName);

			emits('close');
		} finally {
			isProcessing.value = false;
		}
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
	.classifier-export-dialog__wrapper {
		position: fixed;
		inset: 0;
		background-color: rgba(0, 0, 0, 0.2);
		display: flex;
		justify-content: center;
		align-items: center;
		z-index: 1000;
	}

	.classifier-export-dialog {
		position: relative;
		width: 360px;
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
