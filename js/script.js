"use strict";

let elLogoutBtn = document.querySelector(".logout");
let localToken = window.localStorage.getItem("token");
let elResult = document.querySelector(".books-result");
let elList = document.querySelector(".books-list");
let elTemplate = document.querySelector(".template").content;
let elInput = document.querySelector(".search");
let closeModal = document.querySelector(".modal-content");
let modal = document.getElementById("myModal");
let btn = document.getElementById("myBtn");
let span = document.querySelector(".close");
let elPagination = document.querySelector(".pagination");
let elPrevBtn = document.querySelector(".prev-btn");
let elNextBtn = document.querySelector(".next-btn");
let elRankBox = document.querySelector(".ranking");
let rankBtn = document.querySelector(".rank-btn");
let elBookBtn = document.querySelector(".book");
let elBookmark = document.querySelector(".booked-books");
let elBookmarkBtn = document.querySelector(".bookmark-btn");

let search = "search";
let page = 1;
let newest = "";
let bookedArr = [];

if (!localToken) {
  window.location.replace("index.html");
}

elLogoutBtn.addEventListener("click", function () {
  window.localStorage.removeItem("token");

  window.location.replace("index.html");
});

elList.addEventListener("click", function (evt) {
  if (evt.target.matches(".btn-info")) {
    modal.style.display = "block";
  }
});

const renderBooks = function (arr, element) {
  const booksFragment = document.createDocumentFragment();

  arr.forEach((items) => {
    const clonedBookTemplate = elTemplate.cloneNode(true);

    clonedBookTemplate.querySelector(".item-img").src =
      items.volumeInfo.imageLinks.thumbnail;
    clonedBookTemplate.querySelector(".item-title").textContent =
      items.volumeInfo.title;
    clonedBookTemplate.querySelector(".item-desc").textContent =
      items.volumeInfo.authors;
    clonedBookTemplate.querySelector(".item-year").textContent =
      items.volumeInfo.publishedDate;
    clonedBookTemplate.querySelector(".read").href =
      items.volumeInfo.previewLink;
    clonedBookTemplate.querySelector(".bookmark-btn").dataset.bookmarkBtn =
      items.id;

    booksFragment.appendChild(clonedBookTemplate);
  });

  element.appendChild(booksFragment);
};

let renderBookmark = (data, element) => {
  element.innerHTML = "";
  data.forEach((book) => {
    const html = `
    <li
    class="bookmark-item d-flex justify-content-between align-items-center"
  >
    <div class="box-info">
      <h4 class="bookmark-item-header">${book.volumeInfo.title}</h4>
      <p class="bookmark-item-desc">${book.volumeInfo.authors}</p>
    </div>
    <div class="booked-book">
      <a href="${book.volumeInfo.previewLink}" class="night-btn reader " target="_blank">
        <img src="./images/book-open.svg" alt="" />
      </a>
      <button class="night-btn btn-remove " data-removeBtnId="${book.id}">
        <img class="btn-remove" data-removeBtnId="${book.id}" src="./images/delete.svg" alt="" />
      </button>
    </div>
  </li>
    `;

    element.insertAdjacentHTML("beforeend", html);
  });
};
elBookmark.addEventListener("click", (evt) => {
  if (evt.target.matches(".btn-remove")) {
    let btnRemove = evt.target.dataset.removebtnid;

    let findBook = bookedArr.findIndex((book) => btnRemove == book.id);
    bookedArr.splice(findBook, 1);
    elBookmark.innerHTML = null;
    renderBookmark(bookedArr, elBookmark);
  }
});

const getBooks = async function () {
  const response = await fetch(
    `https://www.googleapis.com/books/v1/volumes?q=${search}${newest}&startIndex=${page}`
  );

  const data = await response.json();
  elResult.textContent = data.totalItems;

  elList.addEventListener("click", (evt) => {
    if (evt.target.matches(".bookmark-btn")) {
      let bookBtnId = evt.target.dataset.bookmarkBtn;

      let findBook = data.items.find((book) => bookBtnId === book.id);
      if (!bookedArr.includes(findBook)) {
        if (findBook != undefined) {
          bookedArr.push(findBook);
        }
      } else {
        alert("Bu kitob Qo'shilgan");
      }
      renderBookmark(bookedArr, elBookmark);
    }
  });

  if (data.items.length > 0) {
    renderBooks(data.items, elList);
  }
  if (page === 1) {
    elPrevBtn.disabled = true;
  } else {
    elPrevBtn.disabled = false;
  }

  const lastItemCount = Math.ceil(data.totalItems / 10);

  if (page === lastItemCount) {
    elNextBtn.disabled = true;
  } else {
    elNextBtn.disabled = false;
  }

  elPagination.innerHTML = null;

  for (let i = 1; i <= lastItemCount; i++) {
    const newPaginationBtn = document.createElement("li");

    newPaginationBtn.textContent = i;

    newPaginationBtn.classList.add("page-link");

    elPagination.appendChild(newPaginationBtn);
  }

  const selectedPagination = document.querySelectorAll(".pagination li");

  selectedPagination.forEach((item) => {
    item.addEventListener("click", function () {
      const pageNumber = Number(item.innerHTML) * 10;

      page = pageNumber;

      elList.innerHTML = null;

      getBooks();
    });
  });
};

getBooks();

elInput.addEventListener("change", function (evt) {
  elList.innerHTML = null;
  search = evt.target.value;
  getBooks();
});

span.onclick = function () {
  modal.style.display = "none";
};

window.onclick = function (event) {
  if (event.target == modal) {
    modal.style.display = "none";
  }
};
rankBtn.addEventListener("click", () => {
  newest = "&orderBy=newest";
  elList.innerHTML = null;
  getBooks();
});

elNextBtn.addEventListener("click", function () {
  elList.innerHTML = null;
  page = page + 10;
  getBooks();
});

elPrevBtn.addEventListener("click", function () {
  elList.innerHTML = null;
  page = page - 10;
  getBooks();
});
