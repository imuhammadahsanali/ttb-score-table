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

  const [injuryData, setInjuryData] = useState(null);
  const [showInjury, setShowInjury] = useState(false);


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

  async function fetchInjuries(sport, team) {
    if (sport !== "nfl") {
      alert("Injury data currently available for NFL only.");
      return;
    }

    try {
      const res = await fetch(`https://ttb-api.onrender.com/v2/injuries/nfl?team=${team}`);
      const json = await res.json();
      setInjuryData(json);
      setShowInjury(true);
    } catch (err) {
      console.error("Error loading injuries:", err);
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
              {/* <div style={cardHeader}>
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
              </div> */}

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

              {/* INJURY BUTTON */}
              {g.sport === "nfl" && (
                <div style={injuryBtnRow}>
                  <button
                    style={injuryBtn}
                    onClick={() => fetchInjuries(g.sport, g.home_team)}
                  >
                    {g.home_team} Injuries
                  </button>

                  <button
                    style={injuryBtn}
                    onClick={() => fetchInjuries(g.sport, g.away_team)}
                  >
                    {g.away_team} Injuries
                  </button>
                </div>
              )}


              {/* DATE */}
              <div style={dateText}>
                {
                  new Date(g.game_date).toLocaleString("en-US", {
                    hour: "2-digit",
                    minute: "2-digit",
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })
                }

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

              {/* ODDS — ESPN STYLE */}
              <div style={espnOddsBox}>
                {/* Top Summary Row */}
                <div style={oddsSummary}>
                  ML: {g.home_team} {odds?.moneyline?.home ?? "N/A"} • 
                  {g.away_team} {odds?.moneyline?.away ?? "N/A"} • 
                  Total: {odds?.total?.value ?? "N/A"}
                </div>

                {/* Odds Grid */}
                <div style={oddsGrid}>
                  {/* HOME TEAM */}
                  <div style={oddsTeamCol}>
                    <div style={teamHeader}>{g.home_team}</div>

                    <div style={oddsRow}>
                      <span>Open</span>
                      <strong>{odds?.spread?.value ? `o${odds.spread.value}` : "N/A"}</strong>
                    </div>

                    <div style={oddsRow}>
                      <span>ML</span>
                      <strong>{odds?.moneyline?.home ?? "N/A"}</strong>
                    </div>

                    <div style={oddsRow}>
                      <span>Total</span>
                      <strong>{odds?.total?.value ? `o${odds.total.value}` : "N/A"}</strong>
                    </div>

                    <div style={oddsRow}>
                      <span>Spread</span>
                      <strong>{odds?.spread?.home_payout ?? odds?.spread?.home ?? "N/A"}</strong>
                    </div>
                  </div>

                  {/* AWAY TEAM */}
                  <div style={oddsTeamCol}>
                    <div style={teamHeader}>{g.away_team}</div>

                    <div style={oddsRow}>
                      <span>Open</span>
                      <strong>{odds?.spread?.value ? `u${odds.spread.value}` : "N/A"}</strong>
                    </div>

                    <div style={oddsRow}>
                      <span>ML</span>
                      <strong>{odds?.moneyline?.away ?? "N/A"}</strong>
                    </div>

                    <div style={oddsRow}>
                      <span>Total</span>
                      <strong>{odds?.total?.value ? `u${odds.total.value}` : "N/A"}</strong>
                    </div>

                    <div style={oddsRow}>
                      <span>Spread</span>
                      <strong>{odds?.spread?.away_payout ?? odds?.spread?.away ?? "N/A"}</strong>
                    </div>
                  </div>
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

      {showInjury && injuryData && (
        <div style={injuryModalOverlay} onClick={() => setShowInjury(false)}>
          <div style={injuryModal} onClick={(e) => e.stopPropagation()}>
            <div style={{ textAlign: "center", marginBottom: 20 }}>
              <img
                src={getTeamLogo("nfl", injuryData.team)}
                alt={injuryData.team}
                style={{
                  width: 80,
                  height: 80,
                  objectFit: "contain",
                  marginBottom: 10
                }}
              />
              <h2 style={{ marginBottom: 5 }}>
                {injuryData.team} — Injuries
              </h2>
              <p style={{ opacity: 0.7 }}>
                Week {injuryData.week} • {injuryData.season}
              </p>
            </div>

            {injuryData.injuries.length === 0 ? (
              <p>No injuries reported.</p>
            ) : (
              injuryData.injuries.map((p) => (
                <div key={p.playerId} style={injuryCard}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div>
                      <strong>{p.name}</strong> — {p.position} #{p.number}
                      <div style={{ fontSize: 13, opacity: 0.8 }}>
                        {p.injury.bodyPart} • {p.injury.status}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}

            <button style={closeBtn} onClick={() => setShowInjury(false)}>
              Close
            </button>
          </div>
        </div>
      )}

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

const injuryBtnRow = {
  display: "flex",
  justifyContent: "space-between",
  gap: 10,
  marginTop: 10,
};



const injuryBtn = {
  flex: 1,
  padding: "8px 10px",
  background: "linear-gradient(90deg, #ff3b3b, #ff6b6b)",
  borderRadius: 6,
  border: "none",
  color: "white",
  cursor: "pointer",
  fontWeight: 600,
  textAlign: "center",
  whiteSpace: "nowrap",
  fontSize: 13,
  transition: "0.2s ease",
};

injuryBtn[":hover"] = {
  opacity: 0.85,
  transform: "translateY(-2px)",
};


const injuryModalOverlay = {
  position: "fixed",
  top: 0,
  left: 0,
  width: "100vw",
  height: "100vh",
  background: "rgba(0,0,0,0.7)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 9999,
};

const injuryModal = {
  background: "#1a1d23",
  padding: 20,
  borderRadius: 12,
  width: "90%",
  maxWidth: 600,
  maxHeight: "80vh",
  overflowY: "auto",
  color: "white",
  border: "1px solid #333",
};

const injuryCard = {
  background: "#23262d",
  borderRadius: 10,
  padding: 12,
  margin: "10px 0",
  border: "1px solid #333",
};

const closeBtn = {
  marginTop: 20,
  width: "100%",
  padding: 10,
  borderRadius: 6,
  background: "#444",
  border: "none",
  color: "white",
  fontWeight: 600,
  cursor: "pointer",
};


const espnOddsBox = {
  marginTop: 10,
  background: "#181b20",
  borderRadius: 10,
  padding: 15,
  border: "1px solid #2b2e34",
};

const oddsSummary = {
  fontSize: 14,
  opacity: 0.8,
  paddingBottom: 10,
  borderBottom: "1px solid #2b2e34",
  marginBottom: 10,
};

const oddsGrid = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: 20,
};

const oddsTeamCol = {
  display: "flex",
  flexDirection: "column",
  gap: 10,
};

const teamHeader = {
  fontWeight: "bold",
  fontSize: 15,
  marginBottom: 5,
};

const oddsRow = {
  display: "flex",
  justifyContent: "space-between",
  background: "#23262d",
  borderRadius: 6,
  padding: "8px 10px",
};
