<template>
	<section class="notification-channels">
		<div class="notification-channels__toolbar">
			<span>Notifications</span>
			<ChannelsToolbar @select:action="handleActions" />
		</div>

		<div class="notification-channels__body">
			<div class="notification-channels__list">
				<ChannelList @refresh="getChannels" />
			</div>

			<div class="notification-channels__content">
				<div class="notification-channels__content-list">
					<NotificationsByChannel />
				</div>

				<FmPagination
					v-if="notificationsTotal > 10"
					:model-value="notificationsFilter.page"
					:items-per-page="notificationsFilter.pageSize"
					:total-items="notificationsTotal"
					:disabled="isLoading"
					@update:model-value="
						setNotificationsFilter({ page: $event })
					"
				/>
			</div>
		</div>

		<Transition name="fade" mode="out-in">
			<div
				v-if="isDetailsBlockOpen"
				class="notification-channels__details"
			>
				<FmIconButton
					variant="text"
					icon="mdi-close"
					class="notification-channels__details-close"
					@click="isDetailsBlockOpen = false"
				/>

				<h4>About channel</h4>

				<div class="notification-channels__details-content">
					{{ currentChannel.description }}
				</div>
			</div>
		</Transition>

		<div v-if="isLoading" class="notification-channels__loader">
			<FmProgressCircular indeterminate size="100" />
		</div>
	</section>
</template>

<script setup>
	import {
		defineAsyncComponent,
		inject,
		onBeforeMount,
		ref,
		watch
	} from 'vue';
	import { storeToRefs } from 'pinia';
	import dayjs from 'dayjs';
	import {
		FmIconButton,
		FmPagination,
		FmProgressCircular,
		FM_DIALOGS_KEY
	} from '@finmars/ui';
	import { useNotificationsStore } from '~/stores/useNotificationsStore';
	import ChannelsToolbar from '~/components/pages/system-notifications/ChannelsToolbar/ChannelsToolbar.vue';
	import ChannelList from '~/components/pages/system-notifications/ChannelList/ChannelList.vue';
	import NotificationsByChannel from '~/components/pages/system-notifications/Notifications/Notifications.vue';

	const dialogsService = inject(FM_DIALOGS_KEY);
	const route = useRoute();

	const isDetailsBlockOpen = ref(false);

	const notificationsStore = useNotificationsStore();

	const {
		currentChannel,
		notificationsFilter,
		notificationsTotal,
		isLoading
	} = storeToRefs(notificationsStore);
	const {
		setNotificationsFilter,
		getChannels,
		getNotifications,
		getNotificationsStatuses,
		getNotificationsCategories,
		leaveChannel
	} = notificationsStore;

	function _leaveChannel() {
		const confirmDialog = defineAsyncComponent(
			() => import('../../../components/modal/ConfirmationDialog.vue')
		);
		dialogsService.$openDialog({
			component: confirmDialog,
			componentProps: {
				text: 'Are you sure that you want to leave this channel?'
			},
			dialogProps: {
				title: 'Leave channel',
				width: 320,
				onConfirm: async () => {
					try {
						isLoading.value = true;
						await leaveChannel(currentChannel.value.user_code);
						setNotificationsFilter({ channel: '' });
						await getChannels();
					} finally {
						isLoading.value = false;
					}
				}
			}
		});
	}

	function handleActions(action) {
		if (!currentChannel) {
			return;
		}

		switch (action) {
			case 'details':
				isDetailsBlockOpen.value = true;
				break;
			case 'leave':
				_leaveChannel();
				break;
		}
	}

	async function loadData() {
		try {
			isLoading.value = true;

			await getNotificationsCategories();
			await getNotificationsStatuses();
			await getChannels();
			await getNotifications();
		} finally {
			isLoading.value = false;
		}
	}

	onBeforeMount(async () => {
		const endDate = dayjs().format('YYYY-MM-DD');
		const startDate = dayjs().subtract(7, 'day').format('YYYY-MM-DD');

		const {
			channel,
			category = '',
			status = '',
			dateFrom,
			dateTo,
			search,
			page = 1,
			pageSize = 10
		} = route.query;
		setNotificationsFilter({
			...(channel && { channel }),
			...(status && { status: status.split(',') }),
			...(category && { category: category.split(',') }),
			...(!(dateFrom && dateTo) && {
				dateFrom: startDate,
				dateTo: endDate
			}),
			...(dateFrom && { date_from: dateFrom }),
			...(dateTo && { date_to: dateTo }),
			...(search && { search }),
			page: Number(page),
			pageSize: Number(pageSize)
		});

		await loadData();
	});

	watch(
		() => notificationsFilter.value,
		async () => {
			try {
				isLoading.value = true;
				await getNotifications();
			} finally {
				isLoading.value = false;
			}
		}
	);
</script>

<style lang="scss" scoped>
	.notification-channels {
		--notification-channels-toolbar-height: 64px;
		--notification-channels-list-width: 420px;

		position: relative;
		width: 100%;
		height: 100%;
		background-color: var(--surface);

		&__toolbar {
			display: flex;
			width: 100%;
			height: var(--notification-channels-toolbar-height);
			justify-content: space-between;
			align-items: center;
			padding: 0 16px;
			font: var(--label-large-pro-font);
			color: var(--on-surface);
			border-bottom: 1px solid var(--outline-variant);
		}

		&__body {
			display: flex;
			width: 100%;
			height: calc(100% - var(--notification-channels-toolbar-height));
			justify-content: flex-start;
			align-items: stretch;
		}

		&__list {
			position: relative;
			min-width: var(--notification-channels-list-width);
			width: var(--notification-channels-list-width);
			border-right: 1px solid var(--outline-variant);
		}

		&__content {
			position: relative;
			width: calc(100% - 1px - var(--notification-channels-list-width));

			&-list {
				position: relative;
				width: 100%;
				height: calc(100% - 72px);
				margin-bottom: 8px;
				overflow-y: auto;
			}
		}

		&__details {
			position: absolute;
			left: 0;
			width: 100%;
			bottom: 0;
			z-index: 1;
			background-color: var(--surface);
			border-top: 1px solid var(--outline-variant);
			padding: 32px;
			color: var(--on-surface);

			h4 {
				font: var(--label-large-pro-font);
				margin-bottom: 24px;
			}

			&-content {
				font: var(--body-medium-font);
			}

			&-close {
				position: absolute;
				top: 16px;
				right: 16px;
			}
		}

		&__loader {
			position: absolute;
			inset: 0;
			display: flex;
			justify-content: center;
			align-items: center;
			pointer-events: none;
			z-index: 5;
			background-color: rgba(0, 0, 0, 0.2);
		}
	}
</style>
