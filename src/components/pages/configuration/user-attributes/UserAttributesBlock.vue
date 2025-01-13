<template>
	<div class="attributes-block">
		<div class="attributes-block__header" @click="isCollapsed = !isCollapsed">
			{{ block.title }}

			<FmIcon
				:icon="isCollapsed ? 'mdi-chevron-down' : 'mdi-chevron-up'"
				color="var(--on-surface)"
			/>
		</div>

		<Transition name="fade" mode="out-in">
			<div v-if="!isCollapsed" class="attributes-block__body">
				<div class="attributes-block__actions">
					<FmButton rounded @click="openAttributeTypeDialog({ id: null })">
						Add New
					</FmButton>
				</div>

				<div v-if="!size(attributes)" class="attributes-block__empty">
					You could add new user attributes here
				</div>

				<div v-else>
					<UserAttribute
						v-for="attr in attributes"
						:key="attr.id"
						:attr="attr"
						@action="handleActions"
					/>
				</div>
			</div>
		</Transition>

		<div v-if="isLoading" class="attributes-block__loader">
			<FmProgressCircular indeterminate size="48" />
		</div>

		<AttributeTypeDialog
			v-if="dialogs.isAttributeTypeDialogOpen"
			:entity-type="block.key"
			:id="selectedAttr.id"
			:attribute="selectedAttr.data"
			@close="closeAttributeTypeDialog"
			@make:copy="openDialogForCopyAttr"
		/>

		<ConfirmationDialog
			v-if="dialogs.isConfirmationDialogOpen"
			:text="`Are you sure to delete attribute '${selectedAttr.name}'?`"
			@close="handleConfirmResponse"
		/>

		<ClassifierExportDialog
			v-if="dialogs.isExportDialogOpen"
			:entity-type="block.key"
			:item="selectedAttr.data"
			@close="dialogs.isExportDialogOpen = false"
		/>

		<ClassifierImportDialog
			v-if="dialogs.isImportDialogOpen"
			:entity-type="block.key"
			:item="selectedAttr.data"
			@close="closeImportDialog"
		/>

		<ClassfierMappingDialog
			v-if="dialogs.isClassifierMappingOpen"
			:entity-type="block.key"
			:id="selectedAttr.id"
			@close="closeClassifierMapping"
		/>

		<ClassifierEditorDialog
			v-if="dialogs.isClassifierEditorOpen"
			:entity-type="block.key"
			:item="selectedAttr.data"
			@close="dialogs.isClassifierEditorOpen = false"
		/>
	</div>
</template>

