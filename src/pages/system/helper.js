export function getRealmSpaceCodes(route) {
	const pathnamePartsList = route.fullPath.split('/');
	const realmCode = pathnamePartsList.find((part) => part.startsWith('realm'));
	const spaceCode = pathnamePartsList.find((part) => part.startsWith('space'));
	return { realmCode, spaceCode };
}

export async function loadMultiselectOpts(
	routeOpt,
	readyStatusObj,
	readyStatusProp
) {
	const res = await useApi(routeOpt);
	if (!res._$error) {
		readyStatusObj[readyStatusProp] = true;
		return res.results;
	}
	return [];
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
