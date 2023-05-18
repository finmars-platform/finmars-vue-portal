/**
 * Created by szhitenev on 12.09.2016.
 */

export default function (metaContentTypesService, configurationImportGetService, configurationImportMapService) {

    var syncTransactionType = function (item, cacheContainer, errors) {

        return new Promise(function (resolve, reject) {

            var promises = [];

            var errorOptions = {
                item: item,
                content_type: 'transactions.transactiontype'
            };

            if (item.hasOwnProperty('___group__user_code')) {

                promises.push(new Promise(function (resolveRelation, reject) {

                    var user_code = item.___group__user_code;

                    configurationImportGetService.getEntityByUserCode(user_code, 'transaction-type-group', cacheContainer).then(function (data) {

                        item.group = data.id;

                        // console.log('___group__user_code', user_code);

                        resolveRelation(item)

                    });

                }));

            }

            promises.push(configurationImportMapService.mapTransactionTypeInputsRelations(item, cacheContainer, errors));

            promises.push(configurationImportMapService.mapTransactionTypeActionsRelations(item, cacheContainer, errors, errorOptions));

            Promise.all(promises).then(function (data) {

                resolve(item);

            })

        })


    };

    var syncInstrumentType = function (item, cacheContainer) {

        return new Promise(function (resolve, reject) {

            configurationImportMapService.mapFieldsInInstrumentType(item).then(function (updatedItem) {

                console.log('syncInstrumentType.updatedItem', updatedItem);

                resolve(updatedItem)

            });

        })

    };

    var syncCurrency = function (item, cacheContainer, errors) {

        return new Promise(function (resolve, reject) {

            var promises = [];

            var options = {};

            var errorOptions = {
                item: item,
                content_type: 'currencies.currency'
            };

            if (item.hasOwnProperty('___price_download_scheme__user_code')) {

                options['item'] = item;
                options['code'] = item['___price_download_scheme__user_code'];
                options['code_type'] = 'user_code';
                options['entity'] = 'price-download-scheme';
                options['item_key'] = 'price_download_scheme';

                promises.push(configurationImportMapService.mapRelation(options, cacheContainer, errors, errorOptions))

            }

            if (item.hasOwnProperty('___daily_pricing_model__user_code')) {

                options['item'] = item;
                options['code'] = item['___daily_pricing_model__user_code'];
                options['code_type'] = 'user_code';
                options['entity'] = 'daily-pricing-model';
                options['item_key'] = 'daily_pricing_model';

                promises.push(configurationImportMapService.mapRelation(options, cacheContainer, errors, errorOptions))

            }


            Promise.all(promises).then(function (data) {

                resolve(item)
            });


        })

    };

    var syncEditLayout = function (item, cacheContainer) {

        return new Promise(function (resolve, reject) {

            resolve(configurationImportMapService.mapEditLayout(item));

        })

    };

    var syncListLayout = function (item, cacheContainer, errors) {

        var errorOptions = {
            item: item,
            content_type: 'ui.listlayout'
        };

        return new Promise(function (resolve, reject) {
            resolve(configurationImportMapService.mapListLayout(item, cacheContainer, errors, errorOptions));
        })

    };

    var syncDashboardLayout = function (item, cacheContainer, errors) {

        var errorOptions = {
            item: item,
            content_type: 'ui.dashboardlayout'
        };

        return new Promise(function (resolve, reject) {
            resolve(configurationImportMapService.mapDashboardLayout(item, cacheContainer, errors, errorOptions));
        })

    };

    var syncReportLayout = function (item, cacheContainer, errors) {

        var errorOptions = {
            item: item,
            content_type: 'ui.reportlayout'
        };


        return new Promise(function (resolve, reject) {
            resolve(configurationImportMapService.mapListLayout(item, cacheContainer, errors, errorOptions));
        })

    };

    var syncInstrumentDownloadScheme = function (item, cacheContainer, errors) {

        return new Promise(function (resolve) {

            var promises = [];

            var options = {};

            var errorOptions = {
                item: item,
                content_type: 'integrations.instrumentdownloadscheme'
            };

            if (item.hasOwnProperty('___price_download_scheme__user_code')) {

                options['item'] = item;
                options['code'] = item['___price_download_scheme__user_code'];
                options['code_type'] = 'user_code';
                options['entity'] = 'price-download-scheme';
                options['item_key'] = 'price_download_scheme';

                promises.push(configurationImportMapService.mapRelation(options, cacheContainer, errors, errorOptions))

            }

            Promise.all(promises).then(function (data) {

                resolve(data)
            });


        })

    };

    var syncComplexImportScheme = function (item, cacheContainer, errors) {

        return new Promise(function (resolve) {

            var promises = [];

            var errorOptions = {
                item: item,
                content_type: 'complex_import.compleximportscheme'
            };

            item.actions.forEach(function (actionItem, index) {

                var options = {};

                if (actionItem.csv_import_scheme) {

                    if (actionItem.csv_import_scheme.hasOwnProperty('___csv_import_scheme__user_code')) {

                        options['item'] = actionItem.csv_import_scheme;
                        options['code'] = actionItem.csv_import_scheme['___csv_import_scheme__user_code'];
                        options['code_type'] = 'user_code';
                        options['entity'] = 'csv-import-scheme';
                        options['item_key'] = 'csv_import_scheme';

                        promises.push(configurationImportMapService.mapRelation(options, cacheContainer, errors, errorOptions))

                    }

                }

                if (actionItem.complex_transaction_import_scheme) {

                    if (actionItem.complex_transaction_import_scheme.hasOwnProperty('___complex_transaction_import_scheme__user_code')) {

                        options['item'] = actionItem.complex_transaction_import_scheme;
                        options['code'] = actionItem.complex_transaction_import_scheme['___complex_transaction_import_scheme__user_code'];
                        options['code_type'] = 'user_code';
                        options['entity'] = 'complex-transaction-import-scheme';
                        options['item_key'] = 'complex_transaction_import_scheme';

                        promises.push(configurationImportMapService.mapRelation(options, cacheContainer, errors, errorOptions))

                    }

                }

            });

            Promise.all(promises).then(function (data) {

                console.log("Complex Import Scheme success");

                resolve(data)

            }, function (error) {

                console.log("Complex Import Scheme error", error);

                resolve(item);

            });


        })

    };

    var syncCsvImportScheme = function (item, cacheContainer, errors) {

        return new Promise(function (resolve, reject) {

            var promises = [];

            var errorOptions = {
                item: item,
                content_type: 'csv_import.csvimportscheme'
            };


            item.entity_fields.forEach(function (entityField) {

                if (entityField.___dynamic_attribute_id__user_code) {

                    var code = entityField.___dynamic_attribute_id__user_code;
                    var entityType = metaContentTypesService.findEntityByContentType(item.content_type);
                    var item_key = 'dynamic_attribute_id';


                    promises.push(new Promise(function (resolveLocal, rejectLocal) {

                        configurationImportGetService.getAttributeTypeByUserCode(code, entityType).then(function (data) {

                            entityField[item_key] = data.id;

                            resolveLocal(entityField)

                        }).catch(function (reason) {

                            errors.push({
                                content_type: errorOptions.content_type,
                                item: errorOptions.item,
                                error: {
                                    message: 'Can\'t find attribute type'
                                },
                                mode: 'skip'
                            });


                            rejectLocal(reason);

                        })

                    }))

                }

            });

            Promise.all(promises).then(function (data) {

                resolve(data)
            }, function (reason) {

                console.log('Reject sync csv import scheme');
                reject(reason)

            });


        })

    };

    var syncComplexTransactionImportScheme = function (item, cacheContainer, errors) {

        return new Promise(function (resolve, reject) {

            var promises = [];

            var errorOptions = {
                item: item,
                content_type: 'integrations.complextransactionimportscheme'
            };


            item.rule_scenarios.forEach(function (rule) {

                if (rule.hasOwnProperty('___transaction_type__user_code')) {

                    promises.push(new Promise(function (resolveRelation, rejectRelation) {

                        var user_code = rule.___transaction_type__user_code;

                        configurationImportGetService.getEntityByUserCode(user_code, 'transaction-type', cacheContainer).then(function (data) {

                            if (user_code !== '-' && data.user_code === '-') {

                                errors.push({
                                    item: errorOptions.item,
                                    content_type: errorOptions.content_type,
                                    error: {
                                        message: "Missing Transaction Type: " + user_code + ' is not found'
                                    },
                                    mode: 'Transaction Import Scheme has not been imported'

                                });

                                rejectRelation(item)

                            } else {

                                rule.transaction_type = data.id;

                                rule.fields = rule.fields.map(function (field) {

                                    data.inputs.forEach(function (input) {

                                        if (field.___input__name === input.name) {
                                            field.transaction_type_input = input.id;
                                        }

                                    });

                                    return field;

                                });


                                var fieldsValid = true;
                                var fieldsError = [];

                                rule.fields.forEach(function (field) {

                                    if (!field.transaction_type_input) {
                                        fieldsValid = false;
                                        fieldsError.push(field.___input__name)
                                    }

                                });

                                if (fieldsValid) {
                                    resolveRelation(item)
                                } else {

                                    errors.push({
                                        item: errorOptions.item,
                                        content_type: errorOptions.content_type,
                                        error: {
                                            message: "Can't find Transaction Type (" + rule.___transaction_type__user_code + " # " + rule._order+ ") input for fields. Missing Input names: " + fieldsError.join(', ')
                                        },
                                        mode: 'The related Transaction Type has been deleted from layout'

                                    });

                                    rejectRelation(item);
                                }
                            }

                        }).catch(function (reason) {

                            errors.push({
                                item: errorOptions.item,
                                content_type: errorOptions.content_type,
                                error: {
                                    message: "Can't find Transaction Type (" + rule.___transaction_type__user_code + " # " + rule._order+ ") Something went wrong."
                                },
                                mode: 'The related Transaction Type has been deleted from layout'

                            });

                            rejectRelation(reason);
                        })

                    }));

                }

            });

            Promise.all(promises).then(function (data) {

                resolve(item);

            }, function (reason) {

                console.log('Reject sync transaction scheme?');
                reject(reason)
            })

        })

    };

    var syncItem = function (item, entity, cacheContainer, errors) {

        return new Promise(function (resolve, reject) {

            errors = errors || [];

            console.log('errors', errors);
            console.log('syncItem', entity);

            try {

                switch (entity) {

                    case 'transactions.transactiontype':
                        resolve(syncTransactionType(item, cacheContainer, errors));
                        break;
                    case 'currencies.currency':
                        resolve(syncCurrency(item, cacheContainer, errors));
                        break;
                    case 'instruments.instrumenttype':
                        resolve(syncInstrumentType(item, cacheContainer, errors));
                        break;
                    case 'ui.editlayout':
                        resolve(syncEditLayout(item, cacheContainer, errors));
                        break;
                    case 'ui.listlayout':
                        resolve(syncListLayout(item, cacheContainer, errors));
                        break;
                    case 'ui.dashboardlayout':
                        resolve(syncDashboardLayout(item, cacheContainer, errors));
                        break;
                    case 'ui.reportlayout':
                        resolve(syncReportLayout(item, cacheContainer, errors));
                        break;
                    case 'integrations.instrumentdownloadscheme':
                        resolve(syncInstrumentDownloadScheme(item, cacheContainer, errors));
                        break;
                    case 'complex_import.compleximportscheme':
                        resolve(syncComplexImportScheme(item, cacheContainer, errors));
                        break;
                    case 'csv_import.csvimportscheme':
                        resolve(syncCsvImportScheme(item, cacheContainer, errors));
                        break;
                    case 'integrations.complextransactionimportscheme':
                        resolve(syncComplexTransactionImportScheme(item, cacheContainer, errors));
                        break;
                    default:
                        resolve(item);
                        break;
                }

            } catch (error) {

                console.log('syncItem .error', error);

                reject(error);

            }

        })

    };


    return {
        syncItem: syncItem
    }
};