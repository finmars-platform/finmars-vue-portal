<template>
	<CommonEntityViewer
		type="report.performance"
		@refresh="refresh()"
		v-slot="{ reportOptions }"
	>
		<!-- <ag-grid-vue
			style="height: 100%;"
			class="ag-theme-material"
			:columnDefs="columnDefs"
			:defaultColDef="defaultColDef"
			:rowData="rowData"
			rowGroupPanelShow="always"
			:groupRowsSticky="true"
			:aggFuncs="aggFuncs"
			:pagination="true"
			:getContextMenuItems="getContextMenuItems"
		/> -->
	</CommonEntityViewer>
</template>

<script setup>

	// import "ag-grid-community/styles/ag-grid.css";
	// import "ag-grid-community/styles/ag-theme-material.css";
	// import { AgGridVue } from "ag-grid-vue3";

	definePageMeta({
		middleware: 'auth',
		bread: [
			{
				text: 'Transaction: transactions',
				disabled: true
			},
		],
	});
	provide('refreshReport', refresh);
	fetchTrans()
	async function fetchTrans() {
		let res = await useApi('transactionComplexFiltered.post', {
			body: {"groups_types":[],"page":1,"groups_values":[],"groups_order":"asc","page_size":5000,"ev_options":{"complex_transaction_filters":["booked","ignored"],"entity_filters":["ignored","locked","partially_visible","unlocked"]},"filter_settings":[],"global_table_search":"","is_enabled":"any","ordering":"-code"}
		})

		columnDefs.value = Object.keys(res.results[0]).map((item) => {
			return { headerName: item, field: item }
		})
		rowData.value = res.results
		console.log('res.results:', res.results)
	}

	let columnDefs = ref([])
	let rowData = ref([	])
	let defaultColDef = {
		editable: true,
		sortable: true,
		minWidth: 100,
		filter: true,
		resizable: true,
		enableRowGroup: true,
		enableValue: true
	}

	let aggFuncs = {
    'MY_CUSTOM_AGG_AVG_DATE': params => {

        let sum = 0;
        params.values.forEach(value => sum += new Date(value).getTime() );
        console.log('sum:', sum)

        return new Date(Math.floor(sum / params.values.length) )
    }
	};

	function getContextMenuItems(params) {
		let result = [
			{
				name: 'Actions',
				subMenu: [
					{
						name: 'View transaction',
						action: () => { },
					},
					{
						name: 'Lock transaction',
						action: () => { },
					},
					{
						name: 'Unlock transaction',
						action: () => { },
					},
					{
						name: 'Ignore transaction',
						action: () => { },
					},
					{
						name: 'Activate transaction',
						action: () => { },
					},
				]
			},

			'separator',
			{
				name: 'Select row',
				action: () => {

				},
			},
			'copy',
			{
				name: 'Edit',
				action: () => { },
			},
			{
				name: 'Delete',
				action: () => {

				},
				cssClasses: ['redFont'],
			},
		];
		return result;
	}



	function refresh() {
		bundlesRefreshFunc()
	}


</script>

<style lang="scss" scoped>

</style>
