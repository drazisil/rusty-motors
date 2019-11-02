// mco-server is a game server, written from scratch, for an old game
// Copyright (C) <2017-2018>  <Joseph W Becher>

// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

import { NPSPersonaMapsMsg } from "./NPSPersonaMapsMsg";

describe("NPSPersonaMapsMsg", () => {
  const npsPersonaMapsMsg = new NPSPersonaMapsMsg("Recieved");
  test("direction is set correctly", () => {
    expect(npsPersonaMapsMsg.direction).toEqual("Recieved");
    expect(npsPersonaMapsMsg.msgNo).toEqual(0x607);
  });
});
