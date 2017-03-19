

document.getElementById('findCar').addEventListener('submit',function(evt){
          evt.preventDefault();

          let lat = parseInt(this.elements.lat.value),
              lng = parseInt(this.elements.long.value);

          deleteMarkers();
          createMarker({lat: lat, lng: lng},"" ,'auicon.png');
      })

getCars(6);

function getCars(max){
  let cars = [];
  
  for (var i = 0; i < max; i++){    
    (i => {
      httpGet('http://cndlunarlocator.herokuapp.com/vehicles/'+ i +'/locate.json')
      .then(
          value => {
              cars[i] = value;
              renderCar(value); // -- Render cards from template --- // 
          },
          reason => {console.error('Something went wrong', reason);});
    })(i);
  }
}

function renderCar(data){

    let html = Mustache.to_html("<h4>{{name}}</h4><p>{{model}}</p><img src='car_{{vehicle_id}}.png'/>", data);
    let node = document.createElement("div");  
        node.addEventListener(  
          'click', ()=> { // -- Show car on the map on click 
            httpGet('http://cndlunarlocator.herokuapp.com/vehicles/'+ data.vehicle_id +'/locate.json') // Get car's coords
            .then(
                value => {
                  deleteMarkers();
                  createMarker({lat: value.lat, lng: value.long}, data.name ,'car_'+data.vehicle_id+'.png', data.power_level_percent);
                },
                reason => { console.error('Something went wrong', reason);})
          },false)
        node.innerHTML = html;
        document.getElementById('cars-list').appendChild(node);
}

var map;
var markers=[];

function initMap() {
          map = new google.maps.Map(document.getElementById('map'), {
          center: {lat: 0.681400, lng: 23.460550},
          zoom: 2,
          streetViewControl: false,
          mapTypeControlOptions: {
              mapTypeIds: ['moon']
            }
          });

        createMarker({lat: 0.681400, lng: 23.460550}, 'CND Command Centre');

        var moonMapType = new google.maps.ImageMapType({
          getTileUrl: function(coord, zoom) {
              var normalizedCoord = getNormalizedCoord(coord, zoom);
              if (!normalizedCoord) {
                return null;
              }
              var bound = Math.pow(2, zoom);
              return 'http://mw1.google.com/mw-planetary/lunar/lunarmaps_v1/clem_bw' +
                  '/' + zoom + '/' + normalizedCoord.x + '/' +
                  (bound - normalizedCoord.y - 1) + '.jpg';
          },
          tileSize: new google.maps.Size(256, 256),
          maxZoom: 9,
          minZoom: 0,
          radius: 1738000,
          name: 'Moon'
        });

        map.mapTypes.set('moon', moonMapType);
        map.setMapTypeId('moon');
      }
      // Normalizes the coords that tiles repeat across the x axis (horizontally)
      // like the standard Google map tiles.
      function getNormalizedCoord(coord, zoom) {
          let y = coord.y,
              x = coord.x;
          let tileRange = 1 << zoom;

          if (y < 0 || y >= tileRange) {
            return null;
          }
          // repeat across x-axis
          if (x < 0 || x >= tileRange) {
            x = (x % tileRange + tileRange) % tileRange;
          }
          return {x: x, y: y};
      }

function createMarker(latlng,placeTitle,imgMarker,powerLevel) {

    let image = imgMarker || 'auicon.png';
    let title = placeTitle || '' ;        
     
    let marker = new google.maps.Marker({
        map: map,
        icon: image,
        position: latlng,
        animation: google.maps.Animation.DROP,
        title: title
    });

    if (!imgMarker) return

      let d = getDistanceFromLatLonInKm(latlng.lat,latlng.lng);
      markers.push(marker);

      setInfo(marker,d,powerLevel);

}

function deleteMarkers() {
  clearMarkers();
  markers = [];
}

function clearMarkers() {
  setMapOnAll(null);
}

function setMapOnAll(map) {
  for (var i = 0; i < markers.length; i++) {
    markers[i].setMap(map);
  }
}

function setInfo(marker,distance,powerLevel){
   powerLevel = (powerLevel) ? powerLevel + ' %' : ' Unknown ';
  let contentString = '<div id="content">'+
            '<div id="distance"><b> Distance to CND Command Centre: </b>'+ distance + ' KM </div>'+
            '<p><b>Power level </b>' +powerLevel+ '</p>'+            
            '</div>';
  let infowindow = new google.maps.InfoWindow({
          content: contentString
        });
         marker.addListener('click', () => {
          infowindow.open(map, marker);
        });
}

function getDistanceFromLatLonInKm(lat2,lon2) {
  let R = 1737; // Radius of the Moon in km
  let lat1 = 0.681400, lon1 = 23.460550;

  let dLat = deg2rad(lat2-lat1); 
  let dLon = deg2rad(lon2-lon1); 
  let a = Math.sin(dLat/2) * Math.sin(dLat/2) +
          Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
          Math.sin(dLon/2) * Math.sin(dLon/2) ;
    
  let c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
 
  return Math.round(R * c) // Distance in km
}

function deg2rad(deg) {
  return deg * (Math.PI/180)
}

function httpGet(url) {
  return new Promise( (resolve, reject) => {
          const request = new XMLHttpRequest();
          request.onload = function () {
              if (this.status === 200) {// Success
                  resolve(this.response);
              } else {
                  reject(new Error(this.statusText));
              }
          };
          request.onerror = function () {
              reject(new Error('XMLHttpRequest Error: '+this.statusText));
          };
          request.open('GET', url);
          request.responseType = 'json';
          request.send();
      });
}