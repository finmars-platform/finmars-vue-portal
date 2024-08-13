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
			<h1 class="title">Marketplace</h1>
		</div>

		<div class="content">
			<div v-if="checkReadyStatus">
				<FmCard flex="100" class="inm-card-special">
					<div class="row">
						<div class="image">
							<img v-if="item.thumbnail" :src="item.thumbnail" alt="" />
							<div
								v-if="!item.thumbnail"
								class="no-thumbnail"
								:style="{ backgroundColor: getAvatar(item.name?.[0]) }"
							>
								{{ item.name?.charAt(0) }}
							</div>
						</div>

						<div>
							<div class="configuration-card-from-marketplace-organization">
								{{ item.organization_object.name }}
							</div>

							<div>
								<h3 class="configuration-card-name">
									{{ item.name }}
								</h3>
							</div>

							<div v-if="item.localItem">
								Current: ({{ item.localItem?.version }}
								{{ item.localItem?.channel }})
							</div>

							<div class="row g-24">
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

								<div v-if="!item.localItem">
									<FmBtn
										type="primary"
										class="open"
										@click.prevent.stop="installConfiguration(item)"
									>
										Install
									</FmBtn>
								</div>

								<div v-if="item.localItem">
									<div
										v-if="
											item.latest_release_object.version ==
											item.localItem.version
										"
									>
										<FmBtn
											type="primary"
											class="open"
											@click.prevent.stop="installConfiguration(item)"
										>
											Reinstall
										</FmBtn>
									</div>

									<div
										v-if="
											item.latest_release_object.version !=
											item.localItem.version
										"
									>
										<FmBtn
											type="primary"
											class="open"
											@click.prevent.stop="installConfiguration(item)"
										>
											Update
										</FmBtn>
									</div>
								</div>

								<div>Download count: {{ item.download_count }}</div>
							</div>
						</div>
					</div>

					<div>
						<h3 class="sub-title">Description</h3>
						<div v-if="item.description">{{ item.description }}</div>
						<div v-if="!item.description">No description</div>
					</div>

					<div>
						<h3 class="sub-title">Other Info</h3>

						<div>
							<div class="configuration-card-from-marketplace-code">
								Code:
								<b>{{ item.configuration_code }}</b>
							</div>
							<div class="configuration-card-from-marketplace-version">
								Version: <b>{{ item.latest_release_object?.version }}</b>
							</div>
							<div class="configuration-card-from-marketplace-version">
								Developer: <b>{{ item.organization_object?.name }}</b>
							</div>
							<div class="configuration-card-from-marketplace-version">
								Type:
								<b v-if="item.is_package">Is a Package</b>
								<b v-if="!item.is_package">Is a Module¬</b>
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
	import { useGetNuxtLink } from '~/composables/useMeta'
	import { useMarketplace } from '~/composables/useMarketplace'

	const route = useRoute()
	const router = useRouter()

	const {
		installConfiguration,
		readyStatus,
		getAvatar,
		activeTaskId,
		removeActiveTaskId
	} = useMarketplace()

	const item = ref(null)
	const processing = ref(false)
	const channel = ref('stable')
	const versions = ref([])
	const version = ref(null)

	const checkReadyStatus = computed(() => readyStatus.data)

	async function getData() {
		const { configCodes } = useStore()

		try {
			item.value = await useApi('marketplaceItem.get', {
				params: { id: route?.params?.id }
			})

			readyStatus.data = true

			configCodes?.forEach(function (localItem) {
				if (item.value.configuration_code === localItem.configuration_code) {
					item.value.localItem = localItem
				}
			})
		} catch (e) {
			await router.push(useGetNuxtLink(`/marketplace/`, route.params))
			console.warn('Error getTask', e)
		}
	}

	function setSelect(newVal) {
		channel.value = newVal

		getVersions()
	}

	async function getVersions() {
		versions.value = []

		const payload = {
			pageSize: 10,
			page: 1,
			configuration_code: item.value.configuration_code,
			channel: channel.value,
			ordering: '-created'
		}

		try {
			const data = await useApi('marketplaceItemVersion.get', {
				filters: payload
			})
			versions.value = data.results

			if (versions.value?.length) {
				version.value = versions.value[0].version
			}
		} catch (e) {
			console.warn('Error getVersions', e)
		}
	}

	onMounted(async () => {
		await getData()
		await getVersions()
	})
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
</style>
