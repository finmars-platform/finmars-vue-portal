<template>
	<div class="usercode-input flex-column">

		<div class="flex-row fi-center m-b-8">

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
				label="Configuration"
				:items="scope.configuration_codes"
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
				:modelValue="scope.userCode"
				label="User code"
				@update:modelValue="onUserCodeChange"
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
			<FmIcon icon="info"
							v-fm-tooltip="
								`Allowed symbols:
								Numbers: 0-9,
								Letters: a-z (lowercase)
								Special Symbols: _, - (underscore, dash)`
							"
							class="m-l-8"
			/>
		</div>

		<div class="p-l-4">
			<p
				v-show="!scope.errorDescription"
				class="small-text"
			>
				<i>Result: {{modelValue}}</i>
			</p>

			<p
				v-show="scope.errorDescription"
				class="small-text error-color"
			>
				{{ scope.errorDescription }}
			</p>

		</div>

	</div>
</template>

<script setup>

	import {useTextNotValidForUserCode} from "~/composables/useMeta";

	let props = defineProps({
		/** Full user_code **/
		modelValue: String,
		configurationCode: String,
		contentType: String,
		errorData: String,
	})

	let emit = defineEmits(['update:modelValue', 'update:configurationCode', 'update:errorData'])

	let store = useStore();

	let scope = reactive({});

	let configCode = ref(props.configurationCode || store.defaultConfigCode);

	scope.userCode = '';

	let convertedUserCode = '';

	let error = ref(props.errorData || null);

	/*
	setErrorDescrD() prevents error text appearing while user still changing input
	while event update:errorData sends signal right away (e.g. disable save button right away)
	 */
	scope.errorDescription = '';

	watch(
		() => props.errorData,
		() => {

			error.value = props.errorData;

			setErrorDescrD( error.value );

		}
	)

	const parseUserCode = function () {

		if (!props.modelValue) {
			return;
		}

		const parts = props.modelValue.split(':');

		if (parts.length === 1) {
			scope.userCode = parts[0];

		} else {
			configCode.value = parts[0];
			scope.userCode = parts.at(-1);
		}

	}

	watch(
		() => props.modelValue,
		parseUserCode,
	)

	if (props.configurationCode !== undefined) {

		watch(
			() => props.configurationCode,
			() => {
				configCode.value = props.configurationCode
			}
		)

	}

	const setErrorDescrD = useDebounce(function (description) {
		scope.errorDescription = description;
	}, 1000);

	function onConfigCodeChange (configCode) {
		configCode.value = configCode;
		emit('update:configurationCode', configCode);
	}

	const assembleUserCode = function (userCodeEnd) {

		let userCode = store.defaultConfigCode + ':';

		if (props.contentType) {
			userCode = userCode + scope.item.contentType + ':';
		}

		return userCode + userCodeEnd;

	}

	function onUserCodeChange (userCode) {

		userCode = userCode.replace(/\s+/g, '_').toLowerCase();

		validateUserCode(userCode);

		if ( !props.errorData ) {

			scope.userCode = userCode;

			emit( 'update:modelValue', assembleUserCode(userCode) );
		}

	}

	const validateUserCode = function (userCodeVal) {

		let errorVal = useTextNotValidForUserCode(userCodeVal, {textName: 'User code'});

		const userCode = assembleUserCode(userCodeVal);

		if (Array.isArray(scope.occupiedUserCodes) &&
			scope.occupiedUserCodes.includes(userCode)) {

			errorVal = 'User code should be unique.';

		}

		if (errorVal !== error) {
			emit( 'update:errorData', errorVal );
		}

	}

	const init = async function () {

		const res = await useApi('configurationList.get');

		if ( res.error ) {
			throw new Error(res.error);

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

	:deep(.fm_select), :deep( div.base-input:not(.bi_no_margins) ) {
		margin-bottom: 0;
	}
</style>
