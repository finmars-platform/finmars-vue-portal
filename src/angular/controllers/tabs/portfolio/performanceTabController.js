'use strict'

import metaService from '@/angular/services/metaService'
import portfolioRegisterService from '@/angular/services/portfolioRegisterService'

import GridTableDataService from '@/angular/services/gridTableDataService'
import EventService from '@/angular/services/eventService'

import popupEvents from '@/angular/services/events/popupEvents'

import metaHelper from '@/angularlpers/meta.helper'

export default function PortfolioPerformanceTabController(
	$scope,
	$state,
	$mdDialog,
	commonDialogsService,
	toastNotificationService
) {
	const vm = this

	vm.entity = $scope.$parent.vm.entity
	vm.readyStatus = false
	vm.creatingInstr = false

	vm.raPopupX = {
		value: null,
	}
	vm.raPopupY = {
		value: null,
	}

	let portfoliosRegistersList = []

	vm.addNewRelInstr = function ($event) {
		$mdDialog
			.show({
				controller: 'PortfolioRegisterDialogController as vm',
				templateUrl: 'views/dialogs/portfolio-register-dialog-view.html',
				parent: document.querySelector('.dialog-containers-wrap'),
				targetEvent: $event,
				locals: {
					data: {
						title: 'Create related instrument',
					},
				},
			})
			.then((res) => {
				if (res.status === 'agree') {
					const prtfRegisterToCreate = res.data
					prtfRegisterToCreate.portfolio = vm.entity.id

					vm.creatingInstr = true

					portfolioRegisterService.create(res.data).then((registerData) => {
						const rowObj = getRowForRelInstrGt(
							registerData,
							portfoliosRegistersList.length
						)

						relationInstrumentsGtData.body.push(rowObj)

						portfoliosRegistersList.push(registerData)

						toastNotificationService.success(
							'Register ' + res.data.name + ' created.'
						)

						vm.creatingInstr = false

						$scope.$apply()
					})
				}
			})
	}

	vm.rowActionsPopupData = {
		row: null,
		options: [
			{
				key: 'open_instrument',
				name: 'Go to instrument detail page',
				icon: 'article',
				onClick: function (option, _$popup) {
					const registerUc = vm.rowActionsPopupData.row.key

					_$popup.cancel()

					const register = portfoliosRegistersList.find(
						(register) => register.user_code === registerUc
					)
					const url = $state.href('app.portal.data.instrument', {
						entity: register.linked_instrument_object.user_code,
					})

					window.open(url, '_blank')
				},
			},
			{
				key: 'delete',
				name: 'Delete instrument and relation',
				icon: 'delete',
				onClick: function (option, _$popup) {
					const rowData = vm.rowActionsPopupData.row

					_$popup.cancel()

					commonDialogsService
						.warning({
							warning: {
								title: 'Warning',
								description:
									"Instrument and it's relation to portfolio will be deleted. Are you sure?",
							},
						})
						.then((res) => {
							if (res.status === 'agree') {
								const registerUc = rowData.key

								const regIndex = portfoliosRegistersList.findIndex(
									(register) => register.user_code === registerUc
								)
								const register = portfoliosRegistersList[regIndex]

								const instrName = register.linked_instrument_object.short_name

								portfolioRegisterService.deleteByKey(register.id).then(() => {
									toastNotificationService.success(
										`Instrument ${instrName} and it's relation to portfolio ${vm.entity.short_name} were deleted.`
									)
									portfoliosRegistersList.splice(regIndex, 1)

									const rowToDelete = vm.relInstrGtDataService.getRowByKey(
										rowData.key
									)
									vm.relInstrGtDataService.deleteRows(rowToDelete)

									$scope.$apply()
								})

								/* if (rowData.newRow) {
								// remove newly created register

							}
							else {

								portfolioRegisterService.deleteByKey(register.id);
								instrumentService.deleteByKey(register.linked_instrument);

								if (register.valuation_pricing_policy) {
									pricingPolicyService.deleteByKey(register.valuation_pricing_policy);
								}

							} */
							}
						})
				},
			},
		],
	}

	const openRowActionsPopup = function ($event, rowData) {
		vm.raPopupX.value = $event.clientX
		vm.raPopupY.value = $event.clientY

		vm.rowActionsPopupData.row = rowData
		vm.rowActionsPopupEventService.dispatchEvent(popupEvents.OPEN_POPUP, {
			doNotUpdateScope: true,
		})
	}

	let relationInstrumentsGtData = {
		header: {
			order: 'header',
			columns: [],
		},
		body: [],
		templateRow: {
			order: 'newRow',
			isActive: false,
			columns: [
				{
					key: 'relationName',
					columnName: 'Relation name',
					order: 0,
					cellType: 'readonly_text',
					settings: {
						value: null,
					},
					styles: {
						'grid-table-cell-elem': {
							'min-width': '240px',
							width: '30%',
						},
					},
				},
				{
					key: 'instrument',
					columnName: 'Instrument',
					cellType: 'readonly_text',
					order: 1,
					settings: {
						value: null,
					},
					styles: {
						'grid-table-cell-elem': {
							'min-width': '210px',
							width: '30%',
						},
					},
				},
				{
					key: 'valuationCurrency',
					columnName: 'Valuation currency',
					cellType: 'readonly_text',
					order: 2,
					settings: {
						value: null,
					},
					styles: {
						'grid-table-cell-elem': {
							'min-width': '150px',
							width: '18%',
						},
					},
				},
				{
					key: 'valuationPricingPolicy',
					columnName: 'Pricing policy',
					cellType: 'readonly_text',
					order: 3,
					settings: {
						value: null,
					},
					styles: {
						'grid-table-cell-elem': {
							'min-width': '175px',
							width: '18%',
						},
					},
				},
				{
					key: 'rowActionButton',
					columnName: '',
					cellType: 'button',
					settings: {
						buttonContent: `<div class="material-icons">more_vert</div>`,
					},
					methods: {
						onClick: openRowActionsPopup,
					},
					order: 4,
					styles: {
						'grid-table-cell-elem': { width: '65px' },
					},
				},
			],
		},
		components: {
			topPanel: false,
			rowCheckboxes: false,
		},
	}

	const loadPrtfRegisters = function () {
		const options = {
			pageSize: 1000,
			page: 1,
		}

		return new Promise((resolve, reject) => {
			metaService
				.loadDataFromAllPages(portfolioRegisterService.getList, [options])
				.then((prData) => {
					prData = prData.filter(
						(register) => register.portfolio === vm.entity.id
					)

					resolve(prData)
				})
				.catch((error) => reject(error))
		})
	}

	const getRowForRelInstrGt = function (registerData, order) {
		const rowObj = metaHelper.recursiveDeepCopy(
			relationInstrumentsGtData.templateRow,
			true
		)

		rowObj.key = registerData.user_code
		rowObj.order = order
		rowObj.newRow = !!(rowObj.frontOptions && rowObj.frontOptions.newRow)

		let nameToShow = $scope.$parent.vm.nameToShow

		const relName = rowObj.columns.find((col) => col.key === 'relationName')
		relName.settings.value = registerData[nameToShow]

		if (registerData.linked_instrument_object) {
			const instrument = rowObj.columns.find((col) => col.key === 'instrument')
			instrument.settings.value =
				registerData.linked_instrument_object.short_name
		}

		if (registerData.valuation_currency_object) {
			const valCurrency = rowObj.columns.find(
				(col) => col.key === 'valuationCurrency'
			)
			valCurrency.settings.value =
				registerData.valuation_currency_object.short_name
		}

		if (registerData.valuation_pricing_policy_object) {
			const valPp = rowObj.columns.find(
				(col) => col.key === 'valuationPricingPolicy'
			)
			valPp.settings.value =
				registerData.valuation_pricing_policy_object.short_name
		}

		return rowObj
	}

	const createDataForRelInstrGt = function () {
		relationInstrumentsGtData.body = []

		const rowObj = metaHelper.recursiveDeepCopy(
			relationInstrumentsGtData.templateRow,
			true
		)

		relationInstrumentsGtData.header.columns = rowObj.columns.map(function (
			column
		) {
			return {
				key: column.key,
				columnName: column.columnName,
				order: column.order,
				sorting: column.key !== 'rowActionButton',
				styles: {
					'grid-table-cell-elem': {
						'min-width': column.styles['grid-table-cell-elem']['min-width'],
						width: column.styles['grid-table-cell-elem'].width,
					},
				},
			}
		})

		//region assemble body rows
		portfoliosRegistersList.forEach((register, index) => {
			const rowObj = getRowForRelInstrGt(register, index)
			relationInstrumentsGtData.body.push(rowObj)
		})
		//endregion

		vm.relInstrGtDataService.setTableData(relationInstrumentsGtData)
	}

	const init = function () {
		vm.relInstrGtDataService = new GridTableDataService()
		vm.relInstrGtEventService = new EventService()

		vm.rowActionsPopupEventService = new EventService()

		loadPrtfRegisters().then((prList) => {
			portfoliosRegistersList = prList
			createDataForRelInstrGt()

			vm.readyStatus = true

			$scope.$apply()
		})
	}

	init()
}
