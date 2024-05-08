<template>
	<header>
		<FmBreadcrumbs :items="$route.meta.bread"/>

		<div class="flex aic height-100">
			<template
				v-if="
					store.current.name && !$route.path.includes('/profile')
				"
			>
				<FmMenu class="header_item header_icon_btn" v-if="noti">
					<template #btn="{ isOpen }">
						<FmIcon
							class="noti_icon"
							:class="{ active: noti.length }"
							btn
							icon="notifications"
						/>
					</template>

					<div class="fm_list">
						<template v-if="noti.length">
							<div
								class="fm_message_item"
								v-for="(item, index) in noti"
								:key="index"
							>
								<div class="flex sb">
									<div class="fm_message_item_date">
										{{ fromatDate(item.created) }}
									</div>
									<div class="fm_message_item_section">
										{{ SECTIONS[item.section] }}
									</div>
								</div>
								<div class="fm_message_item_h">{{ item.title }}</div>
								<div class="fm_message_item_t">
									{{
										item.description.length > 65
											? item.description.slice(0, 65) + "..."
											: item.description
									}}
								</div>
							</div>
							<div class="tac p-8">
								<FmBtn to="/home" type="action">Show ALL</FmBtn>
							</div>
						</template>
						<div class="p-16" v-else>No new messages</div>
					</div>
				</FmMenu>

				<a :href="`${config.public.apiURL}/${store.realm_code}/${store.space_code}/a/#!/processes`">
					<FmIcon
						icon="cloud_download"
						btn
						tooltip="Open Active Processes"
						class="header_item header_icon_btn"
					/>
				</a>

				<FmMenu class="header_item header_icon_btn">
					<template #btn="{ isOpen }">
						<FmIcon
							icon="help"
							btn
							tooltip="Open help menu"
							:class="['header_icon_btn header_item', 'm-l-8', 'm-r-8', {active: isOpen}]"
						/>
					</template>

					<template #default="{ close }">
						<div class="fm_list">
							<div class="fm_list_item">
								<a class="fm_message_item_date" :href="`${apiUrl}/documentation`">
									Documentation
								</a>
							</div>
							<div class="fm_list_item">
								<a class="fm_message_item_date"
								   :href="`${apiUrl}/${store.realm_code}/${store.space_code}/docs/api/v1/`"
								   target="_blank">
									API Reference
								</a>
							</div>
						</div>
					</template>
				</FmMenu>
			</template>

			<FmIcon
				class="header_item header_icon_btn"
				v-if="
					store.current.name && $route.name === 'profile'
				"
				btn
				tooltip="Homepage"
				icon="home"
				@click="$router.push('/home')"
			/>

			<template v-if="store.current.name">
				<FmMenu class="header_item height-100">
					<template #btn="{ isOpen }">
						<FmBtn type="text"
							   :class="['header_text_btn', 'm-l-8', 'm-r-8', {active: isOpen}]"
							   style="height: 100%;">
							{{ store.current.name }}
						</FmBtn>
					</template>

					<template #default="{ close }">
						<div class="fm_list">
							<div
								class="fm_list_item"
								v-for="(item, index) in store.masterUsers"
								:key="index"
								@click="setCurrent(item), close()"
							>
								{{ item.name }}
							</div>
						</div>
					</template>
				</FmMenu>
			</template>

			<FmMenu class="header_item height-100">
				<template #btn="{ isOpen }">
					<FmBtn type="text"
						   :class="['header_text_btn', {active: isOpen}]"
						   style="height: 100%;"
					>

						<div class="user-profile">
							<img class="user-profile-picture" v-bind:src="store.user.profile_picture" alt="">
							<div class="user-profile-username">
								<span v-if="store.user.first_name">{{ store.user.first_name }}</span>
								<span v-if="!store.user.first_name">{{ store.user.username }}</span>
							</div>
						</div>
					</FmBtn>
				</template>
				<template #default="{ close }">
					<div class="fm_list">
						<!--						<div
													class="fm_list_item"
													v-for="(item, index) in menu"
													:key="index"
													@click="item.cb(), close()"
												>
													{{ item.name }}
												</div>-->
						<div
							@click="goToProfile(), close()"
							class="fm_list_item"
						>
							<span class="side-nav-title">Profile</span>
						</div>

						<div
							class="fm_list_item"
							@click="toggleTheme(), close()"
						>
							{{toggleText}}
						</div>

						<div
							class="fm_list_item"
							@click="openAccManager, close()"
						>Account Security
						</div>

						<a
							class="fm_list_item"
							:href="`${apiUrl}/logout`"
						>Logout</a>
					</div>
				</template>
			</FmMenu>
		</div>
	</header>
