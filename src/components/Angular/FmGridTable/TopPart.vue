<template>
	<FmHorizontalPanel height="50">
		<template #leftActions>
			<BaseLayoutsManager
				:activeLayout="layoutData"
				:layouts="[layoutData]"
				:autosaveLayout="autosaveLayout"
				:loadingLayoutsList="loadingLayoutsList"
				:isLayoutDefault="isLayoutDefault"
				@createNewLayout="createNewLayout"
				@save="saveLayoutList"
				@saveAs="openSaveAsModal = true"
				@setAsDefault="setAsDefault"
				@rename="renameLayout"
				@delete="deleteLayout"
				@export="openLayoutExport"
				@changeLayout="viewerData.layoutToOpen = $event"
			/>

			<FmIcon icon="save" btn @click="saveLayoutList" />

			<BaseInput
				class="bi_no_borders"
				v-model="globalTableSearch"
				@keyup.enter="onGlobalTableSearchChange()"
				placeholder="Search for a ..."
			/>
		</template>

		<template #rightActions>
			<div class="flex-row flex-i-center">
				<div v-if="isReport" class="flex-row flex-i-center">
					<FmBtn
						class="missing-prices-warning-button"
						v-if="missingPricesData?.items?.length"
						type="action"
						icon="warning"
						@click="openMissingPricesDialog($event)"
					>
						Missing Data ({{ missingPricesData?.items?.length }})
					</FmBtn>

					<FmSelect
						class="m-b-0"
						v-if="entityType != 'transaction-report'"
						no_borders
						v-model="reportOptions.cost_method"
						:items="[
							{ id: 1, name: 'AVCO' },
							{ id: 2, name: 'FIFO' },
						]"
						@update:modelValue="updateReportOptions()"
					/>

					<FmSelect
						class="m-b-0"
						no_borders
						v-if="entityType != 'transaction-report'"
						v-model="reportOptions.report_currency"
						:items="currencies"
						prop_id="user_code"
						@update:modelValue="updateReportOptions()"
					/>
					<!-- <md-select-header>
								<input
									v-model="searchTerm"
									type="search"
									placeholder="Search for a ..."
									class="md-text md-select-search-pattern select-input-filter"
									ng-keydown="$event.stopPropagation()"
								/>
							</md-select-header> -->

					<FmCheckbox
						class="g-top-link-date-checkbox m-r-8 m-l-16"
						v-model="reportLayoutOptions.useDateFromAbove"
						:label="useDateFromAboveName"
						@update:model-value="toggleUseDateFromAbove()"
					/>

					<complex-zh-datepicker
						v-if="entityType === 'balance-report'"
						date="datesData.to"
						datepicker-options="reportLayoutOptions.datepickerOptions.reportLastDatepicker"
						callback-method="onReportDateChange()"
						ev-data-service="evDataService"
						ev-event-service="evEventService"
						attribute-data-service="attributeDataService"
						is-disabled="viewContext === 'split_panel' && reportLayoutOptions.useDateFromAbove"
					></complex-zh-datepicker>

					<complex-zh-datepicker
						v-if="
							entityType === 'pl-report' || entityType === 'transaction-report'
						"
						date="datesData.from"
						datepicker-options="reportLayoutOptions.datepickerOptions.reportFirstDatepicker"
						second-date="datesData.to"
						second-datepicker-options="reportLayoutOptions.datepickerOptions.reportLastDatepicker"
						callback-method="onReportDateChange()"
					>
					</complex-zh-datepicker>
					<FmInputDateComplex
						v-if="
							entityType === 'reports.plreport' ||
							entityType === 'reports.transactionreport'
						"
						noBorders
						:firstDate="reportOptions.pl_first_date"
						:firstDatepickerOptions="
							reportLayoutOptions.datepickerOptions.reportFirstDatepicker
						"
						:secondDate="reportOptions.report_date"
						:secondDatepickerOptions="
							reportLayoutOptions.datepickerOptions.reportLastDatepicker
						"
						is-disabled="viewContext === 'split_panel' && reportLayoutOptions.useDateFromAbove"
					/>
				</div>
			</div>

			<FmIcon icon="settings" btn @click="onSettingsClick" />

			<LazyAngularFmGridTableEvSettingsM
				v-if="$mdDialog.modals['GEntityViewerSettingsDialogController']"
				:payload="$mdDialog.modals['GEntityViewerSettingsDialogController']"
				:modelValue="true"
			/>

			<LazyAngularFmGridTableRvSettingsM
				v-if="$mdDialog.modals['GReportSettingsDialogController']"
				:payload="$mdDialog.modals['GReportSettingsDialogController']"
				:modelValue="true"
			/>
		</template>
	</FmHorizontalPanel>
</template>

