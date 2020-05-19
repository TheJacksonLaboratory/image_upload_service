# Research IT Large Image Uploader

## About

This defines a static webservice and a tus endpoint which can be used for uploading extremely large image files which would be too large to upload stablely using plain HTTP.

Licensed under AGPLv3

## Requirements

* libc
* make
* nginx

## Build

<h3>NOTE: update the upload server address in the tus options struct in the javascript file.</h3>

`make`

## Running

`make run`


