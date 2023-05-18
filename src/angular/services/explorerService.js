/**
 * Created by szhitenev on 04.10.2022.
 */

import explorerRepository from '../repositories/explorerRepository'

var listFiles = function (path) {
	return explorerRepository.listFiles(path)
}

var viewFile = function (path) {
	return explorerRepository.viewFile(path)
}

var deleteFile = function (path, is_dir) {
	return explorerRepository.deleteFile(path, is_dir)
}

var createFolder = function (path) {
	return explorerRepository.createFolder(path)
}

var uploadFiles = function (formData) {
	return explorerRepository.uploadFiles(formData)
}

export default {
	listFiles: listFiles,
	viewFile: viewFile,
	deleteFile: deleteFile,
	createFolder: createFolder,
	uploadFiles: uploadFiles,
}
