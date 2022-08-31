<template>
	<header>
		<FmBreadcrumbs :items="$route.meta.bread" />

		<div class="flex aic">
			<FmMenu class="header_item" v-if="noti.length">
				<template #btn="{ isOpen }">
					<FmIcon class="header_item"
						btn
						icon="notifications"
					/>
				</template>

				<div class="fm_list">
					<div class="fm_message_item"
						v-for="(item, index) in noti"
						:key="index"
					>
						<div class="flex sb">
							<div class="fm_message_item_date">{{ fromatDate(item.created) }}</div>
							<div class="fm_message_item_section">{{ SECTIONS[item.section] }}</div>
						</div>
						<div class="fm_message_item_h">{{ item.title }}</div>
						<div class="fm_message_item_t">
							{{ item.description.length > 65 ? item.description.slice(0, 65) + '...' : item.description }}
						</div>
					</div>
					<div class="tac p-8">
						<FmBtn to="/" type="action">Show ALL</FmBtn>
					</div>
				</div>
			</FmMenu>

			<FmIcon class="header_item"
				v-if="store.current.name"
				btn
				tooltip="Homepage"
				icon="home"
				:href="config.public.oldAppURL"
			/>

			<template v-if="store.current.name">
				<FmMenu class="header_item">
					<template #btn="{ isOpen }">
						<FmBtn type="text" :class="['text-lowercase', {active: isOpen}]">
							{{ store.current.name }}
						</FmBtn>
					</template>

					<div class="fm_list">
						<div class="fm_list_item"
							v-for="(item, index) in store.databases"
							:key="index"
							@click="setCurrent( item.id )"
						>
							{{ item.name }}
						</div>
					</div>
				</FmMenu>
			</template>

			<FmMenu class="header_item">
				<template #btn="{ isOpen }">
					<FmBtn type="text" :class="['text-lowercase', {active: isOpen}]" icon="account_box">
						{{ store.user.username }}
					</FmBtn>
				</template>

				<div class="fm_list">
					<div class="fm_list_item"
						v-for="(item, index) in menu"
						:key="index"
						@click="item.cb()"
					>
						{{ item.name }}
					</div>
				</div>
			</FmMenu>
		</div>
	</header>
</template>

<script setup>
	import moment from 'moment'

	const store = useStore()
	const config = useRuntimeConfig()
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

	let menu = ref([
		{name: 'Profile', cb: () => {navigateTo('/profile')}},
		{name: 'Logout', cb: () => {
			useCookie('access_token').value = null
			useCookie('refresh_token').value = null
			window.location.href = '/'
		}},
	])
	let noti = ref([])

	loadNoti()

	async function loadNoti( id ) {
		let res = await useApi('systemMessages.get', {filters: {page_size: 3, only_new: true}})

		noti.value = res.results
	}

	function fromatDate( date ) {
		if ( moment().diff(moment(date), 'hours') > 12 )
			return moment( date ).format('DD.MM.YYYY HH:mm')

		return moment( date ).fromNow()
	}

	async function setCurrent( id ) {
		let res = await useApi('masterSet.patch', {params: {id}})

		if ( res ) window.location.href = config.public.oldAppURL
	}
</script>

<style lang="scss" scoped>
	header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		height: 56px;
		background: $main-darken;
		padding: 0 $content-padding-x;
	}
	.header_item + .header_item {
		margin-left: 10px;
	}
	.fm_message_item {
		padding: 11px;
		border-bottom: 1px solid $border;
		font-size: 14px;
		width: 280px;

		&_h, &_t {
			margin-top: 11px;
		}
	}
	.fm_message_item_date {
		color: $text-lighten;
	}
	.fm_message_item_section {
		color: $text-lighten;
		font-weight: 500;
	}
</style>
