<template>
	<div class="wrap">
		<v-select
			:items="simpleItems"
			:label="label"
			:placeholder="label"
			variant="outlined"
			density="comfortable"
			:modelValue="modelValue"
			@update:modelValue="emit('update:modelValue', $event)"
		/>
		<v-menu
			location="start"
		>
			<template v-slot:activator="{ props }">
				<v-avatar color="#747474" class="select_btn" size="small" v-bind="props">
					<span class="text-white">{{ selected }}</span>
				</v-avatar>
			</template>

			<v-list>
				<v-list-item class=""
					:value="item.id"
					v-for="(item, index) in items"
					:key="index"
					@click="selectItem(item)"
				>
					<div class="d-flex list_item_2">
						<v-icon v-if="item.is_active" icon="mdi-check" class="mr-4"></v-icon>
						<v-list-item-title>{{ item.name }}</v-list-item-title>
					</div>

					<v-avatar color="#747474" class="ml-4" size="small">
						<span class="text-white">{{ item.icon }}</span>
					</v-avatar>
				</v-list-item>
			</v-list>
		</v-menu>
	</div>

</template>

<script setup>

	const props = defineProps([
		'items', 'simpleItems', 'label', 'type', 'modelValue'
	])
	const emit = defineEmits([
		'selected:type', 'update:modelValue'
	])

	let selectedObj = props.items.find( item => item.id == props.type)
	selectedObj.is_active = true

	let selected = ref(selectedObj.icon)

	function selectItem( item ) {
		props.items.forEach( item => {
			item.is_active = false
		})

		item.is_active = true
		selected.value = item.icon

		emit('selected:type', item.id)
	}
</script>
<style lang="scss" scoped>
	.wrap {
		position: relative;
	}
	.select_btn {
		position: absolute;
		top: 8px;
		right: 8px;
		cursor: pointer;

		span {
			font-size: 14px !important;
		}
	}
	.list_item_2 {
		width: 200px;
	}

</style>
