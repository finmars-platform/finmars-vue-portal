<template>
	<BaseModal :title="title"
						 v-model="props.opened"
						 @update:modelValue="cancel">

		<div>
			<BaseMultiSelectTwoAreas :items="items"
															 v-model="props.modelValue"
															 :item_title="item_title"
															 :item_id="item_id"
															 @update:modelValue="newValue => selValue = newValue" />
		</div>

		<template #controls>
			<div class="flex sb">
				<FmBtn type="basic" @click="cancel">cancel</FmBtn>
				<FmBtn @click="emit('save', selValue)">save</FmBtn>
			</div>
		</template>

	</BaseModal>
</template>

<script setup>

	let props = defineProps({
		opened: Boolean,
		title: String,

		items: {
			type: Array,
			default: []
		},
		/** Unique keys or objects of selected items as string separated by comma or inside an array  */
		modelValue: {
			type: [String, Array],
			default: [],
		},
		item_id: {
			type: String,
			default: 'user_code'
		},
		item_title: {
			type: String,
			default: 'name'
		},
	});

	let emit = defineEmits(['cancel', 'save']);

	let selValue = ref(props.modelValue);

	function cancel() {
		selValue.value = props.modelValue;
		emit('cancel');
	}

</script>

<style lang="scss" scoped>

</style>
