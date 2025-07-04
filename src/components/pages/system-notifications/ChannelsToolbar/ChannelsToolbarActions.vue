<template>
	<FmMenu width="260">
		<template #activator="{ props }">
			<FmIconButton v-bind="props" variant="text" icon="mdi-dots-vertical" />
		</template>

		<template v-for="item in channelActions" :key="item.value">
			<template v-if="size(item.children)">
				<FmMenu
					width="260"
					location="left"
					:open-on-focus="false"
					open-on-hover
					submenu
				>
					<template #activator="{ props }">
						<FmMenuItem
							v-bind="props"
							item-size="large"
							:prepend-icon="item.icon"
							:title="item.title"
							append-icon="mdi-menu-right"
							:disabled="item.disabled"
						/>
					</template>

					<FmMenuItem
						v-for="child in item.children"
						:key="child.value"
						item-size="large"
						:prepend-icon="child.icon"
						:title="child.title"
						:disabled="child.disabled"
						@click="emits('select:action', child.value)"
					/>
				</FmMenu>
			</template>

			<FmMenuItem
				v-else
				item-size="large"
				:prepend-icon="item.icon"
				:title="item.title"
				:disabled="item.disabled"
				@click="emits('select:action', item.value)"
			/>
		</template>
	</FmMenu>
</template>

<script setup>
	import { computed } from 'vue';
	import { storeToRefs } from 'pinia';
	import size from 'lodash/size';
	import { FmIconButton, FmMenu, FmMenuItem } from '@finmars/ui';
	import { useNotificationsStore } from '~/stores/useNotificationsStore';
	import {
		CHANNEL_ACTIONS,
		CHANNEL_MUTE_ACTIONS,
		CHANNEL_UNMUTE_ACTIONS
	} from './constants';

	const props = defineProps({
		channel: {
			type: Object
		}
	});

	const emits = defineEmits(['select:action']);

	const { currentChannel } = storeToRefs(useNotificationsStore());

	const channelActions = computed(() => [
		props.channel?.mute ? CHANNEL_UNMUTE_ACTIONS : CHANNEL_MUTE_ACTIONS,
		...CHANNEL_ACTIONS.map((item) => ({
			...item,
			...(['details', 'leave'].includes(item.value) &&
				!currentChannel.value && { disabled: true })
		}))
	]);
</script>

<style lang="scss">
	.v-overlay-container {
		.v-overlay.v-menu {
			div.v-overlay__content {
				border-radius: 4px !important;

				& > div {
					border-radius: 4px !important;
					padding: 8px 0 !important;

					div {
						&.pointer-events-none {
							opacity: 0.5;
						}

						span {
							flex-grow: 1;
						}
					}
				}
			}
		}
	}
</style>
