<template>
	<div>
		<FmHorizontalPanel>
			<template #leftActions>
				<template v-if="!isEdit">
					<FmSelect
						class="m-b-0 m-t-0"
						v-model="dashStore.activeLayoutId"
						:items="dashStore.layoutList"
						label="Layout"
					/>
				</template>

				<div class="flex" v-else>
					<BaseInput
						class="bi_no_margins m-t-0 m-r-4"
						v-model="dashStore.layout.name"
						label="Name"
					/>
					<BaseInput
						class="bi_no_margins m-t-0"
						v-model="dashStore.layout.user_code"
						label="User code"
					/>
				</div>
			</template>

			<template #rightActions>
				<FmBtn v-if="!isEdit" type="basic" @click="create()">Create dashboard</FmBtn>
				<FmBtn v-if="!isEdit" @click="edit()">Edit dashboard</FmBtn>

				<template v-else>
					<FmBtn @click="deleteDashboard()">Delete dashboard</FmBtn>
					<FmBtn type="text" @click="editJSON()">edit JSON</FmBtn>
					<FmBtn type="text" @click="cancelEdit()">cancel</FmBtn>
					<FmBtn @click="save()">save</FmBtn>
				</template>
			</template>
		</FmHorizontalPanel>

		<BaseModal v-model="isOpenJSON" no_padding title="Editor JSON"
			:controls="{
				cancel: {name: 'Cancel'},
				action: {name: 'Save', cb: saveJSON},
			}">
			<v-ace-editor
				v-model:value="content"
				@init="editorInit"
				lang="json"
				theme="monokai"
				style="height: 300px;width: 600px;" />
		</BaseModal>

		<PagesDashboardGrid tab="1" :isEdit="isEdit">
			<PagesDashboardWidgetWrap
				v-for="component of topComponents"
				:key="component.id"
				:component="component"
				:isEdit="isEdit"
			/>
		</PagesDashboardGrid>

		<div class="fm_tabs"
			v-if="dashStore.tabs.length > 1 || isEdit"
		>
			<div class="fm_tabs_item center aic"
				v-for="(tab, index) in dashStore.tabs"
				:key="index"
				:class="{active: tab.id == dashStore.activeTab}"
				@click="dashStore.activeTab = tab.id"
			>
				<input v-if="isEdit" v-model="tab.name" />
				<template v-else>{{ tab.name }}</template>

				<FmIcon v-if="isEdit" @click="delTab(tab.id)" class="m-l-4" icon="delete" />
			</div>
			<div class="fm_tabs_item flex aic" v-if="isEdit" @click="addTab()">
				<FmIcon primary icon="add" /> <div class="tab_add_text">Add tab</div>
			</div>
		</div>

		<PagesDashboardGrid :isEdit="isEdit" :tab="dashStore.activeTab" >
			<PagesDashboardWidgetWrap
				v-for="component of mainComponents"
				:key="component.id"
				:component="component"
				:isEdit="isEdit"
			/>
		</PagesDashboardGrid>
	</div>
</template>

<script setup>

	import { VAceEditor } from 'vue3-ace-editor';
	import 'ace-builds/src-noconflict/mode-json';
	import 'ace-builds/src-noconflict/theme-monokai';

	definePageMeta({
		middleware: 'auth',
		bread: [
			{
				text: 'Dashboard',
				disabled: true
			},
		],
	});

	let dashStore = useStoreDashboard()

	dashStore.init()

	let isOpenJSON = ref(false)
	let content = ref('')

	function editJSON() {
		content.value = JSON.stringify({
			widgets: dashStore.widgets,
			tabs: dashStore.tabs,
			scope: dashStore.scope,
		}, null, 4)
		isOpenJSON.value = true
	}
	function saveJSON() {
		let newStore = JSON.parse(content.value)

		dashStore.widgets = newStore.widgets
		dashStore.tabs = newStore.tabs
		dashStore.scope = newStore.scope
	}

	function editorInit(editor) {
		editor.setHighlightActiveLine(false);
		editor.setShowPrintMargin(false);
		editor.setFontSize(14)
		editor.setBehavioursEnabled(true);

		editor.focus();
		editor.navigateFileStart();
	}
	let topComponents = computed(() => {
		return dashStore.widgets.filter((item) => {
			return item.tab == '1'
		})
	})
	let mainComponents = computed(() => {
		return dashStore.widgets.filter((item) => {
			return item.tab == dashStore.activeTab
		})
	})

	let isEdit = ref(false)
	let activeTab = ref(dashStore.tabs[0]?.id)

	function addTab() {
		dashStore.tabs.push({
			id: '' + Date.now(),
			name: 'New tab'
		})
	}
	function delTab( id ) {
		let tabIndex = dashStore.tabs.findIndex((item) => {
			return item.id == id
		})

		dashStore.tabs.splice( tabIndex, 1 )
	}
	function create() {

		dashStore.activeLayoutId = null;

		dashStore.widgets = [];
		dashStore.tabs = [];
		dashStore.scope = []

		isEdit.value = true;

	}
	function edit() {
		isEdit.value = true
	}
	function save() {
		dashStore.saveLayout()

		isEdit.value = false
	}
	function deleteDashboard() {
		dashStore.deleteLayout()

	}
	function cancelEdit() {
		dashStore.getLayouts()

		isEdit.value = false
	}
</script>

<style lang="scss" scoped>

	.tab_add_text {
		color: $primary;
	}

</style>
