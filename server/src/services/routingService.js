const axios = require('axios');
const Report = require('../models/Report');

function calculateDistanceMeters(lat1, lon1, lat2, lon2) {
  const R = 6371e3;
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

  const a = Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
            Math.cos(phi1) * Math.cos(phi2) *
            Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

class RoutingService {
  constructor() {
    this.osrmBaseUrl = process.env.ROUTING_SERVICE_URL || 'https://router.project-osrm.org';
  }

  /**
   * Get route from start [lng, lat] to end [lng, lat] with mode ('driving' | 'walking' | 'cycling')
   */
  async getRoute(startCoords, endCoords, mode = 'driving') {
    const [startLng, startLat] = startCoords;
    const [endLng, endLat] = endCoords;

    const profile = mode === 'walking' ? 'foot' : mode === 'cycling' ? 'bike' : 'car';
    const url = `${this.osrmBaseUrl}/route/v1/${profile}/${startLng},${startLat};${endLng},${endLat}?overview=full&geometries=geojson&steps=true&alternatives=true`;

    let osrmRoutes = [];

    try {
      const response = await axios.get(url, { timeout: 5000 });
      if (response.data && response.data.routes && response.data.routes.length > 0) {
        osrmRoutes = response.data.routes;
      }
    } catch (err) {
      console.warn(`OSRM Routing failed (${err.message}). Generating direct navigation path fallback.`);
    }

    // Direct fallback if external OSRM is unreachable or timed out
    if (osrmRoutes.length === 0) {
      const distanceDirectMeters = calculateDistanceMeters(startLat, startLng, endLat, endLng) * 1.3;
      const speedKmH = mode === 'walking' ? 4.5 : mode === 'cycling' ? 14 : 35;
      const durationSeconds = Math.round((distanceDirectMeters / (speedKmH * 1000)) * 3600);

      // Interpolate waypoint points
      const points = [];
      const stepsCount = 10;
      for (let i = 0; i <= stepsCount; i++) {
        const ratio = i / stepsCount;
        points.push([
          parseFloat((startLng + (endLng - startLng) * ratio).toFixed(6)),
          parseFloat((startLat + (endLat - startLat) * ratio).toFixed(6))
        ]);
      }

      osrmRoutes = [{
        geometry: {
          type: 'LineString',
          coordinates: points
        },
        distance: Math.round(distanceDirectMeters),
        duration: durationSeconds,
        legs: [{
          summary: 'Direct Vector Corridor',
          steps: [
            { name: 'Start journey', instruction: 'Head towards destination', distance: Math.round(distanceDirectMeters) }
          ]
        }]
      }];
    }

    // Fetch active reports in the bounding area to identify hazards along the path
    const minLng = Math.min(startLng, endLng) - 0.05;
    const maxLng = Math.max(startLng, endLng) + 0.05;
    const minLat = Math.min(startLat, endLat) - 0.05;
    const maxLat = Math.max(startLat, endLat) + 0.05;

    const nearbyHazards = await Report.find({
      status: { $in: ['pending', 'under_review', 'verified'] },
      'location.coordinates.0': { $gte: minLng, $lte: maxLng },
      'location.coordinates.1': { $gte: minLat, $lte: maxLat }
    }).select('title category severity location status address reportedAt');

    // Process each route alternative and identify proximate hazards (< 200m)
    const processedRoutes = osrmRoutes.map((route, index) => {
      const routeCoords = route.geometry.coordinates; // array of [lng, lat]
      const detectedHazards = [];

      for (const hazard of nearbyHazards) {
        const [hLng, hLat] = hazard.location.coordinates;
        let minDistanceToRoute = Infinity;

        // Check distance to route coordinates
        for (let i = 0; i < routeCoords.length; i += 2) {
          const [rLng, rLat] = routeCoords[i];
          const dist = calculateDistanceMeters(hLat, hLng, rLat, rLng);
          if (dist < minDistanceToRoute) {
            minDistanceToRoute = dist;
          }
          if (dist < 200) break;
        }

        if (minDistanceToRoute <= 200) {
          detectedHazards.push({
            id: hazard._id,
            title: hazard.title,
            category: hazard.category,
            severity: hazard.severity,
            status: hazard.status,
            distanceFromPathMeters: Math.round(minDistanceToRoute),
            location: hazard.location
          });
        }
      }

      return {
        routeIndex: index,
        isPrimary: index === 0,
        name: index === 0 ? 'Fastest Available Route' : `Alternative Route ${index}`,
        distanceKm: (route.distance / 1000).toFixed(1),
        durationMinutes: Math.round(route.duration / 60),
        coordinates: route.geometry.coordinates,
        steps: route.legs?.[0]?.steps?.map(s => ({
          name: s.name || 'Road',
          instruction: s.maneuver?.instruction || `Continue on ${s.name || 'unnamed road'}`,
          distanceMeters: Math.round(s.distance || 0)
        })) || [],
        hazardCount: detectedHazards.length,
        hazards: detectedHazards,
        safetyRating: detectedHazards.length === 0 ? 'Clear Path (No Reported Incidents)' : `${detectedHazards.length} Reported Hazard(s) Nearby`
      };
    });

    return {
      travelMode: mode,
      trafficStatus: 'Live real-time traffic feed is currently unconfigured. ETA calculations represent standard free-flow routing velocities.',
      safetyDisclaimer: 'Route recommendations are informational. No route is guaranteed safe. Please exercise situational awareness.',
      routes: processedRoutes
    };
  }
}

module.exports = new RoutingService();
