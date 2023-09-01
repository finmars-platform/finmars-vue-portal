/**
 * Created by mevstratov on 2022-06-07.
 */

'use strict';

export default function () {

    let queue = [];
    let processingPromise;

    const dequeue = function () {

        if (processingPromise) return false;

        const promiseData = queue.shift();

        if (!promiseData) return false; // no more promises in queue

        try {

            processingPromise = true;

            promiseData.promise()
                .then(resData => {

                    processingPromise = false;
                    promiseData.resolve(resData);
                    dequeue();

                })
                .catch(error => {
                    processingPromise = false;
                    promiseData.reject(error);
                    dequeue();
                })

        } catch (error) {
            processingPromise = false;
            promiseData.reject(error);
            dequeue();
        }

    };

    const enqueue = function (promise) {
        return new Promise((resolve, reject) => {
            queue.push({
                promise: promise,
                resolve: resolve,
                reject: reject,
            });
            dequeue();
        });
    };

    const emptyQueue = function () {
        queue = [];
    };

    return {
        enqueue: enqueue,
        queue: queue,
        emptyQueue: emptyQueue
    }

}