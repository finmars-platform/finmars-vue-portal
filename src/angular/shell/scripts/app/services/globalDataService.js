/** @module globalDataService */

export default function () {
	const store = useStore()

	let userHaveCurrentMasterUser = false

	let data = {
		masterUser: store.current,
		member: store.member,
		memberLayout: store.memberLayout,
		user: store.user,
	};

	let iframeMode = false; // used when app inside iframe

	const doUserHasCurrentMasterUser = function () {
		return userHaveCurrentMasterUser;
	};

	/**
	 * Set whether user has current master user.
	 *
	 * @memberOf module:globalDataService
	 * @param currentMasterUserIsSet {boolean}
	 */
	const setCurrentMasterUserStatus = function (currentMasterUserIsSet) {
		userHaveCurrentMasterUser = currentMasterUserIsSet;
	};

	const setUser = function (user) {

		if (!user.data) user.data = {};

		if ( typeof user.data.autosave_layouts !== 'boolean' ) {
			user.data.autosave_layouts = true;
		}

		data.user = user;
	};

	const getUser = () => {
		return data.user;
	};

	const setMasterUser = function (masterUser) {
		data.masterUser = masterUser;
	};

	const getMasterUser = () => {
		return data.masterUser;
	};

	const setMember = function (member) {
		// console.trace("autosave77 setMember");
		// console.log("autosave77 setMember", member);
		/*if ( typeof member.data.autosave_layouts !== 'boolean' ) {
			member.data.autosave_layouts = true;
		}*/

		data.member = member;
	};

	const getMember = () => {
		return data.member;
	};

	const setUpMemberData = (member, viewerType, entityType) => {

		if (!member.data) member.data = {};
		if (!member.data.group_tables) member.data.group_tables = {};

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

		let entityTypesSettings = member.data.group_tables[viewerType].entity_viewers_settings;

		if (!entityTypesSettings[entityType]) {

			entityTypesSettings[entityType] = {
				marked_rows: {},
				row_type_filter: 'none'
			};

		}

		return member;

	};

	const getMemberEntityViewersSettings = (isReport, entityType) => {

		const viewerType = isReport ? 'report_viewer' : 'entity_viewer';
		let member = setUpMemberData(data.member, viewerType, entityType);

		return JSON.parse(JSON.stringify(member.data.group_tables[viewerType].entity_viewers_settings[entityType]));

	};

	const setMemberEntityViewersSettings = function (settings, isReport, entityType) {

		const viewerType = isReport ? 'report_viewer' : 'entity_viewer';
		let member = setUpMemberData(data.member, viewerType, entityType);

		member.data.group_tables[viewerType].entity_viewers_settings[entityType] = settings;

	};

	const setMemberLayout = function (layout) {
		data.memberLayout = layout;
	}

	const getMemberLayout = () => data.memberLayout;

	const isAutosaveLayoutOn = function () {

		const user = getUser();
		const memberLayout = getMemberLayout();

		if (!memberLayout) {
			throw "Method should be called after getting member layout"
		}

		if (!memberLayout.data) memberLayout.data = {};

		const autosave77 = user.data.autosave_layouts && memberLayout.data.autosave_layouts;

		if (!autosave77) {
			console.log("autosave77 isAutosaveLayoutOn user, memberLayout", user, memberLayout);
		}

		return autosave77;

	};

	const clearAllData = function () {

		userHaveCurrentMasterUser = false;

		for (const prop in data) {
			data[prop] = null;
		}

	};

	const setIframeMode = function (modeStatus) {
		iframeMode = modeStatus;
	}

	const insideIframe = function () {
		return iframeMode;
	}

	const getDefaultConfigurationCode = function (){

		return 'local.poms.' + data.masterUser.base_api_url

	}

	return {
		setCurrentMasterUserStatus: setCurrentMasterUserStatus,
		doUserHasCurrentMasterUser: doUserHasCurrentMasterUser,

		setUser: setUser,
		getUser: getUser,
		setMasterUser: setMasterUser,
		getMasterUser: getMasterUser,
		setMember: setMember,
		getMember: getMember,
		getMemberEntityViewersSettings: getMemberEntityViewersSettings,
		setMemberEntityViewersSettings: setMemberEntityViewersSettings,
		setMemberLayout: setMemberLayout,
		getMemberLayout: getMemberLayout,

		isAutosaveLayoutOn: isAutosaveLayoutOn,

		clearAllData: clearAllData,

		setIframeMode: setIframeMode,
		insideIframe: insideIframe,

		getDefaultConfigurationCode: getDefaultConfigurationCode
	}
}
