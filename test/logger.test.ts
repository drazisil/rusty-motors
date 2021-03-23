// mco-server is a game server, written from scratch, for an old game
// Copyright (C) <2017-2018>  <Joseph W Becher>
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

import { logger } from '../src/shared/logger'
import { expect } from 'chai'

/* eslint-env mocha */

it('Logger', () => {
  expect(typeof logger).to.equal('object')
})
