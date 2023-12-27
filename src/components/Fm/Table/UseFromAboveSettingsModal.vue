<template>
	<BaseModal
		title="Use from above manager"
		:modelValue="modelValue"
		@update:modelValue="emit('update:modelValue')"
	>

		<div class="flex-row m-b-16">
			<FmSelect
				:modelValue="vm.attrsContentType"
				label="Report Type"
				:items="vm.reportTypesOpts"
				class="inputs_width"
				@update:modelValue="vm.onAttrsDatasetChange"
			/>
		</div>

		<div class="flex-row">

<!--			<table-attribute-selector title="Select field"
									  dialog-title="Select field"
									  available-attrs="vm.attributes"
									  item="vm.attributeTypeKey"
									  is-report="true"
									  is-disabled="!vm.attrsContentType"
									  class="dashboard-constructor-field1 m-r-10"
									  style="width: 400px;"></table-attribute-selector>-->

			<FmAttributesSelect
				title="Select field"
				v-model="vm.attributeTypeKey"
				:content_type="vm.attrsContentType"
				:valueType="value_type"
				:attributes="vm.attributes"
				:disabled="!vm.attrsContentType"
				class="m-r-10"
				style="min-width: 400px;"
			/>

			<FmSelect
				v-model="vm.filterType"
				:items="vm.filterTypes"
				:disabled="vm.filterTypesSelDisabled"
				class="inputs_width"
			/>

		</div>

		<template #controls="{ cancel }">
			<div class="flex sb">
				<FmBtn type="basic" @click="cancel()">cancel</FmBtn>
				<FmBtn @click="vm.agree(cancel)">OK</FmBtn>
			</div>
		</template>
	</BaseModal>

</template>

<script setup>

// stores
let evAttrsStore = useEvAttributesStore();

// props, emits
let props = defineProps({
	modelValue: Boolean,
	value_type: { // to filter attribute types
		type: Number,
		required: true,
	},
	content_type: String,
	attributeTypeKey: String,
	filterType: String,
});

let emit = defineEmits(['update:modelValue', 'save']);

//# region variables, refs, computed
let vm = reactive({});

vm.filterTypes = [];

vm.attributes = [];

vm.reportTypesOpts = [
	{ id: 'reports.balancereport', name: 'Balance Report'},
	{ id: 'reports.plreport', name: 'P&L Report'},
	{ id: 'reports.transactionreport', name: 'Transaction Report'},
];

//# endregion

//# region hooks
//# endregion

// watchers
watch(
	() => props.modelValue,
	() => {

		if (props.modelValue) {
			init();
		}

	}
);

/*vm.getAttributes = function () {

	switch (props.value_type) {
		case 10:
		case 30:
			vm.attributes = attributeDataService.getAllAttributesByEntityType(vm.attrsContentType).filter(function (attr) {
				if (attr.value_type === 10 || attr.value_type === 30) {
					return true;
				}
				return false;
			});
			break;
		case 20:
			vm.attributes = attributeDataService.getAllAttributesByEntityType(vm.attrsContentType).filter(function (attr) {
				return attr.value_type === 20;
			});
			break;
		case 40:
			vm.attributes = attributeDataService.getAllAttributesByEntityType(vm.attrsContentType).filter(function (attr) {
				return attr.value_type === 40;
			});
			break;
	}

};*/

vm.onAttrsDatasetChange = function (newVal) {

	vm.attrsContentType = newVal;

	vm.attributeTypeKey = null;

	vm.attributes = evAttrsStore.getDataForAttributesSelector(
		vm.attrsContentType,
		props.value_type
	);

};

vm.agree = function (cancelCb) {

	cancelCb();

	const resData = {
		attributeTypeKey: vm.attributeTypeKey,
		filterType: vm.filterType,
		attrsContentType: vm.attrsContentType
	};

	emit('save', resData);

};

function init() {

	vm.attrsContentType = props.content_type;
	vm.attributeTypeKey = props.attributeTypeKey;

	//# region filterType
	vm.filterType = props.filterType;

	switch (props.value_type) {
		case 10:
		case 30:
		case 'field':

			vm.filterTypes = [{
				id: 'contains',
				name: 'CONTAINS'
			},
				{
					id: 'equal',
					name: 'EQUAL'
				}];

			break;

		case 20:
		case 40:

			vm.filterTypes = [
				{
					id: 'equal',
					name: 'EQUAL',
				},
				{
					id: 'greater',
					name: 'GREATER THAN'
				},
				{
					id: 'greater_equal',
					name: 'GREATER OR EQUAL TO'
				},
				{
					id: 'less',
					name: 'LESS THAN'
				},
				{
					id: 'less_equal',
					name: 'LESS OR EQUAL TO'
				}
			];

			break;
	}

	vm.filterTypesSelDisabled = vm.filterTypes.length < 2;

	if (!vm.attributeTypeKey) {
		vm.filterType = vm.filterTypes[0].id;
	}
	//# endregion

	if (vm.attrsContentType) {

		vm.attributes = evAttrsStore.getDataForAttributesSelector(
			vm.attrsContentType,
			props.value_type,
		);

	}

}

init();

</script>

<style scoped lang="scss">
	:deep(.fm_select) {
		margin-bottom: 0;
	}

	.inputs_width {
		width: 260px;
	}
</style>
