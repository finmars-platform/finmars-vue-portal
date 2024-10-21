import filterService from './filter.service'
import sortService from './sort.service'

export default function (entityResolverService) {
    /**
     * Check if group already exists
     * @param {object} resultGroup - group for a check.
     * @param {object[]} result - groups that already exists
     * @return {boolean} return true if group exists
     */
    function groupAlreadyExist(resultGroup, result) {

        var exist = false;

        result.forEach(function (item) {

            if (item.___group_identifier === resultGroup.___group_identifier) {
                exist = true;
            }

        });


        return exist;
    }

    var convertNameKeyToUserCodeKey = function (key) {

        var result = key

        var pieces = key.split('.');

        var last_key;

        if (pieces.length > 1) {
            last_key = pieces.pop()

            if (['short_name', 'name', 'public_name'].indexOf(last_key) !== -1) {

                pieces.push('user_code')

                result = pieces.join('.')

            }

        }

        return result

    }

    /**
     * Get list of unique groups
     * @param {object[]} items - collection of items
     * @param {object} groupType - group type on which grouping is based
     * @return {object[]} return list of unique groups
     * @memberof module:ReportViewerDataProviderGroupsService
     */
    var getUniqueGroups = function (items, groupType) {

        var result = [];

        var resultGroup;

        console.log('getUniqueGroups.group', groupType)

        items.forEach(function (item) {

            resultGroup = {
                ___group_name: null,
                ___group_identifier: null,
                ___group_type_key: groupType.key,
            };

            var item_value = item[groupType.key];
            var identifier_value = item[groupType.key];
            var identifier_key = null;

            identifier_key = convertNameKeyToUserCodeKey(groupType.key)
            identifier_value = item[identifier_key];

            if (identifier_value !== null && identifier_value !== undefined && identifier_value !== '-') {

                resultGroup.___group_identifier = identifier_value.toString();
                resultGroup.___group_name = item_value.toString();


                if (groupType.key === 'complex_transaction.status') {

                    if (item_value === 1) {
                        resultGroup.___group_name = 'Booked'
                    }

                    if (item_value === 2) {
                        resultGroup.___group_name = 'Pending'
                    }

                    if (item_value === 3) {
                        resultGroup.___group_name = 'Ignored'
                    }

                }


            }

            // console.log('resultGroup', resultGroup);

            if (!groupAlreadyExist(resultGroup, result)) {

                result.push(resultGroup)
            }

        });

        console.log('result', result);

        return result;

    };

    /*var calculateSubtotals = function (groups, items, columns) {

        groups.forEach(function (group) {

            var groupItems = items.filter(function (item) {

                return item[group.___group_type_key] === group.___group_identifier

            })

            group.subtotal = rvSubtotalHelper.calculate(groupItems, columns);

        })

        return groups

    }

    var getFrontendList = function (entityType, options, entityViewerDataService) {

        return new Promise(function (resolve, reject) {

            var result = {
                next: null,
                previous: null,
                count: 0,
                results: []
            };

            var regularFilters = filterService.getRegularFilters(options);

            var reportOptions = entityViewerDataService.getReportOptions();
            var globalTableSearch = entityViewerDataService.getGlobalTableSearch();

            if (reportOptions.hasOwnProperty("items") && reportOptions.items.length > 0) {

                var items = reportOptions.items.concat();

                var groupTypes = entityViewerDataService.getGroups();

                items = filterService.filterTableRows(items, regularFilters, entityType);
                items = filterService.filterByGroupsFilters(items, options, groupTypes);

                if (globalTableSearch) {
                    items = filterService.filterByGlobalTableSearch(items, globalTableSearch)
                }


                // Victor 2021.02.08 filter by rows colors removed to rv-data.helper.js

                /!*				const rowTypeFilters = entityViewerDataService.getRowTypeFilters();

                                if (rowTypeFilters) {

                                    items = filterService.filterByRowType(items, rowTypeFilters.markedRowFilters);

                                }*!/

                var groupType = options.groups_types[options.groups_types.length - 1];

                console.log('before groups ', items);

                var groups = getUniqueGroups(items, groupType);

                console.log('groups', groups);
                const groupSortProperty = options.groups_order === 'desc' ? '-___group_name' : '___group_name';

                if (options.ordering_mode === 'manual') {

                    // const {key} = entityViewerDataService.getGroupTypeSort(groupType.key);
                    const key = groupType.key;

                    const groupTypeSortData = entityViewerDataService.getColumnSortData(key)

                    if (groupTypeSortData) {
                        groups = sortService.sortItemsManual(groups, groupSortProperty, groupTypeSortData);
                    }

                } else {

                    groups = sortService.sortItems(groups, groupSortProperty);

                }

                /!*                if (options.groups_order === 'desc') {
                                    groups = sortService.sortItems(groups, '-___group_name');
                                } else {
                                    groups = sortService.sortItems(groups, '___group_name');
                                }*!/

                var columns = entityViewerDataService.getColumns();

                groups = calculateSubtotals(groups, items, columns)

                result.count = groups.length;
                result.results = groups;

            } else {
                result.count = 0;
                result.results = [];
            }


            // console.log('get_groups_with_subtotal', JSON.parse(JSON.stringify(result)));

            resolve(result)

        });

    }*/

    var getBackendList = function (options, entityViewerDataService) {

        console.log("getBackendList options!", options)

        var entityType = entityViewerDataService.getEntityType();
        var reportOptions = entityViewerDataService.getReportOptions();

        console.log("getBackendList!", reportOptions)
        var globalTableSearch = entityViewerDataService.getGlobalTableSearch();

        reportOptions.filters = entityViewerDataService.getFilters(); // for transaction report only

        reportOptions.frontend_request_options = options
        reportOptions.frontend_request_options['columns'] = entityViewerDataService.getColumns()
        reportOptions.frontend_request_options['globalTableSearch'] = globalTableSearch

        if (!reportOptions.frontend_request_options['filter_settings']) {

            var filters = entityViewerDataService.getFilters();

            reportOptions.frontend_request_options['filter_settings'] = []

            filters.forEach(function (item) {

                if (evRvCommonHelper.isFilterValid(item)) {

                    var key = queryParamsHelper.entityPluralToSingular(item.key);

                    var filterSettings = {
                        key: key,
                        filter_type: item.options.filter_type,
                        // exclude_empty_cells: item.options.exclude_empty_cells,
                        value_type: item.value_type,
                        value: item.options.filter_values
                    };

                    reportOptions.frontend_request_options['filter_settings'].push(filterSettings);

                }

            });


        }

        return new Promise(function (resolve, reject) {

            entityResolverService.getListReportGroups(entityType, reportOptions).then(function (data) {

                // Important, needs to optimize backend reports
                // report_instance_id is saved report, so no need to recalcualte whole report
                // just regroup or refilter
                // to reset report_instance_id, just set it to null
                reportOptions.report_instance_id = data.report_instance_id;
                entityViewerDataService.setReportOptions(reportOptions);

                var result = {
                    next: null,
                    previous: null,
                    count: data.items.length,
                    results: data.items
                };

                resolve(result);

            })
                .catch(function (error) {
                    reject(error);
                });
        });

    }

    /**
     * Get list of groups
     * @param {string} entityType - string value of entity name (e.g. instrument-type)
     * @param {object} options - set of specific options
     * @param {object} entityViewerDataService - global data service
     * @return {boolean} return list of groups
     * @memberof module:ReportViewerDataProviderGroupsService
     */
    var getList = function (options, entityViewerDataService) {

        return getBackendList(options, entityViewerDataService)

        // Frontend is deprecated since 2023-09-10
        // if (window.location.href.indexOf('v2=true') !== -1) {
        //     return getBackendList(entityType, options, entityViewerDataService)
        // } else {
        //     return getFrontendList(entityType, options, entityViewerDataService)
        // }

    };


    return {
        getList: getList,
    }
}
