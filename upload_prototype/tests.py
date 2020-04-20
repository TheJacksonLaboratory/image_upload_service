from django.test import TestCase
from django.urls import reverse


class image_and_metadata_upload_test(TestCase):
    """
    :description: Test correct/incorrect input combinations.
    """

    def basic_correct_use_case(self):
        """
        :description: Test the minimal correct use case.
        """
        resp = self.client.post(
            reverse("upload_prototype:upload"),
            {
                "email": "example@example.com",
                "lab": "example lab",
                "project": "example project",
                "instrument": "example instrumnt",
                "image": b"\0",
            },
        )

    def open_index(self):
        resp = self.client.get(reverse("upload_prototype:index"))
        self.assertEqual(resp.status_code, 200)
