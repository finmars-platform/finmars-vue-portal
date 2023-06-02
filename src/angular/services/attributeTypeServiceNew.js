/**
 * Created by szhitenev on 15.06.2016.
 */
import AttributeTypeRepository from "../repositories/attributeTypeRepository";

export default function (cookieService, xhrService, metaRestrictionsService) {

    const attributeTypeRepository = new AttributeTypeRepository(cookieService, xhrService, metaRestrictionsService);

    var getList = function (entity, options) {
        return attributeTypeRepository.getList(entity, options);
    };

    var getByKey = function (entity, id) {
        return attributeTypeRepository.getByKey(entity, id);
    };

    var create = function (entity, attributeType) {
        return attributeTypeRepository.create(entity, attributeType);
    };

    var update = function (entity, id, attributeType) {
        return attributeTypeRepository.update(entity, id, attributeType);
    };

    var deleteByKey = function (entity, id) {
        return attributeTypeRepository.deleteByKey(entity, id);
    };

    var recalculateAttributes = function (entity, id) {
        return attributeTypeRepository.recalculateAttributes(entity, id);
    };

    var getRecalculateAttributeCount = function (entity, id) {
        return attributeTypeRepository.getRecalculateAttributeCount(entity, id);
    };

    return {
        getList: getList,
        getByKey: getByKey,
        create: create,
        update: update,
        deleteByKey: deleteByKey,

        recalculateAttributes: recalculateAttributes,
        getRecalculateAttributeCount: getRecalculateAttributeCount
    }

};