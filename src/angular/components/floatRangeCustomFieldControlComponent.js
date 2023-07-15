/**
 * Created by szhitenev on 20.02.2017.
 */

var controller = function () {


	var vm = this

	vm.inputIsFocused = false

	vm.syncActiveItem = function (item, $index) {
		vm.items[$index + 1].value_left = item.value_right
	}

	vm.checkRange = function (item, $index) {
		if (parseFloat(item.value_left) > parseFloat(item.value_right)) {
			item.value_right = parseFloat(item.value_left) + 1
			vm.items[$index + 1].value_left = item.value_right
		}

		vm.inputIsFocused = false
	}

	vm.addRange = function (item, $index) {
		vm.inputIsFocused = true

		var newRange

		vm.items.forEach(function (item) {
			item.is_active = false
		})

		if (vm.items.length == 1) {
			newRange = {
				value_left: '',
				value_right: vm.items[$index].value_right,
				___group_name: 'Group ' + (vm.items.length + 1),
				is_active: false,
			}

			item.is_active = true
			item.value_right = ''

			vm.items.splice($index + 1, 0, newRange)
		} else {
			if (vm.items.length - 1 == $index) {
				newRange = {
					value_left: '',
					value_right: 'inf',
					___group_name: 'Group ' + (vm.items.length + 1),
					is_active: false,
				}

				vm.items.splice($index + 1, 0, newRange)

				vm.items[$index].value_right = ''
				vm.items[$index].is_active = true
			} else {
				newRange = {
					value_left: vm.items[$index].value_right,
					value_right: parseFloat(vm.items[$index + 1].value_left) + 1,
					___group_name: 'Group ' + (vm.items.length + 1),
					is_active: true,
				}

				vm.items[$index + 1].value_left = newRange.value_right + 1

				vm.items.splice($index + 1, 0, newRange)
			}
		}


	}

	vm.removeRange = function ($index) {
		vm.inputIsFocused = true

		if (vm.items.length - 1 == $index) {
			vm.items.forEach(function (item) {
				item.is_active = false
			})

			if (vm.items.length == 3) {
				vm.items[0].is_active = true
			} else {
				vm.items[$index - 1].is_active = true
			}

			vm.items[$index - 1].value_right = 'inf'

			vm.items.splice($index, 1)
		} else {
			vm.items.forEach(function (item) {
				item.is_active = false
			})

			vm.items[$index - 1].is_active = true

			vm.items.splice($index, 1)
		}
	}
}

export default {
	bindings: {
		items: '=',
	},
	templateUrl:
		'views/components/float-range-custom-field-control-component.html',
	controller: controller,
}
