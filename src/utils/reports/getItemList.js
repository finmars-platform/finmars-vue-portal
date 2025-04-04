import cloneDeep from 'lodash/cloneDeep';
import get from 'lodash/get';
import { isFilterValid } from '~/utils/evRvCommonHelper';
import { entityPluralToSingular } from '~/utils/queryParamsHelper';
import { getListReportItems } from '~/services/entity/entityResolverService';

export async function getItemList({ currentLayout, sortColumn, options, entityType }) {
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

	if (sortColumn.key) {
		reportOptions.frontend_request_options.items_order = sortColumn.sort;
		reportOptions.frontend_request_options.ordering = sortColumn.key;
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

	const data = await getListReportItems(entityType, reportOptions);

	if (data && !data._$error) {
		reportOptions.report_instance_id = data?.report_instance_id;
		reportOptions.created_at = data?.created_at;
	}

	return {
		reportOptions,
		data: {
			next: null,
			previous: null,
			count: data?.count,
			results: cloneDeep(data?.items || []),
			...(data?._$error && {
				error: data?.code
			})
		}
	};
}
