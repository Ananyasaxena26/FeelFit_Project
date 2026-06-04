import { useEffect, useState } from "react";
import { getActivities } from "../api/api";
import styles from "./Recommendations.module.css";

function Recommendations() {
  const [activities, setActivities] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const activityData = await getActivities();
      setActivities(activityData?.suggestions || []);
    };
    fetchData();
  }, []);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <p className={styles.eyebrow}>Personalized Guidance</p>
        <h2 className={styles.title}>Recommendations</h2>
      </div>

      <div className={styles.section}>
        <p className={styles.sectionTitle}>Activity Suggestions</p>

        {activities.length > 0 ? (
          <div className={styles.list}>
            {activities.map((a, i) => (
              <div key={i} className={styles.card}>
                <span className={styles.cardNum}>{String(i + 1).padStart(2, "0")}</span>
                {a}
              </div>
            ))}
          </div>
        ) : (
          <div className={styles.empty}>
            <p className={styles.emptyText}>No suggestions available</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Recommendations;