import useApi from '~/composables/useApi';

export default defineStore({
	id: 'notifications',
	state: () => ({
		channels: [],
		notifications: [],
		categories: [],
		statuses: [],
		notificationsFilter: {
			channel: '',
			category: '',
			status: '',
			dateFrom: '',
			dateTo: '',
			search: ''
		}
	}),
	getters: {
		currentChannel: (state) => {
			return state.channels.find((c) => {
				const { channel } = state.notificationsFilter;
				if (!channel) {
					return false;
				}
				return c.user_code === channel;
			});
		}
	},
	actions: {
		setNotificationsFilter(value) {
			if (
				JSON.stringify(value) ===
				JSON.stringify(this.notificationsFilter)
			)
				return;

			this.notificationsFilter = {
				...this.notificationsFilter,
				...value
			};
		},

		async getNotificationsStatuses() {
			try {
				this.statuses = await useApi(
					'systemNotificationsStatusList.get',
					{
						filters: { page: 1, pageSize: 1000 }
					}
				);
			} catch (e) {
				console.error('Statuses load error. ', e);
			}
		},

		async getNotificationsCategories() {
			try {
				this.categories = await useApi(
					'systemNotificationsCategoryList.get',
					{
						filters: { page: 1, pageSize: 1000 }
					}
				);
			} catch (e) {
				console.error('Categories load error. ', e);
			}
		},

		async getChannels() {
			try {
				this.channels = await useApi(
					'systemNotificationsChannels.get',
					{
						filters: { page: 1, pageSize: 1000 }
					}
				);
			} catch (e) {
				console.error('Channels load error. ', e);
			}
		},

		async getAllAvailableChannels(options = {}) {
			try {
				const res = await useApi('systemNotificationsChannelsAll.get', {
					filters: {
						...options,
						page: 1,
						pageSize: 1000
					}
				});
				return res.results;
			} catch (e) {
				console.error('All available channels load error. ', e);
				return [];
			}
		},

		async getNotifications() {
			try {
				const { channel, category, status, dateFrom, dateTo, search } =
					this.notificationsFilter;

				const data = await useApi('systemNotifications.get', {
					filters: {
						...(channel && { channel }),
						...(status && { status }),
						...(category && { category }),
						...(dateFrom && { date_from: dateFrom }),
						...(dateTo && { date_to: dateTo }),
						...(search && { search }),
						page: 1,
						pageSize: 1000
					}
				});
				this.notifications = data.results;
				return data.results;
			} catch (e) {
				console.error('Notifications load error. ', e);
				return [];
			}
		},

		joinChannel(channel) {
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
		},

		leaveChannel(user_code) {
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
	}
});
