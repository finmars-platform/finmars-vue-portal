/**
 * Created by mevstratov on 22.10.2019.
 */

import evEvents from '@/angular/services/entityViewerEvents'
import metaService from '@/angular/services/metaService'

export default function ($mdDialog) {
	return {
		restrict: 'E',
		scope: {
			groupKey: '=',
			evDataService: '=',
			evEventService: '=',
		},
		templateUrl:
			'views/directives/groupTable/attributeSettingsMenus/g-group-settings-btn-view.html',
		link: function (scope, elem, attrs) {
			scope.entityType = scope.evDataService.getEntityType()
			scope.isReport = metaService.isReport(scope.entityType)

			var groups = scope.evDataService.getGroups()

			groups.forEach(function (group) {
				if (group.key === scope.groupKey) {
					scope.group = group
				}
			})

			var updateGroup = function () {
				for (var i = 0; i < groups.length; i++) {
					if (groups[i].key === scope.groupKey) {
						groups[i] = JSON.parse(JSON.stringify(scope.group))
						break
					}
				}

				scope.evDataService.setGroups(groups)
			}

			scope.openGroupSettings = function ($mdOpenMenu, ev) {
				$mdOpenMenu(ev)
			}

			scope.reportSetSubtotalType = function (type) {
				if (
					!scope.group.hasOwnProperty('report_settings') ||
					scope.group.report_settings === undefined
				) {
					scope.group.report_settings = {}
				}

				if (scope.group.report_settings.subtotal_type === type) {
					scope.group.report_settings.subtotal_type = false
				} else {
					scope.group.report_settings.subtotal_type = type
				}

				updateGroup()

				scope.evEventService.dispatchEvent(evEvents.REDRAW_TABLE)
				scope.evEventService.dispatchEvent(evEvents.REPORT_TABLE_VIEW_CHANGED)
			}

			scope.reportSetBlankLineType = function (type) {
				if (
					!scope.group.hasOwnProperty('report_settings') ||
					scope.group.report_settings === undefined
				) {
					scope.group.report_settings = {}
				}

				if (scope.group.report_settings.blankline_type === type) {
					scope.group.report_settings.blankline_type = false
				} else {
					scope.group.report_settings.blankline_type = type
				}

				updateGroup()

				scope.evEventService.dispatchEvent(evEvents.REDRAW_TABLE)
			}

			scope.renameGroup = function ($mdMenu, $event) {
				$mdDialog
					.show({
						controller: 'RenameFieldDialogController as vm',
						templateUrl: 'views/dialogs/rename-field-dialog-view.html',
						parent: angular.element(document.body),
						targetEvent: $event,
						multiple: true,
						locals: {
							data: scope.group,
						},
					})
					.then(function (res) {
						if (res.status === 'agree') {
							updateGroup()
						}
					})
			}

			scope.evEventService.addEventListener(
				evEvents.GROUPS_CHANGE,
				function () {
					groups = scope.evDataService.getGroups()
				}
			)
		},
	}
}
