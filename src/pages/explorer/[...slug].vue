<template>
	<div>
		<div class="explorer-page">
			<div class="explorer-explorer-section ">
				<div layout="row" class="flex">
					<h1 style="margin-top: 5px; margin-right: 8px; font-size: 20px">Explorer</h1>
					<FmIcon
						btnPrimary
						class="md-raised md-icon-button md-primary explorer-page-refresh-button"
						:class="{'disabled-btn': processing}"
						@click="listFiles"
						icon="refresh"
						size="24"
						v-tooltip="'Refresh'"
					/>
				</div>
				<div layout="column">
					<div class="explorer-toolbar" layout="row">
						<div class="flex explorer-actions-buttons">
							<FmMenu>
								<template #btn="{ isOpen }">
									<FmBtn> Create </FmBtn>
								</template>
								<template #default>
									<div class="fm_list">
										<div class="fm_list_item" @click="openCreateFileModal()">
											Create File
										</div>
										<div class="fm_list_item" @click="openCreateFolderModal()">
											Create Folder
										</div>
										<div class="fm_list_item" @click="uploadFiles()">
											Upload Files
										</div>
									</div>
								</template>
							</FmMenu>
							<div class="explorer-show-hide-border">
								<FmBtn type="text" @click="toggleHidden()">
									{{ showHiddenFiles ? 'Hide Invisible Files' : `Show Invisible Files${hideItemsCount ? ' (' + hideItemsCount + ')' : ''}` }}
								</FmBtn>
							</div>
							<FmBtn @click="sync()"> Sync </FmBtn>
							<div v-if="selectedCount" class="flex" style="align-items: center">
								Selected: {{selectedCount}}
								<FmMenu>
									<template #btn>
										<FmIcon icon="more_vert"/>
									</template>
									<template  #default>
										<div class="menu-items-content">
											<span @click="openDownloadZipModal">Download Selected as .zip</span>
											<span @click="openMove()">Move</span>
											<span class="menu-item-delete" @click="openDeleteSelected()">Delete Selected</span>
										</div>
									</template>
								</FmMenu>
							</div>
						</div>
					</div>
				</div>
				<div class="explorer-breadcrumbs">
					<div class="explorer-breadcrumbs-item" @click="breadcrumbsNavigation(-1)">My Finmars</div>
					<span class="explorer-breadcrumbs-item-divider" v-if="currentPath.length">/</span>
					<div v-for="(item, index) in currentPath" :key="item">
                    	<span
							@click="breadcrumbsNavigation(index)"
					        class="explorer-breadcrumbs-item"
						>
							{{item}}
						</span>
						<span
							 v-if="index < currentPath.length - 1"
						     class="explorer-breadcrumbs-item-divider"
						 >
							/
						</span>
					</div>
				</div>
				<template v-if="!isEditor">
					<div v-if="filesStatus.length" class="explorer-file-upload-status-holder">
						<div v-for="item in filesStatus" :key="item" class="explorer-file-upload-status-item">
							<div class="flex">
								<div class="explorer-file-upload-status-item-name">
									{{item.name}}
								</div>
								<div class="explorer-file-upload-status-size">
									&nbsp;{{item.size_pretty}}
								</div>
							</div>
							<div class="flex explorer-file-upload-status-item-status">
								<div class="task-status-badge status-init"
									 v-if="item.status === 'I' || item.status === 'init'">
									<div class="explorer-file-upload-status-item-status-wrapper">
										<FmIcon size="14" icon="check_circle"/>
										<div class="task-status-text">Init</div>
									</div>
								</div>
								<div class="task-status-badge status-progress"
									 v-if="item.status === 'P' || item.status === 'progress'">
									<div class="explorer-file-upload-status-item-status-wrapper">
										<FmIcon size="14" icon="hourglass_full"/>
										<div class="task-status-text">Running</div>
									</div>
								</div>
								<div class="task-status-badge status-success"
									 v-if="item.status === 'D' || item.status === 'success'">
									<div class="explorer-file-upload-status-item-status-wrapper">
										<FmIcon size="14" icon="check_circle"/>
										<div class="task-status-text">Success</div>
									</div>
								</div>
								<div class="task-status-badge status-error"
									 v-if="item.status === 'E' || item.status === 'error'">
									<div class="explorer-file-upload-status-item-status-wrapper">
										<FmIcon size="14" icon="error" />
										<div class="task-status-text">Error</div>
									</div>
								</div>
							</div>
						</div>
						<div class="uploaded-button-close">
							<FmBtn class="outline-button" type="text" v-if="closeFileStatuses" @click="filesStatus=[]">Close</FmBtn>
						</div>
					</div>
					<div class="explorer-table">
						<FmInputText
							 placeholder="Search for a ..."
							 class="text-search-input"
							 :noIndicatorButton="true"
							 v-model="searchTerm"
						/>
						<FmLoader v-if="processing"></FmLoader>
						<table v-else>
							<thead>
							<tr>
								<th style="width: 10px">
									<div class="explorer-table-checkbox">
										<FmCheckbox @change="toggleSelectAll()" v-model="allSelected"/>
									</div>
								</th>
								<th>Name</th>
								<th>Path</th>
								<th>Date Modified</th>
								<th>Size</th>
								<th>Kind</th>
								<th style="width: 10px"></th>
							</tr>
							</thead>
							<tbody>
							<tr v-for="(item) of items" :key="item">
								<td style="width: 10px">
									<div class="explorer-table-checkbox">
										<FmCheckbox @change="selectItem()" v-model="item.selected"/>
									</div>
								</td>
								<td>
									<div v-if="item.type == 'dir'">
										<div class="flex-row fi-center" @click="openFolder(item)">
                                        <span class="material-icons"
											  v-if="item.name !== store.member?.username && item.name !== 'import'">folder</span>
											<span class="material-icons"
												  v-if="item.name === store.member?.username">folder_shared</span>
											<span class="material-icons"
												  v-if="item.name === 'import'">folder_special</span>
											<span class="explorer-item-name"
												  :title="item.name">{{item.name}}</span>
										</div>
									</div>
									<div v-if="item.type == 'file'">
										<div @click="editFile(item)">
											<span class="material-icons">text_snippet</span>
											<span class="explorer-item-name" :title="item.name">{{item.name}}</span>
										</div>
									</div>
								</td>
								<td>
									<div v-if="!searchTerm.length">
										<div v-for="(path, index) in currentPath" :key="item">
											<span	@click="breadcrumbsNavigation(index)"	class="explorer-path-item">{{path}}</span>
											<span class="cursor-default explorer-path-divider" v-if="index < currentPath.length - 1">/</span>
										</div>
									</div>
									<div v-if="searchTerm.length && item.type === 'file'">
										<span
											v-for="(path, index) in ((item.file_path).split('/'))" :key="path"
											@click="openFile(index, item)"
											class="explorer-path-item"
										>
											{{path}}<span v-if="index !== item.file_path.split('/').length - 1">/</span>
										</span>
									</div>
								</td>
								<td>
									{{formatDate(item.modified_at)}}
								</td>
								<td>{{item.size_pretty}}</td>
								<td>
									{{item.mime_type}}
								</td>
								<td>
									<FmMenu fm-drop-class="m-r-20">
										<template #btn>
											<FmIcon icon="more_vert"/>
										</template>
										<template #default>
											<div v-if="item.type == 'file'" class="menu-items-content">
												<span @click="openInNewTab(item)">Open In New Tab</span>
												<span @click="copyLink(item)">Copy Link</span>
												<span @click="copyFilePath(item)">Copy Explorer File Path</span>
												<span @click="openMove(item)">Move</span>
												<span @click="editFile(item)">Edit</span>
												<span @click="openRename(item)">Rename</span>
												<span @click="download(item)">Download</span>
											</div>
											<div v-if="item.type == 'dir'" class="menu-items-content">
												<span @click="openRename(item)">Rename</span>
												<span class="menu-item-delete" @click="openDeleteSelected(item)">Delete</span>
											</div>
										</template>
									</FmMenu>
								</td>
							</tr>
							</tbody>
						</table>
					</div>
					<div class="m-t-16 pagination-bar">
						<FmBtn
							:disabled="currentPage === 1"
							@click="openPreviousPage()"
							type="text"
						>
							Previous
						</FmBtn>
						<div class="flex">
							<div v-for="page in pages" :key="page.number">
								<FmBtn
									@click="openPage(page)"
									v-if="page.number"
									:type="currentPage === page.number ? 'primary' : ''"
									class="pagination-bar-button"
								>
									{{page.caption}}
								</FmBtn>
								<div v-if="!page.number" style="margin: 10px;">
									{{page.caption}}
								</div>
							</div>
						</div>
						<FmBtn
							@click="openNextPage()"
							v-show="currentPage < totalPages"
							type="text"
						>
							Next
						</FmBtn>
					</div>
				</template>
				<template v-else>
					<v-ace-editor
						v-model="content"
						@init="editorInit"
						lang="json"
						theme="monokai"
						style="min-height: 380px; width: 100%;"
					/>
				</template>

			</div>
		</div>
		<FmTaskCard
			v-if="exportTaskId"
			:task-id="exportTaskId"
			@removeTaskId="removeActiveTaskId"
			@update="listFiles()"
			class="task-card"
		/>
		<input
			type="file"
			multiple
			id="explorerFileUploadInput"
			style="display: none"
			@change="uploadFileHandler"
		/>
		<BaseModal
			:title="label"
			v-model="teIsOpened"
		>
			<div class="width-100 height-100">
				<FmInputText
					v-model="teValue"
					noIndicatorButton
				/>
			</div>

			<template #controls>
				<div class="flex-row fc-space-between">
					<FmBtn type="text" @click="cancel">CANCEL</FmBtn>
					<FmBtn @click="create">Ok</FmBtn>
				</div>
			</template>
		</BaseModal>


		<BaseModal
			title="Move Editor"
			v-model="isMove"
			class="move-modal"
		>
			<Move @path-for-move="getPathToMove"/>
			<template #controls>
				<div class="flex-row fc-space-between">
					<FmBtn type="text" @click="cancel">CANCEL</FmBtn>
					<FmBtn @click="create">Save</FmBtn>
				</div>
			</template>
		</BaseModal>
	</div>
