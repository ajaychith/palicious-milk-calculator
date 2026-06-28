import React, { useEffect, useMemo, useState } from "react";
import {
  ChevronRight,
  RefreshCcw,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Package,
  Droplets,
  Activity,
  Smartphone,
  Zap,
  ShieldCheck,
} from "lucide-react";
import "./App.css";

/*
  PALICIOUS — Android Premium Fast UI
  -----------------------------------
  Goal: premium mobile-first UX without heavy desktop effects.
  Core pricing calculation logic is kept the same.
*/

const ASSETS = {
  buffalo:
    "https://images.unsplash.com/photo-1550583724-b2692b85b150?q=60&w=640&fm=webp&auto=format&fit=crop",
  cow:
    "https://images.unsplash.com/photo-1563636619-e9143da7973b?q=60&w=640&fm=webp&auto=format&fit=crop",
  curd:
    "https://images.unsplash.com/photo-1488477181946-6428a0291777?q=60&w=640&fm=webp&auto=format&fit=crop",
  universal:
    "https://images.unsplash.com/photo-1618044733300-9472054094ee?q=60&w=640&fm=webp&auto=format&fit=crop",
};

const PRODUCT_CONFIG = {
  buffalo: {
    key: "buffalo",
    title: "Buffalo Milk",
    shortTitle: "Buffalo",
    icon: Droplets,
    image: ASSETS.buffalo,
    tone: "cyan",
    quantityOptions: [
      { label: "500 ml", value: "500 ml" },
      { label: "1 litre", value: "1 litre" },
    ],
  },
  cow: {
    key: "cow",
    title: "Cow Milk",
    shortTitle: "Cow",
    icon: Droplets,
    image: ASSETS.cow,
    tone: "green",
    quantityOptions: [
      { label: "500 ml", value: "500 ml" },
      { label: "1 litre", value: "1 litre" },
    ],
  },
  curd: {
    key: "curd",
    title: "Curd Packs",
    shortTitle: "Curd",
    icon: Package,
    image: ASSETS.curd,
    tone: "amber",
    quantityOptions: [
      { label: "250 ml", value: "250 ml" },
      { label: "500 ml", value: "500 ml" },
    ],
  },
};

const MODULES = [
  {
    type: "buffalo",
    label: "Buffalo",
    subtitle: "High-fat milk pricing",
    image: ASSETS.buffalo,
    metric: "Milk SKU",
    tone: "cyan",
  },
  {
    type: "cow",
    label: "Cow",
    subtitle: "Daily cow milk margin",
    image: ASSETS.cow,
    metric: "Milk SKU",
    tone: "green",
  },
  {
    type: "curd",
    label: "Curd",
    subtitle: "Pack margin engine",
    image: ASSETS.curd,
    metric: "Pack SKU",
    tone: "amber",
  },
  {
    type: "universal",
    label: "Universal",
    subtitle: "Any product margin",
    image: ASSETS.universal,
    metric: "Custom",
    tone: "violet",
  },
];

function createEmptyProduct() {
  return {
    quantity: "",
    productionCost: "0",
    packetCost: "0",
    otherCost: "0",
    sellingPrice: "0",
    suggestedProfitPercent: "0",
  };
}

function createInitialProducts() {
  return {
    buffalo: createEmptyProduct(),
    cow: createEmptyProduct(),
    curd: createEmptyProduct(),
  };
}

function createEmptyUniversal() {
  return {
    productionCost: "0",
    otherCost: "0",
    sellingPrice: "0",
    suggestedProfitPercent: "0",
  };
}

