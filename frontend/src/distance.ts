import * as L from 'leaflet';
import * as esri from 'esri-leaflet'
import * as turf from '@turf/turf';
import * as _ from 'underscore';

import './style.scss';

import '@bcgov/bootstrap-v5-theme/js/bootstrap-theme.min.js';
import '@bcgov/bootstrap-v5-theme/css/bootstrap-theme.min.css';
import '@bcgov/bootstrap-v5-theme/images/bcid-symbol-rev.svg';
import '@bcgov/bootstrap-v5-theme/images/bcid-logo-rev-en.svg';

window.onload = () => esriDistanceLeafletMap();

const oa_url: string = "https://services6.arcgis.com/ubm4tcTYICKBpist/ArcGIS/rest/services/Evacuation_Orders_and_Alerts/FeatureServer/0"
const fire_points_url: string = "https://services6.arcgis.com/ubm4tcTYICKBpist/arcgis/rest/services/BCWS_ActiveFires_PublicView/FeatureServer/0"

let distance_map: L.Map;
let orders_alerts: L.Layer;
let fire_locations: any;

const default_lat: number = 53.9667;
const default_lng: number = -123.9833;
const default_zoom: number = 5;

let markerPoint:any = {};
let markerLine:any = {};
let markerLabel:any = {};

let geoJSONFeatureCollection = {
  type: "FeatureCollection",
  features: [] as string[]
};

function esriDistanceLeafletMap() {
  // Initialize the map
  distance_map = L.map('distancemap', {
    scrollWheelZoom: true
  });

  // Set the position and zoom level of the map
  distance_map.setView([default_lat, default_lng], default_zoom);
  distance_map.options.scrollWheelZoom = true;

  // Initialize the base layer
  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
  }).addTo(distance_map);

  buildOALayer();
  buildFireLocationLayer();
  addLayerControls();
  closestFireClickEvent();
}

function buildOALayer(){
  function getColor(status: string) {
    return  status == "Order" ? '#DE2D26' :
            status == "Alert" ? '#FFAA00' :
                                '#595959';
    }

  orders_alerts = new esri.FeatureLayer({
    // URL to the service
    url: oa_url,
    style: function (feature:any) {
      return { color: getColor(feature.properties.ORDER_ALERT_STATUS), weight: 2 };
    },  
  }).addTo(distance_map);

  orders_alerts.bindPopup(function (layer: any) {
    var datetime: Date = new Date(layer.feature.properties['DATE_MODIFIED'])
    return L.Util.template(
      `<p><strong>{ORDER_ALERT_NAME}</strong> occured on ${datetime}.`,
      layer.feature.properties
    );
  });
}

function buildFireLocationLayer(){
  function labelFirePoints(fire_locations: any) {
    const labels: { [id: number] : L.Marker} = {};

    fire_locations.on("createfeature", function (e: any) {
      const id: number = e.feature.id;
      const feature: any = fire_locations.getFeature(id);
      const center: any = feature.getLatLng();
      const label: L.Marker = L.marker(center, {
        icon: L.divIcon({
          className: "label",
          html: "<div>" + e.feature.properties.FIRE_NUMBER + "</div>"
        })
      }).addTo(distance_map);
      labels[id] = label;

      let geojson_coordinates = feature.feature.geometry.coordinates
      let date = new Date(feature.feature.properties.IGNITION_DATE);
      let datevalues = [
        date.getFullYear(),
        date.getMonth()+1,
        date.getDate(),
        date.getHours(),
        date.getMinutes(),
        date.getSeconds(),
      ];
      let geoJSONPoint:any = {
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates: [geojson_coordinates[0], geojson_coordinates[1]]
        },
        properties: {"OBJECTID": feature.feature.properties.OBJECTID,
          "GEOGRAPHIC_DESCRIPTION": feature.feature.properties.GEOGRAPHIC_DESCRIPTION,
          "INCIDENT_NAME":feature.feature.properties.INCIDENT_NAME,
          "FIRE_STATUS":feature.feature.properties.FIRE_STATUS,
          "IGNITION_DATE":datevalues[2] + "-" + datevalues[1] + "-" + datevalues[0],
        }
      };
      geoJSONFeatureCollection.features.push(geoJSONPoint);
    });

    // fire_locations.on("addfeature", function (e: any) {
    //   const label: L.Marker = labels[e.feature.id];
    //   if (label) {
    //     label.addTo(distance_map);
    //   }
    // });

    // fire_locations.on("removefeature", function (e: any) {
    //   const label: L.Marker = labels[e.feature.id];
    //   if (label) {
    //     distance_map.removeLayer(label);
    //   }
    // });
  }

  fire_locations = new esri.FeatureLayer({
    url: fire_points_url,
    where: "FIRE_STATUS <> 'Out'",
    pointToLayer: function(feature: any, latlng: any) {
      return new L.Circle(latlng, {
        color: "red",
        radius: 50,
        weight: 10,
        fillOpacity: 0.85
    })}
  }).addTo(distance_map);

  labelFirePoints(fire_locations)
}

