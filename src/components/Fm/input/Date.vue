<template>
	<BaseInput
		ref="baseInput"
		:label="label"
		:modelValue="modelValue"
		:required="required"
		:disabled="disabled"
		:errorData="error"

		@update:modelValue="onMainInputChange"
		@udpate:errorData="newVal => $emit('update:errorData', newVal)"
	>
		<template #button>
			<slot name="button">
				<FmBtn type="iconBtn"
							 icon="calendar_month"
							 :disabled="disabled"
							 @click="showDatepicker"
				/>
			</slot>
		</template>

		<template v-if="$slots.sideItems" #sideItems>
			<slot name="sideItems"></slot>
		</template>
	</BaseInput>
</template>

<script setup>

	import dayjs from "dayjs";
	import customParseFormat from "dayjs/plugin/customParseFormat";
	dayjs.extend(customParseFormat);

	const props = defineProps({
		modelValue: String,
		label: String,
		disabled: Boolean,
		required: Boolean,
		errorData: Object,

		defaultDate: Boolean,
	})
	const emit = defineEmits(['update:modelValue', 'update:errorData'])

	let baseInput = ref(null);
	// let mainInputValue = ref(props.modelValue);
	let doNotShowDatepicker = true;
	let localErrorData = ref(null); // when props.errorData not used

	let error = computed({
		set(newVal) {

			localErrorData.value = newVal ? JSON.parse(JSON.stringify(newVal)) : newVal;
			emit('update:errorData', newVal);

		},
		get() {
			return props.errorData ? props.errorData : localErrorData.value;
		}
	});
	onMounted(() => {
		let pickmeupOpts = {
			default_date: props.defaultDate,
		};

		if (props.modelValue) {
			pickmeupOpts.date = new Date(props.modelValue);
			pickmeupOpts.current = new Date(props.modelValue);
		}
		usePickmeup(baseInput.value.mainInput, pickmeupOpts)

		//#region Prevents showing datepicker on mainInput click
		baseInput.value.mainInput.addEventListener("pickmeup-show", function (event) {
			if (doNotShowDatepicker) event.preventDefault();
		});

		baseInput.value.mainInput.addEventListener("pickmeup-hide", function () {
			doNotShowDatepicker = true;
		});
		//#endregion

		baseInput.value.mainInput.addEventListener("pickmeup-change", function (event) {
			emit('update:modelValue', event.detail.formatted_date);
		});
	})
	watch(
		() => props.modelValue,
		() => {
			if (
				error.value && error.value.code === 40 &&
				props.modelValue && dayjs(props.modelValue, "YYYY-MM-DD", true).isValid()
			) {
				error.value = null;
			}
		}
	)

	function showDatepicker() {
		doNotShowDatepicker = false;
		usePickmeup(baseInput.value.mainInput).show();
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

		const notValid = !dayjs(newValue, "YYYY-MM-DD", true).isValid()

		if (notValid) {
			error.value = {code: 40, message: "Date has wrong format. Use this format instead: YYYY-MM-DD."}

		} else if (error.value && error.value.code === 40) {
			error.value = null;
		}

	}, 800);

	function onMainInputChange( value ) {
		if (!value) {
			if (error.value && error.value.code === 40) error.value = null;
			emit('update:modelValue', null);

			return;
		}

		value = formatDateValue(value);

		validateValue(value);

		emit('update:modelValue', value);
	}


</script>

<style lang="scss" scoped>

.bi_main_input[disabled] {
	color: $text-lighten;
}
</style>
