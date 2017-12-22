#!/usr/bin/env node
"use strict";

String.prototype.replaceAll = function (exp, newStr) {
    return this.replace(new RegExp(exp, "gm"), newStr);
};

String.prototype.format = function (args) {
    var result = this;
    if (arguments.length < 1) {
        return result;
    }

    var data = arguments; // 如果模板参数是数组
    if (arguments.length == 1 && typeof (args) == "object") {
        // 如果模板参数是对象
        data = args;
    }
    for (var key in data) {
        var value = data[key];
        if (undefined != value) {
            result = result.replaceAll("\\{" + key + "\\}", value);
        }
    }
    return result;
}

//common modules
var projectModules = [
    'common-data-starter-jdbc',
    'common-data-starter-cache',
    'common-data-starter-kafka',
    'common-data-starter-kylin-jdbc',
    'common-data-starter-utils'
]

var chalk = require("chalk");
var fs = require("fs-extra");
var path = require("path");
var clone = require("git-clone");
var readlineSync = require('readline-sync');
var replace = require("replace");
var templateUrl = "https://github.com/lichaojacobs/spring-boot-scaffold.git";
var defaultDockerMaintainer = "growth_platform@mobvoi.com";

console.log('Start generating springboot template...');

var projectName = readlineSync.question('Enter projectName: ');
console.log(chalk.green(projectName));
var groupId = readlineSync.question('Enter groupId: ');
console.log(chalk.green(groupId));
var artifactId = readlineSync.question('Enter artifactId: ');
console.log(chalk.green(artifactId));
var dockerMaintainer = readlineSync.question('Enter dockerMaintainer(default is: {0}):'.format([chalk.green(defaultDockerMaintainer)]), {defaultInput: defaultDockerMaintainer});

var config = require("./settings")
var chooseCondition = true;
var selectedModules = [];
var nonSelectedModules = projectModules;
while (chooseCondition) {
    if (projectModules.length == 0) {
        break;
    }
    var index = readlineSync.keyInSelect(projectModules, 'Please select module you want to add to project. ');
    // -1 represent cancel
    if (index == -1) {
        chooseCondition = false
        continue;
    }
    fillModuleSettings(projectModules[index])
    console.log(chalk.green(projectModules[index] + ' is added.'));
    //remove selected  module
    selectedModules.push(projectModules[index])
    projectModules.splice(index, 1); //0 represent nothing will be deleted
}

console.log(chalk.green(selectedModules.length + " of modules have been selected "));
initializeProject(projectName, groupId, artifactId, dockerMaintainer, selectedModules, nonSelectedModules);


function initializeProject(projectName, groupId, artifactId, dockerMaintainer, selectedModules, nonSelectedModules) {
    var root = path.resolve(projectName);
    var appName = path.basename(root);
    checkDuplicateProject(appName);
    // 判断文件夹是否可以覆盖
    fs.ensureDirSync(projectName);
    process.chdir(root);
    console.log(chalk.green("Initialize {0} ...".format([projectName])));

    clone(templateUrl, ".tmp", {checkout: 'master'}, function () {
        fs.copySync("./.tmp/generate-template", "./");
        fs.removeSync(".tmp");

        console.log(chalk.green("Add modules..."));
        for (var i = 0; i < selectedModules.length; i++) {
            //yaml 配置文件
            var settingList = config.dependencies[selectedModules[i]]["settings"]
            //某些组件不需要配置yaml
            if (settingList.length != 0) {
                replaceVariables("#{0}-settings".format([selectedModules[i]]), config.dependencies[selectedModules[i]]["settings"].join("\r\n"))
            }
            //pom 配置文件
            replaceVariables("#{0}".format(selectedModules[i]), config.dependencies[selectedModules[i]]["dependency"].join("\r\n\t\t"))
        }

        for (var i = 0; i < nonSelectedModules.length; i++) {
            replaceVariables("#{0}-settings".format(nonSelectedModules[i]), "")
            replaceVariables("#{0}".format(nonSelectedModules[i]), "")
        }

        console.log(chalk.green("Replace groupId..."));
        replaceVariables("#groupId", groupId)

        console.log(chalk.green("Replace projectName..."));
        replaceVariables("#projectName", projectName)

        console.log(chalk.green("Replace artifactId..."));
        replaceVariables("#artifactId", artifactId)

        // in case projectName like "demo-api"
        var packageName = groupId + "." + projectName.split("-")[0]
        console.log(chalk.green("Replace packageName..."));
        replaceVariables("#packageName", packageName)

        console.log(chalk.green("Replace dockerMaintainer..."));
        replaceVariables("#dockerMaintainer", dockerMaintainer)

        var sourceSets = [
            "./src/main/java",
            "./src/test/java"
        ];

        sourceSets.forEach(function (sourceSet) {
            // 保证源文件存在
            fs.ensureDirSync(sourceSet + "/template");
            var target = packageName.replace("\.", "/");
            // 重命名根文件目录名
            fs.moveSync(sourceSet + "/template", sourceSet + "/" + target);
            // 移除源目录
            fs.removeSync(sourceSet + "/template");
        });

        console.log(chalk.green("project initialization done... \n"));

    })
}

function replaceVariables(regx, replacement) {
    replace({
        regex: regx,
        replacement: replacement,
        paths: ["."],
        recursive: true,
        silent: true
    });
}

function checkDuplicateProject(appName) {
    var dependencies = ["react", "react-dom"];
    var devDependencies = ["chalk"];
    var allDependencies = dependencies.concat(devDependencies).sort();

    if (allDependencies.indexOf(appName) >= 0) {
        console.error("duplicate project: " + appName);
        process.exit(1);
    }
}

