# ระบบเสนอและวิเคราะห์ความต้องการรายวิชาเสรีของนักศึกษา

ระบบสำหรับให้นักศึกษาเสนอรายวิชาเสรีที่สนใจ และวิเคราะห์ความต้องการรายวิชาด้วยเทคนิค
Natural Language Processing (NLP), TF-IDF และ K-Nearest Neighbors (KNN)

ระบบแบ่งการใช้งานออกเป็น 2 ส่วนหลัก ได้แก่

- Student: เสนอรายวิชาเสรีและดูข้อมูลข้อเสนอของตนเอง
- Teacher: วิเคราะห์ข้อมูลความต้องการรายวิชาเสรีจากข้อเสนอของนักศึกษา


## Features

### Student

- Login ด้วย Google Account
- ผูก Google Account กับรหัสนักศึกษา
- รหัสนักศึกษาถูกผูกกับบัญชีหลังจากตั้งค่าครั้งแรก
- เสนอรายวิชาเสรี
- ระบุชื่อรายวิชาและเหตุผล/ความสนใจ
- ระบบวิเคราะห์หมวดหมู่รายวิชาอัตโนมัติ
- ดูประวัติข้อเสนอของตนเอง

### Teacher

- Dashboard สำหรับดูข้อมูลการเสนอรายวิชา
- วิเคราะห์ความต้องการรายวิชาเสรี
- ดูจำนวนข้อเสนอ
- ดูหมวดหมู่รายวิชาที่นักศึกษาสนใจ
- ดูข้อมูลข้อเสนอจากนักศึกษา


## Technology Stack

### Frontend

- Next.js
- React
- TypeScript
- Tailwind CSS

### Backend

- Python
- FastAPI
- SQLAlchemy
- SQLite

### Machine Learning / NLP

- PyThaiNLP
- Scikit-learn
- TF-IDF
- K-Nearest Neighbors (KNN)
- Joblib

### Authentication

- Google Identity Services
- Google OAuth / Google ID Token


## Project Structure

```text
free-elective-system/
│
├── frontend/
│   ├── app/
│   │   ├── student/
│   │   ├── teacher/
│   │   └── ...
│   ├── components/
│   ├── public/
│   ├── package.json
│   └── ...
│
├── backend/
│   ├── app/
│   │   ├── api/
│   │   ├── database/
│   │   ├── ml/
│   │   └── ...
│   ├── requirements.txt
│   └── ...
│
├── .gitignore
└── README.md
