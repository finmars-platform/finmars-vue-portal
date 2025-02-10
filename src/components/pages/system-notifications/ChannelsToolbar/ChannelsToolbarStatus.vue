<template>
	<FmMenu
		v-model="isMenuOpen"
		:items="notificationStatuses"
		width="260"
		:close-on-content-click="false"
		scroll-strategy="block"
	>
		<template #activator="{ props }">
			<FmButton
				v-bind="props"
				type="secondary"
				rounded
				append-icon="mdi-menu-down"
			>
				{{ selectedStatus }}

				<FmTooltip
					activator="parent"
					type="secondary"
					location="top"
					:disabled="size(statusesFilterValue) < 2"
				>
					{{ statusesFilterValue.join(', ') }}
				</FmTooltip>
			</FmButton>
		</template>

		<template #item="{ item }">
			<div class="status-item" @click.stop.prevent="selectItem(item)">
				<FmCheckbox
					v-if="item.user_code"
					:model-value="statusesFilterValue.includes(item.user_code)"
				/>

				<span class="status-item__name">
					{{ item.name }}
				</span>
			</div>
		</template>
	</FmMenu>
</template>

<script setup>
	import { computed, ref, watch } from 'vue';
	import { storeToRefs } from 'pinia';
	import { FmButton, FmCheckbox, FmMenu, FmTooltip } from '@finmars/ui';
	import { useNotificationsStore } from '~/stores/useNotificationsStore';
	import size from 'lodash/size';
	import cloneDeep from 'lodash/cloneDeep';

	const notificationsStore = useNotificationsStore();
	const { statuses, notificationsFilter } = storeToRefs(notificationsStore);
	const { setNotificationsFilter } = notificationsStore;

	const isMenuOpen = ref(false);
	const statusesFilterValue = ref([]);

	const notificationStatuses = computed(() => [
		{ user_code: '', name: 'All statuses' },
		...statuses.value
	]);

	const statusFilter = computed(() => notificationsFilter.value.status);

	const selectedStatus = computed(() => {
		if (size(statusesFilterValue.value) === 0) {
			return 'All statuses';
		}

		const val = notificationStatuses.value
			.filter((c) => statusesFilterValue.value.includes(c.user_code))
			.map((c) => c.name);
		return size(val) === 1
			? `Status: ${val[0]}`
			: `Statuses: ${val[0]} (+ ${size(val) - 1})`;
	});

	function selectItem(item) {
		if (!item.user_code) {
			statusesFilterValue.value = [];
			updateFilter([]);
			isMenuOpen.value = false;
			return;
		}

		const index = statusesFilterValue.value.findIndex(
			(v) => v === item.user_code
		);
		if (index === -1) {
			statusesFilterValue.value.push(item.user_code);
		} else {
			statusesFilterValue.value.splice(index, 1);
		}
	}

	function updateFilter(val) {
		setNotificationsFilter({ status: val });
	}

	watch(
		() => isMenuOpen.value,
		(val, oVal) => {
			if (val !== oVal && !val) {
				updateFilter(statusesFilterValue.value);
			}
		}
	);

	watch(
		() => statusFilter.value,
		() => {
			if (
				JSON.stringify(statusFilter.value) ===
				JSON.stringify(statusesFilterValue.value)
			) {
				statusesFilterValue.value = cloneDeep(statusFilter.value);
			}
		},
		{ immediate: true }
	);
</script>

<style lang="scss">
	.v-overlay-container {
		.v-overlay.v-menu {
			div.v-overlay__content {
				border-radius: 4px !important;

				& > div {
					border-radius: 4px !important;
					padding: 8px 0 !important;
				}
			}
		}
	}
</style>

<style lang="scss" scoped>
	.status-item {
		position: relative;
		width: 100%;
		height: 56px;
		display: flex;
		justify-content: flex-start;
		align-items: center;
		overflow: hidden;
		font-size: var(--body-large-font);
		color: var(--on-surface);
		column-gap: 8px;

		&__name {
			flex-grow: 1;
		}
	}
</style>
