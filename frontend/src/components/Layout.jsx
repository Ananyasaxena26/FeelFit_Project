import styles from "./Layout.module.css";
import { Link, useLocation } from "react-router-dom";

function Layout({ children }) {
  const location = useLocation();

  const NAV = [
    { label: "Dashboard", icon: "⬡", path: "/" },
    { label: "Calendar", icon: "📅", path: "/calendar" },
    { label: "Recommendations", icon: "◈", path: "/" },
    
    { label: "Risk", icon: "🚨", path: "/risk" },
    { label: "AI Insights", icon: "🤖", path: "/insights" },
    { label: "SOS Mode", icon: "🆘", path: "/sos" }, 
    { label: "Game", icon: "🎮", path: "/game" },
    { label: "Demo Mode", icon: "🎭", path: "/demo" },
     { label: "Live Hr", icon: ":)", path: "/live-hr" },
      { label: "Emergency", icon: ":)", path: "/live-hr" },

  ];

  return (
    <div className={styles.wrapper}>
      
      {/* Sidebar */}
      <div className={styles.sidebar}>
        
        {/* Logo */}
        <div className={styles.logoWrap}>
          <div className={styles.logoPulse} />
          <div>
            <h2 className={styles.logo}>Vitals</h2>
            <div className={styles.logoSub}>Health OS v2.0</div>
          </div>
        </div>

        {/* Navigation */}
        <p className={styles.navLabel}>Navigation</p>

        <div className={styles.menu}>
          {NAV.map((item, i) => (
            <Link
              to={item.path}
              key={i}
              className={styles.link}
            >
              <div
                className={`${styles.navItem} ${
                  location.pathname === item.path ? styles.active : ""
                }`}
              >
                <span className={styles.navIcon}>{item.icon}</span>
                {item.label}
              </div>
            </Link>
          ))}
        </div>

        {/* Footer */}
        <div className={styles.sidebarFooter}>
          <div className={styles.footerStatus}>
            <div className={styles.statusDot} />
            Syncing live data
          </div>
        </div>

      </div>

      {/* Main Content */}
      <div className={styles.main}>
        {children}
      </div>
    </div>
  );
}

export default Layout;