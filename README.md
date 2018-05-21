[![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

gphm -- git proxy(http) manager
===

`gphm` can help you easy and fast switch between different http git proxy.


## Install

```
$ npm install -g gphm
```

## Example
```
$ gphm ls

* none ----- ****
  lantern -- http://127.0.0.1:49377

```

```
$ gphm use lantern  //switch proxy to lantern

    Proxy has been set to: http://127.0.0.1:49377

```

## Usage

```
Usage: gphm [options] [command]

  Commands:

    ls                 List all the proxies
    use <proxy>        Change proxy to proxy
    add <proxy> <url>  Add one custom proxy
    del <proxy>        Delete one custom proxy
    help               Print this help

  Options:

    -V, --version      output the version number
    -h, --help         output usage information
```

## LICENSE
MIT
