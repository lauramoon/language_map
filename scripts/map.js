const mapboxToken = 'pk.eyJ1IjoibGF1cmFtb29uIiwiYSI6ImNrZ2Uya295ZDB1NzQycnA0bnRlbHZ5c2cifQ.WU8s6fuYa8FU45c5OQ8dVQ';
const mymap = L.map('mapid').setView([39.9, -89], 7);
var geojson;
const colorMap = {
  1270: '#88CCEE',
  1690: '#AA4499',
  1440: '#CC6677',
  1110: '#117733',
  1564: '#5F4690',
  1360: '#DDCC77',
  1960: '#44AA99',
  1970: '#999933',
  1210: '#E17C05',
  1220: '#661100',
  2920: '#6699CC',
  1730: '#E58606',
  4500: '#5D69B1',
  1235: '#99C945',
  2475: '#DAA51B',
  1450: '#2F8AC4',
  1170: '#332288',
  1765: '#ED645A',
  1281: '#CC3A8E',
  1250: '#A5AA99',
  1900: '#52BCA3',
  2575: '#CC61B0',
  1350: '#24796C',
  6120: '#764E9F',
  1290: '#1D6996',
  1260: '#882255',
  1055: '#6F4070',
  2910: '#CC503E',
};

function style(feature) {

    return {
        fillColor: colorMap[parseInt(IllinoisLanguages[feature.properties.AFFGEOID10]["top"])],
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

function onEachFeature(feature, layer) {
    layer.on({
        mouseover: highlightFeature,
        mouseout: resetHighlight,
        click: clickOnRegion
    });
}

L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=' + mapboxToken, {
maxZoom: 18,
attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, ' +
  '<a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
  'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>, ' +
  'Laguage data from <a href="http://census.gov/">US Census Bureau</a>',
id: 'mapbox/light-v9',
tileSize: 512,
zoomOffset: -1
}).addTo(mymap);
geojson = L.geoJson(IllinoisPums, {
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
    this._div.innerHTML = '<h4>Most Common Language</h4>(Excluding English and Spanish)<br>' +  (props ?
        '<b>' + props.NAME10 + '</b><br><h4>' + languageCodes[parseInt(IllinoisLanguages[props.AFFGEOID10]["top"])] + '</h4>'
        : 'Hover over a region');
};
info.addTo(mymap);

var legend = L.control({position: 'bottomright'});

legend.onAdd = function (map) {
    var div = L.DomUtil.create('div', 'info legend');
    var languages = [];
    var labels = ['<h4>Languages</h4>'];

    for (const [key, value] of Object.entries(IllinoisLanguages)) {
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
  this._div.innerHTML = '<h4>Languages</h4>With Over 100 Speakers<br>';

  if (props) {
    var codeList = IllinoisLanguages[props.AFFGEOID10].ordered;
    var popMap = IllinoisLanguages[props.AFFGEOID10].pop_map;
    var population = IllinoisLanguages[props.AFFGEOID10].pop;
    var listString = "";
    var language = "";
    for (var i = 0; i < codeList.length; i++){
      var code = codeList[i];
      var percent = Math.round(popMap[code]/population*1000)/10;
      if (code === "999") {
        language = "English Only";
      } else {
        language = languageCodes[parseInt(code)];
      }
      listString += percent.toFixed(1) + "% - " + language + "<br>";
    }

    this._div.innerHTML += '<b>' + props.NAME10 + '</b><br>' + listString;
  } else {
    this._div.innerHTML += 'Click on a region';
  }
  //this.bringToFront();
};
details.addTo(mymap);

details.getContainer().addEventListener('mouseover', function () {
    mymap.dragging.disable();
});

details.getContainer().addEventListener('mouseout', function () {
        mymap.dragging.enable();
});
