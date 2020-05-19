#!/usr/bin/env node

var tus = require("tus-js-client");

//const mutex = new Mutex();

// https://stackoverflow.com/a/9050354
if (!Array.prototype.last){
  Array.prototype.last = function(){
    return this[this.length - 1];
  };
};


function refresh_pending_and_completed_lists(pending_uploads, completed_uploads){

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


function tus_wrapper(pending_uploads, completed_uploads, email, lab, project, instrument){ 

    document.getElementById("upload_text").innerHTML = ""; 
    document.getElementById("upload_progress").style.display = "none"; 
    refresh_pending_and_completed_lists(pending_uploads, completed_uploads); 

    if(!email || !lab || !project || !instrument || pending_uploads.length <= 0){ 
	    document.getElementById("upload_bar").style.display = "none"; 
	    return; 
    }

    var tus_options = {
	    endpoint: "http://ctlin0030:1080/files/",
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

module.exports = {tus_wrapper: tus_wrapper, verifyAndUpload: verifyAndUpload};

