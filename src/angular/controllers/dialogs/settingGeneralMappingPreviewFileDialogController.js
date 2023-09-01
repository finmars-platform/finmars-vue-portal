/**
 * Created by szhitenev on 30.05.2016.
 */

import entityTypeMappingResolveService from '../../services/entityTypeMappingResolveService'
import entityResolverService from '../../services/entityResolverService'

export default function ($scope, $mdDialog, metaContentTypesService, file) {


	var vm = this

	vm.items = []

	vm.processing = false
	vm.counter = 0
	vm.activeItemTotal = 0

	vm.settings = {}

	vm.toggleMode = function (mode) {
		if (vm.settings.mode === mode) {
			vm.settings.mode = null
		} else {
			vm.settings.mode = mode
		}
	}

	vm.items.forEach(function (item) {
		item.active = false

		item.content.forEach(function (child) {
			child.active = false
		})
	})

	vm.getEntityName = function (item) {
		return metaContentTypesService.getEntityNameByContentType(item.entity)
	}

	vm.getItemName = function (item) {
		if (item.hasOwnProperty('user_code')) {
			return item.user_code
		}

		if (item.hasOwnProperty('name')) {
			if (item.hasOwnProperty('csv_fields')) {
				return (
					item.name +
					' (' +
					metaContentTypesService.getEntityNameByContentType(
						item.content_type
					) +
					')'
				)
			}

			return item.name
		}

		if (item.hasOwnProperty('content_type')) {
			return metaContentTypesService.getEntityNameByContentType(
				item.content_type
			)
		}

		if (item.hasOwnProperty('user_code')) {
			return item.user_code
		}

		if (item.hasOwnProperty('last_run_at')) {
			// import.pricingautomatedschedule
			return 'Schedule'
		}
	}

	vm.toggleSelectAll = function () {
		vm.selectAllState = !vm.selectAllState

		vm.items.forEach(function (item) {
			item.someChildsActive = false
			item.active = vm.selectAllState

			item.content.forEach(function (child) {
				child.active = vm.selectAllState
			})
		})
	}

	vm.checkSelectAll = function () {
		var active = true

		vm.items.forEach(function (item) {
			if (!item.active) {
				active = false
			}

			item.content.forEach(function (child) {
				if (!child.active) {
					active = false
				}
			})
		})

		vm.selectAllState = active
	}

	vm.toggleActiveForChilds = function (item) {
		item.active = !item.active
		item.someChildsActive = false
		item.content.forEach(function (child) {
			child.active = item.active
		})

		vm.checkSelectAll()
	}

	vm.updateActiveForParent = function (child, parent) {
		child.active = !child.active

		var ChildIsActive = false
		var ChildIsNotActive = false
		var parentIsActive = false

		parent.content.forEach(function (item) {
			if (item.active) {
				ChildIsActive = true
			} else {
				ChildIsNotActive = true
			}

			if (ChildIsActive && !ChildIsNotActive) {
				parentIsActive = true
			} else if (!ChildIsActive && ChildIsNotActive) {
				parent.someChildsActive = false
			} else {
				parentIsActive = false
				parent.someChildsActive = true
			}
		})

		parent.active = parentIsActive

		vm.checkSelectAll()
	}

	function getEntityTypeByMappingContentType(contentType) {
		if (contentType === 'integrations.portfoliomapping') {
			return 'portfolio'
		}

		if (contentType === 'integrations.currencymapping') {
			return 'currency'
		}

		if (contentType === 'integrations.instrumenttypemapping') {
			return 'instrument-type'
		}

		if (contentType === 'integrations.accountmapping') {
			return 'account'
		}

		if (contentType === 'integrations.accounttypemapping') {
			return 'account-type'
		}

		if (contentType === 'integrations.instrumentmapping') {
			return 'instrument'
		}

		if (contentType === 'integrations.counterpartymapping') {
			return 'counterparty'
		}

		if (contentType === 'integrations.responsiblemapping') {
			return 'responsible'
		}

		if (contentType === 'integrations.strategy1mapping') {
			return 'strategy-1'
		}

		if (contentType === 'integrations.strategy2mapping') {
			return 'strategy-2'
		}

		if (contentType === 'integrations.strategy3mapping') {
			return 'strategy-3'
		}

		if (contentType === 'integrations.pricingpolicymapping') {
			return 'pricing-policy'
		}

		if (contentType === 'integrations.periodicitymapping') {
			return 'periodicity'
		}

		if (contentType === 'integrations.dailypricingmodelmapping') {
			return 'daily-pricing-model'
		}

		if (contentType === 'integrations.paymentsizedetailmapping') {
			return 'payment-size-detail'
		}

		if (contentType === 'integrations.accrualcalculationmodelmapping') {
			return 'accrual-calculation-model'
		}

		if (contentType === 'integrations.pricedownloadschememapping') {
			return 'price-download-scheme'
		}
	}

	function mapContentObj(entity, item) {
		return new Promise(function (resolve, reject) {
			var options = {}

			if (item.___user_code) {
				options.filters = {
					user_code: item.___user_code,
				}
			}

			if (item.___user_code) {
				options.filters = {
					user_code: item.___user_code,
				}
			}

			if (item.___user_code) {
				options.filters = {
					user_code: item.___user_code,
				}
			}

			entityResolverService.getList(entity, options).then(function (data) {
				if (item.___user_code) {
					if (data.results.length) {
						data.results.forEach(function (dataItem) {
							item.content_object = dataItem.id
						})
					} else {
						console.warn('User code ' + item.___user_code + ' is not exist')
					}
				}

				if (item.___user_code) {
					if (data.results.length) {
						item.content_object = data.results[0].id
					} else {
						console.warn('Scheme name ' + item.___user_code + ' is not exist')
					}
				}

				if (item.___user_code) {
					data.forEach(function (dataItem) {
						if (item.___user_code === dataItem.user_code) {
							item.content_object = dataItem.id
						}
					})
				}



				resolve(item)
			})
		})
	}

	function deleteIfOverwrite(entityType, mode, mappings) {
		return new Promise(function (resolve, reject) {
			if (mode === 'overwrite') {
				var promises = []

				mappings.forEach(function (item) {
					promises.push(
						entityTypeMappingResolveService.deleteByKey(entityType, item.id)
					)
				})

				Promise.all(promises).then(function (value) {
					resolve([])
				})
			} else {
				resolve(mappings)
			}
		})
	}

	function mapItem(item, existingMappings, entityType, errors) {
		return new Promise(function (resolve, reject) {
			var exists = false
			var existingItem

			existingMappings.forEach(function (existingMappingItem) {
				if (existingMappingItem.value === item.value) {
					exists = true
					existingItem = existingMappingItem
				}
			})

			if (exists === false) {
				mapContentObj(entityType, item).then(function (resultItem) {
					// ;

					if (resultItem.content_object) {
						entityTypeMappingResolveService
							.create(entityType, resultItem)
							.then(function (data) {
								vm.counter = vm.counter + 1

								$scope.$apply()

								resolve(data)
							})
					} else {
						vm.counter = vm.counter + 1

						var code = ''

						if (resultItem.___user_code) {
							code = resultItem.___user_code
						}

						if (resultItem.___user_code) {
							code = resultItem.___user_code
						}

						errors.push({
							item: {
								name: code,
							},
							error: {
								message:
									'Content object for code ' +
									code +
									'does not exist (Mapping: ' +
									item.value +
									')',
							},
						})

						$scope.$apply()

						resolve(resultItem)
					}
				})
			} else {
				vm.counter = vm.counter + 1

				var code = ''

				if (item.___user_code) {
					code = item.___user_code
				}

				if (item.___user_code) {
					code = item.___user_code
				}

				errors.push({
					item: {
						name: code,
					},
					error: {
						message:
							'Mapping: ' +
							item.value +
							' for Content Object with user_code ' +
							code +
							' already exists',
					},
				})

				$scope.$apply()

				resolve(item)
			}
		})
	}

	function mapEntityItems(entityItem, errors) {
		return new Promise(function (resolve, reject) {
			var mappingOptions = {
				pageSize: 1000,
			}

			var entityType = getEntityTypeByMappingContentType(entityItem.entity)

			// ;
			// ;

			entityTypeMappingResolveService
				.getList(entityType, mappingOptions)
				.then(function (data) {
					var existingMappings = data.results

					deleteIfOverwrite(
						entityType,
						vm.settings.mode,
						existingMappings
					).then(function (resultMappings) {
						existingMappings = resultMappings

						// ;

						var promises = []

						entityItem.content.forEach(function (item) {
							if (item.active) {
								promises.push(
									mapItem(item, existingMappings, entityType, errors)
								)
							}
						})

						Promise.all(promises).then(function (data) {
							// ;

							resolve(data)
						})
					})
				})
		})
	}

	function importConfiguration(entities, errors) {
		return new Promise(function (resolve, reject) {
			var promises = []
			var errors = []

			entities.forEach(function (entityItem) {
				if (entityItem.active) {
					promises.push(mapEntityItems(entityItem, errors))
				}
			})

			Promise.all(promises).then(function (data) {


				resolve({
					data: data,
					errors: errors,
				})
			})
		})
	}

	vm.calcTotalActiveItems = function () {
		vm.activeItemTotal = 0

		vm.items.forEach(function (entityItem) {
			if (entityItem.active) {
				entityItem.content.forEach(function (item) {
					if (item.active) {
						vm.activeItemTotal = vm.activeItemTotal + 1
					}
				})
			}
		})
	}

	vm.agree = function ($event) {
		vm.processing = true

		vm.calcTotalActiveItems()

		importConfiguration(vm.items).then(function (data) {
			vm.processing = false

			$mdDialog.hide({ status: 'agree', data: {} })

			if (data.errors.length) {
				$mdDialog.show({
					controller:
						'SettingGeneralMappingPreviewFileErrorsDialogController as vm',
					templateUrl:
						'views/dialogs/settings-general-mapping-preview-file-errors-dialog-view.html',
					targetEvent: $event,
					preserveScope: true,
					multiple: true,
					autoWrap: true,
					skipHide: true,
					locals: {
						data: {
							errors: data.errors.map(function (errorItem) {
								return {
									item: errorItem.item,
									error: errorItem.error.message,
								}
							}),
						},
					},
				})
			} else {
				$mdDialog.show({
					controller: 'SuccessDialogController as vm',
					templateUrl: 'views/dialogs/success-dialog-view.html',
					targetEvent: $event,
					preserveScope: true,
					multiple: true,
					autoWrap: true,
					skipHide: true,
					locals: {
						success: {
							title: 'Success',
							description: 'You have successfully imported mapping file',
						},
					},
				})
			}
		})
	}

	vm.cancel = function () {
		$mdDialog.hide({ status: 'disagree' })
	}

	vm.init = function () {
		var sections = file.body

		sections.forEach(function (item) {
			if (item.section_name === 'mappings') {
				vm.items = item.items
			}
		})
	}

	vm.init()
}
