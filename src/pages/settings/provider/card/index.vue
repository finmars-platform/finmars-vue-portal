<template>
	<div class="card flex justify-between items-center p-2 w-full">
		<div class="flex flex-col gap-1 text-sm">
			<span>User code: {{ item.user_code }}</span>
			<span>Name: {{ item.name }}</span>
		</div>
		<div class="flex justify-end gap-2">
			<FmButton type="primary" @click="openModal(item)" rounded>
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
		border-radius: var(--spacing-8);
		border: 1px solid var(--card-border-color);
	}
</style>
