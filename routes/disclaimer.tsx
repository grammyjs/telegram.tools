export default function Disclaimer() {
  return (
    <>
      <a href="/" class="text-grammy">← Back</a>
      <div class="mx-auto max-w-lg">
        <h1 class="text-4xl font-medium mt-5">Disclaimer</h1>
        <ul class="pl-10 flex-col gap-5 mt-5 flex list-disc">
          <li>
            This is a community project and it is <i>not</i>{" "}
            affiliated with Telegram.
          </li>
          <li>
            All tools run inside your browser, and they don’t communicate with
            any server except Telegram.
          </li>
          <li>
            Some tools might require their users to sign into user accounts. The
            authors of these tools are not responsible for their abuse which
            might potentially trigger bans.
          </li>
        </ul>
      </div>
    </>
  );
}
