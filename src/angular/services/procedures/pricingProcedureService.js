/**
 * Created by szhitenev on 25.08.2016.
 */

import pricingProcedureRepository from '../../repositories/procedures/pricingProcedureRepository'

import portfolioService from '../portfolioService'
import instrumentTypeService from '../instrumentTypeService'
import pricingPolicyService from '../pricingPolicyService'

import instrumentPricingSchemeService from '../pricing/instrumentPricingSchemeService'
import currencyPricingSchemeService from '../pricing/currencyPricingSchemeService'

var getList = function (options) {
	return pricingProcedureRepository.getList(options)
}

var getByKey = function (id) {
	return pricingProcedureRepository.getByKey(id)
}

var create = function (account) {
	return pricingProcedureRepository.create(account)
}

var update = function (id, account) {
	return pricingProcedureRepository.update(id, account)
}

var deleteByKey = function (id) {
	return pricingProcedureRepository.deleteByKey(id)
}

var runProcedure = function (id, data) {
	return pricingProcedureRepository.runProcedure(id, data)
}

var loadRelatedData = function () {
	var promisesList = [
		instrumentTypeService.getList({ pageSize: 1000 }),
		pricingPolicyService.getList({ pageSize: 1000 }),
		portfolioService.getList({ pageSize: 1000 }),

		instrumentPricingSchemeService.getList({ pageSize: 1000 }),
		currencyPricingSchemeService.getList({ pageSize: 1000 }),
	]

	var mapOpts = function (promiseRes) {
		return promiseRes.results.map(function (item) {
			return {
				id: item.user_code,
				name: item.user_code,
			}
		})
	}

	return new Promise(function (resolve, reject) {
		Promise.all(promisesList)
			.then(function (data) {
				resolve({
					instrumentTypes: mapOpts(data[0]),
					pricingPolicies: mapOpts(data[1]),
					portfolios: mapOpts(data[2]),

					instrumentPricingSchemes: mapOpts(data[3]),
					currencyPricingSchemes: mapOpts(data[4]),
				})
			})
			.catch(function (e) {
				reject(e)
			})
	})
}

export default {
	getList: getList,
	getByKey: getByKey,
	create: create,
	update: update,
	deleteByKey: deleteByKey,

	loadRelatedData: loadRelatedData,
	runProcedure: runProcedure,
}
