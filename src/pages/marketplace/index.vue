<template>
	<div class="marketplace-page">
		<div class="row extra">
			<h1 class="title"><b>Marketplace</b></h1>

			<FmIcon
				btn-primary
				icon="refresh"
				class="refresh"
				style="display: inline-flex"
				@click="getData"
			/>

			<FmCheckbox
				:model-value="isShowModules"
				label="Show Modules"
				@update:model-value="setShowModules"
			/>
			<FmTaskCard
				v-if="activeTaskId"
				@update="getData"
				@removeTaskId="removeActiveTaskId"
				:task-id="activeTaskId"
				class="task-card"
			/>
		</div>
		<div class="m-t-8 m-b-8 marketplace-page-filters row">
			<FmInputText
				:noIndicatorButton="true"
				label="Search"
				:model-value="filters.query"
				@update:model-value="setFiltersQueryDebounced"
			/>
		</div>

		<div style="margin: 24px 0; justify-content: end; display: flex">
			<div
				v-if="ecosystemDefaultsRef.license_key"
				style="
					display: flex;
					justify-content: center;
					align-items: center;
				"
			>
				Linked with&nbsp;
				<a
					href="https://license.finmars.com/account/"
					target="_blank"
					style="text-decoration: underline"
					>Finmars ID</a
				>

				<FmButton type="secondary" @click="unlinkWithFinmars"
					>Unlink
				</FmButton>
			</div>

			<div v-if="!ecosystemDefaultsRef.license_key">
				<FmButton type="primary" @click="linkWithFinmars"
					>Link with Finmars ID
				</FmButton>
			</div>
		</div>

		<div v-if="readyStatus.data" class="list">
			<FmCard v-for="item in matchItems" :key="item" class="card">
				<div class="row top">
					<div class="image">
						<img
							v-if="item.thumbnail"
							:src="item.thumbnail"
							alt=""
						/>
						<div
							v-if="!item.thumbnail"
							:style="{
								backgroundColor: getAvatarColor(item.name?.[0])
							}"
							class="no-thumbnail"
						>
							{{ item.name?.charAt(0) }}
						</div>
					</div>

					<div>
						<h3 class="name" style="margin: 4px 0">
							{{ item.name }}
						</h3>
						<div class="code">
							code:&nbsp;<b>{{ item.configuration_code }}</b>
						</div>
						<div class="version">
							version:&nbsp;<b>{{
								item.latest_release_object?.version
							}}</b>
						</div>
						<div class="license">
							license:&nbsp;<b>{{ item.license }}</b>
						</div>
					</div>
				</div>

				<div class="configuration-short-description">
					<p>{{ item.short_description }}</p>
				</div>

				<div class="org-badge-row">
					<span
						class="org-name"
						v-if="!item.organization_object.website"
						>By <i>{{ item.organization_object.name }}</i></span
					>
					<span
						class="org-name"
						v-if="item.organization_object.website"
						>By
						<i
							><a
								v-bind:href="item.organization_object.website"
								target="_blank"
								>{{ item.organization_object.name }}</a
							></i
						></span
					>
					<span
						class="tier-badge"
						:class="item.pricing_tier === 'paid' ? 'paid' : 'free'"
					>
						{{ item.pricing_tier === 'paid' ? 'Paid' : 'Free' }}
					</span>
				</div>

				<div v-if="!item.localItem && item.is_allowed_to_install">
					<FmBtn
						type="primary"
						class="open"
						@click.prevent.stop="installConfiguration(item)"
					>
						Install
					</FmBtn>
				</div>

				<div v-if="!item.localItem && !item.is_allowed_to_install">
					<FmBtn type="primary" class="open disabled-btn">
						License Required
					</FmBtn>
				</div>

				<div v-if="item.localItem" class="m-b-8">
					<div class="current">
						Current: ({{ item.localItem.version }}
						{{ item.localItem.channel }})
					</div>

					<div
						v-if="
							item.latest_release_object?.version ===
							item.localItem.version
						"
					>
						<FmBtn
							class="open"
							@click.prevent.stop="installConfiguration(item)"
						>
							Reinstall
						</FmBtn>
					</div>

					<div
						v-if="
							item.latest_release_object?.version !==
							item.localItem.version
						"
					>
						<FmBtn
							class="open"
							@click.prevent.stop="installConfiguration(item)"
						>
							Update
						</FmBtn>
					</div>
				</div>

				<div @click="openCard(item.id)" class="show-details-button">
					Show Details
				</div>
			</FmCard>
		</div>
		<div v-else style="width: 100%" class="row">
			<FmLoader :size="100" :positionCenter="true" />
		</div>
		<div class="pagination-bar row m-t-16">
			<FmBtn
				class="button"
				:type="currentPage === 1 ? 'disabled' : 'text'"
				@click="openPreviousPage"
			>
				Previous
			</FmBtn>

			<div class="row">
				<div v-for="page in pages" :key="page">
					<FmBtn
						v-if="page.number"
						:type="currentPage === page.number && 'primary'"
						class="button"
						@click="openPage(page)"
					>
						{{ page.caption }}
					</FmBtn>

					<div v-if="!page.number" class="caption">
						{{ page.caption }}
					</div>
				</div>
			</div>
			<FmBtn
				v-if="currentPage < totalPages"
				type="text"
				class="button"
				@click="openNextPage"
			>
				Next
			</FmBtn>
		</div>
	</div>
