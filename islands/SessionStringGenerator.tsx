import { useSignal } from "@preact/signals";
import { Button } from "../components/Button.tsx";
import { Caption } from "../components/Caption.tsx";
import { Input } from "../components/Input.tsx";
import { Label } from "../components/Label.tsx";
import { Select } from "../components/Select.tsx";
import { Error, error } from "./Error.tsx";

/*


pyrogram
+------+----------+------------+
| Size |   Type   |   Content  |
+------+----------+------------+
|    1 |  uint8   |  dc_id     |
|    4 |  uint32  |  api_id    |
|    1 |  boolean |  test_mode |
|  255 |  bytes   |  auth_key  |
|    8 |  uint64  |  user_id   |
|    1 |  boolean |  is_bot    |
+------+----------+------------+

+-----------------------------------+
| base64 urlsafe encode, strip =    |
+-----------------------------------+

------------

telethon

+---------+------------------+-----------+
| Size    | Type             | Content   |
+---------+------------------+-----------+
| 1       | constant 0x01    |  version  |
| 1       | uint8            | dc_id     |
| 4 or 16 | IPv4/IPv6 octets | ip        |
| 2       | uint16           | port      |
| 255     | bytes            | auth_key  |
+---------+------------------+-----------+


------------


gramjs

+---------+------------------+-----------+
| Size    | Type             | Content   |
+---------+------------------+-----------+
| 1       | constant 0x01    |  version  |
| 1       | uint8            | dc_id     |
| 2       | uint16           | ip_length |
| 4 or 16 | IPv4/IPv6 octets | ip        |
| 2       | uint16           | port      |
| 255     | bytes            | auth_key  |
+---------+------------------+-----------+

+---------------------------------------+
|       base64 (urlsafe?) encode        |
+---------------------------------------+

***/

export function SessionStringGenerator() {
  const environment = useSignal<"Production" | "Test">("Production");
  const accountType = useSignal<"Bot" | "User">("Bot");
  const library = useSignal<
    | "Telethon"
    | "Pyrogram"
    | "GramJS"
    | "Grammers"
    | "mtcute"
    | "MTKruto"
  >("Telethon");

  return (
    <>
      <div class="gap-4 flex flex-col w-full max-w-lg mx-auto">
        <Label>
          <Caption>
            Environment
          </Caption>
          <Select
            values={[
              "Production",
              "Test",
            ]}
            onChange={(v) => environment.value = v}
          />
        </Label>
        <Label>
          <Caption>
            App Credentials
          </Caption>
          <Input placeholder="API ID" name="token" required />
          <Input placeholder="API hash" name="token" required />
        </Label>
        <Label>
          <Caption>
            Library
          </Caption>
          <Select
            values={[
              "Telethon",
              "Pyrogram",
              "GramJS",
              "Grammers",
              "mtcute",
              "MTKruto",
            ]}
            onChange={(v) => library.value = v}
          />
        </Label>
        <Label>
          <Caption>
            Account Type
          </Caption>
          <Select
            values={[
              "Bot",
              "User",
            ]}
            onChange={(v) => accountType.value = v}
          />
        </Label>
        <Label>
          <Caption>Account Details</Caption>
          <Input
            placeholder={accountType.value == "Bot"
              ? "Bot token"
              : "Phone number in international format"}
          />
        </Label>
        <Label>
          <Button
            onClick={() => {
              if (library.value != "MTKruto") {
                error.value = "The chosen library is currently not supported.";
                return;
              }
              if (accountType.value != "Bot") {
                error.value =
                  "The chosen account type is currently not supported.";
                return;
              }
            }}
          >
            Next
          </Button>
          <Caption>
            The credentials you enter are used only in connections made directly
            to Telegram.
          </Caption>
        </Label>
      </div>
      <Error />
    </>
  );
}
