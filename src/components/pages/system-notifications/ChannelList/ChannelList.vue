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

		<FmMenu
			v-model="isAddChannelMenuOpen"
			width="700"
			:offset="[4, -4]"
			:close-on-content-click="false"
		>
			<template #activator="{ props }">
				<div v-bind="props" class="channel-list__add" v-ripple.center>
					<FmIcon icon="mdi-plus" />
					<span>Add Channel</span>
				</div>
			</template>

			<ChannelAddingMenu @refresh="postProcess" />
		</FmMenu>
	</div>
</template>

<script setup>
	import { ref } from 'vue';
	import { storeToRefs } from 'pinia';
	import { FmIcon, FmMenu, Ripple } from '@finmars/ui';
	import { useNotificationsStore } from '~/stores/useNotificationsStore';
	import ChannelListItem from './ChannelListItem.vue';
	import ChannelAddingMenu from '~/components/pages/system-notifications/ChannelAddingMenu/ChannelAddingMenu.vue';

	const vRipple = Ripple;

	const emits = defineEmits(['refresh']);

	const notificationsStore = useNotificationsStore();
	const { channels, currentChannel } = storeToRefs(notificationsStore);
	const { setNotificationsFilter } = notificationsStore;

	const isAddChannelMenuOpen = ref(false);

	function postProcess() {
		isAddChannelMenuOpen.value = false;
		emits('refresh');
	}
</script>

<style lang="scss" scoped>
	.channel-list {
		position: relative;
		width: 100%;
		height: 100%;
		overflow-y: auto;
		font: var(--body-medium-font);
		color: var(--on-surface);
		padding-bottom: 56px;

		&__add {
			position: absolute;
			background-color: var(surface);
			left: 0;
			width: 100%;
			bottom: 0;
			height: 56px;
			padding-left: 24px;
			display: flex;
			justify-content: flex-start;
			align-items: center;
			column-gap: 8px;
			font: var(--label-large-font);
			color: var(--primary);
			border-top: 1px solid var(--outline-variant);
			user-select: none;
			cursor: pointer;

			&:hover {
				background-color: color-mix(
					in srgb,
					var(--primary) 8%,
					transparent
				);
			}
		}
	}
</style>
