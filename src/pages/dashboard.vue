<template>
	<div>
		<FmHorizontalPanel>
			<template #leftActions>
				Default layout
			</template>

			<template #rightActions>
				<FmCheckbox v-model="isEdit" label="Edit mode" />
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
			v-if="tabs.length > 1 || isEdit"
		>
			<div class="fm_tabs_item"
				v-for="(tab, index) in tabs"
				:key="index"
				:class="{active: tab.id == activeTab}"
				@click="activeTab = tab.id"
			>
				{{ tab.name }}
			</div>
		</div>

		<PagesDashboardGrid :isEdit="isEdit">
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

</script>

<style lang="scss" scoped>


</style>
