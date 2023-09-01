/**
 * Created by szhitenev on 04.05.2016.
 */

import TransactionTypeRepository from "../repositories/transactionTypeRepository";

export default function (cookieService, xhrService) {

    var transactionTypeRepository = new TransactionTypeRepository(cookieService, xhrService);

    var getListLight = function (options) {
        return transactionTypeRepository.getListLight(options)
    };

    var getListLightWithInputs = function (options) {
        return transactionTypeRepository.getListLightWithInputs(options)
    };

    var getByKey = function (id) {
        return transactionTypeRepository.getByKey(id);
    };

    var getByKeyLight = function (id) {
        return transactionTypeRepository.getByKeyLight(id);
    };

    var create = function (transaction) {
        return transactionTypeRepository.create(transaction);
    };

    var update = function (id, transaction) {
        return transactionTypeRepository.update(id, transaction);
    };

    var patch = function (id, data) {
        return transactionTypeRepository.patch(id, data);
    };

    var deleteByKey = function (id) {
        return transactionTypeRepository.deleteByKey(id);
    };

    var updateBulkLight = function(entities){
        return transactionTypeRepository.updateBulkLight(entities);
    };

    var updateBulk = function(entities){
        return transactionTypeRepository.updateBulk(entities);
    };

    var initBookComplexTransaction = function (id, contextData) {
        return transactionTypeRepository.initBookComplexTransaction(id, contextData);
    };

    var bookComplexTransaction = function (id, transaction) {
        return transactionTypeRepository.bookComplexTransaction(id, transaction);
    };

    var recalculateComplexTransaction = function (id, transaction){
        return transactionTypeRepository.recalculateComplexTransaction(id, transaction);
    }

    var initBookPendingComplexTransaction = function (id) {
        return transactionTypeRepository.initBookPendingComplexTransaction(id);
    };

    var bookPendingComplexTransaction = function (id, transaction) {
        return transactionTypeRepository.bookPendingComplexTransaction(id, transaction);
    };

    var deleteBulk = function(data){
        return transactionTypeRepository.deleteBulk(data);
    };

    var recalculateUserFields = function (id, data){
        return transactionTypeRepository.recalculateUserFields(id, data);
    }

    return {
        // getList: getList,
        getListLight: getListLight,
        getListLightWithInputs: getListLightWithInputs,
        getByKey: getByKey,
        getByKeyLight: getByKeyLight,
        create: create,
        update: update,
        patch: patch,
        deleteByKey: deleteByKey,

        initBookComplexTransaction: initBookComplexTransaction,
        bookComplexTransaction: bookComplexTransaction,
        recalculateComplexTransaction: recalculateComplexTransaction,

        initBookPendingComplexTransaction: initBookPendingComplexTransaction,
        bookPendingComplexTransaction: bookPendingComplexTransaction,

        updateBulkLight: updateBulkLight,
        updateBulk: updateBulk,
        deleteBulk: deleteBulk,

        recalculateUserFields: recalculateUserFields

    }
};