function fillModuleSettings(selectedModule) {
    if (selectedModule == "common-data-starter-jdbc") {
        var defaultDataSourceName = config.defaultSettings[selectedModule]['dataSourceName']
        var defaultUserName = config.defaultSettings[selectedModule]['userName']
        var defaultPassword = config.defaultSettings[selectedModule]['password']
        var defaultMasterUrl = config.defaultSettings[selectedModule]['masterUrl']

        var dataSourceName = readlineSync.question('Enter dataSourceName: (default is: {0})'.format([chalk.green(defaultDataSourceName)]), {defaultInput: defaultDataSourceName});
        var userName = readlineSync.question('Enter userName: (default is: {0})'.format([chalk.green(defaultUserName)]), {defaultInput: defaultUserName});
        var password = readlineSync.question('Enter password: (default is: {0})'.format([chalk.green(defaultPassword)]), {defaultInput: defaultPassword});
        var masterUrl = readlineSync.question('Enter masterUrl: (default is: {0})'.format([chalk.green(defaultMasterUrl)]), {defaultInput: defaultMasterUrl});

        config.dependencies[selectedModule]['settings'][1] = config.dependencies[selectedModule]['settings'][1].format([dataSourceName])
        config.dependencies[selectedModule]['settings'][2] = config.dependencies[selectedModule]['settings'][2].format([userName])
        config.dependencies[selectedModule]['settings'][3] = config.dependencies[selectedModule]['settings'][3].format([password])
        config.dependencies[selectedModule]['settings'][5] = config.dependencies[selectedModule]['settings'][5].format([masterUrl])
    }

    if (selectedModule == "common-data-starter-cache") {
        var defaultName = config.defaultSettings[selectedModule]['name']
        var defaultConnection = config.defaultSettings[selectedModule]['connection']
        var defaultPassword = config.defaultSettings[selectedModule]['password']

        var userName = readlineSync.question('Enter resouceName: (default is: {0})'.format([chalk.green(defaultName)]), {defaultInput: defaultName});
        var connection = readlineSync.question('Enter redis connection: (default is: {0})'.format([chalk.green(defaultConnection)]), {defaultInput: defaultConnection});
        var password = readlineSync.question('Enter redis password: (default is: {0})'.format([chalk.green(defaultPassword)]), {defaultInput: defaultPassword});

        config.dependencies[selectedModule]['settings'][1] = config.dependencies[selectedModule]['settings'][1].format([userName])
        config.dependencies[selectedModule]['settings'][2] = config.dependencies[selectedModule]['settings'][2].format([connection])
        config.dependencies[selectedModule]['settings'][3] = config.dependencies[selectedModule]['settings'][3].format([password])
    }

    if (selectedModule == "common-data-starter-kafka") {
        var defaultServers = config.defaultSettings[selectedModule]['servers']
        var defaultGroupID = config.defaultSettings[selectedModule]['groupID']
        var defaultMaxPollRecords = config.defaultSettings[selectedModule]['maxPollRecords']

        var servers = readlineSync.question('Enter kafka servers: (default is: {0})'.format([chalk.green(defaultServers)]), {defaultInput: defaultServers});
        var groupID = readlineSync.question('Enter consumer groupId: (default is: {0})'.format([chalk.green(defaultGroupID)]), {defaultInput: defaultGroupID});
        var maxPollRecords = readlineSync.question('Enter maxPollRecords: (default is: {0})'.format([chalk.green(defaultMaxPollRecords)]), {defaultInput: defaultMaxPollRecords});

        config.dependencies[selectedModule]['settings'][1] = config.dependencies[selectedModule]['settings'][1].format([servers])
        config.dependencies[selectedModule]['settings'][2] = config.dependencies[selectedModule]['settings'][2].format([groupID])
        config.dependencies[selectedModule]['settings'][3] = config.dependencies[selectedModule]['settings'][3].format([maxPollRecords])
    }

    if (selectedModule == "common-data-starter-kylin-jdbc") {
        var defaultProjectName = config.defaultSettings[selectedModule]['ProjectName']
        var defaultUserName = config.defaultSettings[selectedModule]['userName']
        var defaultPassword = config.defaultSettings[selectedModule]['password']
        var defaultConnectionUrl = config.defaultSettings[selectedModule]['connectionUrl']

        var projectName = readlineSync.question('Enter defaultProjectName: (default is: {0})'.format([chalk.green(defaultProjectName)]), {defaultInput: defaultProjectName});
        var userName = readlineSync.question('Enter userName: (default is: {0})'.format([chalk.green(defaultUserName)]), {defaultInput: defaultUserName});
        var password = readlineSync.question('Enter password: (default is: {0})'.format([chalk.green(defaultPassword)]), {defaultInput: defaultPassword});
        var connectionUrl = readlineSync.question('Enter connectionUrl: (default is: {0})'.format([chalk.green(defaultConnectionUrl)]), {defaultInput: defaultConnectionUrl});

        config.dependencies[selectedModule]['settings'][1] = config.dependencies[selectedModule]['settings'][1].format([projectName])
        config.dependencies[selectedModule]['settings'][2] = config.dependencies[selectedModule]['settings'][2].format([userName])
        config.dependencies[selectedModule]['settings'][3] = config.dependencies[selectedModule]['settings'][3].format([password])
        config.dependencies[selectedModule]['settings'][5] = config.dependencies[selectedModule]['settings'][5].format([connectionUrl])
    }
}