</template>

<script setup>
	import { useMarketplace } from '~/composables/useMarketplace';
	import { useGetNuxtLink } from '~/composables/useMeta';
	import { getAvatarColor } from '~/utils/commonHelper';

	definePageMeta({
		middleware: 'auth'
	});

	const route = useRoute();
	const router = useRouter();
	const store = useStore();

	const ecosystemDefaultsRef = ref(
		JSON.parse(JSON.stringify(store.ecosystemDefaults))
	);

	const {
		getData,
		isShowModules,
		activeTaskId,
		filters,
		matchItems,
		installConfiguration,
		currentPage,
		totalPages,
		pages,
		openNextPage,
		readyStatus,
		openPreviousPage,
		openPage,
		setFiltersQueryDebounced,
		setShowModules,
		removeActiveTaskId
	} = useMarketplace();

	function openCard(id) {
		router.push(useGetNuxtLink(`/marketplace/${id}`, route.params));
	}

	onMounted(async () => {
		getData();

		// 1. See if URL has “#access_token=…”
		if (window.location.hash) {
			const hash = window.location.hash.slice(1); // drop the “#”
			const params = new URLSearchParams(hash);
			const token = params.get('access_token');

			console.log('ACCESS TOKEN FOR LICENSE SERVER IS RECEIVED!', token);

			if (token) {
				// 2. Clean up the URL (remove the hash)
				window.history.replaceState(null, '', window.location.pathname);

				// 3. Call your license API
				try {
					const response = await fetch(
						'https://license.finmars.com/api/v1/license-key/',
						{ headers: { Authorization: `Token ${token}` } }
					).then(function (response) {
						return response.json();
					});
					let key = null;

					if (response.results.length) {
						key = response.results[0].key;
					}

					// 4. Save the key
					localStorage.setItem('finmarsLicenseKey', key);

					ecosystemDefaultsRef.value.license_key = key;

					let res = await useApi('defaultSettings.put', {
						params: { id: ecosystemDefaultsRef.value.id },
						body: ecosystemDefaultsRef.value
					});

					// 5. Show success (you can update your UI as you like)
					console.log('✅ License linked:', res);
				} catch (e) {
					console.error('❌ Could not fetch license', e);
				}
			}
		}
	});

	const clientId = 'finmars-license';
	const realm = 'finmars'; // e.g. “finmars”
	const origin = window.location.origin;
	const pathName = window.location.pathname;
	const redirectUri = encodeURIComponent(origin + pathName);

	function linkWithFinmars() {
		const url =
			`https://id-auth.finmars.io/realms/${realm}` +
			`/protocol/openid-connect/auth` +
			`?client_id=${clientId}` +
			`&redirect_uri=${redirectUri}` +
			`&response_type=token` +
			`&scope=openid`;

		window.location.href = url;
	}

	async function unlinkWithFinmars() {
		ecosystemDefaultsRef.value.license_key = '';

		let res = await useApi('defaultSettings.put', {
			params: { id: ecosystemDefaultsRef.value.id },
			body: ecosystemDefaultsRef.value
		});
	}
