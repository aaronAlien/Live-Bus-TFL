// get api key
const getKey = () => {
  const appId = process.env.VITE_TFL_APP_ID || import.meta.env.VITE_TFL_APP_ID;
  const apiKey =
    process.env.VITE_TFL_APP_KEY || import.meta.env.VITE_TFL_APP_KEY;
  if (!apiKey || !appId) {
    console.error("TFL id or key not found");
    // return null for fail
    return null;
  }
  return { app_id: appId, app_key: apiKey };
};

// call tfl api
const BASE_URL = "https://api.tfl.gov.uk";

async function apiRequest(endpoint, params = {}) {
  try {
    // use apiKey
    const keys = getKey();
    if (!keys) throw new Error("Configuration error");

    const queryParams = new URLSearchParams({
      ...params,
      app_id: keys.app_id,
      app_key: keys.app_key,
    }).toString();

    const url = `${BASE_URL}${endpoint}?${queryParams}`;
    const response = await fetch(url);

    if (!response.ok) {
      // errors
      if (response.status === 404) {
        throw new Error("Resource not found.");
      } else if (response.status === 403) {
        throw new Error("Authentication failed.");
      } else {
        throw new Error(`API error: ${response.status}`);
      }
    }

    return await response.json();
  } catch (error) {
    console.error(`TFL API error (${endpoint}):`, error);
    throw error;
  }
}

// get buses by stop code
export async function fetchStopCode(code) {
  try {
    // inputs
    if (!code || typeof code !== "string") {
      throw new Error("Enter a valid bus top code. (5 numbers)");
    }

    // clean input
    const cleanStopCode = code.trim().toUpperCase();

    if (cleanStopCode.length < 4) {
      throw new Error("Enter a valid bus top code. (5 numbers)");
    }

    // find bus stop
    const searchApi = await apiRequest(`/StopPoint/Search`, {
      query: cleanStopCode,
      mode: "bus",
    });

    //console.log("Search result:", searchApi);

    // matches
    if (!searchApi || !searchApi.matches || searchApi.matches.length === 0) {
      // stop not found
      return null;
    }

    // best match
    const bestMatch = searchApi.matches[0];

    // stop info
    const stopInfo = await apiRequest(`/StopPoint/${bestMatch.id}`);
    //console.log("stop info:", stopInfo);
    return stopInfo;
  } catch (error) {
    throw new Error(`Error searching for bus stop: ${error.message}`);
  }
}

// get live arrivals
export async function fetchLiveArrivals(stopId) {
  try {
    if (!stopId) {
      throw new Error("Enter a valid bus stop ID.");
    }

    const data = await apiRequest(`/StopPoint/${stopId}/Arrivals`);

    // sort timing
    return data.sort((a, b) => {
      //console.log("Sorting arrivals:", a, b);
      return new Date(a.expectedArrival) - new Date(b.expectedArrival);
    });
  } catch (error) {
    throw new Error(`Error fetching live arrivals: ${error.message}`);
  }
}
