/**
 * Created by szhitenev on 12.09.2016.
 */

import accountTypeModel from '../../models/accountTypePropsModel'
import instrumentType from '../../models/instrumentTypePropsModel'
import currencyModel from '../../models/currencyPropsModel'

import entityResolverService from '../entityResolverService'

var modelContainer = {
	'accounts.accounttype': accountTypeModel.getAttributes(),
	'instruments.instrumenttype': instrumentType.getAttributes(),
	'currencies.currency': currencyModel.getAttributes(),
}

var setDefaultRelation = function (item, propertyItem, cacheContainer) {
	return new Promise(function (resolve, reject) {
		if (
			cacheContainer[propertyItem.value_entity] &&
			cacheContainer[propertyItem.value_entity]['-']
		) {
			item[propertyItem.key] = cacheContainer[propertyItem.value_entity]['-']

			resolve(item)
		} else {
			cacheContainer[propertyItem.value_entity] = {}

			if (propertyItem.code === 'user_code') {
				entityResolverService
					.getList(propertyItem.value_entity, {
						filters: {
							user_code: '-',
						},
					})
					.then(function (data) {
						if (data.results.length) {
							data.results.forEach(function (resultItem) {
								if (resultItem.user_code === '-') {
									item[propertyItem.key] = resultItem.id

									cacheContainer[propertyItem.value_entity]['-'] = resultItem.id

									resolve(item)
								}
							})
						} else {
							reject(new Error('Default value (-) is not exists'))
						}
					})
			} else {
				entityResolverService
					.getList(propertyItem.value_entity, {
						filters: {
							user_code: '-',
						},
					})
					.then(function (data) {
						if (data.length) {
							data.forEach(function (resultItem) {
								if (resultItem.user_code === '-') {
									item[propertyItem.key] = resultItem.id

									cacheContainer[propertyItem.value_entity]['-'] = resultItem.id

									resolve(item)
								}
							})
						} else {
							reject(new Error('Default value (-) is not exists'))
						}
					})
			}
		}
	})
}

var simpleRepair = function (item, contentType, cacheContainer) {
	return new Promise(function (resolve, reject) {
		var promises = []

		modelContainer[contentType].forEach(function (propertyItem) {
			if (!item.hasOwnProperty(propertyItem.key)) {
				item[propertyItem.key] = null
			}

			if (!item[propertyItem.key] && propertyItem.allow_null === false) {
				if (propertyItem.value_type === 'field') {
					promises.push(setDefaultRelation(item, propertyItem, cacheContainer))
				}
			}
		})

		Promise.all(promises).then(function (data) {
			resolve(item)
		})
	})
}

var handleItem = function (item, contentType, cacheContainer) {
	return new Promise(function (resolve, reject) {
		switch (contentType) {
			case 'accounts.accounttype':
				resolve(simpleRepair(item, contentType, cacheContainer))
				break
			case 'instruments.instrumenttype':
				resolve(simpleRepair(item, contentType, cacheContainer))
				break
			case 'currencies.currency':
				resolve(simpleRepair(item, contentType, cacheContainer))
				break
			default:
				resolve(item)
		}
	})
}

var loadDefaultRelations = function (cacheContainer) {
	return new Promise(function (resolve, reject) {
		var promises = []

		promises.push(
			setDefaultRelation(
				{},
				{
					value_entity: 'transaction-type',
					code: 'user_code',
					key: 'transaction_type',
				},
				cacheContainer
			)
		)
		promises.push(
			setDefaultRelation(
				{},
				{
					value_entity: 'transaction-class',
					code: 'user_code',
					key: 'transaction_class',
				},
				cacheContainer
			)
		)

		Promise.all(promises).then(function (data) {
			console.log('default relation values', data)

			resolve(data)
		})
	})
}

var repairItems = function (entities) {
	return new Promise(function (resolve, reject) {
		var cacheContainer = {}

		loadDefaultRelations(cacheContainer).then(function () {
			var promises = []

			entities.forEach(function (entityItem) {
				entityItem.content.forEach(function (item) {
					if (item.active) {
						promises.push(handleItem(item, entityItem.entity, cacheContainer))
					}
				})
			})

			Promise.all(promises).then(function (data) {
				resolve(data)
			})
		})
	})
}

export default {
	repairItems: repairItems,
}
