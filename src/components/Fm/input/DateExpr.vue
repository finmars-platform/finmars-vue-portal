<template>
	<BaseInput
		:label="`${label}${isDateExpr ? ' (Expression)' : ''}`"
		:modelValue="isDateExpr ? expr : date"
		@update:modelValue="emit(`update:${isDateExpr ? 'expr' :' date'}`, $event)"
	>
		<template #button>
			<FmIcon
				v-if="isDateExpr"
				icon="code"
				@click="isOpenDateExpr = true"
			/>
			<FmIcon v-else icon="calendar_month" />
		</template>

		<template #rightBtn>
			<FmIcon icon="swap_vert" @click="$event.stopPropagation(), isDateExpr = !isDateExpr" />
		</template>
	</BaseInput>
	<FmExpression
		v-if="isOpenDateExpr"
		v-model="isOpenDateExpr"
		:expressions="expr"
		@save="emit('update:expr', $event)"
	/>
</template>

<script setup>

	const props = defineProps([
		'modelValue', 'label', 'date', 'expr'
	])
	const emit = defineEmits([
		'update:date', 'update:expr'
	])
	let isDateExpr = ref(props.date ? false : true)
	let isOpenDateExpr = ref(false)

</script>
<style lang="scss" scoped>

	.wrap {
		display: grid;
		grid-template-columns: 1fr 260px;
		max-width: 1000px;
	}
	.menu {
		padding-top: 0;
	}
	.editor_block_h {

	}
	.actions {
		width: 100%;
	}
	.right_side {
		width: 260px;
		height: inherit;
		overflow: hidden;

	}
	.info {
		flex: 1;
		overflow: auto;

		&_h {
			margin-bottom: 10px;
		}
		&_item {
			padding-bottom: 20px;
		}
		&_code {
			display: block;
			border: 1px solid $border;
			border-radius: 5px;
			padding: 15px;
			background: #f6f6f6;
			margin-bottom: 10px;
			width: 100%;
		}
		&_param {
			color: #f05a22;
			margin-bottom: 5px;
		}
		&_param_block + &_param_block {
			margin-top: 20px;
		}
		&_param_text {
			padding-left: 20px;
		}
		&_desc_text {
			line-height: 1.5;
		}
	}
	.editor_block {
		border: 1px solid $border;
		border-radius: 5px;
		position: relative;
	}
	.editor_block_toolbar {
		background: #f6f6f6;
		padding: 11px 10px;
	}
	.code_block {
		padding: 15px 10px;
		padding-left: 5px;

		.func {
		color: green;
		}
		.signs {
			color: red;
		}
		.numbers {
			color: purple;
		}
	}
	.snippets {
		top: 100px;
    position: absolute;
    left: 39px;
		background: #fff;
		box-shadow: 0 0 10px 4px #e8e8e8;

		&_item {
			padding: 10px 14px;
			cursor: pointer;

			&:hover {
				background: #e8e8e8;
			}
		}
		&_item + &_item {
			border-top: 1px solid $border;
		}
	}
	.line_id {
		padding: 3px 10px;
		margin-right: 10px;
		border-right: 1px solid #cecece;
		color: #767676;
		font-size: 14px;
	}

</style>
