document.addEventListener('DOMContentLoaded', () => {
  const apiSearch = document.getElementById('apiSearch');
  const categoryList = document.getElementById('categoryList');

  fetch('https://api.ureshii.my.id/api-list')
    .then(response => response.json())
    .then(renderApiCategories)
    .catch(handleLoadError);

  apiSearch.addEventListener('input', debounce(searchApis, 300));

  function renderApiCategories(data) {
    categoryList.innerHTML = Object.entries(data).map(([category, endpoints]) => `
      <div class="api-category">
        <h3 class="category-title">${category}</h3>
        <div class="endpoint-list">
          ${endpoints.map(endpoint => `
            <div class="endpoint-card">
              <div class="endpoint-header">
                <span class="method ${endpoint.method.toLowerCase()}">${endpoint.method}</span>
                <span class="path">${endpoint.path}</span>
                <button class="test-btn" data-endpoint='${JSON.stringify(endpoint)}'>
                  <i class="fas fa-terminal"></i> Test
                </button>
              </div>
              <p class="description">${endpoint.description}</p>
              ${endpoint.params.length ? `
                <div class="params">
                  <strong>Parameters:</strong>
                  ${endpoint.params.map(p => `<span class="param-tag">${p}</span>`).join('')}
                </div>
              ` : ''}
            </div>
          `).join('')}
        </div>
      </div>
    `).join('');
    initTestButtons();
  }

  function initTestButtons() {
    document.querySelectorAll('.test-btn').forEach(btn => {
      btn.addEventListener('click', () => showTestModal(JSON.parse(btn.dataset.endpoint)));
    });
  }

  function showTestModal(endpoint) {
    const modalTemplate = document.getElementById('apiModalTemplate');
    const modal = modalTemplate.content.cloneNode(true);
    
    modal.querySelector('.modal-title').textContent = endpoint.name;
    const paramFields = modal.querySelector('.param-fields');
    endpoint.params.forEach(param => {
      paramFields.innerHTML += `
        <div class="form-group">
          <label>${param}</label>
          <input type="text" name="${param}" required>
        </div>
      `;
    });

    modal.querySelector('.test-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const formData = new FormData(e.target);
      const params = Object.fromEntries(formData.entries());
      const apiKey = modal.querySelector('.api-key').value;
      
      try {
        const response = await fetch(endpoint.path, {
          method: endpoint.method,
          headers: { 'X-API-Key': apiKey, 'Content-Type': 'application/json' },
          body: endpoint.method !== 'GET' ? JSON.stringify(params) : null
        });
        const data = await response.json();
        modal.querySelector('.api-response').textContent = JSON.stringify(data, null, 2);
      } catch (error) {
        modal.querySelector('.api-response').textContent = `Error: ${error.message}`;
      }
    });

    modal.querySelector('.close-modal').addEventListener('click', () => {
      document.body.removeChild(document.querySelector('.api-modal'));
    });

    document.body.appendChild(modal);
  }

  function debounce(func, timeout = 300) {
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => func.apply(this, args), timeout);
    };
  }

  function searchApis(e) {
    const term = e.target.value.toLowerCase();
    document.querySelectorAll('.endpoint-card').forEach(card => {
      card.style.display = card.textContent.toLowerCase().includes(term) ? 'block' : 'none';
    });
  }

  function handleLoadError() {
    categoryList.innerHTML = `
      <div class="error">
        Failed to load API data. <button onclick="location.reload()">Reload</button>
      </div>
    `;
  }
});