<template>

<!--	<BaseModal title="New Report Viewer Matrix Component">

		<div>
			<FmTabs v-model="activeTab" :tabs="tabsList" />

			<div v-if="activeTab === 'main'">
				<BaseInput
					v-model="userCode"
					label="User code"
					required
				/>

				<FmSelect
					v-model="selDashTab"
					:items="dashTabsList"
					label="Tab"
				/>

				<div class="flex-row">
					<div class="flex-0-1-100">
						<FmSelect
							title="Layout"
							v-model="settings.layout"
							:items="layoutsList"
							prop_id="user_code"
						/>
					</div>

					<div style="flex: 0 0 180px;">
						<FmSelect
							title="Report type"
							v-model="settings.content_type"
							:items="contentTypeOpts"
						/>
					</div>

				</div>

				<FmAttributesSelect
					v-model="settings.axisX"
					title="Axis X Columns"
					:contentType="settings.content_type"
					:disabled="!!settings.layout"
				/>

				<FmAttributesSelect
					v-model="settings.axisY"
					title="Axis Y Columns"
					:contentType="settings.content_type"
					:disabled="!!settings.layout"
				/>

				<FmAttributesSelect
					v-model="settings.valueKey"
					title="Value"
					:contentType="settings.content_type"
					:disabled="!!settings.layout"
				/>

			</div>

			<div v-else-if="activeTab === 'advance settings'"></div>

			<div v-else-if="activeTab === 'menu settings'"></div>

			<div v-else-if="activeTab === 'linking'"></div>
		</div>

		<template #controls="{ cancel }">
			<div class="flex-row fc-space-between">
				<FmBtn type="text" @click="cancel">cancel</FmBtn>
				<FmBtn @click="addComponent(cancel)">add</FmBtn>
			</div>
		</template>
	</BaseModal>-->
	<div v-bind="$attrs"
			 style="width: 630px;">
		<FmTabs v-model="activeTab" :tabs="tabsList" class="width-100" />

		<div v-if="activeTab === 'main'" class="p-t-16">
			<BaseInput
				v-model="component.user_code"
				label="User code"
				required
			/>

			<FmSelect
				v-model="selDashTab"
				:items="dashTabsList"
				label="Tab"
			/>

