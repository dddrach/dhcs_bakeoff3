// As always, we add our parts within a "load" event to make sure the HTML stuff has loaded first. 
window.addEventListener("load", (e) => {
    // Store different "pages" we open so that we can toggle them visible/invisible
    const searchPage = document.getElementById("searchPage");
    const resultsPage = document.getElementById("resultsPage");
    const toResultsButton = document.getElementById("goToResults");
    const toSearchButton = document.getElementById("backToSearch");

    const checkoutPage = document.getElementById("checkoutPage");
    const checkoutSummary = document.getElementById("checkoutSummary");
    const backToResultsButton = document.getElementById("backToResults");

    const numberOfTicketsTextBox = document.getElementById("numberOfTickets");
    const userNameTextBox = document.getElementById("userName");
    const submitButton = document.getElementById("submitButton");

    const trial = new Trial("DANG");
    // getMovies is a function defined by the framework script. It will return a list of movies (in no guaranteed order). Each movie will be an object shaped like this:
    // {
    // 		title: string,
    // 		movieTimes: list of movie start times, represented as a 24-hour time string (https://developer.mozilla.org/en-US/docs/Web/HTML/Date_and_time_formats#time_strings) like "16:00",
    //  	movieLength: number (in minutes),
    // 		genres: list of strings,
    //  	description: string,
    //  	actors: list of strings
    // 	}

    const movies = trial.getMovies();
    const keywordSearch = document.getElementById("keywordSearch");
    let selectedMovie;

    // =======================================================================>
    // SEARCH PAGE: Select keywords, genre, and time, then click search
    // =======================================================================>

    function timeStringToMinutes(timeStr) {
        const [h, m] = timeStr.split(":").map(Number);
        return h * 60 + m;
    }

    function minutesToAmPm(minutes) {
        const h24 = Math.floor(minutes / 60);
        const m = minutes % 60;
        const period = h24 >= 12 ? "PM" : "AM";
        let h12 = h24 % 12;
        if (h12 === 0) h12 = 12;
        return `${h12}:${m.toString().padStart(2, "0")} ${period}`;
    }

    function createTimeDropdown(element) {

        for (let mins = 0; mins < 24 * 60; mins += 30) {
            const opt = document.createElement("option");
            opt.value = mins;
            opt.innerText = minutesToAmPm(mins);
            element.appendChild(opt);
        }
    }

    const genreDropdown = document.getElementById("genreDropdown");
    const genreSelect  = document.getElementById("genreSelect");
    const excludeGenreDropdown = document.getElementById("excludeGenreDropdown");
    const excludeGenreSelect = document.getElementById("excludeGenreSelect");   
    const startTimeSelect = document.getElementById("startTimeSelect");
    const endTimeSelect = document.getElementById("endTimeSelect");

    // Build the genre and time dropdowns from all genres and times in the movie list
    const genreSet = new Set();
    const startTimeSet = new Set();
    const endTimeSet = new Set();

    createTimeDropdown(startTimeSelect);
    createTimeDropdown(endTimeSelect);

    movies.forEach((movie) => { // Add all movie genres and times to genreSet and timeSet, respectively
        console.log(movie)
        movie.genres.forEach((genre) => {
            genreSet.add(genre);
        });
    });

    genreSet.forEach((genre) => {
        // Include panel
        const includeLabel = document.createElement("label");
        const includeCheckbox = document.createElement("input");
        includeCheckbox.type = "checkbox";
        includeCheckbox.value = genre;
        includeCheckbox.addEventListener("change", updategenreDropdownLabel);
        includeLabel.appendChild(includeCheckbox);
        includeLabel.appendChild(document.createTextNode(" " + genre));
        genreSelect.appendChild(includeLabel);

        // Exclude panel
        const excludeLabel = document.createElement("label");
        const excludeCheckbox = document.createElement("input");
        excludeCheckbox.type = "checkbox";
        excludeCheckbox.value = genre;
        excludeCheckbox.addEventListener("change", updateExcludeGenreDropdownLabel);
        excludeLabel.appendChild(excludeCheckbox);
        excludeLabel.appendChild(document.createTextNode(" " + genre));
        excludeGenreSelect.appendChild(excludeLabel);
        });

    // Keep the button label in sync with what's checked.
    function updategenreDropdownLabel() {
        const checked = genreSelect.querySelectorAll("input:checked");
        if (checked.length === 0)      genreDropdown.textContent = "All genres";
        else if (checked.length === 1) genreDropdown.textContent = checked[0].value;
        else                           genreDropdown.textContent = checked.length + " genres selected";
    }

    // Toggle the panel; stop propagation so the document-level listener below
    // doesn't immediately close it on the same click.
    genreDropdown.addEventListener("click", (e) => {
        e.stopPropagation();
        genreSelect.classList.toggle("hidden");
    });

    // Click outside → close.
    document.addEventListener("click", (e) => {
        if (!genreSelect.contains(e.target) && e.target !== genreDropdown) {
            genreSelect.classList.add("hidden");
        }
    });

    function getSelectedGenres() {
        return Array.from(genreSelect.querySelectorAll("input:checked"))
                    .map((cb) => cb.value);
    }

    function updateExcludeGenreDropdownLabel() {
        const checked = excludeGenreSelect.querySelectorAll("input:checked");
        if (checked.length === 0)      excludeGenreDropdown.textContent = "No exclusions";
        else if (checked.length === 1) excludeGenreDropdown.textContent = "Excluding: " + checked[0].value;
        else                           excludeGenreDropdown.textContent = "Excluding " + checked.length + " genres";
    }

    excludeGenreDropdown.addEventListener("click", (e) => {
        e.stopPropagation();
        excludeGenreSelect.classList.toggle("hidden");
    });

    document.addEventListener("click", (e) => {
        if (!excludeGenreSelect.contains(e.target) && e.target !== excludeGenreDropdown) {
            excludeGenreSelect.classList.add("hidden");
        }
    });

    function getExcludedGenres() {
        return Array.from(excludeGenreSelect.querySelectorAll("input:checked"))
                    .map((cb) => cb.value);
    }

    // When SEARCH button is clicked, save all info (keyword, genre, time)
    toResultsButton.addEventListener("click", () => {
        const keyword = keywordSearch.value.toLowerCase().trim();
        const selectedGenres = getSelectedGenres();
        const excludedGenres = getExcludedGenres();
        const selectedStartTime = startTimeSelect.value === "" ? null : parseInt(startTimeSelect.value, 10);
        const selectedEndTime   = endTimeSelect.value   === "" ? null : parseInt(endTimeSelect.value, 10);

        // Save the user's search inputs for the next page
        const searchData = {
            keyword: keyword,
            genres: selectedGenres,
            excludedGenres: excludedGenres,
            startTime: selectedStartTime,
            endTime: selectedEndTime
        };

        localStorage.setItem("movieSearchData", JSON.stringify(searchData));
        console.log(searchData)

        // Render the scrollable movie list based on settings
        const filteredMovies = getFilteredMovies(keyword, selectedGenres, excludedGenres, selectedStartTime, selectedEndTime);
        renderMovieList(filteredMovies);

        // Hide search "page" and display movie results "page"
        searchPage.classList.add("hidden");
        resultsPage.classList.remove("hidden");
    });

    // =======================================================================>
    // RESULTS PAGE: Scroll through movies that match settings
    // =======================================================================>
    
    const movieList = document.getElementById("movieList");

    function getMatchingShowtimes(movie, startTime, endTime) {
        return movie.movieTimes.filter((timeStr) => {
            const showStart = timeStringToMinutes(timeStr);
            const showEnd = showStart + movie.movieLength;
            const afterStart = startTime === null || showStart >= startTime;
            const beforeEnd  = endTime   === null || showEnd   <= endTime;
            return afterStart && beforeEnd;
        });
    }

    // Filter movie list based on keyword, genre, and selected time
    function getFilteredMovies(keyword, selectedGenres, excludedGenres, selectedStartTime, selectedEndTime) {
        return movies.filter((movie) => {
            const matchesKeyword =
                keyword === "" ||
                movie.title.toLowerCase().includes(keyword) ||
                movie.description.toLowerCase().includes(keyword) ||
                movie.actors.join(" ").toLowerCase().includes(keyword) ||
                movie.genres.join(" ").toLowerCase().includes(keyword);
    
            const matchesGenre =
                selectedGenres.length === 0 ||
                    selectedGenres.some((g) => movie.genres.includes(g));
            
            const notExcluded =
                excludedGenres.length === 0 ||
                    !excludedGenres.some((g) => movie.genres.includes(g));
    
            const matchesTime =
                getMatchingShowtimes(movie, selectedStartTime, selectedEndTime).length > 0;

            // Ensures only movies that match the keyword, genre, and time are displayed
            return matchesKeyword && matchesGenre && notExcluded && matchesTime;
        });
    }

    // Render the movies that match the user's specified keyword, genre, and time
    function renderMovieList(list) {
        movieList.innerHTML = "";
    
        if (list.length === 0) {
            const empty = document.createElement("div");
            empty.textContent = "No movies match your search.";
            movieList.appendChild(empty);
            return;
        }
    
        list.forEach((movie) => {
            const card = document.createElement("article");
            card.className = "movie-card";
    
            const title = document.createElement("h3");
            title.textContent = movie.title;
            card.appendChild(title);
    
            const meta = document.createElement("div");
            meta.className = "meta";
            meta.textContent = movie.movieLength + " min · " + movie.genres.join(", ");
            card.appendChild(meta);
    
            const desc = document.createElement("p");
            desc.className = "description";
            desc.textContent = movie.description;
            card.appendChild(desc);
    
            const actors = document.createElement("p");
            actors.className = "actors";
            actors.innerHTML = "<strong>Starring:</strong> " + movie.actors.join(", ");
            card.appendChild(actors);
    
            card.addEventListener("click", () => {
                console.log("Clicked movie:", movie.title);
                selectedMovie = movie;
                fillCheckoutSummary(movie);
                resultsPage.classList.add("hidden");
                checkoutPage.classList.remove("hidden");
            });
    
            movieList.appendChild(card);
        });
    }

    // If we want to return to the first "search" page, hide the results/movielist page and unhide the search page
    toSearchButton.addEventListener("click", () => {
        resultsPage.classList.add("hidden");
        searchPage.classList.remove("hidden");
    });

    // =======================================================================>
    // CHECKOUT PAGE: After movie selected, pick number tickets and submit
    // =======================================================================>

    const finalTimeSelect = document.getElementById("finalTimeSelect");


    function displayShowtimes(movie) {
        finalTimeSelect.innerHTML = "";

        for (let i = 0; i < movie.movieTimes.length; i++) {
            const t = movie.movieTimes[i];
            const opt = document.createElement("option");
            opt.innerText = minutesToAmPm(timeStringToMinutes(t));
            opt.value = t;
            finalTimeSelect.appendChild(opt);
        }
    }

    function fillCheckoutSummary(movie) {
        checkoutSummary.innerHTML = "";

        displayShowtimes(movie)

        const h = document.createElement("h3");
        h.textContent = movie.title;
        checkoutSummary.appendChild(h);

        const p1 = document.createElement("p");
        p1.textContent = movie.description;
        checkoutSummary.appendChild(p1);

        const p2 = document.createElement("p");
        p2.innerHTML = "<strong>Starring:</strong> " + movie.actors.join(", ");
        checkoutSummary.appendChild(p2);

        const p3 = document.createElement("p");
        p3.innerHTML = "<strong>Genres:</strong> " + movie.genres.join(", ");
        checkoutSummary.appendChild(p3);
    }

    submitButton.addEventListener("click", () => {
        const userData = {
            movie: selectedMovie,
            movieTime: finalTimeSelect.value,
            numberOfTickets: parseInt(numberOfTicketsTextBox.value, 10),
            userName: userNameTextBox.value
        };
    
        trial.submitMovieChoice(userData);
    });

    backToResultsButton.addEventListener("click", () => {
        checkoutPage.classList.add("hidden");
        resultsPage.classList.remove("hidden");
    });
});
