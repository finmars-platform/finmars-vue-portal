/**
 * Created by mevstratov on 08.10.2019.
 */

export default function ($scope, $mdDialog, data) {
	var vm = this

	vm.title = 'Attribute selector'

	if (data.title) {
		vm.title = data.title
	}

	vm.multiselector = !!data.multiselector

	vm.activeGroup = []

	vm.selectedAttributes = []

	vm.currentLevel = 0
	vm.currentPath = []

	vm.currentLocation = '-'
	vm.isReport = data.isReport

	vm.searchTerms = ''

	var previousGroup = []
	var openedGroupNames = []
	var tableAttributes = data.availableAttrs

	vm.tableAttrsTree = {
		name: '-',
		items: [],
	}

	var get_or_create_group = function (item) {
		var itemPathNamePieces = item.name.split('. ')

		if (item.attribute_type) {
			if (item.key.indexOf('pricing_policy_') !== -1) {
				name = itemPathNamePieces.pop()
				itemPathNamePieces.push('Pricing')
				itemPathNamePieces.push(name)
			} else {
				name = itemPathNamePieces.pop()
				itemPathNamePieces.push('User Attributes')
				itemPathNamePieces.push(name)
			}
		}

		var itemLevel = itemPathNamePieces.length

		var groupPathName = itemPathNamePieces.slice()
		groupPathName.pop()
		var groupLevel = itemLevel - 1

		var groupToLook = vm.tableAttrsTree
		var exist

		for (var i = 0; i < groupLevel; i = i + 1) {
			var name = groupPathName[i]
			exist = false

			for (var j = 0; j < groupToLook.items.length; j = j + 1) {
				if (
					groupToLook.items[j].isGroup &&
					groupToLook.items[j].name === name
				) {
					groupToLook = groupToLook.items[j]
					exist = true
					break
				}
			}

			if (!exist) {
				var fullGroupPathName = []

				for (var x = 0; x <= i; x = x + 1) {
					fullGroupPathName.push(groupPathName[x])
				}

				var newGroup = {
					name: groupPathName[i],
					level: i,
					isGroup: true,
					order: 0,
					fullPathName: fullGroupPathName.join(' / '),
					items: [],
				}

				groupToLook.items.push(newGroup)

				groupToLook = newGroup
			}
		}

		return groupToLook
	}

	var divideTableAttrsInGroups = function () {


		var tableAttributesCopy = JSON.parse(JSON.stringify(tableAttributes))

		if (vm.isReport) {
			tableAttributesCopy.forEach(function (item) {
				var itemPathNamePieces = item.name.split('. ')
				var itemLevel = itemPathNamePieces.length

				var group = get_or_create_group(item) // whole magic here

				if (item.attribute_type) {
					itemPathNamePieces.pop() // delete name

					if (item.key.indexOf('pricing_policy_') !== -1) {
						itemPathNamePieces.push('Pricing')
					} else {
						itemPathNamePieces.push('User Attributes')
					}

					itemPathNamePieces.push(item.name) // add name again

					group.items.push({
						attributeObject: item,
						isGroup: false,
						order: 1,
						level: itemLevel,
						name: item.name,
						fullPathName: itemPathNamePieces.join(' / '),
					})
				} else {
					group.items.push({
						attributeObject: item,
						isGroup: false,
						order: 1,
						level: itemLevel,
						name: item.name,
						fullPathName: itemPathNamePieces.join(' / '),
					})
				}
			})
		} else {
			var userAttributesFolder = {
				name: 'User Attributes',
				fullPathName: 'User Attributes',
				order: 0,
				level: 1,
				isGroup: true,
				items: [],
			}

			var pricingFolder = {
				name: 'Pricing',
				fullPathName: 'Pricing',
				order: 0,
				level: 1,
				isGroup: true,
				items: [],
			}

			tableAttributesCopy.forEach(function (item) {
				if (item.attribute_type) {
					if (item.key.indexOf('pricing_policy_') !== -1) {
						pricingFolder.items.push({
							attributeObject: item,
							isGroup: false,
							order: 1,
							level: 2,
							name: item.name,
							fullPathName: 'Pricing / ' + item.name,
						})
					} else {
						userAttributesFolder.items.push({
							attributeObject: item,
							isGroup: false,
							order: 1,
							level: 2,
							name: item.name,
							fullPathName: 'User Attributes / ' + item.name,
						})
					}
				} else {
					vm.tableAttrsTree.items.push({
						attributeObject: item,
						isGroup: false,
						order: 1,
						level: 1,
						name: item.name,
						fullPathName: item.name,
					})
				}
			})

			vm.tableAttrsTree.items.unshift(pricingFolder)
			vm.tableAttrsTree.items.unshift(userAttributesFolder)
		}
	}

	vm.openFromCurrentPath = function (item, $index) {
		vm.currentPath = vm.currentPath.filter(function (item, index) {
			return index <= $index
		})

		vm.currentLevel = vm.currentPath.length

		vm.generateProjection()
	}

	vm.resetCurrentPath = function () {
		vm.currentPath = []
		vm.currentLevel = 0

		vm.generateProjection()
	}

	vm.returnToPrevGroup = function () {
		if (vm.currentPath.length > 0) {
			vm.currentPath.splice(-1, 1)
			vm.currentLevel = vm.currentLevel - 1

			vm.generateProjection()
		}
	}

	vm.searchTermChange = function () {


		vm.currentPath = []
		vm.currentLevel = 0

		vm.generateProjection()
	}

	vm.openGroup = function (item) {
		vm.searchTerms = ''

		vm.currentPath = item.fullPathName.split(' / ')

		vm.currentLevel = vm.currentPath.length

		vm.generateProjection()
	}

	if (vm.multiselector) {
		vm.onAttrClick = function (item) {
			item._active = !item._active

			if (item._active) {
				vm.selectedAttributes.push(item)
			} else {
				const clickedAttrIndex = vm.selectedAttributes.findIndex(
					(attr) => attr.key === item.key
				)
				vm.selectedAttributes.splice(clickedAttrIndex, 1)
			}


		}
	} else {
		vm.onAttrClick = function (item) {
			if (!item._active) {
				if (vm.selectedAttributes.length)
					vm.selectedAttributes[0]._active = false

				// item._active = !item._active;
				item._active = true

				vm.selectedAttributes = [item]
			}


		}
	}

	vm.onAttrDblClick = function (item) {
		vm.onAttrClick(item)
		vm.agree()
	}

	vm.cancel = function () {
		$mdDialog.hide({ status: 'disagree' })
	}

	vm.agree = function () {

		var attributes = vm.selectedAttributes.map(function (item) {
			return item.attributeObject
		})

		if (attributes.length) {
			$mdDialog.hide({
				status: 'agree',
				data: {
					items: attributes,
				},
			})
		} else {
			$mdDialog.hide({ status: 'disagree' })
		}
	}

	vm.convertTreeToFlatList = function (tree) {
		var result = []

		function traverseNode(node) {
			result.push(node)
			node.items.forEach(function (child) {
				if (child.hasOwnProperty('items')) {
					traverseNode(child)
				} else {
					result.push(child)
				}
			})
		}

		traverseNode(tree)

		return result
	}

	vm.getHighlighted = function (value) {
		var inputTextPieces = vm.searchTerms.split(' ')

		var resultValue

		// Regular expression for multiple highlighting case insensitive results
		var reg = new RegExp('(?![^<]+>)(' + inputTextPieces.join('|') + ')', 'ig')

		resultValue = value.replace(reg, '<span class="highlight">$1</span>')

		return resultValue
	}

	vm.generateProjection = function () {
		vm.processing = true
		// Using Promise to add loader animation, while html reflowing when filtering options.
		new Promise(function (resolve, reject) {
			if (vm.searchTerms) {
				// when filtering options

				var items = vm.treeAsList.filter(function (item) {
					return (
						item.name.toLowerCase().indexOf(vm.searchTerms.toLowerCase()) !== -1
					)
				})

				items = items.map(function (item) {
					item.fullPathNameWithHighlight = vm.getHighlighted(item.fullPathName)

					return item
				})

				vm.projection = {
					items: items,
				}


			} else {



				var groupToLook = vm.tableAttrsTree

				for (var i = 0; i <= vm.currentLevel; i = i + 1) {
					var name = vm.currentPath[i]

					groupToLook.items.forEach(function (item) {
						if (item.name === name) {
							groupToLook = item
						}
					})
				}

				vm.projection = groupToLook


			}
			resolve()
		}).then(function () {
			vm.processing = false
			$scope.$apply()
		})
	}

	var init = function () {
		setTimeout(function () {
			vm.dialogElemToResize = document.querySelector(
				'.tableAttrsSelectorElemToResize'
			)
		}, 100)

		divideTableAttrsInGroups()
		vm.treeAsList = vm.convertTreeToFlatList(vm.tableAttrsTree)

		vm.generateProjection()

		// vm.activeGroup = JSON.parse(JSON.stringify(tableAttrsTree));
	}

	init()
}
