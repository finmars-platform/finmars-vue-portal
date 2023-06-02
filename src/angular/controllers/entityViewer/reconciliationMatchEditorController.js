/**
 * Created by szhitenev on 18.12.2019.
 */

import reconciliationBankFieldService from '../../services/reconciliation/reconciliationBankFieldService'
import reconciliationNewBankFieldService from '../../services/reconciliation/reconciliationNewBankFieldService'
import reconciliationComplexTransactionFieldService from '../../services/reconciliation/reconciliationComplexTransactionFieldService'

import reconMatchHelper from '../../helpers/reconMatchHelper'
import ScrollHelper from '../../helpers/scrollHelper'

import evEvents from '../../services/entityViewerEvents'

export default function (
	$scope,
	$mdDialog,
	parentEntityViewerDataService,
	parentEntityViewerEventService,
	splitPanelExchangeService
) {
	var vm = this

	vm.parentEntityViewerDataService = parentEntityViewerDataService
	vm.parentEntityViewerEventService = parentEntityViewerEventService
	vm.reconViewerDataService =
		parentEntityViewerDataService.getReconciliationDataService()
	vm.reconciliationEventService =
		parentEntityViewerDataService.getReconciliationEventService()

	vm.dragIconGrabbed = false

	vm.bankFieldStatuses = [
		{
			name: 'Conflicts',
			id: 2,
		},
		{
			name: 'Resolved Conflicts',
			id: 3,
		},
		{
			name: 'Matched',
			id: 1,
		},
		{
			name: 'Ignore',
			id: 4,
		},
		{
			name: 'Auto Matched',
			id: 5,
		},
	]

	vm.complexTransactionFieldStatus = [
		{
			name: 'Matched',
			id: 1,
		},
		{
			name: 'Unmatched',
			id: 2,
		},
		{
			name: 'Auto Matched',
			id: 3,
		},
		{
			name: 'Ignore',
			id: 4,
		},
	]

	var scrollHelper

	vm.complexTransactionStatusChange = function ($event, field) {
		console.log('vm.complexTransactionStatusChange.field', field)

		field.processing = true

		reconciliationComplexTransactionFieldService
			.update(field.id, field)
			.then(function (data) {
				console.log('complex transaction field updated', data)

				field.processing = false

				$scope.$apply()
			})
	}

	vm.bankFieldStatusChange = function ($event, field) {
		console.log('vm.bankFieldStatusChange.field', field)

		field.processing = true

		if (field.type === 'new') {
			delete field.id

			reconciliationBankFieldService.create(field).then(function (data) {
				console.log('bank field created', data)

				field.processing = false

				field = data

				$scope.$apply()
			})
		} else {
			reconciliationBankFieldService
				.update(field.id, field)
				.then(function (data) {
					console.log('bank field updated', data)

					field.processing = false

					$scope.$apply()
				})
		}
	}

	vm.createBankField = function (bankLine, field) {
		return new Promise(function (resolve, reject) {
			delete field.id

			reconciliationBankFieldService.create(field).then(function (data) {
				console.log('bank field created', data)

				field.processing = false

				field = data

				var data = vm.reconViewerDataService.getData(bankLine.___parentId)

				data.results = data.results.map(function (item) {
					if (item.___id === bankLine.___id) {
						return bankLine
					}

					return item
				})

				vm.reconViewerDataService.setData(data)

				vm.reconciliationEventService.dispatchEvent(evEvents.REDRAW_TABLE)

				resolve(field)
			})
		})
	}

	vm.createNewBankField = function (bankLine, field) {
		return new Promise(function (resolve, reject) {
			var oldField = Object.assign({}, field)
			var newField = Object.assign({}, field)

			delete newField.id
			delete newField.linked_complex_transaction_field
			delete newField.status

			reconciliationNewBankFieldService.create(newField).then(function (data) {
				reconciliationBankFieldService
					.deleteByKey(field.id)
					.then(function (value) {
						field = data
						field.status = undefined

						vm.bankLinesList = vm.bankLinesList.map(function (line) {
							if (line.___match_index === bankLine.___match_index) {
								line.fields = line.fields.map(function (lineField) {
									if (lineField.id === oldField.id) {
										return field
									}

									return lineField
								})
							}

							return line
						})

						vm.syncStatuses()

						resolve(field)
					})
			})
		})
	}

	vm.updateBankFieldStatus = function (bankLine, field) {
		return new Promise(function (resolve, reject) {
			reconciliationBankFieldService
				.update(field.id, field)
				.then(function (data) {
					console.log('bank field updated', data)

					field.processing = false

					var data = vm.reconViewerDataService.getData(bankLine.___parentId)

					data.results = data.results.map(function (item) {
						if (item.___id === bankLine.___id) {
							return bankLine
						}

						return item
					})

					vm.reconViewerDataService.setData(data)

					vm.reconciliationEventService.dispatchEvent(evEvents.REDRAW_TABLE)

					resolve(field)
				})
		})
	}

	vm.updateComplexTransactionFieldStatus = function (
		complexTransaction,
		field
	) {
		return new Promise(function (resolve, reject) {
			reconciliationComplexTransactionFieldService
				.update(field.id, field)
				.then(function (data) {
					console.log('complex transaction field updated', data)

					field.processing = false

					var data = vm.parentEntityViewerDataService.getData(
						complexTransaction.___parentId
					)

					data.results = data.results.map(function (item) {
						if (item.___id === complexTransaction.___id) {
							return complexTransaction
						}

						return item
					})

					vm.parentEntityViewerDataService.setData(data)

					vm.parentEntityViewerEventService.dispatchEvent(evEvents.REDRAW_TABLE)

					resolve(field)
				})
		})
	}

	vm.viewBankLine = function ($event, item) {
		$mdDialog.show({
			controller: 'ReconMatchViewLineDialogController as vm',
			templateUrl:
				'views/dialogs/reconciliation/recon-match-view-line-dialog-view.html',
			parent: angular.element(document.body),
			targetEvent: $event,
			clickOutsideToClose: false,
			locals: {
				data: {
					item: item,
				},
			},
			preserveScope: true,
			autoWrap: true,
			skipHide: true,
			multiple: true,
		})
	}

	vm.removeBankLine = function ($event, item) {
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
						description: 'Are you sure you want to delete this line?',
					},
				},
				preserveScope: true,
				autoWrap: true,
				skipHide: true,
				multiple: true,
			})
			.then(function (res) {
				if (res.status === 'agree') {
					item.fields.forEach(function (field) {
						if (field.type === 'existing') {
							reconciliationBankFieldService.deleteByKey(field.id)
						}
					})

					vm.bankLinesList = vm.bankLinesList.filter(function (line) {
						return item.___match_index !== line.___match_index
					})
				}
			})
	}

	vm.viewComplexTransaction = function ($event, item) {
		$mdDialog.show({
			controller: 'ComplexTransactionEditDialogController as vm',
			templateUrl:
				'views/entity-viewer/complex-transaction-edit-dialog-view.html',
			parent: angular.element(document.body),
			targetEvent: $event,
			preserveScope: true,
			autoWrap: true,
			skipHide: true,
			multiple: true,
			locals: {
				entityType: 'complex-transaction',
				entityId: item.id,
				data: {},
			},
		})
	}

	vm.activateBankCard = function ($event, field, line) {
		var status = !field.active

		vm.bankLinesList = vm.bankLinesList.map(function (line) {
			line.fields = line.fields.map(function (reconField) {
				reconField.active = false

				return reconField
			})

			return line
		})

		vm.complexTransactionList = vm.complexTransactionList.map(function (line) {
			line.recon_fields = line.recon_fields.map(function (reconField) {
				reconField.active = false

				return reconField
			})

			return line
		})

		field.active = status

		if (field.active && field.linked_complex_transaction_field) {
			vm.complexTransactionList = vm.complexTransactionList.map(function (
				line
			) {
				line.recon_fields = line.recon_fields.map(function (reconField) {
					if (reconField.id === field.linked_complex_transaction_field) {
						reconField.active = true
					}

					return reconField
				})

				return line
			})
		}

		console.log('vm.activateBankCard.$event', $event)
		console.log('vm.activateBankCard.field', field)
		console.log('vm.activateBankCard.line', line)
	}

	vm.activateComplexTransactionCard = function ($event, field, line) {
		var status = !field.active

		vm.bankLinesList = vm.bankLinesList.map(function (line) {
			line.fields = line.fields.map(function (reconField) {
				reconField.active = false

				return reconField
			})

			return line
		})

		vm.complexTransactionList = vm.complexTransactionList.map(function (line) {
			line.recon_fields = line.recon_fields.map(function (reconField) {
				reconField.active = false

				return reconField
			})

			return line
		})

		field.active = status

		if (field.active) {
			vm.bankLinesList = vm.bankLinesList.map(function (line) {
				line.fields = line.fields.map(function (reconField) {
					if (reconField.linked_complex_transaction_field) {
						if (reconField.linked_complex_transaction_field === field.id) {
							reconField.active = true
						}
					}

					return reconField
				})

				return line
			})
		}

		console.log('vm.activateComplexTransactionCard.$event', $event)
		console.log('vm.activateComplexTransactionCard.field', field)
		console.log('vm.activateComplexTransactionCard.line', line)
	}

	vm.setAllMatchedComplexTransaction = function ($event, item) {
		var promises = []

		item.recon_fields.forEach(function (field) {
			field.status = 1

			promises.push(
				reconciliationComplexTransactionFieldService.update(field.id, field)
			)
		})

		Promise.all(promises).then(function (value) {
			vm.complexTransactionList = vm.complexTransactionList.map(function (
				item,
				index
			) {
				item.recon_fields = item.recon_fields.map(function (field) {
					field.status = 1

					return field
				})

				return item
			})

			vm.syncStatuses()

			$scope.$apply()
		})
	}

	vm.setAllUnmatchedComplexTransaction = function ($event, item) {
		var promises = []

		item.recon_fields.forEach(function (field) {
			field.status = 2

			promises.push(
				reconciliationComplexTransactionFieldService.update(field.id, field)
			)
		})

		Promise.all(promises).then(function (value) {
			vm.complexTransactionList = vm.complexTransactionList.map(function (
				item,
				index
			) {
				item.recon_fields = item.recon_fields.map(function (field) {
					field.status = 2

					return field
				})

				return item
			})

			vm.syncStatuses()
		})
	}

	vm.turnOffDragging = function () {
		vm.dragIconGrabbed = false
	}

	vm.turnOnDragging = function () {
		vm.dragIconGrabbed = true
		document.body.addEventListener('mouseup', vm.turnOffDragging, {
			once: true,
		})
	}

	vm.initDragula = function () {
		vm.dragAndDropBankFileLines = {
			init: function () {
				this.dragulaInit()
				this.eventListeners()
			},

			eventListeners: function () {
				var drake = this.dragula

				drake.on('over', function (elem, container, source) {
					$(container).addClass('active')
				})

				drake.on('drag', function () {
					scrollHelper.enableDnDWheelScroll()
				})

				drake.on('out', function (elem, container, source) {
					$(container).removeClass('active')
				})

				drake.on('dragend', function (elem) {
					scrollHelper.disableDnDWheelScroll()
				})
			},

			dragulaInit: function () {
				var items = []

				var elements = document.querySelectorAll('.bankLineContainerHolder')

				for (var i = 0; i < elements.length; i = i + 1) {
					items.push(elements[i])
				}

				this.dragula = dragula(items, {
					revertOnSpill: true,
					moves: function () {
						return vm.dragIconGrabbed
					},
				})
			},

			destroy: function () {
				if (this.dragula) {
					this.dragula.destroy()
				}
			},
		}

		vm.dragAndDropComplexTransactionLines = {
			init: function () {
				this.dragulaInit()
				this.eventListeners()
			},

			eventListeners: function () {
				var drake = this.dragula

				drake.on('over', function (elem, container, source) {
					$(container).addClass('active')
				})

				drake.on('drag', function () {
					scrollHelper.enableDnDWheelScroll()
				})

				drake.on('out', function (elem, container, source) {
					$(container).removeClass('active')
				})

				drake.on('dragend', function (elem) {
					scrollHelper.disableDnDWheelScroll()
				})
			},

			dragulaInit: function () {
				var elements = document.querySelectorAll(
					'.complexTransactionLineContainerHolder'
				)
				var items = []

				for (var i = 0; i < elements.length; i = i + 1) {
					items.push(elements[i])
				}

				this.dragula = dragula(items, {
					revertOnSpill: true,
					moves: function () {
						return vm.dragIconGrabbed
					},
				})
			},

			destroy: function () {
				if (this.dragula) {
					this.dragula.destroy()
				}
			},
		}

		vm.dragAndDropFields = {
			init: function () {
				this.dragulaInit()
				this.eventListeners()
			},

			eventListeners: function () {
				var areaItemsChanged
				var drake = this.dragula

				/*                    drake.on('dragstart', function () {
                        areaItemsChanged = false;
                    });*/

				drake.on('drag', function () {
					areaItemsChanged = false
					scrollHelper.enableDnDWheelScroll()
				})

				drake.on('over', function (elem, container, source) {
					areaItemsChanged = false
					$(container).addClass('active')
				})

				drake.on('out', function (elem, container, source) {
					$(container).removeClass('active')
				})

				drake.on('shadow', function (elem, container) {
					// used to prevent showing shadow of card in deletion area

					var cardType = elem.dataset.type
					var containerType

					if (
						container.classList.contains(
							'dialogComplexTransactionLineContainer'
						)
					) {
						containerType = 'complex-transaction'
					}

					if (container.classList.contains('dialogBankLineContainer')) {
						containerType = 'bank-file'
					}

					if (cardType !== containerType) {
						$(elem).hide()
					} else {
						$(elem).show()
					}
				})

				drake.on('drop', function (elem, target, source, nextSibling) {
					console.log('Here vm', vm)
					console.log('nextSibling', nextSibling)

					console.log('target', target)
					console.log('elem', elem)

					var targetStatus = target.dataset.status
					var targetType = target.dataset.type

					var elemType = elem.dataset.type
					var elemFieldType = elem.dataset.fieldType
					var elemFieldId = parseInt(elem.dataset.fieldId, 10)
					var elemParentIndex = parseInt(elem.dataset.parentIndex, 10)

					var nextSiblingFieldId
					var nextSiblingParentIndex
					var nextSiblingFieldType

					if (nextSibling) {
						nextSiblingFieldId = parseInt(nextSibling.dataset.fieldId, 10)
						nextSiblingParentIndex = parseInt(
							nextSibling.dataset.nextSibling,
							10
						)
						nextSiblingFieldType = nextSibling.dataset.fieldType
					}

					console.log('elemType', elemType)
					console.log('targetType', targetType)
					console.log('targetStatus', targetStatus)
					console.log('elemFieldId', elemFieldId)
					console.log('elemParentIndex', elemParentIndex)

					if (elemType === targetType) {
						var field
						var complexTransaction

						if (elemType === 'bank-file') {
							var bankFileLine = reconMatchHelper.getBankLineByFieldId(
								elemFieldId,
								elemFieldType,
								vm.bankLinesList
							)
							var bankFileField = reconMatchHelper.getBankFileField(
								elemFieldId,
								elemFieldType,
								vm.bankLinesList
							)
							var bankFileFieldStatus =
								reconMatchHelper.getBankFieldStatusNameById(
									bankFileField.status
								)

							bankFileLine.linked_complex_transaction_field = null

							if (nextSibling) {
								var nextSiblingBankFileLine =
									reconMatchHelper.getBankLineByFieldId(
										nextSiblingFieldId,
										nextSiblingFieldType,
										vm.bankLinesList
									)
								var nextSiblingBankFileField =
									reconMatchHelper.getBankFileField(
										nextSiblingFieldId,
										nextSiblingFieldType,
										vm.bankLinesList
									)

								var nextSiblingBankFileFieldStatus =
									reconMatchHelper.getBankFieldStatusNameById(
										nextSiblingBankFileField.status
									)

								console.log('targetStatus', targetStatus)
								console.log('bankFileFieldStatus', bankFileFieldStatus)
								console.log(
									'nextSiblingBankFileFieldStatus',
									nextSiblingBankFileFieldStatus
								)

								if (
									bankFileFieldStatus === 'new' &&
									nextSiblingBankFileFieldStatus === 'new' &&
									targetStatus === 'new'
								) {
									bankFileField.status =
										reconMatchHelper.getBankFieldStatusIdByName('resolved')

									vm.createBankField(bankFileLine, bankFileField).then(
										function (value) {
											nextSiblingBankFileField.status =
												reconMatchHelper.getBankFieldStatusIdByName('resolved')

											vm.createBankField(
												nextSiblingBankFileLine,
												nextSiblingBankFileField
											).then(function (value1) {
												$scope.$apply()
											})
										}
									)
								}

								if (
									[
										'ignore',
										'matched',
										'auto_matched',
										'resolved',
										'conflict',
									].indexOf(bankFileFieldStatus) !== -1 &&
									nextSiblingBankFileFieldStatus === 'new' &&
									targetStatus === 'new'
								) {
									bankFileField.status =
										reconMatchHelper.getBankFieldStatusIdByName('resolved')

									vm.updateBankFieldStatus(bankFileLine, bankFileField).then(
										function (value) {
											nextSiblingBankFileField.status =
												reconMatchHelper.getBankFieldStatusIdByName('resolved')

											vm.createBankField(
												nextSiblingBankFileLine,
												nextSiblingBankFileField
											).then(function (value1) {
												$scope.$apply()
											})
										}
									)
								}

								if (
									bankFileFieldStatus === 'matched' &&
									nextSiblingBankFileFieldStatus === 'conflict' &&
									targetStatus === 'conflict'
								) {
									bankFileField.status =
										reconMatchHelper.getBankFieldStatusIdByName('resolved')

									vm.updateBankFieldStatus(bankFileLine, bankFileField).then(
										function (value) {
											nextSiblingBankFileField.status =
												reconMatchHelper.getBankFieldStatusIdByName('resolved')

											vm.createBankField(
												nextSiblingBankFileLine,
												nextSiblingBankFileField
											).then(function (value1) {
												$scope.$apply()
											})
										}
									)
								}

								if (
									bankFileFieldStatus === 'auto_matched' &&
									nextSiblingBankFileFieldStatus === 'conflict' &&
									targetStatus === 'conflict'
								) {
									bankFileField.status =
										reconMatchHelper.getBankFieldStatusIdByName('resolved')

									vm.updateBankFieldStatus(bankFileLine, bankFileField).then(
										function (value) {
											nextSiblingBankFileField.status =
												reconMatchHelper.getBankFieldStatusIdByName('resolved')

											vm.createBankField(
												nextSiblingBankFileLine,
												nextSiblingBankFileField
											).then(function (value1) {
												$scope.$apply()
											})
										}
									)
								}

								if (
									bankFileFieldStatus === 'new' &&
									nextSiblingBankFileFieldStatus === 'conflict' &&
									targetStatus === 'conflict'
								) {
									bankFileField.status =
										reconMatchHelper.getBankFieldStatusIdByName('resolved')

									vm.updateBankFieldStatus(bankFileLine, bankFileField).then(
										function (value) {
											nextSiblingBankFileField.status =
												reconMatchHelper.getBankFieldStatusIdByName('resolved')

											vm.createBankField(
												nextSiblingBankFileLine,
												nextSiblingBankFileField
											).then(function (value1) {
												$scope.$apply()
											})
										}
									)
								}

								if (
									bankFileFieldStatus === 'conflict' &&
									nextSiblingBankFileFieldStatus === 'conflict' &&
									targetStatus === 'conflict'
								) {
									bankFileField.status =
										reconMatchHelper.getBankFieldStatusIdByName('resolved')

									vm.updateBankFieldStatus(bankFileLine, bankFileField).then(
										function (value) {
											nextSiblingBankFileField.status =
												reconMatchHelper.getBankFieldStatusIdByName('resolved')

											vm.updateBankFieldStatus(
												nextSiblingBankFileLine,
												nextSiblingBankFileField
											).then(function (value1) {
												$scope.$apply()
											})
										}
									)
								}

								if (
									bankFileFieldStatus === 'ignore' &&
									nextSiblingBankFileFieldStatus === 'conflict' &&
									targetStatus === 'conflict'
								) {
									bankFileField.status =
										reconMatchHelper.getBankFieldStatusIdByName('resolved')

									vm.updateBankFieldStatus(bankFileLine, bankFileField).then(
										function (value) {
											nextSiblingBankFileField.status =
												reconMatchHelper.getBankFieldStatusIdByName('resolved')

											vm.updateBankFieldStatus(
												nextSiblingBankFileLine,
												nextSiblingBankFileField
											).then(function (value1) {
												$scope.$apply()
											})
										}
									)
								}

								if (targetStatus === 'ignore') {
									bankFileField.status =
										reconMatchHelper.getBankFieldStatusIdByName(targetStatus)

									if (bankFileFieldStatus === 'new') {
										vm.createBankField(bankFileLine, bankFileField).then(
											function (value) {
												$scope.$apply()
											}
										)
									} else {
										vm.updateBankFieldStatus(bankFileLine, bankFileField).then(
											function (value) {
												$scope.$apply()
											}
										)
									}
								}
							} else {
								if (targetStatus === 'new') {
									vm.createNewBankField(bankFileLine, bankFileField).then(
										function (value) {
											$scope.$apply()
										}
									)
								} else {
									bankFileField.status =
										reconMatchHelper.getBankFieldStatusIdByName(targetStatus)

									if (bankFileFieldStatus === 'new') {
										vm.createBankField(bankFileLine, bankFileField).then(
											function (value) {
												$scope.$apply()
											}
										)
									} else {
										vm.updateBankFieldStatus(bankFileLine, bankFileField).then(
											function (value) {
												$scope.$apply()
											}
										)
									}
								}
							}
						}

						if (elemType === 'complex-transaction') {
							var complexTransactionLine =
								reconMatchHelper.getComplexTransactionLineByFieldId(
									elemFieldId,
									vm.complexTransactionList
								)
							var complexTransactionField =
								reconMatchHelper.getComplexTransactionField(
									elemFieldId,
									vm.complexTransactionList
								)

							complexTransactionField.status =
								reconMatchHelper.getComplexTransactionFieldStatusIdByName(
									targetStatus
								)

							vm.updateComplexTransactionFieldStatus(
								complexTransactionLine,
								complexTransactionField
							).then(function (value) {
								$scope.$apply()
							})
						}
					} else {
						console.log('Drop on other side')

						if (nextSibling) {
							var bankFileLine
							var bankFileField
							var complexTransactionLine
							var complexTransactionField

							if (elemType === 'complex-transaction') {
								bankFileLine = reconMatchHelper.getBankLineByFieldId(
									nextSiblingFieldId,
									nextSiblingFieldType,
									vm.bankLinesList
								)
								bankFileField = reconMatchHelper.getBankFileField(
									nextSiblingFieldId,
									nextSiblingFieldType,
									vm.bankLinesList
								)
								complexTransactionLine =
									reconMatchHelper.getComplexTransactionLineByFieldId(
										elemFieldId,
										vm.complexTransactionList
									)
								complexTransactionField =
									reconMatchHelper.getComplexTransactionField(
										elemFieldId,
										vm.complexTransactionList
									)
							}

							if (elemType === 'bank-file') {
								bankFileLine = reconMatchHelper.getBankLineByFieldId(
									elemFieldId,
									elemFieldType,
									vm.bankLinesList
								)
								bankFileField = reconMatchHelper.getBankFileField(
									elemFieldId,
									elemFieldType,
									vm.bankLinesList
								)
								complexTransactionLine =
									reconMatchHelper.getComplexTransactionLineByFieldId(
										nextSiblingFieldId,
										vm.complexTransactionList
									)
								complexTransactionField =
									reconMatchHelper.getComplexTransactionField(
										nextSiblingFieldId,
										vm.complexTransactionList
									)
							}

							var bankFileFieldStatus =
								reconMatchHelper.getBankFieldStatusNameById(
									bankFileField.status
								)
							var complexTransactionFieldStatus =
								reconMatchHelper.getComplexTransactionFieldStatusNameById(
									complexTransactionField.status
								)

							console.log('Result bankFileField?', bankFileField)
							console.log(
								'Result complexTransactionField?',
								complexTransactionField
							)

							console.log('Result bankFileFieldStatus?', bankFileFieldStatus)
							console.log(
								'Result complexTransactionFieldStatus?',
								complexTransactionFieldStatus
							)

							if (
								[
									'new',
									'conflict',
									'resolved',
									'ignore',
									'matched',
									'auto_matched',
								].indexOf(bankFileFieldStatus) !== -1 &&
								['unmatched', 'ignore'].indexOf(
									complexTransactionFieldStatus
								) !== -1
							) {
								bankFileField.status =
									reconMatchHelper.getBankFieldStatusIdByName('matched')

								bankFileField.linked_complex_transaction_field =
									complexTransactionField.id

								bankFileLine.new_fields = bankFileLine.new_fields.filter(
									function (item) {
										return item.id !== bankFileField.id
									}
								)
								bankFileLine.conflicts_fields =
									bankFileLine.conflicts_fields.filter(function (item) {
										return item.id !== bankFileField.id
									})
								bankFileLine.resolved_fields =
									bankFileLine.resolved_fields.filter(function (item) {
										return item.id !== bankFileField.id
									})
								bankFileLine.ignore_fields = bankFileLine.ignore_fields.filter(
									function (item) {
										return item.id !== bankFileField.id
									}
								)
								bankFileLine.auto_matched_fields =
									bankFileLine.auto_matched_fields.filter(function (item) {
										return item.id !== bankFileField.id
									})
								bankFileLine.matched_fields =
									bankFileLine.matched_fields.filter(function (item) {
										return item.id !== bankFileField.id
									})

								console.log('bankFileLine', bankFileLine)

								bankFileLine.matched_fields.push(bankFileField)

								if (bankFileFieldStatus === 'new') {
									vm.createBankField(bankFileLine, bankFileField).then(
										function (value) {
											$scope.$apply()
										}
									)
								} else {
									vm.updateBankFieldStatus(bankFileLine, bankFileField).then(
										function (value) {
											$scope.$apply()
										}
									)
								}

								complexTransactionField.status =
									reconMatchHelper.getComplexTransactionFieldStatusIdByName(
										'matched'
									)

								complexTransactionLine.matched_fields.push(
									complexTransactionField
								)
								complexTransactionLine.unmatched_fields =
									complexTransactionLine.unmatched_fields.filter(function (
										item
									) {
										return item.id !== complexTransactionField.id
									})

								complexTransactionLine.ignore_fields =
									complexTransactionLine.ignore_fields.filter(function (item) {
										return item.id !== complexTransactionField.id
									})

								vm.updateComplexTransactionFieldStatus(
									complexTransactionLine,
									complexTransactionField
								).then(function (value) {
									$scope.$apply()
								})
							}
						} else {
							drake.cancel(true)
							$(elem).show()
						}
					}
				})

				drake.on('dragend', function (elem) {
					scrollHelper.disableDnDWheelScroll()
				})
			},

			dragulaInit: function () {
				var bankLineElements = document.querySelectorAll('.bankLineContainer')

				var complexTransactionElements = document.querySelectorAll(
					'.complexTransactionLineContainer'
				)

				var items = []

				for (var i = 0; i < bankLineElements.length; i = i + 1) {
					items.push(bankLineElements[i])
				}

				for (var i = 0; i < complexTransactionElements.length; i = i + 1) {
					items.push(complexTransactionElements[i])
				}

				this.dragula = dragula(items, {
					revertOnSpill: true,
					accepts: function (el, target, source, sibling) {
						var complexTransactionElClass =
							'complexTransactionLineContainer-' + el.dataset.parentIndex
						var bankLineElClass = 'bankLineContainer-' + el.dataset.parentIndex

						if (target.dataset.status === 'auto_matched') {
							return false
						}

						if (target.classList.contains(complexTransactionElClass)) {
							return true
						}

						if (target.classList.contains(bankLineElClass)) {
							if (target.dataset.status === 'matched') {
								return false
							}

							return true
						}

						return false
					},
				})
			},
			destroy: function () {
				if (this.dragula) {
					this.dragula.destroy()
				}
			},
		}

		setTimeout(function () {
			var DnDScrollElem = document.querySelector('.dndScrollableElem')
			scrollHelper.setDnDScrollElem(DnDScrollElem)

			vm.dragAndDropBankFileLines.init()
			vm.dragAndDropComplexTransactionLines.init()
			vm.dragAndDropFields.init()
		}, 500)
	}

	vm.destroyDragula = function () {
		if (vm.dragAndDropBankFileLines) {
			vm.dragAndDropBankFileLines.destroy()
		}

		if (vm.dragAndDropComplexTransactionLines) {
			vm.dragAndDropComplexTransactionLines.destroy()
		}

		if (vm.dragAndDropFields) {
			vm.dragAndDropFields.destroy()
		}
	}

	vm.cancel = function () {
		$mdDialog.hide({ status: 'disagree' })
	}

	vm.agree = function () {
		$mdDialog.hide({ status: 'agree' })
	}

	vm.syncStatuses = function () {
		vm.complexTransactionList = vm.complexTransactionList.map(function (
			item,
			index
		) {
			// MATCHED = 1
			// UNMATCHED = 2
			// AUTO_MATCHED = 3
			// IGNORE = 4

			item.unmatched_fields = item.recon_fields.filter(function (item) {
				return item.status === 2
			})

			item.matched_fields = item.recon_fields.filter(function (item) {
				return item.status === 1
			})

			item.auto_matched_fields = item.recon_fields.filter(function (item) {
				return item.status === 3
			})

			item.ignore_fields = item.recon_fields.filter(function (item) {
				return item.status === 4
			})

			item.___match_index = index

			return item
		})

		vm.bankLinesList = vm.bankLinesList.map(function (item, index) {
			// MATCHED = 1
			// CONFLICT = 2
			// RESOLVED = 3
			// IGNORE = 4
			// AUTO_MATCHED = 5

			item.ignore_fields = item.fields.filter(function (item) {
				return item.status === 4
			})

			item.auto_matched_fields = item.fields.filter(function (item) {
				return item.status === 5
			})

			item.matched_fields = item.fields.filter(function (item) {
				return item.status === 1
			})

			item.resolved_fields = item.fields.filter(function (item) {
				return item.status === 3
			})

			item.conflicts_fields = item.fields.filter(function (item) {
				return item.status === 2
			})

			item.new_fields = item.fields.filter(function (item) {
				return !item.status
			})

			item.___match_index = index

			return item
		})

		vm.initDragula()
	}

	vm.getLists = function () {
		var parentFlatList = vm.parentEntityViewerDataService.getFlatList()

		var flatList = vm.reconViewerDataService.getFlatList()

		console.log('parentFlatList', parentFlatList)
		console.log('flatList', flatList)

		vm.complexTransactionList = parentFlatList.filter(function (item) {
			return (
				item.___is_activated && !item.is_canceled && item.___type === 'object'
			)
		})

		vm.bankLinesList = flatList.filter(function (item) {
			return item.___is_activated && item.___type === 'object'
		})

		vm.syncStatuses()
	}

	vm.init = function () {
		var scrollHelper = new ScrollHelper()

		vm.parentEntityViewerEventService.addEventListener(
			evEvents.REDRAW_TABLE,
			function () {
				vm.destroyDragula()

				vm.getLists()
			}
		)

		vm.reconciliationEventService.addEventListener(
			evEvents.REDRAW_TABLE,
			function () {
				vm.destroyDragula()

				vm.getLists()
			}
		)

		vm.getLists()

		console.log('vm', vm)

		console.log('parentSelectedList', vm.complexTransactionList)
		console.log('selectedList', vm.bankLinesList)
	}

	vm.init()
}
