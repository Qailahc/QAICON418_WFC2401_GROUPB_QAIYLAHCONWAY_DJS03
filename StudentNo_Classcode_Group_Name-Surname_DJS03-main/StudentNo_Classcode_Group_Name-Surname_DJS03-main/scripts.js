// Importing necessary data from the data.js file - unchanged
import { books, authors, genres, BOOKS_PER_PAGE } from "./data.js";

// Helper function to get a DOM element by its selector
const getElement = (selector) => document.querySelector(selector);

// Initialize page number and matches array - unchanged
let page = 1;
let matches = books;  // Initially, matches contain all books


// Function to create and append book previews to a container - 
// createBookPreviews function takes an array of books and a container element, 
// creates a button for each book with an image, title, and author, 
// and then appends all these buttons to the container in one operation using a DocumentFragment for better performance

const createBookPreviews = (books, container) => {     // is defined as an arrow function 
  const fragment = document.createDocumentFragment();
  books.forEach(({ author, id, image, title }) => {    // iterate over each book in the books array
    const element = document.createElement("button");  // creating new button
    element.classList.add("preview");
    element.dataset.preview = id;                      // setting innerHTML
    element.innerHTML = `                              
      <img class="preview__image" src="${image}" />
      <div class="preview__info">
        <h3 class="preview__title">${title}</h3>
        <div class="preview__author">${authors[author]}</div>
      </div>
    `;
    fragment.appendChild(element);                     // appending the button to the Fragment
  });
  container.appendChild(fragment);                     // appending the fragment to the Container
};

// Function to create and append options to a select element
// This function is useful for populating dropdown menus based on dynamic data

const createOptions = (options, defaultOption, container) => {  // defined as an arrow function 
  const fragment = document.createDocumentFragment();           // creating a Document Fragment
  fragment.appendChild(new Option(defaultOption, "any"));       // creating and appending the Default Option
  Object.entries(options).forEach(([id, name]) => {             // iterating Over the Options Object
    fragment.appendChild(new Option(name, id));                 // creating and Appending Each Option
  });
  container.appendChild(fragment);
};

// Function to apply a theme (night or day) to the document
// function adjusts the theme of the web page by changing the values of the CSS custom properties --color-dark and --color-light
// shorter  version 
const applyTheme = (theme) => {
  const isNight = theme === "night";
  document.documentElement.style.setProperty("--color-dark", isNight ? "255, 255, 255" : "10, 10, 20");
  document.documentElement.style.setProperty("--color-light", isNight ? "10, 10, 20" : "255, 255, 255");
};

// Function to update the "Show more" button text and state
// function ensures that the button accurately reflects the state of the book list 
// and provides a better user experience by preventing unnecessary actions

const updateShowMoreButton = () => {                             // calculating remaining books
  const remainingBooks = matches.length - page * BOOKS_PER_PAGE; // matches.length gives the total number of books that match the current search/filter criteria
  const button = getElement("[data-list-button]");               // update Button's Inner HTML 
  button.innerHTML = `
    <span>Show more</span>
    <span class="list__remaining">(${remainingBooks > 0 ? remainingBooks : 0})</span>
  `;                                      // ensure that the displayed number is never negative
  button.disabled = remainingBooks <= 0;  // sets the disabled property of the button to true if remainingBooks is less than or equal to 0, otherwise it sets it to false
};                                        // prevents users from clicking unecessarily 


// Functions closeOverlay and openOverlay controls the visibility of overlay elements on a web page
// Function to close an overlay
const closeOverlay = (selector) => getElement(selector).open = false; // CSS selector used to identify the overlay element in the DOM that should be closed

// Function to open an overlay and optionally focus on an element within it
const openOverlay = (selector, focusSelector = null) => {
  getElement(selector).open = true;                                   // makes overlay visible
  if (focusSelector) getElement(focusSelector).focus();
};

// Function to apply search filters and return matching books
// function filters the books array based on the provided filters object containing 
// search criteria for title, author, and genre

const applySearchFilters = (filters) => {
  const { title, author, genre } = filters;
    // filter method creates a new array with all elements that pass the test implemented by the provided function
  return books.filter(book => {  
    // titleMatch is a boolean that determines if a book's title matches the search criteria
    const titleMatch = !title.trim() || book.title.toLowerCase().includes(title.toLowerCase()); 
    // Checks if the author filter is set to "any". If true, it means no author filter is applied
    // Checks if the book's author matches the specified author in the search criteria
    const authorMatch = author === "any" || book.author === author; 
    // Checks if the genre filter is set to "any". If true, it means no genre filter is applied
    // Checks if the book's genres array includes the specified genre
    const genreMatch = genre === "any" || book.genres.includes(genre);
    // Returning the Match Result
    return titleMatch && authorMatch && genreMatch;
  });
};