<!--			<div class="flex-row">
				<div class="flex-0-1-100">
					<FmSelect
						label="Layout"
						v-model="component.settings.layout"
						:items="layoutsList"
						prop_id="user_code"
					/>
				</div>

				<div style="flex: 0 0 180px;">
					<FmSelect
						title="Report type"
						v-model="component.settings.content_type"
						:items="contentTypeOpts"
					/>
				</div>

			</div>-->
			<LazySelectorsLayout
				:modelValue="component.settings.layout"
				v-model:content_type="component.settings.content_type"
				@update:modelValue="newVal => component.settings.layout = copyRvLayoutForDashboard(newVal)"
				@userCodeChanged="newUc => component.settings.user_code = newUc"
			/>

			<FmAttributesSelect
				v-model="component.settings.axisX"
				title="Axis X Columns"
				:attributes="evAttrsStore.getDataForAttributesSelector(component.settings.content_type)"
				:valueType="10"
				:contentType="component.settings.content_type"
				:disabled="!component.settings.layout"
				class="m-b-24"
			/>

			<FmAttributesSelect
				v-model="component.settings.axisY"
				title="Axis Y Columns"
				:attributes="evAttrsStore.getDataForAttributesSelector(component.settings.content_type)"
				:valueType="10"
				:contentType="component.settings.content_type"
				:disabled="!component.settings.layout"
				class="m-b-24"
			/>

			<FmAttributesSelect
				v-model="component.settings.valueKey"
				title="Value"
				:attributes="evAttrsStore.getDataForAttributesSelector(component.settings.content_type)"
				:valueType="20"
				:contentType="component.settings.content_type"
				:disabled="!component.settings.layout"
				class="m-b-24"
			/>

			<FmSelect
				v-model="component.settings.subtotal_formula_id"
				:items="subtotalFormualOpts"
				label="Formula"
			/>

			<!--
			TODO: number format settings
			<FmBtn>Format Settings</FmBtn>
			 -->

			<FmInputText
				v-model="component.settings.top_left_title"
				label="Matrix Top Left Title"
			/>

			<FmSelect
				v-model="component.settings.matrix_view"
				:items="matrixViewOpts"
				label="Matrix type"
			/>

		</div>

		<div v-else-if="activeTab === 'advance settings'" class="p-t-16">

			<FmSelect
				:modelValue="component.settings.hide_empty_lines"
				label="Hide empty columns or / and rows"
				:items="hideEmptyLinesOpts"
				clearBtn
				@update:modelValue="newVal => component.settings.hide_empty_lines = newVal ? newVal : ''"
			/>

			<h3 class="text-bold m-b-24">Styles</h3>

			<FmSelect
				v-model="component.settings.styles.cell.text_align"
				label="Cell Text Align"
				:items="cellTextAlignOpts"
			/>

			<FmCheckbox
				v-model="component.settings.auto_scaling"
				label="Scale matrix"
				class="m-b-24"
			/>

			<FmCheckbox
				v-model="component.settings.calculate_name_column_width"
				label="Calculate width for column with names"
				class="m-b-24"
			/>

		</div>

		<div v-else-if="activeTab === 'menu settings'" class="p-t-16">

			<FmAttributesSelect
				:modelValue="availableAxisXKeys"
				title="Axis X Columns"
				:attributes="evAttrsStore.getDataForAttributesSelector(component.settings.content_type)"
				:valueType="10"
				:contentType="component.settings.content_type"
				multiselect
				@selectedAttributesChanged="newVal => setAvailableAttrs(newVal, 'available_axis_x_attributes')"
				class="dashboard-field m-b-24"
			/>

			<FmAttributesSelect
				:modelValue="availableAxisYKeys"
				title="Axis Y Columns"
				:attributes="evAttrsStore.getDataForAttributesSelector(component.settings.content_type)"
				:valueType="10"
				:contentType="component.settings.content_type"
				multiselect
				@selectedAttributesChanged="newVal => setAvailableAttrs(newVal, 'available_axis_y_attributes')"
				class="dashboard-field m-b-24"
			/>

			<FmAttributesSelect
				:modelValue="availableValueKeys"
				title="Values"
				:attributes="evAttrsStore.getDataForAttributesSelector(component.settings.content_type)"
				:valueType="20"
				:contentType="component.settings.content_type"
				multiselect
				@selectedAttributesChanged="newVal => setAvailableAttrs(newVal, 'available_value_attributes')"
				class="dashboard-field m-b-24"
			/>

		</div>

		<div v-show="activeTab === 'linking'" class="p-t-16">

<!--			<div v-for="input in component.inputs" class="flex-row">

				<FmCard>
					<div>
						<h3>{{ input.name }}</h3>
						Linked to:

						<div
							v-for="(outputData, compUid) in input.subscribedTo"
							:key="compUid"
						>

							<FmSelect
								:modelValue="compUid"
								label="component"
								:items="getLinkCompOpts(input)"
								prop_id="uid"
								prop_name="user_code"
								@update:modelValue="selCompUid => subscribeToComp(selCompUid, input)"
							/>

							<FmAttributesSelect
								v-if="outputData.dynamicOutputs"
								v-model="outputData.propertyName"
								label="Attribute"
								:items="evAttrsStore.getDataForAttributesSelector( dashStore.getComponent(compUid) )"
							/>


						</div>

						<FmBtn
							type="basic"
							@click="openInputLinking(input)"
						>LINK</FmBtn>

						<FmBtn
							type="basic"
							icon="close"
							@click="unlinkInput(input)"
						/>

					</div>
				</FmCard>

			</div>

			<FmBtn>Add input</FmBtn>-->
			<PagesDashboardSettingsLinkingTab
				:inputs="inputsList"
				:outputs="outputsList"
				@update:inputs="newVal => emit('update:inputs', newVal)"
				@update:outputs="newVal => emit('update:outputs', newVal)"
			/>

		</div>

	</div>

</template>

