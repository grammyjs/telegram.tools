import { Card } from "../components/Card.tsx";
import { File } from "../components/icons/File.tsx";
import { Code } from "../components/icons/Code.tsx";
import { Filter } from "../components/icons/Filter.tsx";
import { Radio } from "../components/icons/Radio.tsx";
import { Webhook } from "../components/icons/Webhook.tsx";
import { ExternalLink } from "../components/ExternalLink.tsx";
import { Repeat } from "../components/icons/Repeat.tsx";
import { FileText } from "../components/icons/FileText.tsx";
import { At } from "../components/icons/At.tsx";
import { Key } from "../components/icons/Key.tsx";

const sections = [
  {
    name: "System Status",
    description: "Tools that check if the Telegram servers are up",
    tools: [
      {
        href: "/connectivity-test",
        icon: <Radio />,
        name: "Connectivity Test",
        description:
          "See if you are able to reach Telegram\u2019s data centers.",
      },
      {
        href: "/bot-api-status",
        icon: <Radio />,
        name: "Bot API Status",
        description:
          "See if you are able to reach Telegram\u2019s Bot API server.",
      },
    ],
  },
  {
    name: "Bot API",
    description: (
      <>
        <ExternalLink href="https://core.telegram.org/bots/api">
          Bot API
        </ExternalLink>{" "}
        is an official API for building Telegram bots.
      </>
    ),
    tools: [
      {
        href: "/file-id-analyzer",
        icon: <File />,
        name: "File ID Analyzer",
        description: (
          <>
            Extract information from file&nbsp;IDs provided by Bot API or TDLib.
          </>
        ),
      },
      {
        href: "/inline-message-id-unpacker",
        icon: <At />,
        name: "Inline Message ID Unpacker",
        description: "Unpack inline message IDs.",
      },
      {
        href: "/update-explorer",
        icon: <Code />,
        name: "Update Explorer",
        description: "Explore a bot\u2019s update stream live.",
      },
      {
        href: "/webhook-manager",
        icon: <Webhook />,
        name: "Webhook Manager",
        description: "Manage a bot\u2019s webhook settings.",
      },
    ],
  },
  {
    name: "Session Strings",
    description:
      "Session strings are a piece of text generated or consumed by a \
    third-party client library that include the necessary information to \
    authorize as an account.",
    tools: [
      {
        href: "/session-string-generator",
        icon: <Key />,
        name: "Session String Generator",
        description:
          "Generate a session string for your desired client library.",
      },
      {
        href: "/webhook-manager",
        icon: <Repeat />,
        name: "Session String Converter",
        description: "Convert between different known session string formats.",
        disabled: true,
      },
      {
        href: "/session-string-analyzer",
        icon: <FileText />,
        name: "Session String Analyzer",
        description: "Extract information from session strings.",
      },
    ],
  },
  {
    name: "grammY",
    description: (
      <>
        <ExternalLink href="https://grammy.dev">grammY</ExternalLink>{" "}
        is a Bot API framework for TypeScript and JavaScript that can run almost
        anywhere JavaScript does.
      </>
    ),
    tools: [
      {
        href: "/filter-query-browser",
        icon: <Filter />,
        name: "Filter Query Browser",
        description: "Browse through grammY\u2019s filter queries.",
        disabled: true,
      },
    ],
  },
];

export default function Home() {
  return (
    <>
      <div class="flex flex-col w-full gap-10">
        {sections.map((v) => (
          <div class="flex flex-col gap-5">
            <div class="flex flex-col gap-1.5">
              <div class="text-2xl font-bold">{v.name}</div>
              {v.description && <div>{v.description}</div>}
            </div>
            <div class="grid gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {v.tools.map((v) => (
                <Card
                  href={v.href}
                  title={v.name}
                  description={v.description}
                  icon={v.icon}
                  disabled={"disabled" in v}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
      <footer class="text-xs py-10 flex gap-10 items-center justify-between flex-wrap">
        <span class="opacity-50">
          &copy; {new Date().getFullYear() > 2024 && "2024-"}
          {new Date().getFullYear()}{" "}
          grammyjs &middot; telegram.tools is not affiliated with Telegram.
        </span>
        <a
          href="https://github.com/grammyjs/telegram.tools"
          target="_blank"
          class="text-grammy"
        >
          Source Code
        </a>
      </footer>
    </>
  );
}
