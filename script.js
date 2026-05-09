//You can edit ALL of the code here
function setup() {
  const allEpisodes = getAllEpisodes();
  makePageForEpisodes(allEpisodes);
}

function makePageForEpisodes(episodeList) {
  const rootElem = document.getElementById("root");

  // Loop through each episode in the list
  episodeList.forEach((episode) => {
    // create paragraph and add episode name to it, and append to root element
    const paragraph = document.createElement("p");

    // pad the season and episode numbers with leading zeros
    const paddedSeason = episode.season.toString().padStart(2, "0");
    const paddedEpisode = episode.number.toString().padStart(2, "0");
    const episodeCode = `S${paddedSeason}E${paddedEpisode}`;

    // combine the episode code and the name
    paragraph.textContent = `${episodeCode} - ${episode.name}`;

    rootElem.appendChild(paragraph);
  });
}

window.onload = setup;
