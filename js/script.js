// 8-Bit Звуковой Синтезатор
const synth = {
  ctx: null,
  init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    }
  },
  playClick() {
    this.init();
    if (this.ctx.state === 'suspended') this.ctx.resume();
    let osc = this.ctx.createOscillator();
    let gain = this.ctx.createGain();
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.type = 'square';
    osc.frequency.setValueAtTime(150, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(600, this.ctx.currentTime + 0.1);
    gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.01, this.ctx.currentTime + 0.1);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.1);
  },
  playHeart() {
    this.init();
    if (this.ctx.state === 'suspended') this.ctx.resume();
    let now = this.ctx.currentTime;
    let notes = [300, 450, 600];
    notes.forEach((freq, idx) => {
      let osc = this.ctx.createOscillator();
      let gain = this.ctx.createGain();
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + idx * 0.08);
      gain.gain.setValueAtTime(0.1, now + idx * 0.08);
      gain.gain.linearRampToValueAtTime(0.01, now + idx * 0.08 + 0.1);
      osc.start(now + idx * 0.08);
      osc.stop(now + idx * 0.08 + 0.12);
    });
  },
  playItem() {
    this.init();
    if (this.ctx.state === 'suspended') this.ctx.resume();
    let osc = this.ctx.createOscillator();
    let gain = this.ctx.createGain();
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1500, this.ctx.currentTime + 0.15);
    gain.gain.setValueAtTime(0.05, this.ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.01, this.ctx.currentTime + 0.15);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.15);
  },
  playPowerup() {
    this.init();
    if (this.ctx.state === 'suspended') this.ctx.resume();
    let now = this.ctx.currentTime;
    [261.63, 329.63, 392.00, 523.25].forEach((freq, idx) => {
      let osc = this.ctx.createOscillator();
      let gain = this.ctx.createGain();
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.type = 'square';
      osc.frequency.setValueAtTime(freq, now + idx * 0.1);
      gain.gain.setValueAtTime(0.06, now + idx * 0.1);
      gain.gain.linearRampToValueAtTime(0.01, now + idx * 0.1 + 0.15);
      osc.start(now + idx * 0.1);
      osc.stop(now + idx * 0.1 + 0.2);
    });
  }
};

// ==========================================
// СИМУЛЯТОР BACKEND БАЗЫ ДАННЫХ (LOCALSTORAGE)
// ==========================================
const DB_KEYS = {
  PLAYER_PET: 'love_ghav_player_pet',
  MATCHES: 'love_ghav_matches_v1',
  INVENTORY: 'love_ghav_inventory_v1',
  CHATS: 'love_ghav_chats_v1',
  AFFECTION: 'love_ghav_affection_v1'
};

// Статичный список кандидатов (из мира игры)
const SYSTEM_PETS = [
  { id: 101, name: "Клео", type: "cat", avatar: "4.png", breed: "Рыжий кот", trait: "Дерзкий 😎", desc: "Рыжий кот-засранец, который всегда делает всё наперекор.", fav: "fish" },
  { id: 102, name: "Мяутка", type: "dog", avatar: "2.png", breed: "Мопс", trait: "Скромняга ☺", desc: "Мопс под прикрытием. Выполняет особо важные задания в парке.", fav: "bones" },
  { id: 103, name: "Коржик", type: "dog", avatar: "3.png", breed: "Вельш-корги", trait: "Игривый ⚽", desc: "Профессионально выпрашивает лакомства и виляет булочками.", fav: "bones" },
  { id: 104, name: "Зефирка", type: "cat", avatar: "6.png", breed: "Черно-белый кот", trait: "Хитрый 😏", desc: "Черно-белый котик с очень ехидной мордой.", fav: "flowers" },
  { id: 105, name: "Бетховен", type: "cat", avatar: "5.png", breed: "Трёхцветный кот", trait: "Скромняга ☺", desc: "Милый трёхцветный котик, совсем не гигантский, но очень уютный.", fav: "flowers" },
  { id: 106, name: "Шиба", type: "dog", avatar: "1.png", breed: "Овчарка", trait: "Романтик 💕", desc: "Добрая овчарка, мечтающая о верных друзьях.", fav: "bones" }
];

