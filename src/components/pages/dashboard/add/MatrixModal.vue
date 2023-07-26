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

		<div v-else-if="activeTab === 'linking'" class="p-t-16">

			<div v-for="input in component.inputs" class="flex-row">

				<FmCard>
					<div>
						<h3>{{ input.name }}</h3>
						Linked to:

						<div
							v-for="(outputData, compUid) in input.subscribedTo"
							:key="compUid"
						>
<!--						<div
							v-for="outputData in input.subscribedTo"
							:key="outputData.componentName"
						>-->
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

			<FmBtn>Add input</FmBtn>

		</div>

	</div>

	<BaseModal
		v-model="addLinkingData.opened"
		title="Link to component"
	>

		<div>
			<FmSelect
				label="component"
				:modelValue="addLinkingData.comp?.uid"
				:items="getLinkCompOpts(addLinkingData.input, true)"
				prop_id="uid"
				prop_name="user_code"
				attach="body"
				@update:modelValue="uid => addLinkingData.comp = dashStore.getComponent(uid)"
			/>

			<FmAttributesSelect
				v-if="addLinkingData.comp?.dynamicOutputs"
				v-model="addLinkingData.comp.propertyName"
				label="Attribute"
				:items="evAttrsStore.getDataForAttributesSelector( dashStore.getComponent(addLinkingData.comp.uid) )"
			/>
		</div>

		<template #controls>
			<div class="flex aic sb">
				<FmBtn type="text" @click="closeInputLiking">CANCEL</FmBtn>

				<FmBtn @click="subscribeToComp">SAVE</FmBtn>
			</div>
		</template>
	</BaseModal>

</template>

