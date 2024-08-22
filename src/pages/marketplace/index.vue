<template>
	<div class="marketplace-page">
		<div class="row extra">
			<h1 class="title">Marketplace</h1>

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
				@update:model-value="setFiltersQuery"
			/>
		</div>
		<div v-if="readyStatus.data" class="list">
			<FmCard
				v-for="item in items"
				:key="item"
				class="card"
				@click="openCard(item.id)"
			>
				<div class="row">
					<div class="image">
						<img v-if="item.thumbnail" :src="item.thumbnail" alt="" />
						<div
							v-if="!item.thumbnail"
							:style="{ backgroundColor: getAvatar(item.name?.[0]) }"
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
							version:&nbsp;<b>{{ item.latest_release_object?.version }}</b>
						</div>
					</div>
				</div>

				<div v-if="!item.localItem">
					<FmBtn
						type="primary"
						class="open"
						@click.prevent.stop="installConfiguration(item)"
					>
						Install
					</FmBtn>
				</div>

				<div v-if="item.localItem" class="m-b-8">
					<div class="current">
						Current: ({{ item.localItem.version }} {{ item.localItem.channel }})
					</div>

					<div
						v-if="
							item.latest_release_object?.version === item.localItem.version
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
							item.latest_release_object?.version !== item.localItem.version
						"
					>
						<FmBtn
							class="open"
							@click.prevent.stop="installConfiguration($event, item)"
						>
							Update
						</FmBtn>
					</div>
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
	import { useMarketplace } from '~/composables/useMarketplace'
	import { useGetNuxtLink } from '~/composables/useMeta'

	const route = useRoute()
	const router = useRouter()

	const {
		getData,
		isShowModules,
		activeTaskId,
		filters,
		items,
		installConfiguration,
		currentPage,
		totalPages,
		pages,
		openNextPage,
		readyStatus,
		openPreviousPage,
		openPage,
		getAvatar,
		setFiltersQuery,
		setShowModules,
		removeActiveTaskId
	} = useMarketplace()

	function openCard(id) {
		router.push(useGetNuxtLink(`/marketplace/${id}`, route.params))
	}

	onMounted(() => {
		getData()
	})
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
		}

		.card {
			max-width: 240px;
			width: 240px;
			min-height: 160px;
			padding: 16px 16px 46px;
			border: 1px solid var(--table-border-color);
			margin: 1px;
			position: relative;
			box-shadow: none;
			cursor: pointer;
			background: var(--card-background-color);
			color: var(--secondary-color);
			display: flex;
			flex-direction: column;
			border-radius: 2px;
			transition: opacity 0.2s;

			&:hover {
				opacity: 0.8;
			}

			.image {
				padding-right: 8px;

				img {
					height: 40px;
					width: 40px;
					min-width: 40px;
					border-radius: 50%;
				}

				.no-thumbnail {
					height: 40px;
					width: 40px;
					background: var(--primary-color);
					border-radius: 50%;
					text-align: center;
					color: #fff;
					line-height: 40px;
				}
			}

			.name {
				font-size: 14px;
			}

			.code {
				font-size: 11px;
			}

			.version {
				font-size: 11px;
			}

			.open {
				background: var(--primary-color);
				font-size: 14px;
				position: absolute;
				bottom: 16px;
				margin: 0;
				height: 24px;
				min-height: 24px;
				line-height: 24px;
				width: 90px;
				left: 50%;
				margin-left: -45px;
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
			grid-template-columns: repeat(auto-fill, 240px);
			align-items: stretch;
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
