// 1. Render songs -> OK
// 2. Scroll top -> OK
// 3. Play / pause / seek -> OK
// 4. CD rotate -> OK
// 5. Next /prev
// 6. Random
// 7. Next / Repeat when ended
// 8. Active song
// 9. Scroll active song into view
// 10. Play song when click

const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

const PLAYER_STORAGE_KEY = "F8_PLAYER";

const player = $(".player");
const heading = $("header h2");
const cdThumb = $(".cd-thumb");
const audio = $("#audio");
const cd = $(".cd");
const playBtn = $(".btn-toggle-play");
const progress = $("#progress");
const nextBtn = $(".btn-next");
const prevBtn = $(".btn-prev");
const randomBtn = $(".btn-random");
const repeatBtn = $(".btn-repeat");
const playlist = $(".playlist");

const app = {
  currentIndex: 0,
  isPlaying: false,
  isRandom: false,
  isRepeat: false,
  config: JSON.parse(localStorage.getItem(PLAYER_STORAGE_KEY)) || {},
  songs: [
    {
      name: "Chờ Ngày Mưa Tan",
      singer: "Noo Phước Thịnh",
      path: "./assets/music/ChoNgayMuaTan.mp3",
      image: "./assets/img/ChoNgayMuaTan.jpg",
    },
    {
      name: "Cần gì hơn",
      singer: "Tiên Tiên",
      path: "./assets/music/CanGiHon.mp3",
      image: "./assets/img/CanGiHon.jpg",
    },
    {
      name: "Đi Đu Đưa Đi",
      singer: "Bích Phương",
      path: "./assets/music/DiDuDuaDi.mp3",
      image: "./assets/img/DiDuDuaDi.jpg",
    },
    {
      name: "Em Không Thể",
      singer: "Tiên Tiên",
      path: "./assets/music/EmKhongThe.mp3",
      image: "./assets/img/EmKhongThe.jpg",
    },
    {
      name: "Những Kẻ Mộng Mơ",
      singer: "Noo Phước Thịnh",
      path: "./assets/music/NhungKeMongMo.mp3",
      image: "./assets/img/NhungKeMongMo.jpg",
    },
  ],

  start: function () {
    // Gán cấu hình từ config vào ứng dụng
    this.loadConfig();
    // Định nghĩa các properties cho Object
    this.definedProperties();

    // Lắng nghe / xử lý các sự kiện (DOM events)
    this.handleEvents();

    // Tải thông tin bài hát đầu tiên vào UI
    this.loadCurrentSong();

    // Render Playlist
    this.render();

    // Hiển thị trạng thái ban đầu
    randomBtn.classList.toggle("active", this.isRandom);
    repeatBtn.classList.toggle("active", this.isRepeat);
  },
  // Định nghĩa các properties cho Object
  definedProperties: function () {
    Object.defineProperty(this, "currentSong", {
      get: function () {
        return this.songs[this.currentIndex];
      },
    });
  },
  setConfig: function (key, value) {
    this.config[key] = value;
    localStorage.setItem(PLAYER_STORAGE_KEY, JSON.stringify(this.config));
  },
  loadConfig: function () {
    this.isRandom = this.config.isRandom;
    this.isRepeat = this.config.isRepeat;
  },
  loadCurrentSong: function () {
    heading.textContent = this.currentSong.name;
    cdThumb.style.backgroundImage = `url('${this.currentSong.image}')`;
    audio.src = this.currentSong.path;
  },
  // 1. Render Song
  render: function () {
    const htmls = this.songs.map((song, index) => {
      return `
                <div class="song ${
                  index === this.currentIndex ? "active" : ""
                }" data-index="${index}">
                    <div class="thumb"
                        style="background-image: url('${song.image}')">
                    </div>
                    <div class="body">
                        <h3 class="tittle">${song.name}</h3>
                        <p class="author">${song.singer}</p>
                    </div>
                    <div class="option">
                        <i class="fas fa-ellipsis-h"></i>
                    </div>
                </div>
            `;
    });
    playlist.innerHTML = htmls.join("");
  },
  handleEvents: function () {
    const _this = this;
    const cdWidth = cd.offsetWidth;
    // 2. Scroll Top
    document.onscroll = function () {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const newCdWidth = cdWidth - scrollTop;

      cd.style.width = newCdWidth > 0 ? newCdWidth + "px" : 0;
      cd.style.opacity = newCdWidth / cdWidth;
    };
    // 3. Click Play Button
    playBtn.onclick = function () {
      // Khi playing và bấm vào Play Button
      if (_this.isPlaying) {
        audio.pause();
      }
      // Khi pausing và bấm vào Play Button
      else {
        audio.play();
      }
    };
    // Khi playing
    audio.onplay = function () {
      _this.isPlaying = true;
      player.classList.add("playing");
      cdThumbAnimate.play();
    };
    // Khi pausing
    audio.onpause = function () {
      _this.isPlaying = false;
      player.classList.remove("playing");
      cdThumbAnimate.pause();
    };
    // Khi tiến độ bài hát thay đổi
    audio.ontimeupdate = function () {
      if (audio.duration) {
        const progressPercent = Math.floor(
          (audio.currentTime / audio.duration) * 100
        );
        progress.value = progressPercent;
      }
    };
    // 3. Xử lý khi tua
    progress.onchange = function (e) {
      const seekTime = (e.target.value * audio.duration) / 100;
      audio.currentTime = seekTime;
    };
    // 4. Xử lý CD rotate
    const cdThumbAnimate = cdThumb.animate([{ transform: "rotate(360deg)" }], {
      duration: 100000,
      iterations: Infinity,
    });
    cdThumbAnimate.pause();
    // Khi next song
    nextBtn.onclick = function () {
      if (_this.isRandom) {
        _this.playRandomSong();
      } else {
        _this.gotoNextSong();
      }
      audio.play();
      // Performance không tốt
      _this.render();
      _this.scrollToActiveSong();
    };
    // Khi prev song
    prevBtn.onclick = function () {
      if (_this.isRandom) {
        _this.playRandomSong();
      } else {
        _this.gotoPrevSong();
      }
      audio.play();
      _this.render();
      _this.scrollToActiveSong();
    };
    // Khi random song
    randomBtn.onclick = function () {
      _this.isRandom = !_this.isRandom;
      _this.setConfig("isRandom", _this.isRandom);
      randomBtn.classList.toggle("active", _this.isRandom);
    };
    //  Khi repeat song
    repeatBtn.onclick = function () {
      _this.isRepeat = !_this.isRepeat;
      _this.setConfig("isRepeat", _this.isRepeat);
      repeatBtn.classList.toggle("active", _this.isRepeat);
    };
    // Xử lý next song khi audio ended
    audio.onended = function () {
      if (_this.isRepeat) {
        audio.play();
      } else {
        nextBtn.click();
      }
    };
    // Xử lý click vào playlist
    playlist.onclick = function (e) {
      const songNode = e.target.closest(".song:not(.active)");
      if (songNode || e.target.closest(".option")) {
        // Xử lý khi click vào song
        if (songNode) {
          _this.currentIndex = Number(songNode.dataset.index);
          _this.loadCurrentSong();
          _this.render();
          audio.play();
        }
        // Xử lý khi click vào option
      }
    };
  },
  gotoNextSong: function () {
    this.currentIndex++;
    if (this.currentIndex >= this.songs.length) {
      this.currentIndex = 0;
    }
    this.loadCurrentSong();
  },
  gotoPrevSong: function () {
    this.currentIndex--;
    if (this.currentIndex < 0) {
      this.currentIndex = this.songs.length - 1;
    }
    this.loadCurrentSong();
  },
  playRandomSong: function () {
    let newIndex;
    do {
      newIndex = Math.floor(Math.random() * this.songs.length);
    } while (newIndex === this.currentIndex);
    this.currentIndex = newIndex;
    this.loadCurrentSong();
  },
  scrollToActiveSong: function () {
    setTimeout(function () {
      $(".song.active").scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }, 300);
  },
};

app.start();
