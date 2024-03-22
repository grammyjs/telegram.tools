import {
  Project,
  PropertyAssignment,
  SourceFile,
  StringLiteral,
  SyntaxKind,
} from "https://deno.land/x/ts_morph@17.0.1/mod.ts";

function getPropertiesOfObject(source: SourceFile, key: string) {
  return source
    .getVariableDeclarationOrThrow(key)
    .getInitializerIfKindOrThrow(SyntaxKind.AsExpression)
    .getExpressionIfKindOrThrow(SyntaxKind.ObjectLiteralExpression)
    .getProperties() as PropertyAssignment[];
}

function getObject(source: SourceFile, key: string) {
  return getPropertiesOfObject(source, key).reduce((properties, property) => {
    const propertyNameKind = property.getNameNode().getKind();
    const propertyName = propertyNameKind === SyntaxKind.Identifier
      ? property.getName()
      : property.getNameNode().asKindOrThrow(SyntaxKind.StringLiteral)
        .getLiteralText();
    const value = property
      .getInitializerIfKindOrThrow(SyntaxKind.ArrayLiteralExpression)
      .getElements()
      .map((element) => {
        return (element as StringLiteral).getLiteralText();
      });
    return { ...properties, [propertyName]: value };
  }, {});
}

type Shortcuts = Record<string, string[]>;

// redirects to latest version of grammY = up to date filter queries.
const response = await fetch("https://deno.land/x/grammy/filter.ts");
if (!response.ok) {
  console.log(response);
  throw new Error("Request failed");
}

const filterFileContent = await response.text();
const project = new Project();
// NOTE: ts_morph doesn't resolve the imports in the filter.ts file because, currently
// FilterQuery and other local variables are independent of those relative imports.
// This logic needs to be changed if this isn't the situation in the future.
const source = project.createSourceFile(".filter.ts", filterFileContent);

const UPDATE_KEYS = getPropertiesOfObject(source, "UPDATE_KEYS").map((
  property,
) => property.getName()) as string[];
const L1_SHORTCUTS = getObject(source, "L1_SHORTCUTS") as Shortcuts;
const L2_SHORTCUTS = getObject(source, "L2_SHORTCUTS") as Shortcuts;
const FILTER_QUERIES = source
  .getTypeAliasOrThrow("FilterQuery")
  .getType()
  .getUnionTypes()
  .map((u) => u.getLiteralValue()) as string[];

const modFile = `export default ${JSON.stringify(FILTER_QUERIES)};`;
const filterFile = `
  export const UPDATE_KEYS = ${JSON.stringify(UPDATE_KEYS)};\n
  export const L1_SHORTCUTS = ${JSON.stringify(L1_SHORTCUTS)};\n
  export const L2_SHORTCUTS = ${JSON.stringify(L2_SHORTCUTS)};\n`;

await Deno.writeTextFile("./mod.ts", modFile);
await Deno.writeTextFile("./filter.ts", filterFile);