<script setup>

	import {copyRvLayoutForDashboard} from "~/utils/dashboard";

	const props = defineProps({
		tab: Number,
		inputs: {
			type: Array,
			default: [],
		},
		outputs: {
			type: Array,
			default: [],
		},
	});

	const emit = defineEmits(['update:inputs', 'update:outputs'])

	const dashStore = useStoreDashboard();
	const layoutsStore = useLayoutsStore();
	const evAttrsStore = useEvAttributesStore();

	let { component, updateComponent } = inject('component');

	// if (!component.value.inputs) component.value.inputs = [];
	let inputsList = ref( JSON.parse(JSON.stringify(props.inputs)) || [] );
	let outputsList = ref( JSON.parse(JSON.stringify(props.outputs)) || [] );

	watch(
		() => props.inputs,
		() => {

			if ( Array.isArray(props.inputs) ) {
				inputsList.value =  JSON.parse(JSON.stringify(props.inputs));
			} else {
				inputsList.value = [];
			}

		}
	)

	watch(
		() => props.outputs,
		() => {

			if (Array.isArray(props.outputs)) {
				outputsList.value =  JSON.parse(JSON.stringify(props.outputs));
			} else {
				outputsList.value = [];
			}

		}
	)

	let selDashTab = ref(props.tab);
	let dashTabsList = computed(() => {
		return [...dashStore.tabs, {id: 1, name: 'Top place'}]
	});

	const tabsList = ['main', 'advance settings', 'menu settings', 'linking', 'calculation'];
	let activeTab = ref('main');

	/*let settings = reactive({
		layout: null,
		content_type: "reports.balancereport",
		axisY: null,
		axisX: null,
		valueKey: null,
		subtotal_formula_id: 1,
		matrix_view: 'usual',
		styles: {
			cell: {
				text_align: 'center'
			}
		},
		auto_refresh: false,
		auto_scaling: false,
		calculate_name_column_width: false,
		// linked_components: {},
		hide_empty_lines: '',
		filters: {
			show_filters_area: false,
			show_use_from_above_filters: false,
		},
		user_settings: {}
	});*/

	const contentTypeOpts = [
		{id: "reports.balancereport", name: 'Balance report'},
		{id: "reports.plreport", name: 'P&L report'},
		{id: "reports.plreportperformance", name: 'Transaction report'},
	];

	const subtotalFormualOpts = [
		{id: 1, name: 'SUM'},
		{id: 2, name: 'Weighted Market Value'},
		{id: 3, name: 'Weighted Market Value %'},
		{id: 4, name: 'Weighted Exposure'},
		{id: 5, name: 'Weighted Exposure %'},
		{id: 6, name: 'Avg. Weighted Market Value'},
		{id: 7, name: 'Avg. Weighted Market Value %'},
		{id: 8, name: 'Avg. Weighted Exposure'},
		{id: 9, name: 'Avg. Weighted Exposure %'},
	];

	const matrixViewOpts = [
		{id: 'usual', name: 'Ordinary'},
		{id: 'fixed-totals', name: 'With fixed totals'},
	];

	const hideEmptyLinesOpts = [
		{id: 'columns', name: 'Hide columns'},
		{id: 'rows', name: 'Hide rows'},
		{id: 'columns_rows', name: 'Hide columns and rows'},
	];

	let cellTextAlignOpts = [
		{id: 'left', name: 'Left'},
		{id: 'center', name: 'Center'},
		{id: 'right', name: 'Right'},
	];

	let layoutsList = ref(null);
	let attrs = ref([]);

	watchEffect(async () => {

		const res = await layoutsStore.getListLayoutsLight(component.value.settings.content_type);

		if ( !res.error ) {
			layoutsList.value = res.filter(layout => !layout.user_code.startsWith('system_autosave_') );
		}

	});

	const getAvailableAttrsKeys = prop => {

		if ( !component.value.settings[prop] ) {
			return null;
		}

		return component.value.settings[prop].map(attrData => {
			return attrData.attribute_data.key;
		})
	};

	const availableAxisXKeys = computed( () => getAvailableAttrsKeys('available_axis_x_attributes') );
	const availableAxisYKeys = computed( () => getAvailableAttrsKeys('available_axis_y_attributes') );
	const availableValueKeys = computed( () => getAvailableAttrsKeys('available_value_attributes') );

	function setAvailableAttrs(attributes, settingsProp) {

		component.value.settings[settingsProp] = attributes.map( (attr, index) => {

			const layoutName = attr.layout_name || '';
			delete attr.layout_name;

			return {
				attribute_data: attr,
				layout_name: layoutName,
				order: index,
			};

		});

	}

	attrs.value = evAttrsStore.getDataForAttributesSelector(component.value.settings.content_type);

</script>

<style lang="scss" scoped>

</style>
