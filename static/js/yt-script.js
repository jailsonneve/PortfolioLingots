// ============ CONFIGURAÇÃO ============
const apiKey = 'AIzaSyBkmoP3XUpoOla6hNGDZDgRPENplJ4rcEk';
const channelId = 'UCGZWhMVk6ecteLblm1UcoTg';

// ============ TEMA ============
const body = document.body;
const icon = document.getElementById("themeIcon");
document.getElementById("themeToggle").addEventListener("click", () => {
  const newTheme = body.getAttribute("data-theme") === "dark" ? "light" : "dark";
  body.setAttribute("data-theme", newTheme);
  localStorage.setItem("theme", newTheme);
  icon.className = newTheme === "dark" ? "bi bi-moon-stars" : "bi bi-sun";
});
body.setAttribute("data-theme", localStorage.getItem("theme") || "dark");

// ============ SERVIÇOS ============
const services = [
  { icon: "bi-scissors", title: "Edição de Vídeo", desc: "Cortes, ritmo e storytelling." },
  { icon: "bi-droplet-half", title: "Color Grading", desc: "Correção de cor e LUTs." },
  { icon: "bi-easel", title: "Motion Design", desc: "Animações, vinhetas e intros." },
];
const servicesContainer = document.getElementById("servicesContainer");
services.forEach(s => {
  servicesContainer.innerHTML += `
    <div class="col-md-4">
      <div class="card p-3">
        <div class="d-flex align-items-center">
          <i class="bi ${s.icon} fs-2 me-3" style="color:var(--accent)"></i>
          <div>
            <h5>${s.title}</h5>
            <p class="text-muted small">${s.desc}</p>
          </div>
        </div>
      </div>
    </div>`;
});

// ============ VIDEOS DO YOUTUBE ============
const videosGrid = document.getElementById("videosGrid");
const seeMore = document.getElementById("seeMore");

async function fetchVideos() {
  Swal.fire({
    title: "Carregando vídeos...",
    didOpen: () => Swal.showLoading(),
    allowOutsideClick: false,
    background: "var(--bg)",
    color: "var(--fg)"
  });

  try {
    const channelRes = await fetch(
      `https://www.googleapis.com/youtube/v3/channels?part=contentDetails&id=${channelId}&key=${apiKey}`
    );
    const channelData = await channelRes.json();
    const uploads = channelData.items[0].contentDetails.relatedPlaylists.uploads;

    const playlistRes = await fetch(
      `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${uploads}&maxResults=8&key=${apiKey}`
    );
    const playlistData = await playlistRes.json();
    
    videosGrid.innerHTML = "";
    playlistData.items.forEach(item => {
      const videoId = item.snippet.resourceId.videoId;
      const title = item.snippet.title;
      videosGrid.innerHTML += `
        <a href="https://www.youtube.com/watch?v=${videoId}" target="_blank" class="video-card text-decoration-none text-reset">
          <img class="video-thumb" src="https://i.ytimg.com/vi/${videoId}/hqdefault.jpg" alt="${title}">
          <div class="video-body">
            <div class="video-title">${title}</div>
          </div>
        </a>`;
    });

    Swal.close();
    seeMore.href = `https://www.youtube.com/channel/${channelId}`;
  } catch (err) {
    Swal.fire({
      icon: "error",
      title: "Falha ao carregar vídeos",
      text: "Verifique sua conexão ou a API Key.",
      confirmButtonColor: "var(--accent)"
    });
  }
}
fetchVideos();

// ============ BOTÃO CONTRATAR ============
document.getElementById("hireBtn").addEventListener("click", () => {
  const text = encodeURIComponent("Olá Richard! Tenho interesse em seus serviços de edição.");
  window.open(`https://wa.me/5535987016183?text=${text}`, "_blank");
});