<script setup>
	import metaService from '@/angular/services/metaService'
	import evEvents from '@/angular/services/entityViewerEvents'

	import currencyService from '@/angular/services/currencyService'
	import usersServiceInst from '~~/src/angular/shell/scripts/app/services/usersService'
	import evRvLayoutsHelperInst from '@/angular/helpers/evRvLayoutsHelper'
	import uiService from '~~/src/angular/services/uiService'

	let usersService = new usersServiceInst()
	let evRvLayoutsHelper = new evRvLayoutsHelperInst()
	window.uiService = uiService

	const props = defineProps([
		'vm',
		'evEventService',
		'evDataService',
		'spExchangeService',
	])
	const $mdDialog = inject('$mdDialog')
	// export default function (
	// 	$state,
	// 	usersService,
	// 	ecosystemDefaultService
	// ) {
	// scope: {
	// 	evDataService: '=',
	// 	evEventService: '=',
	// 	attributeDataService: '=',
	// 	spExchangeService: '=',
	// },
	let { evDataService, evEventService, spExchangeService } = props

	let entityType = evDataService.getEntityType()
	let isReport = metaService.isReport(entityType) || false
	const reportOptions = ref(evDataService.getReportOptions())
	let isRootEntityViewer = evDataService.isRootEntityViewer()
	let viewContext = evDataService.getViewContext()

	let globalTableSearch = ref('')

	let useDateFromAboveName = ref('')

	let layoutData = {
		name: '',
	}

	let listLayout = evDataService.getListLayout()

	let dateFromKey
	let dateToKey

	if (listLayout && listLayout.name) {
		layoutData.name = listLayout.name
	}

	let popupData = {
		entityType: entityType,
		evDataService: evDataService,
		evEventService: evEventService,
		spExchangeService: spExchangeService,
	}

	let onGlobalTableSearchChange = function () {
		evDataService.setGlobalTableSearch(globalTableSearch.value)

		if (!isReport) {
			evDataService.resetTableContent(false)
		}

		evEventService.dispatchEvent(evEvents.UPDATE_TABLE)
	}

	let saveLayoutList = function ($event) {
		console.log('$event:', $event)
		var isNewLayout = evDataService.isLayoutNew()

		if (isNewLayout) {
			evRvLayoutsHelper.saveAsLayoutList(
				evDataService,
				evEventService,
				isReport,
				$mdDialog,
				entityType,
				$event
			)
		} else {
			evRvLayoutsHelper.saveLayoutList(
				evDataService,
				isReport,
				usersService,
				globalDataService
			)
		}
	}

	let openMissingPricesDialog = function ($event) {
		$mdDialog.show({
			controller: 'ReportPriceCheckerDialogController as vm',
			templateUrl:
				'views/dialogs/report-missing-prices/report-price-checker-dialog-view.html',
			parent: angular.element(document.body),
			targetEvent: $event,
			locals: {
				data: {
					missingPricesData: missingPricesData.value,
					evDataService: evDataService,
				},
			},
		})
	}

	let toggleFilterBlock = function ($event) {
		const elem = $event.currentTarget
		elem.classList.contains('active')
			? elem.classList.remove('active')
			: elem.classList.add('active')

		evEventService.dispatchEvent(evEvents.TOGGLE_FILTER_BLOCK)
	}

	async function openReportSettings($event) {
		let res = await $mdDialog.show({
			controller: 'GReportSettingsDialogController as vm',
			templateUrl: 'views/dialogs/g-report-settings-dialog-view.html',
		})
		if (res.status === 'agree') {
			console.log('res:', res)
			evDataService.setReportLayoutOptions(res.data.reportLayoutOptions)
			evDataService.setReportOptions(res.data.reportOptions)

			evEventService.dispatchEvent(evEvents.REPORT_OPTIONS_CHANGE)
		}
	}

	var openEntityViewerSettings = async function ($event) {
		let res = await $mdDialog.show({
			controller: 'GEntityViewerSettingsDialogController as vm',
			templateUrl: 'views/dialogs/g-entity-viewer-settings-dialog-view.html',
		})
		if (res.status === 'agree') {
			evEventService.dispatchEvent(evEvents.ENTITY_VIEWER_SETTINGS_CHANGED)
		}
	}

	let onSettingsClick = isReport ? openReportSettings : openEntityViewerSettings

	var datesKeysData = [
		{
			'pl-report': 'pl_first_date',
			'transaction-report': 'begin_date',
		},
		{
			'balance-report': 'report_date',
			'pl-report': 'report_date',
			'transaction-report': 'end_date',
		},
	]
	let reportLayoutOptions
	var prepareReportLayoutOptions = function () {
		reportLayoutOptions = evDataService.getReportLayoutOptions()

		// preparing data for complexZhDatePickerDirective
		if (!reportLayoutOptions.hasOwnProperty('datepickerOptions')) {
			reportLayoutOptions.datepickerOptions = {}
		}

		if (
			!reportLayoutOptions.datepickerOptions.hasOwnProperty(
				'reportFirstDatepicker'
			)
		) {
			reportLayoutOptions.datepickerOptions.reportFirstDatepicker = {}
		}

		if (
			!reportLayoutOptions.datepickerOptions.hasOwnProperty(
				'reportLastDatepicker'
			)
		) {
			reportLayoutOptions.datepickerOptions.reportLastDatepicker = {}
		}

		if (typeof reportLayoutOptions.useDateFromAbove !== 'boolean') {
			reportLayoutOptions.useDateFromAbove = true
		}
	}
	let currencies
	const getCurrencies = function () {
		const currencyOptions = {
			pageSize: 1000,
			page: 1,
		}

		new Promise(function (resolve, reject) {
			currencyService
				.getListLight(currencyOptions)
				.then(async function (data) {
					currencies = currencies.concat(data.results)

					if (!currencies.length) {
						const ecosystemDefaultData = await ecosystemDefaultService
							.getList()
							.then((res) => res.results[0])
						currencies.push(ecosystemDefaultData.currency_object)
						reportOptions.value.report_currency =
							ecosystemDefaultData.currency_object.id
					}

					if (data.next) {
						currencyOptions.page = currencyOptions.page + 1
						// Victor 2020.12.03 may be not need
						//getPricingPolicies(resolve, reject);
					} else {
						// $apply()
						resolve(true)
					}
				})
				.catch(function (error) {
					reject(error)
				})
		})
	}

	const updateReportLayoutOptions = function () {
		const reportLayoutOptions = evDataService.getReportLayoutOptions()
		const newReportLayoutOptions = {
			...reportLayoutOptions,
			...reportLayoutOptions,
		}

		evDataService.setReportLayoutOptions(newReportLayoutOptions)
	}

	if (isReport) {
		currencies = []
		/*dateFrom = reportOptions[dateFromKey];
                    dateTo = reportOptions[dateToKey];*/
		let onReportDateChange = function () {
			if (
				viewContext !== 'split_panel' ||
				!reportLayoutOptions.useDateFromAbove
			) {
				if (dateFromKey) {
					reportOptions.value[dateFromKey] = datesData.from
				}

				reportOptions.value[dateToKey] = datesData.to
			}

			updateReportOptions()
		}

		useDateFromAboveName.value =
			entityType === 'balance-report' ? 'Link date' : 'Link date'
	}
	function toggleUseDateFromAbove() {
		// reportLayoutOptions.useDateFromAbove updated inside entityViewerDataService by mutation
		updateReportLayoutOptions()

		evEventService.dispatchEvent(evEvents.TOGGLE_USE_REPORT_DATE_FROM_ABOVE)

		// event REPORT_OPTIONS_CHANGE dispatched from splitPanelReportViewerController as reaction to TOGGLE_USE_REPORT_DATE_FROM_ABOVE
		if (viewContext !== 'split_panel') {
			evEventService.dispatchEvent(evEvents.REPORT_OPTIONS_CHANGE)
		}
	}
	let updateReportOptions = function () {
		var reportOptions = evDataService.getReportOptions()
		// delete reportLayoutOptions.datepickerOptions.reportFirstDatepicker.secondDate;
		var newReportOptions = Object.assign({}, reportOptions, reportOptions)

		evDataService.setReportOptions(newReportOptions)

		updateReportLayoutOptions()

		evEventService.dispatchEvent(evEvents.REPORT_OPTIONS_CHANGE)

		setTimeout(function () {
			// $apply()
		}, 200)
	}
	let missingPricesData = ref(null)
	var initEventListeners = function () {
		evEventService.addEventListener(evEvents.LAYOUT_NAME_CHANGE, function () {
			listLayout = evDataService.getListLayout()

			if (listLayout && listLayout.name) {
				layoutData.name = listLayout.name
			}
		})

		evEventService.addEventListener(
			evEvents.MISSING_PRICES_LOAD_END,
			function () {
				missingPricesData.value = evDataService.getMissingPrices()
			}
		)

		if (isReport) {
			evEventService.addEventListener(
				evEvents.REPORT_OPTIONS_CHANGE,
				function () {
					reportOptions.value = evDataService.getReportOptions()
					reportLayoutOptions = evDataService.getReportLayoutOptions()

					if (dateFromKey) {
						datesData.from = reportOptions.value[dateFromKey]
					}

					datesData.to = reportOptions.value[dateToKey]
				}
			)
		}
	}
	let datesData
	const init = async function () {
		missingPricesData.value = evDataService.getMissingPrices()

		if (isReport) {
			getCurrencies()

			prepareReportLayoutOptions()
			;[dateFromKey, dateToKey] =
				window.reportHelper.getDateProperties(entityType)

			datesData = {
				to: reportOptions.value[dateToKey],
			}

			if (dateFromKey) datesData.from = reportOptions.value[dateFromKey]
		}

		initEventListeners()
	}

	init()
</script>

<style lang="scss" scoped></style>
