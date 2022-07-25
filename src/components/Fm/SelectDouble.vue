<template>
	<div class="wrap">
		<FmSelect
			:items="simpleItems"
			:label="label"
			:prop_id="prop_id"
			:modelValue="modelValue"
			@update:modelValue="emit('update:modelValue', $event)"
		/>

		<FmMenu class="select_btn">
			<template #btn>
				<div class="flex aic" style="height: 42px;">
					<v-avatar color="#747474" class="" size="small" >
						<span class="text-white">{{ selected }}</span>
					</v-avatar>
				</div>
			</template>

			<template #default="{ close }">
				<div class="fm_list">
					<div class="fm_list_item flex sb"
						v-for="(item, index) in items"
						:key="index"
						:class="{active: item.is_active}"
						@click="selectType(item), close()"
					>
						<div>{{ item.name }}</div>
						<v-avatar color="#747474" class="ml-4" size="small">
							<span class="text-white">{{ item.icon }}</span>
						</v-avatar>
					</div>
				</div>
			</template>
		</FmMenu>
	</div>

</template>

<script setup>

	const props = defineProps([
		'items', 'simpleItems', 'label', 'type', 'modelValue',
		'prop_id'
	])
	const emit = defineEmits([
		'update:type', 'update:modelValue'
	])

	let selectedObj = props.items.find( item => item.id == props.type)
	selectedObj.is_active = true

	let selected = ref(selectedObj.icon)

	function selectType( item ) {
		props.items.forEach( item => {
			item.is_active = false
		})

		item.is_active = true
		selected.value = item.icon

		emit('update:type', item.id)
	}
</script>
<style lang="scss" scoped>
	.wrap {
		position: relative;
	}
	.select_btn {
		position: absolute;
		top: 0px;
		right: 0;
		width: 40px;
		cursor: pointer;

		span {
			font-size: 14px !important;
		}
	}
	.fm_list_item {
		padding-right: 8px;
	}

</style>
