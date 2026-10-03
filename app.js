/* Sacred Vedanta Portal - Common Application Logic */

// Web Audio API Tanpura Drone Synthesizer for Authentic Meditative Audio Experience
class MeditativeAudioEngine {
  constructor() {
    this.audioCtx = null;
    this.isPlaying = false;
    this.oscillators = [];
    this.gainNode = null;
    this.currentTrackTitle = "";
  }

  init() {
    if (!this.audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.audioCtx = new AudioContext();
    }
  }

  playTrack(title = "Bhavasagara Tarana Karana He") {
    this.init();
    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }

    if (this.isPlaying) {
      this.stop();
    }

    this.currentTrackTitle = title;
    this.isPlaying = true;

    // Tanpura Drone Frequencies (Root C#3 = ~138.59 Hz, Pa = ~207.65 Hz, Sa2 = 277.18 Hz)
    const baseFreq = 138.59;
    const notes = [
      baseFreq * 1.5,   // Pa (207.65 Hz)
      baseFreq * 2.0,   // Sa octave (277.18 Hz)
      baseFreq * 2.002, // Binaural shimmer
      baseFreq * 1.0,   // Low Sa (138.59 Hz)
      baseFreq * 3.0    // Harmonic overtone
    ];

    this.gainNode = this.audioCtx.createGain();
    this.gainNode.gain.setValueAtTime(0.01, this.audioCtx.currentTime);
    this.gainNode.gain.exponentialRampToValueAtTime(0.25, this.audioCtx.currentTime + 2.0);

    const filter = this.audioCtx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 800;

    this.gainNode.connect(filter);
    filter.connect(this.audioCtx.destination);

    this.oscillators = notes.map((freq, i) => {
      const osc = this.audioCtx.createOscillator();
      osc.type = i % 2 === 0 ? 'sine' : 'triangle';
      osc.frequency.value = freq;
      
      const oscGain = this.audioCtx.createGain();
      oscGain.gain.value = 0.2 / (i + 1);
      
      // Gentle LFO swell for plucking effect
      const lfo = this.audioCtx.createOscillator();
      lfo.frequency.value = 0.2 + (i * 0.1);
      const lfoGain = this.audioCtx.createGain();
      lfoGain.gain.value = 0.05;
      lfo.connect(lfoGain);
      lfoGain.connect(oscGain.gain);
      lfo.start();

      osc.connect(oscGain);
      oscGain.connect(this.gainNode);
      osc.start();

      return { osc, lfo };
    });

    this.updateUI(true, title);
  }

  stop() {
    if (!this.isPlaying) return;
    if (this.gainNode && this.audioCtx) {
      this.gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + 1.0);
      setTimeout(() => {
        this.oscillators.forEach(item => {
          try {
            item.osc.stop();
            item.lfo.stop();
          } catch (e) {}
        });
        this.oscillators = [];
        this.isPlaying = false;
        this.updateUI(false, "");
      }, 1000);
    } else {
      this.isPlaying = false;
      this.updateUI(false, "");
    }
  }

  toggle(title) {
    if (this.isPlaying && this.currentTrackTitle === title) {
      this.stop();
    } else {
      this.playTrack(title);
    }
  }

  updateUI(playing, title) {
    const playerBar = document.getElementById('global-audio-player-bar');
    const trackTitleElem = document.getElementById('playerTrackTitle');
    const playPauseIcon = document.getElementById('globalPlayIcon');
    const playButtons = document.querySelectorAll('.audio-play-btn');

    if (playerBar) {
      if (playing) {
        playerBar.classList.remove('translate-y-full', 'hidden');
        playerBar.classList.add('translate-y-0');
      }
    }

    if (trackTitleElem && title) {
      trackTitleElem.innerText = title;
    }

    if (playPauseIcon) {
      playPauseIcon.innerText = playing ? 'pause' : 'play_arrow';
    }

    playButtons.forEach(btn => {
      const btnTrack = btn.dataset.track || btn.getAttribute('onclick');
      const icon = btn.querySelector('.material-symbols-outlined');
      if (icon) {
        if (playing && btnTrack && btnTrack.includes(title)) {
          icon.innerText = 'pause';
          btn.classList.add('bg-terracotta-vermilion');
          btn.classList.remove('bg-saffron-bhagwa');
        } else {
          icon.innerText = 'play_arrow';
          btn.classList.remove('bg-terracotta-vermilion');
          btn.classList.add('bg-saffron-bhagwa');
        }
      }
    });
  }
}

window.meditativeAudio = new MeditativeAudioEngine();

// Mobile Navigation Toggle
document.addEventListener('DOMContentLoaded', () => {
  setupMobileNav();
  setupGlobalAudioPlayer();
});

