/**
 * Created by szhitenev on 04.10.2022.
 */

import explorerRepository from '../repositories/explorerRepository'

var listFiles = function (path) {
	return explorerRepository.listFiles(path);
};

var viewFile = function (path) {
	return explorerRepository.viewFile(path);
}

var deleteFile = function (path, is_dir) {
	return explorerRepository.deleteFile(path, is_dir);
}

var createFolder = function (path) {
	return explorerRepository.createFolder(path);
}

var deleteFolder = function (path) {
	return explorerRepository.deleteFolder(path);
}

var uploadFiles = function (formData) {
	return explorerRepository.uploadFiles(formData);
}


var downloadZip = function (data) {
	return explorerRepository.downloadZip(data)
}

var downloadFile = function (data) {
	return explorerRepository.downloadFile(data)
}


export default {
	listFiles: listFiles,
	viewFile: viewFile,
	deleteFile: deleteFile,
	createFolder: createFolder,
	deleteFolder: deleteFolder,
	uploadFiles: uploadFiles,
	downloadZip: downloadZip,
	downloadFile: downloadFile
}
