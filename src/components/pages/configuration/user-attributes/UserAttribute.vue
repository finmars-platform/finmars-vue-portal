<template>
	<div class="user-attribute">
		<FmIcon
			:icon="attr.is_hidden ? 'mdi-eye-off-outline' : 'mdi-eye-outline'"
			color="var(--on-surface-variant)"
		/>

		<div class="user-attribute__info">attr.name</div>

		<div class="user-attribute__actions">
			<FmTooltip type="secondary" location="top">
				<template #activator="{ props }">
					<FmButton
						v-bind="props"
						type="secondary"
						icon
						density="compact"
						min-width="28"
						@click="emits('action', { action: 'edit', value: attr.id })"
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
						density="compact"
						min-width="28"
					>
						<FmIcon icon="mdi-delete" size="20" color="var(--error)" />
					</FmButton>
				</template>

				<span>Delete Attribute</span>
			</FmTooltip>
		</div>
	</div>
</template>

<script setup>
	import { FmIcon, FmButton, FmTooltip } from '@finmars/ui';

	const props = defineProps({
		attr: {
			type: Object,
			required: true
		}
	});

	const emits = defineEmits(['action']);
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
		column-gap: 8px;
		margin-bottom: 4px;

		&__actions {
			display: flex;
			justify-content: flex-end;
			align-items: center;
		}
	}
</style>
