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
				v-for="channel in allAvailableChannelsFiltered"
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
				<div
					class="channel-adding-menu__item-title"
					v-fm-html="getChannelName(channel)"
				/>

				<div
					class="channel-adding-menu__item-description"
					v-fm-html="highlightText(channel.description, text)"
				/>

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
	import { computed, onBeforeMount, ref } from 'vue';
	import { storeToRefs } from 'pinia';
	import {
		FmIcon,
		FmProgressCircular,
		FmTextField,
		FmHtml
	} from '@finmars/ui';
	import { useNotificationsStore } from '~/stores/useNotificationsStore';
	import { highlightText } from '~/utils/highlightString';

	const vFmHtml = FmHtml;

	const emits = defineEmits(['refresh']);

	const notificationsStore = useNotificationsStore();
	const { channels } = storeToRefs(notificationsStore);
	const { getAllAvailableChannels, joinChannel } = notificationsStore;

	const isLoading = ref(false);
	const allAvailableChannels = ref([]);
	const text = ref('');

	const allAvailableChannelsFiltered = computed(() =>
		allAvailableChannels.value.filter(
			(c) =>
				c.name.toLowerCase().includes(text.value.toLowerCase()) ||
				c.description.toLowerCase().includes(text.value.toLowerCase())
		)
	);

	function getChannelName(channel) {
		const name = `#${channel.user_code} ${channel.name}`;
		return highlightText(name, text.value);
	}

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
			const list = await getAllAvailableChannels();
			list.sort((a, b) => (a.user_code > b.user_code ? 1 : -1));
			allAvailableChannels.value = list;
		} finally {
			isLoading.value = false;
		}
	}

	onBeforeMount(async () => {
		await loadAllAvailableChannels();
	});
</script>

<style lang="scss" scoped>
	@import '../../../../assets/scss/core/_mixins.scss';

	:global(.text-highlight) {
		font-weight: 700;
		color: var(--primary);
	}

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
				font: var(--label-large-pro-font);
				color: var(--on-surface);
				margin-bottom: 10px;
				@include text-overflow-ellipsis();
			}

			&-description {
				font: var(--body-medium-font);
				color: var(--on-surface);
				margin-bottom: 16px;
				@include text-overflow-ellipsis();
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
