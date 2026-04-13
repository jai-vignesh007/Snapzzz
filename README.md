# 📸 SnapFind — Find Yourself in Any Event Photo, Instantly

> AI-powered platform that uses facial recognition to instantly match and deliver event photos to attendees via email — no more waiting or manual searching.

---

## 🚀 The Problem

At large events — weddings, concerts, college fests, corporate events — photographers capture thousands of photos. Attendees wait **weeks or months** to get their photos, and still have to manually search through hundreds of images to find themselves.

## 💡 The Solution

SnapFind uses **AI facial recognition** to automatically identify attendees in event photos and deliver only their photos directly to their inbox — instantly and automatically.

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React + Vite + Tailwind CSS |
| Backend | FastAPI (Python) |
| Face Recognition | AWS Rekognition |
| Photo Storage | AWS S3 |
| Database | AWS DynamoDB |
| Email Delivery | AWS SES |

---

## 🔄 How It Works

```
Guest registers with selfie + email
            ↓
AWS Rekognition indexes their face
            ↓
Photographer uploads event photos
            ↓
AI scans every photo for matching faces
            ↓
Matched guests get emailed their photos instantly 📧
```

---

## ✨ Features

- 📸 **Face Registration** — Webcam capture or photo upload
- 🤖 **AI Matching** — AWS Rekognition with 80%+ confidence threshold
- 📧 **Instant Email** — HTML email with photo previews and download buttons
- 🔒 **Secure Storage** — Private S3 with time-limited presigned URLs (7 days)
- 🌙 **Modern UI** — Dark neon theme, mobile friendly

---

## 📁 Project Structure

```
snapfind/
├── backend/
│   ├── main.py              # FastAPI app entry point
│   ├── .env                 # AWS credentials
│   ├── routes/
│   │   ├── register.py      # Guest face registration
│   │   ├── upload.py        # Photographer photo upload
│   │   └── match.py         # Face matching + email delivery
│   └── utils/
│       └── aws.py           # AWS service connections
└── frontend/
    └── src/
        ├── App.jsx           # Main app + navigation
        └── pages/
            ├── Register.jsx      # Guest registration page
            ├── MyPhotos.jsx      # View matched photos
            └── Photographer.jsx  # Photographer portal
```

---

## ⚙️ Setup & Installation

### Prerequisites
- Python 3.10+
- Node.js 18+
- AWS Account with CLI configured

### Backend

```bash
cd backend
python -m venv venv
source venv/Scripts/activate
pip install fastapi uvicorn boto3 python-multipart pillow python-dotenv
```

Create `.env` file:
```env
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_REGION=us-east-1
S3_BUCKET=snapfind-photos
REKOGNITION_COLLECTION=snapfind-guests
DYNAMODB_TABLE=snapfind-guests
```

Run the server:
```bash
uvicorn main:app --reload
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

---

## 🌐 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/register` | Register guest face + email |
| POST | `/api/upload-photos` | Photographer uploads photos |
| POST | `/api/match-photos` | Run AI face matching + send emails |
| GET | `/api/my-photos/{email}` | Get matched photos for a guest |

---

## ☁️ AWS Services Setup

```bash
# Create Rekognition Collection
aws rekognition create-collection --collection-id snapfind-guests

# Create S3 Bucket
aws s3api create-bucket --bucket snapfind-photos --region us-east-1

# Create DynamoDB Table
aws dynamodb create-table \
  --table-name snapfind-guests \
  --attribute-definitions AttributeName=email,AttributeType=S \
  --key-schema AttributeName=email,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST

# Verify sender email for SES
aws ses verify-email-identity --email-address your@email.com
```

---

## 🎯 Use Cases

- 💍 Weddings
- 🎓 College Fests & Graduations
- 🏃 Sports Events & Marathons
- 🎤 Concerts & Music Festivals
- 🏢 Corporate Events & Conferences

---

## 🔮 Future Scope

- 📱 Mobile app for attendees
- 🎥 Real-time live capture during events
- 🖨️ Print on demand integration
- 🌐 Multi-event dashboard for photographers
- 🔐 Attendee privacy controls

---


