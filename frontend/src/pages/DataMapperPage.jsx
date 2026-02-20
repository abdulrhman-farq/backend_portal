import { useState, useMemo, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';

const TARGET_SCHEMA = [
  { key: 'global_id', label: 'GlobalID', type: 'text' },
  { key: 'name_ar', label: 'Name (AR)', type: 'text' },
  { key: 'name_en', label: 'Name (EN)', type: 'text' },
  { key: 'legal_name', label: 'Legal Name', type: 'text' },
  { key: 'category', label: 'Category', type: 'text' },
  { key: 'secondary_category', label: 'Secondary Category', type: 'text' },
  { key: 'category_level_3', label: 'Category Level 3', type: 'text' },
  { key: 'company_status', label: 'Company Status', type: 'text' },
  { key: 'latitude', label: 'Latitude', type: 'number' },
  { key: 'longitude', label: 'Longitude', type: 'number' },
  { key: 'google_map_url', label: 'Google Map URL', type: 'text' },
  { key: 'building_number', label: 'Building Number', type: 'text' },
  { key: 'floor_number', label: 'Floor Number', type: 'text' },
  { key: 'entrance_location', label: 'Entrance Location', type: 'text' },
  { key: 'phone_number', label: 'Phone Number', type: 'text' },
  { key: 'email', label: 'Email', type: 'text' },
  { key: 'website', label: 'Website', type: 'text' },
  { key: 'social_media', label: 'Social Media', type: 'text' },
  { key: 'working_days', label: 'Working Days', type: 'text' },
  { key: 'working_hours', label: 'Working Hours for Each Day', type: 'text' },
  { key: 'break_time', label: 'Break Time for Each Day', type: 'text' },
  { key: 'holidays', label: 'Holidays', type: 'text' },
  { key: 'menu_barcode_url', label: 'Menu Barcode URL', type: 'text' },
  { key: 'language', label: 'Language', type: 'text' },
  { key: 'cuisine', label: 'Cuisine', type: 'text' },
  { key: 'accepted_payment_methods', label: 'Accepted Payment Methods', type: 'text' },
  { key: 'commercial_license_number', label: 'Commercial License Number', type: 'text' },
  { key: 'menu', label: 'Menu', type: 'boolean' },
  { key: 'drive_thru', label: 'Drive Thru', type: 'boolean' },
  { key: 'dine_in', label: 'Dine In', type: 'boolean' },
  { key: 'only_delivery', label: 'Only Delivery', type: 'boolean' },
  { key: 'reservation', label: 'Reservation', type: 'boolean' },
  { key: 'require_ticket', label: 'Require Ticket', type: 'boolean' },
  { key: 'order_from_car', label: 'Order from Car', type: 'boolean' },
  { key: 'pickup_point_exists', label: 'Pickup Point Exists', type: 'boolean' },
  { key: 'wifi', label: 'WiFi', type: 'boolean' },
  { key: 'music', label: 'Music', type: 'boolean' },
  { key: 'valet_parking', label: 'Valet Parking', type: 'boolean' },
  { key: 'has_parking_lot', label: 'Has Parking Lot', type: 'boolean' },
  { key: 'is_wheelchair_accessible', label: 'Is Wheelchair Accessible', type: 'boolean' },
  { key: 'has_family_seating', label: 'Has Family Seating', type: 'boolean' },
  { key: 'has_waiting_area', label: 'Has a Waiting Area', type: 'boolean' },
  { key: 'has_separate_rooms', label: 'Has Separate Rooms for Dining', type: 'boolean' },
  { key: 'has_smoking_area', label: 'Has Smoking Area', type: 'boolean' },
  { key: 'children_area', label: 'Children Area', type: 'boolean' },
  { key: 'shisha', label: 'Shisha', type: 'boolean' },
  { key: 'live_sport_broadcasting', label: 'Live Sport Broadcasting', type: 'boolean' },
  { key: 'is_landmark', label: 'Is Landmark', type: 'boolean' },
  { key: 'is_trending', label: 'Is Trending', type: 'boolean' },
  { key: 'large_groups', label: 'Large Groups Can Be Seated', type: 'boolean' },
  { key: 'has_women_prayer_room', label: 'Has Women-Only Prayer Room', type: 'boolean' },
  { key: 'provides_iftar_tent', label: 'Provides Iftar Tent', type: 'boolean' },
  { key: 'offers_iftar_menu', label: 'Offers Iftar Menu', type: 'boolean' },
  { key: 'is_open_during_suhoor', label: 'Is Open During Suhoor', type: 'boolean' },
  { key: 'is_free_entry', label: 'Is Free Entry', type: 'boolean' },
];

// Aliases for fuzzy matching source fields to target schema
const FIELD_ALIASES = {
  global_id: ['globalid', 'global_id', 'id', 'uuid', 'objectid', 'object_id', 'arcgis_global_id'],
  name_ar: ['name_ar', 'namear', 'name (ar)', 'name_arabic', 'arabic_name', 'poi_name_ar', 'اسم'],
  name_en: ['name_en', 'nameen', 'name (en)', 'name_english', 'english_name', 'poi_name_en', 'name'],
  legal_name: ['legal_name', 'legalname', 'legal name', 'registered_name', 'business_name'],
  category: ['category', 'primary_category', 'main_category', 'type', 'فئة'],
  secondary_category: ['secondary_category', 'secondarycategory', 'sub_category', 'subcategory'],
  category_level_3: ['category_level_3', 'categorylevel3', 'category_l3', 'tertiary_category'],
  company_status: ['company_status', 'companystatus', 'status', 'operating_status', 'الحالة'],
  latitude: ['latitude', 'lat', 'y', 'خط_العرض'],
  longitude: ['longitude', 'lng', 'lon', 'long', 'x', 'خط_الطول'],
  google_map_url: ['google_map_url', 'googlemapurl', 'google_maps', 'map_url', 'maps_link', 'google_map_link'],
  building_number: ['building_number', 'buildingnumber', 'building_no', 'building'],
  floor_number: ['floor_number', 'floornumber', 'floor_no', 'floor', 'level'],
  entrance_location: ['entrance_location', 'entrancelocation', 'entrance_description', 'entrance'],
  phone_number: ['phone_number', 'phonenumber', 'phone', 'tel', 'telephone', 'mobile', 'رقم_الهاتف'],
  email: ['email', 'e_mail', 'contact_email', 'البريد'],
  website: ['website', 'web', 'url', 'site', 'الموقع'],
  social_media: ['social_media', 'socialmedia', 'instagram', 'tiktok', 'twitter', 'snapchat', 'social'],
  working_days: ['working_days', 'workingdays', 'days', 'open_days', 'أيام_العمل'],
  working_hours: ['working_hours', 'workinghours', 'hours', 'open_hours', 'ساعات_العمل'],
  break_time: ['break_time', 'breaktime', 'break_times', 'break'],
  holidays: ['holidays', 'holiday', 'closures', 'closed_days', 'الإجازات'],
  menu_barcode_url: ['menu_barcode_url', 'menubarcodeurl', 'menu_qr', 'qr_url', 'menu_url', 'qr_code'],
  language: ['language', 'languages', 'languages_spoken', 'lang', 'اللغة'],
  cuisine: ['cuisine', 'cuisine_type', 'food_type', 'المطبخ'],
  accepted_payment_methods: ['accepted_payment_methods', 'payment_methods', 'payment', 'payments', 'طرق_الدفع'],
  commercial_license_number: ['commercial_license_number', 'license_number', 'license', 'cr_number', 'commercial_license', 'الرخصة'],
  menu: ['menu', 'has_menu', 'physical_menu', 'has_physical_menu'],
  drive_thru: ['drive_thru', 'drivethru', 'drive_through'],
  dine_in: ['dine_in', 'dinein', 'dine'],
  only_delivery: ['only_delivery', 'onlydelivery', 'delivery_only', 'delivery'],
  reservation: ['reservation', 'reservations', 'reservation_available', 'booking'],
  require_ticket: ['require_ticket', 'requireticket', 'ticket_required', 'ticket'],
  order_from_car: ['order_from_car', 'orderfromcar', 'car_order'],
  pickup_point_exists: ['pickup_point_exists', 'pickuppointexists', 'pickup_point', 'pickup'],
  wifi: ['wifi', 'wi_fi', 'free_wifi', 'has_wifi'],
  music: ['music', 'has_music', 'plays_music'],
  valet_parking: ['valet_parking', 'valetparking', 'valet'],
  has_parking_lot: ['has_parking_lot', 'hasparkinglot', 'parking_lot', 'parking'],
  is_wheelchair_accessible: ['is_wheelchair_accessible', 'wheelchair_accessible', 'wheelchair', 'accessible'],
  has_family_seating: ['has_family_seating', 'familyseating', 'family_seating', 'family_section'],
  has_waiting_area: ['has_waiting_area', 'waitingarea', 'waiting_area', 'waiting'],
  has_separate_rooms: ['has_separate_rooms', 'separaterooms', 'separate_rooms', 'private_rooms', 'private_dining'],
  has_smoking_area: ['has_smoking_area', 'smokingarea', 'smoking_area', 'smoking'],
  children_area: ['children_area', 'childrenarea', 'kids_area', 'play_area', 'children'],
  shisha: ['shisha', 'hookah', 'shisha_available'],
  live_sport_broadcasting: ['live_sport_broadcasting', 'livesportbroadcasting', 'live_sports', 'sports', 'live_sport'],
  is_landmark: ['is_landmark', 'islandmark', 'landmark'],
  is_trending: ['is_trending', 'istrending', 'trending'],
  large_groups: ['large_groups', 'largegroups', 'large_group', 'group_seating'],
  has_women_prayer_room: ['has_women_prayer_room', 'womenprayerroom', 'women_prayer', 'prayer_room'],
  provides_iftar_tent: ['provides_iftar_tent', 'iftartent', 'iftar_tent'],
  offers_iftar_menu: ['offers_iftar_menu', 'iftarmenu', 'iftar_menu', 'iftar'],
  is_open_during_suhoor: ['is_open_during_suhoor', 'openduringshuhoor', 'suhoor', 'open_suhoor'],
  is_free_entry: ['is_free_entry', 'isfreeentry', 'free_entry', 'free_admission'],
};

function normalize(str) {
  return str.toLowerCase().replace(/[\s\-()\/\\]+/g, '_').replace(/[^a-z0-9_\u0600-\u06FF]/g, '').trim();
}

function autoMapField(sourceField) {
  const norm = normalize(sourceField);
  for (const [targetKey, aliases] of Object.entries(FIELD_ALIASES)) {
    for (const alias of aliases) {
      if (norm === normalize(alias)) return targetKey;
    }
  }
  // Partial match as fallback
  for (const [targetKey, aliases] of Object.entries(FIELD_ALIASES)) {
    for (const alias of aliases) {
      const normAlias = normalize(alias);
      if (norm.includes(normAlias) || normAlias.includes(norm)) return targetKey;
    }
  }
  return '';
}

function parseCSV(text) {
  const lines = text.trim().split(/\r?\n/);
  if (lines.length < 2) return [];
  // Detect delimiter
  const firstLine = lines[0];
  const tabCount = (firstLine.match(/\t/g) || []).length;
  const commaCount = (firstLine.match(/,/g) || []).length;
  const semicolonCount = (firstLine.match(/;/g) || []).length;
  let delimiter = ',';
  if (tabCount > commaCount && tabCount > semicolonCount) delimiter = '\t';
  else if (semicolonCount > commaCount) delimiter = ';';

  const parseRow = (line) => {
    const result = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (inQuotes) {
        if (ch === '"' && line[i + 1] === '"') {
          current += '"';
          i++;
        } else if (ch === '"') {
          inQuotes = false;
        } else {
          current += ch;
        }
      } else {
        if (ch === '"') {
          inQuotes = true;
        } else if (ch === delimiter) {
          result.push(current.trim());
          current = '';
        } else {
          current += ch;
        }
      }
    }
    result.push(current.trim());
    return result;
  };

  const headers = parseRow(lines[0]);
  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue;
    const values = parseRow(lines[i]);
    const obj = {};
    headers.forEach((h, idx) => {
      obj[h] = values[idx] || '';
    });
    rows.push(obj);
  }
  return rows;
}

