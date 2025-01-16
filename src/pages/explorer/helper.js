export function getRealmSpaceCodes(route) {
	const pathnamePartsList = route.fullPath.split('/');
	const realmCode = pathnamePartsList.find((part) => part.startsWith('realm'));
	const spaceCode = pathnamePartsList.find((part) => part.startsWith('space'));
	return { realmCode, spaceCode };
}

export function isEditorFile(string = window.location.href) {
	return /\.(txt|css|js|html|yml|yaml|ipynb|json|py|md|xml|csv|jpg|jpeg|png|gif|svg|bmp|mp4|mp3|wav|zip|tar|gz|pdf|doc|docx|ppt|pptx)$/i.test(
		string
	);
}

export function getCurrentUrl(url, route) {
	const { realmCode, spaceCode } = getRealmSpaceCodes(route);
	const baseUrl = window.location.origin + `/${realmCode}/${spaceCode}/v/`;
	return new URL(url, baseUrl);
}

export function downloadFile(blobParts, blobType, downloadFileName) {
	// Create a new blob object with the specified mime-type
	const newBlob = new Blob([blobParts], { type: blobType });

	// Check if we're in an IE environment and handle it accordingly
	if (window.navigator && window.navigator.msSaveOrOpenBlob) {
		window.navigator.msSaveOrOpenBlob(newBlob);
		return;
	}

	// For modern browsers: Create a link pointing to the ObjectURL containing the blob
	const data = window.URL.createObjectURL(newBlob);
	const link = document.createElement('a');
	link.href = data;
	link.download = downloadFileName;

	// Append the link to the document and trigger the download
	document.body.appendChild(link);
	link.click();

	// Clean up after the download is initiated
	setTimeout(() => {
		document.body.removeChild(link);
		window.URL.revokeObjectURL(data);
	}, 100);
}

export function getItemsForAction(items, item = null) {
	let forActionItems = [];
	if (item) {
		item.selected = true;
		forActionItems = [item];
		return forActionItems;
	} else {
		forActionItems = items.value.filter(function (item) {
			return item.selected;
		});
	}
	return forActionItems;
}

export function copyToBuffer(content) {
	try {
		const listener = function (e) {
			e.clipboardData.setData('text/plain', content);
			e.preventDefault();
		};
		document.addEventListener('copy', listener, false);
		document.execCommand('copy');
		document.removeEventListener('copy', listener, false);
		return true;
	} catch (error) {
		console.error(error);
		return false;
	}
}

export function getFileExtension(path) {
	// Split the path into segments
	let segments = path.split('/');

	// Take the last segment
	let lastSegment = segments[segments.length - 1];

	// If the last segment contains more than one dot, treat it as a directory
	if ((lastSegment.match(/\./g) || []).length > 1) {
		return null; // or whatever you want to return for directories
	} else {
		// Check for a file extension
		let extension = lastSegment.slice(
			((lastSegment.lastIndexOf('.') - 1) >>> 0) + 2
		);
		return extension || null; // If there's no extension, return null
	}
}

export function buildFileBlob(response, fileName) {
	if (fileName.indexOf('.json') !== -1 || fileName.indexOf('.ipynb') !== -1) {
		return [JSON.stringify(response, null, 2)];
	} else {
		return [response];
	}
}

export function getMimeType(fileName = '.json') {
	const extension = fileName.split('.').pop().toLowerCase();
	const mimeTypes = {
		txt: 'text/plain',
		html: 'text/html',
		css: 'text/css',
		py: 'application/json',
		ipynb: 'application/json',
		js: 'application/javascript',
		json: 'application/json',
		xml: 'application/xml',
		pdf: 'application/pdf',
		csv: 'text/csv',
		jpg: 'image/jpeg',
		jpeg: 'image/jpeg',
		png: 'image/png',
		gif: 'image/gif',
		svg: 'image/svg+xml',
		bmp: 'image/bmp',
		webp: 'image/webp',
		ico: 'image/x-icon',
		mp3: 'audio/mpeg',
		wav: 'audio/wav',
		mp4: 'video/mp4',
		mov: 'video/quicktime',
		avi: 'video/x-msvideo',
		zip: 'application/zip',
		rar: 'application/x-rar-compressed',
		'7z': 'application/x-7z-compressed',
		doc: 'application/msword',
		docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
		xls: 'application/vnd.ms-excel',
		xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
		ppt: 'application/vnd.ms-powerpoint',
		pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation'
	};
	return mimeTypes[extension];
}
