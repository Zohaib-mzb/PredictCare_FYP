from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from contextlib import asynccontextmanager
import joblib
import pandas as pd
import uvicorn
import os
import random
from datetime import datetime, timedelta

# Global variables to hold our Dual-Engine AI
seasonal_model = None
pandemic_model = None
MODEL_PATH = "predictcare_v2.pkl" 

@asynccontextmanager
async def lifespan(app: FastAPI):
    global seasonal_model, pandemic_model
    print("🔄 FastAPI is booting up...")
    if os.path.exists(MODEL_PATH):
        try:
            production_models = joblib.load(MODEL_PATH)
            seasonal_model = production_models['seasonal_model']
            pandemic_model = production_models['pandemic_model']
            print("🚀 PredictCare Dual-Engine AI (Seasonal + Pandemic) loaded successfully!")
        except Exception as e:
            print(f"❌ Error loading model file: {e}")
    else:
        print(f"⚠️ Warning: Model file '{MODEL_PATH}' not found in this directory.")
    
    yield  
    print("🛑 FastAPI is shutting down...")

# Initialize FastAPI app
app = FastAPI(
    title="PredictCare AI Forecast API",
    description="Production API for 7-Day Disease Outbreak Forecasting (Weather-Driven)",
    version="3.1.0", # Bumped version for the new business logic!
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_credentials=True,
    allow_methods=["*"],  
    allow_headers=["*"],
)

class PredictionRequest(BaseModel):
    region: str
    disease: str

class PredictionResponse(BaseModel):
    region: str
    disease: str
    forecast_dates: list[str]
    forecast_cases: list[int]
    status: str

REGION_MAP = {
    "Sindh": {"Province": "Sindh", "City": "Karachi", "Pop": 8825},
    "Punjab": {"Province": "Punjab", "City": "Lahore", "Pop": 6318},
    "Balochistan": {"Province": "Balochistan", "City": "Quetta", "Pop": 272},
    "Pakistan (National)": {"Province": "Punjab", "City": "Lahore", "Pop": 6318} 
}

def get_current_weather(month_num):
    if month_num in [12, 1, 2]: return {"Temp": 15.0, "Rain": 20.0, "Humid": 60.0} 
    if month_num in [3, 4, 5]: return {"Temp": 28.0, "Rain": 15.0, "Humid": 50.0}  
    if month_num in [6, 7, 8]: return {"Temp": 35.0, "Rain": 120.0, "Humid": 75.0} 
    return {"Temp": 25.0, "Rain": 10.0, "Humid": 55.0} 

@app.get("/")
def home():
    return {"message": "Welcome to PredictCare AI Engine V3.1. API is live!"}

@app.post("/predict", response_model=PredictionResponse)
def predict_7_days(payload: PredictionRequest):
    global seasonal_model, pandemic_model
    if seasonal_model is None or pandemic_model is None:
        raise HTTPException(status_code=503, detail="AI Models are not fully loaded.")
    
    try:
        today = datetime.now()
        current_year = today.year
        current_month = today.month
        
        env_data = REGION_MAP.get(payload.region, REGION_MAP["Punjab"])
        weather = get_current_weather(current_month)

        # ---------------------------------------------------------
        # 1. AI ENGINE ROUTING (With Post-Pandemic Override)
        # ---------------------------------------------------------
        if payload.disease == "COVID-19":
            
            # --- REALITY CHECK OVERRIDE ---
            if current_year >= 2024:
                # The pandemic is over. Force predictions to 0.
                raw_pred = 0
            else:
                input_data = pd.DataFrame([{
                    'Year': current_year,
                    'Month_Num': current_month,
                    'Province': env_data['Province'],
                    'City': env_data['City'],
                    'Population_Density_per_sqkm': env_data['Pop'],
                    'Avg_Temp_C': weather['Temp'],
                    'Rainfall_mm': weather['Rain'],
                    'Relative_Humidity_Pct': weather['Humid']
                }])
                raw_pred = pandemic_model.predict(input_data)[0]
            
        else:
            # Use Seasonal Model (Dengue, Malaria, Typhoid)
            input_data = pd.DataFrame([{
                'Year': current_year,
                'Month_Num': current_month,
                'Province': env_data['Province'],
                'City': env_data['City'],
                'Disease': payload.disease,
                'Population_Density_per_sqkm': env_data['Pop'],
                'Avg_Temp_C': weather['Temp'],
                'Rainfall_mm': weather['Rain'],
                'Relative_Humidity_Pct': weather['Humid']
            }])
            raw_pred = seasonal_model.predict(input_data)[0]

        # ---------------------------------------------------------
        # 2. MONTHLY TO DAILY CONVERSION
        # ---------------------------------------------------------
        monthly_total = max(0, int(raw_pred))
        daily_baseline = monthly_total / 30.0

        dates_list = []
        predictions_list = []

        current_cases = daily_baseline
        for i in range(7):
            current_day = today + timedelta(days=i)
            dates_list.append(current_day.strftime("%a"))
            
            # Add slight realistic variance (± 15%)
            # If current_cases is 0 (like COVID), variance math keeps it exactly at 0!
            variance = random.uniform(-0.15, 0.15)
            daily_cases = max(0, int(current_cases + (current_cases * variance)))
            predictions_list.append(daily_cases)

        return {
            "region": payload.region,
            "disease": payload.disease,
            "forecast_dates": dates_list,
            "forecast_cases": predictions_list,
            "status": "Success"
        }

    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")
# --- CORRECTED: 12-MONTH PREDICTION ENDPOINT (1 City Per Province) ---
class Prediction12MonthRequest(BaseModel):
    province: str
    city: str
    disease: str

# Only including the main cities to maintain data integrity
CITY_POP_MAP = {
    "Karachi": 8825, 
    "Lahore": 6318, 
    "Quetta": 272, 
    "Peshawar": 3300 
}

@app.post("/predict_12_months")
def predict_12_months(payload: Prediction12MonthRequest):
    global seasonal_model, pandemic_model
    if seasonal_model is None or pandemic_model is None:
        raise HTTPException(status_code=503, detail="Models not loaded")

    today = datetime.now()
    
    months_list = []
    cases_list = []

    for i in range(-6, 6):
        target_date = today + timedelta(days=30 * i)
        target_year = target_date.year
        target_month = target_date.month
        months_list.append(target_date.strftime("%b")) # e.g., "Jan", "Feb"
        
        weather = get_current_weather(target_month)
        pop = CITY_POP_MAP.get(payload.city, 1000)

        # Pandemic override
        if payload.disease == "COVID-19" and target_year >= 2024:
            cases_list.append(0)
            continue
            
        input_data = pd.DataFrame([{
            'Year': target_year,
            'Month_Num': target_month,
            'Province': payload.province,
            'City': payload.city,
            'Disease': payload.disease if payload.disease != "COVID-19" else None,
            'Population_Density_per_sqkm': pop,
            'Avg_Temp_C': weather['Temp'],
            'Rainfall_mm': weather['Rain'],
            'Relative_Humidity_Pct': weather['Humid']
        }])
        
        # Drop None values (like Disease for COVID model)
        input_data = input_data.dropna(axis=1)

        model = pandemic_model if payload.disease == "COVID-19" else seasonal_model
        raw_pred = model.predict(input_data)[0]
        cases_list.append(max(0, int(raw_pred)))

    return {
        "disease": payload.disease,
        "months": months_list,
        "city_name": payload.city,
        "cases": cases_list
    }
if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)