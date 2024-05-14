import * as L from 'leaflet';
import * as esri from 'esri-leaflet'
// import * as esri_vect from 'esri-leaflet-vector';
import { vectorBasemapLayer } from "esri-leaflet-vector";


import './style.scss';

// import * as esri from 'esri-leaflet';
// import basemapLayer from 'esri-leaflet';
// import featureLayer from 'esri-leaflet'

import marker2x from 'leaflet/dist/images/marker-icon-2x.png';
import marker from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

import '@bcgov/bootstrap-v5-theme/js/bootstrap-theme.min.js';
import '@bcgov/bootstrap-v5-theme/css/bootstrap-theme.min.css';
import '@bcgov/bootstrap-v5-theme/images/bcid-symbol-rev.svg';
import '@bcgov/bootstrap-v5-theme/images/bcid-logo-rev-en.svg';




window.onload = () => esriLeafletMap();

function esriLeafletMap() {
    const apiKey = "AAPKfeb7069c84484b8b95e784e272e814e79joMyrpeYbd_UY7-zcFyWeOGjr9x2aOkQLjQruXHPLr7ujIOGRZ8LTEg67F9cCyp";
    const basemapEnum = "NationalGeographic";
    const lat=54.66;
    const lon=-130.34;
    const zoom_lvl=5;

    L.Icon.Default.mergeOptions({
        iconRetinaUrl: marker2x,
        iconUrl: marker,
        shadowUrl: markerShadow,
    });

    const map: L.Map = L.map("map", {
        minZoom: 2
      })

      map.setView([lat, lon], zoom_lvl);

      // seems to be the correct way to do this, but keeps raising errors
      // ----------------------------------------------------------------
      // vectorBasemapLayer("ArcGIS:Streets", {
      //   token: apiKey, version: '1.0.0'
      // }).addTo(map);

      // workaround till figure out above
      esri.basemapLayer(basemapEnum, { token: apiKey }).addTo(map);

      const clever_map_data_url = 'https://services6.arcgis.com/ubm4tcTYICKBpist/arcgis/rest/services/CLM_MapHub_forecast/FeatureServer/0'
      var clever_output: any = esri.featureLayer({
        url: clever_map_data_url
      });
      clever_output.addTo(map);


}
    
function superSimpleLeafletMap()    
{

    delete (<any>L.Icon.Default.prototype)._getIconUrl;

    L.Icon.Default.mergeOptions({
        iconRetinaUrl: marker2x,
        iconUrl: marker,
        shadowUrl: markerShadow,
    });
    
	let map: L.Map = L.map('map').setView([51.505, -0.09], 13);

	L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
		attribution:
			'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
	}).addTo(map);

	L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
		maxZoom: 19,
		attribution:
			'&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
	}).addTo(map);

	L.marker([51.5, -0.09])
		.addTo(map)
		.bindPopup('A pretty CSS3 popup.<br> Easily customizable.')
		.openPopup();
};