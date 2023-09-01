/**
 * Created by szhitenev on 05.05.2016.
 */

import transactionTypeService from '../services/transactionTypeService'

export default function (
	$scope,
	$stateParams,
	$state,
	$mdDialog,
	toastNotificationService,
	metaContentTypesService,
	uiService
) {
	var vm = this

	vm.readyStatus = {
		transactionTypes: false,
		layouts: false,
		data: false,
	}

	vm.layout = {
		name: '',
		type: 'report_context_menu',
		data: {
			menu: {
				root: {
					items: [],
				},
			},
		},
	}

	vm.defaultMenu = {
		root: {
			items: [
				{
					name: 'Edit Instrument',
					action: 'edit_instrument',
					order: '0',
				},
				{
					name: 'Edit Account',
					action: 'edit_account',
					order: '1',
				},
				{
					name: 'Edit Portfolio',
					action: 'edit_portfolio',
					order: '2',
				},
				{
					name: 'Edit Price',
					action: 'edit_price',
					order: '3',
				},
				{
					name: 'Edit FX Rate',
					action: 'edit_fx_rate',
					order: '4',
				},
				{
					name: 'Edit Pricing FX Rate',
					action: 'edit_pricing_currency_price',
					order: '5',
				},
				{
					name: 'Edit Accrued FX Rate',
					action: 'edit_accrued_currency_fx_rate',
					order: '6',
				},
				{
					name: 'Edit Currency',
					action: 'edit_currency',
					order: '7',
				},
				{
					name: 'Edit Transaction',
					action: 'rebook_transaction',
					order: '8',
				},
				{
					name: 'Open Book Manager',
					action: 'book_transaction',
					order: '9',
				},
			],
		},
	}

	vm.editOption = function ($event, item) {



		$mdDialog
			.show({
				controller: 'ContextMenuOptionSettingsDialogController as vm',
				templateUrl:
					'views/dialogs/context-menu-option-settings-dialog-view.html',
				parent: angular.element(document.body),
				targetEvent: $event,
				preserveScope: true,
				autoWrap: true,
				skipHide: true,
				locals: {
					data: {
						transactionTypes: vm.transactionTypes,
						layoutsGrouped: vm.layoutsGrouped,
						item: Object.assign({}, item),
					},
				},
			})
			.then(function (res) {
				if (res && res.status === 'agree') {
					Object.keys(res.data.item).forEach(function (key) {
						item[key] = res.data.item[key]
					})
				}
			})
	}

	vm.addOption = function ($event, parentOption) {
		$mdDialog
			.show({
				controller: 'ContextMenuOptionSettingsDialogController as vm',
				templateUrl:
					'views/dialogs/context-menu-option-settings-dialog-view.html',
				parent: angular.element(document.body),
				targetEvent: $event,
				preserveScope: true,
				autoWrap: true,
				skipHide: true,
				locals: {
					data: {
						transactionTypes: vm.transactionTypes,
						layoutsGrouped: vm.layoutsGrouped,
						item: {},
					},
				},
			})
			.then(function (res) {
				if (res && res.status === 'agree') {
					if (!parentOption.hasOwnProperty('items')) {
						parentOption.items = []
					}

					res.data.item.order = parentOption.items.length
					parentOption.items.push(res.data.item)
				}
			})
	}

	vm.moveUp = function (itemIndex) {
		var prevItemIndex = itemIndex - 1
		var menuRoot = vm.layout.data.menu.root

		if (prevItemIndex >= 0) {
			var itemToMove = JSON.parse(JSON.stringify(menuRoot.items[itemIndex]))
			itemToMove.order = itemToMove.order - 1

			menuRoot.items[itemIndex] = menuRoot.items[prevItemIndex]
			menuRoot.items[itemIndex].order += 1
			menuRoot.items[prevItemIndex] = itemToMove
		}
	}

	vm.moveDown = function (itemIndex) {
		var nextItemIndex = itemIndex + 1
		var menuRoot = vm.layout.data.menu.root

		if (menuRoot.items[nextItemIndex]) {
			var itemToMove = JSON.parse(JSON.stringify(menuRoot.items[itemIndex]))
			itemToMove.order = itemToMove.order + 1

			menuRoot.items[itemIndex] = menuRoot.items[nextItemIndex]
			menuRoot.items[itemIndex].order -= 1
			menuRoot.items[nextItemIndex] = itemToMove
		}
	}

	vm.deleteOption = function ($event, parentOption, $index) {
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
						description: 'Are you sure you want to delete this option?',
					},
				},
				preserveScope: true,
				autoWrap: true,
				skipHide: true,
				multiple: true,
			})
			.then(function (res) {
				if (res && res.status === 'agree') {
					parentOption.items.splice($index, 1)
					setItemsOrder(parentOption.items, true)
				}
			})
	}

	vm.getTransactionTypes = function () {
		transactionTypeService
			.getListLight({
				pageSize: 1000,
			})
			.then(function (data) {
				vm.transactionTypes = data.results

				vm.readyStatus.transactionTypes = true

				$scope.$apply()
			})
	}

	vm.getLayouts = function () {
		// uiService.getListLayoutDefault({pageSize: 1000}).then(function (data) {
		uiService.getListLayout(null, { pageSize: 1000 }).then(function (data) {
			vm.layouts = data.results

			vm.contentTypes = metaContentTypesService.getListForUi()

			vm.layoutsGrouped = vm.contentTypes.map(function (contentType) {
				contentType.items = []

				vm.layouts.forEach(function (item) {
					if (item.content_type === contentType.key) {
						contentType.items.push(item)
					}
				})

				return contentType
			})



			vm.readyStatus.layouts = true

			$scope.$apply()
		})
	}

	var setItemsOrder = function (itemsList, onlyOneLevel) {
		for (var i = 0; i < itemsList.length; i++) {
			itemsList[i].order = i

			if (!onlyOneLevel) {
				if (itemsList[i].items && itemsList[i].items.length > 0) {
					setItemsOrder(itemsList[i].items)
				}
			}
		}
	}

	vm.getLayout = function () {
		vm.readyStatus.data = false

		uiService.getContextMenuLayoutByKey(vm.layout.id).then(function (data) {
			vm.layout = data

			if (vm.layout && vm.layout.data) {
				// TODO delete later, needed to work with old databases
				setItemsOrder(vm.layout.data.menu.root.items)
			}

			setItemsOrder(vm.layout.data.menu.root.items)

			vm.readyStatus.data = true

			$scope.$apply()
		})
	}

	vm.saveLayout = function ($event) {
		if (vm.layout.id) {
			uiService
				.updateContextMenuLayout(vm.layout.id, vm.layout)
				.then(function (data) {
					vm.layout = data

					/*$mdDialog.show({
                        controller: 'InfoDialogController as vm',
                        templateUrl: 'views/info-dialog-view.html',
                        parent: angular.element(document.body),
                        targetEvent: $event,
                        clickOutsideToClose: false,
                        locals: {
                            info: {
                                title: 'Success',
                                description: "Context Menu Layout is Saved"
                            }
                        }
                    });*/
					toastNotificationService.success('Context Menu Layout is Saved')

					$scope.$apply()
				})
		} else {
			uiService.createContextMenuLayout(vm.layout).then(function (data) {
				vm.layout = data

				$mdDialog.show({
					controller: 'InfoDialogController as vm',
					templateUrl: 'views/info-dialog-view.html',
					parent: angular.element(document.body),
					targetEvent: $event,
					clickOutsideToClose: false,
					locals: {
						info: {
							title: 'Success',
							description: 'Context Menu Layout is Saved',
						},
					},
				})

				$scope.$apply()
			})
		}
	}

	vm.init = function () {
		vm.getTransactionTypes()
		vm.getLayouts()

		if ($stateParams.id && $stateParams.id !== 'new') {
			vm.layout.id = $stateParams.id

			vm.getLayout()
		} else {
			vm.layout.data.menu = vm.defaultMenu

			vm.readyStatus.data = true
		}
	}

	vm.init()
}
