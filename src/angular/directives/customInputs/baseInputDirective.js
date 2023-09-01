"use strict";

export default function () {

	return {
		restrict: "E",
		scope: {
			label: "@",
			placeholderText: "@",
			indicatorButtonIcon: "@",
			model: "=",
			eventSignal: "=",
			isDisabled: "=",
			onChange: "&?",
			onBlurCallback: "&?",
			onIndicatorButtonClick: "&?",
		},
		templateUrl: "views/directives/customInputs/base-input-view.html",
		link: function (scope, elem, attr) {

			scope.indicatorBtn = scope.indicatorButtonIcon || 'edit';

			let stylePreset;

			/*scope.inputModel = {
				value: ''
			}*/

			scope.onInputChange = function () {

				if (scope.onChange) {

					setTimeout(function () {
						scope.onChange();
					}, 100);

				}
			};

			scope.onIndBtnClick = function () {
				if (scope.onIndicatorButtonClick) {
					scope.onIndicatorButtonClick();
				}
			}

			scope.getInputContainerClasses = function () {

				var classes = "";

				if (scope.isDisabled) {
					classes += "custom-input-is-disabled";

				} else if (scope.error) {
					classes = 'custom-input-error';

				} else if (stylePreset) {
					classes = 'custom-input-preset' + stylePreset;

				} else if (scope.valueIsValid) {
					classes = 'custom-input-is-valid';
				}

				if (scope.noIndicatorBtn) {
					classes += " no-indicator-btn";
				}

				if (scope.renderHyperlinks) {
					classes += " render-hyperlinks"
				}

				return classes;

			};

			if (scope.eventSignal) {

				scope.$watch("eventSignal", function () {

					if (scope.eventSignal && scope.eventSignal.key) {

						switch (scope.eventSignal.key) {

							case "mark_not_valid_fields":
								if (scope.smallOptions &&
									scope.smallOptions.notNull &&
									!scope.model) {

									scope.error = "Field should not be null";

								}

								break;

							case "error":
								scope.error = JSON.parse(JSON.stringify(scope.eventSignal.error));
								break;

							case "set_style_preset1":
								stylePreset = 1;
								break;

							case "set_style_preset2":
								stylePreset = 2;
								break;

							case "reset": // reset changes done by eventSignal

								scope.error = "";
								stylePreset = "";

								break;

						}

						scope.eventSignal = {};
					}
				});

			}

		}
	}

}
