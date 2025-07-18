let useCelsius = true;

const weatherCodes = {
  0: "Clear ☀️",
  1: "Mainly Clear 🌤️",
  2: "Partly Cloudy 🌥️",
  3: "Overcast ☁️",
  45: "Fog 🌫️",
  48: "Rime Fog 🌫️",
  51: "Light Drizzle 🌦️",
  53: "Drizzle 🌧️",
  55: "Heavy Drizzle 🌧️",
  61: "Light Rain 🌧️",
  63: "Rain 🌧️",
  65: "Heavy Rain 🌧️",
  71: "Light Snow 🌨️",
  73: "Snow 🌨️",
  75: "Heavy Snow 🌨️",
  95: "Thunderstorm ⛈️"
};

function getIcon(code) {
  if (code === 0) return "https://cdn-icons-png.flaticon.com/128/869/869869.png";
  if ([1, 2].includes(code)) return "https://cdn-icons-png.flaticon.com/128/1163/1163661.png";
  if (code === 3) return "https://cdn-icons-png.flaticon.com/128/414/414825.png";
  if (code >= 51 && code < 60) return "https://cdn-icons-png.flaticon.com/128/414/414974.png";
  if (code >= 61 && code < 70) return "https://cdn-icons-png.flaticon.com/128/3076/3076129.png";
  if (code >= 71 && code < 80) return "https://cdn-icons-png.flaticon.com/128/642/642102.png";
  if (code >= 95) return "https://cdn-icons-png.flaticon.com/128/1146/1146860.png";
  return "https://cdn-icons-png.flaticon.com/128/869/869869.png";
}

function setDynamicBackground(code) {
  let gradient = "";

  if (code === 0) gradient = "linear-gradient(to right, #fbc2eb, #a6c1ee)";
  else if ([1, 2, 3].includes(code)) gradient = "linear-gradient(to right, #bdc3c7, #2c3e50)";
  else if (code >= 51 && code < 60) gradient = "linear-gradient(to right, #83a4d4, #b6fbff)";
  else if (code >= 61 && code < 70) gradient = "linear-gradient(to right, #1f4037, #99f2c8)";
  else if (code >= 71 && code < 80) gradient = "linear-gradient(to right, #e6dada, #274046)";
  else if (code >= 95) gradient = "linear-gradient(to right, #636363, #a2ab58)";
  else gradient = "linear-gradient(to right, #4facfe, #00f2fe)";

  document.body.style.background = gradient;
}

async function getCoordinates(city) {
  const res = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${city}`);
  const data = await res.json();
  if (!data.results || data.results.length === 0) throw new Error("City not found.");
  return data.results[0];
}

async function fetchWeather(lat, lon, name) {
  const tempParam = useCelsius ? "celsius" : "fahrenheit";
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&daily=temperature_2m_max,temperature_2m_min,weathercode,apparent_temperature_max,apparent_temperature_min&hourly=relative_humidity_2m&temperature_unit=${tempParam}&windspeed_unit=kmh&timezone=auto`;
  const res = await fetch(url);
  const data = await res.json();

  const current = data.current_weather;
  const weatherCode = current.weathercode;

  document.getElementById("cityName").textContent = name;
  document.getElementById("temperature").textContent = current.temperature;
  document.getElementById("wind").textContent = current.windspeed;
  document.getElementById("description").textContent = weatherCodes[weatherCode] || "Unknown";
  document.getElementById("weatherIcon").src = getIcon(weatherCode);
  document.getElementById("feelsLike").textContent = data.daily.apparent_temperature_max[0];
  document.getElementById("humidity").textContent = data.hourly.relative_humidity_2m[0];
  document.getElementById("weatherBox").classList.remove("hidden");

  setDynamicBackground(weatherCode);

  const dates = data.daily.time;
  const maxTemps = data.daily.temperature_2m_max;
  const minTemps = data.daily.temperature_2m_min;
  const codes = data.daily.weathercode;

  let forecastHTML = "";
  for (let i = 0; i < dates.length; i++) {
    forecastHTML += `
      <div class="forecast-day">
        <h4>${dates[i].slice(5)}</h4>
        <img src="${getIcon(codes[i])}" alt="icon">
        <p>${weatherCodes[codes[i]] || "N/A"}</p>
        <p>${minTemps[i]}° - ${maxTemps[i]}°</p>
      </div>
    `;
  }

  document.getElementById("forecastContainer").innerHTML = forecastHTML;
  document.getElementById("forecast").classList.remove("hidden");
}

async function getWeather() {
  const city = document.getElementById("cityInput").value.trim();
  if (!city) return alert("Please enter a city.");
  try {
    const location = await getCoordinates(city);
    fetchWeather(location.latitude, location.longitude, `${location.name}, ${location.country}`);
  } catch (err) {
    alert("City not found.");
    console.error(err);
  }
}

document.getElementById("currentLocationBtn").addEventListener("click", () => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        fetchWeather(position.coords.latitude, position.coords.longitude, "Your Location");
      },
      () => alert("Could not fetch your location.")
    );
  } else {
    alert("Geolocation not supported.");
  }
});

document.getElementById("themeToggle").addEventListener("change", function () {
  document.body.classList.toggle("dark", this.checked);
});

document.getElementById("unitToggle").addEventListener("change", function () {
  useCelsius = !this.checked;
  getWeather();
});
