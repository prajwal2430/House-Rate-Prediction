import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LinearRegression
from sklearn.ensemble import RandomForestRegressor
from sklearn.tree import DecisionTreeRegressor
from sklearn.svm import SVR
from xgboost import XGBRegressor
from sklearn.metrics import r2_score, mean_absolute_error
import pickle
import os

def train():
    # Load dataset
    df = pd.read_csv('../House_price.csv')
    
    # Preprocessing
    # The dataset has: Avg. Area Income, House Age, Number of Rooms, Number of Bedrooms, Area Population, Price, Address
    # We drop 'Address' for modeling
    X = df.drop(['Price', 'Address'], axis=1)
    y = df['Price']
    
    # Split data
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    models = {
        'Linear Regression': LinearRegression(),
        'Random Forest': RandomForestRegressor(n_estimators=100, random_state=42),
        'Decision Tree': DecisionTreeRegressor(random_state=42),
        'XGBoost': XGBRegressor(n_estimators=100, learning_rate=0.1, random_state=42),
        'SVR': SVR(kernel='rbf')
    }
    
    best_model = None
    best_score = -np.inf
    best_model_name = ""
    
    results = {}
    
    for name, model in models.items():
        model.fit(X_train, y_train)
        predictions = model.predict(X_test)
        score = r2_score(y_test, predictions)
        mae = mean_absolute_error(y_test, predictions)
        results[name] = {'R2': score, 'MAE': mae}
        
        if score > best_score:
            best_score = score
            best_model = model
            best_model_name = name
            
    print(f"Best Model: {best_model_name} with R2 Score: {best_score}")
    
    # Save the best model and features
    with open('model.pkl', 'wb') as f:
        pickle.dump(best_model, f)
        
    with open('model_info.pkl', 'wb') as f:
        pickle.dump({
            'model_name': best_model_name,
            'r2_score': best_score,
            'features': list(X.columns),
            'results': results
        }, f)

if __name__ == "__main__":
    train()
