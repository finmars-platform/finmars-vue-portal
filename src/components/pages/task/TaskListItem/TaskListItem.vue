<template>
	<div
		:class="['task-list-item', { 'task-list-item--selected': isSelected }]"
		@click="emits('select', task)"
	>
		<div class="task-list-item__column w-[15%]">
			<div class="row">
				<TaskListItemStatus :status="task.status" />
			</div>
			<div class="row">
				<FmTooltip type="secondary" location="top end">
					<template #activator="{ props }">
						<div
							v-if="executionTime"
							v-bind="props"
							class="flex w-full justify-end align-center pr-2 pt-1"
						>
							<FmIcon
								icon="mdi-clock-outline"
								size="12"
								color="var(--on-surface)"
								end
							/>
							<span class="text-[11px] leading-[12px]">
								{{ executionTime }}
							</span>
						</div>
					</template>

					<span>Execution time</span>
				</FmTooltip>
			</div>
			<div class="row !items-start">
				<FmTooltip type="secondary" location="top end">
					<template #activator="{ props }">
						<div
							v-if="finishedTime"
							v-bind="props"
							class="flex w-full justify-end align-center pr-2 pt-1"
						>
							<FmIcon
								icon="mdi-calendar-today"
								size="12"
								color="var(--on-surface)"
								end
							/>
							<span class="text-[11px] leading-[12px]">{{ finishedTime }}</span>
						</div>
					</template>

					<span>Finished at</span>
				</FmTooltip>
			</div>
		</div>

		<div class="task-list-item__column w-[12%]">
			<div class="row !items-end">Errors: {{ errors }}</div>
			<div class="row">Skip: {{ skip }}</div>
			<div class="row !items-start">Success: {{ success }}</div>
		</div>

		<div class="task-list-item__column task-list-item__column-single w-[13%]">
			{{ date }}
		</div>

		<div class="task-list-item__column task-list-item__column-single w-[38%]">
			{{ taskText }}
		</div>

		<div class="task-list-item__column task-list-item__column-single w-[22%]">
			<div
				class="avatar"
				:style="{ backgroundColor: getAvatarColor(userName?.[0]) }"
			>
				{{ userName?.[0] }}
			</div>

			<span>{{ userName }}</span>
		</div>
	</div>
</template>

<script setup>
	import { computed } from 'vue';
	import dayjs from 'dayjs';
	import utc from 'dayjs/plugin/utc';
	import { FmIcon, FmTooltip } from '@finmars/ui';
	import { getAvatarColor } from '@/utils/commonHelper';
	import TaskListItemStatus from './TaskListItemStatus.vue';

	dayjs.extend(utc);

	const props = defineProps({
		task: {
			type: Object,
			required: true
		},
		isSelected: {
			type: Boolean
		}
	});

	const emits = defineEmits(['select']);

	const executionTime = computed(() => {
		if (!props.task.created_at || !props.task.finished_at) {
			return '';
		}

		const date1 = dayjs(props.task.created_at);
		const date2 = dayjs(props.task.finished_at);
		const diffTime = dayjs(date2).diff(date1, 'ms');

		return dayjs.utc(diffTime).format('HH:mm:ss');
	});

	const finishedTime = computed(() => {
		if (!props.task.finished_at) {
			return '';
		}

		return dayjs(props.task.finished_at).format('HH:mm:ss');
	});

	const errors = computed(() => {
		const val = props.task.result_stats?.error_count || 0;
		return val > 999 ? '999+' : val;
	});

	const skip = computed(() => {
		const val = props.task.result_stats?.skip_count || 0;
		return val > 999 ? '999+' : val;
	});

	const success = computed(() => {
		const val = props.task.result_stats?.success_count || 0;
		return val > 999 ? '999+' : val;
	});

	const date = computed(() =>
		dayjs(props.task.created_date).format('YYYY-MM-DD')
	);

	const taskText = computed(
		() => `${props.task.verbose_name} [${props.task.id}]`
	);

	const userName = computed(() => props.task.member_object?.username);
</script>

<style lang="scss" scoped>
	.task-list-item {
		display: flex;
		width: 100%;
		height: 96px;
		font-size: 14px;
		border-bottom: 1px solid var(--outline-variant);
		cursor: pointer;
		overflow: hidden;

		&--selected {
			background-color: var(--secondary-container);
		}

		&:hover {
			background-color: var(--surface-container-highest);
		}

		&__column {
			height: 100%;
			padding-right: 4px;

			&-single {
				display: flex;
				justify-content: flex-start;
				align-items: center;
				column-gap: 4px;
			}
		}

		.row {
			position: relative;
			width: 100%;
			height: 32px;
			display: flex;
			justify-content: flex-start;
			align-items: center;
		}

		.avatar {
			position: relative;
			width: 32px;
			height: 32px;
			border-radius: 50%;
			display: flex;
			justify-content: center;
			align-items: center;
			color: var(--p-100);
		}
	}
</style>
