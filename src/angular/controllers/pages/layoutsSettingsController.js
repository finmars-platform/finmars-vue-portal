/**
 * Created by mevstratov on 25.06.2019.
 */

import uiService from '../../services/uiService'

import toastNotificationService from '@/angular/core/services/toastNotificationService'

export default function ($scope, $mdDialog, $state) {
	var vm = this

	vm.portfolioLayoutsCollapsed = false
	vm.accountLayoutsCollapsed = false
	vm.instrumentLayoutsCollapsed = false
	vm.responsibleLayoutsCollapsed = false
	vm.counterpartyLayoutsCollapsed = false
	vm.currencyLayoutsCollapsed = false
	vm.strategy1LayoutsCollapsed = false
	vm.strategy2LayoutsCollapsed = false
	vm.strategy3LayoutsCollapsed = false
	vm.accountTypeLayoutsCollapsed = false
	vm.instrumentTypeLayoutsCollapsed = false
	vm.transactionTypeLayoutsCollapsed = false

	vm.portfolioLayouts = []
	vm.accountLayouts = []
	vm.instrumentLayouts = []
	vm.responsibleLayouts = []
	vm.counterpartyLayouts = []
	vm.currencyLayouts = []
	vm.strategy1Layouts = []
	vm.strategy2Layouts = []
	vm.strategy3Layouts = []
	vm.accountTypeLayouts = []
	vm.instrumentTypeLayouts = []
	vm.transactionTypeLayouts = []

	vm.readyStatus = false

	/*vm.entities = [
            {
                name: 'Portfolio',
                entityType: 'portfolio'
            },
            {
                name: 'Accounts',
                entityType: 'account'
            },
            {
                name: 'Instruments',
                entityType: 'instrument'
            },
            {
                name: 'Responsible',
                entityType: 'responsible'
            },
            {
                name: 'Counterparties',
                entityType: 'counterparty'
            },
            {
                name: 'Currencies',
                entityType: 'currency'
            },
            {
                name: 'Strategy 1',
                entityType: 'strategy-1'
            },
            {
                name: 'Strategy 2',
                entityType: 'strategy-2'
            },
            {
                name: 'Strategy 3',
                entityType: 'strategy-3'
            },
            {
                name: 'Instrument Types',
                entityType: 'instrument-type'
            },
            {
                name: 'Account Type',
                entityType: 'account-type'
            },
            {
                name: 'Transaction Types',
                entityType: 'transaction-type'
            }
        ];*/

	/*vm.openLayoutsList = function ($event, entityType) {

            $mdDialog.show({
                controller: 'LayoutsListDialogController as vm',
                templateUrl: 'views/dialogs/layouts-list-dialog-view.html',
                parent: angular.element(document.body),
                targetEvent: $event,
                locals: {
                    data: {
                        entityType: entityType
                    }
                }
            });
        }*/
	var getLayoutDataByContentType = function (contentType, typeOfData) {
		var layoutsArrayPropertyName = null
		var layoutsEntityType = null
		var layoutState = null

		switch (contentType) {
			case 'portfolios.portfolio':
				layoutsArrayPropertyName = 'portfolioLayouts'
				layoutsEntityType = 'portfolio'
				layoutState = 'app.portal.data.portfolio'
				break
			case 'accounts.account':
				layoutsArrayPropertyName = 'accountLayouts'
				layoutsEntityType = 'account'
				layoutState = 'app.portal.data.account'
				break
			case 'instruments.instrument':
				layoutsArrayPropertyName = 'instrumentLayouts'
				layoutsEntityType = 'instrument'
				layoutState = 'app.portal.data.instrument'
				break
			case 'counterparties.responsible':
				layoutsArrayPropertyName = 'responsibleLayouts'
				layoutsEntityType = 'responsible'
				layoutState = 'app.portal.data.responsible'
				break
			case 'counterparties.counterparty':
				layoutsArrayPropertyName = 'counterpartyLayouts'
				layoutsEntityType = 'counterparty'
				layoutState = 'app.portal.data.counterparty'
				break
			case 'currencies.currency':
				layoutsArrayPropertyName = 'currencyLayouts'
				layoutsEntityType = 'currency'
				layoutState = 'app.portal.data.currency'
				break
			case 'strategies.strategy1':
				layoutsArrayPropertyName = 'strategy1Layouts'
				layoutsEntityType = 'strategy-1'
				layoutState = 'app.portal.data.strategy({strategyNumber: 1})'
				break
			case 'strategies.strategy2':
				layoutsArrayPropertyName = 'strategy2Layouts'
				layoutsEntityType = 'strategy-2'
				layoutState = 'app.portal.data.strategy({strategyNumber: 2})'
				break
			case 'strategies.strategy3':
				layoutsArrayPropertyName = 'strategy3Layouts'
				layoutsEntityType = 'strategy-3'
				layoutState = 'app.portal.data.strategy({strategyNumber: 3})'
				break
			case 'accounts.accounttype':
				layoutsArrayPropertyName = 'accountTypeLayouts'
				layoutsEntityType = 'account-type'
				layoutState = 'app.portal.data.account-type'
				break
			case 'instruments.instrumenttype':
				layoutsArrayPropertyName = 'instrumentTypeLayouts'
				layoutsEntityType = 'instrument-type'
				layoutState = 'app.portal.data.instrument-type'
				break
			case 'transactions.transactiontype':
				layoutsArrayPropertyName = 'transactionTypeLayouts'
				layoutsEntityType = 'transaction-type'
				layoutState = 'app.portal.data.transaction-type'
				break
		}

		switch (typeOfData) {
			case 'propertyName':
				return layoutsArrayPropertyName
				break
			case 'entityType':
				return layoutsEntityType
				break
			case 'state':
				return layoutState
				break
		}
	}

	var getLayoutsByEntity = function (contentType) {
		var layoutsPropertyName = getLayoutDataByContentType(
			contentType,
			'propertyName'
		)
		var entityType = getLayoutDataByContentType(contentType, 'entityType')

		var layouts = []
		var options = {
			pageSize: 1000,
			page: 1,
		}

		var getLayoutsByEntityMethod = function (resolve, reject) {
			uiService
				.getListLayout(entityType, options)
				.then(function (data) {
					layouts = layouts.concat(data.results)

					if (data.next) {
						options.page = options.page + 1
						getLayoutsByEntityMethod(resolve, reject)
					} else {
						vm[layoutsPropertyName] = layouts
						resolve(true)
					}
				})
				.catch(function (error) {
					reject(error)
				})
		}

		return new Promise(function (resolve, reject) {
			if (layoutsPropertyName) {
				getLayoutsByEntityMethod(resolve, reject)
			} else {
				reject('wrong variable name')
			}
		})
	}

	var getList = function () {
		var layouts = []
		var options = {
			pageSize: 1000,
			page: 1,
		}

		var getLayoutsMethod = function () {
			uiService.getListLayout('all', options).then(function (data) {
				layouts = layouts.concat(data.results)

				if (data.next) {
					options.page = options.page + 1
					getLayoutsMethod()
				} else {
					layouts.map(function (layout) {
						switch (layout.content_type) {
							case 'portfolios.portfolio':
								vm.portfolioLayouts.push(layout)
								break
							case 'accounts.account':
								vm.accountLayouts.push(layout)
								break
							case 'instruments.instrument':
								vm.instrumentLayouts.push(layout)
								break
							case 'counterparties.responsible':
								vm.responsibleLayouts.push(layout)
								break
							case 'counterparties.counterparty':
								vm.counterpartyLayouts.push(layout)
								break
							case 'currencies.currency':
								vm.currencyLayouts.push(layout)
								break
							case 'strategies.strategy1':
								vm.strategy1Layouts.push(layout)
								break
							case 'strategies.strategy2':
								vm.strategy2Layouts.push(layout)
								break
							case 'strategies.strategy3':
								vm.strategy3Layouts.push(layout)
								break
							case 'accounts.accounttype':
								vm.accountTypeLayouts.push(layout)
								break
							case 'instruments.instrumenttype':
								vm.instrumentTypeLayouts.push(layout)
								break
							case 'transactions.transactiontype':
								vm.transactionTypeLayouts.push(layout)
								break
						}
					})

					vm.readyStatus = true
					$scope.$apply()
					vm.setAttributeManagerContainersHeight()
				}
			})
		}

		getLayoutsMethod()
	}

	vm.setAttributeManagerContainersHeight = function () {
		// for collapse animation

		var resizableCBWrapsList = document.querySelectorAll('.cb1-resizing-wrap')

		for (var i = 0; i < resizableCBWrapsList.length; i++) {
			var amWrap = resizableCBWrapsList[i]
			var amContainer = amWrap.querySelector('.ALS-layout-group-container')

			var amContainerHeight = amContainer.clientHeight + 'px'
			amWrap.style.height = amContainerHeight
		}
	}

	vm.setAMCHeightOnFilterChange = function () {
		setTimeout(function () {
			vm.setAttributeManagerContainersHeight()
		}, 100)
	}

	vm.renameLayout = function (layout, entityType, $event) {
		$mdDialog
			.show({
				controller: 'UiLayoutSaveAsDialogController as vm',
				templateUrl: 'views/dialogs/ui/ui-layout-save-as-view.html',
				parent: angular.element(document.body),
				targetEvent: $event,
				multiple: true,
				clickOutsideToClose: false,
				locals: {
					options: {
						layoutName: layout.name,
						layoutUserCode: layout.user_code,
					},
				},
			})
			.then(function (res) {
				if (res.status === 'agree') {
					layout.name = res.data.name
					layout.user_code = res.data.user_code

					uiService.updateListLayout(layout.id, layout).then(function () {
						getLayoutsByEntity(layout.content_type).then(function () {
							$scope.$apply()
						})
					})
				}
			})
	}

	vm.setAsDefault = function (layoutToMakeDefault) {
		if (!layoutToMakeDefault.is_default) {
			var layoutsPropertyName = getLayoutDataByContentType(
				layoutToMakeDefault.content_type,
				'propertyName'
			)

			vm[layoutsPropertyName].forEach(function (layout) {
				if (layout.is_default) {
					layout.is_default = false
					// uiService.updateListLayout(layout.id, layout);
				}
			})

			layoutToMakeDefault.is_default = true

			return uiService.updateListLayout(
				layoutToMakeDefault.id,
				layoutToMakeDefault
			)
		}
	}

	vm.deleteLayout = function (ev, layout) {
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
						description: 'Are you sure want to delete this layout?',
					},
				},
				preserveScope: true,
				autoWrap: true,
				skipHide: true,
				multiple: true,
			})
			.then(function (res) {
				if (res.status === 'agree') {
					uiService.deleteListLayoutByKey(layout.id).then(function (data) {
						getLayoutsByEntity(layout.content_type).then(function () {
							if (layout.is_default) {
								// if default layout was deleted set another layout as default

								var layoutsPropertyName = getLayoutDataByContentType(
									layout.content_type,
									'propertyName'
								)
								var newDefaultLayout = null

								if (
									vm[layoutsPropertyName] &&
									vm[layoutsPropertyName].length > 0
								) {
									newDefaultLayout = vm[layoutsPropertyName][0]
								}

								newDefaultLayout.is_default = true
								uiService.updateListLayout(
									newDefaultLayout.id,
									newDefaultLayout
								)
							}

							$scope.$apply()
							vm.setAttributeManagerContainersHeight()
						})
					})
				}
			})
	}

	vm.openLayout = function (layout) {
		var stateToGo = getLayoutDataByContentType(layout.content_type, 'state')
		//$state.transitionTo(stateToGo, {layoutName: layout.name});
		if (layout.user_code) {
			$state.transitionTo(stateToGo, { layoutUserCode: layout.user_code })
		} else {
			var errorText = 'Layout "' + layout.name + '" has no user code.'
			toastNotificationService.error(errorText)
		}
	}

	getList()
}
