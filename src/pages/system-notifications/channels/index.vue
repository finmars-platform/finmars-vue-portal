<template>
	<section class="notification-channels">
		<div class="notification-channels__toolbar">
			<span>Notifications</span>
			<ChannelsToolbar />
		</div>

		<div class="notification-channels__body">
			<div class="notification-channels__list">
				<ChannelList />
			</div>

			<div class="notification-channels__content">
				<NotificationsByChannel />
			</div>
		</div>

		<div v-if="isLoading" class="notification-channels__loader">
			<FmProgressCircular indeterminate size="100" />
		</div>
	</section>
</template>

<script setup>
	import { onBeforeMount, ref } from 'vue';
	import { FmProgressCircular } from '@finmars/ui';
	import useNotificationsStore from '~/stores/useNotificationsStore';
	import ChannelsToolbar from '~/components/pages/system-notifications/ChannelsToolbar/ChannelsToolbar.vue';
	import ChannelList from '~/components/pages/system-notifications/ChannelList/ChannelList.vue';
	import NotificationsByChannel from '~/components/pages/system-notifications/Notifications/Notifications.vue';

	const isLoading = ref(false);

	const {
		getChannels,
		getNotifications,
		getNotificationsStatuses,
		getNotificationsCategories
	} = useNotificationsStore();

	onBeforeMount(async () => {
		try {
			isLoading.value = true;

			await getNotificationsCategories();
			await getNotificationsStatuses();
			await getChannels();
			await getNotifications();

			// const channels = await useApi('systemNotificationsChannels.get');
			// console.log('channels: ', channels);
			// const userSubs = await useApi('systemNotificationsUserSubscriptions.get');
			// console.log('userSubs: ', userSubs);
			// const allSubs = await useApi('systemNotificationsSubscriptions.get');
			// console.log('allSubs: ', allSubs);
			// const notifications = await useApi('systemNotifications.get');
			// console.log('notifications: ', notifications);
		} finally {
			isLoading.value = false;
		}
	});
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
