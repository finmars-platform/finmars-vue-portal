<template>
	<div class="usercode-input flex-column">
		<div class="fi-center  grid  grid-col-2 m-b-8">
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
				label="User code"
				@update:modelValue="onUserCodeChange"
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
				v-fm-tooltip="
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
	import { useTextNotValidForUserCode } from '~/composables/useMeta'

	let props = defineProps({
		/** Full user_code **/
		modelValue: String,
		configuration_code: String,
		content_type: String,
		errorData: String,
	})

	let emit = defineEmits([
		'update:modelValue',
		'update:configuration_code',
		'update:errorData',
	])

	let store = useStore()

	let scope = reactive({})

	let configCodesList = ref([]);
	let configCode = ref(props.configuration_code);

	if (!configCode.value) {

		configCode.value = store.defaultConfigCode;

		emit('update:configuration_code', configCode.value); // in case of creating user code for new item

	}

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

	if (props.configuration_code !== undefined) {
		watch(
			() => props.configuration_code,
			() => {
				configCode.value = props.configuration_code
			}
		)
	}

	const setErrorDescrD = useDebounce(function (description) {
		scope.errorDescription = description
	}, 1000)

	function onConfigCodeChange(configCodeVal) {

		configCode.value = configCodeVal;

		emit('update:configuration_code', configCodeVal);
		emit( 'update:modelValue', assembleUserCode(userCodeEnd.value) );

	}

	const assembleUserCode = function (ucEnd) {
		let userCode = configCode.value + ':'

		if (props.content_type) {
			userCode = userCode + props.content_type + ':'
		}

		return userCode + ucEnd
	}

	function onUserCodeChange(userCode) {
		userCode = userCode.replace(/\s+/g, '_').toLowerCase()

		validateUserCode(userCode)

		if (!props.errorData) {
			userCodeEnd.value = userCode

			emit( 'update:modelValue', assembleUserCode(userCodeEnd.value) )
		}
	}

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

		if (errorVal !== error) {
			emit('update:errorData', errorVal)
		}
	}

	const init = async function () {
		const res = await useApi('configurationList.get')

		if (res.error) {
			throw new Error(res.error)
		} else {
			configCodesList.value = res.results
				.filter(function (item) {
					return !item.is_package // TODO Move to backend filtering someday
				})
				.map(function (item) {
					return {
						id: item.configuration_code,
						name: item.configuration_code,
					}
				})

			parseUserCode()
		}
	}

	init()
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
