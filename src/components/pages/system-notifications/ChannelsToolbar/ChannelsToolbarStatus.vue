<template>
	<FmMenu width="260">
		<template #activator="{ props }">
			<FmButton
				v-bind="props"
				type="secondary"
				rounded
				append-icon="mdi-menu-down"
			>
				{{ selectedStatus }}
			</FmButton>
		</template>

		<FmMenuItem
			v-for="status in notificationStatuses"
			:key="status.user_code"
			item-size="large"
			:title="status.name"
			:item-selected="status.user_code === statusFilter"
			@click="updateFilter(status.user_code)"
		/>
	</FmMenu>
</template>

<script setup>
	import { computed } from 'vue';
	import { storeToRefs } from 'pinia';
	import { FmButton, FmMenu, FmMenuItem } from '@finmars/ui';
	import useNotificationsStore from '~/stores/useNotificationsStore';

	const notificationsStore = useNotificationsStore();
	const { statuses, notificationsFilter } = storeToRefs(notificationsStore);
	const { setNotificationsFilter } = notificationsStore;

	const notificationStatuses = computed(() => [
		{ user_code: '', name: 'All statuses' },
		...statuses.value
	]);

	const statusFilter = computed(() => notificationsFilter.value.status);

	const selectedStatus = computed(() => {
		const status = notificationStatuses.value.find(
			(s) => s.user_code === statusFilter.value
		);

		if (status) {
			return status.user_code ? `Status: ${status.name}` : status.name;
		}

		return '';
	});

	function updateFilter(val) {
		setNotificationsFilter({ status: val });
	}
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
