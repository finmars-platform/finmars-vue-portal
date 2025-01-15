<template>
	<FmMenu width="260">
		<template #activator="{ props }">
			<FmButton
				v-bind="props"
				type="secondary"
				rounded
				append-icon="mdi-menu-down"
			>
				{{ selectedModule }}
			</FmButton>
		</template>

		<FmMenuItem
			v-for="item in MODULES"
			:key="item.value"
			item-size="large"
			:title="item.title"
			:item-selected="modelValue === item.value"
			@click="emits('update:modelValue', item.value)"
		/>
	</FmMenu>
</template>

<script setup>
	import { computed } from 'vue';
	import { FmButton, FmMenu, FmMenuItem } from '@finmars/ui';
	import { MODULES } from './constants';

	const props = defineProps({
		modelValue: {
			type: String
		}
	});

	const emits = defineEmits(['update:modelValue']);

	const selectedModule = computed(() => {
		const module = MODULES.find((t) => t.value === props.modelValue);
		return module?.title || '';
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
