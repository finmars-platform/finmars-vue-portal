/**
 * Created by szhitenev on 30.05.2016.
 */

import configurationService from '../../services/configurationService'

export default function ($scope, $mdDialog, metaContentTypesService, file) {
	var vm = this

	vm.readyStatus = { content: false }

	vm.selectAllState = false

	vm.getFile = function () {
		configurationService.getMappingData().then(function (data) {


			vm.file = data

			vm.items = data.body

			vm.items.forEach(function (parent) {
				parent.content = parent.content.filter(function (child) {
					if (child.hasOwnProperty('user_code') && child.user_code === '-') {
						return false
					}

					if (child.hasOwnProperty('user_code') && child.user_code === '-') {
						return false
					}

					return true
				})
			})

			vm.readyStatus.content = true

			$scope.$apply()
		})
	}

	vm.toggleSelectAll = function () {
		vm.selectAllState = !vm.selectAllState
		vm.items.forEach(function (item) {
			item.someChildsActive = undefined
			item.active = vm.selectAllState

			item.content.forEach(function (child) {
				child.active = vm.selectAllState
			})
		})
	}

	vm.checkSelectAll = function () {
		var active = true

		vm.items.forEach(function (item) {
			if (!item.active) {
				active = false
			}

			item.content.forEach(function (child) {
				if (!child.active) {
					active = false
				}
			})
		})

		vm.selectAllState = active
	}

	vm.getEntityName = function (item) {
		return metaContentTypesService.getEntityNameByContentType(item.entity)
	}

	vm.getItemName = function (item) {
		if (item.hasOwnProperty('user_code')) {
			return item.user_code
		}

		if (item.hasOwnProperty('name')) {
			if (item.hasOwnProperty('csv_fields')) {
				return (
					item.name +
					' (' +
					metaContentTypesService.getEntityNameByContentType(
						item.content_type
					) +
					')'
				)
			}

			return item.name
		}

		if (item.hasOwnProperty('content_type')) {
			return metaContentTypesService.getEntityNameByContentType(
				item.content_type
			)
		}

		if (item.hasOwnProperty('user_code')) {
			return item.user_code
		}

		if (item.hasOwnProperty('last_run_at')) {
			// import.pricingautomatedschedule
			return 'Schedule'
		}
	}

	vm.toggleActiveForChilds = function (item) {
		item.active = !item.active
		item.someChildsActive = undefined
		item.content.forEach(function (child) {
			child.active = item.active
		})

		vm.checkSelectAll()
	}
	vm.updateActiveForParent = function (child, parent) {
		child.active = !child.active

		var ChildIsActive = false
		var ChildIsNotActive = false
		var parentIsActive = false

		parent.content.forEach(function (item, itemIndex) {
			if (item.active === true) {
				ChildIsActive = true
			} else {
				ChildIsNotActive = true
			}
			if (itemIndex == parent.content.length - 1) {
				if (ChildIsActive && !ChildIsNotActive) {
					parentIsActive = true
				} else if (!ChildIsActive && ChildIsNotActive) {
					parent.someChildsActive = undefined
				} else {
					parentIsActive = false
					parent.someChildsActive = 'some-checkboxes-ticked'
				}
			}
		})

		parent.active = parentIsActive

		vm.checkSelectAll()
	}

	vm.getEntityDependenciesCaptions = function (entity) {
		var result = ''

		if (entity.dependencies && entity.dependencies.length) {
			result = result + '(Depends on: '

			var dependenciesList = []

			entity.dependencies.forEach(function (dependency) {
				dependenciesList.push(
					metaContentTypesService.getEntityNameByContentType(dependency.entity)
				)
			})

			result = result + dependenciesList.join(', ')

			result = result + ')'
		}

		return result
	}

	vm.exportConfiguration = function (items) {
		return new Promise(function (resolve, reject) {
			var results = []

			vm.items.forEach(function (item) {
				var result = {
					entity: item.entity,
					content: [],
					dependencies: item.dependencies,
					count: 0,
				}

				item.content.forEach(function (child) {
					if (child.active) {
						result.content.push(child)
					}
				})

				result.count = result.content.length

				if (result.count > 0) {
					results.push(result)
				}
			})

			vm.file.body = [
				{
					section_name: 'mappings',
					items: results,
				},
			]

			var resultFile = JSON.stringify(vm.file)

			var a = document.getElementById('exportButton')
			var result = new File([resultFile], { type: 'text/json;charset=utf-8' })

			a.href = URL.createObjectURL(result)
			a.download = vm.filename ? vm.filename + '.fcfg' : 'mapping.fcfg'

			resolve(vm.file)
		})
	}

	vm.agree = function ($event) {
		vm.exportConfiguration(vm.items).then(function (data) {
			$mdDialog.hide({ status: 'agree', data: {} })
		})
	}

	vm.cancel = function () {
		$mdDialog.hide({ status: 'disagree' })
	}

	vm.init = function () {
		vm.getFile()
	}

	vm.init()
}
