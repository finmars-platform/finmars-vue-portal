/**
 * Created by szhitenev on 08.06.2016.
 */

import entityTypeMappingResolveService from '../../services/entityTypeMappingResolveService'
import entityResolverService from '../../services/entityResolverService'
import instrumentAttributeTypeService from '../../services/instrument/instrumentAttributeTypeService'
import metaHelper from '../../services/metaService'

export default function entityTypeMappingDialogController(
	$scope,
	$mdDialog,
	mapItem
) {
	var vm = this

	vm.readyStatus = { content: false }
	vm.entityItems = []
	vm.entityItemsCount = null
	vm.mapItem = mapItem

	vm.mapEntityType = mapItem.complexExpressionEntity

	var entityWithoutCount =
		[
			'periodicity',
			'accrual-calculation-model',
			'daily-pricing-model',
			'pricing-condition',
			'payment-size-detail',
		].indexOf(vm.mapEntityType) > -1

	var page = 1
	vm.pageSize = 40

	var lastPageReached = false

	var formatEntityForMapping = function () {
		vm.mapEntityType = vm.mapEntityType.replace(/_/g, '-')
	}

	formatEntityForMapping()

	/*if (entityWithoutCount) {
            vm.pageSize = 1000
        }*/

	vm.itemsProvider = {
		// ui scroll parameters
		// index - position of first item in list of scrolled items
		// count - amount of items to scroll before load more
		get: function (index, count, callback) {
			var result = []

			var startItem = index
			var endItem = index + count
			if (startItem < 0 || startItem === 0) {
				startItem = 0
			}

			if (vm.entityItemsCount === vm.entityItems.length) {
				lastPageReached = true
			}

			// if scroll reached last item, load more
			if (index + count >= vm.entityItems.length && !lastPageReached) {
				page = page + 1

				vm.getDataEntity()
					.then(function (value) {
						result = vm.entityItems.slice(startItem, endItem)

						callback(result)
					})
					.catch(function (reason) {
						result = vm.entityItems.slice(startItem, endItem)

						callback(result)
					})
			} else {
				result = vm.entityItems.slice(startItem, endItem)

				callback(result)


			}
		},
	}



	vm.toggleQuery = function () {
		vm.queryStatus = !vm.queryStatus
		vm.query = {}
	}

	vm.bindEntityName = function (item) {
		if (item.hasOwnProperty('user_code')) {
			return item.user_code
		}

		if (item.hasOwnProperty('user_code')) {
			return item.name + ' (' + item.user_code + ')'
		}

		return item.name
	}

	vm.setSort = function (propertyName) {
		vm.direction = vm.sort === propertyName ? !vm.direction : false
		vm.sort = propertyName
	}

	vm.addMapping = function (item, index) {
		item.mapping.splice(index, 0, { value: '' })
	}

	vm.removeMapping = function (item, mappingItem, index) {
		if (mappingItem.hasOwnProperty('id')) {
			mappingItem.isDeleted = true
		} else {
			item.mapping.splice(index, 1)
		}
	}

	var loadEntitiesList = function () {
		var getMethodArgs

		if (entityWithoutCount) {
			return new Promise(function (resolve, reject) {
				entityResolverService
					.getList(vm.mapEntityType, { pageSize: 1000 })
					.then(function (entitesList) {
						resolve(entitesList)
					})
					.catch(function (e) {
						reject(e)
					})
			})
		} else {
			getMethodArgs = [vm.mapEntityType, { page: 1, pageSize: 1000 }]

			return metaHelper.loadDataFromAllPages(
				entityResolverService.getList,
				getMethodArgs
			)
		}
	}

	var mapEntityItems = function (mappingItems) {
		vm.items = mappingItems

		var i, e
		for (e = 0; e < vm.entityItems.length; e = e + 1) {
			for (i = 0; i < vm.items.length; i = i + 1) {
				if (vm.items[i].content_object === vm.entityItems[e].id) {
					if (!vm.entityItems[e].hasOwnProperty('mapping')) {
						vm.entityItems[e].mapping = []
						vm.entityItems[e].mapping.push(vm.items[i])
					} else {
						// check if there is same item in mapping array

						/* var alreadyMapped = false;

                            vm.entityItems[e].mapping.forEach(function (mappingItem) {
                                if (mappingItem.id === vm.items[i].id) {
                                    alreadyMapped = true;
                                }
                            });

                            if (!alreadyMapped) {
                                vm.entityItems[e].mapping.push(vm.items[i]);
                            } */

						var mItemIndex = vm.entityItems[e].mapping.findIndex(function (
							mappingItem
						) {
							return mappingItem.id === vm.items[i].id
						})

						if (mItemIndex < 0) {
							// not mapped yet
							vm.entityItems[e].mapping.push(vm.items[i])
						}
					}
				}
			}
		}

		vm.entityItems.forEach(function (entityItem) {
			if (!entityItem.hasOwnProperty('mapping')) {
				entityItem.mapping = [{ value: '' }]
			}
		})
	}

	vm.getDataEntity = function () {
		/*return new Promise(function (resolve, reject) {

                var options = {
                    page: page,
                    pageSize: vm.pageSize
                };

                entityResolverService.getList(vm.mapEntityType, options).then(function (data, error) {

                    if (entitiesWithoutCount.indexOf(vm.mapEntityType) === -1) {

                        vm.entityItems = vm.entityItems.concat(data.results);

                    } else {

                        vm.entityItems = vm.entityItems.concat(data);
                        lastPageReached = true;

                    }

                    if (data.count) {
                        vm.entityItemsCount = data.count;
                    }

                    // TODO entityTypeMappingResolveService load all mappings in its first use. Prevent repeated invocation of it when using vm.getDataEntity.
                    entityTypeMappingResolveService.getList(vm.mapEntityType).then(function (data) {

                        vm.items = data.results;

                        var i, e;
                        for (e = 0; e < vm.entityItems.length; e = e + 1) {
                            for (i = 0; i < vm.items.length; i = i + 1) {

                                if (vm.items[i].content_object === vm.entityItems[e].id) {

                                    if (!vm.entityItems[e].hasOwnProperty('mapping')) {
                                        vm.entityItems[e].mapping = [];
                                        vm.entityItems[e].mapping.push(vm.items[i])
                                    }
                                    else {
                                        // check if there is same item in mapping array
                                        var alreadyMapped = false;
                                        vm.entityItems[e].mapping.forEach(function (mappingItem) {
                                            if (mappingItem.id === vm.items[i].id) {
                                                alreadyMapped = true;
                                            }
                                        });

                                        if (!alreadyMapped) {
                                            vm.entityItems[e].mapping.push(vm.items[i]);
                                        }
                                    }
                                }
                            }
                        }

                        vm.entityItems.forEach(function (entityItem) {
                            if (!entityItem.hasOwnProperty('mapping')) {
                                entityItem.mapping = [{value: ''}];
                            }
                        });

                        vm.readyStatus.content = true;
                        resolve($scope.$apply());

                    });
                }, function (error) {
                    lastPageReached = true;
                    page = page - 1;
                    reject($scope.$apply());
                });

            });*/
		var promises = []

		promises.push(loadEntitiesList())

		var getAllMappingsArgs = [vm.mapEntityType, { page: 1, pageSize: 1000 }]

		var getAllMappingsProm = metaHelper.loadDataFromAllPages(
			entityTypeMappingResolveService.getList,
			getAllMappingsArgs
		)
		promises.push(getAllMappingsProm)

		Promise.all(promises).then(function (resList) {
			vm.entityItems = resList[0]

			mapEntityItems(resList[1])

			vm.readyStatus.content = true
			$scope.$apply()
		})
	}

	vm.cancel = function () {
		$mdDialog.hide({ status: 'disagree' })
	}

	vm.agree = function () {
		var i = 0

		function updateRow() {


			if (i < vm.entityItems.length) {
				if (!vm.entityItems[i].hasOwnProperty('mapping')) {
					i = i + 1
					updateRow()
					return false
				}

				if (vm.entityItems[i].mapping.length) {
					vm.entityItems[i].mapping.forEach(function (mapItem) {
						if (!mapItem.hasOwnProperty('id')) {
							mapItem.provider = 1 //TODO FIND PROVIDER ID?
							if (vm.mapEntityType == 'classifier') {
								mapItem['attribute_type'] = vm.entityItems[i].classifier

								if (vm.entityItems[i].value_type == 30) {
									mapItem.classifier = vm.entityItems[i].id
								}
								mapItem.content_object = mapItem.attribute_type
							} else {
								//vm.entityItems[i].mapping[vm.mapEntityType] = vm.entityItems[i].id;
								mapItem.content_object = vm.entityItems[i].id
							}

							if (mapItem.value !== '') {
								return entityTypeMappingResolveService
									.create(vm.mapEntityType, mapItem)
									.then(function () {
										i = i + 1
										updateRow()
										return false
									})
							} else {
								i = i + 1
								updateRow()
								return false
							}
						}

						if (mapItem.isDeleted === true) {
							return entityTypeMappingResolveService
								.deleteByKey(vm.mapEntityType, mapItem.id)
								.then(function () {
									i = i + 1
									updateRow()
									return false
								})
						}

						return entityTypeMappingResolveService
							.update(vm.mapEntityType, mapItem.id, mapItem)
							.then(function () {
								i = i + 1
								updateRow()
								return false
							})
					})
				}
			}
		}

		updateRow()

		$mdDialog.hide({ status: 'agree' })
	}

	vm.init = function () {
		vm.getDataEntity()
	}

	vm.init()
}
