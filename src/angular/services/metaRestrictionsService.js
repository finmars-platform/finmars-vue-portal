/**
 * Created by szhitenev on 09.08.2016.
 */

import metaRestrictionsRepository from "../repositories/metaRestrictionsRepository";

export default function () {

    var getEntitiesWithoutDynamicAttrsList = function () {
        return metaRestrictionsRepository.getEntitiesWithoutDynamicAttrsList();
    };

    var getEntitiesWithoutBaseAttrsList = function () {
        return metaRestrictionsRepository.getEntitiesWithoutBaseAttrsList();
    };

    var getRestrictedEntitiesWithTypeField = function () {
        return metaRestrictionsRepository.getEntitiesWithoutBaseAttrsList();
    };

    return {
        getEntitiesWithoutDynamicAttrsList: getEntitiesWithoutDynamicAttrsList,
        getEntitiesWithoutBaseAttrsList: getEntitiesWithoutBaseAttrsList,
        getRestrictedEntitiesWithTypeField: getRestrictedEntitiesWithTypeField
    }

};