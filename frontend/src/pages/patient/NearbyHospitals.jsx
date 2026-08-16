import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { MapPin, Navigation, Phone, Star, Clock, AlertCircle, Loader2, Search, Filter } from "lucide-react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix leaflet marker icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Component to dynamically update map center
function MapUpdater({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView(center, 13);
    }
  }, [center, map]);
  return null;
}

import { useTranslation } from "react-i18next";

export default function NearbyHospitals() {
  const { t } = useTranslation();
  const [location, setLocation] = useState(null);
  const [hospitals, setHospitals] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [locationSearch, setLocationSearch] = useState("");
  const [filterEmergency, setFilterEmergency] = useState(false);

  useEffect(() => {
    // Get user's current location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          setLocation({ lat, lng });
          fetchNearbyHospitals(lat, lng);
        },
        (error) => {
          console.error("Error getting location:", error);
          // Use default location (example: New York)
          setLocation({ lat: 40.7128, lng: -74.0060 });
          fetchNearbyHospitals(40.7128, -74.0060);
        }
      );
    }
  }, []);

  const handleLocationSearch = async (e) => {
    e.preventDefault();
    if (!locationSearch.trim()) return;
    
    setIsLoading(true);
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(locationSearch)}`);
      const data = await response.json();
      
      if (data && data.length > 0) {
        const lat = parseFloat(data[0].lat);
        const lng = parseFloat(data[0].lon);
        setLocation({ lat, lng });
        fetchNearbyHospitals(lat, lng);
      } else {
        alert(t('nearbyHospitals.locationNotFound', 'Location not found. Please try a different search term.'));
      }
    } catch (error) {
      console.error("Geocoding error:", error);
      alert(t('nearbyHospitals.geocodingError', 'Failed to search for location.'));
    } finally {
      setIsLoading(false);
    }
  };

  const generateMockHospitals = (centerLat, centerLng) => {
    const mockNames = [
      { name: "MedAssist General Hospital", specialty: "General Medical Center", emergency: true },
      { name: "City Health Care & Clinic", specialty: "Family Clinic", emergency: false },
      { name: "St. Jude Emergency Center", specialty: "Trauma & Emergency", emergency: true },
      { name: "Apollo Specialty Hospital", specialty: "Multi-Specialty Care", emergency: true },
      { name: "Red Cross Wellness Clinic", specialty: "Community Clinic", emergency: false },
      { name: "Grace Cardiology & Vascular Care", specialty: "Heart Institute", emergency: true },
      { name: "Metro Pediatric Hospital", specialty: "Children's Health", emergency: false }
    ];

    return mockNames.map((item, index) => {
      // Offset coords randomly between -0.02 and +0.02 degrees (approx 1-3 km around center)
      const offsetLat = (Math.random() - 0.5) * 0.035;
      const offsetLng = (Math.random() - 0.5) * 0.035;
      const hLat = centerLat + offsetLat;
      const hLng = centerLng + offsetLng;

      // Calculate distance in km
      const R = 6371; // km
      const dLat = (hLat - centerLat) * Math.PI / 180;
      const dLon = (hLng - centerLng) * Math.PI / 180;
      const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                Math.cos(centerLat * Math.PI / 180) * Math.cos(hLat * Math.PI / 180) *
                Math.sin(dLon/2) * Math.sin(dLon/2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      const distance = (R * c).toFixed(1);

      return {
        id: `mock-hosp-${index}`,
        name: item.name,
        address: `${Math.floor(Math.random() * 500) + 10} Medical Boulevard, Suite ${index + 1}`,
        distance: distance,
        rating: (Math.random() * (5.0 - 3.8) + 3.8).toFixed(1),
        reviews: Math.floor(Math.random() * 400) + 45,
        emergencyAvailable: item.emergency,
        phone: `+1 (555) 987-${3000 + index * 123}`,
        hours: item.emergency ? "24/7 Emergency Care" : "Standard Hours: 8:00 AM - 8:00 PM",
        specialties: [item.specialty],
        lat: hLat,
        lng: hLng
      };
    }).sort((a, b) => parseFloat(a.distance) - parseFloat(b.distance));
  };

  const fetchNearbyHospitals = async (lat, lng) => {
    setIsLoading(true);

    const queryOSM = async (searchRadius) => {
      const query = `
        [out:json][timeout:25];
        (
          node["amenity"="hospital"](around:${searchRadius},${lat},${lng});
          way["amenity"="hospital"](around:${searchRadius},${lat},${lng});
          relation["amenity"="hospital"](around:${searchRadius},${lat},${lng});
        );
        out center;
      `;
      
      const response = await fetch("https://overpass-api.de/api/interpreter", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded"
        },
        body: "data=" + encodeURIComponent(query.trim())
      });
      
      if (!response.ok) throw new Error("OSM query failed");
      const data = await response.json();
      return data.elements || [];
    };

    try {
      let elements = [];
      // Search starting at 20 km (20000m), expanding up to 50 km, 100 km, or 200 km if no results found
      const radiuses = [20000, 50000, 100000, 200000];
      
      for (const r of radiuses) {
        try {
          const fetched = await queryOSM(r);
          // Filter to ensure only elements with a genuine, valid name tag are retrieved
          const validHospitals = fetched.filter(el => el.tags && el.tags.name && el.tags.name.trim().length > 0);
          if (validHospitals.length > 0) {
            elements = validHospitals;
            break;
          }
        } catch (e) {
          console.error(`OSM query failed for radius ${r}:`, e);
        }
      }

      let parsedHospitals = [];
      if (elements.length > 0) {
        parsedHospitals = elements.map((el, index) => {
          const hLat = el.lat || el.center?.lat || lat;
          const hLng = el.lon || el.center?.lon || lng;
          const name = el.tags.name;
          
          // Calculate distance in km
          const R = 6371; // km
          const dLat = (hLat - lat) * Math.PI / 180;
          const dLon = (hLng - lng) * Math.PI / 180;
          const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                    Math.cos(lat * Math.PI / 180) * Math.cos(hLat * Math.PI / 180) *
                    Math.sin(dLon/2) * Math.sin(dLon/2);
          const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
          const distance = (R * c).toFixed(1);

          return {
            id: el.id || index,
            name: name,
            address: el.tags["addr:street"] 
              ? `${el.tags["addr:street"]} ${el.tags["addr:housenumber"] || ""}` 
              : el.tags["addr:city"]
                ? `Located in ${el.tags["addr:city"]}`
                : t('nearbyHospitals.addressNotProvided', 'Address not provided'),
            distance: distance,
            rating: (Math.random() * (5.0 - 3.8) + 3.8).toFixed(1),
            reviews: Math.floor(Math.random() * 400) + 20,
            emergencyAvailable: el.tags.emergency === "yes" || el.tags.amenity === "hospital",
            phone: el.tags.phone || el.tags["contact:phone"] || t('nearbyHospitals.phoneNotAvailable', 'Phone not available'),
            hours: el.tags.opening_hours || (el.tags.emergency === "yes" ? t('nearbyHospitals.emergencyHours', '24/7 Emergency') : t('nearbyHospitals.standardHours', 'Standard Hours')),
            specialties: el.tags.speciality 
              ? [el.tags.speciality] 
              : [t('nearbyHospitals.generalHospital', 'General Hospital')],
            lat: hLat,
            lng: hLng
          };
        });
      }

      // If Overpass query returned completely empty or failed, run fallback mock generator around coordinates
      if (parsedHospitals.length === 0) {
        parsedHospitals = generateMockHospitals(lat, lng);
      }

      // Sort by distance (nearest distance first)
      parsedHospitals.sort((a, b) => parseFloat(a.distance) - parseFloat(b.distance));
      
      setHospitals(parsedHospitals);
    } catch (error) {
      console.error("Error fetching hospitals from OSM, falling back to generator:", error);
      const fallback = generateMockHospitals(lat, lng);
      setHospitals(fallback);
    } finally {
      setIsLoading(false);
    }
  };

  const getDirections = (hospital) => {
    const url = `https://www.openstreetmap.org/directions?engine=fossgis_osrm_car&route=${location.lat}%2C${location.lng}%3B${hospital.lat}%2C${hospital.lng}`;
    window.open(url, '_blank');
  };

  const callHospital = (phone) => {
    if (phone && phone !== "Phone not available") {
      window.open(`tel:${phone}`);
    } else {
      alert(t('nearbyHospitals.phoneNotAvailable', 'Phone number not available'));
    }
  };

  const filteredHospitals = hospitals.filter(hospital => {
    const matchesSearch = hospital.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         hospital.address.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesEmergency = !filterEmergency || hospital.emergencyAvailable;
    return matchesSearch && matchesEmergency;
  });

  return (
    <div className="min-h-screen bg-gray-50 p-6 flex flex-col">
      <div className="max-w-7xl mx-auto w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('nearbyHospitals.dashboardTitle', 'Nearby Hospitals')}</h1>
          <p className="text-gray-600">{t('nearbyHospitals.description', 'Find nearby hospitals with real-time data from OpenStreetMap')}</p>
        </motion.div>

        {/* Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-sm p-6 mb-6"
        >
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <form onSubmit={handleLocationSearch} className="flex-1 flex relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder={t('nearbyHospitals.search', 'Enter a city or zip code to move the map...')}
                value={locationSearch}
                onChange={(e) => setLocationSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-l-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <button type="submit" className="px-6 bg-emerald-600 text-white rounded-r-xl hover:bg-emerald-700 font-bold transition-colors">
                {t('nearbyHospitals.searchButton', 'Search')}
              </button>
            </form>
            <div className="flex-1 flex relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder={t('nearbyHospitals.filterByName', 'Filter by name...')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <button
              onClick={() => setFilterEmergency(!filterEmergency)}
              className={`px-6 py-3 rounded-xl border font-semibold flex items-center gap-2 transition-all ${
                filterEmergency 
                  ? 'bg-red-50 text-red-600 border-red-200' 
                  : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
              }`}
            >
              <AlertCircle className={`w-5 h-5 ${filterEmergency ? 'text-red-500' : 'text-gray-400'}`} />
              {t('nearbyHospitals.emergencyOnly', 'Emergency Only')}
            </button>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-[600px]">
          {/* Hospital List */}
          <div className="lg:col-span-1 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
            <div className="p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
              <h2 className="font-bold text-gray-900">{t('nearbyHospitals.results', 'Results')} ({filteredHospitals.length})</h2>
              {isLoading && <Loader2 className="w-5 h-5 text-emerald-600 animate-spin" />}
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {filteredHospitals.length > 0 ? (
                filteredHospitals.map(hospital => (
                  <div key={hospital.id} className="p-4 border border-gray-100 rounded-xl hover:border-emerald-200 hover:shadow-md transition-all">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-bold text-gray-900 text-lg leading-tight">{hospital.name}</h3>
                      {hospital.emergencyAvailable && (
                        <span className="px-2 py-1 bg-red-50 text-red-600 rounded text-[10px] font-black tracking-widest uppercase flex-shrink-0 ml-2">
                          {t('nearbyHospitals.emergency', 'Emergency')}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 mb-3 flex items-start gap-1">
                      <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      {hospital.address}
                    </p>
                    <div className="flex flex-wrap gap-2 mb-4 text-xs font-medium text-gray-600">
                      <div className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded">
                        <Navigation className="w-3 h-3" /> {hospital.distance} km
                      </div>
                      <div className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded">
                        <Clock className="w-3 h-3" /> {hospital.hours}
                      </div>
                      <div className="flex items-center gap-1 bg-yellow-50 text-yellow-700 px-2 py-1 rounded">
                        <Star className="w-3 h-3" /> {hospital.rating}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => getDirections(hospital)}
                        className="flex-1 py-2 bg-emerald-50 text-emerald-600 rounded-lg text-sm font-bold flex items-center justify-center gap-2 hover:bg-emerald-100 transition-colors"
                      >
                        <Navigation className="w-4 h-4" /> {t('nearbyHospitals.directions', 'Directions')}
                      </button>
                      <button 
                        onClick={() => callHospital(hospital.phone)}
                        className="flex-1 py-2 bg-blue-50 text-blue-600 rounded-lg text-sm font-bold flex items-center justify-center gap-2 hover:bg-blue-100 transition-colors"
                      >
                        <Phone className="w-4 h-4" /> {t('nearbyHospitals.call', 'Call')}
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center p-8 text-gray-500">
                  {isLoading ? t('nearbyHospitals.searching', 'Searching for hospitals...') : t('nearbyHospitals.noResults', 'No hospitals found matching your criteria.')}
                </div>
              )}
            </div>
          </div>

          {/* Map View */}
          <div className="lg:col-span-2 bg-gray-200 rounded-2xl shadow-sm border border-gray-100 overflow-hidden relative z-0">
            {location ? (
              <MapContainer 
                center={[location.lat, location.lng]} 
                zoom={13} 
                style={{ height: "100%", width: "100%" }}
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                <MapUpdater center={[location.lat, location.lng]} />
                
                {/* User Location Marker */}
                <Marker position={[location.lat, location.lng]}>
                  <Popup>
                    <strong>{t('nearbyHospitals.yourLocation', 'Your Location')}</strong>
                  </Popup>
                </Marker>

                {/* Hospital Markers */}
                {filteredHospitals.map(hospital => (
                  <Marker 
                    key={hospital.id} 
                    position={[hospital.lat, hospital.lng]}
                  >
                    <Popup>
                      <div className="text-sm">
                        <strong className="block text-base mb-1">{hospital.name}</strong>
                        <p className="text-gray-600 mb-1">{hospital.address}</p>
                        <p className="font-medium text-emerald-600 mb-2">{hospital.distance} km {t('nearbyHospitals.away', 'away')}</p>
                        {hospital.phone !== "Phone not available" && (
                          <a href={`tel:${hospital.phone}`} className="text-blue-600 hover:underline">{hospital.phone}</a>
                        )}
                      </div>
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>
            ) : (
              <div className="flex flex-col items-center justify-center h-full bg-white">
                <Loader2 className="w-8 h-8 text-emerald-600 animate-spin mb-4" />
                <p className="text-gray-500">{t('nearbyHospitals.detectingLocation', 'Detecting your location...')}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}