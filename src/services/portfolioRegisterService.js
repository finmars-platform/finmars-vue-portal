import useApi from '~/composables/useApi';

export async function getList(options) {
	return useApi('portfolioRegisterList.get', { filters: options });
}

export async function create(portfolio) {
	return useApi('portfolioRegisterList.post', { body: portfolio });
}

export async function update(portfolio) {
	const id = portfolio.id;
	return useApi('portfolioRegisterList.put', {
		params: { id },
		body: portfolio
	});
}
