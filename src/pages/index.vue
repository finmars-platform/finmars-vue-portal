<template>
	<div class="fm_container">
		<div class="hp_block">
			<div class="hp_title">Notifications</div>

			<div class="hp_content">
				<div class="hp_toolbar flex sb aic">
					<FmSelect />
					<BaseInput type="text"
						v-model="globalFilters.description"
						placeholder="Search"
						class="bi_no_borders"
					>
						<template #button>
							<FmIcon icon="search" />
						</template>
					</BaseInput>

					<FmSelect />
					<FmIcon icon="settings" />
				</div>

				<template v-if="!openedStream">
					<div class="hp_row flex sb aic"
						v-for="(item, index) in streams"
						:key="index"
					>
						<div class="hp_item"
							@click="openStream( item )"
						>
							<div>{{ item.name }}</div>
							<div class="hp_text_small">Total new: {{ item.total }}</div>
						</div>

						<div class="flex aic">
							<div class="hp_item">
								<div class="hp_text_small">Errors</div>
								<div><span class="circle red"></span>{{ item.errors }}</div>
							</div>
							<div class="hp_item">
								<div class="hp_text_small">Warning</div>
								<div><span class="circle primary"></span>{{ item.warning }}</div>
							</div>
							<div class="hp_item">
								<div class="hp_text_small">Information</div>
								<div><span class="circle blue"></span>{{ item.information }}</div>
							</div>
							<div class="hp_item">
								<div class="hp_text_small">Success</div>
								<div><span class="circle green"></span>{{ item.success }}</div>
							</div>
						</div>

						<div class="hp_item_settings">
							<div class="">
								<FmMenu class="header_item">
									<template #btn>
										<FmIcon icon="more_vert" />
									</template>

									<div class="fm_list">
										<div class="fm_list_item" @click="openStream( item )">
											<FmIcon class="m-r-10" icon="smart_display" /> Watch stream
										</div>
										<div class="fm_list_item" @click="markAsRead( item.id )">
											<FmIcon class="m-r-10" icon="mark_email_read" /> Mark as read
										</div>
									</div>
								</FmMenu>
							</div>
						</div>
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
							<div class="hp_item red">
								<div class="hp_text_small">Errors</div>
								<div><span class="circle red"></span>{{ openedStream.errors }}</div>
							</div>
							<div class="hp_item primary">
								<div class="hp_text_small">Warning</div>
								<div><span class="circle primary"></span>{{ openedStream.warning }}</div>
							</div>
							<div class="hp_item blue">
								<div class="hp_text_small">Information</div>
								<div><span class="circle blue"></span>{{ openedStream.information }}</div>
							</div>
							<div class="hp_item green">
								<div class="hp_text_small">Success</div>
								<div><span class="circle green"></span>{{ openedStream.success }}</div>
							</div>
						</div>

						<div class="hp_item_settings">
							<FmIcon icon="more_vert" />
						</div>
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
									<div class="action_status">{{ ACTION_STATUSES[item.action_status] }}</div>

									<div class="status_wrap flex jcfe">
										<div class="status" v-if="!item.is_read">New</div>
									</div>
								</div>
							</div>
						</div>

						<div class="flex sb">
							<div>show</div>
							<div class="hp_messages_date">{{ fromatDate(item.created) }}</div>
						</div>
						<div class="hp_details">

						</div>

						<div class="more_menu">
							<FmMenu class="header_item">
								<template #btn>
									<FmIcon icon="more_vert" />
								</template>

								<template #default="{close}">
									<div class="fm_list">
										<div class="fm_list_item"
											@click="item.is_pinned ? unpin( item.id ) : pin( item.id ), close()"
										>
											{{ item.is_pinned ? 'Unpin' : 'Pin'}} message
										</div>
										<div class="fm_list_item" @click="solve(item.id), close()">
											Solved
										</div>
									</div>
								</template>
							</FmMenu>
						</div>
					</div>
				</template>
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

	let openedStream = ref(null)
	let messages = ref([])
	let globalFilters = reactive({
		description: '',
	})

	let res = await useApi('systemMessagesStats.get')

	res.forEach((item, index) => {
		item.id = index
		item.total = item.errors + item.success + item.warning + item.information
	})

	let streams = ref( res )

	async function pin( id ) {
		let res = await useApi('systemMessagesPin.post', {
			body: {ids: [id]}
		})
	}
	async function unpin( id ) {
		let res = await useApi('systemMessagesUnpin.post', {
			body: {ids: [id]}
		})
	}
	async function solve( id ) {
		let res = await useApi('systemMessagesSolved.post', {
			body: {ids: [id]}
		})
	}
	async function openStream( streamStats, types ) {
		openedStream.value = streamStats

		let filters = Object.assign(globalFilters, {
			section: streamStats.id
		})
		if ( types ) filters.type = types

		let res = await useApi('systemMessages.get', { filters })
		messages.value = res.results
	}
	function backToStats() {
		openedStream.value = null
	}

	function fromatDate( date ) {
		return moment( date ).format('DD.MM.YYYY LT')
	}
</script>

<style lang="scss" scoped>
	.hp_block {
		border: 1px solid $border;
		border-radius: 3px;
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
	}
	.hp_content {
		padding: 10px 0;
		background: $separ;
	}
	.hp_row {
		padding: 0 15px;

		& + & {
			margin-top: 20px;
		}
	}
	.hp_text_small {
		font-size: 10px;
		color: $text-lighten;
	}
	.hp_item {
		min-width: 76px;
		padding: 7px 8px;
		border-radius: 5px;
		background: transparent;
		transition: background 0.3s;

		&:not(.no_hover):hover {
			background: #DD4F251A;
			cursor: pointer;
		}

		& + & {
			margin-left: 10px;
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
			border-color: #dfeaff;
		}
		&.red {
			border-color: #FFCCCC;
		}
		&.primary {
			border-color: #FFE8CC;
		}
		&.green {
			border-color: #E1FEF5;
		}
	}
	.more_menu {
		position: absolute;
		top: 10px;
		right: 5px;
	}
	.action_status {
		color: $primary;
		padding: 2px 6px;
		border: 1px solid #FF8A00;
		border-radius: 5px;
	}
	.status_wrap {
		margin: 10px 0;
	}
	.status {
		display: inline-block;
		color: $text-lighten;
		padding: 2px 6px;
		border: 1px solid $text-lighten;
		border-radius: 5px;
	}
</style>
