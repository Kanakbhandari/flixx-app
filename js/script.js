console.clear();
const global = {
  currentPage: window.location.pathname,
  search: {
    term: '',
    type: '',
    page: 1,
    totalPages: 1,
    totalResults: 0,
  },
};

async function search() {
  //const searchurl = window.location.search.split('&');
  const searchurl = window.location.search;
  const urlParams = new URLSearchParams(searchurl);
  // const type = searchurl[0].split('=')[1];
  // const searchTerm = searchurl[1].split('=')[1];
  global.search.type = urlParams.get('type');
  global.search.term = urlParams.get('search-term');

  if (global.search.term !== '' && global.search.term !== null) {
    // - request and display search results
    const { results, total_pages, page, total_results } = await searchAPIData();
    if (results.length == 0) {
      showAlert('No results found', 'error');
      return;
    }
    global.search.page = page;
    global.search.totalPages = total_pages;
    global.search.totalResults = total_results;
    displaySearchResults(results);
  } else {
    showAlert('Please enter search Details', 'error');
  }
}

function displaySearchResults(results) {
  document.querySelector('#search-results').innerHTML = '';
  document.querySelector('#search-results-heading').innerHTML = '';
  document.querySelector('#pagination').innerHTML = '';
  const cardhead = document.querySelector('#search-results');
  const heading = document.querySelector('#search-results-heading');
  heading.innerHTML = `<h2>Showing ${results.length} of ${global.search.totalResults} for
   ${global.search.term}</h2>`;

  //heading.textContent = `Total ${global.search.totalResults} results found`;

  results.forEach((result) => {
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `<a href="${global.search.type}-details.html?id=${
      result.id
    }">
        <img src="${
          result.poster_path
            ? 'https://image.tmdb.org/t/p/w500' + result.poster_path
            : 'images/no-image.jpg'
        }" class="card-img-top" alt="${
      global.search.type == 'movie' ? result.original_title : result.name
    }" />
      </a>
      <div class="card-body">
        <h5 class="card-title">${
          global.search.type == 'movie' ? result.original_title : result.name
        }</h5>
        <p class="card-text">
          <small class="text-muted">Release: ${
            global.search.type == 'movie'
              ? result.release_date
              : result.first_air_date
          }</small>
        </p>
      </div>
    </div>`;
    cardhead.appendChild(card);
  });

  displayPagination();
}

function displayPagination() {
  const div = document.createElement('div');
  div.classList.add('pagination');
  div.innerHTML = `<button class="btn btn-primary" id="prev">Prev</button>
  <button class="btn btn-primary" id="next">Next</button>
  <div class="page-counter">Page ${global.search.page} of ${global.search.totalPages}</div>`;
  document.querySelector('#pagination').appendChild(div);
  //disable prev
  if (global.search.page == 1) {
    document.querySelector('#prev').disabled = true;
  }

  if (global.search.page == global.search.totalPages) {
    document.querySelector('#next').disabled = true;
  }

  document.querySelector('#next').addEventListener('click', async () => {
    global.search.page++;
    const { results } = await searchAPIData();
    displaySearchResults(results);
    window.scrollTo(0, 0);
  });
  document.querySelector('#prev').addEventListener('click', async () => {
    global.search.page--;
    const { results } = await searchAPIData();
    displaySearchResults(results);
    window.scrollTo(0, 0);
  });
}

////-************* SEarch DATA from TMDB *******
async function searchAPIData() {
  showspinner();
  const API_OPT = {
    method: 'GET',
    headers: {
      accept: 'application/json',
      Authorization:
        'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJiYzdkMTMwZmUyNWFmZGU3NzJjY2Y0ODU1NWM5NTI2ZCIsInN1YiI6IjY0N2Q3N2Q2MGZiMzk4MDExODBlNGRiNiIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.VMeiOsS98avIT37nVsZNtYXeOTyYXhwBREY8XdjzC7M',
    },
  };

  const API_URL =
    'https://api.themoviedb.org/3/search/' +
    global.search.type +
    '?query=' +
    global.search.term +
    '&page=' +
    global.search.page;

  const response = await fetch(`${API_URL}`, API_OPT);
  const data = await response.json();
  hidespinner();
  return data;
}

function showAlert(message, className) {
  const alert = document.createElement('div');
  alert.classList.add('alert', className);
  alert.appendChild(document.createTextNode(message));
  document.querySelector('#alert').appendChild(alert);
  setTimeout(() => {
    alert.remove();
  }, 2000);
}

