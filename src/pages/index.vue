<template>
	<div class="fm_container wrap">
		<div class="hp_block">
			<div class="hp_title">Notifications</div>
			<div class="hp_toolbar flex sb aic">
				<FmSelect v-model="action" :items="actionsItems" size="small" class="m-b-0" @update:modelValue="dateFilter()" />
				<BaseInput type="text"
					v-model="query"
					placeholder="Search"
					class="bi_no_borders"
					@keyup.enter="search()"
				>
					<template #button>
						<FmIcon icon="search" />
					</template>
				</BaseInput>

				<FmSelect v-model="date" :items="dateItems" class="m-b-0" no_borders @update:modelValue="dateFilter()">
					<template #left_icon>
						<FmIcon icon="today" />
					</template>
				</FmSelect>
			</div>

			<div class="hp_content">
				<template v-if="!openedStream">
					<div class="hp_row flex sb aic"
						v-for="(item, index) in streams"
						:key="index"
					>
						<div class="hp_item_wrap">
							<div class="hp_item"
								@click="openedStream = item, loadStream()"
							>
								<div>{{ item.name }}</div>
								<div class="hp_text_small">Total new: {{ item.total }}</div>
							</div>
						</div>

						<div class="flex aic">
							<div class="hp_item red"
								@click="openedStream = item, choseType(3)"
							>
								<div class="hp_text_small">Errors</div>
								<div><span class="circle red"></span>{{ item.errors }}</div>
							</div>
							<div class="hp_item primary" @click="openedStream = item, choseType(2)">
								<div class="hp_text_small">Warning</div>
								<div><span class="circle primary"></span>{{ item.warning }}</div>
							</div>
							<div class="hp_item blue" @click="openedStream = item, choseType(1)">
								<div class="hp_text_small">Information</div>
								<div><span class="circle blue"></span>{{ item.information }}</div>
							</div>
							<div class="hp_item green" @click="openedStream = item, choseType(4)">
								<div class="hp_text_small">Success</div>
								<div><span class="circle green"></span>{{ item.success }}</div>
							</div>
						</div>

						<FmMenu class="header_item">
							<template #btn>
								<FmIcon icon="more_vert" />
							</template>

							<template #default="{close}">
								<div class="fm_list">
									<div class="fm_list_item" @click="openedStream = item, loadStream(), close()">
										<FmIcon class="m-r-10" icon="smart_display" /> Watch stream
									</div>
									<div class="fm_list_item" @click="markAsReadAll( item.id ), close()">
										<FmIcon class="m-r-10" icon="mark_email_read" /> Mark as read
									</div>
								</div>
							</template>

						</FmMenu>
					</div>
				</template>
				<template v-else>
					<div class="hp_row flex sb aic">
						<div class="flex aic">
							<FmIcon icon="arrow_back" @click="backToStats()" />
							<div class="hp_item no_hover">
								<div>{{ openedStream.name }}</div>
								<div class="hp_text_small">Total new: {{ openedStream.total }}</div>
							</div>
						</div>

						<div class="flex aic">
							<div class="hp_item red" :class="{active: types.has(3)}" @click="choseType(3)">
								<div class="hp_text_small">Errors</div>
								<div><span class="circle red"></span>{{ openedStream.errors }}</div>
							</div>
							<div class="hp_item primary" :class="{active: types.has(2)}" @click="choseType(2)">
								<div class="hp_text_small">Warning</div>
								<div><span class="circle primary"></span>{{ openedStream.warning }}</div>
							</div>
							<div class="hp_item blue" :class="{active: types.has(1)}" @click="choseType(1)">
								<div class="hp_text_small">Information</div>
								<div><span class="circle blue"></span>{{ openedStream.information }}</div>
							</div>
							<div class="hp_item green" @click="choseType(4)" :class="{active: types.has(4)}">
								<div class="hp_text_small">Success</div>
								<div><span class="circle green"></span>{{ openedStream.success }}</div>
							</div>
						</div>

						<FmMenu class="header_item">
							<template #btn>
								<FmIcon icon="more_vert" />
							</template>

							<template #default="{close}">
								<div class="fm_list">
									<div class="fm_list_item" @click="">
										<FmIcon class="m-r-10" icon="docs_add_on" /> Show all details
									</div>
									<div class="fm_list_item" @click="">
										<FmIcon class="m-r-10" icon="docs_add_on" /> Hide all details
									</div>
									<div class="fm_list_item" @click="markAsReadAll( openedStream.id ), close()">
										<FmIcon class="m-r-10" icon="mark_email_read" /> Mark as read
									</div>
								</div>
							</template>
						</FmMenu>
					</div>

					<div class="hp_messages"
						v-for="(item, index) in messages"
						:key="index"
						:class="{
							blue: item.type == 1,
							primary: item.type == 2,
							red: item.type == 3,
							green: item.type == 4,
							pinned: item.is_pinned,
						}"
					>
						<div class="flex sb">
							<div><b>{{ item.title ? item.title + ': ' : '' }}</b> {{ item.description }}</div>
							<div class="flex">
								<div>
									<div :class="['action_status', {primary: item.action_status == 2}]">{{ ACTION_STATUSES[item.action_status] }}</div>

									<div class="status_wrap flex aic jcfe">
										<b v-if="openedStream.id === 0" class="m-r-10">{{ SECTIONS[item.section] }}</b>
										<div class="status" v-show="!item.is_read">New</div>
									</div>
								</div>
							</div>
						</div>

						<div class="flex sb">
							<div class="hp_details_btn" @click="openDetails(item)" v-if="item.linked_event || item.attachments.length">{{ openedDetalis.has(item.id) ? 'Hide' : 'Show' }} details</div>
							<div v-else></div>
							<div class="hp_messages_date">{{ fromatDate(item.created) }}</div>
						</div>

						<div class="hp_details" v-if="(item.linked_event || item.attachments.length) && openedDetalis.has(item.id)">
							<div class="hp_actions" v-if="item.linked_event">
								Instrument: US900123AW05 (UNITED STATES OF AMERICA 1.125% 2020-20.11.2027) <br>
								Position: -150.00 <br>
								Account: 106438730 <br>
								Portfolio: Portfolio Test <br>

								Available actions <br>

								Action 1 description<br>
								Action 2 super long description<br>
								Ignore
							</div>

						</div>

						<div class="more_menu">
							<FmMenu class="header_item">
								<template #btn>
									<FmIcon icon="more_vert" />
								</template>

								<template #default="{close}">
									<div class="fm_list">
										<div class="fm_list_item"
											@click="item.is_pinned ? unpin( item ) : pin( item ), close()"
										>
											<FmIcon class="m-r-10" icon="push_pin" /> {{ item.is_pinned ? 'Unpin' : 'Pin'}} message
										</div>
										<div class="fm_list_item" v-if="item.action_status != 3" @click="solve(item), close()">
											<FmIcon class="m-r-10" icon="check_circle" /> Solved
										</div>
									</div>
								</template>
							</FmMenu>
						</div>
					</div>
				</template>
			</div>
		</div>

		<div class="hp_block">
			<div class="hp_title">Bookmarks</div>

			<div class="hp_content">
			</div>
		</div>
	</div>