function toNumber(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function money(value) {
  return `₹${toNumber(value).toFixed(2)}`;
}

function calculateProduct(data) {
  const pCost = toNumber(data.productionCost);
  const pkCost = toNumber(data.packetCost);
  const oCost = toNumber(data.otherCost);
  const sPrice = toNumber(data.sellingPrice);
  const spPercent = toNumber(data.suggestedProfitPercent);

  const total = pCost + pkCost + oCost;
  const actualProfit = sPrice - total;
  const actualProfitPercent = total > 0 ? (actualProfit / total) * 100 : 0;
  const suggestedProfit = total * (spPercent / 100);
  const suggestedSellingPrice = total + suggestedProfit;

  return {
    productionCost: pCost,
    packetCost: pkCost,
    otherCost: oCost,
    sellingPrice: sPrice,
    totalProductionCost: total,
    actualProfit,
    actualProfitPercent,
    suggestedProfit,
    suggestedSellingPrice,
  };
}

function calculateUniversal(data) {
  const pCost = toNumber(data.productionCost);
  const oCost = toNumber(data.otherCost);
  const sPrice = toNumber(data.sellingPrice);
  const spPercent = toNumber(data.suggestedProfitPercent);

  const total = pCost + oCost;
  const actualProfit = sPrice - total;
  const actualProfitPercent = total > 0 ? (actualProfit / total) * 100 : 0;
  const suggestedProfit = total * (spPercent / 100);
  const suggestedSellingPrice = total + suggestedProfit;

  return {
    productionCost: pCost,
    otherCost: oCost,
    sellingPrice: sPrice,
    totalProductionCost: total,
    actualProfit,
    actualProfitPercent,
    suggestedProfit,
    suggestedSellingPrice,
  };
}

function getStatus(result) {
  if (result.totalProductionCost <= 0 || result.sellingPrice <= 0) {
    return {
      label: "Awaiting Input",
      className: "idle",
      icon: Activity,
      message: "Enter cost and selling price to start live margin analysis.",
    };
  }

  if (result.actualProfit < 0) {
    return {
      label: "Critical Loss",
      className: "loss",
      icon: TrendingDown,
      message: "Selling price is below total cost. Increase price or reduce expenses.",
    };
  }

  if (result.actualProfitPercent >= 40) {
    return {
      label: "Excellent Margin",
      className: "profit",
      icon: TrendingUp,
      message: "Very strong profitability. This product can scale well.",
    };
  }

  if (result.actualProfitPercent >= 20) {
    return {
      label: "Healthy Margin",
      className: "good",
      icon: TrendingUp,
      message: "Stable margin for daily operations and customer growth.",
    };
  }

  return {
    label: "Low Margin Alert",
    className: "warning",
    icon: Activity,
    message: "Profit exists, but margin is tight. Optimize cost or selling price.",
  };
}

function clampPercent(value) {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(100, value));
}

function useAndroidPerformanceMode() {
  useEffect(() => {
    const ua = navigator.userAgent || "";
    const isAndroid = /Android/i.test(ua);
    const reduceMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;

    document.documentElement.classList.toggle("android-fast", isAndroid);
    document.documentElement.classList.toggle("reduce-motion", Boolean(reduceMotion));

    return () => {
      document.documentElement.classList.remove("android-fast");
      document.documentElement.classList.remove("reduce-motion");
    };
  }, []);
}

function nudge() {
  if (typeof navigator !== "undefined" && "vibrate" in navigator) {
    navigator.vibrate?.(8);
  }
}

function InputField({
  label,
  value,
  onChange,
  suffix = "",
  prefix = "₹",
  readOnly = false,
  hint = "",
}) {
  return (
    <label className="field-card">
      <span className="field-label">{label}</span>
      <span className={`field-control ${readOnly ? "readonly" : ""}`}>
        {prefix ? <span className="field-prefix">{prefix}</span> : null}
        <input
          type="number"
          value={value}
          readOnly={readOnly}
          min={readOnly ? undefined : "0"}
          step="0.01"
          inputMode="decimal"
          onFocus={(event) => !readOnly && event.target.select()}
          onChange={(event) => !readOnly && onChange(event.target.value)}
        />
        {suffix ? <span className="field-suffix">{suffix}</span> : null}
      </span>
      {hint ? <small>{hint}</small> : null}
    </label>
  );
}

function ResultMetric({ label, value, note, tone = "neutral" }) {
  return (
    <div className={`metric-card ${tone}`}>
      <span>{label}</span>
      <strong>{value}</strong>
      {note ? <small>{note}</small> : null}
    </div>
  );
}

