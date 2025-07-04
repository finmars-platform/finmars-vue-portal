import useApi from '~/composables/useApi';
import { getEntitiesWithoutDynamicAttrsList } from '~/services/meta/metaRestrictionsService';

function getEndPoint(entity) {
	switch (entity) {
		case 'portfolio-register':
			return `portfolios/${entity}-attribute-type/`;
		case 'counterparty':
			return `counterparties/${entity}-attribute-type/`;
		case 'responsible':
			return `counterparties/${entity}-attribute-type/`;
		case 'currency':
			return `currencies/${entity}-attribute-type/`;
		case 'complex-transaction':
			return `transactions/${entity}-attribute-type/`;
		case 'transaction-type':
			return `transactions/${entity}-attribute-type/`;
		case 'instrument-type':
			return `instruments/${entity}-attribute-type/`;
		case 'account-type':
			return `accounts/${entity}-attribute-type/`;
		case 'portfolio-type':
			return `portfolios/${entity}-attribute-type/`;
		case 'strategy-1':
			return 'strategies/1/strategy-attribute-type/';
		case 'strategy-2':
			return 'strategies/2/strategy-attribute-type/';
		case 'strategy-3':
			return 'strategies/3/strategy-attribute-type/';
		default:
			return `${entity}s/${entity}-attribute-type/`;
	}
}

function getPrefix() {
	const host = useRuntimeConfig().public.apiURL;
	return host + '/{client}/api/v1';
}

export async function getList(entity, options) {
	const entities = getEntitiesWithoutDynamicAttrsList();
	if (entities.includes(entity)) {
		return {
			results: []
		};
	}

	const prefix = getPrefix();
	const endPoint = `${prefix}/${getEndPoint(entity)}`;
	return useApi(
		null,
		{ filters: options },
		{ apiUrl: endPoint, apiMethod: 'get' }
	);
}

export async function getByKey(entityType, id) {
	const prefix = getPrefix();
	const endPoint = `${prefix}/${getEndPoint(entityType)}${id}/`;
	return useApi(null, {}, { apiUrl: endPoint, apiMethod: 'get' });
}

export async function create(entity, attributeType) {
	const prefix = getPrefix();
	const endPoint = `${prefix}/${getEndPoint(entity)}`;
	return useApi(
		null,
		{ body: attributeType },
		{ apiUrl: endPoint, apiMethod: 'post' }
	);
}

export async function update(entity, attributeType) {
	const { id } = attributeType;
	const prefix = getPrefix();
	const endPoint = `${prefix}/${getEndPoint(entity)}${id}/`;
	return useApi(
		null,
		{ body: attributeType },
		{ apiUrl: endPoint, apiMethod: 'put' }
	);
}

export async function deleteByKey(entity, id) {
	const prefix = getPrefix();
	const endPoint = `${prefix}/${getEndPoint(entity)}${id}/`;
	return useApi(null, {}, { apiUrl: endPoint, apiMethod: 'delete' });
}
