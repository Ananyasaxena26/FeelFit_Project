# 🩺 FeelFit – AI-Powered Wellness Monitoring System

FeelFit is an AI-driven wellness monitoring platform that analyzes wearable health data to provide personalized insights into physical and mental well-being. Using Fitbit-derived physiological data, the system predicts **Mood Score** and **Productivity Index** through machine learning models and provides wellness recommendations, stress-management support, and emergency assistance.

---

## 🚀 Features

### 📊 Health Monitoring

* Heart Rate Tracking
* Sleep Duration Analysis
* Activity & Step Count Monitoring
* Stress Level Monitoring

### 🤖 AI-Based Wellness Prediction

* Mood Score Prediction
* Productivity Index Prediction
* Machine Learning-Based Health Analytics
* Personalized Wellness Insights

### 🧘 Stress Management

* Guided Breathing Exercises
* Stress-Relief Mini Games
* Personalized Wellness Recommendations
* Podcast Suggestions for Relaxation and Focus

### 🚨 Emergency Assistance

* Abnormal Heart Rate Detection
* Emergency SOS Alerts
* Automated Notifications to Family Members

### 📈 Analytics Dashboard

* Historical Wellness Tracking
* Mood Trends Visualization
* Productivity Analysis
* Heart Rate Visualization
* Calendar-Based Health Records

### 🔔 Smart Reminder System

* Personalized Health Reminders
* Fitbit-Based Notifications
* Wellness Activity Prompts

---

## 🏗️ System Architecture

```text
Fitbit Device
      │
      ▼
Data Collection
      │
      ▼
Data Preprocessing
      │
      ▼
Machine Learning Models
(Random Forest, LightGBM, CatBoost)
      │
      ▼
Mood & Productivity Prediction
      │
      ▼
Wellness Intervention Layer
(Breathing Exercises, Podcasts,
Stress Relief Activities)
      │
      ▼
Alerts, Recommendations,
and Analytics Dashboard
```

---

## 🧠 Machine Learning Models

The following machine learning models were evaluated for Mood Score Prediction:

| Model         | R² Score |
| ------------- | -------- |
| Random Forest | 0.728    |
| LightGBM      | 0.650    |
| CatBoost      | 0.616    |

**Random Forest** was selected as the final model due to its balanced performance and interpretability.

---

## 📊 Feature Importance

The Random Forest model identified the following physiological features as the most influential:

| Feature        | Importance |
| -------------- | ---------- |
| Sleep Duration | 0.34       |
| Stress Score   | 0.29       |
| Heart Rate     | 0.18       |
| Step Count     | 0.12       |

These results indicate that sleep quality and stress levels have the greatest impact on overall wellness.

---

## 🛠️ Technology Stack

### Frontend

* React.js
* Tailwind CSS

### Backend

* Flask
* Python

### Machine Learning

* Scikit-learn
* Pandas
* NumPy

### Wearable Integration

* Fitbit Devices
* Fitbit API

### Database & Storage

* Firebase / MongoDB

---

## 📂 Dataset

The system utilizes Fitbit-derived physiological parameters, including:

* Heart Rate
* Sleep Duration
* Step Count
* Stress Score
* Activity Levels

### Dataset Summary

| Parameter                | Value                      |
| ------------------------ | -------------------------- |
| Participants             | 20                         |
| Age Range                | 18–25 Years                |
| Data Collection Duration | 4 Weeks                    |
| Data Source              | Fitbit Devices             |
| Mood Labels              | Daily Self-Reported Survey |
| Productivity Labels      | Daily Self-Assessment      |

---

## 📈 Results

The experimental results demonstrate the effectiveness of wearable analytics and machine learning for wellness prediction.

| Model         | R² Score | MAE  | RMSE |
| ------------- | -------- | ---- | ---- |
| Random Forest | 0.728    | 0.64 | 0.89 |
| LightGBM      | 0.650    | 0.73 | 1.02 |
| CatBoost      | 0.616    | 0.81 | 1.15 |

---

## 🎯 Project Objectives

* Predict user Mood Score using physiological data.
* Estimate Productivity Index from wearable health metrics.
* Provide personalized wellness recommendations.
* Assist users in managing stress through interactive interventions.
* Deliver emergency alerts during abnormal physiological conditions.
* Promote proactive wellness management using AI and wearable analytics.

---

## 🔮 Future Enhancements

* Real-Time Fitbit API Integration
* Deep Learning Models (LSTM, Transformers)
* Voice-Assisted Wellness Support
* Explainable AI Dashboards
* Cross-Platform Wearable Compatibility
* Advanced Recommendation Systems

---

## 👩‍💻 Authors

Developed as a B.Tech Computer Science Engineering project focused on:

* Artificial Intelligence
* Machine Learning
* Healthcare Analytics
* Wearable Computing
* Preventive Healthcare

---

## 📜 License

This project is intended for educational and research purposes.
