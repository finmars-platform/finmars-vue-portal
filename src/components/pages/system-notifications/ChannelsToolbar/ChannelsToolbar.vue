<template>
	<div class="channels-toolbar">
		<ChannelsToolbarCategory />

		<ChannelsToolbarStatus />

		<ChannelsToolbarDate />

		<Transition name="fade" mode="out-in">
			<div v-if="isSearchOpen" class="channels-toolbar__search">
				<FmTextField
					:model-value="notificationsFilter.search"
					autofocus
					compact
					placeholder="Search"
					hide-details
					prepend-icon="mdi-magnify"
					@update:model-value="updateSearchTextDebounced"
				/>

				<FmIcon
					icon="mdi-close"
					size="20"
					color="var(--on-surface-variant)"
					class="channels-toolbar__search-clear"
					@click="clearSearch"
				/>
			</div>

			<FmIconButton
				v-else
				icon="mdi-magnify"
				variant="text"
				@click="isSearchOpen = true"
			/>
		</Transition>

		<ChannelsToolbarActions
			:channel="channel"
			@select:action="runSelectAction"
		/>
	</div>
</template>

<script setup>
	import { ref } from 'vue';
	import { storeToRefs } from 'pinia';
	import debounce from 'lodash/debounce';
	import { FmIcon, FmIconButton, FmTextField } from '@finmars/ui';
	import useNotificationsStore from '~/stores/useNotificationsStore';
	import ChannelsToolbarCategory from './ChannelsToolbarCategory.vue';
	import ChannelsToolbarStatus from './ChannelsToolbarStatus.vue';
	import ChannelsToolbarDate from './ChannelsToolbarDate.vue';
	import ChannelsToolbarActions from './ChannelsToolbarActions.vue';

	defineProps({
		channel: {
			type: Object
		}
	});

	const emits = defineEmits(['select:action']);

	const notificationsStore = useNotificationsStore();
	const { notificationsFilter } = storeToRefs(notificationsStore);
	const { setNotificationsFilter } = notificationsStore;

	const isSearchOpen = ref(false);

	function updateSearchText(text) {
		setNotificationsFilter({ search: text });
	}

	const updateSearchTextDebounced = debounce(updateSearchText, 300);

	function clearSearch() {
		updateSearchText('');
		isSearchOpen.value = false;
	}

	function runSelectAction(action) {
		emits('select:action', action);
	}
</script>

<style lang="scss" scoped>
	.channels-toolbar {
		position: relative;
		width: 100%;
		height: 100%;
		display: flex;
		justify-content: flex-end;
		align-items: center;
		flex-grow: 1;

		:deep(.v-btn) {
			text-transform: none;
		}

		&__search {
			position: relative;
			width: 300px;
			overflow: hidden;
			border-radius: 20px;

			:deep(.fm-text-field) {
				.v-input__control {
					.v-field__field {
						.v-field__input {
							padding-right: 32px;
						}
					}

					.v-field__outline {
						display: none;
					}
				}
			}

			&-clear {
				position: absolute;
				top: 10px;
				right: 8px;
				cursor: pointer;
				z-index: 1;
			}
		}
	}
</style>
