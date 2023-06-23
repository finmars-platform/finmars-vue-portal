/**
 * Created by szhitenev on 11.12.2019.
 */

import reconciliationBankFieldService from '@/angular/services/reconciliation/reconciliationBankFieldService'
import reconciliationNewBankFieldService from '@/angular/services/reconciliation/reconciliationNewBankFieldService'
import reconciliationComplexTransactionFieldService from '@/angular/services/reconciliation/reconciliationComplexTransactionFieldService'

import reconMatchHelper from '@/angularlpers/reconMatchHelper'
import ScrollHelper from '@/angularlpers/scrollHelper'

export default function reconMatchDialogController($scope, $mdDialog, data) {
	var vm = this

	vm.processing = false

	vm.parentEntityViewerDataService = data.parentEntityViewerDataService
	vm.reconViewerDataService = data.entityViewerDataService

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

	var dragAndDropBankFileLines
	var dragAndDropComplexTransactionLines
	var dragAndDropFields
	var scrollHelper

	vm.createBankField = function (bankLine, field) {
		return new Promise(function (resolve, reject) {
			var newField = Object.assign({}, field)

			delete newField.id

			reconciliationBankFieldService.create(newField).then(function (data) {
				console.log('bank field created', data)

				field.processing = false

				field = data

				vm.bankLinesList = vm.bankLinesList.map(function (line) {
					if (line.___match_index === bankLine.___match_index) {
						line.fields = line.fields.map(function (lineField) {
							if (lineField.reference_name === field.reference_name) {
								return field
							}

							return lineField
						})
					}

					return line
				})

				vm.syncStatuses()

				resolve(data)
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

						resolve(data)
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

					vm.bankLinesList = vm.bankLinesList.map(function (line) {
						if (line.___match_index === bankLine.___match_index) {
							line.fields = line.fields.map(function (lineField) {
								if (lineField.id === field.id) {
									return field
								}

								return lineField
							})
						}

						return line
					})

					vm.syncStatuses()

					resolve(data)
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

					field = data

					vm.complexTransactionList.forEach(function (line) {
						if (line.id === complexTransaction.id) {
							for (var i = 0; i < line.recon_fields.length; i = i + 1) {
								if (field.id === line.recon_fields[i].id) {
									line.recon_fields[i].status = field.status
								}
							}
						}
					})

					console.log('complexTransaction', complexTransaction)

					vm.syncStatuses()

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

	var cardsAndContainersRelation = {
		'bank-file': {
			ignore: {
				'bank-file': {
					resolved: { interactionType: 'area' },
					conflict: { interactionType: 'area_cards' },
					new: { interactionType: 'area' },
				},

				'complex-transaction': {
					unmatched: { interactionType: 'cards' },
					ignore: { interactionType: 'cards' },
				},
			},
			auto_matched: {
				'bank-file': {
					ignore: { interactionType: 'area' },
					resolved: { interactionType: 'area' },
					conflict: { interactionType: 'area_cards' },
					new: { interactionType: 'area_cards' },
				},

				'complex-transaction': {
					unmatched: { interactionType: 'cards' },
					ignore: { interactionType: 'cards' },
				},
			},
			matched: {
				'bank-file': {
					ignore: { interactionType: 'area' },
					resolved: { interactionType: 'area' },
					conflict: { interactionType: 'area_cards' },
					new: { interactionType: 'area_cards' },
				},

				'complex-transaction': {
					unmatched: { interactionType: 'cards' },
					ignore: { interactionType: 'cards' },
				},
			},
			resolved: {
				'bank-file': {
					ignore: { interactionType: 'area' },
					conflict: { interactionType: 'area' },
					new: { interactionType: 'area' },
				},

				'complex-transaction': {
					unmatched: { interactionType: 'cards' },
					ignore: { interactionType: 'cards' },
				},
			},
			conflict: {
				'bank-file': {
					ignore: { interactionType: 'area' },
					resolved: { interactionType: 'area' },
					conflict: { interactionType: 'cards' },
					new: { interactionType: 'area_cards' },
				},

				'complex-transaction': {
					unmatched: { interactionType: 'cards' },
					ignore: { interactionType: 'cards' },
				},
			},
			new: {
				'bank-file': {
					ignore: { interactionType: 'area' },
					resolved: { interactionType: 'area' },
					conflict: { interactionType: 'area_cards' },
					new: { interactionType: 'cards' },
				},

				'complex-transaction': {
					unmatched: { interactionType: 'cards' },
					ignore: { interactionType: 'cards' },
				},
			},
		},

		'complex-transaction': {
			unmatched: {
				'bank-file': {
					ignore: { interactionType: 'cards' },
					resolved: { interactionType: 'cards' },
					conflict: { interactionType: 'cards' },
					new: { interactionType: 'cards' },
				},

				'complex-transaction': {
					matched: { interactionType: 'area' },
					ignore: { interactionType: 'area' },
				},
			},
			matched: {
				'bank-file': {},

				'complex-transaction': {
					unmatched: { interactionType: 'area' },
					ignore: { interactionType: 'area' },
				},
			},
			auto_matched: {
				'bank-file': [],

				'complex-transaction': {
					unmatched: { interactionType: 'area' },
					matched: { interactionType: 'area' },
					ignore: { interactionType: 'area' },
				},
			},
			ignore: {
				'bank-file': {
					resolved: { interactionType: 'cards' },
					conflict: { interactionType: 'cards' },
					new: { interactionType: 'cards' },
				},

				'complex-transaction': {
					unmatched: { interactionType: 'area' },
					matched: { interactionType: 'area' },
				},
			},
		},
	}

	var getContainerInfo = function (
		cardType,
		cardContainerStatus,
		containerType,
		containerStatus
	) {
		var onDropActions =
			cardsAndContainersRelation[cardType][cardContainerStatus][containerType]

		if (Object.keys(onDropActions).indexOf(containerStatus) > -1) {
			return onDropActions[containerStatus]
		}

		return null
	}

	vm.initDragula = function () {
		dragAndDropBankFileLines = {
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

				var elements = document.querySelectorAll(
					'.dialogBankLineContainerHolder'
				)

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
				this.dragula.destroy()
				dragAndDropBankFileLines = null
			},
		}

		dragAndDropComplexTransactionLines = {
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
					'.dialogComplexTransactionLineContainerHolder'
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
				this.dragula.destroy()
				dragAndDropComplexTransactionLines = null
			},
		}

		dragAndDropFields = {
			init: function () {
				this.dragulaInit()
				this.eventListeners()
			},

			eventListeners: function () {
				var areaItemsChanged
				var drake = this.dragula

				var draggedOverElem
				var shadowElem

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
					draggedOverElem = container

					/*var containerInfo = getContainerInfo(elemType, elemStatus, targetType, targetStatus);

                        if (containerInfo && containerInfo.type === 'area') {
                            $(container).addClass('recon-cards-container-dragged-over');
                        }*/
				})

				drake.on('shadow', function (elem, container, source) {
					// used to prevent showing shadow of card in deletion area

					/*var cardType = elem.dataset.type;
                        var containerType;*/
					elem.classList.remove('display-none')
					shadowElem = elem

					var elemType = elem.dataset.type
					var elemContainerStatus = source.dataset.status
					var targetType = container.dataset.type
					var targetStatus = container.dataset.status

					var hideShadow = true

					/*if (container.classList.contains('dialogComplexTransactionLineContainer')) {
                            containerType = 'complex-transaction'
                        }

                        if (container.classList.contains('dialogBankLineContainer')) {
                            containerType = 'bank-file'
                        }*/

					var nextSibling = elem.nextSibling
					var containerInfo = getContainerInfo(
						elemType,
						elemContainerStatus,
						targetType,
						targetStatus
					)

					if (containerInfo && draggedOverElem === container) {
						switch (containerInfo.interactionType) {
							case 'area':
								hideShadow = false
								container.classList.add('recon-cards-container-dragged-over')
								break

							case 'cards':
								if (nextSibling) {
									var lastDraggedOverCard = container.querySelector(
										'.recon-dragged-over-card'
									)
									if (lastDraggedOverCard) {
										lastDraggedOverCard.classList.remove(
											'recon-dragged-over-card'
										)
									}

									nextSibling.classList.add('recon-dragged-over-card')
								}

								break

							case 'area_cards':
								hideShadow = false

								if (nextSibling) {
									var lastDraggedOverCard = container.querySelector(
										'.recon-dragged-over-card'
									)
									if (lastDraggedOverCard) {
										lastDraggedOverCard.classList.remove(
											'recon-dragged-over-card'
										)
									}

									container.classList.remove(
										'recon-cards-container-dragged-over'
									)
									nextSibling.classList.add('recon-dragged-over-card')
								} else {
									var lastDraggedOverCard = container.querySelector(
										'.recon-dragged-over-card'
									)
									if (lastDraggedOverCard) {
										lastDraggedOverCard.classList.remove(
											'recon-dragged-over-card'
										)
									}

									container.classList.add('recon-cards-container-dragged-over')
								}

								break
						}
					}
					/*if (cardType !== containerType) {
                            $(elem).hide();
                        } else {
                            $(elem).show();
                        }*/

					if (hideShadow || nextSibling) {
						//$(elem).hide();
						elem.classList.add('display-none')
					}
				})

				drake.on('out', function (elem, container, source) {
					draggedOverElem = null

					if (shadowElem) {
						shadowElem.classList.add('display-none')
						shadowElem = null
					}

					container.classList.remove('active')
					container.classList.remove('recon-cards-container-dragged-over')

					var lastDraggedOverCard = container.querySelector(
						'.recon-dragged-over-card'
					)
					if (lastDraggedOverCard) {
						lastDraggedOverCard.classList.remove('recon-dragged-over-card')
					}
				})

				drake.on('drop', function (elem, target, source, nextSibling) {
					var targetStatus = target.dataset.status
					var targetType = target.dataset.type

					var elemType = elem.dataset.type
					var elemFieldType = elem.dataset.fieldType
					var elemFieldId = parseInt(elem.dataset.fieldId, 10)
					// var elemParentIndex = parseInt(elem.dataset.parentIndex, 10);

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

					if (elemType === targetType) {
						// Dropped on the same die
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

								if (
									bankFileFieldStatus === 'new' &&
									nextSiblingBankFileFieldStatus === 'new' &&
									targetStatus === 'new'
								) {
									vm.processing = true

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
												vm.processing = false

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

									vm.processing = true

									vm.updateBankFieldStatus(bankFileLine, bankFileField).then(
										function (value) {
											nextSiblingBankFileField.status =
												reconMatchHelper.getBankFieldStatusIdByName('resolved')

											vm.createBankField(
												nextSiblingBankFileLine,
												nextSiblingBankFileField
											).then(function (value1) {
												vm.processing = false

												$scope.$apply()
											})
										}
									)
								} else if (
									bankFileFieldStatus === 'matched' &&
									nextSiblingBankFileFieldStatus === 'conflict' &&
									targetStatus === 'conflict'
								) {
									bankFileField.status =
										reconMatchHelper.getBankFieldStatusIdByName('resolved')

									vm.processing = true

									vm.updateBankFieldStatus(bankFileLine, bankFileField).then(
										function (value) {
											nextSiblingBankFileField.status =
												reconMatchHelper.getBankFieldStatusIdByName('resolved')

											vm.createBankField(
												nextSiblingBankFileLine,
												nextSiblingBankFileField
											).then(function (value1) {
												vm.processing = false

												$scope.$apply()
											})
										}
									)
								} else if (
									bankFileFieldStatus === 'auto_matched' &&
									nextSiblingBankFileFieldStatus === 'conflict' &&
									targetStatus === 'conflict'
								) {
									bankFileField.status =
										reconMatchHelper.getBankFieldStatusIdByName('resolved')

									vm.processing = true

									vm.updateBankFieldStatus(bankFileLine, bankFileField).then(
										function (value) {
											nextSiblingBankFileField.status =
												reconMatchHelper.getBankFieldStatusIdByName('resolved')

											vm.createBankField(
												nextSiblingBankFileLine,
												nextSiblingBankFileField
											).then(function (value1) {
												vm.processing = false

												$scope.$apply()
											})
										}
									)
								} else if (
									bankFileFieldStatus === 'new' &&
									nextSiblingBankFileFieldStatus === 'conflict' &&
									targetStatus === 'conflict'
								) {
									bankFileField.status =
										reconMatchHelper.getBankFieldStatusIdByName('resolved')

									vm.processing = true

									vm.updateBankFieldStatus(bankFileLine, bankFileField).then(
										function (value) {
											nextSiblingBankFileField.status =
												reconMatchHelper.getBankFieldStatusIdByName('resolved')

											vm.createBankField(
												nextSiblingBankFileLine,
												nextSiblingBankFileField
											).then(function (value1) {
												vm.processing = false

												$scope.$apply()
											})
										}
									)
								} else if (
									bankFileFieldStatus === 'conflict' &&
									nextSiblingBankFileFieldStatus === 'conflict' &&
									targetStatus === 'conflict'
								) {
									bankFileField.status =
										reconMatchHelper.getBankFieldStatusIdByName('resolved')

									vm.processing = true

									vm.updateBankFieldStatus(bankFileLine, bankFileField).then(
										function (value) {
											nextSiblingBankFileField.status =
												reconMatchHelper.getBankFieldStatusIdByName('resolved')

											vm.updateBankFieldStatus(
												nextSiblingBankFileLine,
												nextSiblingBankFileField
											).then(function (value1) {
												vm.processing = false

												$scope.$apply()
											})
										}
									)
								} else if (
									bankFileFieldStatus === 'ignore' &&
									nextSiblingBankFileFieldStatus === 'conflict' &&
									targetStatus === 'conflict'
								) {
									bankFileField.status =
										reconMatchHelper.getBankFieldStatusIdByName('resolved')

									vm.processing = true

									vm.updateBankFieldStatus(bankFileLine, bankFileField).then(
										function (value) {
											nextSiblingBankFileField.status =
												reconMatchHelper.getBankFieldStatusIdByName('resolved')

											vm.updateBankFieldStatus(
												nextSiblingBankFileLine,
												nextSiblingBankFileField
											).then(function (value1) {
												vm.processing = false

												$scope.$apply()
											})
										}
									)
								} else if (targetStatus === 'ignore') {
									bankFileField.status =
										reconMatchHelper.getBankFieldStatusIdByName(targetStatus)

									if (bankFileFieldStatus === 'new') {
										vm.processing = true

										vm.createBankField(bankFileLine, bankFileField).then(
											function (value) {
												vm.processing = false
												$scope.$apply()
											}
										)
									} else {
										vm.processing = true

										vm.updateBankFieldStatus(bankFileLine, bankFileField).then(
											function (value) {
												vm.processing = false
												$scope.$apply()
											}
										)
									}
								} else {
									// vm.processing = false;
									drake.cancel()
									//$(elem).show();
								}
							} else {
								if (targetStatus === 'new') {
									vm.processing = true

									vm.createNewBankField(bankFileLine, bankFileField).then(
										function (value) {
											vm.processing = false
											$scope.$apply()
										}
									)
								} else {
									bankFileField.status =
										reconMatchHelper.getBankFieldStatusIdByName(targetStatus)

									if (bankFileFieldStatus === 'new') {
										vm.processing = true

										vm.createBankField(bankFileLine, bankFileField).then(
											function (value) {
												vm.processing = false
												$scope.$apply()
											}
										)
									} else {
										vm.processing = true

										vm.updateBankFieldStatus(bankFileLine, bankFileField).then(
											function (value) {
												vm.processing = false

												$scope.$apply()
											}
										)
									}
								}
							}
						} else if (elemType === 'complex-transaction') {
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

							vm.processing = true

							vm.updateComplexTransactionFieldStatus(
								complexTransactionLine,
								complexTransactionField
							).then(function (value) {
								vm.processing = false
								$scope.$apply()
							})
						} else {
							drake.cancel()
							//$(elem).show();

							// vm.processing = false;
						}
					} else {
						// Dropped on the other side

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
							} else if (elemType === 'bank-file') {
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

							/*console.log("Result bankFileField?", bankFileField);
                                console.log("Result complexTransactionField?", complexTransactionField);

                                console.log("Result bankFileFieldStatus?", bankFileFieldStatus);
                                console.log("Result complexTransactionFieldStatus?", complexTransactionFieldStatus);*/

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

								bankFileLine.matched_fields.push(bankFileField)

								if (bankFileFieldStatus === 'new') {
									vm.processing = true

									vm.createBankField(bankFileLine, bankFileField).then(
										function (value) {
											vm.processing = false
											$scope.$apply()
										}
									)
								} else {
									vm.processing = true

									vm.updateBankFieldStatus(bankFileLine, bankFileField).then(
										function (value) {
											vm.processing = false
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

								vm.processing = true

								vm.updateComplexTransactionFieldStatus(
									complexTransactionLine,
									complexTransactionField
								).then(function (value) {
									vm.processing = false
									$scope.$apply()
								})
							} else {
								drake.cancel()
								//$(elem).show();
							}
						} else {
							// vm.processing = false;

							drake.cancel()
							//$(elem).show();
						}
					}

					vm.syncStatuses()
				})

				drake.on('dragend', function (elem) {
					scrollHelper.disableDnDWheelScroll()

					vm.syncStatuses()
					elem.classList.remove('display-none')
				})
			},

			dragulaInit: function () {
				var bankLineElements = document.querySelectorAll(
					'.dialogBankLineContainer'
				)

				var complexTransactionElements = document.querySelectorAll(
					'.dialogComplexTransactionLineContainer'
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
							'dialogComplexTransactionLineContainer-' + el.dataset.parentIndex
						var bankLineElClass =
							'dialogBankLineContainer-' + el.dataset.parentIndex

						var elemType = el.dataset.type

						if (target.dataset.status === 'auto_matched') {
							return false
						}

						if (
							target.className.indexOf('dialogBankLineContainer') !== -1 &&
							elemType === 'bank-line'
						) {
							// allow move bank file fields only in bank file line

							if (target.classList.contains(bankLineElClass)) {
								return true
							} else {
								return false
							}
						}

						if (
							target.className.indexOf(
								'dialogComplexTransactionLineContainer'
							) !== -1 &&
							elemType === 'complex-transaction'
						) {
							// allow move bank file fields only in bank file line

							if (target.classList.contains(complexTransactionElClass)) {
								return true
							} else {
								return false
							}
						}

						return true
					},
				})
			},

			destroy: function () {
				this.dragula.destroy()
				dragAndDropFields = null
			},
		}

		setTimeout(function () {
			var DnDScrollElem = document.querySelector('.dndScrollableElem')
			scrollHelper.setDnDScrollElem(DnDScrollElem)

			dragAndDropBankFileLines.init()
			dragAndDropComplexTransactionLines.init()
			dragAndDropFields.init()
		}, 500)
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

			item.unmatched_fields = []
			item.matched_fields = []
			item.auto_matched_fields = []
			item.ignore_fields = []

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

			// seems that map is not doing full object clone and it has bug behavior
			// so json.parse/stringify is good, maybe replace to deepcopy/or manual object copying
			return JSON.parse(JSON.stringify(item))
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

			// seems that map is not doing full object clone and it has bug behavior
			// so json.parse/stringify is good, maybe replace to deepcopy/or manual object copying
			return JSON.parse(JSON.stringify(item))
		})
	}

	vm.agree = function () {
		vm.complexTransactionList.forEach(function (complexTransaction) {
			var data = vm.parentEntityViewerDataService.getData(
				complexTransaction.___parentId
			)

			data.results = data.results.map(function (item) {
				if (item.___id === complexTransaction.___id) {
					return complexTransaction
				}

				return item
			})
		})

		vm.bankLinesList.forEach(function (bankLine) {
			var data = vm.reconViewerDataService.getData(bankLine.___parentId)

			data.results = data.results.map(function (item) {
				if (item.___id === bankLine.___id) {
					return bankLine
				}

				return item
			})
		})

		$mdDialog.hide({ status: 'agree' })
	}

	vm.init = function () {
		console.log('vm', vm)

		scrollHelper = new ScrollHelper()

		var parentFlatList = vm.parentEntityViewerDataService.getFlatList()

		var flatList = vm.reconViewerDataService.getFlatList()

		// same code in reconciliationMatchEditorController.js
		vm.complexTransactionList = parentFlatList.filter(function (item) {
			return (
				item.___is_activated && !item.is_canceled && item.___type === 'object'
			)
		})

		vm.bankLinesList = flatList.filter(function (item) {
			return item.___is_activated && item.___type === 'object'
		})
		// < same code in reconciliationMatchEditorController.js >

		vm.syncStatuses()

		console.log('parentSelectedList', vm.complexTransactionList)
		console.log('selectedList', vm.bankLinesList)

		vm.initDragula()
	}

	vm.init()

	$scope.$on('$destroy', function () {
		dragAndDropBankFileLines.destroy()
		dragAndDropComplexTransactionLines.destroy()
		dragAndDropFields.destroy()
	})
}