</template>

<script setup>
import dayjs from "dayjs"

import formbricks from "@/services/formbricks";

const store = useStore()
const config = useRuntimeConfig()
const apiUrl = config.public.apiURL;

const SECTIONS = {
	1: "Events",
	2: "Transactions",
	3: "Instruments",
	4: "Data",
	5: "Prices",
	6: "Report",
	7: "Import",
	8: "Activity log",
	9: "Schedules",
	10: "Other",
}

async function openAccManager() {
	const kc = await uKeycloak();
	kc.accountManagement();
}

let noti = ref(null)

watchEffect(
	() => {
		if (store.isUrlValid) {
			loadNoti()
		}
	}
)

function goToProfile() {

	window.location.href = '/v/profile'

}

async function loadNoti(id) {
	let res = await useApi("systemMessages.get", {
		filters: {only_new: true},
	})

	if (res.error) return false
	noti.value = res.results.filter((item) => !item.is_pinned).slice(0, 3)
}

function fromatDate(date) {
	if (dayjs().diff(dayjs(date), "hours") > 12)
		return dayjs(date).format("DD.MM.YYYY HH:mm")

	return dayjs(date).fromNow()
}

async function setCurrent(item) {
	// let res = await useApi("masterSet.patch", {params: {id: item.id}})

	window.location.href = '/' + item.realm_code + '/' + item.space_code + '/v/home'
}


async function init() {

	console.log('store.user', store.user.username)
	console.log('store.email', store.user.email)
	console.log('store.us', store.user)
	// await formbricks.setAttribute('host', window.location.href)
	// await formbricks.setAttribute('username', store.user.username)
	// await formbricks.setAttribute('first_name', store.user.first_name)
	// await formbricks.setAttribute('last_name', store.user.last_name)
	formbricks.setUserId(store.user.id)
	formbricks.setEmail(store.user.email)
	await formbricks.registerRouteChange();
}

const updateUserD = useDebounce(function () {
	/* Not using store.updateUser() because it can toggle dark mode back after promise resolved
	 * by running `this.user = res` */
	const options = {
		params: { id: store.user.id },
		body: store.user,
	};

	useApi('user.put', options);

}, 2000);

function toggleTheme() {
	store.user.data.dark_mode = !store.user.data.dark_mode;
	updateUserD();
}

const toggleText = computed(() => !store.user.data.dark_mode ? 'Enable Dark Theme' : 'Disable Dark Theme' )

init()


</script>

<style lang="scss" scoped>
@mixin header_txt {
	font-weight: 500;
	color: var(--card-secondary-text-color);
	text-transform: initial;
}

header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	height: 52px;
	background: var(--page-background-color);
	padding: 0 $content-padding-x;
	border-bottom: 1px solid var(--table-border-color);
	@include header_txt;
}

.fm_list {
	background: var(--page-background-color);
}
.fm_list_item {
	color: var(--primary-color);
}

/*.header_item + .header_item {
	margin-left: 10px;
}*/
:deep(.header_text_btn),
:deep(.fm_btn.text.header_text_btn) {
	@include header_txt;
	padding: 0 12px;
	color: var(--primary-color);
}

.header_icon_btn {
	margin-left: 2px;
	margin-right: 2px;
}

.fm_message_item {
	padding: 11px;
	border-bottom: 1px solid var(--table-border-color);
	font-size: 14px;
	width: 280px;

	&_h,
	&_t {
		margin-top: 11px;
	}

	&_h {
		font-weight: 500;
	}
}

.fm_message_item_date {
	color: var(--card-secondary-text-color);
}

.fm_message_item_section {
	color: var(--card-secondary-text-color);
	font-weight: 500;
}

.noti_icon {
	position: relative;

	&.active:after {
		content: "";
		display: block;
		position: absolute;
		top: 9px;
		right: 8px;
		width: 7px;
		height: 7px;
		border-radius: 50%;
		background: $primary;
		border: 2px solid $main-darken;
	}
}

.user-profile {
	display: flex;
	justify-content: space-between;
	align-items: center;

	.user-profile-picture {
		width: 32px;
		margin-right: 8px;
	}
}

</style>
