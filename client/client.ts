import { Client } from "mtkruto/mod.ts";

let client_ = new Client();

export function client() {
  return client_;
}
export function setClient(client: Client) {
  client_ = client;
}