function ModuleButton({ item, active, onClick }) {
  const isUniversal = item.type === "universal";
  const Icon = item.type === "curd" ? Package : isUniversal ? DollarSign : Droplets;

  return (
    <button
      type="button"
      onClick={() => {
        nudge();
        onClick();
      }}
      className={`module-tile tone-${item.tone} ${active ? "active" : ""}`}
    >
      <span className="module-image">
        <img src={item.image} alt="" loading="lazy" decoding="async" />
      </span>
      <span className="module-overlay" />
      <span className="module-content">
        <span className="module-chip">{item.metric}</span>
        <strong>{item.label}</strong>
        <small>{item.subtitle}</small>
        <Icon size={18} className="module-icon" />
      </span>
    </button>
  );
}

function MarginGauge({ result }) {
  const actual = result.actualProfitPercent;
  const percent = result.totalProductionCost > 0 ? clampPercent(Math.abs(actual)) : 0;
  const state =
    result.totalProductionCost <= 0 || result.sellingPrice <= 0
      ? "idle"
      : result.actualProfit < 0
      ? "loss"
      : actual >= 20
      ? "profit"
      : "warning";

  return (
    <div className={`margin-gauge ${state}`} style={{ "--progress": `${percent}%` }}>
      <div className="gauge-ring">
        <div className="gauge-core">
          <span>{result.actualProfit < 0 ? "Loss" : "Margin"}</span>
          <strong>{actual.toFixed(1)}%</strong>
        </div>
      </div>
    </div>
  );
}

function InsightPanel({ result, desiredPercent }) {
  const status = getStatus(result);
  const StatusIcon = status.icon;

  return (
    <aside className="insight-card">
      <MarginGauge result={result} />

      <div className={`status-card ${status.className}`}>
        <StatusIcon size={21} />
        <div>
          <strong>{status.label}</strong>
          <p>{status.message}</p>
        </div>
      </div>

      <div className="metrics-grid">
        <ResultMetric
          label="Gross Cost"
          value={money(result.totalProductionCost)}
          note="Total making cost"
        />
        <ResultMetric
          label="Target Profit"
          value={money(result.suggestedProfit)}
          note={`${toNumber(desiredPercent).toFixed(2)}% desired`}
          tone="suggest"
        />
        <ResultMetric
          label="Target Price"
          value={money(result.suggestedSellingPrice)}
          note="Ideal selling price"
          tone="suggest"
        />
        <ResultMetric
          label={result.actualProfit < 0 ? "Net Loss" : "Net Profit"}
          value={money(result.actualProfit)}
          note={`${result.actualProfitPercent.toFixed(2)}% ROI`}
          tone={result.actualProfit < 0 ? "loss" : "profit"}
        />
      </div>
    </aside>
  );
}

function QuantitySelector({ config, value, onSelect }) {
  return (
    <section className="panel-card step-card enter">
      <div className="panel-head compact">
        <img src={config.image} alt="" loading="lazy" decoding="async" />
        <div>
          <span className="eyebrow">Step 01</span>
          <h2>Choose volume</h2>
          <p>Select SKU size to start pricing.</p>
        </div>
      </div>

      <div className="choice-grid">
        {config.quantityOptions.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => {
              nudge();
              onSelect(option.value);
            }}
            className={`choice-btn ${value === option.value ? "selected" : ""}`}
          >
            <span>{option.label}</span>
            <small>Open cost model</small>
            <ChevronRight size={18} />
          </button>
        ))}
      </div>
    </section>
  );
}

