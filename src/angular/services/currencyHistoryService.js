/**
 * Created by szhitenev on 04.05.2016.
 */
import CurrencyHistoryRepository from "../repositories/currencyHistoryRepository";

export default function (cookieService, xhrService) {

    var currencyHistoryRepository = new CurrencyHistoryRepository(cookieService, xhrService);

    var getList = function(options) {
        return currencyHistoryRepository.getList(options);
    };

    var getByKey = function (id) {
        return currencyHistoryRepository.getByKey(id);
    };

    var create = function(account) {
        return currencyHistoryRepository.create(account);
    };

    var update = function(id, account) {
        return currencyHistoryRepository.update(id, account);
    };

    var deleteByKey = function (id) {
        return currencyHistoryRepository.deleteByKey(id);
    };

    var deleteBulk = function(data) {
        return currencyHistoryRepository.deleteBulk(data)
    };

    return {
        getList: getList,
        getByKey: getByKey,
        create: create,
        update: update,
        deleteByKey: deleteByKey,
        deleteBulk: deleteBulk
    }

};