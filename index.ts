import { Project } from "ts-morph";

const project = new Project({
  tsConfigFilePath: "./grafana/tsconfig.json",
});

console.log("project: ", project);
