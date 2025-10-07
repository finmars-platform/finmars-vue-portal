<template>
	<div class="marketplace-item container">
		<div class="navigation row">
			<FmButton type="secondary" @click="$router.back()">Go Back</FmButton>
		</div>

		<div class="layout content-area" v-if="checkReadyStatus">
			<!-- Left: Main Content -->
			<div class="main">
				<div class="tabs row">
					<button
						v-for="tab in ['General', 'Installation', 'Changelog', 'FAQ']"
						:key="tab"
						:class="['tab-button', { active: activeTab === tab }]"
						@click="activeTab = tab"
					>
						{{ tab }}
					</button>
				</div>

				<div class="tab-content">
					<div v-if="activeTab === 'General'">
						<div class="row item-header">
							<div class="image">
								<img v-if="matchItem.thumbnail" :src="matchItem.thumbnail" alt="" />
								<div
									v-else
									class="no-thumbnail"
									:style="{ backgroundColor: getAvatarColor(matchItem.name?.[0]) }"
								>
									{{ matchItem.name?.charAt(0) }}
								</div>
							</div>
							<div class="info">
								<h3 class="configuration-card-name" v-if="!matchItem.description">{{ matchItem.name }}</h3>
								<p class="marketplace-item-description" v-html="matchItem.description"></p>
							</div>
						</div>
					</div>

					<div v-if="activeTab === 'Installation'">
						<h3>Installation</h3>
						<p>
							<span v-if="matchItem.instruction">{{ matchItem.instruction }}</span>
							<span v-else>No instruction available</span>
						</p>
					</div>

					<div v-if="activeTab === 'Changelog'">
						<h3>Changelog</h3>
						<p>
              <span v-if="matchItem.latest_release_object.changelog">
                {{ matchItem.latest_release_object.changelog }}
              </span>
							<span v-else>No changelog available</span>
						</p>
					</div>

					<div v-if="activeTab === 'FAQ'">
						<h3>FAQ</h3>
						<div v-if="matchItem.faq && matchItem.faq.length">
							<div v-for="(answer, question) in matchItem.faq" :key="question">
								<b>{{ question }}</b><br />
								<span>{{ answer }}</span>
							</div>
						</div>
						<p v-else>No FAQ available</p>
					</div>
				</div>

				<div class="loader-overlay" v-show="processing">
					<div class="row">
						<FmLoader :size="100" :positionCenter="true" />
					</div>
				</div>
			</div>

			<!-- Sidebar -->
			<aside class="sidebar">
				<!-- Actions Block -->
				<div class="sidebar-block actions">
					<h4>Getting Started</h4>




					<div class="selectors">
						<FmSelect
							:modelValue="channel"
							@update:modelValue="setSelect"
							@change="getVersions"
							:items="[
                { value: 'stable', label: 'Stable' },
                { value: 'rc', label: 'Release Candidate' }
              ]"
							prop_id="value"
							prop_name="label"
							class="select"
						/>
						<FmSelect
							v-model="version"
							@change="getVersions"
							:items="versions"
							prop_id="version"
							prop_name="version"
							class="select"
						/>
					</div>
					<div class="action-button" v-if="matchItem.is_allowed_to_install">
						<FmBtn
							type="primary"
							@click.prevent.stop="installConfiguration(matchItem, version)"
						>
							{{ !matchItem.localItem
							? 'Install'
							: matchItem.latest_release_object.version === matchItem.localItem.version
								? 'Reinstall'
								: 'Update' }}
						</FmBtn>
					</div>

					<div class="action-button" v-if="!matchItem.is_allowed_to_install">
						<FmBtn
							type="primary"
							class="open disabled-btn"
						>
							License Required
						</FmBtn>
					</div>


					<div class="row key-value">
						<dt>Pricing</dt><dd>{{ item.pricing_tier === 'paid' ? 'Paid' : 'Free' }}</dd>
					</div>

					<div class="row key-value">
						<dt>Downloads</dt><dd>{{ matchItem.download_count }}</dd>
					</div>

				</div>

				<!-- Info Block -->
				<div class="sidebar-block info-block">
					<h4>Info</h4>
					<dl>
						<div class="row key-value">
							<dt>Code</dt><dd>{{ matchItem.configuration_code }}</dd>
						</div>
						<div class="row key-value">
							<dt>Version</dt><dd>{{ matchItem.latest_release_object?.version }}</dd>
						</div>
						<div class="row key-value">
							<dt>Type</dt><dd>{{ matchItem.is_package ? 'Package' : 'Module' }}</dd>
						</div>
						<div class="row key-value">
							<dt>License</dt><dd>{{ matchItem.license }}</dd>
						</div>
						<div class="row key-value">
							<dt>Created</dt><dd>{{ formattedCreated }}</dd>
						</div>
						<div class="row key-value">
							<dt>Updated</dt><dd>{{ formattedModified }}</dd>
						</div>

					</dl>
				</div>

				<!-- Organization Block -->
				<div class="sidebar-block org-block">
					<h4>Organization</h4>
					<dl>
						<div class="row key-value">
							<dt>Created by</dt><dd>{{ matchItem.organization_object.name }}</dd>
						</div>
						<div class="row key-value" v-if="matchItem.organization_object.website">
							<dt>Website</dt>
							<dd>
								<a :href="matchItem.organization_object.website" target="_blank">
									{{ matchItem.organization_object.website }}
								</a>
							</dd>
						</div>
						<div class="row key-value">
							<dt>Support</dt>
							<dd>
								<a :href="'mailto:' + matchItem.organization_object.email">
									{{ matchItem.organization_object.email }}
								</a>
							</dd>
						</div>
					</dl>
				</div>
			</aside>
		</div>

		<div v-else class="loading">
			<div class="row">
				<FmLoader :size="100" :positionCenter="true" />
			</div>
		</div>
	</div>
