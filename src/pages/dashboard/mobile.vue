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
			<div
				class="fm_tabs_item"
				:class="{ active: tab == 'pnl' }"
				@click="tab = 'pnl'"
			>
				P&L
			</div>
			<div
				class="fm_tabs_item"
				:class="{ active: tab == 'dashboard' }"
				@click="tab = 'dashboard'"
			>
				Dashboard
			</div>
			<div class="fm_tabs_item">Transactions</div>
			<div class="fm_tabs_item">Settings</div>
		</div>

		<div class="p-24" v-if="tab == 'balance' && layout.balance">
			<!-- <FmInputText v-model="" /> -->
			<h4>Total NAV with History chart</h4>

			<FmCheckbox
				label="Total NAV with History chart"
				v-model="layout.balance.isShowHistoryChart"
			/>
			<br />
			<h4>Indicators</h4>
			<FmCheckbox
				label="P&L daily, MTD, YTD"
				v-model="layout.balance.isShowIndicatorsPnl"
			/>
			<FmCheckbox
				label="Standart indicators"
				v-model="layout.balance.isShowIndicators"
			/>
			<br />
			<h4>Doughnut charts</h4>

			<div class="flex">
				<FmBtn @click="openAttrSelector('fieldsToGroup')"
					>set columns to groupping</FmBtn
				>
				<FmBtn @click="openAttrSelector('fieldToAggrigate')"
					>set one column to Aggrigate by sum</FmBtn
				>
				<FmBtn type="text" @click="clearAttrs()">Clear all attrs</FmBtn>
			</div>

			<div class="flex">
				<FmCard
					v-for="item in layout.balance.fieldsToGroup"
					style="
						background: #fff;
						width: 280px;
						margin-right: 10px;
						margin-top: 10px;
					"
				>
					<div class="fm_card_title" style="font-size: 14px">
						{{ item.name }}
					</div>
					<div class="">
						<b>Sum by:</b>

						{{
							layout?.balance?.fieldToAggrigate &&
							layout.balance.fieldToAggrigate[0]?.name
						}}
					</div>
				</FmCard>
			</div>
			<br /><br />
			<FmBtn @click="saveLayout()">save</FmBtn>
		</div>

		<div class="p-24" v-if="tab == 'pnl' && layout.pnl">
			<!-- <FmInputText v-model="" /> -->
			<h4>Total with History chart</h4>

			<FmCheckbox
				label="Total with History chart"
				v-model="layout.pnl.isShowHistoryChart"
			/>
			<br />
			<h4>Indicators</h4>
			<FmCheckbox
				label="P&L daily, MTD, YTD"
				v-model="layout.pnl.isShowIndicatorsPnl"
			/>
			<FmCheckbox
				label="Standart indicators"
				v-model="layout.pnl.isShowIndicators"
			/>
			<br />
			<h4>Doughnut charts</h4>

			<div class="flex">
				<FmBtn @click="openAttrSelector('fieldsToGroup', true)"
					>set columns to groupping</FmBtn
				>
				<FmBtn @click="openAttrSelector('fieldToAggrigate', true)"
					>set one column to Aggrigate by sum</FmBtn
				>
				<FmBtn type="text" @click="clearAttrs()">Clear all attrs</FmBtn>
			</div>

			<div class="flex">
				<FmCard
					v-for="item in layout.pnl.fieldsToGroup"
					style="
						background: #fff;
						width: 280px;
						margin-right: 10px;
						margin-top: 10px;
					"
				>
					<div class="fm_card_title" style="font-size: 14px">
						{{ item.name }}
					</div>
					<div class="">
						<b>Sum by:</b>

						{{
							layout?.pnl?.fieldToAggrigate &&
							layout.pnl.fieldToAggrigate[0]?.name
						}}
					</div>
				</FmCard>
			</div>
			<br /><br />
			<FmBtn @click="saveLayout()">save</FmBtn>
		</div>

		<div class="p-24" v-if="tab == 'dashboard' && layout.dashboard">
			<!-- <FmInputText v-model="" /> -->
			<h4>All Portfolios History chart</h4>

			<FmCheckbox
				label="All Portfolios History chart"
				v-model="layout.dashboard.isShowHistoryChart"
			/>
			<br />
			<h4>Indicators</h4>
			<FmCheckbox
				label="P&L daily, MTD, YTD"
				v-model="layout.dashboard.isShowIndicatorsPnl"
			/>
			<FmCheckbox
				label="Standart indicators"
				v-model="layout.dashboard.isShowIndicators"
			/>

			<br /><br />
			<FmBtn @click="saveLayout()">save</FmBtn>
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
	import evHelperService from '~~/src/angular/services/entityViewerHelperService'

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

	function openAttrSelector(layoutField, isPnl = false) {
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

		const allAttrs = attributeDataService.getForAttributesSelector(
			isPnl ? 'pl-report' : 'balance-report'
		)
		const selectedAttrs = layout.value[isPnl ? 'pnl' : 'balance'][layoutField]

		payloadForSelector.value = {
			data: {
				title: 'Add columns',
				attributes: allAttrs,
				selectedAttributes: [],
				contentType: isPnl ? 'reports.plreport' : 'reports.balancereport',
			},
			resolve(res) {
				console.log('res:', res)
				layout.value[isPnl ? 'pnl' : 'balance'][layoutField] = res.data.items
				isOpenAttrsSelector.value = false

				useNotify({ title: 'Changed', type: 'success' })
			},
			reject(res) {
				isOpenAttrsSelector.value = false
			},
		}
	}

	function clearAttrs() {}

	let layoutStock

	async function saveLayout() {
		let res = await useApi('mobileLayout.put', {
			params: {
				id: layoutStock.id,
			},
			body: {
				user_code: 'only_one',
				configuration_code: 'local',
				data: layout.value,
			},
		})
		useNotify({ title: 'Mobile layout has been saved.', type: 'success' })
	}

	async function fetchMobileLayout() {
		let res = await useApi('mobileLayout.get')

		layoutStock = res.results[0]
		layout.value = layoutStock?.data

		if (!res.results.length) {
			layout.value = {
				balance: {},
				pnl: {},
				dashboard: {},
				transactions: {},
				global: {},
			}
			let res = await useApi('mobileLayout.post', {
				body: {
					name: 'Only one',
					user_code: 'only_one',
					configuration_code: 'local',
					data: layout.value,
				},
			})
			layoutStock = res
		}
		console.log('layout.value:', layout.value)
	}
</script>

<style lang="scss" scoped>
	h4 {
		font-weight: 600;
		font-size: 16px;
		margin-bottom: 10px;
	}
</style>
