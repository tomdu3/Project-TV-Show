//You can edit ALL of the code here
function setup() {
  const allEpisodes = getAllEpisodes();
  const oneEpisode = getOneEpisode();
  makePageForEpisodes(allEpisodes);
}

function makePageForEpisodes(episodeList) {
  const rootElem = document.getElementById("root");
  rootElem.textContent = `Got ${episodeList.length} episode(s)`;
}

function displayEpisodeCard(episode) {
  const cardEpisode = document.createElement("section");
  cardEpisode.classList.add("card", "episode");
  const title = document.createElement("h2");
  title.classList.add("title", "episode");
  const episodeCode = document.createElement("p");
  episodeCode.classList.add("code", "episode");
  const image = document.createElement("img");
  image.classList.add("image", "episode");
  const summary = document.createElement("p");
  summary.classList.add("summary", "episode");

  title.innerText = episode.name;
  episodeCode.innerText = `S${String(episode.season).padStart(2, "0")}E${String(episode.number).padStart(2, "0")}`;
  image.src = episode.image.medium;
  // use regex to remove tags from summary  value in db
  summary.innerText = episode.summary.replace(/<[^>]*>/g, "");

  cardEpisode.appendChild(title);
  cardEpisode.appendChild(episodeCode);
  cardEpisode.appendChild(image);
  cardEpisode.appendChild(summary);
  return cardEpisode;
}

// test for one episode
const details = document.getElementById("details");
const episodeEl = displayEpisodeCard(getOneEpisode());
details.appendChild(episodeEl);

window.onload = setup;
