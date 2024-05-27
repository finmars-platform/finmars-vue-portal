<template>
	<BaseModal :modelValue="modelValue"
			   :closingDisabled="creating"
               @open="init"
			   @close="onClose">

		<div style="padding: 16px;">

			<div v-if="columnKey !== 'user_code'">
				<table style="width: 100%;">
					<tr>
						<td>Date Start:</td>
						<td class="text-right"><b>{{ detailsData.begin_date }}</b>
							<FmCopyButton :text="detailsData.begin_date"></FmCopyButton>
						</td>
					</tr>
					<tr>
						<td>Date Start NAV:</td>
						<td class="text-right"><b>{{ $format(detailsData.begin_nav) }}</b>
							<FmCopyButton :text="detailsData.begin_nav"></FmCopyButton>
						</td>
					</tr>
					<tr>
						<td>Date End:</td>
						<td class="text-right"><b>{{ detailsData.end_date }}</b>
							<FmCopyButton :text="detailsData.end_date"></FmCopyButton>
						</td>
					</tr>
					<tr>
						<td>Date End NAV:</td>
						<td class="text-right"><b>{{ $format(detailsData.end_nav) }}</b>
							<FmCopyButton :text="detailsData.end_nav"></FmCopyButton>
						</td>
					</tr>
					<tr>
						<td>Cash flow:</td>
						<td class="text-right"><b>{{ $format(detailsData.grand_cash_flow) }}</b>
							<FmCopyButton :text="detailsData.grand_cash_flow"></FmCopyButton>
						</td>
					</tr>
					<tr>
						<td>Weighted Cash flow:</td>
						<td class="text-right"><b>{{ $format(detailsData.grand_cash_flow_weighted) }}</b>
							<FmCopyButton :text="detailsData.grand_cash_flow_weighted"></FmCopyButton>
						</td>
					</tr>
					<tr>
						<td>Absolute P&L:</td>
						<td class="text-right"><b>{{ $format(detailsData.grand_absolute_pl) }}</b>
							<FmCopyButton :text="detailsData.grand_absolute_pl"></FmCopyButton>
						</td>
					</tr>
					<tr>
						<td>Return:</td>
						<td class="text-right">
							<b>{{ parseFloat(detailsData.grand_return * 100).toFixed(2) }}%</b>
							<FmCopyButton
								:text="parseFloat(detailsData.grand_return * 100).toFixed(2)"></FmCopyButton>
						</td>
					</tr>
					<tr>
						<td>Period Type:</td>
						<td class="text-right"><b>{{ detailsData.period_type }}</b></td>
					</tr>
					<tr>
						<td>Calculation Type:</td>
						<td class="text-right"><b>{{ detailsData.calculation_type }}</b></td>
					</tr>
					<tr>
						<td>Report Currency:</td>
						<td class="text-right"><b>{{ detailsData.report_currency_object.name }}</b></td>
					</tr>
				</table>
			</div>

			<div v-else>
				<table>
					<tr v-show="readyStatus" v-for="portfolio in portfolios" :key="portfolio.id">
						<td class="text-center"><b>{{ portfolio.name }}</b></td>
					</tr>
				</table>
			</div>
		</div>


		<template #controls="{ cancel }">
			<div class="flex-row fc-space-between">
				<FmBtn
					:disabled="creating"
					type="basic"
					@click="cancel"
				>CANCEL</FmBtn>

			</div>
		</template>
	</BaseModal>
</template>

<script setup>

let props = defineProps({
    modelValue: Boolean,
	detailsData: Object,
	columnKey: String,
})

let emit = defineEmits(['update:modelValue', 'close'])

let readyStatus = ref(false)
let creating = ref(false)
let portfolios = ref([])

async function getDetailPortfolioBundle(bundleId) {
	return await useApi('portfolioBundleRegistersList.get', {
		params: {id: bundleId},
	})
}

async function getPortfolios() {
	const res = await getDetailPortfolioBundle(props.detailsData.bundle)
	return res.results
}

function onClose() {
    readyStatus.value = false;
    portfolios.value = [];
    emit('update:modelValue', false);
    emit('close');
}

async function init() {

    if (props.columnKey === "user_code") {

        getPortfolios().then(result => {
            portfolios.value = result;
            readyStatus.value = true;
        });

    }

}

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

.text-center {
	text-align: center;
}

.copy-button {
	margin-left: 8px;
	margin-bottom: 12px;
	position: relative;
	top: 6px;
}
</style>
