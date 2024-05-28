<template>

	<FmExpansionPanel title="Transactions">
		<div class="performance-transactions-table-holder">

			<table v-if="transactions.length" class="performance-transactions">
				<thead>
				<th>#</th>
				<th @click="sortTable('transaction_code')">

					Code

					<span v-if="sortState.column === 'transaction_code'">
							{{ sortState.ascending ? '↑' : '↓' }}
					</span>

				</th>
				<th @click="sortTable('accounting_date')" style="min-width: 100px;">
					Date

					<span v-if="sortState.column === 'accounting_date'">
							{{ sortState.ascending ? '↑' : '↓' }}
					</span>

				</th>
				<th @click="sortTable('transaction_class_name')">Transaction Class

					<span v-if="sortState.column === 'transaction_class_name'">
							{{ sortState.ascending ? '↑' : '↓' }}
					</span>

				</th>
				<th>Principal</th>
				<th>Carry</th>
				<th>Overheads</th>
				<th>Transaction Currency</th>
				<th>Cash Consideration</th>
				<th>Settlement Currency</th>
				<th>Position</th>
				<th>Instrument</th>
				<th>Notes</th>
				</thead>
				<tbody>
				<tr v-for="(item, i) of transactions" :key="i">
					<td>{{ i + 1 }}</td>
					<td>{{ item.transaction_code }}</td>
					<td>{{ item.accounting_date }}</td>
					<td>{{ item.transaction_class.name }}</td>
					<td>{{ formatNumber(item.principal_with_sign) }}</td>
					<td>{{ formatNumber(item.carry_with_sign) }}</td>
					<td>{{ formatNumber(item.overheads_with_sign) }}</td>
					<td>{{ item.transaction_currency.short_name }}</td>
					<td>{{ formatNumber(item.cash_consideration) }}</td>
					<td>{{ item.settlement_currency.short_name }}</td>
					<td>{{ formatNumber(item.position_size_with_sign) }}</td>
					<td>
						<span v-if="item.instrument">{{ item.instrument.short_name }}</span>
					</td>
					<td>
						<span>{{ item.notes }}</span>
					</td>
				</tr>
				</tbody>
			</table>

			<div v-if="!transactions.length">
				<h3 style="text-align: center">No Transactions found</h3>
			</div>
		</div>
	</FmExpansionPanel>
</template>

<script setup>


const props = defineProps({
	reportOptions: {
		type: Object,
	},

    /** Id of a bundle or a whole object of a bundle. */
	bundle: {
		type: [Number, Object],
	},

	yearData: {
		type: Object
	},
	monthData: {
		type: Object
	}

})

let transactions = ref([])
const sortState = ref({
	column: null,
	ascending: true
});

let bundleId = computed(() => {

  if (!props.bundle) return null;

  if (typeof props.bundle == 'object' && props.bundle.id) {
    return props.bundle.id
  }

  if (typeof props.bundle == 'number') return props.bundle

})

const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

let monthIndex = computed(() => {

	if (!props.monthData || !props.monthData.currentMonth) {
		return null;
	}

    let index = monthNames.indexOf(props.monthData.currentMonth);

    if (index < 0) {
        console.error(`RvPerformanceTransactions invalid month name: ${props.monthData.currentMonth}`)
        index = null;
	}

	return index;

})

watch(
    () => [
        props.bundle,
        props.yearData,
        props.monthData,
    ],
    () => {

      if (props.bundle &&
		  props.yearData && Object.keys(props.yearData).length &&
		  props.monthData?.currentMonth) {

          getTransactions();

	  } else if (transactions.value.length) {
          transactions.value = [];

	  }

    }
)

