// As always, we add our parts within a "load" event to make sure the HTML stuff has loaded first.
window.addEventListener("load", () => {
    const titleSelect = document.getElementById("titleSelect");
    const timeSelect = document.getElementById("timeSelect");
    const submitButton = document.getElementById("submit");
    const numberOfTicketsTextBox = document.getElementById("numberOfTickets");
    const userNameTextBox = document.getElementById("userName");

    const movieSearch = document.getElementById("movieSearch");
    const movieList = document.getElementById("movieList");
    const browsePanel = document.getElementById("browsePanel");
    const checkoutPanel = document.getElementById("checkoutPanel");
    const checkoutSummary = document.getElementById("checkoutSummary");
    const backToBrowse = document.getElementById("backToBrowse");

    const trial = new Trial("teamName");
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
    let currentlySelectedMovie;

    for (let i = 0; i < movies.length; i++) {
        const movie = movies[i];
        const opt = document.createElement("option");
        opt.innerText = movie.title;
        opt.value = i + "";
        titleSelect.appendChild(opt);
    }

    selectMovie(movies[0]);
    renderMovieList(getFilteredMovies(""));

    titleSelect.addEventListener("change", () => {
        selectMovie(movies[titleSelect.value]);
        renderMovieList(getFilteredMovies(movieSearch.value.trim()));
    });

    movieSearch.addEventListener("input", () => {
        renderMovieList(getFilteredMovies(movieSearch.value.trim()));
    });

    backToBrowse.addEventListener("click", () => {
        checkoutPanel.classList.add("panel-hidden");
        browsePanel.classList.remove("panel-hidden");
    });

    submitButton.addEventListener("click", () => {
        const userData = {
            movie: currentlySelectedMovie,
            movieTime: timeSelect.value,
            numberOfTickets: parseInt(numberOfTicketsTextBox.value, 10),
            userName: userNameTextBox.value
        };
        trial.submitMovieChoice(userData);
    });

    function selectMovie(movie) {
        currentlySelectedMovie = movie;
        const idx = movies.indexOf(movie);
        if (idx >= 0) {
            titleSelect.value = String(idx);
        }
        displayShowtimes(movie);
    }

    function displayShowtimes(movie) {
        timeSelect.innerHTML = "";
        for (let i = 0; i < movie.movieTimes.length; i++) {
            const t = movie.movieTimes[i];
            const opt = document.createElement("option");
            opt.innerText = t;
            opt.value = t;
            timeSelect.appendChild(opt);
        }
    }

    function getFilteredMovies(query) {
        if (!query) {
            return movies.slice();
        }
        const tokens = query
            .toLowerCase()
            .split(/\s+/)
            .filter(Boolean);
        return movies.filter((movie) => tokens.every((tok) => haystackFor(movie).includes(tok)));
    }

    function haystackFor(movie) {
        const parts = [
            movie.title,
            movie.description,
            movie.genres.join(" "),
            movie.actors.join(" ")
        ];
        return parts.join(" \n ").toLowerCase();
    }

    function renderMovieList(list) {
        movieList.innerHTML = "";
        if (list.length === 0) {
            const empty = document.createElement("div");
            empty.className = "movie-list-empty";
            empty.textContent = "No movies match that search. Try another actor, genre, or keyword.";
            movieList.appendChild(empty);
            return;
        }
        for (let i = 0; i < list.length; i++) {
            const movie = list[i];
            const card = document.createElement("article");
            card.className = "movie-card";
            card.setAttribute("role", "listitem");
            card.tabIndex = 0;

            const title = document.createElement("h3");
            title.textContent = movie.title;
            card.appendChild(title);

            const meta = document.createElement("div");
            meta.className = "meta";
            meta.textContent =
                movie.movieLength + " min · " + movie.genres.join(", ");
            card.appendChild(meta);

            const desc = document.createElement("p");
            desc.className = "description";
            desc.textContent = movie.description;
            card.appendChild(desc);

            const actors = document.createElement("p");
            actors.className = "actors";
            const strong = document.createElement("strong");
            strong.textContent = "Starring: ";
            actors.appendChild(strong);
            actors.appendChild(
                document.createTextNode(movie.actors.join(", "))
            );
            card.appendChild(actors);

            const goCheckout = () => {
                selectMovie(movie);
                fillCheckoutSummary(movie);
                browsePanel.classList.add("panel-hidden");
                checkoutPanel.classList.remove("panel-hidden");
            };

            card.addEventListener("click", goCheckout);
            card.addEventListener("keydown", (e) => {
                if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    goCheckout();
                }
            });

            movieList.appendChild(card);
        }
    }

    function fillCheckoutSummary(movie) {
        checkoutSummary.innerHTML = "";
        const h = document.createElement("h3");
        h.textContent = movie.title;
        checkoutSummary.appendChild(h);
        const p1 = document.createElement("p");
        p1.textContent = movie.description;
        checkoutSummary.appendChild(p1);
        const p2 = document.createElement("p");
        p2.innerHTML =
            "<strong>Starring:</strong> " +
            movie.actors.map((a) => escapeHtml(a)).join(", ");
        checkoutSummary.appendChild(p2);
        const p3 = document.createElement("p");
        p3.innerHTML =
            "<strong>Genres:</strong> " +
            movie.genres.map((g) => escapeHtml(g)).join(", ");
        checkoutSummary.appendChild(p3);
    }

    function escapeHtml(s) {
        const div = document.createElement("div");
        div.textContent = s;
        return div.innerHTML;
    }
});
