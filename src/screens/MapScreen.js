import React, { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { WebView } from 'react-native-webview';
import { COLORS, STORAGE_KEYS } from '../utils/constants';

async function geocodeCity(city) {
  try {
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(city)}&format=json&limit=1`;
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Birthact/1.0 (contact app)' },
    });
    const data = await res.json();
    if (data[0]) return { lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon) };
  } catch {}
  return null;
}

function buildMapHTML(markers) {
  const markerLines = markers
    .map((m) => {
      const names = m.contacts.map((n) => n.replace(/'/g, "\\'")).join('<br>');
      return `markers.addLayer(L.marker([${m.lat}, ${m.lon}]).bindPopup('<b>${m.city.replace(/'/g, "\\'")}</b><br>${names}'))`;
    })
    .join(';\n');

  return `<!DOCTYPE html>
<html>
<head>
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0">
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"/>
<link rel="stylesheet" href="https://unpkg.com/leaflet.markercluster@1.5.3/dist/MarkerCluster.css"/>
<link rel="stylesheet" href="https://unpkg.com/leaflet.markercluster@1.5.3/dist/MarkerCluster.Default.css"/>
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
<script src="https://unpkg.com/leaflet.markercluster@1.5.3/dist/leaflet.markercluster.js"></script>
<style>
  body { margin: 0; padding: 0; }
  #map { width: 100%; height: 100vh; }
  .leaflet-popup-content { font-family: -apple-system, sans-serif; font-size: 13px; }
</style>
</head>
<body>
<div id="map"></div>
<script>
  var map = L.map('map').setView([20, 10], 2);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap',
    maxZoom: 18
  }).addTo(map);
  var markers = L.markerClusterGroup({ maxClusterRadius: 60 });
  ${markerLines};
  map.addLayer(markers);
  if (markers.getLayers().length > 0) {
    map.fitBounds(markers.getBounds().pad(0.2));
  }
</script>
</body>
</html>`;
}

export default function MapScreen({ contacts, onBack, t }) {
  const [markers, setMarkers] = useState(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setStatus(t.mapGeocoding);

      // Group contacts by city
      const cityMap = {};
      contacts.forEach((c) => {
        if (!c.city) return;
        const key = c.city.toLowerCase().trim();
        if (!cityMap[key]) cityMap[key] = { city: c.city, contacts: [] };
        cityMap[key].contacts.push(`${c.firstName || ''} ${c.lastName || ''}`.trim());
      });

      // Load geocode cache
      let cache = {};
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEYS.geocodeCache);
        if (raw) cache = JSON.parse(raw);
      } catch {}

      const result = [];
      for (const [key, data] of Object.entries(cityMap)) {
        if (cancelled) return;
        let coords = cache[key];
        if (!coords) {
          coords = await geocodeCity(data.city);
          if (coords) cache[key] = coords;
        }
        if (coords) result.push({ ...coords, city: data.city, contacts: data.contacts });
      }

      // Save updated cache
      try {
        await AsyncStorage.setItem(STORAGE_KEYS.geocodeCache, JSON.stringify(cache));
      } catch {}

      if (!cancelled) {
        setMarkers(result);
        setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [contacts]);

  const noCities = contacts.every((c) => !c.city);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color={COLORS.dark} />
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
          <ActivityIndicator size="large" color={COLORS.accent} />
          <Text style={styles.loadingText}>{status || t.mapLoading}</Text>
        </View>
      ) : markers && markers.length > 0 ? (
        <WebView
          source={{ html: buildMapHTML(markers) }}
          style={{ flex: 1 }}
          javaScriptEnabled
          domStorageEnabled
          originWhitelist={['*']}
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

const styles = StyleSheet.create({
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
