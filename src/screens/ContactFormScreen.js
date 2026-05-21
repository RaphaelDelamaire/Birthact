import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  Image,
  Modal,
  FlatList,
  Keyboard,
  BackHandler,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { COLORS } from '../utils/constants';
import { generateId, getInitials, dateToDisplay, displayToISO, formatDateInput } from '../utils/helpers';
import { getFieldLabel } from '../utils/i18n';
import { COUNTRIES, getCountryByCode } from '../utils/countries';
import { loadDefaultCountry } from '../utils/storage';
import { WebView } from 'react-native-webview';

function buildPickerHTML(existingLat, existingLon, isDark) {
  const initJS = (existingLat && existingLon)
    ? `showExisting(${existingLat},${existingLon});`
    : '';
  const tileUrl = 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';
  const tileFilter = isDark
    ? '.leaflet-tile-pane{filter:invert(1) hue-rotate(180deg) brightness(0.82) saturate(1.6)}'
    : '.leaflet-tile-pane{filter:saturate(1.5) brightness(0.92) contrast(1.05)}';
  const bg = isDark ? '#1A1A2E' : '#fff';
  const textCol = isDark ? '#F0F0F8' : '#333';
  const borderCol = isDark ? '#2D2D42' : '#ddd';
  const cancelBg = isDark ? '#2D2D42' : '#eee';

  return `<!DOCTYPE html><html>
<head>
<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1">
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"/>
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"><\/script>
<style>
body{margin:0;padding:0}
#map{width:100%;height:100vh}
${tileFilter}
#hint{position:absolute;top:10px;left:50%;transform:translateX(-50%);background:rgba(0,0,0,0.65);color:#fff;padding:6px 16px;border-radius:20px;font-size:13px;z-index:1000;pointer-events:none;white-space:nowrap}
#panel{position:absolute;bottom:0;left:0;right:0;z-index:1000;background:${bg};padding:12px 16px;border-top:1px solid ${borderCol};display:none;box-shadow:0 -2px 10px rgba(0,0,0,0.15)}
#addr{font-size:13px;color:${textCol};margin-bottom:10px;line-height:1.4}
#btns{display:flex;gap:8px}
#btnOk{flex:1;background:#E8572A;color:#fff;border:none;border-radius:8px;padding:10px;font-size:14px;font-weight:600}
#btnNo{flex:1;background:${cancelBg};color:${textCol};border:none;border-radius:8px;padding:10px;font-size:14px}
</style>
</head>
<body>
<div id="map"></div>
<div id="hint">Appuyez pour sélectionner</div>
<div id="panel">
  <div id="addr"></div>
  <div id="btns">
    <button id="btnNo" onclick="cancelPick()">Annuler</button>
    <button id="btnOk" onclick="doPick()">Confirmer</button>
  </div>
</div>
<script>
var map=L.map('map',{zoomControl:false,attributionControl:false}).setView([20,10],2);
L.tileLayer('${tileUrl}',{attribution:'',maxZoom:19,subdomains:'abcd'}).addTo(map);
var pin=null,pending=null,existPin=null;
function showExisting(lat,lon){
  if(existPin)map.removeLayer(existPin);
  existPin=L.marker([lat,lon],{
    icon:L.divIcon({
      html:'<div style="width:30px;height:30px;border-radius:50%;background:rgba(120,120,120,0.75);border:2px dashed #fff;box-shadow:0 2px 6px rgba(0,0,0,0.3);"></div>',
      className:'',iconSize:[30,30],iconAnchor:[15,15]
    }),opacity:0.8,zIndexOffset:-100
  }).addTo(map);
  existPin.bindPopup('Adresse actuelle');
  map.setView([lat,lon],13);
}
map.on('click',function(e){
  if(pin)map.removeLayer(pin);
  pin=L.marker(e.latlng).addTo(map);
  pending=e.latlng.lat+','+e.latlng.lng;
  document.getElementById('hint').style.display='none';
  document.getElementById('addr').textContent='Chargement...';
  document.getElementById('panel').style.display='block';
  fetch('https://nominatim.openstreetmap.org/reverse?lat='+e.latlng.lat+'&lon='+e.latlng.lng+'&format=json&addressdetails=1',{headers:{'User-Agent':'Birthact/1.0'}})
    .then(function(r){return r.json();})
    .then(function(d){
      if(d.address){
        var a=d.address,parts=[];
        if(a.house_number||a.road)parts.push((a.house_number?a.house_number+' ':'')+( a.road||''));
        var city=a.city||a.town||a.village||a.municipality||'';
        if(city)parts.push(city);
        document.getElementById('addr').textContent=parts.join(', ')||d.display_name.split(',').slice(0,3).join(',');
      } else if(d.display_name){
        document.getElementById('addr').textContent=d.display_name.split(',').slice(0,4).join(',');
      }
    })
    .catch(function(){document.getElementById('addr').textContent=pending;});
});
function doPick(){
  if(pending&&window.ReactNativeWebView)window.ReactNativeWebView.postMessage(pending);
  document.getElementById('panel').style.display='none';
}
function cancelPick(){
  if(pin){map.removeLayer(pin);pin=null;}
  pending=null;
  document.getElementById('panel').style.display='none';
  document.getElementById('hint').style.display='block';
}
${initJS}
<\/script>
</body>
</html>`;
}

