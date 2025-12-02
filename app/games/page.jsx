"use client";

import { useEffect, useState } from "react";

const SPORTS = ["all", "nfl", "nba", "nhl", "mlb", "cbb", "cfb"];

export default function GamesPage() {
  const [games, setGames] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sportFilter, setSportFilter] = useState("all");

  function parseJSON(value) {
    if (!value) return null;
    if (typeof value === "object") return value;
    try {
      return JSON.parse(value);
    } catch {
      return null;
    }
  }

  async function loadGames() {
    try {
      const res = await fetch("http://localhost:4200/v2/games");
      const json = await res.json();
      setGames(json.games);
      setLoading(false);
    } catch (err) {
      console.error(err);
    }
  }

  useEffect(() => {
    if (sportFilter === "all") setFiltered(games);
    else setFiltered(games.filter((g) => g.sport === sportFilter));
  }, [sportFilter, games]);

  useEffect(() => {
    loadGames();
    const interval = setInterval(loadGames, 10000);
    return () => clearInterval(interval);
  }, []);

  if (loading) return <p>Loading games...</p>;

  return (
    <div style={{ padding: 40, fontFamily: "Inter, sans-serif" }}>
      <h1 style={{ fontSize: 36, fontWeight: 700, marginBottom: 20 }}>
        Live & Upcoming Games
      </h1>

      {/* FILTER BAR */}
      <div style={filterBar}>
        <label style={{ fontWeight: 600, marginRight: 10 }}>Sport:</label>
        <select
          value={sportFilter}
          onChange={(e) => setSportFilter(e.target.value)}
          style={filterDropdown}
        >
          {SPORTS.map((s) => (
            <option key={s} value={s}>
              {s.toUpperCase()}
            </option>
          ))}
        </select>
      </div>

      {/* TABLE */}
      <div style={tableWrapper}>
        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={th}>Sport</th>
              <th style={th}>Match</th>
              <th style={th}>Date</th>
              <th style={th}>Status</th>
              <th style={th}>Score</th>
              <th style={th}>Moneyline</th>
              <th style={th}>Spread</th>
              <th style={th}>Total (O/U)</th>
              <th style={th}>Stadium</th>
              <th style={th}>Weather</th>
            </tr>
          </thead>

          <tbody>
            {filtered.map((g, index) => {
              const odds = parseJSON(g.odds);
              const stadium = parseJSON(g.stadium);
              const weather = parseJSON(g.weather);

              const bg = index % 2 === 0 ? "#fafafa" : "#ffffff"; // Zebra stripes

              return (
                <tr key={g.id} style={{ background: bg }}>
                  <td style={td}>{g.sport.toUpperCase()}</td>

                  <td style={tdBold}>
                    {g.home_team} <span style={{ color: "#888" }}>vs</span>{" "}
                    {g.away_team}
                  </td>

                  <td style={td}>
                    {new Date(g.game_date).toLocaleString("en-US")}
                  </td>

                  <td style={statusBadge(g.status)}>{g.status}</td>

                  <td style={tdScore}>
                    {g.home_score !== null
                      ? `${g.home_team} ${g.home_score} - ${g.away_score} ${g.away_team}`
                      : "—"}
                  </td>

                  {/* MONEYLINE */}
                  <td style={td}>
                    {odds?.moneyline
                      ? `${odds.moneyline.home} / ${odds.moneyline.away}`
                      : "N/A"}
                  </td>

                  {/* SPREAD */}
                  <td style={td}>
                    {odds?.spread
                      ? `Line ${odds.spread.value} | H ${odds.spread.home_payout} | A ${odds.spread.away_payout}`
                      : "N/A"}
                  </td>

                  {/* TOTAL */}
                  <td style={td}>
                    {odds?.total
                      ? `${odds.total.value} | O ${odds.total.over_payout} | U ${odds.total.under_payout}`
                      : "N/A"}
                  </td>

                  {/* STADIUM */}
                  <td style={td}>
                    {stadium
                      ? `${stadium.name} (${stadium.city}, ${stadium.state})`
                      : "N/A"}
                  </td>

                  {/* WEATHER */}
                  <td style={td}>
                    {weather?.description
                      ? `${weather.description}, High ${weather.temp_high}°`
                      : "N/A"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
