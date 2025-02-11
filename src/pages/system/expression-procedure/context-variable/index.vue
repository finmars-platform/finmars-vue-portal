<template>
	<div class="py-3 px-14 flex flex-col gap-4 w-full h-full">
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
		<div class="flex flex-row nowrap justify-between">
			<FmTextField
				v-model="currentItem.expression"
				@change="updateItem"
				label="Expression"
				outlined
			/>
			<div class="expression-editor-activator">
				<ExpressionEditorSelector
					menu-location="end"
					:rule-expr="currentItem.expression"
					:disabled="isLoading"
					:data="expressionEditorSelectorData"
					@update="updateExpressionEditor($event)"
				>
					<template #activator>
						<FmIconButton
							icon="mdi-dots-horizontal"
							variant="outlined"
						/>
					</template>
				</ExpressionEditorSelector>
			</div>
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
	import { FmButton, FmIconButton, FmTextField } from '@finmars/ui';
	import ExpressionEditorSelector from '~/components/common/ExpressionEditorSelector/ExpressionEditorSelector.vue';

	const props = defineProps({
		item: Object
	});

	const currentItem = ref({});
	const isLoading = ref(false);

	const emit = defineEmits(['removeItem', 'updateItem', 'updateExpressionEditor']);

	const rules = {
		required: (value) => (value ? '' : 'Field is required')
	};

	const expressionEditorSelectorData = computed(() => {
		return {
			groups: [{ name: '<b>Imported</b>', key: 'input' }],
			functions: []
		};
	});

	const removeItem = () => {
		emit('removeItem', currentItem.value);
	};

	const updateItem = () => {
		emit('updateItem', currentItem.value);
	};

	const updateExpressionEditor = (value) => {
		currentItem.value.expression = value;
		emit('updateItem', currentItem.value);
	}

	function init() {
		isLoading.value = true;
		currentItem.value = props?.item;
		isLoading.value = false;
	}

	init();
</script>

<style scoped lang="scss">
	.expression-editor-activator {
		display: flex;
		padding: var(--spacing-8) var(--spacing-16);
		width: 100%;
		height: 100%;
		flex: 0;
	}
	textarea {
		border-radius: var(--spacing-4);
		padding: var(--spacing-4);
		border: 1px solid var(--card-border-color);
	}
</style>
