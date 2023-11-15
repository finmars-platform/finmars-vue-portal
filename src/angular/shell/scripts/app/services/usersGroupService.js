/**
 * Created by szhitenev on 04.05.2016.
 */

'use strict'

// import usersGroupRepository from '../repositories/usersGroupRepository';
import usersGroupRepository from '../repositories/usersGroupRepository'

export default function () {
    const getList = function (options) {
        return usersGroupRepository.getList(options)
    }

    const getByKey = function (id) {
        return usersGroupRepository.getByKey(id)
    }

    const create = function (group) {
        return usersGroupRepository.create(group)
    }

    const update = function (id, group) {
        return usersGroupRepository.update(id, group)
    }

    const deleteByKey = function (id) {
        return usersGroupRepository.deleteByKey(id)
    }

    return {
        getList: getList,
        getByKey: getByKey,
        create: create,
        update: update,
        deleteByKey: deleteByKey,
    }
}
