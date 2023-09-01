/**
 * Created by mevstratov on 24.06.2019.
 */

export default function ($scope, $mdDialog) {
	var vm = this

	vm.mappingFile = null

	vm.mappingFileIsAvailable = function () {
		return vm.mappingFile !== null && vm.mappingFile !== undefined
	}

	vm.checkExtension = function (file, $event) {


		if (file) {
			var ext = file.name.split('.')[1]

			if (ext !== 'fcfg') {
				$mdDialog
					.show({
						controller: 'SuccessDialogController as vm',
						templateUrl: 'views/dialogs/success-dialog-view.html',
						targetEvent: $event,
						locals: {
							success: {
								title: 'Warning!',
								description: 'You are trying to load incorrect file',
							},
						},
						multiple: true,
						preserveScope: true,
						autoWrap: true,
						skipHide: true,
					})
					.then(function () {
						if (file === vm.configurationFile) {
							vm.configurationFile = null
						} else {
							vm.mappingFile = null
						}
					})
			}
		}
	}

	vm.openImportMappingManager = function ($event) {
		var reader = new FileReader()

		reader.readAsText(vm.mappingFile)

		reader.onload = function (evt) {
			try {
				var file = JSON.parse(evt.target.result)

				$mdDialog
					.show({
						controller:
							'SettingGeneralMappingPreviewFileDialogController as vm',
						templateUrl:
							'views/dialogs/settings-general-mapping-preview-file-dialog-view.html',
						parent: angular.element(document.body),
						targetEvent: $event,
						preserveScope: true,
						autoWrap: true,
						skipHide: true,
						locals: {
							file: file,
						},
					})
					.then(function (res) {
						vm.mappingFile = null
					})
			} catch (error) {
				$mdDialog.show({
					controller: 'WarningDialogController as vm',
					templateUrl: 'views/dialogs/warning-dialog-view.html',
					parent: angular.element(document.body),
					targetEvent: $event,
					clickOutsideToClose: false,
					locals: {
						warning: {
							title: 'Error',
							description: 'Unable to read it. This file is corrupted.',
						},
					},
					preserveScope: true,
					autoWrap: true,
					skipHide: true,
				})

				vm.mappingFile = null
			}
		}
	}

	vm.openExportMappingManager = function ($event) {
		$mdDialog.show({
			controller: 'SettingGeneralMappingExportFileDialogController as vm',
			templateUrl:
				'views/dialogs/settings-general-mapping-export-file-dialog-view.html',
			parent: angular.element(document.body),
			targetEvent: $event,
			preserveScope: true,
			autoWrap: true,
			skipHide: true,
		})
	}

	vm.openMapping = function ($event, mapItem) {
		$mdDialog.show({
			controller: 'EntityTypeMappingDialogController as vm',
			templateUrl: 'views/dialogs/entity-type-mapping-dialog-view.html',
			parent: angular.element(document.body),
			targetEvent: $event,
			preserveScope: true,
			autoWrap: true,
			skipHide: true,
			locals: {
				mapItem: mapItem,
			},
		})
	}
}
