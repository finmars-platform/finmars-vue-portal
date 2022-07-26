<template>
	<div>

		<div class="flex aic">
			<h3 class="text-h4">Active Tokens</h3>

			<FmBtn type="text" class="m-l-8">Logout from all devices</FmBtn>
		</div>

		<ul class="token_item" v-for="(token, index) in tokenInfo" :key="index">
			<li class="token_item_line" v-if="token.current_master_user_object">
				<b class="token_item_title">Workspace:</b>
				{{ token.current_master_user_object.name }}
				<div
					class="current_token"
					v-if="
						token.current_master_user_object &&
						store.current.base_api_url ==
							token.current_master_user_object.base_api_url
					"
				>
					Current
				</div>
			</li>
			<li class="token_item_line">
				<b class="token_item_title">Access Expire at:</b>
				{{ fromatDate(token.access_token_expires_at) }}
			</li>
			<li class="token_item_line">
				<b class="token_item_title">Refresh Expire at:</b>
				{{ fromatDate(token.refresh_token_expires_at) }}
			</li>
			<li class="token_item_line">
				<b class="token_item_title">Created:</b>
				{{ fromatDate(token.created) }}
			</li>
			<li
				class="flex token_item_line"
				v-if="token.current_master_user_object"
			>
				<b class="token_item_title">API URL: </b>
				<NuxtLink
					:to="`${config.public.apiURL}/${token.current_master_user_object.base_api_url}/api/v1`"
				>
					{{
						`${config.public.apiURL}/${token.current_master_user_object.base_api_url}/api/v1`
					}}
				</NuxtLink>
			</li>
			<li class="token_item_line" v-show="tokenShows[index]">
				<b class="token_item_title">Access Token: </b>
				<div style="max-width: 600px;">{{ token.keycloak_access_token }}</div>

			</li>
			<li class="token_item_line" v-show="tokenShows[index]">
				<b class="token_item_title">Refresh Token: </b>
				<div style="max-width: 600px;">{{ token.keycloak_refresh_token }}</div>

			</li>
			<li class="token_item_line">
				<FmBtn @click="tokenShows[index] = !tokenShows[index]"
							 class="m-r-4">
					{{ tokenShows[index] ? 'Hide' : 'Show'}} tokens
				</FmBtn>

				<FmBtn v-if="
						token.current_master_user_object &&
						store.current.base_api_url ==
							token.current_master_user_object.base_api_url
					"
					class="m-r-4">
					Refresh token
				</FmBtn>

				<FmBtn type="basic" class="m-r-4">Delete token</FmBtn>
			</li>
		</ul>

	</div>
</template>

<script setup>
import moment from "moment";

let tokenInfo = (await useApi("tokenInfo.get")).results;
let tokenShows = ref([])

let store = useStore();
const config = useRuntimeConfig();

function fromatDate(date) {
	return moment(date).format("DD.MM.YYYY LT");
}
</script>

<style lang="scss" scoped>
.token_item {
	padding-top: 20px;
}
.token_item_line {
	padding-bottom: 5px;
	display: flex;
	align-items: center;
}
.token_item_title {
	display: inline-block;
	width: 150px;
}
.current_token {
	border: 1px solid $primary;
	background: #fff;
	border-radius: 4px;
	padding: 2px 5px;
	margin-left: 7px;
}
</style>
