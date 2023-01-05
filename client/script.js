import bot from './assets/bot.svg';
import user from './assets/user.svg';

const form = document.querySelector('form');
const chatContainer = document.querySelector('#chat_container');

let loadInterval;

function loader(element) {
  element.textContent = '';

  /* When you ask a question to the bot while its searching for the answer,
     its going to generate a . every 300ms to a max of 3 dots */
  loadInterval = setInterval(() => {
    element.textContent += '.';

    // Reset the interval when it reaches 4 dots
    if (element.textContent === '....') {
      element.textContent = '';
    }
  }, 300);
}

/* This function purpose is to generate the answer (code) as it will be write down instant
   so it is nicer and clearer to see like it is typed live (1 letter every 20ms) */
function typeText(element, text) {
  let index = 0;

  let interval = setInterval(() => {
    if (index < text.length) {
      element.innerHTML += text.charAt(index);
      index++;
    } else {
      clearInterval(interval);
    }
  }, 20);
}

function generateUniqueId() {
  const timestamp = Date.now();
  const randomNumber = Math.random();
  const hexaDecimalString = randomNumber.toString(16);

  return `id-${timestamp}-${hexaDecimalString}`;
}

/* This function causes the background color to change when the AI ​​talks or the user is in the chat room */
function chatStripe(isAi, value, uniqueId) {
  return `<div class='wrapper ${isAi && 'ai'}'>
      <div class='chat'>
        <div class='profile'>
          <img src='${isAi ? bot : user}' alt='${isAi ? 'bot' : 'user'}'/>
        </div>
        <div class='message' id=${uniqueId}>${value}</div>
      </div>
    </div>`;
}

const handleSubmit = async (e) => {
  // Prevents to refresh the browser
  e.preventDefault();

  const data = new FormData(form);

  // User's chat stripe
  chatContainer.innerHTML += chatStripe(false, data.get('prompt'));

  // Clear the textarea input
  form.reset();

  // Bot's chat stripe
  const uniqueId = generateUniqueId();
  chatContainer.innerHTML += chatStripe(true, ' ', uniqueId);

  // To focus scroll to the bottom
  chatContainer.scrollTop = chatContainer.scrollHeight;

  // Specific message div
  const messageDiv = document.getElementById(uniqueId);

  // messageDiv.innerHTML = "..."
  loader(messageDiv);

  // Fetch data from the server => bot's response
  const response = await fetch('https://codex-ai-vjez.onrender.com', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      prompt: data.get('prompt'),
    }),
  });
  clearInterval(loadInterval);
  messageDiv.innerHTML = '';

  if (response.ok) {
    const data = await response.json();
    const parsedData = data.bot.trim(); // trims any trailing spaces/'\n'

    typeText(messageDiv, parsedData);
  } else {
    const error = await response.text();
    messageDiv.innerHTML = 'Something went wrong';
    alert(error.message);
  }
};

form.addEventListener('submit', handleSubmit);
form.addEventListener('keyup', (e) => {
  // 13 = enter button
  if (e.keyCode === 13) {
    handleSubmit(e);
  }
});
