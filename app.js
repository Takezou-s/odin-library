const bookList = [];
const categoryItemTemplate = document.getElementById("category-item-template");
const modalTemplate = document.getElementById("modal-template");
const newBookFormTemplate = document.getElementById("new-book-form-template");
const bookCardTemplate = document.getElementById("book-card-template");
const addButton = document.getElementById("add-button");

// Displays modal.
function showModal(title, bodyContent) {
  document.querySelector(".modal-backdrop")?.remove();
  document.querySelector(".modal-card")?.remove();
  const modalBackdropEl = modalTemplate.content.querySelector(".modal-backdrop");
  const modalCardEl = modalTemplate.content.querySelector(".modal-card");
  modalCardEl.querySelector(".modal-card__header>h2").textContent = title;
  modalCardEl.querySelector(".modal-card__body").appendChild(bodyContent);
  document.body.append(modalBackdropEl, modalCardEl);
}

// Ctor function for Book object.
function Book(name, pageCount, type, description, status, author) {
  this.name = name;
  this.pageCount = pageCount;
  this.type = type;
  this.description = description;
  this.status = status;
  this.author = author;
}

addButton.addEventListener("click", () => {});
showModal("Deneme", document.createElement("div"));
