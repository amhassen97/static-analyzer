import { join } from "path";
import { Project, ts } from "ts-morph";
import { isCallExpression, isIdentifier } from "typescript";

const project = new Project({
  tsConfigFilePath: "../grafana/tsconfig.json",
});

const filename = join(
  __dirname,
  "..",
  `\\grafana\\public\\app\\core\\selectors\\navModel.ts`
);

console.log("filename: ", filename);

function getMethod() {
  // console.log(file);

  const file = project.getSourceFileOrThrow(filename);
  const tsFile = file.compilerNode;

  const nodes = flatNodesFromFile(tsFile);

  for (const node of nodes) {
    if (isIdentifier(node) && node.getText() === "getNavModel") {
      return node;
    }
  }
}

console.log(getStrings());

function getStrings() {
  const array: string[] = [];
  const node = getMethod();

  const references = project
    .getLanguageService()
    .compilerObject.findReferences(filename, node.end);

  for (const symbol of references) {
    // console.log("symbol: ", symbol);

    for (const reference of symbol.references) {
      const node = nodeForReference(reference);

      const maybeCallExpression = node.parent;

      if (isCallExpression(maybeCallExpression)) {
        array.push(maybeCallExpression.arguments[1].getText());
      }
    }
  }
  return array;
}

function nodeForReference(reference: ts.ReferenceEntry) {
  const file = project.getSourceFileOrThrow(reference.fileName);

  const nodes = flatNodesFromFile(file.compilerNode);

  const theNode = nodes.find(
    (node) =>
      node.getStart() === reference.textSpan.start &&
      node.getEnd() === reference.textSpan.start + reference.textSpan.length
  );

  if (theNode === undefined) {
    throw new Error("cannot find node" + JSON.stringify(reference, null, 2));
  }

  return theNode;
}

function flatNodesFromFile(file: ts.SourceFile) {
  const array: ts.Node[] = [];
  for (const statement of file.statements) {
    for (const node of flatNodes(statement)) {
      array.push(node);
    }
  }

  return array;
}

function flatNodes(node: ts.Node) {
  const array: ts.Node[] = [];
  array.push(node);

  node.forEachChild((x) => {
    array.push(x);

    for (const childNode of flatNodes(x)) {
      array.push(childNode);
    }
  });

  return array;
}
