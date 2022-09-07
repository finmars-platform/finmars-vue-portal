<template>
	<div class="fm_container pb-0">
		<div class="fm_page_title">{{ title }}</div>
		<div class="flex sb">
			<div class="coll">
				<slot name="left" />
			</div>
			<div class="coll">
				<slot name="right" />
			</div>
		</div>

		<div class="control_line flex sb">
			<FmBtn type="text" @click="$emit('cancel')">cancel</FmBtn>
			<FmBtn @click="$emit('save')">{{ saveText || 'save' }}</FmBtn>
		</div>
	</div>
</template>

<script setup>

	const props = defineProps([
		'title', 'saveText'
	])
	const emit = defineEmits([
		'save', 'cancel',
	])
</script>
<style lang="scss" scoped>
	.coll {
		width: calc(50% - $content-padding-x / 2);
	}
	.control_line {
		width: calc(100% + $content-padding-x * 2);
		position: sticky;
		bottom: 0;
		margin-left: -$content-padding-x;
		border-top: 1px solid $border;
		padding: 10px $content-padding-x;
		background: $separ;
		z-index: 2;
	}

</style>
