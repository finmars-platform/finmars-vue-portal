import directiveEvents from '../../services/events/directivesEvents'

export default function () {
	return {
		restrict: 'E',
		scope: {
			label: '@',
			fieldTypesData: '=',
			/* fieldTypesData example

					[
						{
							'key': "",
							'model': "",
							'label': "",
							'fieldType': '',
							'isDefault': true,
							'isActive': false,
							'sign': '<div class="multitype-field-type-letter type-with-constant">T</div>',
							'value_type': 10,
							'fieldData': {
								'smallOptions': {'dialogParent': '.dialog-containers-wrap'}
							}
						}
				  	]
				 */
			enteredValue: '<', // object {model: "entered into field value", type: "selected type"}
			typeSwitch: '@', // 'button', 'selector'. Default - button.
			isDisabled: '=',
			eventService: '=',

			onTypeChange: '&?',
			onValueChange: '&?',
		},
		templateUrl: 'views/directives/customInputs/multitype-field-view.html',
		link: function (scope, elem, attr) {
			scope.readyStatus = false

			if (!scope.typeSwitch) scope.typeSwitch = 'button'

			scope.getInputContainerClasses = function () {
				var classes = ''

				if (scope.isDisabled) {
					classes += 'custom-input-is-disabled'
				} else if (scope.error) {
					classes = 'custom-input-error'
				}

				if (scope.noIndicatorBtn) {
					classes += ' no-indicator-btn'
				}

				return classes
			}

			scope.getLabel = function () {
				if (scope.activeType.hasOwnProperty('label')) {
					return scope.activeType.label
				}

				return scope.label || null
			}

			scope.onChangeCallback = function () {
				if (scope.onValueChange) {
					scope.onValueChange()
				}
			}

			const activateType = function (type) {
				// previous activeType
				scope.activeType.model = null
				scope.activeType.isActive = false

				// current activeType
				scope.activeType = type
				scope.activeType.model = null
				scope.activeType.isActive = true

				if (scope.onTypeChange)
					scope.onTypeChange({ activeType: scope.activeType })
			}

			/* const openPopupSelector = function () {



				};

				scope.switchType = (scope.fieldTypesData.length > 2) ? cycleTypes : ; */
			scope.switchType = function () {
				let nextTypeIndex = scope.activeType.index + 1
				if (nextTypeIndex === scope.fieldTypesData.length) nextTypeIndex = 0
				/* // previous activeType
					scope.activeType.model = null;
					scope.activeType.isActive = false;

					// current activeType
					scope.activeType = scope.fieldTypesData[nextTypeIndex];
					scope.activeType.model = null;
					scope.activeType.isActive = true;

					if (scope.onTypeChange) scope.onTypeChange({activeType: scope.activeType}); */
				activateType(scope.fieldTypesData[nextTypeIndex])
			}

			scope.typeSelPopupData = {
				typesList: scope.fieldTypesData,
				selectType: function (type, _$popup) {
					_$popup.cancel()
					activateType(type)
				},
			}

			scope.typeSelPopupTpl = `<div class="multitype-field-type-selector-popup">
					<div ng-repeat="type in popupData.typesList" class="field-type-option" ng-click="popupData.selectType(type, _$popup)">
						<div class="material-icons" ng-class="{'visibility-hidden': !type.isActive}">done</div>
						<div class="flex-row fc-space-between fi-center width-100">
							<div class="field-type-name" ng-bind="type.name"></div>
							<div ng-bind-html="type.sign"></div>
						</div>
					</div>
				</div>`

			if (scope.eventService) {
				scope.eventService.addEventListener(
					directiveEvents.FIELD_TYPES_DATA_CHANGED,
					function () {
						init()
					}
				)
			}

			const init = function () {
				scope.readyStatus = false

				// IMPORTANT: helps to understand that error occured inside multitypeFieldDirecitve
				if (
					!Array.isArray(scope.fieldTypesData) ||
					!scope.fieldTypesData.length
				) {
					throw new Error(
						'Wrong fieldTypesData set for multitypeFieldDirective: ' +
							scope.label,
						{ cause: scope.fieldTypesData }
					)
				}

				scope.fieldTypesData.forEach((type, index) => (type.index = index))

				scope.activeType = scope.fieldTypesData.find((type) => type.isActive)

				if (!scope.activeType) {
					scope.activeType = scope.fieldTypesData.find((type) => type.isDefault)

					if (!scope.activeType) {
						throw new Error('No type specified as active.', {
							cause: scope.fieldTypesData,
						})
					}

					scope.activeType.isActive = true
				}

				scope.readyStatus = true
			}

			init()
		},
	}
}
