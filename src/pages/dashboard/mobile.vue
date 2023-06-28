<template>
	<div>
		<div class="fm_tabs">
			<div
				class="fm_tabs_item"
				:class="{ active: tab == 'balance' }"
				@click="tab = 'balance'"
			>
				Balacne
			</div>
			<div class="fm_tabs_item">P&L</div>
			<div class="fm_tabs_item">Dashboard</div>
			<div class="fm_tabs_item">Transactions</div>
			<div class="fm_tabs_item">Settings</div>
		</div>

		<div class="p-24" v-if="tab == 'balance'">
			<!-- <FmInputText v-model="" /> -->
			<h4>Total NAV with History chart</h4>

			<FmCheckbox
				label="Total NAV with History chart"
				v-model="layout.isShowHistoryChart"
			/>
			<br />
			<h4>Indicators</h4>
			<FmCheckbox
				label="P&L daily, MTD, YTD"
				v-model="layout.isShowHistoryChart"
			/>
			<FmCheckbox
				label="Standart indicators"
				v-model="layout.isShowHistoryChart"
			/>
			<br />
			<h4>Doughnut charts</h4>

			<h4>Column to group</h4>
			<div>{{ layout.columnToGroup }}</div>

			<h4>Column to aggrigate</h4>
			<div>{{ layout.columnToAggrigate }}</div>
			<FmBtn @click="openAttrSelector()">set column</FmBtn>
		</div>

		<ModalAttributesSelector
			v-if="isOpenAttrsSelector"
			:payload="payloadForSelector"
			:modelValue="true"
		></ModalAttributesSelector>
	</div>
</template>

<script setup>
	import attributeDataServiceInst from '~~/src/angular/services/attributeDataService'
	import evRvLayoutsHelperInst from '@/angular/helpers/evRvLayoutsHelper'
	import globalDataServiceInst from '@/angular/shell/scripts/app/services/globalDataService'
	import middlewareServiceInst from '@/angular/shell/scripts/app/services/middlewareService'
	import metaContentTypesServiceInst from '@/angular/services/metaContentTypesService'
	import customFieldService from '@/angular/services/reports/customFieldService'
	import attributeTypeService from '@/angular/services/attributeTypeService'
	import xhrService from '@/angular/shell/scripts/app/services/xhrService'
	import cookieService from '@/angular/shell/scripts/app/services/cookieService'
	import uiService from '~~/src/angular/services/uiService'
	definePageMeta({
		middleware: 'auth',
		bread: [
			{
				text: 'Mobile dashboard',
				disabled: true,
			},
		],
	})

	let tab = ref('balance')
	let layout = ref({})

	let payloadForSelector = ref({})

	const isOpenAttrsSelector = ref(false)

	fetchMobileLayout()

	function openAttrSelector() {
		window.evRvLayoutsHelper = new evRvLayoutsHelperInst()
		let middlewareService = new middlewareServiceInst()

		// Globals HACK
		window.metaContentTypesService = new metaContentTypesServiceInst()
		window.globalDataService = new globalDataServiceInst()
		window.xhrService = new xhrService()
		window.cookieService = new cookieService()

		isOpenAttrsSelector.value = true

		let attributeDataService = new attributeDataServiceInst(
			metaContentTypesService,
			customFieldService,
			attributeTypeService,
			uiService
		)

		const allAttrs =
			attributeDataService.getForAttributesSelector('balance-report')
		const selectedAttrs = layout.value.columnToAggrigate

		payloadForSelector.value = {
			data: {
				title: 'Add columns',
				attributes: allAttrs,
				// layoutNames: evHelperService.getAttributesLayoutNames(columns),
				selectedAttributes: selectedAttrs,
				contentType: 'reports.balancereport',
			},
			resolve(res) {
				console.log('res:', res)
				layout.value.columnToGroup = res.data.items
				isOpenAttrsSelector.value = false
			},
		}
	}

	async function fetchMobileLayout() {
		let res = await useApi('mobileLayout.get')
		console.log('res:', res)
		layout.value = res.results[0]
	}
</script>

<style lang="scss" scoped></style>
