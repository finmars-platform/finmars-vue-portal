<template>
	<BaseInput
		:label="label"
		:modelValue="modelValue"
		:required="required"
		:errorData="error"

		@update:modelValue="$emit('update:modelValue', $event)"
		@udpate:errorData="newVal => $emit('update:errorData', newVal)"
	>
		<template #button>
			<FmBtn type="iconBtn"
						 icon="calendar_month"
						 @click="showDatepicker"
			/>
		</template>

		<input
			ref="mainInput"
			type="text"
			:placeholder="label"
			:value="modelValue"
			:disabled="disabled"

			@input="onMainInputChange"

			class="bi_main_input"
		/>

		<template #sideItems></template>
	</BaseInput>
</template>

<script setup>

	import moment from "moment";

	let props = defineProps({
		modelValue: String,
		label: String,
		disabled: Boolean,
		required: Boolean,
		errorData: Object,

		defaultDate: Boolean,
	})

	let emit = defineEmits(['update:modelValue', 'update:errorData'])

	let localErrorData = ref(null); // when props.errorData not used
	let mainInput = ref(null);
	// let mainInputValue = ref(props.modelValue);

	let doNotShowDatepicker = true;

	let error = computed({
		set(newVal) {

			localErrorData.value = newVal ? JSON.parse(JSON.stringify(newVal)) : newVal;
			emit('update:errorData', newVal);

		},
		get() {
			return props.errorData ? props.errorData : localErrorData.value;
		}
	});

	watch(
		() => props.modelValue,
		() => {

			if (
				error.value && error.value.code === 40 &&
				props.modelValue && moment(props.modelValue, "YYYY-MM-DD", true).isValid()
			) {

				error.value = null;

			}

		}
	)

	function showDatepicker() {
		doNotShowDatepicker = false;
		usePickmeup(mainInput.value).show();
	}

	/**
	 * Prevents entering number that is more than max number
	 *
	 * @param str {string}
	 * @param max {number} - maximum number allowed
	 * @returns {string}
	 */
	function checkValue(str, max) {
		if (str.charAt(0) !== '0' || str == '00') {
			let num = parseInt(str);
			const numIsInvalid = isNaN(num) || num <= 0 || num > max;
			if (numIsInvalid) num = 1;

			str = num.toString();

			const tensMoreThanMax = num > parseInt(max.toString().charAt(0)) && num.toString().length == 1;
			if (tensMoreThanMax) {
				str = '0' + num;
			}

		}

		return str;
	}

	function formatDateValue (dateText) {

		if (/\D\/$/.test(dateText)) dateText = dateText.substr(0, dateText.length - 3);

		const values = dateText.split('-').map(function (v) { // prevent writing of non digits
			return v.replace(/\D/g, '');
		});

		if (values[1]) values[1] = checkValue(values[1], 12);
		if (values[2]) values[2] = checkValue(values[2], 31);

		const output = values.map(function (v, i) {
			if (v.length == 4 && i == 0) {
				return v + '-'
			}
			else if (v.length == 2 && i == 1) {
				return v + '-'
			}
			else {
				return v
			}
		});

		// this.value = output.join('').substr(0, 14);
		const value = output.join('').substring(0, 14);

		return value;

	}

	const validateValue = useDebounce(function (newValue) {

		const notValid = !moment(newValue, "YYYY-MM-DD", true).isValid()

		if (notValid) {
			error.value = {code: 40, message: "Date has wrong format. Use this format instead: YYYY-MM-DD."}

		} else if (error.value && error.value.code === 40) {
			error.value = null;
		}

	}, 800);

	function onMainInputChange (event) {

		let value = event.target.value;

		if (!value) {

			if (error.value && error.value.code === 40) error.value = null;
			emit('update:modelValue', null);

			return;

		}

		value = formatDateValue(value);

		validateValue(value);

		emit('update:modelValue', value);

	}

	onMounted(() => {

		let pickmeupOpts = {
			default_date: props.defaultDate,
		};

		if (props.modelValue) {
			pickmeupOpts.date = new Date(props.modelValue);
			pickmeupOpts.current = new Date(props.modelValue);
		}

		usePickmeup(mainInput.value, pickmeupOpts)

		//#region Prevents showing datepicker on mainInput click
		mainInput.value.addEventListener("pickmeup-show", function (event) {
			if (doNotShowDatepicker) event.preventDefault();
		});

		mainInput.value.addEventListener("pickmeup-hide", function () {
			doNotShowDatepicker = true;
		});
		//#endregion

		mainInput.value.addEventListener("pickmeup-change", function (event) {
			emit('update:modelValue', event.detail.formatted_date);
		});

	})
</script>

<style lang="scss" scoped>


</style>
