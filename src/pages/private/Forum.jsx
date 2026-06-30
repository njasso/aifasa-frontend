// src/pages/private/Forum.jsx - COMPLET À JOUR (sans mock, pleine page)
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../services/api';

// ─── Tabler Icons SVG inline (outline, 24px viewBox) ───────────────────────
const Icon = ({ d, size = 16, className = '', style = {} }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size} height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.75"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    style={style}
    aria-hidden="true"
  >
    {d}
  </svg>
);

// Icon path registry — Tabler outline paths
const ICONS = {
  // Navigation
  arrowLeft:    <><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M5 12l14 0"/><path d="M5 12l6 6"/><path d="M5 12l6 -6"/></>,
  plus:         <><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M12 5l0 14"/><path d="M5 12l14 0"/></>,
  send:         <><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M10 14l11 -11"/><path d="M21 3l-6.5 18a.55 .55 0 0 1 -1 0l-3.5 -7l-7 -3.5a.55 .55 0 0 1 0 -1l18 -6.5"/></>,
  search:       <><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M10 10m-7 0a7 7 0 1 0 14 0a7 7 0 1 0 -14 0"/><path d="M21 21l-6 -6"/></>,
  x:            <><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M18 6l-12 12"/><path d="M6 6l12 12"/></>,
  loader:       <><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M12 3a9 9 0 1 0 9 9"/></>,
  trash:        <><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M4 7l16 0"/><path d="M10 11l0 6"/><path d="M14 11l0 6"/><path d="M5 7l1 12a2 2 0 0 0 2 2h8a2 2 0 0 0 2 -2l1 -12"/><path d="M9 7v-3a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v3"/></>,
  // UI states
  check:        <><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M5 12l5 5l10 -10"/></>,
  alert:        <><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M12 9v4"/><path d="M10.363 3.591l-8.106 13.534a1.914 1.914 0 0 0 1.636 2.871h16.214a1.914 1.914 0 0 0 1.636 -2.871l-8.106 -13.534a1.914 1.914 0 0 0 -3.274 0z"/><path d="M12 16h.01"/></>,
  pin:          <><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M15 4.5l-4 4l-4 1.5l-1.5 1.5l7 7l1.5 -1.5l1.5 -4l4 -4"/><path d="M9 15l-4.5 4.5"/><path d="M14.5 4l5.5 5.5"/></>,
  heart:        <><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M19.5 12.572l-7.5 7.428l-7.5 -7.428a5 5 0 1 1 7.5 -6.566a5 5 0 1 1 7.5 6.566"/></>,
  eye:          <><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M10 12a2 2 0 1 0 4 0a2 2 0 0 0 -4 0"/><path d="M21 12c-2.4 4 -5.4 6 -9 6c-3.6 0 -6.6 -2 -9 -6c2.4 -4 5.4 -6 9 -6c3.6 0 6.6 2 9 6"/></>,
  clock:        <><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M3 12a9 9 0 1 0 18 0a9 9 0 0 0 -18 0"/><path d="M12 7v5l3 3"/></>,
  user:         <><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M8 7a4 4 0 1 0 8 0a4 4 0 0 0 -8 0"/><path d="M6 21v-2a4 4 0 0 1 4 -4h4a4 4 0 0 1 4 4v2"/></>,
  // Category icons — thematic
  plant2:       <><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M2 9a10 10 0 1 0 20 0"/><path d="M12 19v-14"/><path d="M12 9c2 -2.333 4 -3.333 6 -3"/><path d="M12 11.5c-2 -2.5 -4 -3.5 -6 -3"/></>,
  trees:        <><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M16 5l3 3l-2 1l4 4l-3 0l4 4h-4l0 3h-5l0 -10l-3 0z"/><path d="M15 26l0 .01"/><path d="M11 14a6 6 0 0 0 -6 6h12"/><path d="M11 14l0 3"/></>,
  fish:         <><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M16.69 7.44a6.973 6.973 0 0 0 -6.69 -1.44"/><path d="M2 9c4.877 0 10.371 .94 14 5c-3.629 4.06 -9.123 5 -14 5"/><path d="M18 11.5l.01 0"/><path d="M20.733 7.64a9.872 9.872 0 0 1 1.267 4.36a9.872 9.872 0 0 1 -1.267 4.36c-.39 .728 -1.733 .64 -1.733 -.36l0 -8c0 -1 1.343 -1.088 1.733 -.36z"/></>,
  chartDots3:   <><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M3 3v18h18"/><path d="M9 15m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0"/><path d="M13 7m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0"/><path d="M17 11m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0"/><path d="M9 15l4 -8l4 4"/></>,
  map2:         <><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M12 18.5l-3 -1.5l-6 3v-13l6 -3l6 3l6 -3v7.5"/><path d="M9 4v13"/><path d="M15 7v5.5"/><path d="M21.121 20.121a3 3 0 1 0 -4.242 0c.418 .419 1.125 1.045 2.121 1.879c1 -.834 1.703 -1.46 2.121 -1.879z"/><path d="M19 18v.01"/></>,
  shieldCheck:  <><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M11.46 20.846a12 12 0 0 1 -7.96 -14.846a12 12 0 0 0 8.5 -3a12 12 0 0 0 8.5 3a12 12 0 0 1 -.09 7.06"/><path d="M15 19l2 2l4 -4"/></>,
  usersGroup:   <><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M10 13a2 2 0 1 0 4 0a2 2 0 0 0 -4 0"/><path d="M8 21v-1a2 2 0 0 1 2 -2h4a2 2 0 0 1 2 2v1"/><path d="M15 5a2 2 0 1 0 4 0a2 2 0 0 0 -4 0"/><path d="M17 10h2a2 2 0 0 1 2 2v1"/><path d="M5 5a2 2 0 1 0 4 0a2 2 0 0 0 -4 0"/><path d="M3 13v-1a2 2 0 0 1 2 -2h2"/></>,
  briefcase:    <><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M3 7m0 2a2 2 0 0 1 2 -2h14a2 2 0 0 1 2 2v9a2 2 0 0 1 -2 2h-14a2 2 0 0 1 -2 -2z"/><path d="M8 7v-2a2 2 0 0 1 2 -2h4a2 2 0 0 1 2 2v2"/><path d="M12 12l0 .01"/><path d="M3 13a20 20 0 0 0 18 0"/></>,
  messages:     <><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M21 14l-3 -3h-7a1 1 0 0 1 -1 -1v-6a1 1 0 0 1 1 -1h9a1 1 0 0 1 1 1v10"/><path d="M14 15v2a1 1 0 0 1 -1 1h-7l-3 3v-10a1 1 0 0 1 1 -1h2"/></>,
  topoStar:     <><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M10 19a2 2 0 1 0 4 0a2 2 0 0 0 -4 0"/><path d="M5 5a2 2 0 1 0 4 0a2 2 0 0 0 -4 0"/><path d="M15 5a2 2 0 1 0 4 0a2 2 0 0 0 -4 0"/><path d="M5 19a2 2 0 1 0 4 0a2 2 0 0 0 -4 0"/><path d="M7 7l10 0"/><path d="M7 17l0 -8"/><path d="M17 17l-10 0"/><path d="M17 7l0 8"/><path d="M12 12m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0"/><path d="M11 19l-4 -8l10 0l-4 8"/></>,
  messageCircle:<><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M3 20l1.3 -3.9c-2.324 -3.437 -1.426 -7.872 2.1 -10.374c3.526 -2.501 8.59 -2.296 11.845 .48c3.255 2.777 3.695 7.266 1.029 10.501c-2.666 3.235 -7.615 4.215 -11.574 2.293l-4.7 1"/></>,
  messageReply: <><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M18 4a3 3 0 0 1 3 3v8a3 3 0 0 1 -3 3h-5l-5 3v-3h-2a3 3 0 0 1 -3 -3v-8a3 3 0 0 1 3 -3h12z"/><path d="M11 8l-3 3l3 3"/><path d="M16 11h-8"/></>,
  messageOff:   <><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M3 3l18 18"/><path d="M17 17h-10a3 3 0 0 1 -3 -3v-8c0 -.284 .039 -.557 .112 -.816m2.888 -2.184h11a3 3 0 0 1 3 3v8c0 .21 -.022 .416 -.064 .614"/><path d="M17 17l3 3v-5.5"/></>,
};

