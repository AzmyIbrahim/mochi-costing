import { useState, useMemo, useEffect } from "react";

const SHEETS_API = "https://script.google.com/macros/s/AKfycbyupXcKWPsTt7CoxqpzeiJe0j9IqnwY02sP9iBMm4y7l7sFaOOClNwMb0wvA71_IT8/exec";

// ─── DESIGN TOKENS ───────────────────────────────────────────────────────────
const C = {
  bg:      "#0f0e17",
  surface: "#1a1927",
  card:    "#1e1c2e",
  border:  "#2a2740",
  text:    "#ede9d8",
  muted:   "#6b6880",
  label:   "#9490a8",
  green:   "#4ade80",
  red:     "#f87171",
  amber:   "#fbbf24",
  // SKU accent colours
  pistachio: "#8db87a",
  mini:      "#5a9e6f",
  hazelnut:  "#c8973a",
  strawberry:"#e8607a",
  matcha:    "#6aab7e",
};

// ─── MASTER BAHAN MENTAH ─────────────────────────────────────────────────────
const INIT_BAHAN = [
  { id: "marshmallow",      nama: "Marshmallow",           berat: 1000, harga: 19.00,  unit: "g" },
  { id: "butter",           nama: "Pure Butter Anchor",    berat: 250,  harga: 9.00,   unit: "g" },
  { id: "kunafa",           nama: "Kunafa",                berat: 500,  harga: 10.00,  unit: "g" },
  { id: "whiteChoc",        nama: "White Chocolate",       berat: 1000, harga: 20.00,  unit: "g" },
  { id: "susuTepung",       nama: "Susu Tepung",           berat: 1000, harga: 16.00,  unit: "g" },
  { id: "cocoaPowder",      nama: "Cocoa Powder",          berat: 1000, harga: 21.70,  unit: "g" },
  { id: "pistachioSpread",  nama: "Pistachio Spread",      berat: 5000, harga: 200.00, unit: "g" },
  { id: "hazelnutSpread",   nama: "Hazelnut Spread",       berat: 5000, harga: 165.00, unit: "g" },
  { id: "strawberryEmulco", nama: "Strawberry Emulco",     berat: 1000, harga: 31.00,  unit: "g" },
  { id: "strawberryPowder", nama: "Strawberry Powder",     berat: 500,  harga: 58.00,  unit: "g" },
  { id: "matchaPowder",     nama: "Matcha Powder",         berat: 100,  harga: 17.00,  unit: "g" },
];

// ─── PACKAGING ───────────────────────────────────────────────────────────────
const INIT_PKG = {
  single:  0.27,
  double:  0.35,
  quad:    0.60,
  parcel:  0.38, // bubble wrap + parcel bag + sticker
};

// ─── RESEPI ──────────────────────────────────────────────────────────────────
// Kulit Pistachio & Hazelnut (sama)
const KULIT_PISTA_HAZEL = {
  bahan: [
    { id: "marshmallow", guna: 800 },
    { id: "butter",      guna: 160 },
    { id: "susuTepung",  guna: 32  },
    { id: "cocoaPowder", guna: 112 },
  ],
  yieldG: 1073,
  beratPcs: 30,
  biji: 36,
};

// Kulit Matcha
const KULIT_MATCHA = {
  bahan: [
    { id: "marshmallow",  guna: 800 },
    { id: "butter",       guna: 150 },
    { id: "susuTepung",   guna: 100 },
    { id: "matchaPowder", guna: 72  },
  ],
  yieldG: 1090,
  beratPcs: 30,
  biji: 36,
};

// Kulit Strawberry
const KULIT_STRAWBERRY = {
  bahan: [
    { id: "marshmallow",      guna: 800 },
    { id: "butter",           guna: 150 },
    { id: "susuTepung",       guna: 120 },
    { id: "strawberryPowder", guna: 72  },
    { id: "strawberryEmulco", guna: 12  },
  ],
  yieldG: 1125,
  beratPcs: 30,
  biji: 37,
};

// Fillings
const FILLING_PISTACHIO = {
  bahan: [
    { id: "kunafa",          guna: 1800 },
    { id: "pistachioSpread", guna: 1800 },
    { id: "whiteChoc",       guna: 600  },
  ],
  totalG: 4200,
};

