/* WANTOK PNG automatic, permission-based location service.
   Requests the device's location after the user's first feature interaction.
   It never blocks navigation or shares coordinates without an explicit share action. */
(function () {
  'use strict';
  var CACHE_KEY = 'wantok_png_location_session_v1';
  var REFRESH_AFTER = 5 * 60 * 1000;
  var pending = false;
  var lastAttempt = 0;

  function readCache() {
    try {
      var raw = sessionStorage.getItem(CACHE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (_) { return null; }
  }

  function publish(value) {
    window.WANTOK_LOCATION = value;
    try { window.dispatchEvent(new CustomEvent('wantok:location-update', { detail: value })); } catch (_) {}
  }

  var cached = readCache();
  if (cached && cached.latitude && cached.longitude) {
    publish(cached);
  } else {
    publish({ status: 'not-requested', latitude: null, longitude: null, accuracy: null, updatedAt: null });
  }

  function locate() {
    var now = Date.now();
    var current = window.WANTOK_LOCATION || {};
    if (pending) return;
    if (current.latitude && current.longitude && current.updatedAt && now - current.updatedAt < REFRESH_AFTER) return;
    if (now - lastAttempt < 15000) return;
    lastAttempt = now;

    if (!navigator.geolocation) {
      publish({ status: 'unsupported', latitude: null, longitude: null, accuracy: null, updatedAt: null });
      return;
    }

    pending = true;
    publish({ status: 'requesting', latitude: current.latitude || null, longitude: current.longitude || null, accuracy: current.accuracy || null, updatedAt: current.updatedAt || null });

    navigator.geolocation.getCurrentPosition(function (position) {
      pending = false;
      var value = {
        status: 'ready',
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy || null,
        updatedAt: Date.now()
      };
      try { sessionStorage.setItem(CACHE_KEY, JSON.stringify(value)); } catch (_) {}
      publish(value);
    }, function (error) {
      pending = false;
      var status = error && error.code === 1 ? 'permission-denied' : error && error.code === 2 ? 'unavailable' : 'timeout';
      publish({ status: status, latitude: null, longitude: null, accuracy: null, updatedAt: null });
      try { window.dispatchEvent(new CustomEvent('wantok:location-error', { detail: { status: status } })); } catch (_) {}
    }, { enableHighAccuracy: true, timeout: 15000, maximumAge: 60000 });
  }

  window.WANTOK_LOCATION_SERVICE = {
    request: locate,
    get: function () { return window.WANTOK_LOCATION || null; },
    mapUrl: function () {
      var p = window.WANTOK_LOCATION || {};
      if (p.status !== 'ready') return null;
      return 'https://www.openstreetmap.org/?mlat=' + p.latitude + '&mlon=' + p.longitude + '#map=16/' + p.latitude + '/' + p.longitude;
    }
  };

  /* Any intentional feature control can initiate the one-time permission request.
     The original feature click continues normally while GPS is being resolved. */
  document.addEventListener('click', function (event) {
    var target = event.target && event.target.closest
      ? event.target.closest('button, a, [role="button"], [data-a], [data-tab], [data-go], .tile, .bottom-nav')
      : null;
    if (!target) return;
    locate();
  }, true);
})();
