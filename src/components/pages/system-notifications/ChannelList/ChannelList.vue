<template>
	<div class="channel-list">
		<ChannelListItem
			:item="{ name: 'All notifications', user_code: '' }"
			:is-selected="!currentChannel"
			@select="setNotificationsFilter({ channel: $event })"
		/>

		<ChannelListItem
			v-for="channel in channels"
			:key="channel.user_code"
			:item="channel"
			:is-selected="currentChannel?.user_code === channel.user_code"
			@select="setNotificationsFilter({ channel: $event })"
		/>
	</div>
</template>

<script setup>
	import { storeToRefs } from 'pinia';
	import useNotificationsStore from '~/stores/useNotificationsStore';
	import ChannelListItem from './ChannelListItem.vue';

	const notificationsStore = useNotificationsStore();
	const { channels, currentChannel } = storeToRefs(notificationsStore);
	const { setNotificationsFilter } = notificationsStore;
</script>

<style lang="scss" scoped>
	.channel-list {
		position: relative;
		width: 100%;
		height: 100%;
		overflow-y: auto;
		font: var(--body-medium-font);
		color: var(--on-surface);
	}
</style>
