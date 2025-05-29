const calendarEl = document.getElementById("calendar");
const apiKey = "ewsvAEiIAbLvKEYcBOCNvmh5kvPXjvD7";

function escapeHtml(text) {
  // Petite fonction pour échapper les caractères HTML et éviter injection
  return text
    ? text.replace(/[&<>"']/g, (m) => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;',
      }[m]))
    : '';
}

async function fetchEconomicEvents() {
  calendarEl.innerHTML = "<p>Chargement des événements...</p>";

  const today = new Date().toISOString().split("T")[0];

  try {
    const res = await fetch(
      `https://financialmodelingprep.com/api/v3/economic_calendar?from=${today}&to=${today}&apikey=${apiKey}`
    );
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);

    const data = await res.json();

    if (!Array.isArray(data)) throw new Error("Format de données inattendu");

    // Trier par date+heure
    const sorted = data.sort((a, b) => {
      // Parsing sécurisé des dates, fallback à 0 si invalide
      const dateA = new Date(a.date).getTime() || 0;
      const dateB = new Date(b.date).getTime() || 0;
      return dateA - dateB;
    });

    const now = new Date();

    // Séparer événements passés et futurs par rapport à maintenant
    const pastEvents = sorted.filter(e => {
      const eventDate = new Date(e.date);
      return !isNaN(eventDate) && eventDate < now;
    }).slice(-2);

    const futureEvents = sorted.filter(e => {
      const eventDate = new Date(e.date);
      return !isNaN(eventDate) && eventDate >= now;
    }).slice(0, 2);

    const selectedEvents = [...pastEvents, ...futureEvents];

    if (selectedEvents.length === 0) {
      calendarEl.innerHTML = "<p>Aucun événement économique pour aujourd'hui.</p>";
      return;
    }

    calendarEl.innerHTML = selectedEvents.map(event => {
      // Conversion heure locale lisible ou affichage 'Heure inconnue' si date invalide
      const eventDateObj = new Date(event.date);
      const eventTime = !isNaN(eventDateObj)
        ? eventDateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        : 'Heure inconnue';

      // Nettoyage et fallback pour les données texte
      const country = escapeHtml(event.country || "Inconnu");
      const eventName = escapeHtml(event.event || "Non spécifié");
      const importance = escapeHtml(event.importance || "N/A");
      const actual = escapeHtml(event.actual ?? "N/A");
      const forecast = escapeHtml(event.forecast ?? "N/A");
      const previous = escapeHtml(event.previous ?? "N/A");

      return `
        <div class="event">
          <div><strong>${country}</strong> - ${eventTime}</div>
          <div>${eventName}</div>
          <div>Importance : ${importance}</div>
          <div>Actuel : ${actual} | Prévu : ${forecast} | Précédent : ${previous}</div>
        </div>
      `;
    }).join("");
  } catch (err) {
    console.error("Erreur API :", err);
    calendarEl.innerHTML = "<p>Erreur lors du chargement des données.</p>";
  }
}

fetchEconomicEvents();
