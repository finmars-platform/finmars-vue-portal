/**
 * Created by szhitenev on 10.12.2020.
 */

export default function ($scope, $mdDialog, data) {
	var vm = this

	vm.layout = data.layout

	vm.cancel = function () {
		vm.clearCanCreateRowStatus()
		vm.clearProxyAccordions()

		$mdDialog.hide({ status: 'disagree' })
	}

	vm.agree = function () {
		vm.clearCanCreateRowStatus()
		vm.clearProxyAccordions()

		$mdDialog.hide({ status: 'agree', data: { layout: vm.layout } })
	}

	vm.clearProxyAccordions = function () {
		vm.layout.data.tabs.forEach(function (tab) {
			if (tab.accordions) {
				tab.accordions = tab.accordions.filter(function (item) {
					return item.type === 'accordion'
				})

				tab.accordions.forEach(function (accordion) {
					delete accordion.type
				})
			}
		})
	}

	vm.updateProxyAccordions = function () {
		vm.layout.data.tabs.forEach(function (tab) {
			if (tab.accordions) {
				var newAccordions = []

				tab.accordions.forEach(function (accordion) {
					accordion.type = 'accordion'
				})

				tab.layout.rows.forEach(function (row, index) {
					var isEmpty = true
					var findedAccordion = null

					tab.accordions.forEach(function (accordion) {
						if (index >= accordion.from && index <= accordion.to) {
							isEmpty = false

							if (index !== accordion.from) {
								findedAccordion = {
									type: 'proxy',
								}
							} else {
								findedAccordion = accordion
							}
						}
					})

					if (isEmpty) {
						newAccordions.push({
							type: 'proxy',
						})
					} else {
						newAccordions.push(findedAccordion)
					}
				})

				tab.accordions = newAccordions
			}
		})
	}

	vm.clearCanCreateRowStatus = function () {
		vm.layout.data.tabs.forEach(function (tab) {
			tab.layout.rows.forEach(function (row) {
				delete row.canCreateAccordion
			})
		})
	}

	vm.updateCanCreateRowStatus = function () {
		vm.clearCanCreateRowStatus()

		vm.layout.data.tabs.forEach(function (tab) {
			var filledRows = []

			if (tab.accordions) {
				tab.accordions.forEach(function (accordion) {
					if (accordion.from === accordion.to) {
						filledRows.push(accordion.from)
					} else {
						for (var i = accordion.from; i <= accordion.to; i = i + 1) {
							filledRows.push(i)
						}
					}
				})
			}

			console.log('filledRows', filledRows)

			tab.layout.rows.forEach(function (row, index) {
				if (filledRows.indexOf(index) === -1) {
					row.canCreateAccordion = true
				} else {
					row.canCreateAccordion = false
				}
			})
		})
	}

	vm.addAccordion = function ($event, tab, row, name, $index) {
		console.log('vm.layout', vm.layout)
		console.log('tab', tab)
		console.log('row', row)

		if (!tab.accordions) {
			tab.accordions = []
		}

		tab.accordions.push({
			name: name,
			index: $index,
			from: $index,
			to: $index,
		})

		delete row.accordionName

		vm.updateCanCreateRowStatus()
		vm.updateProxyAccordions()
	}

	vm.isAccordionOverlapped = function (index, tab) {
		var overlappedIndexes = []

		tab.accordions.forEach(function (accordionItem) {
			for (var i = accordionItem.from; i <= accordionItem.to; i = i + 1) {
				overlappedIndexes.push(i)
			}
		})

		if (overlappedIndexes.indexOf(index) !== -1) {
			return true
		}

		return false
	}

	vm.isNextSlotAnAccordion = function (item, tab) {
		var result = false

		tab.accordions.forEach(function (accordionItem) {
			if (accordionItem.from === item.to + 1) {
				result = true
			}
		})

		return result
	}

	vm.increaseAccordion = function ($event, item) {
		item.to = item.to + 1
		vm.updateCanCreateRowStatus()
		vm.updateProxyAccordions()
	}
	vm.decreaseAccordion = function ($event, item) {
		item.to = item.to - 1
		vm.updateCanCreateRowStatus()
		vm.updateProxyAccordions()
	}

	vm.deleteAccordion = function ($event, tab, $index) {
		tab.accordions.splice($index, 1)

		vm.updateCanCreateRowStatus()
	}

	vm.init = function () {
		console.log(' vm.layout', vm.layout)

		vm.updateCanCreateRowStatus()
		vm.updateProxyAccordions()
	}

	vm.init()
}
