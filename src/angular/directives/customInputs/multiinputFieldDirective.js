'use strict'

import directivesEvents from '../../services/events/directivesEvents'
import directivesEvent from '../../services/events/directivesEvents'

export default function () {
	import EventService from '../../services/eventService'
	import directivesEvents from '../../services/events/directivesEvents'
	import popupEvents from '../../services/events/popupEvents'

	return {
		restrict: 'E',
		scope: {
			label: '@',
			placeholderText: '@',
			indicatorButtonIcon: '@',

			popupTemplateUrl: '@',
			popupData: '=',
			popupClasses: '@',

			eventService: '=',
			isDisabled: '=',

			baseInputChangeFn: '&?',
			onChange: '&?',
			onValueToShowChange: '&?',
			onBlurCallback: '&?',
			// onPopupSave: "&?",
			onPopupCancel: '&?',
		},
		templateUrl: 'views/directives/customInputs/multiinput-field-view.html',
		link: {
			pre: function (scope, elem, attrs) {
				scope.inputModel = {
					value: '',
				}

				scope.popupEventService = new EventService()

				scope.biEventObj = {
					event: {},
				}
			},
			post: function (scope, elem, attrs) {
				scope.popupClasses = scope.popupClasses || ''

				let currentVts = scope.popupData.fields.valueToShow.value

				scope.openPopup = function () {
					// have to use property 'errorData' because custom inputs reset property 'event' after turning on error mode
					Object.keys(scope.popupData.fields).forEach((prop) => {
						const fieldData = scope.popupData.fields[prop]

						if (fieldData.errorData) {
							fieldData.event = { ...{}, ...fieldData.errorData }
						}
					})

					scope.popupData.fields

					scope.popupEventService.dispatchEvent(popupEvents.OPEN_POPUP, {
						doNotUpdateScope: true,
					})
				}

				const getVal = function () {
					const fieldProp = scope.popupData.fields.valueToShow.value
					return scope.popupData.fields[fieldProp].value
				}

				const checkVtsForChanges = function () {
					const vts = scope.popupData.fields.valueToShow.value

					if (currentVts !== vts && scope.onValueToShowChange) {
						scope.onValueToShowChange()
					}

					currentVts = vts
				}

				/* scope.onPopupSaveCallback = function () {

					checkVtsForChanges();
					scope.inputModel.value = getVal();

					if (scope.onPopupSave) {
						scope.onPopupSave();
					}

				}; */

				scope.onPopupCancelCallback = function () {
					checkVtsForChanges()
					scope.inputModel.value = getVal()

					if (scope.onPopupCancel) {
						scope.onPopupCancel()
					}
				}

				if (scope.baseInputChangeFn) {
					scope.onBaseInputChange = function () {
						scope.baseInputChangeFn({
							newVal: scope.inputModel.value,
							prevVal: getVal(),
						})
					}
				} else {
					scope.onBaseInputChange = function () {
						Object.keys(scope.popupData.fields).forEach((prop) => {
							const fieldData = scope.popupData.fields[prop]

							if (fieldData.changeByInput) {
								fieldData.value = scope.inputModel.value
							}
						})
					}
				}

				const init = function () {
					scope.inputModel.value = getVal()

					if (scope.eventService) {
						scope.eventService.addEventListener(
							directivesEvents.TURN_ON_ERROR_MODE,
							function () {
								scope.biEventObj.event = {
									key: 'error',
									error: 'There are fields with errors inside',
								}
							}
						)

						scope.eventService.addEventListener(
							directivesEvents.TURN_OFF_ERROR_MODE,
							function () {
								scope.biEventObj.event = { key: 'reset' }
							}
						)
					}
				}

				init()
			},
		},
	}
}
