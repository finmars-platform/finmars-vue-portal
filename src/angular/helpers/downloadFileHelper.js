function downloadFile(blobParts, blobType, downloadFileName) {
	// It is necessary to create a new blob object with mime-type explicitly set
	// otherwise only Chrome works like it should
	var newBlob = new Blob([blobParts], { type: blobType })



	// IE doesn't allow using a blob object directly as link href
	// instead it is necessary to use msSaveOrOpenBlob
	if (window.navigator && window.navigator.msSaveOrOpenBlob) {
		window.navigator.msSaveOrOpenBlob(newBlob)
		return
	}

	// For other browsers:
	// Create a link pointing to the ObjectURL containing the blob.
	var data = window.URL.createObjectURL(newBlob)
	var link = document.createElement('a')
	link.href = data
	link.download = downloadFileName

	document.body.appendChild(link) // For Mozilla Firefox
	link.click()

	setTimeout(function () {
		document.body.removeChild(link)
		window.URL.revokeObjectURL(data)
	}, 100)
}

export default {
	downloadFile: downloadFile,
}
