<template>
	<div>
		<FmHorizontalPanel>
			<template #leftActions>
				Default layout
			</template>

			<template #rightActions>
				<FmBtn v-if="!isEdit" @click="edit()">Edit dashboard</FmBtn>

				<template v-else>
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

		<PagesDashboardGrid :isEdit="isEdit">
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
				<FmIcon primary icon="add" />
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
		// middleware: 'auth',
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
			scopes: dashStore.scopes,
		}, null, 4)
		isOpenJSON.value = true
	}
	function saveJSON() {
		let newStore = JSON.parse(content.value)

		dashStore.widgets = newStore.widgets
		dashStore.tabs = newStore.tabs
		dashStore.scopes = newStore.scopes
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
			return item.tab == null
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
	function edit() {
		isEdit.value = true
	}
	function save() {
		dashStore.saveLayout()

		isEdit.value = false
	}
	function cancelEdit() {
		dashStore.getLayout()

		isEdit.value = false
	}
</script>

<style lang="scss" scoped>


</style>
