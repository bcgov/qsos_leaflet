



function proper_os_map() {
    const lat=54.66;
    const lon=-130.34;
    const zoom_lvl=5;
    const map = L.map('map').setView([lat, lon], zoom_lvl);

    const tiles = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);

}

function esri_crap() {
    const apiKey = "AAPK871aac8900f24a92a1b307ab9b6ed5d8VbdA-1cj4ZzSd3fF8iZULc4JzIs8UlPaDrOKT5Q3eGDgsKWVDUki9SEj7wVd1oRH";
    const basemapEnum = "arcgis/streets";
    const lat=54.66;
    const lon=-130.34;
    const zoom_lvl=5;


    const layer = L.esri.Vector.vectorBasemapLayer(basemapEnum, { apiKey: apiKey });
    const map = L.map("map", {
        minZoom: 2
      })

      map.setView([lat, lon], zoom_lvl);

      L.esri.Vector.vectorBasemapLayer(basemapEnum, {
        apiKey: apiKey
      }).addTo(map);

      const clever_map_data_url = 'https://services6.arcgis.com/ubm4tcTYICKBpist/arcgis/rest/services/CLM_MapHub_forecast/FeatureServer/0'
      var clever_output = L.esri
      .featureLayer({
        url: clever_map_data_url
      });
      clever_output.addTo(map);
}

