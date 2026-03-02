from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from utils.aws import get_s3
import uuid

router = APIRouter()

@router.post("/upload-photos")
async def upload_photos(
    event_id: str = Form(...),
    photos: list[UploadFile] = File(...)
):
    s3 = get_s3()
    uploaded = []

    for photo in photos:
        image_bytes = await photo.read()
        key = f"events/{event_id}/{uuid.uuid4()}.jpg"

        s3.put_object(
            Bucket="wedding-snap-photos",
            Key=key,
            Body=image_bytes,
            ContentType="image/jpeg"
        )
        uploaded.append(key)

    return {
        "message": f"{len(uploaded)} photos uploaded!",
        "event_id": event_id,
        "photos": uploaded
    }