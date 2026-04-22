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

    const trial = new Trial("GANK");
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

    const genreSelect = document.getElementById("genreSelect");
    const timeSelect = document.getElementById("timeSelect");

    // Build the genre and time dropdowns from all genres and times in the movie list
    const genreSet = new Set();
    const timeSet = new Set();

    movies.forEach((movie) => { // Add all movie genres and times to genreSet and timeSet, respectively
        console.log(movie)
        movie.genres.forEach((genre) => {
            genreSet.add(genre);
        });
        movie.movieTimes.forEach((time) => {
            timeSet.add(time);
        });
    });

    genreSet.forEach((genre) => { // Render genres in dropdown menu
        const opt = document.createElement("option");
        opt.innerText = genre;
        opt.value = genre;
        genreSelect.appendChild(opt);
    });

    timeSet.forEach((time) => { // Render times in dropdown menu
        const opt = document.createElement("option");
        opt.innerText = time;
        opt.value = time;
        timeSelect.appendChild(opt);
    });

    // When SEARCH button is clicked, save all info (keyword, genre, time)
    toResultsButton.addEventListener("click", () => {
        const keyword = keywordSearch.value.toLowerCase().trim();
        const selectedGenre = genreSelect.value;
        const selectedTime = timeSelect.value; 

        // Save the user's search inputs for the next page
        const searchData = {
            keyword: keyword,
            genre: selectedGenre,
            time: selectedTime
        };

        localStorage.setItem("movieSearchData", JSON.stringify(searchData));
        console.log(searchData)

        // Render the scrollable movie list based on settings
        const filteredMovies = getFilteredMovies(keyword, selectedGenre, selectedTime);
        renderMovieList(filteredMovies);

        // Hide search "page" and display movie results "page"
        searchPage.classList.add("hidden");
        resultsPage.classList.remove("hidden");
    });

    // =======================================================================>
    // RESULTS PAGE: Scroll through movies that match settings
    // =======================================================================>
    
    const movieList = document.getElementById("movieList");

    // Filter movie list based on keyword, genre, and selected time
    function getFilteredMovies(keyword, selectedGenre, selectedTime) {
        return movies.filter((movie) => {
            const matchesKeyword =
                keyword === "" ||
                movie.title.toLowerCase().includes(keyword) ||
                movie.description.toLowerCase().includes(keyword) ||
                movie.actors.join(" ").toLowerCase().includes(keyword) ||
                movie.genres.join(" ").toLowerCase().includes(keyword);
    
            const matchesGenre =
                selectedGenre === "" || movie.genres.includes(selectedGenre);
    
            const matchesTime =
                selectedTime === "" || movie.movieTimes.includes(selectedTime);

            // Ensures only movies that match the keyword, genre, and time are displayed
            return matchesKeyword && matchesGenre && matchesTime;
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
            opt.innerText = t;
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
