export default function () {
	return {
		restrict: 'E',
		scope: {
			model: '=',
			menuOptions: '=',
			smallOptions: '<',
			isDisabled: '=',
			onChangeCallback: '&?',
		},
		template: `<div class="dropdown-select-2">
                    <dropdown-select model="model"
                                     menu-options="menuOptions"
                                     small-options="dsSmallOpts"
                                     is-disabled="isDisabled"
                                     on-change-callback="onChangeCallback()"></dropdown-select>

                    <span class="material-icons sel-2-icon selIcon">arrow_drop_down</span>
            </div>`,
		link: function (scope, elem, attr) {
			let dropdownSelectElem = elem[0].querySelector('.customInputPopup')
			const selIconElem = elem[0].querySelector('.selIcon')

			scope.dsSmallOpts = {}

			if (scope.smallOptions) {
				scope.dsSmallOpts = { ...{}, ...scope.smallOptions }
			}

			scope.dsSmallOpts.noIndicatorBtn = true

			// using addEventListener instead of ngClick to prevent $digest error
			selIconElem.addEventListener('click', function () {
				if (!dropdownSelectElem) {
					dropdownSelectElem = elem[0].querySelector('.customInputPopup')
				}

				dropdownSelectElem.click()
			})
		},
	}
}
