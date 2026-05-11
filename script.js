// store frequently accessed elements
const elements = {
    episodesContainer: document.getElementById("root"),

    episodeSelector: document.getElementById("episode-selector"),
    episodeSearch: document.getElementById("episode-search"),
};

// fetch all episodes from the api and display them
async function setup() {
    elements.episodesContainer.innerHTML = "<h2>Data is being fetched from the API, please wait...</h2>";

    try {
        const response = await fetch("https://api.tvmaze.com/shows/82/episodes");

        // parse the json response
        const allEpisodes = await response.json();

        // clear the loading message
        while (elements.episodesContainer.firstChild) {
            elements.episodesContainer.removeChild(
                elements.episodesContainer.firstChild,
            );
        }

        makePageForEpisodes(allEpisodes);
        populateEpisodeSelector(allEpisodes);

        initEpisodeSelectListener(allEpisodes);
        initSearchEpisodes(allEpisodes);
    } catch (error) {
        console.error("Failed to fetch episodes:", error);
        elements.episodesContainer.innerHTML =
            "<h2 style='color: red;'>Sorry, the data couldn't be fetched from the API at this time. Please try again later.</h2>";
    }
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

    elements.episodeSelector.replaceChildren(defaultOpt, ...episodeOpts);
}

function initEpisodeSelectListener(episodeList) {
    elements.episodeSelector.onchange = (e) => {
        const val = e.target.value;

        // clear the search bar when a selection is made
        elements.episodeSearch.value = "";

        // remove all children of the cards container, so that only a single card can be displayed
        while (elements.episodesContainer.firstChild) {
            elements.episodesContainer.removeChild(
                elements.episodesContainer.firstChild,
            );
        }

        if (val === "") {
            makePageForEpisodes(episodeList);
        } else {
            const filtered = episodeList.filter(
                (ep) => ep.id === Number(e.target.value),
            );

            makePageForEpisodes(filtered);
        }
    };
}

function initSearchEpisodes(episodeList) {
    elements.episodeSearch.oninput = (e) => {
        const searchStr = e.target.value.toLowerCase();
        const filtered = episodeList.filter(
            (ep) =>
                ep.name.toLowerCase().includes(searchStr) ||
                ep.summary.toLowerCase().includes(searchStr),
        );

        while (elements.episodesContainer.firstChild) {
            elements.episodesContainer.removeChild(
                elements.episodesContainer.firstChild,
            );
        }

        makePageForEpisodes(filtered);
    };
}
window.onload = setup;