const Ic = ({ name, size = 16, className = '', style = {} }) => (
  <Icon d={ICONS[name]} size={size} className={className} style={style} />
);

// ─── Category definitions ────────────────────────────────────────────────────
const CATEGORIES = [
  { id: 'agriculture', name: 'Productions végétales',    sub: 'Agroforesterie · cacao · semences · PAD',    icon: 'plant2',      col: '#16a34a', bg: '#dcfce7', tc: '#166534' },
  { id: 'foret',       name: 'Forêt et environnement',   sub: 'Certification FSC · EUDR · conservation',    icon: 'trees',       col: '#0d9488', bg: '#ccfbf1', tc: '#0f766e' },
  { id: 'aquaculture', name: 'Aquaculture et élevage',   sub: 'Pisciculture · aviculture · provenderie',    icon: 'fish',        col: '#2563eb', bg: '#dbeafe', tc: '#1e40af' },
  { id: 'economie',    name: 'Agro-économie et filières',sub: 'Chaînes de valeur · marchés · IFC',          icon: 'chartDots3',  col: '#d97706', bg: '#fef3c7', tc: '#92400e' },
  { id: 'sig',         name: 'SIG et numérique',         sub: 'QGIS · télédétection · biomonitoring',       icon: 'map2',        col: '#7c3aed', bg: '#ede9fe', tc: '#4c1d95' },
  { id: 'qhse',        name: 'QHSE et certification',    sub: 'ISO 9001 · 14001 · HACCP · audits',          icon: 'shieldCheck', col: '#0891b2', bg: '#cffafe', tc: '#164e63' },
  { id: 'association', name: 'Vie associative',           sub: 'AG · cotisations · projets collectifs',      icon: 'usersGroup',  col: '#be185d', bg: '#fce7f3', tc: '#831843' },
  { id: 'emploi',      name: 'Opportunités et carrières',sub: "Offres d'emploi · missions · formations",    icon: 'briefcase',   col: '#059669', bg: '#d1fae5', tc: '#064e3b' },
  { id: 'divers',      name: 'Discussions libres',       sub: "Sujets d'intérêt commun",                    icon: 'messages',    col: '#6b7280', bg: '#f3f4f6', tc: '#374151' },
];

