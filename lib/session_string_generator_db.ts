import { Dexie, Table } from "dexie";

import type { User } from "mtkruto/3_types.ts";

export interface SessionString {
  account: string;
  string: {
    apiId: number;
    ip: string;
    dcId: number;
    testMode: boolean;
    me: User;
    authKey: Uint8Array;
  };
}

export class Db extends Dexie {
  strings!: Table<SessionString, number>;

  constructor() {
    super("session-string-generator");
    this.version(2).stores({
      strings: "&account",
    });
  }
}
