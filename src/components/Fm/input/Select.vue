<template>
	<BaseInput class="input_btn m-b-0"
						 :class="{active: isOpen, 'bi_no_borders': no_borders, small: size == 'small'}"
						 :label="label"
						 v-model="moFilter">
		<template #button>
			<FmIcon icon="menu" />
		</template>

	</BaseInput>

	<FmMenu :opened="menuIsOpened"
					:openOn="false"

					@cancel="() => menuIsOpened = false">

		<template #default="{ close }">
			<div class="fm_list">
				<div class="fm_list_item"
						 v-for="(item, index) in menuOptions"
						 :key="item[id_prop]"
						 :class="{active: item[id_prop] === modelValue}"
						 @click="selectOption(item), close()"
				>
					<div>{{ item[props.prop_name] }}</div>
				</div>
			</div>
		</template>

	</FmMenu>
</template>

<script setup>
	let props = defineProps({
		modelValue: [String, Number],
		label: String,
		menuOptions: Array,
		id_prop: {
			type: [String, Number],
			default: 'id',
		},
		no_borders: Boolean,
	});

	let emit = defineEmits(['update:modelValue']);

	let moFilter = ref('');

	let menuIsOpened = ref(false);

	let menuOptions = computed(() => {

		if (moFilter.value) {
			return props.items.filter.filter(item => item[props.prop_name] === moFilter.value);
		}

		return props.items;

	});

	function selectOption(selItem) {
		if (props.optionsFilter) moFilter.value = '';
		emit('update:modelValue', selItem[props.prop_id]);
	}
</script>

<style lang="scss" scoped>

</style>
