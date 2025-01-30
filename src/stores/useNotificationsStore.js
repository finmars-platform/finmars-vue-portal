// FixMe All actions here work with mock data. It will be necessary to rewrite the code as soon as real APIs become available
import cloneDeep from 'lodash/cloneDeep';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import {
	ALL_AVAILABLE_CHANNELS,
	CHANNELS,
	NOTIFICATIONS,
	NOTIFICATION_STATUSES,
	NOTIFICATION_CATEGORIES
} from '@/assets/data/systemNotifications.mock';
import useApi from '~/composables/useApi';

dayjs.extend(relativeTime);

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
		},

		selectedChannelNotifications: (state) => {
			const {
				category: currentCategory,
				channel: currentChannel,
				status: currentStatus,
				dateFrom,
				dateTo,
				search
			} = state.notificationsFilter;

			return state.notifications
				.filter((n) => {
					const {
						category,
						channel,
						current_status,
						created_at,
						title,
						content
					} = n;

					const isTheSameCategory =
						!currentCategory || category === currentCategory;
					const isTheSameChannel =
						!currentChannel || channel === currentChannel;
					const isTheSameStatus =
						!currentStatus || current_status === currentStatus;
					const isTheSameText =
						!search ||
						title.toLowerCase().includes(search.toLowerCase()) ||
						content.toLowerCase().includes(search.toLowerCase());

					const transformedCreatedAt =
						dayjs(created_at).format('YYYY-MM-DD');
					const dateMoreThanFrom =
						!dateFrom ||
						dayjs(transformedCreatedAt).diff(
							dayjs(dateFrom),
							'day'
						) >= 0;
					const dateLessThanTo =
						!dateTo ||
						dayjs(dateTo).diff(
							dayjs(transformedCreatedAt),
							'day'
						) >= 0;

					const isTheSameDate = dateMoreThanFrom && dateLessThanTo;

					return (
						isTheSameCategory &&
						isTheSameChannel &&
						isTheSameStatus &&
						isTheSameText &&
						isTheSameDate
					);
				})
				.sort((a, b) => (a.created_at > b.created_at ? 1 : -1));
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

		async getChannels() {
			const res = await useApi('systemNotificationsChannels.get');
			console.log('RES: ', res);

			return new Promise((resolve) => {
				setTimeout(() => {
					this.channels = cloneDeep(CHANNELS);
					resolve();
				}, 400);
			});
		},

		getAllAvailableChannels() {
			return new Promise((resolve) => {
				setTimeout(() => {
					resolve(cloneDeep(ALL_AVAILABLE_CHANNELS));
				}, 550);
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
		},

		joinChannel(channel) {
			console.log('join channel: ', channel.user_code);
			return new Promise((resolve) => {
				setTimeout(() => {
					this.channels.push(channel);
					resolve();
				}, 350);
			});
		},

		leaveChannel(user_code) {
			console.log('leave channel: ', user_code);
			return new Promise((resolve) => {
				setTimeout(() => {
					console.log(`The user left channel ${user_code}`);
					const channelIndex = this.channels.findIndex(
						(c) => c.user_code === user_code
					);
					channelIndex > -1 && this.channels.splice(channelIndex, 1);

					this.setNotificationsFilter({ channel: '' });
					resolve();
				}, 500);
			});
		}
	}
});