</template>

<script setup>

	import moment from 'moment'

	definePageMeta({
		bread: [
			{
				text: 'Home page: Investor',
				disabled: true
			},
		],
	});

	const ACTION_STATUSES = {
		1: 'Action not required',
		2: 'Action required',
		3: 'Solved',
	}
	const SECTIONS = {
		1: 'Events',
		2: 'Transactions',
		3: 'Instruments',
		4: 'Data',
		5: 'Prices',
		6: 'Report',
		7: 'Import',
		8: 'Activity log',
		9: 'Schedules',
		10: 'Other'
	}

	let nextPage = 1
	let openedDetalis = ref(new Set())

	let ws = new WebSocket("wss://dev.finmars.com/ws/");
	ws.onopen = function(){
		console.log("Websocket. Initial Auth");
		ws.send(JSON.stringify({action: "initial_auth"}));
	};
	ws.onMessage = (message) => {
		try {
			let parsedMessage = JSON.parse(message.data)

			if ( parsedMessage.type == 'new_system_message') {
				if ( parsedMessage.payload.section == openedStream.section ) {
					messages.unshift(parsedMessage.payload)
				}
			}

		} catch (error) {
				console.log("Websocket onmessage error. Error: ", error);
				console.log("Websocket onmessage error. Message: ", message);
		}
	}

	let streams = ref([])
	let openedStream = ref(null)
	let messages = ref([])

	let dateItems = [
		{id: moment().add(-1, 'd').format('YYYY-MM-DD'), name: 'Last day'},
		{id: moment().add(-7, 'd').format('YYYY-MM-DD'), name: 'Last 7 days'},
		{id: moment().add(-30, 'd').format('YYYY-MM-DD'), name: 'Last month'},
		{id: '', name: 'All'},
	]

	let actionsItems = [
		{id: 1, name: 'Action not required'},
		{id: 2, name: 'Action required'},
		{id: 3, name: 'Solved'},
		{id: '', name: 'Actions'},
	]

	let query = ref('')
	let date = ref('')
	let action = ref('')
	let types = ref(new Set())

	loadStats()

	async function loadStats() {
		let filters = {
			query: query.value,
			only_new: true
		}

		if ( date.value ) filters.created_after = date.value
		if ( action.value ) filters.action_status = action.value

		let res = await useApi('systemMessagesStats.get', {
			filters
		})

		res.unshift({
			id: 0,
			errors: 0,
			information: 0,
			name: "All",
			success: 0,
			warning: 0,
			total: 0
		})

		res.forEach((item, index) => {
			item.total = item.errors + item.success + item.warning + item.information

			res[0].errors += item.errors
			res[0].information += item.information
			res[0].success += item.success
			res[0].warning += item.warning
			res[0].total += item.total
		})

		streams.value = res
	}
	async function search() {
		if ( openedStream.value ) loadStream( true )
		else loadStats()
	}
	async function dateFilter() {
		if ( openedStream.value ) loadStream( true )
		else loadStats()
	}

	async function markAsReadAll( id ) {
		let res = await useApi('systemMessagesRead.post', {
			body: id !== 0 ? {sections: [id]} : null
		})

		if ( res.status == 'ok' ) {
			loadStats()
			messages.value.forEach(item => {
				item.is_read = true
			})
		}

	}
	async function pin( message ) {
		let res = await useApi('systemMessagesPin.post', {
			body: {ids: [message.id]}
		})

		if ( res.status == 'ok' ) message.is_pinned = true
	}
	async function unpin( message ) {
		let res = await useApi('systemMessagesUnpin.post', {
			body: {ids: [message.id]}
		})

		if ( res.status == 'ok' ) message.is_pinned = false
	}
	async function solve( message ) {
		let res = await useApi('systemMessagesSolved.post', {
			body: {ids: [message.id]}
		})

		if ( res.status == 'ok' ) message.action_status = 3
	}
	function choseType( type ) {
		if ( types.value.has(type) ) types.value.delete(type)
		else  types.value.add(type)

		loadStream( true )
	}
	function openDetails( message ) {
		if ( openedDetalis.value.has(message.id) ) {
			openedDetalis.value.delete(message.id)
		} else {
			openedDetalis.value.add(message.id)
			console.log('message:', message)

		}
	}

	let contentElem
	let containerElem

	onMounted(() => {
		contentElem = document.querySelector('.content')
		containerElem = document.querySelector('.fm_container')
	})

	async function loadStream( force ) {
		if ( force ) {
			nextPage = 1
			contentElem.removeEventListener('scroll', loadOnScroll)
		}

		let filters = {
			query: query.value,
			page: nextPage
		}
		if ( types.value ) filters.type = [...types.value].join(',')
		if ( date.value ) filters.created_after = date.value
		if ( action.value ) filters.action_status = action.value

		if ( openedStream.value.id !== 0 ) filters.section = openedStream.value.id

		let res = await useApi('systemMessages.get', { filters })
		messages.value = force ? res.results : messages.value.concat(res.results)

		if (res.next) {
			++nextPage

			contentElem.addEventListener('scroll', loadOnScroll)
		}
	}
	function loadOnScroll() {
		let clientH = containerElem.offsetHeight

		if ( contentElem.scrollTop >= (clientH - contentElem.offsetHeight - 100) ) {
			contentElem.removeEventListener('scroll', loadOnScroll)
			loadStream()
		}
	}
	function backToStats() {
		contentElem.removeEventListener('scroll', loadOnScroll)
		openedStream.value = null
		messages.value = []
		types.value = new Set()
		nextPage = 1
	}

	function fromatDate( date ) {
		return moment( date ).format('DD.MM.YYYY HH:mm')
	}
