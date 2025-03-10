import { computed, defineAsyncComponent, inject, ref } from 'vue';
import { defineStore } from 'pinia';
import isEmpty from 'lodash/isEmpty';
import set from 'lodash/set';
import size from 'lodash/size';
import cloneDeep from 'lodash/cloneDeep';
import { FM_DIALOGS_KEY } from '@finmars/ui';
import { COMPONENTS_FOR_LINKING } from '~/components/modal/DashboardConstructor/constants';
import {
	getDashboardLayoutList,
	updateDashboardLayout
} from '~/services/uiService';
import useNotify from '~/composables/useNotify';
import { md5 } from '~/utils/md5';

function filterComponentTypeByContentType(item, contentType) {
	const { type, settings } = item;
	return (
		type === 'control' &&
		settings.value_type === 100 &&
		settings.content_type === contentType
	);
}

export const useDashboardConstructorStore = defineStore(
	'dashboardConstructor',
	() => {
		const dialogsService = inject(FM_DIALOGS_KEY);

		const layout = ref({
			id: null,
			is_active: false,
			is_default: false,
			name: '',
			user_code: null,
			configuration_code: null,
			origin_for_global_layout: null,
			sourced_from_global_layout: null,
			data: {
				components: [],
				components_types: [],
				fixed_area: {
					layout: {},
					position: 'top',
					status: 'disabled'
				},
				layout_type: null,
				state: {},
				tabs: []
			}
		});

		const draggableComponent = ref(null);

		const components = computed(() => layout.value.data.components ?? []);

		const componentsTypes = computed(
			() => layout.value.data.components_types ?? []
		);

		const controlComponentTypes = computed(() =>
			components.value.filter((c) => c.type === 'control')
		);
		const dateControlComponentsTypes = computed(() =>
			components.value.filter(
				(c) => c.type === 'control' && c.settings.value_type === 40
			)
		);
		const currencyControlComponentsTypes = computed(() =>
			components.value.filter((c) =>
				filterComponentTypeByContentType(c, 'currencies.currency')
			)
		);
		const pricingPolicyControlComponentsTypes = computed(() =>
			components.value.filter((c) =>
				filterComponentTypeByContentType(c, 'instruments.pricingpolicy')
			)
		);
		const portfoliosComponentTypes = computed(() =>
			components.value.filter((c) =>
				filterComponentTypeByContentType(c, 'portfolios.portfolio')
			)
		);
		const accountsComponentTypes = computed(() =>
			components.value.filter((c) =>
				filterComponentTypeByContentType(c, 'accounts.account')
			)
		);
		const strategies1ComponentTypes = computed(() =>
			components.value.filter((c) =>
				filterComponentTypeByContentType(c, 'strategies.strategy1')
			)
		);
		const strategies2ComponentTypes = computed(() =>
			components.value.filter((c) =>
				filterComponentTypeByContentType(c, 'strategies.strategy2')
			)
		);
		const strategies3ComponentTypes = computed(() =>
			components.value.filter((c) =>
				filterComponentTypeByContentType(c, 'strategies.strategy3')
			)
		);
		const componentsForLinking = computed(() =>
			cloneDeep(COMPONENTS_FOR_LINKING)
		);

		function getComponentsForMultiselector(userCode) {
			return components.value.reduce((res, c) => {
				const { type, user_code, id, name } = c;
				if (
					componentsForLinking.value.includes(type) &&
					user_code !== userCode
				) {
					res.push({
						id: user_code || id, // (Zhitenev in the old code) => for old dashboards, where user_code is not defined, remove later
						name
					});
				}

				return res;
			}, []);
		}

		function setLayout(data) {
			layout.value = data;
		}

		function updateLayout({ path, value }) {
			set(layout.value, path, value);
		}

		function setDraggableComponent(value) {
			draggableComponent.value = value;
		}

		function setComponents(data) {
			if (!data || !Array.isArray(data)) {
				layout.value.data.components = [];
			} else {
				layout.value.data.components = data;
			}
		}

		function getComponentById(componentId) {
			const component = components.value.find(
				(c) => c.id === componentId
			);
			return component || null;
		}

		function updateComponent(componentData) {
			const index = layout.value.data.components.findIndex(
				(c) => c.id === componentData.id
			);
			if (index !== -1) {
				layout.value.data.components[index] = componentData;
			}
		}

		function removeComponent(componentId) {
			const index = layout.value.data.components.findIndex(
				(c) => c.id === componentId
			);
			index !== -1 && layout.value.data.components.splice(index, 1);

			if (!isEmpty(layout.value.data.components_types)) {
				const index1 = layout.value.data.components_types.findIndex(
					(c) => c.id === componentId
				);
				index1 !== -1 &&
					layout.value.data.components_types.splice(index1, 1);
			}
		}

		function createCopyOfComponent(component, newId, namePostfix) {
			// const copy = metaHelper.recursiveDeepCopy(component, false);
			const copy = cloneDeep(component);
			copy.id = newId;
			copy.name = `${copy.name} ${namePostfix}`;

			if (copy.settings && copy.settings.linked_components) {
				copy.settings.linked_components = {};
			}

			return copy;
		}

		async function exportComponentToDashboards(component) {
			const data = await getDashboardLayoutList();
			const dashboardLayouts = data.results;

			const newId = md5(`${Date.now()}_${size(dashboardLayouts)}`);

			const currentDashboardLayoutName = layout.value.name;
			const namePostfix = `(copied from dashboard: ${currentDashboardLayoutName})`;
			const exportedComponent = createCopyOfComponent(
				component,
				newId,
				namePostfix
			);

			const dialogComponent = defineAsyncComponent(
				() =>
					import(
						'@/components/pages/configuration/dashboard-constructor/ExpandableItemsSelector/ExpandableItemsSelectorDialog.vue'
					)
			);
			dialogsService.$openDialog({
				component: dialogComponent,
				componentProps: {
					value: [],
					options: dashboardLayouts,
					multiselector: true
				},
				dialogProps: {
					title: 'Select dashboards to export',
					width: 480,
					confirmButton: false,
					cancelButton: false,
					onConfirm: async (val) => {
						const targetDashboardLayout = dashboardLayouts.filter(
							(l) => val.includes(l.id)
						);
						targetDashboardLayout.forEach((l) => {
							l.data.components_types.push(exportedComponent);
						});

						try {
							const res = await Promise.all([
								targetDashboardLayout.map((l) =>
									updateDashboardLayout(l)
								)
							]);

							useNotify({
								type: 'success',
								title: `Dashboard Layouts are Updated (${res.map(({ name }) => name).join(', ')})`
							});
						} catch (e) {
							useNotify({
								type: 'error',
								title: 'Error while export the components to the dashboards',
								text: e.message
							});
						}
					}
				}
			});
		}

		return {
			layout,
			draggableComponent,
			components,
			componentsTypes,
			controlComponentTypes,
			dateControlComponentsTypes,
			currencyControlComponentsTypes,
			pricingPolicyControlComponentsTypes,
			portfoliosComponentTypes,
			accountsComponentTypes,
			strategies1ComponentTypes,
			strategies2ComponentTypes,
			strategies3ComponentTypes,
			componentsForLinking,
			getComponentsForMultiselector,
			setLayout,
			updateLayout,
			setDraggableComponent,
			setComponents,
			getComponentById,
			updateComponent,
			removeComponent,
			exportComponentToDashboards
		};
	}
);
