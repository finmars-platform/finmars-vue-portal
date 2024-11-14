<template>
	<FmChip
		class="task-list-item-status"
		:value="statusData?.title.toLocaleLowerCase()"
		:prepend-icon="{ icon: statusData?.icon, color }"
	/>
</template>

<script setup>
	import { computed } from 'vue';
	import { FmChip } from '@finmars/ui';
	import { TASK_STATUSES } from '../TaskFilter/constants';

	const props = defineProps({
		status: {
			type: String
		}
	});

	const statusData = computed(() =>
		TASK_STATUSES.find(
			(s) => props.status === s.value || props.status === s.altValue
		)
	);

	const bgColor = computed(() => {
		if (!statusData?.value) {
			return 'var(--secondary-container)';
		}

		return statusData.value.bgColor;
	});

	const color = computed(() => {
		if (!statusData?.value) {
			return 'var(--on-secondary-container)';
		}

		return statusData.value.color;
	});
</script>

<style lang="scss" scoped>
	.task-list-item-status {
		background-color: v-bind(bgColor) !important;
	}
</style>
