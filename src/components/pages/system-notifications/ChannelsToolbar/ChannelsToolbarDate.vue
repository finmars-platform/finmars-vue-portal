<template>
	<div class="toolbar-date">
		<FmMenu v-model="isOpenMenu.dateFrom" :close-on-content-click="false">
			<template #activator="{ props }">
				<FmButton
					v-bind="props"
					type="secondary"
					rounded
					append-icon="mdi-menu-down"
				>
					{{ selectedDateFrom }}
				</FmButton>
			</template>

			<FmDateEditor
				:model-value="dateFromFilter"
				show-adjacent-months
				min="1970-01-01"
				:max="maxDate"
				@update:model-value="updateDate('dateFrom', $event)"
				@cancel="updateDate('dateFrom', '')"
			/>
		</FmMenu>

		<FmMenu v-model="isOpenMenu.dateTo" :close-on-content-click="false">
			<template #activator="{ props }">
				<FmButton
					v-bind="props"
					type="secondary"
					rounded
					append-icon="mdi-menu-down"
				>
					{{ selectedDateTo }}
				</FmButton>
			</template>

			<FmDateEditor
				:model-value="dateToFilter"
				show-adjacent-months
				:min="minDate"
				@update:model-value="updateDate('dateTo', $event)"
				@cancel="updateDate('dateTo', '')"
			/>
		</FmMenu>
	</div>
</template>

<script setup>
	import { computed, ref } from 'vue';
	import { storeToRefs } from 'pinia';
	import dayjs from 'dayjs';
	import { FmButton, FmDateEditor, FmMenu } from '@finmars/ui';
	import useNotificationsStore from '~/stores/useNotificationsStore';

	const notificationsStore = useNotificationsStore();
	const { notificationsFilter } = storeToRefs(notificationsStore);
	const { setNotificationsFilter } = notificationsStore;

	const isOpenMenu = ref({
		dateFrom: false,
		dateTo: false
	});

	const dateFromFilter = computed(() => notificationsFilter.value.dateFrom);
	const dateToFilter = computed(() => notificationsFilter.value.dateTo);

	const minDate = computed(() => {
		if (dateFromFilter.value) {
			return dayjs(dateFromFilter.value).add(1, 'day').format('YYYY-MM-DD');
		}
		return '1970-01-01';
	});
	const maxDate = computed(() => {
		if (dateToFilter.value) {
			return dayjs(dateToFilter.value).subtract(1, 'day').format('YYYY-MM-DD');
		}
		return dayjs().subtract(1, 'day').format('YYYY-MM-DD');
	});

	const selectedDateFrom = computed(() =>
		dateFromFilter.value ? `From ${dateFromFilter.value}` : 'From'
	);
	const selectedDateTo = computed(() =>
		dateToFilter.value ? `To ${dateToFilter.value}` : 'To'
	);

	function updateDate(field, value) {
		const transformedValue = value ? dayjs(value).format('YYYY-MM-DD') : '';
		setNotificationsFilter({ [field]: transformedValue });
		isOpenMenu.value[field] = false;
	}
</script>

<style lang="scss" scoped>
	.toolbar-date {
		display: flex;
		justify-content: center;
		align-items: center;
	}
</style>
