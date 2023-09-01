import evEvents from '../../services/entityViewerEvents'
import attributeTypeService from '../../services/attributeTypeService'

import metaService from '../../services/metaService'

export default function ($scope, $state, data, $mdDialog) {
	var vm = this

	vm.showHidden = false

	var choices = metaService.getDynamicAttrsValueTypesCaptions()
	vm.attrs = []

	vm.entityType = data.entityType
	//vm.fromEntityType = $stateParams.from;
	//vm.isInstanceId = data.instanceId;
	var attributesWereChanged = false

	/*vm.getList = function () {

            return new Promise(function (resolve, reject) {

                vm.attributeDataService.downloadDynamicAttributesByEntityType(vm.entityType).then(function (data) {
                    vm.attrs = data;
                    $scope.$apply();

                    resolve();

                }).catch(function (error) {
                    reject(error);
                });

            })

        };*/

	vm.getList = function () {
		attributeTypeService
			.getList(vm.entityType, { pageSize: 1000 })
			.then(function (data) {
				vm.attrs = data.results

				$scope.$apply()
			})
	}

	vm.addAttribute = function (ev) {
		$mdDialog
			.show({
				controller: 'AttributesManagerAddDialogController as vm',
				templateUrl: 'views/attribute-manager-dialog-view.html',
				parent: angular.element(document.body),
				targetEvent: ev,
				multiple: true,
				locals: {
					data: {
						entityType: vm.entityType,
					},
				},
			})
			.then(function (res) {
				if (res.status === 'agree') {
					attributesWereChanged = true
					vm.getList()
				}
			})
	}

	vm.bindType = function (item) {
		var i
		for (i = 0; i < choices.length; i = i + 1) {
			if (item['value_type'] === choices[i].value) {
				return choices[i]['caption_name']
			}
		}
	}

	function setName(item) {
		item.name = item.text
		if (item.id.indexOf('j') !== -1) {
			delete item['li_attr']
			delete item['state']
			delete item['icon']
			delete item['a_attr']
			delete item['data']
			delete item['text']
			delete item['type']
			delete item.id
		}
		item.children = item.children.map(setName)
		return item
	}

	vm.editTreeAttr = function (ev, item) {
		$mdDialog
			.show({
				controller: 'ClassificationEditorDialogController as vm',
				templateUrl: 'views/classification-editor-dialog-view.html',
				parent: angular.element(document.body),
				targetEvent: ev,
				multiple: true,
				locals: {
					data: {
						classifier: item,
						entityType: vm.entityType,
					},
				},
			})
			.then(function (res) {
				if (res.status === 'agree') {


					res.data.classifier.classifiers =
						res.data.classifier.children.map(setName)

					attributeTypeService
						.update(vm.entityType, res.data.classifier.id, res.data.classifier)
						.then(function () {
							attributesWereChanged = true
							vm.getList()
						})
				}
			})
	}

	vm.openClassifierMapping = function ($event, item) {

		$mdDialog.show({
			controller: 'EntityTypeClassifierMappingDialogController as vm',
			templateUrl:
				'views/dialogs/entity-type-classifier-mapping-dialog-view.html',
			parent: angular.element(document.body),
			targetEvent: $event,
			preserveScope: true,
			multiple: true,
			locals: {
				options: {
					entityType: vm.entityType,
					id: item.id,
				},
			},
		})
	}

	vm.importClassifiers = function ($event, item) {
		$mdDialog.show({
			controller: 'ClassifierImportDialogController as vm',
			templateUrl: 'views/dialogs/classifier-import-dialog-view.html',
			parent: angular.element(document.body),
			targetEvent: $event,
			preserveScope: true,
			multiple: true,
			locals: {
				data: {
					entityType: vm.entityType,
					item: item,
				},
			},
		})
	}

	vm.exportClassifiers = function ($event, item) {
		$mdDialog.show({
			controller: 'ClassifierExportDialogController as vm',
			templateUrl: 'views/dialogs/classifier-export-dialog-view.html',
			parent: angular.element(document.body),
			targetEvent: $event,
			preserveScope: true,
			multiple: true,
			locals: {
				data: {
					entityType: vm.entityType,
					item: item,
				},
			},
		})
	}

	vm.editAttr = function (ev, item) {
		$mdDialog
			.show({
				controller: 'AttributesManagerEditDialogController as vm',
				templateUrl: 'views/attribute-manager-dialog-view.html',
				parent: angular.element(document.body),
				targetEvent: ev,
				multiple: true,
				locals: {
					data: {
						attributeId: item.id,
						entityType: vm.entityType,
					},
				},
			})
			.then(function (res) {
				if (res.status === 'agree') {
					attributesWereChanged = true
					vm.getList()
				}
			})
	}

	vm.toggleHidden = function () {
		vm.showHidden = !vm.showHidden
	}

	vm.getReturnSref = function () {
		if (vm.entityType.indexOf('strategy-') !== -1) {
			var strategyNumber = vm.entityType.split('-')[1]
			return (
				'app.portal.data.strategy({strategyNumber: ' + strategyNumber + '})'
			)
		} else {
			return 'app.portal.data.' + vm.entityType
		}
	}

	vm.checkIsHidden = function (attribute) {
		if (vm.showHidden == false && attribute.is_hidden == true) {
			return false
		}
		return true
	}

	/*vm.editLayout = function () {
            var entityAddress = {entityType: vm.entityType};
            if (vm.fromEntityType) {

                var entityType = vm.entityType;

                if (vm.fromEntityType === 'transaction-type') {
                    entityType = 'complex-transaction';
                }

                entityAddress = {entityType: entityType, from: vm.fromEntityType, instanceId: vm.isInstanceId};
            }
            $state.go('app.portal.data-constructor', entityAddress);
        };*/

	vm.deleteAttr = function (ev, item) {
		var description = 'Are you sure to delete attribute ' + item.name + ' ?'

		$mdDialog
			.show({
				controller: 'WarningDialogController as vm',
				templateUrl: 'views/dialogs/warning-dialog-view.html',
				parent: angular.element(document.body),
				targetEvent: ev,
				clickOutsideToClose: false,
				locals: {
					warning: {
						title: 'Warning',
						description: description,
					},
				},
				multiple: true,
			})
			.then(function (res) {
				if (res.status === 'agree') {
					attributeTypeService
						.deleteByKey(vm.entityType, item.id)
						.then(function (data) {
							if (data.status === 'conflict') {
								$mdDialog.show({
									controller: 'InfoDialogController as vm',
									templateUrl: 'views/info-dialog-view.html',
									parent: angular.element(document.body),
									targetEvent: ev,
									clickOutsideToClose: false,
									multiple: true,
									locals: {
										info: {
											title: 'Notification',
											description:
												'You can not delete attributed that already in use',
										},
									},
								})
							} else {
								attributesWereChanged = true
								vm.getList()
							}
						})
				}
			})
	}

	vm.recalculateAttributes = function ($event, item) {


		attributeTypeService
			.getRecalculateAttributeCount(vm.entityType, item.id)
			.then(function (data) {
				var description =
					'Are you sure you want to recalculate ' + data.count + ' objects?'

				$mdDialog
					.show({
						controller: 'WarningDialogController as vm',
						templateUrl: 'views/dialogs/warning-dialog-view.html',
						parent: angular.element(document.body),
						targetEvent: $event,
						clickOutsideToClose: false,
						locals: {
							warning: {
								title: 'Warning',
								description: description,
							},
						},
						preserveScope: true,
						multiple: true,
					})
					.then(function (res) {

						if (res.status === 'agree') {
							attributeTypeService
								.recalculateAttributes(vm.entityType, item.id)
								.then(function (value) {
									$mdDialog.show({
										controller: 'InfoDialogController as vm',
										templateUrl: 'views/info-dialog-view.html',
										parent: angular.element(document.body),
										targetEvent: $event,
										clickOutsideToClose: false,
										multiple: true,
										locals: {
											info: {
												title: 'Success',
												description:
													"<p>Recalculation in progress.</p> <p>If you would like to check progress, please go to <a href='/#!/processes' target='_blank'>Active Processes Page</a>.</p>",
											},
										},
									})
								})
						}
					})
			})
	}

	vm.cancel = function () {
		var responseObj = { status: 'disagree' }

		if (attributesWereChanged) {
			responseObj = { status: 'agree', attributeTypes: vm.attrs }
		}

		$mdDialog.hide(responseObj)
	}

	vm.init = function () {
		setTimeout(function () {
			vm.dialogElemToResize = document.querySelector('.manageAttrsElemToResize')
		}, 100)

		vm.getList()
	}

	vm.init()
}
