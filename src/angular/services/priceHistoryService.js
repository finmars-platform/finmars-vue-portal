/**
 * Created by szhitenev on 04.05.2016.
 */
import PriceHistoryRepository from "../repositories/priceHistoryRepository";

export default function (cookieService, xhrService) {

    const priceHistoryRepository = new PriceHistoryRepository(cookieService, xhrService);

    const getList = function(options) {
        return priceHistoryRepository.getList(options);
    };

    const getByKey = function (id) {
        return priceHistoryRepository.getByKey(id);
    };

    const create = function(account) {
        return priceHistoryRepository.create(account);
    };

    var update = function(id, account) {
        return priceHistoryRepository.update(id, account);
    };

    var deleteByKey = function (id) {
        return priceHistoryRepository.deleteByKey(id);
    };

    var deleteBulk = function(data) {
        return priceHistoryRepository.deleteBulk(data)
    };

    return {
        getList: getList,
        getByKey: getByKey,
        create: create,
        update: update,
        deleteByKey: deleteByKey,

        deleteBulk: deleteBulk
    }

}