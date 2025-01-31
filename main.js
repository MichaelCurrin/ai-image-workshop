const FORM_FIELDS = [
  "prompt",
  "model",
  "seed",
  "width",
  "height",
  "nologo",
  "nofeed",
  "safe",
];
const FORM_DATA_STORAGE_KEY = "pollinationsFormData";

const IMAGE_API_GENERATE_URL = "https://image.pollinations.ai/prompt/";
const IMAGE_API_MODELS_URL = "https://image.pollinations.ai/models";

/**
 * Save the form data to localStorage, keyed by FORM_DATA_STORAGE_KEY.
 */
function saveFormData() {
  const formData = {};

  FORM_FIELDS.forEach((fieldId) => {
    const element = document.getElementById(fieldId);
    formData[fieldId] =
      element.type === "checkbox" ? element.checked : element.value;
  });
  localStorage.setItem(FORM_DATA_STORAGE_KEY, JSON.stringify(formData));
}

/**
 * Load form data from localStorage and populates the form fields.
 */
function loadFormData() {
  const savedData = localStorage.getItem(FORM_DATA_STORAGE_KEY);
  if (savedData) {
    const formData = JSON.parse(savedData);
    FORM_FIELDS.forEach((fieldId) => {
      const element = document.getElementById(fieldId);
      if (element) {
        if (element.type === "checkbox") {
          element.checked = formData[fieldId];
        } else {
          element.value = formData[fieldId];
        }
      }
    });
  }
}

/**
 * Set up event listeners on the form fields to save the form data to localStorage.
 *
 * Uses the 'input' and 'change' events to capture changes in all the form fields.
 * These events are chosen to ensure that the form data is updated when the user
 * types something in a text field, or selects/deselects a checkbox.
 */
function setupFormListeners() {
  FORM_FIELDS.forEach((fieldId) => {
    const element = document.getElementById(fieldId);
    if (element) {
      element.addEventListener("input", saveFormData);
      element.addEventListener("change", saveFormData);
    }
  });
}

async function fetchModels() {
  try {
    const response = await fetch(IMAGE_API_MODELS_URL);
    const models = await response.json();

    const modelSelect = document.getElementById("model");
    modelSelect.innerHTML = ""; // Clear loading option

    const defaultOption = document.createElement("option");
    defaultOption.value = "";
    defaultOption.textContent = "Select a model";
    modelSelect.appendChild(defaultOption);

    models.forEach((model) => {
      const option = document.createElement("option");
      option.value = model;
      option.textContent = model;
      modelSelect.appendChild(option);
    });
  } catch (error) {
    console.error("Error fetching models:", error);
    document.getElementById("modelError").style.display = "block";
  }

  loadFormData();
}

/**
 * Build the URL for the API.
 *
 * @returns {string} The URL for the API request.
 */
function buildUrl() {
  const userPrompt = document.getElementById("prompt").value;

  const prompt = encodeURIComponent(userPrompt);
  let url = `${IMAGE_API_GENERATE_URL}${prompt}`;

  const params = new URLSearchParams();

  const model = document.getElementById("model").value;
  if (model) {
    params.append("model", model);
  }

  const seed = document.getElementById("seed").value;
  if (seed) {
    params.append("seed", seed);
  }

  const width = document.getElementById("width").value;
  if (width !== "1024") {
    params.append("width", width);
  }

  const height = document.getElementById("height").value;
  if (height !== "1024") {
    params.append("height", height);
  }

  if (document.getElementById("nologo").checked) {
    params.append("nologo", "true");
  }
  if (document.getElementById("nofeed").checked) {
    params.append("nofeed", "true");
  }
  if (document.getElementById("safe").checked) {
    params.append("safe", "true");
  }

  const queryString = params.toString();
  if (queryString) {
    return `${url}?${queryString}`;
  }

  return url;
}
/**
 * Fetches the error details for a failed image generation request.
 *
 * @param {string} url - The URL of the image generation request that failed.
 *   Expect to be a 500 or similar so don't check status code.
 */
async function getImageErrorDetails(url) {
  const response = await fetch(url, { method: "GET" });

  const respData = await response.json();
  const { error, message } = respData;

  if (!error || !message) {
    return "Error loading image.";
  }
  return `${error}: ${message}`;
}

/**
 * Updates the gallery with a new image using the provided URL.
 *
 * @param {string} url - The URL of the image to be loaded.
 */
async function updateImage(url) {
  const imageContainer = document.getElementById("gallery");
  imageContainer.innerHTML = "";

  const a = document.createElement("a");
  a.href = url;
  a.target = "_blank";
  a.rel = "noopener";

  const img = document.createElement("img");

  img.onerror = async function () {
    console.log("Image failed to load:", url);

    const errorMessage = document.getElementById("errorMessage");
    const p = document.createElement("p");

    const errorOutput = await getImageErrorDetails(url);
    p.textContent = errorOutput;
    p.style.color = "white";

    errorMessage.innerHTML = "";
    errorMessage.appendChild(p);
  };

  img.onload = function () {
    console.log("Image loaded successfully:", url);
  };

  img.src = url;
  a.appendChild(img);
  imageContainer.appendChild(a);
}

function process() {
  const url = buildUrl();
  updateImage(url);
  saveFormData();
}

// Initialize the form
fetchModels();
setupFormListeners();

document.addEventListener("keydown", (e) => {
  const isTextArea = e.target.tagName === "TEXTAREA";
  if (
    (e.key === "Enter" && !isTextArea) ||
    (e.ctrlKey && e.key === "Enter" && isTextArea)
  ) {
    process();
  }
});

document.getElementById("imageForm").addEventListener("submit", function (e) {
  e.preventDefault();
  process();
});
