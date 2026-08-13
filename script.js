// -----------------------------------------------------
// STATE
// -----------------------------------------------------

const state = {
  shows: [],
  episodes: [],
  selectedShowId: "",
  searchTerm: "",
  selectedEpisodeCode: "",
  isLoading: true,
  error: null,
  episodeCache: {},
};

// -----------------------------------------------------
// DOM ELEMENTS
// -----------------------------------------------------
const episodeSelector = document.getElementById("episode-selector");
const searchInput = document.getElementById("search-input");
const clearSearchBtn = document.getElementById("clear-search-btn");
const showSelector = document.getElementById("show-selector");

// -----------------------------------------------------
// FETCH API DATA
// -----------------------------------------------------

const fetchAllShows = async () => {
  const response = await fetch("https://api.tvmaze.com/shows");
  if (!response.ok) {
    throw new Error(`HTTP error ${response.status} (${response.statusText})`);
  }
  return await response.json();
};

const fetchAllEpisodes = async (showId) => {
  const response = await fetch(
    `https://api.tvmaze.com/shows/${showId}/episodes`,
  );
  if (!response.ok) {
    throw new Error(`HTTP error ${response.status} (${response.statusText})`);
  }
  return await response.json();
};

// -----------------------------------------------------
// HELPER: implement episode code function
// -----------------------------------------------------
function getEpisodeCode(episode) {
  const season = String(episode.season).padStart(2, "0");
  const number = String(episode.number).padStart(2, "0");
  return `S${season}E${number}`;
}

// -----------------------------------------------------
// MAKE ONE EPISODE CARD
// -----------------------------------------------------
function displayEpisodeCard(episode) {
  const card = document.getElementById("episode-card").content.cloneNode(true);
  const episodeCode = getEpisodeCode(episode);

  card.querySelector("section").id = episodeCode;
  card.querySelector("h3").innerText = `${episode.name} - ${episodeCode}`;
  card.querySelector("img").src = episode.image?.medium || ""; // set default empty string if no image
  card.querySelector("img").alt =
    `Scene from season ${episode.season} episode ${episode.number}, ${episode.name}`;

  // use regex to remove tags from summary  value in db and set default empty string if no summary
  card.querySelector("p").innerText = (episode.summary || "").replace(
    /<[^>]*>/g,
    "",
  );

  return card;
}

// -----------------------------------------------------
// RENDER
// -----------------------------------------------------
function render() {
  const rootElem = document.getElementById("cards-container");
  const episodeCount = document.getElementById("episode-count");

  rootElem.textContent = "";

  //show error state if something goes wrong with API call
  //TODO: make error message look nicer with a big icon (and a button to try again, maybe?)
  if (state.error) {
    // TODO:  possible change episodeCount name and element id for multiple purposes (count, loading, error, message...)
    episodeCount.textContent = "Error loading data";
    const errorElem = document.createElement("div");
    errorElem.className = "status-message error";
    errorElem.innerHTML = `
      <p>⚠️ Failed to load episodes: ${state.error}.</p>
    `;
    rootElem.append(errorElem);
    return;
  }

  // show loading state while API call is in progress
  // TODO: Make it look nicer with a spinner

  if (state.isLoading) {
    episodeCount.textContent = "Loading episodes...";
    const loadingElem = document.createElement("div");
    loadingElem.className = "status-message loading";
    loadingElem.innerHTML = `
      <p>Loading episodes, please wait...</p>
    `;
    rootElem.append(loadingElem);
    return;
  }

  let filteredEpisodes = state.episodes;

  if (state.selectedEpisodeCode) {
    filteredEpisodes = state.episodes.filter(
      (episode) => getEpisodeCode(episode) === state.selectedEpisodeCode,
    );
  } else if (state.searchTerm) {
    const searchTerm = state.searchTerm.toLowerCase();
    filteredEpisodes = state.episodes.filter((episode) => {
      const episodeName = episode.name.toLowerCase();
      const episodeSummary = (episode.summary || "").toLowerCase();

      return (
        episodeName.includes(searchTerm) || episodeSummary.includes(searchTerm)
      );
    });
  }

  const episodeCards = filteredEpisodes.map(displayEpisodeCard);

  //add the newly created cards
  rootElem.append(...episodeCards);

  //display the number of current search match
  episodeCount.textContent = `Displaying ${filteredEpisodes.length} of ${state.episodes.length} episodes`;
}