</template>
<script setup>

import Input from '~/components/base/MultiSelect/Input.vue'
import { useExplorer } from '~/composables/useExplorer'
import { VAceEditor } from 'vue3-ace-editor'
import Move from '~/pages/explorer/_components/Move.vue'

const {
	store,
	formatDate,
	processing,
	selectedCount,
	listFiles,
	items,
	label,
	teIsOpened,
	teValue,
	openCreateFileModal,
	cancel,
	create,
	openCreateFolderModal,
	uploadFileHandler,
	uploadFiles,
	showHiddenFiles,
	hideItemsCount,
	toggleHidden,
	sync,
	exportTaskId,
	removeActiveTaskId,
	allSelected,
	toggleSelectAll,
	selectItem,
	searchTerm,
	currentPage,
	totalPages,
	pages,
	openPreviousPage,
	openNextPage,
	openPage,
	closeFileStatuses,
	filesStatus,
	currentPath,
	breadcrumbsNavigation,
	openFolder,
	editFile,
	editorInit,
	content,
	isEditor,
	openFile,
	openDownloadZipModal,
	openDeleteSelected,
	openRename,
	openInNewTab,
	copyLink,
	copyFilePath,
	download,
	openMove,
	isMove,
	getPathToMove
} = useExplorer();
</script>

