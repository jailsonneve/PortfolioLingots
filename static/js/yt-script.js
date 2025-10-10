// ============================
// CONFIGURAÇÕES GERAIS
// ============================
const apiKey = 'AIzaSyBkmoP3XUpoOla6hNGDZDgRPENplJ4rcEk';
const channelId = 'UCGZWhMVk6ecteLblm1UcoTg';
const maxResults = 24;
const CACHE_KEY = 'lingotz_videos';
const CACHE_TIME = 60 * 60 * 1000; // 1 hora

// Containers das seções
const sections = {
  edicoes: document.getElementById('Listedicoes'),
  valorant: document.getElementById('videoListVava'),
  dark: document.getElementById('videoListDark'),
  shorts: document.getElementById('shortsList'),
  outros: document.getElementById('projetosList')
};

const searchInput = document.getElementById('searchInput');
let allVideos = [];

// ============================
// INSERE BOTÃO DE ATUALIZAÇÃO
// ============================
document.addEventListener("DOMContentLoaded", () => {
  const container = document.querySelector("nav .container");
  const btn = document.createElement("button");
  btn.id = "refreshBtn";
  btn.className = "btn btn-outline-light ms-2";
  btn.innerHTML = "♻️ Atualizar vídeos";
  btn.title = "Limpar cache e recarregar vídeos";

  btn.addEventListener("click", async () => {
    const result = await Swal.fire({
      title: 'Atualizar vídeos?',
      text: 'Isso vai limpar o cache e recarregar da API do YouTube.',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#7f00ff',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sim, atualizar!',
      cancelButtonText: 'Cancelar',
      background: '#121212',
      color: '#fff'
    });

    if (!result.isConfirmed) return;

    Swal.fire({
      title: 'Atualizando vídeos...',
      html: 'Buscando novos vídeos no canal 🎥',
      allowOutsideClick: false,
      background: '#121212',
      color: '#fff',
      didOpen: () => Swal.showLoading()
    });

    try {
      localStorage.removeItem(CACHE_KEY);
      allVideos = await getVideos(true);
      const categorias = categorizeVideos(allVideos);
      displayVideosByType(categorias);

      Swal.fire({
        icon: 'success',
        title: 'Atualização completa!',
        text: 'Os vídeos foram atualizados com sucesso 🚀',
        confirmButtonColor: '#7f00ff',
        background: '#121212',
        color: '#fff'
      });
    } catch (error) {
      console.error('❌ Erro ao atualizar vídeos:', error);
      Swal.fire({
        icon: 'error',
        title: 'Erro na atualização',
        text: 'Não foi possível buscar os vídeos. Verifique sua conexão e tente novamente.',
        confirmButtonColor: '#d33',
        background: '#121212',
        color: '#fff'
      });
    }
  });

  container.appendChild(btn);
});

// ============================
// FUNÇÃO: Buscar info do canal
// ============================
async function fetchChannelInfo() {
  try {
    Swal.fire({
      title: 'Carregando canal...',
      html: 'Buscando informações do canal 📺',
      allowOutsideClick: false,
      background: '#121212',
      color: '#fff',
      didOpen: () => Swal.showLoading()
    });

    const url = `https://www.googleapis.com/youtube/v3/channels?part=snippet&id=${channelId}&key=${apiKey}`;
    const res = await fetch(url);
    const data = await res.json();

    if (!data.items?.length) {
      throw new Error('Canal não encontrado.');
    }

    const snippet = data.items[0].snippet;
    document.getElementById('canalFoto').src = snippet.thumbnails.high.url;
    document.getElementById('canalNome').textContent = snippet.title;
    document.getElementById('canalDescricao').textContent = snippet.description;

    Swal.close(); // fecha o loading
  } catch (error) {
    Swal.fire({
      icon: 'error',
      title: 'Erro ao carregar canal',
      text: 'Não foi possível carregar as informações do canal. 😢',
      confirmButtonColor: '#d33',
      background: '#121212',
      color: '#fff'
    });
    console.error('❌ Erro ao buscar informações do canal:', error);
  }
}

// ============================
// FUNÇÃO: Buscar vídeos da API
// ============================
async function fetchVideosFromAPI() {
  try {
    const url = `https://www.googleapis.com/youtube/v3/search?key=${apiKey}&channelId=${channelId}&part=snippet&type=video&order=date&maxResults=${maxResults}`;
    const res = await fetch(url);
    const data = await res.json();
    return data.items || [];
  } catch (error) {
    Swal.fire({
      icon: 'error',
      title: 'Erro de conexão',
      text: 'Falha ao buscar vídeos. Tente novamente mais tarde.',
      confirmButtonColor: '#d33',
      background: '#121212',
      color: '#fff'
    });
    console.error('❌ Erro ao buscar vídeos:', error);
    return [];
  }
}

