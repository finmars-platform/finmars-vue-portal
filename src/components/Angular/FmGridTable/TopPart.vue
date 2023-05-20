<template>
	<div class="g-top-part width-100 flex-row fc-space-between flex-i-center">
		<div class="g-top-part-left p-l-24 flex-50 flex-row">
			<md-button
				class="g-top-button flex-row"
				custom-popup
				popup-template-url="'views/popups/entity-viewer/g-layouts-manager-popup-view.html'"
				popup-data="popupData"
				position-relative-to="element"
				open-on="click"
				offset-x="-30"
				popup-classes="rounded-border"
				close-on-click-outside="true"
			>
				<span class="material-icons">view_quilt</span>
				<span class="m-l-8">{{ layoutData?.name }}</span>
				<span class="material-icons">arrow_drop_down</span>
			</md-button>

			<md-button
				class="g-top-button small-button-icon p-r-8 p-l-8"
				@click="saveLayoutList($event)"
			>
				<span class="material-icons">save</span>
			</md-button>

			<md-button
				v-if="!isRootEntityViewer"
				class="g-filter-area-toggle active margin-0"
				@click="toggleFilterBlock($event)"
			>
				<div class="flex-column flex-i-center">
					<span class="material-icons">filter_list</span>
				</div>
			</md-button>

			<div class="global-table-filter-container">
				<input
					type="text"
					ng-model="globalTableSearch"
					ng-change="onGlobalTableSearchChange()"
					placeholder="Search for a ..."
					class="global-table-filter-search"
					aria-invalid="false"
					data-ng-model-options="{debounce: 500}"
				/>
			</div>
		</div>

		<div class="p-r-24 flex-row flex-i-center">
			<div v-if="isReport" class="flex-row flex-i-center">
				<md-button
					v-if="missingPricesData.items.length"
					class="missing-prices-warning-button"
					@click="openMissingPricesDialog($event)"
					><span class="material-icons">warning</span> Missing Data ({{
						missingPricesData?.items?.length
					}})
				</md-button>

				<md-select
					v-if="entityType != 'transaction-report'"
					data-ng-model="reportOptions.cost_method"
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
						ng-model="reportOptions.report_currency"
						md-container-class="common-select-container"
						md-on-close="searchTerm = ''"
						ng-change="updateReportOptions()"
						data-ng-disabled="viewContext === 'dashboard'"
					>
						<md-select-header>
							<input
								data-ng-model="searchTerm"
								type="search"
								placeholder="Search for a ..."
								class="md-text md-select-search-pattern select-input-filter"
								ng-keydown="$event.stopPropagation()"
							/>
						</md-select-header>

						<div class="select-options-holder">
							<md-option
								ng-repeat="item in currencies | filter:{name: searchTerm}"
								ng-value="item.id"
							>
								{{ item?.name }}
							</md-option>
						</div>
					</md-select>
				</md-input-container>

				<md-checkbox
					ng-model="reportLayoutOptions.useDateFromAbove"
					ng-change="toggleUseDateFromAbove()"
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
					<div>
						<!-- <complex-zh-datepicker MAIN NEED RELOC
													date="datesData.from"
													datepicker-options="reportLayoutOptions.datepickerOptions.reportFirstDatepicker"
													second-date="datesData.to"
													second-datepicker-options="reportLayoutOptions.datepickerOptions.reportLastDatepicker"
													callback-method="onReportDateChange()"
													ev-data-service="evDataService"
													ev-event-service="evEventService"
													attribute-data-service="attributeDataService"
													is-disabled="viewContext === 'split_panel' && reportLayoutOptions.useDateFromAbove"
												>
												</complex-zh-datepicker> -->
					</div>
				</div>
			</div>

			<md-button class="md-icon-button" @click="onSettingsClick()">
				<div class="flex-row flex-c-center flex-i-center">
					<ng-md-icon icon="settings" size="20">
						<md-tooltip md-direction="top">Settings</md-tooltip>
					</ng-md-icon>
				</div>
			</md-button>
		</div>
	</div>
</template>

<script setup>
	import metaService from '@/angular/services/metaService'
	import evEvents from '@/angular/services/entityViewerEvents'

	import currencyService from '@/angular/services/currencyService'

	const props = defineProps([
		'vm',
		'evEventService',
		'evDataService',
		'spExchangeService',
	])
	// export default function (
	// 	$mdDialog,
	// 	$state,
	// 	usersService,
	// 	ecosystemDefaultService,
	// 	,
	// 	reportHelper
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

	let globalTableSearch = ''

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
		evDataService.setGlobalTableSearch(globalTableSearch)

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
					missingPricesData: missingPricesData,
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

	var openEntityViewerSettings = function ($event) {
		$mdDialog
			.show({
				controller: 'GEntityViewerSettingsDialogController as vm',
				templateUrl: 'views/dialogs/g-entity-viewer-settings-dialog-view.html',
				parent: angular.element(document.body),
				targetEvent: $event,
				locals: {
					entityViewerDataService: evDataService,
					entityViewerEventService: evEventService,
				},
			})
			.then(function (res) {
				if (res.status === 'agree') {
					evEventService.dispatchEvent(evEvents.ENTITY_VIEWER_SETTINGS_CHANGED)
				}
			})
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

		let toggleUseDateFromAbove = function () {
			// reportLayoutOptions.useDateFromAbove updated inside entityViewerDataService by mutation
			updateReportLayoutOptions()

			evEventService.dispatchEvent(evEvents.TOGGLE_USE_REPORT_DATE_FROM_ABOVE)

			// event REPORT_OPTIONS_CHANGE dispatched from splitPanelReportViewerController as reaction to TOGGLE_USE_REPORT_DATE_FROM_ABOVE
			if (viewContext !== 'split_panel') {
				evEventService.dispatchEvent(evEvents.REPORT_OPTIONS_CHANGE)
			}
		}

		useDateFromAboveName =
			entityType === 'balance-report' ? 'Link date' : 'Link date'
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
	let missingPricesData
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
				missingPricesData = evDataService.getMissingPrices()
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
		missingPricesData = evDataService.getMissingPrices()

		if (isReport) {
			getCurrencies()

			prepareReportLayoutOptions()
			;[dateFromKey, dateToKey] = reportHelper.getDateProperties(entityType)

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
