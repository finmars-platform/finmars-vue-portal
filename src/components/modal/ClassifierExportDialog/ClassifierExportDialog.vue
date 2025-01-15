<template>
	<div class="classifier-export-dialog">
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
</template>

<script setup>
	import { onBeforeMount, ref } from 'vue';
	import { FmButton, FmProgressCircular, FmTextField } from '@finmars/ui';
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
	.classifier-export-dialog {
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

		&__actions {
			position: relative;
			width: 100%;
			height: 64px;
			padding: 0 24px;
			display: flex;
			justify-content: space-between;
			align-items: center;

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