async function displayPopularMovies() {
  const { results } = await fetchAPIData('movie/popular', 'GET');
  results.forEach((result) => {
    const cardhead = document.querySelector('#popular-movies');

    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `<a href="movie-details.html?id=${result.id}">
        <img src="${
          result.poster_path
            ? 'https://image.tmdb.org/t/p/w500' + result.poster_path
            : 'images/no-image.jpg'
        }" class="card-img-top" alt="${result.orginal_title}" />
      </a>
      <div class="card-body">
        <h5 class="card-title">${result.original_title}</h5>
        <p class="card-text">
          <small class="text-muted">Release: ${result.release_date}</small>
        </p>
      </div>
    </div>`;
    cardhead.appendChild(card);
  });
}

//display popular TV shows
async function displayPopularShows() {
  const { results } = await fetchAPIData('tv/popular', 'GET');
  results.forEach((result) => {
    const cardhead = document.querySelector('#popular-shows');

    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `<a href="tv-details.html?id=${result.id}">
          <img src="${
            result.poster_path
              ? 'https://image.tmdb.org/t/p/w500' + result.poster_path
              : 'images/no-image.jpg'
          }" class="card-img-top" alt="${result.name}" />
        </a>
        <div class="card-body">
          <h5 class="card-title">${result.name}</h5>
          <p class="card-text">
            <small class="text-muted">Release: ${result.first_air_date}</small>
          </p>
        </div>
      </div>`;
    cardhead.appendChild(card);
  });
}

//*----------------------- Slider *********

async function displaySlider() {
  const { results } = await fetchAPIData('movie/now_playing', 'GET');

  results.forEach((result) => {
    const newslider = document.createElement('div');
    newslider.className = 'swiper-slide';
    newslider.innerHTML = `
    <a href="movie-details.html?id=${result.id}">
      <img src="${
        result.poster_path
          ? 'https://image.tmdb.org/t/p/w500' + result.poster_path
          : 'images/no-image.jpg'
      }" alt="${result.title}" />
    </a>
    <h4 class="swiper-rating">
      <i class="fas fa-star text-secondary"></i> ${result.vote_average.toFixed(
        1
      )} / 10
    </h4>
`;
    document.querySelector('.swiper-wrapper').appendChild(newslider);
    initSwiper();
  });
}
function initSwiper() {
  const swiper = new Swiper('.swiper', {
    slidesPerView: 1,
    freeMode: true,
    autoplay: {
      delay: 4000,
      disableOnInteraction: false,
    },
    breakpoints: {
      500: {
        slidesPerView: 2,
      },
      700: {
        slidesPerView: 3,
      },
      1200: {
        slidesPerView: 5,
      },
    },
  });
}

//display show details

async function displayShowDetails() {
  const showId = window.location.search.split('=')[1];
  const show = await fetchAPIData(`tv/${showId}`);

  //overlay a backdrop
  displayBackgroundImage('Show', show.backdrop_path);

  const div = document.createElement('div');
  div.innerHTML = `<div class="details-top">
      <div>
        <img
          src="${
            show.poster_path
              ? 'https://image.tmdb.org/t/p/w500' + show.poster_path
              : 'images/no-image.jpg'
          }"
          class="card-img-top"
          alt="${show.name}"
        />
      </div>
      <div>
        <h2>${show.name}</h2>
        <p>
          <i class="fas fa-star text-primary"></i>
          ${show.vote_average.toFixed(1)}/ 10
        </p>
        <p class="text-muted">Release Date: ${show.first_air_date}</p>
        <p>
  ${show.overview}
        </p>
        <h5>Genres</h5>
        <ul class="list-group">${show.genres
          .map((genre) => {
            return `<li>${genre.name}</li>`;
          })
          .join('')}
        </ul>
        <a href="${
          show.homepage
        }" target="_blank" class="btn">Visit show Homepage</a>
      </div>
    </div>
    <div class="details-bottom">
    <h2>Show Info</h2>
    <ul>
      <li><span class="text-secondary">Number Of Episodes:</span> ${
        show.number_of_episodes
      }</li>
      <li>
        <span class="text-secondary">Last Episode To Air:</span> ${
          show.last_air_date
        }
      </li>
      <li><span class="text-secondary">Status:</span> ${show.status}</li>
    </ul>
    </div>`;
  document.querySelector('#show-details').appendChild(div);
}