<script setup>
	/* eslint-disable no-case-declarations */
	import { onBeforeMount, ref } from 'vue';
	import size from 'lodash/size';
	import { FmButton, FmIcon, FmProgressCircular } from '@finmars/ui';
	import { getEntitiesWithoutDynamicAttrsList } from '~/services/meta/metaNotificationClassService';
	import { deleteByKey } from '~/services/attributeTypeService';
	import useApi from '~/composables/useApi';
	import UserAttribute from '~/components/pages/configuration/user-attributes/UserAttribute.vue';
	import AttributeTypeDialog from '~/components/modal/AttributeTypeDialog/AttributeTypeDialog.vue';
	import ConfirmationDialog from '~/components/modal/ConfirmationDialog.vue';
	import ClassifierExportDialog from '~/components/modal/ClassifierExportDialog/ClassifierExportDialog.vue';
	import ClassifierImportDialog from '~/components/modal/ClassifierImportDialog/ClassifierImportDialog.vue';
	import ClassifierEditorDialog from '~/components/modal/ClassifierEditorDialog/ClassifierEditorDialog.vue';
	import ClassfierMappingDialog from '~/components/modal/ClassifierMappingDialog/ClassifierMappingDialog.vue';

	const props = defineProps({
		block: {
			type: Object,
			required: true
		}
	});

	const isLoading = ref(false);
	const isCollapsed = ref(false);
	const attributes = ref([]);

	const dialogs = ref({
		isAttributeTypeDialogOpen: false,
		isConfirmationDialogOpen: false,
		isExportDialogOpen: false,
		isImportDialogOpen: false,
		isClassifierMappingOpen: false,
		isClassifierEditorOpen: false
	});

	const selectedAttr = ref({
		id: null,
		name: null,
		data: null
	});

	function clearSelectedAttrValue() {
		selectedAttr.value = {
			id: null,
			name: null,
			data: null
		};
	}

	function openAttributeTypeDialog({ id, initialAttr }) {
		id && (selectedAttr.value.id = id);
		initialAttr && (selectedAttr.value.data = initialAttr);
		dialogs.value.isAttributeTypeDialogOpen = true;
	}

	async function closeAttributeTypeDialog(shouldRefreshData) {
		dialogs.value.isAttributeTypeDialogOpen = false;
		clearSelectedAttrValue();
		shouldRefreshData && (await getAttributes());
	}

	function openDialogForCopyAttr(copiedAttr) {
		dialogs.value.isAttributeTypeDialogOpen = false;
		setTimeout(() => {
			clearSelectedAttrValue();
			selectedAttr.value.data = copiedAttr;
			dialogs.value.isAttributeTypeDialogOpen = true;
		}, 500);
	}

	async function handleConfirmResponse(value) {
		dialogs.value.isConfirmationDialogOpen = false;
		if (value && selectedAttr.value.id) {
			await deleteByKey(props.block.key, selectedAttr.value.id);
			await getAttributes();
		}
		clearSelectedAttrValue();
	}

	async function closeImportDialog(shouldRefreshData) {
		dialogs.value.isImportDialogOpen = false;
		clearSelectedAttrValue();
		shouldRefreshData && (await getAttributes());
	}

	async function closeClassifierMapping(shouldRefreshData) {
		dialogs.value.isClassifierMappingOpen = false;
		clearSelectedAttrValue();
		shouldRefreshData && (await getAttributes());
	}

	async function handleActions({ action, value }) {
		clearSelectedAttrValue();
		switch (action) {
			case 'edit':
				openAttributeTypeDialog({ id: value });
				break;
			case 'delete':
				const { id, name } = value;
				dialogs.value.isConfirmationDialogOpen = true;
				selectedAttr.value = {
					id,
					name,
					data: null
				};
				break;
			case 'export:classifier':
				selectedAttr.value.data = value;
				dialogs.value.isExportDialogOpen = true;
				break;
			case 'import:classifier':
				selectedAttr.value.data = value;
				dialogs.value.isImportDialogOpen = true;
				break;
			case 'open:classifier':
				selectedAttr.value.id = value.id;
				dialogs.value.isClassifierMappingOpen = true;
				break;
			case 'edit:classifier':
				selectedAttr.value.data = value;
				dialogs.value.isClassifierEditorOpen = true;
				break;
		}
	}

	async function getAttributes() {
		if (getEntitiesWithoutDynamicAttrsList().includes(props.block.key)) {
			return;
		}

		try {
			isLoading.value = true;
			const res = await useApi(`${props.block.apiRoute}.get`, {
				filters: {
					page: 1,
					page_size: 10000
				}
			});
			res && res.results && (attributes.value = res.results);
		} catch (err) {
			console.error(
				`The error of the "${props.block.key}" attributes loading. `,
				err
			);
		} finally {
			isLoading.value = false;
		}
	}

	onBeforeMount(async () => {
		await getAttributes();
	});
</script>

<style lang="scss" scoped>
	.attributes-block {
		position: relative;
		width: 100%;
		color: var(--on-surface);
		margin-bottom: 30px;

		&__header {
			position: relative;
			width: 100%;
			display: flex;
			justify-content: space-between;
			align-items: center;
			padding-bottom: 8px;
			border-bottom: 1px solid var(--outline-variant);
			font: var(--title-medium-font);
			cursor: pointer;

			&:hover {
				color: var(--primary);
				border-bottom: 1px solid var(--primary);

				i {
					color: var(--primary) !important;
				}
			}
		}

		&__actions {
			display: flex;
			width: 100%;
			padding: 16px 0;
			justify-content: space-between;
			align-items: center;

			button {
				text-transform: none;
			}
		}

		&__empty {
			position: relative;
			width: 100%;
			padding: 8px 0;
			font: var(--body-large-font);
			text-align: center;
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
