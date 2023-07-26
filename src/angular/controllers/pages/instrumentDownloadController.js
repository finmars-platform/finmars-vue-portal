/**
 * Created by mevstratov on 24.06.2019.
 */

import instrumentDownloadSchemeService from '../../services/import/instrumentDownloadSchemeService'
import currencyService from '../../services/currencyService'

import instrumentTypeService from '../../services/instrumentTypeService'
import instrumentDailyPricingModelService from '../../services/instrument/instrumentDailyPricingModelService'
import importPriceDownloadSchemeService from '../../services/import/importPriceDownloadSchemeService'

import importInstrumentService from '../../services/import/importInstrumentService'
import instrumentPaymentSizeDetailService from '../../services/instrument/instrumentPaymentSizeDetailService'
import instrumentAttributeTypeService from '../../services/instrument/instrumentAttributeTypeService'

export default function instrumentDownloadController(
	$scope,
	$mdDialog,
	instrumentService
) {
	var vm = this

	vm.readyStatus = {
		schemes: false,
		processing: false,
		dailyModel: false,
		priceDownloadScheme: false,
		instrumentType: false,
		currency: false,
	}
	vm.dataIsImported = false

	vm.config = {
		instrument_code: '',
		mode: 1,
	}

	vm.loadIsAvailable = function () {
		if (
			vm.readyStatus.processing == false &&
			vm.providerId != null &&
			vm.config.instrument_download_scheme != null &&
			vm.config.instrument_code != null
		) {
			return true
		}
		return false
	}

	vm.dailyModels = []
	vm.priceDownloadSchemes = []
	vm.instrumentTypes = []
	vm.currencies = []

	vm.dynAttributes = {}

	vm.providerId = 1 //TODO HARD REFACTOR CODE BLOOMBERG PROVIDER

	vm.appendString = function (string) {
		var code = vm.config.instrument_code.split(' ')[0]
		vm.config.instrument_code = code + ' ' + string
	}

	vm.resolveAttributeNode = function (item) {
		// ;

		//return item.name;

		var result = ''
		if (
			item.hasOwnProperty('classifier_object') &&
			item.classifier_object !== null
		) {
			return item.classifier_object.name
		}
		vm.dynAttributes['id_' + item.attribute_type].classifiers.forEach(function (
			classifier
		) {
			if (classifier.id == item.classifier) {
				result = classifier.name
			}
		})
		return result
	}

	vm.findError = function (item, type, state) {
		var message = ''
		var haveError = false

		if (type == 'entityAttr') {
			if (vm.config.errors && vm.config.errors.hasOwnProperty(item)) {
				message = vm.config.errors[item].join(' ')
				haveError = true
			}
		}

		if (type == 'dynAttr') {
			//;
			if (
				vm.config.errors &&
				vm.config.errors.hasOwnProperty('attribute_type_' + item.attribute_type)
			) {
				message =
					vm.config.errors['attribute_type_' + item.attribute_type].join(' ')
				haveError = true
			}
		}

		if (state == 'message') {
			return message
		} else {
			return haveError
		}
	}

	vm.openMapping = function ($event, item) {


		$mdDialog.show({
			controller: 'EntityTypeMappingDialogController as vm',
			templateUrl: 'views/dialogs/entity-type-mapping-dialog-view.html',
			parent: angular.element(document.body),
			targetEvent: $event,
			preserveScope: true,
			multiple: true,
			autoWrap: true,
			skipHide: true,
			locals: {
				mapItem: item,
			},
		})
	}

	vm.load = function ($event) {
		vm.readyStatus.processing = true
		//vm.config.task = 81;
		importInstrumentService
			.startImport(vm.config)
			.then(function (data) {
				vm.config = data

				if (
					vm.config.task_object.status === 'D' &&
					vm.config.instrument !== null
				) {
					vm.readyStatus.processing = false
					vm.dataIsImported = true

					vm.mappedFields = []

					var keysDict = []

					if (Object.keys(vm.config['task_result_overrides']).length > 0) {
						keysDict = vm.config['task_result_overrides']
					} else {
						keysDict = vm.config['task_result']
					}

					var keys = Object.keys(keysDict)
					var i
					for (i = 0; i < keys.length; i = i + 1) {
						vm.mappedFields.push({
							key: keys[i],
							value: keysDict[keys[i]],
						})
					}

					var promises = []

					vm.config.instrument.attributes.forEach(function (attribute) {
						if (attribute.attribute_type_object.value_type == 30) {
							promises.push(
								instrumentAttributeTypeService.getByKey(
									attribute.attribute_type
								)
							)
						}
					})



					Promise.all(promises).then(function (data) {
						data.forEach(function (item) {
							vm.dynAttributes['id_' + item.id] = item
						})

						$scope.$apply()
					})
				} else {
					setTimeout(function () {
						vm.load()
					}, 1000)
				}
			})
			.catch(function (reason) {
				$mdDialog.show({
					controller: 'ValidationDialogController as vm',
					templateUrl: 'views/dialogs/validation-dialog-view.html',
					targetEvent: $event,
					locals: {
						validationData: 'An error occurred. Please try again later',
					},
					multiple: true,
					preserveScope: true,
					autoWrap: true,
					skipHide: true,
				})
			})
	}

	vm.recalculate = function () {
		vm.mappedFields.forEach(function (item) {
			vm.config.task_result_overrides[item.key] = item.value
		})
		vm.load()
	}

	vm.openSchemeManager = function ($event) {
		$mdDialog
			.show({
				controller: 'InstrumentDownloadSchemeEditDialogController as vm',
				templateUrl:
					'views/dialogs/instrument-download/instrument-download-scheme-dialog-view.html',
				targetEvent: $event,
				multiple: true,
				preserveScope: true,
				autoWrap: true,
				skipHide: true,
				locals: {
					schemeId: vm.config.instrument_download_scheme,
				},
			})
			.then(function (res) {
				if (res && res.status === 'agree') {

					instrumentDownloadSchemeService
						.update(vm.config.instrument_download_scheme, res.data)
						.then(function () {
							//vm.getList();
							$scope.$apply()
						})
				}
			})
	}

	vm.agree = function ($event) {
		if (vm.config.instrument.id) {
			instrumentService
				.update(vm.config.instrument.id, vm.config.instrument)
				.then(function (data) {
					$mdDialog
						.show({
							controller: 'SuccessDialogController as vm',
							templateUrl: 'views/dialogs/success-dialog-view.html',
							targetEvent: $event,
							locals: {
								success: {
									title: '',
									description:
										'You have successfully update instrument ' +
										vm.config.instrument.user_code +
										' (user code).',
								},
							},
							multiple: true,
							preserveScope: true,
							autoWrap: true,
							skipHide: true,
						})
						.then(function () {
							$mdDialog.hide({ res: 'agree' })
						})
				})
				.catch(function (reason) {
					$mdDialog.show({
						controller: 'ValidationDialogController as vm',
						templateUrl: 'views/dialogs/validation-dialog-view.html',
						targetEvent: $event,
						locals: {
							validationData: reason.message,
						},
						multiple: true,
						preserveScope: true,
						autoWrap: true,
						skipHide: true,
					})
				})
		} else {
			instrumentService
				.create(vm.config.instrument)
				.then(function (data) {
					$mdDialog
						.show({
							controller: 'SuccessDialogController as vm',
							templateUrl: 'views/dialogs/success-dialog-view.html',
							targetEvent: $event,
							locals: {
								success: {
									title: '',
									description:
										'You have successfully add instrument ' +
										vm.config.instrument.user_code +
										' (user code).',
								},
							},
							multiple: true,
							preserveScope: true,
							autoWrap: true,
							skipHide: true,
						})
						.then(function () {
							$mdDialog.hide({ res: 'agree' })
						})
				})
				.catch(function (reason) {
					$mdDialog.show({
						controller: 'ValidationDialogController as vm',
						templateUrl: 'views/dialogs/validation-dialog-view.html',
						targetEvent: $event,
						locals: {
							validationData: reason.message,
						},
						multiple: true,
						preserveScope: true,
						autoWrap: true,
						skipHide: true,
					})
				})
		}
	}

	vm.init = function () {
		instrumentDownloadSchemeService
			.getListLight(vm.providerId)
			.then(function (data) {
				vm.instrumentSchemes = data.results
				vm.readyStatus.schemes = true
				$scope.$apply()
			})

		instrumentDailyPricingModelService.getList().then(function (data) {
			vm.dailyModels = data
			vm.readyStatus.dailyModel = true
			$scope.$apply()
		})

		importPriceDownloadSchemeService.getList().then(function (data) {
			vm.priceDownloadSchemes = data.results
			vm.readyStatus.priceDownloadScheme = true
			$scope.$apply()
		})

		instrumentPaymentSizeDetailService.getList().then(function (data) {
			vm.paymentSizeDefaults = data
			$scope.$apply()
		})

		instrumentTypeService.getList().then(function (data) {
			vm.instrumentTypes = data.results
			vm.readyStatus.instrumentType = true
			$scope.$apply()
		})

		currencyService.getList().then(function (data) {
			vm.currencies = data.results
			vm.readyStatus.currency = true
			$scope.$apply()
		})
	}

	vm.init()
}
