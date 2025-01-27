// RiotApiHandler.js
import axios from 'axios';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const RIOT_API_BASE_URL = 'https://europe.api.riotgames.com';
const RIOT_API_KEY = process.env.RIOT_API_KEY; // Ensure this is set in your .env file

if (!RIOT_API_KEY) {
  console.error('RIOT_API_KEY is not set in .env');
  process.exit(1);
}

// Axios instance for Riot API
const riotApiClient = axios.create({
  baseURL: RIOT_API_BASE_URL,
  headers: {
    'X-Riot-Token': RIOT_API_KEY,
  },
});

// Fetch PUUID and summonerID from RiotID
export const getPuuidByRiotId = async (gameName, tagLine) => {
  try {
    const response = await riotApiClient.get(
      `/riot/account/v1/accounts/by-riot-id/${encodeURIComponent(gameName)}/${encodeURIComponent(tagLine)}`
    );
    return response.data; // Contains PUUID and account information
  } catch (error) {
    console.error('Error fetching account by Riot ID:', error.response?.data || error.message);
    throw error;
  }
};


// Fetch summoner data by PUUID
export const getSummonerByPuuid = async (puuid) => {
  try {
    const response = await riotApiClient.get(`/lol/summoner/v4/summoners/by-puuid/${puuid}`);
    return response.data; // Contains summonerID and other summoner data
  } catch (error) {
    console.error('Error fetching summoner by PUUID:', error.response?.data || error.message);
    throw error;
  }
};

// Fetch Riot ID by PUUID
export const getRiotIdByPuuid = async (puuid) => {
  try {
    const response = await riotApiClient.get(`/riot/account/v1/accounts/by-puuid/${puuid}`);
    return response.data; // Contains gameName and tagLine
  } catch (error) {
    console.error('Error fetching account by PUUID:', error.response?.data || error.message);
    throw error;
  }
};

// Fetch summoner data by summonerID
export const getSummonerBySummonerId = async (summonerId) => {
  try {
    const response = await riotApiClient.get(`/lol/summoner/v4/summoners/${summonerId}`);
    return response.data; // Contains PUUID and other summoner data
  } catch (error) {
    console.error('Error fetching summoner by summoner ID:', error.response?.data || error.message);
    throw error;
  }
};

// Fetch match data by matchID
export const getMatchByMatchId = async (matchId) => {
  try {
    const response = await riotApiClient.get(`/lol/match/v5/matches/${matchId}`);
    return response.data; // Contains match details
  } catch (error) {
    console.error('Error fetching match by match ID:', error.response?.data || error.message);
    throw error;
  }
};

// Fetch list of matches by PUUID
export const getMatchesByPuuid = async (puuid, start = 0, count = 20) => {
  try {
    const response = await riotApiClient.get(
      `/lol/match/v5/matches/by-puuid/${puuid}/ids`,
      {
        params: { start, count },
      }
    );
    return response.data; // List of match IDs
  } catch (error) {
    console.error('Error fetching matches by PUUID:', error.response?.data || error.message);
    throw error;
  }
};

// Example usage (uncomment for testing)
// (async () => {
//   try {
//     const account = await getAccountByRiotId('gameNameExample', 'tagLineExample');
//     console.log('Account Info:', account);
//   } catch (error) {
//     console.error(error);
//   }
// })();