<script setup>

	const props = defineProps({
		tab: Number,
	});

	const dashStore = useStoreDashboard();
	const layoutsStore = useLayoutsStore();
	const evAttrsStore = useEvAttributesStore();

	let { component, updateComponent } = inject('component');
	console.log("testing1090 components", component.value);
	if (!component.value.inputs) component.value.inputs = [];
	// console.log("testing1090 DashboardAddMatrixModal component", component);
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
		// console.log("testing1090 setAvailableAttrs ", component.value.settings);
	}

	attrs.value = evAttrsStore.getDataForAttributesSelector(component.value.settings.content_type);

	//# region LINKING
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
	let date2Key;

	/*let date1SelectModel = computed({
		set(newVal) {

			const inputIndex = component.value.inputs.findIndex( inputData => inputData.key === date1Key );

			component.value.inputs[inputIndex]._children = newVal;

		},
		get() {

			component.value.inputs.find( inputData => inputData.key === date1Key )._children;

		}
	});*/

	let linkingOptsData = {};

	function assembleOptionsForLinking() {

		linkingOptsData = {
			10: [],
			20: [],
			40: [],
			100: {},
		};

		/*component.value.inputs.forEach(input => {

			linkingOptsData[input.key] = dashStore.components.find( comp => {

				if (comp.dynamicOutputs) {
					return true;
				}

				return comp.outputs.find(output => output.value_type === input.value_type);

			});

		})*/

		const components = dashStore.components;

		components.forEach(comp => {

			if (comp.dynamicOutputs) {

				Object.keys(linkingOptsData).forEach(valueType => {

					if (valueType == 100) {

						Object.keys( linkingOptsData[100] ).forEach(contentType => {

							linkingOptsData[100][contentType].push({
								uid: comp.uid,
								user_code: comp.user_code,
							});

						})

					} else {

						linkingOptsData[valueType].push({
							uid: comp.uid,
							user_code: comp.user_code,
						});

					}


				})

			}

		})
		console.log("testing1090 getOptionsForInputs ", linkingOptsData);
		return linkingOptsData;

	}

	function openInputLinking (input) {
		addLinkingData.input = input;
		addLinkingData.opened = true;
	}

	function unlinkInput(input) {

		const inputIndex = component.value.inputs.findIndex(inputData => inputData.uid === input.uid );
		component.value.inputs.splice(inputIndex, 1);

		updateComponent( component.value );

	}

	let addLinkingData = reactive({
		opened: false,
		input: null,
		comp: null,
	});

	function closeInputLiking() {
		addLinkingData.opened = false;
		addLinkingData.comp = null;
		addLinkingData.input = null;
	}

	function subscribeToComp() {

		if (!addLinkingData.input.uid) {
			throw new Error(`Input ${addLinkingData.input.name} has no uid`);
		}
		console.log("testing1090.subscribeToComp addLinkingData", JSON.parse(JSON.stringify( addLinkingData )) );
		const compToSub = dashStore.getComponent(addLinkingData.comp.uid);
		console.log("testing1090.subscribeToComp compToSub", compToSub);
		const input = component.value.inputs.find( inputData => inputData.uid === addLinkingData.input.uid );
		console.log("testing1090.subscribeToComp input", input);
		if (compToSub.dynamicOutputs) {

			input.subscribedTo[compToSub.uid] = {
				componentName: compToSub.name,
				propertyName: addLinkingData.comp.propertyName,
				outputUid: dashStore.props.outputs[0].uid,
			};
			/*input.subscribedTo = [{
				componentName: compToSub.name,
				propertyName: addLinkingData.comp.propertyName,
				outputUid: null,
			}]*/

		} else {

			input.subscribedTo[compToSub.uid] = {
				componentName: compToSub.name,
				outputUid: dashStore.props.outputs[0].uid,
			};
			/*input.subscribedTo = [{
				componentName: compToSub.name,
				outputUid: null,
			}]*/

		}

		updateComponent( component.value );
		console.log( "testing1090.subscribeToComp result ", component.value, input );
		closeInputLiking();

	}

	function getLinkCompOpts (input, filterSelectedComps) {

		if (!input) return;

		let result = dashStore.components
			.filter(comp => {
				console.log("testing1090.getLinkCompOpts comp", comp);
				if (comp.dynamicOutputs) {
					return true;
				}

				/*const differentValueType = !comp.outputs.find( output => {
					return output.value_type === input.value.value_type;
				});*/
				const differentValueType = !dashStore.props.outputs.find( output => {

					return output.component_id === comp.uid &&
						output.value_type === input.value_type;

				});
				console.log("testing1090.getLinkCompOpts differentValueType", differentValueType);
				if (differentValueType) {
					return false;
				}

				if (input.value_type === 100) {

					const differentContentType = !dashStore.props.outputs.find( output => {
						return output.value_content_type === input.value_content_type;
					});
					console.log("testing1090.getLinkCompOpts differentContentType", differentContentType);
					if (differentContentType) {
						return false;
					}

				}
				console.log("testing1090.getLinkCompOpts pass");
				return true;

			});

		if (filterSelectedComps) {

			result = result.filter(comp => {
				return comp.dynamicOutputs || !input.subscribedTo.hasOwnProperty(comp.uid);
			});

		}

		return result;

	}

	//# endregion tab: LINKING

	function init () {

		const date1KeysData = {
			'reports.balancereport': 'report_date',
			'reports.plreport': 'pl_first_date',
			'reports.transactionreport': 'begin_date',
		};

		const date2KeysData = {
			'reports.balancereport': null,
			'reports.plreport': 'report_date',
			'reports.transactionreport': 'end_date',
		};

		date1Key = date1KeysData[component.value.settings.content_type];
		date2Key = date2KeysData[component.value.settings.content_type];

		if (date2Key) {

			component.value.inputs.unshift({
				uid: null,
				component_id: null,
				user_code: null,
				key: 'report_options_date2',
				name: 'Date to',
				value_type: 40,
				// type: '',
				view: {
					type: 'select',
					items: [],
				},
				subscribedTo: [],
				default_value: null,
				__val: null,
			});

		}

		component.value.inputs.unshift({
			uid: null,
			component_id: null,
			user_code: null,
			key: 'report_options_date1',
			name: date2Key ? 'Date from' : 'Date',
			value_type: 40,
			// type: '',
			view: {
				type: 'select',
				items: [],
			},
			subscribedTo: [],
			default_value: null,
			__val: null,
		});

		// linkingOptsData = assembleOptionsForLinking();
		component.value.inputs = component.value.inputs.map((input, index) => {
			input.uid = useGenerateUniqueId('input' + index);
			return input;
		});

	}

	init();

</script>

<style lang="scss" scoped>

</style>
