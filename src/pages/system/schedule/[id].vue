<template>
	<div>
		<div class="py-3 px-8">
			<FmBreadcrumbs :crumbs="crumbs" @update-crumbs="handleCrumbs" />
		</div>
		<div v-if="isLoading" class="flex w-full justify-center items-center min-h-36">
			<FmProgressCircular :size="40" indeterminate />
		</div>
		<template v-else>
			<div class="py-3 px-8 flex flex-column gap-2">
				<div class="code-wrapper">
					<UserCodeInput
						:user-code="scheduleItem.user_code"
						@update:user-code="updateField('user_code', $event)"
						@update:configuration-code="
						updateField('configuration_code', $event)
					"
						@update:valid="updateUserCodeValidationValue"
					/>
				</div>
				<FmTextField
					:model-value="scheduleItem.name"
					outlined
					label="Name"
					:error="formData.name.isDirty && !formData.name.isValid"
					:error-messages="
						formData.name.isDirty && !formData.name.isValid
							? 'This field may not be blank.'
							: ''
					"
					@change="updateField('name', $event)"
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
					<div v-if="cron.periodicity === 2" class="px-8">
						<div class="grid grid-cols-7 gap-4">
							<div v-for="(day, index) in days" :key="index">
								<FmCheckbox
									v-model="day.status"
									:label="day.title"
									@update:modelValue="setDay(index +1)"
								/>
							</div>
						</div>
					</div>
					<div v-if="cron.periodicity === 3" class="px-8">
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
					<span><strong>Server time</strong>: <i>{{ getServerTime() }}</i></span>
				</div>
				<div class="flex flex-row nowrap items-center gap-2">
					<span><strong>Time: </strong></span>
					<FmInputTime v-model="cron.time" :minutes-step="1" outlined />
				</div>
				<div class="flex flex-col gap-4">
					<span><strong>Code Expression</strong></span>
					<div class="grid grid-cols-2">
						<FmTextField :model-value="scheduleItem.cron_expr" outlined />
					</div>
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
			<div class="py-3 flex flex-col gap-4 w-full h-full">
				<EntityJsonEditor
					v-if="isEditAsJson"
					:data="scheduleItem"
					entity-type="expression-procedure"
					@close="isEditAsJson = false"
					@update="editorUpdate"
				/>
			</div>
			<div class="flex items-center justify-start gap-4 py-8 px-8">
				<FmButton
					type="primary"
					@click="createItem"
					:loading="confirmButtonLoader"
					:disabled="!isFormValid"
					rounded
				>
					Create
				</FmButton>
				<FmButton type="primary" @click="makeCopy" rounded>
					Make a Copy
				</FmButton>
				<FmButton type="primary" @click="editAsJson" rounded>Edit as JSON</FmButton>
				<FmButton type="secondary" @click="closeItem" rounded>Close</FmButton>
			</div>
		</template>
	</div>
</template>

