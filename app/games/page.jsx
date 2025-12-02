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
      const res = await fetch("https://ttb-api.onrender.com/v2/games");
      const json = await res.json();
      setGames(json.games);
      setLoading(false);
    } catch (err) {
      console.error(err);
    }
  }

  // filter logic
  useEffect(() => {
    if (sportFilter === "all") {
      setFiltered(games);
    } else {
      setFiltered(games.filter((g) => g.sport === sportFilter));
    }
  }, [sportFilter, games]);

  useEffect(() => {
    loadGames();
    const interval = setInterval(loadGames, 10000);
    return () => clearInterval(interval);
  }, []);

  if (loading) return <p>Loading games...</p>;

  return (
    <div style={{ padding: 40 }}>
      <h1 style={{ fontSize: 32, marginBottom: 20 }}>Live & Upcoming Games</h1>

      {/* Filters */}
      <div style={{ marginBottom: 20 }}>
        <label style={{ marginRight: 10, fontWeight: "bold" }}>
          Filter by sport:
        </label>
        <select
          value={sportFilter}
          onChange={(e) => setSportFilter(e.target.value)}
          style={{
            padding: 8,
            borderRadius: 6,
            border: "1px solid #ccc",
          }}
        >
          {SPORTS.map((s) => (
            <option key={s} value={s}>
              {s.toUpperCase()}
            </option>
          ))}
        </select>
      </div>

      {/* TABLE VIEW */}
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          marginTop: 10,
        }}
      >
        <thead>
        <tr>
            <th style={th}>Sport</th>
            <th style={th}>Match</th>
            <th style={th}>Date</th>
            <th style={th}>Status</th>
            <th style={th}>Score</th>
            <th style={th}>Odds (ML)</th>
            <th style={th}>Spread</th>
            <th style={th}>Total (O/U)</th>
            <th style={th}>Stadium</th>
            <th style={th}>Weather</th>
        </tr>
        </thead>


        <tbody>
        {filtered.map((g) => {
            const odds = parseJSON(g.odds);
            const stadium = parseJSON(g.stadium);
            const weather = parseJSON(g.weather);

            return (
            <tr key={g.id}>
                <td style={td}>{g.sport.toUpperCase()}</td>

                <td style={td}>{g.home_team} vs {g.away_team}</td>

                <td style={td}>{new Date(g.game_date).toLocaleString("en-US")}</td>

                <td style={td}>{g.status}</td>

                <td style={td}>
                {g.home_score !== null
                    ? `${g.home_team} ${g.home_score} - ${g.away_score} ${g.away_team}`
                    : "Not started"}
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
                    ? `Line: ${odds.spread.value} | Home: ${odds.spread.home_payout} | Away: ${odds.spread.away_payout}`
                    : "N/A"}
                </td>

                {/* TOTAL */}
                <td style={td}>
                {odds?.total
                    ? `Total: ${odds.total.value} | O: ${odds.total.over_payout} | U: ${odds.total.under_payout}`
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
                    ? `${weather.description} | High ${weather.temp_high}° | Low ${weather.temp_low}°`
                    : "N/A"}
                </td>
            </tr>
            );
        })}
        </tbody>


      </table>
    </div>
  );
}

const th = {
  borderBottom: "2px solid #ccc",
  padding: "12px 8px",
  textAlign: "left",
  fontSize: 14,
  fontWeight: 600,
};

const td = {
  borderBottom: "1px solid #eee",
  padding: "10px 8px",
  fontSize: 14,
};
