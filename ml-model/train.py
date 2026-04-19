import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LinearRegression
from sklearn.ensemble import RandomForestRegressor
from sklearn.tree import DecisionTreeRegressor
from xgboost import XGBRegressor
from sklearn.svm import SVR
from sklearn.metrics import r2_score, mean_absolute_error
import pickle
import os

def train_and_save():
    # Load dataset
    data_path = '../House_price.csv'
    if not os.path.exists(data_path):
        # Fallback if path is different
        data_path = 'House_price.csv'
        
    df = pd.read_csv(data_path)
    
    # Preprocessing
    # Drop Address as it's text-based and typically not used in basic models without more NLP
    X = df[['Avg. Area Income', 'House Age', 'Number of Rooms', 'Number of Bedrooms', 'Area Population']]
    y = df['Price']
    
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    models = {
        'Linear Regression': LinearRegression(),
        'Random Forest': RandomForestRegressor(n_estimators=100, random_state=42),
        'Decision Tree': DecisionTreeRegressor(random_state=42),
        'XGBoost': XGBRegressor(n_estimators=100, random_state=42),
        'SVR': SVR(kernel='rbf')
    }
    
    best_model = None
    best_score = -float('inf')
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
            
    # Save the best model
    with open('model.pkl', 'wb') as f:
        pickle.dump(best_model, f)
        
    # Save the results and features list for the API
    with open('model_stats.pkl', 'wb') as f:
        pickle.dump({
            'best_model': best_model_name,
            'r2_score': best_score,
            'features': X.columns.tolist(),
            'all_results': results
        }, f)
        
    print(f"Training Complete. Best Model: {best_model_name} with R2: {best_score}")

if __name__ == "__main__":
    train_and_save()
