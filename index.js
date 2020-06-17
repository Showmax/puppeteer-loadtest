#! /usr/bin/env node
'use strict';

const createDebug = require('debug');
const debug = createDebug('puppeteer-loadtest');
const exec = require('child_process').exec;
const argv = require('minimist')(process.argv.slice(2));
const perf = require('execution-time')();

const file = argv.file;
const concurrencyRequested = argv.c || 1;
const totalScenarios = argv.n || 10;
const silent = argv.silent || false;

if (!file) {
  return console.error('cannot find --file option');
}

if (!silent) {
  createDebug.enable('puppeteer-loadtest');
}


if (!concurrencyRequested) {
  debug('no concurrency is specified, using 1 as default')
}

if (!totalScenarios) {
  debug('no total scenarios cound is specified, using 10 as default')
}

debug('puppeteer-loadtest is loading...');

const cmdToExecute = `node ${file}`;
let totalScenariosStarted = 0;

const executeTheCommand = function() {
  totalScenariosStarted += 1;
  console.log(`Scenarios started: ${totalScenariosStarted}`);
  return new Promise((resolve, reject) => {
    exec(cmdToExecute, function(error, stdout, stderr) {
      if(stderr) reject(stderr);
      if(error) reject(error);
      console.log(stdout);
      resolve();
    });
  })
    .then(function () {
      if (totalScenariosStarted < totalScenarios){
        return executeTheCommand();
      }
  })
};

let promiseList = [];
for(let i=0; i<concurrencyRequested; i += 1) {
  promiseList.push(executeTheCommand(cmdToExecute));
}