</template>

<script setup>
	import { useGetNuxtLink } from '~/composables/useMeta';
	import { useMarketplace } from '~/composables/useMarketplace';
	import { getAvatarColor } from '~/utils/commonHelper';
	import { storeToRefs } from 'pinia';
	import useStore from '~/stores/useStore';
	import cloneDeep from 'lodash/cloneDeep';

	definePageMeta({ middleware: 'auth' });

	const route = useRoute();
	const router = useRouter();
	const store = useStore();

	const { installConfiguration, readyStatus } = useMarketplace();
	const { configCodes } = storeToRefs(useStore());

	const item = ref(null);
	const processing = ref(false);
	const channel = ref('stable');
	const versions = ref([]);
	const version = ref(null);

	const formattedCreated = computed(() => {
		if (!matchItem.value?.created) return '';
		return matchItem.value.created.replace(/T/, ' ').slice(0, 16);
	});
	const formattedModified = computed(() => {
		if (!matchItem.value?.modified) return '';
		return matchItem.value.modified.replace(/T/, ' ').slice(0, 16);
	});

	const activeTab = ref('General');
	const checkReadyStatus = computed(() => readyStatus.data);

	const matchItem = computed(() => {
		const res = cloneDeep(item.value);
		configCodes.value?.forEach(localItem => {
			if (res?.configuration_code === localItem.configuration_code) {
				res.localItem = localItem;
			}
		});
		return res;
	});

	async function getData() {
		try {
			item.value = await useApi('marketplaceItem.get', {
				params: { id: route.params.id },
				headers: { 'X-Client-Code': store.ecosystemDefaults.license_key }
			});
			readyStatus.data = true;
		} catch {
			router.back();
		}
	}

	function setSelect(newVal) {
		channel.value = newVal;
		getVersions();
	}

	async function getVersions() {
		versions.value = [];
		const payload = {
			page_size: 1000,
			page: 1,
			configuration_code: matchItem.value.configuration_code,
			channel: channel.value,
			ordering: '-created'
		};
		try {
			const data = await useApi('marketplaceItemVersion.get', {
				filters: payload,
				headers: { 'X-Client-Code': store.ecosystemDefaults.license_key }
			});
			versions.value = data.results;
			if (versions.value.length) version.value = versions.value[0].version;
		} catch {}
	}

	onMounted(async () => {
		await getData();
		await getVersions();
	});