function CityInput({ value, onChange, onGeoCoords, initialCoords, placeholder, styles, colors, pickerTitle, isDark }) {
  const C = colors || COLORS;
  const [query, setQuery] = useState(value || '');
  const [suggestions, setSuggestions] = useState([]);
  const [pickerVisible, setPickerVisible] = useState(false);
  const timer = useRef(null);

  useEffect(() => { setQuery(value || ''); }, [value]);
  useEffect(() => { return () => { if (timer.current) clearTimeout(timer.current); }; }, []);

  const search = async (text) => {
    if (text.length < 2) { setSuggestions([]); return; }
    try {
      const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(text)}&format=json&limit=6&addressdetails=1`;
      const res = await fetch(url, { headers: { 'User-Agent': 'Birthact/1.0' } });
      const data = await res.json();
      const seen = new Set();
      const results = [];
      for (const item of data) {
        if (seen.has(item.place_id)) continue;
        seen.add(item.place_id);
        const parts = item.display_name.split(', ');
        const label = parts.slice(0, 2).join(', ');
        const sub = parts.slice(2, 5).join(', ');
        results.push({ id: item.place_id, label, sub });
      }
      setSuggestions(results);
    } catch { setSuggestions([]); }
  };

  const handleChange = (text) => {
    setQuery(text);
    onChange(text);
    if (onGeoCoords) onGeoCoords(null, null);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => search(text), 400);
  };

  const select = (s) => {
    setQuery(s.label);
    onChange(s.label);
    if (onGeoCoords) onGeoCoords(null, null);
    setSuggestions([]);
    Keyboard.dismiss();
  };

  const handleMapPick = async (latlon) => {
    setPickerVisible(false);
    try {
      const [lat, lon] = latlon.split(',');
      const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&addressdetails=1`;
      const res = await fetch(url, { headers: { 'User-Agent': 'Birthact/1.0' } });
      const data = await res.json();
      if (data.address) {
        const a = data.address;
        const streetParts = [];
        if (a.house_number) streetParts.push(a.house_number);
        if (a.road || a.pedestrian || a.path) streetParts.push(a.road || a.pedestrian || a.path);
        const city = a.city || a.town || a.village || a.municipality || a.county || '';
        const addrParts = [];
        if (streetParts.length) addrParts.push(streetParts.join(' '));
        if (city) addrParts.push(city);
        const fullAddr = addrParts.join(', ') || data.display_name.split(', ').slice(0, 3).join(', ');
        setQuery(fullAddr);
        onChange(fullAddr);
        if (onGeoCoords) onGeoCoords(parseFloat(lat), parseFloat(lon));
        setSuggestions([]);
      }
    } catch {}
  };

  return (
    <View style={{ marginBottom: 16 }}>
      <View style={styles.cityInputRow}>
        <TextInput
          style={[styles.input, { flex: 1, marginBottom: 0 }]}
          value={query}
          onChangeText={handleChange}
          placeholder={placeholder}
          placeholderTextColor={C.grayLight}
          autoCapitalize="words"
        />
        <TouchableOpacity style={styles.mapPickBtn} onPress={() => setPickerVisible(true)} activeOpacity={0.7}>
          <Ionicons name="map-outline" size={20} color={C.accent} />
        </TouchableOpacity>
      </View>
      {suggestions.length > 0 && (
        <View style={[styles.suggestionBox, { marginTop: 4, marginBottom: 0 }]}>
          {suggestions.map((s) => (
            <TouchableOpacity
              key={s.id}
              style={styles.suggestionRow}
              onPress={() => select(s)}
              activeOpacity={0.7}
            >
              <Ionicons name="location-outline" size={14} color={C.accent} style={{ marginTop: 1 }} />
              <View style={{ flex: 1 }}>
                <Text style={styles.suggestionCity}>{s.label}</Text>
                <Text style={styles.suggestionSub} numberOfLines={1}>{s.sub}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      )}
      <Modal visible={pickerVisible} animationType="slide" onRequestClose={() => setPickerVisible(false)}>
        <View style={{ flex: 1, backgroundColor: C.background }}>
          <View style={styles.mapPickerHeader}>
            <Text style={styles.modalTitle}>{pickerTitle}</Text>
            <TouchableOpacity onPress={() => setPickerVisible(false)}>
              <Ionicons name="close" size={24} color={C.dark} />
            </TouchableOpacity>
          </View>
          <WebView
            source={{ html: buildPickerHTML(
              initialCoords ? initialCoords.lat : null,
              initialCoords ? initialCoords.lon : null,
              isDark
            ) }}
            style={{ flex: 1 }}
            javaScriptEnabled
            onMessage={(e) => handleMapPick(e.nativeEvent.data)}
          />
        </View>
      </Modal>
    </View>
  );
}

const makeStyles = (COLORS) => StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingTop: 54, paddingBottom: 14, paddingHorizontal: 16,
    backgroundColor: COLORS.card,
    borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  backBtn: { padding: 4, width: 40 },
  title: { flex: 1, fontSize: 17, fontWeight: '700', textAlign: 'center', color: COLORS.dark },
  body: { padding: 20 },
  photoSection: { alignItems: 'center', marginBottom: 24, position: 'relative' },
  photoBtn: {
    width: 100, height: 100, borderRadius: 26, overflow: 'hidden',
    borderWidth: 2, borderColor: COLORS.border, borderStyle: 'dashed',
  },
  photoPreview: { width: '100%', height: '100%' },
  photoPlaceholder: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    backgroundColor: COLORS.card, gap: 4,
  },
  photoPlaceholderText: { fontSize: 10, color: COLORS.grayLight, fontWeight: '500' },
  photoRemove: { position: 'absolute', top: -4, right: '33%', backgroundColor: COLORS.card, borderRadius: 12 },
  photoHint: {
    fontSize: 11, color: COLORS.grayLight, textAlign: 'center',
    marginTop: 8, paddingHorizontal: 20, fontStyle: 'italic',
  },
  label: {
    fontSize: 12, fontWeight: '600', color: COLORS.gray,
    textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6,
  },
  input: {
    backgroundColor: COLORS.card, borderRadius: 10, borderWidth: 1.5,
    borderColor: COLORS.border, paddingHorizontal: 14, paddingVertical: 12,
    fontSize: 15, color: COLORS.dark, marginBottom: 16,
  },
  textArea: { minHeight: 80, textAlignVertical: 'top' },
  phoneRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  countryBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: COLORS.card, borderRadius: 10, borderWidth: 1.5,
    borderColor: COLORS.border, paddingHorizontal: 10, paddingVertical: 12,
  },
  countryFlag: { fontSize: 20 },
  countryDial: { fontSize: 13, fontWeight: '600', color: COLORS.dark },
  phoneInput: { flex: 1, marginBottom: 0 },
  saveBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: COLORS.accent, borderRadius: 12, paddingVertical: 14, marginTop: 8,
  },
  saveBtnText: { color: COLORS.white, fontSize: 15, fontWeight: '700' },
  deleteBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    borderWidth: 1.5, borderColor: COLORS.danger, borderRadius: 12, paddingVertical: 12, marginTop: 12,
  },
  deleteBtnText: { color: COLORS.danger, fontSize: 14, fontWeight: '600' },
  suggestionBox: {
    backgroundColor: COLORS.card,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    marginTop: -12,
    marginBottom: 16,
    overflow: 'hidden',
  },
  suggestionRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  suggestionCity: { fontSize: 14, fontWeight: '600', color: COLORS.dark },
  suggestionSub: { fontSize: 12, color: COLORS.gray, marginTop: 1 },
  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: COLORS.background, borderTopLeftRadius: 20, borderTopRightRadius: 20,
    maxHeight: '80%', paddingBottom: 20,
  },
  modalHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    padding: 20, borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  modalTitle: { fontSize: 17, fontWeight: '700', color: COLORS.dark },
  modalSearch: {
    margin: 16, backgroundColor: COLORS.card, borderRadius: 10,
    borderWidth: 1.5, borderColor: COLORS.border,
    paddingHorizontal: 14, paddingVertical: 10, fontSize: 15, color: COLORS.dark,
  },
  countryRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingHorizontal: 20, paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  countryRowActive: { backgroundColor: COLORS.accentLight },
  countryRowFlag: { fontSize: 22 },
  countryRowName: { flex: 1, fontSize: 15, color: COLORS.dark },
  countryRowDial: { fontSize: 13, color: COLORS.gray },
  tagChip: {
    paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20,
    backgroundColor: COLORS.background, borderWidth: 1, borderColor: COLORS.border,
  },
  tagChipActive: { backgroundColor: COLORS.accent, borderColor: COLORS.accent },
  tagChipText: { fontSize: 13, fontWeight: '500', color: COLORS.gray },
  tagChipTextActive: { color: COLORS.white, fontWeight: '600' },
  tagsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  cityInputRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  mapPickBtn: {
    backgroundColor: COLORS.card, borderRadius: 10, borderWidth: 1.5,
    borderColor: COLORS.border, paddingHorizontal: 12, paddingVertical: 12,
    justifyContent: 'center', alignItems: 'center',
  },
  mapPickerHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingTop: 54, paddingBottom: 14,
    backgroundColor: COLORS.card, borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
});

