import Notiflix from 'notiflix';
import axios from 'axios';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

const refs = {
  form: document.querySelector('#search-form'),
  gallery: document.querySelector('.gallery'),
  btnLoad: document.querySelector('.load-more'),
  input: document.querySelector('input[name="searchQuery"]'),
};

refs.form.addEventListener('submit', onSubmit);
refs.btnLoad.addEventListener('click', onbtnLoad);
refs.btnLoad.style.display = 'none';

let page = 1;
let alreadyShown = 0;

function onSubmit(evt) {
  evt.preventDefault();
  const searchValue = evt.target.elements.searchQuery.value.trim();

  refs.gallery.innerHTML = '';
  page = 1;
  refs.btnLoad.style.display = 'none';

  if (searchValue !== '') {
    fetchImages(searchValue);
  } else {
    refs.btnLoad.style.display = 'none';
    Notiflix.Notify.failure(
      'Sorry, there are no images matching your search query. Please try again.'
    );
  }
}

async function fetchImages(value, page) {
  const BASE_URL = 'https://pixabay.com/api/';
  const options = {
    params: {
      key: '31379887-12f3affabbab68da58a450cfe',
      q: value,
      image_type: 'photo',
      orientation: 'horizontal',
      safesearch: 'true',
      page: page,
      per_page: 40,
    },
  };

  try {
    const response = await axios.get(BASE_URL, options);
    alreadyShown += response.data.hits.length;

    const arrLength = response.data.hits.length;
    const maxLength = response.data.total;

    showMessage(arrLength, maxLength, alreadyShown);
    renderListImages(response.data);
  } catch (error) {
    console.log(error);
  }
}

function renderListImages(arr) {
  const markup = arr.hits
    .map(
      ({
        webformatURL,
        largeImageURL,
        tags,
        likes,
        views,
        comments,
        downloads,
      }) => `<a class="gallery__link" href="${largeImageURL}">
              <div class="photo-card">
              <img src="${webformatURL}" alt="${tags}" loading="lazy" />
              <div class="info">
                <p class="info-item">
                  <b>Likes</b>${likes}
                </p>
                <p class="info-item">
                  <b>Views</b>${views}
                </p>
                <p class="info-item">
                  <b>Comments</b>${comments}
                </p>
                <p class="info-item">
                  <b>Downloads</b>${downloads}
                </p>
              </div>
            </div>
            </a>`
    )
    .join('');
  refs.gallery.insertAdjacentHTML('beforeend', markup);
  simpleLightBox.refresh();
}

function onbtnLoad() {
  refs.btnLoad.style.display = 'none';
  page += 1;
  const searchValue = refs.form.elements.searchQuery.value.trim();

  fetchImages(searchValue, page);
  // refs.btnLoad.style.display = 'block';
}

function showMessage(length, total, alreadyShown) {
  if (!length) {
    refs.btnLoad.style.display = 'none';
    Notiflix.Notify.failure(
      'Sorry, there are no images matching your search query. Please try again.'
    );
  }

  if (length > 0) {
    refs.btnLoad.style.display = 'block';
    Notiflix.Notify.success(`Hooray! We found ${total} images.`);
    return;
  }

  if (alreadyShown >= total) {
    refs.btnLoad.style.display = 'none';
    Notiflix.Notify.info(
      "We're sorry, but you've reached the end of search results."
    );
  }
}

const simpleLightBox = new SimpleLightbox('.gallery a', {
  captionsData: 'alt',
  captionDelay: 250,
});
