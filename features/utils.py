import numpy as np


# -----------------------------
# SAFE VALUE ACCESS
# -----------------------------
def safe_get(row, key, default=0):
    """
    Safely get value from dataframe row
    """
    try:
        return row[key]
    except:
        return default


# -----------------------------
# CLAMP VALUES
# -----------------------------
def clamp(value, min_value, max_value):
    """
    Restrict value within range
    """
    return max(min_value, min(max_value, value))


# -----------------------------
# SAFE MEAN
# -----------------------------
def safe_mean(values):
    """
    Compute mean safely
    """
    if values is None or len(values) == 0:
        return 0

    return float(np.mean(values))


# -----------------------------
# SAFE STANDARD DEVIATION
# -----------------------------
def safe_std(values):
    """
    Compute std safely
    """
    if values is None or len(values) == 0:
        return 0

    return float(np.std(values))


# -----------------------------
# NORMALIZE VALUE
# -----------------------------
def normalize(value, min_val, max_val):
    """
    Normalize value between 0 and 1
    """
    if max_val - min_val == 0:
        return 0

    return (value - min_val) / (max_val - min_val)


# -----------------------------
# MOVING AVERAGE
# -----------------------------
def moving_average(data, window=7):
    """
    Simple moving average
    """
    if len(data) < window:
        return data

    result = []

    for i in range(len(data)):
        start = max(0, i - window + 1)
        result.append(np.mean(data[start:i+1]))

    return result