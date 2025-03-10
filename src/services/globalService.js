import { useRoute } from '#app';
import cloneDeep from 'lodash/cloneDeep';

const route = useRoute();

let userHaveCurrentMasterUser = false;
const data = {
	masterUser: null,
	member: null,
	memberLayout: null,
	user: null,
	whiteLabel: null
};
let iframeMode = false;
let _paq;

export function doUserHasCurrentMasterUser() {
	return userHaveCurrentMasterUser;
}

/**
 * Set whether user has current master user.
 *
 * @memberOf module:globalDataService
 * @param currentMasterUserIsSet {boolean}
 */
export function setCurrentMasterUserStatus(currentMasterUserIsSet) {
	userHaveCurrentMasterUser = currentMasterUserIsSet;
}

function getCodesFromUrl() {
	const { realm_code, space_code } = route.params || {};
	return { realmCode: realm_code, spaceCode: space_code };
}

export function setUser(userData = {}) {
	const user = { ...userData };

	if (!user.data) {
		user.data = {};
	}

	if (typeof user.data.autosave_layouts !== 'boolean') {
		user.data.autosave_layouts = true;
	}

	if (!_paq) {
		_paq = window._paq = window._paq || [];
		/* tracker methods like "setCustomDimension" should be called before "trackPageView" */

		let prefix = 'eu-central';

		if (window.location.href.indexOf('0.0.0.0') !== -1) {
			prefix = 'local';
		}

		let pieces = window.location.host.split('.');

		if (pieces.length === 3) {
			// eslint-disable-next-line
			prefix = pieces[0];
		}

		const u = '//analytics.finmars.com/';
		_paq.push(['setTrackerUrl', u + 'matomo.php']);
		// _paq.push(['setSiteId', prefix]);
		_paq.push(['setSiteId', 1]);

		const { realmCode, spaceCode } = getCodesFromUrl();

		// If codes exist, set them as custom dimensions
		if (realmCode && spaceCode) {
			_paq.push(['setCustomDimension', 1, realmCode]); // Set realm_code (Dimension ID 1)
			_paq.push(['setCustomDimension', 2, spaceCode]); // Set space_code (Dimension ID 2)
		}

		_paq.push(['setUserId', user.username]);

		const currentUrl = `${location.origin}${location.pathname}`;
		_paq.push(['setCustomUrl', currentUrl]);
		_paq.push(['trackPageView']);
		_paq.push(['enableLinkTracking']);

		const d = document;
		const g = d.createElement('script');
		const s = d.getElementsByTagName('script')[0];
		g.async = true;
		g.src = u + 'matomo.js';
		s.parentNode.insertBefore(g, s);
	}

	data.user = user;
}

export function getUser() {
	return data.user;
}

export function setMasterUser(masterUser) {
	data.masterUser = masterUser;
}

export function getMasterUser() {
	return data.masterUser;
}

export function setMember(member) {
	data.member = member;
}

export function getMember() {
	return data.member;
}

export function setUpMemberData(memberData = {}, viewerType, entityType) {
	const member = { ...memberData };

	if (!member.data) {
		member.data = {};
	}

	if (!member.data.group_tables) {
		member.data.group_tables = {};
	}

	if (!member.data.group_tables.entity_viewer) {
		member.data.group_tables.entity_viewer = {
			entity_viewers_settings: {}
		};
	}

	if (!member.data.group_tables.report_viewer) {
		member.data.group_tables.report_viewer = {
			entity_viewers_settings: {}
		};
	}

	const entityTypesSettings =
		member.data.group_tables[viewerType].entity_viewers_settings;

	if (!entityTypesSettings[entityType]) {
		entityTypesSettings[entityType] = {
			marked_rows: {},
			row_type_filter: 'none'
		};
	}

	return member;
}

export function getMemberEntityViewersSettings(isReport, entityType) {
	const viewerType = isReport ? 'report_viewer' : 'entity_viewer';
	const member = setUpMemberData(data.member, viewerType, entityType);

	return cloneDeep(
		member.data.group_tables[viewerType].entity_viewers_settings[entityType]
	);
}

export function setMemberEntityViewersSettings(settings, isReport, entityType) {
	const viewerType = isReport ? 'report_viewer' : 'entity_viewer';
	const member = setUpMemberData(data.member, viewerType, entityType);

	member.data.group_tables[viewerType].entity_viewers_settings[entityType] =
		settings;
}

export function setMemberLayout(layout) {
	data.memberLayout = layout;
}

export function getMemberLayout() {
	return data.memberLayout;
}

export function isAutosaveLayoutOn() {
	const user = getUser();
	const memberLayout = getMemberLayout();

	if (!memberLayout) {
		throw 'Method should be called after getting member layout';
	}

	if (!memberLayout.data) memberLayout.data = {};

	const autosave77 =
		user.data.autosave_layouts && memberLayout.data.autosave_layouts;

	if (!autosave77) {
		console.warn(
			'autosave77 isAutosaveLayoutOn user, memberLayout',
			user,
			memberLayout
		);
	}

	return autosave77;
}

export function clearAllData() {
	userHaveCurrentMasterUser = false;

	for (const prop in data) {
		data[prop] = null;
	}
}

export function setIframeMode(modeStatus) {
	iframeMode = modeStatus;
}

export function insideIframe() {
	return iframeMode;
}

export function getDefaultConfigurationCode() {
	return `local.poms.${data.masterUser.base_api_url}`;
}

export function getWhiteLabel() {
	return data.whiteLabel;
}

export function setWhiteLabel(whiteLabel) {
	data.whiteLabel = whiteLabel;
}
