<template>
	<div class="base-input" tab="-1">
		<div class="bi_label" v-if="label">{{ label }}</div>

		<div class="bi_wrap">
			<div class="bi_button"><slot name="button"></slot></div>

			<div class="bi_default">
				<slot>
					<input
						:type="type"
						:placeholder="label"
						:value="modelValue"
    				@input="$emit('update:modelValue', $event.target.value)"
					/>
				</slot>
			</div>

			<div class="bi_side_items flex">
				<slot name="sedeItems">
					<!-- <div class="bi_side_item">
						<BaseIcon icon="edit" />
					</div> -->
				</slot>
				<div class="bi_side_item" v-if="tooltip">
					<BaseIcon icon="info" />
				</div>
			</div>
		</div>
	</div>
</template>

<script setup>
	let props = defineProps({
		modelValue: String,
		type: String,
		label: String,
		tooltip: String,
	})
	defineEmits(['update:modelValue'])
</script>

<style lang="scss" scoped>
	.base-input {
		position: relative;
		height: 42px;
		border: 1px solid $border;
		border-radius: 4px;
		margin-bottom: 30px;
		transition: border 0.3s;

		&:focus-within {
			border: 1px solid #000;
		}

		&:hover {
			.bi_side_items {
				display: flex;
			}
		}
	}
	.bi_label {
		position: absolute;
		top: -11px;
		left: 10px;
		padding: 0 3px;
		z-index: 1;
		color: $text-leght;
		font-size: 12px;

		&:after {
			content: '';
			display: block;
			position: absolute;
			top: 10px;
			left: 0;
			background: #fff;
			height: 1px;
			width: 100%;
			z-index: -1;
		}
	}
	.bi_wrap {
		display: flex;
		align-items: center;
		height: 40px;
		width: 100%;
	}
	.bi_default {
		flex-grow: 1;
		margin-left: 13px;
		height: inherit;

		input {
			width: 100%;
			height: inherit;
		}
	}
	.bi_side_items {
		display: none;
		padding: 0 8px;
	}
	.bi_button {
		margin-left: 13px;
		color: #999999;

		&:empty {
			margin-left: 0;
		}
	}
	.bi_side_item {
		color: #999999;

		& + & {
			margin-left: 1px;
		}
	}

</style>
