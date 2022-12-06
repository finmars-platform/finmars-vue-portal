<template>
	<div>
		<FmHorizontalPanel>
			<template #leftActions>
				Default layout
			</template>

			<template #rightActions>
				<FmBtn v-if="!isEdit" @click="edit()">Edit dashboard</FmBtn>

				<template v-else>
					<FmBtn type="text" @click="cancelEdit()">cancel</FmBtn>
					<FmBtn @click="save()">save</FmBtn>
				</template>
			</template>
		</FmHorizontalPanel>

		<PagesDashboardGrid :isEdit="isEdit">
			<PagesDashboardWidgetWrap
				v-for="(component, i) of topComponents"
				:key="i"
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
				:class="{active: tab.id == activeTab}"
				@click="activeTab = tab.id"
			>
				{{ tab.name }}

				<FmInput v-model="tab.name" />
				<FmIcon class="m-l-10" icon="edit" />
				<FmIcon class="m-l-4" icon="close" />
			</div>
			<div class="fm_tabs_item flex aic" v-if="isEdit" @click="addTab()">
				<FmIcon primary icon="add" />
			</div>
		</div>

		<PagesDashboardGrid :isEdit="isEdit" :tab="activeTab" >
			<PagesDashboardWidgetWrap
				v-for="(component, i) of mainComponents"
				:key="i"
				:component="component"
				:isEdit="isEdit"
			/>
		</PagesDashboardGrid>
	</div>
</template>

<script setup>

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

	let topComponents = computed(() => {
		return dashStore.widgets.filter((item) => {
			return item.tab == null
		})
	})
	let mainComponents = computed(() => {
		return dashStore.widgets.filter((item) => {
			return item.tab == activeTab.value
		})
	})

	let isEdit = ref(false)

	let tabs = reactive([
		{id: 'porfolio_winner', name: 'Porfolio Winner'},
		{id: 'i_lose', name: 'I wanna lose my money'}
	])
	let activeTab = ref('i_lose')

	function addTab() {
		dashStore.tabs.push({
			id: Date.now(),
			name: 'New tab'
		})
	}
	function delTab( id ) {
		dashStore.tabs.push({
			id: Date.now(),
			name: 'New tab'
		})
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
