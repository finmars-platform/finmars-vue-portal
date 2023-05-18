export default function ($mdDialog) {
	return {
		restriction: 'E',
		templateUrl: 'views/directives/number-format-menu-view.html',
		scope: {
			formatSettings: '=',
			buttonContent: '@',
			buttonClasses: '@',
		},
		link: function (scope, elem, attr) {
			if (!scope.formatSettings) {
				scope.formatSettings = {}
			}

			scope.getButtonClasses = function () {
				return scope.buttonClasses
			}

			scope.setNumberFormatPreset = function (preset) {
				switch (preset) {
					case 'price':
						scope.formatSettings.zero_format_id = 1
						scope.formatSettings.negative_color_format_id = 0
						scope.formatSettings.negative_format_id = 0
						scope.formatSettings.round_format_id = 1
						scope.formatSettings.percentage_format_id = 0
						break
					case 'market_value':
						scope.formatSettings.zero_format_id = 1
						scope.formatSettings.negative_color_format_id = 1
						scope.formatSettings.negative_format_id = 1
						scope.formatSettings.thousands_separator_format_id = 2
						scope.formatSettings.round_format_id = 1
						scope.formatSettings.percentage_format_id = 0
						break
					case 'amount':
						scope.formatSettings.zero_format_id = 1
						scope.formatSettings.negative_color_format_id = 1
						scope.formatSettings.negative_format_id = 0
						scope.formatSettings.thousands_separator_format_id = 2
						scope.formatSettings.round_format_id = 3
						scope.formatSettings.percentage_format_id = 0
						break
					case 'exposure':
						scope.formatSettings.zero_format_id = 1
						scope.formatSettings.negative_color_format_id = 1
						scope.formatSettings.negative_format_id = 1
						scope.formatSettings.round_format_id = 0
						scope.formatSettings.percentage_format_id = 2
						break
					case 'return':
						scope.formatSettings.zero_format_id = 1
						scope.formatSettings.negative_color_format_id = 1
						scope.formatSettings.negative_format_id = 0
						scope.formatSettings.percentage_format_id = 3
						break
				}
			}

			scope.openNumberFormatSettings = function ($event, $mdMenu) {
				$mdMenu.close()

				$mdDialog
					.show({
						controller: 'NumberFormatSettingsDialogController as vm',
						templateUrl:
							'views/dialogs/number-format-settings-dialog-view.html',
						targetEvent: $event,
						multiple: true,
						locals: {
							data: {
								settings: scope.formatSettings,
							},
						},
					})
					.then(function (res) {
						if (res.status === 'agree') {
							scope.formatSettings = res.data
						}
					})
			}
		},
	}
}
