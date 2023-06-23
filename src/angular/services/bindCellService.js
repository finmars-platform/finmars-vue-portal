/**
 * Created by szhitenev on 24.06.2016.
 */

import instrumentRepository from '../repositories/instrumentRepository'
import pricingPolicyRepository from '../repositories/pricingPolicyRepository'
import currencyRepository from '../repositories/currencyRepository'
import accountRepository from '../repositories/accountRepository'
import accountTypeRepository from '../repositories/accountTypeRepository'
import portfolioRepository from '../repositories/portfolioRepository'
import counterpartyRepository from '../repositories/counterpartyRepository'
import counterpartyGroupRepository from '../repositories/counterpartyGroupRepository'
import responsibleRepository from '../repositories/responsibleRepository'
import responsibleGroupRepository from '../repositories/responsibleGroupRepository'
import instrumentTypeRepository from '../repositories/instrumentTypeRepository'
import strategyRepository from '../repositories/strategyRepository'
import instrumentDailyPricingModelRepository from '../repositories/instrument/instrumentDailyPricingModelRepository'
import instrumentPaymentSizeDetailRepository from '../repositories/instrument/instrumentPaymentSizeDetailRepository'
import transactionTypeRepository from '../repositories/transactionTypeRepository'
import importPriceDownloadSchemeRepository from '../repositories/import/importPriceDownloadSchemeRepository'

import strategyService from './strategyService'
import strategyGroupService from './strategyGroupService'
import strategySubgroupService from './strategySubgroupService'

var entities = {}
var entitiesGetByKey = {}

var findEntities = function (entity, options) {
	return new Promise(function (resolve) {
		if (!entities[entity]) {
			if (options.entityType.indexOf('strategy') !== -1) {
				var entityTypePieces = options.entityType.split('-')

				var strategyNumber = entityTypePieces[1]

				if (entity === 'group') {
					return strategyGroupService
						.getList(strategyNumber)
						.then(function (data) {
							entities[entity] = data.results
							resolve({ key: entity, data: entities[entity] })
						})
				}
				if (entity === 'subgroup') {
					return strategySubgroupService
						.getList(strategyNumber)
						.then(function (data) {
							entities[entity] = data.results
							resolve({ key: entity, data: entities[entity] })
						})
				}

				return strategyService.getList(strategyNumber).then(function (data) {
					entities[entity] = data.results
					resolve({ key: entity, data: entities[entity] })
				})
			} else {
				if (options.entityType.indexOf('responsible') !== -1) {
					if (entity === 'group') {
						return responsibleGroupRepository.getList().then(function (data) {
							entities[entity] = data.results
							resolve({ key: entity, data: entities[entity] })
						})
					}
				} else {
					if (options.entityType.indexOf('counterparty') !== -1) {
						if (entity === 'group') {
							return counterpartyGroupRepository
								.getList()
								.then(function (data) {
									entities[entity] = data.results
									resolve({ key: entity, data: entities[entity] })
								})
						}
					} else {
						switch (entity) {
							case 'instrument':
								return instrumentRepository.getList().then(function (data) {
									entities[entity] = data.results
									resolve({ key: entity, data: entities[entity] })
								})
								break
							case 'portfolio':
								return portfolioRepository.getList().then(function (data) {
									entities[entity] = data.results
									resolve({ key: entity, data: entities[entity] })
								})
								break
							case 'account':
								return accountRepository.getList().then(function (data) {
									entities[entity] = data.results
									resolve({ key: entity, data: entities[entity] })
								})
								break
							case 'pricing_policy':
								return pricingPolicyRepository.getList().then(function (data) {
									entities[entity] = data.results
									resolve({ key: entity, data: entities[entity] })
								})
								break
							case 'currency':
								return currencyRepository.getList().then(function (data) {
									entities[entity] = data.results
									resolve({ key: entity, data: entities[entity] })
								})
								break
							case 'pricing_currency':
								return currencyRepository.getList().then(function (data) {
									entities[entity] = data.results
									resolve({ key: entity, data: entities[entity] })
								})
								break
							case 'accrued_currency':
								return currencyRepository.getList().then(function (data) {
									entities[entity] = data.results
									resolve({ key: entity, data: entities[entity] })
								})
								break
							case 'instrument_type':
								return instrumentTypeRepository.getList().then(function (data) {
									entities[entity] = data.results
									resolve({ key: entity, data: entities[entity] })
								})
								break
							case 'daily_pricing_model':
								return instrumentDailyPricingModelRepository
									.getList()
									.then(function (data) {
										entities[entity] = data
										resolve({ key: entity, data: entities[entity] })
									})
								break
							case 'price_download_scheme':
								return importPriceDownloadSchemeRepository
									.getList()
									.then(function (data) {
										entities[entity] = data.results
										resolve({ key: entity, data: entities[entity] })
									})
								break
							case 'transaction_types':
								return transactionTypeRepository
									.getListLight()
									.then(function (data) {
										entities[entity] = data.results
										resolve({ key: entity, data: entities[entity] })
									})
								break
							case 'type':
								return accountTypeRepository.getList().then(function (data) {
									entities[entity] = data.results
									resolve({ key: entity, data: entities[entity] })
								})
								break
							case 'strategy-1':
								return strategyRepository.getList(1).then(function (data) {
									entities[entity] = data.results
									resolve({ key: entity, data: entities[entity] })
								})
								break
							case 'strategy-2':
								return strategyRepository.getList(2).then(function (data) {
									entities[entity] = data.results
									resolve({ key: entity, data: entities[entity] })
								})
								break
							case 'strategy-3':
								return strategyRepository.getList(3).then(function (data) {
									entities[entity] = data.results
									resolve({ key: entity, data: entities[entity] })
								})
								break
						}
					}
				}
			}
		}
		resolve({ key: entity, data: entities[entity] })
	})
}

