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
			<div class="flex-row flex-i-center" style="padding-right: 30px">
				<div v-if="isReport" class="flex-row flex-i-center">
					<md-button
						v-if="missingPricesData?.items?.length"
						class="missing-prices-warning-button"
						@click="openMissingPricesDialog($event)"
						><span class="material-icons">warning</span> Missing Data ({{
							missingPricesData?.items?.length
						}})
					</md-button>

					<md-select
						v-if="entityType != 'transaction-report'"
						v-model="reportOptions.cost_method"
						ng-change="updateReportOptions()"
					>
						<md-option ng-value="1">AVCO</md-option>
						<md-option ng-value="2">FIFO</md-option>
						<!--<md-option ng-value="3">LIFO-->
						<!--</md-option>-->
					</md-select>

					<md-input-container v-if="entityType != 'transaction-report'">
						<label></label>
						<md-select
							v-model="reportOptions.report_currency"
							md-container-class="common-select-container"
							md-on-close="searchTerm = ''"
							ng-change="updateReportOptions()"
							data-ng-disabled="viewContext === 'dashboard'"
						>
							<md-select-header>
								<input
									v-model="searchTerm"
									type="search"
									placeholder="Search for a ..."
									class="md-text md-select-search-pattern select-input-filter"
									ng-keydown="$event.stopPropagation()"
								/>
							</md-select-header>

							<div class="select-options-holder">
								<md-option v-for="item in currencies" ng-value="item.id">
									{{ item?.name }}
								</md-option>
							</div>
						</md-select>
					</md-input-container>

					<md-checkbox
						v-model="reportLayoutOptions.useDateFromAbove"
						:change="toggleUseDateFromAbove()"
						class="g-top-link-date-checkbox m-r-8 m-l-16"
						>{{ useDateFromAboveName }}</md-checkbox
					>

					<div v-if="entityType === 'balance-report'" class="flex-row">
						<div>
							<complex-zh-datepicker
								date="datesData.to"
								datepicker-options="reportLayoutOptions.datepickerOptions.reportLastDatepicker"
								callback-method="onReportDateChange()"
								ev-data-service="evDataService"
								ev-event-service="evEventService"
								attribute-data-service="attributeDataService"
								is-disabled="viewContext === 'split_panel' && reportLayoutOptions.useDateFromAbove"
							></complex-zh-datepicker>
						</div>
					</div>

					<div
						v-if="
							entityType === 'pl-report' || entityType === 'transaction-report'
						"
						class="flex-row"
					>
						<div></div>
					</div>
				</div>
			</div>

			<FmIcon icon="settings" btn @click="onSettingsClick" />
			<AngularFmGridTableEvSettingsM
				v-if="$mdDialog.modals['GEntityViewerSettingsDialogController']"
				:payload="$mdDialog.modals['GEntityViewerSettingsDialogController']"
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
	let reportOptions = evDataService.getReportOptions()
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

	var openReportSettings = function ($event) {
		// var reportOptions = evDataService.getReportOptions();

		$mdDialog
			.show({
				controller: 'GReportSettingsDialogController as vm',
				templateUrl: 'views/dialogs/g-report-settings-dialog-view.html',
				parent: angular.element(document.body),
				targetEvent: $event,
				multiple: true,
				locals: {
					/*reportOptions: reportOptions,
                            options: {
                                entityType: entityType
                            }*/
					data: {
						evDataService: evDataService,
						evEventService: evEventService,
						attributeDataService: attributeDataService,
					},
				},
			})
			.then(function (res) {
				if (res.status === 'agree') {
					evDataService.setReportLayoutOptions(res.data.reportLayoutOptions)
					evDataService.setReportOptions(res.data.reportOptions)

					evEventService.dispatchEvent(evEvents.REPORT_OPTIONS_CHANGE)
				}
			})
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
						reportOptions.report_currency =
							ecosystemDefaultData.currency_object.id
					}

					if (data.next) {
						currencyOptions.page = currencyOptions.page + 1
						// Victor 2020.12.03 may be not need
						//getPricingPolicies(resolve, reject);
					} else {
						$apply()
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
					reportOptions[dateFromKey] = datesData.from
				}

				reportOptions[dateToKey] = datesData.to
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
			$apply()
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
					reportOptions = evDataService.getReportOptions()
					reportLayoutOptions = evDataService.getReportLayoutOptions()

					if (dateFromKey) {
						datesData.from = reportOptions[dateFromKey]
					}

					datesData.to = reportOptions[dateToKey]
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
				to: reportOptions[dateToKey],
			}

			if (dateFromKey) datesData.from = reportOptions[dateFromKey]
		}

		initEventListeners()
	}

	init()
</script>

<style lang="scss" scoped></style>