// ─── Avatar component ────────────────────────────────────────────────────────
const AVATAR_COLORS = [
  '#16a34a','#2563eb','#7c3aed','#d97706','#0891b2','#be185d','#059669','#dc2626','#0d9488',
];
function getAvatarColor(name = '') {
  const code = [...name].reduce((s, c) => s + c.charCodeAt(0), 0);
  return AVATAR_COLORS[code % AVATAR_COLORS.length];
}
function getInitials(name = '') {
  return name.split(' ').slice(0, 2).map(w => w[0] || '').join('').toUpperCase() || '?';
}
const Avatar = ({ name, size = 32 }) => (
  <div style={{
    width: size, height: size, borderRadius: '50%',
    background: getAvatarColor(name),
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: size * 0.33, fontWeight: 500, color: '#fff', flexShrink: 0,
    fontFamily: 'inherit',
  }}>
    {getInitials(name)}
  </div>
);

// ─── Toast ───────────────────────────────────────────────────────────────────
const Toast = ({ alert }) => (
  <AnimatePresence>
    {alert && (
      <motion.div
        initial={{ opacity: 0, y: -8, x: '-50%' }}
        animate={{ opacity: 1, y: 0, x: '-50%' }}
        exit={{ opacity: 0 }}
        style={{
          position: 'fixed', top: 72, left: '50%', zIndex: 999,
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '9px 16px', borderRadius: 10,
          fontSize: 13, fontWeight: 500,
          background: alert.type === 'success' ? '#f0fdf4' : '#fef2f2',
          color: alert.type === 'success' ? '#15803d' : '#b91c1c',
          border: `1px solid ${alert.type === 'success' ? '#bbf7d0' : '#fecaca'}`,
        }}
      >
        <Ic name={alert.type === 'success' ? 'check' : 'alert'} size={15} />
        {alert.message}
      </motion.div>
    )}
  </AnimatePresence>
);

// ─── Category icon badge ─────────────────────────────────────────────────────
const CatBadge = ({ cat, size = 34 }) => (
  <div style={{
    width: size, height: size, borderRadius: 9,
    background: cat.bg,
    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  }}>
    <Ic name={cat.icon} size={size * 0.52} style={{ color: cat.col }} />
  </div>
);

// ─── Loading spinner ─────────────────────────────────────────────────────────
const Spinner = () => (
  <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
    <Ic name="loader" size={32} style={{ color: '#16a34a', animation: 'spin 1s linear infinite' }} />
    <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
  </div>
);

// ─── Empty state ─────────────────────────────────────────────────────────────
const Empty = ({ icon, title, sub }) => (
  <div style={{ textAlign: 'center', padding: '52px 20px', color: '#9ca3af' }}>
    <Ic name={icon} size={40} style={{ marginBottom: 12, opacity: 0.5 }} />
    <p style={{ fontSize: 14, fontWeight: 500, color: '#6b7280', margin: '0 0 4px' }}>{title}</p>
    {sub && <span style={{ fontSize: 12 }}>{sub}</span>}
  </div>
);