function getMonthStartAndEnd(year) {

    let endDate = props.reportOptions.end_date.split("-");
    const endDateYear = endDate[0];
    const endDateMonth = endDate[1];
    const endDateDay = endDate[2];
	/*var monthIndex = months.indexOf(monthName) + 1;  // Add 1 to get the month in 1-12 format.
	var monthStart = `${year}-${monthIndex.toString().padStart(2, '0')}-01`;

	var nextMonthStart = new Date(year, monthIndex, 1);
	nextMonthStart.setDate(0);  // This sets the date to the last day of the previous month, which is the month of interest.
	var monthEnd = `${year}-${monthIndex.toString().padStart(2, '0')}-${nextMonthStart.getDate().toString().padStart(2, '0')}`;*/

    const nextMonthIndex = monthIndex.value + 1;

    const monthStart = nextMonthIndex.toString().padStart(2, '0');
    var monthStartFm = `${year}-${monthStart}-01`;

    let monthEnd = new Date(year, nextMonthIndex, 1); // next month
    monthEnd.setDate(0);  // This sets the date to the last day of the previous month, which is the month of interest.

    // Using nextMonthIndex because conveniently it is equal to current month number (1-12)
    const mEndMonth = nextMonthIndex.toString().padStart(2, '0'); // values: 01 - 12

    let mEndDay;

    if ( endDateYear === year && endDateMonth === mEndMonth) {
        // if month at the end of a period of dates for performance,
        // use the day from the end of the period
        mEndDay = endDateDay;

    } else {
        mEndDay = monthEnd.getDate().toString().padStart(2, '0'); // values: 01 - 31
    }

    const monthEndFm = `${year}-${mEndMonth}-${mEndDay}`;

	return {
		monthStart: monthStartFm,
		monthEnd: monthEndFm
	};
}

function formatNumber(num) {

	const parts = num.toString().split(".");

	// Use a regex to add the single quote as a thousands separator
	parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, "'");

	// Return the formatted number
	return parts.join(".");

}

function joinProperty(items, propertyKey, relatedObjects) {
	return items.map(item => {
		// Find the related object based on the property key and the corresponding id in the transaction
		const relatedObject = relatedObjects.find(relatedItem => relatedItem.id === item[propertyKey]);

		// If found, merge the related object into the transaction
		if (relatedObject) {
			return {
				...item,
				[propertyKey]: relatedObject // replace the id with the actual related object
			};
		}
		return item; // If not found, return the original transaction
	});
}

const sortTable = (columnName) => {
	if (sortState.value.column === columnName) {
		sortState.value.ascending = !sortState.value.ascending;
	} else {
		sortState.value.column = columnName;
		sortState.value.ascending = true;
	}

	transactions.value.sort((a, b) => {
		if (a[columnName] > b[columnName]) return sortState.value.ascending ? 1 : -1;
		if (a[columnName] < b[columnName]) return sortState.value.ascending ? -1 : 1;
		return 0;
	});
}

let getTransactionsReqKey = null;

const getTransactions = async () => {

	if (!props.bundle ||
		!props.yearData || !Object.keys(props.yearData).length ||
		!props.monthData?.currentMonth) {

		return;

	}

	const endDate = new Date(props.reportOptions.end_date);
	const monthStart = new Date(props.yearData.detailYear, monthIndex.value, 1);

	if (!endDate || !monthStart || endDate < monthStart) {
		throw "RvPerformanceTransactions: Invalid end date and selected month";
	}

	const reqKey = useGenerateUniqueId(bundleId.value + props.monthData.currentMonth);
	getTransactionsReqKey = reqKey;

	var dates = getMonthStartAndEnd(props.yearData.detailYear);

	let res = await useApi(
        'transactionReport.post',
		{
			body: {
				bundle: bundleId.value,
				begin_date: dates.monthStart,
				end_date: dates.monthEnd,
				date_field: 'transaction_date',
				depth_level: 'base_transaction',
			},
		}
    )

	if (getTransactionsReqKey !== reqKey) {
		// New request sent while old request was processing.
		// Discard result of old request.
		return;
	}

	let result_items = res.items;

	result_items = joinProperty(result_items, 'transaction_class', res.item_transaction_classes);
	result_items = joinProperty(result_items, 'entry_account', res.item_accounts);
	result_items = joinProperty(result_items, 'settlement_currency', res.item_currencies);
	result_items = joinProperty(result_items, 'transaction_currency', res.item_currencies);
	result_items = joinProperty(result_items, 'instrument', res.item_instruments);

	result_items = result_items.map(function (item) {

		item.transaction_class_name = item.transaction_class.name;

		return item
	})

	transactions.value = result_items;

}


</script>

<style lang="scss" scoped>

.performance-transactions-table-holder {
	width: 100%;
	overflow: auto;
}

.performance-transactions {
	font-size: 14px;
	text-align: left;

	border-collapse: collapse;

	th {
		padding: 8px 16px;
		background: var(--tableHeader-backgroundColor);
		color: var(--secondary-color);
		opacity: .9;
	}

	span {
		display: block;
		max-height: 24px;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: pre;
	}

	tr {
		border: 1px solid #e0e0e0;
	}

	td {
		padding: 8px;
	}
}

</style>
