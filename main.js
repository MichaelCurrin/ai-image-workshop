var FORM_FIELDS = ['prompt', 'model', 'seed', 'width', 'height', 'nologo', 'private', 'enhance', 'safe'];
var FORM_DATA_STORAGE_KEY = 'pollinationsFormData';

var MODEL_OPTIONS_CACHE_KEY = 'modelOptions';
var MODEL_OPTIONS_EXPIRY_KEY = 'modelOptionsExpiry';

var IMAGE_API_GENERATE_URL = 'https://image.pollinations.ai/prompt/';
var IMAGE_API_MODELS_URL = 'https://image.pollinations.ai/models'

// Save form data to localStorage
function saveFormData() {
  const formData = {};

  FORM_FIELDS.forEach(fieldId => {
    const element = document.getElementById(fieldId);
    formData[fieldId] = element.type === 'checkbox' ? element.checked : element.value;
  });
  localStorage.setItem(FORM_DATA_STORAGE_KEY, JSON.stringify(formData));
}

// Load form data from localStorage
function loadFormData() {
  const savedData = localStorage.getItem(FORM_DATA_STORAGE_KEY);
  if (savedData) {
    const formData = JSON.parse(savedData);
    FORM_FIELDS.forEach(fieldId => {
      const element = document.getElementById(fieldId);
      if (element) {
        if (element.type === 'checkbox') {
          element.checked = formData[fieldId];
        } else {
          element.value = formData[fieldId];
        }
      }
    });
  }
}

// Add input event listeners to all form fields
function setupFormListeners() {
  FORM_FIELDS.forEach(fieldId => {
    const element = document.getElementById(fieldId);
    if (element) {
      element.addEventListener('input', saveFormData);
      element.addEventListener('change', saveFormData);
    }
  });
}
async function fetchModels() {
  try {
    const response = await fetch(IMAGE_API_MODELS_URL);
    const models = await response.json();

    const modelSelect = document.getElementById('model');
    modelSelect.innerHTML = ''; // Clear loading option

    // Add default empty option
    const defaultOption = document.createElement('option');
    defaultOption.value = '';
    defaultOption.textContent = 'Select a model';
    modelSelect.appendChild(defaultOption);

    models.forEach(model => {
      const option = document.createElement('option');
      option.value = model;
      option.textContent = model;
      modelSelect.appendChild(option);
    });
  } catch (error) {
    console.error('Error fetching models:', error);
    document.getElementById('modelError').style.display = 'block';
  }

  // Load saved data after models are populated
  loadFormData();
}


function buildUrl() {
  const userPrompt = document.getElementById('prompt').value

  const prompt = encodeURIComponent(userPrompt);
  let url = `${IMAGE_API_GENERATE_URL}${prompt}`;

  const params = new URLSearchParams();

  const model = document.getElementById('model').value;
  if (model) {
    params.append('model', model)
  };

  const seed = document.getElementById('seed').value;
  if (seed) {
    params.append('seed', seed)
  };

  const width = document.getElementById('width').value;
  if (width !== '1024') {
    params.append('width', width)
  };

  const height = document.getElementById('height').value;
  if (height !== '1024') {
    params.append('height', height)
  };

  if (document.getElementById('nologo').checked) {
    params.append('nologo', 'true')
  };
  if (document.getElementById('private').checked) {
    params.append('private', 'true')
  };
  if (document.getElementById('enhance').checked) {
    params.append('enhance', 'true')
  };
  if (document.getElementById('safe').checked) {
    params.append('safe', 'true')
  };

  const queryString = params.toString();
  if (queryString) {
    url += `?${queryString}`;
  }

  return url;
}

function updateImage(url) {
  const gallery = document.getElementById('gallery');
  gallery.innerHTML = '';

  const a = document.createElement('a');
  a.href = url;
  a.target = '_blank';
  a.rel = 'noopener';

  const img = document.createElement('img');
  img.src = url;
  a.appendChild(img);
  gallery.appendChild(a);
}

// Initialize the form
fetchModels();
setupFormListeners();

function process() {
  const url = buildUrl();
  updateImage(url)
  saveFormData();
}

document.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && document.activeElement.tagName !== 'TEXTAREA') {
    process();
  }
});

document.getElementById('imageForm')
  .addEventListener('submit', function (e) {
    e.preventDefault();
    process()
  });
