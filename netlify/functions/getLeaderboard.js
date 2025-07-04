const axios = require('axios');

const BANDIT_API_KEY = process.env.BANDIT_API_KEY;
const STEAM_WEB_API_KEY = process.env.STEAM_WEB_API_KEY;

const STEAM_USERS_URL = 'https://raw.githubusercontent.com/paablooramos/bandit-affiliates-list/main/steamUsers.json';

async function fetchSteamUsers() {
  const res = await axios.get(STEAM_USERS_URL);
  return Array.isArray(res.data) ? res.data : JSON.parse(res.data);
}

async function resolveToSteamID(id) {
  if (/^\d{17}$/.test(id)) return id;
  const r = await axios.get(
    'https://api.steampowered.com/ISteamUser/ResolveVanityURL/v1/',
    { params: { key: STEAM_WEB_API_KEY, vanityurl: id } }
  );
  const resp = r.data.response;
  if (resp.success !== 1) throw new Error(`Vanity "${id}" no válido`);
  return resp.steamid;
}

async function checkAffiliate(steamid) {
  const r = await axios.get(
    'https://api.bandit.camp/affiliates/is-affiliate',
    { params: { steamid }, headers: { Authorization: `Bearer ${BANDIT_API_KEY}` } }
  );
  return r.data.response;
}

async function getWager(steamid) {
  // Aquí se debe usar la API real para obtener lo apostado
  // Por ejemplo, llamando a:
  // https://api.bandit.camp/affiliates/leaderboard?limit=30&start=2025-07-01&end=2025-08-01
  // y filtrando por steamid
  // Por ahora, es un placeholder:
  return Math.floor(Math.random() * 1000);
}

exports.handler = async function(event, context) {
  try {
    const steamUsers = await fetchSteamUsers();

    const results = [];
    for (const { name, id } of steamUsers) {
      try {
        const steamid = await resolveToSteamID(id);
        const affiliate = await checkAffiliate(steamid);
        if (affiliate) {
          const wager = await getWager(steamid);
          results.push({ name, steamid, wager });
        }
      } catch {
        // Ignorar errores por usuario
      }
    }

    results.sort((a, b) => b.wager - a.wager);

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(results),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
