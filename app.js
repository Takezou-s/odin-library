const addButton = document.getElementById("add-button");
const bookContainer = document.querySelector(".book-container");
const bookTypeContainer = document.getElementById("categories");

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

class Modal {
  constructor(backdrop, card) {
    this.backdrop = backdrop;
    this.card = card;
    backdrop.addEventListener("click", this.hideModal.bind(this));
  }

  showModal(title, bodyContent) {
    this.placeContent(title, bodyContent);
    document.body.append(this.backdrop, this.card);
  }

  placeContent(title, bodyContent) {
    this.card.querySelector(".modal-card__header>h2").textContent = title;
    this.card.querySelector(".modal-card__body").innerHTML = "";
    this.card.querySelector(".modal-card__body").appendChild(bodyContent);
  }

  hideModal() {
    if (this.backdrop) this.backdrop.remove();
    if (this.card) this.card.remove();
  }
}

class Form {
  static getFormProps(form) {
    const formData = new FormData(form.node);
    return Object.fromEntries(formData);
  }

  constructor(refNode) {
    this.node = refNode.cloneNode(true);
  }

  onSubmit(callbackFn) {
    const submitHandler = ((event) => {
      event.preventDefault();
      callbackFn(event, Form.getFormProps(this));
    }).bind(this);
    this.node.onsubmit = submitHandler;
  }

  onReset(callbackFn) {
    const resetHandler = ((event) => {
      event.preventDefault();
      if (this._controlledReset) {
        this._controlledReset = false;
      } else {
        callbackFn(event);
      }
    }).bind(this);
    this.node.onreset = resetHandler;
  }

  input(id) {
    return this.node.querySelector(`#${id}`);
  }

  fillInputs(obj) {
    this.clear();
    if (obj) {
      for (const key in obj) {
        this.fillInput(key, obj[key]);
      }
    }
  }

  fillInput(id, value) {
    this.input(id).value = value;
  }

  clear() {
    this._controlledReset = true;
    this.node.reset();
  }
}

class BookManager {
  constructor() {
    this.bookList = [];
    this.bookTypes = [];
  }

  addBook(book) {
    book.id = Math.random().toString();
    this.bookList.push(book);
    this.addBookType(book.bookType);
  }

  updateBook(book) {
    const existing = this.bookList.find((x) => x.id === book.id);
    if (existing) {
      for (const key in existing) {
        if (Object.hasOwnProperty.call(book, key)) {
          existing[key] = book[key];
        }
      }
      this.addBookType(existing.bookType);
    }
  }

  removeBook(book) {
    const bookId = this.bookList.findIndex((x) => x.id === book.id);
    if (bookId >= 0 && bookId < this.bookList.length) this.bookList.splice(bookId, 1);
  }

  addBookType(bookType) {
    let existingBookType = this.bookTypes.find((x) => x === bookType);
    if (!existingBookType) {
      this.bookTypes.push(bookType);
    }
  }
}

class BookElementCreator {
  constructor(bookTemplate, bookTypeTemplate) {
    this.bookTemplate = bookTemplate;
    this.bookTypeTemplate = bookTypeTemplate;
  }

  createOrUpdateBookElement(book) {
    let bookCard = this.getBookElement(book);
    let existing = true;
    if (!bookCard) {
      bookCard = this.bookTemplate.content.cloneNode(true).querySelector(".book-card");
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
    return { existing: existing, node: bookCard };
  }

  getBookElement(book) {
    return document.querySelector(`[data-book-id='${book.id}']`);
  }

  removeBook(book) {
    const el = this.getBookElement(book);
    if (el) el.remove();
  }

  createBookTypeElement(bookType) {
    const liEl = this.bookTypeTemplate.content.cloneNode(true).querySelector("li");
    liEl.dataset.bookType = bookType;

    const anchorEl = liEl.querySelector("a");
    anchorEl.textContent = bookType;

    return liEl;
  }
}

class BookRenderer {
  constructor(bookElementCreator, bookContainer, bookTypeContainer) {
    this.bookElementCreator = bookElementCreator;
    this.bookContainer = bookContainer;
    this.bookTypeContainer = bookTypeContainer;
  }

  renderBook(clearParent, book) {
    const result = this.bookElementCreator.createOrUpdateBookElement(book);
    if (clearParent) {
      this.bookContainer.innerHTML = "";
    }
    if (clearParent || !result.existing) {
      this.bookContainer.insertAdjacentElement("afterbegin", result.node);
    }
  }

