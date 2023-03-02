var canvas, ctx, analyser, fbc_array, bar_count, bar_pos, bar_width, bar_height;

const audioContext = new AudioContext();
analyser = audioContext.createAnalyser();
canvas2 = document.getElementById("canvas2");
ctx2 = canvas2.getContext("2d");
const audioElement = document.querySelector("audio");
const playButton = document.querySelector("#icon");
const volumeControl = document.querySelector("#volume");
const panControl = document.querySelector("#pan");
var trebble = document.querySelector("#trebble");
var bass = document.querySelector("#bass");
var reset = document.querySelector("#reset");
var forw = document.getElementById("iconf");
var prev = document.getElementById("iconb");
var tracks = document.querySelector("input[type=file]");
var dropBox = document.querySelector("#drop");
var seeker = document.getElementById("slider");
var title = document.querySelector(".label");
var showEq = document.querySelector("#showEq");
var controlPanel = document.querySelector(".ctlpanel");
var back = document.querySelector("#back");
var splash = document.querySelector(".splash");
var addPanel = document.querySelector(".addpanel");
var closeAdd = document.querySelector("#closeadd");
var showAdd = document.querySelector("#showAdd");


const track = audioContext.createMediaElementSource(audioElement);
const gainNode = new GainNode(audioContext);
const panner = new StereoPannerNode(audioContext, { pan: 0 });

var lowShelf = audioContext.createBiquadFilter();
var allPass = audioContext.createBiquadFilter();
var highPass = audioContext.createBiquadFilter();
var lowPass = audioContext.createBiquadFilter();
var bandPass = audioContext.createBiquadFilter();

var songPlaying = 0;

var int;

svar songs = [];
var loadedtracks = [];

class play {
  static playSong() {
    playButton.addEventListener("click", () => {
      if (audioContext.state === "suspended") {
        audioContext.resume();
      }

      if (songs.length > 0) {
        if (audioElement.paused) {
          audioElement.play();
          play.showTrackName(songPlaying);
          playButton.innerText = "pause";
        } else {
          audioElement.pause();
          playButton.innerText = "play";
        }

        return;
      }
      alert("Playlist empty");
    });
  }

  static dynaMic() {
    setInterval(() => {
      var x = (audioElement.currentTime / audioElement.duration) * 100;
      var y = audioElement.currentTime;
      play.showDuration(Math.floor(y));
      play.updateSlider(x);
      play.next(audioElement.duration);
      this.showEndTime();
    }, 100);
  };
  
  static seek(value) {
    audioElement.currentTime = value * (audioElement.duration / 100);
    console.log("hey");
  }

  static showDuration(val) {
    var minutes = Math.floor(val / 60);

    var seconds = Math.floor(audioElement.currentTime - minutes * 60);
    var time = minutes + ":" + seconds;
    if (seconds < 10) {
      time = minutes + ":0" + seconds;
    }

    document.getElementById("z").innerHTML = time;
  }

  static showEndTime(){
    var endTime = audioElement.duration/60;
    var lastMinute = Math.floor(audioElement.duration/60);
    var lastSeconds = Math.floor((endTime - lastMinute)*60);
    var endd = lastMinute+":"+lastSeconds;
    if(lastSeconds < 10){
      endd = lastMinute+":0"+lastSeconds;
    }
    document.getElementById("a").innerHTML = endd;

  }

  static forward(n) {
    if (n === songs.length - 1) {
      audioElement.src = songs[0].src;
      songPlaying = 0;
      playButton.click();
      return;
    }

    audioElement.src = songs[n + 1].src;
    songPlaying = n + 1;
    playButton.click();
  }

  static previous(n) {
    if (n < 1) {
      var qq = songs.length;
      audioElement.src = songs[qq - 1].src;
      songPlaying = songs.length - 1;
      playButton.click();
      return;
    }

    audioElement.src = songs[n - 1].src;
    songPlaying = n - 1;
    playButton.click();
  }

  static connectGraph() {
    track
      .connect(lowPass)
      .connect(allPass)
      .connect(bandPass)
      .connect(highPass)
      .connect(lowShelf)
      .connect(allPass)
      .connect(gainNode)
      .connect(panner)
      .connect(analyser)
      .connect(audioContext.destination);
  }

  static updateSlider(y) {
    seeker.value = y;
  }

  static next(s) {
    var isdone = s - audioElement.currentTime;

    if (isdone === 0) {
      this.forward(songPlaying);
    }
  }

