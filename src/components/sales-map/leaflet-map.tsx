import {
  forwardRef,
  useImperativeHandle,
  useMemo,
  useRef,
} from "react";
import { Platform, View } from "react-native";
import { WebView } from "react-native-webview";

import {
  channelColor,
  channelLabel,
  type SalesAccount,
} from "@/lib/sales-map-data";

export interface LeafletMapHandle {
  zoomIn: () => void;
  zoomOut: () => void;
  locate: () => void;
  setHidden: (channels: string[]) => void;
  setSearch: (term: string) => void;
  /** Drop/move the "you are here" marker; `center` pans the map onto it. */
  setUserLocation: (lat: number, lng: number, center?: boolean) => void;
}

interface LeafletMapProps {
  accounts: SalesAccount[];
  /** Initial map centre; defaults to Lower Manhattan. */
  center?: [number, number];
}

/** Points fed to the Leaflet HTML — colour/label resolved up front. */
function toPoints(accounts: SalesAccount[]) {
  return accounts.map((a) => ({
    lat: a.lat,
    lng: a.lng,
    name: a.name,
    city: a.city,
    channel: a.channel,
    color: channelColor(a.channel),
    label: channelLabel(a.channel),
  }));
}

function buildHtml(accounts: SalesAccount[], center: [number, number]): string {
  const points = JSON.stringify(toPoints(accounts));
  const centerStr = JSON.stringify(center);
  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
<link rel="stylesheet" href="https://unpkg.com/leaflet.markercluster@1.5.3/dist/MarkerCluster.css" />
<style>
  html, body, #map { height: 100%; margin: 0; padding: 0; background: #0B1220; }
  .leaflet-container { background: #0B1220; font-family: -apple-system, system-ui, sans-serif; }
  .marker-dot { width:22px; height:22px; border:2px solid #fff; border-radius:50%; box-shadow:0 2px 4px rgba(0,0,0,.35); }
  .cluster-badge {
    display:flex; align-items:center; justify-content:center;
    width:44px; height:44px; border-radius:50%;
    background:#2563EB; color:#fff; font-weight:700; font-size:15px;
    border:3px solid #fff; box-shadow:0 3px 8px rgba(0,0,0,.4);
  }
  .leaflet-popup-content-wrapper { border-radius:12px; }
  .leaflet-popup-content { margin:10px 12px; }
  .pop-name { font-weight:600; font-size:14px; margin:0 0 2px; }
  .pop-sub { font-size:12px; color:#6b7280; margin:0; }
  /* "You are here" beacon — deliberately unlike the account dots: a small solid
     core sitting inside a large translucent accuracy halo, with a pulsing ring. */
  .user-loc { position:relative; width:48px; height:48px; }
  .user-halo {
    position:absolute; inset:0; border-radius:50%;
    background:rgba(37,99,235,.16); border:1px solid rgba(37,99,235,.35);
  }
  .user-ring {
    position:absolute; top:50%; left:50%; width:20px; height:20px;
    margin:-10px 0 0 -10px; border-radius:50%;
    box-shadow:0 0 0 0 rgba(37,99,235,.5);
    animation:user-pulse 2s infinite;
  }
  .user-core {
    position:absolute; top:50%; left:50%; width:16px; height:16px;
    margin:-8px 0 0 -8px; border-radius:50%;
    background:#2563EB; border:3px solid #fff;
    box-shadow:0 1px 4px rgba(0,0,0,.45);
  }
  @keyframes user-pulse {
    0%   { box-shadow:0 0 0 0 rgba(37,99,235,.5); }
    70%  { box-shadow:0 0 0 18px rgba(37,99,235,0); }
    100% { box-shadow:0 0 0 0 rgba(37,99,235,0); }
  }
</style>
</head>
<body>
<div id="map"></div>
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
<script src="https://unpkg.com/leaflet.markercluster@1.5.3/dist/leaflet.markercluster.js"></script>
<script>
  var POINTS = ${points};
  var hidden = {};
  var searchTerm = '';
  var map = L.map('map', { zoomControl: false, attributionControl: true })
    .setView(${centerStr}, 13);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    maxZoom: 19,
  }).addTo(map);

  function markerIcon(color) {
    return L.divIcon({
      html: '<div class="marker-dot" style="background:' + color + '"></div>',
      iconSize: [22, 22], iconAnchor: [11, 11], className: '',
    });
  }
  function clusterIcon(cluster) {
    return L.divIcon({
      html: '<div class="cluster-badge">' + cluster.getChildCount() + '</div>',
      iconSize: [44, 44], iconAnchor: [22, 22], className: '',
    });
  }

  var clusterGroup = null;
  function render() {
    if (clusterGroup) { map.removeLayer(clusterGroup); }
    clusterGroup = L.markerClusterGroup({
      iconCreateFunction: clusterIcon,
      showCoverageOnHover: false,
      maxClusterRadius: 48,
      spiderfyOnMaxZoom: true,
    });
    POINTS.forEach(function (p) {
      if (hidden[p.channel]) return;
      if (searchTerm) {
        var hay = (p.name + ' ' + p.city + ' ' + p.label).toLowerCase();
        if (hay.indexOf(searchTerm) === -1) return;
      }
      var m = L.marker([p.lat, p.lng], { icon: markerIcon(p.color) });
      m.bindPopup(
        '<p class="pop-name">' + p.name + '</p>' +
        '<p class="pop-sub">' + p.label + ' &middot; ' + p.city + '</p>'
      );
      clusterGroup.addLayer(m);
    });
    map.addLayer(clusterGroup);
  }

  // Frame every account instead of centering on their midpoint. Averaging
  // lat/lng puts far-apart accounts (e.g. US + UK) over open water; fitBounds
  // frames a viewport that contains them all. One account: just centre on it.
  function fitToPoints() {
    if (POINTS.length === 0) return;
    if (POINTS.length === 1) {
      map.setView([POINTS[0].lat, POINTS[0].lng], 13);
      return;
    }
    var bounds = L.latLngBounds(POINTS.map(function (p) { return [p.lat, p.lng]; }));
    map.fitBounds(bounds, { padding: [50, 50], maxZoom: 13 });
  }

  window.setHidden = function (arr) {
    hidden = {};
    (arr || []).forEach(function (c) { hidden[c] = true; });
    render();
  };
  window.setSearch = function (term) {
    searchTerm = (term || '').toLowerCase();
    render();
  };
  var userMarker = null;
  function userIcon() {
    return L.divIcon({
      html: '<div class="user-loc"><div class="user-halo"></div>' +
            '<div class="user-ring"></div><div class="user-core"></div></div>',
      iconSize: [48, 48], iconAnchor: [24, 24], className: '',
    });
  }
  window.setUserLocation = function (lat, lng, center) {
    if (userMarker) { userMarker.setLatLng([lat, lng]); }
    else {
      userMarker = L.marker([lat, lng], { icon: userIcon(), zIndexOffset: 1000 })
        .bindPopup('<p class="pop-name">You are here</p>');
      userMarker.addTo(map);
    }
    if (center) { map.setView([lat, lng], 14); }
  };

  window.zoomIn = function () { map.zoomIn(); };
  window.zoomOut = function () { map.zoomOut(); };
  window.locate = function () { map.locate({ setView: true, maxZoom: 15 }); };

  render();
  fitToPoints();
</script>
</body>
</html>`;
}

/**
 * The Sales Map itself: a WebView hosting the same Leaflet + OpenStreetMap
 * stack the web app uses, so markers, clustering and popups match. Controls are
 * driven imperatively from the overlay via the exposed handle. The HTML is
 * built once — channel visibility is toggled through injected JS, never a
 * reload — so panning/zoom state is preserved.
 */
export const LeafletMap = forwardRef<LeafletMapHandle, LeafletMapProps>(
  function LeafletMap({ accounts, center = [40.712, -74.01] }, ref) {
    const webRef = useRef<WebView>(null);
    const iframeRef = useRef<HTMLIFrameElement | null>(null);
    const html = useMemo(
      () => buildHtml(accounts, center),
      [accounts, center],
    );

    // Native: inject JS into the WebView. Web: call the same globals through the
    // (same-origin, srcDoc) iframe's window — react-native-webview has no web
    // build, so the map runs in a plain iframe there instead.
    const run = (js: string) => webRef.current?.injectJavaScript(js + "; true;");
    const callWeb = (fn: string, ...args: unknown[]) => {
      const win = iframeRef.current?.contentWindow as
        | (Window & Record<string, (...a: unknown[]) => void>)
        | null
        | undefined;
      if (win && typeof win[fn] === "function") win[fn](...args);
    };

    useImperativeHandle(ref, () =>
      Platform.OS === "web"
        ? {
            zoomIn: () => callWeb("zoomIn"),
            zoomOut: () => callWeb("zoomOut"),
            locate: () => callWeb("locate"),
            setHidden: (channels) => callWeb("setHidden", channels),
            setSearch: (term) => callWeb("setSearch", term),
            setUserLocation: (lat, lng, center = true) =>
              callWeb("setUserLocation", lat, lng, center),
          }
        : {
            zoomIn: () => run("window.zoomIn && window.zoomIn()"),
            zoomOut: () => run("window.zoomOut && window.zoomOut()"),
            locate: () => run("window.locate && window.locate()"),
            setHidden: (channels) =>
              run(
                `window.setHidden && window.setHidden(${JSON.stringify(channels)})`,
              ),
            setSearch: (term) =>
              run(`window.setSearch && window.setSearch(${JSON.stringify(term)})`),
            setUserLocation: (lat, lng, center = true) =>
              run(
                `window.setUserLocation && window.setUserLocation(${lat}, ${lng}, ${center})`,
              ),
          },
    );

    if (Platform.OS === "web") {
      return (
        <View className="flex-1">
          <iframe
            ref={iframeRef}
            srcDoc={html}
            title="Sales map"
            style={{ border: 0, width: "100%", height: "100%" }}
          />
        </View>
      );
    }

    return (
      <View className="flex-1">
        <WebView
          ref={webRef}
          originWhitelist={["*"]}
          source={{ html }}
          style={{ flex: 1, backgroundColor: "#0B1220" }}
          javaScriptEnabled
          domStorageEnabled
          // The map handles its own gestures; let it capture the pan/pinch.
          scrollEnabled={false}
          overScrollMode="never"
          setBuiltInZoomControls={false}
        />
      </View>
    );
  },
);
