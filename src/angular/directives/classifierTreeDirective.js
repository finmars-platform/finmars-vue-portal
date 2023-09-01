/**
 * Created by mevstratov on 17.06.2021.
 */

import metaHelper from '../helpers/meta.helper'
// import utilsHelper from '../helpers/utils.helper';
import classifierEvents from '../services/events/classifierEvents'

export default function () {
	return {
		restrict: 'E',
		scope: {
			treeData: '=', // tree data that will be send to server
			activeNodeId: '<',
			classifierTreeEventService: '=',
			multiselector: '@',

			onEditNodeCancel: '&?',
			onActiveNodesChangeCallback: '&?',
		},
		templateUrl: 'views/directives/classifier-tree-view.html',
		controllerAs: 'vm',
		controller: [
			'$scope',
			function СlassifierTreeController($scope) {
				let vm = this
				/** Tree data to render classifier tree */
				// vm.filteredTree = JSON.parse(angular.toJson($scope.treeData));
				vm.filteredTree = metaHelper.recursiveDeepCopy($scope.treeData, true)

				vm.treeFilterTerms = ''
				vm.isMultiselector = $scope.multiselector === 'true'
				vm.editingNode = false
				vm.nodeInEditMode = null

				let activeNode = null

				const treeElement = document.querySelector('.classifierTree')
				/* const getNodeByParents = (tree, idsList) => {

					let node = tree.find(node => node.id === idsList[0]);

					idsList.forEach(nodeId => {
						node = node.children.find(childNode => childNode.id === nodeId);
					});

					tree.find(node => node.id === idsList[0]);

				}; */
				const nodesAreTheSame = function (node, otherNodeData) {
					let otherNodeId = otherNodeData

					if (otherNodeData && typeof otherNodeData === 'object') {
						if (otherNodeData.id || otherNodeData.id === 0) {
							otherNodeId = otherNodeData.id
						} else {
							otherNodeId = otherNodeData.frontOptions.id
						}
					}

					if (node.id || node.id === 0) {
						return node.id === otherNodeId
					} else if (node.frontOptions.id) {
						return node.frontOptions.id === otherNodeId
					}

					return false
				}

				const getNode = (tree, idsList) => {
					const eldestParentId = isNaN(idsList[0])
						? idsList[0]
						: parseInt(idsList[0])
					let node = tree.find((childNode) =>
						nodesAreTheSame(childNode, eldestParentId)
					)
					const idsListWithoutEldest = idsList.slice(1)

					idsListWithoutEldest.forEach((nodeId) => {
						const parsedNodeId = isNaN(nodeId) ? nodeId : parseInt(nodeId)
						node = node.children.find((childNode) =>
							nodesAreTheSame(childNode, parsedNodeId)
						)
					})

					return node
				}

				const getParentNode = (tree, node) => {
					if (node.level === 0) return null

					const pathToParent = node.frontOptions.pathToNode.slice(0, -1)
					return getNode(tree, pathToParent)
				}

				const getAllParentsOfNode = (tree, node) => {
					let parents = []

					let parentNode = getParentNode(tree, node)
					let nodeHasAParent =
						parentNode && parentNode.frontOptions.pathToNode.length

					// parents.push(parentNode);

					while (nodeHasAParent) {
						parents.push(parentNode)

						parentNode = getParentNode(tree, parentNode)
						nodeHasAParent =
							parentNode && parentNode.frontOptions.pathToNode.length
					}

					return parents
				}

				const deleteNodeFromTree = (tree, node) => {
					if (node.level > 0) {
						const parent = getParentNode(tree, node)

						const nodeIndex = parent.children.findIndex((childNode) =>
							nodesAreTheSame(childNode, node)
						)

						if (nodeIndex > -1) {
							parent.children.splice(nodeIndex, 1)
						} else {
							console.error('Node for deletion not found', {
								node_to_delete: node,
								delete_inside: parent,
							})
						}
					} else {
						// delete from root

						const nodeIndex = tree.findIndex((childNode) =>
							nodesAreTheSame(childNode, node)
						)

						if (nodeIndex > -1) {
							tree.splice(nodeIndex, 1)
						} else {
							console.error('Node for deletion not found', {
								node_to_delete: node,
								delete_inside: tree,
							})
						}
					}
				}
				/**
				 * Remove node from original tree and filtered tree.
				 * @param node {Object}
				 */
				const removeNode = function (node) {
					deleteNodeFromTree($scope.treeData, node) // delete node in original tree
					deleteNodeFromTree(vm.filteredTree, node) // delete node inside classifier directive tree
				}
				/**
				 *
				 * @param tree {Object}
				 * @param node {Object} - node with updated pathToNode
				 */
				/* const moveNodeInsideTree = (tree, node, newPathToNode) => {

					node.frontOptions.pathToNode = newPathToNode;

					const newParent = getParentNode(tree, node);

					const nodeIndex = newParent.children.findIndex(childNode => childNode.id === node.id);

				}; */

				const getActiveNode = (tree) => {
					for (let node of tree) {
						if (node.frontOptions.isActive) {
							return node
						}

						if (node.children.length > 0) {
							const activeNode = getActiveNode(node.children)
							if (activeNode) {
								return activeNode
							}
						}
					}

					return null
				}

				const filterNode = (node, filterTerms) => {
					const nodeToFilter = metaHelper.recursiveDeepCopy(node, true)
					let nodeValuesPassesFilter = false

					if (nodeToFilter.name) {
						const nodeName = nodeToFilter.name.toLowerCase()
						nodeValuesPassesFilter = nodeName.includes(filterTerms)
					}

					if (nodeToFilter.children && nodeToFilter.children.length) {
						nodeToFilter.children = nodeToFilter.children
							.map((childNode) => {
								return filterNode(childNode, filterTerms)
							})
							.filter((childNode) => childNode)
					}

					const childrenOfNodePassFilter = !!(
						nodeToFilter.children && nodeToFilter.children.length
					)

					if (nodeValuesPassesFilter || childrenOfNodePassFilter)
						return nodeToFilter

					return null
				}

				vm.filterTree = function (filterTerms) {
					vm.filteredTree = metaHelper.recursiveDeepCopy($scope.treeData, true)

					if (filterTerms) {
						filterTerms = filterTerms.toLowerCase()

						vm.filteredTree = vm.filteredTree
							.map((node) => {
								return filterNode(node, filterTerms)
							})
							.filter((node) => node)
					}

					if (activeNode) activeNode = getActiveNode(vm.filteredTree)
				}

				/* const getNearestParentOfNode = (tree, node) => {

					const parentPath = node.frontOptions.treePath.slice(0, -2);

					return metaHelper.getObjectNestedPropVal(tree, parentPath);

				};

				const getParentsOfNode = (tree, node) => {

					const nodeHasParents = node.frontOptions.treePath.length >= 3;

					if (nodeHasParents) {

						const parent = getNearestParentOfNode(tree, node);

						return [parent, ...getParentsOfNode(tree, parent)];

					}

					return [];

				}; */

				const selectNode = function (clickedNode) {
					if (vm.editingNode) {
						return
					}

					if (activeNode) {
						// current activeNode

						activeNode.frontOptions.isActive = false
						// In case tree filter is active, update original tree
						// const activeNodeFromOriginalTree = metaHelper.getObjectNestedPropVal($scope.treeData, activeNode.frontOptions.treePath);
						const activeNodeFromOriginalTree = getNode(
							$scope.treeData,
							activeNode.frontOptions.pathToNode
						)
						activeNodeFromOriginalTree.frontOptions.isActive = false

						// const parents = getParentsOfNode(vm.filteredTree, activeNode);
						const parents = getAllParentsOfNode(vm.filteredTree, activeNode)
						parents.forEach((node) => {
							node.frontOptions.hasActiveChild = false
						})
					}

					if (activeNode !== clickedNode) {
						clickedNode.frontOptions.isActive = true
						// In case tree filter is active, update original tree
						// const nodeFromOriginalTree = metaHelper.getObjectNestedPropVal($scope.treeData, clickedNode.frontOptions.treePath);
						const nodeFromOriginalTree = getNode(
							$scope.treeData,
							clickedNode.frontOptions.pathToNode
						)
						nodeFromOriginalTree.frontOptions.isActive = true

						activeNode = clickedNode

						// const parents = getParentsOfNode(vm.filteredTree, activeNode);
						const parents = getAllParentsOfNode(vm.filteredTree, activeNode)
						parents.forEach((node) => {
							node.frontOptions.hasActiveChild = true
						})

						if ($scope.onActiveNodesChangeCallback) {
							const activeNodesList = nodeFromOriginalTree
								? [nodeFromOriginalTree]
								: []
							$scope.onActiveNodesChangeCallback({
								activeNodesList: activeNodesList,
							})
						}
					} else {
						activeNode = null
						if ($scope.onActiveNodesChangeCallback) {
							const activeNodesList = []
							$scope.onActiveNodesChangeCallback({
								activeNodesList: activeNodesList,
							})
						}
					}
				}

				vm.selectNode = selectNode

				const getShadowClass = (elem) => {
					const noScroll = elem.scrollHeight - elem.clientHeight <= 0

					if (noScroll) {
						return ''
					}

					if (elem.scrollTop === 0) {
						return 'bottom-shadow'
					}

					const scrollBottom =
						elem.scrollHeight - elem.clientHeight - elem.scrollTop

					if (scrollBottom <= 0) {
						return 'top-shadow'
					}

					return 'shadow'
				}

				let currentShadow

				const applyShadow = () => {
					const shadow = getShadowClass(treeElement)

					if (currentShadow !== shadow) {
						if (currentShadow) treeElement.classList.remove(currentShadow)
						if (shadow) treeElement.classList.add(shadow)

						currentShadow = shadow
					}
				}

				vm.toggleNodeFolding = function ($event, clickedNode) {
					$event.stopPropagation()

					clickedNode.frontOptions.closed = !clickedNode.frontOptions.closed

					const originalNode = getNode(
						$scope.treeData,
						clickedNode.frontOptions.pathToNode
					)
					originalNode.frontOptions.closed = clickedNode.frontOptions.closed

					setTimeout(() => applyShadow())
				}

				const getFirstActiveNodeFromTree = (tree) => {
					for (const node of tree) {
						if (node.frontOptions.isActive) {
							return node
						}
						if (node.children.length) {
							const activeChild = getFirstActiveNodeFromTree(node.children)
							if (activeChild) {
								return activeChild
							}
						}
					}
					return null
				}

				let addition = false

				const onAddNode = (data) => {
					addition = true

					const parentNodeFromOriginalTree = data.activeNodes[0]
					const tmpNodeId = metaHelper.generateUniqueId('classifierNodeId')

					// const parentNode = parentNodeFromOriginalTree ? metaHelper.getObjectNestedPropVal(vm.filteredTree, parentNodeFromOriginalTree.frontOptions.treePath) : null;
					const parentNode = parentNodeFromOriginalTree
						? getNode(
								vm.filteredTree,
								parentNodeFromOriginalTree.frontOptions.pathToNode
						  )
						: null
					const level = parentNode ? parentNode.level + 1 : 0
					const order = parentNode
						? parentNode.children.length
						: vm.filteredTree.length
					// const treePath = parentNode ? parentNode.frontOptions.treePath.concat(['children', order]) : [order];
					const pathToNode = parentNode
						? parentNode.frontOptions.pathToNode.concat([tmpNodeId])
						: [tmpNodeId]

					const newNode = {
						// id: '',
						name: '',
						level: level,
						children: [],
						order: order,
						frontOptions: {
							// treePath: treePath,
							pathToNode: pathToNode,
							hasActiveChild: false,
							closed: level > 0,
							editOn: true,
							id: tmpNodeId,
						},
					}

					const newNodeForOriginalTree = metaHelper.recursiveDeepCopy(newNode)

					if (parentNode) {
						parentNode.children.push(newNode)
						parentNode.frontOptions.closed = false

						parentNodeFromOriginalTree.children.push(newNodeForOriginalTree)
						parentNodeFromOriginalTree.frontOptions.closed = false
					} else {
						vm.filteredTree.push(newNode)
						$scope.treeData.push(newNodeForOriginalTree)
					}

					vm.editingNode = true
					vm.nodeInEditMode = newNode
				}

				const onEditNode = () => {
					if (!activeNode) {
						return
					}

					vm.nodeInEditMode = activeNode
					vm.nodeInEditMode.frontOptions.editOn = true
					vm.editingNode = true
				}

				vm.onSaveNode = function ($event, newName) {
					$event.stopPropagation()

					vm.editingNode = false
					let changeActions = addition ? 'add' : 'edit'
					addition = false
					vm.nodeInEditMode.frontOptions.editOn = false

					// const nodeFromOriginalTree = metaHelper.getObjectNestedPropVal($scope.treeData, vm.nodeInEditMode.frontOptions.treePath);
					const nodeFromOriginalTree = getNode(
						$scope.treeData,
						vm.nodeInEditMode.frontOptions.pathToNode
					)

					if (nodeFromOriginalTree.name !== newName) {
						nodeFromOriginalTree.name = newName
						vm.nodeInEditMode.name = newName

						vm.nodeInEditMode = null
						if ($scope.onEditNodeCancel) $scope.onEditNodeCancel()

						$scope.classifierTreeEventService.dispatchEvent(
							classifierEvents.CLASSIFIER_TREE_CHANGED,
							{ action: changeActions }
						)
					} else {
						vm.nodeInEditMode = null
						if ($scope.onEditNodeCancel) $scope.onEditNodeCancel()
					}

					// $scope.classifierTreeEventService.dispatchEvent(classifierEvents.CANCEL_EDIT_NODE);
				}

				vm.cancelEdit = function () {
					// const nodeFromOriginalTree = metaHelper.getObjectNestedPropVal($scope.treeData,vm.nodeInEditMode.frontOptions.treePath);
					const nodeFromOriginalTree = getNode(
						$scope.treeData,
						vm.nodeInEditMode.frontOptions.pathToNode
					)

					vm.nodeInEditMode.name = nodeFromOriginalTree.name

					if (addition) {
						/* const parentNodeFromOriginalTree = getNearestParentOfNode($scope.treeData, nodeFromOriginalTree);
						const parent = getNearestParentOfNode(vm.filteredTree, vm.nodeInEditMode); */
						const parentNodeFromOriginalTree = getParentNode(
							$scope.treeData,
							nodeFromOriginalTree
						)
						const parent = getParentNode(vm.filteredTree, vm.nodeInEditMode)

						if (Array.isArray(parentNodeFromOriginalTree.children)) {
							parentNodeFromOriginalTree.children.pop()
							parent.children.pop()
						} else {
							// root
							parentNodeFromOriginalTree.pop()
							parent.pop()
						}

						addition = false
					}

					vm.editingNode = false
					vm.nodeInEditMode.frontOptions.editOn = false
					vm.nodeInEditMode = null

					if ($scope.onEditNodeCancel) $scope.onEditNodeCancel()
					// $scope.classifierTreeEventService.dispatchEvent(classifierEvents.CANCEL_EDIT_NODE);
				}

				const cancelEdit = function () {
					// const nodeFromOriginalTree = metaHelper.getObjectNestedPropVal($scope.treeData,vm.nodeInEditMode.frontOptions.treePath);
					const nodeFromOriginalTree = getNode(
						$scope.treeData,
						vm.nodeInEditMode.frontOptions.pathToNode
					)

					vm.nodeInEditMode.name = nodeFromOriginalTree.name

					if (addition) {
						/* const parentNodeFromOriginalTree = getNearestParentOfNode($scope.treeData, nodeFromOriginalTree);
						const parent = getNearestParentOfNode(vm.filteredTree, vm.nodeInEditMode); */
						const parentNodeFromOriginalTree = getParentNode(
							$scope.treeData,
							nodeFromOriginalTree
						)
						const parent = getParentNode(vm.filteredTree, vm.nodeInEditMode)

						if (Array.isArray(parentNodeFromOriginalTree.children)) {
							parentNodeFromOriginalTree.children.pop()
							parent.children.pop()
						} else {
							// root
							parentNodeFromOriginalTree.pop()
							parent.pop()
						}

						addition = false
					}

					vm.editingNode = false
					vm.nodeInEditMode.frontOptions.editOn = false
					vm.nodeInEditMode = null
				}

				/** Used by classifierTreeNodeDirective */
				vm.onCancelEdit = function () {
					cancelEdit()
					if ($scope.onEditNodeCancel) $scope.onEditNodeCancel()
					// $scope.classifierTreeEventService.dispatchEvent(classifierEvents.CANCEL_EDIT_NODE);
				}

				/**
				 * Update properties "order" and "frontOptions.treePath" of children nodes.
				 *
				 * @param parentNode {Object}
				 */
				/* const updatePathsOfChildrenNodes = function (parentNode) {

					return parentNode.children.map((cNode, index) => {

						cNode.order = index;
						cNode.frontOptions.treePath = parentNode.frontOptions.treePath.concat(['children', cNode.order]);

						if (cNode.children.length) cNode.children = updatePathsOfChildrenNodes(cNode);

						return cNode;

					});

				}; */
				/**
				 * Update properties "order" and "frontOptions.treePath" of all tree nodes.
				 *
				 * @param root
				 * @returns Array<Object> - list of nodes
				 */
				/* const updatePathsOfAllNodes = function (root) {

					return root.map((cNode, index) => {

						cNode.order = index;
						cNode.frontOptions.treePath = [cNode.order];

						if (cNode.children.length) cNode.children = updatePathsOfChildrenNodes(cNode);

						return cNode;

					});

				}; */
				/**
				 * Removes node from original and from directive's tree.
				 *
				 * @param node {Object}
				 */
				/* const removeNode = function (node) {

					let parent = getNearestParentOfNode(vm.filteredTree, node);
					// const parent = getNearestParentOfNode(vm.filteredTree, node);

					metaHelper.deletePropertyByPath($scope.treeData, node.frontOptions.treePath); // delete node in original tree
					metaHelper.deletePropertyByPath(vm.filteredTree, node.frontOptions.treePath);  // delete node inside classifier directive tree

					if (Array.isArray(parent)) {

						if (!parent.length) return;

						$scope.treeData = updatePathsOfAllNodes(parent);
						vm.filteredTree = JSON.parse(angular.toJson($scope.treeData));

					} else {

						if (!parent.children.length) return;

						parent.children = updatePathsOfChildrenNodes(parent);

						metaHelper.setObjectNestedPropVal($scope.treeData, parent.frontOptions.treePath, parent);
						metaHelper.setObjectNestedPropVal(vm.filteredTree, parent.frontOptions.treePath, parent);

					}

					return vm.filteredTree;

				}; */

				const onDeleteNode = () => {
					/* const nodeFromOriginalTree = metaHelper.getObjectNestedPropVal($scope.treeData, activeNode.frontOptions.treePath)
					metaHelper.deletePropertyByPath($scope.treeData, activeNode.frontOptions.treePath); // delete node in original tree
					metaHelper.deletePropertyByPath(vm.filteredTree, activeNode.frontOptions.treePath)  // delete node in filtered tree */
					// vm.filteredTree = removeNode(activeNode);
					removeNode(activeNode)

					const parents = getAllParentsOfNode(vm.filteredTree, activeNode)
					parents.forEach((node) => {
						node.frontOptions.hasActiveChild = false
					})

					activeNode = null

					$scope.classifierTreeEventService.dispatchEvent(
						classifierEvents.CLASSIFIER_TREE_CHANGED,
						{ action: 'delete' }
					)
				}

				const redrawTree = function () {
					vm.filteredTree = metaHelper.recursiveDeepCopy($scope.treeData, true)
					activeNode = getFirstActiveNodeFromTree(vm.filteredTree)

					if (vm.treeFilterTerms) vm.filterTree(vm.treeFilterTerms)

					applyShadow()
				}

				const onTreeChangedFromOutside = function () {
					redrawTree()
					vm.editingNode = false
				}

				const emptyFilter = function () {
					vm.treeFilterTerms = ''
				}

				//region Node drag and drop
				let dropInbetweenElemsList = []
				let nodeDropElemsList = []
				let draggedOverElem, doeParentNodeElem

				/* const onNodeDragenter = function (ev) {
					// const nodeRowElem = ev.target.parentNode; // .classifierNode
					dndHoverOverElem = ev.target.parentNode; // .classifierNode
					dndHoverOverElem.classList.add('dnd-mouse-hover');
				}; */

				/* const onNodeDragleave = function (ev) {
					/!* const nodeRowElem = ev.target.parentNode; // .classifierNode
					nodeRowElem.classList.remove('dnd-mouse-hover'); *!/
					dndHoverOverElem.classList.remove('dnd-mouse-hover');
				};

				const onDropInbetweenDragenter = function (ev) {
					// const inbetweenElem = ev.target;
					dndHoverOverElem = ev.target; // .dropAtTheBeginning or .dropAfterNode
					dndHoverOverElem.classList.add('dnd-mouse-hover');
				}; */

				const onDragOver = function (ev) {
					const targetElem = ev.target
					let draggedOverNewElem
					const mouseBetweenNodes =
						targetElem.classList.contains('dropAtTheBeginning') ||
						targetElem.classList.contains('dropAfterNode')

					const nodeElem = targetElem.closest('.classifierNode')

					if (mouseBetweenNodes) {
						draggedOverNewElem = draggedOverElem !== targetElem

						if (draggedOverNewElem) {
							if (draggedOverElem)
								draggedOverElem.classList.remove('dnd-mouse-hover')

							targetElem.classList.add('dnd-mouse-hover')
							draggedOverElem = targetElem

							if (doeParentNodeElem)
								doeParentNodeElem.classList.remove('dnd-mouse-hover-child')

							if (nodeElem) nodeElem.classList.add('dnd-mouse-hover-child')

							doeParentNodeElem = nodeElem
						}
					} else {
						if (doeParentNodeElem) {
							doeParentNodeElem.classList.remove('dnd-mouse-hover-child')
							doeParentNodeElem = null
						}

						if (nodeElem) {
							// mouse over node

							draggedOverNewElem = draggedOverElem !== nodeElem

							if (draggedOverNewElem) {
								if (draggedOverElem)
									draggedOverElem.classList.remove('dnd-mouse-hover')

								nodeElem.classList.add('dnd-mouse-hover')
								draggedOverElem = nodeElem
							}
						} else if (draggedOverElem) {
							// mouse moved outside of tree nodes

							draggedOverElem.classList.remove('dnd-mouse-hover')
							draggedOverElem = null
						}
					}
				}

				/* const onDropInbetweenDragleave = function (ev) {
					const inbetweenElem = ev.target;
					inbetweenElem.classList.remove('dnd-mouse-hover');
				}; */
				/**
				 *
				 * @param nodeToMove {Object}
				 * @param moveTo {Object|Array} - other node or root level
				 * @param leftSiblingNode {Object=}
				 * @returns {boolean}
				 */
				const nodeCanBeMovedToTheLocation = (
					nodeToMove,
					moveTo,
					leftSiblingNode
				) => {
					// index = index || 0;

					const isLocationNew = function (moveToList) {
						/* const leftNode = moveToList[index];
						const rightNode = moveToList[index + 1];
						let isANewLocation = !nodesAreTheSame(nodeToMove, leftNode);

						if (index > 0 && rightNode) {
							isANewLocation = isANewLocation && !nodesAreTheSame(nodeToMove, rightNode);
						} */
						let leftSiblingDifferent = true
						let rightSiblingDifferent = true
						let rightSiblingNode

						if (leftSiblingNode) {
							leftSiblingDifferent = !nodesAreTheSame(
								nodeToMove,
								leftSiblingNode
							)

							const leftSiblingIndex = moveToList.findIndex((childNode) =>
								nodesAreTheSame(childNode, leftSiblingNode)
							)
							rightSiblingNode = moveToList[leftSiblingIndex + 1]
						} else {
							rightSiblingNode = moveToList[0]
						}

						if (rightSiblingNode)
							rightSiblingDifferent = !nodesAreTheSame(
								nodeToMove,
								rightSiblingNode
							)

						return leftSiblingDifferent && rightSiblingDifferent
					}

					if (Array.isArray(moveTo)) {
						// move to the root

						if (moveTo.length > 1) return isLocationNew(moveTo)

						return true
					}

					if (nodeToMove.id === moveTo.id) return false

					//region Check whether moveTo is a child of nodeToMove
					const moveToParents = getAllParentsOfNode(vm.filteredTree, moveTo)
					const parent = moveToParents.find((parent) =>
						nodesAreTheSame(parent, nodeToMove)
					)

					if (!!parent) return false // moveTo is a child of nodeToMove
					//endregion

					if (moveTo.children.length > 1) {
						return isLocationNew(moveTo.children)
					}

					return true
				}
				/**
				 * Change node position inside tree.
				 *
				 * @param nodeToMove {Object}
				 * @param moveTo {Object|Array} - node or root
				 * @param index {number=} - If index not specified, it will be set to the last index of moveTo.
				 */
				const moveNode = function (nodeToMove, moveTo, index) {
					removeNode(nodeToMove)
					// nodeToMove.id; // actually we are creating copy of node
					if (Array.isArray(moveTo)) {
						// moved to root

						if (!index && index !== 0) index = moveTo.length

						nodeToMove.level = 0
						nodeToMove.frontOptions.pathToNode = [nodeToMove.id]

						/* if (index >= moveTo.length) {
							moveTo.push(nodeToMove);

						} else {
							moveTo.splice(index, 0, nodeToMove); // moveTo is vm.filteredTree in this case
						} */
						moveTo.splice(index, 0, nodeToMove) // moveTo is $scope.treeData or vm.filteredTree in this case

						// $scope.treeData.splice(index, 0, nodeToMove);
					} else {
						// move to another node or change order

						if (!index && index !== 0) index = moveTo.children.length

						nodeToMove.level = moveTo.level + 1
						nodeToMove.frontOptions.pathToNode =
							moveTo.frontOptions.pathToNode.concat([nodeToMove.id])
						/*if (index >= moveTo.children.length) {
							moveTo.children.push(nodeToMove);

						} else {
							moveTo.children.splice(index, 0, nodeToMove);
						}*/
						moveTo.children.splice(index, 0, nodeToMove)
						/* const moveToFromOriginalTree = getNode($scope.treeData, moveTo.frontOptions.pathToNode);
						moveToFromOriginalTree.children.splice(index, 0, nodeToMove); */
					}

					redrawTree()
					$scope.$apply()

					$scope.classifierTreeEventService.dispatchEvent(
						classifierEvents.CLASSIFIER_TREE_CHANGED,
						{ action: 'move' }
					)
				}

				const insertNodeAfterAnotherNode = function (
					droppedNode,
					leftSiblingNodePath
				) {
					const leftNode = getNode($scope.treeData, leftSiblingNodePath)

					if (nodesAreTheSame(droppedNode, leftNode)) return // node dropped after itself

					const parent =
						getParentNode($scope.treeData, leftNode) || $scope.treeData
					let nodesList = leftNode.level > 0 ? parent.children : $scope.treeData

					const leftNodeIndex = nodesList.findIndex((childNode) =>
						nodesAreTheSame(childNode, leftNode)
					)
					let moveToIndex = leftNodeIndex + 1

					const dnParentId =
						droppedNode.frontOptions.pathToNode[
							droppedNode.frontOptions.pathToNode.length - 2
						]
					const sameParent =
						(droppedNode.level === 0 && leftNode.level === 0) ||
						dnParentId === parent.id

					if (sameParent) {
						const droppedNodeIndex = nodesList.findIndex((childNode) =>
							nodesAreTheSame(childNode, droppedNode)
						)

						// if droppedNode is located before leftNode, moveToIndex will be one less after removal of droppedNode from it's current place
						if (droppedNodeIndex <= leftNodeIndex) moveToIndex = moveToIndex - 1
					}

					if (nodeCanBeMovedToTheLocation(droppedNode, parent, leftNode)) {
						moveNode(droppedNode, parent, moveToIndex)
					}
				}
				/**
				 * Used to format path to node. If it comes from dataset for example.
				 *
				 * @param pathToNode {string} - path to node from dataset
				 * @returns <Array> - parents ids and id of node itself in the end
				 */
				const getPathToNodeFromString = function (pathToNode) {
					if (!pathToNode) return []

					const pathToNodeAsSubstringsList = pathToNode.split(',')

					return pathToNodeAsSubstringsList.map((nodeId) =>
						Number.isNaN(nodeId) ? nodeId : parseInt(nodeId)
					)
				}

				const onNodeDrop = function (ev) {
					const droppedNodePath = getPathToNodeFromString(
						ev.dataTransfer.getData('pathToNode')
					)
					// const droppedNode = metaHelper.getObjectNestedPropVal(vm.filteredTree, droppedNodePath);
					const droppedNode = getNode($scope.treeData, droppedNodePath)

					if (ev.target.classList.contains('dropAfterNode')) {
						const siblingNodePath = getPathToNodeFromString(
							ev.target.dataset.pathToNode
						)
						insertNodeAfterAnotherNode(droppedNode, siblingNodePath)
					} else if (ev.target.classList.contains('dropAtTheBeginning')) {
						// insertNodeAtTheBeginning(droppedNode, droppedToNodePath);
						// let moveTo = getMoveTo(ev);
						let moveToPath = getPathToNodeFromString(
							ev.target.dataset.pathToNode
						)
						let moveTo = $scope.treeData

						if (moveToPath.length) {
							// not a root level
							// moveToPath = moveToPath.split(',');
							moveTo = getNode($scope.treeData, moveToPath)
						}

						if (nodeCanBeMovedToTheLocation(droppedNode, moveTo)) {
							moveNode(droppedNode, moveTo, 0)
						}
					} else {
						/* else if (ev.target.classList.contains('dropOntoNode')) {

						const droppedToNodeElem = ev.target.closest('.classifierNode');
						const moveToPath = droppedToNodeElem.dataset.pathToNode.split(',');

						let moveTo = getNode(vm.filteredTree, moveToPath);

						if (nodeCanBeMovedToTheLocation(droppedNode, moveTo)) {
							moveNode(droppedNode, moveTo);
						}

					} */
						const droppedToNodeElem = ev.target.closest('.classifierNode')

						if (droppedToNodeElem) {
							const moveToPath = getPathToNodeFromString(
								droppedToNodeElem.dataset.pathToNode
							)
							let moveTo = getNode($scope.treeData, moveToPath)

							if (nodeCanBeMovedToTheLocation(droppedNode, moveTo)) {
								moveNode(droppedNode, moveTo)
							}
						} else {
							// dropped on the edge of classifier tree
							moveNode(droppedNode, $scope.treeData)
						}
					}
				}

				vm.onNodeDragStart = function (ev) {
					if (vm.editingNode) ev.preventDefault()

					$scope.classifierTreeEventService.dispatchEvent(
						classifierEvents.DRAG_START
					)
					const nodeDndBackdrop = document.createElement('div')

					nodeDndBackdrop.classList.add(
						'classifier-node-dnd-backdrop',
						'cNodeDndBackdrop'
					)
					document.body.appendChild(nodeDndBackdrop)

					ev.dataTransfer.setData('id', ev.target.dataset.nodeId)
					ev.dataTransfer.setData('pathToNode', ev.target.dataset.pathToNode)

					/* nodeDropElemsList = treeElement.querySelectorAll(".dropOntoNode");

					nodeDropElemsList.forEach(nodeElem => {
						nodeElem.addEventListener('dragenter', onNodeDragenter);
						nodeElem.addEventListener('dragleave', onNodeDragleave);
					}); */

					dropInbetweenElemsList = []
					const dropBeforeElemsList = treeElement.querySelectorAll(
						'.dropAtTheBeginning'
					)
					const dropAfterElemsList =
						treeElement.querySelectorAll('.dropAfterNode')

					dropBeforeElemsList.forEach((dbElem) =>
						dropInbetweenElemsList.push(dbElem)
					)
					dropAfterElemsList.forEach((daElem) =>
						dropInbetweenElemsList.push(daElem)
					)

					/* dropInbetweenElemsList.forEach(dElem => {
						dElem.addEventListener('dragenter', onDropInbetweenDragenter);
						// dElem.addEventListener('dragleave', onDropInbetweenDragleave);
						dElem.addEventListener('dragleave', onNodeDragleave);
					}); */
					treeElement.addEventListener('dragover', onDragOver)

					treeElement.classList.add('dnd-in-progress')

					treeElement.addEventListener('drop', onNodeDrop, { once: true })
				}

				vm.onNodeDragEnd = function (ev) {
					/* nodeDropElemsList.forEach(nodeElem => {
						nodeElem.removeEventListener('dragenter', onNodeDragenter);
						nodeElem.removeEventListener('dragleave', onNodeDragleave);
					}); */

					/* dropInbetweenElemsList.forEach(dElem => {
						dElem.removeEventListener('dragenter', onDropInbetweenDragenter);
						// dElem.removeEventListener('dragleave', onDropInbetweenDragleave);
						dElem.addEventListener('dragleave', onNodeDragleave);
					}); */

					treeElement.removeEventListener('dragover', onDragOver)
					treeElement.removeEventListener('drop', onNodeDrop)

					nodeDropElemsList = []
					dropInbetweenElemsList = []

					// dndHoverOverElem.classList.remove('dnd-mouse-hover');
					if (draggedOverElem) {
						draggedOverElem.classList.remove('dnd-mouse-hover')
						draggedOverElem = null
					}

					if (doeParentNodeElem) {
						doeParentNodeElem.classList.remove('dnd-mouse-hover-child')
						doeParentNodeElem = null
					}

					treeElement.classList.remove('dnd-in-progress')

					$scope.classifierTreeEventService.dispatchEvent(
						classifierEvents.DRAG_END
					)
				}
				//endregion

				const init = function () {
					let currentShadow = getShadowClass(treeElement)

					if (currentShadow) {
						treeElement.classList.add(currentShadow)
					}

					const activeNodeOnInit = getActiveNode(vm.filteredTree)

					if (activeNodeOnInit) {
						selectNode(activeNodeOnInit)

						// const parents = getParentsOfNode(activeNode);
						const parents = getAllParentsOfNode(vm.filteredTree, activeNode)

						parents.forEach((node) => {
							node.frontOptions.closed = false
						})
					}

					if ($scope.classifierTreeEventService) {
						const treeChangedFromOutsideId =
							$scope.classifierTreeEventService.addEventListener(
								classifierEvents.TREE_CHANGED_FROM_OUTSIDE,
								onTreeChangedFromOutside
							)
						const editNodeId =
							$scope.classifierTreeEventService.addEventListener(
								classifierEvents.EDIT_NODE,
								onEditNode
							)
						const cancelEditNodeId =
							$scope.classifierTreeEventService.addEventListener(
								classifierEvents.CANCEL_EDIT_NODE,
								cancelEdit
							)
						const deleteNodeId =
							$scope.classifierTreeEventService.addEventListener(
								classifierEvents.DELETE_NODE,
								onDeleteNode
							)
						const addNodeId =
							$scope.classifierTreeEventService.addEventListener(
								classifierEvents.ADD_NODE,
								onAddNode
							)
						const emptyFilterId =
							$scope.classifierTreeEventService.addEventListener(
								classifierEvents.EMPTY_FILTER,
								emptyFilter
							)

						$scope.$on('$destroy', function () {
							$scope.classifierTreeEventService.removeEventListener(
								classifierEvents.TREE_CHANGED_FROM_OUTSIDE,
								treeChangedFromOutsideId
							)
							$scope.classifierTreeEventService.removeEventListener(
								classifierEvents.EDIT_NODE,
								editNodeId
							)
							$scope.classifierTreeEventService.removeEventListener(
								classifierEvents.CANCEL_EDIT_NODE,
								cancelEditNodeId
							)
							$scope.classifierTreeEventService.removeEventListener(
								classifierEvents.ADD_NODE,
								addNodeId
							)
							$scope.classifierTreeEventService.removeEventListener(
								classifierEvents.DELETE_NODE,
								deleteNodeId
							)
							$scope.classifierTreeEventService.removeEventListener(
								classifierEvents.EMPTY_FILTER,
								emptyFilterId
							)
						})
					}

					treeElement.addEventListener('scroll', () => {
						applyShadow()
					})
				}

				init()
			},
		],
	}
}
