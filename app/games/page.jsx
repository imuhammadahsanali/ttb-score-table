"use client";
import { useEffect, useState } from "react";

const SPORTS = ["all", "nfl", "nba", "nhl", "mlb", "cbb", "cfb"];
const STATUS_FILTERS = ["All", "Scheduled", "InProgress", "Final"];

const LEAGUE_LOGOS = {
  nfl: "/nfl.png",
  nba: "/nba.png",
  nhl: "/nhl.png",
  mlb: "/mlb.png",
  cbb: "/cbb.png",
  cfb: "/cfb.png",
};

export default function GamesPage() {
  const [games, setGames] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);

  const [sportFilter, setSportFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState(["Scheduled", "InProgress"]);

  const [teamLogos, setTeamLogos] = useState({
    nfl: {},
    nba: {},
    nhl: {},
    mlb: {},
    cbb: {},
    cfb: {},
  });


  function getUserTimezone() {
    try {
      return Intl.DateTimeFormat().resolvedOptions().timeZone; 
    } catch {
      return "Local Time";
    }
  }

  function getTimeZoneShort() {
    try {
      const date = new Date();
      return date.toLocaleTimeString("en-us",{timeZoneName:"short"}).split(" ").pop();
    } catch {
      return "";
    }
  }



function getDateLabel(dateStr) {
  const date = new Date(dateStr);
  
  const today = new Date();
  today.setHours(0,0,0,0);

  const target = new Date(date);
  target.setHours(0,0,0,0);

  const diff = (target - today) / (1000 * 60 * 60 * 24);

  if (diff === 0) return "Today";
  if (diff === 1) return "Tomorrow";
  if (diff === -1) return "Yesterday";

  return null;
}



async function loadTeamLogos() {
  try {
    const res = await fetch("https://ttb-api.onrender.com/v2/teamlogos");
    const json = await res.json();

    setTeamLogos(prev => ({
      ...prev,
      cfb: json.cfb || {},
      cbb: json.cbb || {},
    }));

  } catch (err) {
    console.error("Failed loading team logos:", err);
  }
}



  function parseJSON(value) {
    if (!value) return null;
    if (typeof value === "object") return value;
    try {
      return JSON.parse(value);
    } catch {
      return null;
    }
  }

  function getTeamLogo(sport, abbr) {
    if (!abbr || !sport) return null;

    const upper = abbr.toUpperCase();

    // NCAA (handled by your backend maps)
    if (sport === "cfb" || sport === "cbb") {
      return teamLogos[sport]?.[upper] || null;
    }

    // Pro leagues (ESPN)
    const lower = abbr.toLowerCase();
    const map = {
      nfl: `https://a.espncdn.com/i/teamlogos/nfl/500/${lower}.png`,
      nba: `https://a.espncdn.com/i/teamlogos/nba/500/${lower}.png`,
      nhl: `https://a.espncdn.com/i/teamlogos/nhl/500/${lower}.png`,
      mlb: `https://a.espncdn.com/i/teamlogos/mlb/500/${lower}.png`,
    };

    return map[sport] || null;
  }



  async function loadGames() {
    try {
      const res = await fetch("https://ttb-api.onrender.com/v2/games");
      const json = await res.json();
      setGames(json.games);
      setLoading(false);
    } catch (err) {
      console.error(err);
    }
  }

  useEffect(() => {
    let list = games;

    if (sportFilter !== "all") {
      list = list.filter((g) => g.sport === sportFilter);
    }

    if (statusFilter.length && !statusFilter.includes("All")) {
      list = list.filter((g) => statusFilter.includes(g.status));
    }

    setFiltered(list);
  }, [sportFilter, statusFilter, games]);

  useEffect(() => {
    loadTeamLogos();
    loadGames();
    const interval = setInterval(loadGames, 4000);
    return () => clearInterval(interval);
  }, []);


  if (loading) return <p style={{ color: "white" }}>Loading games...</p>;

  return (
    <div style={pageWrapper}>

      {/* ---------------- TOP BRAND HEADER ---------------- */}
      <div style={brandHeader}>
        <div style={brandLeft}>
          <img
            src="/logo.png"   // <-- Replace with your logo file
            alt="TakeTheBet"
            style={brandLogo}
          />
          <h1 style={pageHeading}>Sportsbook — Live & Upcoming</h1>
        </div>

        {/* Right side actions (optional future) */}
        <div style={brandRight}>
          {/* Example placeholder buttons */}
          {/* <button style={headerBtn}>Login</button> */}
          {/* <button style={headerBtn}>Register</button> */}
        </div>
      </div>
      {/* -------------------------------------------------- */}

      

      {/* FILTER ROW */}
      <div style={filterRow}>
        {/* SPORT FILTER */}
        <div>
          <label style={filterLabel}>Sport:</label>
          <select
            value={sportFilter}
            onChange={(e) => setSportFilter(e.target.value)}
            style={filterSelect}
          >
            {SPORTS.map((s) => (
              <option key={s} value={s}>
                {s.toUpperCase()}
              </option>
            ))}
          </select>
        </div>

        {/* STATUS FILTER */}
        <div>
          <label style={filterLabel}>Status:</label>
          <select
            multiple
            size={3}
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter([...e.target.selectedOptions].map((o) => o.value))
            }
            style={{ ...filterSelect, height: 90 }}
          >
            {STATUS_FILTERS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* GAME LIST */}
      <div style={cardGrid}>
        {filtered.map((g) => {
          const odds = parseJSON(g.odds);
          const stadium = parseJSON(g.stadium);
          const weather = parseJSON(g.weather);

          return (
            <div key={g.id} style={gameCard}>
              {/* HEADER */}
              <div style={cardHeader}>
                <img
                  src={LEAGUE_LOGOS[g.sport]}
                  style={{ height: 28, marginRight: 10 }}
                  alt={g.sport}
                />

                <span style={statusPill(g.status)}>
                  {g.status === "InProgress" ? (
                    <>
                      <span style={liveDot}></span> LIVE
                    </>
                  ) : (
                    g.status
                  )}
                </span>
              </div>

              {/* TEAMS */}
              <div style={teamsRow}>
                <div style={teamCol}>
                  <img
                    src={getTeamLogo(g.sport, g.home_team)}
                    alt={g.home_team}
                    style={teamLogo}
                  />
                  <div>{g.home_team}</div>
                </div>

                <div style={vsText}>vs</div>

                <div style={teamCol}>
                  <img
                    src={getTeamLogo(g.sport, g.away_team)}
                    alt={g.away_team}
                    style={teamLogo}
                  />
                  <div>{g.away_team}</div>
                </div>
              </div>


              {/* DATE */}
              <div style={dateText}>
                {new Date(g.game_date).toLocaleString("en-US")}

                {/* Tiny label */}
                {getDateLabel(g.game_date) && (
                  <span style={dateTag}>{getDateLabel(g.game_date)}</span>
                )}

                {/* Timezone */}
                <div style={timeZoneText}>
                  {getTimeZoneShort()} • {getUserTimezone()}
                </div>
              </div>



              {/* SCORE */}
              <div style={scoreRow}>
                {g.home_score !== null ? (
                  <>
                    <strong>{g.home_team}</strong> {g.home_score} —{" "}
                    {g.away_score} <strong>{g.away_team}</strong>
                  </>
                ) : (
                  <span style={{ opacity: 0.6 }}>Not started</span>
                )}
              </div>

              {/* ODDS */}
              <div style={oddsBox}>
                <div>
                  <strong>ML:</strong>{" "}
                  {odds?.moneyline
                    ? `${odds.moneyline.home} / ${odds.moneyline.away}`
                    : "N/A"}
                </div>

                <div>
                  <strong>Spread:</strong>{" "}
                  {odds?.spread
                    ? `(${odds.spread.value})`
                    : "N/A"}
                </div>

                <div>
                  <strong>Total:</strong>{" "}
                  {odds?.total ? odds.total.value : "N/A"}
                </div>
              </div>

              {/* FOOTER INFO */}
              <div style={footerInfo}>
                <div>
                  <strong>Stadium:</strong>{" "}
                  {stadium ? stadium.name : "N/A"}
                </div>

                <div>
                  <strong>Weather:</strong>{" "}
                  {weather?.description || "Indoor / N/A"}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ---------------- STYLES ---------------- */

const pageWrapper = {
  padding: 40,
  background: "#0f1115",
  minHeight: "100vh",
  color: "white",
};

const pageHeading = {
  fontSize: 34,
  fontWeight: 700,
  letterSpacing: 1,
};

const filterRow = {
  display: "flex",
  gap: 30,
  marginBottom: 30,
};

const filterLabel = {
  fontWeight: "bold",
  marginRight: 8,
  fontSize: 15,
};

const filterSelect = {
  padding: 8,
  borderRadius: 6,
  background: "#1c1f24",
  border: "1px solid #2a2d33",
  color: "#fff",
  minWidth: 150,
};

const cardGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))",
  gap: 20,
};

const gameCard = {
  background: "#1a1d23",
  padding: 20,
  borderRadius: 12,
  border: "1px solid #2a2d33",
  boxShadow: "0 0 12px rgba(0,0,0,0.2)",
  transition: "transform 0.2s ease, box-shadow 0.2s ease",
};

gameCard[":hover"] = {
  transform: "translateY(-3px)",
  boxShadow: "0 4px 18px rgba(0,0,0,0.4)",
};

const cardHeader = {
  display: "flex",
  justifyContent: "space-between",
  marginBottom: 10,
};

const statusPill = (status) => ({
  padding: "4px 10px",
  borderRadius: 20,
  fontSize: 12,
  textTransform: "uppercase",
  fontWeight: 700,
  background:
    status === "Final"
      ? "#ff4d4d33"
      : status === "InProgress"
      ? "#29ff9e22"
      : "#ffffff11",
  color:
    status === "Final"
      ? "#ff4d4d"
      : status === "InProgress"
      ? "#29ff9e"
      : "#999",
});

const liveDot = {
  display: "inline-block",
  width: 8,
  height: 8,
  background: "red",
  borderRadius: "50%",
  marginRight: 5,
  animation: "blink 1s infinite",
};

const teamsRow = {
  display: "flex",
  justifyContent: "space-between",
  fontSize: 18,
  fontWeight: 600,
  marginBottom: 10,
};

const teamName = {
  width: "45%",
};

const vsText = { opacity: 0.6 };

const dateText = {
  fontSize: 14,
  opacity: 0.7,
  marginBottom: 10,
};

const dateTag = {
  fontSize: 11,
  padding: "2px 6px",
  borderRadius: 4,
  marginLeft: 6,
  background: "#ffffff18",
  color: "#bbb",
  textTransform: "uppercase",
  letterSpacing: 0.5,
};


const timeZoneText = {
  fontSize: 11,
  opacity: 0.5,
  marginTop: 2,
};


const scoreRow = {
  fontSize: 16,
  marginBottom: 12,
  fontWeight: 500,
};

const oddsBox = {
  background: "#23262d",
  padding: 10,
  borderRadius: 8,
  marginBottom: 12,
  fontSize: 14,
};

const footerInfo = {
  opacity: 0.8,
  fontSize: 13,
  lineHeight: "18px",
};

/* ---------------- BRAND HEADER ---------------- */

const brandHeader = {
  width: "100%",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  paddingBottom: 25,
  marginBottom: 25,
  borderBottom: "1px solid #222",
};

const brandLeft = {
  display: "flex",
  alignItems: "center",
  gap: 12,
};

const brandLogo = {
  height: 100,
  width: "auto",
  borderRadius: 6,
};

const brandRight = {
  display: "flex",
  gap: 10,
};

const headerBtn = {
  padding: "6px 14px",
  borderRadius: 6,
  background: "#1f2228",
  color: "white",
  border: "1px solid #2c2f36",
  cursor: "pointer",
  fontWeight: 600,
};

const teamCol = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  width: "45%",
  textAlign: "center",
  gap: 6,
};

const teamLogo = {
  width: 48,
  height: 48,
  objectFit: "contain",
};