// ─── Stat card ───────────────────────────────────────────────────────────────
const StatCell = ({ icon, value, label, iconColor, iconBg }) => (
  <div style={{
    flex: 1, padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 9,
    borderRight: '1px solid #f0f0f0',
  }}>
    <div style={{
      width: 28, height: 28, borderRadius: 7,
      background: iconBg,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <Ic name={icon} size={14} style={{ color: iconColor }} />
    </div>
    <div>
      <div style={{ fontSize: 15, fontWeight: 600, color: '#111', lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: 10, color: '#9ca3af', marginTop: 2 }}>{label}</div>
    </div>
  </div>
);

// ─── Pin badge ───────────────────────────────────────────────────────────────
const PinBadge = () => (
  <span style={{
    display: 'inline-flex', alignItems: 'center', gap: 3,
    background: '#fef3c7', color: '#b45309', fontSize: 10, fontWeight: 500,
    padding: '2px 6px', borderRadius: 5, whiteSpace: 'nowrap', flexShrink: 0,
  }}>
    <Ic name="pin" size={10} /> Épinglé
  </span>
);

// ─── Back button ─────────────────────────────────────────────────────────────
const BackBtn = ({ onClick, label }) => (
  <button onClick={onClick} style={{
    display: 'flex', alignItems: 'center', gap: 5,
    background: 'none', border: 'none', padding: 0, cursor: 'pointer',
    fontSize: 12, fontWeight: 500, color: '#16a34a', fontFamily: 'inherit',
    marginBottom: 14,
  }}>
    <Ic name="arrowLeft" size={14} /> {label}
  </button>
);

// ─── Sidebar ─────────────────────────────────────────────────────────────────
const Sidebar = ({ topics, selectedCategory, onSelect, searchTerm, onSearch }) => {
  const cats = searchTerm
    ? CATEGORIES.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.sub.toLowerCase().includes(searchTerm.toLowerCase()))
    : CATEGORIES;

  return (
    <div style={{
      width: 270, flexShrink: 0,
      borderRight: '1px solid #f0f0f0',
      background: '#fafafa',
      display: 'flex', flexDirection: 'column',
    }}>
      {/* Brand */}
      <div style={{ padding: '16px 14px 12px', borderBottom: '1px solid #f0f0f0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <div style={{
            width: 28, height: 28, borderRadius: 7, background: '#16a34a',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Ic name="topoStar" size={15} style={{ color: '#fff' }} />
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#111' }}>Forum AIFASA 17</div>
            <div style={{ fontSize: 10, color: '#9ca3af', marginTop: 1 }}>Espace d'échange professionnel</div>
          </div>
        </div>
        {/* Search */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 7,
          background: '#fff', border: '1px solid #e5e7eb',
          borderRadius: 7, padding: '6px 9px',
        }}>
          <Ic name="search" size={13} style={{ color: '#9ca3af', flexShrink: 0 }} />
          <input
            value={searchTerm}
            onChange={e => onSearch(e.target.value)}
            placeholder="Chercher un domaine..."
            style={{
              background: 'none', border: 'none', outline: 'none',
              fontSize: 12, color: '#111', width: '100%', fontFamily: 'inherit',
            }}
          />
          {searchTerm && (
            <button onClick={() => onSearch('')} style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', color: '#9ca3af', display: 'flex' }}>
              <Ic name="x" size={13} />
            </button>
          )}
        </div>
      </div>

      {/* Eyebrow */}
      <div style={{ fontSize: 9, fontWeight: 600, color: '#9ca3af', letterSpacing: '0.1em', textTransform: 'uppercase', padding: '10px 14px 4px' }}>
        Domaines thématiques
      </div>

      {/* Category list */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '4px 8px' }}>
        {cats.map(cat => {
          const count = topics.filter(t => t.category_id === cat.id).length;
          const active = selectedCategory === cat.id;
          return (
            <div
              key={cat.id}
              onClick={() => onSelect(cat.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: 9,
                padding: '7px 8px', borderRadius: 8, cursor: 'pointer',
                marginBottom: 2, transition: 'background 0.1s',
                background: active ? `${cat.bg}` : 'transparent',
              }}
              onMouseEnter={e => { if (!active) e.currentTarget.style.background = '#f3f4f6'; }}
              onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent'; }}
            >
              <CatBadge cat={cat} size={30} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 11, fontWeight: 500, color: '#111', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {cat.name}
                </div>
                <div style={{ fontSize: 10, color: '#9ca3af', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginTop: 1 }}>
                  {cat.sub}
                </div>
              </div>
              <span style={{
                fontSize: 10, fontWeight: 500, padding: '2px 6px', borderRadius: 10,
                background: active ? cat.col : '#e5e7eb',
                color: active ? '#fff' : '#6b7280',
                flexShrink: 0,
              }}>
                {count || 0}
              </span>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div style={{ padding: '10px 14px', borderTop: '1px solid #f0f0f0', display: 'flex', alignItems: 'center', gap: 6 }}>
        <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e', flexShrink: 0 }} />
        <span style={{ fontSize: 11, color: '#9ca3af' }}>En ligne</span>
      </div>
    </div>
  );
};

// ─── Topic list pane ─────────────────────────────────────────────────────────
const TopicListPane = ({ cat, topics, onOpenTopic, onNew, isAdmin, onDeleteTopic }) => {
  const sorted = [...topics].sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0) || new Date(b.last_reply || b.created_at) - new Date(a.last_reply || a.created_at));
  const totalViews = topics.reduce((s, t) => s + (t.views || 0), 0);
  const totalReplies = topics.reduce((s, t) => s + (t.replies_count || 0), 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0 }}>
      {/* Header */}
      <div style={{
        padding: '14px 18px 12px', borderBottom: '1px solid #f0f0f0',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
          <CatBadge cat={cat} size={36} />
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: '#111' }}>{cat.name}</div>
            <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 1 }}>{cat.sub}</div>
          </div>
        </div>
        <button
          onClick={onNew}
          style={{
            display: 'flex', alignItems: 'center', gap: 5,
            background: '#16a34a', color: '#fff', border: 'none',
            padding: '7px 13px', borderRadius: 8,
            fontSize: 12, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit',
          }}
        >
          <Ic name="plus" size={13} /> Nouvelle discussion
        </button>
      </div>

      {/* Stats bar */}
      <div style={{ display: 'flex', borderBottom: '1px solid #f0f0f0' }}>
        <StatCell icon="messageCircle" value={topics.length} label="Discussions" iconColor={cat.col} iconBg={cat.bg} />
        <StatCell icon="messageReply" value={totalReplies} label="Réponses" iconColor="#2563eb" iconBg="#dbeafe" />
        <StatCell icon="eye" value={totalViews} label="Vues totales" iconColor="#d97706" iconBg="#fef3c7" />
      </div>

      {/* List */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '6px 8px' }}>
        {sorted.length === 0
          ? <Empty icon="messageOff" title="Aucune discussion" sub="Lancez la première conversation dans ce domaine." />
          : sorted.map(topic => (
            <motion.div
              key={topic.id}
              whileHover={{ backgroundColor: '#f9fafb' }}
              onClick={() => onOpenTopic(topic)}
              style={{
                display: 'flex', alignItems: 'flex-start', gap: 10,
                padding: '10px 10px', borderRadius: 9, cursor: 'pointer',
                border: '1px solid transparent', marginBottom: 3, transition: 'border 0.1s',
              }}
            >
              <Avatar name={topic.author_name} size={34} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 6, marginBottom: 4 }}>
                  <span style={{ fontSize: 12, fontWeight: 500, color: '#111', lineHeight: 1.4, flex: 1 }}>
                    {topic.title}
                  </span>
                  {topic.pinned && <PinBadge />}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 11, fontWeight: 500, color: '#374151', display: 'flex', alignItems: 'center', gap: 3 }}>
                    <Ic name="user" size={11} style={{ color: '#9ca3af' }} /> {topic.author_name}
                  </span>
                  <span style={{ fontSize: 10, color: '#9ca3af', display: 'flex', alignItems: 'center', gap: 3 }}>
                    <Ic name="eye" size={11} /> {topic.views || 0}
                  </span>
                  <span style={{ fontSize: 10, color: '#9ca3af', display: 'flex', alignItems: 'center', gap: 3 }}>
                    <Ic name="heart" size={11} /> {topic.likes || 0}
                  </span>
                  <span style={{ fontSize: 10, color: '#9ca3af', display: 'flex', alignItems: 'center', gap: 3 }}>
                    <Ic name="clock" size={11} /> {new Date(topic.created_at).toLocaleDateString('fr-FR')}
                  </span>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4, flexShrink: 0 }}>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 4,
                  fontSize: 11, color: '#6b7280',
                  background: '#f3f4f6', padding: '3px 7px', borderRadius: 10,
                  border: '1px solid #e5e7eb',
                }}>
                  <Ic name="messageCircle" size={11} /> {topic.replies_count || 0}
                </div>
              </div>
              {isAdmin && (
                <button
                  onClick={e => { e.stopPropagation(); onDeleteTopic(topic.id); }}
                  style={{
                    background: 'none', border: 'none', padding: '3px 4px', cursor: 'pointer',
                    color: '#fca5a5', borderRadius: 5, flexShrink: 0, display: 'flex', alignItems: 'center',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.color = '#dc2626'; e.currentTarget.style.background = '#fef2f2'; }}
                  onMouseLeave={e => { e.currentTarget.style.color = '#fca5a5'; e.currentTarget.style.background = 'none'; }}
                >
                  <Ic name="trash" size={13} />
                </button>
              )}
            </motion.div>
          ))
        }
      </div>
    </div>
  );
};

