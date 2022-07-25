<template>
	<FmMenu class="fm_select">
		<template #btn="{ isOpen }">
			<BaseInput
				class="input_btn"
				:class="{active: isOpen}"
				:label="label"
				:modelValue="modelValue"
			>
				<template #rightBtn>
					<slot name="right_btn">
						<FmIcon :icon="isOpen ? 'arrow_drop_up' : 'arrow_drop_down'" />
					</slot>
				</template>

				<div class="selected_field">
					<div class="selected_field_item">
						{{ selected }}
					</div>
				</div>
			</BaseInput>
		</template>

		<template #default="{ close }">
			<div class="fm_list">
				<div class="fm_list_item"
					v-for="(item, index) in items"
					:key="index"
					:class="{active: item[props.prop_id] == modelValue}"
					@click="$emit('update:modelValue', item[props.prop_id]), selected = item.name, close()"
				>
					<div>{{ item.name }}</div>
				</div>
			</div>
		</template>
	</FmMenu>
</template>

<script setup>
	let props = defineProps({
		modelValue: [String, Number],
		items: Array,
		label: String,
		prop_id: {
			type: String,
			default: 'id',
		},
		prop_name: String,
	})
	defineEmits(['update:modelValue'])

	let selected = ref(props.modelValue)

	watch( () => props.items, () => {
		let elem = props.items.find(item => item[props.prop_id] == props.modelValue)
		if ( elem ) selected.value = elem.name
	})
</script>

<style lang="scss" scoped>
	.fm_select {
		display: block;
	}
	.input_btn {
		cursor: pointer;
	}
	.selected_field {
		height: 100%;
		display: flex;
		align-items: center;
	}
</style>
