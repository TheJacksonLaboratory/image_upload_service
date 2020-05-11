#!/usr/bin/env node
// TODO: Get the javascript people and env dev, maybe even a few distros, 
// add `js` as a shell option like sh.


var tus = require("tus-js-client");

function null_case(){
	console.log("Do functions even work?")
}

null_case();

function tus_wrapper(file, filename, filesize, email, password, lab, project, instrument){ 

    var tus_options = {
        endpoint: "http://10.4.72.133:1080/files/",
        headers: {
            "Upload-Metadata": JSON.stringify(
                {
                    "JAX_EMAIL": btoa(email),
                    "JAX_PASSWORD": btoa(password),
                    "JAX_LAB": btoa(lab),
                    "JAX_INSTRUMENT": btoa(instrument),
                    "JAX_PROJECT": btoa(project)
                }
            )
		},
		metadata: {
			filename: filename,
			filetype: "application/octet-stream"
		},
		onError: function(error) {
			console.log("Failed because: " + error);
		},
		onProgress: function(bytesUploaded, bytesTotal) {
			var percentage = (bytesUploaded / bytesTotal * 100).toFixed(2);
			console.log(bytesUploaded, bytesTotal, percentage + "%");
			document.getElementById("upload_progress").style.width = percentage + "%";
			document.getElementById("upload_progress").innerHTML = bytesUploaded + "/" + bytesTotal;
		},
		onSuccess: function() {
			console.log("Download %s from %s", filename, upload.url);
		},
		//uploadLengthDeferred: true,
		resume: true,
		//removeFingerprintOnSuccess: true,
		uploadSize: filesize,
		chunkSize: 5 * 1024 * 1024
	};

	document.getElementById("upload_text").innerHTML = filename;
	var upload = new tus.Upload(file, tus_options);

	upload.start();
}

null_case();

module.exports = {null_case: null_case, tus_wrapper: tus_wrapper};
