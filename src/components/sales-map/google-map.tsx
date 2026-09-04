import { forwardRef, useImperativeHandle, useMemo, useRef } from "react";
import { Platform, View } from "react-native";
import { WebView } from "react-native-webview";

import {
  channelColor,
  channelLabel,
  type SalesAccount,
} from "@/lib/sales-map-data";

export interface GoogleSalesMapHandle {
  zoomIn: () => void;
  zoomOut: () => void;
  setHidden: (channels: string[]) => void;
  setSearch: (term: string) => void;
  /** Drop/move the "you are here" marker; `center` pans the map onto it. */
  setUserLocation: (lat: number, lng: number, center?: boolean) => void;
  /** Draw a dashed route through the given stops (in visit order). */
  drawRoute: (coords: { lat: number; lng: number }[]) => void;
  clearRoute: () => void;
}

interface GoogleSalesMapProps {
  accounts: SalesAccount[];
  apiKey: string;
}

/** Points fed to the map's own JS — colour/label resolved up front. */
function toPoints(accounts: SalesAccount[]) {
  return accounts.map((a) => ({
    id: a.id,
    lat: a.lat,
    lng: a.lng,
    name: a.name,
    city: a.city,
    address: a.address,
    channel: a.channel,
    accountType: a.accountType,
    color: channelColor(a.channel),
    label: channelLabel(a.channel),
  }));
}

