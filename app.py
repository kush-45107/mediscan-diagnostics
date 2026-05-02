from flask import Flask, request, jsonify
from flask_cors import CORS
import tensorflow as tf
import numpy as np
import cv2
import base64
import io

app = Flask(__name__)
CORS(app)

DISEASES = [
    'Atelectasis', 'Cardiomegaly', 'Effusion',
    'Infiltration', 'Mass', 'Nodule', 'Pneumonia',
    'Pneumothorax', 'Consolidation', 'Edema',
    'Emphysema', 'Fibrosis', 'Pleural_Thickening', 'Hernia'
]

print("Loading model...")
model = tf.keras.models.load_model('/home/ubuntu/best_model.keras')
print("Model loaded!")

@app.route('/analyze', methods=['POST'])
def analyze():
    try:
        data = request.get_json()
        image_b64 = data['image']
        image_bytes = base64.b64decode(image_b64)

        nparr = np.frombuffer(image_bytes, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
        img = cv2.resize(img, (224, 224))
        img_array = img / 255.0
        img_array = np.expand_dims(img_array, axis=0)

        predictions = model.predict(img_array)[0]

        results = []
        for disease, prob in zip(DISEASES, predictions):
            results.append({
                'disease': disease,
                'probability': round(float(prob) * 100, 2),
                'detected': bool(prob > 0.5)
            })

        detected = [r for r in results if r['detected']]
        detected.sort(key=lambda x: x['probability'], reverse=True)

        return jsonify({
            'detected_diseases': detected,
            'all_results': results
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)