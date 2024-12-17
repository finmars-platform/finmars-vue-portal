<template>
	<div class="transaction-import-result">
		<div class="transaction-import-result__icon">
			<FmIcon
				:icon="importStatus === 'D' ? 'mdi-check-circle' : 'mdi-alert-circle'"
				:color="importStatus === 'D' ? '#02a471' : 'var(--error)'"
				size="80"
			/>

			{{ importStatus === 'D' ? 'Success' : 'Error' }}
		</div>

		<div
			v-if="!isEmpty(attachments)"
			class="transaction-import-result__attachments"
		>
			<span
				v-for="(item, index) in attachments"
				:key="index"
				class="transaction-import-result__attachment"
				@click.stop.prevent="openPreviewFile(item)"
			>
				{{ item.file_report_object?.name }}
			</span>
		</div>

		<FilePreview
			v-if="previewFileModal.open"
			:file="previewFileModal.file"
			@close="previewFileModal = { open: false, file: null }"
		/>
	</div>
</template>

<script setup>
	import { ref } from 'vue';
	import isEmpty from 'lodash/isEmpty';
	import { FmIcon } from '@finmars/ui';
	import FilePreview from '../FilePreview.vue';

	defineProps({
		importStatus: {
			type: String,
			required: true,
			validator(value) {
				return ['D', 'E'].includes(value);
			}
		},
		attachments: {
			type: Array,
			default: () => []
		}
	});

	const previewFileModal = ref({
		open: false,
		file: null
	});

	function openPreviewFile(item) {
		previewFileModal.value = {
			open: true,
			file: item.file_report_object
		};
	}
</script>

<style lang="scss" scoped>
	.transaction-import-result {
		position: relative;

		&__icon {
			display: flex;
			flex-direction: column;
			width: 100%;
			justify-content: center;
			align-items: center;
			row-gap: 4px;
			font-size: 16px;
			font-weight: 500;
			line-height: 20px;
			margin-bottom: 16px;
		}

		&__attachments {
			display: flex;
			width: max-content;
			flex-direction: column;
			justify-content: flex-start;
			align-items: flex-start;
		}

		&__attachment {
			position: relative;
			width: 100%;
			font-size: 16px;
			line-height: 24px;
			cursor: pointer;
			padding: 4px 8px;
			border-radius: 2px;

			&:hover {
				background-color: var(--primary-container);
			}
		}
	}
</style>
