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
	</div>
</template>

<script setup>
	/* eslint-disable no-case-declarations */
	import { defineAsyncComponent, inject, onBeforeMount, ref } from 'vue';
	import size from 'lodash/size';
	import {
		FmButton,
		FmIcon,
		FmProgressCircular,
		FM_DIALOGS_KEY
	} from '@finmars/ui';
	import { getEntitiesWithoutDynamicAttrsList } from '~/services/meta/metaNotificationClassService';
	import { deleteByKey } from '~/services/attributeTypeService';
	import useApi from '~/composables/useApi';
	import UserAttribute from '~/components/pages/configuration/user-attributes/UserAttribute.vue';

	const dialogsService = inject(FM_DIALOGS_KEY);

	const props = defineProps({
		block: {
			type: Object,
			required: true
		}
	});

	const isLoading = ref(false);
	const isCollapsed = ref(false);
	const attributes = ref([]);

	function deleteAttr(id, name) {
		const confirmationDialog = defineAsyncComponent(
			() => import('../../../modal/ConfirmationDialog.vue')
		);
		dialogsService.$openDialog({
			component: confirmationDialog,
			componentProps: {
				text: `Are you sure to delete attribute '${name}'?`
			},
			dialogProps: {
				title: 'Warning',
				width: 480,
				onConfirm: async () => {
					await deleteByKey(props.block.key, id);
					await getAttributes();
				}
			}
		});
	}

	function runExport(data) {
		const exportDialog = defineAsyncComponent(
			() =>
				import(
					'../../../modal/ClassifierExportDialog/ClassifierExportDialog.vue'
				)
		);
		dialogsService.$openDialog({
			component: exportDialog,
			componentProps: {
				entityType: props.block.key,
				item: data
			},
			dialogProps: {
				title: 'Export Classifier',
				width: 360,
				confirmButton: false,
				cancelButton: false,
				closeOnClickOverlay: false
			}
		});
	}

	function runImport(data) {
		const importDialog = defineAsyncComponent(
			() =>
				import(
					'../../../modal/ClassifierImportDialog/ClassifierImportDialog.vue'
				)
		);
		dialogsService.$openDialog({
			component: importDialog,
			componentProps: {
				entityType: props.block.key,
				item: data
			},
			dialogProps: {
				title: 'Import Classifier',
				width: 480,
				confirmButton: false,
				cancelButton: false,
				closeOnClickOverlay: false,
				onConfirm: async () => {
					await getAttributes();
				}
			}
		});
	}

	function openAttributeTypeDialog({ id, initialAttr }) {
		const attrTypeDialog = defineAsyncComponent(
			() => import('../../../modal/AttributeTypeDialog/AttributeTypeDialog.vue')
		);
		dialogsService.$openDialog({
			component: attrTypeDialog,
			componentProps: {
				entityType: props.block.key,
				...(id && { id }),
				...(initialAttr && { attribute: initialAttr })
			},
			dialogProps: {
				title: 'Attribute manager',
				width: 1024,
				confirmButton: false,
				cancelButton: false,
				closeOnClickOverlay: false,
				onConfirm: async ({ action, payload }) => {
					if (action === 'refresh:data') {
						await getAttributes();
						return;
					}

					if (action === 'make:copy') {
						setTimeout(() => {
							openAttributeTypeDialog({ initialAttr: payload });
						}, 500);
					}
				}
			}
		});
	}

	function openMappingDialog(id) {
		const mappingDialog = defineAsyncComponent(
			() =>
				import(
					'../../../modal/ClassifierMappingDialog/ClassifierMappingDialog.vue'
				)
		);
		dialogsService.$openDialog({
			component: mappingDialog,
			componentProps: {
				entityType: props.block.key,
				id
			},
			dialogProps: {
				title: 'Entity type classifier mapping',
				width: 840,
				confirmButton: false,
				cancelButton: false,
				closeOnClickOverlay: false,
				onConfirm: async () => {
					await getAttributes();
				}
			}
		});
	}

	function openEditorDialog(data) {
		const editorDialog = defineAsyncComponent(
			() =>
				import(
					'../../../modal/ClassifierEditorDialog/ClassifierEditorDialog.vue'
				)
		);
		dialogsService.$openDialog({
			component: editorDialog,
			componentProps: {
				entityType: props.block.key,
				item: data
			},
			dialogProps: {
				title: 'Classifier Editor',
				width: 520,
				confirmButton: false,
				cancelButton: false,
				closeOnClickOverlay: false
			}
		});
	}

	async function handleActions({ action, value }) {
		switch (action) {
			case 'edit':
				openAttributeTypeDialog({ id: value });
				break;
			case 'delete':
				const { id, name } = value;
				deleteAttr(id, name);
				break;
			case 'export:classifier':
				runExport(value);
				break;
			case 'import:classifier':
				runImport(value);
				break;
			case 'open:classifier':
				openMappingDialog(value.id);
				break;
			case 'edit:classifier':
				openEditorDialog(value);
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
