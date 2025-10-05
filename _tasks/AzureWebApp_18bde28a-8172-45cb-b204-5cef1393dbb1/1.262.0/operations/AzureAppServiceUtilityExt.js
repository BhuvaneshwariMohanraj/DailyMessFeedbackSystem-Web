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
exports.AzureAppServiceUtilityExt = exports.AzureDeployPackageArtifactAlias = void 0;
const tl = require("azure-pipelines-task-lib/task");
exports.AzureDeployPackageArtifactAlias = "Azure_App_Service_Deploy_PackageArtifactAlias";
class AzureAppServiceUtilityExt {
    constructor(appService) {
        this._appService = appService;
    }
    updateScmTypeAndConfigurationDetails() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                var configDetails = yield this._appService.getConfiguration();
                var scmType = configDetails.properties.scmType;
                let shouldUpdateMetadata = false;
                if (scmType && scmType.toLowerCase() === "none") {
                    configDetails.properties.scmType = 'VSTSRM';
                    tl.debug('updating SCM Type to VSTS-RM');
                    yield this._appService.updateConfiguration(configDetails);
                    tl.debug('updated SCM Type to VSTS-RM');
                    shouldUpdateMetadata = true;
                }
                else if (scmType && scmType.toLowerCase() == "vstsrm") {
                    tl.debug("SCM Type is VSTSRM");
                    shouldUpdateMetadata = true;
                }
                else {
                    tl.debug(`Skipped updating the SCM value. Value: ${scmType}`);
                }
                if (shouldUpdateMetadata) {
                    tl.debug('Updating metadata with latest pipeline details');
                    let newMetadataProperties = this._getNewMetadata();
                    let siteMetadata = yield this._appService.getMetadata();
                    let skipUpdate = true;
                    for (let property in newMetadataProperties) {
                        if (siteMetadata.properties[property] !== newMetadataProperties[property]) {
                            siteMetadata.properties[property] = newMetadataProperties[property];
                            skipUpdate = false;
                        }
                    }
                    if (!skipUpdate) {
                        yield this._appService.patchMetadata(siteMetadata.properties);
                        tl.debug('Updated metadata with latest pipeline details');
                        console.log(tl.loc("SuccessfullyUpdatedAzureRMWebAppConfigDetails"));
                    }
                    else {
                        tl.debug("No changes in metadata properties, skipping update.");
                    }
                }
            }
            catch (error) {
                tl.warning(tl.loc("FailedToUpdateAzureRMWebAppConfigDetails", error));
            }
        });
    }
    updateConfigurationSettings(properties, formatJSON) {
        return __awaiter(this, void 0, void 0, function* () {
            if (formatJSON) {
                var configurationSettingsProperties = properties[0];
                console.log(tl.loc('UpdatingAppServiceConfigurationSettings', JSON.stringify(configurationSettingsProperties)));
                yield this._appService.patchConfiguration({ 'properties': configurationSettingsProperties });
            }
            else {
                for (var property in properties) {
                    if (!!properties[property] && properties[property].value !== undefined) {
                        properties[property] = properties[property].value;
                    }
                }
                console.log(tl.loc('UpdatingAppServiceConfigurationSettings', JSON.stringify(properties)));
                yield this._appService.patchConfiguration({ 'properties': properties });
            }
            console.log(tl.loc('UpdatedAppServiceConfigurationSettings'));
        });
    }
    _getNewMetadata() {
        var collectionUri = tl.getVariable("system.teamfoundationCollectionUri");
        var projectId = tl.getVariable("system.teamprojectId");
        var releaseDefinitionId = tl.getVariable("release.definitionId");
        // Log metadata properties based on whether task is running in build OR release.
        let newProperties = {
            VSTSRM_ProjectId: projectId,
            VSTSRM_AccountId: tl.getVariable("system.collectionId")
        };
        if (!!releaseDefinitionId) {
            // Task is running in Release
            var artifactAlias = tl.getVariable(exports.AzureDeployPackageArtifactAlias);
            tl.debug("Artifact Source Alias is: " + artifactAlias);
            let buildDefinitionUrl = "";
            let buildDefintionId = "";
            if (artifactAlias) {
                let artifactType = tl.getVariable(`release.artifacts.${artifactAlias}.type`);
                // Get build definition info only when artifact type is build.
                if (artifactType && artifactType.toLowerCase() == "build") {
                    buildDefintionId = tl.getVariable("build.definitionId");
                    let buildProjectId = tl.getVariable("build.projectId") || projectId;
                    let artifactBuildDefinitionId = tl.getVariable("release.artifacts." + artifactAlias + ".definitionId");
                    let artifactBuildProjectId = tl.getVariable("release.artifacts." + artifactAlias + ".projectId");
                    if (artifactBuildDefinitionId && artifactBuildProjectId) {
                        buildDefintionId = artifactBuildDefinitionId;
                        buildProjectId = artifactBuildProjectId;
                    }
                    buildDefinitionUrl = collectionUri + buildProjectId + "/_build?_a=simple-process&definitionId=" + buildDefintionId;
                }
            }
            newProperties["VSTSRM_BuildDefinitionId"] = buildDefintionId;
            newProperties["VSTSRM_ReleaseDefinitionId"] = releaseDefinitionId;
            newProperties["VSTSRM_BuildDefinitionWebAccessUrl"] = buildDefinitionUrl;
            newProperties["VSTSRM_ConfiguredCDEndPoint"] = collectionUri + projectId + "/_apps/hub/ms.vss-releaseManagement-web.hub-explorer?definitionId=" + releaseDefinitionId;
        }
        else {
            // Task is running in Build
            let buildDefintionId = tl.getVariable("system.definitionId");
            newProperties["VSTSRM_BuildDefinitionId"] = buildDefintionId;
            let buildDefinitionUrl = collectionUri + projectId + "/_build?_a=simple-process&definitionId=" + buildDefintionId;
            newProperties["VSTSRM_BuildDefinitionWebAccessUrl"] = buildDefinitionUrl;
            newProperties["VSTSRM_ConfiguredCDEndPoint"] = buildDefinitionUrl;
        }
        return newProperties;
    }
}
exports.AzureAppServiceUtilityExt = AzureAppServiceUtilityExt;