  static defaultSettings() {
    allPass.type = "bandpass";
    allPass.frequency.value = 16000;
    allPass.Q.value = 0;

    lowShelf.type = "bandpass";
    lowShelf.frequency.value = 8000;
    lowShelf.Q.value = 12;

    highPass.type = "bandpass";

    bandPass.type = "bandpass";

    lowPass.type = "bandpass";
    lowPass.frequency.value = 40;
    lowPass.Q.value = 0;
  }

  static storePlayList(item) {
    localStorage.setItem("playlist", JSON.stringify(item));
  }

  static addToPlayList(item2) {
    var newSongs = loadedtracks.concat(item2);
    audioElement.src = item2[0].src;
    play.storePlayList(newSongs);
  }

  static getPlayList() {
    loadedtracks = JSON.parse(localStorage.getItem("playlist"));
    if (loadedtracks.length > 0) {
      audioElement.src = loadedtracks[0].src;
    }
  }

  static addEvents() {
    volumeControl.addEventListener(
      "input",
      (e) => {
        gainNode.gain.value = e.target.value;
      },
      false
    );

    panControl.addEventListener(
      "input",
      (p) => {
        panner.pan.value = p.target.value;
      },
      false
    );

    trebble.addEventListener("input", (q) => {
      lowPass.Q.value = 0;
      allPass.Q.value = q.target.value;
      bass.value = 0;
      console.log(songs);
    });

    bass.addEventListener("input", (m) => {
      allPass.frequency.value = 16000;
      allPass.Q.value = 0;
      lowPass.frequency.value = 40;
      lowPass.Q.value = m.target.value;
      trebble.value = 0;
    });

    dropBox.addEventListener("dragenter", (e) => {
      e.preventDefault();
      e.stopPropagation();
      console.log("draging");
    });

    dropBox.addEventListener("dragover", (e) => {
      e.preventDefault();
      e.stopPropagation();
      console.log("end");
    });

    dropBox.addEventListener("drop", (e) => {
      e.preventDefault();
      e.stopPropagation();
      var data = e.dataTransfer;
      let files = data.files;
      play.loadTracks(files);
      console.log("drop");
    });

    dropBox.addEventListener("click", (e) => {
      e.preventDefault();
      console.log(e);
    });

    showEq.addEventListener("click", (e) => {
      controlPanel.style.display = "flex";
      splash.style.display = "none";
    });

    back.addEventListener("click", (e) => {
      controlPanel.style.display = "none";
      splash.style.display = "block";
    });


    showAdd.addEventListener("click", (e) => {
      addPanel.style.display = "flex";
      splash.style.display = "none";
    });



    closeAdd.addEventListener("click", (e) => {
      addPanel.style.display = "none";
      splash.style.display = "block";
    });




    reset.addEventListener("click", (r) => {
      play.defaultSettings();
    });

    forw.addEventListener("click", () => {
      if (songs.length > 0) play.forward(songPlaying);
    });

    prev.addEventListener("click", () => {
      if (songs.length > 0) play.previous(songPlaying);
    });

    tracks.addEventListener("change", (e) => {
      play.loadTracks(e.target.files);
    });

    document.getElementById("slider").addEventListener("input", (y) => {
      if (songs.length > 0)
        audioElement.currentTime =
          y.target.value * (audioElement.duration / 100);
    });
  }

  static loadTracks(files) {
    for (let f = 0; f < files.length; f++) {
      songs[f] = {
        trackname: files[f].name,
        src: URL.createObjectURL(files[f]),
      };
      URL.revokeObjectURL(files[f]);
    }
    audioElement.src = songs[0].src;
     addPanel.style.display = "none";
      splash.style.display = "block";
    this.showTrackName(0);
    play.dynaMic();
  }
  static showTrackName(pos){
    var rawTitle = songs[pos].trackname;
    var extPos = rawTitle.indexOf(".mp3");
    var refinedTitle = rawTitle.substring(0,extPos);
    title.innerHTML = `<h1>${refinedTitle}</h1>`;
  }
}

FrameLooper();
analyser.fftSize = 2048;

function FrameLooper() {
  window.webkitRequestAnimationFrame(FrameLooper);
  fbc_array = new Uint8Array(analyser.frequencyBinCount);
  bar_count = window.innerWidth / 2;

  analyser.getByteFrequencyData(fbc_array);

  ctx2.clearRect(0, 0, window.innerWidth, window.innerHeight);

  ctx2.fillStyle = "red";

  for (var i = 0; i < bar_count; i++) {
    bar_pos = i * 4;
    bar_width = 2;
    bar_height = -fbc_array[i] / 4;

    ctx2.fillRect(bar_pos, canvas2.height, bar_width, bar_height);
  }
}

play.playSong();
play.connectGraph();
play.defaultSettings();
play.addEvents();
