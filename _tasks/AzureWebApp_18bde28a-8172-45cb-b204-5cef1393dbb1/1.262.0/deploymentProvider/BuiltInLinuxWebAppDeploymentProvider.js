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
exports.BuiltInLinuxWebAppDeploymentProvider = void 0;
const tl = require("azure-pipelines-task-lib/task");
var webCommonUtility = require('azure-pipelines-tasks-webdeployment-common/utility');
var zipUtility = require('azure-pipelines-tasks-webdeployment-common/ziputility');
const packageUtility_1 = require("azure-pipelines-tasks-webdeployment-common/packageUtility");
const ParameterParser = require("azure-pipelines-tasks-webdeployment-common/ParameterParserUtility");
const AzureRmWebAppDeploymentProvider_1 = require("./AzureRmWebAppDeploymentProvider");
const initScriptAppSetting = "-INIT_SCRIPT";
class BuiltInLinuxWebAppDeploymentProvider extends AzureRmWebAppDeploymentProvider_1.AzureRmWebAppDeploymentProvider {
    DeployWebAppStep() {
        return __awaiter(this, void 0, void 0, function* () {
            let packageType = this.taskParams.Package.getPackageType();
            let deploymentMethodtelemetry = packageType === packageUtility_1.PackageType.war ? '{"deploymentMethod":"War Deploy"}' : '{"deploymentMethod":"Zip Deploy"}';
            console.log("##vso[telemetry.publish area=TaskDeploymentMethod;feature=AzureWebAppDeployment]" + deploymentMethodtelemetry);
            tl.debug('Performing Linux built-in package deployment');
            yield this.kuduServiceUtility.warmpUp();
            switch (packageType) {
                case packageUtility_1.PackageType.folder:
                    let tempPackagePath = webCommonUtility.generateTemporaryFolderOrZipPath(tl.getVariable('AGENT.TEMPDIRECTORY'), false);
                    let archivedWebPackage = yield zipUtility.archiveFolder(this.taskParams.Package.getPath(), "", tempPackagePath);
                    tl.debug("Compressed folder into zip " + archivedWebPackage);
                    this.zipDeploymentID = yield this.kuduServiceUtility.deployUsingZipDeploy(archivedWebPackage);
                    break;
                case packageUtility_1.PackageType.zip:
                    this.zipDeploymentID = yield this.kuduServiceUtility.deployUsingZipDeploy(this.taskParams.Package.getPath());
                    break;
                case packageUtility_1.PackageType.jar:
                    tl.debug("Initiated deployment via kudu service for webapp jar package : " + this.taskParams.Package.getPath());
                    let folderPath = yield webCommonUtility.generateTemporaryFolderForDeployment(false, this.taskParams.Package.getPath(), packageUtility_1.PackageType.jar);
                    let output = yield webCommonUtility.archiveFolderForDeployment(false, folderPath);
                    let webPackage = output.webDeployPkg;
                    let deleteCustomApplicationSetting = ParameterParser.parse(initScriptAppSetting);
                    yield this.appServiceUtility.updateAndMonitorAppSettings(null, deleteCustomApplicationSetting);
                    tl.debug("Initiated deployment via kudu service for webapp jar package : " + webPackage);
                    this.zipDeploymentID = yield this.kuduServiceUtility.deployUsingZipDeploy(webPackage);
                    break;
                case packageUtility_1.PackageType.war:
                    tl.debug("Initiated deployment via kudu service for webapp war package : " + this.taskParams.Package.getPath());
                    let warName = this.taskParams.CustomWarName || webCommonUtility.getFileNameFromPath(this.taskParams.Package.getPath(), ".war");
                    this.zipDeploymentID = yield this.kuduServiceUtility.deployUsingWarDeploy(this.taskParams.Package.getPath(), { slotName: this.appService.getSlot() }, warName);
                    break;
                default:
                    throw new Error(tl.loc('Invalidwebapppackageorfolderpathprovided', this.taskParams.Package.getPath()));
            }
            yield this.appServiceUtility.updateStartupCommandAndRuntimeStack(this.taskParams.RuntimeStack, this.taskParams.StartupCommand);
            yield this.PostDeploymentStep();
        });
    }
    UpdateDeploymentStatus(isDeploymentSuccess) {
        const _super = Object.create(null, {
            UpdateDeploymentStatus: { get: () => super.UpdateDeploymentStatus }
        });
        return __awaiter(this, void 0, void 0, function* () {
            yield _super.UpdateDeploymentStatus.call(this, isDeploymentSuccess);
            if (this.kuduServiceUtility) {
                if (this.zipDeploymentID && this.activeDeploymentID && isDeploymentSuccess) {
                    yield this.kuduServiceUtility.postZipDeployOperation(this.zipDeploymentID, this.activeDeploymentID);
                }
            }
        });
    }
}
exports.BuiltInLinuxWebAppDeploymentProvider = BuiltInLinuxWebAppDeploymentProvider;
