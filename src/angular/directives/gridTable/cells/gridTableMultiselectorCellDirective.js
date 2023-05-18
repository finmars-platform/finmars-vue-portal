import gtEvents from '@/angular/services/gridTableEvents'

import ChipsListEventService from '@/angular/services/eventService'
import directivesEvents from '@/angular/services/events/directivesEvents'

export default function ($mdDialog) {
	return {
		restrict: 'E',
		scope: {
			row: '=',
			column: '=',
			gtDataService: '=',
			gtEventService: '=',
		},
		templateUrl:
			'views/directives/gridTable/cells/grid-table-multiselector-cell-view.html',
		link: function (scope, elem, attrs) {
			let cellMethods = scope.column.methods || {}

			let onCellValueChange = function () {
				let rowData = {
					key: scope.row.key,
					order: scope.row.order,
				}

				let colData = {
					key: scope.column.key,
					order: scope.column.order,
				}

				if (cellMethods.onChange) {
					cellMethods.onChange(
						rowData,
						colData,
						scope.gtDataService,
						scope.gtEventService
					)
				}

				scope.gtEventService.dispatchEvent(gtEvents.CELL_VALUE_CHANGED, {
					row: rowData,
					column: colData,
				})
			}

			let getMultiselectorOptions = function () {
				return new Promise(function (resolve) {
					scope.column.settings
						.getItemsMethod()
						.then(function (data) {
							scope.column.settings.selectorOptions = data.results
							resolve()
						})
						.catch(function () {
							scope.column.settings.selectorOptions = []
							resolve()
						})
				})
			}

			let formatDataForChips = function () {
				scope.chipsList = []

				scope.column.settings.value.forEach(function (selOption) {
					let selOptId = selOption

					if (typeof selOptId === 'object') {
						selOptId = selOption.id
					}

					for (
						let i = 0;
						i < scope.column.settings.selectorOptions.length;
						i++
					) {
						let option = scope.column.settings.selectorOptions[i]

						if (option.id === selOptId) {
							scope.chipsList.push({
								id: selOptId,
								text: option.name,
							})
						}
					}
				})
			}

			let onCellClick = function (event) {
				event.preventDefault()
				event.stopPropagation()

				$mdDialog
					.show({
						controller: 'TwoFieldsMultiselectDialogController as vm',
						templateUrl:
							'views/dialogs/two-fields-multiselect-dialog-view.html',
						targetEvent: event,
						multiple: true,
						locals: {
							data: {
								items: scope.column.settings.selectorOptions,
								model: scope.column.settings.value,
								nameProperty: 'name',
								orderOptions: scope.column.settings.orderOptions,
								strictOrder: scope.column.settings.strictOrder,
								optionsCheckboxes: scope.column.settings.optionsCheckboxes,
							},
						},
					})
					.then(function (res) {
						if (res.status === 'agree') {
							scope.column.settings.value = res.selectedItems

							formatDataForChips()
							let chipsList = JSON.parse(JSON.stringify(scope.chipsList))

							scope.chipsListEventService.dispatchEvent(
								directivesEvents.CHIPS_LIST_CHANGED,
								{ chipsList: chipsList, updateScope: true }
							)

							setTimeout(function () {
								onCellValueChange()
							}, 500)
						}
					})
			}

			let init = async function () {
				scope.chipsListEventService = new ChipsListEventService()

				scope.chipsOrderSettings = 'true'

				if (scope.strictOrder) {
					scope.chipsOrderSettings = ''
				}

				if (
					!scope.column.settings.selectorOptions &&
					scope.column.settings.getItemsMethod
				) {
					await getMultiselectorOptions()
				}

				if (!scope.column.isDisabled) {
					elem[0].addEventListener('click', onCellClick)
				}

				formatDataForChips()
			}

			scope.gtEventService.addEventListener(gtEvents.REDRAW_TABLE, function () {
				formatDataForChips()

				scope.chipsListEventService.dispatchEvent(
					directivesEvents.CHIPS_LIST_ELEMENT_SIZE_CHANGED
				)

				scope.chipsListEventService.dispatchEvent(
					directivesEvents.CHIPS_LIST_CHANGED,
					{ chipsList: scope.chipsList, updateScope: false }
				)
			})

			init()
		},
	}
}