// ============================
// FUNÇÃO: Cache com LocalStorage
// ============================
async function getVideos(forceRefresh = false) {
  const cached = localStorage.getItem(CACHE_KEY);

  if (!forceRefresh && cached) {
    const { data, time } = JSON.parse(cached);
    if (Date.now() - time < CACHE_TIME) {
      console.log('⚡ Usando cache local');
      return data;
    } else {
      localStorage.removeItem(CACHE_KEY);
    }
  }

  try {
    Swal.fire({
      title: 'Carregando vídeos...',
      html: 'Isso pode levar alguns segundos 🎬',
      allowOutsideClick: false,
      background: '#121212',
      color: '#fff',
      didOpen: () => Swal.showLoading()
    });

    console.log('📡 Buscando vídeos da API...');
    const freshData = await fetchVideosFromAPI();
    localStorage.setItem(CACHE_KEY, JSON.stringify({ data: freshData, time: Date.now() }));

    Swal.close();
    return freshData;
  } catch (error) {
    Swal.fire({
      icon: 'error',
      title: 'Falha ao carregar vídeos',
      text: 'Ocorreu um erro inesperado ao buscar os vídeos.',
      confirmButtonColor: '#d33',
      background: '#121212',
      color: '#fff'
    });
    console.error('❌ Erro ao buscar vídeos:', error);
    return [];
  }
}

// ============================
// FUNÇÃO: Renderizar vídeo
// ============================
function renderVideo(video, container, badge = '') {
  const { title, description, thumbnails } = video.snippet;
  const videoId = video.id.videoId;

  const col = document.createElement('div');
  col.className = 'col-md-4 mb-4';
  col.innerHTML = `
    <div class="video-card p-3 h-100 position-relative shadow-sm rounded">
      ${badge ? `<span class="badge bg-danger position-absolute top-0 start-0 m-2">${badge}</span>` : ''}
      <a href="https://www.youtube.com/watch?v=${videoId}" target="_blank" class="text-decoration-none text-dark">
        <img src="${thumbnails.medium.url}" alt="${title}" class="img-fluid rounded mb-2">
        <h5>${title}</h5>
        <p>${description.substring(0, 90)}...</p>
      </a>
    </div>
  `;
  container.appendChild(col);
}

// ============================
// FUNÇÃO: Classificar vídeos pelos ifs explícitos
// ============================
function categorizeVideos(videos) {
  const categorias = {
    edicoes: [],
    valorant: [],
    dark: [],
    shorts: [],
    outros: []
  };

  videos.forEach(video => {
    const title = video.snippet.title.toLowerCase();
    const desc = video.snippet.description.toLowerCase();

    if (title.includes('edits') || title.includes('edit') || desc.includes('edits') || desc.includes('edit')) {
      categorias.edicoes.push(video);
    } else if (title.includes('valorant') || desc.includes('valorant') || title.includes('#valorant') || desc.includes('#valorant')) {
      categorias.valorant.push(video);
    } else if (title.includes('dark') || desc.includes('dark') || title.includes('#dark') || desc.includes('#dark')) {
      categorias.dark.push(video);
    } else if (title.includes('shorts') || desc.includes('shorts') || title.includes('#shorts') || desc.includes('#shorts')) {
      categorias.shorts.push(video);
    } else {
      categorias.outros.push(video);
    }
  });

  return categorias;
}

// ============================
// FUNÇÃO: Exibir vídeos por tipo
// ============================
function displayVideosByType(categorias) {
  Object.values(sections).forEach(sec => (sec.innerHTML = ''));

  categorias.edicoes.forEach(v => renderVideo(v, sections.edicoes, 'Edição'));
  categorias.valorant.forEach(v => renderVideo(v, sections.valorant, 'Valorant'));
  categorias.dark.forEach(v => renderVideo(v, sections.dark, 'Dark'));
  categorias.shorts.forEach(v => renderVideo(v, sections.shorts, 'Short'));
  categorias.outros.forEach(v => renderVideo(v, sections.outros, 'Extra'));
}

// ============================
// EVENTO: Filtro de busca
// ============================
searchInput.addEventListener('input', () => {
  const value = searchInput.value.toLowerCase();
  const filtered = allVideos.filter(v =>
    v.snippet.title.toLowerCase().includes(value)
  );
  const categoriasFiltradas = categorizeVideos(filtered);
  displayVideosByType(categoriasFiltradas);
});

// ============================
// INICIALIZAÇÃO
// ============================
async function init() {
  await fetchChannelInfo();
  allVideos = await getVideos();
  const categorias = categorizeVideos(allVideos);
  displayVideosByType(categorias);
}

init();