const FILLING_HAZELNUT = {
  bahan: [
    { id: "kunafa",         guna: 1000 },
    { id: "hazelnutSpread", guna: 1500 },
  ],
  totalG: 2500,
};

const FILLING_STRAWBERRY = {
  bahan: [
    { id: "kunafa",           guna: 1200 },
    { id: "whiteChoc",        guna: 1500 },
    { id: "strawberryEmulco", guna: 60   },
  ],
  totalG: 2760,
};

const FILLING_MATCHA = {
  bahan: [
    { id: "kunafa",       guna: 1200 },
    { id: "whiteChoc",    guna: 1500 },
    { id: "matchaPowder", guna: 55   },
  ],
  totalG: 2755,
};

// ─── SKU DEFINITIONS ─────────────────────────────────────────────────────────
const SKUS = [
  {
    id: "pistachio",
    nama: "Kunafa Pistachio",
    emoji: "🟢",
    accent: C.pistachio,
    kulit: KULIT_PISTA_HAZEL,
    filling: FILLING_PISTACHIO,
    fillingGPerPcs: 40,
    packs: [
      { label: "Single", qty: 1, pkgKey: "single" },
      { label: "Double", qty: 2, pkgKey: "double" },
      { label: "Quad",   qty: 4, pkgKey: "quad"   },
    ],
  },
  {
    id: "mini",
    nama: "Kunafa Pistachio Mini",
    emoji: "🟩",
    accent: C.mini,
    kulit: { ...KULIT_PISTA_HAZEL, beratPcs: 7, biji: 153 },
    filling: FILLING_PISTACHIO,
    fillingGPerPcs: 10,
    beratPcs: 7,
    isMini: true,
    pcsPerPack: 8,
    packs: [
      { label: "1 Pack (8pcs)", qty: 8, pkgKey: "single" },
    ],
  },
  {
    id: "hazelnut",
    nama: "Kunafa Hazelnut",
    emoji: "🟤",
    accent: C.hazelnut,
    kulit: KULIT_PISTA_HAZEL,
    filling: FILLING_HAZELNUT,
    fillingGPerPcs: 40,
    packs: [
      { label: "Single", qty: 1, pkgKey: "single" },
      { label: "Double", qty: 2, pkgKey: "double" },
      { label: "Quad",   qty: 4, pkgKey: "quad"   },
    ],
  },
  {
    id: "strawberry",
    nama: "Kunafa Strawberry",
    emoji: "🔴",
    accent: C.strawberry,
    kulit: KULIT_STRAWBERRY,
    filling: FILLING_STRAWBERRY,
    fillingGPerPcs: 40,
    packs: [
      { label: "Single", qty: 1, pkgKey: "single" },
      { label: "Double", qty: 2, pkgKey: "double" },
      { label: "Quad",   qty: 4, pkgKey: "quad"   },
    ],
  },
  {
    id: "matcha",
    nama: "Kunafa Matcha",
    emoji: "🍵",
    accent: C.matcha,
    kulit: KULIT_MATCHA,
    filling: FILLING_MATCHA,
    fillingGPerPcs: 40,
    packs: [
      { label: "Single", qty: 1, pkgKey: "single" },
      { label: "Double", qty: 2, pkgKey: "double" },
      { label: "Quad",   qty: 4, pkgKey: "quad"   },
    ],
  },
];

// ─── HELPERS ─────────────────────────────────────────────────────────────────
const rm2 = v => isFinite(v) && v !== null ? `RM ${Number(v).toFixed(2)}` : "RM —";
const rm4 = v => isFinite(v) && v !== null ? `RM ${Number(v).toFixed(4)}` : "RM —";

function pgram(bahan, id) {
  const b = bahan.find(x => x.id === id);
  return b ? b.harga / b.berat : 0;
}

function calcKulit(kulit, bahan) {
  const batchCost = kulit.bahan.reduce((s, k) => s + pgram(bahan, k.id) * k.guna, 0);
  return batchCost / kulit.biji;
}

function calcFilling(filling, fillingGPerPcs, bahan) {
  const batchCost = filling.bahan.reduce((s, f) => s + pgram(bahan, f.id) * f.guna, 0);
  const bijiBatch = filling.totalG / fillingGPerPcs;
  return batchCost / bijiBatch;
}

