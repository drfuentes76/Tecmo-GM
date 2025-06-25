
let teams = [];
let contracts = [];

// Load JSON data
async function loadData() {
  const t = await fetch('teams.json').then(res => res.json());
  const c = await fetch('contracts.json').then(res => res.json());
  teams = t;
  contracts = c;
}

function showPage(page) {
  document.getElementById('gmPage').style.display = page === 'gm' ? 'block' : 'none';
  document.getElementById('gamePage').style.display = page === 'game' ? 'block' : 'none';
  if (page === 'gm') loadData().then(() => updateGM());
}

function returnHome() {
  document.getElementById('gmPage').style.display = 'none';
  document.getElementById('gamePage').style.display = 'none';
}

function updateGM() {
  const content = document.getElementById('gmContent');
  content.innerHTML = '<h3>Teams</h3>' + teams.map(team =>
    `<div><strong>${team.teamName}</strong> (${team.division})
      <ul>${team.players.map(p => `<li>${p.name} - ${p.position} (${p.rating})</li>`).join('')}</ul>
    </div>`).join('');
}

function editTeams() {
  const content = document.getElementById('gmContent');
  content.innerHTML = `
    <h3>Edit Team</h3>
    <label>Team Name: <input type="text" id="newTeamName"></label>
    <button onclick="createTeam()">Add Team</button>
  `;
}

function createTeam() {
  const name = document.getElementById('newTeamName').value;
  if (name) {
    teams.push({ teamName: name, division: "New", players: [] });
    updateGM();
  }
}

function manageContracts() {
  const content = document.getElementById('gmContent');
  content.innerHTML = '<h3>Contracts</h3>' + contracts.map(c =>
    `<div>${c.player} - ${c.years} years / $${c.value}M - ${c.status}</div>`).join('');
}

function tradePlayers() {
  document.getElementById('gmContent').innerText = 'Trade logic interface coming soon.';
}

function releasePlayer() {
  document.getElementById('gmContent').innerText = 'Release logic interface coming soon.';
}

function signPlayer() {
  document.getElementById('gmContent').innerText = 'Signing interface coming soon.';
}


// Salary cap, draft, playoffs, morale, and standings logic placeholder

let salaryCap = 100; // in millions
let standings = [];

function viewSalaryCap() {
  const used = contracts.reduce((sum, c) => sum + c.value, 0);
  document.getElementById('gmContent').innerHTML = 
    `<h3>Salary Cap</h3><p>Cap: $${salaryCap}M<br>Used: $${used}M<br>Remaining: $${salaryCap - used}M</p>`;
}

function viewDraftBoard() {
  document.getElementById('gmContent').innerHTML = 
    '<h3>Draft Board</h3><p>Player draft simulation coming soon. Will allow teams to select from incoming rookies.</p>';
}

function viewPlayoffs() {
  document.getElementById('gmContent').innerHTML = 
    '<h3>Playoff Bracket</h3><p>Playoff system with wildcard and bracket simulation coming soon.</p>';
}

function viewStandings() {
  document.getElementById('gmContent').innerHTML = 
    '<h3>League Standings</h3><p>Standings and win-loss records under development.</p>';
}


async function viewDraftBoard() {
  const rookies = await fetch('draft_class.json').then(res => res.json());
  const content = document.getElementById('gmContent');
  content.innerHTML = '<h3>Draft Class</h3>' + rookies.map(r =>
    `<div>${r.name} - ${r.position} (${r.rating}) - Prefers: ${r.preferredTeam}</div>`).join('');
}

async function viewStandings() {
  const data = await fetch('standings.json').then(res => res.json());
  const content = document.getElementById('gmContent');
  content.innerHTML = '<h3>League Standings</h3>' + data.map(d =>
    `<div>${d.team}: ${d.wins}W - ${d.losses}L</div>`).join('');
}

async function viewHallOfFame() {
  const hof = await fetch('hall_of_fame.json').then(res => res.json());
  const content = document.getElementById('gmContent');
  content.innerHTML = '<h3>Hall of Fame</h3>' + hof.map(p =>
    `<div>${p.name} - ${p.position} (${p.rating})</div>`).join('');
}

function simulateGame() {
  const team1 = standings[0];
  const team2 = standings[1];
  const winner = Math.random() > 0.5 ? team1 : team2;
  const loser = winner === team1 ? team2 : team1;
  winner.wins += 1;
  loser.losses += 1;
  document.getElementById('gmContent').innerHTML = `Game Result: ${winner.team} wins!`;
}


async function viewFreeAgents() {
  const agents = await fetch('free_agents.json').then(res => res.json());
  const content = document.getElementById('gmContent');
  content.innerHTML = '<h3>Free Agents</h3>' + agents.map(p =>
    `<div>${p.name} - ${p.position} (${p.rating}) - Prefers: ${p.preferredTeam}</div>`).join('');
}

