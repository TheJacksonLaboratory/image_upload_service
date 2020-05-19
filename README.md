# Research IT Large Image Uploader

## About

This defines a static webservice and a tus endpoint which can be used for uploading extremely large image files which would be too large to upload stablely using plain HTTP.

Licensed under AGPLv3

## Requirements

* Linux running on x86_64
* libc
* make
* nginx
* node.js >= 5

Development and testing were done with packages from `guix`.  Depending on your host system, the available packages and configurations may vary.

## Security Warnings

This is an example implementation and is <bold>very insecure</bold>.  In a full deployment, modify the nginx configuration to reverse proxy tusd, and setup HTTPS.

## Build

<h3>NOTE: update the upload server address in the tus options struct in the javascript file.</h3>

If this is the first setup and run of the server, run `npm install` to install the javascript dependencies browserify and tus-js-client.

`make`

## Running

The example invocation in `make run` can be used to start the service.  It is advised to not use this as given, as your setup will likely vary.


