<template>
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

			<LazySelectorsLayout
				v-model="component.settings.layout"
				v-model:content_type="component.settings.content_type"
				@userCodeChanged="newUc => component.settings.user_code = newUc"
			/>

		</div>

		<div v-else-if="activeTab === 'linking'" class="p-t-16">

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

	let { component, updateComponent } = inject('component');
	console.log("testing1090 components", component.value);
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

</script>

<style lang="scss" scoped>

</style>
