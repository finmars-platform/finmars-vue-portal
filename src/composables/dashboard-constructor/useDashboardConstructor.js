import { inject, computed, ref, defineAsyncComponent } from 'vue';
import { storeToRefs } from 'pinia';
import get from 'lodash/get';
import cloneDeep from 'lodash/cloneDeep';
import omit from 'lodash/omit';
import size from 'lodash/size';
import isEmpty from 'lodash/isEmpty';
import { FM_DIALOGS_KEY, FM_VUEBUS_KEY } from '@finmars/ui';
import useNotify from '~/composables/useNotify';
import {
	getDashboardLayoutList,
	createDashboardLayout,
	updateDashboardLayout
} from '~/services/uiService';
import { useAttributes } from '~/stores/useAttributes';
import { useDashboardConstructorStore } from '~/stores/useDashboardConstructorStore';
import useApi from '@/composables/useApi';
import { getUrlToOldApp } from '~/composables/useUtils';
import { md5 } from '~/utils/md5';
import { DIALOG_COMPONENT_BY_TYPE } from '~/components/pages/configuration/dashboard-constructor/constants';

const idAttribute = {
	key: 'id',
	name: 'Id',
	value_type: 20
};

export function useDashboardConstructor() {
	const vueBus = inject(FM_VUEBUS_KEY);
	const dialogsService = inject(FM_DIALOGS_KEY);

	const attributesStore = useAttributes();
	const {
		appendEntityAttribute,
		downloadCustomFieldsByEntityType,
		downloadDynamicAttributesByEntityType
	} = attributesStore;

	const dashboardConstructorStore = useDashboardConstructorStore();
	const { layout, components, draggableComponent } = storeToRefs(
		dashboardConstructorStore
	);
	const { setLayout, updateLayout, removeComponent } =
		dashboardConstructorStore;

	const isLoading = ref(false);
	const isJsonEditorOpen = ref(false);

	const formData = ref({
		name: {
			isDirty: false,
			isValid: true
		},
		configuration_code: {
			isDirty: false,
			skipValidation: true,
			isValid: true
		},
		user_code: {
			isDirty: false,
			skipValidation: true,
			isValid: true
		}
	});

	const activeTab = ref(null);

	const availableComponentsTypes = computed(() => {
		const componentsInUse = [];

		if (draggableComponent.value) {
			componentsInUse.push(draggableComponent.value.id);
		}

		(layout.value.data?.fixed_area?.layout?.rows || []).forEach((row) => {
			(row.columns || []).forEach((column) => {
				if (column.cell_type === 'component') {
					componentsInUse.push(column.data.id);
				}
			});
		});

		(layout.value?.data?.tabs || []).forEach((tab) => {
			tab.layout?.rows?.forEach((row) => {
				row.columns?.forEach((column) => {
					if (column.cell_type === 'component') {
						componentsInUse.push(column.data.id);
					}
				});
			});
		});

		return (layout.value?.data?.components || []).filter(
			(component) => !componentsInUse.includes(component.id)
		);
	});

	const isDirty = computed(() =>
		Object.values(formData.value).some((i) => i.isDirty)
	);

	const isValid = computed(() => {
		const v1 = !Object.values(formData.value).some((i) => !i.isValid);
		const v2 = !(
			layout.value?.sourced_from_global_layout &&
			!layout.value?.origin_for_global_layout
		);
		return v1 && v2;
	});

	const layoutTabs = computed(() => get(layout.value, ['data', 'tabs'], []));
	const layoutTabsHeader = computed(() =>
		layoutTabs.value.map((t) => omit(t, 'layout'))
	);

	const columnsCount = computed(() => {
		const type = get(layout.value, ['data', 'layout_type'], 'desktop');
		return type === 'desktop' ? 10 : type === 'tablet' ? 6 : 4;
	});
	const rowsCount = computed(() => {
		const type = get(layout.value, ['data', 'layout_type'], 'mobile');
		return type === 'desktop' ? 20 : 10;
	});

	function validateLayout(force) {
		Object.keys(formData.value).forEach((field) => {
			if (!formData.value[field].skipValidation || force) {
				formData.value[field].isValid = !!layout.value[field];
			}
		});
	}

	function updateField(field, value) {
		updateLayout({ path: field, value });
		!formData.value[field].isDirty &&
			(formData.value[field].isDirty = true);
		validateLayout();
	}

	function updateDashboard({ path, value }) {
		updateLayout({ path, value });
	}

	function updateUserCodeValidationValue(val) {
		formData.value.user_code.isValid = val;
		formData.value.configuration_code.isValid = val;
	}

	function toggleTopPanelActivity() {
		const currentActivityStatus = layout.value.data.fixed_area.status;
		if (currentActivityStatus === 'disabled') {
			const rowData = [];
			for (let i = 0; i < columnsCount.value; i++) {
				rowData.push({
					cell_type: 'empty',
					column_number: i,
					colspan: 1,
					rowspan: 1,
					data: {}
				});
			}
			layout.value.data.fixed_area.layout = {
				rows_count: 1,
				columns_count: columnsCount.value,
				rows: [
					{
						row_number: 0,
						columns: rowData
					}
				]
			};
			layout.value.data.fixed_area.status = 'active';
			return;
		}

		const confirmationDialog = defineAsyncComponent(
			() => import('@/components/modal/ConfirmationDialog.vue')
		);
		dialogsService.$openDialog({
			component: confirmationDialog,
			componentProps: {
				text: 'Are you sure you want to deactivate Top Panel?'
			},
			dialogProps: {
				title: 'Warning',
				width: 480,
				onConfirm: async () => {
					layout.value.data.fixed_area.status = 'disabled';
					layout.value.data.fixed_area.layout = {
						rows_count: null,
						columns_count: null,
						rows: []
					};
				}
			}
		});
	}

	function addNewComponent(data) {
		const { component, title } =
			DIALOG_COMPONENT_BY_TYPE[data.item.value] || {};

		if (!component) {
			console.info(
				`There is no editor for a component with the type ${data.item.value}!`
			);
			return;
		}
		openEditComponentDialog(title, component, null);
	}

	function editComponent(item) {
		let itemType = item.type;
		if (item.type === 'control' && item.settings.value_type === 40) {
			itemType = 'control_date';
		} else if (
			item.type === 'control' &&
			item.settings.value_type === 100
		) {
			itemType = 'control_relation';
		}

		const { component, title } = DIALOG_COMPONENT_BY_TYPE[itemType] || {};

		if (!component) {
			console.info(
				`There is no editor for a component with the type ${itemType}!`
			);
			return;
		}

		openEditComponentDialog(title, component, item);
	}

	function openEditComponentDialog(title, component, item = null) {
		dialogsService.$openDialog({
			component,
			componentProps: {
				item
			},
			dialogProps: {
				title,
				width: 1320,
				confirmButton: false,
				cancelButton: false,
				closeOnClickOverlay: false
			}
		});
	}

	function deleteComponent(item) {
		const confirmDialog = defineAsyncComponent(
			() => import('@/components/modal/ConfirmationDialog.vue')
		);
		dialogsService.$openDialog({
			component: confirmDialog,
			componentProps: {
				text: `Are you sure you want to delete the component '${item.name}'?`
			},
			dialogProps: {
				title: 'Warning!',
				width: 320,
				onConfirm: async () => {
					removeComponent(item.id);
				}
			}
		});
	}

	function addTab() {
		const newTab = {
			name: '',
			editState: true,
			id: md5(`${Date.now()}_${size(layout.value?.data?.tabs)}`),
			tab_number: size(layout.value?.data?.tabs),
			layout: {
				rows_count: null,
				columns_count: null,
				rows: []
			}
		};

		for (let r = 0; r < rowsCount.value; r++) {
			newTab.layout.rows[r] = {
				row_number: r,
				columns: []
			};

			for (let c = 0; c < columnsCount.value; c++) {
				newTab.layout.rows[r].columns[c] = {
					column_number: c,
					cell_type: 'empty',
					colspan: 1,
					rowspan: 1,
					data: {}
				};
			}
		}

		newTab.layout.rows_count = rowsCount.value;
		newTab.layout.columns_count = columnsCount.value;

		const updatedTabs = cloneDeep(layoutTabs.value);
		updatedTabs.push(newTab);
		updateLayout({ path: ['data', 'tabs'], value: updatedTabs });

		activeTab.value = newTab.id;
	}

	function getUpdatedTabIndex(tab) {
		return layout.value.data.tabs.findIndex((t) => t.id === tab.id);
	}

	function updateTab({ tab, value }) {
		const updatedTabIndex = getUpdatedTabIndex(tab);
		if (updatedTabIndex !== -1) {
			const updatedValue = {
				...layout.value.data.tabs[updatedTabIndex],
				...value
			};

			updateLayout({
				path: ['data', 'tabs', updatedTabIndex],
				value: updatedValue
			});
		}
	}

	function deleteTab(tab) {
		const deletedTabIndex = getUpdatedTabIndex(tab);
		if (deletedTabIndex !== -1) {
			const updatedTabs = cloneDeep(layoutTabs.value);
			updatedTabs.splice(deletedTabIndex, 1);
			updatedTabs.forEach((t, index) => {
				t.tab_number = index;
			});

			updateLayout({ path: ['data', 'tabs'], value: updatedTabs });

			if (activeTab.value === tab.id) {
				activeTab.value = isEmpty(updatedTabs)
					? null
					: updatedTabs[0].id;
			}
		}
	}

	function moveTab({ oldIndex, newIndex }) {
		const updatedTabs = cloneDeep(layoutTabs.value);
		const movedTab = updatedTabs.splice(oldIndex, 1)[0];
		updatedTabs.splice(newIndex, 0, movedTab);
		updatedTabs.forEach((t, index) => {
			t.tab_number = index;
			t.editState = false;
		});

		updateLayout({ path: ['data', 'tabs'], value: updatedTabs });
	}

	async function downloadAttributes() {
		appendEntityAttribute('portfolio', cloneDeep(idAttribute));
		appendEntityAttribute('account', cloneDeep(idAttribute));
		appendEntityAttribute('currency', cloneDeep(idAttribute));
		appendEntityAttribute('instrument', cloneDeep(idAttribute));
		appendEntityAttribute('responsible', cloneDeep(idAttribute));
		appendEntityAttribute('counterparty', cloneDeep(idAttribute));
		appendEntityAttribute('transaction', cloneDeep(idAttribute));
		appendEntityAttribute('complex-transaction', cloneDeep(idAttribute));

		await Promise.all([
			downloadCustomFieldsByEntityType('balance-report'),
			downloadCustomFieldsByEntityType('pl-report'),
			downloadCustomFieldsByEntityType('transaction-report'),
			downloadDynamicAttributesByEntityType('portfolio'),
			downloadDynamicAttributesByEntityType('account'),
			downloadDynamicAttributesByEntityType('instrument'),
			downloadDynamicAttributesByEntityType('responsible'),
			downloadDynamicAttributesByEntityType('counterparty'),
			downloadDynamicAttributesByEntityType('transaction-type'),
			downloadDynamicAttributesByEntityType('complex-transaction')
		]);
	}

	async function loadLayoutData(id) {
		const layoutData = await useApi('dashboardLayout.get', {
			params: { id }
		});

		setLayout(layoutData);

		validateLayout(true);
	}

	function goToDashboard() {
		window.location.href = getUrlToOldApp('/dashboard');
	}

	function openJsonEditor() {
		isJsonEditorOpen.value = true;
	}

	function makeCopy() {
		layout.value.name = `${layout.value.name}_copy`;
		delete layout.value.id;
		delete layout.value.user_code;

		validateLayout(true);
	}

	async function save() {
		try {
			isLoading.value = true;
			layout.value.data.components_types = cloneDeep(
				layout.value.data.components
			);

			if (layout.value.id) {
				const data = await updateDashboardLayout(layout.value);
				layout.value.modified_at = data.modified_at;
			} else {
				const data = await getDashboardLayoutList();

				if (!size(data?.results)) {
					layout.value.is_default = true;
				}

				const res = await createDashboardLayout(layout.value);
				layout.value = res;
			}

			useNotify({
				type: 'success',
				title: `Dashboard layout ${layout.value.name} was successfully saved`
			});
		} catch (e) {
			console.error(e);
			useNotify({
				type: 'error',
				title: `Error occurred while saving layout ${layout.value.name}`,
				text: e.message
			});
		} finally {
			isLoading.value = false;
		}
	}

	function selectLayoutType(layoutType) {
		layout.value.data.layout_type = layoutType;
	}

	return {
		vueBus,
		isLoading,
		isJsonEditorOpen,
		isValid,
		isDirty,
		formData,
		layout,
		components,
		availableComponentsTypes,
		layoutTabs,
		layoutTabsHeader,
		activeTab,
		goToDashboard,
		openJsonEditor,
		makeCopy,
		save,
		selectLayoutType,
		loadLayoutData,
		downloadAttributes,
		updateField,
		updateDashboard,
		updateUserCodeValidationValue,
		toggleTopPanelActivity,
		addNewComponent,
		editComponent,
		deleteComponent,
		addTab,
		updateTab,
		deleteTab,
		moveTab
	};
}