// Базовые диалоги для каждого питомца
const DIALOG_TEMPLATES = {
  101: {
    intro: "Гав! Привет! Пойдем бегать за бабочками вместе? 🐾",
    gift_fav: "Ого-го! Моя любимая косточка! Ты самый замечательный друг во всем мире! 💕",
    gift_normal: "Спасибо за подарок! А мы поиграем в догонялки?",
    chat_replies: [
      "Я закопал секретную игрушку в парке, хочешь покажу?",
      "Давай построим самый уютный домик на дереве!",
      "Ты выглядишь как отличный напарник для приключений!",
      "А ты любишь бегать по лужам?",
      "Гав-гав! Давай поиграем в прятки!"
    ]
  },
  102: {
    intro: "Мяу. Ну и чего тебе? Надеялся завоевать моё доверие просто так? 🐈",
    gift_fav: "Ммм, вкуснейшая свежая рыбка... Ладно, ты мне нравишься чуточку больше. 🐟",
    gift_normal: "Хм, сойдет. Но я ждала чего-то более изысканного.",
    chat_replies: [
      "Не смей гладить меня против шерсти!",
      "Возможно, я разрешу тебе посидеть рядом.",
      "Где мой законный обед? Принеси еще рыбки!",
      "Люди такие суетливые существа.",
      "Сегодня идеальный день для сна, не находишь?"
    ]
  },
  103: {
    intro: "Привет-привет-привет! Давай бегать! Гав-гав! Давай дружить! ⚽",
    gift_fav: "Ура! Настоящая большая косточка! Я кручусь от счастья юлой! 🦴",
    gift_normal: "Йес! Подарок! Спасибо, ты космос!",
    chat_replies: [
      "Посмотри на мои короткие лапки, но я бегаю быстрее ветра!",
      "Хочешь поделюсь своим мячиком?",
      "Ты — лучшая находка этого дня!",
      "Корги правят миром!",
      "У тебя есть вкусняшки?"
    ]
  },
  104: {
    intro: "Тихий лунный вечер... Мяу. Прекрасное время для тайных прогулок.",
    gift_fav: "Какой нежный аромат весенних цветов... Моё сердце тает. 🌸",
    gift_normal: "Спасибо, очень мило с твоей стороны.",
    chat_replies: [
      "Говорят, черные коты приносят удачу. Я как раз такая!",
      "Давай наблюдать за звёздами с крыши?",
      "Я чувствую особую романтическую связь между нами.",
      "А ты веришь в магию парка?",
      "Тишина помогает лучше понять друг друга."
    ]
  },
  105: {
    intro: "Привет... Гав. Прости за слюни, я просто очень рад тебя видеть.",
    gift_fav: "Вот это кость! Огромное спасибо, грызть её — сплошное удовольствие. 🦴",
    gift_normal: "О, спасибо большое, ты очень добр.",
    chat_replies: [
      "Если ты устанешь, можешь вздремнуть на моей мягкой спине.",
      "Я спасу тебя от любой скуки!",
      "Хорошо иметь такого надежного друга.",
      "А ты умеешь чесать за ушком?",
      "Давай просто посидим вместе."
    ]
  },
  106: {
    intro: "Мяу... Я спала. Надеюсь, у тебя веская причина меня разбудить.",
    gift_fav: "Цветок! Какой прелестный подарок... Моя шёрстка засияет ярче. 💕",
    gift_normal: "Благодарю. Но спать все равно хочется больше.",
    chat_replies: [
      "Ты можешь причесать меня, если аккуратно.",
      "Сон — лучшее лекарство, давай поспим вместе?",
      "Жизнь слишком коротка, чтобы спешить.",
      "Я видела чудесный сон про тебя.",
      "Почему люди постоянно куда-то спешат?"
    ]
  }
};

// ==========================================
// СОСТОЯНИЕ ПРИЛОЖЕНИЯ
// ==========================================
let playerPet = null;
let inventory = { bones: 5, fish: 5, flowers: 5 };
let matches = [];
let chats = {};
let activeCandidateIndex = 0;
let activeChatPartnerId = null;

// Инициализация баз данных
function initDatabase() {
  if (localStorage.getItem(DB_KEYS.PLAYER_PET)) {
    playerPet = JSON.parse(localStorage.getItem(DB_KEYS.PLAYER_PET));
  }
  if (localStorage.getItem(DB_KEYS.INVENTORY)) {
    inventory = JSON.parse(localStorage.getItem(DB_KEYS.INVENTORY));
  } else {
    saveInventory();
  }
  if (localStorage.getItem(DB_KEYS.MATCHES)) {
    matches = JSON.parse(localStorage.getItem(DB_KEYS.MATCHES));
  }
  if (localStorage.getItem(DB_KEYS.CHATS)) {
    chats = JSON.parse(localStorage.getItem(DB_KEYS.CHATS));
  }
}

