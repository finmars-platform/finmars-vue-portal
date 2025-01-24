<template>
	<div class="py-3 px-8">
		<span class="text-xl">Sidebar Navigation Access</span>
		<div
			v-if="loading"
			class="flex w-full justify-center items-center min-h-36"
		>
			<FmProgressCircular :size="32" indeterminate />
		</div>
		<div v-else class="flex justify-between nowrap mt-4 gap-8">
			<div class="recursive-row-wrap mr-1">
				<div class="code-wrapper">
					<UserCodeInput
						:user-code="selectedItem.user_code"
						@update:user-code="updateField('user_code', $event)"
						@update:configuration-code="
							updateField('configuration_code', $event)
						"
						@update:valid="updateUserCodeValidationValue"
					/>
				</div>
				<div class="role-wrapper">
					<FmSelect
						v-model="selectedItem.role"
						:options="roles"
						label="Role"
						variant="outlined"
					/>
				</div>
				<RecursiveRow
					v-for="item in defaultItems"
					:key="item.key"
					:item="item"
					@update-list="updateList"
				/>
			</div>
			<div class="flex flex-col justify-start items-start gap-2" :class="{ disable: !isComplete }">
				<FmButton @click="enableAll" rounded>Enable All
					<template #prepend>
						<div class="prepend-dot enable-dot" />
					</template>
				</FmButton>
				<FmButton @click="disableAll" rounded>Disable All
					<template #prepend>
						<div class="prepend-dot disable-dot" />
					</template>
				</FmButton>
				<FmButton @click="reset()" rounded>
					Reset
					<template #prepend>
						<FmIcon icon="mdi-refresh" size="22" color="" />
					</template>
				</FmButton>
				<FmButton @click="save()" rounded>
					Save
					<template #prepend>
						<FmIcon icon="mdi-check" size="22" color="" />
					</template>
				</FmButton>
			</div>
		</div>
	</div>
</template>

<script setup>
	import { FmButton, FmIcon, FmProgressCircular, FmSelect } from '@finmars/ui';
	import UserCodeInput from '~/components/common/UserCodeInput/UserCodeInput.vue';
	import { useNavigationRoutes } from '~/composables/useNavigationRoutes';
	import RecursiveRow from './RecursiveRow';

	definePageMeta({
		middleware: 'auth'
	});

	const {
		loading,
		defaultItems,
		enableAll,
		disableAll,
		reset,
		updateList,
		selectedItem,
		updateUserCodeValidationValue,
		updateField,
		save,
		roles,
		isComplete
	} = useNavigationRoutes();

</script>

<style scoped lang="scss">
	.recursive-row-wrap {
		border-right: 2px solid var(--primary-color);
		width: 100%;
		min-height: 300px;
		max-height: 80svh;
		overflow-y: auto;
		padding-right: var(--spacing-16);

		.code-wrapper {
			position: relative;
			width: 100%;
			padding: 16px 12px;
			border-radius: 8px;
			border: 1px solid var(--outline-variant);
			margin-bottom: var(--spacing-16);
		}

		.role-wrapper {
			display: flex;
			align-items: center;
			justify-content: center;
			margin-bottom: var(--spacing-4);
			padding: 0 2px;
			width: 100%;
		}
	}

	.disable {
		pointer-events: none;
		opacity: 0.7;
	}

	.prepend-dot {
		width: 10px;
		height: 10px;
		border-radius: 50%;
	}

	.enable-dot {
		background: #66bf3c;
	}

	.disable-dot {
		background: orange;
	}

	.enable-icon {
		background: #66bf3c;
	}

	.disable-icon {
		background: orange;
	}
</style>
