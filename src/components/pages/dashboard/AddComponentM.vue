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
					:class="{active: activeComp.id == item.id}"
					@click="activeComp = item"
					@dblclick="activeComp = item"
				>
					{{ item.name }}
				</div>
			</div>

			<h3>Base components</h3>

			<div class="fm_list">
				<div class="fm_list_item"
					v-for="item in bases"
					:class="{active: activeComp.id == item.id}"
					@click="activeComp = item"
					@dblclick="activeComp = item"
				>
					{{ item.name }}
				</div>
			</div>
		</template>

		<div class="settings flex" v-if="step == 'settings'">
			<div class="settings_coll">
				<h4>General</h4>

				<BaseInput
					v-model="activeComp.user_code"
					label="User code"
					required
				/>
				<FmSelect
					v-model="activeTab"
					:items="tabList"
					label="Tab"
				/>
			</div>

			<div class="settings_coll">
				<h4>Inputs</h4>

				<div v-for="item in activeComp.inputs">
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

				<div v-for="item in activeComp.outputs">
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
				<FmBtn @click="continueAddition(cancel)">
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

	const emit = defineEmits(['addMatrix'])

	const dashStore = useStoreDashboard()

	let activeTab = ref(props.tab)
	let step = ref('component')
	let activeComp = ref({})
	let propMode = reactive({})
	let systems = computed(() => {
		return widgetList.filter((item) => item.group == 'system')
	})
	let bases = computed(() => {
		return widgetList.filter((item) => item.group == 'base')
	})
	let tabList = computed(() => {
		return [...dashStore.tabs, {id: 1, name: 'Top place'}]
	})

	function prepareItems(childProp) {
		let newProps = dashStore.scope
			.filter((prop) => {
				return prop.type == childProp.type && prop.direct != childProp.direct
			})
			.map((prop) => {
				return {
					id: prop.id,
					name: `${dashStore.components.find(item => item.id == prop.cid).user_code}/${prop.name}[${prop.__val}]`,
				}
			})

		return JSON.parse(JSON.stringify(newProps))
	}

	function continueAddition(cancel) {
		console.log("testing1090 continueAddition", activeComp, activeComp.value.id);
		if (activeComp.value.id === 'matrix') {

			emit('addMatrix');
			cancel();

		}

		if (step.value === 'settings') addComponent(cancel);

		step.value = 'settings';

	}

	function addComponent( cancelFunc ) {
		let new_widget = {
			name: activeComp.value.name,
			user_code: activeComp.value.user_code,
			componentName: activeComp.value.id,
			colls: activeComp.value.minColls,
			rows: activeComp.value.minRows,
			minColls: activeComp.value.minColls,
			minRows: activeComp.value.minRows,
			settings: {},
			tab: activeTab.value,
			id: generateId(activeComp.value.id),
		}

		dashStore.$patch((state) => {
			dashStore.components.push(new_widget)

			activeComp.value.inputs.forEach((prop) => {
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
			activeComp.value.outputs.forEach((prop) => {
				const propId = new_widget.id + Math.random(0, 1)

				let newProp = reactive({
					id: propId,
					cid: new_widget.id,
					name: prop.name,
					direct: prop.direct,
					type: prop.type,
					__val: prop.value,
				})

				state.scope.push(newProp)

				if ( !prop.children ) return false

				prop.children.forEach((id) => {
					let inputProp = state.scope.find((item) => item.id == id)

					inputProp.parents.push(propId)
				})
			})
			dashStore.setPropsWatchers()
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
