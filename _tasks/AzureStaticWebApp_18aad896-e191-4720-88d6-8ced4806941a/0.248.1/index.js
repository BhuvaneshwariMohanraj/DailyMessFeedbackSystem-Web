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
const path = require("path");
const tl = require("azure-pipelines-task-lib/task");
const fs = require("fs");
const appLocationInputName = 'app_location';
const appBuildCommandInputName = 'app_build_command';
const outputLocationInputName = 'output_location';
const apiLocationInputName = 'api_location';
const apiBuildCommandInputName = 'api_build_command';
const routesLocationInputName = 'routes_location';
const buildTimeoutInMinutesInputName = 'build_timeout_in_minutes';
const configFileLocationInputName = 'config_file_location';
const apiTokenInputName = 'azure_static_web_apps_api_token';
const accessTokenInputName = 'azure_access_token';
const defaultHostnameInputName = 'default_hostname';
const deploymentEnvironmentInputName = 'deployment_environment';
const productionBranchInputName = 'production_branch';
const dataApiLocationInputName = 'data_api_location';
function run() {
    return __awaiter(this, void 0, void 0, function* () {
        const envVarFilePath = path.join(__dirname, 'env.list');
        try {
            tl.setResourcePath(path.join(__dirname, 'task.json'));
            var bash = tl.tool(tl.which('bash', true));
            var scriptPath = path.join(__dirname, 'launch-docker.sh');
            var taskWorkingDirectory = path.dirname(scriptPath);
            tl.mkdirP(taskWorkingDirectory);
            tl.cd(taskWorkingDirectory);
            bash.arg(scriptPath);
            bash.line(tl.getInput('args', false));
            yield createDockerEnvVarFile(envVarFilePath);
            const options = {
                failOnStdErr: false
            };
            yield bash.exec(options);
            tl.setResult(tl.TaskResult.Succeeded, null);
        }
        catch (err) {
            tl.setResult(tl.TaskResult.Failed, err);
        }
        finally {
            yield fs.promises.unlink(envVarFilePath).catch(() => tl.warning("Unable to delete env file"));
        }
    });
}
function createDockerEnvVarFile(envVarFilePath) {
    return __awaiter(this, void 0, void 0, function* () {
        var variableString = "";
        const systemVariableNames = new Set();
        const addVariableToString = (envVarName, envVarValue) => variableString += envVarName + "=" + envVarValue + "\n";
        const addSystemVariableToString = (envVarName, envVarValue) => {
            addVariableToString(envVarName, envVarValue);
            systemVariableNames.add(envVarName);
        };
        const addInputStringToString = (envVarName, envVarValue, inputName) => {
            if (envVarValue.includes("\n")) {
                throw "Input " + inputName + " is a multiline string and cannot be added to the build environment.";
            }
            addSystemVariableToString(envVarName, envVarValue);
        };
        const workingDirectory = tl.getInput('cwd', false) || process.env.SYSTEM_DEFAULTWORKINGDIRECTORY;
        const appLocation = tl.getInput(appLocationInputName, false) || "";
        const appBuildCommand = tl.getInput(appBuildCommandInputName, false) || "";
        const outputLocation = tl.getInput(outputLocationInputName, false) || "";
        const apiLocation = tl.getInput(apiLocationInputName, false) || "";
        const apiBuildCommand = tl.getInput(apiBuildCommandInputName, false) || "";
        const routesLocation = tl.getInput(routesLocationInputName, false) || "";
        const buildTimeoutInMinutes = tl.getInput(buildTimeoutInMinutesInputName, false) || "";
        const configFileLocation = tl.getInput(configFileLocationInputName, false) || "";
        const deploymentEnvironment = tl.getInput(deploymentEnvironmentInputName, false) || "";
        const productionBranch = tl.getInput(productionBranchInputName, false) || "";
        const dataApiLocation = tl.getInput(dataApiLocationInputName, false) || "";
        const skipAppBuild = tl.getBoolInput('skip_app_build', false);
        const skipApiBuild = tl.getBoolInput('skip_api_build', false);
        const isStaticExport = tl.getBoolInput('is_static_export', false);
        const apiToken = process.env[apiTokenInputName] || tl.getInput(apiTokenInputName, false) || "";
        const accessToken = process.env[accessTokenInputName] || tl.getInput(accessTokenInputName, false) || "";
        const defaultHostname = process.env[defaultHostnameInputName] || tl.getInput(defaultHostnameInputName, false) || "";
        const systemVerbose = getNullableBooleanFromString(process.env['SYSTEM_DEBUG']);
        const inputVerbose = getNullableBooleanFromString(tl.getInput('verbose', false));
        const verbose = inputVerbose === true ? true : (inputVerbose === false ? false : systemVerbose === true);
        const deploymentClient = "mcr.microsoft.com/appsvc/staticappsclient:stable";
        const containerWorkingDir = "/working_dir";
        addInputStringToString("APP_LOCATION", appLocation, appLocationInputName);
        addInputStringToString("APP_BUILD_COMMAND", appBuildCommand, appBuildCommandInputName);
        addInputStringToString("OUTPUT_LOCATION", outputLocation, outputLocationInputName);
        addInputStringToString("API_LOCATION", apiLocation, apiLocationInputName);
        addInputStringToString("API_BUILD_COMMAND", apiBuildCommand, apiBuildCommandInputName);
        addInputStringToString("ROUTES_LOCATION", routesLocation, routesLocationInputName);
        addInputStringToString("BUILD_TIMEOUT_IN_MINUTES", buildTimeoutInMinutes, buildTimeoutInMinutesInputName);
        addInputStringToString("CONFIG_FILE_LOCATION", configFileLocation, configFileLocationInputName);
        addInputStringToString("DEPLOYMENT_ENVIRONMENT", deploymentEnvironment, deploymentEnvironmentInputName);
        addInputStringToString("PRODUCTION_BRANCH", productionBranch, productionBranchInputName);
        addInputStringToString("DATA_API_LOCATION", dataApiLocation, dataApiLocationInputName);
        addSystemVariableToString("SKIP_APP_BUILD", skipAppBuild.toString());
        addSystemVariableToString("SKIP_API_BUILD", skipApiBuild.toString());
        addSystemVariableToString("IS_STATIC_EXPORT", isStaticExport.toString());
        addSystemVariableToString("VERBOSE", verbose.toString());
        addInputStringToString("DEPLOYMENT_TOKEN", apiToken, apiTokenInputName);
        addInputStringToString("AZURE_ACCESS_TOKEN", accessToken, accessTokenInputName);
        addInputStringToString("DEFAULT_HOSTNAME", defaultHostname, defaultHostnameInputName);
        process.env['SWA_DEPLOYMENT_CLIENT'] = deploymentClient;
        process.env['SWA_WORKING_DIR'] = workingDirectory;
        process.env['SWA_WORKSPACE_DIR'] = containerWorkingDir;
        addSystemVariableToString("GITHUB_WORKSPACE", "");
        addSystemVariableToString("DEPLOYMENT_PROVIDER", "DevOps");
        addSystemVariableToString("REPOSITORY_URL", process.env.BUILD_REPOSITORY_URI || "");
        addSystemVariableToString("IS_PULL_REQUEST", "");
        addSystemVariableToString("BASE_BRANCH", "");
        addSystemVariableToString("REPOSITORY_BASE", containerWorkingDir);
        addSystemVariableToString("BRANCH", process.env.BUILD_SOURCEBRANCHNAME || process.env.BUILD_SOURCEBRANCH || "");
        addSystemVariableToString("DEPLOYMENT_ACTION", "upload");
        const denylistString = yield fs.promises.readFile(path.join(__dirname, 'envVarDenylist.json'), 'utf8');
        const denylist = JSON.parse(denylistString);
        Object.keys(process.env).forEach((envVarKey) => {
            const envVarValue = process.env[envVarKey];
            if (envVarValue.includes("\n")) {
                tl.warning("Environment variable " + envVarKey + " is a multiline string and cannot be added to the build environment.");
                return;
            }
            if (systemVariableNames.has(envVarKey)) {
                tl.warning("custom variable overlapping with reserved SWA variable: " + envVarKey);
                return;
            }
            if (!denylist.includes(envVarKey.toUpperCase())) {
                addVariableToString(envVarKey, envVarValue);
            }
        });
        yield fs.promises.writeFile(envVarFilePath, variableString);
    });
}
function getNullableBooleanFromString(boolString) {
    if (boolString == null)
        return null;
    boolString = boolString.toLowerCase();
    if (boolString === "true") {
        return true;
    }
    if (boolString === "false") {
        return false;
    }
    return null;
}
run();
