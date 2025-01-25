<template>
	<div class="recursive-row">
		<div class="row-item">
			<FmCheckbox
				v-model="clickedElement.access"
				@update:modelValue="toggleAccess"
			></FmCheckbox>
			<span :class="{ disabled: !clickedElement.access }">{{
					clickedElement.label
				}}</span>
		</div>
		<div
			v-if="clickedElement?.children && clickedElement?.children?.length"
			class="children"
		>
			<RecursiveRow
				v-for="child in clickedElement.children"
				:key="child.key"
				:item="child"
				@update-list="$emit('update-list', $event)"
			/>
		</div>
	</div>
</template>

<script setup>
	import { FmCheckbox } from '@finmars/ui';

	const props = defineProps({
		item: {
			type: Object,
			required: true
		}
	});

	const clickedElement = ref(props.item);

	const emit = defineEmits(['update-list']);

	function toggleAccess(newAccess) {
		const toggleChildrenAccess = (item) => {
			item.access = newAccess;
			if (item.children) {
				item.children.forEach(toggleChildrenAccess);
			}
		};

		toggleChildrenAccess(clickedElement.value);
		emit('update-list', clickedElement.value);
	}
</script>

<style scoped lang="scss">
	.row-item {
		display: flex;
		flex-direction: row;
		align-items: center;
		justify-content: flex-start;
		flex-wrap: nowrap;
		gap: var(--spacing-8);

		span {
			width: 100%;
			margin-right: var(--spacing-24);
			border-radius: var(--spacing-4);
			padding: var(--spacing-4);
			background: var(--onSecondary-color);
		}

		.disabled {
			text-decoration: line-through;
			background: unset;
		}
	}

	.children {
		margin-left: 16px;
	}
</style>
