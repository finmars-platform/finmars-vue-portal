/**
 * Created by szhitenev on 17.08.2016.
 */

export default function ($scope, $mdDialog) {
	var vm = this

	vm.configurationFile = null
	vm.mappingFile = null

	vm.configurationFileIsAvailable = function () {
		return vm.configurationFile !== null && vm.configurationFile !== undefined
	}

	vm.mappingFileIsAvailable = function () {
		return vm.mappingFile !== null && vm.mappingFile !== undefined
	}

	vm.checkExtension = function (file, extension, $event) {


		if (file) {
			var ext = file.name.split('.')[1]




			if (ext !== extension) {
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

	vm.openImportConfigurationManager = function ($event) {
		var reader = new FileReader()

		reader.readAsText(vm.configurationFile)

		reader.onload = function (evt) {
			try {
				var file = JSON.parse(evt.target.result)

				$mdDialog
					.show({
						controller: 'ConfigurationImportDialogController as vm',
						templateUrl:
							'views/dialogs/configuration-import/configuration-import-dialog-view.html',
						//controller: 'SettingGeneralConfigurationPreviewFileDialogController as vm',
						//templateUrl: 'views/dialogs/settings-general-configuration-preview-file-dialog-view.html',
						parent: angular.element(document.body),
						targetEvent: $event,
						preserveScope: true,
						autoWrap: true,
						skipHide: true,
						locals: {
							data: {
								file: file,
								rawFile: vm.configurationFile,
							},
						},
					})
					.then(function (res) {
						vm.configurationFile = null
					})
					.catch(function (reason) {
						vm.configurationFile = null
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

				vm.configurationFile = null
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

	vm.openExportConfigurationManager = function ($event) {
		$mdDialog.show({
			controller: 'SettingGeneralConfigurationExportFileDialogController as vm',
			templateUrl:
				'views/dialogs/settings-general-configuration-export-file-dialog-view.html',
			parent: angular.element(document.body),
			targetEvent: $event,
			preserveScope: true,
			autoWrap: true,
			skipHide: true,
		})
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
}