</script>

<style lang="scss" scoped>
	.marketplace-page {
		font-size: 14px;
		padding: 8px;

		.refresh {
			padding: 0;
		}

		.row {
			display: flex;
			align-items: center;

			&.extra {
				gap: 12px;
			}

			&.top {
				align-items: flex-start;
			}
		}

		.card {
			aspect-ratio: 3 / 2; /* width-to-height ratio */
			height: auto; /* height follows the ratio */
			width: 100%;
			//padding: 16px 16px 46px;
			border: 1px solid var(--table-border-color);
			margin: 1px;
			position: relative;
			box-shadow: none;
			//cursor: pointer;
			background: var(--card-background-color);
			color: var(--secondary-color);
			display: flex;
			flex-direction: column;
			border-radius: 2px;
			transition: opacity 0.2s;

			//&:hover {
			//	opacity: 0.8;
			//}

			.image {
				padding-right: 16px;

				img {
					height: 80px;
					width: 80px;
					min-width: 80px;
					border-radius: 50%;
				}

				.no-thumbnail {
					height: 80px;
					width: 80px;
					background: var(--primary-color);
					border-radius: 50%;
					text-align: center;
					color: #fff;
					line-height: 80px;
					font-size: 2em;
				}
			}

			a {
				display: inline;
			}

			.name {
				font-size: 24px;
			}

			.code {
				font-size: 14px;
			}

			.version {
				font-size: 14px;
			}

			.show-details-button {
				cursor: pointer;
				text-decoration: underline;
				font-size: 14px;
				position: absolute;
				bottom: 20px;
				left: 18px;

				&:hover {
					opacity: 0.8;
				}
			}

			.open {
				background: var(--primary-color);
				font-size: 18px;
				position: absolute;
				bottom: 32px;
				margin: 0;
				min-height: 24px;
				line-height: 24px;
				min-width: 120px;
				right: 16px;

				&.disabled-btn {
					pointer-events: none;
					opacity: 0.7;
				}
			}

			.current {
				margin-top: 1rem;
			}
		}

		.title {
			font-size: 20px;
		}

		.list {
			display: grid;
			grid-template-columns: repeat(3, 1fr);
			gap: 8px;
			justify-items: center;
		}

		.configuration-short-description {
			margin: 8px 0 8px;
			overflow: hidden;
			text-overflow: ellipsis;
			max-height: 80px;
		}

		.org-badge-row {
			display: flex;
			justify-content: space-between;
			align-items: center;
			margin-bottom: 4px;
			margin-top: 8px;
		}

		.org-name {
			font-size: 14px;
			color: var(--secondary-color);
			text-decoration: underline;

			&:hover {
				opacity: 0.8;
			}
		}

		.tier-badge {
			font-size: 10px;
			width: 64px;
			text-align: center;
			padding: 2px 6px;
			border-radius: 4px;
			text-transform: uppercase;
			position: absolute;
			bottom: 8px;
			right: 44px;
		}

		.tier-badge.free {
			background: darkseagreen;
			color: #006064;
		}

		.tier-badge.paid {
			background: darksalmon;
			color: #c62828;
		}

		.button {
			height: 24px;
			min-width: 24px;
			margin: 2px;
			min-height: 24px;
			line-height: 24px;
		}

		.caption {
			margin: 10px;
		}

		.task-card {
			position: absolute;
			top: 62px;
			right: 10px;
			z-index: 1;
		}
	}
</style>
