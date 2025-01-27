/**
 * @typedef {import('./types').League} League
 * @typedef {import('./types').Player} Player
 * @typedef {import('./types').RosterUpdateConfig} RosterUpdateConfig
 */

/**
 * Loads the team roster JSON and updates the table based on the specified season.
 * @param {string} selector
 * @param {RosterUpdateConfig} config
 * @returns {Promise<{league: League, roster: Player[]}>}
 */
async function loadAndDisplayRoster(selector, { year, season, level }) {
  const { leagues, players } = await loadData();

  // Find the current team based on year, season, and level
  const league = leagues.find(
    (league) =>
      league.year === year &&
      league.season.toLowerCase() === season.toLowerCase() &&
      league.level.toLowerCase() === level.toLowerCase()
  );
  if (!league) {
    throw new Error("Current team not found.");
  }

  // Filter players who are in the current team's roster
  const roster = players.filter((player) =>
    league.roster.includes(player.name)
  );

  // Generate and insert table rows for each player
  updateRosterTable(selector, roster, league);

  // This is useful, so we'll return it
  return { league, roster };
}

/**
 * Generates HTML table rows for each player and inserts them into the roster table.
 * @param {string} selector - String selector for the table element.
 * @param {Player[]} players - List of players in the team.
 * @param {League} league
 */
function updateRosterTable(selector, players, league) {
  const table = document.querySelector(selector);
  if (!table) {
    console.error("Roster table not found.");
    return;
  }

  // Wipe all row data but keep the rows themselves
  for (let i = 1; i < table.rows.length; i++) {
    const row = table.rows[i];
    row.innerHTML = `
      <td data-label="photo">
        <img src="/images/000-placeholder.jpg" alt="Placeholder">
      </td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
    `;
  }

  // Update rows (or add a row) for each player
  players.forEach((player, i) => {
    const row = table.rows[i + 1] || table.insertRow(-1);
    const imageURL = `/images/${player.number}-${player.name
      .toLowerCase()
      .replace(/\s+/g, "-")}.jpg`;

    const currentYear = league?.year || new Date().getFullYear();
    let years = currentYear - player.startYear;
    if (player.startYear === currentYear) years = "R";

    const age = player.born ? currentYear - player.born : undefined;

    // note: onerror, we should load images/000-placeholder.jpg
    row.innerHTML = `
      <td data-label="photo">
        <img src="${imageURL}" alt="${
      player.name
    }" onerror="this.onerror=null;this.src='/images/000-placeholder.jpg';">
      </td>
      <td><a href="/player/?player=${player.name.replace(
        " ",
        "%20"
      )}" class="playername">${player.name}</a>${
      player.role === "captain" ? " (team captain)" : ""
    }</td>
      <td>${player.number || "–"}</td>
      <td>${player.pos || "–"}</td>
      <td class="extra">${player.ht || "–"}</td>
      <td class="extra">${player.wt || "–"}</td>
      <td class="extra">${player.shoots || "–"}</td>
      <td class="extra">${years}</td>
      <td class="extra">${age || "-"}</td>
    `;
  });
}
