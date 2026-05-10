//You can edit ALL of the code here
function setup() {
    const allEpisodes = getAllEpisodes();
    makePageForEpisodes(allEpisodes);
    populateEpisodeSelector(allEpisodes);
}

function makePageForEpisodes(episodeList) {
    const rootElem = document.getElementById("root");

    // Loop through each episode in the list
    episodeList.forEach((episode) => {
        // create a div to hold the episode details
        const episodeDiv = document.createElement("div");
        episodeDiv.classList.add("episode-card");

        // pad the season and episode numbers with leading zeros
        const paddedSeason = episode.season.toString().padStart(2, "0");
        const paddedEpisode = episode.number.toString().padStart(2, "0");
        const episodeCode = `S${paddedSeason}E${paddedEpisode}`;

        // create header with episode name and code
        const title = document.createElement("h2");
        title.classList.add("episode-title");
        title.textContent = `${episode.name} - ${episodeCode}`;
        episodeDiv.appendChild(title);

        // create image element for medium-sized image
        if (episode.image && episode.image.medium) {
            const image = document.createElement("img");
            image.classList.add("episode-image");
            image.src = episode.image.medium;
            episodeDiv.appendChild(image);
        }

        // create element for summary text
        const summary = document.createElement("div");
        summary.classList.add("episode-summary");
        summary.innerHTML = episode.summary;
        episodeDiv.appendChild(summary);

        // append the episode div to root element
        rootElem.appendChild(episodeDiv);
    });
}

function populateEpisodeSelector(episodeList) {
    const epSelector = document.getElementById("episode-selector");
    console.log(epSelector);
    const defaultOpt = document.createElement("option");
    defaultOpt.selected = true;
    defaultOpt.textContent = "-- SELECT AN EPISODE --";
    defaultOpt.value = "";

    const episodeOpts = episodeList.map((episode) => {
        const opt = document.createElement("option");
        const paddedEpisode = episode.number.toString().padStart(2, "0");
        opt.textContent = paddedEpisode + " - " + episode.name;
        opt.value = episode.id;
        return opt;
    });

    epSelector.replaceChildren(defaultOpt, ...episodeOpts);
}

window.onload = setup;
