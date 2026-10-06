import type {
  IExecuteFunctions,
  INodeExecutionData,
  INodeType,
  INodeTypeDescription,
  INodeProperties,
} from "n8n-workflow";
import { NodeConnectionTypes } from "n8n-workflow";
import { executeOperations, type Operation, type ResourceRoute } from "./transport";
import operations from "./operations.json";
import properties from "./properties.json";
import routes from "./routes.json";

export class Directoryz implements INodeType {
  description: INodeTypeDescription = {
    displayName: "Directoryz",
    name: "directoryz",
    icon: { light: "file:directoryz.svg", dark: "file:directoryz.svg" },
    group: ["transform"],
    version: 1,
    subtitle: '={{$parameter["operation"]}}',
    description: "Automate your Directoryz account",
    defaults: { name: "Directoryz" },
    inputs: [NodeConnectionTypes.Main],
    outputs: [NodeConnectionTypes.Main],
    usableAsTool: true,
    credentials: [{ name: "directoryzOAuth2Api", required: true }],
    properties: properties as INodeProperties[],
  };
  async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
    return executeOperations(
      this,
      "https://api.directoryz.app",
      "directoryzOAuth2Api",
      operations as unknown as Operation[],
      routes as Record<string,ResourceRoute>,
    );
  }
}
