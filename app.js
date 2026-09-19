(() => {
  const listEl = document.getElementById('list');
  const emptyEl = document.getElementById('empty');
  const loadingEl = document.getElementById('loading');
  const countEl = document.getElementById('count');
  const searchEl = document.getElementById('search');
  const clearBtn = document.getElementById('clear-search');

  let products = [];

  const normalize = (str) =>
    str
      .toString()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim();

  const formatPrice = (value) => {
    const number = Number(value);

    if (Number.isNaN(number)) {
      return '—';
    }

    return number.toLocaleString('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
  };

  function escapeHtml(str) {
    return str.toString().replace(/[&<>"']/g, (character) => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
    })[character]);
  }

  function highlight(text, query) {
    if (!query) {
      return escapeHtml(text);
    }

    const normalizedText = normalize(text);
    const normalizedQuery = normalize(query);
    const index = normalizedText.indexOf(normalizedQuery);

    if (index === -1) {
      return escapeHtml(text);
    }

    return (
      escapeHtml(text.slice(0, index)) +
      '<mark>' +
      escapeHtml(text.slice(index, index + query.length)) +
      '</mark>' +
      escapeHtml(text.slice(index + query.length))
    );
  }

  function render() {
    const query = searchEl.value.trim();
    const normalizedQuery = normalize(query);

    clearBtn.hidden = query.length === 0;

    const filteredProducts = products.filter((product) => {
      if (!normalizedQuery) {
        return true;
      }

      return (
        normalize(product.producto).includes(normalizedQuery) ||
        normalize(product.categoria).includes(normalizedQuery)
      );
    });

    listEl.innerHTML = filteredProducts
      .map(
        (product) => `
          <li class="row" role="listitem">
            <span class="cat">
              ${escapeHtml(product.categoria)}
            </span>

            <span class="name">
              ${highlight(product.producto, query)}
            </span>

            <span class="price">
              ${formatPrice(product.precio)}
            </span>
          </li>
        `
      )
      .join('');

    emptyEl.hidden = filteredProducts.length !== 0;

    const total = products.length;

    countEl.textContent =
      filteredProducts.length === total
        ? `${total} producto${total === 1 ? '' : 's'} en stock`
        : `${filteredProducts.length} de ${total} productos`;
  }

  async function init() {
    try {
      const response = await fetch('products.json', {
        cache: 'no-store',
      });

      if (!response.ok) {
        throw new Error('No se pudo leer products.json');
      }

      products = await response.json();

      loadingEl.hidden = true;
      render();
    } catch (error) {
      loadingEl.textContent =
        'No se pudieron cargar los productos. Si abriste el archivo haciendo doble clic, ' +
        'probá abrir la aplicación con un servidor local (mirá el README) o subila a un hosting.';

      console.error(error);
    }
  }

  searchEl.addEventListener('input', render);

  clearBtn.addEventListener('click', () => {
    searchEl.value = '';
    searchEl.focus();
    render();
  });

  init();
})();