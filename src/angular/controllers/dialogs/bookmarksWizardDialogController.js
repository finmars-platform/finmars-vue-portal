/**
 * Created by szhitenev on 06.02.2017.
 */

import logService from '@/angular/core/services/logService'
import bookmarkService from '../../services/bookmarkService'

export default function ($scope, $mdDialog) {
	var vm = this

	logService.controller('BookmarksWizardDialogController', 'initialized')

	vm.deletedNodes = []
	vm.bookmarks = []

	bookmarkService.getList().then(function (data) {
		function setText(item) {
			item.text = item.name
			item.type = 'default'
			if (item.children.length) {
				item.type = 'folder'
			}
			item.children = item.children.map(setText)
			return item
		}

		vm.bookmarks = data.results
		var items = data.results.map(setText)

		$('#jstree_demo').jstree({
			core: {
				animation: 0,
				check_callback: true,
				themes: { stripes: true },
				data: [
					{
						text: 'Bookmark panel',
						state: { opened: true, selected: true },
						children: items,
					},
				],
			},
			types: {
				'#': {
					valid_children: ['Bookmark panel'],
				},
				'Bookmark panel': {
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
			plugins: ['dnd', 'search', 'state', 'types', 'wholerow'],
		})
		$scope.$apply()
	})

	vm.createNode = function ($event) {
		var ref = $('#jstree_demo').jstree(true),
			sel = ref.get_selected()

		$mdDialog
			.show({
				controller: 'SelectLayoutDialogController as vm',
				templateUrl: 'views/dialogs/select-layout-dialog-view.html',
				parent: angular.element(document.body),
				targetEvent: $event,
				preserveScope: true,
				autoWrap: true,
				skipHide: true,
				multiple: true,
				locals: {
					options: {
						dialogTitle: 'UI layouts',
					},
				},
			})
			.then(function (res) {
				if (res.status === 'agree') {
					ref.set_type(sel, 'folder')
					sel = sel[0]

					sel = ref.create_node(sel, {
						type: 'default',
					})

					$('#jstree_demo').jstree(true).get_node(sel).a_attr.state =
						res.data.state
					$('#jstree_demo').jstree(true).get_node(sel).a_attr.list_layout =
						res.data.listLayoutId

					//"list_layout": res.data.listLayoutId,
					//    "state": res.data.state

					if (sel) {
						ref.edit(sel)
					}
				}
			})
	}

	vm.editNode = function ($event) {
		var ref = $('#jstree_demo').jstree(true),
			sel = ref.get_selected(true)

		$mdDialog
			.show({
				controller: 'BookmarksEditSelectedDialogController as vm',
				templateUrl: 'views/dialogs/bookmarks-edit-selected-dialog-view.html',
				targetEvent: $event,
				autoWrap: true,
				multiple: true,
				locals: {
					data: {
						a_attr: sel[0].a_attr,
						id: sel[0].id,
						children: sel[0].children,
						original: sel[0].original,
						text: sel[0].text,
					},
				},
			})
			.then(function (res) {
				if (res.status === 'agree') {
					//check if new layout is not the same
					if (
						res.item.a_attr.list_layout &&
						res.item.a_attr.list_layout !== sel[0].original.list_layout
					) {
						sel[0].a_attr.state = res.item.a_attr.state
						sel[0].a_attr.list_layout = res.item.a_attr.list_layout
					}

					$('#jstree_demo').jstree(true).rename_node(sel, res.item.text)
				}
			})
	}

	vm.deleteNode = function () {
		var ref = $('#jstree_demo').jstree(true),
			sel = ref.get_selected()
		if (!sel.length) {
			return false
		}

		var delBookmarkId = parseInt(sel, 10)

		// Check if bookmark to delete recorded on server
		var i
		for (i = 0; i < vm.bookmarks.length; i++) {
			if (vm.bookmarks[i].id === delBookmarkId) {
				vm.deletedNodes.push(sel)
				break
			} else if (
				vm.bookmarks[i].children &&
				vm.bookmarks[i].children.length > 0
			) {
				var bookmarkChildren = vm.bookmarks[i].children

				var a
				for (a = 0; a < bookmarkChildren.length; a++) {
					if (bookmarkChildren[a].id === delBookmarkId) {
						bookmarkChildren.splice(a, 1)
						break
					}
				}
			}
		}

		ref.delete_node(sel)
	}

	vm.agree = function () {
		var ref = $('#jstree_demo').jstree(true)
		var data = ref.get_json('#')
		console.log('ref', data)

		var promisesDel = []

		vm.deletedNodes.forEach(function (itemId) {
			promisesDel.push(bookmarkService.deleteByKey(itemId))
		})

		Promise.all(promisesDel).then(function () {
			var promises = []

			data[0].children.forEach(function (item) {
				item.name = item.text

				if (!item.hasOwnProperty('children')) {
					item.children = []
				}

				item.children.forEach(function (subItem) {
					subItem.name = subItem.text
				})

				if (isNaN(parseInt(item.id, 10))) {
					item.list_layout = item.a_attr.list_layout
					item.data.state = item.a_attr.state
					delete item.id

					item.children.forEach(function (subItem) {
						console.log('subItem CREATE', subItem)

						if (isNaN(parseInt(subItem.id, 10))) {
							subItem.list_layout = subItem.a_attr.list_layout
							subItem.data.state = subItem.a_attr.state
							delete subItem.id
						}
					})

					promises.push(bookmarkService.create(item))
				} else {
					// Check if bookmark has been updated
					if (!isNaN(item.a_attr.list_layout)) {
						item.list_layout = item.a_attr.list_layout
						item.data.state = item.a_attr.state
					}
					// < Check if bookmark has been updated >

					// Editing bookmarks inside menu
					item.children.forEach(function (subItem) {
						if (isNaN(parseInt(subItem.id, 10))) {
							subItem.list_layout = subItem.a_attr.list_layout
							subItem.data.state = subItem.a_attr.state
							delete subItem.id
						} else if (!isNaN(subItem.a_attr.list_layout)) {
							subItem.list_layout = subItem.a_attr.list_layout
							subItem.data.state = subItem.a_attr.state
						}
					})
					// < Editing bookmark inside menu >

					promises.push(bookmarkService.update(item.id, item))
				}
			})

			Promise.all(promises).then(function () {
				$mdDialog.hide({ status: 'agree', data: {} })
			})
		})
	}

	vm.cancel = function () {
		$mdDialog.hide({ status: 'disagree' })
	}
}
