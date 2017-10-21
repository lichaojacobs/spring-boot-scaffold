#!/usr/bin/env node
"use strict";

//common moudles
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
var templateUrl = "https://github.com/lichaojacobs/spring-boot-scaffold.git"

console.log('Start generating springboot template...');

var projectName = readlineSync.question('Enter projectName: ');
console.log(projectName);
var groupId = readlineSync.question('Enter groupId: ');
console.log(groupId);
var artifactId = readlineSync.question('Enter artifactId: ');
console.log(artifactId);

var chooseCondition = true;

var selectedModules = [];
var nonSelectedModules = projectModules;
while (chooseCondition) {
    if (projectModules.length == 0) {
        console.log("all modules are selected");
        break;
    }
    var index = readlineSync.keyInSelect(projectModules, 'Please select module you want to add to project. ');
    // -1 represent cancel
    if (index == -1) {
        chooseCondition = false
        continue;
    }
    console.log(projectModules[index] + ' is added.');
    //remove selected  module
    selectedModules.push(projectModules[index])
    projectModules.splice(index, 1); //0 represent nothing will be deleted
}

console.log(selectedModules.length + " of modules have been selected ");
for (var i = 0; i < selectedModules.length; i++) {
    console.log(selectedModules[i]);
}
initializeProject(projectName, groupId, artifactId, selectedModules, nonSelectedModules);


function initializeProject(projectName, groupId, artifactId, selectedModules, nonSelectedModules) {
    var root = path.resolve(projectName);
    var appName = path.basename(root);
    checkDuplicateProject(appName);
    // 判断文件夹是否可以覆盖
    fs.ensureDirSync(projectName);

    // 当前目录
    var originalDirectory = process.cwd();
    process.chdir(root);
    console.log("初始化 " + chalk.green(projectName));

    clone(templateUrl, ".tmp", {checkout: 'master'}, function () {
        fs.copySync("./.tmp/generate-template", "./");
        fs.removeSync(".tmp");

        console.log("add modules...");
        var config = require("./settings")
        for (var i = 0; i < selectedModules.length; i++) {
            //yaml 配置文件
            var settingList = config.dependencies[selectedModules[i]]["settings"]
            //某些组件不需要配置yaml
            if (settingList.length != 0) {
                replaceVariables("#" + selectedModules[i] + "-settings", config.dependencies[selectedModules[i]]["settings"].join("\r\n"))
            }
            //pom 配置文件
            replaceVariables("#" + selectedModules[i], config.dependencies[selectedModules[i]]["dependency"].join("\r\n\t\t"))
        }

        for (var i = 0; i < nonSelectedModules.length; i++) {
            replaceVariables("#" + nonSelectedModules[i] + "-settings", "")
            replaceVariables("#" + nonSelectedModules[i], "")
        }

        console.log("replace groupId...");
        replaceVariables("#groupId", groupId)

        console.log("replace projectName...");
        replaceVariables("#projectName", projectName)

        console.log("replace artifactId...");
        replaceVariables("#artifactId", artifactId)

        // in case projectName like "demo-api"
        var packageName = groupId + "." + projectName.split("-")[0]
        console.log("replace packageName...");
        replaceVariables("#packageName", packageName)

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

        console.log("project initialization done... \n");

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
