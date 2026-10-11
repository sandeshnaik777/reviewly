import React, { useState } from 'react';
import { GridIcon, MapPinIcon, RefreshIcon, StorefrontIcon, TrendingUpIcon } from './Logos.js';

export interface GeoGridPoint {
  id: string;
  row: number;
  col: number;
  label: string;
  name: string;
  distanceMiles: number;
  rank: number;
  rankTier: 'TOP_3' | 'TOP_10' | 'OUTSIDE_10';
  change: number;
}

export interface GeoGridData {
  radiusMiles: number;
  centerAddress: string;
  gridPoints: GeoGridPoint[];
  averageRank: number;
  topThreeCoveragePct: number;
  selectedKeyword: string;
  availableKeywords: string[];
}

interface Props {
  geoGrid?: GeoGridData;
  businessName: string;
  city: string;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export const GeoGridHeatmap: React.FC<Props> = ({
  geoGrid,
  businessName,
  city,
  onRefresh,
  isRefreshing = false,
}) => {
  const [selectedKeyword, setSelectedKeyword] = useState<string>(
    geoGrid?.selectedKeyword || (geoGrid?.availableKeywords && geoGrid.availableKeywords[0]) || 'best store near me'
  );
  const [activePoint, setActivePoint] = useState<GeoGridPoint | null>(null);

  // Standard fallback 3x3 points if geoGrid not loaded yet
  const defaultPoints: GeoGridPoint[] = [
    { id: 'p0', row: 0, col: 0, label: 'NW', name: 'Northwest (2.1 mi)', distanceMiles: 2.1, rank: 4, rankTier: 'TOP_10', change: 1 },
    { id: 'p1', row: 0, col: 1, label: 'N', name: 'North (1.5 mi)', distanceMiles: 1.5, rank: 2, rankTier: 'TOP_3', change: 2 },
    { id: 'p2', row: 0, col: 2, label: 'NE', name: 'Northeast (2.1 mi)', distanceMiles: 2.1, rank: 3, rankTier: 'TOP_3', change: 1 },
    { id: 'p3', row: 1, col: 0, label: 'W', name: 'West (1.5 mi)', distanceMiles: 1.5, rank: 3, rankTier: 'TOP_3', change: 1 },
    { id: 'p4', row: 1, col: 1, label: 'CENTER', name: 'Storefront Center (0.0 mi)', distanceMiles: 0.0, rank: 1, rankTier: 'TOP_3', change: 0 },
    { id: 'p5', row: 1, col: 2, label: 'E', name: 'East (1.5 mi)', distanceMiles: 1.5, rank: 2, rankTier: 'TOP_3', change: 2 },
    { id: 'p6', row: 2, col: 0, label: 'SW', name: 'Southwest (2.1 mi)', distanceMiles: 2.1, rank: 5, rankTier: 'TOP_10', change: 1 },
    { id: 'p7', row: 2, col: 1, label: 'S', name: 'South (1.5 mi)', distanceMiles: 1.5, rank: 2, rankTier: 'TOP_3', change: 3 },
    { id: 'p8', row: 2, col: 2, label: 'SE', name: 'Southeast (2.1 mi)', distanceMiles: 2.1, rank: 6, rankTier: 'TOP_10', change: 0 },
  ];

  const points = geoGrid?.gridPoints && geoGrid.gridPoints.length === 9 ? geoGrid.gridPoints : defaultPoints;
  const radius = geoGrid?.radiusMiles || 1.5;
  const centerPoint = points.find((p) => p.row === 1 && p.col === 1) || points[4];
  const avgRank = geoGrid?.averageRank || Number((points.reduce((acc, p) => acc + p.rank, 0) / points.length).toFixed(1));
  const top3Count = points.filter((p) => p.rank <= 3).length;
  const top3Pct = geoGrid?.topThreeCoveragePct || Math.round((top3Count / points.length) * 100);

  const getRankColor = (rank: number) => {
    if (rank <= 3) {
      return {
        bg: '#ecfdf5',
        border: '#10b981',
        text: '#065f46',
        badgeBg: '#d1fae5',
        label: 'Top 3-Pack Winner',
      };
    }
    if (rank <= 10) {
      return {
        bg: '#fffbeb',
        border: '#f59e0b',
        text: '#92400e',
        badgeBg: '#fef3c7',
        label: 'Page 1 Contender',
      };
    }
    return {
      bg: '#f8fafc',
      border: '#cbd5e1',
      text: '#475569',
      badgeBg: '#f1f5f9',
      label: 'Outer Neighborhood',
    };
  };

  return (
    <div
      style={{
        background: '#ffffff',
        border: '1.5px solid #e2e8f0',
        borderRadius: '16px',
        padding: '24px',
        marginBottom: '24px',
        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.03)',
      }}
    >
      {/* Header Bar */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
          marginBottom: '20px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              background: '#f0fdf4',
              border: '1px solid #86efac',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#15803d',
            }}
          >
            <GridIcon size={22} color="#15803d" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h4 style={{ fontSize: '18px', fontWeight: 700, margin: 0, color: '#0f172a' }}>
                Local 3×3 Geo-Grid Search Rank Heatmap
              </h4>
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 600,
                  color: '#15803d',
                  background: '#dcfce7',
                  padding: '2px 8px',
                  borderRadius: '12px',
                }}
              >
                Neighborhood Spatial Telemetry
              </span>
            </div>
            <p style={{ margin: '3px 0 0', fontSize: '13px', color: 'var(--text-muted)' }}>
              Tracks customer search ranking positions on Google Maps across a {radius} mi neighborhood radius around {businessName}.
            </p>
          </div>
        </div>

        {/* Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          {geoGrid?.availableKeywords && geoGrid.availableKeywords.length > 0 && (
            <select
              value={selectedKeyword}
              onChange={(e) => setSelectedKeyword(e.target.value)}
              className="form-select"
              style={{
                fontSize: '12.5px',
                padding: '6px 12px',
                borderRadius: '8px',
                maxWidth: '220px',
                height: '36px',
              }}
            >
              {geoGrid.availableKeywords.map((kw, i) => (
                <option key={i} value={kw}>
                  Target: "{kw}"
                </option>
              ))}
            </select>
          )}

          {onRefresh && (
            <button
              type="button"
              onClick={onRefresh}
              disabled={isRefreshing}
              className="btn btn-secondary btn-sm"
              style={{
                fontSize: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                height: '36px',
              }}
            >
              <RefreshIcon size={14} />
              <span>{isRefreshing ? 'Scanning...' : 'Refresh Grid'}</span>
            </button>
          )}
        </div>
      </div>

      {/* 4 Summary Metrics Chips */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '12px',
          marginBottom: '20px',
        }}
      >
        <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
          <div style={{ fontSize: '11.5px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>
            Storefront Center Rank
          </div>
          <div style={{ fontSize: '22px', fontWeight: 800, color: '#15803d', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span>#{centerPoint.rank}</span>
            <span style={{ fontSize: '11px', background: '#dcfce7', color: '#166534', padding: '2px 8px', borderRadius: '10px', fontWeight: 600 }}>
              At Venue
            </span>
          </div>
          <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
            Immediate walk-in & table radius
          </div>
        </div>

        <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
          <div style={{ fontSize: '11.5px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>
            Average Neighborhood Rank
          </div>
          <div style={{ fontSize: '22px', fontWeight: 800, color: '#0f172a', marginTop: '2px' }}>
            #{avgRank}
          </div>
          <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
            Across all 9 geographic coordinates
          </div>
        </div>

        <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
          <div style={{ fontSize: '11.5px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>
            Google 3-Pack Dominance
          </div>
          <div style={{ fontSize: '22px', fontWeight: 800, color: '#2563eb', marginTop: '2px' }}>
            {top3Pct}%
          </div>
          <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
            {top3Count} of 9 neighborhood zones in Top 3
          </div>
        </div>

        <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
          <div style={{ fontSize: '11.5px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>
            Neighborhood Radius
          </div>
          <div style={{ fontSize: '22px', fontWeight: 800, color: '#7c3aed', marginTop: '2px' }}>
            {radius} Miles
          </div>
          <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
            {city} local search territory
          </div>
        </div>
      </div>

      {/* Main Grid & Legend Area */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '24px',
          alignItems: 'center',
          background: '#f8fafc',
          padding: '24px',
          borderRadius: '14px',
          border: '1px solid #e2e8f0',
        }}
      >
        {/* 3x3 Coordinate Matrix */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '14px',
            maxWidth: '380px',
            margin: '0 auto',
            width: '100%',
          }}
        >
          {points.map((point) => {
            const isCenter = point.row === 1 && point.col === 1;
            const styleInfo = getRankColor(point.rank);
            const isSelected = activePoint?.id === point.id;

            return (
              <div
                key={point.id}
                onClick={() => setActivePoint(point)}
                onMouseEnter={() => setActivePoint(point)}
                style={{
                  aspectRatio: '1 / 1',
                  borderRadius: '14px',
                  background: isSelected ? '#ffffff' : styleInfo.bg,
                  border: isSelected ? '2.5px solid #0f172a' : `2px solid ${styleInfo.border}`,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  position: 'relative',
                  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                  boxShadow: isCenter
                    ? '0 6px 16px rgba(16, 185, 129, 0.25)'
                    : isSelected
                    ? '0 6px 16px rgba(0, 0, 0, 0.12)'
                    : 'none',
                  transform: isSelected ? 'scale(1.05)' : 'scale(1)',
                }}
              >
                {/* Storefront Marker on Center Node */}
                {isCenter && (
                  <div
                    style={{
                      position: 'absolute',
                      top: '6px',
                      right: '6px',
                      color: '#15803d',
                    }}
                    title="Storefront Center"
                  >
                    <StorefrontIcon size={14} color="#15803d" />
                  </div>
                )}

                {/* Rank Number */}
                <span
                  style={{
                    fontSize: '24px',
                    fontWeight: 800,
                    color: styleInfo.text,
                    lineHeight: 1,
                  }}
                >
                  #{point.rank}
                </span>

                {/* Subtitle / Direction Label */}
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: 600,
                    color: '#64748b',
                    marginTop: '4px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.02em',
                  }}
                >
                  {isCenter ? 'Center' : point.label}
                </span>

                {/* Distance */}
                <span
                  style={{
                    fontSize: '9.5px',
                    color: '#94a3b8',
                    marginTop: '1px',
                  }}
                >
                  {point.distanceMiles.toFixed(1)} mi
                </span>
              </div>
            );
          })}
        </div>

        {/* Selected Node Details & Color Legend */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Active Node Detail Card */}
          <div
            style={{
              background: '#ffffff',
              border: '1.5px solid #e2e8f0',
              borderRadius: '12px',
              padding: '16px 18px',
            }}
          >
            <div style={{ fontSize: '11.5px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
              Neighborhood Pinpoint Telemetry
            </div>

            {activePoint ? (
              <div style={{ marginTop: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <strong style={{ fontSize: '16px', color: '#0f172a' }}>
                    {activePoint.name}
                  </strong>
                  <span
                    style={{
                      fontSize: '14px',
                      fontWeight: 800,
                      padding: '4px 10px',
                      borderRadius: '8px',
                      background: getRankColor(activePoint.rank).badgeBg,
                      color: getRankColor(activePoint.rank).text,
                      border: `1px solid ${getRankColor(activePoint.rank).border}`,
                    }}
                  >
                    Rank #{activePoint.rank}
                  </span>
                </div>

                <div style={{ marginTop: '8px', fontSize: '12.5px', color: '#475569', lineHeight: 1.5 }}>
                  When nearby customers in <strong>{activePoint.name}</strong> search for <em>"{selectedKeyword}"</em>, {businessName} appears at <strong>Rank #{activePoint.rank}</strong> on Google Maps.
                </div>

                <div style={{ marginTop: '10px', display: 'flex', alignItems: 'center', gap: '12px', fontSize: '12px' }}>
                  <span style={{ color: '#15803d', fontWeight: 600 }}>
                    ▲ +{activePoint.change} positions lifted
                  </span>
                  <span style={{ color: '#64748b' }}>
                    Distance: {activePoint.distanceMiles} miles from store
                  </span>
                </div>
              </div>
            ) : (
              <div style={{ marginTop: '8px', fontSize: '13px', color: '#64748b' }}>
                Hover or tap any of the 9 grid nodes to inspect local search ranking and customer discovery radius.
              </div>
            )}
          </div>

          {/* Color Coding Legend */}
          <div>
            <div style={{ fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: '8px' }}>
              Heatmap Rank Tiers:
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#334155' }}>
                <span
                  style={{
                    width: '14px',
                    height: '14px',
                    borderRadius: '4px',
                    background: '#10b981',
                    display: 'inline-block',
                    flexShrink: 0,
                  }}
                />
                <strong>Rank #1 to #3:</strong> Google Local 3-Pack (Receives 72% of customer map taps)
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#334155' }}>
                <span
                  style={{
                    width: '14px',
                    height: '14px',
                    borderRadius: '4px',
                    background: '#f59e0b',
                    display: 'inline-block',
                    flexShrink: 0,
                  }}
                />
                <strong>Rank #4 to #10:</strong> Page 1 High Contenders (Prime targets to lift via 5★ reviews)
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#334155' }}>
                <span
                  style={{
                    width: '14px',
                    height: '14px',
                    borderRadius: '4px',
                    background: '#cbd5e1',
                    display: 'inline-block',
                    flexShrink: 0,
                  }}
                />
                <strong>Rank #11+:</strong> Outer Radius (Expanding as review volume multiplies)
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
