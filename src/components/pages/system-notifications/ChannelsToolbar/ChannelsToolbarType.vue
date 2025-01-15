<template>
	<FmMenu width="260">
		<template #activator="{ props }">
			<FmButton
				v-bind="props"
				type="secondary"
				rounded
				append-icon="mdi-menu-down"
			>
				{{ selectedType }}
			</FmButton>
		</template>

		<FmMenuItem
			v-for="type in MESSAGE_TYPES"
			:key="type.value"
			item-size="large"
			:prepend-icon="type.icon"
			:title="type.title"
			:item-selected="modelValue === type.value"
			@click="emits('update:modelValue', type.value)"
		/>
	</FmMenu>
</template>

<script setup>
	import { computed } from 'vue';
	import { FmButton, FmMenu, FmMenuItem } from '@finmars/ui';
	import { MESSAGE_TYPES } from './constants';

	const props = defineProps({
		modelValue: {
			type: String
		}
	});

	const emits = defineEmits(['update:modelValue']);

	const selectedType = computed(() => {
		const type = MESSAGE_TYPES.find((t) => t.value === props.modelValue);
		return type?.title || '';
	});
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
