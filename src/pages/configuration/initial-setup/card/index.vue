<template>
	<div class="card flex justify-between items-center w-full">
		<span>Name: {{ item.name }}</span>
		<div>
			<FmButton type="secondary" @click="openModal(item)" rounded>
				Edit
			</FmButton>
			<FmButton type="secondary" @click="deleteItem(item)" rounded>
				Delete
			</FmButton>
		</div>
	</div>
</template>

<script setup>
	import { FmButton } from '@finmars/ui';

	defineProps({
		item: {
			type: Object,
			required: true
		}
	});
	const emit = defineEmits(['openModal', 'deleteItem']);

	const openModal = (item) => {
		emit('openModal', item);
	};

	const deleteItem = (item) => {
		emit('deleteItem', item);
	};
</script>

<style scoped lang="scss">
	.card {
		border-radius: var(--spacing-4);
		border: 1px solid var(--card-border-color);
		background: var(--card-background-color);
		padding: var(--spacing-12);
		width: 100%;
		.card-title {
			padding-bottom: var(--spacing-8);
			margin-bottom: var(--spacing-4);
			border-bottom: 1px solid var(--border-color);
		}
	}
</style>
