const categoryItemTemplate = document.getElementById("category-item-template");
const modalTemplate = document.getElementById("modal-template");
const newBookFormTemplate = document.getElementById("new-book-form-template");
const bookCardTemplate = document.getElementById("book-card-template");

const addButton = document.getElementById("add-button");
const bookContainer = document.querySelector(".book-container");

const bookList = [];
const bookTypes = [];

let modalBackdropEl;
let modalCardEl;
let newBookFormEl;
let activeBookType;

class Modal {
  constructor(backdrop, card) {
    this.backdrop = backdrop;
    this.card = card;
    backdrop.addEventListener("click", this.hideModal.bind(this));
  }

  showModal(title, bodyContent) {
    this.card.querySelector(".modal-card__header>h2").textContent = title;
    this.card.querySelector(".modal-card__body").innerHTML = "";
    this.card.querySelector(".modal-card__body").appendChild(bodyContent);
    document.body.append(this.backdrop, this.card);
  }

  hideModal() {
    if (this.backdrop) this.backdrop.remove();
    if (this.card) this.card.remove();
  }
}

class Form {
  static _refNode;

  static refNode(node) {
    Form._refNode = node;
  }
  static createForm() {
    return new Form(Form._refNode);
  }

  constructor(refNode) {
    this.node = refNode.cloneNode(true);
  }

  get cancelButton() {
    return this.node.querySelectorAll(".new-book-form__buttons>button")[1];
  }

  input(id) {
    return this.node.querySelector(`#${id}`);
  }
}

let modal, form;

function init() {
  modalBackdropEl = modalTemplate.content.querySelector(".modal-backdrop");
  modalCardEl = modalTemplate.content.querySelector(".modal-card");
  modal = new Modal(modalBackdropEl, modalCardEl);

  newBookFormEl = newBookFormTemplate.content.querySelector("form");
  Form.refNode(newBookFormEl);
}

function showNewBookForm(book) {
  formHelper
    .newNode()
    .cancelButton()
    .addEventListener("click", (event) => {
      event.preventDefault();
      closeModal();
    });

  formHelper.input("pageCount").addEventListener("change", (event) => {
    formHelper.input("onPage").setAttribute("max", event.target.value);
  });

  if (book) {
    for (const key in book) {
      const el = formHelper.input(`${key}`);
      if (el) {
        el.value = book[key];
      }
    }
  }

  formHelper.presentNode().addEventListener("submit", (event) => {
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
  showModal("New Book", formHelper.presentNode());
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
