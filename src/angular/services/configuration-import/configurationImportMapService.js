/**
 * Created by szhitenev on 12.09.2016.
 */
export default function (metaContentTypesService, attributeTypeService, uiService, configurationImportGetService) {

    var get_input_prop_by_content_type = function (model) {

        if (model === 'account') {
            return {
                'prop': 'account',
                'code': 'user_code'
            }
        }
        if (model === 'instrumenttype') {
            return {
                'prop': 'instrument_type',
                'code': 'user_code'
            }
        }
        if (model === 'instrument') {
            return {
                'prop': 'instrument',
                'code': 'user_code'
            }
        }
        if (model === 'currency') {
            return {
                'prop': 'currency',
                'code': 'user_code'
            }
        }
        if (model === 'counterparty') {
            return {
                'prop': 'counterparty',
                'code': 'user_code'
            }
        }
        if (model === 'responsible') {
            return {
                'prop': 'responsible',
                'code': 'user_code'
            }
        }
        if (model === 'portfolio') {
            return {
                'prop': 'portfolio',
                'code': 'user_code'
            }
        }
        if (model === 'strategy1') {
            return {
                'prop': 'strategy1',
                'code': 'user_code'
            }
        }
        if (model === 'strategy2') {
            return {
                'prop': 'strategy2',
                'code': 'user_code'
            }
        }
        if (model === 'strategy3') {
            return {
                'prop': 'strategy3',
                'code': 'user_code'
            }
        }
        if (model === 'dailypricingmodel') {
            return {
                'prop': 'daily_pricing_model',
                'code': 'user_code'
            }
        }
        if (model === 'paymentsizedetail') {
            return {
                'prop': 'payment_size_detail',
                'code': 'user_code'
            }
        }
        if (model === 'pricedownloadscheme') {
            return {
                'prop': 'payment_size_detail',
                'code': 'user_code'
            }
        }
        if (model === 'pricingpolicy') {
            return {
                'prop': 'pricing_policy',
                'code': 'user_code'
            }
        }
        if (model === 'periodicity') {
            return {
                'prop': 'periodicity',
                'code': 'user_code'
            }
        }
        if (model === 'accrualcalculationmodel') {
            return {
                'prop': 'accrual_calculation_model',
                'code': 'user_code'
            }
        }
        if (model === 'eventclass') {
            return {
                'prop': 'event_class',
                'code': 'user_code'
            }
        }
        if (model === 'notificationclass') {
            return {
                'prop': 'notification_class',
                'code': 'user_code'
            }
        }
    };

    var mapTransactionTypeInputsRelations = function (transactionType, cacheContainer, errors) {

        return new Promise(function (resolve) {

            var promises = [];

            transactionType.inputs.forEach(function (input) {

                if (input.value_type === 100) {

                    var model = input.content_type.split('.')[1];

                    var prop_data = get_input_prop_by_content_type(model);

                    var user_code_prop = '___' + prop_data.prop + '__' + prop_data.code;

                    if (input.hasOwnProperty(user_code_prop)) {

                        promises.push(new Promise(function (resolveRelation, reject) {

                            // console.log('input', input);
                            // console.log('input.content_type', input.content_type);

                            var user_code = input[user_code_prop];
                            var entity = metaContentTypesService.findEntityByContentType(input.content_type);

                            // console.log('input.entity', entity);

                            if (prop_data.code === 'user_code') {

                                configurationImportGetService.getEntityByUserCode(user_code, entity, cacheContainer).then(function (data) {

                                    input[model] = data.id;

                                    resolveRelation(input)

                                });

                            }

                            if (prop_data.code === 'user_code') {

                                configurationImportGetService.getEntityBySystemCode(user_code, entity, cacheContainer).then(function (data) {

                                    input[model] = data.id;

                                    resolveRelation(input)

                                });

                            }

                        }));

                    }

                }

            });

            Promise.all(promises).then(function (data) {
                resolve(data);
            })

        })

    };

    var mapTransactionTypeActionsRelations = function (transactionType, cacheContainer, errors, errorOptions) {

        return new Promise(function (resolve) {

            var promises = [];

            var actionsWithRelations = [
                'instrument',
                'transaction',
                'instrument_accrual_calculation_schedules',
                'instrument_event_schedule',
                'instrument_factor_schedule',
                'instrument_manual_pricing_formula'
            ];

            transactionType.actions.forEach(function (action) {

                actionsWithRelations.forEach(function (key) {

                    if (action[key]) {

                        promises.push(mapActionRelations(action, key, cacheContainer, errors, errorOptions))

                    }

                })


            });

            Promise.all(promises).then(function (data) {
                resolve(data);
            })

        })

    };

    var mapRelation = function (options, cacheContainer, errors, errorOptions) {

        errors = errors || [];

        console.log('options', options);

        var item = options.item;
        var item_key = options.item_key;
        var entity = options.entity;
        var code_type = options.code_type;
        var code = options.code;

        return new Promise(function (resolveRelation, reject) {

            if (item_key === 'price_download_scheme' || item_key === 'complex_transaction_import_scheme' || item_key === 'csv_import_scheme') {

                configurationImportGetService.getSchemeBySchemeName(code, entity).then(function (data) {

                    item[item_key] = data.id;

                    resolveRelation(item)

                }).catch(function (reason) {

                    item[item_key] = null;

                    errors.push({
                        item: errorOptions.item,
                        content_type: errorOptions.content_type,
                        error: {
                            message: 'Can\'t find scheme with name ' + code
                        },
                        mode: 'Delete missing field'

                    });

                    resolveRelation(reason)
                })

            } else {


                if (code_type === 'user_code') {

                    configurationImportGetService.getEntityByUserCode(code, entity, cacheContainer).then(function (data) {

                        item[item_key] = data.id;

                        resolveRelation(item)

                    }).catch(function (reason) {

                        item[item_key] = null;

                        errors.push({
                            item: errorOptions.item,
                            content_type: errorOptions.content_type,
                            error: {
                                message: 'Can\'t find relation entity with name ' + code
                            },
                            mode: 'Delete missing field'

                        });

                        resolveRelation(reason)
                    });

                }

                if (code_type === 'user_code') {

                    configurationImportGetService.getEntityBySystemCode(code, entity, cacheContainer).then(function (data) {

                        item[item_key] = data.id;

                        resolveRelation(item)

                    }).catch(function (reason) {

                        item[item_key] = null;

                        errors.push({
                            item: errorOptions.item,
                            content_type: errorOptions.content_type,
                            error: {
                                message: 'Can\'t find system entity with name ' + code
                            },
                            mode: 'Delete missing field'

                        });


                        resolveRelation(reason)
                    });

                }

            }

        })

    };


    var mapActionRelations = function (action, key, cacheContainer, errors, errorOptions) {

        return new Promise(function (resolve) {

            var promises = [];

            var relationProps = {
                'instrument': [
                    {
                        'key': 'accrued_currency',
                        'code_type': 'user_code',
                        'entity': 'currency'
                    },
                    {
                        'key': 'daily_pricing_model',
                        'code_type': 'user_code',
                        'entity': 'daily-pricing-model'
                    },
                    {
                        'key': 'instrument_type',
                        'code_type': 'user_code',
                        'entity': 'instrument-type'
                    },
                    {
                        'key': 'payment_size_detail',
                        'code_type': 'user_code',
                        'entity': 'payment-size-detail'
                    },
                    {
                        'key': 'price_download_scheme',
                        'code_type': 'user_code',
                        'entity': 'price-download-scheme'
                    },
                    {
                        'key': 'pricing_currency',
                        'code_type': 'user_code',
                        'entity': 'currency'
                    }],
                'transaction': [
                    {
                        'key': 'account_cash',
                        'code_type': 'user_code',
                        'entity': 'account'
                    },
                    {
                        'key': 'account_interim',
                        'code_type': 'user_code',
                        'entity': 'account'
                    },
                    {
                        'key': 'account_position',
                        'code_type': 'user_code',
                        'entity': 'account'
                    },
                    {
                        'key': 'allocation_balance',
                        'code_type': 'user_code',
                        'entity': 'instrument'
                    },
                    {
                        'key': 'allocation_pl',
                        'code_type': 'user_code',
                        'entity': 'instrument'
                    },
                    {
                        'key': 'instrument',
                        'code_type': 'user_code',
                        'entity': 'instrument'
                    },
                    {
                        'key': 'linked_instrument',
                        'code_type': 'user_code',
                        'entity': 'instrument'
                    },
                    {
                        'key': 'portfolio',
                        'code_type': 'user_code',
                        'entity': 'portfolio'
                    },
                    {
                        'key': 'responsible',
                        'code_type': 'user_code',
                        'entity': 'responsible'
                    },
                    {
                        'key': 'counterparty',
                        'code_type': 'user_code',
                        'entity': 'counterparty'
                    },
                    {
                        'key': 'settlement_currency',
                        'code_type': 'user_code',
                        'entity': 'currency'
                    },
                    {
                        'key': 'strategy1_cash',
                        'code_type': 'user_code',
                        'entity': 'strategy-1'
                    },
                    {
                        'key': 'strategy1_position',
                        'code_type': 'user_code',
                        'entity': 'strategy-1'
                    },
                    {
                        'key': 'strategy2_cash',
                        'code_type': 'user_code',
                        'entity': 'strategy-2'
                    },
                    {
                        'key': 'strategy2_position',
                        'code_type': 'user_code',
                        'entity': 'strategy-2'
                    },
                    {
                        'key': 'strategy3_cash',
                        'code_type': 'user_code',
                        'entity': 'strategy-3'
                    },
                    {
                        'key': 'strategy3_position',
                        'code_type': 'user_code',
                        'entity': 'strategy-3'
                    },
                    {
                        'key': 'transaction_class',
                        'code_type': 'user_code',
                        'entity': 'transaction-class'
                    },
                    {
                        'key': 'transaction_currency',
                        'code_type': 'user_code',
                        'entity': 'currency'
                    }
                ],
                'instrument_factor_schedule': [
                    {
                        'key': 'instrument',
                        'code_type': 'user_code',
                        'entity': 'instrument'
                    }],
                'instrument_manual_pricing_formula': [
                    {
                        'key': 'instrument',
                        'code_type': 'user_code',
                        'entity': 'instrument'
                    }, {
                        'key': 'pricing_policy',
                        'code_type': 'user_code',
                        'entity': 'pricing-policy'
                    }],
                'instrument_accrual_calculation_schedules': [
                    {
                        'key': 'instrument',
                        'code_type': 'user_code',
                        'entity': 'instrument'
                    },
                    {
                        'key': 'periodicity',
                        'code_type': 'user_code',
                        'entity': 'periodicity'
                    },
                    {
                        'key': 'accrual_calculation_model',
                        'code_type': 'user_code',
                        'entity': 'accrual-calculation-model'
                    }],
                'instrument_event_schedule': [
                    {
                        'key': 'instrument',
                        'code_type': 'user_code',
                        'entity': 'instrument'
                    },
                    {
                        'key': 'periodicity',
                        'code_type': 'user_code',
                        'entity': 'periodicity'
                    },
                    {
                        'key': 'notification_class',
                        'code_type': 'user_code',
                        'entity': 'notification-class'
                    },
                    {
                        'key': 'event_class',
                        'code_type': 'user_code',
                        'entity': 'event-class'
                    }]
            };

            relationProps[key].forEach(function (propItem) {

                var code_prop = '___' + propItem.key + '__' + propItem.code_type;

                // console.log('code_prop', code_prop);
                // console.log('action', action);

                // TODO Make recursive like import method to make caching work properly

                if (action[key].hasOwnProperty(code_prop)) {

                    var options = {};

                    options['code'] = action[key][code_prop];
                    options['code_type'] = propItem.code_type;
                    options['entity'] = propItem.entity;
                    options['item'] = action[key];
                    options['item_key'] = propItem.key;

                    promises.push(mapRelation(options, cacheContainer, errors, errorOptions))


                }


            });

            Promise.all(promises).then(function (data) {

                resolve(action);

            })

        })

    };

    var mapReportOptions = function (layout, cacheContainer, errors, errorOptions) {

        return new Promise(function (resolve) {

            var promises = [];

            if (layout.data.reportOptions) {

                if (layout.data.reportOptions.pricing_policy_object) {

                    promises.push(new Promise(function (resolveRelation, reject) {

                        var user_code = layout.data.reportOptions.pricing_policy_object.user_code;

                        configurationImportGetService.getEntityByUserCode(user_code, 'pricing-policy', cacheContainer).then(function (data) {

                            layout.data.reportOptions.pricing_policy = data.id;
                            layout.data.reportOptions.pricing_policy_object = data;

                            resolveRelation(layout)

                        }).catch(function (reason) {

                            layout.data.reportOptions.pricing_policy = null;
                            layout.data.reportOptions.pricing_policy_object = null;

                            errors.push({
                                item: errorOptions.item,
                                content_type: errorOptions.content_type,
                                error: {
                                    message: 'Can\'t find Pricing policy with name ' + code
                                },
                                mode: 'Delete missing field'

                            });

                            resolveRelation(layout)
                        });

                    }))

                }

                if (layout.data.reportOptions.report_currency_object) {

                    promises.push(new Promise(function (resolveRelation, reject) {

                        var user_code = layout.data.reportOptions.report_currency_object.user_code;

                        configurationImportGetService.getEntityByUserCode(user_code, 'currency', cacheContainer).then(function (data) {

                            layout.data.reportOptions.report_currency = data.id;
                            layout.data.reportOptions.report_currency_object = data;

                            resolveRelation(layout)

                        }).catch(function (reason) {

                            layout.data.reportOptions.pricing_policy = null;
                            layout.data.reportOptions.pricing_policy_object = null;

                            errors.push({
                                item: errorOptions.item,
                                content_type: errorOptions.content_type,
                                error: {
                                    message: 'Can\'t find Report Currency with name ' + code
                                },
                                mode: 'Delete missing field'

                            });

                            resolveRelation(layout)
                        });

                    }))

                }

                if (layout.data.reportOptions.cost_method_object) {

                    promises.push(new Promise(function (resolveRelation, reject) {

                        var user_code = layout.data.reportOptions.cost_method_object.user_code;

                        configurationImportGetService.getEntityBySystemCode(user_code, 'cost-method', cacheContainer).then(function (data) {

                            layout.data.reportOptions.cost_method = data.id;
                            layout.data.reportOptions.cost_method_object = data;

                            resolveRelation(layout)

                        }).catch(function (reason) {

                            layout.data.reportOptions.pricing_policy = null;
                            layout.data.reportOptions.pricing_policy_object = null;

                            errors.push({
                                item: errorOptions.item,
                                content_type: errorOptions.content_type,
                                error: {
                                    message: 'Can\'t find Cost Method with name ' + code
                                },
                                mode: 'Delete missing field'

                            });

                            resolveRelation(layout)
                        });

                    }))

                }

                layout.data.reportOptions.portfolios = [];
                layout.data.reportOptions.accounts = [];
                layout.data.reportOptions.strategies1 = [];
                layout.data.reportOptions.strategies2 = [];
                layout.data.reportOptions.strategies3 = [];

            }

            Promise.all(promises).then(function () {
                resolve(layout)
            })

        })

    };

    var mapFieldsInInstrumentType = function (item) {

        return new Promise(function (resolve, reject) {

            var promises = [];

            if (item.hasOwnProperty('___one_off_event__user_code')) {

                promises.push(new Promise(function (resolveRelation, reject) {

                    var user_code = item.___one_off_event__user_code;

                    configurationImportGetService.getEntityByUserCode(user_code, 'transaction-type').then(function (data) {

                        item.one_off_event = data.id;

                        resolveRelation(item)

                    });

                }));

            }

            if (item.hasOwnProperty('___regular_event__user_code')) {

                promises.push(new Promise(function (resolveRelation, reject) {

                    var user_code = item.___regular_event__user_code;

                    configurationImportGetService.getEntityByUserCode(user_code, 'transaction-type').then(function (data) {

                        item.regular_event = data.id;

                        resolveRelation(item)

                    });

                }));

            }

            if (item.hasOwnProperty('___factor_same__user_code')) {

                promises.push(new Promise(function (resolveRelation, reject) {

                    var user_code = item.___factor_same__user_code;

                    configurationImportGetService.getEntityByUserCode(user_code, 'transaction-type').then(function (data) {

                        item.factor_same = data.id;

                        resolveRelation(item)

                    });

                }));

            }

            if (item.hasOwnProperty('___factor_up__user_code')) {

                promises.push(new Promise(function (resolveRelation, reject) {

                    var user_code = item.___factor_up__user_code;

                    configurationImportGetService.getEntityByUserCode(user_code, 'transaction-type').then(function (data) {

                        item.factor_up = data.id;

                        resolveRelation(item)

                    });

                }));

            }

            if (item.hasOwnProperty('___factor_down__user_code')) {

                promises.push(new Promise(function (resolveRelation, reject) {

                    var user_code = item.___factor_down__user_code;

                    configurationImportGetService.getEntityByUserCode(user_code, 'transaction-type').then(function (data) {

                        item.factor_down = data.id;

                        resolveRelation(item)

                    });

                }));

            }

            Promise.all(promises).then(function (value) {

                resolve(item);

            })

        })

    };

    var mapEditLayout = function (layout) {

        return new Promise(function (resolve) {

            var entityType = metaContentTypesService.findEntityByContentType(layout.content_type, 'ui');

            attributeTypeService.getList(entityType, {pageSize: 1000}).then(function (data) {

                var layoutAttrs = data.results;

                if (layout.data) {

                    layout.data.forEach(function (tab) {

                        tab.layout.fields.forEach(function (field) {

                            if (field.attribute && field.attribute.id) {

                                var mapped = false;

                                layoutAttrs.forEach(function (layoutAttr) {

                                    if (layoutAttr.user_code === field.attribute.user_code) {
                                        field.attribute = layoutAttr;
                                        field.id = layoutAttr.id;
                                        mapped = true;
                                    }

                                });

                                if (mapped === false) {
                                    field.attribute = null;
                                    field.id = null;
                                    field.attribute_class = null;
                                    field.type = "empty"
                                }


                            }

                        })

                    });
                }

                resolve(layout);

            });

        })

    };

    var recursiveMapItemInLayout = function (resolve, items, index, errors, errorOptions) {

        if (items.length) {

            console.log('index', index);

            if (items[index].hasOwnProperty('attribute_type')) {

                var code = items[index].attribute_type.user_code;
                var entity = metaContentTypesService.findEntityByContentType(items[index].content_type, 'ui');

                if (entity) {

                    configurationImportGetService.getAttributeTypeByUserCode(code, entity).then(function () {

                        index = index + 1;

                        if (index < items.length - 1) {

                            recursiveMapItemInLayout(resolve, items, index, errors, errorOptions);
                        } else {
                            resolve(items);
                        }

                    }).catch(function (error) {

                        items.splice(index, 1);

                        index = index - 1;

                        if (index < 0) {
                            index = 0
                        }

                        errors.push({
                            item: errorOptions.item,
                            content_type: errorOptions.content_type,
                            error: {
                                message: 'Missing attribute: ' + code
                            },
                            mode: 'The related column has been deleted from layout'

                        });


                        console.log('splice items', items);

                        if (index < items.length - 1) {
                            recursiveMapItemInLayout(resolve, items, index, errors, errorOptions)
                        } else {
                            resolve(items);
                        }

                    })

                } else {

                    items.splice(index, 1);

                    index = index - 1;

                    if (index < 0) {
                        index = 0
                    }

                    errors.push({
                        item: errorOptions.item,
                        content_type: errorOptions.content_type,
                        error: {
                            message: 'Missing attribute: ' + code
                        },
                        mode: 'The related column has been deleted from layout'

                    });

                    console.log('splice items', items);

                    if (index < items.length - 1) {
                        recursiveMapItemInLayout(resolve, items, index, errors, errorOptions)
                    } else {
                        resolve(items);
                    }

                }

            } else {

                index = index + 1;

                if (index < items.length - 1) {

                    recursiveMapItemInLayout(resolve, items, index, errors, errorOptions)

                } else {

                    resolve(items)

                }
            }

        } else {
            resolve(items)
        }

    };

    var recursiveMapCustomFieldItemInLayout = function (resolve, items, index, errors, errorOptions, layoutContentType) {

        if (items.length) {

            console.log('index', index);

            if (items[index].hasOwnProperty('custom_field')) {

                var code = items[index].custom_field.user_code;
                var entity = metaContentTypesService.findEntityByContentType(layoutContentType, 'ui');

                console.log('layoutContentType', layoutContentType);
                console.log('items[index].content_type', items[index]);
                console.log('entity', entity);


                configurationImportGetService.getCustomFieldByUserCode(code, entity).then(function () {

                    index = index + 1;

                    if (index < items.length - 1) {

                        recursiveMapCustomFieldItemInLayout(resolve, items, index, errors, errorOptions, layoutContentType);
                    } else {
                        resolve(items);
                    }

                }).catch(function (error) {

                    console.log('error', error);

                    items.splice(index, 1);

                    index = index - 1;

                    if (index < 0) {
                        index = 0
                    }

                    errors.push({
                        item: errorOptions.item,
                        content_type: errorOptions.content_type,
                        error: {
                            message: 'Missing Custom Field: ' + code
                        },
                        mode: 'The related column has been deleted from layout'

                    });


                    console.log('splice items', items);

                    if (index < items.length - 1) {
                        recursiveMapCustomFieldItemInLayout(resolve, items, index, errors, errorOptions, layoutContentType)
                    } else {
                        resolve(items);
                    }

                })


            } else {

                index = index + 1;

                if (index < items.length - 1) {

                    recursiveMapCustomFieldItemInLayout(resolve, items, index, errors, errorOptions, layoutContentType)

                } else {

                    resolve(items)

                }
            }

        } else {
            resolve(items)
        }

    };

    var recursiveMapListLayout = function (items, errors, errorOptions) {

        return new Promise(function (resolve, reject) {

            var startIndex = 0;

            recursiveMapItemInLayout(resolve, items, startIndex, errors, errorOptions);

        })

    };

    var recursiveMapCustomFieldListLayout = function (items, errors, errorOptions, layoutContentType) {

        return new Promise(function (resolve, reject) {

            var startIndex = 0;

            recursiveMapCustomFieldItemInLayout(resolve, items, startIndex, errors, errorOptions, layoutContentType);

        })

    };

    var mapListLayout = function (layout, cacheContainer, errors, errorOptions) {

        return new Promise(function (resolve, reject) {

            if (layout.data) {

                mapReportOptions(layout, cacheContainer, errors, errorOptions).then(function (layout) {

                    recursiveMapListLayout(layout.data.columns, errors, errorOptions).then(function (columns) {

                        layout.data.columns = columns;

                        recursiveMapListLayout(layout.data.grouping, errors, errorOptions).then(function (grouping) {

                            layout.data.grouping = grouping;

                            recursiveMapCustomFieldListLayout(layout.data.columns, errors, errorOptions, layout.content_type).then(function (columns) {

                                layout.data.columns = columns;

                                recursiveMapCustomFieldListLayout(layout.data.grouping, errors, errorOptions, layout.content_type).then(function (grouping) {

                                    layout.data.grouping = grouping;

                                    resolve(layout)

                                })

                            })

                        })


                    });

                })
            } else {
                resolve(layout)
            }
        })

    };

    var mapDashboardComponentType = function (componentType, errors, errorOptions, missedComponentTypesIds) {

        console.log("mapDashboardComponentType componentType", componentType);

        return new Promise(function (resolve, reject) {

            /* uiService.getListLayoutDefault({
                filters: {
                    content_type: componentType.settings.content_type,
                    name: componentType.settings.layout_name
                }
            }) */
            uiService.getListLayout(
                null,
                {
                    filters: {
                        content_type: componentType.settings.content_type,
                        name: componentType.settings.layout_name
                    }
                }
            ).then(function (data) {

                console.log('mapDashboardComponentType data', data);

                if (data.results.length) {

                    var resultItem;

                    data.results.forEach(function (result) {

                        if (result.name === componentType.settings.layout_name) {
                            resultItem = result;
                        }

                    });

                    console.log('componentType.settings.layout_name', componentType.settings.layout_name);
                    console.log('mapDashboardComponentType resultItem', resultItem);

                    if (resultItem) {

                        componentType.settings.layout = resultItem.id;

                        console.log('mapDashboardComponentType layout find componentType', componentType);

                        resolve();

                    } else {


                        errors.push({
                            item: errorOptions.item,
                            content_type: errorOptions.content_type,
                            error: {
                                message: 'Component Type [' + componentType.name + '] Missing Layout Option: ' + componentType.settings.layout_name
                            },
                            mode: 'The related Component Type Layout Option is set to null'

                        });

                        console.log('mapDashboardComponentType errors', errors);

                        componentType.settings.layout = null;
                        componentType.settings.layout_name = null;

                        missedComponentTypesIds.push(componentType.id);

                        resolve();
                    }

                } else {

                    errors.push({
                        item: errorOptions.item,
                        content_type: errorOptions.content_type,
                        error: {
                            message: 'Component Type [' + componentType.name + '] Missing Layout Option: ' + componentType.settings.layout_name
                        },
                        mode: 'The related Component Type Layout Option is set to null'

                    });

                    console.log('mapDashboardComponentType errors', errors);

                    componentType.settings.layout = null;
                    componentType.settings.layout_name = null;

                    missedComponentTypesIds.push(componentType.id);

                    resolve();
                }

            })

        })

    };

    var mapDashboardLayout = function (layout, cacheContainer, errors, errorOptions) {

        return new Promise(function (resolve, reject) {

            if (layout.data) {

                var promises = [];
                var missedComponentTypesIds = [];

                if (layout.data.components_types) {

                    layout.data.components_types.forEach(function (componentType) {

                        if (componentType.settings.hasOwnProperty('layout_name')) {

                            promises.push(mapDashboardComponentType(componentType, errors, errorOptions, missedComponentTypesIds))

                        }

                    });

                }

                layout.data.tabs.forEach(function (tab) {

                    tab.layout.rows.forEach(function (row) {

                        row.columns.forEach(function (item) {

                            if (item.cell_type === 'component') {

                                if (item.data.settings.hasOwnProperty('layout_name')) {

                                    promises.push(mapDashboardComponentType(item.data, errors, errorOptions, missedComponentTypesIds))

                                }

                            }

                        })

                    })

                });

                Promise.all(promises).then(function (data) {

                    resolve(layout)

                }).catch(function () {


                })

            } else {
                resolve(layout)
            }

        })
    };

    return {
        mapTransactionTypeInputsRelations: mapTransactionTypeInputsRelations,
        mapTransactionTypeActionsRelations: mapTransactionTypeActionsRelations,
        mapRelation: mapRelation,
        mapReportOptions: mapReportOptions,
        mapFieldsInInstrumentType: mapFieldsInInstrumentType,
        mapEditLayout: mapEditLayout,
        mapListLayout: mapListLayout,
        mapDashboardLayout: mapDashboardLayout
    }

};