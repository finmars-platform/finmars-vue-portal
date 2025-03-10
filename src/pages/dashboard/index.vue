<template>
	<div>
		<FmHorizontalPanel>
			<template #leftActions>
				<PagesDashboardLayoutManager v-if="!dashStore.isEdit" />

				<template v-else>
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
				</template>
			</template>

			<template #rightActions>
				<template v-if="dashStore.isEdit">
					<FmBtn type="text" @click="cancelEdit()">cancel</FmBtn>
					<FmBtn @click="dashStore.saveLayout()">save</FmBtn>
				</template>

				<FmMenu class="m-l-10">
					<template #btn>
						<FmIcon btn icon="settings" />
					</template>

					<template #default="{ close }">
						<div class="fm_list">
							<div class="fm_list_item" @click="edit(), close()">
								Edit dashboard
							</div>
							<div
								class="fm_list_item"
								@click="editJSON(), close()"
							>
								Edit JSON
							</div>
						</div>
					</template>
				</FmMenu>
			</template>
		</FmHorizontalPanel>

		<BaseModal
			v-model="isOpenJSON"
			no_padding
			title="Editor JSON"
			:controls="{
				cancel: { name: 'Cancel' },
				action: { name: 'Save', cb: saveJSON }
			}"
		>
			<v-ace-editor
				v-model:value="content"
				@init="editorInit"
				lang="json"
				theme="monokai"
				style="height: 300px; width: 600px"
			/>
		</BaseModal>

		<PagesDashboardGrid :tab="1">
			<PagesDashboardWidgetWrap
				v-for="component of topComponents"
				:key="component.uid"
				:component="component"
				:isEdit="dashStore.isEdit"
			/>
		</PagesDashboardGrid>

		<div
			class="fm_tabs"
			v-if="dashStore.tabs.length > 1 || dashStore.isEdit"
		>
			<div
				class="fm_tabs_item center aic"
				v-for="(tab, index) in dashStore.tabs"
				:key="index"
				:class="{ active: tab.id == dashStore.activeTab }"
				@click="dashStore.activeTab = tab.id"
			>
				<input v-if="dashStore.isEdit" v-model="tab.name" />
				<template v-else>{{ tab.name }}</template>

				<FmIcon
					v-if="dashStore.isEdit"
					@click="delTab(tab.id)"
					class="m-l-4"
					icon="delete"
				/>
			</div>
			<div
				class="fm_tabs_item flex aic"
				v-if="dashStore.isEdit"
				@click="addTab()"
			>
				<FmIcon primary icon="add" />
				<div class="tab_add_text">Add tab</div>
			</div>
		</div>

		<PagesDashboardGrid :tab="dashStore.activeTab">
			<PagesDashboardWidgetWrap
				v-for="component of mainComponents"
				:key="component.uid"
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
			}
		]
	});

	const dashStore = useStoreDashboard();

	dashStore.init();

	let isOpenJSON = ref(false);
	let content = ref('');

	function editJSON() {
		content.value = JSON.stringify(
			{
				widgets: dashStore.widgets,
				tabs: dashStore.tabs,
				scope: dashStore.scope
			},
			null,
			4
		);
		isOpenJSON.value = true;
	}

	function saveJSON() {
		let newStore = JSON.parse(content.value);

		dashStore.widgets = newStore.widgets;
		dashStore.tabs = newStore.tabs;
		dashStore.scope = newStore.scope;
	}

	function editorInit(editor) {
		editor.setHighlightActiveLine(false);
		editor.setShowPrintMargin(false);
		editor.setFontSize(14);
		editor.setBehavioursEnabled(true);

		editor.focus();
		editor.navigateFileStart();
	}

	let topComponents = computed(() => {
		return dashStore.components.filter((item) => {
			return item.tab == '1';
		});
	});
	let mainComponents = computed(() => {
		return dashStore.components.filter((item) => {
			return item.tab == dashStore.activeTab;
		});
	});

	let isEdit = ref(false);

	function addTab() {
		dashStore.tabs.push({
			id: Date.now(),
			name: 'New tab'
		});
	}

	function delTab(id) {
		let tabIndex = dashStore.tabs.findIndex((item) => {
			return item.id == id;
		});

		dashStore.tabs.splice(tabIndex, 1);
	}

	function edit() {
		dashStore.isEdit = true;
	}

	function cancelEdit() {
		dashStore.getLayouts();

		dashStore.isEdit = false;
	}
</script>

<style lang="scss" scoped>
	.tab_add_text {
		color: var(--primary-color);
	}
</style>
