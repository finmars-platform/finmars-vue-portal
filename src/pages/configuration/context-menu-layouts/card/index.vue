<template>
	<div class="flex justify-between items-center w-full">
		<span>{{ item.name }} ({{ item.type }})</span>
		<div class="flex gap-2">
			<FmButton type="primary" @click="navigateToEdit(item.id)" rounded>
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
	const emit = defineEmits(['edit', 'delete']);

	const navigateToEdit = (id) => {
		emit('edit', id);
	};

	const deleteItem = (item) => {
		emit('delete', item);
	};
</script>

<style scoped lang="scss"></style>
