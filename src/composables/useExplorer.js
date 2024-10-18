import {
	isEditorFile,
	getCurrentUrl,
	getRealmSpaceCodes,
	downloadFile,
	getItemsForAction,
	copyToBuffer
} from '~/pages/explorer/helper';

export function useExplorer() {
	const store = useStore();
	const router = useRouter();
	const route = useRoute();
	const processing = ref(false);
	const selectedCount = ref(0);
	const allSelected = ref(false);
	const currentPath = ref([]);
	const items = ref([]);
	const showHiddenFiles = ref(false);
	const label = ref('');
	const teIsOpened = ref(false);
	const teValue = ref('');
	const isMove = ref(false);
	const itemsToMove = ref([]);
	const pathToMove = ref('');
	const isFile = ref(false);
	const isZip = ref(false);
	const isRename = ref(false);
	const isEditor = ref(false);
	const closeFileStatuses = ref(false);
	const filesStatus = ref([]);
	const playbook = ref(null);
	const playbookName = ref('');
	const showPlaybook = ref(false);
	const draftUserCode = ref('');
	const hideItemsCount = ref(null);
	const exportTaskId = ref(null);
	const searchTerm = ref('');
	const debounceTimeout = ref(0);
	const currentPage = ref(1);
	const currentPageForFiles = ref(1);
	const currentPageForSearch = ref(1);
	const pageSize = ref(100);
	const pages = ref([]);
	const totalPages = ref(0);
	const content = ref('test data');
	const oldItem = ref({});

	watch(searchTerm, (newVal, oldVal) => {
		if (newVal !== oldVal) {
			search(newVal);
		}
	});

	function formatDate(dateString) {
		if (!dateString) return;
		const date = new Date(dateString);
		const year = date.getFullYear();
		const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
		const day = String(date.getDate()).padStart(2, '0');
		const hours = String(date.getHours()).padStart(2, '0');
		const minutes = String(date.getMinutes()).padStart(2, '0');
		const seconds = String(date.getSeconds()).padStart(2, '0');
		return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
	}

	function generatePages(data) {
		totalPages.value = Math.ceil(data.count / pageSize.value);
		pages.value = [];
		for (let i = 1; i <= totalPages.value; i = i + 1) {
			pages.value.push({
				number: i,
				caption: i.toString()
			});
		}
		if (totalPages.value > 10) {
			let currentPageIndex = 0;
			pages.value.forEach(function (item, index) {
				if (currentPage.value === item.number) {
					currentPageIndex = index;
				}
			});
			pages.value = pages.value.filter(function (item, index) {
				return (
					index < 2 ||
					index > totalPages.value - 3 ||
					index === currentPageIndex ||
					(index > currentPageIndex - 3 && index < currentPageIndex) ||
					(index < currentPageIndex + 3 && index > currentPageIndex)
				);
			});

			for (let i = 0; i < pages.value.length; i = i + 1) {
				const j = i + 1;
				if (j < pages.value.length) {
					if (pages.value[j].number && pages.value[i].number) {
						if (pages.value[j].number - pages.value[i].number > 1) {
							pages.value.splice(i + 1, 0, {
								caption: '...'
							});
						}
					}
				}
			}
		}
	}

	function openPreviousPage() {
		if (searchTerm.value.length) {
			currentPageForSearch.value = currentPageForSearch.value - 1;
			search(searchTerm.value);
		} else {
			currentPageForFiles.value = currentPageForFiles.value - 1;
			listFiles();
		}
	}

	function openNextPage() {
		if (searchTerm.value.length) {
			currentPageForSearch.value = currentPageForSearch.value + 1;
			search(searchTerm.value);
		} else {
			currentPageForFiles.value = currentPageForFiles.value + 1;
			listFiles();
		}
	}

	function openPage(page) {
		if (page.number) {
			if (searchTerm.value.length) {
				currentPageForSearch.value = page.number;
				search(searchTerm.value);
			} else {
				currentPageForFiles.value = page.number;
				listFiles();
			}
		}
	}

	function search(query) {
		if (debounceTimeout) {
			clearTimeout(debounceTimeout.value);
		}
		debounceTimeout.value = setTimeout(async function () {
			if (query.length) {
				hideItemsCount.value = 0;
				currentPage.value = currentPageForSearch.value;
				const options = {
					pageSize: pageSize.value,
					page: currentPageForSearch.value,
					query: query
				};
				try {
					const data = await useApi('explorerSearch.get', { filters: options });
					if (data) {
						generatePages(data);
						items.value = data.results;
						processing.value = false;
					}
				} catch (error) {
					console.warn('Error explorerSearch.get', error);
				}
			} else {
				currentPageForSearch.value = 1;
				await listFiles();
			}
		}, 300);
	}

	function sizePretty(size) {
		if (isNaN(size)) size = 0;

		if (size < 1024) return size + ' Bytes';

		size /= 1024;

		if (size < 1024) return size.toFixed(2) + ' KB';

		size /= 1024;

		if (size < 1024) return size.toFixed(2) + ' MB';

		size /= 1024;

		return size.toFixed(2) + ' GB';
	}

	async function listFiles() {
		processing.value = true;
		selectedCount.value = 0;
		currentPage.value = currentPageForFiles.value;
		isEditor.value = isEditorFile(currentPath.value.join('/'));
		let data = null;
		try {
			if (searchTerm.value) {
				search(searchTerm.value);
			} else {
				data = await useApi('explorer.get', {
					filters: {
						page_size: pageSize.value,
						page: currentPageForFiles.value,
						path: currentPath.value.join('/')
					}
				});
			}
			if (data) {
				generatePages(data);
				const itemsCountBefore = data.results.length ?? 0;
				items.value = data.results.filter(function (item) {
					let result = true;
					if (item.name[0] === '.' && !showHiddenFiles.value) {
						result = false;
					}
					return result;
				});
				const itemsCountAfter = items.value.length ?? 0;
				hideItemsCount.value = itemsCountBefore - itemsCountAfter;
				processing.value = false;
			}
		} catch (e) {
			console.warn('Error explorer.get', e);
		}
	}

	function openCreateFileModal() {
		label.value = 'Type a filename';
		teIsOpened.value = true;
		isFile.value = true;
	}

	function openCreateFolderModal() {
		label.value = 'Type a filename';
		teIsOpened.value = true;
	}

	function openDownloadZipModal() {
		isZip.value = true;
		label.value = 'Save as';
		teValue.value = 'Archive';
		teIsOpened.value = true;
	}

	function openRename(item) {
		isRename.value = true;
		label.value = 'Rename';
		teValue.value = item.name;
		teIsOpened.value = true;
		oldItem.value = item;
	}

	function openMove(item = null) {
		isMove.value = true;
		label.value = 'Move Editor';
		itemsToMove.value = getItemsForAction(items, item);
	}

	async function openDeleteSelected(item = undefined) {
		const itemsToDelete = getItemsForAction(items, item);
		const names = itemsToDelete
			.map(function (item) {
				return item.name;
			})
			.join(', ');
		const confirm = await useConfirm({
			title: 'Warning',
			text: `Are you sure that you want to delete ${names}?`
		});
		if (confirm) {
			deleteSelected();
		}
	}

	function cancel() {
		label.value = '';
		teValue.value = '';
		teIsOpened.value = false;
		isFile.value = false;
		isZip.value = false;
		isRename.value = false;
		isMove.value = false;
	}

	async function createFile() {
		const fileEditor = {};
		currentPath.value.push(teValue.value);
		const pathPieces = [...currentPath.value];
		pathPieces.pop();
		const path = pathPieces.join('/');
		const formData = new FormData();
		let defaultContent = '';
		if (teValue.value.indexOf('.ipynb') !== -1) {
			defaultContent = {
				metadata: {
					kernelspec: {
						name: 'python',
						display_name: 'Python (Pyodide)',
						language: 'python'
					},
					language_info: {
						codemirror_mode: {
							name: 'python',
							version: 3
						},
						file_extension: '.py',
						mimetype: 'text/x-python',
						name: 'python',
						nbconvert_exporter: 'python',
						pygments_lexer: 'ipython3',
						version: '3.8'
					}
				},
				cells: []
			};
		}
		const content = JSON.stringify(defaultContent);
		const blob = new Blob([content]);
		const file = new File([blob], teValue.value);
		formData.append('file', file);
		formData.append('path', path);
		const res = await useApi('explorerFile.post', {
			body: formData
		});
		if (res?.status === 'ok') {
			if (teValue.value.indexOf('.ipynb') !== -1) {
				playbook.value = null;
				playbookName.value = teValue.value.slice(0);
				showPlaybook.value = true;
			} else {
				fileEditor.name = teValue.value;
				fileEditor.content = '';
				draftUserCode.value = 'explorer.' + currentPath.value.join('__');
				isEditor.value = true;
			}
			const newUrl = getCurrentUrl(currentPath.value.join('/'), route);
			cancel();
			router.push(newUrl);
		}
	}

	async function createFolder() {
		let itemPath = teValue.value;
		if (currentPath.value.length) {
			itemPath = currentPath.value.join('/') + '/' + itemPath;
		}
		if (itemPath?.length) {
			const options = {
				body: { path: itemPath }
			};
			const res = await useApi('explorerFolder.post', options);
			if (res.status === 'ok') {
				cancel();
				await listFiles();
			}
		}
	}

	function toggleHidden() {
		showHiddenFiles.value = !showHiddenFiles.value;
		listFiles();
	}

	async function sync() {
		const res = await useApi('explorerSync.post');
		if (res.status === 'ok') {
			exportTaskId.value = res.task_id;
		}
	}

	async function breadcrumbsNavigation(itemIndex) {
		if (itemIndex === -1) {
			currentPath.value = [];
			const { realmCode, spaceCode } = getRealmSpaceCodes(route);
			router.push(`/${realmCode}/${spaceCode}/v/explorer`);
		} else {
			currentPath.value = currentPath.value.filter(function (item, index) {
				return index <= itemIndex;
			});
			const currentPathData = route.fullPath.split('/');
			const dynamicSegments = currentPath.value;
			const indexOfExplorer = currentPathData.indexOf('explorer');
			if (indexOfExplorer !== -1) {
				currentPathData.splice(
					indexOfExplorer + 1,
					currentPathData.length,
					...dynamicSegments
				);
			}
			const newPath = currentPathData.join('/');
			router.push(newPath);
		}
		await listFiles();
	}

	function removeActiveTaskId() {
		exportTaskId.value = null;
	}

	function create() {
		if (isFile.value) {
			createFile();
		} else if (isZip.value) {
			downloadZip();
		} else if (isRename.value) {
			rename();
		} else if (isMove.value) {
			move();
		} else {
			createFolder();
		}
	}

	function uploadFiles() {
		document.querySelector('#explorerFileUploadInput').click();
	}

	async function uploadFileHandler() {
		closeFileStatuses.value = false;
		const fileInput = document.querySelector('#explorerFileUploadInput');
		filesStatus.value = Array.from(fileInput.files).map(function (file) {
			return {
				file: file,
				name: file.name,
				size: file.size,
				size_pretty: sizePretty(file.size),
				status: 'init'
			};
		});
		const path = currentPath.value.join('/');
		for (let i = 0; i < filesStatus.value.length; i++) {
			let fileStatus = filesStatus.value[i];
			const formData = new FormData();
			formData.append('file', fileStatus.file);
			formData.append('path', path);
			fileStatus.status = 'progress';
			try {
				await useApi('explorerFile.post', {
					body: formData
				});
				fileStatus.status = 'success';
			} catch (error) {
				fileStatus.status = 'error';
				console.error(`Failed to upload ${fileStatus.name}: ${error}`);
			}
		}
		closeFileStatuses.value = true;
		document.querySelector('#explorerFileUploadInput').value = '';
		await listFiles();
	}

	function toggleSelectAll() {
		selectedCount.value = 0;
		items.value.forEach(function (item) {
			item.selected = allSelected.value;
			if (item.selected) {
				selectedCount.value++;
			}
		});
	}

	function selectItem() {
		let isAllSelected = true;
		selectedCount.value = 0;
		items.value.forEach(function (item) {
			if (!item.selected) {
				isAllSelected = false;
			} else {
				selectedCount.value = selectedCount.value + 1;
			}
		});
		allSelected.value = isAllSelected;
	}

	async function openFolder(item) {
		currentPath.value.push(item.name);
		router.push(route.fullPath + '/' + item.name);
	}

	function editFile(item) {
		const filePath = item.file_path.split('/');
		currentPath.value = filePath.filter((element) => element !== '');
		const hasSpace = currentPath.value.some((element) =>
			element.includes('space')
		);
		if (hasSpace) {
			currentPath.value = currentPath.value.filter(
				(element) => !element.includes('space')
			);
		}
		const hasFileName = currentPath.value.some((element) =>
			element.includes(item.name)
		);
		if (!hasFileName) {
			currentPath.value.push(item.name);
		}
		currentPath.value = currentPath.value.filter((item) => item !== '');
		const pathForEditor = [...currentPath.value];
		const url = 'explorer/' + pathForEditor.join('/');
		currentPath.value.pop();
		const newUrl = getCurrentUrl(url, route);
		window.open(newUrl.href, '_blank');
	}

	function init() {
		const parts = route.fullPath.split('/v/explorer');
		if (parts.length > 1 && parts[1].length) {
			currentPath.value = parts[1].replace('/', '').split('/');
		}
		listFiles();
	}

	function editorInit(editor) {
		editor.setHighlightActiveLine(false);
		editor.setShowPrintMargin(false);
		editor.setFontSize(14);
		editor.setBehavioursEnabled(true);
		editor.focus();
		editor.navigateFileStart();
	}

	function openFile(index, item) {
		const pathParts = item.file_path.split('/').filter((element) => !!element);
		currentPath.value = pathParts.slice(0, index + 1).join('/');
		const isFile = isEditorFile(currentPath.value);
		if (isFile) {
			editFile(item);
		} else {
			router.push('explorer/' + currentPath.value);
		}
	}

	async function downloadZip() {
		const name = teValue.value + '.zip';
		const paths = [];
		items.value.forEach(function (item) {
			if (item.selected) {
				if (item.type === 'dir') {
					paths.push(currentPath.value.join('/') + '/' + item.name + '/'); // important to add trailing slash
				} else {
					paths.push(currentPath.value.join('/') + '/' + item.name);
				}
			}
		});
		try {
			const blobData = await useApi('explorerDownloadAsZip.post', {
				body: { paths }
			});
			if (blobData) {
				downloadFile(blobData, 'application/zip', name);
			}
			cancel();
		} catch (error) {
			console.error('Error fetching ZIP:', error);
		}
	}

	function deleteSelected(item = undefined) {
		const itemsToDelete = getItemsForAction(items, item);
		if (
			currentPageForFiles.value > 1 &&
			items.value.length - itemsToDelete.length === 0
		) {
			currentPageForFiles.value = currentPageForFiles.value - 1;
			allSelected.value = false;
		}
		for (const item of itemsToDelete) {
			let path = currentPath.value.join('/') + '/' + item.name;
			let res;
			try {
				if (item.type === 'dir') {
					res = useApi('explorerDeleteFolder.post', { body: { path } });
				} else {
					if (searchTerm.value.length) {
						path = item.file_path;
					}
					res = useApi('explorerDelete.post', { filters: { path } });
				}
				if (res.status === 'ok') {
					useNotify({
						type: 'success',
						title: `${item.name} successfully deleted`
					});
					listFiles();
				}
			} catch (error) {
				console.log('Delete' + error);
				useNotify({
					type: 'error',
					title: `${item.name} - Something went wrong!`
				});
			}
		}
	}

	async function rename() {
		const name = oldItem.value.name;
		let path = '';
		try {
			if (oldItem.value.type === 'dir') {
				path = currentPath.value.join('/') + '/' + name;
			} else {
				path = oldItem.value.file_path.startsWith('/')
					? oldItem.value.file_path.substring(1)
					: oldItem.value.file_path;
			}
			const res = await useApi('explorerRename.post', {
				body: { new_name: teValue.value, path: path }
			});
			if (res.status === 'ok') {
				useNotify({
					type: 'success',
					title: `${teValue.value} successfully renamed`
				});
			}
			exportTaskId.value = res.task_id;
			oldItem.value = {};
			cancel();
		} catch (error) {
			useNotify({
				type: 'success',
				title: `${oldItem.value.name} rename failed!`
			});
		}
	}

	function openInNewTab(item) {
		const { realmCode, spaceCode } = getRealmSpaceCodes(route);
		let url =
			window.location.origin +
			'/' +
			`${realmCode}/${spaceCode}/v/explorer` +
			item.file_path;
		if (!item.file_path.startsWith('/')) {
			url =
				window.location.origin +
				'/' +
				`${realmCode}/${spaceCode}/v/explorer/` +
				item.file_path;
		}
		window.open(url, '_blank');
	}

	function copyLink(item) {
		const { realmCode, spaceCode } = getRealmSpaceCodes(route);
		let url =
			window.location.origin +
			'/' +
			`${realmCode}/${spaceCode}/v/explorer` +
			item.file_path;
		if (!item.file_path.startsWith('/')) {
			url =
				window.location.origin +
				'/' +
				`${realmCode}/${spaceCode}/v/explorer/` +
				item.file_path;
		}
		copyFilePath({ file_path: url });
	}

	function copyFilePath(item) {
		const copy = copyToBuffer(item.file_path);
		if (copy) {
			useNotify({ type: 'info', title: 'Copied' });
		} else {
			useNotify({ type: 'error', title: 'Copy Filed' });
		}
	}

	async function download(item) {
		const path = currentPath.value.join('/') + '/' + item.name;
		try {
			const blobData = await useApi('explorerDownload.post', {
				body: { path }
			});
			if (blobData) {
				downloadFile(blobData, 'plain/text', item.name);
			}
		} catch (error) {
			console.error('Error fetching ZIP:', error);
		}
	}

	function getPathToMove(data) {
		pathToMove.value = data ? data : '';
	}

	async function move() {
		const paths = [];
		try {
			itemsToMove.value.forEach((item) => {
				if (item.type === 'file') {
					paths.push(item.file_path);
				}
			});
			const res = await useApi('explorer.post', {
				body: { target_directory_path: pathToMove.value, paths }
			});
			if (res.status === 'ok') {
				exportTaskId.value = res.task_id;
				cancel();
			}
		} catch (error) {
			console.log(error);
			useNotify({ type: 'error', title: 'Move failed!' });
		}
	}

	init();

	return {
		store,
		formatDate,
		processing,
		selectedCount,
		listFiles,
		items,
		label,
		teIsOpened,
		teValue,
		openCreateFileModal,
		cancel,
		create,
		openCreateFolderModal,
		uploadFileHandler,
		uploadFiles,
		showHiddenFiles,
		hideItemsCount,
		toggleHidden,
		sync,
		exportTaskId,
		removeActiveTaskId,
		allSelected,
		toggleSelectAll,
		selectItem,
		searchTerm,
		currentPage,
		totalPages,
		pages,
		openPreviousPage,
		openNextPage,
		openPage,
		closeFileStatuses,
		filesStatus,
		currentPath,
		breadcrumbsNavigation,
		openFolder,
		editFile,
		editorInit,
		content,
		isEditor,
		openFile,
		openDownloadZipModal,
		openDeleteSelected,
		openRename,
		openInNewTab,
		copyLink,
		copyFilePath,
		download,
		openMove,
		isMove,
		getPathToMove
	};
}
