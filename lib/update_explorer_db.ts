import { Dexie, Table } from "dexie";
import type { Context } from "grammy/mod.ts";

export interface Update {
  id?: number;
  updateId: number;
  data: Context["update"];
}

export class Db extends Dexie {
  updates!: Table<Update, number>;

  constructor(token: string) {
    super(`update-explorer_${token}`);
    this.version(1).stores({
      updates: "++id, &updateId",
    });
  }
}
