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
				:disabled="isLoading || isImporting"
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
				:disabled="isLoading || isImporting"
				class="simple-import-page__select"
			/>

			<FmIconButton
				icon="mdi-developer-board"
				:disabled="schemeEditButtonDisabled || isImporting"
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
		/>

		<SimpleImportScheme
			v-if="isSchemeEditorOpen"
			:scheme-id="selectedImportScheme?.id"
			:initial-scheme="copiedScheme"
			@close="closeSchemeEditor"
			@copy="makeSchemeCopy"
		/>
	</section>
</template>

<script setup>
	import { computed, nextTick, onBeforeMount, ref } from 'vue';
	import omit from 'lodash/omit';
	import { FmIconButton, FmSearch, FmTooltip } from '@finmars/ui';
	import { getListLight } from '@/services/csvImportSchemeService';
	import { ENTITY_LIST } from './constants';
	import DataImportByScheme from '~/components/common/DataImportByScheme/DataImportByScheme.vue';
	import SimpleImportScheme from '~/components/modal/importSchemes/SimpleImportScheme/SimpleImportScheme.vue';

	const isLoading = ref(false);
	const isImporting = ref(false);
	const schemes = ref([]);
	const selectedEntity = ref(null);
	const selectedImportScheme = ref(null);

	const isSchemeEditorOpen = ref(false);
	const copiedScheme = ref({});

	const schemeEditButtonDisabled = computed(
		() => isLoading.value || !selectedImportScheme.value
	);

	const userCodesOfExistingImportSchemes = computed(() =>
		schemes.value.map((s) => s.user_code)
	);

	async function onEntitySelect(entity) {
		selectedImportScheme.value = null;
		await getSchemeList(entity.key);
	}

	async function getSchemeList(contentType) {
		try {
			isLoading.value = true;
			const data = await getListLight(
				contentType ? { content_type: contentType } : {}
			);
			data && data.results && (schemes.value = data.results);
		} catch (e) {
			console.error('The scheme list loading error.', e);
		} finally {
			isLoading.value = false;
		}
	}

	function createUserCodeForCopiedScheme(oldUserCode) {
		let isUserCodeUnique = false;
		let newUserCode = oldUserCode;
		while (!isUserCodeUnique) {
			newUserCode = `${newUserCode}_copy`;
			if (!userCodesOfExistingImportSchemes.value.includes(newUserCode)) {
				isUserCodeUnique = true;
			}
		}
		return newUserCode;
	}

	function makeSchemeCopy(scheme) {
		isSchemeEditorOpen.value = false;
		selectedImportScheme.value = null;
		nextTick(() => {
			setTimeout(() => {
				copiedScheme.value = omit(scheme, 'id');
				copiedScheme.value.user_code = createUserCodeForCopiedScheme(
					copiedScheme.value.user_code
				);

				isSchemeEditorOpen.value = true;
			}, 500);
		});
	}

	async function closeSchemeEditor(shouldRefresh) {
		isSchemeEditorOpen.value = false;
		if (shouldRefresh && selectedEntity.value) {
			await getSchemeList(selectedEntity.value.key);
			const currentSelectedSchemeId = selectedImportScheme.value.id;
			const updatedCurrentSelectedScheme = (schemes.value || []).find(
				(s) => s.id === currentSelectedSchemeId
			);
			if (updatedCurrentSelectedScheme) {
				selectedImportScheme.value = null;
				nextTick(() => {
					selectedImportScheme.value = updatedCurrentSelectedScheme;
				});
			}
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

				.v-field {
					.v-field__field {
						.v-field__input,
						.v-label {
							color: var(--on-surface-variant);
						}
					}
				}

				.v-field__clearable,
				.v-field__append-inner {
					color: var(--on-surface-variant);
				}
			}
		}
	}
</style>