  removeBook(book) {
    this.bookElementCreator.removeBook(book);
  }

  renderBooks(clearParent, ...books) {
    books.forEach((book) => this.renderBook(clearParent, book));
  }

  renderType(clearParent, bookType) {
    if (clearParent) {
      this.bookTypeContainer.innerHTML = "";
    }
    if (!this.bookTypeContainer.querySelector(`[data-book-type="${bookType}"]`) || clearParent) {
      this.bookTypeContainer.insertAdjacentElement("afterbegin", this.bookElementCreator.createBookTypeElement(bookType));
    }
  }

  renderTypes(clearParent, ...bookTypes) {
    bookTypes.forEach((bookType) => this.renderType(clearParent, bookType));
  }
}

class App {
  static _instance;
  static get() {
    if (!this._instance) this._instance = new App();
    return this._instance;
  }

  constructor(modal, form, bookManager, bookRenderer, showActiveBookType) {
    this.modal = modal;
    this.form = form;
    this.bookManager = bookManager;
    this.bookRenderer = bookRenderer;
    this.showActiveBookType = showActiveBookType;
    this.activeBookType = "";
  }

  createBook() {
    this.form.onSubmit((event, formProps) => {
      this._createOrUpdate(false, formProps);
    });

    this.form.clear();
    this.modal.showModal("New Book", this.form.node);
  }

  updateBook(book) {
    this.form.onSubmit((event, formProps) => {
      this._createOrUpdate(true, formProps);
    });
    const bookObj = this.bookManager.bookList.find((x) => x.id === book) || book;
    this.form.fillInputs(bookObj);
    this.modal.showModal("Update: " + bookObj.title, this.form.node);
  }

  setActiveBookType(bookType) {
    const changed = bookType !== this.activeBookType;
    if (changed) {
      this.activeBookType = bookType;
      this.bookRenderer.renderBooks(true, ...this.bookManager.bookList);
      this.showActiveBookType(bookType);
    }
  }

  _createOrUpdate(update, formProps) {
    const book = this._formPropsToBook(formProps, !update);
    if (book.status === "Read") book.onPage = book.pageCount;
    if (update) this.bookManager.updateBook(book);
    else this.bookManager.addBook(book);
    if (this.activeBookType === book.bookType) this.bookRenderer.renderBook(false, book);
    else this.bookRenderer.removeBook(book);
    this.bookRenderer.renderType(false, book.bookType);
    this.modal.hideModal();
  }

  _formPropsToBook(formProps, generateId) {
    const book = new Book(
      formProps.id === generateId ? Math.random().toString() : formProps.id,
      formProps.title,
      formProps.pageCount,
      formProps.bookType,
      formProps.description,
      formProps.status,
      formProps.author,
      formProps.onPage
    );

    return book;
  }
}

function initModal() {
  const template = document.getElementById("modal-template");
  const modal = new Modal(template.content.querySelector(".modal-backdrop"), template.content.querySelector(".modal-card"));
  return modal;
}

function initForm() {
  const template = document.getElementById("new-book-form-template");
  const form = new Form(template.content.querySelector("form"));
  return form;
}

function initBookRenderer() {
  const bookTypeTemplate = document.getElementById("category-item-template");
  const bookCardTemplate = document.getElementById("book-card-template");
  const bookRenderer = new BookRenderer(new BookElementCreator(bookCardTemplate, bookTypeTemplate), bookContainer, bookTypeContainer);
  return bookRenderer;
}

function init() {
  const modal = initModal();
  const form = initForm();
  const bookManager = new BookManager();
  const bookRenderer = initBookRenderer();
  const showActiveBookType = (bookType) => {
    document.querySelector(".container>h1").textContent = bookType;
    const elements = document.querySelectorAll(".category-item__link");
    for (const element of elements) {
      if (element.textContent !== bookType) {
        element.parentElement.classList.remove("active");
      } else {
        element.parentElement.classList.add("active");
      }
    }
  };

  const app = new App(modal, form, bookManager, bookRenderer, showActiveBookType);

  addButton.addEventListener("click", app.createBook.bind(app));
  bookContainer.addEventListener("click", (event) => {
    if (event.target.dataset.bookId) {
      app.updateBook.call(app, event.target.dataset.bookId);
    }
  });
  bookTypeContainer.addEventListener("click", (event) => {
    if (event.target.parentElement.dataset.bookType) {
      app.setActiveBookType.call(app, event.target.parentElement.dataset.bookType);
    }
  });
}

init();
