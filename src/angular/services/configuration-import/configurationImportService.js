/**
 * Created by szhitenev on 12.09.2016.
 */
import configurationImportRepository from '../../repositories/import/configurationImportRepository'

import csvImportSchemeService from '../../services/import/csvImportSchemeService'
import complexImportSchemeService from '../../services/import/complexImportSchemeService'
import priceDownloadSchemeService from '../../services/import/priceDownloadSchemeService'
import instrumentDownloadSchemeService from '../../services/import/instrumentDownloadSchemeService'
import transactionImportSchemeService from '../../services/import/transactionImportSchemeService'

import bookmarkRepository from '../../repositories/bookmarkRepository'

import configurationImportCompatibilityService from './configurationImportCompatibilityService'

import referenceTablesService from '../../services/referenceTablesService'

export default function (
	metaContentTypesService,
	attributeTypeService,
	customFieldService,
	entityResolverService,
	uiService,
	configurationImportGetService,
	configurationImportMapService,
	configurationImportSyncService
) {
	var assignPermissions = function (contentType, item, settings) {
		return new Promise(function (resolve, reject) {
			item.object_permissions = []

			var currentMember = settings.member
			var groups = JSON.parse(JSON.stringify(settings.groups))

			var entityType =
				metaContentTypesService.findEntityByContentType(contentType)
			var table
			var isCreator

			groups.forEach(function (group) {
				if (group.permission_table && group.permission_table.data) {
					table = group.permission_table.data.find(function (item) {
						return item.content_type === contentType
					}).data

					isCreator = currentMember.groups.indexOf(group.id) !== -1

					group.objectPermissions = {}

					if (isCreator) {
						if (table.creator_manage) {
							group.objectPermissions.manage = true
						}

						if (table.creator_change) {
							group.objectPermissions.change = true
						}

						if (table.creator_view) {
							group.objectPermissions.view = true
						}
					} else {
						if (table.other_manage) {
							group.objectPermissions.manage = true
						}

						if (table.other_change) {
							group.objectPermissions.change = true
						}

						if (table.other_view) {
							group.objectPermissions.view = true
						}
					}
				}
			})

			groups.forEach(function (group) {
				if (
					group.objectPermissions &&
					group.objectPermissions.manage === true
				) {
					item.object_permissions.push({
						member: null,
						group: group.id,
						permission: 'manage_' + entityType.split('-').join(''),
					})
				}

				if (
					group.objectPermissions &&
					group.objectPermissions.change === true
				) {
					item.object_permissions.push({
						member: null,
						group: group.id,
						permission: 'change_' + entityType.split('-').join(''),
					})
				}
				if (group.objectPermissions && group.objectPermissions.view === true) {
					item.object_permissions.push({
						member: null,
						group: group.id,
						permission: 'view_' + entityType.split('-').join(''),
					})
				}
			})



			resolve()
		})
	}

	// Overwrite handler start

	var recursiveOverwriteItem = function (
		resolve,
		index,
		entityItem,
		settings,
		cacheContainer,
		errors
	) {
		var item = entityItem.content[index]

		index = index + 1

		if (item.active) {
			overwriteItem(
				item,
				entityItem.entity,
				settings,
				cacheContainer,
				errors
			).then(function () {
				window.importConfigurationCounter =
					window.importConfigurationCounter + 1

				if (index === entityItem.content.length) {
					resolve(item)
				} else {
					recursiveOverwriteItem(
						resolve,
						index,
						entityItem,
						settings,
						cacheContainer,
						errors
					)
				}
			})
		} else {
			if (index === entityItem.content.length) {
				resolve(item)
			} else {
				recursiveOverwriteItem(
					resolve,
					index,
					entityItem,
					settings,
					cacheContainer,
					errors
				)
			}
		}
	}

	var getAndUpdate = function (contentType, item, settings, cacheContainer) {
		return new Promise(function (resolve, reject) {
			var entityType =
				metaContentTypesService.findEntityByContentType(contentType)

			var options = {
				filters: {
					user_code: item.user_code,
				},
			}

			entityResolverService.getList(entityType, options).then(function (data) {
				var result



				if (
					[
						'transactions.transactiontype',
						'accounts.accounttype',
						'instruments.instrumenttype',
					].indexOf(contentType) !== -1
				) {
					assignPermissions(contentType, item, settings)
				}

				if (data.results.length) {
					data.results.forEach(function (resultItem) {
						if (resultItem.user_code === item.user_code) {
							result = resultItem
						}
					})

					if (result) {
						item.id = result.id

						resolve(entityResolverService.update(entityType, item.id, item))
					} else {
						resolve(entityResolverService.create(entityType, item))
					}
				} else {
					resolve(entityResolverService.create(entityType, item))
				}
			})
		})
	}

	var createIfNotExists = function (
		contentType,
		item,
		settings,
		cacheContainer,
		errors
	) {
		return new Promise(function (resolve, reject) {
			if (
				cacheContainer[contentType] &&
				cacheContainer[contentType][item.user_code]
			) {
				resolve(cacheContainer[entity][item.user_code])
			} else {
				// ;

				var entityType =
					metaContentTypesService.findEntityByContentType(contentType)

				var options = {
					filters: {
						user_code: item.user_code,
					},
				}

				entityResolverService
					.getList(entityType, options)
					.then(function (data) {
						var result

						if (
							[
								'transactions.transactiontype',
								'accounts.accounttype',
								'instruments.instrumenttype',
							].indexOf(contentType) !== -1
						) {
							assignPermissions(contentType, item, settings)
						}
						if (data.results.length) {
							data.results.forEach(function (resultItem) {
								if (resultItem.user_code === item.user_code) {
									result = resultItem
								}
							})

							if (!result) {
								entityResolverService
									.create(entityType, item)
									.then(function (data) {
										if (!cacheContainer[contentType]) {
											cacheContainer[contentType] = {}
										}

										cacheContainer[contentType][item.user_code] = data

										resolve(data)
									})
									.catch(function (reason) {
										errors.push({
											content_type: contentType,
											item: item,
											error: {
												message: "Can't create item " + item.user_code,
											},
											mode: 'skip',
										})

										resolve()
									})
							}

							if (settings.mode === 'overwrite') {
								console.warn(
									'Item already exists: user_code ' +
										item.user_code +
										' contentType ' +
										contentType
								)
							} else {
								errors.push({
									content_type: contentType,
									item: item,
									error: {
										message: 'Item already exists: user_code ' + item.user_code,
									},
									mode: 'skip',
								})
							}

							resolve()
						} else {
							entityResolverService
								.create(entityType, item)
								.then(function (data) {
									if (!cacheContainer[contentType]) {
										cacheContainer[contentType] = {}
									}

									cacheContainer[contentType][item.user_code] = data

									resolve(data)
								})
								.catch(function (reason) {
									errors.push({
										content_type: contentType,
										item: item,
										error: {
											message: "Can't create item " + item.user_code,
										},
										mode: 'skip',
									})

									resolve()
								})
						}
					})
			}
		})
	}

	var createAttributeTypeIfNotExists = function (contentType, item, errors) {
		return new Promise(function (resolve, reject) {
			// ;

			var entityType =
				metaContentTypesService.findEntityByContentType(contentType)

			// ;

			var options = {
				filters: {
					user_code: item.user_code,
				},
			}

			attributeTypeService.getList(entityType, options).then(function (data) {
				var result

				if (data.results.length) {
					data.results.forEach(function (resultItem) {
						if (resultItem.user_code === item.user_code) {
							result = resultItem
						}
					})

					if (!result) {
						attributeTypeService
							.create(entityType, item)
							.then(function (data) {
								resolve(data)
							})
							.catch(function (reason) {
								errors.push({
									content_type: contentType,
									item: item,
									error: {
										message:
											"Can't create Attribute Type: user_code " +
											item.user_code,
									},
									mode: 'skip',
								})

								resolve()
							})
					} else {
						// console.warn('Attribute Type already exists: user_code ' + item.user_code + ' contentType ' + contentType);

						// resolve()

						errors.push({
							content_type: contentType,
							item: item,
							error: {
								message:
									'Attribute Type already exists: user_code ' + item.user_code,
							},
							mode: 'skip',
						})

						resolve()
					}
				} else {
					attributeTypeService
						.create(entityType, item)
						.then(function (data) {
							resolve(data)
						})
						.catch(function (reason) {
							errors.push({
								content_type: contentType,
								item: item,
								error: {
									message:
										"Can't create Attribute Type: user_code " + item.user_code,
								},
								mode: 'skip',
							})

							resolve()
						})
				}
			})
		})
	}

	var overwriteItem = function (
		item,
		contentType,
		settings,
		cacheContainer,
		errors
	) {
		return new Promise(function (resolve, reject) {
			configurationImportSyncService
				.syncItem(item, contentType, cacheContainer, errors)
				.then(function (value) {



					try {
						switch (contentType) {
							case 'transactions.transactiontype':
								resolve(
									getAndUpdate(contentType, item, settings, cacheContainer)
								)
								break
							case 'accounts.accounttype':
								resolve(
									getAndUpdate(contentType, item, settings, cacheContainer)
								)
								break
							case 'currencies.currency':
								resolve(
									getAndUpdate(contentType, item, settings, cacheContainer)
								)
								break
							case 'instruments.pricingpolicy':
								resolve(
									getAndUpdate(contentType, item, settings, cacheContainer)
								)
								break
							case 'instruments.instrumenttype':
								resolve(
									getAndUpdate(contentType, item, settings, cacheContainer)
								)
								break
							case 'complex_import.compleximportscheme':
								resolve(
									new Promise(function (resolveLocal, reject) {
										var options = {
											filters: {
												user_code: item.user_code,
											},
										}

										complexImportSchemeService
											.getList(options)
											.then(function (data) {
												var result

												if (data.results.length) {
													data.results.forEach(function (resultItem) {
														if (resultItem.user_code === item.user_code) {
															result = resultItem
														}
													})

													if (result) {
														item.id = result.id

														complexImportSchemeService
															.update(item.id, item)
															.then(function (value1) {
																resolveLocal()
															})
															.catch(function (reason) {
																errors.push({
																	content_type: contentType,
																	item: item,
																	error: {
																		message:
																			"Can't update Complex Import Scheme ",
																	},
																	mode: 'overwrite',
																})

																resolveLocal(reason)
															})
													} else {
														complexImportSchemeService
															.create(item)
															.then(function () {
																resolveLocal()
															})
															.catch(function (reason) {
																errors.push({
																	content_type: contentType,
																	item: item,
																	error: {
																		message:
																			"Can't create Complex Import Scheme ",
																	},
																	mode: 'overwrite',
																})

																resolveLocal(reason)
															})
													}
												} else {
													complexImportSchemeService
														.create(item)
														.then(function () {
															resolveLocal()
														})
														.catch(function (reason) {
															errors.push({
																content_type: contentType,
																item: item,
																error: {
																	message:
																		"Can't create Complex Import Scheme ",
																},
																mode: 'overwrite',
															})

															resolveLocal(reason)
														})
												}
											})
									})
								)
								break
							case 'csv_import.csvimportscheme':
								resolve(
									new Promise(function (resolveLocal, reject) {
										var options = {
											filters: {
												user_code: item.user_code,
											},
										}

										csvImportSchemeService
											.getList(options)
											.then(function (data) {
												var result

												if (data.results.length) {
													data.results.forEach(function (resultItem) {
														if (resultItem.user_code === item.user_code) {
															result = resultItem
														}
													})

													if (result) {
														item.id = result.id

														resolveLocal(
															csvImportSchemeService.update(item.id, item)
														)
													} else {
														resolveLocal(csvImportSchemeService.create(item))
													}
												} else {
													resolveLocal(csvImportSchemeService.create(item))
												}
											})
									})
								)
								break
							case 'integrations.instrumentdownloadscheme':
								resolve(
									new Promise(function (resolveLocal, reject) {
										var options = {
											filters: {
												user_code: item.user_code,
											},
										}

										instrumentDownloadSchemeService
											.getList(options)
											.then(function (data) {
												var result

												if (data.results.length) {
													data.results.forEach(function (resultItem) {
														if (resultItem.user_code === item.user_code) {
															result = resultItem
														}
													})

													if (result) {
														item.id = result.id

														result.inputs.forEach(function (resultInput) {
															item.inputs.forEach(function (itemInput) {
																if (resultInput.name === itemInput.name) {
																	itemInput.id = resultInput.id
																}
															})
														})

														resolveLocal(
															instrumentDownloadSchemeService.update(
																item.id,
																item
															)
														)
													} else {
														resolveLocal(
															instrumentDownloadSchemeService.create(item)
														)
													}
												} else {
													resolveLocal(
														instrumentDownloadSchemeService.create(item)
													)
												}
											})
									})
								)
								break
							case 'integrations.pricedownloadscheme':
								resolve(
									new Promise(function (resolveLocal, reject) {
										var options = {
											filters: {
												user_code: item.user_code,
											},
										}

										priceDownloadSchemeService
											.getList(options)
											.then(function (data) {
												var result

												if (data.results.length) {
													data.results.forEach(function (resultItem) {
														if (resultItem.user_code === item.user_code) {
															result = resultItem
														}
													})

													if (result) {
														item.id = result.id

														resolveLocal(
															priceDownloadSchemeService.update(item.id, item)
														)
													} else {
														resolveLocal(
															priceDownloadSchemeService.create(item)
														)
													}
												} else {
													resolveLocal(priceDownloadSchemeService.create(item))
												}
											})
									})
								)
								break
							case 'integrations.complextransactionimportscheme':
								resolve(
									new Promise(function (resolveLocal, reject) {
										var options = {
											filters: {
												user_code: item.user_code,
											},
										}

										transactionImportSchemeService
											.getList(options)
											.then(function (data) {
												var result

												if (data.results.length) {
													data.results.forEach(function (resultItem) {
														if (resultItem.user_code === item.user_code) {
															result = resultItem
														}
													})

													if (result) {
														item.id = result.id

														transactionImportSchemeService
															.update(item.id, item)
															.then(function (value1) {
																resolveLocal()
															})
															.catch(function (reason) {
																errors.push({
																	content_type: contentType,
																	item: item,
																	error: {
																		message:
																			"Can't create Transaction Import Scheme ",
																	},
																	mode: 'overwrite',
																})

																resolveLocal(reason)
															})
													} else {
														transactionImportSchemeService
															.create(item)
															.then(function () {
																resolveLocal()
															})
															.catch(function (reason) {
																errors.push({
																	content_type: contentType,
																	item: item,
																	error: {
																		message:
																			"Can't create Transaction Import Scheme ",
																	},
																	mode: 'overwrite',
																})

																resolveLocal(reason)
															})
													}
												} else {
													transactionImportSchemeService
														.create(item)
														.then(function () {
															resolveLocal()
														})
														.catch(function (reason) {
															errors.push({
																content_type: contentType,
																item: item,
																error: {
																	message:
																		"Can't create Transaction Import Scheme ",
																},
																mode: 'overwrite',
															})

															resolveLocal(reason)
														})
												}
											})
									})
								)
								break
							case 'ui.listlayout':
								resolve(
									new Promise(function (resolve, reject) {
										/* uiService.getListLayoutDefault({
                                    filters: {
                                        name: item.name,
                                        content_type: item.content_type
                                    }
                                }) */
										uiService
											.getListLayout(null, {
												filters: {
													name: item.name,
													content_type: item.content_type,
												},
											})
											.then(function (data) {
												if (data.results.length) {
													var result

													data.results.forEach(function (resultItem) {
														if (resultItem.name === item.name) {
															result = resultItem
														}
													})

													if (result) {
														item.id = result.id

														resolve(uiService.updateListLayout(item.id, item))
													} else {
														resolve(uiService.createListLayout(item))
													}
												} else {
													resolve(uiService.createListLayout(item))
												}
											})
									})
								)
								break
							case 'ui.templatelayout':
								resolve(
									new Promise(function (resolve, reject) {
										uiService
											.getTemplateLayoutList({
												filters: {
													name: item.name,
												},
											})
											.then(function (data) {
												if (data.results.length) {
													var result

													data.results.forEach(function (resultItem) {
														if (resultItem.name === item.name) {
															result = resultItem
														}
													})

													if (result) {
														item.id = result.id

														resolve(
															uiService.updateTemplateLayout(item.id, item)
														)
													} else {
														resolve(uiService.createTemplateLayout(item))
													}
												} else {
													resolve(uiService.createTemplateLayout(item))
												}
											})
									})
								)
								break
							case 'ui.contextmenulayout':
								resolve(
									new Promise(function (resolve, reject) {
										uiService
											.getContextMenuLayoutList({
												filters: {
													name: item.name,
												},
											})
											.then(function (data) {
												if (data.results.length) {
													var result

													data.results.forEach(function (resultItem) {
														if (resultItem.name === item.name) {
															result = resultItem
														}
													})

													if (result) {
														item.id = result.id

														resolve(
															uiService.updateContextMenuLayout(item.id, item)
														)
													} else {
														resolve(uiService.createContextMenuLayout(item))
													}
												} else {
													resolve(uiService.createContextMenuLayout(item))
												}
											})
											.catch(function () {


												errors.push({
													content_type: 'ui.contextmenulayout',
													item: item,
													error: {
														message:
															'Context Menu Layout Access Denied: name ' +
															item.name,
													},
													mode: 'overwrite',
												})

												resolve()
											})
									})
								)
								break
							case 'ui.editlayout':
								resolve(
									new Promise(function (resolve, reject) {
										var entityType =
											metaContentTypesService.findEntityByContentType(
												item.content_type,
												'ui'
											)

										uiService
											.getEditLayoutByKey(entityType)
											.then(function (data) {
												if (data.results.length) {
													uiService
														.updateEditLayout(data.results[0].id, item)
														.then(function (item) {
															resolve({})
														})
														.catch(function (reason) {
															errors.push({
																content_type: entity,
																item: item,
																error: {
																	message: "Can't update Edit Layout Form",
																},
																mode: 'overwrite',
															})

															resolve(reason)
														})
												} else {
													uiService
														.createEditLayout(item)
														.then(function (item) {
															resolve({})
														})
														.catch(function (reason) {
															errors.push({
																content_type: entity,
																item: item,
																error: {
																	message: "Can't update Edit Layout Form",
																},
																mode: 'overwrite',
															})

															resolve(reason)
														})
												}
											})
									})
								)
								break
							case 'ui.reportlayout':
								resolve(
									new Promise(function (resolveLocal, reject) {
										/* uiService.getListLayoutDefault({
                                    filters: {
                                        name: item.name,
                                        content_type: item.content_type
                                    }
                                }) */
										uiService
											.getListLayout(null, {
												filters: {
													name: item.name,
													content_type: item.content_type,
												},
											})
											.then(function (data) {
												if (data.results.length) {
													var result

													data.results.forEach(function (resultItem) {
														if (resultItem.name === item.name) {
															result = resultItem
														}
													})

													if (result) {
														item.id = result.id

														resolveLocal(
															uiService.updateListLayout(item.id, item)
														)
													} else {
														resolveLocal(uiService.createListLayout(item))
													}
												} else {
													resolveLocal(uiService.createListLayout(item))
												}
											})
									})
								)
								break
							case 'ui.dashboardlayout':
								resolve(
									new Promise(function (resolve, reject) {
										uiService
											.getDashboardLayoutList({
												filters: {
													name: item.name,
												},
											})
											.then(function (data) {
												if (data.results.length) {
													var result

													data.results.forEach(function (resultItem) {
														if (resultItem.name === item.name) {
															result = resultItem
														}
													})

													if (result) {
														item.id = result.id

														resolve(
															uiService.updateDashboardLayout(item.id, item)
														)
													} else {
														resolve(uiService.createDashboardLayout(item))
													}
												} else {
													resolve(uiService.createDashboardLayout(item))
												}
											})
									})
								)
								break
							case 'reports.balancereportcustomfield':
								resolve(
									new Promise(function (resolveLocal, reject) {
										customFieldService
											.getList('balance-report', {
												filters: {
													user_code: item.user_code,
												},
											})
											.then(function (data) {
												if (data.results.length) {
													var result

													data.results.forEach(function (resultItem) {
														if (resultItem.user_code === item.user_code) {
															result = resultItem
														}
													})

													if (result) {
														item.id = result.id

														resolveLocal(
															customFieldService.update(
																'balance-report',
																item.id,
																item
															)
														)
													} else {
														resolveLocal(
															customFieldService.create('balance-report', item)
														)
													}
												} else {
													resolveLocal(
														customFieldService.create('balance-report', item)
													)
												}
											})
									})
								)
								break
							case 'reports.plreportcustomfield':
								resolve(
									new Promise(function (resolveLocal, reject) {
										customFieldService
											.getList('pl-report', {
												filters: {
													user_code: item.user_code,
												},
											})
											.then(function (data) {
												if (data.results.length) {
													var result

													data.results.forEach(function (resultItem) {
														if (resultItem.user_code === item.user_code) {
															result = resultItem
														}
													})

													if (result) {
														item.id = result.id

														resolveLocal(
															customFieldService.update(
																'pl-report',
																item.id,
																item
															)
														)
													} else {
														resolveLocal(
															customFieldService.create('pl-report', item)
														)
													}
												} else {
													resolveLocal(
														customFieldService.create('pl-report', item)
													)
												}
											})
									})
								)
								break
							case 'reports.transactionreportcustomfield':
								resolve(
									new Promise(function (resolveLocal, reject) {
										customFieldService
											.getList('transaction-report', {
												filters: {
													user_code: item.user_code,
												},
											})
											.then(function (data) {
												if (data.results.length) {
													var result

													data.results.forEach(function (resultItem) {
														if (resultItem.user_code === item.user_code) {
															result = resultItem
														}
													})

													if (result) {
														item.id = result.id

														resolveLocal(
															customFieldService.update(
																'transaction-report',
																item.id,
																item
															)
														)
													} else {
														resolveLocal(
															customFieldService.create(
																'transaction-report',
																item
															)
														)
													}
												} else {
													resolveLocal(
														customFieldService.create(
															'transaction-report',
															item
														)
													)
												}
											})
									})
								)
								break
							case 'ui.instrumentuserfieldmodel':
								resolve(
									new Promise(function (resolve, reject) {
										uiService
											.getInstrumentFieldList({
												filters: {
													key: item.key,
												},
											})
											.then(function (data) {
												if (data.results.length) {
													var result

													data.results.forEach(function (resultItem) {
														if (resultItem.key === item.key) {
															result = resultItem
														}
													})

													if (result) {
														item.id = result.id

														resolve(
															uiService.updateInstrumentField(item.id, item)
														)
													} else {
														resolve(uiService.createInstrumentField(item))
													}
												} else {
													resolve(uiService.createInstrumentField(item))
												}
											})
									})
								)
								break
							case 'ui.transactionuserfieldmodel':
								resolve(
									new Promise(function (resolve, reject) {
										uiService
											.getTransactionFieldList({
												filters: {
													key: item.key,
												},
											})
											.then(function (data) {
												if (data.results.length) {
													var result

													data.results.forEach(function (resultItem) {
														if (resultItem.key === item.key) {
															result = resultItem
														}
													})

													if (result) {
														item.id = result.id

														resolve(
															uiService.updateTransactionField(item.id, item)
														)
													} else {
														resolve(uiService.createTransactionField(item))
													}
												} else {
													resolve(uiService.createTransactionField(item))
												}
											})
									})
								)
								break
							case 'reference_tables.referencetable':
								resolve(
									new Promise(function (resolveLocal, reject) {


										var options = {
											filters: {
												name: item.name,
											},
										}

										referenceTablesService
											.getList(options)
											.then(function (data) {
												var result

												if (data.results.length) {
													data.results.forEach(function (resultItem) {
														if (resultItem.name === item.name) {
															result = resultItem
														}
													})

													if (result) {
														item.id = result.id

														resolveLocal(
															referenceTablesService.update(item.id, item)
														)
													} else {
														resolveLocal(referenceTablesService.create(item))
													}
												} else {
													resolveLocal(referenceTablesService.create(item))
												}
											})
									})
								)
								break
							case 'obj_attrs.portfolioattributetype':
								resolve(
									createAttributeTypeIfNotExists(
										'portfolios.portfolio',
										item,
										errors
									)
								)
								break
							case 'obj_attrs.accountattributetype':
								resolve(
									createAttributeTypeIfNotExists(
										'accounts.account',
										item,
										errors
									)
								)
								break
							case 'obj_attrs.accounttypeattributetype':
								resolve(
									createAttributeTypeIfNotExists(
										'accounts.accounttype',
										item,
										errors
									)
								)
								break
							case 'obj_attrs.responsibleattributetype':
								resolve(
									createAttributeTypeIfNotExists(
										'counterparties.responsible',
										item,
										errors
									)
								)
								break
							case 'obj_attrs.counterpartyattributetype':
								resolve(
									createAttributeTypeIfNotExists(
										'counterparties.counterparty',
										item,
										errors
									)
								)
								break
							case 'obj_attrs.instrumentattributetype':
								resolve(
									createAttributeTypeIfNotExists(
										'instruments.instrument',
										item,
										errors
									)
								)
								break
							case 'obj_attrs.instrumenttypeattributetype':
								resolve(
									createAttributeTypeIfNotExists(
										'instruments.instrumenttype',
										item,
										errors
									)
								)
								break
							case 'obj_attrs.transactiontypeattributetype':
								resolve(
									createAttributeTypeIfNotExists(
										'transactions.transactiontype',
										item,
										errors
									)
								)
								break
							case 'obj_attrs.strategy1attributetype':
								resolve(
									createAttributeTypeIfNotExists(
										'strategies.strategy1',
										item,
										errors
									)
								)
								break
							case 'obj_attrs.strategy2attributetype':
								resolve(
									createAttributeTypeIfNotExists(
										'strategies.strategy2',
										item,
										errors
									)
								)
								break
							case 'obj_attrs.strategy3attributetype':
								resolve(
									createAttributeTypeIfNotExists(
										'strategies.strategy3',
										item,
										errors
									)
								)
								break
							case 'obj_attrs.currencyattributetype':
								resolve(
									createAttributeTypeIfNotExists(
										'currencies.currency',
										item,
										errors
									)
								)
								break
							default:

								resolve()
								break
						}
					} catch (error) {

					}
				})
				.catch(function (reason) {


					var name = ''

					if (item.hasOwnProperty('user_code')) {
						name = item.user_code
					}

					if (item.hasOwnProperty('user_code')) {
						name = item.user_code
					}

					if (item.hasOwnProperty('name')) {
						name = item.name
					}

					errors.push({
						content_type: contentType,
						item: item,
						error: {
							message: "Can't overwrite item " + name,
						},
						mode: 'overwrite',
					})

					resolve(reason)
				})
		})
	}

	var overwriteEntityItems = function (
		entities,
		settings,
		cacheContainer,
		errors
	) {
		return new Promise(function (resolve, reject) {
			var promises = []



			entities.forEach(function (entityItem) {
				promises.push(
					new Promise(function (resolveItem, reject) {
						var startIndex = 0

						recursiveOverwriteItem(
							resolveItem,
							startIndex,
							entityItem,
							settings,
							cacheContainer,
							errors
						)
					})
				)
			})



			Promise.all(promises).then(function (data) {


				resolve(data)
			})
		})
	}

	var overwriteEntities = function (items, settings, cacheContainer, errors) {
		return new Promise(function (resolve, reject) {
			var instrumentTypes = items.filter(function (item) {
				return item.entity === 'instruments.instrumenttype'
			})

			var transactionTypeGroups = items.filter(function (item) {
				return item.entity === 'transactions.transactiontypegroup'
			})

			var transactionTypes = items.filter(function (item) {
				return item.entity === 'transactions.transactiontype'
			})

			var attributeTypes = items.filter(function (item) {
				return (
					item.entity === 'obj_attrs.portfolioattributetype' ||
					item.entity === 'obj_attrs.accountattributetype' ||
					item.entity === 'obj_attrs.instrumentattributetype' ||
					item.entity === 'obj_attrs.accounttypeattributetype' ||
					item.entity === 'obj_attrs.instrumenttypeattributetype' ||
					item.entity === 'obj_attrs.responsibleattributetype' ||
					item.entity === 'obj_attrs.counterpartyattributetype'
				)
			})

			var otherEntities = items.filter(function (item) {
				return (
					item.entity !== 'obj_attrs.portfolioattributetype' &&
					item.entity !== 'obj_attrs.accountattributetype' &&
					item.entity !== 'obj_attrs.instrumentattributetype' &&
					item.entity !== 'obj_attrs.accounttypeattributetype' &&
					item.entity !== 'obj_attrs.instrumenttypeattributetype' &&
					item.entity !== 'obj_attrs.responsibleattributetype' &&
					item.entity !== 'obj_attrs.counterpartyattributetype' &&
					item.entity !== 'complex_import.compleximportscheme' &&
					item.entity !== 'instruments.instrumenttype' &&
					item.entity !== 'transactions.transactiontypegroup' &&
					item.entity !== 'transactions.transactiontype' &&
					item.entity !== 'ui.editlayout' &&
					item.entity !== 'ui.listlayout' &&
					item.entity !== 'ui.templatelayout' &&
					item.entity !== 'ui.reportlayout' &&
					item.entity !== 'ui.dashboardlayout'
				)
			})

			var complexImportSchemes = items.filter(function (item) {
				return item.entity === 'complex_import.compleximportscheme'
			})

			var layoutEntities = items.filter(function (item) {
				return (
					(item.entity === 'ui.editlayout' ||
						item.entity === 'ui.listlayout' ||
						item.entity === 'ui.templatelayout' ||
						item.entity === 'ui.reportlayout') &&
					item.entity !== 'ui.dashboardlayout'
				)
			})

			var dashboardLayoutEntities = items.filter(function (item) {
				return item.entity === 'ui.dashboardlayout'
			})

			overwriteEntityItems(
				instrumentTypes,
				settings,
				cacheContainer,
				errors
			).then(function (data) {


				overwriteEntityItems(
					transactionTypeGroups,
					settings,
					cacheContainer,
					errors
				).then(function (data) {


					overwriteEntityItems(
						transactionTypes,
						settings,
						cacheContainer,
						errors
					).then(function (data) {


						overwriteEntityItems(
							attributeTypes,
							settings,
							cacheContainer,
							errors
						).then(function (data) {


							overwriteEntityItems(
								otherEntities,
								settings,
								cacheContainer,
								errors
							).then(function (data) {


								overwriteEntityItems(
									layoutEntities,
									settings,
									cacheContainer,
									errors
								).then(function (data) {


									overwriteEntityItems(
										dashboardLayoutEntities,
										settings,
										cacheContainer,
										errors
									).then(function (data) {


										overwriteEntityItems(
											complexImportSchemes,
											settings,
											cacheContainer,
											errors
										)
											.then(function (data) {
												console.log(
													'Overwrite Complex Import Scheme success',
													data
												)

												resolve(data)
											})
											.catch(function (reason) {
												console.log(
													'Overwrite importConfiguration.reason',
													reason
												)

												reject(reason)
											})
									})
								})
							})
						})
					})
				})
			})
		})
	}

	// Overwrite handler end

	// Create handler start

	var recursiveCreateItem = function (
		resolve,
		index,
		entityItem,
		settings,
		cacheContainer,
		errors
	) {
		var item = entityItem.content[index]

		index = index + 1

		if (item.active) {
			createItem(
				item,
				entityItem.entity,
				settings,
				cacheContainer,
				errors
			).then(function () {
				window.importConfigurationCounter =
					window.importConfigurationCounter + 1

				if (index < entityItem.content.length) {
					recursiveCreateItem(
						resolve,
						index,
						entityItem,
						settings,
						cacheContainer,
						errors
					)
				} else {
					resolve(item)
				}
			})
		} else {
			if (index < entityItem.content.length) {
				recursiveCreateItem(
					resolve,
					index,
					entityItem,
					settings,
					cacheContainer,
					errors
				)
			} else {
				resolve(item)
			}
		}
	}

	var createItem = function (item, entity, settings, cacheContainer, errors) {
		return new Promise(function (resolve, reject) {
			configurationImportSyncService
				.syncItem(item, entity, cacheContainer, errors)
				.then(function (value) {
					try {


						switch (entity) {
							case 'transactions.transactiontype':
								resolve(
									createIfNotExists(
										entity,
										item,
										settings,
										cacheContainer,
										errors
									)
								)
								break
							case 'transactions.transactiontypegroup':
								resolve(
									createIfNotExists(
										entity,
										item,
										settings,
										cacheContainer,
										errors
									)
								)
								break
							case 'accounts.accounttype':
								resolve(
									createIfNotExists(
										entity,
										item,
										settings,
										cacheContainer,
										errors
									)
								)
								break
							case 'currencies.currency':
								resolve(
									createIfNotExists(
										entity,
										item,
										settings,
										cacheContainer,
										errors
									)
								)
								break
							case 'instruments.pricingpolicy':
								resolve(
									createIfNotExists(
										entity,
										item,
										settings,
										cacheContainer,
										errors
									)
								)
								break
							case 'instruments.instrumenttype':
								resolve(
									createIfNotExists(
										entity,
										item,
										settings,
										cacheContainer,
										errors
									)
								)
								break
							case 'ui.editlayout':
								resolve(
									new Promise(function (resolve, reject) {
										var entityType =
											metaContentTypesService.findEntityByContentType(
												item.content_type,
												'ui'
											)

										uiService
											.getEditLayoutByKey(entityType)
											.then(function (data) {
												if (data.results.length) {
													uiService
														.updateEditLayout(data.results[0].id, item)
														.then(function (item) {
															resolve({})
														})
														.catch(function (reason) {
															errors.push({
																content_type: entity,
																item: item,
																error: {
																	message: "Can't update Edit Layout Form",
																},
																mode: 'overwrite',
															})

															resolve(reason)
														})
												} else {
													uiService
														.createEditLayout(item)
														.then(function (item) {
															resolve({})
														})
														.catch(function (reason) {
															errors.push({
																content_type: entity,
																item: item,
																error: {
																	message: "Can't update Edit Layout Form",
																},
																mode: 'overwrite',
															})

															resolve(reason)
														})
												}
											})
									})
								)
								break
							case 'ui.listlayout':
								resolve(
									new Promise(function (resolveLocal, reject) {
										/* uiService.getListLayoutDefault({
                                    filters: {
                                        name: item.name,
                                        content_type: item.content_type
                                    }
                                }) */
										uiService
											.getListLayout(null, {
												filters: {
													name: item.name,
													content_type: item.content_type,
												},
											})
											.then(function (data) {
												if (data.results.length) {
													var result

													data.results.forEach(function (resultItem) {
														if (resultItem.name === item.name) {
															result = resultItem
														}
													})

													if (result) {
														if (settings.mode !== 'overwrite') {
															errors.push({
																content_type: 'ui.listlayout',
																item: item,
																error: {
																	message:
																		'Layout already exists: name ' + item.name,
																},
																mode: 'skip',
															})
														}

														resolveLocal()
													} else {
														resolveLocal(uiService.createListLayout(item))
													}
												} else {
													resolveLocal(uiService.createListLayout(item))
												}
											})
									})
								)
								break
							case 'ui.templatelayout':
								resolve(
									new Promise(function (resolveLocal, reject) {
										uiService
											.getTemplateLayoutList({
												filters: {
													name: item.name,
												},
											})
											.then(function (data) {
												if (data.results.length) {
													var result

													data.results.forEach(function (resultItem) {
														if (resultItem.name === item.name) {
															result = resultItem
														}
													})

													if (result) {
														if (settings.mode !== 'overwrite') {
															errors.push({
																content_type: 'ui.templatelayout',
																item: item,
																error: {
																	message:
																		'Layout already exists: name ' + item.name,
																},
																mode: 'skip',
															})
														}

														resolveLocal()
													} else {
														resolveLocal(uiService.createTemplateLayout(item))
													}
												} else {
													resolveLocal(uiService.createTemplateLayout(item))
												}
											})
									})
								)
								break
							case 'ui.contextmenulayout':
								resolve(
									new Promise(function (resolveLocal, reject) {
										uiService
											.getContextMenuLayoutList({
												filters: {
													name: item.name,
												},
											})
											.then(function (data) {
												if (data.results.length) {
													var result

													data.results.forEach(function (resultItem) {
														if (resultItem.name === item.name) {
															result = resultItem
														}
													})

													if (result) {
														if (settings.mode !== 'overwrite') {
															errors.push({
																content_type: 'ui.contextmenulayout',
																item: item,
																error: {
																	message:
																		'Context Menu Layout already exists: name ' +
																		item.name,
																},
																mode: 'skip',
															})
														}

														resolveLocal()
													} else {
														uiService
															.createContextMenuLayout(item)
															.then(function (data) {
																resolveLocal(data)
															})
															.catch(function () {
																resolveLocal()
															})
													}
												} else {
													uiService
														.createContextMenuLayout(item)
														.then(function (data) {
															resolveLocal(data)
														})
														.catch(function () {
															resolveLocal()
														})
												}
											})
											.catch(function () {


												errors.push({
													content_type: 'ui.contextmenulayout',
													item: item,
													error: {
														message:
															'Context Menu Layout Access Denied: name ' +
															item.name,
													},
													mode: 'skip',
												})

												resolveLocal()
											})
									})
								)
								break
							case 'ui.reportlayout':
								resolve(
									new Promise(function (resolveLocal, reject) {
										/* uiService.getListLayoutDefault({
                                    filters: {
                                        name: item.name,
                                        content_type: item.content_type
                                    }
                                }) */
										uiService
											.getListLayout(null, {
												filters: {
													name: item.name,
													content_type: item.content_type,
												},
											})
											.then(function (data) {
												if (data.results.length) {
													var result

													data.results.forEach(function (resultItem) {
														if (resultItem.name === item.name) {
															result = resultItem
														}
													})

													if (result) {
														if (settings.mode !== 'overwrite') {
															errors.push({
																content_type: 'ui.reportlayout',
																item: item,
																error: {
																	message:
																		'Report Layout already exists: name ' +
																		item.name,
																},
																mode: 'skip',
															})
														}

														resolveLocal()
													} else {
														resolveLocal(uiService.createListLayout(item))
													}
												} else {
													resolveLocal(uiService.createListLayout(item))
												}
											})
									})
								)
								break
							case 'ui.dashboardlayout':
								resolve(
									new Promise(function (resolveLocal, reject) {
										uiService
											.getDashboardLayoutList({
												filters: {
													name: item.name,
												},
											})
											.then(function (data) {
												if (data.results.length) {
													var result

													data.results.forEach(function (resultItem) {
														if (resultItem.name === item.name) {
															result = resultItem
														}
													})

													if (result) {
														if (settings.mode !== 'overwrite') {
															errors.push({
																content_type: 'ui.dashboardlayout',
																item: item,
																error: {
																	message:
																		'Dashboard Layout already exists: name ' +
																		item.name,
																},
																mode: 'skip',
															})
														}

														resolveLocal()
													} else {
														resolveLocal(uiService.createDashboardLayout(item))
													}
												} else {
													resolveLocal(uiService.createDashboardLayout(item))
												}
											})
									})
								)
								break
							case 'ui.bookmark':
								resolve(
									new Promise(function (resolve, reject) {
										/*uiService.getListLayoutDefault({
                                    filters: {
                                        name: item.___layout_name,
                                        content_type: item.___content_type
                                    }
                                })*/
										uiService
											.getListLayout(null, {
												filters: {
													name: item.___layout_name,
													content_type: item.___content_type,
												},
											})
											.then(function (data) {


												if (data.results.length) {
													item.list_layout = data.results[0].id
												}

												var promises = []

												if (item.children && item.children.length) {
													item.children.forEach(function (child) {
														promises.push(
															new Promise(function (localResolve) {
																/* uiService.getListLayoutDefault({
                                                    filters: {
                                                        name: child.___layout_name,
                                                        content_type: child.___content_type
                                                    }
                                                }) */
																uiService
																	.getListLayout(null, {
																		filters: {
																			name: child.___layout_name,
																			content_type: child.___content_type,
																		},
																	})
																	.then(function (data) {
																		if (data.results.length) {
																			child.list_layout = data.results[0].id
																		}



																		localResolve(child)
																	})
															})
														)
													})
												}

												Promise.all(promises).then(function (value) {
													var itemName = item.name.split(' (')[0]

													bookmarkRepository
														.getList({
															filters: {
																name: itemName,
															},
														})
														.then(function (data) {
															var index = 0

															data.results.forEach(function (resultItem) {
																var resultItemName =
																	resultItem.name.split(' (')[0]

																if (itemName === resultItemName) {
																	index = index + 1
																}
															})

															if (index > 0) {
																item.name = itemName + ' (' + index + ')'
															}

															resolve(bookmarkRepository.create(item))
														})
												})
											})
									})
								)
								break
							case 'ui.instrumentuserfieldmodel':
								resolve(
									new Promise(function (resolveLocal, reject) {
										uiService
											.getInstrumentFieldList({
												filters: {
													key: item.key,
												},
											})
											.then(function (data) {
												if (data.results.length) {
													var result

													data.results.forEach(function (resultItem) {
														if (resultItem.key === item.key) {
															result = resultItem
														}
													})

													if (result) {
														if (settings.mode !== 'overwrite') {
															errors.push({
																content_type: 'ui.instrumentuserfieldmodel',
																item: item,
																error: {
																	message:
																		'Instrument Field already exists: key ' +
																		item.key,
																},
																mode: 'skip',
															})
														}

														resolveLocal()
													} else {
														resolveLocal(uiService.createInstrumentField(item))
													}
												} else {
													resolveLocal(uiService.createInstrumentField(item))
												}
											})
									})
								)
								break
							case 'ui.transactionuserfieldmodel':
								resolve(
									new Promise(function (resolveLocal, reject) {
										uiService
											.getTransactionFieldList({
												filters: {
													key: item.key,
												},
											})
											.then(function (data) {
												if (data.results.length) {
													var result

													data.results.forEach(function (resultItem) {
														if (resultItem.key === item.key) {
															result = resultItem
														}
													})

													if (result) {
														if (settings.mode !== 'overwrite') {
															errors.push({
																content_type: 'ui.transactionuserfieldmodel',
																item: item,
																error: {
																	message:
																		'Transaction Field already exists: key ' +
																		item.key,
																},
																mode: 'skip',
															})
														}

														resolveLocal()
													} else {
														resolveLocal(uiService.createTransactionField(item))
													}
												} else {
													resolveLocal(uiService.createTransactionField(item))
												}
											})
									})
								)
								break
							case 'complex_import.compleximportscheme':
								resolve(
									new Promise(function (resolveLocal, reject) {
										complexImportSchemeService
											.getList({
												filters: {
													user_code: item.user_code,
													content_type: item.content_type,
												},
											})
											.then(function (data) {
												if (data.results.length) {
													var result

													data.results.forEach(function (resultItem) {
														if (resultItem.user_code === item.user_code) {
															result = resultItem
														}
													})

													if (result) {
														if (settings.mode === 'overwrite') {
															console.warn(
																'Complex Import scheme already exists: user_code ' +
																	item.user_code
															)
														} else {
															errors.push({
																content_type:
																	'complex_import.compleximportscheme',
																item: item,
																error: {
																	message:
																		'Complex Import scheme already exists: user_code ' +
																		item.user_code,
																},
																mode: 'skip',
															})
														}

														resolveLocal()
													} else {
														resolveLocal(
															complexImportSchemeService.create(item)
														)
													}
												} else {
													resolveLocal(complexImportSchemeService.create(item))
												}
											})
									})
								)
								break
							case 'csv_import.csvimportscheme':
								resolve(
									new Promise(function (resolveLocal, reject) {
										csvImportSchemeService
											.getList({
												filters: {
													user_code: item.user_code,
													content_type: item.content_type,
												},
											})
											.then(function (data) {
												if (data.results.length) {
													var result

													data.results.forEach(function (resultItem) {
														if (resultItem.user_code === item.user_code) {
															result = resultItem
														}
													})

													if (result) {
														if (settings.mode === 'overwrite') {
															console.warn(
																'Simple Entity Import scheme already exists: name ' +
																	item.user_code
															)
														} else {
															errors.push({
																content_type: 'csv_import.csvimportscheme',
																item: item,
																error: {
																	message:
																		'Simple Entity Import scheme already exists: name ' +
																		item.user_code,
																},
																mode: 'skip',
															})
														}

														resolveLocal()
													} else {
														resolveLocal(csvImportSchemeService.create(item))
													}
												} else {
													resolveLocal(csvImportSchemeService.create(item))
												}
											})
									})
								)
								break
							case 'integrations.instrumentdownloadscheme':
								resolve(
									new Promise(function (resolveLocal, reject) {
										instrumentDownloadSchemeService
											.getList({
												filters: {
													user_code: item.user_code,
												},
											})
											.then(function (data) {
												if (data.results.length) {
													var result

													data.results.forEach(function (resultItem) {
														if (resultItem.user_code === item.user_code) {
															result = resultItem
														}
													})

													if (result) {
														if (settings.mode === 'overwrite') {
															console.warn(
																'Instrument download scheme already exists: scheme name ' +
																	item.user_code
															)
														} else {
															errors.push({
																content_type:
																	'integrations.instrumentdownloadscheme',
																item: item,
																error: {
																	message:
																		'Instrument download scheme already exists: scheme name ' +
																		item.user_code,
																},
																mode: 'skip',
															})
														}

														resolveLocal()
													} else {
														resolveLocal(
															instrumentDownloadSchemeService.create(item)
														)
													}
												} else {
													resolveLocal(
														instrumentDownloadSchemeService.create(item)
													)
												}
											})
									})
								)
								break
							case 'integrations.pricedownloadscheme':
								resolve(
									new Promise(function (resolveLocal, reject) {
										priceDownloadSchemeService
											.getList({
												filters: {
													user_code: item.user_code,
												},
											})
											.then(function (data) {
												if (data.results.length) {
													var result

													data.results.forEach(function (resultItem) {
														if (resultItem.user_code === item.user_code) {
															result = resultItem
														}
													})

													if (result) {
														if (settings.mode === 'overwrite') {
															console.warn(
																'Price download scheme already exists: scheme name ' +
																	item.user_code
															)
														} else {
															errors.push({
																content_type:
																	'integrations.pricedownloadscheme',
																item: item,
																error: {
																	message:
																		'Price download scheme already exists: scheme name ' +
																		item.user_code,
																},
																mode: 'skip',
															})
														}

														resolveLocal()
													} else {
														resolveLocal(
															priceDownloadSchemeService.create(item)
														)
													}
												} else {
													resolveLocal(priceDownloadSchemeService.create(item))
												}
											})
									})
								)
								break
							case 'integrations.complextransactionimportscheme':
								resolve(
									new Promise(function (resolveLocal, reject) {
										transactionImportSchemeService
											.getList({
												filters: {
													user_code: item.user_code,
												},
											})
											.then(function (data) {
												if (data.results.length) {
													var result

													data.results.forEach(function (resultItem) {
														if (resultItem.user_code === item.user_code) {
															result = resultItem
														}
													})

													if (result) {
														if (settings.mode === 'overwrite') {
															console.warn(
																'Transaction import scheme already exists: scheme name ' +
																	item.user_code
															)
														} else {
															errors.push({
																content_type:
																	'integrations.complextransactionimportscheme',
																item: item,
																error: {
																	message:
																		'Transaction import scheme already exists: scheme name ' +
																		item.user_code,
																},
																mode: 'skip',
															})
														}

														resolveLocal()
													} else {
														transactionImportSchemeService
															.create(item)
															.then(function (data) {
																resolveLocal()
															})
															.catch(function (reason) {
																errors.push({
																	content_type: entity,
																	item: item,
																	error: {
																		message:
																			"Can't create Transaction Import Scheme",
																	},
																	mode: 'skip',
																})

																resolveLocal(reason)
															})
													}
												} else {
													transactionImportSchemeService
														.create(item)
														.then(function (value1) {
															resolveLocal()
														})
														.catch(function (reason) {
															errors.push({
																content_type: entity,
																item: item,
																error: {
																	message:
																		"Can't create Transaction Import Scheme",
																},
																mode: 'skip',
															})

															resolveLocal(reason)
														})
												}
											})
									})
								)
								break
							case 'obj_attrs.portfolioattributetype':
								resolve(
									createAttributeTypeIfNotExists(
										'portfolios.portfolio',
										item,
										errors
									)
								)
								break
							case 'obj_attrs.accountattributetype':
								resolve(
									createAttributeTypeIfNotExists(
										'accounts.account',
										item,
										errors
									)
								)
								break
							case 'obj_attrs.accounttypeattributetype':
								resolve(
									createAttributeTypeIfNotExists(
										'accounts.accounttype',
										item,
										errors
									)
								)
								break
							case 'obj_attrs.responsibleattributetype':
								resolve(
									createAttributeTypeIfNotExists(
										'counterparties.responsible',
										item,
										errors
									)
								)
								break
							case 'obj_attrs.counterpartyattributetype':
								resolve(
									createAttributeTypeIfNotExists(
										'counterparties.counterparty',
										item,
										errors
									)
								)
								break
							case 'obj_attrs.instrumentattributetype':
								resolve(
									createAttributeTypeIfNotExists(
										'instruments.instrument',
										item,
										errors
									)
								)
								break
							case 'obj_attrs.instrumenttypeattributetype':
								resolve(
									createAttributeTypeIfNotExists(
										'instruments.instrumenttype',
										item,
										errors
									)
								)
								break
							case 'obj_attrs.transactiontypeattributetype':
								resolve(
									createAttributeTypeIfNotExists(
										'transactions.transactiontype',
										item,
										errors
									)
								)
								break
							case 'obj_attrs.strategy1attributetype':
								resolve(
									createAttributeTypeIfNotExists(
										'strategies.strategy1',
										item,
										errors
									)
								)
								break
							case 'obj_attrs.strategy2attributetype':
								resolve(
									createAttributeTypeIfNotExists(
										'strategies.strategy2',
										item,
										errors
									)
								)
								break
							case 'obj_attrs.strategy3attributetype':
								resolve(
									createAttributeTypeIfNotExists(
										'strategies.strategy3',
										item,
										errors
									)
								)
								break
							case 'obj_attrs.currencyattributetype':
								resolve(
									createAttributeTypeIfNotExists(
										'currencies.currency',
										item,
										errors
									)
								)
								break
							case 'reports.balancereportcustomfield':
								resolve(
									new Promise(function (resolveLocal, reject) {
										customFieldService
											.getList('balance-report', {
												filters: {
													user_code: item.user_code,
												},
											})
											.then(function (data) {
												if (data.results.length) {
													var result

													data.results.forEach(function (resultItem) {
														if (resultItem.user_code === item.user_code) {
															result = resultItem
														}
													})

													if (result) {
														if (settings.mode !== 'overwrite') {
															errors.push({
																content_type:
																	'reports.balancereportcustomfield',
																item: item,
																error: {
																	message:
																		'Balance Report Custom Field already exists: name ' +
																		item.name,
																},
																mode: 'skip',
															})
														}

														resolveLocal()
													} else {
														resolveLocal(
															customFieldService.create('balance-report', item)
														)
													}
												} else {
													resolveLocal(
														customFieldService.create('balance-report', item)
													)
												}
											})
									})
								)
								break
							case 'reports.plreportcustomfield':
								resolve(
									new Promise(function (resolveLocal, reject) {
										customFieldService
											.getList('pl-report', {
												filters: {
													user_code: item.user_code,
												},
											})
											.then(function (data) {
												if (data.results.length) {
													var result

													data.results.forEach(function (resultItem) {
														if (resultItem.user_code === item.user_code) {
															result = resultItem
														}
													})

													if (result) {
														if (settings.mode !== 'overwrite') {
															errors.push({
																content_type: 'reports.plreportcustomfield',
																item: item,
																error: {
																	message:
																		'P&L Report Custom Field already exists: name ' +
																		item.name,
																},
																mode: 'skip',
															})
														}

														resolveLocal()
													} else {
														resolveLocal(
															customFieldService.create('pl-report', item)
														)
													}
												} else {
													resolveLocal(
														customFieldService.create('pl-report', item)
													)
												}
											})
									})
								)
								break
							case 'reports.transactionreportcustomfield':
								resolve(
									new Promise(function (resolveLocal, reject) {
										customFieldService
											.getList('transaction-report', {
												filters: {
													user_code: item.user_code,
												},
											})
											.then(function (data) {
												if (data.results.length) {
													var result

													data.results.forEach(function (resultItem) {
														if (resultItem.user_code === item.user_code) {
															result = resultItem
														}
													})

													if (result) {
														if (settings.mode !== 'overwrite') {
															errors.push({
																content_type:
																	'reports.transactionreportcustomfield',
																item: item,
																error: {
																	message:
																		'Transaction Report Custom Field already exists: name ' +
																		item.name,
																},
																mode: 'skip',
															})
														}

														resolveLocal()
													} else {
														resolveLocal(
															customFieldService.create(
																'transaction-report',
																item
															)
														)
													}
												} else {
													resolveLocal(
														customFieldService.create(
															'transaction-report',
															item
														)
													)
												}
											})
									})
								)
								break
							case 'reference_tables.referencetable':
								resolve(
									new Promise(function (resolveLocal, reject) {
										referenceTablesService
											.getList({
												filters: {
													name: item.name,
												},
											})
											.then(function (data) {
												if (data.results.length) {
													var result

													data.results.forEach(function (resultItem) {
														if (resultItem.name === item.name) {
															result = resultItem
														}
													})

													if (result) {
														if (settings.mode === 'overwrite') {
															console.warn(
																'Reference Table already exists: name ' +
																	item.name
															)
														} else {
															errors.push({
																content_type: 'reference_tables.referencetable',
																item: item,
																error: {
																	message:
																		'Reference Table already exists: name ' +
																		item.name,
																},
																mode: 'skip',
															})
														}

														resolveLocal()
													} else {
														resolveLocal(referenceTablesService.create(item))
													}
												} else {
													resolveLocal(referenceTablesService.create(item))
												}
											})
									})
								)
								break
						}
					} catch (reason) {


						errors.push({
							item: item,
							error: {
								message: reason,
							},
							mode: 'skip',
						})

						resolve(reason)
					}
				})
				.catch(function (reason) {


					var name = ''

					if (item.hasOwnProperty('user_code')) {
						name = item.user_code
					}

					if (item.hasOwnProperty('user_code')) {
						name = item.user_code
					}

					if (item.hasOwnProperty('name')) {
						name = item.name
					}

					errors.push({
						content_type: entity,
						item: item,
						error: {
							message: "Can't create item " + name,
						},
						mode: 'skip',
					})

					resolve(reason)
				})
		})
	}

	var specialOverwriteInstrumentTypes = function (entity) {
		return new Promise(function (resolve, reject) {
			if (entity) {
				var instrumentTypes = entity.content.filter(function (item) {
					return item.active
				})

				configurationImportGetService
					.getInstrumentsTypesWithIds(instrumentTypes)
					.then(function (items) {
						var promises = []

						items.forEach(function (item) {
							configurationImportMapService
								.mapFieldsInInstrumentType(item)
								.then(function (updatedItem) {
									promises.push(
										entityResolverService.update(
											'instrument-type',
											updatedItem.id,
											updatedItem
										)
									)
								})
						})

						Promise.all(promises).then(function (data) {
							resolve(data)
						})
					})
			} else {
				resolve()
			}
		})
	}

	var createEntityItems = function (
		entities,
		settings,
		cacheContainer,
		errors
	) {
		return new Promise(function (resolve, reject) {
			var promises = []

			entities.forEach(function (entityItem) {
				promises.push(
					new Promise(function (resolveItem, reject) {
						var startIndex = 0

						recursiveCreateItem(
							resolveItem,
							startIndex,
							entityItem,
							settings,
							cacheContainer,
							errors
						)
					})
				)
			})

			Promise.all(promises).then(function (data) {
				resolve(data)
			})
		})
	}

	var createEntities = function (items, settings, cacheContainer, errors) {
		return new Promise(function (resolve, reject) {
			var instrumentTypes = items.filter(function (item) {
				return item.entity === 'instruments.instrumenttype'
			})

			var transactionTypeGroups = items.filter(function (item) {
				return item.entity === 'transactions.transactiontypegroup'
			})

			var transactionTypes = items.filter(function (item) {
				return item.entity === 'transactions.transactiontype'
			})

			var attributeTypes = items.filter(function (item) {
				return (
					item.entity === 'obj_attrs.portfolioattributetype' ||
					item.entity === 'obj_attrs.accountattributetype' ||
					item.entity === 'obj_attrs.instrumentattributetype' ||
					item.entity === 'obj_attrs.accounttypeattributetype' ||
					item.entity === 'obj_attrs.instrumenttypeattributetype' ||
					item.entity === 'obj_attrs.responsibleattributetype' ||
					item.entity === 'obj_attrs.counterpartyattributetype'
				)
			})

			var otherEntities = items.filter(function (item) {
				return (
					item.entity !== 'transactions.transactiontype' &&
					item.entity !== 'instruments.instrumenttype' &&
					item.entity !== 'transactions.transactiontypegroup' &&
					item.entity !== 'ui.editlayout' &&
					item.entity !== 'ui.listlayout' &&
					item.entity !== 'ui.templatelayout' &&
					item.entity !== 'ui.reportlayout' &&
					item.entity !== 'ui.dashboardlayout' &&
					item.entity !== 'ui.bookmark' &&
					item.entity !== 'complex_import.compleximportscheme' &&
					item.entity !== 'obj_attrs.portfolioattributetype' &&
					item.entity !== 'obj_attrs.accountattributetype' &&
					item.entity !== 'obj_attrs.instrumentattributetype' &&
					item.entity !== 'obj_attrs.accounttypeattributetype' &&
					item.entity !== 'obj_attrs.instrumenttypeattributetype' &&
					item.entity !== 'obj_attrs.responsibleattributetype' &&
					item.entity !== 'obj_attrs.counterpartyattributetype'
				)
			})

			var layoutEntities = items.filter(function (item) {
				return (
					(item.entity === 'ui.editlayout' ||
						item.entity === 'ui.listlayout' ||
						item.entity === 'ui.templatelayout' ||
						item.entity === 'ui.reportlayout') &&
					item.entity !== 'ui.dashboardlayout'
				)
			})

			var dashboardLayoutEntities = items.filter(function (item) {
				return item.entity === 'ui.dashboardlayout'
			})

			var bookmarks = items.filter(function (item) {
				return item.entity === 'ui.bookmark'
			})

			var complexImportSchemes = items.filter(function (item) {
				return item.entity === 'complex_import.compleximportscheme'
			})

			// We do not need to store errors of first Instrument Types import
			createEntityItems(instrumentTypes, settings, cacheContainer, []).then(
				function () {


					createEntityItems(
						transactionTypeGroups,
						settings,
						cacheContainer,
						errors
					).then(function (value) {


						createEntityItems(
							transactionTypes,
							settings,
							cacheContainer,
							errors
						).then(function () {


							specialOverwriteInstrumentTypes(instrumentTypes[0]).then(
								function () {


									createEntityItems(
										attributeTypes,
										settings,
										cacheContainer,
										errors
									).then(function (data) {


										createEntityItems(
											otherEntities,
											settings,
											cacheContainer,
											errors
										).then(function (data) {


											createEntityItems(
												complexImportSchemes,
												settings,
												cacheContainer,
												errors
											).then(function (data) {
												console.log(
													'Complex import Schemes import success',
													data
												)

												createEntityItems(
													layoutEntities,
													settings,
													cacheContainer,
													errors
												).then(function (data) {
													createEntityItems(
														dashboardLayoutEntities,
														settings,
														cacheContainer,
														errors
													).then(function (data) {
														createEntityItems(
															bookmarks,
															settings,
															cacheContainer,
															errors
														)
															.then(function (data) {


																resolve(data)
															})
															.catch(function (reason) {
																console.log(
																	'importConfiguration.reason',
																	reason
																)

																reject(reason)
															})
													})
												})
											})
										})
									})
								}
							)
						})
					})
				}
			)
		})
	}

	// Create handler end

	var importConfiguration = function (items, settings) {
		return new Promise(function (resolve, reject) {
			if (!settings) {
				throw 'Settings is undefined'
			}

			configurationImportCompatibilityService
				.repairItems(items)
				.then(function () {


					var errors = []
					var cacheContainer = {}

					if (settings.mode === 'skip') {
						createEntities(items, settings, cacheContainer, errors).then(
							function () {






								resolve({
									errors: errors,
								})
							}
						)
					} else if (settings.mode === 'overwrite') {
						overwriteEntities(items, settings, cacheContainer, errors).then(
							function () {






								resolve({
									errors: errors,
								})
							}
						)
					} else {




						resolve({
							errors: errors,
						})
					}
				})
		})
	}

	var checkForDuplicates = function (file) {
		var formData = new FormData()

		formData.append('file', file)

		return configurationImportRepository.checkForDuplicates(formData)
	}

	return {
		importConfiguration: importConfiguration,
		checkForDuplicates: checkForDuplicates,
	}
}