</script>

<style lang="scss" scoped>
	.container {
		padding: 24px;
	}
	.navigation {
		margin-bottom: 16px;
	}
	.content-area {
		display: flex;
		gap: 32px;
	}
	.tab-button {
		padding: 12px 24px;
		margin-right: 8px;
		background: #f5f5f5;
		border: none;
		cursor: pointer;
	}
	.tab-button.active {
		background: #e0e0e0;
		font-weight: bold;
	}

	.tab-content {
		min-width: 56vw;
		padding: 16px 8px;
	}

	.sidebar {
		position: sticky;
		top: 24px;
		align-self: flex-start;
		max-height: calc(100vh - 48px);
		overflow: auto;
		min-width: 420px;
	}
	.sidebar-block {
		background: #fafafa;
		padding: 16px;
		margin-bottom: 16px;
		border-radius: 4px;
	}
	.sidebar-block h4 {
		margin: 0 0 8px;
		font-size: 16px;
		color: #333;
	}
	.actions .selectors .select {
		width: 100%;
		margin-bottom: 8px;
	}
	.action-button {
		margin: 8px 0;

		.fm_btn {
			width: 50%;
			margin: 16px auto;
			display: BLOCK;
		}

		.disabled-btn {
			pointer-events: none;
			opacity: .7;
		}
	}
	.key-value {
		display: flex;
		justify-content: space-between;
		padding: 4px 0;
	}
	.key-value dt {
		font-weight: bold;
	}
	.key-value dd {
		margin: 0;
	}
	.loading {
		text-align: center;
		padding: 40px 0;
	}

	.image {

		margin: 16px;
		padding-right: 24px;

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
			font-size: 20px;
		}
	}
</style>
<style>
	.marketplace-item-description {
		/* Base font settings */
		font-family: Arial, sans-serif;
		color: #333;
		line-height: 1.6;
	}

	/* Headings */
	.marketplace-item-description h1 {
		font-size: 2em;
		margin: 0.67em 0;
	}
	.marketplace-item-description h2 {
		font-size: 1.75em;
		margin: 0.75em 0;
	}
	.marketplace-item-description h3 {
		font-size: 1.5em;
		margin: 0.83em 0;
	}
	.marketplace-item-description h4 {
		font-size: 1.25em;
		margin: 1.12em 0;
	}
	.marketplace-item-description h5 {
		font-size: 1em;
		margin: 1.5em 0;
	}
	.marketplace-item-description h6 {
		font-size: 0.875em;
		margin: 1.67em 0;
	}

	/* Paragraphs */
	.marketplace-item-description p {
		margin: 1em 0;
	}

	/* Unordered lists */
	.marketplace-item-description ul {
		margin: 1em 0;
		padding-left: 1.5em;
		list-style-type: disc;
	}
	.marketplace-item-description ul li {
		margin: 0.5em 0;
	}

	/* Ordered lists */
	.marketplace-item-description ol {
		margin: 1em 0;
		padding-left: 1.5em;
		list-style-type: decimal;
	}
	.marketplace-item-description ol li {
		margin: 0.5em 0;
	}

	/* Links */
	.marketplace-item-description a {
		color: #0066cc;
		text-decoration: none;
	}
	.marketplace-item-description a:hover {
		text-decoration: underline;
	}

	/* Code blocks or inline code */
	.marketplace-item-description code {
		font-family: monospace;
		background: #f4f4f4;
		padding: 2px 4px;
		border-radius: 3px;
	}
</style>
