// -----------------------------------------------------
// STATE
// -----------------------------------------------------

const state = {
  episodes: getAllEpisodes(),
  searchTerm: "",
  selectedEpisodeCode: "",
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
  card.querySelector("img").src = episode.image.medium;
  card.querySelector("img").alt =
    `Scene from season ${episode.season} episode ${episode.number}, ${episode.name}`;

  // use regex to remove tags from summary  value in db
  card.querySelector("p").innerText = episode.summary.replace(/<[^>]*>/g, "");

  return card;
}

// -----------------------------------------------------
// RENDER
// -----------------------------------------------------
function render() {
  let filteredEpisodes = state.episodes;

  if (state.selectedEpisodeCode) {
    filteredEpisodes = state.episodes.filter(
      (episode) => getEpisodeCode(episode) === state.selectedEpisodeCode,
    );
  } else if (state.searchTerm) {
    const searchTerm = state.searchTerm.toLowerCase();
    filteredEpisodes = state.episodes.filter((episode) => {
      const episodeName = episode.name.toLowerCase();
      const episodeSummary = episode.summary.toLowerCase();

      return (
        episodeName.includes(searchTerm) || episodeSummary.includes(searchTerm)
      );
    });
  }

  const episodeCards = filteredEpisodes.map(displayEpisodeCard);

  //clear out the previous
  const rootElem = document.getElementById("root");
  rootElem.textContent = "";

  //add the newly created cards
  rootElem.append(...episodeCards);

  //display the number of current search match
  const episodeCount = document.getElementById("episode-count");
  episodeCount.textContent = `Displaying ${filteredEpisodes.length} of ${state.episodes.length} episodes`;
}

// -----------------------------------------------------
// EPISODE SELECTOR (dropdown)
// -----------------------------------------------------

function populateEpisodeSelector() {
  const selector = document.getElementById("episode-selector");

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

populateEpisodeSelector();
render();
