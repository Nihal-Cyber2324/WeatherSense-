const openWeatherKey = '4a34142e740b8484c773427a69950549';
const pexelsKey = 'HdUCOJQ2B5mrlPLSj6woSOSEovwElbuUqObLRED5KbZyWanUnmxeeWlu';

function startApp() {
  document.getElementById('welcomeScreen').style.display = 'none';
  document.getElementById('appContainer').style.display = 'block';
}

function searchWeather() {
  const city = document.getElementById('cityInput').value;
  if (!city) return alert('Please enter a city!');
  
  fetchWeather(city);
  fetchBackground(city);
}

async function fetchWeather(city) {
  const url = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=metric&appid=${openWeatherKey}`;
  const response = await fetch(url);
  const data = await response.json();

  if (data.cod !== "200") {
    alert('City not found!');
    return;
  }

  document.getElementById('cityName').innerText = data.city.name;
  document.getElementById('weatherDescription').innerText = data.list[0].weather[0].description;
  document.getElementById('temperature').innerText = `${Math.round(data.list[0].main.temp)}°C`;

  updateDaylight(data.city.timezone);

  const hourlyContainer = document.getElementById('hourlyData');
  hourlyContainer.innerHTML = '';
  for (let i = 0; i < 5; i++) {
    const hourData = data.list[i];
    const time = new Date(hourData.dt * 1000).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    hourlyContainer.innerHTML += `<p>${time}: ${Math.round(hourData.main.temp)}°C, ${hourData.weather[0].description}</p>`;
  }

  const dailyContainer = document.getElementById('dailyData');
  dailyContainer.innerHTML = '';
  const daysAdded = new Set();
  for (let item of data.list) {
    const day = new Date(item.dt_txt).toLocaleDateString(undefined, { weekday: 'long' });
    if (!daysAdded.has(day) && daysAdded.size < 7) {
      daysAdded.add(day);
      dailyContainer.innerHTML += `<p>${day}: ${Math.round(item.main.temp)}°C, ${item.weather[0].main}</p>`;
    }
  }

  fetchAlerts(data.city.coord.lat, data.city.coord.lon);
}

async function fetchAlerts(lat, lon) {
  const url = `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&appid=${openWeatherKey}`;
  const response = await fetch(url);
  const data = await response.json();

  const alertsData = document.getElementById('alertsData');
  alertsData.innerHTML = '';

  if (data.alerts) {
    data.alerts.forEach(alert => {
      alertsData.innerHTML += `<p><strong>${alert.event}:</strong> ${alert.description}</p>`;
    });
  } else {
    alertsData.innerHTML = '<p>No alerts for this area.</p>';
  }

  const tips = [
    "Stay hydrated during hot days!",
    "Carry an umbrella if rain is forecasted.",
    "Wear layers in chilly weather.",
    "Check wind conditions before traveling.",
    "Avoid outdoor activities during thunderstorms."
  ];
  document.getElementById('awarenessTip').innerText = tips[Math.floor(Math.random() * tips.length)];
}

async function fetchBackground(city) {
  const url = `https://api.pexels.com/v1/search?query=${city}&per_page=1`;
  const response = await fetch(url, {
    headers: {
      Authorization: pexelsKey
    }
  });
  const data = await response.json();
  if (data.photos.length > 0) {
    document.body.style.backgroundImage = `url(${data.photos[0].src.landscape})`;
    updateButtonColorsBasedOnBackground(data.photos[0].avg_color);
  } else {
    document.body.style.backgroundImage = `linear-gradient(135deg, #4facfe, #00f2fe)`;
  }
}

function togglePopup(id) {
  const popup = document.getElementById(id);
  popup.style.display = popup.style.display === 'block' ? 'none' : 'block';
}

function updateButtonColorsBasedOnBackground(avgColor) {
  document.documentElement.style.setProperty('--buttonColor', avgColor);
  document.documentElement.style.setProperty('--buttonHoverColor', lightenColor(avgColor, 30));
}

function lightenColor(hex, percent) {
  let num = parseInt(hex.slice(1), 16),
      amt = Math.round(2.55 * percent),
      R = (num >> 16) + amt,
      G = (num >> 8 & 0x00FF) + amt,
      B = (num & 0x0000FF) + amt;
  return "#" + (
    0x1000000 +
    (R<255?R<1?0:R:255)*0x10000 +
    (G<255?G<1?0:G:255)*0x100 +
    (B<255?B<1?0:B:255)
  ).toString(16).slice(1);
}

function updateDaylight(timezoneOffset) {
  const nowUTC = new Date(new Date().toUTCString());
  const localTime = new Date(nowUTC.getTime() + timezoneOffset * 1000);
  const hours = localTime.getHours();

  const emoji = document.getElementById('dayEmoji');
  if (hours >= 6 && hours <= 18) {
    emoji.innerText = '🌞';
  } else {
    emoji.innerText = '🌙';
  }
}
