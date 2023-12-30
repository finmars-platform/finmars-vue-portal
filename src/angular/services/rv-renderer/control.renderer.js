import renderHelper from '../../helpers/render.helper'

/**
 *
 * @param evDataService {Object} - entityViewerDataService
 * @param obj {Object} - data of row from flat list
 * @returns {string}
 */
var render = function (evDataService, obj) {

	var rowHeight = evDataService.getRowHeight();
	var canLoadMore = false;


	var requestParameters = evDataService.getRequestParameters(obj.___parentId);
	var pagination = requestParameters.pagination;

	var offsetTop = obj.___flat_list_offset_top_index * rowHeight;

	var total_pages = Math.ceil(pagination.count / pagination.page_size);
	var page = pagination.page;

	if (page < total_pages) {
		canLoadMore = true;
	}

	var rowSelection = renderHelper.getRowSelectionElem(obj);
	let color = 'none';
	var rowSettings = renderHelper.getRowSettings(obj.___type, color);

	var groupCells = '';
	var columnNumber;
	var columns = evDataService.getColumns();
	var groups = evDataService.getGroups();
	var controlCellWidth = 0

	columns.forEach(function (column, columnIndex) {

		columnNumber = columnIndex + 1;

		if (columnNumber < obj.___level) {

			var cell = '<div data-column="' + columnNumber + '" class="g-cell-wrap" style="width: ' + column.style.width + '">' +
				'<div class="g-cell">' +
				'&nbsp;' +
				'</div>' +
				'</div>';

			groupCells = groupCells + cell;
		} else {
			controlCellWidth =  controlCellWidth + parseInt(column.style.width.split('px')[0])
		}

	})

	if (!controlCellWidth) {
		controlCellWidth = 220
	}


	console.log('rv.control.render.canLoadMore', canLoadMore);

	var content = `<div class="control-content g-cell-wrap" style="width: ${controlCellWidth}px">
						<div class="g-cell" style="width: 100%;">
							<span class="display-inline-block m-0"
								  style="color: #868686;">

								Records: ${pagination.downloaded} of ${pagination.count}

							</span>`;

	if (canLoadMore) {

		content = content +
			`<div class="control-loader-holder
						 progress-holder
						 progress-size-20
						 display-none
						 controlLoader">

				<img src="portal/content/img/sphere.png" alt="">

				<div class="progress
							progress-circular
							front-line-default
							back-line-default"

					 style="border-top-color: #F05A22; border-right-color: #F05A22"
				></div>

			</div>

			<button class="control-button load-more controlBtn"
					data-type="control"
					data-ev-control-action="load-more"
					data-object-id="${obj.___id}"
					data-parent-group-hash-id="${obj.___parentId}">
					   Load more
			</button>`;

		if (obj.___errorMessage) {
			content = content + `<div class="control-error-message">${obj.___errorMessage}</div>`
		}

	}

	content = content + '</div></div>'; // closing <div class="control-content">
	//# endregion

	return `<div class="g-row g-control-row gControlRow"
					style="top:${offsetTop}px"
				 data-type="control"
				 data-object-id="${obj.___id}"
				 data-parent-group-hash-id="${obj.___parentId}">

					${rowSelection}

					${rowSettings}

					${groupCells}

				${content}

		</div>`;

};

export default {
	render: render,
}
