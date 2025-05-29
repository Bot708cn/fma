const apiKey = "ewsvAEiIAbLvKEYcBOCNvmh5kvPXjvD7";
const calendarEl = document.getElementById("calendar");

async function getEconomicCalendar() {
  try {
    const today = new Date().toISOString().split("T")[0];
    const response = await fetch(`https://financialmodelingprep.com/api/v3/economic_calendar?from=${today}&to=${today}&apikey=${apiKey}`);
    const data = await response.json();

    const events = data.slice(0, 2).concat(data.slice(-2)); // 2 premières et 2 dernières données

    if (events.length === 0) {
      calendarEl.innerHTML = "<p>Aucune donnée pour aujourd'hui.</p>";
      return;
    }

    let html = '<table><thead><tr><th>Heure</th><th>Événement</th><th>Pays</th><th>Impact</th><th>Résultat</th></tr></thead><tbody>';
    events.forEach(event => {
      html += `<tr>
        <td>${event.date}</td>
        <td>${event.event}</td>
        <td>${event.country}</td>
        <td>${event.impact}</td>
        <td>${event.actual || '-'}</td>
      </tr>`;
    });
    html += '</tbody></table>';

    calendarEl.innerHTML = html;
  } catch (err) {
    console.error(err);
    calendarEl.innerHTML = "<p>Erreur lors du chargement des données.</p>";
  }
}

getEconomicCalendar();