function marginCol(m) {
  if (m >= 65) return C.green;
  if (m >= 50) return C.amber;
  return C.red;
}
function marginTag(m) {
  if (m >= 65) return "✅ Sihat";
  if (m >= 50) return "⚠️ OK";
  return "🚨 Bahaya";
}

// ─── UI ATOMS ────────────────────────────────────────────────────────────────
const inp = {
  background: C.surface, border: `1px solid ${C.border}`,
  borderRadius: 8, color: C.text,
  padding: "8px 10px", fontSize: 14,
  width: "100%", outline: "none", boxSizing: "border-box",
};

function Div() {
  return <div style={{ borderTop: `1px solid ${C.border}`, margin: "8px 0" }} />;
}

function Row({ label, val, bold, color, gold, sub }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", padding: "3px 0" }}>
      <span style={{ fontSize: 12, color: bold ? C.text : C.muted, fontWeight: bold ? 700 : 400 }}>
        {label}{sub && <span style={{ fontSize: 10, color: C.muted, marginLeft: 4 }}>{sub}</span>}
      </span>
      <span style={{ fontSize: 13, fontWeight: bold ? 700 : 500, color: gold ? C.hazelnut : color || (bold ? C.text : C.label) }}>{val}</span>
    </div>
  );
}

function Card({ children, style }) {
  return <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: 16, ...style }}>{children}</div>;
}

