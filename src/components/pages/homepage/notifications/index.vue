<template>
	<div class="hp_block notifications">
		<div class="hp_title">Notifications</div>
		<div class="hp_toolbar flex sb aic">
			<div class="flex aic">
				<FmSelect v-model="action" :items="actionsItems" size="small" class="m-b-0" @update:modelValue="dateFilter()" />

				<BaseInput type="text"
					v-model="query"
					placeholder="Search"
					class="bi_no_borders"
					@keyup.enter="search()"
					@change="search()"
				>
					<template #button>
						<FmIcon icon="search" />
					</template>
				</BaseInput>
			</div>

			<div class="flex aic">
				<FmSelect v-model="date" :items="dateItems" class="m-b-0" no_borders @update:modelValue="dateFilter()">
					<template #left_icon>
						<FmIcon icon="today" />
					</template>
				</FmSelect>
				<FmIcon :icon="only_new ? 'visibility' : 'visibility_off'"
					:tooltip="(only_new ? 'Show' : 'Hide') + ' read messages'" @click="only_new = !only_new, dateFilter()" />
			</div>
		</div>

		<div class="hp_row hp_messages_stats flex sb aic"  v-if="openedStream">
			<div class="flex aic">
				<div class="hp_back">
					<FmIcon icon="arrow_back" @click="backToStats()" />
				</div>

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

			<FmMenu class="header_item" anchor="right">
				<template #btn>
					<FmIcon icon="more_vert" />
				</template>

				<template #default="{close}">
					<div class="fm_list">
						<!-- <div class="fm_list_item" @click="">
							<FmIcon class="m-r-10" icon="playlist_add" /> Show all details
						</div> -->
						<div class="fm_list_item" @click="hideAllDetails(), close()">
							<FmIcon class="m-r-10" icon="playlist_remove" /> Hide all details
						</div>
						<div class="fm_list_item" @click="markAsReadAll( openedStream.id ), close()">
							<FmIcon class="m-r-10" icon="mark_email_read" /> Mark as read
						</div>
					</div>
				</template>
			</FmMenu>
		</div>

		<div class="hp_content" :class="{opened: openedStream}" ref="scrolledBox">

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
							<div v-if="item.errors"><span class="circle red"></span>{{ item.errors }}</div>
							<div v-else>-</div>
						</div>
						<div class="hp_item primary" @click="openedStream = item, choseType(2)">
							<div class="hp_text_small">Warning</div>
							<div v-if="item.warning"><span class="circle primary"></span>{{ item.warning }}</div>
							<div v-else>-</div>
						</div>
						<div class="hp_item blue" @click="openedStream = item, choseType(1)">
							<div class="hp_text_small">Information</div>
							<div v-if="item.information"><span class="circle blue"></span>{{ item.information }}</div>
							<div v-else>-</div>
						</div>
						<div class="hp_item green" @click="openedStream = item, choseType(4)">
							<div class="hp_text_small">Success</div>
							<div v-if="item.success"><span class="circle green"></span>{{ item.success }}</div>
							<div v-else>-</div>
						</div>
					</div>

					<FmMenu class="header_item" anchor="right">
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
				<div class="hp_new_message" v-if="newMessages"
					@click="scrollTop()"><FmIcon icon="north" />New messages: {{ newMessages }}</div>

				<div class="hp_messages"
					v-for="(item, index) in messages"
					:key="item.id"
					:class="{
						blue: item.type == 1,
						primary: item.type == 2,
						red: item.type == 3,
						green: item.type == 4,
						pinned: item.is_pinned
					}"
					:data-id="item.id"
					:ref="el => {
						if ( el && !item.is_read) {
							messageObserver.observe(el)
						}
					}"
				>
					<div class="flex sb">
						<div class="hp_messages_text"><b>{{ item.title ? item.title + ': ' : '' }}</b> {{ item.description }}</div>
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
							<div class="hp_actions_item flex">
								<div class="hp_actions_item_h">Instrument:</div>
								<div class="hp_actions_item_t">
									{{ detailsObjs[item.linked_event].instrument_object.name }}
								</div>
							</div>

							<b>Available actions</b><br>

							<div class="hp_actions_item_btn"
								v-for="(item, i) in detailsObjs[item.linked_event].event_schedule_object.actions"
								:key="i"
							>
								{{ item.display_text }}
							</div>
						</div>
						<div class="hp_attach" v-if="item.attachments.length">
							<b class="m-t-10 db">Attachments</b>
							<div class="hp_attach_item flex aic"
								v-for="(item, index) in item.attachments"
								:key="index"
							>
								<div class="hp_attach_item_type">{{ item.file_report_object.content_type || 'JSON' }}</div>
								<a class="hp_attach_item_name"
								:href="`${useRuntimeConfig().public.apiURL}/${useStore().current.base_api_url}/api/v1/file-reports/file-report/${item.file_report_object.id}/view/`">{{ item.file_report_object.name }}</a>
							</div>
						</div>

					</div>

					<div class="more_menu">
						<FmMenu class="header_item" anchor="right">
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
				<div class="hp_messages_loader tac p-t-16" v-show="isMore" ref="messagesLoader"><FmLoader /></div>
			</template>
		</div>
	</div>
