/* scripts.js — 穩定版 */
console.log('scripts.js loaded');

const videosMap = Object.create(null);
window.videosMap = videosMap;

class VideoPlayer {
  constructor(container, videoData) {
    this.container = container;
    this.videoData = videoData || {};
    if (!this.container) return;
    this._render();
  }
  _render() {
    this.container.innerHTML = '';
    const wrapper = document.createElement('div');
    wrapper.className = 'video-player-frame';

    const video = document.createElement('video');
    video.controls = true;
    video.playsInline = true;
    video.preload = 'metadata';
    if (this.videoData.poster) video.poster = this.videoData.poster;

    const source = document.createElement('source');
    source.src = this.videoData.src || '';
    video.appendChild(source);

    video.addEventListener('error', () => {
      wrapper.innerHTML = '<div style="padding:20px">影片無法播放，請稍後重試。</div>';
      const img = document.createElement('img');
      img.className = 'video-poster';
      img.alt = this.videoData.title || '影片封面';
      img.src = this.videoData.poster || 'assets/images/placeholder.svg';
      wrapper.appendChild(img);
    });

    const back = document.createElement('button');
    back.textContent = '返回預覽';
    back.setAttribute('aria-label','返回影片列表預覽');
    back.className = 'player-back';
    back.addEventListener('click', () => this.destroy());

    wrapper.appendChild(video);
    wrapper.appendChild(back);
    this.container.appendChild(wrapper);
    this.videoEl = video;
  }

  destroy() {
    if (!this.container) return;
    const article = this.container.closest('article');
    if (!article) { this.container.innerHTML = ''; return; }
    const vid = article.dataset.videoId;
    const data = vid ? videosMap[vid] : null;
    if (data) {
      renderVideoCard(data, article);
    } else {
      this.container.innerHTML = '';
    }
  }
}

async function loadVideos() {
  try {
    const res = await fetch('data/videos.json', {cache:'no-store'});
    if (!res.ok) throw new Error('videos.json load failed: ' + res.status);
    const payload = await res.json();
    const grid = document.getElementById('cases-grid');
    grid.innerHTML = '';
    (payload.videos || []).forEach(v => {
      if (!v || !v.id || !v.src) return;
      videosMap[v.id] = v;
      const card = createCardElement(v);
      grid.appendChild(card);
    });
    console.log('videos loaded:', Object.keys(videosMap));
  } catch (err) {
    console.error(err);
    const grid = document.getElementById('cases-grid');
    if (grid) grid.innerHTML = '<div class="video-card" style="padding:24px">影片資料載入失敗，請稍後再試。</div>';
  }
}

function createCardElement(videoData) {
  const article = document.createElement('article');
  article.className = 'video-card';
  article.dataset.videoId = videoData.id || '';

  const frame = document.createElement('div');
  frame.className = 'video-player-frame';

  const img = document.createElement('img');
  img.className = 'video-poster';
  img.alt = videoData.title || '影片預覽';
  img.loading = 'lazy';
  img.src = videoData.poster || 'assets/images/placeholder.svg';
  img.addEventListener('error', () => { img.src = 'assets/images/placeholder.svg'; });

  img.addEventListener('click', () => new VideoPlayer(frame, videoData));
  frame.appendChild(img);

  const meta = document.createElement('div');
  meta.className = 'video-meta';
  const tag = document.createElement('div'); tag.className = 'video-tag'; tag.textContent = videoData.tag || '';
  const title = document.createElement('h3'); title.textContent = videoData.title || '';
  const desc = document.createElement('p'); desc.textContent = videoData.description || '';
  meta.appendChild(tag); meta.appendChild(title); meta.appendChild(desc);

  article.appendChild(frame); article.appendChild(meta);
  return article;
}

function renderVideoCard(data, article) {
  if (!article || !data) return;
  article.innerHTML = '';
  const frame = document.createElement('div'); frame.className = 'video-player-frame';
  const img = document.createElement('img'); img.className = 'video-poster';
  img.alt = data.title || '影片預覽'; img.loading = 'lazy'; img.src = data.poster || 'assets/images/placeholder.svg';
  img.addEventListener('error', () => { img.src = 'assets/images/placeholder.svg'; });
  img.addEventListener('click', () => new VideoPlayer(frame, data));
  frame.appendChild(img);

  const meta = document.createElement('div'); meta.className = 'video-meta';
  const tag = document.createElement('div'); tag.className = 'video-tag'; tag.textContent = data.tag || '';
  const title = document.createElement('h3'); title.textContent = data.title || '';
  const desc = document.createElement('p'); desc.textContent = data.description || '';
  meta.appendChild(tag); meta.appendChild(title); meta.appendChild(desc);

  article.appendChild(frame); article.appendChild(meta);
}

document.addEventListener('DOMContentLoaded', () => {
  loadVideos();

  const mailBtn = document.getElementById('mailtoBtn');
  if (mailBtn) {
    mailBtn.addEventListener('click', () => {
      const to = 'gaarad@foxmail.com';
      const subject = encodeURIComponent('（某公司）视频广告需求');
      location.href = `mailto:${to}?subject=${subject}`;
    });
  } else {
    console.warn('mailtoBtn not found');
  }
});