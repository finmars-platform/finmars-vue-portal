/**
 * Created by szhitenev on 20.05.2020.
 */

import bloombergDataProviderRepository from '../../repositories/data-providers/bloombergDataProviderRepository'

var getCredentialList = function (options) {
	return bloombergDataProviderRepository.getCredentialList(options)
}

var getCredentialByKey = function (id) {
	return bloombergDataProviderRepository.getCredentialByKey(id)
}

var createCredential = function (account) {
	return bloombergDataProviderRepository.createCredential(account)
}

var updateCredential = function (id, account) {
	return bloombergDataProviderRepository.updateCredential(id, account)
}

var deleteCredentialByKey = function (id) {
	return bloombergDataProviderRepository.deleteCredentialByKey(id)
}

export default {
	getCredentialList: getCredentialList,
	getCredentialByKey: getCredentialByKey,
	createCredential: createCredential,
	updateCredential: updateCredential,
	deleteCredentialByKey: deleteCredentialByKey,
}
