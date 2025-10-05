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
exports.AzureWebAppSiteContainersDeploymentProvider = void 0;
const tl = require("azure-pipelines-task-lib/task");
const BuiltInLinuxWebAppDeploymentProvider_1 = require("./BuiltInLinuxWebAppDeploymentProvider");
const constants_1 = require("azure-pipelines-tasks-azure-arm-rest/constants");
class AzureWebAppSiteContainersDeploymentProvider extends BuiltInLinuxWebAppDeploymentProvider_1.BuiltInLinuxWebAppDeploymentProvider {
    constructor(taskParams) {
        super(taskParams);
        tl.debug("AzureWebAppSiteContainersDeploymentProvider initialized with task parameters.");
    }
    PreDeploymentStep() {
        const _super = Object.create(null, {
            PreDeploymentStep: { get: () => super.PreDeploymentStep }
        });
        return __awaiter(this, void 0, void 0, function* () {
            if (this.taskParams.azureEndpoint.scheme && this.taskParams.azureEndpoint.scheme.toLowerCase() === constants_1.AzureRmEndpointAuthenticationScheme.PublishProfile) {
                throw new Error(tl.loc('SiteContainersNotSupportedWithPublishProfileAuthentication'));
            }
            // Call the parent class's PreDeploymentStep to ensure all necessary setup is done.
            yield _super.PreDeploymentStep.call(this);
        });
    }
    DeployWebAppStep() {
        const _super = Object.create(null, {
            DeployWebAppStep: { get: () => super.DeployWebAppStep }
        });
        return __awaiter(this, void 0, void 0, function* () {
            // The AzureWebAppSiteContainersDeploymentProvider inherits the deployment logic from BuiltInLinuxWebAppDeploymentProvider.
            console.log(tl.loc('StartedUpdatingSiteContainers'));
            for (const siteContainer of this.taskParams.SiteContainers) {
                console.log(tl.loc('UpdatingSiteContainer', siteContainer.getName()));
                yield this.appServiceUtility.updateSiteContainer(siteContainer);
            }
            console.log(tl.loc('CompletedUpdatingSiteContainers'));
            // Update the blessed app now.
            yield _super.DeployWebAppStep.call(this);
            tl.debug("Deployment for AzureWebAppSiteContainers completed successfully.");
        });
    }
}
exports.AzureWebAppSiteContainersDeploymentProvider = AzureWebAppSiteContainersDeploymentProvider;
