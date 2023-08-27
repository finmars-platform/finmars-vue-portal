<template>
	<div>
		<FmMenu v-model:opened="menuIsOpened"
						anchor="top left"
						attach="body"
						menuWidth="activator"
						:minWidth="340"
						:openOn="false"

						:offsetX="5"
						:offsetY="-24"

						class="width-100">

			<template #btn>
				<BaseInput
					type="text"
					:label="label"
					:tooltip="tooltip"
					:modelValue="biText"
					:errorData="errors.baseInput"
					@update:modelValue="setNames"
					@update:errorData="newVal => onErrorDataChange('baseInput', newVal)"
				>
					<template #button>
						<FmIcon icon="new_label" @click.stop="menuIsOpened = true" />
					</template>
				</BaseInput>
			</template>

			<div class="e_names_popup">
				<div>
					<FmInputText
						label="Full name"
						:modelValue="name"
						:errorData="errors.name"
						@update:modelValue="emit('update:name', $event);"
						@update:errorData="newVal => onErrorDataChange('name', newVal)"
					/>
				</div>
				<div>
					<FmInputText
						label="Short name"
						:modelValue="short_name"
						:errorData="errors.short_name"
						@update:modelValue="emit('update:short_name', $event)"
						@update:errorData="newVal => onErrorDataChange('short_name', newVal)"
					/>
				</div>
				<div>
					<FmInputText
						label="User code"
						:modelValue="user_code"
						:errorData="errors.user_code"
						@update:modelValue="emit('update:user_code', $event)"
						@update:errorData="newVal => onErrorDataChange('user_code', newVal)"
					/>
				</div>
				<div>
					<FmInputText
						class="m-b-0"
						label="Public name"
						:modelValue="public_name"
						:errorData="errors.public_name"
						@update:modelValue="emit('update:public_name', $event)"
						@update:errorData="newVal => onErrorDataChange('public_name', newVal)"
					/>
				</div>
				<div v-if="valueToShow">
					<FmSelect
						class="m-b-0"
						label="Show by default"
						:modelValue="valueToShow"
						:menuOptions="valueToShowOptions"
						@update:modelValue="onValueToShowChange"
					/>
				</div>
			</div>
		</FmMenu>

	</div>
</template>

<script setup>

let props = defineProps({
	label: String,
	tooltip: String,
	name: String,
	short_name: String,
	user_code: String,
	public_name: String,
	valueToShow: String,
	notNullInputs: {
		type: [String, Array],
		default: 'name'
	},
	/** Use when editing existent entity names **/
	editing: Boolean,
	errorData: {
		type: Object,
		default() { return {} },
	}
});

let emit = defineEmits([
	"update:name",
	"update:short_name",
	"update:user_code",
	"update:public_name",
	"update:valueToShow",
	"update:errorData",
]);

const inputsProps = ['name', 'short_name', 'user_code', 'public_name'];

const valueToShowOptions = [
	{
		id: "name",
		name: "name",
	},
	{
		id: "short_name",
		name: "Short Name",
	}
];

let labelText = ref('');

if (props.label) {
	labelText.value = props.label;

} else if (props.valueToShow) {

	const selOpt = valueToShowOptions.find(opt => opt.id === props.valueToShow);
	labelText.value = selOpt.name;

}

let notNullInputsList = Array.isArray(props.notNullInputs) ? props.notNullInputs : props.notNullInputs.split(',');

let menuIsOpened = ref(false);

let vtsKey = computed(() => props.valueToShow || 'name');
// let inputText = ref(props[vtsKey.value]);
let biText = computed({
	get() {
		return props[vtsKey.value];
	},
	set(newVal) {
		setNames(newVal);
	}
})

function onValueToShowChange(newValueToShow) {

	// inputText.value = props[newValueToShow];

	if (!props.label) {
		const selOpt = valueToShowOptions.find(opt => opt.id === newValueToShow);
		labelText.value = selOpt.name;
	}

	emit("update:valueToShow", newValueToShow);

}

/**
 * Update name based on new value of base input
 *
 * @param {String} propName - 'name', 'short_name', 'user_code', 'public_name'
 * @param {String} newValue - value after changing base input
 */
function updateName(propName, newValue) {

	// change field if it is empty or having the same value as baseInput
	if (!props[propName] || props[propName] === biText.value) {

		emit("update:" + propName, newValue);

	}

}

/* function setNames(newValue) {

	if (!props.label) {

		let selOpt = valueToShowOptions.find(opt => opt.id === vtsKey.value);

		labelText.value = selOpt.name;

	}

	updateName('name', newValue);
	updateName('short_name', newValue);

	if (!props.editing) {
		updateName('user_code', newValue);
	}

	updateName('public_name', newValue);

	// inputText.value = newValue;

} */

function baseInputChangeFn (newVal) {

	if (!props.label) {

		let selOpt = valueToShowOptions.find(opt => opt.id === vtsKey.value);

		labelText.value = selOpt.name;

	}

	updateName('name', newVal);
	updateName('short_name', newVal);

	if (!props.editing) {
		updateName('user_code', newVal);
	}

	updateName('public_name', newVal);

	// inputText.value = newVal;

}

/*
 * Debounce prevents changing unintended names when deleting text inside base input
 * e.g. Deleting 'Bank AAA' would also delete 'Bank A' without debounce
 */
const setNames = useDebounce(baseInputChangeFn, 300);

function onErrorDataChange(propName, newValue) {

	errors.value[propName] = newValue;

	const inputWithError = inputsProps.find(propName => errors.value[propName]);

	if (!inputWithError && errors.value.baseInput) errors.value.baseInput = null;

	emit('update:errorData', errors.value);

}

//#region Validation and errors
let errors = ref({});

if (props.errorData) errors.value = JSON.parse(JSON.stringify(props.errorData));

watch(
	() => props.errorData,
	() => {

		errors.value = props.errorData ? JSON.parse(JSON.stringify(props.errorData)) : {};

		if (errors.value.validate) validateInputs();

	},
	{deep: true}
)

/*
	props.errorData = {
		baseInput: {}
		name: {message: "Should not be null"}
	}
 */

function validateInputs() {

	notNullInputsList.forEach(propName => {

		if (!props[propName]) {
			errors.value[propName] = {code: 10, message: "This field should not be null"};
		}

	});

	const inputWithError = inputsProps.find(propName => errors.value[propName]);

	if (inputWithError && !errors.value.baseInput) {
		errors.value.baseInput = {message: "There are fields with errors inside"};
	}

	delete errors.value.validate;

	const newPropVal = Object.keys(errors.value).length ? errors.value : null;
	emit('update:errorData', newPropVal);

}
//#endregion

</script>

<style lang="scss" scoped>
.e_names_popup {
	min-width: 340px;
	padding: 24px 16px;
}

.base_input_holder {
	:deep(.base-input) {
		cursor: pointer;
	}

	:deep(.base-input .bi_main_input) {
		cursor: pointer;
	}
}
</style>
