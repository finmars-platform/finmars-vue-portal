import { computed, ref } from 'vue';
import { defineStore } from 'pinia';
import isEmpty from 'lodash/isEmpty';
import useApi from '~/composables/useApi';

export const useNotificationsStore = defineStore('notifications', () => {
	const router = useRouter();

	const isLoading = ref(false);
	const channels = ref([]);
	const categories = ref([]);
	const statuses = ref([]);
	const notificationsRequestResult = ref({});
	const notificationsFilter = ref({
		channel: '',
		category: [],
		status: [],
		dateFrom: '',
		dateTo: '',
		search: '',
		page: 1,
		pageSize: 10
	});

	const currentChannel = computed(() =>
		channels.value.find((c) => {
			const { channel } = notificationsFilter.value;
			if (!channel) {
				return false;
			}
			return c.user_code === channel;
		})
	);
	const notifications = computed(
		() => notificationsRequestResult.value.results || []
	);
	const notificationsTotal = computed(
		() => notificationsRequestResult.value?.count
	);
	const notificationsTotalPage = computed(() => {
		const tp = Math.ceil(
			(notificationsRequestResult.value?.count || 0) /
				(notificationsFilter.value.pageSize || 10)
		);
		return Math.max(tp, 1);
	});

	function setNotificationsFilter(value) {
		const updatedField = Object.keys(value);
		const isNecessaryUpdate = updatedField.some(
			(key) => value[key] !== notificationsFilter.value[key]
		);

		if (!isNecessaryUpdate) {
			return;
		}

		notificationsFilter.value = {
			...notificationsFilter.value,
			...value
		};

		notificationsFilter.value.page = Math.min(
			notificationsFilter.value.page,
			notificationsTotalPage.value
		);

		const {
			channel,
			category = [],
			status = [],
			dateFrom,
			dateTo,
			search,
			page = 1,
			pageSize = 10
		} = notificationsFilter.value;

		router.push({
			query: {
				...(channel && { channel }),
				...(!isEmpty(status) && { status: status.join(',') }),
				...(!isEmpty(category) && { category: category.join(',') }),
				...(dateFrom && { date_from: dateFrom }),
				...(dateTo && { date_to: dateTo }),
				...(search && { search }),
				page,
				pageSize
			}
		});
	}

	async function getNotificationsStatuses() {
		try {
			const res = await useApi('systemNotificationsStatusList.get', {
				filters: {
					sortBy: 'name',
					order: 'asc'
				}
			});
			statuses.value = Array.isArray(res) ? res : [];
		} catch (e) {
			console.error('Statuses load error. ', e);
			statuses.value = [];
		}
	}

	async function getNotificationsCategories() {
		try {
			const res = await useApi('systemNotificationsCategoryList.get', {
				filters: {
					sortBy: 'name',
					order: 'asc'
				}
			});
			categories.value = Array.isArray(res) ? res : [];
		} catch (e) {
			console.error('Categories load error. ', e);
			categories.value = [];
		}
	}

	async function getChannels() {
		try {
			const res = await useApi('systemNotificationsChannels.get');
			channels.value = Array.isArray(res) ? res : [];
			channels.value.sort((a, b) => (a.user_code > b.user_code ? 1 : -1));
		} catch (e) {
			console.error('Channels load error. ', e);
			channels.value = [];
		}
	}

	async function getAllAvailableChannels(options = {}) {
		try {
			const res = await useApi('systemNotificationsChannelsAll.get', {
				filters: {
					page: 1,
					pageSize: 1000,
					...options
				}
			});
			return res.results.sort((a, b) =>
				a.user_code > b.user_code ? 1 : -1
			);
		} catch (e) {
			console.error('All available channels load error. ', e);
			return [];
		}
	}

	async function getNotifications() {
		try {
			const {
				channel,
				category,
				status,
				dateFrom,
				dateTo,
				search,
				page = 1,
				pageSize = 10
			} = notificationsFilter.value;

			notificationsRequestResult.value = await useApi(
				'systemNotifications.get',
				{
					filters: {
						...(channel && { channel }),
						...(!isEmpty(status) && { status }),
						...(!isEmpty(category) && { category }),
						...(dateFrom && { date_from: dateFrom }),
						...(dateTo && { date_to: dateTo }),
						...(search && { search }),
						page,
						pageSize
					}
				}
			);
		} catch (e) {
			console.error('Notifications load error. ', e);
			return [];
		}
	}

	function joinChannel(channel) {
		try {
			const channelUserCode = channel?.user_code;
			if (!channelUserCode) {
				console.error('Channel user_code does not exist');
				return;
			}

			return useApi('systemNotificationsChannelJoin.post', {
				params: { channelUserCode }
			});
		} catch (e) {
			console.error(
				`Error during join the channel ${channelUserCode}`,
				e
			);
		}
	}

	function leaveChannel(user_code) {
		try {
			if (!user_code) {
				console.error('Channel user_code does not exist');
				return;
			}

			return useApi('systemNotificationsChannelLeave.post', {
				params: { channelUserCode: user_code }
			});
		} catch (e) {
			console.error(`Error during leave the channel ${user_code}`, e);
		}
	}

	return {
		isLoading,
		channels,
		categories,
		statuses,
		notificationsRequestResult,
		notificationsFilter,
		currentChannel,
		notifications,
		notificationsTotal,
		notificationsTotalPage,
		setNotificationsFilter,
		getNotificationsStatuses,
		getNotificationsCategories,
		getChannels,
		getAllAvailableChannels,
		getNotifications,
		joinChannel,
		leaveChannel
	};
});
