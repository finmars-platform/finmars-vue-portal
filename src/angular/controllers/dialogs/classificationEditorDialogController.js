/**
 * Created by szhitenev on 19.07.2016.
 */

import attributeTypeService from '../../services/attributeTypeService'

import logService from '@/angular/core/services/logService'

export default function ($scope, $mdDialog, data) {
	var vm = this

	logService.controller('ClassificationEditorDialogController', 'initialized')

	vm.classifier = {}

	if (data.classifier) {
		vm.classifier = JSON.parse(JSON.stringify(data.classifier))
	}

	attributeTypeService
		.getByKey(data.entityType, vm.classifier.id)
		.then(function (attrData) {
			vm.classifier = attrData

			function setText(item) {
				item.text = item.name
				item.type = 'default'
				if (item.children.length) {
					item.type = 'folder'
				}
				item.children = item.children.map(setText)
				return item
			}

			//var tree = attrData.classifiers.map(setText);
			var tree = vm.classifier.classifiers.map(setText)

			$('#jstree_demo').jstree({
				core: {
					animation: 0,
					check_callback: true,
					themes: { stripes: true },
					data: [
						{
							text: 'Root',
							state: { opened: true, selected: true },
							children: tree,
						},
					],
				},
				types: {
					'#': {
						valid_children: ['root'],
					},
					root: {
						icon: 'portal/content/img/ic_folder_black_1x.png',
						valid_children: ['default'],
					},
					default: {
						icon: 'portal/content/img/ic_label_outline_black_1x.png',
						valid_children: ['default', 'folder'],
					},
					folder: {
						icon: 'portal/content/img/ic_folder_black_1x.png',
						valid_children: ['default', 'folder'],
					},
				},
				plugins: ['contextmenu', 'dnd', 'search', 'state', 'types', 'wholerow'],
			})
			$scope.$apply()
		})

	vm.createNode = function () {
		var ref = $('#jstree_demo').jstree(true),
			sel = ref.get_selected()
		ref.set_type(sel, 'folder')
		sel = sel[0]
		sel = ref.create_node(sel, { type: 'default' })
		if (sel) {
			ref.edit(sel)
		}
	}
	vm.renameNode = function ($event) {
		$mdDialog
			.show({
				controller: 'WarningDialogController as vm',
				templateUrl: 'views/dialogs/warning-dialog-view.html',
				targetEvent: $event,
				preserveScope: true,
				multiple: true,
				autoWrap: true,
				skipHide: true,
				locals: {
					warning: {
						title: 'Warning!',
						description:
							'If you rename a classifier your classifier mappings will change too.',
					},
				},
			})
			.then(function (res) {
				if (res.status === 'agree') {
					var ref = $('#jstree_demo').jstree(true),
						sel = ref.get_selected()
					if (!sel.length) {
						return false
					}
					sel = sel[0]
					ref.edit(sel)
				}
			})
	}

	vm.deleteNode = function () {
		var ref = $('#jstree_demo').jstree(true),
			sel = ref.get_selected()
		if (!sel.length) {
			return false
		}
		ref.delete_node(sel)
	}

	vm.agree = function () {

		var ref = $('#jstree_demo').jstree(true)
		var data = ref.get_json('#')



		vm.classifier.children = data[0].children
		$mdDialog.hide({ status: 'agree', data: { classifier: vm.classifier } })
	}

	vm.cancel = function () {
		$mdDialog.hide({ status: 'disagree' })
	}
}
