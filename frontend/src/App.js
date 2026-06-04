import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Layout from "./components/Layout";
import Dashboard from "./components/Dashboard";
import CalendarPage from "./pages/CalendarPage";
import RiskPage from "./pages/RiskPage";
import SmartInsightsPage from "./pages/SmartInsightsPage";
import SOSPage from "./pages/SOSPage";
import Recommendations from "./components/Recommendations";
import ReminderSetter from "./components/ReminderSetter";
import PodcastSuggestions from "./components/PodcastSuggestions";
import GamePage from "./pages/GamePage";
import DemoPage from "./pages/DemoPage";
import MotivationBox from "./components/MotivationBox";
import LiveHeartRate from "./pages/LiveHeartRate";
import Emergency from "./pages/Emergency"



function App() {
  return (
    <Router>
      <Routes>
        <Route
  path="/"
  element={
    <Layout>
      <MotivationBox />
      <Recommendations />
      <Dashboard />
    
      <ReminderSetter />
      <PodcastSuggestions />
    </Layout>
  }
/>

        <Route
          path="/"
          element={
            <Layout>
              <Dashboard />
            </Layout>
          }
        />

        <Route
          path="/calendar"
          element={
            <Layout>
              <CalendarPage />
            </Layout>
          }
        />

        <Route
          path="/risk"
          element={
            <Layout>
              <RiskPage />
            </Layout>
          }
        />

        {/* 🔥 NEW PAGE */}
        <Route
          path="/insights"
          element={
            <Layout>
              <SmartInsightsPage />
            </Layout>
          }
        />
        {/* 🆘 SOS */}
        <Route
          path="/sos"
          element={
            <Layout>
              <SOSPage />
            </Layout>
          }
        />
      <Route
  path="/game"
  element={
    <Layout>
      <GamePage />
    </Layout>
  }
/>
<Route
  path="/demo"
  element={
    <Layout>
      <DemoPage />
    </Layout>
  }
/>
<Route path="/live-hr" element={<Layout><LiveHeartRate /></Layout>} />
<Route path="/emergency" element={<Layout><Emergency /></Layout>} />
      
      </Routes>
    </Router>
    
  );
}

export default App;
