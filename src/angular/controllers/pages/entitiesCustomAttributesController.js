/**
 * Created by mevstratov on 26.06.2019.
 */

import attributeTypeService from '../../services/attributeTypeService'

import metaService from '../../services/metaService'

export default function ($scope, $mdDialog) {
	var vm = this

	vm.portfolioAttrsCollapsed = false
	vm.accountAttrsCollapsed = false
	vm.instrumentAttrsCollapsed = false
	vm.responsibleAttrsCollapsed = false
	vm.counterpartyAttrsCollapsed = false
	vm.currencyAttrsCollapsed = false
	vm.strategy1AttrsCollapsed = false
	vm.strategy2AttrsCollapsed = false
	vm.strategy3AttrsCollapsed = false
	vm.accountTypeAttrsCollapsed = false
	vm.instrumentTypeAttrsCollapsed = false
	vm.transactionTypeAttrsCollapsed = false

	vm.showHiddenPortfolioAttrs = false
	vm.showHiddenAccountAttrs = false
	vm.showHiddenInstrumentAttrs = false
	vm.showHiddenResponsibleAttrs = false
	vm.showHiddenCounterpartyAttrs = false
	vm.showHiddenCurrencyAttrs = false
	vm.showHiddenStrategy1Attrs = false
	vm.showHiddenStrategy2Attrs = false
	vm.showHiddenStrategy3Attrs = false
	vm.showHiddenAccountTypeAttrs = false
	vm.showHiddenInstrumentTypeAttrs = false
	vm.showHiddenTransactionTypeAttrs = false

	vm.portfolioAttrs = []
	vm.accountAttrs = []
	vm.instrumentAttrs = []
	vm.responsibleAttrs = []
	vm.counterpartyAttrs = []
	vm.currencyAttrs = []
	vm.strategy1Attrs = []
	vm.strategy2Attrs = []
	vm.strategy3Attrs = []
	vm.accountTypeAttrs = []
	vm.instrumentTypeAttrs = []
	vm.transactionTypeAttrs = []

	var choices = metaService.getDynamicAttrsValueTypesCaptions()

	vm.readyStatus = false

	var getEntityAttributes = function (entityType) {
		var variableName = null

		switch (entityType) {
			case 'portfolio':
				variableName = 'portfolioAttrs'
				break
			case 'account':
				variableName = 'accountAttrs'
				break
			case 'instrument':
				variableName = 'instrumentAttrs'
				break
			case 'responsible':
				variableName = 'responsibleAttrs'
				break
			case 'counterparty':
				variableName = 'counterpartyAttrs'
				break
			case 'currency':
				variableName = 'currencyAttrs'
				break
			case 'strategy-1':
				variableName = 'strategy1Attrs'
				break
			case 'strategy-2':
				variableName = 'strategy2Attrs'
				break
			case 'strategy-3':
				variableName = 'strategy3Attrs'
				break
			case 'account-type':
				variableName = 'accountTypeAttrs'
				break
			case 'instrument-type':
				variableName = 'instrumentTypeAttrs'
				break
			case 'transaction-type':
				variableName = 'transactionTypeAttrs'
				break
		}

		var attributes = []
		var options = {
			pageSize: 1000,
			page: 1,
		}

		var getEntityAttributesMethod = function (resolve, reject) {
			attributeTypeService
				.getList(entityType, options)
				.then(function (data) {
					attributes = attributes.concat(data.results)

					if (data.next) {
						options.page = options.page + 1
						getEntityAttributesMethod(resolve, reject)
					} else {
						vm[variableName] = attributes
						resolve(true)
					}
				})
				.catch(function (error) {
					reject(error)
				})
		}

		return new Promise(function (resolve, reject) {
			if (variableName) {
				getEntityAttributesMethod(resolve, reject)
			} else {
				reject('wrong variable name')
			}
		}).catch(function (error) {
			return error
		})
	}

	var getList = function () {
		var promises = []

		promises.push(getEntityAttributes('portfolio'))
		promises.push(getEntityAttributes('account'))
		promises.push(getEntityAttributes('instrument'))
		promises.push(getEntityAttributes('responsible'))
		promises.push(getEntityAttributes('counterparty'))
		promises.push(getEntityAttributes('currency'))
		promises.push(getEntityAttributes('strategy-1'))
		promises.push(getEntityAttributes('strategy-2'))
		promises.push(getEntityAttributes('strategy-3'))
		promises.push(getEntityAttributes('account-type'))
		promises.push(getEntityAttributes('instrument-type'))
		promises.push(getEntityAttributes('transaction-type'))

		Promise.all(promises).then(function () {
			vm.readyStatus = true
			$scope.$apply()
			setAttributeManagerContainersHeight()
		})
	}

	var setAttributeManagerContainersHeight = function () {
		// for collapse animation

		var resizableCBWrapsList = document.querySelectorAll('.cb1-resizing-wrap')

		for (var i = 0; i < resizableCBWrapsList.length; i++) {
			var amWrap = resizableCBWrapsList[i]
			var amContainer = amWrap.querySelector('.all-am-manager-container')

			var amContainerHeight = amContainer.clientHeight + 'px'
			amWrap.style.height = amContainerHeight
		}
	}

	vm.addAttribute = function (entityType, ev) {
		$mdDialog
			.show({
				controller: 'AttributesManagerAddDialogController as vm',
				templateUrl: 'views/attribute-manager-dialog-view.html',
				parent: angular.element(document.body),
				targetEvent: ev,
				locals: {
					data: {
						entityType: entityType,
					},
				},
			})
			.then(function (res) {
				if (res.status === 'agree') {
					/*attributeTypeService.create(entityType, res.data.attribute).then(function () {

                        getEntityAttributes(entityType).then(function () {
                            $scope.$apply();
                            setAttributeManagerContainersHeight();
                        });

                    });*/
					getEntityAttributes(entityType).then(function () {
						$scope.$apply()
						setAttributeManagerContainersHeight()
					})
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

	vm.editTreeAttr = function (item, entityType, ev) {
		$mdDialog
			.show({
				controller: 'ClassificationEditorDialogController as vm',
				templateUrl: 'views/classification-editor-dialog-view.html',
				parent: angular.element(document.body),
				targetEvent: ev,
				locals: {
					data: {
						classifier: item,
						entityType: entityType,
					},
				},
			})
			.then(function (res) {
				if (res.status === 'agree') {
					res.data.classifier.classifiers =
						res.data.classifier.children.map(setName)

					attributeTypeService
						.update(entityType, res.data.classifier.id, res.data.classifier)
						.then(getList)
				}
			})
	}

	vm.openClassifierMapping = function (item, entityType, $event) {
		$mdDialog.show({
			controller: 'EntityTypeClassifierMappingDialogController as vm',
			templateUrl:
				'views/dialogs/entity-type-classifier-mapping-dialog-view.html',
			parent: angular.element(document.body),
			targetEvent: $event,
			preserveScope: true,
			autoWrap: true,
			skipHide: true,
			locals: {
				options: {
					entityType: entityType,
					id: item.id,
				},
			},
		})
	}

	vm.importClassifiers = function (item, entityType, $event) {
		$mdDialog.show({
			controller: 'ClassifierImportDialogController as vm',
			templateUrl: 'views/dialogs/classifier-import-dialog-view.html',
			parent: angular.element(document.body),
			targetEvent: $event,
			preserveScope: true,
			autoWrap: true,
			skipHide: true,
			locals: {
				data: {
					entityType: entityType,
					item: item,
				},
			},
		})
	}

	vm.exportClassifiers = function (item, entityType, $event) {
		$mdDialog.show({
			controller: 'ClassifierExportDialogController as vm',
			templateUrl: 'views/dialogs/classifier-export-dialog-view.html',
			parent: angular.element(document.body),
			targetEvent: $event,
			preserveScope: true,
			autoWrap: true,
			skipHide: true,
			locals: {
				data: {
					entityType: entityType,
					item: item,
				},
			},
		})
	}

	vm.editAttr = function (item, entityType, ev) {
		$mdDialog
			.show({
				controller: 'AttributesManagerEditDialogController as vm',
				templateUrl: 'views/attribute-manager-dialog-view.html',
				parent: angular.element(document.body),
				targetEvent: ev,
				locals: {
					data: {
						attributeId: item.id,
						entityType: entityType,
					},
				},
			})
			.then(function (res) {
				if (res.status === 'agree') {
					getEntityAttributes(entityType).then(function () {
						$scope.$apply()
					})
				}
			})
	}

	vm.deleteAttr = function (item, entityType, ev) {
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
				preserveScope: true,
				autoWrap: true,
				skipHide: true,
				multiple: true,
			})
			.then(function (res) {
				if (res.status === 'agree') {
					attributeTypeService
						.deleteByKey(entityType, item.id)
						.then(function (data) {
							if (data.status === 'conflict') {
								$mdDialog.show({
									controller: 'InfoDialogController as vm',
									templateUrl: 'views/info-dialog-view.html',
									parent: angular.element(document.body),
									targetEvent: ev,
									clickOutsideToClose: false,
									locals: {
										info: {
											title: 'Notification',
											description:
												'You can not delete attributed that already in use',
										},
									},
								})
							} else {
								getEntityAttributes(entityType).then(function () {
									$scope.$apply()
									setAttributeManagerContainersHeight()
								})
							}
						})
				}
			})
	}

	vm.toggleHidden = function (attributesEntity) {
		vm[attributesEntity] = !vm[attributesEntity]
		setTimeout(function () {
			setAttributeManagerContainersHeight()
		}, 100)
	}

	vm.checkIsHidden = function (attribute, attributesEntity) {
		if (vm[attributesEntity] == false && attribute.is_hidden == true) {
			return false
		}
		return true
	}

	var init = function () {
		getList()
	}

	init()
}