var getByKey = function (entity, id, options) {
	return new Promise(function (resolve) {
		if (!entitiesGetByKey[entity]) {
			console.log('ENTITY', entity)

			if (options && options.hasOwnProperty('entityType')) {
				if (options.entityType == 'responsible') {
					return responsibleGroupRepository.getByKey(id).then(function (data) {
						entitiesGetByKey[entity] = data
						resolve({ key: entity, data: entitiesGetByKey[entity] })
					})
				}
				if (options.entityType == 'counterparty') {
					return counterpartyGroupRepository.getByKey(id).then(function (data) {
						entitiesGetByKey[entity] = data
						resolve({ key: entity, data: entitiesGetByKey[entity] })
					})
				}
			}

			switch (entity) {
				case 'instrument':
					return instrumentRepository.getByKey(id).then(function (data) {
						entitiesGetByKey[entity] = data
						resolve({ key: entity, data: entitiesGetByKey[entity] })
					})
					break
				case 'portfolio':
					return portfolioRepository.getByKey(id).then(function (data) {
						entitiesGetByKey[entity] = data
						resolve({ key: entity, data: entitiesGetByKey[entity] })
					})
					break
				case 'counterparty':
					return counterpartyRepository.getByKey(id).then(function (data) {
						entitiesGetByKey[entity] = data
						resolve({ key: entity, data: entitiesGetByKey[entity] })
					})
					break
				case 'responsible':
					return responsibleRepository.getByKey(id).then(function (data) {
						entitiesGetByKey[entity] = data
						resolve({ key: entity, data: entitiesGetByKey[entity] })
					})
					break
				case 'account_cash':
					return accountRepository.getByKey(id).then(function (data) {
						entitiesGetByKey[entity] = data
						resolve({ key: entity, data: entitiesGetByKey[entity] })
					})
					break
				case 'account_position':
					return accountRepository.getByKey(id).then(function (data) {
						entitiesGetByKey[entity] = data
						resolve({ key: entity, data: entitiesGetByKey[entity] })
					})
					break
				case 'account_interim':
					return accountRepository.getByKey(id).then(function (data) {
						entitiesGetByKey[entity] = data
						resolve({ key: entity, data: entitiesGetByKey[entity] })
					})
					break
				case 'strategy1_position':
					return strategyService.getByKey(1, id).then(function (data) {
						entitiesGetByKey[entity] = data
						resolve({ key: entity, data: entitiesGetByKey[entity] })
					})
					break
				case 'strategy1_cash':
					return strategyService.getByKey(1, id).then(function (data) {
						entitiesGetByKey[entity] = data
						resolve({ key: entity, data: entitiesGetByKey[entity] })
					})
					break
				case 'strategy2_position':
					return strategyService.getByKey(2, id).then(function (data) {
						entitiesGetByKey[entity] = data
						resolve({ key: entity, data: entitiesGetByKey[entity] })
					})
					break
				case 'strategy2_cash':
					return strategyService.getByKey(2, id).then(function (data) {
						entitiesGetByKey[entity] = data
						resolve({ key: entity, data: entitiesGetByKey[entity] })
					})
					break
				case 'strategy3_position':
					return strategyService.getByKey(3, id).then(function (data) {
						entitiesGetByKey[entity] = data
						resolve({ key: entity, data: entitiesGetByKey[entity] })
					})
					break
				case 'strategy3_cash':
					return strategyService.getByKey(3, id).then(function (data) {
						entitiesGetByKey[entity] = data
						resolve({ key: entity, data: entitiesGetByKey[entity] })
					})
					break
				case 'pricing_policy':
					return pricingPolicyRepository.getByKey(id).then(function (data) {
						entitiesGetByKey[entity] = data
						resolve({ key: entity, data: entitiesGetByKey[entity] })
					})
					break
				case 'currency':
					return currencyRepository.getByKey(id).then(function (data) {
						entitiesGetByKey[entity] = data
						resolve({ key: entity, data: entitiesGetByKey[entity] })
					})
					break
				case 'transaction_currency':
					return currencyRepository.getByKey(id).then(function (data) {
						entitiesGetByKey[entity] = data
						resolve({ key: entity, data: entitiesGetByKey[entity] })
					})
					break
				case 'settlement_currency':
					return currencyRepository.getByKey(id).then(function (data) {
						entitiesGetByKey[entity] = data
						resolve({ key: entity, data: entitiesGetByKey[entity] })
					})
					break
				case 'pricing_currency':
					return currencyRepository.getByKey(id).then(function (data) {
						entitiesGetByKey[entity] = data
						resolve({ key: entity, data: entitiesGetByKey[entity] })
					})
					break
				case 'accrued_currency':
					return currencyRepository.getByKey(id).then(function (data) {
						entitiesGetByKey[entity] = data
						resolve({ key: entity, data: entitiesGetByKey[entity] })
					})
					break
				case 'instrument_type':
					return instrumentTypeRepository.getByKey(id).then(function (data) {
						entitiesGetByKey[entity] = data
						resolve({ key: entity, data: entitiesGetByKey[entity] })
					})
					break
				case 'transaction_types':
					return transactionTypeRepository.getByKey(id).then(function (data) {
						entitiesGetByKey[entity] = data
						resolve({ key: entity, data: entitiesGetByKey[entity] })
					})
					break
				case 'daily_pricing_model':
					return instrumentDailyPricingModelRepository
						.getByKey(id)
						.then(function (data) {
							entitiesGetByKey[entity] = data
							resolve({ key: entity, data: entitiesGetByKey[entity] })
						})
					break
				case 'payment_size_detail':
					return instrumentPaymentSizeDetailRepository
						.getByKey(id)
						.then(function (data) {
							entitiesGetByKey[entity] = data
							resolve({ key: entity, data: entitiesGetByKey[entity] })
						})
					break
				case 'type':
					return accountTypeRepository.getByKey(id).then(function (data) {
						entitiesGetByKey[entity] = data
						resolve({ key: entity, data: entitiesGetByKey[entity] })
					})
					break
				case 'price_download_scheme':
					return importPriceDownloadSchemeRepository
						.getByKey(id)
						.then(function (data) {
							entitiesGetByKey[entity] = data
							resolve({ key: entity, data: entitiesGetByKey[entity] })
						})
					break
			}
		}
		resolve({ key: entity, data: entitiesGetByKey[entity] })
	})
}

export default {
	findEntities: findEntities,
	getByKey: getByKey,
}
