import datetime
from django.http import HttpResponse
from django.shortcuts import render
import json
import os
import tarfile
import threading
from io import BytesIO


def index(request):
    return HttpResponse(
        render(request, os.path.abspath("upload_prototype/templates/index.html"), {})
    )


def upload(request):
    assert request.method == "POST", "This endpoint only accepts POST requests."
    try:
        assert "email" in request.POST.keys(), "Missing email field"
        assert "lab" in request.POST.keys(), "Missing lab field"
        assert "project" in request.POST.keys(), "Missing project field"
        assert "instrument" in request.POST.keys(), "Missing instrument field"
        assert "image" in request.FILES.keys()
    except Exception as e:
        print(e)
        print(f"request had the following content: {request}")
        return render(
            request,
            os.path.abspath("upload_prototype/templates/upload.html"),
            {"status": "Failed on upload"},
        )
    email = request.POST["email"]
    lab = request.POST["lab"]
    project = request.POST["project"]
    instrument = request.POST["instrument"]

    try:
        with tarfile.open(
            name=(
                f"{os.getpid()}-{threading.get_ident()}-"
                f"{datetime.datetime.now().strftime('%Y-%m-%d-%H-%M-%S-%f')}.tar.xz"
            ),
            mode="x:xz",
        ) as tar_obj:
            upload_file_info = tarfile.TarInfo(name=request.FILES["image"].name)
            upload_file_info.size = request.FILES["image"].size
            tar_obj.addfile(tarinfo=upload_file_info, fileobj=request.FILES["image"])
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

        # tar_obj.close()
    except Exception as e:
        print(f"failed to save input with error {e}")
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
