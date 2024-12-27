import useApi from '~/composables/useApi';

export async function getList(options) {
	return useApi('portfolioList.get', { filters: options });
}

export async function create(portfolio) {
	return useApi('portfolioList.post', { body: portfolio });
}

export async function update(portfolio) {
	const id = portfolio.id;
	return useApi('portfolioList.put', { params: { id }, body: portfolio });
}
