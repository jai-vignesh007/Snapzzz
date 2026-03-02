from fastapi import APIRouter, HTTPException, UploadFile, File, Form
from utils.aws import get_s3, get_rekognition, get_dynamodb, get_ses

router = APIRouter()

def id_to_email(external_id: str) -> str:
    return external_id.replace("_at_", "@").replace("_dot_", ".")

@router.post("/match-photos")
async def match_photos(event_id: str):
    s3 = get_s3()
    rek = get_rekognition()
    db = get_dynamodb()
    table = db.Table("wedding-snap-guests")

    response = s3.list_objects_v2(
        Bucket="wedding-snap-photos",
        Prefix=f"events/{event_id}/"
    )

    if "Contents" not in response:
        raise HTTPException(status_code=404, detail="No photos found for this event!")

    photo_keys = [obj["Key"] for obj in response["Contents"]]
    matches = {}

    for key in photo_keys:
        s3_obj = s3.get_object(Bucket="wedding-snap-photos", Key=key)
        image_bytes = s3_obj["Body"].read()

        try:
            rek_response = rek.search_faces_by_image(
                CollectionId="wedding-snap-guests",
                Image={"Bytes": image_bytes},
                MaxFaces=10,
                FaceMatchThreshold=80
            )
        except Exception:
            continue

        for match in rek_response["FaceMatches"]:
            external_id = match["Face"]["ExternalImageId"]
            email = id_to_email(external_id)
            if email not in matches:
                matches[email] = []
            matches[email].append(key)

    ses = get_ses()
    for email, photos in matches.items():
        table.update_item(
            Key={"email": email},
            UpdateExpression="SET photos = list_append(if_not_exists(photos, :empty), :photos)",
            ExpressionAttributeValues={
                ":photos": photos,
                ":empty": []
            }
        )

        urls = []
        for key in photos:
            url = s3.generate_presigned_url(
                "get_object",
                Params={"Bucket": "wedding-snap-photos", "Key": key},
                ExpiresIn=604800
            )
            urls.append(url)

        photo_buttons = "".join([
            f'''
            <div style="margin-bottom:16px; text-align:center;">
                <img src="{url}" alt="Photo {i+1}" style="width:100%; max-width:400px; border-radius:12px; margin-bottom:8px;" />
                <br/>
                <a href="{url}" download style="background:#e91e8c; color:white; padding:10px 24px; border-radius:8px; text-decoration:none; font-weight:bold;">
                    ⬇️ Download Photo {i+1}
                </a>
            </div>
            '''
            for i, url in enumerate(urls)
        ])

        html_body = f"""
        <html>
        <body style="font-family:Arial,sans-serif; background:#fff8f8; padding:32px;">
            <div style="max-width:600px; margin:auto; background:white; border-radius:16px; padding:32px; box-shadow:0 4px 12px rgba(0,0,0,0.1);">
                <h1 style="color:#e91e8c; text-align:center;">💍 Your Wedding Photos are Ready!</h1>
                <p style="color:#555; text-align:center;">We found <b>{len(photos)} photo(s)</b> of you from event: <b>{event_id}</b></p>
                <hr style="margin:24px 0; border:none; border-top:1px solid #f0f0f0;" />
                {photo_buttons}
                <p style="color:#aaa; text-align:center; font-size:12px; margin-top:24px;">Links are valid for 7 days. With love, WeddingSnap 💍</p>
            </div>
        </body>
        </html>
        """

        try:
            ses.send_email(
                Source="jaivicky2002@gmail.com",
                Destination={"ToAddresses": [email]},
                Message={
                    "Subject": {"Data": "💍 Your Wedding Photos are Ready!"},
                    "Body": {"Html": {"Data": html_body}}
                }
            )
        except Exception as e:
            print(f"Email failed for {email}: {str(e)}")

    return {
        "message": "Matching complete! Emails sent to guests!",
        "matches": matches
    }


