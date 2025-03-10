<template>
	<div
		class="radio_input_holder"
		:class="{
			disabled: disabled,
			checked: modelValue === value
		}"
		@click="inputElem.click()"
	>
		<input
			ref="inputElem"
			type="radio"
			class="radio_input"
			:class="{ checked: modelValue === value }"
			:name="name"
			:checked="modelValue === value"
			:disabled="disabled"
			@change="$emit('update:modelValue', value)"
			@click.stop
		/>

		<div v-if="label" class="radio_label">{{ label }}</div>
	</div>
</template>

<script setup>
	/* eslint-disable */
	let props = defineProps({
		modelValue: [Number, String, Boolean],
		value: {
			type: [Number, String, Boolean]
		},
		name: String,
		label: {
			default: '',
			type: String
		},
		disabled: Boolean
	});

	let emit = defineEmits(['update:modelValue']);

	let inputElem = ref(null);
</script>

<style lang="scss" scoped>
	$borer-lighten: #e0e0e0;
	$primary: var(--primary-color);
	$primary-lighten: #f69470;

	.radio_input_holder {
		height: 20px;
		position: relative;
		display: flex;
		align-items: center;
		margin: 10px 0;
		cursor: pointer;

		&.disabled {
			cursor: default;
		}

		/*.radio_input {
			position: absolute;
			z-index: -1;
			opacity: 0;
			cursor: pointer;

			& + label {
				display: inline-flex;
				align-items: center;
				user-select: none;
				padding-left: 30px;
			}
			& + label::before {
				box-sizing: border-box;
				background-color: transparent;
				border-radius: 50%;
				content: '';
				position: absolute;
				display: block;
				height: auto;
				left: 0;
				top: 0;
				right: 0;
				bottom: 0;
				transition: all 0.5s;
				width: auto;
				border-color: rgba(0, 0, 0, 0.54);
				width: 20px;
				border-style: solid;
				border-width: 2px;
				cursor: pointer;
			}
			+ label::after{
				content: '';
				position: absolute;
				left: 50%;
				top: 50%;
				right: 0;
				bottom: 0;
				height: 10px;
				width: 10px;
				left: 0;
				border-radius: 50%;
				transform: translate(50%, -50%);
				// scale: 0.3;
			}
			&:checked + label::before {
				border-color: #f05a22;
			}
			&:checked + label::after {
				content: '';
				position: absolute;
				left: 50%;
				top: 50%;
				right: 0;
				bottom: 0;
				height: 10px;
				width: 10px;
				left: 0;
				border-radius: 50%;
				transform: translate(50%, -50%);
				background-color: #f05a22;
				transition: 0.5s;
				scale: 1;

			}
			&:not(:disabled):not(:checked) + label:hover::before {
				box-shadow: 0 0 0 10px rgba(240, 90, 34, 0.2);
				transition: 0.5s;
			}
			&:not(:disabled):not(:checked):focus + label::after {
				box-shadow: 0 0 0 10px #f05a2233;
				transition: 0.5s;
				scale: 1;
			}
			&:not(:disabled):not(:checked):active + label::after {
				box-shadow: 0 0 0 10px rgba(240, 90, 34, 0.2);
				transition: 0.5s;
				scale: 1;
			}
			// &:not(:disabled):not(:checked):hover + label::after {
			// 	box-shadow: 0 0 0 10px rgba(240, 90, 34, 0.2);
			// 	transition: 0.5s;
			// }
			&:not(:disabled):not(:checked):focus + label::after {
				box-shadow: 0 0 0 10px rgba(240, 90, 34, 0.2);
				transition: 0.5s;
				scale: 1;
			}
			&:not(:disabled):active + label::after {
				box-shadow: 0 0 0 10px rgba(240, 90, 34, 0.2);
				transition: 0.5s;
				scale: 1;
			}
			// &:not(:disabled):hover + label::after {
			// 	box-shadow: 0 0 0 10px rgba(240, 90, 34, 0.2);
			// 	transition: 0.5s;
			// }
			// &:not(:disabled):not(:checked):hover + label::after {
			// 	box-shadow: 0 0 0 10px rgba(240, 90, 34, 0.2);
			// 	transition: 0.5s;
			// }
			&:disabled + label::after {
				content: '';
				position: absolute;
				left: 50%;
				top: 50%;
				right: 0;
				bottom: 0;
				height: 10px;
				width: 10px;
				left: 0;
				border-radius: 50%;
				transform: translate(50%, -50%);
				background-color: rgba(0, 0, 0, 0.54);
				transition: 0.5s;
				scale: 1;
			}
		}*/
	}

	.radio_input {
		position: relative;
		appearance: none;

		width: 20px;
		height: 20px;
		border-radius: 50%;
		border-style: solid;
		border-width: 2px;
		transition: border-color ease 0.28s;
		box-sizing: border-box;

		&::after {
			content: '';
			position: absolute;
			display: block;
			height: 10px;
			width: 10px;
			background-color: transparent;
			top: 50%;
			left: 50%;
			transform: translate(-50%, -50%);
			border-radius: 50%;
			box-sizing: border-box;
		}

		&:not([disabled]):focus {
			box-shadow: 0 0 14px rgba(240, 90, 34);
		}

		&:not(.checked)[disabled] {
			border-color: $borer-lighten;
		}
	}

	.radio_input.checked {
		border-color: $primary;

		&:not([disabled])::after {
			background-color: $primary;
		}

		&[disabled] {
			border-color: $primary-lighten;
		}

		&[disabled]::after {
			background-color: $primary-lighten;
		}
	}

	.radio_input:not([disabled]) {
		cursor: pointer;
	}

	.radio_label {
		margin-left: 10px;
	}
</style>
