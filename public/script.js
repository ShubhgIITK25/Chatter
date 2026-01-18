const container = document.getElementById("container");
const search = document.getElementById("search");

let allCountries = [];

fetch("https://restcountries.com/v3.1/all?fields=name,population,region")
  .then(res => res.json())
  .then(data => {
    allCountries = data;
    display(allCountries);
  })
  .catch(err => console.log(err));

function display(countries) {
  container.innerHTML = "";

  countries.forEach(c => {
    const div = document.createElement("div");
    div.className = "card";
    div.innerHTML = `
      <h3>${c.name.common}</h3>
      <p>Population: ${c.population.toLocaleString()}</p>
      <p>Region: ${c.region}</p>
    `;
    container.appendChild(div);
  });
}

search.addEventListener("input", () => {
  const value = search.value.toLowerCase();
  const filtered = allCountries.filter(c =>
    c.name.common.toLowerCase().includes(value)
  );
  display(filtered);
});

container.addEventListener("click", async (e) => {
  const card = e.target.closest(".card");
  if (!card) return;

  const name = card.querySelector("h3").innerText;

  await fetch("https://YOUR-RAILWAY-URL.up.railway.app/add-user", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: name,
      age: 20,
      email: "shubh@gmail.com"
    })
  });

  alert(`${name} saved to DB`);
});