export default function ContactFormScreen({ contact, fields, contacts, onSave, onDelete, onCancel, colors, t }) {
  const C = colors || COLORS;
  const isDark = C.background === '#0F0F1A';
  const styles = makeStyles(C);
  const [form, setForm] = useState(contact || {});
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [countryModalVisible, setCountryModalVisible] = useState(false);
  const [countrySearch, setCountrySearch] = useState('');
  const isEditing = !!contact;

  const handleSaveRef = useRef(null);

  useEffect(() => {
    (async () => {
      const defaultCode = contact?.phoneCountry || await loadDefaultCountry();
      setSelectedCountry(getCountryByCode(defaultCode));
    })();
  }, []);

  const handleChange = (fieldId, value) => {
    setForm((f) => ({ ...f, [fieldId]: value }));
  };

  const pickPhoto = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(t.permissionRequired, t.permissionMsg);
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
      base64: true,
    });
    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      setForm((f) => ({ ...f, photo: `data:image/jpeg;base64,${asset.base64}` }));
    }
  };

  const removePhoto = () => {
    setForm((f) => {
      const updated = { ...f };
      delete updated.photo;
      return updated;
    });
  };

  const handleSave = () => {
    if (!form.firstName && !form.lastName) {
      Alert.alert(t.fieldRequired, t.fieldRequiredMsg);
      return;
    }
    const clean = Object.fromEntries(
      Object.entries(form).filter(([k]) => !k.startsWith('_'))
    );
    const data = isEditing
      ? clean
      : { ...clean, id: generateId(), createdAt: new Date().toISOString() };
    onSave(data);
  };

  handleSaveRef.current = handleSave;

  useEffect(() => {
    if (!isEditing) return;
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      handleSaveRef.current();
      return true;
    });
    return () => sub.remove();
  }, [isEditing]);

  const handleDelete = () => {
    const name = `${form.firstName || ''} ${form.lastName || ''}`.trim();
    Alert.alert(t.deleteConfirmTitle, t.deleteConfirmMsg(name), [
      { text: t.cancel, style: 'cancel' },
      { text: t.delete, style: 'destructive', onPress: () => onDelete(contact.id) },
    ]);
  };

  const resolveLabel = (field) => getFieldLabel(field.id, t) || field.label;

  const handleCountrySelect = (country) => {
    const currentPhone = form.phone || '';
    let newPhone;
    if (currentPhone.startsWith('+')) {
      const withoutCode = currentPhone.replace(/^\+\d+\s?/, '');
      newPhone = withoutCode ? `${country.dialCode} ${withoutCode}` : country.dialCode + ' ';
    } else if (!currentPhone) {
      newPhone = country.dialCode + ' ';
    } else {
      newPhone = `${country.dialCode} ${currentPhone}`;
    }
    setSelectedCountry(country);
    setForm((f) => ({ ...f, phone: newPhone, phoneCountry: country.code }));
    setCountryModalVisible(false);
    setCountrySearch('');
  };

  const filteredCountries = countrySearch
    ? COUNTRIES.filter((c) =>
        c.name.toLowerCase().includes(countrySearch.toLowerCase()) ||
        c.nameEn.toLowerCase().includes(countrySearch.toLowerCase()) ||
        c.dialCode.includes(countrySearch)
      )
    : COUNTRIES;

  const renderInput = (field) => {
    const value = form[field.id] || '';
    const label = resolveLabel(field);

    if (field.type === 'multiline') {
      return (
        <TextInput
          key={field.id}
          style={[styles.input, styles.textArea]}
          value={value}
          onChangeText={(v) => handleChange(field.id, v)}
          placeholder={`${label}...`}
          placeholderTextColor={C.grayLight}
          multiline
          textAlignVertical="top"
        />
      );
    }

    if (field.id === 'city' || field.type === 'location') {
      const isMainCity = field.id === 'city';
      return (
        <CityInput
          key={field.id}
          value={value}
          onChange={(v) => handleChange(field.id, v)}
          initialCoords={isMainCity && form.geoLat && form.geoLon ? { lat: form.geoLat, lon: form.geoLon } : null}
          onGeoCoords={isMainCity ? (lat, lon) => {
            if (lat !== null && lon !== null) {
              setForm((f) => ({ ...f, geoLat: lat, geoLon: lon }));
            } else {
              setForm((f) => { const n = { ...f }; delete n.geoLat; delete n.geoLon; return n; });
            }
          } : undefined}
          placeholder={`${label}...`}
          styles={styles}
          colors={C}
          pickerTitle={t.mapTitle}
          isDark={isDark}
        />
      );
    }

    if (field.type === 'tags') {
      const tagValue = Array.isArray(form[field.id]) ? form[field.id] : [];
      const TAG_OPTIONS = [
        { value: 'friends', label: t.tagFriends },
        { value: 'family', label: t.tagFamily },
        { value: 'studies', label: t.tagStudies },
        { value: 'work', label: t.tagWork },
        { value: 'other', label: t.tagOther },
      ];
      return (
        <View key={field.id} style={styles.tagsWrap}>
          {TAG_OPTIONS.map((opt) => {
            const active = tagValue.includes(opt.value);
            return (
              <TouchableOpacity
                key={opt.value}
                style={[styles.tagChip, active && styles.tagChipActive]}
                onPress={() => {
                  handleChange(field.id, active ? [] : [opt.value]);
                }}
                activeOpacity={0.7}
              >
                <Text style={[styles.tagChipText, active && styles.tagChipTextActive]}>
                  {opt.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      );
    }

    if (field.id === 'phone') {
      return (
        <View key={field.id} style={styles.phoneRow}>
          <TouchableOpacity
            style={styles.countryBtn}
            onPress={() => setCountryModalVisible(true)}
            activeOpacity={0.7}
          >
            <Text style={styles.countryFlag}>{selectedCountry?.flag || '🌍'}</Text>
            <Text style={styles.countryDial}>{selectedCountry?.dialCode || ''}</Text>
            <Ionicons name="chevron-down" size={14} color={C.gray} />
          </TouchableOpacity>
          <TextInput
            style={[styles.input, styles.phoneInput]}
            value={value}
            onChangeText={(v) => handleChange(field.id, v)}
            placeholder="6 12 34 56 78"
            placeholderTextColor={C.grayLight}
            keyboardType="phone-pad"
          />
        </View>
      );
    }

    if (field.type === 'date') {
      const displayVal = `_${field.id}_display` in form
        ? form[`_${field.id}_display`]
        : dateToDisplay(value);
      return (
        <TextInput
          key={field.id}
          style={styles.input}
          value={displayVal}
          onChangeText={(text) => {
            const formatted = formatDateInput(text);
            const iso = displayToISO(formatted);
            setForm((f) => {
              const updated = { ...f, [`_${field.id}_display`]: formatted };
              if (iso) updated[field.id] = iso;
              return updated;
            });
          }}
          placeholder={t.datePlaceholder}
          placeholderTextColor={C.grayLight}
          keyboardType="numeric"
          maxLength={10}
        />
      );
    }

    let keyboardType = 'default';
    if (field.type === 'email') keyboardType = 'email-address';
    if (field.type === 'url') keyboardType = 'url';

    return (
      <TextInput
        key={field.id}
        style={styles.input}
        value={value}
        onChangeText={(v) => handleChange(field.id, v)}
        placeholder={`${label}...`}
        placeholderTextColor={C.grayLight}
        keyboardType={keyboardType}
        autoCapitalize={field.type === 'email' || field.type === 'url' ? 'none' : 'sentences'}
      />
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={isEditing ? handleSave : onCancel} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color={C.dark} />
        </TouchableOpacity>
        <Text style={styles.title}>{isEditing ? t.editContact : t.newContact}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
        <View style={styles.photoSection}>
          <TouchableOpacity onPress={pickPhoto} style={styles.photoBtn} activeOpacity={0.7}>
            {form.photo ? (
              <Image source={{ uri: form.photo }} style={styles.photoPreview} />
            ) : (
              <View style={styles.photoPlaceholder}>
                <Ionicons name="camera-outline" size={28} color={C.grayLight} />
                <Text style={styles.photoPlaceholderText}>{t.addPhoto}</Text>
              </View>
            )}
          </TouchableOpacity>
          {form.photo && (
            <TouchableOpacity onPress={removePhoto} style={styles.photoRemove}>
              <Ionicons name="close-circle" size={22} color={C.danger} />
            </TouchableOpacity>
          )}
          <Text style={styles.photoHint}>{t.photoHint}</Text>
        </View>

        {fields.map((field) => (
          <View key={field.id}>
            <Text style={styles.label}>{resolveLabel(field)}</Text>
            {renderInput(field)}
          </View>
        ))}

        {!isEditing && (
          <TouchableOpacity style={styles.saveBtn} onPress={handleSave} activeOpacity={0.8}>
            <Ionicons name="checkmark" size={20} color={C.white} />
            <Text style={styles.saveBtnText}>{t.addContact}</Text>
          </TouchableOpacity>
        )}

        {isEditing && (
          <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete} activeOpacity={0.7}>
            <Ionicons name="trash-outline" size={18} color={C.danger} />
            <Text style={styles.deleteBtnText}>{t.deleteContact}</Text>
          </TouchableOpacity>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Country picker modal */}
      <Modal
        visible={countryModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setCountryModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{t.selectCountry}</Text>
              <TouchableOpacity onPress={() => { setCountryModalVisible(false); setCountrySearch(''); }}>
                <Ionicons name="close" size={24} color={C.dark} />
              </TouchableOpacity>
            </View>
            <TextInput
              style={styles.modalSearch}
              placeholder="Rechercher..."
              placeholderTextColor={C.grayLight}
              value={countrySearch}
              onChangeText={setCountrySearch}
              autoFocus
            />
            <FlatList
              data={filteredCountries}
              keyExtractor={(item) => item.code}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.countryRow, selectedCountry?.code === item.code && styles.countryRowActive]}
                  onPress={() => handleCountrySelect(item)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.countryRowFlag}>{item.flag}</Text>
                  <Text style={styles.countryRowName}>{item.name}</Text>
                  <Text style={styles.countryRowDial}>{item.dialCode}</Text>
                  {selectedCountry?.code === item.code && (
                    <Ionicons name="checkmark-circle" size={18} color={C.accent} />
                  )}
                </TouchableOpacity>
              )}
              keyboardShouldPersistTaps="handled"
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}
