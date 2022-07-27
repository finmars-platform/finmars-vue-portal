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
					<div class="fm_avatar">
						{{ selected }}
					</div>
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
						<div class="fm_avatar m-l-10">
							{{ item.icon }}
						</div>
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
		padding-right: 10px;
	}
	.fm_avatar {
		border-radius: 50%;
		width: 30px;
		height: 30px;
		line-height: 30px;
		background: $text-lighten;
		text-align: center;
		color: $separ;
	}

</style>
