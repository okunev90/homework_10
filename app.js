// Custom Http Module
function myHttp() {
    return {
        request(url, cb) {
            return fetch(url, cb).then(response => {
                if (response.status !== 200) {
                    return Promise.reject(response);
                }
                return Promise.resolve(response.json());
            });
        },
    };
}

// Init http module
const http = myHttp();
const apiKey = '9c27b0f722b84da5a08312d2b125351b';
const apiUrl = 'https://newsapi.org/v2';

const newsService = {

    topHeadlines(country = 'ua', categories = 'sports') {
        return http.request(`${apiUrl}/top-headlines?country=${country}&category=${categories}&apiKey=${apiKey}`);
    },
    everything(text) {
        return http.request(`${apiUrl}/everything?q=${text}&apiKey=${apiKey}`);
    },
};

// Elements
const newsContainer = document.querySelector('.news-container .row');

document.addEventListener('DOMContentLoaded', function () {
    M.AutoInit();
    loadNews();
});

const form = document.forms['newsControls'];
form.addEventListener('submit', e => {
    e.preventDefault();
    newsContainer.innerHTML = '';

    sortNews()
});

function sortNews(country, categories, search, serchLength = false) {
    if (serchLength) {
        newsService.everything(search)
            .then(res => onGetResponse(null, res))
            .catch(err => onGetResponse(err));
    } else {
        newsService.topHeadlines(country, categories)
            .then(res => renderNews(res.articles))
            .catch(err => onGetResponse(err));
    }
}

function loadNews() {
    const form = document.querySelector('form');
    sortNews();
    form.addEventListener('submit', function (event) {
        event.preventDefault();
        const countryValue = form.elements['country'].value;
        const categoryValue = form.elements['category'].value;
        const searchValue = form.elements['search'].value;
        console.log(searchValue.length);
        if (!searchValue.length) {
            sortNews(countryValue, categoryValue);
        } else if (searchValue.length) {
            sortNews(countryValue, categoryValue, searchValue, true);
        }
    });

}

function onGetResponse(err, res) {
    if (err) {
        alert(err);
        return;
    }

    if (!res.articles.length) {
        alert('Новостей не найдено');
        return;
    }

    renderNews(res.articles);
}

function renderNews(newsItems) {
    let fragment = '';

    newsItems.forEach(item => {
        const el = newsTemplate(item);
        fragment += el;
    });

    newsContainer.insertAdjacentHTML('afterbegin', fragment);
}

function newsTemplate({url, title, description, urlToImage} = {}) {
    return `
    <div class="col s12">
      <div class="card">
        <div class="card-image">
          <img src="${urlToImage}">
          <span class="card-title">${title || ''}</span>
        </div>
        <div class="card-content">
          <p>${description || ''}</p>
        </div>
        <div class="card-action">
          <a href="${url}">Read more</a>
        </div>
      </div>
    </div>
  `;
}