</template>

<script setup>

	import moment from 'moment'

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
	const store = useStore()

	let dateItems = [
		{id: '', name: 'All'},
		{id: moment().add(-1, 'd').format('YYYY-MM-DD'), name: 'Last day'},
		{id: moment().add(-7, 'd').format('YYYY-MM-DD'), name: 'Last 7 days'},
		{id: moment().add(-30, 'd').format('YYYY-MM-DD'), name: 'Last month'},
	]

	let actionsItems = [
		{id: '', name: 'All actions'},
		{id: 1, name: 'Action not required'},
		{id: 2, name: 'Action required'},
		{id: 3, name: 'Solved'},
	]

	let query = ref('')
	let date = ref('')
	let only_new = ref(true)
	let action = ref('')
	let types = ref(new Set())

	async function search() {
		if ( openedStream.value ) loadStream( true )
		else loadStats()
	}
	async function dateFilter() {
		if ( openedStream.value ) loadStream( true )

		loadStats()
	}

	// ==== Stats =====

	let streams = ref([])

	loadStats()

	async function loadStats() {
		let filters = {
			query: query.value,
			only_new: only_new.value
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

		if ( openedStream.value ) openedStream.value = res.find(item => item.id == openedStream.value.id)
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

	// === Messages =====

	let openedStream = ref(null)
	let messages = ref([])

	let nextPage = 1
	let isMore = ref(true)

	let messageObserver = ref(null)
	let loadingObserver
	let scrolledBox = ref(null)
	let messagesLoader = ref(null)

	async function loadStream( force ) {
		if ( !messageObserver.value ) setMessageObserver()
		if ( force ) {
			nextPage = 1
			isMore.value = true
			scrolledBox.value.scrollTo({ top: 0, behavior: "smooth" })
			if ( messageObserver.value ) messageObserver.value.disconnect()
		}

		let filters = {
			query: query.value,
			page: nextPage
		}
		if ( types.value ) filters.type = [...types.value].join(',')
		if ( date.value ) filters.created_after = date.value
		if ( action.value ) filters.action_status = action.value
		if ( only_new.value ) filters.only_new = only_new.value

		if ( openedStream.value.id !== 0 ) filters.section = openedStream.value.id

		let res = await useApi('systemMessages.get', { filters })
		messages.value = force ? res.results : messages.value.concat(res.results)

		if (res.next) {
			++nextPage

			if ( !loadingObserver ) setLoadObserver()

		} else {

			isMore.value = false
		}
	}
	function setLoadObserver() {
		let options = {
			root: scrolledBox.value,
			threshold: 0.5
		}
		let callback = (entries, observer) => {
			entries.forEach( entry => {
				if ( entry.isIntersecting ) {
					if ( !isMore.value ) {
						return false
					}

					loadStream()
				}
			})
		};
		loadingObserver = new IntersectionObserver(callback, options);
		loadingObserver.observe(messagesLoader.value)
	}
	function setMessageObserver() {
		let options = {
			root: scrolledBox.value,
			rootMargin: '0px',
			threshold: 1.0
		}
		let callback = async (entries, observer) => {
			entries.forEach(async entry => {
				if ( entry.isIntersecting ) {
					observer.unobserve(entry.target)

					let id = entry.target.dataset.id
					console.log('id:', id)

					let index = messages.value.findIndex(item => item.id == id)
					if ( index !== undefined ) messages.value[index].is_read = true
				}
			})
		};
		messageObserver.value = new IntersectionObserver(callback, options);
	}


	let newMessages = ref(0)

	store.ws.on('new_system_message', async ( data ) => {
		if (
			openedStream.value &&
			( data.section == openedStream.value.id || openedStream.value.id == 0 )
		) {
			let message = await useApi( 'systemMessagesOne.get', { params: {id: data.id} } )

			if ( message.error ) return false

			let pinned = messages.value.filter(item => item.is_pinned)
			let start = pinned.length

			messages.value.splice( start, 0, message )
			newMessages.value += 1
		}
	})

	function scrollTop() {
		scrolledBox.value.scrollTo({ top: 0, behavior: "smooth" }), newMessages.value = 0
	}

	let openedDetalis = ref(new Set())
	let detailsObjs = ref({})











	function hideAllDetails() {
		openedDetalis.value = new Set()
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
	async function openDetails( message ) {
		if ( openedDetalis.value.has(message.id) ) {
			openedDetalis.value.delete(message.id)
		} else {
			openedDetalis.value.add(message.id)

			if ( message.linked_event ) {
				let res = await useApi('instrumentsEvent.get', {
					params: {id: message.linked_event}
				})

				let res2 = await useApi('instrumentsEventBook.get', {
					params: {id: message.linked_event},
					filters: {action: 95}
				})
				console.log('res2:', res2)



				detailsObjs.value[message.linked_event] = res
			}
		}
	}
	function backToStats() {
		if ( messageObserver.value ) messageObserver.value.disconnect()
		openedStream.value = null
		messages.value = []
		types.value = new Set()
		nextPage = 1
		isMore.value = true
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
		height: 44px;
	}
	.hp_content {
		position: relative;
		padding: 10px 0;
		overflow-y: auto;
		max-height: calc(100vh - 177px);

		&.opened {
			max-height: calc(100vh - 237px);
		}
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
	.hp_back {
		width: 25px;
		height: 25px;
		background: $text-lighten;
		border-radius: 50%;
		margin-right: 10px;
		text-align: center;
		display: flex;
		align-items: center;
		justify-content: center;
		.icon {
			color: $separ;
			font-size: 20px;
		}
	}
	.notifications {
	}
	.hp_messages_stats {
		border-bottom: 1px solid $border;
		padding-top: 10px;
		padding-bottom: 10px;
		padding-left: 20px;
	}
	.hp_new_message {
		position: sticky;
		display: inline-block;
		left: 10px;
		top: 0;
		padding: 7px 9px;
		padding-left: 6px;
		border-radius: 5px;
		color: $separ;
		background: $primary-lighten;
		z-index: 10;
		font-size: 12px;
		font-weight: 500;
		cursor: pointer;

		.icon {
			color: $separ;
			display: inline-block;
			font-size: 16px;
			vertical-align: middle;
			margin-top: -2px;
			margin-right: 5px;
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

		&:first-child {
			margin-top: 5px;
		}

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
	.hp_messages_text {
		padding-right: 10px;
	}
	.hp_details_btn {
		color: $primary;
		cursor: pointer;
		transition: 0.3s;

		&:hover {
			color: $primary-lighten;
		}
	}
	.hp_actions {
		padding: 10px 0;
	}
	.hp_actions_item {
		margin-bottom: 10px;
	}
	.hp_actions_item_h {
		color: $text-lighten;
		width: 100px;
	}
	.hp_actions_item_btn {
		margin-top: 10px;
		background: $main-darken;
		width: 228px;
		border-radius: 5px;
		padding: 8px 10px;
		cursor: pointer;
	}
	.hp_attach_item {
		margin-top: 13px;
	}
	.hp_attach_item_type {
		border: 1px solid $primary;
		border-radius: 1px;
		padding: 6px;
		font-size: 14px;
		text-transform: uppercase;
		color: $primary;
		margin-right: 11px;
	}
	.hp_attach_item_name {
		text-decoration: underline;
		cursor: pointer;
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
