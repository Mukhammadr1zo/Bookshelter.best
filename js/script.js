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
let btnBox = document.querySelector(".btn-box");
let elBookBtn = document.querySelector(".book");
let elBookmark = document.querySelector(".booked-books");

let search = "search";
let page = 1;
let newest = "";

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
  let bookedArr = [];

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

    booksFragment.appendChild(clonedBookTemplate);
  });

  btnBox.addEventListener("click", (evt) => {
    if (evt.target.matches(".book")) {
      let bookBtnId = evt.target.dataset.btn;
      if (!bookedArr.includes(items)) {
        if (items.id == bookBtnId) {
          bookedArr.push(items);
        }
      }
    }
    elBookmark.innerHTML = "";
    renderBookmark(bookedArr, elBookmark);
  });

  elBookmark.addEventListener("click", (evt) => {
    if (evt.target.matches(".btn-remove")) {
      let bookedBookId = evt.target.dataset.idBookedItem;
      let bookedRemoveId = evt.target.dataset.idBookedRemove;
      const bookMarkIndex = bookedArr.findIndex(
        () => bookedBookId == bookedRemoveId
      );
      bookedArr.splice(bookMarkIndex, 1);
      elBookmark.innerHTML = null;
      renderBookmark(bookedArr, elBookmark);
    }
  });

  element.appendChild(booksFragment);
};

let renderBookmark = (data, element) => {
  for (let bookmark of data) {
    let newBookedItem = document.createElement("li");
    let newBookedItemBoxInfo = document.createElement("div");
    let newBookedItemBoxHeader = document.createElement("h4");
    let newBookedItemBoxDesc = document.createElement("p");
    let newBookedItemBoxBtn = document.createElement("div");
    let newBookedRemoveBtn = document.createElement("btn");
    let newBookedItemBoxBtnRead = document.createElement("btn");
    let newBookedRemoveImgRem = document.createElement("img");
    let newBookedRemoveImgRead = document.createElement("img");

    newBookedItem.setAttribute(
      "class",
      "bookmark-item d-flex justify-content-between align-items-center"
    );
    newBookedItemBoxInfo.setAttribute("class", "box-info");
    newBookedItemBoxHeader.setAttribute("class", "bookmark-item-header");
    newBookedItemBoxDesc.setAttribute("class", "bookmark-item-desc");
    newBookedItemBoxBtn.setAttribute("class", "booked-books");
    newBookedRemoveBtn.setAttribute("class", "night-btn btn-remove");
    newBookedItemBoxBtnRead.setAttribute("class", "night-btn reader");
    newBookedRemoveImgRem.setAttribute("src", "./images/delete.svg");
    newBookedRemoveImgRead.setAttribute("src", "./images/book-open.svg");

    newBookedItemBoxHeader.textContent = bookmark.volumeInfo.title;
    newBookedItemBoxDesc.textContent = bookmark.volumeInfo.subtitle;
    bookmark.newBookedItem.dataset.idBookedItem = bookmark.id;
    newBookedRemoveBtn.dataset.idBookmarkRemove = bookmark.id;

    element.appendChild(newBookedItem);
    newBookedItem.append(newBookedItemBoxInfo);
    newBookedItemBoxInfo.append(newBookedItemBoxHeader);
    newBookedItemBoxInfo.append(newBookedItemBoxDesc);
    newBookedItem.append(newBookedItemBoxBtn);
    newBookedItemBoxBtn.appendChild(newBookedItemBoxBtnRead);
    newBookedItemBoxBtn.appendChild(newBookedRemoveBtn);
    newBookedItemBoxBtnRead.appendChild(newBookedRemoveImgRead);
    newBookedRemoveBtn.appendChild(newBookedRemoveImgRem);
  }
};

const getBooks = async function () {
  const response = await fetch(
    `https://www.googleapis.com/books/v1/volumes?q=${search}${newest}&startIndex=${page}`
  );

  const data = await response.json();
  elResult.textContent = data.totalItems;

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
      const pageNumber = Number(item.innerHTML);

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
