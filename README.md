# 🫁 MediScan Diagnostics

![MediScan Diagnostics](https://img.shields.io/badge/AI-Medical%20Diagnostics-00e5ff?style=for-the-badge)
![TensorFlow](https://img.shields.io/badge/TensorFlow-2.13-orange?style=for-the-badge&logo=tensorflow)
![Flask](https://img.shields.io/badge/Flask-Backend-black?style=for-the-badge&logo=flask)
![AWS](https://img.shields.io/badge/AWS-EC2%20%7C%20S3-yellow?style=for-the-badge&logo=amazon-aws)

---

## 📌 Overview

MediScan Diagnostics is an AI-powered chest X-Ray diagnostic platform that detects **14 different chest diseases** using Deep Learning. Upload an X-Ray image and get instant AI-powered analysis with disease probabilities.

---

## 🔬 Diseases Detected

| # | Disease | # | Disease |
|---|---------|---|---------|
| 1 | Atelectasis | 8 | Pneumothorax |
| 2 | Cardiomegaly | 9 | Consolidation |
| 3 | Effusion | 10 | Edema |
| 4 | Infiltration | 11 | Emphysema |
| 5 | Mass | 12 | Fibrosis |
| 6 | Nodule | 13 | Pleural Thickening |
| 7 | Pneumonia | 14 | Hernia |

---

## 🏗️ Architecture

```
User uploads X-Ray
        ↓
Frontend (HTML/CSS/JS)
        ↓
Flask API (AWS EC2)
        ↓
DenseNet-121 Model (Fine-tuned)
        ↓
14 Disease Probabilities
        ↓
Results displayed to User
```

---

## 🧠 Model Details

- **Architecture** → DenseNet-121 (pretrained on ImageNet)
- **Fine-tuned on** → NIH Chest X-Ray 14 Dataset
- **Dataset** → 10,276 images (20% subset, No Finding removed)
- **Training** → 15 epochs + Fine-tuning (10 epochs)
- **Val AUC** → ~0.75
- **Loss** → Binary Cross Entropy
- **Activation** → Sigmoid (Multi-label classification)

---

## 📁 Project Structure

```
mediscan-ai/
├── frontend/
│   ├── index.html       ← Main UI
│   ├── style.css        ← Styling
│   └── app.js           ← Frontend Logic
├── backend/
│   └── app.py           ← Flask API
├── model/
│   └── training_notebook.ipynb  ← Kaggle Training Code
└── README.md
```

---

## 🚀 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | HTML, CSS, JavaScript |
| Backend | Python, Flask |
| Model | TensorFlow, DenseNet-121 |
| Dataset | NIH Chest X-Ray 14 |
| Cloud | AWS EC2, AWS S3 for backup |

---

## ⚙️ Setup & Run

### Backend (EC2)
```bash
# Virtual environment
python3 -m venv medenv
source medenv/bin/activate

# Install dependencies
pip install tensorflow flask flask-cors boto3 pillow numpy opencv-python groq

# Download model from S3
aws s3 cp s3://YOUR_BUCKET/best_model_finetuned.keras /home/ubuntu/best_model.keras

# Run Flask
python app.py
```

### Frontend
```bash
# Open index.html in browser
# Or use Live Server in VS Code
```

---

## 📊 Dataset

- **Source** → [NIH Chest X-Ray 14](https://www.kaggle.com/datasets/nih-chest-xrays/data)
- **Total Images** → 1,12,120
- **Used** → 10,276 (balanced subset)
- **Classes** → 14 diseases

---

## ⚠️ Disclaimer

> This project is for **educational purposes only**.
> AI predictions should NOT replace professional medical diagnosis.
> Always consult a qualified doctor for medical decisions.

---

## 👨‍💻 Developer

Made with ❤️ | Deep Learning Project