//display movie details
async function displayMovieDetails() {
  const movieId = window.location.search.split('=')[1];
  const movie = await fetchAPIData(`movie/${movieId}`);

  //overlay a backdrop
  displayBackgroundImage('movie', movie.backdrop_path);

  const div = document.createElement('div');
  div.innerHTML = `<div class="details-top">
    <div>
      <img
        src="${
          movie.poster_path
            ? 'https://image.tmdb.org/t/p/w500' + movie.poster_path
            : 'images/no-image.jpg'
        }"
        class="card-img-top"
        alt="${movie.original_title}"
      />
    </div>
    <div>
      <h2>${movie.original_title}</h2>
      <p>
        <i class="fas fa-star text-primary"></i>
        ${movie.vote_average.toFixed(1)}/ 10
      </p>
      <p class="text-muted">Release Date: ${movie.release_date}</p>
      <p>
${movie.overview}
      </p>
      <h5>Genres</h5>
      <ul class="list-group">
        <li>${movie.genres[0].name}</li>
        <li>${movie.genres[1].name}</li>
        <li>${movie.genres[2].name}</li>
      </ul>
      <a href="${
        movie.homepage
      }" target="_blank" class="btn">Visit Movie Homepage</a>
    </div>
  </div>
  <div class="details-bottom">
    <h2>Movie Info</h2>
    <ul>
      <li><span class="text-secondary">Budget:</span> $${addCommasToNumber(
        movie.budget
      )}</li>
      <li><span class="text-secondary">Revenue:</span> $${addCommasToNumber(
        movie.revenue
      )}</li>
      <li><span class="text-secondary">Runtime:</span> ${
        movie.runtime
      } minutes</li>
      <li><span class="text-secondary">Status:</span> ${movie.status}</li>
    </ul>
    <h4>Production Companies</h4>
    <div class="list-group">${
      movie.production_companies[0].name +
      ', ' +
      movie.production_companies[1].name +
      ', ' +
      movie.production_companies[2].name
    }</div >
  </div>`;
  document.querySelector('#movie-details').appendChild(div);
}

// display background image
function displayBackgroundImage(type, bgpath) {
  if (bgpath != null) {
    const overlaydiv = document.createElement('div');
    overlaydiv.style.backgroundImage =
      'url(https://image.tmdb.org/t/p/original/' + bgpath;
    overlaydiv.style.backgroundSize = 'cover';
    overlaydiv.style.backgroundPosition = 'center';
    overlaydiv.style.backgroundRepeat = 'no-repeat';
    overlaydiv.style.height = '100vh';
    overlaydiv.style.width = '100vw';
    overlaydiv.style.position = 'absolute';
    overlaydiv.style.top = '0';
    overlaydiv.style.left = '0';
    overlaydiv.style.zIndex = '-1';
    overlaydiv.style.opacity = '0.1';

    if (type === 'movie') {
      document.querySelector('#movie-details').appendChild(overlaydiv);
    } else {
      document.querySelector('#show-details').appendChild(overlaydiv);
    }
  }
}

function addCommasToNumber(number) {
  return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

//fetch data from tmdb
async function fetchAPIData(endpoint, method) {
  showspinner();
  const API_OPT = {
    method: method,
    headers: {
      accept: 'application/json',
      Authorization:
        'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJiYzdkMTMwZmUyNWFmZGU3NzJjY2Y0ODU1NWM5NTI2ZCIsInN1YiI6IjY0N2Q3N2Q2MGZiMzk4MDExODBlNGRiNiIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.VMeiOsS98avIT37nVsZNtYXeOTyYXhwBREY8XdjzC7M',
    },
  };

  const API_URL = 'https://api.themoviedb.org/3/';

  const response = await fetch(`${API_URL}${endpoint}`, API_OPT);
  const data = await response.json();
  hidespinner();
  return data;
}

function showspinner() {
  document.querySelector('.spinner').classList.add('show');
}
function hidespinner() {
  document.querySelector('.spinner').classList.remove('show');
}

//Highlight active link
function highlightActiveLink() {
  const links = document.querySelectorAll('.nav-link');
  links.forEach((link) => {
    if (link.getAttribute('href') === global.currentPage) {
      link.classList.add('active');
    }
  });
}

//init app
function init() {
  switch (global.currentPage) {
    case '/':
    case '/index.html':
      displayPopularMovies();
      displaySlider();
      break;
    case '/shows.html':
      displayPopularShows();
      break;
    case '/movie-details.html':
      displayMovieDetails();
      break;
    case '/tv-details.html':
      displayShowDetails();
      break;
    case '/search.html':
      search();
      break;
  }
  highlightActiveLink();
}

document.addEventListener('DOMContentLoaded', init);