function buildHtml(accounts: SalesAccount[], apiKey: string): string {
  const points = JSON.stringify(toPoints(accounts));
  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
<style>
  html, body, #map { height: 100%; margin: 0; padding: 0; background: #0B1220; }
  /* "You are here" beacon — a large translucent halo + pulsing ring around a
     solid core, deliberately unlike the small solid channel-coloured dots. */
  .user-loc { position:absolute; width:48px; height:48px; pointer-events:none; }
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
<script>
  var POINTS = ${points};
  var hidden = {};
  var searchTerm = '';
  var map, markers = [], infoWindow, userOverlay, routePolyline;

  function markerIcon(color) {
    return {
      path: google.maps.SymbolPath.CIRCLE,
      scale: 10,
      fillColor: color,
      fillOpacity: 1,
      strokeColor: '#ffffff',
      strokeWeight: 2,
    };
  }

  function popupHtml(p) {
    var location = p.city || p.address || '';
    var typeBg = p.accountType === 'on-premise' ? '#dcfce7' : '#dbeafe';
    var typeColor = p.accountType === 'on-premise' ? '#166534' : '#1e40af';
    return '<div style="min-width:180px;font-family:inherit;color:#111827">'
      + '<p style="font-weight:600;margin:0 0 2px 0;font-size:14px;color:#111827">' + p.name + '</p>'
      + '<p style="font-size:12px;color:#6b7280;margin:0 0 4px 0">' + p.label + '</p>'
      + '<p style="font-size:11px;color:#9ca3af;margin:0">' + location + '</p>'
      + (p.accountType ? '<span style="display:inline-block;margin-top:6px;font-size:10px;padding:2px 6px;border-radius:4px;background:' + typeBg + ';color:' + typeColor + '">' + p.accountType + '</span>' : '')
      + '<div style="width:8px;height:8px;background:' + p.color + ';border-radius:50%;display:inline-block;margin-left:8px;vertical-align:middle"></div>'
      + '</div>';
  }

  function render() {
    markers.forEach(function (m) { m.setMap(null); });
    markers = [];
    var q = searchTerm.toLowerCase();
    POINTS.forEach(function (p) {
      if (hidden[p.channel]) return;
      if (q) {
        var hay = (p.name + ' ' + (p.city || '')).toLowerCase();
        if (hay.indexOf(q) === -1) return;
      }
      var m = new google.maps.Marker({
        position: { lat: p.lat, lng: p.lng },
        map: map,
        icon: markerIcon(p.color),
      });
      m.addListener('click', function () {
        infoWindow.setContent(popupHtml(p));
        infoWindow.open({ map: map, anchor: m });
      });
      markers.push(m);
    });
  }

  // Frame every account instead of centering on their midpoint — averaging
  // lat/lng puts far-apart accounts (e.g. US + UK) over open water.
  function fitToPoints() {
    if (POINTS.length === 0) return;
    if (POINTS.length === 1) {
      map.setCenter({ lat: POINTS[0].lat, lng: POINTS[0].lng });
      map.setZoom(13);
      return;
    }
    var bounds = new google.maps.LatLngBounds();
    POINTS.forEach(function (p) { bounds.extend({ lat: p.lat, lng: p.lng }); });
    map.fitBounds(bounds, 50);
    google.maps.event.addListenerOnce(map, 'bounds_changed', function () {
      if (map.getZoom() > 13) map.setZoom(13);
    });
  }

  // A raw-DOM overlay (not a Marker) so it can carry the CSS pulse animation —
  // Google's Marker icons are static images and can't animate. Just the
  // constructor is declared here; its prototype chain (which needs
  // google.maps.OverlayView) is wired up inside initMap, once the Maps script
  // has actually loaded — this block runs before that async script does, so
  // referencing the global google object up here throws.
  function UserLocationOverlay(gmap, position) {
    this.position = position;
    this.div = null;
    this.setMap(gmap);
  }

  window.setHidden = function (arr) {
    hidden = {};
    (arr || []).forEach(function (c) { hidden[c] = true; });
    if (map) render();
  };
  window.setSearch = function (term) {
    searchTerm = term || '';
    if (map) render();
  };
  window.setUserLocation = function (lat, lng, center) {
    var pos = new google.maps.LatLng(lat, lng);
    if (userOverlay) userOverlay.setPosition(pos);
    else userOverlay = new UserLocationOverlay(map, pos);
    if (center) { map.setCenter(pos); map.setZoom(14); }
  };
  window.drawRoute = function (coordsJson) {
    var coords = JSON.parse(coordsJson);
    if (routePolyline) { routePolyline.setMap(null); routePolyline = null; }
    if (!map || coords.length < 2) return;
    var dashSymbol = { path: 'M 0,-1 0,1', strokeOpacity: 1, scale: 4 };
    routePolyline = new google.maps.Polyline({
      path: coords,
      strokeColor: '#8B5CF6',
      strokeOpacity: 0,
      icons: [{ icon: dashSymbol, offset: '0', repeat: '20px' }],
      map: map,
    });
    var bounds = new google.maps.LatLngBounds();
    coords.forEach(function (c) { bounds.extend(c); });
    map.fitBounds(bounds, 60);
    google.maps.event.addListenerOnce(map, 'bounds_changed', function () {
      if (map.getZoom() > 14) map.setZoom(14);
    });
  };
  window.clearRoute = function () {
    if (routePolyline) { routePolyline.setMap(null); routePolyline = null; }
  };
  window.zoomIn = function () { if (map) map.setZoom((map.getZoom() || 13) + 1); };
  window.zoomOut = function () { if (map) map.setZoom((map.getZoom() || 13) - 1); };

  window.initMap = function () {
    // google.maps exists now — safe to build the overlay's prototype chain.
    UserLocationOverlay.prototype = new google.maps.OverlayView();
    UserLocationOverlay.prototype.onAdd = function () {
      var div = document.createElement('div');
      div.className = 'user-loc';
      div.innerHTML = '<div class="user-halo"></div><div class="user-ring"></div><div class="user-core"></div>';
      this.div = div;
      this.getPanes().overlayMouseTarget.appendChild(div);
    };
    UserLocationOverlay.prototype.draw = function () {
      var proj = this.getProjection();
      if (!proj || !this.div) return;
      var pos = proj.fromLatLngToDivPixel(this.position);
      this.div.style.left = (pos.x - 24) + 'px';
      this.div.style.top = (pos.y - 24) + 'px';
    };
    UserLocationOverlay.prototype.onRemove = function () {
      if (this.div) { this.div.parentNode.removeChild(this.div); this.div = null; }
    };
    UserLocationOverlay.prototype.setPosition = function (pos) {
      this.position = pos;
      this.draw();
    };

    map = new google.maps.Map(document.getElementById('map'), {
      center: { lat: 51.5074, lng: -0.1278 },
      zoom: 13,
      disableDefaultUI: true,
    });
    infoWindow = new google.maps.InfoWindow();
    render();
    fitToPoints();
  };
</script>
<script src="https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(apiKey)}&loading=async&callback=initMap" async defer></script>
</body>
</html>`;
}

/**
 * The Sales Map itself: a WebView hosting the Google Maps JavaScript API —
 * the same engine the web app uses (front-end/src/components/sales-map/
 * sales-map-inner.tsx) — so markers, colours and popups match. Controls are
 * driven imperatively from the overlay via the exposed handle. The HTML is
 * built once per accounts change — channel visibility/search are toggled
 * through injected JS, never a reload, so panning/zoom state is preserved.
 */
export const GoogleSalesMap = forwardRef<GoogleSalesMapHandle, GoogleSalesMapProps>(
  function GoogleSalesMap({ accounts, apiKey }, ref) {
    const webRef = useRef<WebView>(null);
    const iframeRef = useRef<HTMLIFrameElement | null>(null);
    const html = useMemo(() => buildHtml(accounts, apiKey), [accounts, apiKey]);

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
            setHidden: (channels) => callWeb("setHidden", channels),
            setSearch: (term) => callWeb("setSearch", term),
            setUserLocation: (lat, lng, center = true) =>
              callWeb("setUserLocation", lat, lng, center),
            drawRoute: (coords) => callWeb("drawRoute", JSON.stringify(coords)),
            clearRoute: () => callWeb("clearRoute"),
          }
        : {
            zoomIn: () => run("window.zoomIn && window.zoomIn()"),
            zoomOut: () => run("window.zoomOut && window.zoomOut()"),
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
            drawRoute: (coords) =>
              run(
                `window.drawRoute && window.drawRoute(${JSON.stringify(JSON.stringify(coords))})`,
              ),
            clearRoute: () => run("window.clearRoute && window.clearRoute()"),
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