</script>

<style lang="scss" scoped>
	.wrap {
		display: grid;
		grid-template-columns: 1fr 500px;
		align-items: flex-start;
		gap: 20px
	}
	.hp_block {
		border: 1px solid $border;
		border-radius: 3px;
		background: $separ;
		max-width: 730px;
	}
	.hp_title {
		background: $main-darken;
		height: 33px;
		line-height: 33px;
		padding: 0 20px;
		font-weight: 500;
		border-bottom: 1px solid $border;
		font-size: 14px;
		font-weight: 500;
	}
	.hp_toolbar {
		padding: 0 20px;
		border-bottom: 1px solid $border;
		margin-bottom: 15px;
		height: 44px;
	}
	.hp_content {
		padding-bottom: 10px;
	}
	.hp_row {
		padding-left: 15px;
		padding-right: 20px;

		& + & {
			margin-top: 20px;
		}
	}
	.hp_text_small {
		font-size: 10px;
		color: $text-lighten;
	}
	.hp_item_wrap {
		width: 125px;
	}
	.hp_item {
		min-width: 76px;
		padding: 7px 8px;
		border-radius: 5px;
		background: transparent;
		transition: background 0.3s;

		&:not(.no_hover) {
			cursor: pointer;
		}

		&:not(.no_hover):hover {
			background: #DD4F251A;
		}

		& + & {
			margin-left: 10px;
		}
		&.blue:hover, &.blue.active {
			background: #dfeaff;
		}
		&.red:hover, &.red.active {
			background: #FFCCCC;
		}
		&.primary:hover, &.primary.active {
			background: #FFE8CC;
		}
		&.green:hover, &.green.active {
			background: #E1FEF5;
		}
		.circle {
			display: inline-block;
			vertical-align: middle;
			width: 7px;
			height: 7px;
			border-radius: 50%;
			margin-right: 5px;
			&.green {
				background: #0be233;
			}
			&.primary {
				background: $primary;
			}
			&.blue {
				background: #5F95FF;
			}
			&.red {
				background: #ff0000;
			}
		}
	}
	.hp_messages {
		position: relative;
		margin: 15px 10px 0;
		padding: 8px 12px;
		padding-right: 40px;
		border: 1px solid $border;
		border-left: 10px solid $border;
		border-radius: 5px;

		&.pinned {
			background: #FEF9EF;
		}
		&.blue {
			border-left-color: #dfeaff;
		}
		&.red {
			border-left-color: #FFCCCC;
		}
		&.primary {
			border-left-color: #FFE8CC;
		}
		&.green {
			border-left-color: #E1FEF5;
		}
	}
	.hp_details_btn {
		color: $primary;
		cursor: pointer;
		transition: 0.3s;

		&:hover {
			color: $primary-lighten;
		}
	}
	.more_menu {
		position: absolute;
		top: 42px;
		right: 5px;
	}
	.action_status {
		padding: 2px 6px;
		border-radius: 5px;
		border: 1px solid $text-lighten;
		color: $text-lighten;
		white-space: nowrap;

		&.primary {
			color: $primary;
			border-color: #ff8a00;
		}
	}
	.status_wrap {
		margin: 10px 0;
		height: 25.2px;
	}
	.status {
		display: inline-block;
		color: $text-lighten;
		padding: 2px 6px;
		border: 1px solid $text-lighten;
		border-radius: 5px;

		&.hidden {
			opacity: 0;
		}
	}
</style>
