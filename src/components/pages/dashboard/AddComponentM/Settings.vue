<template>
	<PagesDashboardSettingsMatrixModal
		v-if="component.componentName === 'DashboardMatrix'"
		:tab="tab"
		v-model:inputs="component.inputs"
		v-model:outputs="component.outputs"
		v-bind="$attrs"
		class="settings"
	/>

	<PagesDashboardSettingsReportViewerModal
		v-else-if="component.componentName === 'FinmarsGrid'"
		:tab="tab"
		v-bind="$attrs"
		class="settings"
	/>

	<div v-else v-bind="$attrs" class="settings flex">
		<div class="settings_coll">
			<h4>General</h4>

			<BaseInput v-model="component.user_code" label="User code" required />
			<FmSelect v-model="component.tab" :items="tabList" label="Tab" />
			<h4>Settings</h4>

			<template v-for="stg in component.settings">
				<FmSelect
					v-if="stg.view.type == 'select'"
					class="prop_row"
					v-model="stg.default_value"
					:label="stg.name"
					:items="stg.view.items"
				/>

				<LazySelectorsLayout
					v-else-if="stg.view.type == 'layout'"
					class="prop_row"
					v-model="stg.default_value"
					:settings="component.settings"
					:label="stg.name"
				/>
				<BaseInput v-else v-model="stg.default_value" :label="stg.name" />
			</template>
		</div>

		<div class="settings_coll">
			<h4>Inputs</h4>

			<div>
				<PagesDashboardAddComponentMPropEditor
					v-for="prop in component.inputs"
					:prop="prop"
					type="inputs"
				/>
			</div>
		</div>

		<div class="settings_coll">
			<h4>Outputs</h4>

			<PagesDashboardAddComponentMPropEditor
				v-for="prop in component.outputs"
				:prop="prop"
				type="outputs"
			/>
		</div>
	</div>
</template>

<script setup>
	const props = defineProps({
		tab: Number,
	})
	const dashStore = useStoreDashboard()
	const { component } = inject('component')
	console.log('component:', component)

	component.value.tab = props.tab
	let tabList = [...dashStore.tabs, { id: 1, name: 'Top place' }]
</script>

<style lang="scss" scoped>
	h4 {
		font-size: 16px;
		font-weight: 500;
		padding-bottom: 10px;
	}
	.settings {
		padding: 20px;
	}
	.settings_coll {
		width: 300px;

		& + & {
			padding-left: 20px;
		}
	}
	.inherit_checkbox {
		margin-top: -18px;
		margin-bottom: 25px;
	}
</style>
