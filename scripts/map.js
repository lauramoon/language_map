const mapboxToken = 'pk.eyJ1IjoibGF1cmFtb29uIiwiYSI6ImNrZ2Uya295ZDB1NzQycnA0bnRlbHZ5c2cifQ.WU8s6fuYa8FU45c5OQ8dVQ';
const centerMap = {"Illinois": [39.9, -89], "US": [36, -95]};
const zoomInitMap = {"Illinois": 7, "US": 4.5};
const languageInfoMap = {"Illinois": languagesIllinois, "US": languagesUS};
const boundariesMap = {"Illinois": pumsIllinois, "US": pumsUS};
const geoIDMap = {"Illinois": "AFFGEOID10", "US": "GEO_ID"};

const name = (state === "US") ? "NAME" : "NAME10";
const geoID = geoIDMap[state];
const boundaries = boundariesMap[state];
const languageInfo = languageInfoMap[state];
const center = centerMap[state];
const zoomInit = zoomInitMap[state];
const mymap = L.map('mapid', {
  center: center,
  zoom: zoomInit,
  zoomSnap: 0.5
});
var geojson;

if (state === "US") {
  pumsUS.features.splice(-1, 1);
}

function style(feature) {
  return {
      fillColor: colorMap[parseInt(languageInfo[feature.properties[geoID]]["top"])],
      weight: 2,
      opacity: 1,
      color: '#f1f1e8',
      fillOpacity: 0.7
  };
}

function highlightFeature(e) {
    var layer = e.target;

    layer.setStyle({
        weight: 5,
        color: '#666',
        fillOpacity: 0.7
    });

    if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
        layer.bringToFront();
    }

    info.update(layer.feature.properties);
}

function resetHighlight(e) {
    geojson.resetStyle(e.target);
    info.update();
}

function clickOnRegion(e) {
  var layer = e.target;
  details.update(layer.feature.properties);
}

// function clickOffMap(mymap) {
//   //details.update();
//   L.DomEvent.preventDefault(mymap);
//   console.log("Clicked off map event.")
// }

function onEachFeature(feature, layer) {
    layer.on({
        mouseover: highlightFeature,
        mouseout: resetHighlight,
        click: clickOnRegion
    });
}

L.DomEvent.on(mymap, 'click', function (ev) {
    L.DomEvent.stopPropagation(ev);
});

L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=' + mapboxToken, {
maxZoom: 18,
attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, ' +
  '<a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
  'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>, ' +
  'Laguage data from <a href="http://census.gov/">US Census Bureau</a>',
id: 'mapbox/light-v9',
tileSize: 512,
zoomOffset: -1,
zoomSnap: 0.5,
}).addTo(mymap);

//mymap.on('click', clickOffMap);

geojson = L.geoJson(boundaries, {
  style: style,
  onEachFeature: onEachFeature
}).addTo(mymap);

var info = L.control();

info.onAdd = function (map) {
    this._div = L.DomUtil.create('div', 'title info');
    this.update();
    return this._div;
};

info.update = function (props) {
  const portion = (state === 'US') ? 'state' : 'region';
    this._div.innerHTML = '<h4>Most Common Language</h4>(Excluding English and Spanish)<br>' +  (props ?
        '<b>' + props[name] + '</b><br><h4>' +
        languageCodes[parseInt(languageInfo[props[geoID]]["top"])] + '</h4>'
        : 'Hover over a ' + portion + ' for name; click for details');
};
info.addTo(mymap);

var legend = L.control({position: 'bottomright'});

legend.onAdd = function (map) {
    var div = L.DomUtil.create('div', 'info legend');
    var languages = [];
    var labels = ['<h4>Languages</h4>'];

    for (const [key, value] of Object.entries(languageInfo)) {
      if (!languages.includes(value.top)) {
        languages.push(value.top);
      }
    }

    for (var i = 0; i < languages.length; i++) {
      code = parseInt(languages[i])
        labels.push(
            '<i style="background:' + colorMap[code] + '"></i> ' +
            languageCodes[code]);
    }
    div.innerHTML = labels.join('<br>');
    return div;
};

legend.addTo(mymap);

var details = L.control({position: 'bottomleft'});

details.onAdd = function (map) {
    this._div = L.DomUtil.create('div', 'info details');
    this.update();
    return this._div;
};

details.update = function (props) {

  if (props) {
    const codeList = languageInfo[props[geoID]].ordered;
    const popMap = languageInfo[props[geoID]].pop_map;
    const population = languageInfo[props[geoID]].pop;
    let listString = "";
    let language = "";
    let precision = (state === 'US') ? 2 : 1;
    for (var i = 0; i < codeList.length; i++){
      let code = codeList[i];
      let percent = Math.round(popMap[code]/population*10000)/100;
      if (code === "999") {
        language = "English Only";
      } else {
        language = languageCodes[parseInt(code)];
      }
      listString += percent.toFixed(precision) + "% - " + language + "<br>";
    }

    this._div.innerHTML = '<h4>' + props[name] + ' Languages</h4>With Over 100 Speakers<br><b>'
     + listString;
  } else {
    this._div.innerHTML = '<h4>Languages</h4>With Over 100 Speakers<br>Click on a region';
  }
};

details.addTo(mymap);

details.getContainer().addEventListener('mouseover', function () {
    mymap.dragging.disable();
});

details.getContainer().addEventListener('mouseout', function () {
        mymap.dragging.enable();
});
