<template>
	<section class="simple-import-page">
		<div class="simple-import-page__row">
			<FmSearch
				v-model="selectedEntity"
				label="Entity"
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
				@update:model-value="onEntitySelect"
			/>
		</div>

		<div class="simple-import-page__row">
			<FmSearch
				v-model="selectedImportScheme"
				label="Import scheme"
				width="320"
				hide-details
				return-object
				prepend-inner-icon=""
				item-title="name"
				item-value="id"
				:loading="isLoading"
				:items="schemes"
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

		<DataImportByScheme
			:scheme-id="selectedImportScheme?.id"
			api-url="simpleImport.post"
			:disabled="isLoading"
			@update:importing-flag="isImporting = $event"
			@complete:import="onImportComplete"
		/>

		<SimpleImportScheme
			v-if="isSchemeEditorOpen"
			:scheme-id="selectedImportScheme?.id"
			:initial-scheme="{}"
			@close="closeSchemeEditor"
		/>
	</section>
</template>

<script setup>
	import { computed, onBeforeMount, ref } from 'vue';
	import { FmIconButton, FmSearch, FmTooltip } from '@finmars/ui';
	import useApi from '@/composables/useApi';
	import { ENTITY_LIST } from './constants';
	import DataImportByScheme from '~/components/common/DataImportByScheme/DataImportByScheme.vue';
	import SimpleImportScheme from '~/components/modal/importSchemes/SimpleImportScheme/SimpleImportScheme.vue';

	const isLoading = ref(false);
	const isImporting = ref(false);
	const schemes = ref([]);
	const selectedEntity = ref(null);
	const selectedImportScheme = ref(null);

	const isSchemeEditorOpen = ref(false);

	const schemeEditButtonDisabled = computed(
		() => isLoading.value || !selectedImportScheme.value
	);

	async function onEntitySelect(entity) {
		selectedImportScheme.value = null;
		await getSchemeList(entity.key);
	}

	async function getSchemeList(contentType) {
		try {
			isLoading.value = true;
			const data = await useApi('simpleImportSchemeLight.get', {
				...(contentType && { filters: { content_type: contentType } })
			});
			data && data.results && (schemes.value = data.results);
		} catch (e) {
			console.error('The scheme list loading error.', e);
		} finally {
			isLoading.value = false;
		}
	}

	function onImportComplete() {
		selectedEntity.value = null;
		selectedImportScheme.value = null;
	}

	function closeSchemeEditor(shouldRefresh) {
		isSchemeEditorOpen.value = false;
		if (shouldRefresh) {
			selectedEntity.value = null;
			selectedImportScheme.value = null;
			getSchemeList();
		}
	}

	onBeforeMount(async () => {
		await getSchemeList();
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
