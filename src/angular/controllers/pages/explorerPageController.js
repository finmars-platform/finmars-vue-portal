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

	var vm = this;

	vm.items = [];

	vm.reverse = true;
	vm.propertyName = 'name';

	vm.currentPath = []

	vm.showHiddenFiles = false;
	vm.showWorkflow = false;
	vm.showEditor = false;

	vm.fileEditor = {}
	vm.fileEditorLoading = false;
	vm.playBookLoading = false;

	vm.allSelected = false;
	vm.selectedCount = 0;
	vm.filesStatus = [];

	vm.searchTerm = '';

	vm.sortBy = function (propertyName) {
		vm.reverse = (vm.propertyName === propertyName) ? !vm.reverse : false;
		vm.propertyName = propertyName;
	};

	vm.breadcrumbsNavigation = function ($index) {

		if ($index === -1) {
			vm.currentPath = []
		} else {
			vm.currentPath = vm.currentPath.filter(function (item, index) {
				return index <= $index;
			})
		}

		// vm.listFiles();
		// IMPORTANT! State.go escaping slashes and router goes mad
		window.location.hash = '#!/explorer/' + vm.currentPath.join('/')

	}

	vm.triggerMenu = function ($event) {

		console.log("$event", $event)
		// Cause md-menu on right click has wrong absolute position calc
		setTimeout(function () {
			$event.currentTarget.querySelector('.explorer-md-menu-trigger').click()
		}, 0)

	}

	vm.openFolder = function ($event, item) {

		console.log('open Folder ', item);

		vm.currentPath.push(item.name)

		console.log('vm.currentPath', vm.currentPath);

		// IMPORTANT! State.go escaping slashes and router goes mad
		window.location.hash = '#!/explorer/' + vm.currentPath.join('/')

		// vm.listFiles()

	}

	vm.downloadAndEdit = function () {

		var itemPath = vm.currentPath.join('/');

		explorerService.viewFile(itemPath).then(function (blob) {

			var reader = new FileReader();

			reader.addEventListener("loadend", function (e) {
				vm.fileEditor.content = reader.result;
				vm.fileEditor.name = vm.currentPath[vm.currentPath.length - 1];

				vm.fileEditorLoading = false;

				vm.draftUserCode = 'explorer.' + vm.currentPath.join('__');

				$scope.$apply();

				vm.initFileEditor() // call after angular.js render


			});

			reader.readAsText(blob);


		});
	}

	vm.downloadAndOpenPlaybook = function () {

		var itemPath = vm.currentPath.join('/');

		vm.playBookLoading = true;

		vm.showPlaybook = true;

		explorerService.viewFile(itemPath).then(function (blob) {

			var reader = new FileReader();

			reader.addEventListener("loadend", function (e) {

				vm.playbook = JSON.parse(reader.result);
				vm.playbookName = vm.currentPath[vm.currentPath.length - 1];

				vm.playBookLoading = false;

				console.log('vm.playbook', vm.playbook);
				console.log('vm.playbookName', vm.playbookName);

				$scope.$apply();

			});

			reader.readAsText(blob);


		});

	}

	vm.editFile = function ($event, item, $mdMenu) {

		if ($mdMenu) {
			$mdMenu.close()
		}

		vm.currentPath.push(item.name);

		window.location.hash = '#!/explorer/' + vm.currentPath.join('/')

		if (item.name.indexOf('.ipynb') !== -1) {


			vm.fileEditorLoading = true;

			vm.downloadAndOpenPlaybook();

		} else {

			vm.fileEditor = {};

			vm.showEditor = true;

			vm.fileEditorLoading = true;

			vm.downloadAndEdit();

		}

	}

	// DRAFT STARTED

	vm.exportToDraft = function () {

		var data = vm.editor.getValue()

		console.log('data', data);

		return data

	}

	vm.applyDraft = function ($event, data) {

		// console.log('data', data);

		vm.editor.setValue(data);

	}

	// DRAFT ENDED

	vm.initFileEditor = function () {

		console.log('vm.initFileEditor.fileEditor ', vm.fileEditor)

		setTimeout(function () {

			vm.editor = ace.edit('fileEditorAceEditor');
			vm.editor.setTheme("ace/theme/monokai");

			if (vm.fileEditor.name.indexOf('.py') !== -1) {
				vm.editor.getSession().setMode("ace/mode/python");
			}

			if (vm.fileEditor.name.indexOf('.json') !== -1) {
				vm.editor.getSession().setMode("ace/mode/json");
			}

			if (vm.fileEditor.name.indexOf('.ipynb') !== -1) {
				vm.editor.getSession().setMode("ace/mode/json");
			}

			if (vm.fileEditor.name.indexOf('.yaml') !== -1) {
				vm.editor.getSession().setMode("ace/mode/yaml");
			}

			if (vm.fileEditor.name.indexOf('.yml') !== -1) {
				vm.editor.getSession().setMode("ace/mode/yaml");
			}

			if (vm.fileEditor.name.indexOf('.html') !== -1) {
				vm.editor.getSession().setMode("ace/mode/html");
			}

			if (vm.fileEditor.name.indexOf('.js') !== -1) {
				vm.editor.getSession().setMode("ace/mode/javascript");
			}

			if (vm.fileEditor.name.indexOf('.css') !== -1) {
				vm.editor.getSession().setMode("ace/mode/css");
			}

			vm.editor.getSession().setUseWorker(false);
			vm.editor.setHighlightActiveLine(false);
			vm.editor.setShowPrintMargin(false);
			ace.require("ace/ext/language_tools");
			vm.editor.setOptions({
				enableBasicAutocompletion: true,
				enableSnippets: true,
				enableLiveAutocompletion: true
			});
			vm.editor.setFontSize(14)
			vm.editor.setBehavioursEnabled(true);
			vm.editor.setValue(vm.fileEditor.content)

			vm.editor.focus();
			vm.editor.navigateFileStart();

		}, 100)

	}

	vm.saveFileEditor = function () {

		vm.fileSaveProcessing = true;

		var name = vm.currentPath[vm.currentPath.length - 1];

		var pathPieces = [...vm.currentPath]
		pathPieces.pop()

		var path = pathPieces.join('/'); // need to path folder path

		let formData = new FormData();

		var content = vm.editor.getValue()

		console.log('path', path)
		console.log('name', name)

		const blob = new Blob([content], {type: vm.contentType});
		const file = new File([blob], name)

		formData.append("file", file)
		formData.append('path', path)

		return explorerService.uploadFiles(formData).then(function (e) {

			toastNotificationService.success("File Saved")

			vm.fileSaveProcessing = false;

			$scope.$apply();

		})
	}

	vm.deleteSelected = function ($event) {

		var itemsToDelete = vm.items.filter(function (item) {
			return item.selected;
		})

		var names = itemsToDelete.map(function (item) {
			return item.name
		}).join(', ');

		$mdDialog.show({
			controller: 'WarningDialogController as vm',
			templateUrl: 'views/dialogs/warning-dialog-view.html',
			parent: angular.element(document.body),
			targetEvent: $event,
			clickOutsideToClose: false,
			locals: {
				warning: {
					title: 'Warning',
					description: "Are you sure that you want to delete " + names + "?",
				}
			},
			preserveScope: true,
			autoWrap: true,
			skipHide: true,
			multiple: true
		}).then(function (res) {

			if (res.status === 'agree') {

				var promises = [];

				itemsToDelete.forEach(function (item) {

					var itemPath = vm.currentPath.join('/') + '/' + item.name

					if (item.type === 'dir') {
						promises.push(new Promise(function (resolve) {
							explorerService.deleteFolder(itemPath).then(function (data) {
								resolve()
							})
						}))

					} else {
						promises.push(new Promise(function (resolve) {
							explorerService.deleteFile(itemPath, false).then(function (data) {
								resolve()
							})
						}))

					}

				})

				Promise.allSettled(promises).then(function () {
					toastNotificationService.success("Items deleted")
					vm.listFiles();
				})

			}
		})

	}

	vm.deleteFile = function ($event) {

		$mdDialog.show({
			controller: 'WarningDialogController as vm',
			templateUrl: 'views/dialogs/warning-dialog-view.html',
			parent: angular.element(document.body),
			targetEvent: $event,
			clickOutsideToClose: false,
			locals: {
				warning: {
					title: 'Warning',
					description: "Are you sure that you want to delete file " + vm.fileEditor.name + "?",
				}
			},
			preserveScope: true,
			autoWrap: true,
			skipHide: true,
			multiple: true
		}).then(function (res) {

			if (res.status === 'agree') {

				var itemPath = vm.fileEditor.name;
				if (vm.currentPath.length) {
					itemPath = vm.currentPath.join('/') + '/' + vm.fileEditor.name
				}

				var is_dir = false;

				explorerService.deleteFile(itemPath, is_dir)

				setTimeout(function () {
					vm.showEditor = false;
					vm.listFiles();
				}, 600)

			}

		});

	}

	vm.closeFileEditor = function () {

		vm.showEditor = false;
		vm.currentPath.pop();

		vm.listFiles();
	}

	vm.copyLink = function ($event, item) {

		const url = window.location.origin + '/' + baseUrlService.getMasterUserPrefix() + '/api/storage' + item.file_path

		metaHelper.copyToBuffer(url)

	}

	vm.copyFilePath = function ($event, item) {

		metaHelper.copyToBuffer(item.file_path)

	}

	vm.renameFile = function ($mdMenu, $event, item) {

		$mdDialog.show({
			controller: 'CreateFileDialogController as vm',
			templateUrl: 'views/dialogs/create-file-dialog-view.html',
			parent: angular.element(document.body),
			targetEvent: $event,
			locals: {
				data: {}
			}

		}).then(function (res) {

			if (res.status === 'agree') {

				var oldItemPath = vm.fileEditor.name;
				if (vm.currentPath.length) {
					oldItemPath = vm.currentPath.join('/');
				}

				var is_dir = false;

				explorerService.deleteFile(oldItemPath, is_dir)

				vm.currentPath.pop();
				vm.currentPath.push(res.name);

				vm.fileEditor.name = res.name;

				vm.saveFileEditor().then(function () {
					window.location.hash = '#!/explorer/' + vm.currentPath.join('/')
				})

			}
		})

	}

	vm.downloadFile = function ($event, item) {

		console.log('downloadFile.item', item);

		var name = vm.currentPath[vm.currentPath.length - 1];
		//
		// var content = vm.editor.getValue();
		//
		// const blob = new Blob([content], {type: "plain/text"});
		//
		// downloadFileHelper.downloadFile(blob, "plain/text", name)

		var path = vm.currentPath.join('/') + '/' + item.name;

		explorerService.downloadFile({path: path}).then(function (blob) {

			downloadFileHelper.downloadFile(blob, "plain/text", item.name)

		})

	}

	vm.formatJSON = function ($event) {

		vm.fileEditor.content = JSON.parse(vm.editor.getValue());

		vm.editor.setValue(JSON.stringify(vm.fileEditor.content, null, 4));

	}

	vm.toggleSelectAll = function ($event) {

		vm.allSelected = !vm.allSelected;

		vm.selectedCount = 0;

		console.log('toggleSelectAll searchTerm', vm.searchTerm);

		vm.items.filter(function (item) {
			if (vm.searchTerm) {
				return item.name.indexOf(vm.searchTerm) !== -1
			}

			return true;

		}).forEach(function (item) {
			item.selected = vm.allSelected;

			if (item.selected) {
				vm.selectedCount = vm.selectedCount + 1;
			}

		})


	}

	vm.selectItem = function ($event, item) {

		item.selected = !item.selected;

		console.log(" vm.selectItem item", item)

		var allSelected = true;

		vm.selectedCount = 0;

		vm.items.filter(function (item) {
			if (vm.searchTerm) {
				return item.name.indexOf(vm.searchTerm) !== -1
			}
			return true;

		}).forEach(function (item) {
			if (!item.selected) {
				allSelected = false;
			}

			if (item.selected) {
				vm.selectedCount = vm.selectedCount + 1;
			}
		})

		vm.allSelected = allSelected;
	}

	vm.listFiles = function () {

		vm.processing = true;
		vm.selectedCount = 0;

		explorerService.listFiles(vm.currentPath.join('/')).then(function (data) {

			vm.items = data.results;

			vm.items = vm.items.filter(function (item) {

				var result = true

				if (item.name[0] === '.' && !vm.showHiddenFiles) {
					result = false;
				}

				return result

			})

			vm.processing = false;

			$scope.$apply();

		})

	}

	vm.deleteFolder = function ($event) {

		var path = vm.currentPath.join('/')

		$mdDialog.show({
			controller: 'WarningDialogController as vm',
			templateUrl: 'views/dialogs/warning-dialog-view.html',
			parent: angular.element(document.body),
			targetEvent: $event,
			clickOutsideToClose: false,
			locals: {
				warning: {
					title: 'Warning',
					description: "Are you sure that you want to delete folder " + path + "?",
				}
			},
			preserveScope: true,
			autoWrap: true,
			skipHide: true,
			multiple: true
		}).then(function (res) {
			console.log('res', res);
			if (res.status === 'agree') {

				explorerService.deleteFolder(path).then(function () {

					vm.currentPath.pop()

					vm.listFiles();

				})

			}

		})
	}

	vm.createFolder = function ($event) {

		$mdDialog.show({
			controller: 'CreateFolderDialogController as vm',
			templateUrl: 'views/dialogs/create-folder-dialog-view.html',
			parent: angular.element(document.body),
			targetEvent: $event,
			locals: {
				data: {}
			}

		}).then(function (res) {

			if (res.status === 'agree') {

				var itemPath = res.name
				if (vm.currentPath.length) {
					itemPath = vm.currentPath.join('/') + '/' + res.name
				}

				explorerService.createFolder(itemPath).then(function () {

					vm.listFiles();

				})
			}

		});

	}

	vm.createFile = function ($event) {

		$mdDialog.show({
			controller: 'CreateFileDialogController as vm',
			templateUrl: 'views/dialogs/create-file-dialog-view.html',
			parent: angular.element(document.body),
			targetEvent: $event,
			locals: {
				data: {}
			}

		}).then(function (res) {

			if (res.status === 'agree') {

				vm.fileEditor = {}

				vm.currentPath.push(res.name);

				var pathPieces = [...vm.currentPath]
				pathPieces.pop();

				var path = pathPieces.join('/');

				let formData = new FormData();

				let defaultContent = '';

				if (res.name.indexOf('.ipynb') !== -1) {

					defaultContent = {
						"metadata": {
							"kernelspec": {
								"name": "python",
								"display_name": "Python (Pyodide)",
								"language": "python"
							},
							"language_info": {
								"codemirror_mode": {
									"name": "python",
									"version": 3
								},
								"file_extension": ".py",
								"mimetype": "text/x-python",
								"name": "python",
								"nbconvert_exporter": "python",
								"pygments_lexer": "ipython3",
								"version": "3.8"
							}
						},
						"cells": []
					}

				}

				var content = JSON.stringify(defaultContent);

				console.log('path', path)
				console.log('name', res.name)

				const blob = new Blob([content], {type: vm.contentType});
				const file = new File([blob], res.name)

				formData.append("file", file)
				formData.append('path', path)

				explorerService.uploadFiles(formData).then(function (e) {

					if (res.name.indexOf('.ipynb') !== -1) {

						vm.playbook = null;
						vm.playbookName = res.name;

						vm.showPlaybook = true;

					} else {

						vm.fileEditor.name = res.name;
						vm.fileEditor.content = '';

						vm.draftUserCode = 'explorer.' + vm.currentPath.join('__');

						vm.showEditor = true;

					}

					setTimeout(function () {
						window.location.hash = '#!/explorer/' + vm.currentPath.join('/')
					}, 100);

					// vm.initFileEditor() // call after angular.js render

				})

			}

		});

	}

	vm.uploadFiles = function ($event) {

		document.querySelector('#explorerFileUploadInput').click();

	}

	vm.downloadZip = function ($event) {

		var path = vm.currentPath.join('/')

		$mdDialog.show({
			controller: 'SaveAsDialogController as vm',
			templateUrl: 'views/dialogs/save-as-dialog-view.html',
			parent: angular.element(document.body),
			targetEvent: $event,
			clickOutsideToClose: false,
			preserveScope: true,
			autoWrap: true,
			skipHide: true,
			multiple: true,
			locals: {
				data: {
					name: 'Archive'
				}
			}
		}).then(function (res) {

			if (res.status === 'agree') {

				var name = res.data.name + '.zip'

				var paths = []

				vm.items.forEach(function (item) {
					if (item.selected) {

						if (item.type === 'dir') {
							paths.push(vm.currentPath.join('/') + '/' + item.name + '/') // important to add trailing slash
						} else {
							paths.push(vm.currentPath.join('/') + '/' + item.name)
						}
					}
				})

				console.log('paths', paths);

				explorerService.downloadZip({paths: paths}).then(function (blob) {

					downloadFileHelper.downloadFile(blob, "application/zip", name)

				})

			}
		})

	}

	vm.sizePretty = function (size) {
		if (isNaN(size))
			size = 0;

		if (size < 1024)
			return size + ' Bytes';

		size /= 1024;

		if (size < 1024)
			return size.toFixed(2) + ' KB';

		size /= 1024;

		if (size < 1024)
			return size.toFixed(2) + ' MB';

		size /= 1024;

		return size.toFixed(2) + ' GB';
	};

	vm.uploadFileHandler = async function ($event) {

		vm.closeFileStatuses = false;

		var fileInput = document.querySelector('#explorerFileUploadInput')

		// Assuming vm.filesStatus is an array that you can access from your view to display status
		vm.filesStatus = Array.from(fileInput.files).map(function (file) {
			return {
				file: file,
				name: file.name,
				size: file.size,
				size_pretty: vm.sizePretty(file.size),
				status: 'init'  // initial status
			};
		});

		var path = vm.currentPath.join('/')

		for (let i = 0; i < vm.filesStatus.length; i++) {
			let fileStatus = vm.filesStatus[i];
			let formData = new FormData();
			formData.append("file", fileStatus.file);
			formData.append('path', path);

			fileStatus.status = 'progress';

			try {
				await explorerService.uploadFiles(formData);
				fileStatus.status = 'success';
			} catch (error) {
				fileStatus.status = 'error';
				console.error(`Failed to upload ${fileStatus.name}: ${error}`);
			}

			$scope.$apply();

		}

		vm.closeFileStatuses = true;

		// Clear the file input for the next set of uploads
		document.querySelector('#explorerFileUploadInput').value = "";
		vm.listFiles();

	}

	vm.toggleHidden = function () {

		vm.showHiddenFiles = !vm.showHiddenFiles;

		vm.listFiles();

	}

	vm.trustSrc = function (src) {
		return $sce.trustAsResourceUrl(src);
	}

	vm.resolveWorkflowIframeUrl = function () {

		vm.workflowIframeUrl = 'http://0.0.0.0:8084/space00000/workflow/'

		if (window.location.href.indexOf('finmars') !== -1) {
			vm.workflowIframeUrl = window.location.protocol + '//' + window.location.host + '/' + baseUrlService.getMasterUserPrefix() + '/workflow/'
		}

	}

	vm.openInNewTab = function ($event, item) {

		const url = window.location.origin + '/' + baseUrlService.getMasterUserPrefix() + '/api/storage' + item.file_path


		window.open(url, "_blank");
	}

	vm.deleteFile = function ($event, item) {

		var name = vm.currentPath[vm.currentPath.length - 1];

		$mdDialog.show({
			controller: 'WarningDialogController as vm',
			templateUrl: 'views/dialogs/warning-dialog-view.html',
			parent: angular.element(document.body),
			targetEvent: $event,
			clickOutsideToClose: false,
			locals: {
				warning: {
					title: 'Warning',
					description: "Are you sure that you want to delete " + name + "?",
				}
			},
			preserveScope: true,
			autoWrap: true,
			skipHide: true,
			multiple: true
		}).then(function (res) {

			if (res.status === 'agree') {

				var itemPath = vm.currentPath.join('/');

				explorerService.deleteFile(itemPath, false).then(function (data) {

					vm.showEditor = false;

					vm.currentPath.pop();

					window.location.hash = '#!/explorer/' + vm.currentPath.join('/');

					vm.listFiles();

				})


			}

		});

	}

	function getFileExtension(path) {
		// Split the path into segments
		let segments = path.split('/');
		// Take the last segment
		let lastSegment = segments[segments.length - 1];

		// If the last segment contains more than one dot, treat it as a directory
		if ((lastSegment.match(/\./g) || []).length > 1) {
			return null; // or whatever you want to return for directories
		} else {
			// Check for a file extension
			let extension = lastSegment.slice((lastSegment.lastIndexOf(".") - 1 >>> 0) + 2);
			return extension || null; // If there's no extension, return null
		}
	}

	vm.init = function () {

		vm.resolveWorkflowIframeUrl();

		console.log('$stateParams', $stateParams);

		if ($stateParams.folderPath) {
			vm.currentPath = $stateParams.folderPath.split('/')

			var extension = getFileExtension($stateParams.folderPath);

			if (extension) { // possible file is opened

				if (extension == 'ipynb') {

					vm.downloadAndOpenPlaybook();

				} else {

					vm.showEditor = true;

					vm.downloadAndEdit();

				}

			} else {
				vm.listFiles();
			}

		} else {
			vm.listFiles();
		}

		console.log("here?")


		vm.member = globalDataService.getMember();

	};

	vm.init();

}
