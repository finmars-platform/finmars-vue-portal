<template>
	<div>
		<div class="py-3 px-8">
			<FmBreadcrumbs :crumbs="crumbs" @update-crumbs="handleCrumbs" />
		</div>
		<div class="py-3 px-8 flex flex-column gap-2">
			<div class="code-wrapper">
				<UserCodeInput
					:user-code="scheduleItem.user_code"
					@update:user-code="updateField('user_code', $event)"
					@update:configuration-code="updateField('configuration_code', $event)"
					@update:valid="formData['user_code'].isValid = $event"
				/>
			</div>
			<FmTextField
				:model-value="scheduleItem.name"
				outlined
				label="Name"
				:error="formData.name.isDirty && !formData.name.isValid"
				:error-messages="
						formData.name.isDirty && !formData.name.isValid
							? ['This field may not blank']
							: []
					"
				@update:model-value="updateField('name', $event)"
			/>
			<div class="flex flex-col mb-2">
				<span class="mb-1">Notes</span>
				<textarea
					id="notes"
					name="notes"
					rows="4"
					cols="50"
					v-model="scheduleItem.notes"
				/>
			</div>
		</div>
		<div class="py-3 px-8 flex flex-col gap-4 w-full h-full">
			<div class="flex flex-col gap-4">
				<span><strong>Upload periodicity</strong></span>
				<div class="grid grid-cols-2">
					<FmSelect
						v-model="cron.periodicity"
						:options="periodicityOptions"
						@update:modelValue="resetCronExpr"
						variant="outlined"
					/>
				</div>
				<div v-if="cron.periodicity === '2'" class="px-8">
					<div class="grid grid-cols-7 gap-4">
						<div v-for="(day, index) in days" :key="index">
							<FmCheckbox
								v-model="day.status"
								:label="day.title"
								@update:modelValue="setDay"
							/>
						</div>
					</div>
				</div>
				<div v-if="cron.periodicity === '3'" class="px-8">
					<div class="grid grid-cols-2 gap-4">
						<FmSelect
							v-model="cron.month"
							:options="monthsOptions"
							label="Month"
							variant="outlined"
							clearable
							multiple
							chip
						/>
						<FmSelect
							v-model="cron.day"
							:options="getRange(31)"
							:disabled="!cron.month.length"
							label="Day"
							variant="outlined"
							clearable
							multiple
							chip
						/>
					</div>
				</div>
			</div>
			<div>
				<span><strong>Server time</strong>: <i ref="serverTimeContent"></i></span>
			</div>
			<div class="flex flex-row nowrap items-center gap-2">
				<span><strong>Time: </strong></span>
				<FmInputTime v-model="cron.time" :minutes-step="1" outlined />
			</div>
			<div class="flex flex-col gap-4">
				<span><strong>Error Handling</strong></span>
				<div class="grid grid-cols-2">
					<FmSelect v-model="scheduleItem.error_handler" :options="errorHandlerOptions" variant="outlined" />
				</div>
			</div>

			<div class="flex flex-col">
				<span class="mb-2"><strong>Procedures</strong></span>
				<div v-if="scheduleProcedureList.length" class="schedule-card">
					<Procedure
						:procedures="scheduleProcedureList"
						@remove-item="removeScheduleProcedure"
						@update-item="updateScheduleProcedure"
					/>
				</div>
			</div>
			<FmButton type="primary" @click="addNewScheduleProcedure" rounded>Add Procedure</FmButton>
		</div>
		<div class="flex items-center justify-start gap-4 py-4 px-8">
			<FmButton
				type="primary"
				@click="createItem"
				:loading="confirmButtonLoader"
				:disabled="!isFormValid"
				rounded
			>
				Create
			</FmButton>
			<FmButton type="secondary" @click="closeItem" rounded>Close</FmButton>
		</div>
	</div>
</template>

