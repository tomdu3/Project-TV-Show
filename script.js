// -----------------------------------------------------
// STATE
// -----------------------------------------------------

const state = {
  shows: [],
  episodes: [],
  searchTerm: "",
  selectedEpisodeCode: "",
  isLoading: true,
  error: null,
  episodeCache: {},
};

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
  const rootElem = document.getElementById("root");
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
  const selector = document.getElementById("show-selector");

  //sort alphabetically and case-insensitively
  const sortedShows = [...stateShows].sort((a, b) =>
    a.name.localeCompare(b.name, "en", { sensitivity: "base" }),
  );

  // Loop through every episode and add it as an <option>
  sortedShows.forEach((show) => {
    const option = document.createElement("option");
    option.value = show.id;
    option.textContent = show.name;

    selector.append(option);
  });
}
// -----------------------------------------------------
// EPISODE SELECTOR (dropdown)
// -----------------------------------------------------

function populateEpisodeSelector() {
  const selector = document.getElementById("episode-selector");

  //clear prvious options except the placeholder
  selector.innerHTML = `
  <option value="placeholder" disabled selected hidden>All episodes or Select...</option>
  <option value="">All episodes or Select...</option>
  `;
  // Loop through every episode and add it as an <option>
  state.episodes.forEach((episode) => {
    const episodeCode = getEpisodeCode(episode);

    const option = document.createElement("option");
    option.value = episodeCode;
    option.textContent = `${episodeCode} - ${episode.name}`;

    selector.append(option);
  });
}

// -----------------------------------------------------
// REACT TO EVENTS
// -----------------------------------------------------

const searchInput = document.getElementById("search-input");
const clearSearchBtn = document.getElementById("clear-search-btn");

searchInput.addEventListener("input", handleSearchInput);

function handleSearchInput(event) {
  const searchTerm = event.target.value;
  state.searchTerm = searchTerm;
  state.selectedEpisodeCode = ""; // Reset selector state

  if (searchTerm) {
    document.getElementById("episode-selector").value = "placeholder"; // Set to hidden placeholder
    clearSearchBtn.style.display = "inline-block";
  } else {
    document.getElementById("episode-selector").value = "placeholder"; // Reset back to default
    clearSearchBtn.style.display = "none";
  }

  //change of state- redo the page
  render();
}

// episode selector
const episodeSelector = document.getElementById("episode-selector");
episodeSelector.addEventListener("change", handleEpisodeSelect);

function handleEpisodeSelect(event) {
  const selectedCode = event.target.value;
  if (selectedCode === "placeholder") return;

  state.selectedEpisodeCode = selectedCode;
  state.searchTerm = ""; // Reset search term
  document.getElementById("search-input").value = ""; // Reset search input visually
  clearSearchBtn.style.display = "none";

  render();
}

clearSearchBtn.addEventListener("click", () => {
  searchInput.value = "";
  state.searchTerm = "";
  document.getElementById("episode-selector").value = "placeholder"; // Reset dropdown visually
  clearSearchBtn.style.display = "none";
  render();
});

// Initialize the page
render(); // Render loading state immediately while fetching

fetchAllEpisodes()
  .then((episodes) => {
    state.isLoading = false;
    state.episodes = episodes;
    populateEpisodeSelector();
    render();
  })
  .catch((err) => {
    state.isLoading = false;
    state.error = err.message || "An unexpected error occurred.";
    render();
  });
