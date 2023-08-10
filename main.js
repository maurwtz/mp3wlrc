const audio = document.querySelector('audio');
const lyricElement = document.querySelector('.lyric');
const nextLyricElement = document.querySelector('.next-lyric');
const play = document.querySelector('.play');
const time = document.querySelector('.time');
const progresses = Array.from(document.querySelectorAll('.progress'));
let currentIndex = 0;

// eventos
play.addEventListener('click', () => {
  audio.play();
  play.style.opacity = '0';
  play.style.pointerEvents = 'none';
});

audio.addEventListener('playing', start);

async function loadFile(fileName) {
  try {
    const response = await fetch(fileName);
    const data = await response.text();
    return data.trim().split('\n');
  } catch (err) {
    console.error(err);
    return [];
  }
}

async function start() {
  const lines = await loadFile('lyric.lrc');

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
      }
  
      currentIndex++;
    }
  }

  audio.addEventListener('timeupdate', () => {
    const currentTime = audio.currentTime;
    updateLyrics(currentTime);
  });
}

function parseTimestamp(line) {
  const timestampMatch = line.match(/\[(\d+):(\d+\.\d+)\]/);
  if (timestampMatch) {
    const [, minute, second] = timestampMatch;
    return parseInt(minute) * 60 + parseFloat(second);
  }
  return 0;
}

function parseTimestamp(line) {
  const timestampMatch = line.match(/\[(\d+):(\d+\.\d+)\]/);
  if (timestampMatch) {
    const [, minute, second] = timestampMatch;
    return {
      timestamp: parseInt(minute) * 60 + parseFloat(second),
      lyrics: line.replace(timestampMatch[0], '').trim() // remover timestamp
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

audio.addEventListener('timeupdate', () => {
  let current = Math.floor(audio.currentTime); // time of current playing music
  let minute = Math.floor(current / 60);
  let second = current % 60;
  minute = minute < 10 ? '0' + minute : minute;
  second = second < 10 ? '0' + second : second;
  time.innerText = `${minute}:${second}`;
  progresses.forEach(progress => {
    progress.style.strokeDashoffset = 1414 - (1414 * ((current / audio.duration) * 100)) / 100;
  });
});

audio.addEventListener('pause', () => {
  lyricElement.innerText = '';
  nextLyricElement.innerText = '';
});