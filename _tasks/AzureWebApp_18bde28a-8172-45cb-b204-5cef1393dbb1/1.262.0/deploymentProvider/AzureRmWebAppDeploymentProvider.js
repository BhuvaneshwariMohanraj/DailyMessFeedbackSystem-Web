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
exports.AzureRmWebAppDeploymentProvider = void 0;
const tl = require("azure-pipelines-task-lib/task");
const publishProfileUtility = require("azure-pipelines-tasks-utility-common/publishProfileUtility");
const azure_arm_app_service_1 = require("azure-pipelines-tasks-azure-arm-rest/azure-arm-app-service");
const azure_arm_app_service_kudu_1 = require("azure-pipelines-tasks-azure-arm-rest/azure-arm-app-service-kudu");
const azureAppServiceUtility_1 = require("azure-pipelines-tasks-azure-arm-rest/azureAppServiceUtility");
const constants_1 = require("azure-pipelines-tasks-azure-arm-rest/constants");
const packageUtility_1 = require("azure-pipelines-tasks-webdeployment-common/packageUtility");
const ParameterParser = require("azure-pipelines-tasks-webdeployment-common/ParameterParserUtility");
const AzureAppServiceUtilityExt_1 = require("../operations/AzureAppServiceUtilityExt");
const KuduServiceUtility_1 = require("../operations/KuduServiceUtility");
const ReleaseAnnotationUtility_1 = require("../operations/ReleaseAnnotationUtility");
class AzureRmWebAppDeploymentProvider {
    constructor(taskParams) {
        this.virtualApplicationPath = "";
        this.taskParams = taskParams;
        let packageArtifactAlias = packageUtility_1.PackageUtility.getArtifactAlias(this.taskParams.Package.getPath());
        tl.setVariable(constants_1.AzureDeployPackageArtifactAlias, packageArtifactAlias);
    }
    PreDeploymentStep() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.taskParams.azureEndpoint.scheme && this.taskParams.azureEndpoint.scheme.toLowerCase() === constants_1.AzureRmEndpointAuthenticationScheme.PublishProfile) {
                let publishProfileEndpoint = this.taskParams.azureEndpoint;
                this.publishProfileScmCredentials = yield publishProfileUtility.getSCMCredentialsFromPublishProfile(publishProfileEndpoint.PublishProfile);
                const buffer = new Buffer(this.publishProfileScmCredentials.username + ':' + this.publishProfileScmCredentials.password);
                const auth = buffer.toString("base64");
                var authHeader = "Basic " + auth;
                tl.debug("Kudu: using basic authentication for publish profile");
                console.log('##vso[telemetry.publish area=TaskDeploymentMethod;feature=AzureAppServiceDeployment]{"authMethod":"Basic"}');
                this.kuduService = new azure_arm_app_service_kudu_1.Kudu(this.publishProfileScmCredentials.scmUri, authHeader);
                let resourceId = publishProfileEndpoint.resourceId;
                let resourceIdSplit = resourceId.split("/");
                this.slotName = resourceIdSplit.length === 11 ? resourceIdSplit[10] : "production";
            }
            else {
                this.appService = new azure_arm_app_service_1.AzureAppService(this.taskParams.azureEndpoint, this.taskParams.ResourceGroupName, this.taskParams.WebAppName, this.taskParams.SlotName, this.taskParams.WebAppKind);
                this.appServiceUtility = new azureAppServiceUtility_1.AzureAppServiceUtility(this.appService);
                this.appServiceUtilityExt = new AzureAppServiceUtilityExt_1.AzureAppServiceUtilityExt(this.appService);
                this.kuduService = yield this.appServiceUtility.getKuduService();
                this.slotName = this.appService.getSlot();
            }
            this.kuduServiceUtility = new KuduServiceUtility_1.KuduServiceUtility(this.kuduService);
        });
    }
    DeployWebAppStep() {
        return __awaiter(this, void 0, void 0, function* () { });
    }
    UpdateDeploymentStatus(isDeploymentSuccess) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!!this.appService) {
                yield (0, ReleaseAnnotationUtility_1.addReleaseAnnotation)(this.taskParams.azureEndpoint, this.appService, isDeploymentSuccess);
            }
            if (!!this.kuduServiceUtility) {
                this.activeDeploymentID = yield this.kuduServiceUtility.updateDeploymentStatus(isDeploymentSuccess, null, { 'type': 'Deployment', slotName: this.slotName });
                tl.debug('Active DeploymentId :' + this.activeDeploymentID);
            }
            let appServiceApplicationUrl;
            if (!!this.appServiceUtility) {
                appServiceApplicationUrl = yield this.appServiceUtility.getApplicationURL();
            }
            else {
                appServiceApplicationUrl = this.publishProfileScmCredentials.applicationUrl;
            }
            console.log(tl.loc('AppServiceApplicationURL', appServiceApplicationUrl));
            tl.setVariable('AppServiceApplicationUrl', appServiceApplicationUrl);
        });
    }
    PostDeploymentStep() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!!this.appServiceUtility) {
                if (this.taskParams.AppSettings) {
                    var customApplicationSettings = ParameterParser.parse(this.taskParams.AppSettings);
                    yield this.appServiceUtility.updateAndMonitorAppSettings(customApplicationSettings);
                }
                if (this.taskParams.ConfigurationSettings) {
                    var customConfigurationSettings = ParameterParser.parse(this.taskParams.ConfigurationSettings);
                    yield this.appService.updateConfigurationSettings(customConfigurationSettings);
                }
                yield this.appServiceUtilityExt.updateScmTypeAndConfigurationDetails();
            }
        });
    }
}
exports.AzureRmWebAppDeploymentProvider = AzureRmWebAppDeploymentProvider;
