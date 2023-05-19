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

	// export default function (
	// 	$mdDialog,
	// 	$state,
	// 	usersService,
	// 	ecosystemDefaultService,
	// 	globalDataService,
	// 	evRvLayoutsHelper,
	// 	reportHelper
	// ) {
	// scope: {
	// 	evDataService: '=',
	// 	evEventService: '=',
	// 	attributeDataService: '=',
	// 	spExchangeService: '=',
	// },
	let entityType = scope.evDataService.getEntityType()
	let isReport = metaService.isReport(scope.entityType) || false
	let reportOptions = scope.evDataService.getReportOptions()
	let isRootEntityViewer = scope.evDataService.isRootEntityViewer()
	let viewContext = scope.evDataService.getViewContext()

	let globalTableSearch = ''

	let layoutData = {
		name: '',
	}

	let listLayout = scope.evDataService.getListLayout()

	let dateFromKey
	let dateToKey

	if (listLayout && listLayout.name) {
		scope.layoutData.name = listLayout.name
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

		scope.evEventService.dispatchEvent(evEvents.UPDATE_TABLE)
	}

	let saveLayoutList = function ($event) {
		var isNewLayout = scope.evDataService.isLayoutNew()

		if (isNewLayout) {
			evRvLayoutsHelper.saveAsLayoutList(
				scope.evDataService,
				scope.evEventService,
				scope.isReport,
				$mdDialog,
				scope.entityType,
				$event
			)
		} else {
			evRvLayoutsHelper.saveLayoutList(
				scope.evDataService,
				scope.isReport,
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
					missingPricesData: scope.missingPricesData,
					evDataService: scope.evDataService,
				},
			},
		})
	}

	let toggleFilterBlock = function ($event) {
		const elem = $event.currentTarget
		elem.classList.contains('active')
			? elem.classList.remove('active')
			: elem.classList.add('active')

		scope.evEventService.dispatchEvent(evEvents.TOGGLE_FILTER_BLOCK)
	}

	var openReportSettings = function ($event) {
		// var reportOptions = scope.evDataService.getReportOptions();

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
                                entityType: scope.entityType
                            }*/
					data: {
						evDataService: scope.evDataService,
						evEventService: scope.evEventService,
						attributeDataService: scope.attributeDataService,
					},
				},
			})
			.then(function (res) {
				if (res.status === 'agree') {
					scope.evDataService.setReportLayoutOptions(
						res.data.reportLayoutOptions
					)
					scope.evDataService.setReportOptions(res.data.reportOptions)

					scope.evEventService.dispatchEvent(evEvents.REPORT_OPTIONS_CHANGE)
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
					entityViewerDataService: scope.evDataService,
					entityViewerEventService: scope.evEventService,
				},
			})
			.then(function (res) {
				if (res.status === 'agree') {
					scope.evEventService.dispatchEvent(
						evEvents.ENTITY_VIEWER_SETTINGS_CHANGED
					)
				}
			})
	}

	let onSettingsClick = scope.isReport
		? openReportSettings
		: openEntityViewerSettings

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
		reportLayoutOptions = scope.evDataService.getReportLayoutOptions()

		// preparing data for complexZhDatePickerDirective
		if (!scope.reportLayoutOptions.hasOwnProperty('datepickerOptions')) {
			reportLayoutOptions.datepickerOptions = {}
		}

		if (
			!scope.reportLayoutOptions.datepickerOptions.hasOwnProperty(
				'reportFirstDatepicker'
			)
		) {
			scope.reportLayoutOptions.datepickerOptions.reportFirstDatepicker = {}
		}

		if (
			!scope.reportLayoutOptions.datepickerOptions.hasOwnProperty(
				'reportLastDatepicker'
			)
		) {
			scope.reportLayoutOptions.datepickerOptions.reportLastDatepicker = {}
		}

		if (typeof scope.reportLayoutOptions.useDateFromAbove !== 'boolean') {
			scope.reportLayoutOptions.useDateFromAbove = true
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
					currencies = scope.currencies.concat(data.results)

					if (!scope.currencies.length) {
						const ecosystemDefaultData = await ecosystemDefaultService
							.getList()
							.then((res) => res.results[0])
						scope.currencies.push(ecosystemDefaultData.currency_object)
						scope.reportOptions.report_currency =
							ecosystemDefaultData.currency_object.id
					}

					if (data.next) {
						currencyOptions.page = currencyOptions.page + 1
						// Victor 2020.12.03 may be not need
						//getPricingPolicies(resolve, reject);
					} else {
						scope.$apply()
						resolve(true)
					}
				})
				.catch(function (error) {
					reject(error)
				})
		})
	}

	const updateReportLayoutOptions = function () {
		const reportLayoutOptions = scope.evDataService.getReportLayoutOptions()
		const newReportLayoutOptions = {
			...reportLayoutOptions,
			...scope.reportLayoutOptions,
		}

		scope.evDataService.setReportLayoutOptions(newReportLayoutOptions)
	}

	if (scope.isReport) {
		currencies = []
		/*scope.dateFrom = scope.reportOptions[dateFromKey];
                    scope.dateTo = scope.reportOptions[dateToKey];*/
		let onReportDateChange = function () {
			if (
				scope.viewContext !== 'split_panel' ||
				!scope.reportLayoutOptions.useDateFromAbove
			) {
				if (dateFromKey) {
					scope.reportOptions[dateFromKey] = scope.datesData.from
				}

				scope.reportOptions[dateToKey] = scope.datesData.to
			}

			scope.updateReportOptions()
		}

		let toggleUseDateFromAbove = function () {
			// reportLayoutOptions.useDateFromAbove updated inside entityViewerDataService by mutation
			updateReportLayoutOptions()

			scope.evEventService.dispatchEvent(
				evEvents.TOGGLE_USE_REPORT_DATE_FROM_ABOVE
			)

			// event REPORT_OPTIONS_CHANGE dispatched from splitPanelReportViewerController as reaction to TOGGLE_USE_REPORT_DATE_FROM_ABOVE
			if (scope.viewContext !== 'split_panel') {
				scope.evEventService.dispatchEvent(evEvents.REPORT_OPTIONS_CHANGE)
			}
		}

		scope.useDateFromAboveName =
			scope.entityType === 'balance-report' ? 'Link date' : 'Link date'
	}

	let updateReportOptions = function () {
		var reportOptions = scope.evDataService.getReportOptions()
		// delete reportLayoutOptions.datepickerOptions.reportFirstDatepicker.secondDate;
		var newReportOptions = Object.assign({}, reportOptions, scope.reportOptions)

		scope.evDataService.setReportOptions(newReportOptions)

		updateReportLayoutOptions()

		scope.evEventService.dispatchEvent(evEvents.REPORT_OPTIONS_CHANGE)

		setTimeout(function () {
			scope.$apply()
		}, 200)
	}
	let missingPricesData
	var initEventListeners = function () {
		scope.evEventService.addEventListener(
			evEvents.LAYOUT_NAME_CHANGE,
			function () {
				listLayout = scope.evDataService.getListLayout()

				if (listLayout && listLayout.name) {
					scope.layoutData.name = listLayout.name
				}
			}
		)

		scope.evEventService.addEventListener(
			evEvents.MISSING_PRICES_LOAD_END,
			function () {
				missingPricesData = scope.evDataService.getMissingPrices()
			}
		)

		if (scope.isReport) {
			scope.evEventService.addEventListener(
				evEvents.REPORT_OPTIONS_CHANGE,
				function () {
					scope.reportOptions = scope.evDataService.getReportOptions()
					scope.reportLayoutOptions =
						scope.evDataService.getReportLayoutOptions()

					if (dateFromKey) {
						scope.datesData.from = scope.reportOptions[dateFromKey]
					}

					scope.datesData.to = scope.reportOptions[dateToKey]
				}
			)
		}
	}
	let datesData
	const init = async function () {
		missingPricesData = scope.evDataService.getMissingPrices()

		if (scope.isReport) {
			getCurrencies()

			prepareReportLayoutOptions()
			;[dateFromKey, dateToKey] = reportHelper.getDateProperties(
				scope.entityType
			)

			datesData = {
				to: scope.reportOptions[dateToKey],
			}

			if (dateFromKey) scope.datesData.from = scope.reportOptions[dateFromKey]
		}

		initEventListeners()
	}

	init()
</script>

<style lang="scss" scoped></style>
