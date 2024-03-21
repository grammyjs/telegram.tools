export const validLibraries = [
  "telethon",
  "pyrogram",
  "gramjs",
  "mtcute",
  "mtkruto",
] as const;
export const nameMap: Record<ValidLibrary, string> = {
  telethon: "Telethon",
  pyrogram: "Pyrogram",
  gramjs: "GramJS",
  mtcute: "mtcute",
  mtkruto: "MTKruto",
};
export type ValidLibrary = (typeof validLibraries)[number];
export function isValidLibrary(string: string): string is ValidLibrary {
  return validLibraries.includes(string as unknown as ValidLibrary);
}
