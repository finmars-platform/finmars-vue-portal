'use strict';

import baseUrlService from "./baseUrlService";

export default function () {

	const PROJECT_ENV = '__PROJECT_ENV__';

	function getUrl (stateName) {

		let urlBeginning = baseUrlService.resolve();
		const base_api_url = baseUrlService.getMasterUserPrefix();

		if (base_api_url) urlBeginning += '/' + base_api_url;

		let profileUrl = urlBeginning + '/v/profile'

		if (PROJECT_ENV === 'local') {
			profileUrl = urlBeginning + '/a/#!/profile'
		}

		const stateToUrl = {
			'app.portal.home': urlBeginning + '/v/home',
			'app.profile': profileUrl,
			'app.portal.reports.performance-report': urlBeginning + '/v/reports/performance',
			'app.portal.settings.users-groups': urlBeginning + '/v/settings/permissions',
		};


		if (!stateToUrl.hasOwnProperty(stateName)) {
			throw new Error('There is no state with such name')
		}

		return stateToUrl[stateName];

	}

	return {
		getUrl: getUrl
	}
};