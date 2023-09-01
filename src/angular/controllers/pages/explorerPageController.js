/**
 * Created by szhitenev on 04.10.2022.
 */

import baseUrlService from '../../services/baseUrlService'
import explorerService from '../../services/explorerService'
import downloadFileHelper from '../../helpers/downloadFileHelper'
import toastNotificationService from '@/angular/core/services/toastNotificationService'

import metaHelper from '../../helpers/meta.helper'

var baseUrl = baseUrlService.resolve()

export default function explorerController(
	$scope,
	$state,
	$stateParams,
	$sce,
	authorizerService,
	globalDataService,
	$mdDialog
) {
	var vm = this

	vm.items = []

	vm.currentPath = []

	vm.showHiddenFiles = false
	vm.showWorkflow = false
	vm.showEditor = false

	vm.fileEditor = {}
	vm.fileEditorLoading = false

	vm.breadcrumbsNavigation = function ($index) {
		if ($index === -1) {
			vm.currentPath = []
		} else {
			vm.currentPath = vm.currentPath.filter(function (item, index) {
				return index <= $index
			})
		}

		// vm.listFiles();
		// IMPORTANT! State.go escaping slashes and router goes mad
		window.location.hash = '#!/explorer/' + vm.currentPath.join('/')
	}

	vm.selectItem = function ($event, item) {
		vm.items = vm.items.map(function (_item) {
			_item.selected = false
			return _item
		})

		item.selected = true
	}

	vm.triggerMenu = function ($event) {

		// Cause md-menu on right click has wrong absolute position calc
		setTimeout(function () {
			$event.currentTarget.querySelector('.explorer-md-menu-trigger').click()
		}, 0)
	}

	vm.openFolder = function ($event, item) {


		vm.currentPath.push(item.name)



		// IMPORTANT! State.go escaping slashes and router goes mad
		window.location.hash = '#!/explorer/' + vm.currentPath.join('/')

		// vm.listFiles()
	}

	vm.previewFileDialog = function ($event, item, $mdMenu) {
		if ($mdMenu) {
			$mdMenu.close()
		}

		var itemPath = vm.currentPath.join('/') + '/' + item.name

		explorerService.viewFile(itemPath).then(function (blob) {
			$mdDialog.show({
				controller: 'FilePreviewDialogController as vm',
				templateUrl: 'views/dialogs/file-preview-dialog-view.html',
				parent: angular.element(document.body),
				targetEvent: $event,
				clickOutsideToClose: false,
				preserveScope: true,
				autoWrap: true,
				skipHide: true,
				multiple: true,
				locals: {
					data: {
						blob: blob,
						file_descriptor: item,
					},
				},
			})
		})
	}

	vm.editFileDialog = function ($event, item, $mdMenu) {
		if ($mdMenu) {
			$mdMenu.close()
		}

		var itemPath = vm.currentPath.join('/') + '/' + item.name

		explorerService.viewFile(itemPath).then(function (blob) {
			$mdDialog
				.show({
					controller: 'FileEditDialogController as vm',
					templateUrl: 'views/dialogs/file-edit-dialog-view.html',
					parent: angular.element(document.body),
					targetEvent: $event,
					clickOutsideToClose: false,
					preserveScope: true,
					autoWrap: true,
					skipHide: true,
					multiple: true,
					locals: {
						data: {
							blob: blob,
							file_descriptor: item,
							currentPath: vm.currentPath,
						},
					},
				})
				.then(function (res) {
					if (res.status === 'agree') {
						vm.listFiles()
					}
				})
		})
	}

	vm.editFile = function ($event, item, $mdMenu) {
		vm.fileEditor = {}

		if ($mdMenu) {
			$mdMenu.close()
		}

		vm.fileEditor.name = item.name

		var itemPath = vm.currentPath.join('/') + '/' + item.name

		vm.showEditor = true

		vm.calculateExplorerStateClass()

		vm.fileEditorLoading = true

		explorerService.viewFile(itemPath).then(function (blob) {
			var reader = new FileReader()

			reader.addEventListener('loadend', function (e) {
				vm.fileEditor.content = reader.result

				vm.fileEditorLoading = false

				$scope.$apply()

				vm.initFileEditor() // call after angular.js render
			})

			reader.readAsText(blob)
		})
	}

	vm.initFileEditor = function () {


		setTimeout(function () {
			vm.editor = ace.edit('fileEditorAceEditor')
			vm.editor.setTheme('ace/theme/monokai')

			if (vm.fileEditor.name.indexOf('.py') !== -1) {
				vm.editor.getSession().setMode('ace/mode/python')
			}

			if (vm.fileEditor.name.indexOf('.json') !== -1) {
				vm.editor.getSession().setMode('ace/mode/json')
			}

			if (vm.fileEditor.name.indexOf('.yaml') !== -1) {
				vm.editor.getSession().setMode('ace/mode/yaml')
			}

			vm.editor.getSession().setUseWorker(false)
			vm.editor.setHighlightActiveLine(false)
			vm.editor.setShowPrintMargin(false)
			ace.require('ace/ext/language_tools')
			vm.editor.setOptions({
				enableBasicAutocompletion: true,
				enableSnippets: true,
			})
			vm.editor.setFontSize(14)
			vm.editor.setBehavioursEnabled(true)
			vm.editor.setValue(vm.fileEditor.content)

			vm.editor.focus()
			vm.editor.navigateFileStart()
		}, 100)
	}

	vm.saveFileEditor = function () {
		vm.fileSaveProcessing = true

		var name = vm.fileEditor.name

		var path = vm.currentPath.join('/')

		let formData = new FormData()

		var content = vm.editor.getValue()




		const blob = new Blob([content], { type: vm.contentType })
		const file = new File([blob], name)

		formData.append('file', file)
		formData.append('path', path)

		explorerService.uploadFiles(formData).then(function (e) {
			toastNotificationService.success('File Saved')

			vm.fileSaveProcessing = false

			$scope.$apply()
		})
	}

	vm.closeFileEditor = function () {
		vm.showEditor = false

		vm.calculateExplorerStateClass()
	}

	vm.copyFilePath = function ($event, item, $mdMenu) {
		if ($mdMenu) {
			$mdMenu.close()
		}

		metaHelper.copyToBuffer(item.file_path)
	}

	vm.downloadFile = function ($mdMenu, $event, item) {
		$mdMenu.close()

		var itemPath = item.name
		if (vm.currentPath.length) {
			itemPath = vm.currentPath.join('/') + '/' + item.name
		}

		explorerService.viewFile(itemPath).then(function (blob) {
			// IE doesn't allow using a blob object directly as link href
			// instead it is necessary to use msSaveOrOpenBlob
			if (window.navigator && window.navigator.msSaveOrOpenBlob) {
				window.navigator.msSaveOrOpenBlob(blob)
				return
			}

			// For other browsers:
			// Create a link pointing to the ObjectURL containing the blob.
			var data = window.URL.createObjectURL(blob)
			var link = document.createElement('a')
			link.href = data
			link.download = item.name

			document.body.appendChild(link) // For Mozilla Firefox
			link.click()

			setTimeout(function () {
				document.body.removeChild(link)
				window.URL.revokeObjectURL(data)
			}, 100)
		})


	}

	vm.renameFile = function ($mdMenu, $event, item) {
		$mdMenu.close()

		item.rename = true
	}

	vm.deleteFile = function ($mdMenu, $event, item) {
		$mdMenu.close()

		var itemPath = item.name
		if (vm.currentPath.length) {
			itemPath = vm.currentPath.join('/') + '/' + item.name
		}

		var is_dir = false

		if (item.type === 'dir') {
			is_dir = true
		}

		explorerService.deleteFile(itemPath, is_dir)

		setTimeout(function () {
			vm.listFiles()
		}, 600)
	}

	vm.listFiles = function () {
		vm.processing = true

		explorerService.listFiles(vm.currentPath.join('/')).then(function (data) {
			vm.items = data.results

			vm.items = vm.items.filter(function (item) {
				var result = true

				if (item.name[0] === '.' && !vm.showHiddenFiles) {
					result = false
				}

				return result
			})

			vm.processing = false

			$scope.$apply()
		})
	}

	vm.createFolder = function ($event) {
		$mdDialog
			.show({
				controller: 'CreateFolderDialogController as vm',
				templateUrl: 'views/dialogs/create-folder-dialog-view.html',
				parent: angular.element(document.body),
				targetEvent: $event,
				locals: {
					data: {},
				},
			})
			.then(function (res) {
				if (res.status === 'agree') {
					var itemPath = res.name
					if (vm.currentPath.length) {
						itemPath = vm.currentPath.join('/') + '/' + res.name
					}

					explorerService.createFolder(itemPath).then(function () {
						vm.listFiles()
					})
				}
			})
	}

	vm.createFile = function ($event) {
		$mdDialog
			.show({
				controller: 'CreateFileDialogController as vm',
				templateUrl: 'views/dialogs/create-file-dialog-view.html',
				parent: angular.element(document.body),
				targetEvent: $event,
				locals: {
					data: {},
				},
			})
			.then(function (res) {
				if (res.status === 'agree') {
					$mdDialog
						.show({
							controller: 'FileEditDialogController as vm',
							templateUrl: 'views/dialogs/file-edit-dialog-view.html',
							parent: angular.element(document.body),
							targetEvent: $event,
							clickOutsideToClose: false,
							preserveScope: true,
							autoWrap: true,
							skipHide: true,
							multiple: true,
							locals: {
								data: {
									content: '',
									file_descriptor: {
										name: res.name,
									},
									currentPath: vm.currentPath,
								},
							},
						})
						.then(function (res) {
							if (res.status === 'agree') {
								vm.listFiles()
							}
						})
				}
			})
	}

	vm.uploadFiles = function ($event) {
		document.querySelector('#explorerFileUploadInput').click()
	}

	vm.uploadFileHandler = function ($event) {
		vm.processing = true



		var fileInput = document.querySelector('#explorerFileUploadInput')

		let formData = new FormData()
		for (var i = 0; i < fileInput.files.length; i = i + 1) {
			formData.append('file', fileInput.files[i])
		}

		var path = vm.currentPath.join('/')



		formData.append('path', path)

		explorerService.uploadFiles(formData).then(function (data) {
			document.querySelector('#explorerFileUploadInput').value = ''

			vm.listFiles()
		})
	}

	vm.toggleHidden = function () {
		vm.showHiddenFiles = !vm.showHiddenFiles

		vm.listFiles()
	}

	vm.trustSrc = function (src) {
		return $sce.trustAsResourceUrl(src)
	}

	vm.resolveWorkflowIframeUrl = function () {
		vm.workflowIframeUrl = 'http://0.0.0.0:8084/space00000/workflow/'

		if (window.location.href.indexOf('finmars') !== -1) {
			vm.workflowIframeUrl =
				window.location.protocol +
				'//' +
				window.location.host +
				'/' +
				baseUrlService.getMasterUserPrefix() +
				'/workflow/'
		}
	}

	vm.calculateExplorerStateClass = function () {
		var result = ''

		if (vm.showWorkflow && !vm.showEditor) {
			result = 'show-explorer-workflow'
		}

		if (!vm.showWorkflow && vm.showEditor) {
			result = 'show-explorer-editor'
		}

		if (vm.showWorkflow && vm.showEditor) {
			result = 'show-explorer-editor-workflow'
		}

		vm.explorerStateClass = result
	}

	vm.toggleWorkflow = function () {
		vm.showWorkflow = !vm.showWorkflow
		vm.calculateExplorerStateClass()
	}

	vm.init = function () {
		vm.resolveWorkflowIframeUrl()



		if ($stateParams.folderPath) {
			vm.currentPath = $stateParams.folderPath.split('/')
		}



		vm.listFiles()

		vm.member = globalDataService.getMember()

		document
			.querySelector('.explorer-page')
			.addEventListener('click', function (e) {
				vm.items = vm.items.map(function (_item) {
					_item.selected = false
					return _item
				})
			})
	}

	vm.init()
}
