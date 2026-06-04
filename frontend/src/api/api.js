const BASE_URL = "http://127.0.0.1:5000";

// Get health predictions
export const getPredictions = async () => {
  try {
    const res = await fetch(`${BASE_URL}/predict`);

    if (!res.ok) {
      throw new Error("Failed to fetch predictions");
    }

    return await res.json();
  } catch (err) {
    console.error("Error fetching predictions:", err);
    return null;
  }
};

// Activities
export const getActivities = async () => {
  try {
    const res = await fetch(`${BASE_URL}/activity`);
    return await res.json();
  } catch (err) {
    console.error(err);
    return [];
  }
};

// Alerts
export const getAlerts = async () => {
  try {
    const res = await fetch(`${BASE_URL}/alerts`);
    return await res.json();
  } catch (err) {
    console.error(err);
    return [];
  }
};

// Get heart rate data (hourly graph)
export const getHRData = async () => {
  try {
    const res = await fetch(`${BASE_URL}/hr-data`);
    return await res.json();
  } catch (err) {
    console.error(err);
    return [];
  }
};

export const getHRMinute = async () => {
  const res = await fetch("http://localhost:5000/hr-minute");
  return res.json();
};
export const getHealthInsights = async () => {
  try {
    const res = await fetch(`${BASE_URL}/health-insights`);
    return await res.json();
  } catch (err) {
    console.error(err);
    return null;
  }
};

export const getActivityPattern = async () => {
  try {
    const res = await fetch(`${BASE_URL}/activity-pattern`);
    return await res.json();
  } catch (err) {
    console.error(err);
    return null;
  }
};

export const getHRAnalysis = async () => {
  try {
    const res = await fetch(`${BASE_URL}/hr-analysis`);
    return await res.json();
  } catch (err) {
    console.error(err);
    return null;
  }
};

export const getProductivityPattern = async () => {
  try {
    const res = await fetch("http://127.0.0.1:5000/productivity-pattern");
    return await res.json();
  } catch (err) {
    console.error(err);
    return null;
  }
};

export const getHealthTrends = async () => {
  try {
    const res = await fetch(`${BASE_URL}/health-trends`);
    return await res.json();
  } catch (err) {
    console.error(err);
    return [];
  }
 
};
export const getLiveSteps = async () => {
  const res = await fetch("http://127.0.0.1:5000/live-steps");
  return res.json();
};
