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
				v-model:contentType="component.settings.content_type"
				@userCodeChanged="newUc => component.settings.user_code = newUc"
			/>

		</div>

		<div v-else-if="activeTab === 'linking'" class="p-t-16">

			<PagesDashboardAddLinkingTab />

		</div>

	</div>
</template>

<script setup>

	const props = defineProps({
		tab: Number,
	});

	const dashStore = useStoreDashboard();

	let { component, updateComponent } = inject('component');
	console.log("testing1090 components", component.value);
	if (!component.value.inputs) component.value.inputs = [];

	let selDashTab = ref(props.tab);
	let dashTabsList = computed(() => {
		return [...dashStore.tabs, {id: 1, name: 'Top place'}]
	});

	const tabsList = ['main', 'linking'];
	let activeTab = ref('main');

</script>

<style lang="scss" scoped>

</style>
