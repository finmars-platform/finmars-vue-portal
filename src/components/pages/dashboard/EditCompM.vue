<template>
	<BaseModal no_padding title="Edit component">
		<PagesDashboardSettingsMatrixModal
			v-if="editable.componentName === 'DashboardMatrix'"
			:tab="editable.tab"
			v-model:inputs="inputs"
			v-model:outputs="outputs"
			class="settings"
		/>

		<PagesDashboardSettingsReportViewerModal
			v-else-if="editable.componentName === 'FinmarsGrid'"
			:tab="editable.tab"
			v-model:inputs="inputs"
			v-model:outputs="outputs"
			class="settings"
		/>

		<div v-else class="settings flex">
			<div class="settings_coll">
				<h4>General</h4>

				<BaseInput v-model="editable.user_code" label="User code" required />
				<FmSelect v-model="editable.tab" :items="tabList" label="Tab" />

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
						:layout="stg.default_value"
						:settings="component.settings"
						:label="stg.name"
					/>
					<BaseInput v-else v-model="stg.default_value" :label="stg.name" />
				</template>
			</div>

			<div class="settings_coll">
				<h4>Inputs</h4>

				<PagesDashboardAddComponentMPropEditor
					v-for="prop in inputs"
					:prop="prop"
					type="inputs"
				/>
			</div>

			<div class="settings_coll">
				<h4>Outputs</h4>

				<PagesDashboardAddComponentMPropEditor
					v-for="prop in outputs"
					:prop="prop"
					type="outputs"
				/>
			</div>
		</div>

		<template #controls="{ cancel }">
			<div class="flex sb">
				<FmBtn type="text" @click="cancel(cancel)">Cancel</FmBtn>
				<FmBtn @click="save(cancel)">Save</FmBtn>
			</div>
		</template>
	</BaseModal>
</template>

<script setup>
	const props = defineProps({
		uid: {
			type: String,
			required: true,
		},
	})
	const dashStore = useStoreDashboard()
	const tabList = [...dashStore.tabs, { id: 1, name: 'Top place' }]

	// let component = dashStore.components.find(item => item.uid == props.uid) || {}
	let component = dashStore.getComponent(props.uid) || {}
	let editable = ref(JSON.parse(JSON.stringify(component)))

	function updateComponent(componentData) {
		editable.value = componentData;
	}

	provide('component', {
		component: editable,
		updateComponent
	}); // used by PagesDashboardSettingsMatrixModal

	let inputs = ref([])
	let outputs = ref([])

	prepareProps()

	function prepareProps() {
		inputs.value = JSON.parse(
			JSON.stringify(
				dashStore.props.inputs.filter(
					(prop) => prop.component_id == component.uid
				)
			)
		)

		dashStore.props.outputs.forEach((prop) => {
			if (prop.component_id != component.uid) return false

			let clonedProp = JSON.parse(JSON.stringify(prop))

			clonedProp._children = dashStore.props.inputs
				.filter((item) => item.subscribedTo.includes(clonedProp.uid))
				.map((item) => item.uid)

			outputs.value.push(clonedProp)
		})
	}
	function cancel(close) {
		// editable.value = {}
		close()
	}

	function save(close) {
		if (
			!editable.value.user_code ||
			!/\w{4,30}/.test(editable.value.user_code)
		) {
			useNotify({ type: 'warn', title: 'User code is requered' })
			return false
		}

		if ( ['DashboardMatrix', 'FinmarsGrid'].includes(editable.value.componentName) ) {

			dashStore.setComponent(editable.value);

			dashStore.$patch((state) => {
				inputs.value.forEach((prop) => {
					let input = state.props.inputs.find((item) => item.uid == prop.uid)

					input.default_value = prop.default_value
					input.subscribedTo = prop.subscribedTo
				})

				outputs.value.forEach((prop) => {
					let output = state.props.outputs.find((item) => item.uid == prop.uid)

					output.default_value = prop.default_value

					let children = state.props.inputs.filter((item) =>
						item.subscribedTo.includes(prop.uid)
					)

					children.forEach((child) => {
						let index = child.subscribedTo.findIndex((uid) => uid == prop.uid)

						if (index !== -1) {
							child.subscribedTo.splice(index, 1)
						}
					})

					prop._children.forEach((uid) => {
						let children = state.props.inputs.find((item) => item.uid == uid)
						children.subscribedTo.push(prop.uid)
					})
				})

			})

		} else {
			dashStore.$patch((state) => {
				component.user_code = editable.value.user_code
				component.tab = editable.value.tab
				component.settings = editable.settings

				inputs.value.forEach((prop) => {
					let input = state.props.inputs.find((item) => item.uid == prop.uid)

					input.default_value = prop.default_value
					input.subscribedTo = prop.subscribedTo
				})

				outputs.value.forEach((prop) => {
					let output = state.props.outputs.find((item) => item.uid == prop.uid)

					output.default_value = prop.default_value

					let children = state.props.inputs.filter((item) =>
						item.subscribedTo.includes(prop.uid)
					)

					children.forEach((child) => {
						let index = child.subscribedTo.findIndex((uid) => uid == prop.uid)

						if (index !== -1) {
							child.subscribedTo.splice(index, 1)
						}
					})

					prop._children.forEach((uid) => {
						let children = state.props.inputs.find((item) => item.uid == uid)
						children.subscribedTo.push(prop.uid)
					})
				})
			})
		}
		cancel(close)
	}
</script>

<style lang="scss" scoped>
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
