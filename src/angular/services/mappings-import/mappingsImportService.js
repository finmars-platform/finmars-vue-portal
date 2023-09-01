/**
 * Created by szhitenev on 12.09.2016.
 */

import entityTypeMappingResolveService from '../entityTypeMappingResolveService'
import entityResolverService from '../entityResolverService'

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
							// vm.counter = vm.counter + 1;

							// $scope.$apply();

							resolve(data)
						})
				} else {
					// vm.counter = vm.counter + 1;

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

					// $scope.$apply();

					resolve(resultItem)
				}
			})
		} else {
			// vm.counter = vm.counter + 1;

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

			// $scope.$apply();

			resolve(item)
		}
	})
}

function mapEntityItems(entityItem, settings, errors) {
	return new Promise(function (resolve, reject) {
		var mappingOptions = {
			pageSize: 1000,
		}

		var entityType = getEntityTypeByMappingContentType(entityItem.entity)

		entityTypeMappingResolveService
			.getList(entityType, mappingOptions)
			.then(function (data) {
				var existingMappings = data.results

				deleteIfOverwrite(entityType, settings.mode, existingMappings).then(
					function (resultMappings) {
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
					}
				)
			})
	})
}

var importMappings = function (items, settings) {
	return new Promise(function (resolve, reject) {
		if (!settings) {
			throw 'Settings is undefined'
		}

		var promises = []
		var errors = []

		items.forEach(function (entityItem) {
			if (entityItem.active) {
				promises.push(mapEntityItems(entityItem, settings, errors))
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

export default {
	importMappings: importMappings,
}
