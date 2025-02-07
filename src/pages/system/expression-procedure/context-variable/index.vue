<template>
	<div class="py-3 px-8 flex flex-col gap-4 w-full h-full">
		<div>
			<span><strong>Index</strong> {{ currentItem.order }}</span>
		</div>
		<div>
			<FmTextField
				v-model="currentItem.name"
				:rules="[rules.required]"
				@change="updateItem"
				label="Name (must start with context_)"
				outlined
			/>
		</div>
		<div>
			<FmTextField
				v-model="currentItem.expression"
				@change="updateItem"
				label="Expression"
				outlined
			/>
		</div>
		<div class="flex flex-col mb-2">
			<span class="mb-1">Notes</span>
			<textarea
				v-model="currentItem.notes"
				@change="updateItem"
				id="notes"
				name="notes"
				rows="4"
				cols="50"
			/>
		</div>

		<FmButton type="secondary" @click="removeItem" rounded>
			Delete
		</FmButton>
	</div>
</template>
<script setup>
	import { FmButton, FmTextField } from '@finmars/ui';

	const props = defineProps({
		item: Object
	});

	const currentItem = ref({});
	const emit = defineEmits(['removeItem', 'updateItem']);

	const rules = {
		required: (value) => (value ? '' : 'Field is required')
	};

	const removeItem = () => {
		emit('removeItem', currentItem.value);
	};

	const updateItem = () => {
		emit('updateItem', currentItem.value);
	};

	function init() {
		currentItem.value = props?.item;
	}

	init();
</script>

<style scoped lang="scss">
	textarea {
		border-radius: var(--spacing-4);
		padding: var(--spacing-4);
		border: 1px solid var(--card-border-color);
	}
</style>
