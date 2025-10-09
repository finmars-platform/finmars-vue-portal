import {debounce} from 'lodash';
import {storeToRefs} from 'pinia';
import useStore from '~/stores/useStore';
import cloneDeep from 'lodash/cloneDeep';

export function useMarketplace() {
	const {configCodes} = storeToRefs(useStore());
	const store = useStore();
	const items = ref([]);
	const readyStatus = reactive({data: false});
	const filters = reactive({});

	const totalPages = ref(1);
	const currentPage = ref(1);
	const activeTaskId = ref(null);
	const pageSize = ref(9);
	const isShowModules = ref(false);

	const pages = ref([]);

	const matchItems = computed(() => {
		const res = cloneDeep(items.value);
		res.forEach((remoteItem) => {
			configCodes.value.forEach(function (localItem) {
				if (
					remoteItem.configuration_code ===
					localItem.configuration_code
				) {
					remoteItem.localItem = localItem;
				}
			});
		});

		return res;
	});

	function openPreviousPage() {
		if (currentPage.value <= 1) return;

		currentPage.value = currentPage.value - 1;

		getData();
	}

	function openNextPage() {
		if (currentPage.value >= totalPages.value) return;

		currentPage.value = currentPage.value + 1;

		getData();
	}

	function openPage(page) {
		if (!page.number) return;

		currentPage.value = page.number;

		getData();
	}

	function generatePages(data) {
		totalPages.value = Math.ceil(data.count / pageSize.value);

		pages.value = [];

		for (let i = 1; i <= totalPages.value; i++) {
			pages.value.push({
				number: i,
				caption: i.toString()
			});
		}

		if (totalPages.value > 10) {
			let currentPageIndex = 0;

			pages.value.forEach((item, index) => {
				if (currentPage.value === item.number) {
					currentPageIndex = index;
				}
			});

			pages.value = pages.value.filter((item, index) => {
				if (index < 2 || index > totalPages.value - 3) {
					return true;
				}

				if (index === currentPageIndex) {
					return true;
				}

				if (index > currentPageIndex - 3 && index < currentPageIndex) {
					return true;
				}

				if (index < currentPageIndex + 3 && index > currentPageIndex) {
					return true;
				}

				return false;
			});

			for (let i = 0; i < pages.value.length; i = i + 1) {
				let j = i + 1;

				if (j < pages.value.length) {
					if (pages.value[j].number && pages.value[i].number) {
						if (pages.value[j].number - pages.value[i].number > 1) {
							pages.value.splice(i + 1, 0, {
								caption: '...'
							});
						}
					}
				}
			}
		}
	}

	function buyConfiguration(configuration) {

		const client_code = store.ecosystemDefaults.license_key
		const user_return_url = window.location.href;

		fetch("https://marketplace.finmars.com/api/v1/checkout/?configuration_code=" + configuration.configuration_code + "&client_code=" + client_code + "&user_return_url=" + user_return_url).then((res) => res.json()).then((data) => {

			window.location.href = data.checkout_url

		})

	}

	async function getData() {
		readyStatus.data = false;

		if (isShowModules.value) {
			delete filters['is_package'];
		} else {
			filters['is_package'] = true;
		}

		const payload = {
			page_size: pageSize.value,
			page: currentPage.value,
			ordering: 'name',
			...filters
		};

		try {
			const data = await useApi('marketplaceList.get', {
				filters: payload,
				headers: {
					'X-Client-Code': store.ecosystemDefaults.license_key
				}
			});

			if (data) {
				generatePages(data);

				items.value = data.results;
			}
		} catch (e) {
			console.warn('Error marketplace.get', e);
		} finally {
			readyStatus.data = true;
		}
	}

	async function installConfiguration(item, version = null) {
		try {
			const payload = {
				configuration_code: item.configuration_code,
				version: version || item.latest_release_object.version,
				channel: item.latest_release_object.channel,
				is_package: item.is_package
			};

			const res = await useApi('marketplaceInstall.post', {
				body: payload
			});

			activeTaskId.value = res.task_id;
		} catch (e) {
			console.log('installConfiguration', e);
		}
	}

	async function setFiltersQuery(query) {
		currentPage.value = 1;
		filters.query = query;

		await getData();
	}

	const setFiltersQueryDebounced = debounce(async (query) => {
		await setFiltersQuery(query);
	}, 800);

	function setShowModules(bool) {
		currentPage.value = 1;
		isShowModules.value = bool;

		getData();
	}

	function removeActiveTaskId() {
		activeTaskId.value = null;
	}

	return {
		getData,
		isShowModules,
		activeTaskId,
		filters,
		items,
		matchItems,
		installConfiguration,
		currentPage,
		totalPages,
		pages,
		openNextPage,
		readyStatus,
		openPreviousPage,
		openPage,
		setFiltersQueryDebounced,
		setShowModules,
		removeActiveTaskId,
		buyConfiguration
	};
}
