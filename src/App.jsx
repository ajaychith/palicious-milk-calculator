import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ChevronRight,
  RefreshCcw,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Package,
  Droplets,
  Activity,
} from "lucide-react";
import "./App.css";

/*
  PALICIOUS — Ultra Premium Liquid 3D Pricing Workspace
  ------------------------------------------------------
  Kept your existing pricing calculation logic.
  Upgraded only UI/UX, responsiveness, interaction, and performance style.
*/

// Replace these with local optimized WebP files later for the fastest production build.
// Example: "/palicious-assets/buffalo.webp"
const ASSETS = {
  buffalo:
    "https://images.unsplash.com/photo-1550583724-b2692b85b150?q=72&w=900&auto=format&fit=crop",
  cow:
    "https://images.unsplash.com/photo-1563636619-e9143da7973b?q=72&w=900&auto=format&fit=crop",
  curd:
    "https://images.unsplash.com/photo-1488477181946-6428a0291777?q=72&w=900&auto=format&fit=crop",
  universal:
    "https://images.unsplash.com/photo-1618044733300-9472054094ee?q=72&w=900&auto=format&fit=crop",
  profit:
    "https://images.unsplash.com/photo-1579532537598-459ecdaf39cc?q=72&w=900&auto=format&fit=crop",
  loss:
    "https://images.unsplash.com/photo-1618044619888-009e412ff12a?q=72&w=900&auto=format&fit=crop",
};

const PRODUCT_CONFIG = {
  buffalo: {
    key: "buffalo",
    title: "Buffalo Milk",
    shortTitle: "Buffalo",
    icon: Droplets,
    image: ASSETS.buffalo,
    accent: "cyan",
    quantityOptions: [
      { label: "500 ml", value: "500 ml" },
      { label: "1 litre", value: "1 litre" },
    ],
    launchTitle: "Buffalo Milk Intelligence",
    launchText: "Opening premium margin control for buffalo milk SKUs.",
  },
  cow: {
    key: "cow",
    title: "Cow Milk",
    shortTitle: "Cow",
    icon: Droplets,
    image: ASSETS.cow,
    accent: "emerald",
    quantityOptions: [
      { label: "500 ml", value: "500 ml" },
      { label: "1 litre", value: "1 litre" },
    ],
    launchTitle: "Cow Milk Intelligence",
    launchText: "Opening premium margin control for cow milk SKUs.",
  },
  curd: {
    key: "curd",
    title: "Curd Packs",
    shortTitle: "Curd",
    icon: Package,
    image: ASSETS.curd,
    accent: "amber",
    quantityOptions: [
      { label: "250 ml", value: "250 ml" },
      { label: "500 ml", value: "500 ml" },
    ],
    launchTitle: "Curd Pack Intelligence",
    launchText: "Preparing packaging, dairy cost, and sales margin flow.",
  },
};

const MODULES = [
  {
    type: "buffalo",
    label: "Buffalo",
    subtitle: "High-fat milk margin",
    image: ASSETS.buffalo,
    metric: "Daily SKU",
  },
  {
    type: "cow",
    label: "Cow",
    subtitle: "Fresh cow milk pricing",
    image: ASSETS.cow,
    metric: "Retail SKU",
  },
  {
    type: "curd",
    label: "Curd",
    subtitle: "Pack pricing engine",
    image: ASSETS.curd,
    metric: "Pack SKU",
  },
  {
    type: "universal",
    label: "Universal",
    subtitle: "Any product margin",
    image: ASSETS.universal,
    metric: "Custom SKU",
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
      className: "is-idle",
      icon: Activity,
      message: "Enter cost and selling price to start live margin intelligence.",
    };
  }

  if (result.actualProfit < 0) {
    return {
      label: "Critical Loss",
      className: "is-loss",
      icon: TrendingDown,
      message: "Selling price is below cost. Increase price or reduce production cost.",
    };
  }

  if (result.actualProfitPercent >= 40) {
    return {
      label: "Excellent Margin",
      className: "is-profit",
      icon: TrendingUp,
      message: "Very strong profitability. This SKU has excellent business potential.",
    };
  }

  if (result.actualProfitPercent >= 20) {
    return {
      label: "Healthy Margin",
      className: "is-good",
      icon: TrendingUp,
      message: "Stable profit margin. Suitable for daily operations and scaling.",
    };
  }

  return {
    label: "Low Margin Alert",
    className: "is-warning",
    icon: Activity,
    message: "Profit exists, but margin is tight. Optimize cost or selling price.",
  };
}