// Event listener function to handle form submissions 
// Function facilitates handling form submissions in a clean and reusable way - event listener function designed to handle form submissions
const handleFormSubmit = (formSelector, handler) => {
  getElement(formSelector).addEventListener("submit", (event) => { // Attaching the Event Listener
    event.preventDefault();                                        // Event Callback Function
    const formData = new FormData(event.target);
    handler(Object.fromEntries(formData));  // Converts the FormData object to a plain JavaScript object using Object.fromEntries 
                                            // and passes this object to the handler function
  });
};

// Add event listeners for opening and closing overlays
// Code dynamically attaches event listeners to elements responsible for opening and closing overlays for "search" and "settings"
// This approach reduces redundancy and improves maintainability, making it easier to handle similar functionalities for multiple overlays
["search", "settings"].forEach(type => {
  getElement(`[data-${type}-cancel]`).addEventListener("click", () => closeOverlay(`[data-${type}-overlay]`));
  getElement(`[data-header-${type}]`).addEventListener("click", () => openOverlay(`[data-${type}-overlay]`, type === "search" ? "[data-search-title]" : null));
});
getElement("[data-list-close]").addEventListener("click", () => closeOverlay("[data-list-active]"));

// Handle settings form submission to apply the selected theme
handleFormSubmit("[data-settings-form]", ({ theme }) => {
  applyTheme(theme);
  closeOverlay("[data-settings-overlay]");
});

// Handle search form submission to filter books and update the display,
// scrolls the window to the top, and closes any search overlay
handleFormSubmit("[data-search-form]", (filters) => {
  matches = applySearchFilters(filters);
  page = 1;
  // Gets an element with the attribute [data-list-message] and toggles the CSS class list__message_show based on whether matches has any items
  getElement("[data-list-message]").classList.toggle("list__message_show", matches.length < 1);
  // Contains the book previews or a list of items that need to be updated
  getElement("[data-list-items]").innerHTML = "";
  // The first argument is a slice of the matches array, containing items from index 0 to BOOKS_PER_PAGE
  // Second argument is an element where the book previews will be inserted
  createBookPreviews(matches.slice(0, BOOKS_PER_PAGE), getElement("[data-list-items]")); 
  // Updates the "show more" button if it exists
  updateShowMoreButton();
  // Scrolls the window to the top with a smooth animation when the search operation is performed
  // Provides a smooth user experience by scrolling back to the top of the page after the search is completed
  window.scrollTo({ top: 0, behavior: "smooth" });
  // IndicatES that the search operation has been completed and any search overlay should be closed
  closeOverlay("[data-search-overlay]");
});

// Handle "Show more" button click to display more books
// When the button is clicked, it retrieves the next set of books to display based on the current page, 
// updates the page count, and updates the "Show more" button accordingly

// Adds an event listener to an element with the attribute [data-list-button]
getElement("[data-list-button]").addEventListener("click", () => {
    // Represents the range of books to be displayed when the "Show more" button is clicked
  createBookPreviews(matches.slice(page * BOOKS_PER_PAGE, (page + 1) * BOOKS_PER_PAGE), getElement("[data-list-items]"));
  page++;  // increments the value of the variable page by 1
  updateShowMoreButton();
});

// Handle book item click to show book details in an overlay
getElement("[data-list-items]").addEventListener("click", (event) => {
    // Uses the composedPath() method of the event object to find the path of the event, 
    // which essentially is an array of the DOM nodes that the event traversed.
    // It then uses the find() method to search for the first node with a dataset.preview attribute.
  const active = event.composedPath().find(node => node?.dataset?.preview);
  if (active) {
    const book = books.find(book => book.id === active.dataset.preview);
    if (book) {
      openOverlay("[data-list-active]");
      getElement("[data-list-blur]").src = book.image;
      getElement("[data-list-image]").src = book.image;
      getElement("[data-list-title]").innerText = book.title;
      getElement("[data-list-subtitle]").innerText = `${authors[book.author]} (${new Date(book.published).getFullYear()})`;
      getElement("[data-list-description]").innerText = book.description;
    }
  }
});

// Initial setup: create genre and author options, apply theme, display initial books, and update the "Show more" button
createOptions(genres, "All Genres", getElement("[data-search-genres]"));
createOptions(authors, "All Authors", getElement("[data-search-authors]"));
applyTheme(window.matchMedia("(prefers-color-scheme: dark)").matches ? "night" : "day");
createBookPreviews(matches.slice(0, BOOKS_PER_PAGE), getElement("[data-list-items]"));
updateShowMoreButton();

