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
	<div style="width: 630px;">
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

			<div class="flex-row">
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

			</div>

			<FmAttributesSelect
				v-model="component.settings.axisX"
				title="Axis X Columns"
				:attributes="attrs"
				:valueType="10"
				:contentType="component.settings.content_type"
				:disabled="!component.settings.layout"
				class="m-b-24"
			/>

			<FmAttributesSelect
				v-model="component.settings.axisY"
				title="Axis Y Columns"
				:attributes="attrs"
				:valueType="10"
				:contentType="component.settings.content_type"
				:disabled="!component.settings.layout"
				class="m-b-24"
			/>

			<FmAttributesSelect
				v-model="component.settings.valueKey"
				title="Value"
				:attributes="attrs"
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
				title="Axis X Columns 1"
				:attributes="attrs"
				:valueType="10"
				:contentType="component.settings.content_type"
				multiselect
				@selectedAttributesChanged="newVal => setAvailableAttrs(newVal, 'available_axis_x_attributes')"
				class="dashboard-field m-b-24"
			/>

			<FmAttributesSelect
				:modelValue="availableAxisYKeys"
				title="Axis Y Columns"
				:attributes="attrs"
				:valueType="10"
				:contentType="component.settings.content_type"
				multiselect
				@selectedAttributesChanged="newVal => setAvailableAttrs(newVal, 'available_axis_y_attributes')"
				class="dashboard-field m-b-24"
			/>

			<FmAttributesSelect
				:modelValue="availableValueKeys"
				title="Values"
				:attributes="attrs"
				:valueType="20"
				:contentType="component.settings.content_type"
				multiselect
				@selectedAttributesChanged="newVal => setAvailableAttrs(newVal, 'available_value_attributes')"
				class="dashboard-field m-b-24"
			/>

		</div>

		<div v-else-if="activeTab === 'linking'" class="p-t-16"></div>

		<div v-else-if="activeTab === 'calculation'" class="p-t-16">
			<BaseMultiSelectInput
				v-model="date1SelectModel"
				:items="dateControlsOpts"
				label="Date"
				clearBtn
			/>

		</div>



	</div>
</template>

<script setup>

	const props = defineProps({
		tab: Number,
	});

	const dashStore = useStoreDashboard();
	const layoutsStore = useLayoutsStore();
	const evAttrsStore = useEvAttributesStore();

	const component = inject('component');
	console.log("testing1090 DashboardAddMatrixModal component", component);
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

	function setAvailableAttrs(attrs, settingsProp) {

		component.value.settings[settingsProp] = attrs.map( (attr, index) => {

			const layoutName = attr.layout_name || '';
			delete attr.layout_name;

			return {
				attribute_data: attr,
				layout_name: layoutName,
				order: index,
			};

		});
		console.log("testing1090 setAvailableAttrs ", component.value.settings);
	}

	attrs.value = evAttrsStore.getDataForAttributesSelector(component.value.settings.content_type);
	//# region tab: CALCULATION
	let dateControlsOpts = computed(() => {

		const result = [];

		dashStore.props.outputs.forEach(outputData => {

			if (outputData.component_id === component.value.uid || outputData.value_type !== 40) {
				return;
			}

			const compUserCode = dashStore.components.find(comp => comp.uid === outputData.component_id).user_code;

			result.push({
				id: outputData.uid,
				name: `${compUserCode}. ${outputData.name}`,
			})

		})

		return result;

	});

	let date1Key;

	switch (component.value.settings.content_type) {
		case 'reports.balancereport':
			date1Key = 'report_date';
			break;
		case 'reports.plreport':
			date1Key = 'pl_first_date';
			break;
		case 'reports.transactionreport':
			date1Key = 'begin_date';
			break;
	}

	let date1SelectModel = computed({
		set(newVal) {

			const inputIndex = component.value.inputs.findIndex( inputData => inputData.key === date1Key );

			component.value.inputs[inputIndex]._children = newVal;

		},
		get() {

			component.value.inputs.find( inputData => inputData.key === date1Key ).children;

		}
	})
	//# endregion tab: CALCULATION

</script>

<style lang="scss" scoped>

</style>
