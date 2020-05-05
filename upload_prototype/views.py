import datetime
from django.http import HttpResponse
from django.shortcuts import render
import html
import json
import logging
import os
import re
import tarfile
import threading
from io import BytesIO

LOGGER = logging.getLogger("rit_image_upload")


def index(request):
    raw_js = open("upload_prototype/static/tus-wrapper.js").read()
    unescaped_js = html.unescape(html.unescape(raw_js))
    assert not re.match("&gt;", unescaped_js), "wtf"
    return HttpResponse(
        render(
            request, 
            os.path.abspath("upload_prototype/templates/index.html"), 
            {
                "script": unescaped_js,
            }
        )
    )


def upload(request):
    LOGGER.debug("hit upload endpoint")
    assert request.method == "POST", "This endpoint only accepts POST requests."
    try:
#        LOGGER.debug("Ensuring required fields are present")
#        assert "email" in request.POST.keys(), "Missing email field"
#        LOGGER.debug("got email")
#        assert "lab" in request.POST.keys(), "Missing lab field"
#        LOGGER.debug("got lab")
#        assert "project" in request.POST.keys(), "Missing project field"
#        LOGGER.debug("got project")
#        assert "instrument" in request.POST.keys(), "Missing instrument field"
#        LOGGER.debug("got instrument")
#        assert "image" in request.FILES.keys()
#        LOGGER.debug("got uploaded file")
        pass
    except Exception as e:
        LOGGER.warn(e)
        LOGGER.warn(f"request had the following content: {request}")
        return render(
            request,
            os.path.abspath("upload_prototype/templates/upload.html"),
            {"status": "Failed on upload"},
        )
    LOGGER.debug("Required fields are present; extracting")
    email = request.POST["email"]
    lab = request.POST["lab"]
    project = request.POST["project"]
    instrument = request.POST["instrument"]

    try:
        LOGGER.debug("creating tarfile")
        with tarfile.open(
            name=(
                f"{os.getpid()}-{threading.get_ident()}-"
                f"{datetime.datetime.now().strftime('%Y-%m-%d-%H-%M-%S-%f')}.tar.xz"
            ),
            mode="x:xz",
        ) as tar_obj:
            LOGGER.debug(
                "tarfile about to be populated; adding size and name of large file uploaded."
            )
            upload_file_info = tarfile.TarInfo(name=request.FILES["image"].name)
            upload_file_info.size = request.FILES["image"].size
            LOGGER.debug(
                f"File to be uploaded has name '{request.FILES['image'].name}' "
                f"of size {request.FILES['image'].size} bytes.\n"
                "Starting upload/buffered write of uploaded file."
            )
            tar_obj.addfile(tarinfo=upload_file_info, fileobj=request.FILES["image"])
            LOGGER.debug("Uploaded file!  Starting write of metadata.")
            metadata_file_info = tarfile.TarInfo(name="metadata.json")
            json_buffer = json.dumps(
                {
                    "email": email,
                    "lab": lab,
                    "project": project,
                    "instrument": instrument,
                }
            ).encode()
            metadata_file_info.size = len(json_buffer)
            tar_obj.addfile(tarinfo=metadata_file_info, fileobj=BytesIO(json_buffer))
            LOGGER.debug("Wrote metadata, closing and saving tarfile.")
        # tar_obj.close()
    except Exception as e:
        LOGGER.warn(f"failed to save input with error {e}")
        return render(
            request,
            os.path.abspath("upload_prototype/templates/upload.html"),
            {"status": "failed on upload/save"},
        )

    return render(
        request,
        os.path.abspath("upload_prototype/templates/upload.html"),
        {"status": "success"},
    )
