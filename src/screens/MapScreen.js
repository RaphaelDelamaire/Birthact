import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { WebView } from 'react-native-webview';
import * as Location from 'expo-location';
import { COLORS, STORAGE_KEYS } from '../utils/constants';

async function geocodeCity(city) {
  try {
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(city)}&format=json&limit=1`;
    const res = await fetch(url, { headers: { 'User-Agent': 'Birthact/1.0' } });
    const data = await res.json();
    if (data[0]) return { lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon) };
  } catch {}
  return null;
}

function esc(str) {
  return (str || '').replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function buildMapHTML(markers) {
  const markerLines = markers.map((m) => {
    const initials = ((m.firstName[0] || '') + (m.lastName[0] || '')).toUpperCase() || '?';
    const fullName = esc(`${m.firstName} ${m.lastName}`.trim());
    const city = esc(m.city);
    // Photo: base64 data URI has no single quotes or parentheses, safe in css url()
    const pinHTML = m.photo
      ? `<div class="pin pin-photo" style="background-image:url(${m.photo.replace(/[\r\n\t]/g, '')})"></div>`
      : `<div class="pin">${initials}</div>`;
    return `cluster.addLayer(
      L.marker([${m.lat},${m.lon}],{icon:L.divIcon({
        html:'${pinHTML}',
        className:'',iconSize:[38,38],iconAnchor:[19,38],popupAnchor:[0,-40]
      })}).bindPopup('<b>${fullName}</b><br><span style="color:#888;font-size:12px">${city}</span>')
    )`;
  }).join(';\n');

  return `<!DOCTYPE html>
<html>
<head>
<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1">
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"/>
<link rel="stylesheet" href="https://unpkg.com/leaflet.markercluster@1.5.3/dist/MarkerCluster.css"/>
<link rel="stylesheet" href="https://unpkg.com/leaflet.markercluster@1.5.3/dist/MarkerCluster.Default.css"/>
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
<script src="https://unpkg.com/leaflet.markercluster@1.5.3/dist/leaflet.markercluster.js"></script>
<style>
body{margin:0;padding:0}
#map{width:100%;height:100vh}
.pin{
  width:38px;height:38px;border-radius:10px;
  background:#E8572A;color:#fff;font-weight:700;font-size:13px;
  display:flex;align-items:center;justify-content:center;
  border:2.5px solid #fff;box-shadow:0 3px 8px rgba(0,0,0,0.3);
}
.pin-photo{
  background-color:#ccc;background-size:cover;
  background-position:center;background-repeat:no-repeat;
}
.leaflet-popup-content{font-family:-apple-system,sans-serif;font-size:13px;min-width:100px}
/* Override all default cluster bubble styles */
.marker-cluster,.marker-cluster-small,.marker-cluster-medium,.marker-cluster-large{
  background:none!important;box-shadow:none!important;border:none!important;
}
.marker-cluster div,.marker-cluster-small div,.marker-cluster-medium div,.marker-cluster-large div{
  background:none!important;border:none!important;margin:0!important;
  width:auto!important;height:auto!important;
}
#locbtn{
  position:absolute;bottom:40px;right:12px;z-index:1000;
  background:#fff;border:none;border-radius:10px;
  width:44px;height:44px;font-size:20px;cursor:pointer;
  box-shadow:0 2px 8px rgba(0,0,0,0.25);
}
</style>
</head>
<body>
<div id="map"></div>
<button id="locbtn" onclick="reqLoc()">📍</button>
<script>
var map=L.map('map',{zoomControl:true}).setView([20,10],2);
L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',{
  attribution:'&copy; OpenStreetMap &copy; CARTO',maxZoom:19,subdomains:'abcd'
}).addTo(map);

var cluster=L.markerClusterGroup({
  maxClusterRadius:25,
  spiderfyOnMaxZoom:true,
  showCoverageOnHover:false,
  iconCreateFunction:function(c){
    var n=c.getChildCount();
    return L.divIcon({
      html:'<div class="pin">'+n+'</div>',
      className:'',iconSize:[38,38],iconAnchor:[19,38]
    });
  }
});
${markerLines};
map.addLayer(cluster);
if(cluster.getLayers().length>0){map.fitBounds(cluster.getBounds().pad(0.3));}

