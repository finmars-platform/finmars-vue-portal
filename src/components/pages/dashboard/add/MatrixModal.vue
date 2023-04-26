<template>

	<BaseModal title="New Report Viewer Matrix Component">

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
	</BaseModal>
</template>

<script setup>

	import useEvAttributesStore from "~/stores/useEvAttributesStore";

	const props = defineProps({
		tab: String,
	});

	const dashStore = useStoreDashboard();
	const layoutsStore = useLayoutsStore();

	let userCode = ref();
	let selDashTab = ref(props.tab);
	let dashTabsList = computed(() => {
		return [...dashStore.tabs, {id: 1, name: 'Top place'}]
	});

	const tabsList = ['main', 'advance settings', 'menu settings', 'linking', /* CALCULATION, */];
	let activeTab = ref('main');

	let settings = ref({
		layout: null,
		content_type: "reports.balancereport",
		axisY: null,
		axisX: null,
		valueKey: null,
	});

	let contentTypeOpts = [
		{id: "reports.balancereport", name: 'Balance report'},
		{id: "reports.plreport", name: 'P&L report'},
		{id: "reports.plreportperformance", name: 'Transaction report'},
	];

	let layoutsList = ref(null);

	watchEffect(async () => {

		const res = await layoutsStore.getListLayoutsLight(settings.value.content_type);

		if ( !res.error ) {
			layoutsList.value = res.filter(layout => !layout.user_code.startsWith('system_autosave_') );
		}

	});

	function addComponent(cancel) {
		/*let new_widget = {
		name: activeWidget.value.name,
		user_code: activeWidget.value.user_code,
		componentName: activeWidget.value.id,
		colls: activeWidget.value.minColls,
		rows: activeWidget.value.minRows,
		minColls: activeWidget.value.minColls,
		minRows: activeWidget.value.minRows,
		settings: {},
		tab: activeTab.value,
		id: generateId(activeWidget.value.id),
	}*/
		cancel()
	}

	function init() {


	}

	init();

</script>

<style lang="scss" scoped>

</style>