<style scoped lang="scss">
	.explorer-page {
		overflow: auto;
		padding-bottom: 40px;
		.uploaded-button-close {
			display: flex;
			justify-content: flex-end;
		}
		.explorer-file-upload-status-item-status-wrapper {
			display: flex;
			align-items: center;
			gap: 5px;
		}
		.explorer-table {
			display: flex;
			flex-direction: column;
			align-items: center;
			justify-content: center;
			:deep(.base-input) {
				&:not(.disabled):focus-within,
				&:not(.disabled):focus {
					.bi_top {
						top: 0;
						.top_left_border,
						.top_right_border {
							border-top: none;
						}
					}
					.bi_wrap {
						border: none;
					}
				}
			}
			:deep(.text-search-input) {
				margin: 0 !important;
				width: 100%;
				.bi_wrap {
					height: 27px;
					border-radius: 0;
					transform: translateY(1px);
				}
				.bi_default {
					margin: 0;
				}
				.bi_main_input {
					font-size: 12px;
					padding-left: 13px;
					&:focus {
						outline: 2px solid $error;
						outline-offset: -2px;
					}
				}
			}
			table {
				height: 100%;
				width: 100%;
				border-collapse: collapse;
				text-align: left;
				.explorer-table-checkbox {
					margin: 4px;
				}
				th {
					font-size: 14px;
				}
				td {
					font-size: 16px;
					.material-icons {
						font-size: 14px;
						margin-right: 3px;
					}
				}
				tr {
					border: 1px solid var(--table-border-color);
					&:hover {
						background: var(--activeState-backgroundColor);
						cursor: pointer;
						.explore-item-name {
							text-decoration: underline;
						}
					}
				}
				.menu-items-content {
					display: flex;
					flex-direction: column;
					justify-content: center;
				}
				.explorer-item-name {
					font-size: 16px;
					text-overflow: ellipsis;
					overflow: hidden;
					width: 100%;
					cursor: pointer;
					&:hover {
						opacity: .7;
						text-decoration: underline;
					}
				}
			}
		}
		.pagination-bar {
			display: flex;
			align-items: center;
			.pagination-bar-button {
				height: 24px;
				min-width: 24px;
				margin: 2px;
				min-height: 24px;
				line-height: 24px;
				&:hover {
					background-color: var(--activeState-backgroundColor);
				}
			}
		}
		.md-raised.md-primary.explorer-page-refresh-button {
			height: 24px;
			width: 24px;
			min-height: 24px;
			line-height: 24px;
			text-align: center;
			padding: 0;
			font-size: 10px;
			margin-top: 5px;
			background: var(--primary-color);
		}
		.explorer-explorer-section {
			display: flex;
			gap: 15px;
			width: 100%;
			height: 100%;
			padding: 0 16px;
			box-sizing: border-box;
			flex-direction: column;
		}
		.explorer-workflow-section {
			width: 100vw;
			height: 100%;
		}
		.explorer-breadcrumbs {
			overflow: hidden;
		}
		.explorer-breadcrumbs-item {
			float: left;
			margin: 8px;
			font-size: 20px;
			cursor: pointer;
			padding: 8px;
			&:hover {
				background: var(--state-active-background-color);
				opacity: 7;
				text-decoration: underline;
			}
		}
		.explorer-path-item {
			float: left;
			font-size: 16px;
			cursor: pointer;
			&:hover {
				text-decoration: underline;
			}
		}
		.explorer-path-divider {
			float: left;
			font-size: 16px;
		}
		.explorer-item {
			box-sizing: border-box;
			text-align: center;
			word-break: break-word;
			td {
				font-size: 16px;
				text-overflow: ellipsis;
				overflow: hidden;
				padding: 1px;
			}
			&.selected {
				background: var(--state-active-background-color);
				.explorer-item-name {
					color: var(--secondary-color);
				}
			}
			.material-icons {
				font-size: 14px;
				cursor: pointer;
				user-select: none;
				margin-right: 4px;
				padding-top: 3px;
				margin-left: 2px;
			}
		}

		span.explorer-breadcrumbs-item-divider {
			float: left;
			font-weight: bold;
			margin-top: 14px;
			font-size: 20px;
		}

		.explorer-toolbar {
			padding-top: 8px;
			button.md-raised.md-button {
				font-size: 11px;
				height: 30px;
			}
			.explorer-actions-buttons {
				gap: 10px;
				.explorer-show-hide-border {
					border: 1px solid $border-darken;
					border-radius: 100px;
				}
			}
		}

		.explorer-item-menu-button {
			padding: 0;
			margin: 0 4px 0 0;
			height: 16px;
			max-height: 16px;
			min-height: 16px;
			float: right;
			width: 16px;
			text-align: center;
			background: #ddd;
			display: block;
			.material-icons {
				font-size: 12px;
				cursor: pointer;
				user-select: none;
				padding: 0;
				width: 12px;
				height: 12px;
				display: block;
				min-width: 12px;
				margin: 2px auto;
			}
		}

		.explorer-file-upload-status-holder {
			padding: 16px;
			border: 1px solid var(--table-border-color);
			max-height: 300px;
			overflow: auto;
		}

		.explorer-file-upload-status-item {
			margin: 8px;
			border: 1px solid var(--table-border-color);
			padding: 8px;
			display: flex;
			align-items: end;
			justify-content: space-between;
		}
		.explorer-file-upload-status-size {
			font-size: 11px;
			margin-left: 5px;
			color: var(--secondary-color);
		}

		.task-status-badge {
			color: #fff;
			font-size: 14px;
			border-radius: 2px;
			max-width: 80px;
			padding: 4px;
			fill: #fff;
			cursor: pointer;
			display: flex;
			text-transform: lowercase;
			align-items: center;
			line-height: 1;
			&:hover {
				opacity: .7;
			}
			ng-md-icon {
				margin-right: 4px;
			}
		}

		.status-progress {
			border: 1px solid #12293b;
			background: rgb(63, 81, 181);
			color: var(--onPrimary-color);
			ng-md-icon {
				-webkit-animation: spin 4s linear infinite;
				-moz-animation: spin 4s linear infinite;
				animation: spin 4s linear infinite;
				width: 14px;
				text-align: center;
				height: 14px;
				border: 1px solid var(--onPrimary-color);
				border-radius: 50%;
			}

			@-moz-keyframes spin {
				100% {
					-moz-transform: rotate(360deg);
				}
			}
			@-webkit-keyframes spin {
				100% {
					-webkit-transform: rotate(360deg);
				}
			}
			@keyframes spin {
				100% {
					-webkit-transform: rotate(360deg);
					transform: rotate(360deg);
				}
			}
		}


		.status-success {
			background: #3fb950;
			border: 1px solid #1d8102;
			color: #fff;
		}

		.status-error {
			border: 1px solid #ec5941;
			background: #eb0014;
		}

		.status-init {
			background: grey;
			border: 1px solid var(--table-border-color);
		}
	}
	.menu-items-content {
		display: flex;
		flex-direction: column;
		max-height: 300px;
		span {
			text-align: left;
			margin: auto 0;
			font-size: 15px;
			font-weight: 400;
			padding: 10px 15px;
			&:hover{
				cursor: pointer;
				background-color: var(--activeState-backgroundColor);
			}
		}
		.menu-item-delete {
			color: $error;
		}
	}
</style>