function safePercent(value) {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(100, value));
}

function TiltCard({ children, className = "", onClick, active = false, type }) {
  const ref = useRef(null);

  const handleMove = (event) => {
    const node = ref.current;
    if (!node || window.innerWidth < 900) return;

    const rect = node.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const rotateY = ((x / rect.width) - 0.5) * 10;
    const rotateX = ((0.5 - y / rect.height)) * 10;

    node.style.setProperty("--rx", `${rotateX.toFixed(2)}deg`);
    node.style.setProperty("--ry", `${rotateY.toFixed(2)}deg`);
    node.style.setProperty("--mx", `${((x / rect.width) * 100).toFixed(2)}%`);
    node.style.setProperty("--my", `${((y / rect.height) * 100).toFixed(2)}%`);
  };

  const handleLeave = () => {
    const node = ref.current;
    if (!node) return;
    node.style.setProperty("--rx", "0deg");
    node.style.setProperty("--ry", "0deg");
    node.style.setProperty("--mx", "50%");
    node.style.setProperty("--my", "50%");
  };

  return (
    <button
      ref={ref}
      type="button"
      data-module={type}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      onClick={onClick}
      className={`tilt-card ${active ? "is-active" : ""} ${className}`}
    >
      {children}
    </button>
  );
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
    <div className="field-wrap">
      <label>{label}</label>
      <div className={`liquid-input ${readOnly ? "is-readonly" : ""}`}>
        {prefix ? <span className="field-prefix">{prefix}</span> : null}
        <input
          type="number"
          value={value}
          readOnly={readOnly}
          min={readOnly ? undefined : "0"}
          step="0.01"
          inputMode="decimal"
          onFocus={(e) => !readOnly && e.target.select()}
          onChange={(e) => !readOnly && onChange(e.target.value)}
        />
        {suffix ? <span className="field-suffix">{suffix}</span> : null}
      </div>
      {hint ? <small>{hint}</small> : null}
    </div>
  );
}

function ResultTile({ label, value, note, type = "neutral" }) {
  return (
    <div className={`result-tile result-${type}`}>
      <span>{label}</span>
      <strong>{value}</strong>
      {note ? <small>{note}</small> : null}
    </div>
  );
}

function MarginOrbit({ result }) {
  const percent =
    result.totalProductionCost > 0
      ? safePercent(Math.abs(result.actualProfitPercent))
      : 0;

  const statusClass =
    result.totalProductionCost <= 0 || result.sellingPrice <= 0
      ? "orbit-idle"
      : result.actualProfit < 0
      ? "orbit-loss"
      : result.actualProfitPercent >= 20
      ? "orbit-profit"
      : "orbit-warning";

  return (
    <div
      className={`margin-orbit ${statusClass}`}
      style={{ "--p": `${percent}%` }}
      aria-label="Margin score"
    >
      <div className="orbit-ring">
        <div className="orbit-core">
          <span>{result.actualProfit < 0 ? "Loss" : "Margin"}</span>
          <strong>{result.actualProfitPercent.toFixed(1)}%</strong>
        </div>
      </div>
    </div>
  );
}

function SplashOverlay({ splash }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (splash) {
      setMounted(true);
      return;
    }

    const closeTimer = window.setTimeout(() => setMounted(false), 360);
    return () => window.clearTimeout(closeTimer);
  }, [splash]);

  if (!mounted) return null;

  let content = null;
  let stateClass = "launch";

  if (splash?.kind === "loss") {
    content = {
      image: ASSETS.loss,
      title: "Negative Margin Detected",
      text: "Production cost is higher than selling price.",
    };
    stateClass = "loss";
  } else if (splash?.kind === "profit") {
    content = {
      image: ASSETS.profit,
      title: "Profit Flow Active",
      text: "Your pricing model is generating margin.",
    };
    stateClass = "profit";
  } else if (splash?.type === "universal") {
    content = {
      image: ASSETS.universal,
      title: "Universal Margin Studio",
      text: "Opening custom product analysis mode.",
    };
  } else if (splash?.type) {
    const config = PRODUCT_CONFIG[splash.type];
    content = {
      image: config.image,
      title: config.launchTitle,
      text: config.launchText,
    };
  }

  if (!content) return null;

  return (
    <div className={`splash ${splash ? "show" : "hide"} splash-${stateClass}`}>
      <div className="splash-orb" />
      <div className="splash-card">
        <div className="splash-media">
          <img src={content.image} alt="" decoding="async" />
          <div className="scan-line" />
        </div>
        <div className="splash-copy">
          <span>Processing</span>
          <h2>{content.title}</h2>
          <p>{content.text}</p>
        </div>
      </div>
    </div>
  );
}