var myDot=null,myAcc=null;
function locateAt(lat,lon,acc){
  if(myDot){map.removeLayer(myDot);if(myAcc)map.removeLayer(myAcc);}
  myAcc=L.circle([lat,lon],{radius:Math.min(acc||100,300),color:'#4A90E2',fillColor:'#4A90E2',fillOpacity:0.15,weight:1}).addTo(map);
  myDot=L.circleMarker([lat,lon],{radius:9,color:'#fff',fillColor:'#4A90E2',fillOpacity:1,weight:2.5})
    .addTo(map).bindPopup('Vous êtes ici');
  map.setView([lat,lon],10);
}
function reqLoc(){
  if(window.ReactNativeWebView){window.ReactNativeWebView.postMessage('requestLocation');}
}
</script>
</body>
</html>`;
}

export default function MapScreen({ contacts, onBack, colors, t }) {
  const C = colors || COLORS;
  const [markers, setMarkers] = useState(null);
  const [loading, setLoading] = useState(true);
  const userCoordsRef = useRef(null);
  const webviewRef = useRef(null);

  // Geocode contacts
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const cityKeys = {};
      contacts.forEach((c) => {
        if (!c.city) return;
        const key = c.city.toLowerCase().trim();
        if (!cityKeys[key]) cityKeys[key] = c.city;
      });

      let cache = {};
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEYS.geocodeCache);
        if (raw) cache = JSON.parse(raw);
      } catch {}

      for (const [key, cityName] of Object.entries(cityKeys)) {
        if (cancelled) return;
        if (!cache[key]) {
          const coords = await geocodeCity(cityName);
          if (coords) cache[key] = coords;
        }
      }

      try {
        await AsyncStorage.setItem(STORAGE_KEYS.geocodeCache, JSON.stringify(cache));
      } catch {}

      const result = [];
      contacts.forEach((c) => {
        if (!c.city) return;
        const coords = cache[c.city.toLowerCase().trim()];
        if (coords) {
          result.push({
            lat: coords.lat,
            lon: coords.lon,
            firstName: c.firstName || '',
            lastName: c.lastName || '',
            city: c.city,
            photo: c.photo || null,
          });
        }
      });

      if (!cancelled) {
        setMarkers(result);
        setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [contacts]);

  // Get GPS location via expo-location (works in Expo Go + APK)
  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') return;
        const loc = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        userCoordsRef.current = {
          lat: loc.coords.latitude,
          lon: loc.coords.longitude,
          acc: loc.coords.accuracy,
        };
        injectLocation();
      } catch {}
    })();
  }, []);

  const injectLocation = () => {
    const c = userCoordsRef.current;
    if (c && webviewRef.current) {
      webviewRef.current.injectJavaScript(
        `locateAt(${c.lat},${c.lon},${c.acc});true;`
      );
    }
  };

  const handleMessage = (e) => {
    if (e.nativeEvent.data === 'requestLocation') injectLocation();
  };

  const noCities = contacts.every((c) => !c.city);
  const styles = makeStyles(C);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color={C.dark} />
        </TouchableOpacity>
        <Text style={styles.title}>{t.mapTitle}</Text>
        <View style={{ width: 40 }} />
      </View>

      {noCities ? (
        <View style={styles.center}>
          <Text style={styles.emptyIcon}>🗺️</Text>
          <Text style={styles.emptyTitle}>{t.mapEmpty}</Text>
          <Text style={styles.emptySub}>{t.mapEmptySub}</Text>
        </View>
      ) : loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={C.accent} />
          <Text style={styles.loadingText}>{t.mapGeocoding}</Text>
        </View>
      ) : markers && markers.length > 0 ? (
        <WebView
          ref={webviewRef}
          source={{ html: buildMapHTML(markers) }}
          style={{ flex: 1 }}
          javaScriptEnabled
          domStorageEnabled
          geolocationEnabled
          originWhitelist={['*']}
          onLoadEnd={injectLocation}
          onMessage={handleMessage}
        />
      ) : (
        <View style={styles.center}>
          <Text style={styles.emptyIcon}>📍</Text>
          <Text style={styles.emptyTitle}>{t.mapEmpty}</Text>
          <Text style={styles.emptySub}>{t.mapEmptySub}</Text>
        </View>
      )}
    </View>
  );
}

const makeStyles = (COLORS) => StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingTop: 54, paddingBottom: 14, paddingHorizontal: 16,
    backgroundColor: COLORS.card, borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  backBtn: { padding: 4, width: 40 },
  title: { flex: 1, fontSize: 17, fontWeight: '700', textAlign: 'center', color: COLORS.dark },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },
  emptyIcon: { fontSize: 48, marginBottom: 16 },
  emptyTitle: { fontSize: 17, fontWeight: '600', color: COLORS.dark, marginBottom: 8, textAlign: 'center' },
  emptySub: { fontSize: 14, color: COLORS.gray, textAlign: 'center', lineHeight: 20 },
  loadingText: { marginTop: 14, fontSize: 14, color: COLORS.gray },
});
