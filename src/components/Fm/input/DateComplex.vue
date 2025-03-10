<template>
	<FmMenu
		:modelValue="menuIsOpened"
		attach="body"
		@update:opened="onPopupToggle"
		:closeOnClickOutside="false"
		v-bind="$attrs"
	>
		<template #btn>
			<BaseInput
				:label="label"
				:modelValue="selectedVal"
				:readonly="true"
				:errorData="error"
				class="cursor-pointer no-readonly-styles"
				:class="{ bi_no_borders: noBorders }"
			>
				<template v-if="!noBorders" #button>
					<FmBtn
						v-show="modeIsActive(['datepicker', 'expression'])"
						type="icon"
						icon="calendar_month"
					/>
				</template>

				<template v-if="noBorders" #rightBtn>
					<FmIcon
						:icon="
							menuIsOpened ? 'arrow_drop_up' : 'arrow_drop_down'
						"
					/>
				</template>
			</BaseInput>
		</template>

		<template #default="{ close }">
			<div :style="popupWidth">
				<div
					class="c_datepicker"
					:class="{ dates_range: rangeOfDates }"
				>
					<div class="flex-row">
						<div
							v-if="!rangeOfDates"
							class="complex-datepicker-left"
						>
							<div
								class="complex-datepicker-mode-container"
								:class="{
									active: modeIsActive([
										'datepicker',
										'expression'
									])
								}"
								@click="activateCustomMode()"
							>
								Custom
							</div>

							<div
								class="complex-datepicker-mode-container"
								:class="{ active: modeIsActive('today') }"
								@click="activateMode('today')"
							>
								Today
							</div>

							<div
								class="complex-datepicker-mode-container"
								:class="{
									active: modeIsActive('yesterday-business')
								}"
								@click="activateMode('yesterday-business')"
							>
								Yesterday (Business)
							</div>

							<!--<div class="complex-datepicker-mode-container"
									 :class="{'active': modeIsActive('inception')}"
									 @click="activateMode('inception')">All time</div>-->
						</div>

						<div
							v-if="rangeOfDates"
							class="complex-datepicker-left"
						>
							<div
								class="complex-datepicker-mode-container"
								:class="{
									active: modeIsActive([
										'datepicker',
										'expression'
									])
								}"
								@click="activateCustomMode()"
							>
								Custom
							</div>

							<div
								class="complex-datepicker-mode-container"
								:class="{
									active: modeIsActive('week-to-date')
								}"
								@click="activateRangeMode('week-to-date')"
							>
								WTD
							</div>

							<div
								class="complex-datepicker-mode-container"
								:class="{
									active: modeIsActive('month-to-date')
								}"
								@click="activateRangeMode('month-to-date')"
							>
								MTD
							</div>

							<div
								class="complex-datepicker-mode-container"
								:class="{
									active: modeIsActive('quarter-to-date')
								}"
								@click="activateRangeMode('quarter-to-date')"
							>
								QTD
							</div>

							<div
								class="complex-datepicker-mode-container"
								:class="{
									active: modeIsActive('year-to-date')
								}"
								@click="activateRangeMode('year-to-date')"
							>
								YTD
							</div>

							<div
								class="complex-datepicker-mode-container"
								:class="{ active: modeIsActive('inception') }"
								@click="activateRangeMode('inception')"
							>
								All time
							</div>
						</div>

						<div class="flex-column">
							<div
								class="flex-row m-b-10"
								style="margin-left: 18px"
							>
								<div
									class="date-input-holder"
									:class="{
										'expression-mode':
											fdOptions.datepickerMode ===
											'expression'
									}"
								>
									<div
										v-if="
											fdOptions.datepickerMode !==
											'inception'
										"
									>
										<FmInputDate
											:modelValue="fDate"
											:disabled="firstDateIsDisabled"
											class="bi_no_margins"
											@update:modelValue="
												onFirstDateInputChange
											"
										>
											<template #button>
												<FmBtn
													v-show="
														modeIsActive([
															'datepicker',
															'expression'
														])
													"
													type="icon"
													class="expression-builder-btn"
													:disabled="
														firstDateIsDisabled
													"
													@click="openFirstEe = true"
												>
													<!--													<img
																											v-show="modeIsActive(['datepicker', 'expression'])"
																											class="btn-icon"
																											src="~/assets/img/fx-icon.png"
																											alt="function"
																										/>-->
													<FmIcon icon="functions" />
												</FmBtn>
											</template>
										</FmInputDate>
									</div>

									<div
										v-if="
											fdOptions.datepickerMode ===
											'inception'
										"
									>
										<p class="complex-datepicker-text">
											Inception
										</p>
									</div>
								</div>

								<div
									v-if="rangeOfDates"
									class="flex-row fi-center"
								>
									<div
										class="complex-datepicker-date-fields-divider"
									>
										-
									</div>

									<div
										class="date-input-holder"
										:class="{
											'expression-mode':
												sdOptions.datepickerMode ===
												'expression'
										}"
									>
										<!--											<button v-show="modeIsActive(['datepicker', 'expression'])"
														class="expression-builder-btn"
														ng-click="openEditExpressionDialog($event, 2)">
											<img class="btn-icon" src="shell/content/img/fx-icon.png" alt="function">
										</button>-->

										<FmInputDate
											:modelValue="sDate"
											:disable="secondDateIsDisabled"
											@update:modelValue="
												onSecondDateInputChange
											"
										>
											<template #button>
												<FmBtn
													v-show="
														modeIsActive([
															'datepicker',
															'expression'
														])
													"
													type="icon"
													class="expression-builder-btn"
													:disabled="
														secondDateIsDisabled
													"
													@click="openSecondEe = true"
												>
													<!--													<img
																											v-show="modeIsActive(['datepicker', 'expression'])"
																											class="btn-icon"
																											src="~/assets/img/fx-icon.png"
																											alt="function"
																										/>-->
													<FmIcon icon="functions" />
												</FmBtn>
											</template>
										</FmInputDate>
									</div>
								</div>
							</div>

							<div class="flex-row">
								<div
									:ref="initFirstDatepicker"
									class="datepicker-container"
									:class="{
										empty: fDate === null,
										disabled: firstDateIsDisabled
									}"
								></div>

								<div
									v-if="rangeOfDates"
									:ref="initSecondDatepicker"
									class="datepicker-container"
									:class="{
										empty: sDate === null,
										disabled: secondDateIsDisabled
									}"
								></div>
							</div>
						</div>
					</div>
				</div>

				<div class="flex-row fc-end fi-center c_datepicker_footer">
					<FmBtn
						type="text"
						class="m-r-8 m-l-8"
						@click="cancel(close)"
						>CANCEL
					</FmBtn>
					<FmBtn
						type="primary"
						class="m-r-8 m-l-8"
						@click="save(close)"
						>SAVE
					</FmBtn>
				</div>
			</div>
		</template>
	</FmMenu>

	<FmExpression
		v-model="openFirstEe"
		:expressions="fdOptions.expression"
		@save="
			(val) => {
				applyExpression(1, val);
				openFirstEe = false;
			}
		"
		@cancel="openFirstEe = false"
	/>

	<FmExpression
		v-if="rangeOfDates"
		v-model="openSecondEe"
		:expressions="sdOptions.expression"
		@save="(val) => applyExpression(2, val)"
		@cancel="openSecondEe = false"
	/>
