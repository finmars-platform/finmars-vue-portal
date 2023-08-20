<template>

	<FmExpansionPanel title="Transactions">
		<div>

			<table v-if="transactions.length" class="performance-transactions">
				<thead>
				<th>№</th>
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
				<th>Transaction Class</th>
				<th @click="sortTable('entry_item_name')">
					Name
					<span v-if="sortState.column === 'entry_item_name'">
							{{ sortState.ascending ? '↑' : '↓' }}
					</span>
				</th>
				<th>Amount</th>
				<th>Account</th>
				<th>Settlement Currency</th>
				<th>Notes</th>
				</thead>
				<tbody>
				<tr v-for="(item, i) of transactions" :key="i">
					<td>{{ i + 1 }}</td>
					<td>{{ item.transaction_code }}</td>
					<td>{{ item.accounting_date }}</td>
					<td>{{ item.transaction_class.name }}</td>
					<td>{{ item.entry_item_name }}</td>
					<td>{{ item.entry_amount }}</td>
					<td>{{ item.entry_account.name }}</td>
					<td>{{ item.settlement_currency.name }}</td>
					<td>{{ item.notes }}</td>
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
	bundleId: {
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

function getMonthStartAndEnd(monthName, year) {

	var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

	var monthIndex = months.indexOf(monthName) + 1;  // Add 1 to get the month in 1-12 format.
	var monthStart = `${year}-${monthIndex.toString().padStart(2, '0')}-01`;

	var nextMonthStart = new Date(year, monthIndex, 1);
	nextMonthStart.setDate(0);  // This sets the date to the last day of the previous month, which is the month of interest.
	var monthEnd = `${year}-${monthIndex.toString().padStart(2, '0')}-${nextMonthStart.getDate().toString().padStart(2, '0')}`;

	return {
		monthStart: monthStart,
		monthEnd: monthEnd
	};
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

let getTransactions = async () => {

	if (props.bundleId && props.monthData.currentMonth) {

		console.log('props.monthData', JSON.stringify(props.monthData))
		console.log('props.yearData', JSON.stringify(props.yearData))

		var dates = getMonthStartAndEnd(props.monthData.currentMonth, props.yearData.detailYear);

		let res = await useApi('transactionReport.post', {
			body: {
				bundle: props.bundleId.id, // WTF? why if its called id, its object inside?
				begin_date: dates.monthStart,
				end_date: dates.monthEnd,
				date_field: 'transaction_date',
				depth_level: 'entry'
			},
		})


		let result_items = res.items;

		result_items = joinProperty(result_items, 'transaction_class', res.item_transaction_classes);
		result_items = joinProperty(result_items, 'entry_account', res.item_accounts);
		result_items = joinProperty(result_items, 'settlement_currency', res.item_currencies);
		result_items = joinProperty(result_items, 'transaction_currency', res.item_currencies);

		transactions.value = result_items;

		console.log('transactions.value', JSON.parse(JSON.stringify(transactions.value)));

	}


}

watch(
	props,
	() => getTransactions()
)


</script>

<style lang="scss" scoped>

.performance-transactions {
	font-size: 14px;
	text-align: left;

	th {
		padding: 8px;
	}

	td {
		padding: 8px;
	}
}

</style>
