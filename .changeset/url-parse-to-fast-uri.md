---
'@veramo/cli': patch
'@veramo/remote-server': patch
'@veramo/url-handler': patch
---

The unmaintained `url-parse` dependency was replaced with `fast-uri` when parsing `$require` paths in CLI configs, hostnames in `createDefaultDid` and `c_i` payloads in `UrlMessageHandler`.