function addLayerControls() {
  var controlLayers = {
    "Orders and Alerts": orders_alerts,
    "Fire Locations": fire_locations
  };
  
  L.control.layers(null!,controlLayers).addTo(distance_map);
}

function closestFireClickEvent() {
  var styleMarkers = function (closestPoints: any) {
    let artIds: any = _.map(closestPoints, function (point) {
      return point.properties.OBJECTID;
    });

    fire_locations.setStyle(function(feature: any){
      if (_.contains(artIds, feature.properties.OBJECTID)) {
        return {
          color: "green",
          weight: 14
        }
      } else {
        return {
          color: "red",
          weight: 10
        }
      }
    })
  };
  
  distance_map.on("click", function (e:any) {
    var getClosestPoints = function (pt: any) {
      var allJson:any = _.clone(geoJSONFeatureCollection);
      var point:any = {
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates: [pt.latlng.lng, pt.latlng.lat]
        }
      };

      var closest = [];
      let near = turf.nearestPoint(point, allJson);
      closest.push(near);
      allJson = {
        type: "FeatureCollections",
        features: _.without(allJson.features, near)
      };
      return closest;
    };
      
    function displayInfo(closestPoints:any) {
      var list: any = document.getElementById("list");
      
      list.innerHTML = "";
      
      for (let i = 0; i < closestPoints.length; i++) {
          var distance_rounded = Math.round((closestPoints[i].properties.distanceToPoint) * 100) / 100
          var ignitiondate_datetime = closestPoints[i].properties.IGNITION_DATE
          var entry = '<li class="list-item" id="' + closestPoints[i].properties.OBJECTID + '"">Name: <strong>' + closestPoints[i].properties.INCIDENT_NAME + '</strong><br>Description: <strong>' + closestPoints[i].properties.GEOGRAPHIC_DESCRIPTION + '</strong><br>Status: <strong>' + closestPoints[i].properties.FIRE_STATUS + '</strong><br>Ignition Date: <strong>' + ignitiondate_datetime + '</strong><br>Distance: <strong>' + distance_rounded + " km</strong></li>";
          list.innerHTML += entry;
      }
    }
      
    function calcMiddleLatLng(distance_map:any, latlng1:any, latlng2:any) {
      const p1 = distance_map.project(latlng1);
      const p2 = distance_map.project(latlng2);
      return distance_map.unproject(p1._add(p2)._divideBy(2));
    }

    var closestPoints = getClosestPoints(e);

    //styleMarkers(closestPoints);

    if (markerPoint != undefined) {
      distance_map.removeLayer(markerPoint);
    };
    if (markerLine != undefined) {
      distance_map.removeLayer(markerLine);
    };
    if (markerLabel != undefined) {
      distance_map.removeLayer(markerLabel);
    };

    markerPoint = new L.Circle([e.latlng.lat,e.latlng.lng],{radius:30, color:"blue", weight:10}).addTo(distance_map);
    markerPoint.bringToFront();
    markerLine = L.polyline([[closestPoints[0].geometry.coordinates[1],closestPoints[0].geometry.coordinates[0]],[e.latlng.lat,e.latlng.lng]], {color: 'blue'}).addTo(distance_map);

    var distance_rounded = Math.round((closestPoints[0].properties.distanceToPoint) * 100) / 100
    var newLatLng = calcMiddleLatLng(distance_map,[closestPoints[0].geometry.coordinates[1],closestPoints[0].geometry.coordinates[0]],[e.latlng.lat,e.latlng.lng]);
    markerLabel =L.marker(newLatLng, {
      icon: L.divIcon({
        className: "label",
        html: '<p style="text-shadow: -1px -1px 0 #fff, 1px -1px 0 #fff, -1px 1px 0 #fff, 1px 1px 0 #fff; text-wrap: nowrap; text-transform: lowercase;">' + distance_rounded + ' km</p>'
      })
    }).addTo(distance_map);

    displayInfo(closestPoints);
  });
}