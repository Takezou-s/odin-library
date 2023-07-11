const bookList = [];
const bookTypes = [];
const categoryItemTemplate = document.getElementById("category-item-template");
const modalTemplate = document.getElementById("modal-template");
const newBookFormTemplate = document.getElementById("new-book-form-template");
const bookCardTemplate = document.getElementById("book-card-template");

const addButton = document.getElementById("add-button");
const bookContainer = document.querySelector(".book-container");

let modalBackdropEl;
let modalCardEl;
let newBookFormEl;
let activeBookType;

function closeModal() {
  if (modalBackdropEl) modalBackdropEl.remove();
  if (modalCardEl) modalCardEl.remove();
}

function showModal(title, bodyContent) {
  modalCardEl.querySelector(".modal-card__header>h2").textContent = title;
  modalCardEl.querySelector(".modal-card__body").innerHTML = "";
  modalCardEl.querySelector(".modal-card__body").appendChild(bodyContent);
  document.body.append(modalBackdropEl, modalCardEl);
}

function showNewBookForm(book) {
  const formClone = newBookFormEl.cloneNode(true);
  formClone.querySelectorAll(".new-book-form__buttons>button")[1].addEventListener("click", (event) => {
    event.preventDefault();
    closeModal();
  });
  formClone.querySelector("#pageCount").addEventListener("change", (event) => {
    formClone.querySelector("#onPage").setAttribute("max", event.target.value);
  });
  formClone.querySelector("#status").addEventListener("change", (event) => {
    return;
    if (event.target.value !== "reading") {
      formClone.querySelector("#onPage-container").classList.add("display-none");
    } else {
      formClone.querySelector("#onPage-container").classList.remove("display-none");
    }
  });

  if (book) {
    for (const key in book) {
      const el = formClone.querySelector(`#${key}`);
      if (el) {
        el.value = book[key];
      }
    }
  }

  formClone.addEventListener("submit", (event) => {
    event.preventDefault();

    const formData = new FormData(event.target);
    const formProps = Object.fromEntries(formData);

    const newBook = new Book(
      formProps.id === "null" ? Math.random().toString() : formProps.id,
      formProps.title,
      formProps.pageCount,
      formProps.bookType,
      formProps.description,
      formProps.status,
      formProps.author,
      formProps.onPage
    );
    if (newBook.status === "Read") newBook.onPage = newBook.pageCount;

    const existing = bookList.find((x) => x.id === newBook.id);
    if (existing) {
      for (const key in existing) {
        if (Object.hasOwnProperty.call(newBook, key)) {
          existing[key] = newBook[key];
        }
      }
    } else {
      bookList.push(newBook);
    }
    let bookType = bookTypes.find((x) => x === newBook.bookType);
    if (!bookType) {
      bookType = newBook.bookType;
      bookTypes.push(bookType);
      renderBookType(bookType);
    }

    if (activeBookType === bookType) {
      renderBook(newBook);
    } else {
      const bookCard = document.querySelector(`[data-book-id='${book.id}']`);
      if (bookCard) bookCard.remove();
    }
    closeModal();
  });
  showModal("New Book", formClone);
}

function renderBook(book) {
  let bookCard = document.querySelector(`[data-book-id='${book.id}']`);
  let existing = true;
  if (!bookCard) {
    bookCard = bookCardTemplate.content.cloneNode(true).querySelector(".book-card");
    existing = false;
  }

  bookCard.style.borderLeft = `5px solid var(--${book.status.toLowerCase()}-color)`;
  for (const key in book) {
    const els = bookCard.querySelectorAll(`[data-for='${key}']`);
    if (els && els.length > 0) {
      for (const el of els) {
        if (el) el.textContent = book[key];
      }
    }
  }
  bookCard.dataset.bookId = book.id;
  if (!existing) {
    document.querySelector(".book-container").insertAdjacentElement("afterbegin", bookCard);
  }
}

function renderBookType(bookType) {
  const liEl = categoryItemTemplate.content.cloneNode(true).querySelector("li");
  const anchorEl = liEl.querySelector("a");
  anchorEl.textContent = bookType;
  anchorEl.addEventListener("click", (event) => {
    event.preventDefault();
    selectBookType(event.target.textContent);
  });

  document.getElementById("categories").append(liEl);
}

function selectBookType(bookType) {
  activeBookType = bookType;
  document.querySelector(".container>h1").textContent = bookType;
  const bookArr = bookType ? bookList.filter((x) => x.bookType === bookType) : bookList;
  document.querySelector(".book-container").innerHTML = "";
  for (const book of bookArr) {
    renderBook(book);
  }
  const elements = document.querySelectorAll(".category-item__link");
  for (const element of elements) {
    if (element.textContent !== bookType) {
      element.parentElement.classList.remove("active");
    } else {
      element.parentElement.classList.add("active");
    }
  }
}

function init() {
  modalBackdropEl = modalTemplate.content.querySelector(".modal-backdrop");
  modalBackdropEl.addEventListener("click", closeModal);
  modalCardEl = modalTemplate.content.querySelector(".modal-card");
  newBookFormEl = newBookFormTemplate.content.querySelector("form");
}

// Ctor function for Book object.
function Book(id, title, pageCount, bookType, description, status, author, onPage) {
  this.id = id;
  this.title = title;
  this.pageCount = pageCount;
  this.bookType = bookType;
  this.description = description;
  this.status = status;
  this.author = author;
  this.onPage = onPage;
}

init();
addButton.addEventListener("click", showNewBookForm);
bookContainer.addEventListener("click", (event) => {
  if (event.target.dataset.bookId) {
    showNewBookForm(bookList.find((x) => x.id === event.target.dataset.bookId));
  }
});
