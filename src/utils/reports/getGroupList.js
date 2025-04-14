import cloneDeep from 'lodash/cloneDeep';
import get from 'lodash/get';
import * as entityResolverService from '~/services/entity/entityResolverService';
import { isFilterValid } from '~/utils/evRvCommonHelper';
import { entityPluralToSingular } from '~/utils/queryParamsHelper';

export async function getGroupList({ currentLayout, sortGroup, options, entityType }) {
	const reportOptions = cloneDeep(get(currentLayout, ['data', 'reportOptions'], {}));

	if (entityType === 'transaction-report') {
		reportOptions.filters = cloneDeep(get(currentLayout, ['data', 'filters'], []));
	}

	reportOptions.page = options.page;
	reportOptions.page_size = options.page_size;
	reportOptions.frontend_request_options = cloneDeep(options.frontend_request_options);
	reportOptions.frontend_request_options.columns = cloneDeep(
		get(currentLayout, ['data', 'columns'], [])
	);

	if (sortGroup.key) {
		reportOptions.frontend_request_options.groups_order = sortGroup.sort;
		reportOptions.frontend_request_options.ordering_mode = sortGroup.key;
	}

	reportOptions.frontend_request_options.filter_settings = get(
		currentLayout,
		['data', 'filters'],
		[]
	).reduce((res, filter) => {
		if (isFilterValid(filter)) {
			res.push({
				key: entityPluralToSingular(filter.key),
				filter_type: filter.options?.filter_type,
				value_type: filter.value_type,
				value: filter.options?.filter_values
			});
		}

		return res;
	}, []);

	const data = await entityResolverService.getListReportGroups(entityType, reportOptions);

	if (data && !data._$error) {
		reportOptions.report_instance_id = data?.report_instance_id;
		reportOptions.created_at = data?.created_at;

		if (data.portfolios_object) {
			reportOptions.portfolios_table_data_objects = data?.portfolios_object;
		} else if (data.items) {
			reportOptions.portfolios_table_data_items = data?.items;
		}

		return {
			reportOptions,
			data: {
				next: null,
				previous: null,
				count: data?.count,
				results: cloneDeep(
					(data?.items || []).map((i) => ({
						...i,
						___group_identifier: i.___group_identifier || '-'
					}))
				),
				...(data?._$error && {
					error: data?.code
				})
			}
		};
	}
}