// ─── Topic detail pane ───────────────────────────────────────────────────────
const TopicDetailPane = ({ topic, cat, replies, replyContent, setReplyContent, onReply, onBack, onLike, onLikeReply, onDeleteReply, submitting, isAdmin }) => (
  <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0 }}>
    {/* Header */}
    <div style={{ padding: '14px 18px 12px', borderBottom: '1px solid #f0f0f0' }}>
      <BackBtn onClick={onBack} label="Retour aux discussions" />
      <div style={{ fontSize: 15, fontWeight: 600, color: '#111', lineHeight: 1.4, marginBottom: 8 }}>
        {topic.title}
        {topic.pinned && <span style={{ marginLeft: 8 }}><PinBadge /></span>}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
        <Avatar name={topic.author_name} size={22} />
        <span style={{ fontSize: 11, fontWeight: 500, color: '#374151' }}>{topic.author_name}</span>
        <span style={{ fontSize: 11, color: '#9ca3af', display: 'flex', alignItems: 'center', gap: 3 }}>
          <Ic name="eye" size={11} /> {topic.views || 0} vues
        </span>
        <button
          onClick={() => onLike(topic.id)}
          style={{
            display: 'flex', alignItems: 'center', gap: 4,
            background: 'none', border: '1px solid #e5e7eb',
            borderRadius: 6, padding: '3px 8px', fontSize: 11,
            cursor: 'pointer', color: '#6b7280', fontFamily: 'inherit',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = '#fef2f2'; e.currentTarget.style.color = '#dc2626'; e.currentTarget.style.borderColor = '#fecaca'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = '#6b7280'; e.currentTarget.style.borderColor = '#e5e7eb'; }}
        >
          <Ic name="heart" size={12} /> {topic.likes || 0}
        </button>
      </div>
    </div>

    {/* Replies area */}
    <div style={{ flex: 1, overflowY: 'auto', padding: '12px 16px' }}>
      {/* Divider */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
        <div style={{ flex: 1, height: 1, background: '#f0f0f0' }} />
        <span style={{ fontSize: 10, color: '#9ca3af', whiteSpace: 'nowrap' }}>
          {replies.length} réponse{replies.length !== 1 ? 's' : ''}
        </span>
        <div style={{ flex: 1, height: 1, background: '#f0f0f0' }} />
      </div>

      {replies.length === 0
        ? <Empty icon="messageCircle" title="Soyez le premier à répondre" sub="Votre expertise compte pour les autres membres." />
        : replies.map(reply => (
          <div key={reply.id} style={{ display: 'flex', gap: 9, marginBottom: 14 }}>
            <Avatar name={reply.author_name} size={30} />
            <div style={{
              flex: 1,
              background: '#fafafa',
              border: '1px solid #f0f0f0',
              borderRadius: '0 9px 9px 9px',
              padding: '9px 12px',
            }}>
              <div style={{ marginBottom: 4 }}>
                <span style={{ fontSize: 11, fontWeight: 500, color: '#111' }}>{reply.author_name}</span>
                <span style={{ fontSize: 10, color: '#9ca3af', marginLeft: 6 }}>
                  {new Date(reply.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                </span>
              </div>
              <p style={{ fontSize: 12, color: '#374151', lineHeight: 1.6, margin: 0 }}>{reply.content}</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}>
                <button
                  onClick={() => onLikeReply(reply.id)}
                  style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 10, color: '#9ca3af', background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontFamily: 'inherit' }}
                  onMouseEnter={e => e.currentTarget.style.color = '#dc2626'}
                  onMouseLeave={e => e.currentTarget.style.color = '#9ca3af'}
                >
                  <Ic name="heart" size={11} /> {reply.likes || 0}
                </button>
                {isAdmin && (
                  <button
                    onClick={() => onDeleteReply(reply.id)}
                    style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 10, color: '#fca5a5', background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontFamily: 'inherit' }}
                    onMouseEnter={e => e.currentTarget.style.color = '#dc2626'}
                    onMouseLeave={e => e.currentTarget.style.color = '#fca5a5'}
                  >
                    <Ic name="trash" size={11} /> Supprimer
                  </button>
                )}
              </div>
            </div>
          </div>
        ))
      }
    </div>

    {/* Compose */}
    <div style={{ borderTop: '1px solid #f0f0f0', padding: '10px 14px', display: 'flex', gap: 8, alignItems: 'flex-end' }}>
      <Avatar name="Vous" size={28} />
      <div style={{ flex: 1 }}>
        <textarea
          value={replyContent}
          onChange={e => setReplyContent(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); onReply(); } }}
          placeholder="Votre réponse — Entrée pour envoyer…"
          rows={1}
          style={{
            width: '100%', border: '1px solid #e5e7eb', borderRadius: 8,
            padding: '8px 10px', fontSize: 12, background: '#fafafa',
            color: '#111', fontFamily: 'inherit', resize: 'none',
            outline: 'none', minHeight: 36, maxHeight: 100,
            boxSizing: 'border-box',
          }}
          onFocus={e => e.target.style.borderColor = '#86efac'}
          onBlur={e => e.target.style.borderColor = '#e5e7eb'}
        />
      </div>
      <button
        onClick={onReply}
        disabled={!replyContent.trim() || submitting}
        style={{
          width: 30, height: 30, borderRadius: 8, background: '#16a34a',
          border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', flexShrink: 0, opacity: !replyContent.trim() || submitting ? 0.5 : 1,
          color: '#fff',
        }}
        aria-label="Envoyer"
      >
        {submitting
          ? <Ic name="loader" size={14} style={{ animation: 'spin 1s linear infinite' }} />
          : <Ic name="send" size={14} />
        }
      </button>
    </div>
  </div>
);

