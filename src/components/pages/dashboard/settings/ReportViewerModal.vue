<template>
	<div v-bind="$attrs"
			 style="width: 630px;">
		<FmTabs v-model="activeTab" :tabs="tabsList" class="width-100" />

		<div v-show="activeTab === 'main'" class="p-t-16">
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

			<LazySelectorsLayout
				:modelValue="component.settings.layout"
				:content_type="component.settings.content_type"
				@userCodeChange="newVal => component.settings.layoutUserCode = newVal"
				@update:modelValue="newVal => component.settings.layout = copyRvLayoutForDashboard(newVal)"
				@update:content_type="onContentTypeChange"
			/>

		</div>

		<div v-if="activeTab === 'linking'" class="p-t-16">

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

	import componentsList from "~/components/pages/dashboard/components";

	const props = defineProps({
		tab: Number,
		inputs: {
			type: Array,
			default() { return [] },
		},
		outputs: {
			type: Array,
			default() { return [] },
		},
	});

	const emit = defineEmits(['update:inputs', 'update:outputs'])

	const dashStore = useStoreDashboard();

	let { component, updateComponent } = inject('component');

	if (!component.value.inputs) component.value.inputs = [];

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

	const tabsList = ['main', 'linking'];
	let activeTab = ref('main');

	function getDefaultInputs() {

		const inputs = componentsList.find(component => {

			return component.componentName === 'FinmarsGrid';

		}).inputs;

		return structuredClone(inputs);

	}

	function onContentTypeChange(contentType) {

		/*inputsList.value = inputsList.value.filter(input => {

			return ![
				'reportOptions__report_date',
				'reportOptions__pl_first_date',
				'reportOptions__begin_date',
				'reportOptions__end_date'
			].includes(input.key);

		});*/

		const inputs = getDashInputsByContentType(contentType);

		inputsList.value = inputs.concat( getDefaultInputs() );

		inputsList.value = inputsList.value.map((input, index) => {
			input.uid = useGenerateUniqueId('input' + index);
			return input;
		});

		emit('update:inputs', inputsList.value);

		component.value.settings.axisX = null;
		component.value.settings.axisY = null;
		component.value.settings.valueKey = null;

		component.value.settings.layout = null;

		component.value.settings.content_type = contentType;

		// component.value.settings.user_settings
	}

</script>

<style lang="scss" scoped>

</style>
