# 🏥 PredictCare — Early Disease Detection & Management System

A full-stack AI application that predicts early-stage diseases using machine learning. 
Built as my Final Year Project (BS Computer Science).

🔗 **Live Demo:** [predictcare-app.vercel.app](https://predictcare-app.vercel.app)  
📡 **Backend API:** [Deployed on Render](https://predictcare-backend.onrender.com)

---

## What it does

Users enter their symptoms and health data into the mobile app. 
The app sends this to a machine learning model which predicts whether 
the user is at risk for specific diseases — returning results in real time.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| ML Model | Python · scikit-learn · Gradient Boosting |
| Data Analysis | pandas · NumPy · Google Colab |
| Backend API | FastAPI (Python) |
| Frontend | React Native · TypeScript · Expo |
| Database | MySQL |
| Deployment | Render (backend) · Vercel (frontend) |

---

## ML Model Details

- **Dataset:** 10 years of historical health/disease data (synthetic, representing real-world patterns)
- **Best performing model:** Gradient Boosting Classifier
- **Training accuracy:** 98% on training set
- **Note:** Model was trained on synthetic data due to real-world data availability constraints. 
  Production use would require validation on real patient data and clinical review.

---

---

## How to run locally

**Backend:**
```bash
cd "backend predictcare"
pip install -r requirements.txt
uvicorn main:app --reload
```

**Frontend:**
```bash
npm install
npx expo start
```

---

## What I learned

- Building and evaluating multiple ML models (Random Forest, Gradient Boosting)
- Deploying Python ML models as production REST APIs with FastAPI
- Connecting a mobile frontend to a live ML backend
- Working with synthetic datasets and understanding their limitations
