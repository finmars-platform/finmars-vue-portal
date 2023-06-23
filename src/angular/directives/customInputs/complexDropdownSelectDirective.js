'use strict'

import directivesEvents from '../../services/events/directivesEvents'

export default function () {
	return {
		restrict: 'E',
		scope: {
			label: '@',
			model: '=',
			menuOptions: '=',
			favoriteOptions: '=',

			eventService: '=',

			onSelectedOptionChange: '&?',
			onFavoriteOptionsChange: '&?',
		},
		templateUrl:
			'views/directives/customInputs/complex-dropdown-select-view.html',
		link: function (scope, elem, attrs) {
			if (!scope.favoriteOptions) scope.favoriteOptions = []

			scope.selectedOption = null

			scope.menuOptions = scope.menuOptions.map((option) => {
				option.folded = true
				return option
			})

			const findSelectedOption = function () {
				// scope.selectedOption = scope.menuOptions.find(option => option.id === scope.model);
				for (const group of scope.menuOptions) {
					scope.selectedOption = group.children.find(
						(option) => option.id === scope.model
					)

					if (scope.selectedOption || scope.selectedOption === 0) break
				}

				if (scope.selectedOption) {
					scope.selectedOption.isActive = true
				}

				if (scope.favoriteOptions && scope.favoriteOptions.length) {
					let selFavOpt = scope.favoriteOptions.find(
						(option) => option.id === scope.model
					)
					if (selFavOpt) selFavOpt.isActive = true
				}
			}

			if (scope.model || scope.model === 0) findSelectedOption()

			let originalFavoriteOptsList = JSON.parse(
				angular.toJson(scope.favoriteOptions)
			)

			const selectOption = function (groupName, option, _$popup) {
				_$popup.cancel()

				if (scope.selectedOption && scope.selectedOption.id === option.id)
					return

				if (scope.selectedOption) scope.selectedOption.isActive = false // unmark previous selected option

				if (scope.favoriteOptions && scope.favoriteOptions.length) {
					let prevSelectedFavOpt = scope.favoriteOptions.find(
						(favOpt) => favOpt.isActive
					)
					if (prevSelectedFavOpt) prevSelectedFavOpt.isActive = false

					let selectedFavOpt = scope.favoriteOptions.find(
						(favOpt) => favOpt.id === option.id
					)
					if (selectedFavOpt) selectedFavOpt.isActive = true
				}

				const selOptGroup = scope.menuOptions.find(
					(group) => group.name === groupName
				)
				scope.selectedOption = selOptGroup.children.find(
					(mOption) => mOption.id === option.id
				)
				scope.selectedOption.isActive = true

				scope.model = scope.selectedOption.id
				scope.popupData.selectedOptions = scope.selectedOption.id

				if (scope.onSelectedOptionChange) {
					setTimeout(() => {
						scope.onSelectedOptionChange({ selected: scope.selectedOption })
					}, 0)
				}
			}

			const didFavoriteOptionsChange = function () {
				if (scope.favoriteOptions.length !== originalFavoriteOptsList.length)
					return true

				for (let i = 0; i < scope.favoriteOptions.length; i++) {
					if (scope.favoriteOptions[i].id !== originalFavoriteOptsList[i].id) {
						return true
					}
				}

				return false
			}

			scope.onPopupClose = function () {
				if (didFavoriteOptionsChange()) {
					originalFavoriteOptsList = JSON.parse(
						angular.toJson(scope.favoriteOptions)
					)
					if (scope.onFavoriteOptionsChange) scope.onFavoriteOptionsChange()
				}
			}

			scope.popupData = {
				selectedOptions: scope.model,
				menuOptions: scope.menuOptions,
				favoriteOptions: scope.favoriteOptions,
				showDescriptions: false,
				selectOptionCallback: selectOption,
			}

			if (scope.eventService) {
				scope.eventService.addEventListener(
					directivesEvents.MODEL_CHANGED_FROM_OUTSIDE,
					function () {
						if (scope.model || scope.model === 0) findSelectedOption()
					}
				)
			}
		},
	}
}
