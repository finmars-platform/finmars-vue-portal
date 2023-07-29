<template>
	<BaseModal no_padding title="Add component">
		<PagesDashboardAddComponentMChooseComponent v-if="step == 'component'" />

		<PagesDashboardAddComponentMSettings v-if="step == 'settings'" :tab="tab" />

		<template #controls="{ cancel }">
			<div class="flex sb">
				<FmBtn
					type="text"
					@click="step === 'component' ? cancel() : (step = 'component')"
					>cancel</FmBtn
				>
				<FmBtn
					@click="
						step == 'settings' ? addComponent(cancel) : (step = 'settings')
					"
				>
					{{ step == 'settings' ? 'finish' : 'next' }}
				</FmBtn>
			</div>
		</template>
	</BaseModal>
</template>

<script setup>
	const props = defineProps({
		tab: Number,
	})

	const dashStore = useStoreDashboard()

	let step = ref('component')
	let component = ref({})

	function updateComponent(componentData) {
		component.value = componentData;
		console.log("testing1090.updateComponent ", component.value );
	}

	provide('component', {
		component,
		updateComponent,
	})

	function addComponent(cancelFunc) {
		if (
			!component.value.user_code ||
			!/\w{4,30}/.test(component.value.user_code)
		) {
			useNotify({ type: 'warn', title: 'User code is requered' })
			return false
		}
		let new_comp = {
			uid: generateId(component.value.componentName),
			user_code: component.value.user_code,
			name: component.value.name,
			componentName: component.value.componentName,
			tab: component.value.tab,
			scopes: component.value.scopes,
			dynamicOutputs: component.value.dynamicOutputs,

			colls: component.value.minColls,
			rows: component.value.minRows,
			minColls: component.value.minColls,
			minRows: component.value.minRows,

			settings: component.value.settings,
		}

		dashStore.$patch((state) => {
			console.log( "testing1090.addComponent new_comp", JSON.parse(JSON.stringify( new_comp )) );
			dashStore.components.push(new_comp)

			component.value.inputs.forEach((prop) => {
				state.props.inputs.push({
					uid: new_comp.uid + ' ' + prop.name,
					component_id: new_comp.uid,
					user_code: prop.user_code,
					name: prop.name,
					type: prop.type,
					key: prop.key,

					view: prop.view,
					subscribedTo: prop.subscribedTo,

					default_value: prop.default_value,
					__val: prop.default_value,
				})
			})

			component.value.outputs.forEach((prop) => {
				let newProp = reactive({
					uid: new_comp.uid + '_' + prop.name,
					component_id: new_comp.uid,
					user_code: prop.user_code,
					name: prop.name,
					type: prop.type,
					key: prop.key,
					value_type: prop.value_type,

					view: prop.view,

					default_value: prop.default_value,
					__val: prop.default_value,
				})

				if (newProp.value_type === 100) {
					newProp.value_content_type = prop.value_content_type;
				}

				state.props.outputs.push(newProp)

				prop._children.forEach((uid) => {
					let inputProp = state.props.inputs.find((item) => item.uid == uid)

					inputProp.subscribedTo.push(newProp.uid)
				})
			})

			dashStore.setPropsWatchers()
		})
		cancelFunc()
	}
	function generateId(id) {
		return id + Date.now()
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