</template>

<script setup>
	import dayjs from 'dayjs';

	let props = defineProps({
		firstDate: String,
		firstDatepickerOptions: {
			type: Object,
			default() {
				return { datepickerMode: 'yesterday-business' };
			}
		},
		secondDate: String,
		secondDatepickerOptions: {
			type: Object,
			default() {
				return { datepickerMode: 'datepicker' };
			}
		},
		label: String,
		noBorders: Boolean,
		errorData: Object
	});

	let emit = defineEmits([
		'update:firstDate',
		'update:firstDatepickerOptions',
		'update:secondDate',
		'update:secondDatepickerOptions',
		'update:errorData'
	]);

	let rangeOfDates = ref(props.secondDate !== undefined);

	const popupWidth = rangeOfDates.value ? 'width: 896px;' : 'width: 562px;';
	let menuIsOpened = ref(false);

	let firstDateIsDisabled = ref(false);
	let secondDateIsDisabled = ref(false);

	let openFirstEe = ref(false);

	let localErrorData = ref(null); // when props.errorData not used

	let firstCalendar = ref(null);
	let secondCalendar = ref(null);

	let pickmeupOptions = {
		default_date: false,
		flat: true,
		class_name: 'fm_cd_pickmeup'
	};

	if (rangeOfDates.value) pickmeupOptions.render = dayRenderFn;

	function convertDate(date) {
		return useDateStringIsValid(date) ? new Date(date) : null;
	}

	let fDate = ref(props.firstDate);

	let firstDateConv = computed(() => convertDate(fDate.value));

	let selectedVal;

	if (!rangeOfDates.value) {
		selectedVal = computed(() => {
			return useDateStringIsValid(props.firstDate) ? props.firstDate : '';
		});
	}

	let error = computed({
		set(newVal) {
			localErrorData.value = newVal
				? JSON.parse(JSON.stringify(newVal))
				: newVal;
			emit('update:errorData', newVal);
		},
		get() {
			return props.errorData ? props.errorData : localErrorData.value;
		}
	});

	watch(
		() => props.firstDate,
		() => {
			fDate.value = props.firstDate;

			if (firstCalendar.value) {
				const datepickerVal = dayjs(
					props.firstDate,
					'YYYY-MM-DD',
					true
				).isValid()
					? props.firstDate
					: undefined;
				usePickmeup(firstCalendar.value).set_date(datepickerVal);
			}
		}
	);

	let fdOptions = ref(
		JSON.parse(JSON.stringify(props.firstDatepickerOptions))
	);

	if (!fdOptions.value.datepickerMode)
		fdOptions.value.datepickerMode = 'yesterday-business';

	/*watch(
		() => props.firstDatepickerOptions,
		() => {
			fdOptions.value = JSON.parse(JSON.stringify(props.firstDatepickerOptions))
			if (!fdOptions.value.datepickerMode)
				fdOptions.value.datepickerMode = 'yesterday-business'
		}
	)*/

	//# region For second date in range of dates
	let sDate = ref(props.secondDate);
	let sdOptions = ref(null);

	if (rangeOfDates.value) {
		sdOptions.value = JSON.parse(
			JSON.stringify(props.secondDatepickerOptions)
		);
	}

	let openSecondEe = ref(false);

	let secondDateConv = computed(() => convertDate(sDate.value));

	if (rangeOfDates.value) {
		selectedVal = computed(() => {
			let val = '';

			if (useDateStringIsValid(fDate.value)) {
				val = fDate.value;
			}

			if (useDateStringIsValid(sDate.value)) {
				val = val + ' - ' + sDate.value;
			}

			return val;
		});

		watch(
			() => props.secondDate,
			() => {
				sDate.value = props.secondDate;

				if (secondCalendar.value) {
					const datepickerVal = useDateStringIsValid(sDate.value)
						? sDate.value
						: undefined;
					usePickmeup(secondCalendar.value).set_date(datepickerVal);
				}
			}
		);
	}

	//# endregion

	function initFirstDatepicker(el) {
		firstCalendar.value = el;

		if (firstCalendar.value && !firstCalendar.value.__pickmeup) {
			// check that pickmeup did not already initialize
			initCalendar(1);
		}
	}

	function initSecondDatepicker(el) {
		secondCalendar.value = el;

		if (secondCalendar.value && !secondCalendar.value.__pickmeup) {
			// check that pickmeup did not already initialize
			initCalendar(2);
		}
	}

	async function applyExpression(dateNumber, expression) {
		fdOptions.value.expression = expression;

		// if no expression entered, turn off expression mode
		fdOptions.value.datepickerMode = 'datepicker';

		if (!fdOptions.value.expression) return;

		fdOptions.value.datepickerMode = 'expression';

		try {
			const res = await calcExpression(fdOptions.value.expression);

			if (useDateStringIsValid(res)) {
				if (dateNumber === 1) {
					fDate.value = res;

					usePickmeup(firstCalendar.value).set_date(
						firstDateConv.value
					);

					if (rangeOfDates.value)
						usePickmeup(secondCalendar.value).update();
				} else {
					sDate.value = res;

					usePickmeup(secondCalendar.value).set_date(
						secondDateConv.value
					);
					usePickmeup(firstCalendar.value).update();
				}
			} else {
				const errorMessage = `Invalid ${
					dateNumber === 2 ? 'second' : 'first'
				} date`;
				useNotify({ type: 'error', title: errorMessage });
			}
		} catch (e) {
			const errorMessage = `Invalid expression for ${
				dateNumber === 2 ? 'second' : 'first'
			} date`;
			useNotify({ type: 'error', title: errorMessage });
		}
	}

	function modeIsActive(modeNames) {
		if (Array.isArray(modeNames)) {
			return modeNames.includes(fdOptions.value.datepickerMode);
		}

		return modeNames === fdOptions.value.datepickerMode;
	}

	function activateCustomMode() {
		if (!modeIsActive(['datepicker', 'expression'])) {
			fdOptions.value.datepickerMode = fdOptions.value.expression
				? 'expression'
				: 'datepicker';
			firstDateIsDisabled.value = false;

			if (rangeOfDates.value) {
				secondDateIsDisabled.value = false;
			}
		}
	}

	function applyFirstDate(date) {
		fDate.value = dayjs(date).format('YYYY-MM-DD');
		usePickmeup(firstCalendar.value).set_date(date);
	}

	const applySecondDate = function (date) {
		sDate.value = dayjs(date).format('YYYY-MM-DD');
		usePickmeup(secondCalendar.value).set_date(date);
	};

	function applyDatesOnRangeModeSwitch(
		firstDate,
		firstExpression,
		secondDate,
		secondExpression,
		mode
	) {
		applyFirstDate(firstDate);

		fdOptions.value.datepickerMode = mode;
		fdOptions.value.expression = firstExpression;

		applySecondDate(secondDate);

		sdOptions.value.datepickerMode = mode;
		sdOptions.value.expression = secondExpression;

		firstDateIsDisabled.value = true;
		secondDateIsDisabled.value = true;
	}

	function onFirstDateInputChange(date) {
		fDate.value = date;

		if (useDateStringIsValid(date)) {
			usePickmeup(firstCalendar.value).set_date(fDate.value);
			if (rangeOfDates.value) usePickmeup(secondCalendar.value).update();

			// if previously date was taken from expression, and now date field changed
			fdOptions.value.datepickerMode = 'datepicker';
		} else {
			usePickmeup(firstCalendar.value).set_date();
		}
	}

	function onSecondDateInputChange(date) {
		sDate.value = date;

		if (useDateStringIsValid(date)) {
			usePickmeup(firstCalendar.value).update();
			usePickmeup(secondCalendar.value).set_date(sDate.value);

			// if previously date was taken from expression, and now date field changed
			sdOptions.value.datepickerMode = 'datepicker';
		} else {
			usePickmeup(secondCalendar.value).set_date();
		}
	}

	async function calcExpression(expression) {
		const opts = {
			body: {
				is_eval: true,
				expression: expression
			}
		};

		let res = await useApi('expression.post', opts);

		if (res._$error) throw new Error(res._$error);

		return res.result;
	}

	async function activateRangeMode(mode) {
		const currentDate = new Date();

		switch (mode) {
			case 'week-to-date':
				// eslint-disable-next-line no-case-declarations
				let prevWeekLastDay;

				// eslint-disable-next-line no-useless-catch
				try {
					const exprCalcRes = await calcExpression(
						'get_date_last_week_end_business(now())'
					);

					prevWeekLastDay = new Date(exprCalcRes.result);
				} catch (error) {
					throw error;
				}

				applyDatesOnRangeModeSwitch(
					prevWeekLastDay,
					'get_date_last_week_end_business(now())',
					currentDate,
					'now()',
					'week-to-date'
				);

				break;

			case 'month-to-date':
				// eslint-disable-next-line no-case-declarations
				let prevMonthLastBDay;

				try {
					/*const exprCalcRes = await calcExpression(
						'get_date_last_month_end_business(now())'
					)*/

					const opts = {
						body: {
							date: dayjs(currentDate).format('YYYY-MM-DD'),
							frequency: 'M',
							shift: -1,
							is_only_bday: true,
							start: false
						}
					};

					const exprCalcRes = await useApi(
						'exprCalcPeriodDate.post',
						opts
					);

					prevMonthLastBDay = new Date(exprCalcRes.result);
				} catch (error) {
					throw new Error(error);
				}

				/* applyFirstDate(lastDayOfPrevMonth);

				scope.datepickerOptions.datepickerMode = 'month-to-date';
				scope.datepickerOptions.expression = 'get_date_last_month_end_business(now())';
				//</editor-fold>

				//<editor-fold desc="Second date">
				applySecondDate(currentDate);

				scope.secondDatepickerOptions.datepickerMode = 'month-to-date';
				scope.secondDatepickerOptions.expression = 'now()';
				//</editor-fold>

				disableFieldsAndCalendars(); */
				applyDatesOnRangeModeSwitch(
					prevMonthLastBDay,
					'calculate_period_date(now(), "M", -1, True, False)',
					currentDate,
					'now()',
					'month-to-date'
				);

				break;

			case 'quarter-to-date':
				// eslint-disable-next-line no-case-declarations
				let prevQuarterLastDay;

				try {
					const exprCalcRes = await calcExpression(
						'get_date_last_quarter_end_business(now())'
					);
					prevQuarterLastDay = new Date(exprCalcRes.result);
				} catch (error) {
					throw new Error(error);
				}

				/* applyFirstDate(lastDayOfCurrentMonth);

				scope.datepickerOptions.datepickerMode = 'month-to-date';
				scope.datepickerOptions.expression = 'get_date_last_month_end_business(now())';
				//</editor-fold>

				//<editor-fold desc="Second date">
				applySecondDate(currentDate);

				scope.secondDatepickerOptions.datepickerMode = 'month-to-date';
				scope.secondDatepickerOptions.expression = 'now()';
				//</editor-fold>

				disableFieldsAndCalendars(); */
				applyDatesOnRangeModeSwitch(
					prevQuarterLastDay,
					'get_date_last_quarter_end_business(now())',
					currentDate,
					'now()',
					'quarter-to-date'
				);

				break;

			case 'year-to-date':
				/* const firstDayOfCurrentYear = new Date(currentDate.getFullYear(), 0, 1);

				//<editor-fold desc="First date">
				applyFirstDate(firstDayOfCurrentYear);

				scope.datepickerOptions.datepickerMode = 'year-to-date';
				scope.datepickerOptions.expression = '';
				//</editor-fold>

				//<editor-fold desc="Second date">
				applySecondDate(currentDate);

				scope.secondDatepickerOptions.datepickerMode = 'year-to-date';
				scope.secondDatepickerOptions.expression = 'now()';
				//</editor-fold>

				disableFieldsAndCalendars(); */
				// eslint-disable-next-line no-case-declarations
				let prevYearLastDay;

				try {
					const exprCalcRes = await calcExpression(
						'get_date_last_year_end_business(now())'
					);
					prevYearLastDay = new Date(exprCalcRes.result);
				} catch (error) {
					throw new Error(error);
				}

				applyDatesOnRangeModeSwitch(
					prevYearLastDay,
					'get_date_last_year_end_business(now())',
					currentDate,
					'now()',
					'year-to-date'
				);

				break;

			case 'inception':
				//<editor-fold desc="First date">
				applyFirstDate(new Date('0001-01-01'));

				fdOptions.value.datepickerMode = 'inception';
				fdOptions.value.expression = '';
				//</editor-fold>

				//<editor-fold desc="Second date">
				applySecondDate(currentDate);

				sdOptions.value.datepickerMode = 'inception';
				sdOptions.value.expression = 'now()';
				//</editor-fold>

				firstDateIsDisabled.value = true;
				secondDateIsDisabled.value = true;

				break;
		}

		resetPmuCalendars();
	}

	function resetPmuCalendars() {
		usePickmeup(firstCalendar.value).destroy(); // redraw calendar after mode switch

		const options = {
			...{ date: new Date(fDate.value) },
			...pickmeupOptions
		};

		usePickmeup(firstCalendar.value, options);

		if (rangeOfDates.value) {
			usePickmeup(secondCalendar.value).destroy(); // redraw calendar after mode switch

			const sOptions = {
				...{ date: new Date(sDate.value) },
				...pickmeupOptions
			};

			usePickmeup(secondCalendar.value, sOptions);
		}
	}

	async function activateMode(mode) {
		switch (mode) {
			case 'today':
				fdOptions.value.datepickerMode = 'today';
				fdOptions.value.expression = 'now()';

				fDate.value = dayjs(new Date()).format('YYYY-MM-DD'); // today's date

				usePickmeup(firstCalendar.value).set_date(
					new Date(fDate.value)
				);

				firstDateIsDisabled.value = true;

				break;

			case 'yesterday-business':
				// eslint-disable-next-line no-useless-catch
				try {
					fDate.value = await calcExpression(
						'last_business_day(now()-days(1))'
					);

					usePickmeup(firstCalendar.value).set_date(
						new Date(fDate.value)
					);
				} catch (error) {
					throw error;
				}

				fdOptions.value.datepickerMode = 'yesterday-business';
				fdOptions.value.expression = 'last_business_day(now()-days(1))';

				firstDateIsDisabled.value = true;

				break;

			/* case 'inception':

				fdOptions.value.datepickerMode = 'inception';
				fdOptions.value.expression = '';

				fDate.value = '0001-01-01';

				usePickmeup(firstCalendar.value).set_date(new Date(props.firstDate));

				firstDateIsDisabled.value = true;

				break; */
		}

		resetPmuCalendars();
	}

	function onFirstPickmeupChange(event) {
		document.activeElement.blur();

		fDate.value = event.detail.formatted_date;
		fdOptions.value.datepickerMode = 'datepicker';

		// update highlighted dates inside another calendar
		if (rangeOfDates.value) usePickmeup(secondCalendar.value).update();
	}

	function onSecondPickmeupChange(event) {
		document.activeElement.blur();

		sDate.value = event.detail.formatted_date;
		sdOptions.value.datepickerMode = 'datepicker';

		// update highlighted dates inside another calendar
		if (rangeOfDates.value) usePickmeup(firstCalendar.value).update();
	}

	function initCalendar(calendarNumber) {
		let date = calendarNumber === 1 ? fDate.value : sDate.value;
		let calendarElem =
			calendarNumber === 1 ? firstCalendar.value : secondCalendar.value;

		const pOpts = {
			...{ date: new Date(date) },
			...pickmeupOptions
		};

		usePickmeup(calendarElem, pOpts);

		if (calendarNumber === 1) {
			calendarElem.addEventListener(
				'pickmeup-change',
				onFirstPickmeupChange
			);
		} else {
			calendarElem.addEventListener(
				'pickmeup-change',
				onSecondPickmeupChange
			);
		}
	}

	function dayRenderFn(date) {
		if (firstDateConv.value && secondDateConv.value) {
			const dateFrom =
				firstDateConv.value > secondDateConv.value
					? secondDateConv.value
					: firstDateConv.value;
			const dateTo =
				firstDateConv.value > secondDateConv.value
					? firstDateConv.value
					: secondDateConv.value;

			const ymdDate = dayjs(date).format('YYYY-MM-DD');

			if (
				ymdDate === dayjs(dateFrom).format('YYYY-MM-DD') &&
				ymdDate === dayjs(dateTo).format('YYYY-MM-DD')
			) {
				return { class_name: 'custom-pmu-day-in-range' };
			} else if (ymdDate === dayjs(dateFrom).format('YYYY-MM-DD')) {
				return {
					class_name: 'custom-pmu-date-from custom-pmu-day-in-range'
				};
			} else if (ymdDate === dayjs(dateTo).format('YYYY-MM-DD')) {
				return {
					class_name: 'custom-pmu-date-to custom-pmu-day-in-range'
				};
			}

			if (dateFrom < date && date < dateTo) {
				return { class_name: 'custom-pmu-day-in-range' };
			}
		}

		return {};
	}

	function save(closeMenu) {
		if (fdOptions.value.datepickerMode === 'datepicker') {
			delete fdOptions.value.expression;
		}

		if (rangeOfDates.value) {
			if (!fDate.value && sDate.value) fDate.value = sDate.value;

			if (!sDate.value && fDate.value) sDate.value = fDate.value;

			if (sdOptions.value.datepickerMode === 'datepicker') {
				delete sdOptions.value.expression;
			}

			if (new Date(sDate.value) > new Date(fDate.value)) {
				emit('update:firstDate', fDate.value);
				emit('update:firstDatepickerOptions', fdOptions.value);

				emit('update:secondDate', sDate.value);
				emit('update:secondDatepickerOptions', sdOptions.value);
			} else {
				// if the second date later than the first, switch them

				emit('update:firstDate', sDate.value);
				emit('update:firstDatepickerOptions', sdOptions.value);

				emit('update:secondDate', fDate.value);
				emit('update:secondDatepickerOptions', fdOptions.value);
			}
		} else {
			emit('update:firstDate', fDate.value);
			emit('update:firstDatepickerOptions', fdOptions.value);
		}

		closeMenu();
	}

	function cancel(closeMenu) {
		fDate.value = props.firstDate;
		fdOptions.value = JSON.parse(
			JSON.stringify(props.firstDatepickerOptions)
		);

		if (rangeOfDates.value) {
			sDate.value = props.secondDate;
			sdOptions.value = JSON.parse(
				JSON.stringify(props.secondDatepickerOptions)
			);
		}

		closeMenu();
	}

	function init() {
		fdOptions.value = JSON.parse(
			JSON.stringify(props.firstDatepickerOptions)
		);

		if (!fdOptions.value.datepickerMode) {
			fdOptions.value.datepickerMode = 'yesterday-business';
		}

		firstDateIsDisabled.value = false;

		if (rangeOfDates.value) {
			sdOptions.value = JSON.parse(
				JSON.stringify(props.secondDatepickerOptions)
			);

			secondDateIsDisabled.value = false;

			const disableInputAndCalendar = [
				'month-to-date',
				'quarter-to-date',
				'year-to-date',
				'inception'
			].includes(props.firstDatepickerOptions.datepickerMode);

			if (disableInputAndCalendar) {
				firstDateIsDisabled.value = true;
				secondDateIsDisabled.value = true;
			}
		} else {
			const disableInputAndCalendar = [
				'today',
				'yesterday-business',
				'inception'
			].includes(props.firstDatepickerOptions.datepickerMode);

			if (disableInputAndCalendar) {
				firstDateIsDisabled.value = true;
			}
		}
	}

	function onPopupToggle(newVal) {
		if (newVal) {
			// opening popup
			init();
		}

		menuIsOpened.value = newVal;
	}
