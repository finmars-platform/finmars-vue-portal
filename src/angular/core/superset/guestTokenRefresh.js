"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.REFRESH_TIMING_BUFFER_MS = exports.MIN_REFRESH_WAIT_MS = exports.DEFAULT_TOKEN_EXP_MS = void 0;
exports.getGuestTokenRefreshTiming = getGuestTokenRefreshTiming;

/**
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
const REFRESH_TIMING_BUFFER_MS = 5000; // refresh guest token early to avoid failed superset requests

exports.REFRESH_TIMING_BUFFER_MS = REFRESH_TIMING_BUFFER_MS;
const MIN_REFRESH_WAIT_MS = 10000; // avoid blasting requests as fast as the cpu can handle

exports.MIN_REFRESH_WAIT_MS = MIN_REFRESH_WAIT_MS;
const DEFAULT_TOKEN_EXP_MS = 300000; // (5 min) used only when parsing guest token exp fails
// when do we refresh the guest token?

exports.DEFAULT_TOKEN_EXP_MS = DEFAULT_TOKEN_EXP_MS;

function getGuestTokenRefreshTiming(currentGuestToken) {
  const parsedJwt = JSON.parse(Buffer.from(currentGuestToken.split('.')[1], 'base64').toString()); // if exp is int, it is in seconds, but Date() takes milliseconds

  const exp = new Date(/[^0-9\.]/g.test(parsedJwt.exp) ? parsedJwt.exp : parseFloat(parsedJwt.exp) * 1000);
  const isValidDate = exp.toString() !== 'Invalid Date';
  const ttl = isValidDate ? Math.max(MIN_REFRESH_WAIT_MS, exp.getTime() - Date.now()) : DEFAULT_TOKEN_EXP_MS;
  return ttl - REFRESH_TIMING_BUFFER_MS;
}