function ProductCalculator({ type, data, onChange, onReset }) {
  const config = PRODUCT_CONFIG[type];
  const Icon = config.icon;
  const result = useMemo(() => calculateProduct(data), [data]);

  return (
    <section className="workspace enter">
      <div className="workspace-top">
        <div className={`workspace-icon tone-${config.tone}`}>
          <Icon size={19} />
        </div>
        <div>
          <span className="eyebrow">Active workspace</span>
          <h2>{config.title}</h2>
        </div>
        <button type="button" onClick={onReset} className="mini-action">
          <RefreshCcw size={15} />
          Reset
        </button>
      </div>

      {!data.quantity ? (
        <QuantitySelector
          config={config}
          value={data.quantity}
          onSelect={(quantity) => onChange({ quantity })}
        />
      ) : (
        <div className="workspace-grid">
          <div className="panel-card input-card">
            <div className="panel-head split">
              <div>
                <span className="eyebrow">Step 02</span>
                <h2>Enter costs</h2>
                <p>Live Android-fast calculation for {data.quantity}.</p>
              </div>
              <span className="sku-badge">
                <Package size={14} />
                {data.quantity}
              </span>
            </div>

            <div className="fields-grid">
              <InputField
                label="Production Cost"
                value={data.productionCost}
                onChange={(v) => onChange({ productionCost: v })}
                hint="Milk sourcing / making"
              />
              <InputField
                label="Packaging Cost"
                value={data.packetCost}
                onChange={(v) => onChange({ packetCost: v })}
                hint="Bottle / pouch / sticker"
              />
              <InputField
                label="Other Cost"
                value={data.otherCost}
                onChange={(v) => onChange({ otherCost: v })}
                hint="Delivery, labour, wastage"
              />
              <InputField
                label="Selling Price"
                value={data.sellingPrice}
                onChange={(v) => onChange({ sellingPrice: v })}
                hint="Customer price"
              />
              <InputField
                label="Desired Margin"
                value={data.suggestedProfitPercent}
                prefix=""
                suffix="%"
                onChange={(v) => onChange({ suggestedProfitPercent: v })}
                hint="Target profit percent"
              />
              <InputField
                label="Live Net Profit"
                value={result.actualProfit.toFixed(2)}
                readOnly
                onChange={() => {}}
                hint="Auto calculated"
              />
            </div>
          </div>

          <InsightPanel result={result} desiredPercent={data.suggestedProfitPercent} />
        </div>
      )}
    </section>
  );
}

function UniversalCalculator({ data, onChange, onReset }) {
  const result = useMemo(() => calculateUniversal(data), [data]);

  return (
    <section className="workspace enter">
      <div className="workspace-top">
        <div className="workspace-icon tone-violet">
          <DollarSign size={19} />
        </div>
        <div>
          <span className="eyebrow">Active workspace</span>
          <h2>Universal Margin</h2>
        </div>
        <button type="button" onClick={onReset} className="mini-action">
          <RefreshCcw size={15} />
          Reset
        </button>
      </div>

      <div className="workspace-grid">
        <div className="panel-card input-card">
          <div className="panel-head split">
            <div>
              <span className="eyebrow">Custom SKU</span>
              <h2>Any product</h2>
              <p>Use for paneer, ghee, combos, delivery, or future products.</p>
            </div>
            <span className="sku-badge">
              <DollarSign size={14} />
              Global
            </span>
          </div>

          <div className="fields-grid universal-fields">
            <InputField
              label="Base Cost"
              value={data.productionCost}
              onChange={(v) => onChange({ productionCost: v })}
              hint="Main product cost"
            />
            <InputField
              label="Extra Cost"
              value={data.otherCost}
              onChange={(v) => onChange({ otherCost: v })}
              hint="Packing, delivery, service"
            />
            <InputField
              label="Selling Price"
              value={data.sellingPrice}
              onChange={(v) => onChange({ sellingPrice: v })}
              hint="Customer price"
            />
            <InputField
              label="Desired Margin"
              value={data.suggestedProfitPercent}
              prefix=""
              suffix="%"
              onChange={(v) => onChange({ suggestedProfitPercent: v })}
              hint="Target profit percent"
            />
            <InputField
              label="Live Net Profit"
              value={result.actualProfit.toFixed(2)}
              readOnly
              onChange={() => {}}
              hint="Auto calculated"
            />
          </div>
        </div>

        <InsightPanel result={result} desiredPercent={data.suggestedProfitPercent} />
      </div>
    </section>
  );
}

function EmptyState({ onStart }) {
  return (
    <section className="empty-state enter">
      <div className="empty-orb">
        <Smartphone size={30} />
      </div>
      <span className="eyebrow">Android-first ready</span>
      <h2>Choose a module to begin.</h2>
      <p>
        Designed like a fast mobile business app: quick touch response, lightweight
        motion, instant calculations, and readable cards on small screens.
      </p>
      <button type="button" onClick={onStart} className="primary-btn">
        Start Buffalo Pricing
        <ChevronRight size={18} />
      </button>
    </section>
  );
}

