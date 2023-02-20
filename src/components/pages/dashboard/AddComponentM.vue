<template>
	<BaseModal
		no_padding
		title="Add component"
	>
		<template v-if="step == 'component'">
			<h3>System components</h3>

			<div class="fm_list">
				<div class="fm_list_item"
					v-for="item in systems"
					:class="{active: activeWidget.id == item.id}"
					@click="activeWidget = item"
					@dblclick="activeWidget = item"
				>
					{{ item.name }}
				</div>
			</div>

			<h3>Base components</h3>

			<div class="fm_list">
				<div class="fm_list_item"
					v-for="item in bases"
					:class="{active: activeWidget.id == item.id}"
					@click="activeWidget = item"
					@dblclick="activeWidget = item"
				>
					{{ item.name }}
				</div>
			</div>
		</template>

		<div class="settings flex" v-if="step == 'settings'">
			<div class="settings_coll">
				<h4>General</h4>

				<BaseInput
					v-model="activeWidget.user_code"
					label="User code"
					required
				/>
				<FmSelect
					v-model="activeWidget.tab"
					:items="tabList"
					label="Tab"
				/>
			</div>

			<div class="settings_coll">
				<h4>Inputs</h4>

				<div v-for="item in activeWidget.inputs">
					<BaseInput
						v-if="!propMode[item.name]"
						v-model="item.value"
						:label="item.name"
					/>
					<BaseMultiSelectInput
						v-else
						v-model="item.parents"
						:title="item.name"
						:items="prepareItems(item)"
						item_id="id"
					/>

					<FmCheckbox
						class="inherit_checkbox"
						v-model="propMode[item.name]"
						:label="`Inherit value`"
					/>
				</div>

			</div>

			<div class="settings_coll">
				<h4>Outputs</h4>

				<div v-for="item in activeWidget.outputs">
					<BaseMultiSelectInput
						v-model="item.children"
						:title="item.name"
						:items="prepareItems(item)"
						item_id="id"
					/>
				</div>
			</div>
		</div>

		<template #controls="{cancel}">
			<div class="flex sb">
				<FmBtn type="text" @click="step = 'component'">cancel</FmBtn>
				<FmBtn @click="step == 'settings' ? addComponent(cancel) : step = 'settings'">
					{{ step == 'settings' ? 'finish' : 'next' }}
				</FmBtn>
			</div>
		</template>
	</BaseModal>
</template>

<script setup>

	import widgetList from '~/assets/data/widgets.js'

	const props = defineProps({
		tab: String,
	})

	const dashStore = useStoreDashboard()

	let step = ref('component')
	let activeWidget = ref({})
	let propMode = reactive({})
	let systems = computed(() => {
		return widgetList.filter((item) => item.group == 'system')
	})
	let bases = computed(() => {
		return widgetList.filter((item) => item.group == 'base')
	})
	let tabList = computed(() => {
		return [...dashStore.tabs, {id: null, name: 'Top place'}]
	})

	function prepareItems(childProp) {
		let newProps = dashStore.scope
			.filter((prop) => {
				return prop.type == childProp.type && prop.direct != childProp.direct
			})
			.map((prop) => {
				return {
					id: prop.id,
					name: `${dashStore.widgets.find(item => item.id == prop.cid).name}/${prop.name}[${prop.__val}]`,
				}
			})

		return JSON.parse(JSON.stringify(newProps))
	}

	function addComponent( cancelFunc ) {
		let new_widget = {
			name: activeWidget.value.name,
			user_code: activeWidget.value.user_code,
			componentName: activeWidget.value.id,
			colls: activeWidget.value.minColls,
			rows: activeWidget.value.minRows,
			minColls: activeWidget.value.minColls,
			minRows: activeWidget.value.minRows,
			settings: {},
			tab: props.tab ? props.tab : null,
			id: generateId(activeWidget.value.id),
		}

		dashStore.$patch((state) => {
			dashStore.widgets.push(new_widget)

			activeWidget.value.inputs.forEach((prop) => {
				state.scope.push({
					id: new_widget.id + Math.random(0, 1),
					cid: new_widget.id,
					name: prop.name,
					type: prop.type,
					direct: prop.direct,
					__val: prop.value,
					parents: prop.parents,
				})
			})
			activeWidget.value.outputs.forEach((prop) => {
				const propId = new_widget.id + Math.random(0, 1)

				state.scope.push({
					id: propId,
					cid: new_widget.id,
					name: prop.name,
					direct: prop.direct,
					type: prop.type,
					__val: prop.value,
					children: prop.children,
				})

				prop.children.forEach((id) => {
					let inputProp = state.scope.find((item) => item.id == id)

					inputProp.parents.push(propId)
				})
			})
		})
		cancelFunc()
	}
	function generateId( id ) {
		return id + Date.now()
	}
</script>

<style lang="scss" scoped>
	h3 {
		padding: 10px 20px;
		font-weight: 500;
	}
	h4 {
		font-size: 16px;
		font-weight: 500;
		padding-bottom: 5px;
	}
	.fm_list_item {
		padding: 0 20px;
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
