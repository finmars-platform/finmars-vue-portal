<template>
	<div class="toolbar-date">
		<FmMenu v-model="isOpenMenu.from" :close-on-content-click="false">
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
				v-model="date.from"
				show-adjacent-months
				min="1970-01-01"
				:max="maxDate"
				@update:model-value="updateDate('from', $event)"
				@cancel="updateDate('from', '')"
			/>
		</FmMenu>

		<FmMenu v-model="isOpenMenu.to" :close-on-content-click="false">
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
				v-model="date.to"
				show-adjacent-months
				:min="minDate"
				@update:model-value="updateDate('to', $event)"
				@cancel="updateDate('to', '')"
			/>
		</FmMenu>
	</div>
</template>

<script setup>
	import { computed, ref } from 'vue';
	import dayjs from 'dayjs';
	import { FmButton, FmDateEditor, FmMenu } from '@finmars/ui';

	const props = defineProps({
		modelValue: {
			type: Object,
			default: () => ({
				from: '',
				to: ''
			})
		}
	});

	const emits = defineEmits(['update:modelValue']);

	const isOpenMenu = ref({
		from: false,
		to: false
	});

	const date = ref({
		from: props.modelValue.from,
		to: props.modelValue.to
	});

	const minDate = computed(() => {
		if (date.value.from) {
			return dayjs(date.value.from).add(1, 'day').format('YYYY-MM-DD');
		}
		return '1970-01-01';
	});
	const maxDate = computed(() => {
		if (date.value.to) {
			return dayjs(date.value.to).subtract(1, 'day').format('YYYY-MM-DD');
		}
		return dayjs().subtract(1, 'day').format('YYYY-MM-DD');
	});

	const selectedDateFrom = computed(() =>
		date.value.from ? `From ${date.value.from}` : 'From'
	);
	const selectedDateTo = computed(() =>
		date.value.to ? `To ${date.value.to}` : 'To'
	);

	function updateDate(field, value) {
		date.value[field] = value ? dayjs(value).format('YYYY-MM-DD') : '';
		emits('update:modelValue', date.value);
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