function savePlayerPet(name, type, trait) {
  // Сохраняем данные персонажа. Аватар теперь будет определяться динамически по имени.
  playerPet = { name, type, trait };
  localStorage.setItem(DB_KEYS.PLAYER_PET, JSON.stringify(playerPet));
  updateUI();
}

function saveInventory() {
  localStorage.setItem(DB_KEYS.INVENTORY, JSON.stringify(inventory));
  updateInventoryUI();
}

function saveMatches() {
  localStorage.setItem(DB_KEYS.MATCHES, JSON.stringify(matches));
}

function saveChats() {
  localStorage.setItem(DB_KEYS.CHATS, JSON.stringify(chats));
}

// ==========================================
// UI УВЕДОМЛЕНИЯ (Без алертов!)
// ==========================================
function showNotification(title, message, type = 'success') {
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');

  const theme = {
    success: 'border-retroBorder text-retroNeon bg-[#131c14]',
    error: 'border-red-500 text-red-400 bg-red-950/20',
    info: 'border-yellow-500 text-yellow-400 bg-yellow-950/20'
  }[type];

  toast.className = `p-4 border-2 font-pixel text-[9px] box-shadow-retro uppercase pointer-events-auto transform translate-y-2 opacity-0 transition-all duration-300 max-w-sm ${theme}`;
  toast.innerHTML = `
    <div class="font-bold tracking-wider mb-1">${title}</div>
    <div class="text-gray-300 font-mono text-xs normal-case leading-tight">${message}</div>
  `;

  container.appendChild(toast);

  // Анимация входа
  setTimeout(() => {
    toast.classList.remove('translate-y-2', 'opacity-0');
  }, 50);

  // Удаление через 4 секунды
  setTimeout(() => {
    toast.classList.add('translate-y-2', 'opacity-0');
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

// ==========================================
// УПРАВЛЕНИЕ МОДАЛКАМИ И ЭКРАНАМИ
// ==========================================
function closeTutorialModal() {
  synth.playClick();
  const modal = document.getElementById('tutorial-modal');
  if (modal) modal.classList.add('hidden');

  // Если игрок зашел впервые и у него нет персонажа — открываем редактор
  if (!playerPet) {
    document.getElementById('character-creator').classList.remove('hidden');
  } else {
    document.getElementById('game-board').classList.remove('hidden');
    document.getElementById('loot-generator').classList.remove('hidden');
  }
}

function openTutorialModal() {
  synth.playClick();
  const modal = document.getElementById('tutorial-modal');
  modal.classList.remove('hidden');

  const lines = [
    document.getElementById('text-1'),
    document.getElementById('text-2'),
    document.getElementById('text-3')
  ];

  let delay = 0;
  lines.forEach((line, index) => {
    setTimeout(() => {
      line.classList.remove('opacity-0');
      line.classList.add('typing-text');
    }, delay);
    delay += 2500;
  });

  setTimeout(() => {
    document.getElementById('start-btn').classList.remove('hidden');
  }, 7500);
}

// Добавляем реплику про "Как ты сюда попал?" в шаблоны ответов
function getLoreReply(petId) {
    const pet = SYSTEM_PETS.find(p => p.id === petId);
    if (!pet) return "Я просто тут...";

    const trait = pet.trait;
    if (trait.includes('Романтик')) return "Мяу-гав... Мы жили в обычном парке, но однажды экран моргнул, и я очутился здесь, среди пикселей, мечтая встретить тебя. 💕";
    if (trait.includes('Дерзкий')) return "Да какая разница? Кто-то нажал не ту кнопку в коде. Главное — я здесь, чтобы навести шороху!";
    if (trait.includes('Игривый')) return "Я гнался за светящимся мячиком, он завел меня прямо в этот цифровой портал! Прикольно, да?";
    return "Я не помню. Просто помню, как искал тепло в этом холодном коде.";
}

// ==========================================
// ОТРИСОВКА И ЛОГИКА КОМПОНЕНТОВ
// ==========================================

// Обновление панели инвентаря
function updateInventoryUI() {
  document.getElementById('header-bones-count').innerText = inventory.bones;
  document.getElementById('header-fish-count').innerText = inventory.fish;
  document.getElementById('header-flowers-count').innerText = inventory.flowers;
}

// Переключение кандидатов (Карусель)
function changeCandidate(direction) {
  synth.playClick();
  activeCandidateIndex = (activeCandidateIndex + direction + SYSTEM_PETS.length) % SYSTEM_PETS.length;
  renderCurrentCandidate();
}

// Отрисовка текущего кандидата
function renderCurrentCandidate() {
  const pet = SYSTEM_PETS[activeCandidateIndex];
  document.getElementById('current-index-num').innerText = activeCandidateIndex + 1;

  const img = document.getElementById('target-pet-img');
  img.src = pet.avatar;

  document.getElementById('target-pet-name').innerText = pet.name;
  document.getElementById('target-pet-trait').innerText = pet.trait;
  document.getElementById('target-pet-desc').innerText = pet.desc;

  let favName = "Косточки 🦴";
  if (pet.fav === 'fish') favName = "Рыбку 🐟";
  if (pet.fav === 'flowers') favName = "Цветочки 🌸";
  document.getElementById('target-pet-fav').innerText = favName;
}

// Логика Лайка
function likeCurrentPet() {
  const currentCandidate = SYSTEM_PETS[activeCandidateIndex];

  // Если уже в совпадениях
  if (matches.includes(currentCandidate.id)) {
    showNotification("УЖЕ ПАРА", `${currentCandidate.name} уже в ваших парах! Напишите ему в чате!`, 'info');
    synth.playClick();
    return;
  }

  // 40% шанс мгновенного взаимного лайка
  const isMatch = Math.random() < 0.40;
  synth.playHeart();

  if (isMatch) {
    matches.push(currentCandidate.id);
    saveMatches();

    // Создаем приветственное сообщение от питомца в чат бэкенда
    const introText = DIALOG_TEMPLATES[currentCandidate.id]?.intro || "Привет! Мяу-гав!";
    if (!chats[currentCandidate.id]) {
      chats[currentCandidate.id] = [];
    }
    chats[currentCandidate.id].push({ sender: 'system', text: introText, time: 'Только что' });
    saveChats();

    showNotification("СОВПАДЕНИЕ! ♡", `Вы понравились ${currentCandidate.name}! Начните диалог прямо сейчас!`, 'success');
    triggerHeartAnimation();
    renderMatches();
  } else {
    showNotification("ОТПРАВЛЕН ЛАЙК", `Вы лайкнули ${currentCandidate.name}. Попробуйте подарить ему любимое лакомство, чтобы растопить лёд!`, 'info');
  }
}

// Анимация вылетающих сердечек при совпадении
function triggerHeartAnimation() {
  for (let i = 0; i < 8; i++) {
    const heart = document.createElement('div');
    heart.innerHTML = "❤";
    heart.className = "fixed text-red-500 text-3xl pointer-events-none z-50 animate-bounce";
    heart.style.left = `${Math.random() * 80 + 10}vw`;
    heart.style.top = `${Math.random() * 60 + 20}vh`;
    heart.style.transition = "transform 1s, opacity 1s";
    document.body.appendChild(heart);

    setTimeout(() => {
      heart.style.transform = `translateY(-100px) scale(1.5)`;
      heart.style.opacity = '0';
      setTimeout(() => heart.remove(), 1000);
    }, 100);
  }
}

// Дарение подарка (Лут система)
function giftItem(itemType) {
  if (inventory[itemType] <= 0) {
    showNotification("НЕТ РЕСУРСОВ", `У вас закончились ресурсы этого типа! Попробуйте покопать лут.`, 'error');
    synth.playClick();
    return;
  }

  const currentCandidate = SYSTEM_PETS[activeCandidateIndex];
  inventory[itemType]--;
  saveInventory();
  synth.playItem();

  const isFav = currentCandidate.fav === itemType;

  if (isFav) {
    // Любимый подарок гарантирует мгновенное совпадение
    if (!matches.includes(currentCandidate.id)) {
      matches.push(currentCandidate.id);
      saveMatches();

      // Сообщение бэкенда
      const replyText = DIALOG_TEMPLATES[currentCandidate.id]?.gift_fav || "Спасибо!";
      if (!chats[currentCandidate.id]) {
        chats[currentCandidate.id] = [];
      }
      chats[currentCandidate.id].push({ sender: 'system', text: replyText, time: 'Только что' });
      saveChats();

      showNotification("ВЛЮБЛЕННОСТЬ! ♡", `${currentCandidate.name} без ума от вашего подарка! У вас совпадение!`, 'success');
      triggerHeartAnimation();
      renderMatches();
    } else {
      // Если уже пара, подарок добавляет реплику в чат
      const replyText = DIALOG_TEMPLATES[currentCandidate.id]?.gift_fav || "Спасибо!";
      chats[currentCandidate.id].push({ sender: 'system', text: replyText, time: 'Только что' });
      saveChats();
      showNotification("ЛЮБИМЫЙ ЛУТ", `${currentCandidate.name} в восторге от подарка! Чат обновлен.`, 'success');
      if (activeChatPartnerId === currentCandidate.id) renderChatMessages();
    }
  } else {
    // Обычный подарок - повышает шанс совпадения
    showNotification("ОБЫЧНЫЙ ПОДАРOК", `${currentCandidate.name} принял подарок, но это не предел его мечтаний!`, 'info');
  }
}

// Добыча Лута (Фермерство валюты)
function mineLoot() {
  synth.playPowerup();

  const lootTypes = ['bones', 'fish', 'flowers'];
  const foundType = lootTypes[Math.floor(Math.random() * lootTypes.length)];
  const amount = Math.floor(Math.random() * 3) + 1;

  inventory[foundType] += amount;
  saveInventory();

  let lootEmoji = "🦴";
  if (foundType === 'fish') lootEmoji = "🐟";
  if (foundType === 'flowers') lootEmoji = "🌸";

  showNotification("НАХОДКА ЛУТА!", `Вы выкопали ${lootEmoji} в количестве x${amount}! Ресурсы добавлены в инвентарь.`, 'success');
}

// ==========================================
// ЧАТ С ПАРТНЕРАМИ (ЭМУЛЯЦИЯ БЭКЕНДА)
// ==========================================

// Отрисовка списка совпадений
function renderMatches() {
  const container = document.getElementById('matches-list-container');
  if (matches.length === 0) {
    container.innerHTML = `
      <div class="text-center text-gray-600 text-sm italic py-8">
        Пока нет совпадений. Дари подарки и лайкай!
      </div>
    `;
    return;
  }

  container.innerHTML = matches.map(petId => {
    const pet = SYSTEM_PETS.find(p => p.id === petId);
    const activeClass = activeChatPartnerId === petId ? 'border-retroNeon bg-retroDark' : 'border-gray-700 bg-retroBg';
    return `
      <div onclick="selectChatPartner(${petId})" class="flex items-center justify-between p-2.5 border-2 ${activeClass} cursor-pointer hover:border-retroNeon transition">
        <div class="flex items-center space-x-3">
          <span class="text-3xl w-12 h-12 flex items-center justify-center overflow-hidden"><img src="${pet.avatar}" class="w-full h-full object-cover"></span>
          <div>
            <h4 class="font-pixel text-[11px] text-[#f43f5e] uppercase">${pet.name}</h4>
            <p class="text-[10px] text-gray-500 font-mono">${pet.breed} • ${pet.trait}</p>
          </div>
        </div>
        <span class="text-retroNeon font-pixel text-[8px] animate-pulse">ЧАТ &gt;</span>
      </div>
    `;
  }).join('');
}

// Выбор партнера для чата
function selectChatPartner(petId) {
  synth.playClick();
  activeChatPartnerId = petId;
  const pet = SYSTEM_PETS.find(p => p.id === petId);

  document.getElementById('chat-partner-name').innerText = pet.name.toUpperCase();
  document.getElementById('chat-user-input').disabled = false;
  document.getElementById('chat-user-input').placeholder = `Напиши кличке ${pet.name}...`;
  document.getElementById('chat-send-btn').disabled = false;

  renderMatches();
  renderChatMessages();
}

// Отрисовка сообщений
function renderChatMessages() {
  const container = document.getElementById('chat-messages-container');
  const messages = chats[activeChatPartnerId] || [];

  if (messages.length === 0) {
    container.innerHTML = `<div class="text-center text-gray-600 italic py-12">Напишите первое сообщение!</div>`;
    return;
  }

  container.innerHTML = messages.map(msg => {
    const isPlayer = msg.sender === 'player';
    const alignClass = isPlayer ? 'text-right' : 'text-left';
    const colorClass = isPlayer ? 'text-retroNeon' : 'text-pink-400';
    const icon = isPlayer ? '😎' : '🐾';
    const senderName = isPlayer ? (playerPet?.name || "Игрок") : SYSTEM_PETS.find(p => p.id === activeChatPartnerId)?.name;

    return `
      <div class="${alignClass} space-y-1">
        <span class="font-pixel text-[8px] text-gray-500 uppercase">${msg.time} • ${senderName} ${icon}</span>
        <p class="text-xs text-gray-200 bg-retroBg border border-gray-800 p-2.5 inline-block max-w-[85%] ${isPlayer ? 'border-l-4 border-l-retroBorder' : 'border-l-4 border-l-pink-500'}">
          ${escapeHTML(msg.text)}
        </p>
      </div>
    `;
  }).join('');

  container.scrollTop = container.scrollHeight;
}

// Отправка сообщений и автоматический ретро-ответ
function handleSendMessage(e) {
  e.preventDefault();
  const input = document.getElementById('chat-user-input');
  const text = input.value.trim();

  if (!text || !activeChatPartnerId) return;

  synth.playClick();

  if (!chats[activeChatPartnerId]) {
    chats[activeChatPartnerId] = [];
  }

  // 1. Запись сообщения игрока
  chats[activeChatPartnerId].push({
    sender: 'player',
    text: text,
    time: 'Только что'
  });
  saveChats();
  input.value = "";
  renderChatMessages();

  // 2. Симулированный интеллектуальный ответ питомца через 1.5 секунды
  setTimeout(() => {
    const pet = SYSTEM_PETS.find(p => p.id === parseInt(activeChatPartnerId));

    // Проверка на специальный вопрос
    let randomReply;
    if (text.toLowerCase().includes('как ты сюда попал')) {
        randomReply = getLoreReply(pet.id);
    } else {
        const soundPrefix = pet.type === 'cat' ? 'Мяу! ' : 'Гав! ';
        const partnerReplies = DIALOG_TEMPLATES[activeChatPartnerId]?.chat_replies || ["Приветик!"];
        randomReply = soundPrefix + partnerReplies[Math.floor(Math.random() * partnerReplies.length)];
    }

    chats[activeChatPartnerId].push({
      sender: 'system',
      text: randomReply,
      time: 'Только что'
    });
    saveChats();
    synth.playItem();

    if (activeChatPartnerId) renderChatMessages();
  }, 1500);
}

function escapeHTML(str) {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}

// Обновление всей UI панели после создания персонажа
function updateUI() {
  if (playerPet) {
    document.getElementById('character-creator').classList.add('hidden');
    document.getElementById('game-board').classList.remove('hidden');
    document.getElementById('loot-generator').classList.remove('hidden');
    document.getElementById('player-stats-panel').classList.remove('hidden');

    // Обновляем данные персонажа
    document.getElementById('header-pet-name').innerText = playerPet.name.toUpperCase();

    // Выбор аватара: для собаки — 11.png, для кота — 22.png
    const avatarImg = (playerPet.type === 'dog') ? '11.png' : '22.png';
    document.getElementById('header-player-avatar').innerHTML = `<img src="${avatarImg}" class="w-full h-full object-cover">`;

    updateInventoryUI();
  }
}

function resetGame() {
  localStorage.clear();
  window.location.reload();
}

// ==========================================
// ИНИЦИАЛИЗАЦИЯ И СЛУШАТЕЛИ
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
  initDatabase();
  renderCurrentCandidate();
  renderMatches();
  updateInventoryUI();

  // ПРОВЕРКА: если персонажа нет — показываем заставку (туториал)
  if (!playerPet) {
    openTutorialModal();
  } else {
    // Если персонаж есть, сразу показываем игровой интерфейс
    updateUI();
  }

  // Обработка создания питомца
  const form = document.getElementById('creator-form');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('creator-name').value.trim();
    const type = document.querySelector('input[name="creator-type"]:checked').value;
    const trait = document.getElementById('creator-trait').value;

    savePlayerPet(name, type, trait);
    showNotification("ПЕРСОНАЖ СОЗДАН!", `Питомцу дали имя ${name}. Желаем найти настоящую любовь!`, 'success');
  });

  // Обработка отправки чата
  const chatForm = document.getElementById('chat-send-form');
  chatForm.addEventListener('submit', handleSendMessage);
});
