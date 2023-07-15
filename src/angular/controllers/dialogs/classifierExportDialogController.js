/**
 * Created by szhitenev on 08.06.2016.
 */

import attributeTypeService from '../../services/attributeTypeService'

export default function ($scope, $mdDialog, data) {
	var vm = this

	vm.entityType = data.entityType
	vm.item = data.item

	vm.filename = ''



	vm.readyStatus = { content: false }

	vm.cancel = function () {
		$mdDialog.hide({ status: 'disagree' })
	}

	vm.setDownloadLink = function () {
		var link = document.querySelector('.export-classifier-link')

		// "User Attribute for "+"["+entity_Name+"]"+": " + user_attribute_id +" ("+user_attribute_full_name+")"

		var entityTypeBeauty = vm.entityType
			.split('-')
			.join(' ')
			.capitalizeFirstLetter()

		var text =
			'User Attribute for ' +
			entityTypeBeauty +
			': ' +
			vm.item.user_code +
			' (' +
			vm.item.name +
			')\n'

		vm.classifier.classifiers.forEach(function (item) {
			text = text + item.name + '\n'
		})

		var file = new Blob([text], { type: 'text/plain' })

		link.href = URL.createObjectURL(file)

		link.addEventListener('click', function () {
			if (vm.filename) {
				link.download = vm.filename + '.csv'
			} else {
				link.download = 'classifiers.csv'
			}

			$mdDialog.hide()
		})
	}

	vm.getClassifier = function () {
		vm.readyStatus.content = false

		attributeTypeService
			.getByKey(vm.entityType, vm.item.id)
			.then(function (data) {
				vm.classifier = data

				vm.readyStatus.content = true

				$scope.$apply()

				vm.setDownloadLink()
			})
	}

	vm.init = function () {
		vm.getClassifier()
	}

	vm.init()
}
