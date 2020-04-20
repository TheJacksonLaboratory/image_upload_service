from django import forms


class upload_form(forms.Form):
    email = forms.EmailField(label="email", required=True)
    lab = forms.CharField(label="lab", required=True)
    project = forms.CharField(label="project", required=True)
    instrument = forms.CharField(label="instrument", required=True)
    image_file = forms.FileField(label="image", required=True, allow_empty_file=False)
