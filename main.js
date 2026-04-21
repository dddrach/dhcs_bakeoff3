// As always, we add our parts within a "load" event to make sure the HTML stuff has loaded first. 
window.addEventListener("load", (e) => {
    // Get references to the HTML elements that we need.
    // const titleSelect = document.getElementById("titleSelect");
    const genreSelect = document.getElementById("genreSelect");
    const searchInput = document.getElementById("searchInput"); 
    const timeSelect = document.getElementById("timeSelect");

    // POSSIBLE CHANGE FOR ITERATION 2!!
    // Uncomment the next two lines for start and end range feauture
    // const startTimeInput = document.getElementById("startTime");
    // const endTimeInput = document.getElementById("endTime");

    const searchButton = document.getElementById("search");
    const movieInfoDiv = document.getElementById("movieInfo");

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


    // Build the genre dropdown from all genres in the movie list
    const genreSet = new Set();

    movies.forEach((movie) => {
        movie.genres.forEach((genre) => {
            genreSet.add(genre);
        });
    });

    genreSet.forEach((genre) => {
        const opt = document.createElement("option");
        opt.innerText = genre;
        opt.value = genre;
        genreSelect.appendChild(opt);
    });

    // POSSIBLE CHANGE FOR ITERATION 2: Comment out this line until line 60
    const timeSet = new Set();

    movies.forEach((movie) => {
        movie.movieTimes.forEach((time) => {
            timeSet.add(time);
        });
    });

    timeSet.forEach((time) => {
        const opt = document.createElement("option");
        opt.innerText = time;
        opt.value = time;
        timeSelect.appendChild(opt);
    });


    // Create seach button and save all of the keyword/genre/time settings
    searchButton.addEventListener("click", () => {
        const keyword = searchInput.value.toLowerCase();
        const selectedGenre = genreSelect.value;
        const selectedTime = timeSelect.value; // POSSIBLE CHANGE FOR ITERATION 2: Comment out this line 

        const startTime = startTimeInput.value;
        const endTime = endTimeInput.value;

        // Save the user's search inputs for the next page
        const searchData = {
            keyword: searchInput.value,
            genre: selectedGenre,
            time: selectedTime, // POSSIBLE CHANGE FOR ITERATION 2: Comment out this line and uncomment 78-79

            // startTime: startTime,
            // endTime: endTime
        };

        localStorage.setItem("movieSearchData", JSON.stringify(searchData));
    });
});