function QuantitySelector({ config, value, onSelect }) {
  return (
    <section className="workspace-card animate-in">
      <div className="workspace-head">
        <div className="mini-photo">
          <img src={config.image} alt={config.title} loading="lazy" decoding="async" />
        </div>
        <div>
          <span className="eyebrow">Step 01</span>
          <h2>Choose Volume</h2>
          <p>Select the SKU size before entering costs.</p>
        </div>
      </div>

      <div className="choice-grid">
        {config.quantityOptions.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => onSelect(option.value)}
            className={`choice-card ${value === option.value ? "is-selected" : ""}`}
          >
            <span>{option.label}</span>
            <small>Open pricing model</small>
            <ChevronRight aria-hidden="true" />
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
  const status = getStatus(result);
  const StatusIcon = status.icon;

  return (
    <section className="module-shell animate-in">
      <div className="module-top">
        <div className="module-title">
          <span className={`module-badge accent-${config.accent}`}>
            <Icon size={18} />
          </span>
          <div>
            <span className="eyebrow">Active Workspace</span>
            <h2>{config.title}</h2>
          </div>
        </div>

        <button type="button" onClick={onReset} className="ghost-action">
          <RefreshCcw size={16} />
          Reset Module
        </button>
      </div>

      {!data.quantity ? (
        <QuantitySelector
          config={config}
          value={data.quantity}
          onSelect={(quantity) => onChange({ quantity })}
        />
      ) : (
        <div className="calc-grid">
          <div className="workspace-card input-panel">
            <div className="panel-heading">
              <div>
                <span className="eyebrow">Step 02</span>
                <h2>Financial Inputs</h2>
                <p>Live cost, sales, and target margin control for {data.quantity}.</p>
              </div>
              <span className="sku-pill">
                <Package size={15} />
                {data.quantity}
              </span>
            </div>

            <div className="fields-grid">
              <InputField
                label="Production Cost"
                value={data.productionCost}
                onChange={(v) => onChange({ productionCost: v })}
                hint="Milk sourcing / production"
              />
              <InputField
                label="Packaging Cost"
                value={data.packetCost}
                onChange={(v) => onChange({ packetCost: v })}
                hint="Bottle / pouch / label"
              />
              <InputField
                label="Operational Cost"
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
                hint="Your target profit %"
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

          <aside className="insight-panel">
            <MarginOrbit result={result} />

            <div className={`status-strip ${status.className}`}>
              <StatusIcon size={22} />
              <div>
                <strong>{status.label}</strong>
                <p>{status.message}</p>
              </div>
            </div>

            <div className="result-grid">
              <ResultTile
                label="Gross Cost"
                value={money(result.totalProductionCost)}
                note="Production + Packaging + Ops"
              />
              <ResultTile
                label="Target Profit"
                value={money(result.suggestedProfit)}
                note={`${toNumber(data.suggestedProfitPercent).toFixed(2)}% desired margin`}
                type="suggest"
              />
              <ResultTile
                label="Target Price"
                value={money(result.suggestedSellingPrice)}
                note="Ideal selling price"
                type="suggest"
              />
              <ResultTile
                label={result.actualProfit < 0 ? "Net Loss" : "Net Profit"}
                value={money(result.actualProfit)}
                note={`${result.actualProfitPercent.toFixed(2)}% ROI`}
                type={result.actualProfit < 0 ? "loss" : "profit"}
              />
            </div>
          </aside>
        </div>
      )}
    </section>
  );
}

function UniversalCalculator({ data, onChange, onReset }) {
  const result = useMemo(() => calculateUniversal(data), [data]);
  const status = getStatus(result);
  const StatusIcon = status.icon;

  return (
    <section className="module-shell animate-in">
      <div className="module-top">
        <div className="module-title">
          <span className="module-badge accent-violet">
            <DollarSign size={18} />
          </span>
          <div>
            <span className="eyebrow">Active Workspace</span>
            <h2>Universal Margin Studio</h2>
          </div>
        </div>

        <button type="button" onClick={onReset} className="ghost-action">
          <RefreshCcw size={16} />
          Reset Module
        </button>
      </div>

      <div className="calc-grid">
        <div className="workspace-card input-panel">
          <div className="panel-heading">
            <div>
              <span className="eyebrow">Custom SKU</span>
              <h2>Any Product Pricing</h2>
              <p>Use this for paneer, ghee, combo offers, transport charges, or new products.</p>
            </div>
            <span className="sku-pill">
              <DollarSign size={15} />
              Global
            </span>
          </div>

          <div className="fields-grid fields-grid-universal">
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
              hint="Delivery / packing / service"
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
              hint="Target profit %"
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

        <aside className="insight-panel">
          <MarginOrbit result={result} />

          <div className={`status-strip ${status.className}`}>
            <StatusIcon size={22} />
            <div>
              <strong>{status.label}</strong>
              <p>{status.message}</p>
            </div>
          </div>

          <div className="result-grid">
            <ResultTile
              label="Gross Cost"
              value={money(result.totalProductionCost)}
              note="Base + Extra Costs"
            />
            <ResultTile
              label="Target Profit"
              value={money(result.suggestedProfit)}
              note={`${toNumber(data.suggestedProfitPercent).toFixed(2)}% desired margin`}
              type="suggest"
            />
            <ResultTile
              label="Target Price"
              value={money(result.suggestedSellingPrice)}
              note="Ideal selling price"
              type="suggest"
            />
            <ResultTile
              label={result.actualProfit < 0 ? "Net Loss" : "Net Profit"}
              value={money(result.actualProfit)}
              note={`${result.actualProfitPercent.toFixed(2)}% ROI`}
              type={result.actualProfit < 0 ? "loss" : "profit"}
            />
          </div>
        </aside>
      </div>
    </section>
  );
}

export default function App() {
  const [activeModule, setActiveModule] = useState("");
  const [products, setProducts] = useState(createInitialProducts);
  const [universal, setUniversal] = useState(createEmptyUniversal);
  const [splash, setSplash] = useState(null);
  const [lastFeedbackKey, setLastFeedbackKey] = useState("");

  const activeResult = useMemo(() => {
    if (!activeModule) return null;
    if (activeModule === "universal") return calculateUniversal(universal);
    return calculateProduct(products[activeModule]);
  }, [activeModule, products, universal]);

  useEffect(() => {
    if (!splash) return;

    const duration = splash.kind === "launch" ? 760 : 1050;
    const timer = window.setTimeout(() => setSplash(null), duration);

    return () => window.clearTimeout(timer);
  }, [splash]);

  useEffect(() => {
    if (!activeModule || !activeResult || splash?.kind === "launch") return;
    if (activeResult.totalProductionCost <= 0 || activeResult.sellingPrice <= 0) return;

    const mood = activeResult.actualProfit < 0 ? "loss" : "profit";
    const key = [
      activeModule,
      mood,
      activeResult.totalProductionCost.toFixed(2),
      activeResult.sellingPrice.toFixed(2),
    ].join("-");

    if (key === lastFeedbackKey) return;

    const timer = window.setTimeout(() => {
      setLastFeedbackKey(key);
      setSplash({ type: activeModule, kind: mood });
    }, 520);

    return () => window.clearTimeout(timer);
  }, [activeModule, activeResult, lastFeedbackKey, splash]);

  const openModule = (type) => {
    setActiveModule(type);
    setLastFeedbackKey("");
    setSplash({ type, kind: "launch" });
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
    setSplash(null);
    setLastFeedbackKey("");
  };

  const topStatus = activeResult ? getStatus(activeResult) : null;

  return (
    <>
      <div className="ambient-scene" aria-hidden="true">
        <div className="mesh mesh-one" />
        <div className="mesh mesh-two" />
        <div className="mesh mesh-three" />
        <div className="liquid-grid" />
      </div>

      <SplashOverlay splash={splash} />

      <main className="app-shell">
        <nav className="top-glass">
          <div className="brand-mark">
            <span>P</span>
          </div>
          <div className="brand-copy">
            <span>Palicious</span>
            <strong>Pricing Intelligence</strong>
          </div>

          <div className="top-metrics" aria-label="Workspace status">
            <div>
              <span>Mode</span>
              <strong>{activeModule ? "Active" : "Idle"}</strong>
            </div>
            <div>
              <span>Status</span>
              <strong>{topStatus ? topStatus.label : "Ready"}</strong>
            </div>
            <div>
              <span>Session</span>
              <strong>Secure</strong>
            </div>
          </div>

          <button type="button" onClick={resetAll} className="reset-button">
            <RefreshCcw size={16} />
            Reset
          </button>
        </nav>

        <header className="hero-zone">
          <div className="hero-copy">
            <span className="eyebrow hero-eyebrow">Liquid 3D Margin Workspace</span>
            <h1>
              Premium pricing
              <span> control room</span>
              <em> for dairy growth.</em>
            </h1>
            <p>
              Fluid UI, live margin intelligence, instant loss alerts, target price
              suggestions, and mobile-first business control for Palicious.
            </p>

            <div className="hero-actions">
              <button
                type="button"
                onClick={() => openModule("buffalo")}
                className="primary-cta"
              >
                Start Pricing
                <ChevronRight size={18} />
              </button>
              <button type="button" onClick={resetAll} className="secondary-cta">
                Clean Environment
              </button>
            </div>
          </div>

          <div className="hero-visual" aria-hidden="true">
            <div className="holo-card holo-main">
              <span>Live Margin</span>
              <strong>
                {activeResult ? `${activeResult.actualProfitPercent.toFixed(1)}%` : "0.0%"}
              </strong>
              <small>{activeModule ? "Current workspace" : "Select a module"}</small>
            </div>
            <div className="holo-card holo-mini-one">
              <TrendingUp size={18} />
              <span>Profit AI</span>
            </div>
            <div className="holo-card holo-mini-two">
              <Droplets size={18} />
              <span>Dairy Ops</span>
            </div>
            <div className="holo-orbit" />
          </div>
        </header>

        <section className="module-dock" aria-label="Pricing modules">
          {MODULES.map((item) => {
            const isActive = activeModule === item.type;
            return (
              <TiltCard
                key={item.type}
                type={item.type}
                active={isActive}
                onClick={() => openModule(item.type)}
                className="module-card"
              >
                <div className="module-card-bg">
                  <img
                    src={item.image}
                    alt=""
                    loading="lazy"
                    decoding="async"
                  />
                </div>
                <div className="card-shine" />
                <div className="module-card-content">
                  <span className="module-chip">{item.metric}</span>
                  <div>
                    <strong>{item.label}</strong>
                    <small>{item.subtitle}</small>
                  </div>
                  <ChevronRight size={18} />
                </div>
              </TiltCard>
            );
          })}
        </section>

        <section className="workspace-area">
          {!activeModule ? (
            <div className="empty-state animate-in">
              <div className="empty-orb">
                <Activity size={34} />
              </div>
              <span className="eyebrow">Workspace Ready</span>
              <h2>Select a pricing module</h2>
              <p>
                Choose Buffalo, Cow, Curd, or Universal tool above. The dashboard
                will open with live cost input, profit analysis, target pricing,
                and premium animated feedback.
              </p>
            </div>
          ) : activeModule === "universal" ? (
            <UniversalCalculator
              data={universal}
              onChange={(partial) =>
                setUniversal((prev) => ({
                  ...prev,
                  ...partial,
                }))
              }
              onReset={() => setUniversal(createEmptyUniversal())}
            />
          ) : (
            <ProductCalculator
              type={activeModule}
              data={products[activeModule]}
              onChange={(partial) => updateProduct(activeModule, partial)}
              onReset={() =>
                setProducts((prev) => ({
                  ...prev,
                  [activeModule]: createEmptyProduct(),
                }))
              }
            />
          )}
        </section>

        <footer className="app-footer">
          <span>
            <strong>Palicious</strong> Enterprise Margin Workspace
          </span>
          <span>CSS 3D · Liquid Glass · Mobile First · No heavy 3D library</span>
        </footer>
      </main>
    </>
  );
}
