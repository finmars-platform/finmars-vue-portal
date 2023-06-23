// import bookmarkService from '../services/bookmarkService';

export default function () {
	return {
		restriction: 'AE',
		templateUrl: 'views/directives/bookmarks-view.html',
		link: function (scope, elem, attr) {
			//scope.showBookmarks = true;

			scope.toggleBookmarkPanel = function () {
				scope.showBookmarks = !scope.showBookmarks
			}
		},
	}
}