// -----------------------------------------------------
// SHOW SELECTOR (dropdown)
// -----------------------------------------------------
function populateShowSelector() {
  // Loop through every show and add it as an <option>
  state.shows.forEach((show) => {
    const option = document.createElement("option");
    option.value = show.id;
    option.textContent = show.name;

    showSelector.append(option);
  });
}
// -----------------------------------------------------
// EPISODE SELECTOR (dropdown)
// -----------------------------------------------------

function populateEpisodeSelector() {
  //clear prvious options except the placeholder
  episodeSelector.innerHTML = `
  <option value="placeholder" disabled selected hidden>All episodes or Select...</option>
  <option value="">All episodes or Select...</option>
  `;
  // Loop through every episode and add it as an <option>
  state.episodes.forEach((episode) => {
    const episodeCode = getEpisodeCode(episode);

    const option = document.createElement("option");
    option.value = episodeCode;
    option.textContent = `${episodeCode} - ${episode.name}`;

    episodeSelector.append(option);
  });
}

// -----------------------------------------------------
// REACT TO EVENTS
// -----------------------------------------------------

searchInput.addEventListener("input", handleSearchInput);

function handleSearchInput(event) {
  const searchTerm = event.target.value;
  state.searchTerm = searchTerm;
  state.selectedEpisodeCode = ""; // Reset selector state

  if (searchTerm) {
    episodeSelector.value = "placeholder"; // Set to hidden placeholder
    clearSearchBtn.style.display = "inline-block";
  } else {
    episodeSelector.value = "placeholder"; // Reset back to default
    clearSearchBtn.style.display = "none";
  }

  //change of state- redo the page
  render();
}

// -----------------------------------------------------
// ADD SHOW SELECTOR LISTENER AND HANDLER
// -----------------------------------------------------

showSelector.addEventListener("change", handleShowSelect);

async function handleShowSelect(event) {
  const showId = event.target.value;
  if (showId === "placeholder") return;

  //update JS state
  state.searchTerm = "";
  state.selectedEpisodeCode = "";

  //Reset UI elements
  searchInput.value = "";
  episodeSelector.value = "placeholder";
  clearSearchBtn.style.display = "none";

  //Check if episodes have been fetched yet for this show
  if (state.episodeCache[showId]) {
    state.episodes = state.episodeCache[showId];
    populateEpisodeSelector();
    render();
    //if no cache exists => fetch from the API
  } else {
    state.isLoading = true;
    state.error = null;
    render();

    try {
      const episodes = await fetchAllEpisodes(showId);
      //store episodes in cache
      state.episodeCache[showId] = episodes;
      state.episodes = episodes;
      state.isLoading = false;

      populateEpisodeSelector();
      render();
      //handle errors from API
    } catch (error) {
      state.isLoading = false;
      state.error = error.message || "An unexpected error occurred";
      render();
    }
  }
}

// episode selector
episodeSelector.addEventListener("change", handleEpisodeSelect);

function handleEpisodeSelect(event) {
  const selectedCode = event.target.value;
  if (selectedCode === "placeholder") return;

  state.selectedEpisodeCode = selectedCode;
  state.searchTerm = ""; // Reset search term
  searchInput.value = ""; // Reset search input visually
  clearSearchBtn.style.display = "none";

  render();
}

clearSearchBtn.addEventListener("click", () => {
  searchInput.value = "";
  state.searchTerm = "";
  episodeSelector.value = "placeholder"; // Reset dropdown visually
  clearSearchBtn.style.display = "none";
  render();
});

// -----------------------------------------------------
// INITIALISE THE PAGE
// -----------------------------------------------------
render(); // Render loading state immediately while fetching

fetchAllShows()
  .then(async (shows) => {
    // Sort shows alphabetically once and store in state
    state.shows = shows.sort((a, b) =>
      a.name.localeCompare(b.name, "en", { sensitivity: "base" }),
    );
    populateShowSelector();

    // Pick the first show for the default
    if (state.shows.length > 0) {
      const defaultShow = state.shows[0];
      state.selectedShowId = defaultShow.id;

      // Update dropdown selection in UI
      showSelector.value = defaultShow.id;

      // Fetch and cache episodes for default show
      const episodes = await fetchAllEpisodes(defaultShow.id);
      state.episodeCache[defaultShow.id] = episodes;
      state.episodes = episodes;
    }

    state.isLoading = false;
    populateEpisodeSelector();
    render();
  })
  .catch((error) => {
    state.isLoading = false;
    state.error = error.message || "An unexpected error occurred";
    render();
  });