// ─── MARGIN BLOCK ────────────────────────────────────────────────────────────
function MarginBlock({ kosTotal, tiktokPct, hargaJual, accent }) {
  const ttFee  = hargaJual * (tiktokPct / 100);
  const profit = hargaJual - kosTotal - ttFee;
  const margin = hargaJual > 0 ? (profit / hargaJual) * 100 : 0;
  const mc     = marginCol(margin);

  const suggested = [50, 60, 65, 70].map(t => {
    const tk = tiktokPct / 100;
    const p  = kosTotal / (1 - tk - t / 100);
    return { t, p };
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <div style={{ background: C.surface, borderRadius: 10, padding: 12 }}>
        <Row label="Harga jual"                  val={rm2(hargaJual)} />
        <Row label="− Kos total"                 val={`-${rm2(kosTotal)}`}  color={C.red} />
        <Row label={`− TikTok (${tiktokPct}%)`}  val={`-${rm2(ttFee)}`}    color={C.red} />
        <Div />
        <Row label="= Profit bersih" val={rm2(profit)} bold color={profit >= 0 ? C.green : C.red} />
      </div>

      {/* Margin bar */}
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 5 }}>
          <span style={{ fontSize: 12, color: C.muted }}>Margin</span>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <span style={{ fontSize: 11, color: mc, background: mc+"22", border:`1px solid ${mc}44`, borderRadius: 6, padding: "2px 8px", fontWeight: 700 }}>{marginTag(margin)}</span>
            <span style={{ fontSize: 22, fontWeight: 800, color: mc }}>{isFinite(margin) ? margin.toFixed(1) : "—"}%</span>
          </div>
        </div>
        <div style={{ height: 10, borderRadius: 99, background: "#0a0912", overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${Math.max(0,Math.min(100,margin))}%`, background: `linear-gradient(90deg,${mc}88,${mc})`, borderRadius: 99, transition: "width .3s" }} />
        </div>
        <div style={{ display:"flex", justifyContent:"space-between", fontSize:10, color:C.muted, marginTop:3 }}>
          <span>0%</span><span style={{color:"#7c3aed"}}>65% target</span><span>100%</span>
        </div>
      </div>

      {/* Cadangan harga */}
      <div>
        <div style={{ fontSize: 11, color: C.muted, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 8 }}>Cadangan harga jual</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          {suggested.map(({ t, p }) => (
            <div key={t} style={{ background: C.surface, borderRadius: 9, padding: "10px 12px", border: `1px solid ${t >= 65 ? accent+"66" : C.border}` }}>
              <div style={{ fontSize: 10, color: t >= 65 ? accent : C.muted, fontWeight: 700, marginBottom: 2 }}>{t}% margin</div>
              <div style={{ fontSize: 16, fontWeight: 800, color: t >= 65 ? accent : C.text }}>{isFinite(p) && p > 0 ? rm2(p) : "—"}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── PACK CARD ───────────────────────────────────────────────────────────────
function PackCard({ pack, kosPerBiji, pkg, setPkg, tiktokPct, accent, isMini, pcsPerPack }) {
  const kosBekas  = pkg[pack.pkgKey];
  const kosParcel = pkg.parcel;
  const kosProd   = kosPerBiji * pack.qty;
  const kosTotal  = kosProd + kosBekas + kosParcel;

  const [harga, setHarga] = useState(() => {
    const tk = tiktokPct / 100;
    const p  = kosTotal / (1 - tk - 0.65);
    return Math.ceil(p * 2) / 2;
  });

  const packLabel = isMini ? `${pack.label} · ${pcsPerPack} pcs` : pack.label;

  return (
    <div style={{ background: C.surface, border: `1.5px solid ${accent}44`, borderRadius: 14, padding: 16, display: "flex", flexDirection: "column", gap: 12 }}>
      {/* Pack header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ fontWeight: 800, fontSize: 15, color: accent }}>{packLabel}</div>
        <div style={{ background: accent+"22", border: `1px solid ${accent}44`, borderRadius: 9, padding: "5px 12px", textAlign: "center" }}>
          <div style={{ fontSize: 9, color: accent, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5 }}>Kos Total</div>
          <div style={{ fontSize: 16, fontWeight: 800, color: accent }}>{rm2(kosTotal)}</div>
        </div>
      </div>

      {/* Cost breakdown */}
      <div style={{ background: C.card, borderRadius: 10, padding: 12 }}>
        <Row label={`Produksi ×${pack.qty} biji`} val={rm2(kosProd)} />
        <Row label="Bekas" val={rm2(kosBekas)} />
        <Row label="Parcel (wrap+bag+sticker)" val={rm2(kosParcel)} />
        <Div />
        <Row label="Kos total" val={rm2(kosTotal)} bold gold />
      </div>

      {/* Packaging edit */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        <div>
          <div style={{ fontSize: 10, color: C.label, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 5 }}>Bekas (RM)</div>
          <input type="number" step={0.01} value={kosBekas}
            onChange={e => setPkg(p => ({ ...p, [pack.pkgKey]: +e.target.value }))}
            style={inp} />
        </div>
        <div>
          <div style={{ fontSize: 10, color: C.label, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 5 }}>Parcel (RM)</div>
          <input type="number" step={0.01} value={kosParcel}
            onChange={e => setPkg(p => ({ ...p, parcel: +e.target.value }))}
            style={inp} />
        </div>
      </div>

      <Div />

      {/* Harga jual */}
      <div>
        <div style={{ fontSize: 10, color: C.label, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 6 }}>Harga Jual (RM)</div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <button onClick={() => setHarga(h => Math.max(0, Math.round((+h - 0.10) * 100) / 100))}
            style={{ width:40, height:44, background:C.card, border:`1px solid ${C.border}`, color:C.text, borderRadius:8, fontSize:20, cursor:"pointer", flexShrink:0 }}>−</button>
          <input type="number" value={harga} min={0} step={0.10}
            onFocus={e => e.target.select()}
            onChange={e => setHarga(e.target.value === "" ? "" : +e.target.value)}
            onBlur={e => setHarga(parseFloat(e.target.value) || 0)}
            style={{ ...inp, fontSize:22, fontWeight:800, textAlign:"center", padding:"10px" }} />
          <button onClick={() => setHarga(h => Math.round((+h + 0.10) * 100) / 100)}
            style={{ width:40, height:44, background:C.card, border:`1px solid ${C.border}`, color:C.text, borderRadius:8, fontSize:20, cursor:"pointer", flexShrink:0 }}>+</button>
        </div>
      </div>

      <MarginBlock kosTotal={kosTotal} tiktokPct={tiktokPct} hargaJual={harga} accent={accent} />
    </div>
  );
}

// ─── SKU TAB CONTENT ─────────────────────────────────────────────────────────
function SKUTab({ sku, bahan, tiktokPct, pkg, setPkg }) {
  const kulitPerBiji   = useMemo(() => calcKulit(sku.kulit, bahan), [sku, bahan]);
  const fillingPerBiji = useMemo(() => calcFilling(sku.filling, sku.fillingGPerPcs, bahan), [sku, bahan]);
  const kosPerBiji     = kulitPerBiji + fillingPerBiji;

  const kulitBatchCost   = sku.kulit.bahan.reduce((s, k) => s + pgram(bahan, k.id) * k.guna, 0);
  const fillingBatchCost = sku.filling.bahan.reduce((s, f) => s + pgram(bahan, f.id) * f.guna, 0);
  const fillingBiji      = sku.filling.totalG / sku.fillingGPerPcs;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14, padding: "16px 16px 40px" }}>

      {/* Kos sebiji ringkasan */}
      <Card>
        <div style={{ fontWeight: 700, fontSize: 14, color: C.text, marginBottom: 12 }}>📊 Kos Sebiji</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>

          {/* Kulit */}
          <div style={{ background: C.surface, borderRadius: 10, padding: 12 }}>
            <div style={{ fontSize: 10, color: C.muted, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 8 }}>
              Kulit ({sku.kulit.biji} biji/batch)
            </div>
            {sku.kulit.bahan.map(k => {
              const b = bahan.find(x => x.id === k.id);
              return (
                <div key={k.id} style={{ display:"flex", justifyContent:"space-between", fontSize:11, padding:"2px 0" }}>
                  <span style={{color:C.muted}}>{b?.nama.split(" ")[0]}</span>
                  <span style={{color:C.label}}>{rm2(pgram(bahan,k.id)*k.guna)}</span>
                </div>
              );
            })}
            <Div />
            <Row label="Batch" val={rm2(kulitBatchCost)} />
            <div style={{ display:"flex", justifyContent:"space-between", marginTop:4 }}>
              <span style={{fontSize:12, color:sku.accent, fontWeight:700}}>Per biji</span>
              <span style={{fontSize:13, color:sku.accent, fontWeight:800}}>{rm4(kulitPerBiji)}</span>
            </div>
          </div>

          {/* Filling */}
          <div style={{ background: C.surface, borderRadius: 10, padding: 12 }}>
            <div style={{ fontSize: 10, color: C.muted, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 8 }}>
              Filling ({Math.floor(fillingBiji)} biji/batch)
            </div>
            {sku.filling.bahan.map(f => {
              const b = bahan.find(x => x.id === f.id);
              return (
                <div key={f.id} style={{ display:"flex", justifyContent:"space-between", fontSize:11, padding:"2px 0" }}>
                  <span style={{color:C.muted}}>{b?.nama.split(" ")[0]}</span>
                  <span style={{color:C.label}}>{rm2(pgram(bahan,f.id)*f.guna)}</span>
                </div>
              );
            })}
            <Div />
            <Row label="Batch" val={rm2(fillingBatchCost)} />
            <div style={{ display:"flex", justifyContent:"space-between", marginTop:4 }}>
              <span style={{fontSize:12, color:sku.accent, fontWeight:700}}>Per biji</span>
              <span style={{fontSize:13, color:sku.accent, fontWeight:800}}>{rm4(fillingPerBiji)}</span>
            </div>
          </div>
        </div>

        {/* Kos sebiji highlight */}
        <div style={{ background:"#12101e", border:`1px solid ${sku.accent}55`, borderRadius:10, padding:"12px 14px", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <span style={{fontSize:13, color:C.muted, fontWeight:600}}>Kos produksi sebiji</span>
          <span style={{fontSize:20, fontWeight:800, color:sku.accent}}>{rm2(kosPerBiji)}</span>
        </div>
      </Card>

      {/* Pack sections */}
      <div style={{ fontSize:11, color:C.muted, fontWeight:700, textTransform:"uppercase", letterSpacing:1 }}>
        📦 Pack & Margin
      </div>
      {sku.packs.map(pack => (
        <PackCard
          key={pack.label}
          pack={pack}
          kosPerBiji={kosPerBiji}
          pkg={pkg}
          setPkg={setPkg}
          tiktokPct={tiktokPct}
          accent={sku.accent}
          isMini={sku.isMini}
          pcsPerPack={sku.pcsPerPack}
        />
      ))}
    </div>
  );
}

// ─── BAHAN MENTAH TAB ────────────────────────────────────────────────────────
function BahanTab({ bahan, setBahan }) {
  function update(id, field, val) {
    // Allow empty string while typing; commit as number on blur
    setBahan(prev => prev.map(b => b.id === id ? { ...b, [field]: val === "" ? "" : parseFloat(val) } : b));
  }
  function commit(id, field, val) {
    setBahan(prev => prev.map(b => b.id === id ? { ...b, [field]: parseFloat(val) || 0 } : b));
  }
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:12, padding:"16px 16px 40px" }}>
      <div style={{ fontSize:12, color:C.muted, lineHeight:1.6, background:C.surface, borderRadius:10, padding:"10px 14px" }}>
        💡 Kemaskini harga di sini bila ada perubahan. Semua SKU akan auto-kira semula.
      </div>
      {bahan.map(b => (
        <Card key={b.id}>
          <div style={{ fontWeight:700, color:C.text, fontSize:14, marginBottom:12 }}>{b.nama}</div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
            <div>
              <div style={{ fontSize:10, color:C.label, fontWeight:600, textTransform:"uppercase", letterSpacing:0.5, marginBottom:5 }}>Berat beli (g)</div>
              <input type="number" value={b.berat} min={0}
                onFocus={e => e.target.select()}
                onChange={e => update(b.id, "berat", e.target.value)}
                onBlur={e => commit(b.id, "berat", e.target.value)}
                style={inp} />
            </div>
            <div>
              <div style={{ fontSize:10, color:C.label, fontWeight:600, textTransform:"uppercase", letterSpacing:0.5, marginBottom:5 }}>Harga beli (RM)</div>
              <input type="number" value={b.harga} min={0} step={0.10}
                onFocus={e => e.target.select()}
                onChange={e => update(b.id, "harga", e.target.value)}
                onBlur={e => commit(b.id, "harga", e.target.value)}
                style={inp} />
            </div>
          </div>
          <div style={{ marginTop:10, background:C.surface, borderRadius:8, padding:"7px 12px", fontSize:12, display:"flex", justifyContent:"space-between" }}>
            <span style={{color:C.muted}}>Kos per gram</span>
            <span style={{color:C.hazelnut, fontWeight:700}}>RM {(b.harga/b.berat).toFixed(5)} / g</span>
          </div>
        </Card>
      ))}
    </div>
  );
}

// ─── BOTTOM NAV ──────────────────────────────────────────────────────────────
function BottomNav({ tabs, active, setActive }) {
  return (
    <div style={{
      position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)",
      width: "100%", maxWidth: 480,
      background: C.surface, borderTop: `1px solid ${C.border}`,
      display: "flex", zIndex: 100,
    }}>
      {tabs.map(t => (
        <button key={t.id} onClick={() => setActive(t.id)} style={{
          flex: 1, padding: "10px 2px 12px",
          background: "transparent", border: "none",
          borderTop: active === t.id ? `2px solid ${t.accent || C.hazelnut}` : "2px solid transparent",
          color: active === t.id ? (t.accent || C.hazelnut) : C.muted,
          fontSize: 9, fontWeight: active === t.id ? 700 : 400,
          cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 3,
        }}>
          <span style={{ fontSize: 16 }}>{t.emoji}</span>
          <span>{t.label}</span>
        </button>
      ))}
    </div>
  );
}

// ─── APP ROOT ─────────────────────────────────────────────────────────────────
export default function App() {
  const [activeTab, setActiveTab] = useState("pistachio");
  const [bahan, setBahan]         = useState(INIT_BAHAN);
  const [pkg, setPkg]             = useState(INIT_PKG);
  const [tiktokPct, setTiktok]    = useState(8);
  const [loading, setLoading]     = useState(true);
  const [lastSync, setLastSync]   = useState(null);
  const [syncError, setSyncError] = useState(false);

  // ── Fetch dari Google Sheets on mount ──
  useEffect(() => {
    fetch(SHEETS_API)
      .then(r => r.json())
      .then(data => {
        if (data.bahan && data.bahan.length > 0) {
          setBahan(data.bahan.map(b => ({ ...b, unit: "g" })));
        }
        if (data.pkg) {
          setPkg(data.pkg);
        }
        setLastSync(new Date());
        setSyncError(false);
      })
      .catch(() => setSyncError(true))
      .finally(() => setLoading(false));
  }, []);

  function refetch() {
    setLoading(true);
    setSyncError(false);
    fetch(SHEETS_API)
      .then(r => r.json())
      .then(data => {
        if (data.bahan && data.bahan.length > 0) {
          setBahan(data.bahan.map(b => ({ ...b, unit: "g" })));
        }
        if (data.pkg) setPkg(data.pkg);
        setLastSync(new Date());
        setSyncError(false);
      })
      .catch(() => setSyncError(true))
      .finally(() => setLoading(false));
  }

  const navTabs = [
    { id: "bahan", emoji: "🛒", label: "Bahan", accent: C.label },
    ...SKUS.map(s => ({ id: s.id, emoji: s.emoji, label: s.nama.replace("Kunafa ",""), accent: s.accent })),
  ];

  const activeSKU = SKUS.find(s => s.id === activeTab);

  return (
    <div style={{ minHeight:"100vh", background:C.bg, color:C.text, fontFamily:"'Inter','Segoe UI',system-ui,sans-serif", maxWidth:480, margin:"0 auto", paddingBottom:80 }}>

      {/* Header */}
      <div style={{ background:C.surface, borderBottom:`1px solid ${C.border}`, padding:"18px 16px 0", position:"sticky", top:0, zIndex:50 }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:10 }}>
          <div>
            <div style={{ fontSize:10, color:C.hazelnut, letterSpacing:2, fontWeight:700, textTransform:"uppercase" }}>🍡 Mochi Food Costing</div>
            <div style={{ fontSize:18, fontWeight:800, color:C.text, marginTop:2 }}>
              {activeTab === "bahan" ? "Master Bahan Mentah" : `${activeSKU?.emoji} ${activeSKU?.nama}`}
            </div>
          </div>
          {/* TikTok % */}
          <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:10, padding:"6px 12px", minWidth:110 }}>
            <div style={{ fontSize:9, color:C.muted, fontWeight:600, textTransform:"uppercase", letterSpacing:0.5 }}>TikTok Fee</div>
            <div style={{ display:"flex", alignItems:"center", gap:6 }}>
              <input type="range" min={0} max={20} step={0.5} value={tiktokPct}
                onChange={e => setTiktok(+e.target.value)}
                style={{ width:60, accentColor:C.hazelnut }} />
              <span style={{ fontSize:14, fontWeight:800, color:C.hazelnut }}>{tiktokPct}%</span>
            </div>
          </div>
        </div>

        {/* Sync status bar */}
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"6px 0 10px" }}>
          {loading ? (
            <span style={{ fontSize:11, color:C.amber }}>⏳ Loading dari Google Sheets...</span>
          ) : syncError ? (
            <span style={{ fontSize:11, color:C.red }}>⚠️ Gagal sync — guna data tempatan</span>
          ) : (
            <span style={{ fontSize:11, color:C.green }}>
              ✅ Sync berjaya · {lastSync?.toLocaleTimeString("ms-MY", { hour:"2-digit", minute:"2-digit" })}
            </span>
          )}
          <button onClick={refetch} style={{
            fontSize:11, color:C.hazelnut, background:"transparent",
            border:`1px solid ${C.hazelnut}44`, borderRadius:6,
            padding:"3px 10px", cursor:"pointer", fontWeight:600,
          }}>🔄 Refresh</button>
        </div>
      </div>

      {/* Loading overlay */}
      {loading && (
        <div style={{ padding:40, textAlign:"center", color:C.muted }}>
          <div style={{ fontSize:32, marginBottom:12 }}>🍡</div>
          <div style={{ fontSize:13 }}>Mengambil harga terkini dari Google Sheets...</div>
        </div>
      )}

      {/* Content */}
      {!loading && (
        activeTab === "bahan"
          ? <BahanTab bahan={bahan} setBahan={setBahan} />
          : activeSKU && <SKUTab sku={activeSKU} bahan={bahan} tiktokPct={tiktokPct} pkg={pkg} setPkg={setPkg} />
      )}

      {/* Bottom nav */}
      <BottomNav tabs={navTabs} active={activeTab} setActive={setActiveTab} />
    </div>
  );
}
