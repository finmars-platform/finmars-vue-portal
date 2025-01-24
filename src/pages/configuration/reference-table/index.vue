<template>
	<section class="reference-tables-page">
		<h3 class="font-bold text-[18px] mb-[24px]">Reference Tables</h3>

		<div
			v-for="item in referenceTables"
			:key="item.id"
			class="reference-tables-page__item"
		>
			<div class="reference-tables-page__item-title">
				<b>{{ item.name }}</b>
				{{ item.user_code }}
			</div>

			<div class="reference-tables-page__item-actions">
				<FmButton rounded @click="openReferenceTableEditDialog(item)">
					Edit
				</FmButton>

				<FmButton rounded type="secondary" @click="deleteTable(item)">
					Delete
				</FmButton>

				<FmButton
					rounded
					type="tertiary"
					@click="openImportDialog(item)"
				>
					Import from csv file
				</FmButton>
			</div>
		</div>

		<div class="reference-tables-page__add">
			<FmButton rounded @click="openReferenceTableEditDialog(null)">
				Add New Reference Table
			</FmButton>
		</div>

		<div v-if="isLoading" class="reference-tables-page__loader">
			<FmProgressCircular indeterminate size="100" />
		</div>
	</section>
</template>

<script setup>
	import { defineAsyncComponent, inject, onBeforeMount, ref } from 'vue';
	import { FmButton, FmProgressCircular, FM_DIALOGS_KEY } from '@finmars/ui';
	import { getList, deleteByKey } from '~/services/referenceTablesService';

	const dialogService = inject(FM_DIALOGS_KEY);

	const isLoading = ref(false);
	const referenceTables = ref([]);

	async function loadData() {
		try {
			isLoading.value = true;
			const res = await getList();
			res && res.results && (referenceTables.value = res.results);
		} finally {
			isLoading.value = false;
		}
	}

	function openReferenceTableEditDialog(table) {
		const editorComponent = defineAsyncComponent(
			() =>
				import(
					'@/components/modal/ReferenceTableEditorDialog/ReferenceTableEditorDialog.vue'
				)
		);
		dialogService.$openDialog({
			component: editorComponent,
			componentProps: {
				table
			},
			dialogProps: {
				title: `Reference Table: ${table?.name || ''}`,
				width: 720,
				cancelButton: false,
				confirmButton: false,
				onConfirm: async ({ action, value }) => {
					switch (action) {
						case 'make:copy':
							setTimeout(() => {
								openReferenceTableEditDialog(value);
							}, 250);
							break;
						case 'save':
							await loadData();
							break;
					}
				}
			}
		});
	}

	function deleteTable(table) {
		const confirmationComponent = defineAsyncComponent(
			() => import('@/components/modal/ConfirmationDialog.vue')
		);
		dialogService.$openDialog({
			component: confirmationComponent,
			componentProps: {
				text: `Are you sure to delete ${table.name}?`
			},
			dialogProps: {
				title: 'Warning',
				onConfirm: async () => {
					try {
						isLoading.value = true;
						await deleteByKey(table.id);
						await loadData();
					} finally {
						isLoading.value = false;
					}
				}
			}
		});
	}

	function openImportDialog(table) {
		const importComponent = defineAsyncComponent(
			() =>
				import(
					'@/components/modal/ReferenceTableImportDialog/ReferenceTableImportDialog.vue'
				)
		);
		dialogService.$openDialog({
			component: importComponent,
			componentProps: {
				item: table
			},
			dialogProps: {
				title: 'Import Reference Table',
				width: 480,
				confirmButton: false,
				cancelButton: false,
				closeOnClickOverlay: false,
				onConfirm: async () => {
					await loadData();
				}
			}
		});
	}

	onBeforeMount(async () => {
		await loadData();
	});
</script>

<style lang="scss" scoped>
	.reference-tables-page {
		position: relative;
		width: 100%;
		min-height: 100%;
		color: var(--on-surface);
		padding: 24px;

		&__item {
			display: flex;
			width: 100%;
			justify-content: space-between;
			align-items: center;
			column-gap: 16px;
			border-radius: 8px;
			border: 1px solid var(--outline-variant);
			padding: 6px 8px;
			margin-bottom: 8px;

			&-title {
				position: relative;
				width: 480px;
				display: flex;
				flex-direction: column;
				font: var(--body-medium-pro-font);
			}

			&-actions {
				display: flex;
				justify-content: center;
				align-items: center;
				column-gap: 16px;
			}
		}

		&__add {
			padding-top: 24px;
		}

		&__loader {
			position: absolute;
			inset: 0;
			z-index: 5;
			pointer-events: none;
			background-color: rgba(0, 0, 0, 0.2);
			display: flex;
			justify-content: center;
			align-items: center;
		}

		button {
			text-transform: none;
		}
	}
</style>
