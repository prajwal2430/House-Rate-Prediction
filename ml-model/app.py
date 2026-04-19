from flask import Flask, request, jsonify
from flask_cors import CORS
import pickle
import pandas as pd
import numpy as np
import os
from train import train_and_save

app = Flask(__name__)
CORS(app)

# Load model and stats
model = None
model_stats = None

def load_data():
    global model, model_stats
    try:
        if os.path.exists('model.pkl') and os.path.exists('model_stats.pkl'):
            with open('model.pkl', 'rb') as f:
                model = pickle.load(f)
            with open('model_stats.pkl', 'rb') as f:
                model_stats = pickle.load(f)
    except Exception as e:
        print(f"Error loading model: {e}")

load_data()

@app.route('/predict', methods=['POST'])
def predict():
    if model is None:
        load_data()
        if model is None:
            return jsonify({'error': 'Model not found. Please train the model first.'}), 500
            
    try:
        data = request.json
        features = [
            float(data.get('avg_area_income', 0)),
            float(data.get('house_age', 0)),
            float(data.get('num_rooms', 0)),
            float(data.get('num_bedrooms', 0)),
            float(data.get('area_population', 0))
        ]
        
        prediction = model.predict([features])[0]
        
        return jsonify({
            'prediction': round(prediction, 2),
            'model_info': {
                'name': model_stats['best_model'],
                'r2_score': round(model_stats['r2_score'], 4)
            }
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@app.route('/stats', methods=['GET'])
def get_stats():
    if model_stats is None:
        return jsonify({'error': 'No model stats available.'}), 500
    return jsonify(model_stats)

@app.route('/retrain', methods=['POST'])
def retrain():
    try:
        train_and_save()
        load_data()
        return jsonify({'success': True, 'message': 'Model retrained successfully!', 'stats': model_stats})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(port=5001, debug=True)