export default function App() {
  useAndroidPerformanceMode();

  const [activeModule, setActiveModule] = useState("");
  const [products, setProducts] = useState(createInitialProducts);
  const [universal, setUniversal] = useState(createEmptyUniversal);

  const activeResult = useMemo(() => {
    if (!activeModule) return null;
    if (activeModule === "universal") return calculateUniversal(universal);
    return calculateProduct(products[activeModule]);
  }, [activeModule, products, universal]);

  const activeStatus = activeResult ? getStatus(activeResult) : null;
  const activeProfit = activeResult ? activeResult.actualProfit : 0;

  const openModule = (type) => {
    setActiveModule(type);
    window.requestAnimationFrame(() => {
      document.querySelector(".workspace-area")?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });
  };

  const updateProduct = (type, partial) => {
    setProducts((prev) => ({
      ...prev,
      [type]: {
        ...prev[type],
        ...partial,
      },
    }));
  };

  const resetAll = () => {
    setProducts(createInitialProducts());
    setUniversal(createEmptyUniversal());
    setActiveModule("");
  };

  return (
    <main className="app-root">
      <div className="fast-bg" aria-hidden="true">
        <div className="bg-orb orb-a" />
        <div className="bg-orb orb-b" />
        <div className="bg-grid" />
      </div>

      <nav className="app-topbar">
        <div className="brand-block">
          <span className="brand-logo">P</span>
          <span>
            <small>Palicious</small>
            <strong>Pricing OS</strong>
          </span>
        </div>

        <div className={`top-status ${activeStatus?.className || "idle"}`}>
          <span>{activeStatus?.label || "Ready"}</span>
          <strong>{money(activeProfit)}</strong>
        </div>

        <button type="button" onClick={resetAll} className="top-reset" aria-label="Reset app">
          <RefreshCcw size={17} />
        </button>
      </nav>

      <header className="hero-card">
        <div className="hero-copy">
          <span className="eyebrow hero-eyebrow">
            <Zap size={14} />
            Android superfast edition
          </span>
          <h1>
            Premium dairy <span>pricing control</span>
          </h1>
          <p>
            Ultra-fluid mobile UI for Palicious with live margin intelligence,
            instant profit/loss view, and app-like touch experience.
          </p>

          <div className="hero-pills">
            <span>
              <Smartphone size={14} />
              Mobile-first
            </span>
            <span>
              <ShieldCheck size={14} />
              Stable logic
            </span>
            <span>
              <Activity size={14} />
              Live maths
            </span>
          </div>
        </div>

        <div className="hero-profit-card" aria-label="Current profit summary">
          <span>Live Net</span>
          <strong>{money(activeProfit)}</strong>
          <small>{activeStatus?.label || "No module selected"}</small>
        </div>
      </header>

      <section className="module-rail" aria-label="Pricing modules">
        {MODULES.map((item) => (
          <ModuleButton
            key={item.type}
            item={item}
            active={activeModule === item.type}
            onClick={() => openModule(item.type)}
          />
        ))}
      </section>

      <section className="workspace-area">
        {!activeModule ? (
          <EmptyState onStart={() => openModule("buffalo")} />
        ) : activeModule === "universal" ? (
          <UniversalCalculator
            data={universal}
            onChange={(partial) => setUniversal((prev) => ({ ...prev, ...partial }))}
            onReset={() => setUniversal(createEmptyUniversal())}
          />
        ) : (
          <ProductCalculator
            type={activeModule}
            data={products[activeModule]}
            onChange={(partial) => updateProduct(activeModule, partial)}
            onReset={() =>
              setProducts((prev) => ({ ...prev, [activeModule]: createEmptyProduct() }))
            }
          />
        )}
      </section>

      <footer className="app-footer">
        <span>
          <strong>Palicious</strong> Android pricing workspace
        </span>
        <span>Fast UI • Low motion • Responsive</span>
      </footer>
    </main>
  );
}
