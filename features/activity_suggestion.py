def get_activity_suggestions(row, mood, productivity, raw_stress):

    suggestions = []

    # --- SAFE VALUE EXTRACTION ---
    sleep = row.get("sleep_hours", 0)
    sleep_deficit = row.get("sleep_deficit", 0)
    steps = row.get("total_steps", 0)
    avg_hr = row.get("avg_hr_day", 0)
    resting_hr = row.get("resting_hr", 60)

    stress = raw_stress

    # ---------------------------------------------------
    # SLEEP ANALYSIS
    # ---------------------------------------------------
    if sleep < 4:
        suggestions.append(
            f"Sleep is very low ({sleep} hrs). Prioritize recovery and lighter tasks today."
        )

    elif sleep < 5:
        suggestions.append(
            f"Sleep slightly low ({sleep} hrs). Avoid heavy workload if possible."
        )

    elif sleep < 6:
        suggestions.append(
            f"Sleep moderate ({sleep} hrs). Try to maintain consistency tonight."
        )

    if sleep_deficit > 90:
        suggestions.append(
            f"Sleep debt detected ({sleep_deficit} mins). A short nap or early sleep could help."
        )

    # ---------------------------------------------------
    # STRESS ANALYSIS
    # ---------------------------------------------------
    if stress > 0.18:
        suggestions.append(
            f"Stress level high ({round(stress,3)}). Focus on one task and avoid multitasking."
        )

    elif stress > 0.15:
        suggestions.append(
            f"Moderate stress ({round(stress,3)}). Short breaks will help maintain focus."
        )

    # ---------------------------------------------------
    # COMBINED FATIGUE CONDITION
    # ---------------------------------------------------
    if stress > 0.18 and sleep < 5:
        suggestions.append(
            "High stress combined with low sleep. Keep the schedule lighter today."
        )

    # ---------------------------------------------------
    # ACTIVITY LEVEL
    # ---------------------------------------------------
    if steps < 2000:
        suggestions.append(
            f"Very low activity ({steps} steps). A short walk could boost energy and mood."
        )

    elif steps < 5000:
        suggestions.append(
            f"Activity slightly low ({steps} steps). Try light movement or stretching."
        )

    elif steps > 8000:
        suggestions.append(
            f"Good activity level ({steps} steps). Maintain this consistency."
        )

    # ---------------------------------------------------
    # HEART RATE / FATIGUE
    # ---------------------------------------------------
    if avg_hr > resting_hr + 20:
        suggestions.append(
            "Heart rate significantly elevated above resting level. Consider resting or light activity."
        )

    elif avg_hr > resting_hr + 10:
        suggestions.append(
            "Heart rate slightly elevated. Take small breaks and stay hydrated."
        )

    # ---------------------------------------------------
    # PRODUCTIVITY ANALYSIS
    # ---------------------------------------------------
    if productivity < 4:
        suggestions.append(
            "Productivity low. Start with small tasks and build momentum."
        )

    elif productivity < 5:
        suggestions.append(
            "Productivity slightly low. Breaking tasks into smaller chunks may help."
        )

    # ---------------------------------------------------
    # MOOD ANALYSIS
    # ---------------------------------------------------
    if mood < 4:
        suggestions.append(
            "Mood low. Try a refreshing activity like music or a short walk."
        )

    elif mood < 5:
        suggestions.append(
            "Mood slightly low. A short break or social interaction may help."
        )

    # ---------------------------------------------------
    # BALANCED HEALTH STATE
    # ---------------------------------------------------
    if sleep >= 6 and steps >= 6000 and stress < 0.16:
        suggestions.append(
            "Overall balance looks good today. Maintain your current routine."
        )

    # ---------------------------------------------------
    # DEFAULT
    # ---------------------------------------------------
    if not suggestions:
        suggestions.append(
            "Health indicators look stable. Keep following your routine."
        )

    return suggestions[:3]