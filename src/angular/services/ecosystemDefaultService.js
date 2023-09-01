/**
 * Created by szhitenev on 04.05.2016.
 */
import EcosystemDefaultRepository from "../repositories/ecosystemDefaultRepository";

export default function (cookieService, xhrService) {

    const ecosystemDefaultRepository = new EcosystemDefaultRepository(cookieService, xhrService);

    var getList = function (options) {
        return ecosystemDefaultRepository.getList(options);
    };

    var getByKey = function (id) {
        return ecosystemDefaultRepository.getByKey(id);
    };

    var create = function (account) {
        return ecosystemDefaultRepository.create(account);
    };

    var update = function (id, account) {
        return ecosystemDefaultRepository.update(id, account);
    };

    var deleteByKey = function (id) {
        return ecosystemDefaultRepository.deleteByKey(id);
    };

    return {
        getList: getList,
        getByKey: getByKey,
        create: create,
        update: update,
        deleteByKey: deleteByKey
    }
}