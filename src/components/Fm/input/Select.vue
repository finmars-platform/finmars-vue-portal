<template>
	<BaseInput :label="label"
						 v-model="filterTerms">
		<template #button>
			<FmIcon :icon="menu" />
		</template>

	</BaseInput>

	<FmMenu>

			<div class="fm_list" >
				<div v-for="option in menuOptions"
						 class="fm_list_item"
						 v-bind="option.name"
						 @click="selectOption(option)"></div>
			</div>

	</FmMenu>
</template>

<script setup>
	let props = defineProps({
		modelValue: [String, Number],
		label: String,
		menuOptions: Array
	});

	let emit = defineEmits(['update:modelValue']);

	let filterTerms = '';

	function selectOption (option) {
		props.modelValue = option.value;
		filterTerms = option.name;

		emit('update:modelValue');
	}
</script>

<style lang="scss" scoped>

</style>
