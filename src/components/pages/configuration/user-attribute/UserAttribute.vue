<template>
	<div class="user-attribute">
		<div class="user-attribute__info">
			<div class="user-attribute__text">
				<b>{{ attr.name }}</b>
				<span>({{ attrType }})</span>
			</div>
			<div class="user-attribute__text">{{ attr.user_code }}</div>
		</div>

		<div class="user-attribute__actions">
			<template v-if="attr.value_type === 30">
				<FmTooltip type="secondary" location="top">
					<template #activator="{ props }">
						<FmButton
							v-bind="props"
							type="secondary"
							icon
							@click="
								emits('action', {
									action: 'export:classifier',
									value: attr
								})
							"
						>
							<FmIcon
								icon="mdi-download"
								size="20"
								color="var(--on-surface-variant)"
							/>
						</FmButton>
					</template>

					<span>Export Classifier</span>
				</FmTooltip>

				<FmTooltip type="secondary" location="top">
					<template #activator="{ props }">
						<FmButton
							v-bind="props"
							type="secondary"
							icon
							@click="
								emits('action', {
									action: 'import:classifier',
									value: attr
								})
							"
						>
							<FmIcon
								icon="mdi-upload"
								size="20"
								color="var(--on-surface-variant)"
							/>
						</FmButton>
					</template>

					<span>Import Classifiers from .csv file</span>
				</FmTooltip>

				<FmTooltip type="secondary" location="top">
					<template #activator="{ props }">
						<FmButton
							v-bind="props"
							type="secondary"
							icon
							@click="
								emits('action', {
									action: 'open:classifier',
									value: attr
								})
							"
						>
							<FmIcon
								icon="mdi-map"
								size="20"
								color="var(--on-surface-variant)"
							/>
						</FmButton>
					</template>

					<span>Open Classifier Mappings</span>
				</FmTooltip>

				<FmTooltip type="secondary" location="top">
					<template #activator="{ props }">
						<FmButton
							v-bind="props"
							type="secondary"
							icon
							@click="
								emits('action', {
									action: 'edit:classifier',
									value: attr
								})
							"
						>
							<FmIcon
								icon="mdi-format-align-right"
								size="20"
								color="var(--on-surface-variant)"
							/>
						</FmButton>
					</template>

					<span>Edit Classifier tree</span>
				</FmTooltip>
			</template>

			<FmTooltip type="secondary" location="top">
				<template #activator="{ props }">
					<FmButton
						v-bind="props"
						type="secondary"
						icon
						@click="
							emits('action', { action: 'edit', value: attr.id })
						"
					>
						<FmIcon
							icon="mdi-pencil"
							size="20"
							color="var(--on-surface-variant)"
						/>
					</FmButton>
				</template>

				<span>Edit Attribute</span>
			</FmTooltip>

			<FmTooltip type="secondary" location="top">
				<template #activator="{ props }">
					<FmButton
						v-bind="props"
						type="secondary"
						icon
						@click="
							emits('action', { action: 'delete', value: attr })
						"
					>
						<FmIcon
							icon="mdi-delete"
							size="20"
							color="var(--error)"
						/>
					</FmButton>
				</template>

				<span>Delete Attribute</span>
			</FmTooltip>
		</div>
	</div>
</template>

<script setup>
	import { computed } from 'vue';
	import { FmIcon, FmButton, FmTooltip } from '@finmars/ui';
	import { VALUE_TYPES } from '~/components/modal/AttributeTypeDialog/constants';

	const props = defineProps({
		attr: {
			type: Object,
			required: true
		}
	});

	const emits = defineEmits(['action']);

	const attrType = computed(() => {
		const type = VALUE_TYPES.find((t) => t.value === props.attr.value_type);
		return type?.caption_name || '';
	});
</script>

<style lang="scss" scoped>
	.user-attribute {
		position: relative;
		width: 100%;
		padding: 16px;
		border-radius: 4px;
		background-color: var(--surface-container);
		border: 1px solid var(--outline-variant);
		display: flex;
		justify-content: space-between;
		align-items: center;
		column-gap: 12px;
		margin-bottom: 4px;

		&__info {
			position: relative;
		}

		&__text {
			display: flex;
			justify-content: flex-start;
			align-items: center;
			column-gap: 4px;
			font: var(--body-large-font);
			color: var(--on-surface);
		}

		&__actions {
			display: flex;
			flex-grow: 1;
			justify-content: flex-end;
			align-items: center;
			column-gap: 2px;

			button {
				--v-btn-height: 20px;

				min-width: calc(var(--v-btn-height) + 12px);
			}
		}
	}
</style>
