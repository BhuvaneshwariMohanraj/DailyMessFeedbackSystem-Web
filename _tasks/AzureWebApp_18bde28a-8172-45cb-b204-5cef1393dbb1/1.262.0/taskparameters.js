"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeploymentType = exports.TaskParametersUtility = void 0;
const tl = require("azure-pipelines-task-lib/task");
var webCommonUtility = require('azure-pipelines-tasks-webdeployment-common/utility');
const azure_arm_endpoint_1 = require("azure-pipelines-tasks-azure-arm-rest/azure-arm-endpoint");
const azure_arm_resource_1 = require("azure-pipelines-tasks-azure-arm-rest/azure-arm-resource");
const azure_arm_app_service_1 = require("azure-pipelines-tasks-azure-arm-rest/azure-arm-app-service");
const constants_1 = require("azure-pipelines-tasks-azure-arm-rest/constants");
const packageUtility_1 = require("azure-pipelines-tasks-webdeployment-common/packageUtility");
const SiteContainer_1 = require("azure-pipelines-tasks-azure-arm-rest/SiteContainer");
const webAppKindMap = new Map([
    ['app', 'webApp'],
    ['app,linux', 'webAppLinux']
]);
class TaskParametersUtility {
    static getParameters() {
        return __awaiter(this, void 0, void 0, function* () {
            var taskParameters = {
                connectedServiceName: tl.getInput('azureSubscription', true),
                WebAppKind: tl.getInput('appType', false),
                DeployToSlotOrASEFlag: tl.getBoolInput('deployToSlotOrASE', false),
                WebConfigParameters: tl.getInput('customWebConfig', false),
                AppSettings: tl.getInput('appSettings', false),
                StartupCommand: tl.getInput('startUpCommand', false),
                ConfigurationSettings: tl.getInput('configurationStrings', false),
                ResourceGroupName: tl.getInput('resourceGroupName', false),
                SlotName: tl.getInput('slotName', false),
                WebAppName: tl.getInput('appName', true),
                CustomWarName: tl.getInput('customDeployFolder', false)
            };
            taskParameters.azureEndpoint = yield new azure_arm_endpoint_1.AzureRMEndpoint(taskParameters.connectedServiceName).getEndpoint();
            console.log(tl.loc('GotconnectiondetailsforazureRMWebApp0', taskParameters.WebAppName));
            var appDetails = yield this.getWebAppKind(taskParameters);
            taskParameters.ResourceGroupName = appDetails["resourceGroupName"];
            taskParameters.WebAppKind = appDetails["webAppKind"];
            taskParameters.isLinuxApp = taskParameters.WebAppKind && taskParameters.WebAppKind.indexOf("Linux") != -1;
            var endpointTelemetry = '{"endpointId":"' + taskParameters.connectedServiceName + '"}';
            console.log("##vso[telemetry.publish area=TaskEndpointId;feature=AzureRmWebAppDeployment]" + endpointTelemetry);
            taskParameters.Package = new packageUtility_1.Package(tl.getPathInput('package', true));
            taskParameters.WebConfigParameters = this.updateWebConfigParameters(taskParameters);
            if (taskParameters.isLinuxApp) {
                taskParameters.RuntimeStack = tl.getInput('runtimeStack', false);
            }
            taskParameters.DeploymentType = DeploymentType[(tl.getInput('deploymentMethod', false))];
            // Used for siteContainers apps.
            const siteContainersConfigInput = tl.getInput('siteContainersConfig');
            if (siteContainersConfigInput) {
                const raw = JSON.parse(siteContainersConfigInput);
                taskParameters.SiteContainers = raw.map(SiteContainer_1.SiteContainer.fromJson);
            }
            else {
                taskParameters.SiteContainers = null;
            }
            return taskParameters;
        });
    }
    static getWebAppKind(taskParameters) {
        return __awaiter(this, void 0, void 0, function* () {
            var resourceGroupName = taskParameters.ResourceGroupName;
            var kind = taskParameters.WebAppKind;
            if (taskParameters.azureEndpoint.scheme.toLowerCase() != constants_1.AzureRmEndpointAuthenticationScheme.PublishProfile) {
                if (!resourceGroupName) {
                    var resources = new azure_arm_resource_1.Resources(taskParameters.azureEndpoint);
                    var appDetails = yield resources.getAppDetails(taskParameters.WebAppName);
                    resourceGroupName = appDetails["resourceGroupName"];
                    if (!kind) {
                        kind = webAppKindMap.get(appDetails["kind"]) ? webAppKindMap.get(appDetails["kind"]) : appDetails["kind"];
                    }
                    tl.debug(`Resource Group: ${resourceGroupName}`);
                }
                else if (!kind) {
                    var appService = new azure_arm_app_service_1.AzureAppService(taskParameters.azureEndpoint, taskParameters.ResourceGroupName, taskParameters.WebAppName);
                    var configSettings = yield appService.get(true);
                    kind = webAppKindMap.get(configSettings.kind) ? webAppKindMap.get(configSettings.kind) : configSettings.kind;
                }
            }
            return {
                resourceGroupName: resourceGroupName,
                webAppKind: kind
            };
        });
    }
    static updateWebConfigParameters(taskParameters) {
        tl.debug("intially web config parameters :" + taskParameters.WebConfigParameters);
        var webConfigParameters = taskParameters.WebConfigParameters;
        if (taskParameters.Package.getPackageType() === packageUtility_1.PackageType.jar && (!taskParameters.isLinuxApp)) {
            if (!webConfigParameters) {
                webConfigParameters = "-appType java_springboot";
            }
            if (webConfigParameters.indexOf("-appType java_springboot") < 0) {
                webConfigParameters += " -appType java_springboot";
            }
            if (webConfigParameters.indexOf("-JAR_PATH D:\\home\\site\\wwwroot\\*.jar") >= 0) {
                var jarPath = webCommonUtility.getFileNameFromPath(taskParameters.Package.getPath());
                webConfigParameters = webConfigParameters.replace("D:\\home\\site\\wwwroot\\*.jar", jarPath);
            }
            else if (webConfigParameters.indexOf("-JAR_PATH ") < 0) {
                var jarPath = webCommonUtility.getFileNameFromPath(taskParameters.Package.getPath());
                webConfigParameters += " -JAR_PATH " + jarPath;
            }
            if (webConfigParameters.indexOf("-Dserver.port=%HTTP_PLATFORM_PORT%") > 0) {
                webConfigParameters = webConfigParameters.replace("-Dserver.port=%HTTP_PLATFORM_PORT%", "");
            }
            tl.debug("web config parameters :" + webConfigParameters);
        }
        return webConfigParameters;
    }
}
exports.TaskParametersUtility = TaskParametersUtility;
var DeploymentType;
(function (DeploymentType) {
    DeploymentType[DeploymentType["auto"] = 0] = "auto";
    DeploymentType[DeploymentType["zipDeploy"] = 1] = "zipDeploy";
    DeploymentType[DeploymentType["runFromPackage"] = 2] = "runFromPackage";
    DeploymentType[DeploymentType["warDeploy"] = 3] = "warDeploy";
})(DeploymentType || (exports.DeploymentType = DeploymentType = {}));
