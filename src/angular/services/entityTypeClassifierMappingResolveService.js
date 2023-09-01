/**
 * Created by szhitenev on 19.08.2016.
 */

import accountClassifierMappingService from './import/mappings/classifiers/accountClassifierMappingService'
import counterpartyClassifierMappingService from './import/mappings/classifiers/counterpartyClassifierMappingService'
import responsibleClassifierMappingService from './import/mappings/classifiers/responsibleClassifierMappingService'
import portfolioClassifierMappingService from './import/mappings/classifiers/portfolioClassifierMappingService'
import instrumentClassifierMappingService from './import/mappings/classifiers/instrumentClassifierMappingService'

var getList = function (entityType, attribute_type_id) {


	switch (entityType) {
		case 'account':
			return accountClassifierMappingService.getList(attribute_type_id)
			break
		case 'counterparty':
			return counterpartyClassifierMappingService.getList(attribute_type_id)
			break
		case 'responsible':
			return responsibleClassifierMappingService.getList(attribute_type_id)
			break
		case 'portfolio':
			return portfolioClassifierMappingService.getList(attribute_type_id)
			break
		case 'instrument':
			return instrumentClassifierMappingService.getList(attribute_type_id)
			break
	}
}

var getByKey = function (entityType, id) {
	switch (entityType) {
		case 'account':
			return accountClassifierMappingService.getByKey(id)
			break
		case 'counterparty':
			return counterpartyClassifierMappingService.getByKey(id)
			break
		case 'responsible':
			return responsibleClassifierMappingService.getByKey(id)
			break
		case 'portfolio':
			return portfolioClassifierMappingService.getByKey(id)
			break
		case 'instrument':
			return instrumentClassifierMappingService.getByKey(id)
			break
	}
}

var create = function (entityType, map) {
	switch (entityType) {
		case 'account':
			return accountClassifierMappingService.create(map)
			break
		case 'counterparty':
			return counterpartyClassifierMappingService.create(map)
			break
		case 'responsible':
			return responsibleClassifierMappingService.create(map)
			break
		case 'portfolio':
			return portfolioClassifierMappingService.create(map)
			break
		case 'instrument':
			return instrumentClassifierMappingService.create(map)
			break
	}
}

var update = function (entityType, id, map) {
	switch (entityType) {
		case 'account':
			return accountClassifierMappingService.update(id, map)
			break
		case 'counterparty':
			return counterpartyClassifierMappingService.update(id, map)
			break
		case 'responsible':
			return responsibleClassifierMappingService.update(id, map)
			break
		case 'portfolio':
			return portfolioClassifierMappingService.update(id, map)
			break
		case 'instrument':
			return instrumentClassifierMappingService.update(id, map)
			break
	}
}

var deleteByKey = function (entityType, id) {
	switch (entityType) {
		case 'account':
			return accountClassifierMappingService.deleteByKey(id)
			break
		case 'counterparty':
			return counterpartyClassifierMappingService.deleteByKey(id)
			break
		case 'responsible':
			return responsibleClassifierMappingService.deleteByKey(id)
			break
		case 'portfolio':
			return portfolioClassifierMappingService.deleteByKey(id)
			break
		case 'instrument':
			return instrumentClassifierMappingService.deleteByKey(id)
			break
	}
}

export default {
	getList: getList,
	getByKey: getByKey,
	create: create,
	update: update,
	deleteByKey: deleteByKey,
}
