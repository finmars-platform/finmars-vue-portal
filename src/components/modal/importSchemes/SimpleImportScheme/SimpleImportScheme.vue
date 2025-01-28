<template>
	<teleport to="body">
		<section class="simple-import-scheme__overlay">
			<div class="simple-import-scheme">
				<div class="simple-import-scheme__header">
					{{ isEditMode ? 'Edit ' : 'Create ' }} entity import scheme

					<FmIconButton
						class="simple-import-scheme__close-button"
						icon="mdi-close"
						variant="text"
						@click.stop.prevent="emits('close')"
					/>

					<div class="simple-import-scheme__draft">
						<DraftButton
							v-if="draftUserCode"
							:draft-user-code="draftUserCode"
							:export-to-draft="exportToDraft"
							:apply-draft="applyDraft"
						/>
					</div>

					<div v-if="isLoading" class="simple-import-scheme__loader">
						<FmProgressLinear indeterminate />
					</div>
				</div>

				<div class="simple-import-scheme__body">
					<div class="simple-import-scheme__tabs">
						<FmTabs
							:tabs="tabs"
							size="small"
							@change-tab="currentTab = $event"
						/>
					</div>

					<div class="simple-import-scheme__content">
						<transition>
							<SimpleTabGeneral
								v-if="currentTab === 0"
								:scheme="scheme"
								:is-edit-mode="isEditMode"
								:loading="isLoading"
								@update:scheme="updateScheme"
								@update:valid="onUpdateValid('general', $event)"
							/>

							<SimpleTabScheme
								v-else
								:scheme="scheme"
								:loading="isLoading"
								@update:scheme="updateScheme"
								@update:valid="onUpdateValid('scheme', $event)"
							/>
						</transition>
					</div>
				</div>

				<div class="simple-import-scheme__actions">
					<FmButton
						type="tertiary"
						rounded
						:disabled="isLoading || !isSchemeValid || !scheme?.id"
						@click.stop.prevent="isJsonEditorOpen = true"
					>
						Edit as JSON
					</FmButton>

					<FmButton
						type="tertiary"
						rounded
						:disabled="isLoading || !isSchemeValid || !scheme?.id"
						@click.stop.prevent="makeCopy"
					>
						Make a copy
					</FmButton>

					<FmButton
						type="secondary"
						rounded
						@click.prevent.stop="emits('close')"
					>
						Cancel
					</FmButton>

					<FmButton
						rounded
						:disabled="isLoading || !isSchemeValid"
						@click.stop.prevent="save"
					>
						Save
					</FmButton>
				</div>
			</div>

			<EntityJsonEditor
				v-if="isJsonEditorOpen"
				:data="scheme"
				entity-type="csv-import-scheme"
				@close="isJsonEditorOpen = false"
				@update="onSchemeUpdate"
			/>
		</section>
	</teleport>
</template>

