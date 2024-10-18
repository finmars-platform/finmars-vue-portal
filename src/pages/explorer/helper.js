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
		console.log(error);
		return false;
	}
}
