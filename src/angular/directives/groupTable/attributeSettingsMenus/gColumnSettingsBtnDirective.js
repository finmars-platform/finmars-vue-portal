/**
 * Created by mevstratov on 22.10.2019.
 */

import evEvents from '@/angular/services/entityViewerEvents'
import metaService from '@/angular/services/metaService'

export default function ($mdDialog) {
	return {
		restrict: 'E',
		scope: {
			columnKey: '=',
			evDataService: '=',
			evEventService: '=',
		},
		templateUrl:
			'views/directives/groupTable/attributeSettingsMenus/g-column-settings-btn-view.html',
		link: function (scope, elem, attrs) {
			scope.entityType = scope.evDataService.getEntityType()
			scope.isReport = metaService.isReport(scope.entityType)

			var columns = scope.evDataService.getColumns()

			columns.forEach(function (col) {
				if (col.key === scope.columnKey) {
					scope.column = col
				}
			})

			var updateColumn = function () {
				for (var i = 0; i < columns.length; i++) {
					if (columns[i].key === scope.columnKey) {
						columns[i] = JSON.parse(JSON.stringify(scope.column))
						break
					}
				}

				scope.evDataService.setColumns(columns)
			}

			scope.renameColumn = function ($mdMenu, $event) {
				$mdDialog
					.show({
						controller: 'RenameFieldDialogController as vm',
						templateUrl: 'views/dialogs/rename-field-dialog-view.html',
						parent: angular.element(document.body),
						targetEvent: $event,
						multiple: true,
						locals: {
							data: scope.column,
						},
					})
					.then(function (res) {
						if (res.status === 'agree') {
							updateColumn()
							scope.evEventService.dispatchEvent(evEvents.COLUMNS_CHANGE)
						}
					})
			}

			scope.resizeColumn = function ($mdMenu, $event) {
				$mdMenu.close()

				$mdDialog
					.show({
						controller: 'ResizeFieldDialogController as vm',
						templateUrl: 'views/dialogs/resize-field-dialog-view.html',
						parent: angular.element(document.body),
						targetEvent: $event,
						multiple: true,
						locals: {
							data: scope.column,
						},
					})
					.then(function (res) {
						if (res.status === 'agree') {
							updateColumn()

							scope.evEventService.dispatchEvent(evEvents.COLUMNS_CHANGE)
							scope.evEventService.dispatchEvent(evEvents.REDRAW_TABLE)
						}
					})
			}

			scope.activateColumnNumberRenderingPreset = function (rendPreset) {
				if (!scope.column.report_settings) {
					scope.column.report_settings = {}
				}

				switch (rendPreset) {
					case 'price':
						scope.column.report_settings.zero_format_id = 1
						scope.column.report_settings.negative_color_format_id = 0
						scope.column.report_settings.negative_format_id = 0
						scope.column.report_settings.round_format_id = 1
						scope.column.report_settings.percentage_format_id = 0
						break
					case 'market_value':
						scope.column.report_settings.zero_format_id = 1
						scope.column.report_settings.negative_color_format_id = 1
						scope.column.report_settings.negative_format_id = 1
						scope.column.report_settings.thousands_separator_format_id = 2
						scope.column.report_settings.round_format_id = 1
						scope.column.report_settings.percentage_format_id = 0
						break
					case 'amount':
						scope.column.report_settings.zero_format_id = 1
						scope.column.report_settings.negative_color_format_id = 1
						scope.column.report_settings.negative_format_id = 0
						scope.column.report_settings.thousands_separator_format_id = 2
						scope.column.report_settings.round_format_id = 3
						scope.column.report_settings.percentage_format_id = 0
						break
					case 'exposure':
						scope.column.report_settings.zero_format_id = 1
						scope.column.report_settings.negative_color_format_id = 1
						scope.column.report_settings.negative_format_id = 1
						scope.column.report_settings.round_format_id = 0
						scope.column.report_settings.percentage_format_id = 2
						break
					case 'return':
						scope.column.report_settings.zero_format_id = 1
						scope.column.report_settings.negative_color_format_id = 1
						scope.column.report_settings.negative_format_id = 0
						scope.column.report_settings.percentage_format_id = 3
						break
				}

				updateColumn()

				scope.evEventService.dispatchEvent(evEvents.REDRAW_TABLE)
				scope.evEventService.dispatchEvent(evEvents.REPORT_TABLE_VIEW_CHANGED)
			}

			scope.selectSubtotalType = function (type) {
				if (!scope.column.hasOwnProperty('report_settings')) {
					scope.column.report_settings = {}
				}

				if (scope.column.report_settings.subtotal_formula_id == type) {
					scope.column.report_settings.subtotal_formula_id = null
				} else {
					scope.column.report_settings.subtotal_formula_id = type
				}

				updateColumn()

				scope.evEventService.dispatchEvent(evEvents.REDRAW_TABLE)
				scope.evEventService.dispatchEvent(evEvents.REPORT_TABLE_VIEW_CHANGED)
			}

			scope.checkSubtotalFormula = function (type) {
				if (
					scope.column.hasOwnProperty('report_settings') &&
					scope.column.report_settings
				) {
					if (scope.column.report_settings.subtotal_formula_id === type) {
						return true
					}
				}

				return false
			}

			scope.openNumberFormatDialog = function ($event) {
				$mdDialog
					.show({
						controller: 'NumberFormatSettingsDialogController as vm',
						templateUrl:
							'views/dialogs/number-format-settings-dialog-view.html',
						targetEvent: $event,
						multiple: true,
						locals: {
							data: {
								settings: scope.column.report_settings,
							},
						},
					})
					.then((res) => {
						if (res.status === 'agree') {
							scope.column.report_settings = res.data
							updateColumn()

							scope.evEventService.dispatchEvent(evEvents.REDRAW_TABLE)
							scope.evEventService.dispatchEvent(
								evEvents.REPORT_TABLE_VIEW_CHANGED
							)
						}
					})
			}

			/* scope.reportHideSubtotal = function () {

                    if (!scope.column.hasOwnProperty('report_settings')) {
                        scope.column.report_settings = {};
                    }

                    scope.column.report_settings.hide_subtotal = !scope.column.report_settings.hide_subtotal;

                    updateColumn();

                    scope.evEventService.dispatchEvent(evEvents.REDRAW_TABLE);
                    scope.evEventService.dispatchEvent(evEvents.REPORT_TABLE_VIEW_CHANGED);

                }; */

			scope.evEventService.addEventListener(
				evEvents.COLUMNS_CHANGE,
				function () {
					columns = scope.evDataService.getColumns()
				}
			)
		},
	}
}
