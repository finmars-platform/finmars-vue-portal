/**
 * Created by szhitenev on 28.06.2016.
 */

import entityResolverService from '../services/entityResolverService'

export default function ($mdDialog) {
	return {
		restrict: 'E',
		templateUrl: 'views/directives/crud-select-view.html',
		scope: {
			label: '=',
			item: '=',
			options: '=',
			entityType: '=',
			eventSignal: '=',
			smallOptions: '=',
			isDisabled: '=',
		},
		link: function (scope, elem, attrs, ngModelCtrl) {
			var entityType = scope.entityType

			if (
				scope.entityType &&
				scope.entityType.indexOf('strategy') !== -1 &&
				scope.label === 'Sub Group'
			) {
				scope.labelName = 'Group'
			} else {
				scope.labelName = scope.label
			}

			/* TIPS
				scope.smallOptions probable properties
					tooltipText: custom tolltip text
					indicatorBtnIcon: sets icon for indicator button
					notNull: selector should not be empty
				*/

			scope.searchTerm = ''

			// Victor 2021.04.21 #93 New crud select design
			let isAddingItem = false
			scope.selectedItem = {
				item: scope.options.find((option) => option.id === scope.item),
			}

			scope.getInputContainerClasses = function () {
				var classes = ''

				if (scope.isDisabled) {
					classes += 'custom-input-is-disabled'
				} else if (scope.error) {
					classes = 'custom-input-error'
				} else if (scope.valueIsValid) {
					classes = 'custom-input-is-valid'
				}

				if (scope.noIndicatorBtn) {
					classes += ' no-indicator-btn'
				}

				return classes
			}

			const selectItem = (item, _$popup) => {
				scope.selectedItem.item = item
				scope.item = item.id

				if (scope.error) scope.error = null // if option was selected, turn off error mode

				_$popup.cancel()
			}

			const editItem = (item) => {
				scope.popupData.currentEditName = item.name
				scope.editItem(item)
			}

			const cancelEditItem = (item) => {
				item.___edit = false

				if (isAddingItem) {
					scope.options.shift()
					isAddingItem = false
				}
			}

			const popupSaveItem = (item, $index, $event) => {
				const savedItem = { ...item, name: scope.popupData.currentEditName }
				scope.saveItem(savedItem, $index, $event)
				isAddingItem = false
			}
			const popupAddItem = () => {
				if (isAddingItem) {
					return
				}

				scope.popupData.currentEditName = ''
				isAddingItem = true
				scope.addItem()
			}

			const popupDeleteItem = (item, $index, $event) => {
				scope.deleteItem(item, $index, $event)
			}

			scope.onPopupCancel = function () {
				scope.options.forEach((item) => (item.___edit = false))
				scope.popupData.currentEditName = ''
				scope.popupData.searchTerm = ''

				if (isAddingItem) {
					scope.options.shift()
					isAddingItem = false
				}
			}

			scope.popupData = {
				searchTerm: scope.searchTerm,
				selectedItem: scope.selectedItem,
				options: scope.options,
				currentEditName: '',
				selectItem: selectItem,
				editItem: editItem,
				cancelEditItem: cancelEditItem,
				saveItem: popupSaveItem,
				addItem: popupAddItem,
				deleteItem: popupDeleteItem,
			}

			// <Victor 2021.04.21 #93 New crud select design>

			scope.addItem = function () {
				scope.searchTerm = ''

				scope.options.forEach(function (optionItem) {
					optionItem.___edit = false
				})

				scope.options.unshift({
					name: '',
					user_code: '',
					___edit: true,
				})
			}

			scope.saveItem = function (item, $index, $event) {
				if (item.id) {
					item.user_code = item.name
					item.short_name = item.name

					entityResolverService
						.update(entityType, item.id, item)
						.then(function (data) {
							scope.options[$index] = data
							// Victor 2021.04.21 #93 New crud select design
							if (scope.selectedItem.item.id === item.id) {
								scope.selectedItem.item.name = item.name
							}
							// <Victor 2021.04.21 #93 New crud select design>
							scope.$apply()
						})
						.catch(function (reason) {
							$mdDialog.show({
								controller: 'InfoDialogController as vm',
								templateUrl: 'views/info-dialog-view.html',
								parent: document.querySelector('.dialog-containers-wrap'),
								targetEvent: $event,
								clickOutsideToClose: true,
								locals: {
									info: {
										title: 'Warning',
										description: 'Name <b>' + item.name + '</b> already exist.',
									},
								},
								preserveScope: true,
								autoWrap: true,
								skipHide: true,
								multiple: true,
							})
						})
				} else {
					item.user_code = item.name
					item.short_name = item.name

					entityResolverService
						.create(entityType, item)
						.then(function (data) {
							scope.options[$index] = data
							scope.$apply()
						})
						.catch(function (reason) {
							$mdDialog.show({
								controller: 'InfoDialogController as vm',
								templateUrl: 'views/info-dialog-view.html',
								parent: document.querySelector('.dialog-containers-wrap'),
								targetEvent: $event,
								clickOutsideToClose: true,
								locals: {
									info: {
										title: 'Warning',
										description: 'Name <b>' + item.name + '</b> already exist.',
									},
								},
								preserveScope: true,
								autoWrap: true,
								skipHide: true,
								multiple: true,
							})
						})
				}
			}

			scope.deleteItem = function (item, $index, $event) {
				$mdDialog
					.show({
						controller: 'WarningDialogController as vm',
						templateUrl: 'views/dialogs/warning-dialog-view.html',
						parent: document.querySelector('.dialog-containers-wrap'),
						// targetEvent: $event,
						clickOutsideToClose: true,
						locals: {
							warning: {
								title: 'Warning',
								description: 'Are you sure to delete <b>' + item.name + '</b>?',
							},
						},
						preserveScope: true,
						autoWrap: true,
						skipHide: true,
						multiple: true,
					})
					.then(function (res) {

						if (res.status === 'agree') {
							entityResolverService.deleteByKey(entityType, item.id)

							scope.options.splice($index, 1)

							// Victor 2021.04.21 #93 New crud select design
							if (scope.selectedItem.item.id === item.id) {
								if (scope.options.length) {
									scope.selectedItem.item = scope.options[0]
									scope.item = scope.selectedItem.item.id
								} else {
									scope.selectedItem.item = null
									scope.item = null
								}
							}
							// <Victor 2021.04.21 #93 New crud select design>
						}
					})
			}

			scope.editItem = function (item) {
				scope.options.forEach(function (optionItem) {
					optionItem.___edit = false
				})

				item.___edit = true
			}

			if (scope.eventSignal) {
				scope.$watch('eventSignal', function () {
					if (scope.eventSignal && scope.eventSignal.key) {
						switch (scope.eventSignal.key) {
							case 'mark_not_valid_fields':
								if (
									scope.smallOptions &&
									scope.smallOptions.notNull &&
									!scope.item &&
									scope.item !== 0
								) {
									scope.error = 'Field should not be null'
								}

								break

							case 'error':
								scope.error = JSON.parse(
									JSON.stringify(scope.eventSignal.error)
								)
								break

							case 'reset': // reset changes done by eventSignal
								scope.error = ''
								break
						}

						scope.eventSignal = {} // reset signal
					}
				})
			}
		},
	}
}
