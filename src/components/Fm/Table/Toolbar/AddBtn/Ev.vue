<template>
<!--	TODO: finish component

<FmIcon
		v-if="
					scope.entityType != 'instrument' &&
					scope.entityType != 'instrument-type' &&
					scope.entityType != 'account-type' &&
					scope.entityType != 'transaction-type'
				"
		btnPrimary
		icon="add"
		class="g-filter-settings-big-left-btn"
		:class="{
					'g-use-from-above-filters-hidden': !scope.showUseFromAboveFilters,
				}"
		v-tooltip="'ADD ' + evGetEntityNameByState()"
		@click="evAddEntity"
	/>

	&lt;!&ndash; <md-menu v-if="scope.entityType == 'instrument'">
		<md-button
			class="g-filter-settings-big-left-btn md-icon-button primary-button rounded"
			@click="$mdOpenMenu($event)"
		>
			<span class="material-icons">add</span>
			<md-tooltip md-direction="top"
				>ADD {{ evGetEntityNameByState() }}</md-tooltip
			>
		</md-button>

		<md-menu-content width="4">
			<md-menu-item>
				<md-button
					@click="evAddEntity($event)"
					class="g-settings-option-btn"
				>
					<span>Add Blank</span>
				</md-button>
			</md-menu-item>
			<md-menu-item>
				<md-button
					@click="openTransactionTypeDialog($event)"
					class="g-settings-option-btn"
				>
					<span>Add Typical</span>
				</md-button>
			</md-menu-item>
			<md-menu-item>
				<md-button
					@click="openSimpleImportDialog($event)"
					class="g-settings-option-btn"
				>
					<span>Import from File</span>
				</md-button>
			</md-menu-item>
			<md-menu-item>
				<md-button
					@click="addFromProvider($event)"
					class="g-settings-option-btn"
				>
					<span>Get From Provider</span>
				</md-button>
			</md-menu-item>
		</md-menu-content>
	</md-menu> &ndash;&gt;

	<FmMenu v-if="scope.entityType == 'instrument'">
		<template #btn>
			<FmIcon
				class="add_ev_btn"
				btnPrimary
				icon="add"
				@click="$mdOpenMenu($event)"
				v-tooltip="'ADD ' + evGetEntityNameByState()"
			/>
		</template>

		<template #default="{ close }">
			<div class="fm_list" @click="close()">
				<div class="fm_list_item" @click="evAddEntity($event)">
					Add Blank
				</div>
				<div
					class="fm_list_item"
					@click="openTransactionTypeDialog($event)"
				>
					Add Typical
				</div>
				<div class="fm_list_item" @click="openSimpleImportDialog($event)">
					Import from File
				</div>
				<div class="fm_list_item" @click="addFromProvider($event)">
					Get From Provider
				</div>
			</div>
		</template>
	</FmMenu>

	&lt;!&ndash; <md-menu v-if="scope.entityType == 'instrument-type'">
		<md-button
			class="g-filter-settings-big-left-btn md-icon-button primary-button rounded"
			@click="$mdOpenMenu($event)"
		>
			<span class="material-icons">add</span>
			<md-tooltip md-direction="top"
				>ADD {{ evGetEntityNameByState() }}</md-tooltip
			>
		</md-button>

		<md-menu-content width="4">
			<md-menu-item>
				<md-button
					@click="evAddEntity($event)"
					class="g-settings-option-btn"
				>
					<span>Add Blank</span>
				</md-button>
			</md-menu-item>
			<md-menu-item>
				<md-button
					class="md-raised"
					package-manager-button
					content-type="'instruments.instrumenttype'"
				>
					Select from List
				</md-button>
			</md-menu-item>
		</md-menu-content>
	</md-menu> &ndash;&gt;

	<FmMenu v-if="scope.entityType == 'instrument-type'">
		<template #btn>
			<FmIcon
				class="add_ev_btn"
				btnPrimary
				icon="add"
				@click="$mdOpenMenu($event)"
				v-tooltip="'ADD ' + evGetEntityNameByState()"
			/>
		</template>

		<template #default="{ close }">
			<div class="fm_list" @click="close()">
				<div class="fm_list_item" @click="evAddEntity($event)">
					Add Blank
				</div>
				<div
					class="fm_list_item"
					@click="openTransactionTypeDialog($event)"
				>
					Select from List
				</div>
			</div>
		</template>
	</FmMenu>
	&lt;!&ndash; <md-menu v-if="scope.entityType == 'account-type'">
		<md-button
			class="g-filter-settings-big-left-btn md-icon-button primary-button rounded"
			@click="$mdOpenMenu($event)"
		>
			<span class="material-icons">add</span>
			<md-tooltip md-direction="top"
				>ADD {{ evGetEntityNameByState() }}</md-tooltip
			>
		</md-button>

		<md-menu-content width="4">
			<md-menu-item>
				<md-button
					@click="evAddEntity($event)"
					class="g-settings-option-btn"
				>
					<span>Add Blank</span>
				</md-button>
			</md-menu-item>
			<md-menu-item>
				<md-button
					class="md-raised"
					package-manager-button
					content-type="'accounts.accounttype'"
				>
					Select from List
				</md-button>
			</md-menu-item>
		</md-menu-content>
	</md-menu> &ndash;&gt;
	<FmMenu v-if="scope.entityType == 'account-type'">
		<template #btn>
			<FmIcon
				class="add_ev_btn"
				btnPrimary
				icon="add"
				@click="$mdOpenMenu($event)"
				v-tooltip="'ADD ' + evGetEntityNameByState()"
			/>
		</template>

		<template #default="{ close }">
			<div class="fm_list" @click="close()">
				<div class="fm_list_item" @click="evAddEntity($event)">
					Add Blank
				</div>
				<div
					class="fm_list_item md-raised"
					package-manager-button
					content-type="'accounts.accounttype'"
				>
					Select from List
				</div>
			</div>
		</template>
	</FmMenu>
	&lt;!&ndash; <md-menu v-if="scope.entityType == 'transaction-type'">
		<md-button
			class="g-filter-settings-big-left-btn md-icon-button primary-button rounded"
			@click="$mdOpenMenu($event)"
		>
			<span class="material-icons">add</span>
			<md-tooltip md-direction="top"
				>ADD {{ evGetEntityNameByState() }}</md-tooltip
			>
		</md-button>

		<md-menu-content width="4">
			<md-menu-item>
				<md-button
					@click="evAddEntity($event)"
					class="g-settings-option-btn"
				>
					<span>Add Blank</span>
				</md-button>
			</md-menu-item>
			<md-menu-item>
				<md-button
					class="md-raised"
					package-manager-button
					content-type="'transactions.transactiontype'"
				>
					Select from List
				</md-button>
			</md-menu-item>
		</md-menu-content>
	</md-menu> &ndash;&gt;

	<FmMenu v-if="scope.entityType == 'transaction-type'">
		<template #btn>
			<FmIcon
				class="add_ev_btn"
				btnPrimary
				icon="add"
				@click="$mdOpenMenu($event)"
				v-tooltip="'ADD ' + evGetEntityNameByState()"
			/>
		</template>

		<template #default="{ close }">
			<div class="fm_list" @click="close()">
				<div class="fm_list_item" @click="evAddEntity($event)">
					Add Blank
				</div>
				<div
					class="fm_list_item md-raised"
					package-manager-button
					content-type="'transactions.transactiontype'"
				>
					Select from List
				</div>
			</div>
		</template>
	</FmMenu>-->


</template>

<script setup>

// stores
// props
// emits

//# region variables, refs, computed
//# endregion

//# region hooks
//# endregion

// watchers
</script>

<style scoped lang="scss">

</style>