<script setup>
	import { computed, onBeforeMount, ref } from 'vue';
	import cloneDeep from 'lodash/cloneDeep';
	import {
		FmButton,
		FmIconButton,
		FmProgressLinear,
		FmTabs
	} from '@finmars/ui';
	import useNotify from '~/composables/useNotify';
	import { getById, create, update } from '@/services/csvImportSchemeService';
	import { findEntityByContentType } from '~/services/meta/metaContentTypeService';
	import { getList } from '@/services/attributeTypeService';
	import SimpleTabGeneral from './SimpleTabGeneral.vue';
	import SimpleTabScheme from './SimpleTabScheme.vue';
	import EntityJsonEditor from '~/components/modal/EntityJsonEditor/EntityJsonEditor.vue';
	import DraftButton from '~/components/common/DraftButton/DraftButton.vue';

	const props = defineProps({
		schemeId: {
			type: Number
		},
		initialScheme: {
			type: Object,
			default: () => ({
				entity_fields: [],
				csv_fields: []
			})
		}
	});

	const emits = defineEmits(['close', 'copy']);

	const tabs = [{ label: 'General' }, { label: 'Scheme' }];

	const isLoading = ref(false);
	const currentTab = ref(0);
	const scheme = ref(cloneDeep(props.initialScheme));
	const isTabFieldsValuesValid = ref({
		general: true,
		scheme: true
	});
	const isJsonEditorOpen = ref(false);

	const dynamicAttributes = ref([]);

	const isEditMode = computed(() => !!props.schemeId);

	const isSchemeValid = computed(
		() =>
			isTabFieldsValuesValid.value.general &&
			isTabFieldsValuesValid.value.scheme
	);

	const draftUserCode = computed(() => {
		if (!scheme.value || !scheme.value?.user_code) {
			return '';
		}

		return isEditMode.value
			? `csv_import.csvimportscheme.${scheme.value?.user_code}`
			: 'csv_import.csvimportscheme.new';
	});

	function onUpdateValid(tab, value) {
		isTabFieldsValuesValid.value[tab] = value;
	}

	function updateScheme(value) {
		scheme.value = value;
	}

	async function getScheme() {
		try {
			isLoading.value = true;
			const res = await getById(props.schemeId);
			res && (scheme.value = res);
		} catch (e) {
			console.error('The error loading the simple schema data. ', e);
		} finally {
			isLoading.value = false;
		}
	}

	async function getDynamicAttributes(schemeContentType) {
		const entityType = findEntityByContentType(schemeContentType);
		const res = entityType
			? await getList(entityType, { pageSize: 1000 })
			: { results: [] };
		dynamicAttributes.value = res.results;
		scheme.value.entity_fields.forEach((item) => {
			if (item.dynamic_attribute_id !== null) {
				dynamicAttributes.value.forEach((attr) => {
					if (item.dynamic_attribute_id === attr.id) {
						item.value_type = attr.value_type;
					}
				});
			}
		});
	}

	async function createOrUpdateScheme(data) {
		const updatedData = cloneDeep(data);
		updatedData.entity_fields.forEach((item) => {
			dynamicAttributes.value.forEach((attr) => {
				if (item.dynamic_attribute_id === attr.id) {
					item.name = attr.name;
				}
			});
		});
		if (updatedData.id) {
			await update(updatedData);
		} else {
			await create(updatedData);
		}
	}

	async function save() {
		try {
			isLoading.value = true;
			await getDynamicAttributes(scheme.value.content_type);
			await createOrUpdateScheme(scheme.value);
			useNotify({
				type: 'success',
				title: `Simple Import Scheme ${scheme.value.user_code} was successfully saved`
			});
			emits('close', true);
		} catch (e) {
			console.error('Error saving the simple import schema. ', e);
			useNotify({
				type: 'error',
				title: 'Error saving the simple import schema.',
				message: e.message || ''
			});
		} finally {
			isLoading.value = false;
		}
	}

	function makeCopy() {
		emits('copy', scheme.value);
	}

	async function onSchemeUpdate() {
		await getScheme();
	}

	function exportToDraft() {
		return cloneDeep(scheme.value);
	}

	function applyDraft(value) {
		scheme.value = value;
	}

	onBeforeMount(async () => {
		if (isEditMode.value) {
			await getScheme();
		}
	});
</script>

<style lang="scss" scoped>
	.simple-import-scheme__overlay {
		position: fixed;
		inset: 0;
		background-color: rgba(0, 0, 0, 0.2);
		display: flex;
		justify-content: center;
		align-items: center;
		z-index: 1000;
	}

	.simple-import-scheme {
		position: relative;
		width: 98%;
		height: 98%;
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

		&__draft {
			position: absolute;
			right: 64px;
		}

		&__loader {
			position: absolute;
			left: 0;
			width: 100%;
			bottom: -1px;
		}

		&__body {
			position: relative;
			width: 100%;
			height: calc(100% - 148px);
		}

		&__tabs {
			position: relative;
			width: 320px;
		}

		&__content {
			position: relative;
			width: 100%;
			height: calc(100% - 60px);

			&:before {
				content: '';
				position: absolute;
				left: 0;
				width: 100%;
				top: -1px;
				border-top: 1px solid var(--outline-variant);
			}
		}

		&__actions {
			display: flex;
			width: 100%;
			height: 84px;
			padding: 0 24px;
			justify-content: flex-end;
			align-items: center;
			column-gap: 16px;
			border-top: 1px solid var(--outline-variant);

			button {
				text-transform: none;
			}
		}
	}
</style>
