<template>
	<div class="channel-adding-menu">
		<FmTextField
			v-model="text"
			prepend-icon="mdi-magnify"
			placeholder="Search"
			hide-details
		/>

		<div class="channel-adding-menu__content">
			<div
				v-for="channel in allAvailableChannels"
				:key="channel.user_code"
				:class="[
					'channel-adding-menu__item',
					{
						'channel-adding-menu__item--joined':
							isChannelJoined(channel)
					}
				]"
				@click="_joinChannel(channel)"
			>
				<div class="channel-adding-menu__item-title">
					#{{ channel.user_code }} ({{ channel.name }})
				</div>

				<div class="channel-adding-menu__item-description">
					{{ channel.description }}
				</div>

				<div class="channel-adding-menu__item-info">
					{{ isChannelJoined(channel) ? 'Joined' : 'Join' }}

					<FmIcon
						:icon="
							isChannelJoined(channel)
								? 'mdi-check-circle-outline'
								: 'mdi-bell-plus-outline'
						"
						:color="
							isChannelJoined(channel)
								? 'var(--tertiary)'
								: 'var(--primary)'
						"
						size="16"
					/>
				</div>
			</div>
		</div>

		<div v-if="isLoading" class="channel-adding-menu__loader">
			<FmProgressCircular indeterminate size="80" />
		</div>
	</div>
</template>

<script setup>
	import { onBeforeMount, ref } from 'vue';
	import { storeToRefs } from 'pinia';
	import { FmIcon, FmProgressCircular, FmTextField } from '@finmars/ui';
	import useNotificationsStore from '~/stores/useNotificationsStore';

	const emits = defineEmits(['refresh']);

	const notificationsStore = useNotificationsStore();
	const { channels } = storeToRefs(notificationsStore);
	const { getAllAvailableChannels, joinChannel } = notificationsStore;

	const isLoading = ref(false);
	const allAvailableChannels = ref([]);
	const text = ref('');

	function isChannelJoined(channel) {
		const index = channels.value.findIndex(
			(c) => c.user_code === channel.user_code
		);
		return index !== -1;
	}

	async function _joinChannel(channel) {
		if (isChannelJoined(channel)) {
			return;
		}

		try {
			isLoading.value = true;
			await joinChannel(channel);
			emits('refresh');
		} finally {
			isLoading.value = false;
		}
	}

	async function loadAllAvailableChannels() {
		try {
			isLoading.value = true;
			allAvailableChannels.value = await getAllAvailableChannels();
		} finally {
			isLoading.value = false;
		}
	}

	onBeforeMount(async () => {
		await loadAllAvailableChannels();
	});
</script>

<style lang="scss" scoped>
	.channel-adding-menu {
		position: relative;
		width: 100%;
		height: 700px;
		background-color: var(--surface-container);

		:deep(.fm-text-field) {
			--backgroundColor-fmTextField: var(--surface-container);
		}

		&__content {
			position: relative;
			width: 100%;
			height: calc(100% - 58px);
			overflow-y: auto;
		}

		&__item {
			position: relative;
			width: 100%;
			padding: 16px;
			border-bottom: 1px solid var(--outline-variant);

			&-title {
				display: flex;
				justify-content: flex-start;
				align-items: center;
				font: var(--label-large-pro-font);
				color: var(--on-surface);
				margin-bottom: 10px;
			}

			&-description {
				font: var(--body-medium-font);
				color: var(--on-surface);
				max-width: 100%;
				white-space: nowrap;
				overflow: hidden;
				text-overflow: ellipsis;
				margin-bottom: 16px;
			}

			&-info {
				display: flex;
				justify-content: flex-start;
				align-items: center;
				column-gap: 8px;
				font: var(--title-small-font);
				color: var(--primary);
			}

			&--joined {
				.channel-adding-menu__item-info {
					color: var(--tertiary);
				}
			}

			&:not(.channel-adding-menu__item--joined):hover {
				cursor: pointer;
				background-color: color-mix(
					in srgb,
					var(--primary) 8%,
					transparent
				);
			}
		}

		&__loader {
			position: absolute;
			inset: 0;
			z-index: 1;
			display: flex;
			justify-content: center;
			align-items: center;
		}
	}
</style>
