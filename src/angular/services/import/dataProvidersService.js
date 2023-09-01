/**
 * Created by szhitenev on 17.08.2016.
 */

import dataProvidersRepository from '../../repositories/import/dataProvidersRepository'

var getList = function () {
	return dataProvidersRepository.getList()
}

var getConfigs = function () {
	return dataProvidersRepository.getConfigs()
}

var getConfig = function (providerId) {
	return dataProvidersRepository.getConfig(providerId)
}

var setConfig = function (providerId, provider) {
	return dataProvidersRepository.setConfig(providerId, provider)
}

var createConfig = function (provider) {
	return dataProvidersRepository.createConfig(provider)
}

var bloombergTestCertificate = function (data) {
	return dataProvidersRepository.bloombergTestCertificate(data)
}

var getPersonalProvidersList = function () {
	return dataProvidersRepository.getPersonalProvidersList()
}

var getCredentials = function () {
	return dataProvidersRepository.getCredentials()
}

var createCredential = function (data) {
	return dataProvidersRepository.createCredential(data)
}

var editCredential = function (id, data) {
	return dataProvidersRepository.editCredential(id, data)
}

var deleteCredential = function (id) {
	return dataProvidersRepository.deleteCredential(id)
}

export default {
	getList: getList,
	getConfigs: getConfigs,
	getConfig: getConfig,
	setConfig: setConfig,
	createConfig: createConfig,
	bloombergTestCertificate: bloombergTestCertificate,

	getPersonalProvidersList: getPersonalProvidersList,
	getCredentials: getCredentials,
	createCredential: createCredential,
	editCredential: editCredential,
	deleteCredential: deleteCredential,
}
