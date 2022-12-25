const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

function getDateTime() {
  const now = new Date();
  const date = now.toLocaleDateString('bn-BD', {
    dateStyle: 'full',
  });

  const timeParts = new Intl.DateTimeFormat('bn-BD', {
    minute: 'numeric',
    hour: 'numeric',
    hour12: true,
    dayPeriod: 'short',
  }).formatToParts(now);

  return `${timeParts[4].value} ${timeParts
    .slice(0, 4)
    .map(x => x.value)
    .join('')
    .trim()}, ${date}`;
}

function init() {
  const confessionHistory = JSON.parse(localStorage.getItem('confessions') ?? '{}');

  const currentTime = getDateTime();

  const confessionBox = document.querySelector('textarea');
  const hiButton = document.querySelector('button');

  function save() {
    if (confessionBox.value.trim()) confessionHistory[currentTime] = confessionBox.value;
    localStorage.setItem('confessions', JSON.stringify(confessionHistory));
  }

  function handleResult(e) {
    const result = e.results[e.results.length - 1];
    console.log('potential matches: ', result.length);
    confessionBox.value += result[0].transcript;

    save();
  }

  function handleEnd(e) {
    hiButton.textContent = 'এই!';
    hiButton.disabled = false;
    confessionBox.blur();
  }

  function start() {
    recognition.start();
  }

  const recognition = new SpeechRecognition();
  recognition.lang = 'bn-BD';
  recognition.continuous = true;
  recognition.onend = handleEnd;
  recognition.onresult = handleResult;
  recognition.onstart = () => {
    confessionBox.focus();
    hiButton.textContent = 'শুনছি...';
    hiButton.disabled = true;
  }

  hiButton.onclick = start;
  confessionBox.oninput = save;

  document.querySelector('p small').textContent = currentTime;
  confessionBox.value = confessionHistory[currentTime] || '';
  const historyContainer = document.querySelector('div');
  Object.keys(confessionHistory).forEach(time => {
    if (time === currentTime) return;
    const p = document.createElement('p');
    p.innerHTML = `<small>${time}</small> <br/> ${confessionHistory[time].replace(
      /\n/g,
      '<br/>'
    )}`;
    historyContainer.appendChild(p);
  });

  start();
}

window.onload = init;