<script setup>
	import {
		FmBreadcrumbs,
		FmButton,
		FmCheckbox,
		FmSelect,
		FmTextField,
		FmInputTime, FmProgressCircular
	} from '@finmars/ui';
	import { getRealmSpaceCodes } from '~/pages/system/helper';
	import UserCodeInput from '~/components/common/UserCodeInput/UserCodeInput.vue';
	import Procedure from '~/pages/system/schedule/procedure/index.vue';
	import EntityJsonEditor from '~/components/modal/EntityJsonEditor/EntityJsonEditor.vue';
	import dayjs from 'dayjs';

	definePageMeta({
		middleware: 'auth'
	});

	const route = useRoute();
	const router = useRouter();

	const { realmCode, spaceCode } = getRealmSpaceCodes(route);

	const isLoading = ref(false);
	const isEditAsJson = ref(false);
	const confirmButtonLoader = ref(false);
	const scheduleProcedureList = ref([]);
	const scheduleItem = ref({});

	const periodicityOptions = ([
		{ title: 'Daily', value: 1 },
		{ title: 'Weekly', value: 2 },
		{ title: 'Monthly', value: 3 }
	]);
	const errorHandlerOptions = ([
		{ title: 'Continue', value: 'continue' },
		{ title: 'Break on first error', value: 'break' }
	]);
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
		{ title: 'January', value: 1 },
		{ title: 'February', value: 2 },
		{ title: 'March', value: 3 },
		{ title: 'April', value: 4 },
		{ title: 'May', value: 5 },
		{ title: 'June', value: 6 },
		{ title: 'July', value: 7 },
		{ title: 'August', value: 8 },
		{ title: 'September', value: 9 },
		{ title: 'November', value: 10 },
		{ title: 'October', value: 11 },
		{ title: 'December', value: 12 }
	]);

	const cron = ref(
		{
			periodicity: 1,
			day: [],
			month: [],
			time: dayjs(new Date()).format('HH:mm')
		}
	);

	const crumbs = [
		{ title: 'Pricing Schedules', path: 'schedule' },
		{ title: 'New', path: 'new' }
	];
	const formData = ref({
		name: {
			isDirty: false,
			isValid: true
		},
		configuration_code: {
			isDirty: false,
			skipValidation: true,
			isValid: true
		},
		user_code: {
			isDirty: false,
			skipValidation: true,
			isValid: true
		}
	});

	const isDirty = computed(() => Object.values(formData.value).some((i) => i.isDirty));

	const isValid = computed(() => !Object.values(formData.value).some((i) => !i.isValid));

	const isFormValid = computed(() => {
		return !!(
			scheduleItem.value.name?.length &&
			scheduleItem.value.user_code?.length &&
			scheduleItem.value.configuration_code?.length &&
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
		if (scheduleProcedureList.value) {
			scheduleProcedureList.value = procedures;
		}
	};

	const updateScheduleProcedure = (item) => {
		const obj = scheduleProcedureList.value.find(obj => obj === item);
		if (obj) {
			Object.assign(obj, item);
		}
	};

	const resetCronExpr = () => {
		cron.value.day = [];
		cron.value.month = [];
	};

	const getServerTime = () => {
		return new Date().toISOString().split('T')[1].split('.')[0];
	};

	const setDay = (day) => {
		if (!cron.value.day) {
			cron.value.day = [];
		}

		if (cron.value.day.indexOf(day) === -1) {
			cron.value.day.push(day);
		} else {
			cron.value.day = cron.value.day.filter((day_number) => {
				return day_number !== day;
			});
		}
	};

	const getRange = (num) => {
		const res = [];

		let i;
		for (i = 1; i <= num; i = i + 1) {
			res.push({ title: i.toString(), value: i });
		}
		return res;
	};

	function updateUserCodeValidationValue(val) {
		formData.value.user_code.isValid = val;
		formData.value.configuration_code.isValid = val;
	}

	function validateForm() {
		Object.keys(formData.value).forEach((field) => {
			if (!formData.value[field].skipValidation) {
				formData.value[field].isValid = !!scheduleItem.value[field];
			}
		});
	}

	function updateField(field, value) {
		scheduleItem.value[field] = value;
		!formData.value[field].isDirty &&
		(formData.value[field].isDirty = true);
		validateForm();
	}

	function closeItem() {
		router.back();
		scheduleItem.value = {};
		scheduleProcedureList.value = [];
		confirmButtonLoader.value = false;
	}

	function makeCopy() {
		localStorage.setItem('scheduleProcedureData', JSON.stringify(scheduleItem.value, null, 4));
		const newUrl = `/${route.params.realm_code}/${route.params.space_code}/v/system/schedule/new`;
		window.open(newUrl, '_blank');
	}

	function editAsJson() {
		isEditAsJson.value = true;
	}

	async function editorUpdate(data) {
		await init();
	}

	async function createItem() {
		confirmButtonLoader.value = true;
		scheduleItem.value.is_enabled = true;
		scheduleItem.value.procedures = scheduleProcedureList.value;

		// const now = dayjs();
		// const fullDate = dayjs(`${now.format('YYYY-MM-DD')} ${cron.value.time}`, 'YYYY-MM-DD HH:mm');
		//
		// const minutes = dayjs(new Date(fullDate)).format('mm');
		// const hours = dayjs(new Date(fullDate)).format('HH');
		//
		// cron.value.periodicity = parseInt(cron.value.periodicity, 10);
		//
		// if (cron.value.periodicity === 1) {
		// 	scheduleItem.value.cron_expr = parseInt(minutes) + ' ' + parseInt(hours) + ' * * *';
		// }
		// if (cron.value.periodicity === 2) {
		// 	scheduleItem.value.cron_expr = parseInt(minutes) + ' ' + parseInt(hours) + ' * * ' + cron.value.day.join(',');
		// }
		// if (cron.value.periodicity === 3) {
		// 	scheduleItem.value.cron_expr = parseInt(minutes) + ' ' + parseInt(hours) + ' ' + cron.value.day.join(',') + ' ' + cron.value.month.join(',') + ' *';
		// }

		const payload = {
			body: scheduleItem.value
		};
		const res = await useApi('schedule.post', payload);
		if (res && res._$error) {
			useNotify({ type: 'error', title: res._$error.message || res._$error.detail });
		} else {
			useNotify({
				type: 'success',
				title: 'Execute is being processed'
			});
			confirmButtonLoader.value = false;
			router.back();
		}
	}

	async function init() {
		isLoading.value = true;
		const res = await useApi('scheduleByKey.get', { params: { id: route.params.id } });
		if (res && res._$error) {
			useNotify({ type: 'error', title: res._$error.message || res._$error.detail });
		} else {
			scheduleItem.value = res;
			scheduleProcedureList.value = res.procedures;

			let values = scheduleItem.value.cron_expr.split(' ');

			if (values.length === 5){
				const time = new Date();
				time.setMinutes(values[0]);
				time.setHours(values[1]);
				cron.value.time = dayjs(time).format('HH:mm')

				if (values[3] === '*' && values[2] === '*') {
					cron.value.periodicity = 2;
					cron.value.day = values[4].split(',');
					cron.value.day.forEach((day) => {
						days.value[day - 1] = {status: true};
					})
				}

				if (values[4] === '*') {
					cron.value.periodicity = 3;
					cron.value.day = values[2].split(',');
					if (values[3].length > 1) {
						cron.value.month = values[3].split(',');
					} else {
						cron.value.month = [values[3]];
					}
				}

				if (values[4] === '*' && values[3] === '*' && values[2] === '*') {
					cron.value.periodicity = 1
				}
			}

			isLoading.value = false;
		}
	}

	init();
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
