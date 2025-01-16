import useApi from '~/composables/useApi';

export async function updateDashboardLayout(data) {
	const id = data.id;
	return useApi('dashboardLayout.put', { params: { id }, body: data });
}
