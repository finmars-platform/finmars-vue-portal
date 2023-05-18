'use strict'

export default function () {
	import EventService from '../../services/eventService'
	import metaService from '../../services/metaService'
	import directivesEvent from '../../services/events/directivesEvents'

	import utilsHelper from '../../helpers/utils.helper'

	return {
		restrict: 'E',
		scope: {
			label: '@',
			placeholderText: '@',

			entityType: '@',
			/*entityName: "=",
			userCode: "=",
			shortName: "=",
			publicName: "=",
			valueToShow: "=",*/
			entity: '=',
			valueToShow: '=',
			eventService: '=',

			editing: '@',
			isDisabled: '=',

			onChange: '&?',
			onValueToShowChange: '&?',
		},
		template: `<div>
			<multiinput-field label="{{label}}"
							  placeholder-text="{{placeholderText}}"
							  indicator-button-icon="new_label"
							  popup-template-url="'views/popups/entity-names-popup-view.html'"
							  popup-data="popupData"
							  popup-classes="entity-names-popup"
							  event-service="multiinputFieldEventService"
							  is-disabled="isDisabled"
							  base-input-change-fn="baseInputChange(newVal, prevVal)"
							  on-popup-cancel="onPopupCancel()"></multiinput-field>
		</div>`,
		link: {
			pre: function (scope, elem, attr) {
				scope.valueToShow = scope.valueToShow || 'name'
				scope.editingOn = scope.editing === 'true'
				const reqAttrs = metaService.getRequiredEntityAttrs(scope.entityType)

				const getErrorData = function (value) {
					let result = {
						key: 'error',
						error: 'Field should not be empty.',
					}

					if (value) result = null

					if (!result) {
						const noInvalidFields = Object.keys(scope.popupData.fields).find(
							(prop) => !!scope.popupData.fields[prop].errorData
						)

						if (noInvalidFields) {
							scope.multiinputFieldEventService.dispatchEvent(
								directivesEvent.TURN_OFF_ERROR_MODE
							)
						}
					}

					return result
				}

				scope.onPopupCancel = function () {
					let noInvalidFields = true

					// const noInvalidFields = Object.keys(scope.popupData.fields).find(prop => !!scope.popupData.fields[prop].errorData);
					Object.keys(scope.popupData.fields).forEach((prop) => {
						const fieldData = scope.popupData.fields[prop]
						const fieldVal = fieldData.value

						if (reqAttrs.includes(prop)) {
							if (fieldVal) {
								fieldData.errorData = null
							} else {
								fieldData.errorData = getErrorData(fieldVal)
								noInvalidFields = false
							}
						}
					})

					if (noInvalidFields) {
						scope.multiinputFieldEventService.dispatchEvent(
							directivesEvent.TURN_OFF_ERROR_MODE
						)
					} else {
						scope.multiinputFieldEventService.dispatchEvent(
							directivesEvent.TURN_ON_ERROR_MODE
						)
					}
				}

				scope.popupData = {
					fields: {
						name: {
							set value(name) {
								scope.entity.name = name

								this.errorData = getErrorData(scope.entity.name)

								if (scope.onChange) scope.onChange()
							},
							get value() {
								return scope.entity.name
							},

							event: {},
							changeByInput: true,
						},
						short_name: {
							set value(shortName) {
								scope.entity.short_name = shortName
								if (scope.onChange) scope.onChange()
							},
							get value() {
								return scope.entity.short_name
							},
							changeByInput: true,
						},
						user_code: {
							set value(userCode) {
								scope.entity.user_code = userCode

								if (reqAttrs.includes('user_code')) {
									this.errorData = getErrorData(scope.entity.user_code)
								}

								if (scope.onChange) scope.onChange()
							},
							get value() {
								return scope.entity.user_code
							},

							smallOptions: { notNull: reqAttrs.includes('user_code') },
							event: {},
							changeByInput: true,
							locked: scope.editingOn ? 'true' : 'false',
						},

						valueToShow: {
							set value(valueToShow) {
								const changed = scope.valueToShow !== valueToShow

								scope.valueToShow = valueToShow

								if (changed && scope.onValueToShowChange) {
									setTimeout(function () {
										scope.onValueToShowChange()
									}, 100)
								}
							},
							get value() {
								return scope.valueToShow || 'name'
							},

							options: [
								{ id: 'name', name: 'Name' },
								{ id: 'short_name', name: 'Short Name' },
								// {id: 'user_code', name: 'User Code'},
							],
						},
					},
				}

				const placeholdersForNames = {
					/*'name': 'Full Name (Name)',
					'public_name': 'Name if Hidden (Public Name)',
					'short_name': 'System Name (Short Name)',
					'user_code': 'Unique Code (User Code)',*/
					name: 'Full Name',
					public_name: 'Public Name',
					short_name: 'Short Name',
					user_code: 'User Code',
				}

				if (scope.entityType !== 'currency') {
					scope.popupData.fields.public_name = {
						set value(publicName) {
							scope.entity.public_name = publicName
						},
						get value() {
							return scope.entity.public_name
						},
						changeByInput: true,
					}

					// scope.popupData.fields.valueToShow.options.splice(1, 0, {id: 'public_name', name: 'Public Name'});
				}

				if (scope.placeholderText === undefined) {
					scope.placeholderText = placeholdersForNames[scope.valueToShow]
				}

				scope.multiinputFieldEventService = new EventService()
			},
			post: function (scope, elem, attrs) {
				const updateName = function (propName, newValue, oldValue) {
					const value = scope.popupData.fields[propName].value

					// change field if it is empty or having the same value as baseInput
					if (!value || value === oldValue) {
						scope.popupData.fields[propName].value = newValue
					}
				}

				function baseInputChangeFn(newVal, prevVal) {
					updateName('name', newVal, prevVal)
					updateName('short_name', newVal, prevVal)

					if (!scope.editingOn) {
						updateName('user_code', newVal, prevVal)
					}

					updateName('public_name', newVal, prevVal)
				}

				/*
				 * Debounce prevents changing unintended names when deleting text inside base input
				 * e.g. Deleting 'Bank AAA' would also delete 'Bank A' without debounce
				 */
				scope.baseInputChange = utilsHelper.debounce(baseInputChangeFn, 300)

				if (scope.eventService) {
					scope.eventService.addEventListener(
						directivesEvent.TURN_ON_ERROR_MODE,
						function (argumentsObj) {
							if (argumentsObj) {
								for (const prop in argumentsObj) {
									scope.popupData.fields[prop].errorData = argumentsObj[prop]
									// scope.popupData.fields[prop].event = argumentsObj[prop];
								}
							}

							scope.multiinputFieldEventService.dispatchEvent(
								directivesEvent.TURN_ON_ERROR_MODE
							)
						}
					)
				}
			},
		},
	}
}