@router.get("/my-photos/{email}")
async def get_my_photos(email: str):
    db = get_dynamodb()
    table = db.Table("wedding-snap-guests")

    response = table.get_item(Key={"email": email})

    if "Item" not in response:
        raise HTTPException(status_code=404, detail="Guest not found!")

    guest = response["Item"]
    photos = guest.get("photos", [])

    s3 = get_s3()
    urls = []
    for key in photos:
        url = s3.generate_presigned_url(
            "get_object",
            Params={"Bucket": "wedding-snap-photos", "Key": key},
            ExpiresIn=3600
        )
        urls.append(url)

    return {
        "name": guest["name"],
        "email": email,
        "photos": urls
    }

@router.post("/live-capture")
async def live_capture(
    event_id: str = Form(...),
    frame: UploadFile = File(...)
):
    s3 = get_s3()
    rek = get_rekognition()
    db = get_dynamodb()
    ses = get_ses()
    table = db.Table("wedding-snap-guests")

    # 1. Read frame bytes
    image_bytes = await frame.read()

    # 2. Save frame to S3
    import uuid
    key = f"events/{event_id}/live_{uuid.uuid4()}.jpg"
    s3.put_object(
        Bucket="wedding-snap-photos",
        Key=key,
        Body=image_bytes,
        ContentType="image/jpeg"
    )

    # 3. Search faces in this frame
    try:
        rek_response = rek.search_faces_by_image(
            CollectionId="wedding-snap-guests",
            Image={"Bytes": image_bytes},
            MaxFaces=10,
            FaceMatchThreshold=80
        )
    except Exception as e:
        return {"message": "No faces detected", "matched": []}

    if not rek_response["FaceMatches"]:
        return {"message": "No registered guests found in frame", "matched": []}

    # 4. For each matched guest → email them instantly
    matched_guests = []
    for match in rek_response["FaceMatches"]:
        external_id = match["Face"]["ExternalImageId"]
        email = id_to_email(external_id)
        confidence = round(match["Face"]["Confidence"], 2)

        # Generate presigned URL
        url = s3.generate_presigned_url(
            "get_object",
            Params={"Bucket": "wedding-snap-photos", "Key": key},
            ExpiresIn=604800
        )

        # Update DynamoDB
        table.update_item(
            Key={"email": email},
            UpdateExpression="SET photos = list_append(if_not_exists(photos, :empty), :photos)",
            ExpressionAttributeValues={
                ":photos": [key],
                ":empty": []
            }
        )

        # Send instant email
        html_body = f"""
        <html>
        <body style="font-family:Arial,sans-serif; background:#0a0a0a; padding:32px;">
            <div style="max-width:600px; margin:auto; background:#111; border:1px solid #333; border-radius:16px; padding:32px;">
                <h1 style="color:#00e5ff; text-align:center;">📸 You were just captured!</h1>
                <p style="color:#aaa; text-align:center;">A new photo of you was just taken at <b style="color:white">{event_id}</b></p>
                <div style="text-align:center; margin:24px 0;">
                    <img src="{url}" style="width:100%; max-width:400px; border-radius:12px; border:2px solid #00e5ff;" />
                    <br/><br/>
                    <a href="{url}" download style="background:#00e5ff; color:black; padding:12px 28px; border-radius:8px; text-decoration:none; font-weight:bold;">
                        ⬇️ Download Your Photo
                    </a>
                </div>
                <p style="color:#555; text-align:center; font-size:12px;">With love, WeddingSnap 💍</p>
            </div>
        </body>
        </html>
        """

        try:
            ses.send_email(
                Source="jaivicky2002@gmail.com",
                Destination={"ToAddresses": [email]},
                Message={
                    "Subject": {"Data": "📸 You were just captured at the event!"},
                    "Body": {"Html": {"Data": html_body}}
                }
            )
            matched_guests.append({"email": email, "confidence": confidence})
        except Exception as e:
            print(f"Email failed: {str(e)}")

    return {
        "message": f"Found and emailed {len(matched_guests)} guests!",
        "matched": matched_guests
    }