#!/usr/bin/env node

/******************************************************************************
This file is specifically tailored to interface with the 
'html/index.html.template' file in this project, connecting its various
elements to tus uploads.

This file is designed as a node.js module, and uses npm and browserify to
add external javascript modules required for this file to work as a compilation
step.  The end result of this while process is a single static file with no
file or code dependencies.

The expected entry function is 'verifyAndUpload()', which is designed to ensure
valid input, and kicks of the workinf function, `tus_wrapper()`.  This is a
recursive function in order to correctly and easily handle the otherwise
asynchronous behavior of tus uploads in order to provide simple and stable
interface updates.  `tus_wrapper()` handles termination conditions, triggers
interface changes, tus options, and run state.
******************************************************************************/

var tus = require("tus-js-client");


// https://stackoverflow.com/a/9050354
// Add '.last()' to arrays.
if (!Array.prototype.last){
  Array.prototype.last = function(){
    return this[this.length - 1];
  };
};


function refresh_pending_and_completed_lists(pending_uploads, completed_uploads){
// Helper function to update UI elements about which files have been uploaded,
// and which files are have not yet been uploaded.


  string_list_pending = [];
  string_list_completed = [];

  pending_uploads.forEach(e => string_list_pending.push(e.name));
  completed_uploads.forEach(e => string_list_completed.push(e.name));

  if(string_list_pending.length > 0){
    document.getElementById("pending_files").innerHTML = "Pending: " + string_list_pending.join(", ") + "<br>";
  }else{
    document.getElementById("pending_files").innerHTML = "";
  }

  if(string_list_completed.length > 0){
    document.getElementById("uploaded_files").innerHTML = "Completed: " + string_list_completed.join(", ");
  }else{
    document.getElementById("uploaded_files").innerHTML = "";
  }
}


function tus_wrapper(
  pending_uploads,
  completed_uploads,
  email,
  lab,
  project,
  instrument
){ 
// Worker function, responsible for correctly syncronizing interface state with
// run state.  It first updates the UI to a neutral state, checks for
// terminating conditions, if termination is needed update the UI and exit else
// initialize tus options, update UI, and start next tus upload.  At upload
// completion, runtime state is updated, and this function called again.

    document.getElementById("upload_text").innerHTML = ""; 
    document.getElementById("upload_progress").style.display = "none"; 
    refresh_pending_and_completed_lists(pending_uploads, completed_uploads); 

    if(!email || !lab || !project || !instrument || pending_uploads.length <= 0){ 
	    document.getElementById("upload_bar").style.display = "none"; 
	    return; 
    }

    var tus_options = {
        endpoint: "http://10.4.72.133:1080/files/",
        headers: {
            "Upload-Metadata": JSON.stringify(
                {
                    "JAX_EMAIL": btoa(email),
                    //"JAX_PASSWORD": btoa(password),
                    "JAX_LAB": btoa(lab),
                    "JAX_INSTRUMENT": btoa(instrument),
                    "JAX_PROJECT": btoa(project)
                }
            )
		},
		metadata: {
			filename: pending_uploads.last().name,
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
			console.log("Download %s from %s", pending_uploads.last().name, upload.url);
			completed_uploads.push(pending_uploads.pop());
			document.getElementById("upload_text").innerHTML = "";
			document.getElementById("upload_progress").style.display = "none";
                        tus_wrapper(pending_uploads, completed_uploads, email, password, lab, project, instrument);
		},
		//uploadLengthDeferred: true,
		resume: true,
		//removeFingerprintOnSuccess: true,
		uploadSize: pending_uploads.last().size,
		chunkSize: 5 * 1024 * 1024
	};

	document.getElementById("upload_bar").style.display = "block";
	document.getElementById("upload_text").innerHTML = pending_uploads.last().name;
	document.getElementById("upload_progress").style.display = "block";
	var upload = new tus.Upload(pending_uploads.last(), tus_options);

	upload.start();
}

function verifyAndUpload(){
// Entrypoint, checks input, does basic restructuring, then calls the worker
// function `tus_wrapper()`.


  console.log("in central function");
  // Get form data

  let email_val = document.getElementById("email").value;
  //let password_val = document.getElementById("password").value;
  let lab_val = document.getElementById("lab").value;
  let project_val = document.getElementById("project").value;
  let instrument_val = document.getElementById("instrument").value;
  let image_file = document.getElementById("image");

  pending_uploads = []
  completed_uploads = []

  for(var i=0; i < image_file.files.length; ++i){
    pending_uploads.push(image_file.files[i]);
  }


  tus_wrapper(
    pending_uploads,
    completed_uploads,
    email_val,
    lab_val,
    project_val,
    instrument_val
  );
}

// As a part of being a node module, some functions should be accessible
// outside of this module.  List those here.
module.exports = {verifyAndUpload: verifyAndUpload};

