/**
 * Created by szhitenev on 28.06.2016.
 */

import attributeTypeService from '../../services/attributeTypeService'
import EventService from '../../services/eventService'
import classifierEvents from '../../services/events/classifierEvents'
import metaHelper from '../../helpers/meta.helper'

export default function ($scope, $mdDialog, commonDialogsService, data) {
	var vm = this

	vm.tree = null
	vm.entityType = data.entityType
	vm.classifier = data.classifier
	vm.classifierId = data.classifier.id
	vm.classifierValue = data.classifierId
	// vm.label = data.label || 'Select classifier';
	vm.label = data.classifier.name
		? `Select ${data.classifier.name}`
		: 'Select classifier'
	vm.sellAllTabName = data.classifier.name
		? `ALL ${data.classifier.name.toUpperCase()}S`
		: 'ALL'

	vm.isLock = true
	vm.isEdit = false

	vm.readyStatus = false

	vm.activeNodes = []
	let activeNodesIdsBeforeUpdate = []
	let classifiersFlatList = []
	let favoriteNodesNames = ''
	const addToFavIconElem = `<span class="material-icons orange">star_outline</span>`
	let nodeDragendIndex
	let updateDelay = 1000

	const getNode = (idsList) => {
		if (!idsList || (Array.isArray(idsList) && !idsList.length)) {
			return undefined
		}

		const eldestParentId = isNaN(idsList[0]) ? idsList[0] : parseInt(idsList[0])

		let node = vm.tree.find((childNode) => {
			if (childNode.id || childNode.id === 0) {
				return childNode.id === eldestParentId
			} else if (childNode.frontOptions.id) {
				return childNode.frontOptions.id === eldestParentId
			}
		})

		const idsListWithoutEldest = idsList.slice(1)

		idsListWithoutEldest.forEach((nodeId) => {
			const parsedNodeId = isNaN(nodeId) ? nodeId : parseInt(nodeId)

			node = node.children.find((childNode) => {
				if (childNode.id || childNode.id === 0) {
					return childNode.id === parsedNodeId
				} else if (childNode.frontOptions.id) {
					return childNode.frontOptions.id === parsedNodeId
				}
			})
		})

		return node
	}

	const getPathToNodeByName = (nodeName) => {
		let pathToNode = []
		let nodeData

		nodeData = classifiersFlatList.find((item) => item.name === nodeName)

		if (nodeData) {
			pathToNode.push(nodeData.id)

			while (nodeData.parent) {
				nodeData = classifiersFlatList.find(
					(item) => item.id === nodeData.parent
				)
				pathToNode.push(nodeData.id)
			}

			pathToNode = pathToNode.reverse()
		} else {
			console.error('Node with name: ' + nodeName + ' not found')
		}

		return pathToNode
	}

	//region Favorites
	vm.showFavorites = true
	vm.favoritesList = []
	vm.favoritesFilterTerms = ''
	// vm.favNodeNewName = "";

	const updateFavoritesNames = function () {
		vm.favoritesList = vm.favoritesList.map(function (fNode) {
			const node = getNode(fNode.pathToNode)
			fNode.name = node.name
			return fNode
		})

		favoriteNodesNames = vm.favoritesList.reduce(reduceToStringOfNames, '')
	}

	const getFavorites = function () {
		vm.favoritesList = []

		if (!classifiersFlatList.length) {
			// there are no nodes
			return vm.favoritesList
		}

		const favoriteNodesNamesList = favoriteNodesNames
			? favoriteNodesNames.split(',')
			: []

		/*vm.favoritesList = favoriteNodesNamesList.map(name => {

				const pathToNode = getPathToNodeByName(name);
				const node = getNode(pathToNode);
				const nodeId = (node.id || node.id === 0) ? node.id : node.frontOptions.id;

				return {
					id: nodeId,
					pathToNode: node.frontOptions.pathToNode,
					name: node.name,
					level: node.level,
					isActive: activeNodesIdsBeforeUpdate.includes(nodeId),
				};

			});*/

		favoriteNodesNamesList.forEach((name) => {
			const pathToNode = getPathToNodeByName(name)
			const node = getNode(pathToNode)

			if (node) {
				const nodeId = node.id || node.id === 0 ? node.id : node.frontOptions.id

				vm.favoritesList.push({
					id: nodeId,
					pathToNode: node.frontOptions.pathToNode,
					name: node.name,
					level: node.level,
					isActive: activeNodesIdsBeforeUpdate.includes(nodeId),
				})
			}
		})

		return vm.favoritesList
	}

	const toggleNodeAsFavorite = async function ($event, node) {
		$event.stopPropagation()

		const originalNode = getNode(node.frontOptions.pathToNode)
		const nodeId =
			originalNode.id || originalNode.id === 0
				? originalNode.id
				: originalNode.frontOptions.id
		const toggleFavoriteBtn = originalNode.frontOptions.nodeButtons[0]

		const isFavorite = !toggleFavoriteBtn.options.isFavorite
		toggleFavoriteBtn.options.isFavorite = isFavorite

		if (isFavorite) {
			toggleFavoriteBtn.htmlTemplate = `<span class="material-icons">star</span>`

			const favoriteNodeObj = {
				id: nodeId,
				pathToNode: originalNode.frontOptions.pathToNode,
				name: originalNode.name,
				level: originalNode.level,
				isActive: originalNode.frontOptions.isActive,
			}

			vm.favoritesList.push(favoriteNodeObj)
		} else {
			toggleFavoriteBtn.htmlTemplate = addToFavIconElem
			const favoriteNodeIndex = vm.favoritesList.findIndex(
				(fav) => fav.id === nodeId
			)

			vm.favoritesList.splice(favoriteNodeIndex, 1)
		}

		await updateClassifier()
		// vm.classifierTreeEventService.dispatchEvent(classifierEvents.TREE_CHANGED_FROM_OUTSIDE);

		$scope.$apply()
	}
	/** Used inside tab favorites */
	vm.removeNodeFromFavorites = function ($event, pathToNode) {
		$event.stopPropagation()

		const originalNode = getNode(pathToNode)
		const nodeId =
			originalNode.id || originalNode.id === 0
				? originalNode.id
				: originalNode.frontOptions.id
		const toggleFavoriteBtn = originalNode.frontOptions.nodeButtons[0]

		toggleFavoriteBtn.htmlTemplate = addToFavIconElem
		const favoriteNodeIndex = vm.favoritesList.findIndex(
			(fav) => fav.id === nodeId
		)

		vm.favoritesList.splice(favoriteNodeIndex, 1)

		updateClassifier()
	}

	const isNodeFavorite = function (node) {
		const nodeId = node.id || node.id === 0 ? node.id : node.frontOptions.id

		const favoriteNodeIndex = vm.favoritesList.findIndex((favNode) => {
			const favNodeId =
				favNode.id || favNode.id === 0 ? favNode.id : favNode.frontOptions.id
			return favNodeId === nodeId
		})

		return favoriteNodeIndex > -1
	}

	vm.toggleFavNodeSelection = function (favNode) {
		if (!favNode.isActive)
			vm.favoritesList.forEach((node) => (node.isActive = false))

		favNode.isActive = !favNode.isActive
		const favNodeInsideTree = getNode(favNode.pathToNode)

		favNodeInsideTree.frontOptions.isActive = favNode.isActive

		if (favNode.isActive) {
			const prevActiveNode = vm.activeNodes[0]
			if (prevActiveNode) prevActiveNode.frontOptions.isActive = false

			vm.activeNodes[0] = favNodeInsideTree
		} else {
			vm.activeNodes = []
		}

		vm.classifierTreeEventService.dispatchEvent(
			classifierEvents.TREE_CHANGED_FROM_OUTSIDE
		)
	}

	const reduceToStringOfNames = (accumulator, currentVal, currentIndex) => {
		if (currentIndex) return accumulator + ',' + currentVal.name

		return currentVal.name // for 0 index
	}

	vm.saveNode = function ($event, favNode) {
		$event.stopPropagation()

		// const nodeFromOriginalTree = metaHelper.getObjectNestedPropVal($scope.treeData, vm.nodeInEditMode.frontOptions.treePath);

		if (favNode.name !== favNode.newName) {
			favNode.name = favNode.newName

			const nodeFromTree = getNode(favNode.pathToNode)
			nodeFromTree.name = favNode.newName

			delete favNode.newName
			favNode.editOn = false

			vm.isEdit = false
			vm.classifierTreeEventService.dispatchEvent(
				classifierEvents.CANCEL_EDIT_NODE
			) // should be called before updateClassifier();

			updateClassifier()
		} else {
			vm.classifierTreeEventService.dispatchEvent(
				classifierEvents.CANCEL_EDIT_NODE
			)
		}
	}

	vm.cancelEdit = function ($event, activeFavNode) {
		$event.stopPropagation()

		delete activeFavNode.newName
		activeFavNode.editOn = false

		vm.isEdit = false
		vm.classifierTreeEventService.dispatchEvent(
			classifierEvents.CANCEL_EDIT_NODE
		)
	}
	//endregion

	vm.onEdit = function () {
		if (!vm.activeNodes.length) {
			return
		}

		clearTimeout(treeChangeTimeoutId) // prevent classifier update after order of nodes changed

		/* if (vm.showFavorites) {

				const activeFavNode = vm.favoritesList.find(favNode => favNode.isActive);
				activeFavNode.editOn = true;

				activeFavNode.newName = activeFavNode.name;
				const nameInput = document.querySelector(".classifier-select-dialog-view .fav-node-row.active .classifier-name");

				setTimeout(() => {
					nameInput.focus();
				}, 0);

			} else {
				vm.isEdit = true;
				vm.classifierTreeEventService.dispatchEvent(classifierEvents.EDIT_NODE);
			}*/

		const activeFavNode = vm.favoritesList.find((favNode) => favNode.isActive)

		if (activeFavNode) {
			activeFavNode.editOn = true

			activeFavNode.newName = activeFavNode.name
			const nameInput = document.querySelector(
				'.classifier-select-dialog-view .fav-node-row.active .classifier-name'
			)

			if (vm.showFavorites) {
				setTimeout(() => {
					nameInput.focus()
				}, 0)
			}
		}

		vm.isEdit = true
		vm.classifierTreeEventService.dispatchEvent(classifierEvents.EDIT_NODE)
	}

	vm.onEditCancelInsideTree = function () {
		const activeFavNode = vm.favoritesList.find((favNode) => favNode.isActive)

		if (activeFavNode) {
			activeFavNode.editOn = false

			delete activeFavNode.newName
		}

		vm.isEdit = false
	}

	vm.onDelete = () => {
		if (!vm.activeNodes.length) {
			return
		}

		clearTimeout(treeChangeTimeoutId) // prevent classifier update after order of nodes changed

		$mdDialog
			.show({
				controller: 'WarningDialogController as vm',
				templateUrl: 'views/dialogs/warning-dialog-view.html',
				parent: angular.element(document.body),
				// targetEvent: $event,
				preserveScope: true,
				autoWrap: true,
				multiple: true,
				skipHide: true,
				locals: {
					warning: {
						title: 'Warning',
						description:
							'Are you sure you want to delete classifier ' +
							vm.activeNodes[0].name +
							'?',
					},
				},
			})
			.then(function (res) {
				if (res.status === 'agree') {
					vm.isLock = true
					vm.classifierTreeEventService.dispatchEvent(
						classifierEvents.DELETE_NODE,
						{ activeNodes: vm.activeNodes }
					)
				}
			})
	}

	vm.onAdd = () => {
		clearTimeout(treeChangeTimeoutId) // prevent classifier update after order of nodes changed
		vm.isEdit = true
		vm.classifierTreeEventService.dispatchEvent(classifierEvents.ADD_NODE, {
			activeNodes: vm.activeNodes,
		})
	}

	vm.activeNodesExist = () => !!vm.activeNodes.length
	/**
	 *
	 * @param treeBranch {Array} - list of nodes inside tree branch
	 * @param levelNumber {number}
	 * @param parentNode {Object}
	 * @param treeBranchBeforeSave {Array=} - used to synchronize opened nodes after saving tree on server
	 * @returns {Array} - tree with updated nodes
	 */
	const setUpTreeNodes = function (
		treeBranch,
		levelNumber,
		parentNode,
		treeBranchBeforeSave
	) {
		if (!levelNumber && levelNumber !== 0) levelNumber = 0

		treeBranch.forEach((node, index) => {
			node.level = levelNumber
			// node.order = index;
			// node.isActive = activeNodesIdsBeforeUpdate.includes(node.id);

			node.frontOptions = {}
			node.frontOptions.isActive = activeNodesIdsBeforeUpdate.includes(node.id)
			// node.frontOptions.treePath = [index];
			node.frontOptions.pathToNode = [node.id]

			if (treeBranchBeforeSave) {
				node.frontOptions.closed = treeBranchBeforeSave[index].closed
			} else {
				node.frontOptions.closed = node.level > 0
			}

			node.frontOptions.hasActiveChild = false
			// if (parentNode) node.frontOptions.treePath = parentNode.frontOptions.treePath.concat(['children', index]);
			if (parentNode)
				node.frontOptions.pathToNode =
					parentNode.frontOptions.pathToNode.concat([node.id])

			const favoriteNodesNamesList = favoriteNodesNames.split(',')

			let toggleFavoritesBtnObj = {
				key: 'toggle_favorites',
				htmlTemplate: addToFavIconElem,
				action: {
					callback: toggleNodeAsFavorite,
				},
				options: {
					isFavorite: favoriteNodesNamesList.includes(node.name),
				},
			}

			if (toggleFavoritesBtnObj.options.isFavorite) {
				toggleFavoritesBtnObj.htmlTemplate = `<span class="material-icons">star</span>`
			}

			node.frontOptions.nodeButtons = [toggleFavoritesBtnObj]

			if (node.children.length) {
				var childBranchBeforeSave = treeBranchBeforeSave
					? treeBranchBeforeSave[index].children
					: null
				var nextLevel = levelNumber + 1

				setUpTreeNodes(node.children, nextLevel, node, childBranchBeforeSave)
			}

			if (node.frontOptions.isActive) {
				vm.activeNodes.push(node)
			}
		})

		return treeBranch
	}

	const processClassifierData = function (data, treeBeforeUpdate) {
		favoriteNodesNames = data.favorites || ''
		vm.tree = setUpTreeNodes(data.classifiers, 0, null, treeBeforeUpdate)

		classifiersFlatList = data.classifiers_flat
		// if (data.favorites) vm.favoritesList = getFavorites(data.favorites);
		getFavorites()
	}

	const getClassifierData = function (treeBeforeUpdate) {
		// $('#js-tree-select-wrapper').remove();
		vm.readyStatus = false

		return new Promise((resolve, reject) => {
			attributeTypeService
				.getByKey(vm.entityType, vm.classifierId)
				.then(function (data) {
					processClassifierData(data, treeBeforeUpdate)

					vm.readyStatus = true

					$scope.$apply()
					vm.classifierTreeEventService.dispatchEvent(
						classifierEvents.TREE_CHANGED_FROM_OUTSIDE
					)
					/* $('.js-tree-holder-dialog-select').append('<div id="js-tree-select-wrapper" class="js-tree-select" style="width: 100%; overflow: hidden"></div>');

					function setText(item) {
						item.text = item.name;
						item.type = 'default';
						if (item.children.length) {
							item.type = 'folder';
						}
						item.children = item.children.map(setText);
						return item
					}

					vm.tree = data.classifiers;

					var tree = data.classifiers.map(setText);

					$('#js-tree-select-wrapper').jstree({
						"core": {
							"animation": 0,
							"check_callback": true,
							"themes": {"stripes": true, "dots": true},
							'data': [
								{
									'text': 'Root',
									'state': {'opened': true, 'selected': true},
									'children': tree
								}
							]
						},
						"dnd": {
							"is_draggable": function (node) {
								return false
							}
						},
						"types": {
							"#": {
								"valid_children": ["root"]
							},
							"root": {
								"icon": "portal/content/img/ic_folder_black_1x.png",
								"valid_children": ["default"]
							},
							"default": {
								"icon": "portal/content/img/ic_label_outline_black_1x.png",
								"valid_children": ["default", "folder"]
							},
							"folder": {
								"icon": "portal/content/img/ic_folder_black_1x.png",
								"valid_children": ["default", "folder"]
							}
						},
						"plugins": [
							"contextmenu", "dnd", "search",
							"state", "types", "wholerow"
						]
					});
					$('#js-tree-select-wrapper').jstree(true).show_dots();
					$scope.$apply(function () {
						setTimeout(function () {
							$('#js-tree-select-wrapper').jstree("deselect_all");
						}, 300); // idk, wtf is this
						setTimeout(function () {
							console.log('vm.classifierId', vm.classifierValue);
							$('#js-tree-select-wrapper').jstree("select_node", "#" + vm.classifierValue);
						}, 301); // idk, wtf is this
					}); */
					resolve()
				})
				.catch((error) => reject(error))
		})
	}

	const getClearTree = (tree) => {
		return tree.map((node) => {
			delete node.frontOptions
			if (node.children.length) {
				node.children = getClearTree(node.children)
			}

			return node
		})
	}

	vm.onActiveNodesChange = function (activeNodesList) {
		vm.activeNodes = activeNodesList

		// mark active nodes inside favorites
		vm.favoritesList = vm.favoritesList.map((fNode) => {
			const index = vm.activeNodes.findIndex((aNode) => aNode.id === fNode.id)
			fNode.isActive = index > -1

			return fNode
		})
		// vm.favoritesList.find(node => node.id === );
	}

	const updateClassifier = function () {
		// clear update timeout after drag and drop
		clearTimeout(treeChangeTimeoutId)
		treeChangeTimeoutId = null

		vm.readyStatus = false

		return new Promise((res, rej) => {
			const classifierBeforeUpdate = JSON.parse(angular.toJson(vm.tree))
			activeNodesIdsBeforeUpdate = vm.activeNodes.map(({ id }) => id)

			const classifiers = getClearTree(vm.tree)
			// vm.classifier.classifiers = classifiers;
			vm.classifier.classifiers = classifiers

			vm.classifier.favorites =
				vm.favoritesList.reduce(reduceToStringOfNames, '') || null

			attributeTypeService
				.update(vm.entityType, vm.classifierId, vm.classifier)
				.then(function (data) {
					vm.activeNodes = []
					/*

					// vm.readyStatus changes to true by getClassifierData()
					getClassifierData(classifierBeforeUpdate).then(() => {
						res();

					}).catch(error => rej(error)); */
					processClassifierData(data, classifierBeforeUpdate)

					vm.readyStatus = true

					$scope.$apply()

					vm.classifierTreeEventService.dispatchEvent(
						classifierEvents.TREE_CHANGED_FROM_OUTSIDE
					)

					res()
				})
				.catch((error) => rej(error))
		})
	}

	/* vm.toggleNodeSelection = function (favNode) {

			if (!favNode.isActive) { // if making node selected
				vm.favoritesList.forEach(node => node.isActive = false);
			}

			favNode.isActive = !favNode.isActive;

			var activeNode = getNode(vm.tree, favNode.pathToNode);
			activeNode.frontOptions.isActive = favNode.isActive;

        	vm.activeNodes = [];

			vm.activeNodes.push(activeNode);

		}; */

	const sortNodesA = (a, b) => {
		if (a.name.toLowerCase() > b.name.toLowerCase()) {
			return 1
		}
		if (a.name.toLowerCase() < b.name.toLowerCase()) {
			return -1
		}
		return 0
	}

	const sortNodesAlphabetically = function (nodesList) {
		nodesList = nodesList.sort(sortNodesA)

		nodesList.forEach(function (cNode) {
			if (cNode.children.length) {
				cNode.children = sortNodesAlphabetically(cNode.children)
			}
		})

		return nodesList
	}

	vm.sortTreeAlphabetically = function () {
		clearTimeout(treeChangeTimeoutId) // prevent classifier update if order of nodes changed

		commonDialogsService
			.warning({
				warning: {
					title: 'Warning',
					description: 'Are you sure want to sort whole tree alphabetically?',
				},
			})
			.then(function (res) {
				if (res.status === 'agree') {
					vm.tree = sortNodesAlphabetically(vm.tree)

					updateClassifier().then(function () {
						// without this, html of classifier tree does not update after sorting
						$scope.$apply()
					})
				}
			})
	}

	/* Old code
		function setName(item) {
            item.name = item.text;
            if (item.id.indexOf('j') !== -1) {
                delete item['li_attr'];
                delete item['state'];
                delete item['icon'];
                delete item['a_attr'];
                delete item['data'];
                delete item['text'];
                delete item['type'];
                delete item.id;
            }
            item.children = item.children.map(setName);
            return item
        }

        vm.edit = function (ev) {
            $mdDialog.show({
                controller: 'ClassificationEditorDialogController as vm',
                templateUrl: 'views/classification-editor-dialog-view.html',
                parent: angular.element(document.body),
                targetEvent: ev,
                preserveScope: true,
                autoWrap: true,
                skipHide: true,
                multiple: true,
                locals: {
                    data: {
                        classifier: data.classifier,
                        entityType: vm.entityType
                    }
                }
            }).then(function (res) {
                if (res.status === 'agree') {
                    console.log("res", res.data);

                    res.data.classifier.classifiers = res.data.classifier.children.map(setName);
                    // $('#js-tree-select-wrapper').jstree(true).destroy();
                    attributeTypeService.update(vm.entityType, res.data.classifier.id, res.data.classifier).then(function () {
                        vm.getTree();
                    });
                }
            });
        }; */

	vm.cancel = function () {
		// Execute delayed update classifier after nodes' order change
		if (treeChangeTimeoutId || treeChangeTimeoutId === 0) {
			const classifiers = getClearTree(vm.tree)
			vm.classifier.classifiers = classifiers
			vm.classifier.favorites =
				vm.favoritesList.reduce(reduceToStringOfNames, '') || null

			attributeTypeService.update(vm.entityType, vm.classifierId, vm.classifier)
		}

		$mdDialog.hide({ status: 'disagree' })
	}

	vm.agree = function () {
		if (!vm.activeNodes.length) {
			return vm.cancel()
		}

		// Execute delayed update classifier after nodes' order change
		if (treeChangeTimeoutId || treeChangeTimeoutId === 0) {
			const classifiers = getClearTree(vm.tree)
			vm.classifier.classifiers = classifiers
			vm.classifier.favorites =
				vm.favoritesList.reduce(reduceToStringOfNames, '') || null

			attributeTypeService.update(vm.entityType, vm.classifierId, vm.classifier)
		}

		$mdDialog.hide({
			status: 'agree',
			data: { item: vm.activeNodes[0].id, name: vm.activeNodes[0].text },
		})
	}

	let treeChangeTimeoutId

	const init = function () {
		vm.classifierTreeEventService = new EventService()

		getClassifierData().then(() => {
			vm.showFavorites = !!vm.favoritesList.length
			$scope.$apply()
		})

		vm.classifierTreeEventService.addEventListener(
			classifierEvents.CLASSIFIER_TREE_CHANGED,
			(argsObj) => {
				if (argsObj.action === 'add' || argsObj.action === 'delete') {
					vm.classifierTreeEventService.dispatchEvent(
						classifierEvents.EMPTY_FILTER
					)
				}

				if (argsObj.action === 'edit') {
					updateFavoritesNames()
				}

				if (argsObj.action === 'move') {
					clearTimeout(treeChangeTimeoutId)

					treeChangeTimeoutId = setTimeout(function () {
						updateClassifier()
					}, updateDelay)
				} else {
					updateClassifier()
				}
			}
		)

		/*vm.classifierTreeEventService.addEventListener(classifierEvents.CANCEL_EDIT_NODE, () => {
            	vm.isEdit = false;
            });*/

		// if DnD started before sending update request, delay request until drag end
		vm.classifierTreeEventService.addEventListener(
			classifierEvents.DRAG_START,
			() => {
				if (treeChangeTimeoutId || treeChangeTimeoutId === 0) {
					clearTimeout(treeChangeTimeoutId)
					treeChangeTimeoutId = null

					nodeDragendIndex = vm.classifierTreeEventService.addEventListener(
						classifierEvents.DRAG_END,
						() => {
							if (treeChangeTimeoutId === null) {
								treeChangeTimeoutId = setTimeout(function () {
									updateClassifier()
								}, updateDelay)
							}

							vm.classifierTreeEventService.removeEventListener(
								classifierEvents.DRAG_END,
								nodeDragendIndex
							)
						}
					)
				}
			}
		)
	}

	init()
}
