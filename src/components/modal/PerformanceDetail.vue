<template>
	<BaseModal :closingDisabled="creating" @update:modelValue="cancel">

		<div style="padding: 16px;">

			<table style="width: 100%;">
				<tr>
					<td>Date Start:</td>
					<td class="text-right"><b>{{ performanceDetails.begin_date }}</b><FmCopyButton :text="performanceDetails.begin_date"></FmCopyButton></td>
				</tr>
				<tr>
					<td>Date Start NAV:</td>
					<td class="text-right"><b>{{ $format(performanceDetails.begin_nav) }}</b> <FmCopyButton :text="performanceDetails.begin_nav"></FmCopyButton></td>
				</tr>
				<tr>
					<td>Date End:</td>
					<td class="text-right"><b>{{ performanceDetails.end_date }}</b> <FmCopyButton :text="performanceDetails.end_date"></FmCopyButton></td>
				</tr>
				<tr>
					<td>Date End NAV:</td>
					<td class="text-right"><b>{{ $format(performanceDetails.end_nav) }}</b> <FmCopyButton :text="performanceDetails.end_nav"></FmCopyButton></td>
				</tr>
				<tr>
					<td>Cash flow:</td>
					<td class="text-right"><b>{{ $format(performanceDetails.grand_cash_flow) }}</b> <FmCopyButton :text="performanceDetails.grand_cash_flow"></FmCopyButton></td>
				</tr>
				<tr>
					<td>Weighted Cash flow:</td>
					<td class="text-right"><b>{{ $format(performanceDetails.grand_cash_flow_weighted) }}</b> <FmCopyButton :text="performanceDetails.grand_cash_flow_weighted"></FmCopyButton></td>
				</tr>
				<tr>
					<td>Absolute P&L:</td>
					<td class="text-right"><b>{{ $format(performanceDetails.grand_absolute_pl) }}</b> <FmCopyButton :text="performanceDetails.grand_absolute_pl"></FmCopyButton></td>
				</tr>
				<tr>
					<td>Return:</td>
					<td class="text-right"><b>{{parseFloat(performanceDetails.grand_return * 100).toFixed(2)}}%</b> <FmCopyButton :text="parseFloat(performanceDetails.grand_return * 100).toFixed(2)"></FmCopyButton></td>
				</tr>
				<tr>
					<td>Period Type:</td>
					<td class="text-right"><b>{{performanceDetails.period_type}}</b></td>
				</tr>
				<tr>
					<td>Calculation Type:</td>
					<td class="text-right"><b>{{performanceDetails.calculation_type}}</b></td>
				</tr>
				<tr>
					<td>Report Currency:</td>
					<td class="text-right"><b>{{performanceDetails.report_currency_object.name}}</b></td>
				</tr>
			</table>


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
.text-right {
	text-align: right;
}
.copy-button {
	margin-left: 8px;
	margin-bottom: 12px;
	position: relative;
	top: 6px;
}
</style>
