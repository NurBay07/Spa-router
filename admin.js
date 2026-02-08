const tableBody = document.querySelector('#requestsTable tbody');
const statusEl = document.getElementById('adminStatus');
const refreshBtn = document.getElementById('refreshBtn');

function formatDate(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value || '';
  return date.toLocaleString('kk-KZ');
}

function setStatus(text) {
  statusEl.textContent = text;
}

function renderRows(rows) {
  tableBody.innerHTML = '';
  rows.forEach((row) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${row.id}</td>
      <td>${row.name}</td>
      <td>${row.phone}</td>
      <td>${row.message}</td>
      <td>${formatDate(row.created_at)}</td>
    `;
    tableBody.appendChild(tr);
  });
}

async function loadRequests() {
  setStatus('Жүктелуде...');
  try {
    const res = await fetch('/api/requests');
    if (!res.ok) throw new Error('HTTP error');
    const data = await res.json();
    if (!data.ok) throw new Error('API error');
    if (!data.data.length) {
      setStatus('Қазір сұраныс жоқ.');
      tableBody.innerHTML = '';
      return;
    }
    setStatus(`Барлығы: ${data.data.length}`);
    renderRows(data.data);
  } catch {
    setStatus('Жүктеу қатесі. Серверді тексеріңіз.');
  }
}

refreshBtn.addEventListener('click', loadRequests);
window.addEventListener('load', loadRequests);
