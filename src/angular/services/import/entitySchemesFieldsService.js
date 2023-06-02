/**
 * Created by szhitenev on 20.03.2018.
 */

import schemesFieldsRepository from '../../repositories/import/entitySchemesFieldsRepository'

var getSchemeFields = function (schemeId) {
	return schemesFieldsRepository.getSchemeFields(schemeId)
}

var create = function (fields) {
	return schemesFieldsRepository.create(fields)
}

var deleteById = function (id) {
	return schemesFieldsRepository.deleteById(id)
}

export default {
	getSchemeFields: getSchemeFields,
	create: create,
	deleteById: deleteById,
}
