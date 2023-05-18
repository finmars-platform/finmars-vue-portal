/**
 * Created by mevstratov on 16.06.2021.
 */

import utilsHelper from '../helpers/utils.helper'

export default function () {
	return {
		require: '^^classifierTree',
		restrict: 'E',
		scope: {
			parent: '=',
			node: '=',
		},
		templateUrl: 'views/directives/classifier-tree-node-view.html',
		link: function (scope, elem, attrs, cTreeVm) {
			scope.selectNode = cTreeVm.selectNode
			scope.toggleNodeFolding = cTreeVm.toggleNodeFolding

			scope.onCancelEdit = function ($event) {
				$event.stopPropagation()

				cTreeVm.onCancelEdit()
			}

			scope.onSaveNode = cTreeVm.onSaveNode
			// scope.editableNode = cTreeVm.editableNode;
			scope.editingNode = cTreeVm.editingNode
			scope.currentEdit = {
				name: '',
			}

			const classifierNodeRowElem = elem[0].querySelector('.classifierNodeRow')

			const focusInput = () => {
				const inputElement = elem[0].querySelector('input.classifier-name')
				inputElement.focus()
			}

			scope.onInputInit = () => {
				scope.currentEdit.name = scope.node.name
				focusInput()
			}

			scope.isSaveDisabled = () => {
				return !scope.currentEdit.name.trim()
			}

			classifierNodeRowElem.addEventListener(
				'dragstart',
				cTreeVm.onNodeDragStart
			)
			classifierNodeRowElem.addEventListener('dragend', cTreeVm.onNodeDragEnd)

			scope.getPathToNodeAsString = function () {
				return scope.node.frontOptions.treePath.join(',')
			}

			scope.callFnForCustomBtn = function ($event, actionData) {
				if (actionData.parameters) {
					actionData.callback($event, scope.node, actionData.parameters)
				} else {
					actionData.callback($event, scope.node)
				}
			}
		},
	}
}
