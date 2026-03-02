from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from utils.aws import get_rekognition, get_dynamodb

router = APIRouter()

def email_to_id(email: str) -> str:
    return email.replace("@", "_at_").replace(".", "_dot_")

@router.post("/register")
async def register_guest(
    name: str = Form(...),
    email: str = Form(...),
    selfie: UploadFile = File(...)
):
    image_bytes = await selfie.read()

    rek = get_rekognition()
    try:
        response = rek.index_faces(
            CollectionId="wedding-snap-guests",
            Image={"Bytes": image_bytes},
            ExternalImageId=email_to_id(email),
            DetectionAttributes=["DEFAULT"]
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Rekognition error: {str(e)}")

    if not response["FaceRecords"]:
        raise HTTPException(status_code=400, detail="No face detected in the image!")

    face_id = response["FaceRecords"][0]["Face"]["FaceId"]

    db = get_dynamodb()
    table = db.Table("wedding-snap-guests")
    table.put_item(Item={
        "email": email,
        "name": name,
        "face_id": face_id,
        "photos": []
    })

    return {
        "message": f"Guest {name} registered successfully!",
        "face_id": face_id
    }