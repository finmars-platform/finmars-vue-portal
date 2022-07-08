<template>
	<v-container fluid class="px-8 pb-16 mb-10">
		<div class="text-h5 mb-3">{{ title }}</div>
		<div class="d-flex space-between">
			<div class="coll">
				<slot name="left" />
			</div>
			<div class="coll">
				<slot name="right" />
			</div>
		</div>

		<v-sheet class="control_line pa-4 d-flex space-between">
			<v-btn variant="text" @click="cancelFunc()">cancel</v-btn>
			<v-btn color="primary" @click="saveFunc()">{{ saveText || 'save' }}</v-btn>
		</v-sheet>
	</v-container>
</template>

<script setup>

	const props = defineProps([
		'title', 'saveFunc', 'saveText', 'cancelFunc'
	])
	const emit = defineEmits([
		'selected:type', 'update:modelValue'
	])

	function save( item ) {
		props.items.forEach( item => {
			item.is_active = false
		})

		item.is_active = true
		selected.value = item.icon

		emit('selected:type', item.id)
	}
</script>
<style lang="scss" scoped>
	.coll {
		width: 48%;
	}
	.control_line {
		width: calc(100% - 160px);
		position: fixed;
		left: 160px;
		bottom: 0;
		border-top: 1px solid $border;
	}

</style>