</script>

<style lang="scss" scoped>
	$border-darken: #b3b3b3;

	:deep(.bi_main_input) {
		font-size: 14px;
	}

	.c_datepicker_footer {
		height: 60px;
		border-top: solid 2px var(--table-border-color);
	}

	.c_datepicker {
		width: 562px;

		.complex-datepicker-left {
			padding-top: 5px;
			width: 228px;
			border-right: solid 2px var(--table-border-color);
			box-sizing: border-box;

			.complex-datepicker-mode-container {
				height: 48px;
				display: flex;
				flex-direction: column;
				justify-content: center;
				border-left: 8px solid transparent;
				border-top: 1px solid transparent;
				border-bottom: 1px solid transparent;
				padding-left: 12px;
				cursor: pointer;

				&.active {
					border-left-color: var(--primary-color);
					border-top-color: var(--table-border-color);
					border-bottom-color: var(--table-border-color);
					background-color: var(--activeState-backgroundColor);
				}

				&:hover {
					background-color: var(--activeState-backgroundColor);
				}

				&:focus {
					outline: none;
				}
			}
		}

		.complex-datepicker-date-fields-divider {
			position: relative;
			bottom: 8px;
			margin: 0 9px;
		}

		.date-input-holder {
			position: relative;
			width: 145px;

			.expression-builder-btn {
				/*position: absolute;
				width: 24px;
				min-width: 24px;
				height: 24px;
				min-height: 24px;
				padding: 0;
				margin: 0;
				top: 8px;
				left: 0;
				fill: #7d7d7d;
				color: #7d7d7d;
				z-index: 1;

				&:disabled {
					opacity: .5;
				}*/
				width: 24px;
				min-width: 24px;
				height: 24px;
				min-height: 24px;
				line-height: 0;

				img.btn-icon {
					width: 23px;
					height: 20px;
					opacity: 0.63;
					image-rendering: -webkit-optimize-contrast;
				}
			}
		}

		.date-input-container {
			/*.custom-input-borders {
				border: none;
				border-bottom: 1px solid $border-darken;
				border-radius: 0;
				padding-bottom: 1px;
			}*/

			.date-input {
				padding-left: 32px;
			}

			.custom-input-bottom-error-text {
				display: none;
			}

			/*&.custom-input-focused {
				.custom-input-main-container {
					.custom-input-borders {
						box-shadow: none;
						padding-bottom: 0;
						border-bottom-width: 2px;
						border-bottom-color: $orange;
					}
				}
			}*/
		}

		.complex-datepicker-text {
			display: flex;
			flex-direction: column;
			justify-content: center;
			height: 40px;
			border-bottom: 1px solid $border-darken;
			padding-left: 32px;
			// margin: 0 0 13px;
			margin: 0;
			opacity: 0.5;
			box-sizing: border-box;
			pointer-events: none;
		}

		.date-input-holder.expression-mode {
			:deep(.bi_main_input:not([disabled])) {
				color: var(--primary-color);
			}
		}
	}

	.c_datepicker.dates_range {
		width: 896px;
	}

	.datepicker-container.disabled {
		pointer-events: none;
		opacity: 0.5;
	}
</style>
