<template>
	<BaseModal
		title="Error details"
		@open="init"
		@close="emit('close')"
	>

		<div class="p-16">

			<div v-if="readyStatus">
				<div class="flex-row">
					<div class="error-msg-div text-bold">Error message:</div>
					<div v-html="errorMessageC"></div>
				</div>
			</div>

			<div v-else>
				<FmLoader class="flex-row flex-center" :size="40" />
			</div>

		</div>


		<template #controls="{ cancel }">
			<div class="flex-row fc-space-between">
				<FmBtn
					type="basic"
					@click="cancel"
				>CLOSE</FmBtn>

			</div>
		</template>
	</BaseModal>
</template>

<script setup>

// stores
// props, emits
import {useGetExceptionDetails, useGetExceptionKey} from "~/composables/useMeta";

const props = defineProps({
	errorData: Object,
	description: String,
})

const emit = defineEmits(['close'])

//# region variables, refs, computed
const readyStatus = ref(false);
const errorObj = ref(null);

const errorMessageC = computed(() => {

    if (!errorObj.value) {
        return;
	}

	if (errorObj.value.description) {
		return errorObj.value.description;
	}

	return errorObj.value.data.error?.details?.errors[0].detail;

});
//# endregion

async function getErrorDescForLessThanYear(error) {

	const res = await useApi("portfolioRegisterList.get");

	if (res._$error) {
		throw res._$error;
	}

	const errorDetails = useGetExceptionDetails(error.data);

	let prtfRegistersUserCodes = errorDetails.split(": ").at(-1); // result string example: "portfolioRegister1, portfolioRegister2, portfolioRegister3"
	prtfRegistersUserCodes = prtfRegistersUserCodes.split(", ");

	let prtfRegistersShortNames = res.results
		.filter(pRegister => {
			return prtfRegistersUserCodes.includes(pRegister.user_code);
		})
		.map(pRegister => {
			return `<span class="text-bold">${pRegister.short_name}</span>`;
		});

	prtfRegistersShortNames = prtfRegistersShortNames.join(", ");

	return `Return period of ${prtfRegistersShortNames} is less than a year (<365 days) (must not be annualized)`;

}

async function init() {

	readyStatus.value = false;
	let error;
	console.log("testing519 errorData", props.errorData);
	if (props.errorData) {
		error = JSON.parse(JSON.stringify(props.errorData));
    }

	error.errorKey = useGetExceptionKey(error.data);

	if (error.errorKey === 'less_than_year') {
		error.description = await getErrorDescForLessThanYear(error);
	}

	errorObj.value = error;

	readyStatus.value = true;

}

//# region hooks
//# endregion

// watchers
</script>

<style scoped lang="scss">
	.error-msg-div {
		flex: 0 0 120px;
	}
</style>
