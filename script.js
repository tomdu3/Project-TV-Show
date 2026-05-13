import { fetchShows, fetchEpisodes } from "./fetchTVData.js";

// store frequently accessed elements
const elements = {
    episodesContainer: document.getElementById("root"),
    episodeSelector: document.getElementById("episode-selector"),
    episodeSearch: document.getElementById("episode-search"),
    showSelector: document.getElementById("show-selector"),
};

// cache data to avoid repeated API calls
const cache = {
    shows: [],
    episodes: {},
};

async function setup() {
    // cache shows on setup
    await cacheShows();
    populateShowSelector();
    initShowSelectListener();
}

// on page load, cache the shows. Only need to fetch shows once
async function cacheShows() {
    try {
        elements.episodesContainer.innerHTML =
            "<h2>Data is being fetched from the API, please wait...</h2>";
        cache.shows = await fetchShows();
        elements.episodesContainer.innerHTML =
            "<h2>To see list of episodes, select a show.</h2>";
    } catch (error) {
        console.error("Failed to fetch episodes:", error);
        elements.episodesContainer.innerHTML =
            "<h2 style='color: red;'>Sorry, the show data couldn't be fetched from the API at this time. Please try again later.</h2>";
    }
}

// given a show ID, returns all episodes of the show
// first checks cache
// if not in cache, fetches from API, and stores in cache.
// throws error if episodes cannot be fetched
async function getEpisodes(showId) {
    return (cache.episodes[showId] ??= await fetchEpisodes(showId));
}

// when show is selected from drop down
// fetches all episodes of show, displays them on page
// updates episode selector and search input to match selected show
async function initShowSelectListener() {
    elements.showSelector.addEventListener("change", async (e) => {
        const showId = e.target.value;

        if (showId !== "") {
            try {
                const episodes = await getEpisodes(showId);
                makePageForEpisodes(episodes);
                populateEpisodeSelector(episodes);
                initEpisodeSelectListener(episodes);
                initSearchEpisodes(episodes);
            } catch (error) {
                console.error("Failed to fetch episodes:", error);
                elements.episodesContainer.innerHTML =
                    "<h2 style='color: red;'>Sorry, the episode data couldn't be fetched from the API at this time. Please try again later.</h2>";
            }
        } else {
            elements.episodesContainer.innerHTML =
                "<h2>To see list of episodes, select a show.</h2>";
        }
    });
}

function makePageForEpisodes(episodeList) {
    clearContainer(); // clear the container of episode cards first

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
        elements.episodesContainer.appendChild(episodeDiv);
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

function populateShowSelector(showList) {
    const defaultOpt = document.createElement("option");
    defaultOpt.selected = true;
    defaultOpt.textContent = "-- SELECT A SHOW --";
    defaultOpt.value = "";
    const showOpts = cache.shows.map((show) => {
        const opt = document.createElement("option");
        opt.textContent = show.name;
        opt.value = show.id;
        return opt;
    });

    elements.showSelector.replaceChildren(defaultOpt, ...showOpts);
}

function initEpisodeSelectListener(episodeList) {
    elements.episodeSelector.onchange = (e) => {
        const val = e.target.value;

        // clear the search bar when a selection is made
        elements.episodeSearch.value = "";

        // remove all children of the cards container, so that only a single card can be displayed
        clearContainer();

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

// utility function to clear the episode container
function clearContainer() {
    while (elements.episodesContainer.firstChild) {
        elements.episodesContainer.removeChild(
            elements.episodesContainer.firstChild,
        );
    }
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
