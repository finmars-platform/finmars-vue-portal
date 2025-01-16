import cloneDeep from 'lodash/cloneDeep';
import {
	CHANNELS,
	NOTIFICATIONS,
	NOTIFICATION_STATUSES,
	NOTIFICATION_CATEGORIES
} from '@/assets/data/systemNotifications.mock';
// import useApi from '~/composables/useApi';

export default defineStore({
	id: 'notifications',
	state: () => ({
		statuses: [],
		categories: [],
		channels: [],
		notifications: [],
		notificationsFilter: {
			category: '',
			channel: '',
			status: '',
			dateFrom: '',
			dateTo: '',
			text: ''
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
		},

		selectedChannelNotifications: (state) => {
			const {
				category: currentCategory,
				channel: currentChannel,
				status: currentStatus
			} = state.notificationsFilter;

			return state.notifications.filter((n) => {
				const { category, channel, current_status } = n;

				const isTheSameCategory =
					!currentCategory || category === currentCategory;
				const isTheSameChannel = !currentChannel || channel === currentChannel;
				const isTheSameStatus =
					!currentStatus || current_status === currentStatus;

				return isTheSameCategory && isTheSameChannel && isTheSameStatus;
			});
		}
	},
	actions: {
		setNotificationsFilter(value) {
			this.notificationsFilter = {
				...this.notificationsFilter,
				...value
			};
		},

		getNotificationsStatuses() {
			return new Promise((resolve) => {
				setTimeout(() => {
					this.statuses = cloneDeep(NOTIFICATION_STATUSES);
					resolve();
				}, 600);
			});
		},

		getNotificationsCategories() {
			return new Promise((resolve) => {
				setTimeout(() => {
					this.categories = cloneDeep(NOTIFICATION_CATEGORIES);
					resolve();
				}, 700);
			});
		},

		getChannels() {
			return new Promise((resolve) => {
				setTimeout(() => {
					this.channels = cloneDeep(CHANNELS);
					resolve();
				}, 400);
			});
		},

		getNotifications(filter = {}) {
			this.setNotificationsFilter(filter);

			return new Promise((resolve) => {
				setTimeout(() => {
					this.notifications = cloneDeep(NOTIFICATIONS);
					resolve();
				}, 500);
			});
		}
	}
});
