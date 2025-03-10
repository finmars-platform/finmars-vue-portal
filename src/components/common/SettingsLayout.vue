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
	/* eslint-disable */
	const props = defineProps(['title', 'saveText']);
	const emit = defineEmits(['save', 'cancel']);
</script>
<style lang="scss" scoped>
	$content-padding-x: 30px;

	.coll {
		width: calc(50% - $content-padding-x / 2);
	}

	.control_line {
		width: calc(100% + $content-padding-x * 2);
		position: sticky;
		top: calc(100vh - 109px);
		margin-left: -$content-padding-x;
		border-top: 1px solid var(--table-border-color);
		padding: 10px $content-padding-x;
		background: var(--base-backgroundColor);
		z-index: 2;
	}

	.fm_container {
		min-height: calc(100vh - 80px);
	}
</style>