function detectAndParse(text) {
  const trimmed = text.trim();
  // Try JSON
  if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed)) return { data: parsed, format: 'json' };
      return { data: [parsed], format: 'json' };
    } catch {
      // Not valid JSON, continue
    }
  }
  // Try CSV/TSV
  const lines = trimmed.split(/\r?\n/);
  if (lines.length >= 2) {
    const parsed = parseCSV(trimmed);
    if (parsed.length > 0) return { data: parsed, format: 'csv' };
  }
  return { data: null, format: null };
}

function convertValue(value, type) {
  if (value === null || value === undefined || value === '') return type === 'boolean' ? null : '';
  if (type === 'boolean') {
    const v = String(value).toLowerCase().trim();
    if (['true', 'yes', '1', 'نعم', 'y'].includes(v)) return true;
    if (['false', 'no', '0', 'لا', 'n'].includes(v)) return false;
    return null;
  }
  if (type === 'number') {
    const n = Number(value);
    return isNaN(n) ? '' : n;
  }
  return String(value);
}

export default function DataMapperPage() {
  const { t } = useTranslation();
  const [step, setStep] = useState(1);
  const [rawInput, setRawInput] = useState('');
  const [parsedData, setParsedData] = useState([]);
  const [sourceFields, setSourceFields] = useState([]);
  const [mappings, setMappings] = useState({});
  const [mappedOutput, setMappedOutput] = useState([]);
  const [parseError, setParseError] = useState('');
  const [detectedFormat, setDetectedFormat] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const fileInputRef = useRef(null);

  const handleParse = useCallback(() => {
    setParseError('');
    if (!rawInput.trim()) {
      setParseError(t('mapper.errorEmpty', 'Please paste or upload some data first.'));
      return;
    }
    const { data, format } = detectAndParse(rawInput);
    if (!data || data.length === 0) {
      setParseError(t('mapper.errorParse', 'Could not parse the data. Please check the format (JSON or CSV).'));
      return;
    }
    setDetectedFormat(format);
    setParsedData(data);
    // Extract all unique fields
    const fields = new Set();
    data.forEach(row => Object.keys(row).forEach(k => fields.add(k)));
    const fieldList = Array.from(fields);
    setSourceFields(fieldList);
    // Auto-map
    const autoMappings = {};
    fieldList.forEach(f => {
      const match = autoMapField(f);
      if (match) autoMappings[f] = match;
    });
    setMappings(autoMappings);
    setStep(2);
  }, [rawInput, t]);

  const handleFileUpload = useCallback((e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setRawInput(ev.target.result);
    };
    reader.readAsText(file);
  }, []);

  const handleMappingChange = useCallback((sourceField, targetKey) => {
    setMappings(prev => {
      const next = { ...prev };
      if (targetKey === '') {
        delete next[sourceField];
      } else {
        next[sourceField] = targetKey;
      }
      return next;
    });
  }, []);

  const handleTransform = useCallback(() => {
    const output = parsedData.map(row => {
      const mapped = {};
      TARGET_SCHEMA.forEach(field => {
        mapped[field.key] = field.type === 'boolean' ? null : '';
      });
      // Apply mappings
      for (const [sourceField, targetKey] of Object.entries(mappings)) {
        if (!targetKey) continue;
        const targetField = TARGET_SCHEMA.find(f => f.key === targetKey);
        if (!targetField) continue;
        mapped[targetKey] = convertValue(row[sourceField], targetField.type);
      }
      return mapped;
    });
    setMappedOutput(output);
    setStep(3);
  }, [parsedData, mappings]);

  const handleExportJSON = useCallback(() => {
    const blob = new Blob([JSON.stringify(mappedOutput, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'mapped_data.json';
    a.click();
    URL.revokeObjectURL(url);
  }, [mappedOutput]);

  const handleExportCSV = useCallback(() => {
    const headers = TARGET_SCHEMA.map(f => f.label);
    const keys = TARGET_SCHEMA.map(f => f.key);
    const rows = mappedOutput.map(row =>
      keys.map(k => {
        const val = row[k];
        if (val === null || val === undefined) return '';
        const str = String(val);
        if (str.includes(',') || str.includes('"') || str.includes('\n')) {
          return '"' + str.replace(/"/g, '""') + '"';
        }
        return str;
      }).join(',')
    );
    const csv = [headers.join(','), ...rows].join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'mapped_data.csv';
    a.click();
    URL.revokeObjectURL(url);
  }, [mappedOutput]);

  const handleReset = useCallback(() => {
    setStep(1);
    setRawInput('');
    setParsedData([]);
    setSourceFields([]);
    setMappings({});
    setMappedOutput([]);
    setParseError('');
    setDetectedFormat('');
    setSearchTerm('');
  }, []);

  const mappedCount = Object.keys(mappings).length;
  const unmappedCount = sourceFields.length - mappedCount;

  const filteredSourceFields = useMemo(() => {
    if (!searchTerm) return sourceFields;
    const lower = searchTerm.toLowerCase();
    return sourceFields.filter(f => {
      const target = mappings[f];
      const targetLabel = target ? TARGET_SCHEMA.find(t => t.key === target)?.label || '' : '';
      return f.toLowerCase().includes(lower) || targetLabel.toLowerCase().includes(lower);
    });
  }, [sourceFields, searchTerm, mappings]);

  // Which target fields have been assigned
  const assignedTargets = useMemo(() => {
    return new Set(Object.values(mappings));
  }, [mappings]);

  const sampleRow = parsedData[0] || {};

  return (
    <div className="mapper-page">
      <div className="mapper-header">
        <div>
          <h2>{t('mapper.title', 'Data Mapper')}</h2>
          <p className="mapper-subtitle">{t('mapper.subtitle', 'Transform any data to the target POI schema')}</p>
        </div>
        {step > 1 && (
          <button className="btn" onClick={handleReset}>
            {t('mapper.reset', 'Start Over')}
          </button>
        )}
      </div>

      {/* Step indicator */}
      <div className="mapper-steps">
        <div className={`mapper-step ${step >= 1 ? 'active' : ''} ${step > 1 ? 'done' : ''}`}>
          <span className="mapper-step-num">{step > 1 ? '\u2713' : '1'}</span>
          <span className="mapper-step-label">{t('mapper.step1', 'Input Data')}</span>
        </div>
        <div className="mapper-step-line" />
        <div className={`mapper-step ${step >= 2 ? 'active' : ''} ${step > 2 ? 'done' : ''}`}>
          <span className="mapper-step-num">{step > 2 ? '\u2713' : '2'}</span>
          <span className="mapper-step-label">{t('mapper.step2', 'Map Fields')}</span>
        </div>
        <div className="mapper-step-line" />
        <div className={`mapper-step ${step >= 3 ? 'active' : ''}`}>
          <span className="mapper-step-num">3</span>
          <span className="mapper-step-label">{t('mapper.step3', 'Export')}</span>
        </div>
      </div>

      {/* Step 1: Input */}
      {step === 1 && (
        <div className="mapper-input-section">
          <div className="mapper-card">
            <div className="mapper-card-header">
              <h3>{t('mapper.pasteData', 'Paste Your Data')}</h3>
              <div className="mapper-card-actions">
                <input
                  type="file"
                  ref={fileInputRef}
                  accept=".json,.csv,.tsv,.txt"
                  onChange={handleFileUpload}
                  style={{ display: 'none' }}
                />
                <button className="btn" onClick={() => fileInputRef.current?.click()}>
                  <UploadIcon /> {t('mapper.uploadFile', 'Upload File')}
                </button>
              </div>
            </div>
            <textarea
              className="mapper-textarea"
              value={rawInput}
              onChange={(e) => setRawInput(e.target.value)}
              placeholder={t('mapper.placeholder', 'Paste JSON, CSV, or TSV data here...\n\nJSON example:\n[\n  { "name": "Store A", "lat": 24.7, "lng": 46.6 }\n]\n\nCSV example:\nname,category,phone\nStore A,restaurant,+966500000000')}
              rows={16}
            />
            {parseError && <div className="mapper-error">{parseError}</div>}
            <div className="mapper-card-footer">
              <div className="mapper-formats">
                <span className="badge blue">{t('mapper.supportsJSON', 'JSON')}</span>
                <span className="badge blue">{t('mapper.supportsCSV', 'CSV')}</span>
                <span className="badge blue">{t('mapper.supportsTSV', 'TSV')}</span>
              </div>
              <button className="btn btn-primary" onClick={handleParse} disabled={!rawInput.trim()}>
                {t('mapper.parseData', 'Parse & Continue')} →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Step 2: Mapping */}
      {step === 2 && (
        <div className="mapper-mapping-section">
          <div className="mapper-stats-bar">
            <div className="mapper-stat">
              <span className="mapper-stat-value">{parsedData.length}</span>
              <span className="mapper-stat-label">{t('mapper.records', 'Records')}</span>
            </div>
            <div className="mapper-stat">
              <span className="mapper-stat-value">{sourceFields.length}</span>
              <span className="mapper-stat-label">{t('mapper.sourceFields', 'Source Fields')}</span>
            </div>
            <div className="mapper-stat">
              <span className="mapper-stat-value mapper-stat-green">{mappedCount}</span>
              <span className="mapper-stat-label">{t('mapper.mapped', 'Mapped')}</span>
            </div>
            <div className="mapper-stat">
              <span className={`mapper-stat-value ${unmappedCount > 0 ? 'mapper-stat-orange' : 'mapper-stat-green'}`}>{unmappedCount}</span>
              <span className="mapper-stat-label">{t('mapper.unmapped', 'Unmapped')}</span>
            </div>
            <div className="mapper-stat">
              <span className="badge blue">{detectedFormat.toUpperCase()}</span>
            </div>
          </div>

          <div className="mapper-card">
            <div className="mapper-card-header">
              <h3>{t('mapper.fieldMappings', 'Field Mappings')}</h3>
              <input
                type="text"
                className="search-input"
                placeholder={t('mapper.searchFields', 'Search fields...')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="mapper-table-container">
              <table className="mapper-table">
                <thead>
                  <tr>
                    <th>{t('mapper.sourceField', 'Source Field')}</th>
                    <th>{t('mapper.sampleValue', 'Sample Value')}</th>
                    <th></th>
                    <th>{t('mapper.targetField', 'Target Schema Field')}</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSourceFields.map(field => {
                    const sample = sampleRow[field];
                    const sampleStr = sample === null || sample === undefined ? '' :
                      typeof sample === 'object' ? JSON.stringify(sample) : String(sample);
                    return (
                      <tr key={field} className={mappings[field] ? 'mapped-row' : 'unmapped-row'}>
                        <td className="mapper-source-cell">
                          <code>{field}</code>
                        </td>
                        <td className="mapper-sample-cell" title={sampleStr}>
                          <span className="mapper-sample-text">{sampleStr.length > 50 ? sampleStr.slice(0, 50) + '...' : sampleStr || '—'}</span>
                        </td>
                        <td className="mapper-arrow-cell">
                          <ArrowIcon />
                        </td>
                        <td className="mapper-target-cell">
                          <select
                            value={mappings[field] || ''}
                            onChange={(e) => handleMappingChange(field, e.target.value)}
                            className={mappings[field] ? 'mapper-select mapped' : 'mapper-select'}
                          >
                            <option value="">{t('mapper.skipField', '— Skip this field —')}</option>
                            {TARGET_SCHEMA.map(target => (
                              <option
                                key={target.key}
                                value={target.key}
                                disabled={assignedTargets.has(target.key) && mappings[field] !== target.key}
                              >
                                {target.label} {target.type === 'boolean' ? '(Yes/No)' : target.type === 'number' ? '(#)' : ''}
                              </option>
                            ))}
                          </select>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="mapper-card-footer">
              <button className="btn" onClick={() => setStep(1)}>
                ← {t('mapper.back', 'Back')}
              </button>
              <button className="btn btn-primary" onClick={handleTransform} disabled={mappedCount === 0}>
                {t('mapper.transform', 'Transform Data')} →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Step 3: Output */}
      {step === 3 && (
        <div className="mapper-output-section">
          <div className="mapper-stats-bar">
            <div className="mapper-stat">
              <span className="mapper-stat-value mapper-stat-green">{mappedOutput.length}</span>
              <span className="mapper-stat-label">{t('mapper.recordsMapped', 'Records Mapped')}</span>
            </div>
            <div className="mapper-stat">
              <span className="mapper-stat-value">{mappedCount}</span>
              <span className="mapper-stat-label">{t('mapper.fieldsMapped', 'Fields Mapped')}</span>
            </div>
            <div className="mapper-stat">
              <span className="mapper-stat-value">{TARGET_SCHEMA.length}</span>
              <span className="mapper-stat-label">{t('mapper.totalTarget', 'Target Fields')}</span>
            </div>
          </div>

          <div className="mapper-card">
            <div className="mapper-card-header">
              <h3>{t('mapper.preview', 'Preview')}</h3>
              <div className="mapper-card-actions">
                <button className="btn btn-primary" onClick={handleExportJSON}>
                  <DownloadIcon /> {t('mapper.exportJSON', 'Export JSON')}
                </button>
                <button className="btn btn-primary" onClick={handleExportCSV}>
                  <DownloadIcon /> {t('mapper.exportCSV', 'Export CSV')}
                </button>
              </div>
            </div>

            <div className="mapper-preview-container">
              <div className="mapper-preview-table-wrap">
                <table className="mapper-preview-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      {TARGET_SCHEMA.filter(f => assignedTargets.has(f.key)).map(f => (
                        <th key={f.key}>{f.label}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {mappedOutput.slice(0, 50).map((row, idx) => (
                      <tr key={idx}>
                        <td>{idx + 1}</td>
                        {TARGET_SCHEMA.filter(f => assignedTargets.has(f.key)).map(f => {
                          const val = row[f.key];
                          let display = '';
                          if (val === true) display = 'Yes';
                          else if (val === false) display = 'No';
                          else if (val === null || val === undefined || val === '') display = '—';
                          else display = String(val);
                          return (
                            <td key={f.key} title={display} className={val === '' || val === null ? 'mapper-empty-cell' : ''}>
                              {display.length > 40 ? display.slice(0, 40) + '...' : display}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {mappedOutput.length > 50 && (
                <div className="mapper-preview-note">
                  {t('mapper.showingFirst', 'Showing first 50 of')} {mappedOutput.length} {t('mapper.records', 'records')}
                </div>
              )}
            </div>

            <div className="mapper-card-footer">
              <button className="btn" onClick={() => setStep(2)}>
                ← {t('mapper.backToMapping', 'Back to Mapping')}
              </button>
              <button className="btn" onClick={handleReset}>
                {t('mapper.newMapping', 'New Mapping')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ArrowIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
      <path d="M5 12h14M12 5l7 7-7 7" />
    </svg>
  );
}

function UploadIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" />
    </svg>
  );
}

function DownloadIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" />
    </svg>
  );
}

function MapperIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M4 6h7M4 12h7M4 18h7" />
      <path d="M14 6l3 3-3 3" />
      <path d="M17 6h3M17 12h3M17 18h3" />
    </svg>
  );
}

export { MapperIcon };
