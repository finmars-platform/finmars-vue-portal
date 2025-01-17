<template>
	<div class="notifications">
		<div
			v-for="notif in selectedChannelNotifications"
			:key="notif.user_code"
			class="notification"
		>
			<div class="notification__title">
				<span
					class="notification__text--accented"
					v-fm-html="processText(notif.title)"
				/>
				<span>from</span>
				<span class="notification__text--accented">
					{{ notif.owner }}
				</span>
				<span>
					{{ dayjs(notif.created_at).format('DD MMM HH:mm') }}
				</span>
				<span class="notification__text--accented">
					#{{ notif.channel }}
				</span>
			</div>

			<div
				class="notification__content"
				v-fm-html="processText(notif.content)"
			/>
		</div>
	</div>
</template>

<script setup>
	import { computed } from 'vue';
	import { storeToRefs } from 'pinia';
	import dayjs from 'dayjs';
	import { FmHtml } from '@finmars/ui';
	import useNotificationsStore from '~/stores/useNotificationsStore';

	const vFmHtml = FmHtml;

	const notificationsStore = useNotificationsStore();
	const { notificationsFilter, selectedChannelNotifications } =
		storeToRefs(notificationsStore);

	const searchFilter = computed(() =>
		notificationsFilter.value.search.toLowerCase()
	);

	function processText(text) {
		if (!searchFilter.value) {
			return text;
		}

		const index = text.toLowerCase().indexOf(searchFilter.value);
		const part1 = text.slice(0, index);
		const part2 = text.slice(index, index + searchFilter.value.length);
		const part3 = text.slice(index + searchFilter.value.length);
		return `<span>${part1}<span class="text-highlight">${part2}</span>${part3}</span>`;
	}
</script>

<style lang="scss" scoped>
	.notifications {
		position: relative;
		width: 100%;
		height: 100%;
		overflow-y: auto;
	}

	.notification {
		position: relative;
		width: 100%;
		padding: 16px;
		border-bottom: 1px solid var(--outline-variant);
		cursor: pointer;

		&:hover {
			background-color: color-mix(
				in srgb,
				var(--primary) 8%,
				transparent
			);
		}

		&__title {
			display: flex;
			justify-content: flex-start;
			align-items: center;
			column-gap: 6px;
			font: var(--body-medium-font);
			color: var(--on-surface-variant);
			margin-bottom: 8px;
		}

		&__text {
			&--accented {
				font: var(--body-medium-pro-font);
				color: var(--on-surface);
			}
		}

		&__content {
			font: var(--body-medium-font);
			color: var(--on-surface);
		}

		:deep(.text-highlight) {
			font-weight: 700;
			color: var(--primary);
		}
	}
</style>
