<template>
	<div class="usercode-input flex-column">
		<div class="fi-start grid grid-col-2 m-b-8">
			<!--				<md-input-container>
				<label>Configuration</label>
				<md-select data-ng-model="scope.configuration_code.value">
					<md-option data-ng-repeat="item in configuration_codes"
										 value="{{item}}"
										 data-ng-click="updateUserCode(usercode.value, item)">
						{{item}}
					</md-option>
				</md-select>
			</md-input-container>-->
			<FmSelect
				:modelValue="configCode"
				label="Configuration Code"
				:items="configCodesList"
				attach="body"
				:disabled="disabled"
				:required="true"
				v-model:errorData="configCodeSelEd"
				@update:modelValue="onConfigCodeChange"
			/>

			<!--				<md-input-container style="margin-top: 2px; width: 100%;">
				<label>User code</label>
				<input type="text"
							 data-ng-model="scope.userCode"
							 data-ng-change="validateUserCode(scope.userCode)"
							 data-ng-keyup="updateUserCode(scope.userCode, configuration_code)">
			</md-input-container>-->
			<BaseInput
				:modelValue="userCodeEnd"
				:label="userCodeLabel"
				:disabled="disabled"
				@update:modelValue="onUserCodeChangeD"
				tooltip="Allowed symbols: Numbers:
						0-9, Letters: a-z (lowercase) Special Symbols: _, - (underscore, dash)"
			/>

			<!--				<ng-md-icon class="tooltip-inline-block"
									icon="info"
									size="20"
									style="fill: #777777">
				<md-tooltip class="tooltip_2"
										md-direction="top">
					Allowed symbols:
					Numbers: 0-9,
					Letters: a-z (lowercase)
					Special Symbols: _, - (underscore, dash)
				</md-tooltip>
			</ng-md-icon>-->
			<!-- <FmIcon
				icon="info"
				v-tooltip="
					`Allowed symbols:
								Numbers: 0-9,
								Letters: a-z (lowercase)
								Special Symbols: _, - (underscore, dash)`
				"
				class="m-l-8"
			/> -->
		</div>

		<div class="p-l-4">
			<p v-show="!scope.errorDescription" class="small-text">
				<i>Result: {{ modelValue }}</i>
			</p>

			<p v-show="scope.errorDescription" class="small-text error-color">
				{{ scope.errorDescription }}
			</p>

		</div>

	</div>
</template>

<script setup>

	let props = defineProps({
		/** Full user_code **/
		userCodeLabel: {
			type: String,
			default: 'User code'
		},
		modelValue: String,
		content_type: String,
		disabled: Boolean,
		errorData: String,
	})

	let emit = defineEmits([
		'update:modelValue',
		'configurationCodeChanged',
		'update:errorData',
	])

	let store = useStore()

	let scope = reactive({})

	let configCodesList = ref([]);
	let configCode = ref(null);
	let configCodeSelEd = ref(null);

	let userCodeEnd = ref('');

	let convertedUserCode = ''

	let error = ref(props.errorData || null)

	/*
	setErrorDescrD() prevents error text appearing while user still changing input
	while event update:errorData sends signal right away (e.g. disable save button right away)
	 */
	scope.errorDescription = ''

	watch(
		() => props.errorData,
		() => {
			error.value = props.errorData

			setErrorDescrD(error.value)
		}
	)

	const parseUserCode = function () {

		if (!props.modelValue) {
			return
		}

		const parts = props.modelValue.split(':')

		if (parts.length === 1) {
			userCodeEnd.value = parts[0];

		}
		else {
			configCode.value = parts[0];
			userCodeEnd.value = parts.at(-1)
		}

	}

	watch(() => props.modelValue, parseUserCode)

	/*if (props.configuration_code !== undefined) {
		watch(
			() => props.configuration_code,
			() => {
				configCode.value = props.configuration_code
			}
		)
	}*/

	const setErrorDescrD = useDebounce(function (description) {
		scope.errorDescription = description
	}, 1000)

	function onConfigCodeChange(configCodeVal) {

		configCodeSelEd.value = null;
		configCode.value = configCodeVal;

		emit('configurationCodeChanged', configCodeVal);
		emit( 'update:modelValue', assembleUserCode(userCodeEnd.value) );

	}

	const assembleUserCode = function (ucEnd) {

		if (!ucEnd) return '';

		let userCode = configCode.value + ':'

		if (props.content_type) {
			userCode = userCode + props.content_type + ':'
		}

		return userCode + ucEnd
	}

	const onUserCodeChangeD = useDebounce(function (newUserCodeEnd) {

		newUserCodeEnd = newUserCodeEnd.replace(/^\d|[^A-Za-z1-9]+/g, '_').toLowerCase()

		validateUserCode(newUserCodeEnd);

		if (!props.errorData) {
			userCodeEnd.value = newUserCodeEnd

			emit( 'update:modelValue', assembleUserCode(userCodeEnd.value) )
		}

	}, 600)

	const validateUserCode = function (userCodeVal) {
		let errorVal = useTextNotValidForUserCode(userCodeVal, {
			textName: 'User code',
		})

		const userCode = assembleUserCode(userCodeVal)

		if (
			Array.isArray(scope.occupiedUserCodes) &&
			scope.occupiedUserCodes.includes(userCode)
		) {
			errorVal = 'User code should be unique.'
		}

		if (errorVal !== error.value) {
			emit('update:errorData', errorVal)
		}

	}

	const init = function () {

		/*const res = await useApi('configurationList.get');

		if ( res._$error ) {
			throw new Error(res._$error);

		} else {

			scope.configuration_codes = res.results.filter(function (item) {
				return !item.is_package; // TODO Move to backend filtering someday
			}).map(function (item) {
				return {
					id: item.configuration_code,
					name: item.configuration_code,
				}
			});

			parseUserCode();

		}*/

		configCodesList.value = store.configCodes.filter(function (item) {
			return !item.is_package; // TODO Move to backend filtering someday
		}).map(function (item) {
			return {
				id: item.configuration_code,
				name: item.configuration_code,
			}
		});

		parseUserCode();

		// show selector of config codes empty in case of deprecated or invalid configurationCode
		if (!configCode.value) {
			configCodeSelEd.value = {message: "Invalid configuration code"};
		}

	}

	init();

</script>

<style lang="scss" scoped>
	.usercode-input {
		min-height: 40px;
		padding: 16px 8px;
		border: 1px solid #7d7d7d;
		border-radius: 6px;
	}

	:deep(.fm_select),
	:deep(div.base-input:not(.bi_no_margins)) {
		margin-bottom: 0;
	}

	.small-text {
		color: #747474;
		font-size: 13px;
		font-family: 'Roboto', sans-serif;
	}
</style>
