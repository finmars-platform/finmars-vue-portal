<template>
	<section class="notification-channels">
		<div class="notification-channels__toolbar">
			<span>Notifications</span>
			<ChannelsToolbar />
		</div>

		<div class="notification-channels__body">
			<div class="notification-channels__list">LIST</div>

			<div class="notification-channels__content">CONTENT</div>
		</div>
	</section>
</template>

<script setup>
	import { onBeforeMount } from 'vue';
	import useApi from '~/composables/useApi';
	import ChannelsToolbar from '~/components/pages/system-notifications/ChannelsToolbar/ChannelsToolbar.vue';
	//
	// onBeforeMount(async () => {
	// 	const channels = await useApi('systemNotificationsChannels.get');
	// 	console.log('channels: ', channels);
	// 	const userSubs = await useApi('systemNotificationsUserSubscriptions.get');
	// 	console.log('userSubs: ', userSubs);
	// 	const allSubs = await useApi('systemNotificationsSubscriptions.get');
	// 	console.log('allSubs: ', allSubs);
	// 	const notifications = await useApi('systemNotifications.get');
	// 	console.log('notifications: ', notifications);
	// });
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
			width: var(--notification-channels-list-width);
			border-right: 1px solid var(--outline-variant);
		}

		&__content {
			position: relative;
			width: calc(100% - var(--notification-channels-content-width) - 1px);
		}
	}
</style>
