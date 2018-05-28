#!/usr/bin/env node

var path = require('path')
var fs = require('fs')
var os = require('os')
var program = require('commander')
var ini = require('git-config-ini')
var echo = require('node-echo')
var extend = require('extend')

var proxies = require('./proxies.json')
var PKG = require('./package.json')
var GPHMRC = path.join(os.homedir(), '.gphmrc')
var GITCONFIG = path.join('.git', 'config')

program
  .version(PKG.version)

program
  .command('ls')
  .description('List all the proxies')
  .action(onLs)

program
  .command('use <proxy>')
  .description('Change proxy to proxy')
  .action(onUse)

program
  .command('add <proxy> <url>')
  .description('Add one custom proxy')
  .action(onAdd)

program
  .command('del <proxy>')
  .description('Delete one custom proxy')
  .action(onDel)

program
  .command('help')
  .description('Print this help')
  .action(function () {
    program.outputHelp()
  })

program
  .parse(process.argv)

if (process.argv.length === 2) {
  program.outputHelp()
}

/* //////////////// cmd methods ///////////////// */

function onLs () {
  getCurrentProxy(function (cur) {
    var info = ['']
    var allProxies = getAllProxy()

    Object.keys(allProxies).forEach(function (key) {
      var item = allProxies[key]
      var prefix = item.proxy === cur ? '* ' : '  '
      var value = item.proxy || '****'
      info.push(prefix + key + line(key, 10) + value)
    })

    info.push('')
    printMsg(info)
  })
}

function onUse (name) {
  var allProxies = getAllProxy()
  if (allProxies.hasOwnProperty(name)) {
    var proxy = allProxies[name].proxy

    setCurrentProxy(proxy, function (err, data) {
      if (err) return exit(err)
      if (proxy) {
        printMsg(['', '   Proxy has been set to: ' + proxy, ''])
      } else {
        printMsg(['', '   Proxy has been cleaned', ''])
      }
    })
  } else {
    printMsg([
      '', '   Not find proxy: ' + name, ''
    ])
  }
}

function onDel (name) {
  var customProxies = getCustomProxy()
  if (!customProxies.hasOwnProperty(name)) return
  getCurrentProxy(function (cur) {
    if (cur === customProxies[name].proxy) {
      onUse('npm')
    }
    delete customProxies[name]
    setCustomProxy(customProxies, function (err) {
      if (err) return exit(err)
      printMsg([
        '', '   Delete proxy ' + name + ' success', ''
      ])
    })
  })
}

function onAdd (name, url, home) {
  var customProxies = getCustomProxy()
  if (customProxies.hasOwnProperty(name)) {
    return
  }

  var config = customProxies[name] = {}
  config.proxy = url

  setCustomProxy(customProxies, function (err) {
    if (err) return exit(err)
    printMsg([
      '', '   Add proxy ' + name + ' success', ''
    ])
  })
}

/* //////////////// helper methods ///////////////// */

function getCurrentProxy (cb) {
  var config = fs.existsSync(GITCONFIG) ? ini.parse(fs.readFileSync(GITCONFIG, 'utf-8')) : {}
  var proxy = config.http ? config.http.proxy : ''
  cb(proxy)
}

function setCurrentProxy (proxy, cb) {
  var config = fs.existsSync(GITCONFIG) ? ini.parse(fs.readFileSync(GITCONFIG, 'utf-8')) : {}
  if (proxy) {
    config.http = config.http || {}
    config.http.proxy = proxy
  } else if (config.http) {
    delete config.http.proxy
  }

  echo(ini.stringify(config, {whitespace: true}), '>', GITCONFIG, cb)
}

function getCustomProxy () {
  return fs.existsSync(GPHMRC) ? ini.parse(fs.readFileSync(GPHMRC, 'utf-8')) : {}
}

function setCustomProxy (config, cbk) {
  echo(ini.stringify(config), '>', GPHMRC, cbk)
}

function getAllProxy () {
  return extend({}, proxies, getCustomProxy())
}

function printErr (err) {
  console.error('an error occured: ' + err)
}

function printMsg (infos) {
  infos.forEach(function (info) {
    console.log(info)
  })
}

/*
 * print message & exit
 */
function exit (err) {
  printErr(err)
  process.exit(1)
}

function line (str, len) {
  var line = new Array(Math.max(1, len - str.length)).join('-')
  return ' ' + line + ' '
}
