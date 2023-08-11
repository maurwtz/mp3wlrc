const audio = document.querySelector('audio');
const lyricElement = document.querySelector('.lyric');
const nextLyricElement = document.querySelector('.next-lyric');
const play = document.querySelector('.play');
const time = document.querySelector('.time');
const pauseBtn = document.querySelector('.pause');
const stopBtn = document.querySelector('.stop');
const continueBtn = document.querySelector('.continue');
const songSelect = document.getElementById('songSelect');

const progresses = Array.from(document.querySelectorAll('.progress'));

let currentIndex = 0;
let lines = [];
let intervalId; // Add this line to declare the intervalId variable

// eventos
play.addEventListener('click', () => {
  audio.play();
});

pauseBtn.addEventListener('click', () => {
  audio.pause();
  continueBtn.style.pointerEvents = 'auto';
});

continueBtn.addEventListener('click', () => {
  audio.play();
  continueBtn.style.pointerEvents = 'none';
});

stopBtn.addEventListener('click', () => {
  audio.pause();
  audio.currentTime = 0;
  lyricElement.innerText = '';
  nextLyricElement.innerText = '';
  clearInterval(intervalId);
  currentIndex = 0;
});

songSelect.addEventListener('change', () => {
  const selectedSong = songSelect.value;
  audio.src = selectedSong;
  audio.load();

  const lrcFileName = selectedSong.replace('.mp3', '.lrc');
  currentLrcFileName = lrcFileName;

  clearInterval(intervalId);
  currentIndex = 0;

  intervalId = setInterval(() => {
    const currentTime = audio.currentTime;
    updateLyrics(currentTime);
  }, 200);
});

audio.addEventListener('playing', () => {
  if (currentLrcFileName) {
    loadFile(currentLrcFileName)
      .then(data => {
        lines = data;
        updateLyrics(audio.currentTime);
      });
  }
});

audio.addEventListener('timeupdate', () => {
  const currentTime = audio.currentTime;
  updateLyrics(currentTime);
});

function updateLyrics(currentTime) {
  while (currentIndex < lines.length) {
    const currentLine = lines[currentIndex]?.trim();
    const nextLine = lines[currentIndex + 1]?.trim();

    const currentTimestampInfo = parseTimestamp(currentLine);
    const nextTimestampInfo = parseTimestamp(nextLine);

    if (currentTime >= currentTimestampInfo.timestamp && currentTime < nextTimestampInfo.timestamp) {
      lyricElement.innerText = currentTimestampInfo.lyrics;
      nextLyricElement.innerText = nextTimestampInfo.lyrics;
      break;
    } else if (currentTime < currentTimestampInfo.timestamp) {
      // Display blank lyrics if the current timestamp is not reached yet
      lyricElement.innerText = '';
      nextLyricElement.innerText = '';
      break;
    }

    currentIndex++;
  }
}

function loadFile(fileName) {
  try {
    return fetch(fileName)
      .then(response => response.text())
      .then(data => data.trim().split('\n'));
  } catch (err) {
    console.error(err);
    return [];
  }
}

function parseTimestamp(line) {
  const timestampMatch = line.match(/\[(\d+):(\d+\.\d+)\]/);
  if (timestampMatch) {
    const [, minute, second] = timestampMatch;
    return {
      timestamp: parseInt(minute) * 60 + parseFloat(second),
      lyrics: line.replace(timestampMatch[0], '').trim()
    };
  }
  return { timestamp: 0, lyrics: '' };
}

audio.addEventListener('ended', () => {
  currentIndex = 0;
  time.innerText = '00:00';
  lyricElement.innerText = '';
  nextLyricElement.innerText = '';
  progresses.forEach(progress => {
    progress.style.strokeDashoffset = 1414;
  });
});

audio.addEventListener('pause', () => {
  lyricElement.innerText = '';
  nextLyricElement.innerText = '';
});