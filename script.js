//You can edit ALL of the code here
// function setup() {
//   const allEpisodes = getAllEpisodes();
//   const oneEpisode = getOneEpisode();
// }

// function makePageForEpisodes(episodeList) {
//   const rootElem = document.getElementById("root");
//   rootElem.textContent = `Got ${episodeList.length} episode(s)`;
// }

// -----------------------------------------------------
// STATE
// -----------------------------------------------------

const state = {
  episodes: getAllEpisodes(),
  searchTerm: "",
};

// -----------------------------------------------------
// MAKE ONE EPISODE CARD
// -----------------------------------------------------
function displayEpisodeCard(episode) {
  // Make a new copy of the HTML template
  const card = document.getElementById("episode-card").content.cloneNode(true);
  // Add the episode name and formatted episode code
  card.querySelector("h3").innerText =
    `${episode.name} - S${String(episode.season).padStart(2, "0")}E${String(episode.number).padStart(2, "0")}`;
  // Add the episode image
  card.querySelector("img").src = episode.image.medium;
  // Add alt text to the image
  card.querySelector("img").alt =
    `Scene from season ${episode.season} episode ${episode.number}, ${episode.name}`;

  // use regex to remove tags from summary  value in db
  card.querySelector("p").innerText = episode.summary.replace(/<[^>]*>/g, "");

  return card;
}

// -----------------------------------------------------
// STEP 2: RENDER
// -----------------------------------------------------
function render() {
  //make search case-insensitive
  const searchTerm = state.searchTerm.toLowerCase();

  //create array that has only episodes where either the episode name OR the summary contains the search term
  const filteredEpisodes = state.episodes.filter((episode) => {
    const episodeName = episode.name.toLowerCase();
    const episodeSummary = episode.summary.toLowerCase();

    return (
      episodeName.includes(searchTerm) || episodeSummary.includes(searchTerm)
    );
  });

  //turn matching episode cards to a html card
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

// // test for one episode
// const rootElem = document.getElementById("root");
// const allEpisodesCards = getAllEpisodes().map((episode) =>
//   displayEpisodeCard(episode),
// );
// rootElem.append(...allEpisodesCards);

// -----------------------------------------------------
// REACT TO EVENTS
// -----------------------------------------------------
//get the search input from the DOM
const searchInput = document.getElementById("search-input");

//add event listener
searchInput.addEventListener("input", handleSearchInput);

//implement handleSearchInput
function handleSearchInput(event) {
  const searchTerm = event.target.value;
  state.searchTerm = searchTerm;
  //change of state- redo the page
  render();
}

render();
// window.onload = setup;
