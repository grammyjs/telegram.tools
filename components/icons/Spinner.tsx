export function Spinner() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      class="animate-spin-fast w-[16px] h-[16px] xl:(w-[30px] h-[30px])"
    >
      <path d="M24 12a12 12 0 1 0-12 12v-2.4a9.6 9.6 0 1 1 9.6-9.6H24Z" />
    </svg>
  );
}

export function Spinner2({ size }: { size?: number }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      width={size ?? 16}
      height={size ?? 16}
      class="animate-spin-fast"
    >
      <path d="M24 12a12 12 0 1 0-12 12v-2.4a9.6 9.6 0 1 1 9.6-9.6H24Z" />
    </svg>
  );
}
