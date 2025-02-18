<template>
	<div class="marketplace-item">
		<FmTaskCard
			v-if="activeTaskId"
			@update="getData"
			@removeTaskId="removeActiveTaskId"
			:task-id="activeTaskId"
			class="task-card"
		/>
		<div class="row extra">
			<h1 class="title"><b>Marketplace</b></h1>
		</div>

		<div class="content">
			<div v-if="checkReadyStatus">
				<FmCard flex="100" class="inm-card-special">
					<div class="row">
						<div class="image">
							<img
								v-if="matchItem.thumbnail"
								:src="matchItem.thumbnail"
								alt=""
							/>
							<div
								v-if="!matchItem.thumbnail"
								class="no-thumbnail"
								:style="{
									backgroundColor: getAvatarColor(
										matchItem.name?.[0]
									)
								}"
							>
								{{ matchItem.name?.charAt(0) }}
							</div>
						</div>

						<div>
							<div
								class="configuration-card-from-marketplace-organization"
							>
								{{ matchItem.organization_object.name }}
							</div>

							<div>
								<h3 class="configuration-card-name">
									{{ matchItem.name }}
								</h3>
							</div>

							<div v-if="matchItem.localItem">
								Current: ({{ matchItem.localItem?.version }}
								{{ matchItem.localItem?.channel }})
							</div>

							<div class="row g-24">
								<FmSelect
									:modelValue="channel"
									@update:modelValue="setSelect"
									@change="getVersions"
									:items="[
										{ value: 'stable', label: 'Stable' },
										{
											value: 'rc',
											label: 'Release Candidate'
										}
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

								<div v-if="!matchItem.localItem">
									<FmBtn
										type="primary"
										class="open"
										@click.prevent.stop="
											installConfiguration(matchItem, version)
										"
									>
										Install
									</FmBtn>
								</div>

								<div v-if="matchItem.localItem">
									<div
										v-if="
											matchItem.latest_release_object
												.version ===
											matchItem.localItem.version
										"
									>
										<FmBtn
											type="primary"
											class="open"
											@click.prevent.stop="
												installConfiguration(
													matchItem,
													version
												)
											"
										>
											Reinstall
										</FmBtn>
									</div>

									<div
										v-if="
											matchItem.latest_release_object
												.version !==
											matchItem.localItem.version
										"
									>
										<FmBtn
											type="primary"
											class="open"
											@click.prevent.stop="
												installConfiguration(
													matchItem,
													version
												)
											"
										>
											Update
										</FmBtn>
									</div>
								</div>

								<div>
									Download count: {{ matchItem.download_count }}
								</div>
							</div>
						</div>
					</div>

					<div>
						<h3 class="sub-title">Description</h3>
						<div v-if="matchItem.description">
							{{ matchItem.description }}
						</div>
						<div v-if="!matchItem.description">No description</div>
					</div>

					<div>
						<h3 class="sub-title">Other Info</h3>

						<div>
							<div
								class="configuration-card-from-marketplace-code"
							>
								Code:
								<b>{{ matchItem.configuration_code }}</b>
							</div>
							<div
								class="configuration-card-from-marketplace-version"
							>
								Version:
								<b>{{ matchItem.latest_release_object?.version }}</b>
							</div>
							<div
								class="configuration-card-from-marketplace-version"
							>
								Developer:
								<b>{{ matchItem.organization_object?.name }}</b>
							</div>
							<div
								class="configuration-card-from-marketplace-version"
							>
								Type:
								<b v-if="matchItem.is_package">Is a Package</b>
								<b v-if="!matchItem.is_package">Is a Module</b>
							</div>
						</div>
					</div>
				</FmCard>

				<div class="loader-overlay" v-show="processing">
					<div class="row">
						<FmLoader :size="100" :positionCenter="true" />
					</div>
				</div>
			</div>
			<div v-if="!checkReadyStatus">
				<div class="row">
					<FmLoader :size="100" :positionCenter="true" />
				</div>
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

	definePageMeta({
		middleware: 'auth'
	});

	const route = useRoute();
	const router = useRouter();

	const {
		installConfiguration,
		readyStatus,
		activeTaskId,
		removeActiveTaskId
	} = useMarketplace();
	const { configCodes } = storeToRefs(useStore());

	const item = ref(null);
	const processing = ref(false);
	const channel = ref('stable');
	const versions = ref([]);
	const version = ref(null);

	const checkReadyStatus = computed(() => readyStatus.data);

	const matchItem = computed(() => {
		const res = cloneDeep(item.value);

		configCodes.value?.forEach(function (localItem) {
			if (res?.configuration_code === localItem.configuration_code) {
				res.localItem = localItem;
			}
		});

		return res;
	});

	async function getData() {
		try {
			item.value = await useApi('marketplaceItem.get', {
				params: { id: route?.params?.id }
			});

			readyStatus.data = true;
		} catch (e) {
			await router.push(useGetNuxtLink(`/marketplace/`, route.params));
			console.warn('Error getTask', e);
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
				filters: payload
			});
			versions.value = data.results;

			if (versions.value?.length) {
				version.value = versions.value[0].version;
			}
		} catch (e) {
			console.warn('Error getVersions', e);
		}
	}

	onMounted(async () => {
		await getData();
		await getVersions();
	});
</script>

<style lang="scss" scoped>
	.marketplace-item {
		font-size: 14px;
		padding: 8px;
	}

	.row {
		display: flex;
		align-items: center;

		&.g-24 {
			gap: 24px;
		}
	}

	.image {
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

	.configuration-card-from-marketplace-organization {
		color: #ddd;
	}

	.configuration-card-name {
		margin: 4px 0;
	}

	.select {
		margin: 0;
	}

	.open {
		margin-top: 6px;
	}

	.title {
		margin-bottom: 24px;
	}

	.sub-title {
		margin: 10px 0;
		font-weight: bold;
	}

	.task-card {
		position: absolute;
		top: 62px;
		right: 10px;
		z-index: 1;
		background: var(--dialog-background-color);
	}

	.select {
		min-width: 170px;
	}
</style>
