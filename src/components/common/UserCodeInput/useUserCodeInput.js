import { computed, nextTick, onBeforeMount, ref, watch } from 'vue';
import isEmpty from 'lodash/isEmpty';
import useApi from '@/composables/useApi';
import cloneDeep from 'lodash/cloneDeep';

export default function useUserCodeInput(props, emits) {
	const userCodeFieldComponent = ref();

	const isLoading = ref(false);
	const configurationCodes = ref([]);

	const editedUserCode = ref(
		props.item ? props.item.user_code : props.userCode
	);

	const configurationCode = ref(null);
	const userCodeEnd = ref(null);

	const processedContentType = computed(() => {
		const value = props.item ? props.item.content_type : props.contentType;
		return value || '';
	});

	const userCodeFieldComponentValid = computed(
		() => userCodeFieldComponent.value?.isValid
	);

	function parseUserCode() {
		if (!editedUserCode.value) {
			return;
		}

		if (typeof editedUserCode.value !== 'string') {
			throw new Error(
				`Expected 'string' as user_code, got: ${typeof editedUserCode.value}`
			);
		}

		const parts = editedUserCode.value.split(':');
		if (parts.length === 1) {
			userCodeEnd.value = parts[0];
			return;
		}

		if (parts.length === 2) {
			configurationCode.value = parts[0];
			userCodeEnd.value = parts[1];
			return;
		}

		configurationCode.value = parts[0];
		userCodeEnd.value = parts[parts.length - 1];
	}

	function validateUserCodeEnd(val) {
		let errorsMessage = '';

		if (!val) {
			return 'User code should not be empty.';
		}

		if (val.match(/[^1-9a-z_-]/)) {
			errorsMessage =
				'Only english letters (lowercase) and 1-9 numbers allowed for User code.';
		}

		if (val.match(/^[0-9]/)) {
			errorsMessage += `${isEmpty(errorsMessage) ? '' : ' '}User code should not start with number.`;
		}

		return errorsMessage || true;
	}

	function replaceSpecialCharsAndSpaces(str) {
		return str.replace(/[^A-Za-z0-9]+/g, '_');
	}

	function assembleUserCode() {
		return `${configurationCode.value}:${processedContentType.value ? `${processedContentType.value}:` : ''}${userCodeEnd.value}`;
	}

	function updateUserCode() {
		userCodeEnd.value = userCodeEnd.value
			? replaceSpecialCharsAndSpaces(userCodeEnd.value).toLowerCase()
			: '';

		if (props.item) {
			const updatedItem = cloneDeep(props.item);
			updatedItem.user_code = userCodeEnd.value
				? assembleUserCode(userCodeEnd.value, configurationCode.value)
				: null;
			updatedItem.configuration_code = configurationCode.value;
			emits('update:item', updatedItem);
			return;
		}

		editedUserCode.value = userCodeEnd.value
			? assembleUserCode(userCodeEnd.value, configurationCode.value)
			: null;
		emits('update:userCode', editedUserCode.value);
	}

	async function updateUserCodeEnd(val) {
		await nextTick(() => {
			if (userCodeFieldComponent.value.isValid) {
				userCodeEnd.value = val;
				updateUserCode();
			}
		});
	}

	async function updateConfigurationCode(value) {
		configurationCode.value = value;
		emits('update:configurationCode', configurationCode.value);

		if (userCodeEnd.value) {
			await nextTick(() => {
				updateUserCode();
			});
		}
	}

	async function getConfigurationList() {
		try {
			isLoading.value = true;
			const res = await useApi('manageConfigurationList.get');
			if (res && res.results) {
				configurationCodes.value = res.results
					.filter((i) => !i.is_package)
					.map((i) => ({
						value: i.configuration_code,
						title: i.configuration_code
					}));
			}
		} catch (e) {
			console.error('The error getting the configuration list. ', e);
		} finally {
			isLoading.value = false;
		}
	}

	onBeforeMount(async () => {
		await getConfigurationList();
	});

	watch(
		() => props.userCode,
		() => {
			editedUserCode.value = props.userCode;
			parseUserCode();
		},
		{ immediate: true }
	);

	watch(
		() => userCodeFieldComponentValid.value,
		(val, oldVal) => {
			if (val !== oldVal) {
				emits('update:valid', val);
			}
		},
		{ immediate: true }
	);

	return {
		userCodeFieldComponent,
		isLoading,
		editedUserCode,
		userCodeEnd,

		configurationCodes,
		configurationCode,
		validateUserCodeEnd,
		updateUserCodeEnd,
		updateConfigurationCode
	};
}
