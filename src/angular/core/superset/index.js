"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.embedDashboard = embedDashboard;

var _const = require("./const");

var _switchboard = require("@superset-ui/switchboard");

var _guestTokenRefresh = require("./guestTokenRefresh");

/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
// We can swap this out for the actual switchboard package once it gets published

/**
 * Embeds a Superset dashboard into the page using an iframe.
 */
async function embedDashboard(_ref) {
  let {
    id,
    supersetDomain,
    mountPoint,
    fetchGuestToken,
    dashboardUiConfig,
    debug = false
  } = _ref;

  function log() {
    if (debug) {
      for (var _len = arguments.length, info = new Array(_len), _key = 0; _key < _len; _key++) {
        info[_key] = arguments[_key];
      }

      console.debug(`[superset-embedded-sdk][dashboard ${id}]`, ...info);
    }
  }

  log('embedding');

  function calculateConfig() {
    let configNumber = 0;

    if (dashboardUiConfig) {
      if (dashboardUiConfig.hideTitle) {
        configNumber += 1;
      }

      if (dashboardUiConfig.hideTab) {
        configNumber += 2;
      }

      if (dashboardUiConfig.hideChartControls) {
        configNumber += 8;
      }
    }

    return configNumber;
  }

  async function mountIframe() {
    return new Promise(resolve => {
      const iframe = document.createElement('iframe');
      const dashboardConfig = dashboardUiConfig ? `?uiConfig=${calculateConfig()}` : ""; // setup the iframe's sandbox configuration

      iframe.sandbox.add("allow-same-origin"); // needed for postMessage to work

      iframe.sandbox.add("allow-scripts"); // obviously the iframe needs scripts

      iframe.sandbox.add("allow-presentation"); // for fullscreen charts

      iframe.sandbox.add("allow-downloads"); // for downloading charts as image
      // add these ones if it turns out we need them:
      // iframe.sandbox.add("allow-top-navigation");
      // iframe.sandbox.add("allow-forms");
      // add the event listener before setting src, to be 100% sure that we capture the load event

      iframe.addEventListener('load', () => {
        // MessageChannel allows us to send and receive messages smoothly between our window and the iframe
        // See https://developer.mozilla.org/en-US/docs/Web/API/Channel_Messaging_API
        const commsChannel = new MessageChannel();
        const ourPort = commsChannel.port1;
        const theirPort = commsChannel.port2; // Send one of the message channel ports to the iframe to initialize embedded comms
        // See https://developer.mozilla.org/en-US/docs/Web/API/Window/postMessage
        // we know the content window isn't null because we are in the load event handler.

        iframe.contentWindow.postMessage({
          type: _const.IFRAME_COMMS_MESSAGE_TYPE,
          handshake: "port transfer"
        }, supersetDomain, [theirPort]);
        log('sent message channel to the iframe'); // return our port from the promise

        resolve(new _switchboard.Switchboard({
          port: ourPort,
          name: 'superset-embedded-sdk',
          debug
        }));
      });
      iframe.src = `${supersetDomain}/embedded/${id}${dashboardConfig}`;
      mountPoint.replaceChildren(iframe);
      log('placed the iframe');
    });
  }

  const [guestToken, ourPort] = await Promise.all([fetchGuestToken(), mountIframe()]);
  ourPort.emit('guestToken', {
    guestToken
  });
  log('sent guest token');

  async function refreshGuestToken() {
    const newGuestToken = await fetchGuestToken();
    ourPort.emit('guestToken', {
      guestToken: newGuestToken
    });
    setTimeout(refreshGuestToken, (0, _guestTokenRefresh.getGuestTokenRefreshTiming)(newGuestToken));
  }

  setTimeout(refreshGuestToken, (0, _guestTokenRefresh.getGuestTokenRefreshTiming)(guestToken));

  function unmount() {
    log('unmounting');
    mountPoint.replaceChildren();
  }

  const getScrollSize = () => ourPort.get('getScrollSize');

  return {
    getScrollSize,
    unmount
  };
}