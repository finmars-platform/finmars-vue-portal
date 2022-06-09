<template>
	<div class="">
		<div class="table-row" @click="isOpen = !isOpen" :class="{active: isOpen}" >
			<!-- <div class="">
				<div class="circle"></div>
			</div> -->
			<div class="table-cell">{{
				item.procedure_object.name.length > 30
				? item.procedure_object.name.slice(0, 25) + '...'
				: item.procedure_object.name
			}}</div>
			<div class="table-cell">{{ fromatDate( item.created ) }}</div>
			<div class="table-cell">
				{{ Math.floor(item.procedures.filter(item => item.status == 'D').length / item.procedures.length * 100) }}%</div>
		</div>

		<Transition>
		<div v-if="isOpen">
			<div class="sub_procedure"
				v-for="subprocedure in item.procedures"
				:key="subprocedure.id"
			>
				<div class="sp_item d-flex">
					<b class="sp_item_h">Procedure</b>
					<div>{{ subprocedure.procedure_object.name }}</div>
				</div>
				<div class="sp_item d-flex">
					<b class="sp_item_h">Provider</b>
					<div>{{ subprocedure.provider_verbose }}</div>
				</div>
				<div class="sp_item d-flex">
					<b class="sp_item_h">Action</b>
					<div>{{ subprocedure.action_verbose }}</div>
				</div>
				<div class="sp_item d-flex">
					<b class="sp_item_h">Info</b>
					<div>{{ subprocedure.successful_prices_count }} successful, {{ subprocedure.error_prices_count }} errors</div>
				</div>
				<div class="sp_item d-flex">
					<b class="sp_item_h">Status</b>
					<div>{{ mapSratuses[ subprocedure.status ] }}</div>
				</div>

				<div class="center">
					<v-btn color="primary" variant="text">
						Show request
						<v-dialog activator="parent" v-model="subprocedure.dialog">
							<v-card>
								<v-card-title>
									Procedure request
								</v-card-title>

								<v-card-text>
									<pre>{{ JSON.stringify( subprocedure.request_data, null, 2 ) }}</pre>
								</v-card-text>
								<v-card-actions class="space-between">
									<v-btn color="primary" @click="subprocedure.dialog = false">cancel</v-btn>

									<div>
										<v-btn color="primary" variant="text" @click="copyText(JSON.stringify( subprocedure.request_data, null, 2 ))">copy</v-btn>
										<v-btn color="primary" variant="contained" @click="subprocedure.dialog = false">ok</v-btn>
									</div>
								</v-card-actions>
							</v-card>
						</v-dialog>
					</v-btn>
				</div>
			</div>
		</div>
		</Transition>
	</div>
</template>

<script setup>
	import moment from 'moment'

	defineProps([
		'item'
	])

	definePageMeta({
		title: "Valuations: Run Pricing ",
	});
	const store = useStore()
	let procedures = ref(null)
	let isOpen = ref(false)
	let dialog = ref(false)

	const mapSratuses = {
		P: 'Processing',
		D: 'Done',
		I: 'Init',
		E: 'Error',
	}
	function copyText( text ) {
		navigator.clipboard.writeText(text)

		useNotify({type: 'success', title: 'Copied successfully'})
	}
	function fromatDate( date ) {
		return moment( date ).format('DD.MM.YYYY LT')
	}
</script>

<style lang="scss" scoped>

.v-enter-active, .v-leave-active {
  transition: opacity 0.5s ease;
}
.v-enter-from, .v-leave-to {
  opacity: 0;
}

.table {
	border: 1px solid $border;
	width: 100%;
	font-size: 14px;
}
.table-row {
	display: grid;
	grid-template-columns: 1fr 1fr 100px;
	align-items: center;
	background: #Fff;
	border-bottom: 1px solid $border;
	padding: 5px 0;
	cursor: pointer;
	// height: 26px;

	&.active {
		position: relative;
		box-shadow: 0px 4px 4px -4px #cacaca;
	}
	&.header {
		background: #F2F2F2;
		height: 50px;
	}
}
.circle {
	border: 1px solid #000;
	width: 10px;
	height: 10px;
	border-radius: 50%;
	margin-left: 10px;
}
.table-cell {
	white-space: nowrap;
	padding: 0 14px;
}
.sub_procedure {
	grid-column: 1 / -1;
	padding: 5px 18px;
	border-bottom: 1px solid $border;
	background: #fff;
}
.sp_item {
	padding-top: 10px;
}
.date_item {
	width: 48%;
}
.sp_item_h {
	width: 120px;
}
</style>
