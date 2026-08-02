//You can edit ALL of the code here
function setup() {
  const allEpisodes = getAllEpisodes();
  const oneEpisode = getOneEpisode();
}

function makePageForEpisodes(episodeList) {
  const rootElem = document.getElementById("root");
  rootElem.textContent = `Got ${episodeList.length} episode(s)`;
}

function displayEpisodeCard(episode) {
  const card = document.getElementById("episode-card").content.cloneNode(true);
  card.querySelector("h3").innerText =
    `${episode.name} - S${String(episode.season).padStart(2, "0")}E${String(episode.number).padStart(2, "0")}`;
  card.querySelector("img").src = episode.image.medium;
  // use regex to remove tags from summary  value in db
  card.querySelector("p").innerText = episode.summary.replace(/<[^>]*>/g, "");
  return card;
}

// test for one episode
const rootElem = document.getElementById("root");
const episodeEl = displayEpisodeCard(getOneEpisode());
root.appendChild(episodeEl);

window.onload = setup;
