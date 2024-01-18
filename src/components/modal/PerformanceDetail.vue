<template>
	<BaseModal :closingDisabled="creating" @update:modelValue="cancel">

		<div style="padding: 16px;">

			<p>
				Date Start: <b>{{ performanceDetails.begin_date }}</b>
			</p>
			<p>
				Date Start Nav: <b>{{ $format(performanceDetails.begin_nav) }}</b>
			</p>

			<p>
				Date End: <b>{{ performanceDetails.end_date }}</b>
			</p>

			<p>
				Date End NAV: <b>{{  $format(performanceDetails.end_nav) }}</b>
			</p>

			<p>
				Cash flow: <b>{{  $format(performanceDetails.grand_cash_flow) }}</b>
			</p>

			<p>
				Weighted Cash flow: <b>{{  $format(performanceDetails.grand_cash_flow_weighted) }}</b>
			</p>

			<p>
				Absolute P&L: <b>{{  $format(performanceDetails.grand_absolute_pl) }}</b>
			</p>

			<p>
				Return: <b>{{performanceDetails.grand_return * 100}}%</b>
			</p>
			<p>
				Period Type: <b>{{performanceDetails.period_type}}</b>
			</p>
			<p>
				Calculation Type: <b>{{performanceDetails.calculation_type}}</b>
			</p>
			<p>
				Report Currency: <b>{{performanceDetails.report_currency_object.name}}</b>
			</p>

		</div>


		<template #controls>
			<div class="flex-row fc-space-between">
				<FmBtn :disabled="creating" type="basic" @click="cancel">CANCEL</FmBtn>

			</div>
		</template>
	</BaseModal>
</template>

<script setup>

let props = defineProps({
	performanceDetails: Object,
})

let emit = defineEmits(['cancel', 'save'])

let readyStatus = ref(false)
let creating = ref(false)


function cancel() {


	emit('cancel')
}


async function init() {

}

init()
</script>

<style lang="scss" scoped>
.aprm_content {
	:deep(.base-input),
	:deep(.fm_select) {
		margin-bottom: 0;
	}
}
</style>
