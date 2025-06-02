const apiUrl = 'https://script.google.com/macros/s/AKfycbwsNRZRsusNJzTsKgbvYRTgcGQQp58Gq5nqA4iW0Zk0YhqL9kVH2rMSIwS01xEKrsfqFw/exec';
const pageSize = 150;
let data = [];
let currentPage = 1;

async function fetchData() {
  try {
    showLoading(true);
    const response = await fetch(apiUrl);
    if (!response.ok) throw new Error('Gagal mengambil data dari API');
    data = await response.json();
    data = data.map((row, index) => ({
      ...row,
      _rowIndex: index + 2 // +2 karena header dan 1-based indexing
    }));
    renderTable();
  } catch (err) {
    showError('Error: ' + err.message);
  } finally {
    showLoading(false);
  }
}

function showError(message) {
  const errorDiv = document.getElementById('error');
  errorDiv.textContent = message;
  errorDiv.style.display = 'block';
  setTimeout(() => errorDiv.style.display = 'none', 3000);
}

function showLoading(show) {
  document.getElementById('loading').style.display = show ? 'block' : 'none';
}

function updatePageInfo() {
  const start = (currentPage - 1) * pageSize + 1;
  const end = Math.min(currentPage * pageSize, data.length);
  const total = data.length;
  document.getElementById('pageInfo').textContent = 
    'Halaman ' + currentPage + ' - Menampilkan ' + start + '-' + end + ' dari ' + total + ' data';
}

function renderTable() {
  const tbody = document.getElementById('table-body');
  tbody.innerHTML = '';
  const start = (currentPage - 1) * pageSize;
  const end = Math.min(start + pageSize, data.length);
  const pageData = data.slice(start, end);

  pageData.forEach(row => {
    const tr = document.createElement('tr');
    tr.innerHTML = 
      '<td>' + row.tanggal + '</td>' +
      '<td>' + (row.tanggalClose || '') + '</td>' +      
      '<td>' + row.mapPO + '</td>' +
      '<td>' + row.waktu + '</td>' +
      '<td>' + row.po + '</td>' +
      '<td>' +
        '<select onchange="updateStatus(' + row._rowIndex + ', this)">' +
          '<option value="Open"' + (row.status === 'Open' ? ' selected' : '') + '>Open</option>' +
          '<option value="Closed"' + (row.status === 'Closed' ? ' selected' : '') + '>Closed</option>' +
        '</select>' +
      '</td>' +
      '<td>' +
        '<input type="text" value="' + (row.keterangan || '') + '" onchange="updateKeterangan(' + row._rowIndex + ', this)">' +
      '</td>';
    tbody.appendChild(tr);
  });

  document.getElementById('prevBtn').disabled = currentPage === 1;
  document.getElementById('nextBtn').disabled = end >= data.length;
  updatePageInfo();
}

function prevPage() {
  if (currentPage > 1) {
    currentPage--;
    renderTable();
  }
}

function nextPage() {
  if (currentPage * pageSize < data.length) {
    currentPage++;
    renderTable();
  }
}

async function updateStatus(rowIndex, selectElement) {
  showLoading(true);
  try {
    const value = selectElement.value;
    const response = await fetch(apiUrl + '?action=update&row=' + rowIndex + '&col=4&value=' + encodeURIComponent(value));
    if (!response.ok) throw new Error('Gagal memperbarui status');
    const updatedData = await response.json();
    data = updatedData.map((row, index) => ({
      ...row,
      _rowIndex: index + 2
    }));
    renderTable();
  } catch (err) {
    showError('Gagal menyimpan status: ' + err.message);
  } finally {
    showLoading(false);
  }
}

async function updateKeterangan(rowIndex, inputElement) {
  showLoading(true);
  try {
    const value = inputElement.value;
    const response = await fetch(apiUrl + '?action=update&row=' + rowIndex + '&col=5&value=' + encodeURIComponent(value));
    if (!response.ok) throw new Error('Gagal memperbarui keterangan');
    const updatedData = await response.json();
    data = updatedData.map((row, index) => ({
      ...row,
      _rowIndex: index + 2
    }));
    renderTable();
  } catch (err) {
    showError('Gagal menyimpan keterangan: ' + err.message);
  } finally {
    showLoading(false);
  }
}

function toggleMenu() {
  const navLinks = document.getElementById('navLinks');
  const navToggle = document.querySelector('.nav-toggle');
  navLinks.classList.toggle('show');
  navToggle.classList.toggle('active');
}

window.addEventListener('scroll', () => {
  const navbar = document.querySelector('.navbar');
  if (window.scrollY > 50) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }
});

window.onload = fetchData;