// ─── New topic pane ───────────────────────────────────────────────────────────
const NewTopicPane = ({ categories, defaultCategory, onCancel, onSubmit, submitting }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [catId, setCatId] = useState(defaultCategory || 'agriculture');

  return (
    <div style={{ flex: 1, padding: 20, overflowY: 'auto' }}>
      {/* Back */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
        <button onClick={onCancel} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#16a34a', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', padding: 0 }}>
          <Ic name="arrowLeft" size={13} /> Retour
        </button>
        <div style={{ width: 1, height: 14, background: '#e5e7eb' }} />
        <h3 style={{ fontSize: 13, fontWeight: 500, color: '#111', margin: 0 }}>Nouvelle discussion</h3>
      </div>

      <div style={{ marginBottom: 14 }}>
        <label style={{ fontSize: 10, fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: 5 }}>Domaine</label>
        <select value={catId} onChange={e => setCatId(e.target.value)} style={{ width: '100%', border: '1px solid #e5e7eb', borderRadius: 8, padding: '8px 10px', fontSize: 13, background: '#fafafa', color: '#111', fontFamily: 'inherit', outline: 'none' }}>
          {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>

      <div style={{ marginBottom: 14 }}>
        <label style={{ fontSize: 10, fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: 5 }}>Titre *</label>
        <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Décrivez le sujet en une phrase précise…" style={{ width: '100%', border: '1px solid #e5e7eb', borderRadius: 8, padding: '8px 10px', fontSize: 13, background: '#fafafa', color: '#111', fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box' }} onFocus={e => e.target.style.borderColor = '#86efac'} onBlur={e => e.target.style.borderColor = '#e5e7eb'} />
      </div>

      <div style={{ marginBottom: 14 }}>
        <label style={{ fontSize: 10, fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: 5 }}>Message *</label>
        <textarea value={content} onChange={e => setContent(e.target.value)} placeholder="Partagez votre expérience, votre question ou votre analyse…" rows={7} style={{ width: '100%', border: '1px solid #e5e7eb', borderRadius: 8, padding: '8px 10px', fontSize: 13, background: '#fafafa', color: '#111', fontFamily: 'inherit', outline: 'none', resize: 'none', lineHeight: 1.6, boxSizing: 'border-box' }} onFocus={e => e.target.style.borderColor = '#86efac'} onBlur={e => e.target.style.borderColor = '#e5e7eb'} />
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
        <button onClick={onCancel} style={{ background: 'none', border: '1px solid #e5e7eb', borderRadius: 8, padding: '7px 16px', fontSize: 12, color: '#6b7280', cursor: 'pointer', fontFamily: 'inherit' }}>Annuler</button>
        <button onClick={() => onSubmit({ title, content, catId })} disabled={!title.trim() || !content.trim() || submitting} style={{ background: '#16a34a', border: 'none', borderRadius: 8, padding: '7px 16px', fontSize: 12, fontWeight: 500, color: '#fff', cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 6, opacity: !title.trim() || !content.trim() || submitting ? 0.5 : 1 }}>
          {submitting ? <Ic name="loader" size={13} style={{ animation: 'spin 1s linear infinite' }} /> : <Ic name="send" size={13} />} Publier
        </button>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
};

// ─── Not connected screen ─────────────────────────────────────────────────────
const NotConnected = () => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center p-8 max-w-md">
      <div style={{ width: 72, height: 72, background: '#dcfce7', borderRadius: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
        <Ic name="topoStar" size={36} style={{ color: '#16a34a' }} />
      </div>
      <h2 style={{ fontSize: 18, fontWeight: 600, color: '#111', marginBottom: 8 }}>Forum AIFASA 17</h2>
      <p style={{ fontSize: 14, color: '#6b7280', marginBottom: 20 }}>Connectez-vous pour échanger avec les membres ingénieurs agronomes et forestiers.</p>
      <a href="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#16a34a', color: '#fff', padding: '10px 22px', borderRadius: 10, fontSize: 13, fontWeight: 500, textDecoration: 'none' }}>Se connecter</a>
    </motion.div>
  </div>
);

// ─── Main Forum component ─────────────────────────────────────────────────────
const Forum = () => {
  const { user } = useAuth();
  const isConnected = !!user;
  const isAdmin = user?.role === 'admin';

  const [view, setView] = useState('list');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [sidebarSearch, setSidebarSearch] = useState('');

  const [topics, setTopics] = useState([]);
  const [replies, setReplies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [alert, setAlert] = useState(null);
  const [replyContent, setReplyContent] = useState('');

  const notify = useCallback((message, type = 'success') => {
    setAlert({ message, type });
    setTimeout(() => setAlert(null), 4000);
  }, []);

  // ✅ Fetch topics - SANS DONNÉES MOCK
  const fetchTopics = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/forum/topics');
      setTopics(res.data || []);
    } catch {
      setTopics([]);
    } finally { setLoading(false); }
  }, []);

  // ✅ Fetch replies - SANS DONNÉES MOCK
  const fetchReplies = useCallback(async (topicId) => {
    try {
      const res = await api.get(`/forum/topics/${topicId}/replies`);
      setReplies(res.data || []);
    } catch {
      setReplies([]);
    }
  }, []);

  useEffect(() => { if (isConnected) fetchTopics(); }, [isConnected, fetchTopics]);

  const handleSelectCategory = (catId) => { setSelectedCategory(catId); setSelectedTopic(null); setView('list'); setReplyContent(''); };
  const handleOpenTopic = (topic) => { setSelectedTopic(topic); setView('topic'); setReplyContent(''); fetchReplies(topic.id); };

  const handleReply = async () => {
    if (!replyContent.trim() || !selectedTopic) return;
    setSubmitting(true);
    try {
      const res = await api.post(`/forum/topics/${selectedTopic.id}/replies`, { content: replyContent });
      setReplies(prev => [...prev, res.data]);
      setTopics(prev => prev.map(t => t.id === selectedTopic.id ? { ...t, replies_count: (t.replies_count || 0) + 1 } : t));
      setReplyContent('');
      notify('Réponse publiée.');
    } catch { notify('Erreur lors de la publication.', 'error'); }
    finally { setSubmitting(false); }
  };

  const handleCreateTopic = async ({ title, content, catId }) => {
    if (!title.trim() || !content.trim()) { notify('Remplissez tous les champs.', 'error'); return; }
    setSubmitting(true);
    try {
      const res = await api.post('/forum/topics', { category_id: catId, title, content });
      setTopics(prev => [res.data, ...prev]);
      setSelectedCategory(catId);
      setView('list');
      notify('Discussion publiée.');
    } catch { notify('Erreur lors de la publication.', 'error'); }
    finally { setSubmitting(false); }
  };

  const handleDeleteTopic = async (topicId) => {
    if (!window.confirm('Supprimer cette discussion ?')) return;
    try { await api.delete(`/forum/topics/${topicId}`); } catch { /* fallback */ }
    setTopics(prev => prev.filter(t => t.id !== topicId));
    if (selectedTopic?.id === topicId) { setView('list'); setSelectedTopic(null); }
    notify('Discussion supprimée.');
  };

  const handleDeleteReply = async (replyId) => {
    if (!window.confirm('Supprimer cette réponse ?')) return;
    try { await api.delete(`/forum/replies/${replyId}`); } catch { /* fallback */ }
    setReplies(prev => prev.filter(r => r.id !== replyId));
    notify('Réponse supprimée.');
  };

  const handleLikeTopic = async (topicId) => {
    try { await api.post(`/forum/topics/${topicId}/like`); } catch { /* local */ }
    setTopics(prev => prev.map(t => t.id === topicId ? { ...t, likes: (t.likes || 0) + 1 } : t));
    if (selectedTopic?.id === topicId) setSelectedTopic(prev => ({ ...prev, likes: (prev.likes || 0) + 1 }));
  };

  const handleLikeReply = async (replyId) => {
    try { await api.post(`/forum/replies/${replyId}/like`); } catch { /* local */ }
    setReplies(prev => prev.map(r => r.id === replyId ? { ...r, likes: (r.likes || 0) + 1 } : r));
  };

  const filteredTopics = useMemo(() => selectedCategory ? topics.filter(t => t.category_id === selectedCategory) : [], [selectedCategory, topics]);
  const topicReplies = useMemo(() => replies.filter(r => r.topic_id === selectedTopic?.id), [replies, selectedTopic]);
  const currentCat = CATEGORIES.find(c => c.id === selectedCategory);

  if (!isConnected) return <NotConnected />;

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <Toast alert={alert} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>

      {/* ✅ PLEINE PAGE : width 100% + hauteur calculée */}
      <div style={{
        display: 'flex',
        border: '1px solid #e5e7eb',
        borderRadius: 14,
        overflow: 'hidden',
        background: '#fff',
        minHeight: 'calc(100vh - 120px)',
        width: '100%',
      }}>
        <Sidebar topics={topics} selectedCategory={selectedCategory} onSelect={handleSelectCategory} searchTerm={sidebarSearch} onSearch={setSidebarSearch} />

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          {!selectedCategory && (loading ? <Spinner /> : <Empty icon="topoStar" title="Choisissez un domaine" sub="Sélectionnez une thématique dans la liste pour voir les discussions." />)}

          {selectedCategory && view === 'list' && currentCat && (
            <TopicListPane cat={currentCat} topics={filteredTopics} onOpenTopic={handleOpenTopic} onNew={() => setView('new')} isAdmin={isAdmin} onDeleteTopic={handleDeleteTopic} />
          )}

          {view === 'topic' && selectedTopic && currentCat && (
            <TopicDetailPane topic={selectedTopic} cat={currentCat} replies={topicReplies} replyContent={replyContent} setReplyContent={setReplyContent} onReply={handleReply} onBack={() => { setView('list'); setSelectedTopic(null); setReplies([]); }} onLike={handleLikeTopic} onLikeReply={handleLikeReply} onDeleteReply={handleDeleteReply} submitting={submitting} isAdmin={isAdmin} />
          )}

          {view === 'new' && (
            <NewTopicPane categories={CATEGORIES} defaultCategory={selectedCategory || 'agriculture'} onCancel={() => setView(selectedCategory ? 'list' : 'list')} onSubmit={handleCreateTopic} submitting={submitting} />
          )}
        </div>
      </div>
    </div>
  );
};

export default Forum;