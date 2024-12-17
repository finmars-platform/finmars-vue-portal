<template>
	<section class="simple-import-page">
		<div class="simple-import-page__row">
			<FmSearch
				v-model="selectedEntity"
				placeholder="Entity"
				width="320"
				hide-details
				return-object
				prepend-inner-icon=""
				item-title="name"
				item-value="key"
				:loading="isLoading"
				:items="ENTITY_LIST"
				:disabled="isLoading"
				class="simple-import-page__select"
			/>
		</div>

		<div class="simple-import-page__row">
			<FmSearch
				v-model="selectedImportScheme"
				placeholder="Import scheme"
				width="320"
				hide-details
				return-object
				prepend-inner-icon=""
				:loading="isLoading"
				:items="[]"
				:disabled="isLoading"
				class="simple-import-page__select"
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
	</section>
</template>

<script setup>
	import { computed, onBeforeMount, ref } from 'vue';
	import { FmIconButton, FmSearch, FmTooltip } from '@finmars/ui';
	import { ENTITY_LIST } from './constants';

	const isLoading = ref(false);
	const selectedEntity = ref(null);
	const selectedImportScheme = ref(null);

	const isSchemeEditorOpen = ref(false);

	const schemeEditButtonDisabled = computed(
		() => isLoading.value || !selectedImportScheme.value
	);

	async function getData() {}

	onBeforeMount(async () => {
		await getData();
	});
</script>

<style lang="scss" scoped>
	.simple-import-page {
		position: relative;
		width: 100%;
		height: 100%;
		padding: 24px;

		&__row {
			display: flex;
			justify-content: flex-start;
			align-items: center;
			column-gap: 16px;
			margin-bottom: 16px;
		}

		&__select {
			max-width: 320px;

			:deep(.v-input__control) {
				.v-field.v-field--rounded {
					border-radius: 4px;
				}
			}
		}
	}
</style>
