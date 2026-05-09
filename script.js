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
    paragraph.textContent = episode.name;
    rootElem.appendChild(paragraph);
  });
}

window.onload = setup;