<script setup>
	import {
		FmBreadcrumbs,
		FmButton,
		FmCheckbox,
		FmSelect,
		FmTextField,
		FmInputTime
	} from '@finmars/ui';
	import cloneDeep from 'lodash/cloneDeep';
	import { getRealmSpaceCodes } from '~/pages/system/helper';
	import UserCodeInput from '~/components/common/UserCodeInput/UserCodeInput.vue';
	import Procedure from '~/pages/system/schedule/procedure/index.vue';
	import dayjs from 'dayjs';
	import set from 'lodash/set';

	definePageMeta({
		middleware: 'auth'
	});

	const route = useRoute();
	const router = useRouter();

	const { realmCode, spaceCode } = getRealmSpaceCodes(route);

	const serverTimeIntervalId = ref(0);
	const serverTimeContent = ref(null);
	const confirmButtonLoader = ref(false);
	const isCopyMode = ref(false);
	const scheduleProcedureList = ref([]);
	const scheduleItem = ref({
		name: '',
		user_code: '',
		configuration_code: '',
		notes: '',
		error_handler: '',
		procedures: [],
		is_enabled: true
	});

	const periodicityOptions = [
		{ title: 'Daily', value: '1' },
		{ title: 'Weekly', value: '2' },
		{ title: 'Monthly', value: '3' }
	];

	const errorHandlerOptions = [
		{ title: 'Continue', value: 'continue' },
		{ title: 'Break on first error', value: 'break' }
	];

	const days = ref([
		{ title: 'Monday', status: false },
		{ title: 'Tuesday', status: false },
		{ title: 'Wednesday', status: false },
		{ title: 'Thursday', status: false },
		{ title: 'Friday', status: false },
		{ title: 'Saturday', status: false },
		{ title: 'Sunday', status: false }
	]);

	const monthsOptions = ref([
		{ title: 'January', value: '1' },
		{ title: 'February', value: '2' },
		{ title: 'March', value: '3' },
		{ title: 'April', value: '4' },
		{ title: 'May', value: '5' },
		{ title: 'June', value: '6' },
		{ title: 'July', value: '7' },
		{ title: 'August', value: '8' },
		{ title: 'September', value: '9' },
		{ title: 'November', value: '10' },
		{ title: 'October', value: '11' },
		{ title: 'December', value: '12' }
	]);

	const cron = ref({
		periodicity: '1',
		day: [],
		month: [],
		time: dayjs(new Date()).format('HH:mm')
	});

	const crumbs = [
		{ title: 'Pricing Schedules', path: 'schedule' },
		{ title: 'New', path: 'new' }
	];

	const formData = ref({
		name: {
			isDirty: false,
			isValid: true
		},
		user_code: {
			isDirty: false,
			isValid: true
		},
		configuration_code: {
			isDirty: false,
			isValid: true
		}
	});

	const isDirty = computed(() => Object.values(formData.value).some((i) => i.isDirty));

	const isValid = computed(() => !Object.values(formData.value).some((i) => !i.isValid));

	const isFormValid = computed(() => {
		return !!(
			scheduleItem.value.name &&
			scheduleItem.value.user_code &&
			scheduleItem.value.configuration_code &&
			formData.value.user_code.isValid &&
			formData.value.configuration_code.isValid
		);
	});

	const handleCrumbs = (newCrumbs, newPath) => {
		router.push(`/${realmCode}/${spaceCode}/v/system` + newPath);
	};

	const addNewScheduleProcedure = () => {
		scheduleProcedureList.value.push({
			type: '',
			user_code: '',
			order: scheduleProcedureList.value.length
		});
	};

	const removeScheduleProcedure = (procedures) => {
		scheduleProcedureList.value = procedures;
	};

	const updateScheduleProcedure = (list) => {
		scheduleProcedureList.value = list;
	};

	const resetCronExpr = () => {
		cron.value.day = [];
		cron.value.month = [];
	};

	const setDay = () => {
		cron.value.day = days.value
			.map((day, index) => (day.status ? index + 1 : null))
			.filter(Boolean);
	};

	const getRange = (num) =>
		Array.from({ length: num }, (_, i) => ({
			title: (i + 1).toString(),
			value: (i + 1).toString()
		}));

	const updateServerTime = () => {
		if (serverTimeContent.value) {
			serverTimeContent.value.textContent = new Date().toISOString().split('T')[1].split('.')[0];
		}
	};

	function validateForm() {
		Object.keys(formData.value).forEach((field) => {
			if (!formData.value[field].skipValidation) {
				formData.value[field].isValid = !!scheduleItem.value[field];
			}
		});
	}

	function updateField(field, value) {
		if (formData.value[field] && !formData.value[field].isDirty) {
			formData.value[field].isDirty = true;
		}
		set(scheduleItem.value, field, value);
		validateForm();
	}

	function closeItem() {
		scheduleItem.value = {};
		scheduleProcedureList.value = [];
		confirmButtonLoader.value = false;
		if (isCopyMode.value) {
			window.open('', '_self', '');
			window.close();
			isCopyMode.value = false;
			return;
		}
		router.back();
	}

	async function createItem() {
		confirmButtonLoader.value = true;
		scheduleItem.value.is_enabled = true;
		scheduleItem.value.procedures = scheduleProcedureList.value;

		const now = dayjs();
		const fullDate = dayjs(`${now.format('YYYY-MM-DD')} ${cron.value.time}`, 'YYYY-MM-DD HH:mm');

		const minutes = dayjs(new Date(fullDate)).format('mm');
		const hours = dayjs(new Date(fullDate)).format('HH');

		cron.value.periodicity = parseInt(cron.value.periodicity, 10);

		if (cron.value.periodicity === 1) {
			scheduleItem.value.cron_expr = parseInt(minutes) + ' ' + parseInt(hours) + ' * * *';
		}
		if (cron.value.periodicity === 2) {
			scheduleItem.value.cron_expr = parseInt(minutes) + ' ' + parseInt(hours) + ' * * ' + cron.value.day.join(',');
		}
		if (cron.value.periodicity === 3) {
			scheduleItem.value.cron_expr = parseInt(minutes) + ' ' + parseInt(hours) + ' ' + cron.value.day.join(',') + ' ' + cron.value.month.join(',') + ' *';
		}

		const payload = {
			body: scheduleItem.value
		};
		const res = await useApi('schedule.post', payload);
		if (res && res._$error) {
			useNotify({ type: 'error', title: res._$error.error.message || res._$error.error?.details?.errors?.[0].detail?.toUpperCase() });
		} else {
			useNotify({
				type: 'success',
				title: 'Execute is being processed'
			});
			router.back();
		}
		confirmButtonLoader.value = false;
	}

	watch(() => cron.value.month, (newMonth) => {
		if (!newMonth.length) {
			cron.value.day = [];
		}
	}, { deep: true });

	onMounted(() => {
		serverTimeIntervalId.value = setInterval(updateServerTime, 1000);
		const data = JSON.parse(localStorage.getItem('scheduleProcedureData'));
		if (!data) {
			isCopyMode.value = false;
			return;
		}
		scheduleItem.value = cloneDeep(data);
		scheduleProcedureList.value = cloneDeep(data.procedures);
		scheduleItem.value.user_code += '_copy';
		localStorage.removeItem('scheduleProcedureData');
		isCopyMode.value = true;
	});

	onUnmounted(() => {
		if (serverTimeIntervalId.value) {
			clearInterval(serverTimeIntervalId.value);
		}
	});
</script>

<style scoped lang="scss">
	.schedule-card {
		border-radius: var(--spacing-4);
		border: 1px solid var(--card-border-color);
		background: var(--card-background-color);
		padding: var(--spacing-12);
		margin: var(--spacing-8) var(--spacing-16);
	}

	.code-wrapper {
		position: relative;
		width: 100%;
		padding: 16px 12px;
		border-radius: 8px;
		border: 1px solid var(--outline-variant);
		margin-bottom: var(--spacing-16);
	}

	textarea {
		border-radius: var(--spacing-4);
		padding: var(--spacing-8);
		border: 1px solid var(--card-border-color);
	}

	.code-expr {
		width: 100%;
		max-width: 50%;
	}
</style>