function setupMobileNav() {
  const headers = document.querySelectorAll('header');
  headers.forEach(header => {
    // Add mobile toggle button if missing
    const innerNav = header.querySelector('.max-w-7xl, .max-w-\\[1200px\\]');
    if (innerNav && !header.querySelector('.mobile-menu-btn')) {
      const flexContainer = innerNav;
      const btn = document.createElement('button');
      btn.className = 'mobile-menu-btn xl:hidden md:hidden p-2 text-charcoal-bronze hover:text-primary transition-colors focus:outline-none';
      btn.setAttribute('aria-label', 'Toggle Navigation');
      btn.innerHTML = '<span class="material-symbols-outlined text-2xl">menu</span>';
      
      const drawer = document.createElement('div');
      drawer.className = 'mobile-drawer hidden fixed top-20 left-0 w-full bg-sandalwood-cream/98 backdrop-blur-xl border-b border-sacred-parchment shadow-lg px-6 py-6 z-40 flex flex-col gap-4';
      drawer.innerHTML = `
        <a href="index.html" class="px-4 py-3 rounded-lg text-base font-semibold ${window.location.pathname.endsWith('index.html') || window.location.pathname.endsWith('/') ? 'bg-saffron-bhagwa text-white' : 'text-charcoal-bronze hover:bg-sandalwood-muted'}">Home</a>
        <a href="about.html" class="px-4 py-3 rounded-lg text-base font-semibold ${window.location.pathname.endsWith('about.html') ? 'bg-saffron-bhagwa text-white' : 'text-charcoal-bronze hover:bg-sandalwood-muted'}">About</a>
        <a href="books.html" class="px-4 py-3 rounded-lg text-base font-semibold ${window.location.pathname.endsWith('books.html') ? 'bg-saffron-bhagwa text-white' : 'text-charcoal-bronze hover:bg-sandalwood-muted'}">Books</a>
        <a href="gallery.html" class="px-4 py-3 rounded-lg text-base font-semibold ${window.location.pathname.endsWith('gallery.html') ? 'bg-saffron-bhagwa text-white' : 'text-charcoal-bronze hover:bg-sandalwood-muted'}">Gallery</a>
        <a href="media.html" class="px-4 py-3 rounded-lg text-base font-semibold ${window.location.pathname.endsWith('media.html') ? 'bg-saffron-bhagwa text-white' : 'text-charcoal-bronze hover:bg-sandalwood-muted'}">Media Library</a>
      `;

      btn.onclick = () => {
        const isHidden = drawer.classList.contains('hidden');
        if (isHidden) {
          drawer.classList.remove('hidden');
          btn.innerHTML = '<span class="material-symbols-outlined text-2xl">close</span>';
        } else {
          drawer.classList.add('hidden');
          btn.innerHTML = '<span class="material-symbols-outlined text-2xl">menu</span>';
        }
      };

      flexContainer.appendChild(btn);
      header.appendChild(drawer);
    }
  });
}

function setupGlobalAudioPlayer() {
  // Inject sticky bottom audio player bar if not already present
  if (!document.getElementById('global-audio-player-bar')) {
    const bar = document.createElement('div');
    bar.id = 'global-audio-player-bar';
    bar.className = 'fixed bottom-0 left-0 w-full z-50 bg-charcoal-bronze/95 text-sandalwood-cream backdrop-blur-xl border-t border-marigold-gold/30 px-4 py-3 shadow-[0_-8px_30px_rgba(0,0,0,0.3)] transition-transform duration-300 transform translate-y-full';
    bar.innerHTML = `
      <div class="max-w-7xl mx-auto flex items-center justify-between gap-4">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-full bg-saffron-bhagwa/20 flex items-center justify-center text-marigold-gold">
            <span class="material-symbols-outlined text-xl">graphic_eq</span>
          </div>
          <div class="flex flex-col">
            <span class="text-xs uppercase font-semibold text-marigold-gold tracking-widest">Now Playing • Sacred Meditation</span>
            <span id="playerTrackTitle" class="text-sm font-semibold text-white tracking-wide">Bhavasagara Tarana Karana He</span>
          </div>
        </div>
        <div class="flex items-center gap-4">
          <button onclick="window.meditativeAudio.toggle(window.meditativeAudio.currentTrackTitle)" class="w-10 h-10 rounded-full bg-saffron-bhagwa hover:bg-saffron-vibrant text-white flex items-center justify-center shadow-md transition-all">
            <span id="globalPlayIcon" class="material-symbols-outlined text-2xl">play_arrow</span>
          </button>
          <button onclick="window.meditativeAudio.stop()" class="p-2 text-sandalwood-muted hover:text-white transition-colors" title="Close Audio Player">
            <span class="material-symbols-outlined text-xl">close</span>
          </button>
        </div>
      </div>
    `;
    document.body.appendChild(bar);
  }
}

// Global Audio Toggle Helper for inline onclick
window.toggleAudioPreview = function(titleOrBtn) {
  let title = "Bhavasagara Tarana Karana He";
  if (typeof titleOrBtn === 'string') {
    title = titleOrBtn;
  } else if (titleOrBtn && titleOrBtn.dataset && titleOrBtn.dataset.title) {
    title = titleOrBtn.dataset.title;
  } else if (titleOrBtn && titleOrBtn.closest && titleOrBtn.closest('[data-track-title]')) {
    title = titleOrBtn.closest('[data-track-title]').dataset.trackTitle;
  }
  window.meditativeAudio.toggle(title);
};