function signFromFreeAgents(name, team) {
  const freeIndex = freeAgents.findIndex(p => p.name === name);
  if (freeIndex !== -1) {
    let player = freeAgents[freeIndex];
    let teamObj = teams.find(t => t.teamName === team);
    teamObj.players.push(player);
    freeAgents.splice(freeIndex, 1);
    contracts.push({ player: player.name, team: team, years: 2, value: 5, status: "signed" });
    alert(player.name + " has signed with " + team);
  }
}

async function runDraftPick(team) {
  const rookies = await fetch('draft_class.json').then(res => res.json());
  if (rookies.length === 0) return alert("No rookies available");
  let pick = rookies[0];
  let t = teams.find(t => t.teamName === team);
  t.players.push(pick);
  contracts.push({ player: pick.name, team: team, years: 3, value: 6, status: "signed" });
  document.getElementById('gmContent').innerHTML = `${team} selects ${pick.name}!`;
  rookies.shift();
}

function updateMoraleAndRetirements() {
  teams.forEach(team => {
    team.players = team.players.filter(player => {
      const retire = Math.random() < 0.05;
      if (retire) {
        console.log(`${player.name} retired.`);
      }
      return !retire;
    });
  });
  document.getElementById('gmContent').innerHTML = "End-of-year retirements processed.";
}


function saveFranchise() {
  const state = {
    teams, contracts, salaryCap, standings
  };
  localStorage.setItem("franchiseSave", JSON.stringify(state));
  alert("Game saved!");
}

function loadFranchise() {
  const state = JSON.parse(localStorage.getItem("franchiseSave"));
  if (!state) return alert("No save found.");
  teams = state.teams;
  contracts = state.contracts;
  salaryCap = state.salaryCap;
  standings = state.standings;
  alert("Game loaded!");
  updateGM();
}

function editContract(playerName) {
  const contract = contracts.find(c => c.player === playerName);
  if (!contract) return alert("Contract not found.");
  const newYears = prompt("New contract length (years):", contract.years);
  const newValue = prompt("New contract value (millions):", contract.value);
  contract.years = parseInt(newYears);
  contract.value = parseFloat(newValue);
  alert("Contract updated!");
}

function tradePlayer(playerName, fromTeam, toTeam) {
  let from = teams.find(t => t.teamName === fromTeam);
  let to = teams.find(t => t.teamName === toTeam);
  const idx = from.players.findIndex(p => p.name === playerName);
  if (idx === -1) return alert("Player not found.");
  const player = from.players.splice(idx, 1)[0];
  to.players.push(player);
  const contract = contracts.find(c => c.player === playerName);
  if (contract) contract.team = toTeam;
  alert(`${player.name} traded to ${toTeam}`);
}


async function viewSchedule() {
  const schedule = await fetch('schedule.json').then(res => res.json());
  const content = document.getElementById('gmContent');
  content.innerHTML = '<h3>Season Schedule</h3>' + schedule.map(w =>
    `<div>Week ${w.week}: ${w.matchups.map(m => m[0] + " vs " + m[1]).join('<br>')}</div>`).join('<hr>');
}

async function simulateWeek(weekNum) {
  const schedule = await fetch('schedule.json').then(res => res.json());
  const scoreboard = await fetch('scoreboard.json').then(res => res.json());
  const weekData = schedule.find(w => w.week === weekNum);
  let results = [];

  weekData.matchups.forEach(([teamA, teamB]) => {
    const winner = Math.random() > 0.5 ? teamA : teamB;
    standings.find(t => t.team === winner).wins++;
    const loser = winner === teamA ? teamB : teamA;
    standings.find(t => t.team === loser).losses++;
    results.push(`${winner} defeated ${loser}`);
  });

  scoreboard.find(w => w.week === weekNum).results = results;
  document.getElementById('gmContent').innerHTML = `<h3>Week ${weekNum} Results</h3>` + results.join('<br>');
}

function tradePlayerWithApproval(playerName, fromTeam, toTeam) {
  const from = teams.find(t => t.teamName === fromTeam);
  const to = teams.find(t => t.teamName === toTeam);
  const idx = from.players.findIndex(p => p.name === playerName);
  if (idx === -1) return alert("Player not found.");
  const player = from.players[idx];

  const teamAvg = to.players.reduce((s, p) => s + p.rating, 0) / to.players.length;
  if (player.rating < teamAvg - 5) {
    return alert("Trade rejected by " + toTeam + ": player rating too low.");
  }

  from.players.splice(idx, 1);
  to.players.push(player);
  const contract = contracts.find(c => c.player === player.name);
  if (contract) contract.team = toTeam;
  alert(`${player.name} traded to ${toTeam}`);
}


async function loadNewsTicker() {
  const news = await fetch('news.json').then(res => res.json());
  const ticker = document.getElementById('newsTicker');
  let i = 0;
  setInterval(() => {
    ticker.innerText = news[i % news.length];
    i++;
  }, 4000);
}

window.onload = () => {
  loadNewsTicker();
}
