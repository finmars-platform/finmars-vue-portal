<template>
	<div class="radio-input" :class="{ disabled: disabled }">
		<input
			type="radio"
			class="input"
			:value="newValue"
			:name="newName"
			:id="newName + '_' + newId"
			:disabled="disabled"
			@input="$emit('update:modelValue', $event.target.value)"
		/>
		<label :for="newName + '_' + newId">{{ newLabel }}</label>
	</div>
</template>

<script setup>
	let props = defineProps({
		value: {
			default: '',
			type: String,
		},
		name: {
			default: '',
			type: String,
		},
		id: {
			default: '',
			type: String,
		},
		label: {
			default: '',
			type: String,
		},
		checked: {
			default: false,
			type: Boolean,
		},
		disabled: {
			default: false,
			type: Boolean,
		},
	})

	let newName = ref(props.name)
	let newValue = ref(props.value)
	let newLabel = ref(props.label)
	let newId = ref(props.id)
	let checked = ref(props.checked)
	let disabled = ref(props.disabled)
	let emit = defineEmits(['update:checkedValue'])
	let mainInput = ref(null)

	let slots = useSlots()
</script>

<style lang="scss" scoped>
	.radio-input {
		height: 20px;
		position: relative;
		display: flex;
		align-items: center;
		margin: 10px 0;
		cursor: pointer;

		.input {
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
		}
	}
</style>
