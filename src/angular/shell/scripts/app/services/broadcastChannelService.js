'use strict';

/** @module broadcastManagerService */
export default function () {

    let channels = {};
    const broadcastChannelAvailable = !!window.BroadcastChannel;

    if (!broadcastChannelAvailable) {
        return {isAvailable: false};
    }

    /**
     * Creates new BroadcastChannel.
     *
     * @memberOf: broadcastManagerService
     * @param channelName {string}
     */
    const openChannel = function (channelName) {

        if (!channelName || typeof channelName !== 'string') {
            console.error({invalidChannelName: channelName});
            throw new Error('Name for a channel should be a not empty string');
        }

        const openedChannelsNamesList = Object.keys(channels);

        if (!openedChannelsNamesList.includes(channelName)) {

            channels[channelName] = new BroadcastChannel(channelName);

        }

    };

    /**
     * @memberOf: broadcastManagerService
     * @param channelName {string}
     * @param callbackMethod {function}
     */
    const setOnmessage = function (channelName, callbackMethod) {

        if (!channelName || typeof channelName !== 'string' || !channels.hasOwnProperty(channelName)) {
            console.error({invalidChannelName: channelName});
            throw new Error('Channel with such name does not exist');
        }

        if (typeof callbackMethod !== "function") throw new Error('callbackMethod is not a function');

        channels[channelName].onmessage = callbackMethod;

    };

    /**
     * @memberOf: broadcastManagerService
     * @param channelName {string}
     * @param message {Object}
     */
    const postMessage = function (channelName, message) {

        if (!channelName || typeof channelName !== 'string' || !channels.hasOwnProperty(channelName)) {
            console.error({invalidChannelName: channelName});
            throw new Error('Channel with such name does not exist');
        }

        channels[channelName].postMessage(message);

    };

    /**
     * @memberOf: broadcastManagerService
     * @param channelName {string}
     */
    const closeChannel = function (channelName) {

        if (!channelName || typeof channelName !== 'string' || !channels.hasOwnProperty(channelName)) {
            console.error({invalidChannelName: channelName});
            throw new Error('Channel with such name does not exist');
        }

        channels[channelName].close();
        delete channels[channelName];

    };

    const isChannelActive = function (channelName) {

        if (channelName && typeof channelName === 'string') {
            return channels.hasOwnProperty(channelName);
        }

        return false;

    };

    return {
        isAvailable: broadcastChannelAvailable,
        openChannel: openChannel,
        setOnmessage: setOnmessage,
        postMessage: postMessage,
        closeChannel: closeChannel,
        isChannelActive: isChannelActive
    }

};
