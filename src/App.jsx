import { useEffect, useMemo, useState } from "react";
import "./App.css";

const CONFIG = {
  buffalo: {
    title: "Buffalo Milk",
    shortTitle: "Buffalo",
    emoji: "🐃",
    accent: "green",
    baseMl: 1000,
    costLabel: "Principal milk cost per 1 litre",
    unitOptions: [
      { label: "500 ml", value: 500 },
      { label: "1 litre", value: 1000 },
    ],
    packetOptions: [
      { label: "500 ml packet", value: 500 },
      { label: "1 litre packet", value: 1000 },
    ],
  },
  cow: {
    title: "Cow Milk",
    shortTitle: "Cow",
    emoji: "🐄",
    accent: "orange",
    baseMl: 1000,
    costLabel: "Principal milk cost per 1 litre",
    unitOptions: [
      { label: "500 ml", value: 500 },
      { label: "1 litre", value: 1000 },
    ],
    packetOptions: [
      { label: "500 ml packet", value: 500 },
      { label: "1 litre packet", value: 1000 },
    ],
  },
  curd: {
    title: "Curd",
    shortTitle: "Curd",
    emoji: "🥣",
    accent: "cream",
    baseMl: 500,
    costLabel: "Principal curd cost per 500 ml",
    unitOptions: [
      { label: "250 ml", value: 250 },
      { label: "500 ml", value: 500 },
    ],
    packetOptions: [
      { label: "250 ml packet", value: 250 },
      { label: "500 ml packet", value: 500 },
    ],
  },
};

const DEFAULT_PRODUCTS = {
  buffalo: {
    unitMl: 500,
    packetMl: 500,
    baseCost: 42,
    packetCost: 2.5,
    extraCost: 3,
    marginPercent: 25,
    sellingPrice: 60,
  },
  cow: {
    unitMl: 500,
    packetMl: 500,
    baseCost: 35,
    packetCost: 2.5,
    extraCost: 3,
    marginPercent: 25,
    sellingPrice: 50,
  },
  curd: {
    unitMl: 250,
    packetMl: 250,
    baseCost: 20,
    packetCost: 2,
    extraCost: 2,
    marginPercent: 30,
    sellingPrice: 35,
  },
};

const DEFAULT_UNIVERSAL = {
  principalCost: 100,
  marginPercent: 30,
  sellingPrice: 140,
};

const STORAGE_KEY = "paliciousPremiumCalculatorV2";

function money(value) {
  const number = Number(value || 0);
  return `₹${number.toFixed(2)}`;
}

function numberValue(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function calculateProduct(config, data) {
  const quantityFactor = numberValue(data.unitMl) / config.baseMl;
  const productPrincipalCost = numberValue(data.baseCost) * quantityFactor;
  const packetPrintingCost = numberValue(data.packetCost);
  const extraCost = numberValue(data.extraCost);

  const totalPrincipalCost =
    productPrincipalCost + packetPrintingCost + extraCost;

  const marginCost =
    totalPrincipalCost * (numberValue(data.marginPercent) / 100);

  const suggestedSellingPrice = totalPrincipalCost + marginCost;

  const sellingPrice = numberValue(data.sellingPrice);
  const actualProfit = sellingPrice - totalPrincipalCost;

  const profitPercent =
    totalPrincipalCost > 0 ? (actualProfit / totalPrincipalCost) * 100 : 0;

  const lossAmount = actualProfit < 0 ? Math.abs(actualProfit) : 0;

  return {
    productPrincipalCost,
    packetPrintingCost,
    extraCost,
    totalPrincipalCost,
    marginCost,
    suggestedSellingPrice,
    sellingPrice,
    actualProfit,
    profitPercent,
    lossAmount,
  };
}

function calculateUniversal(data) {
  const principalCost = numberValue(data.principalCost);
  const marginCost = principalCost * (numberValue(data.marginPercent) / 100);
  const suggestedSellingPrice = principalCost + marginCost;
  const sellingPrice = numberValue(data.sellingPrice);
  const actualProfit = sellingPrice - principalCost;
  const profitPercent =
    principalCost > 0 ? (actualProfit / principalCost) * 100 : 0;

  return {
    principalCost,
    marginCost,
    suggestedSellingPrice,
    sellingPrice,
    actualProfit,
    profitPercent,
  };
}

function getProfitLabel(profitPercent, actualProfit) {
  if (actualProfit < 0) return "Loss";
  if (profitPercent >= 100) return "Excellent";
  if (profitPercent >= 40) return "Strong";
  if (profitPercent >= 20) return "Healthy";
  return "Low Margin";
}

function Field({ label, value, onChange, type = "number", suffix, hint }) {
  return (
    <label className="field">
      <span>{label}</span>
      <div className="inputWrap">
        <input
          type={type}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          min="0"
          step="0.01"
        />
        {suffix ? <b>{suffix}</b> : null}
      </div>
      {hint ? <small>{hint}</small> : null}
    </label>
  );
}

function SelectField({ label, value, options, onChange }) {
  return (
    <label className="field">
      <span>{label}</span>
      <select value={value} onChange={(event) => onChange(event.target.value)}>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function StatPill({ label, value }) {
  return (
    <div className="statPill">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function ResultBox({ label, value, sub, type = "" }) {
  return (
    <div className={`resultBox ${type}`}>
      <span>{label}</span>
      <strong>{value}</strong>
      {sub ? <small>{sub}</small> : null}
    </div>
  );
}

function ProductCalculator({ type, data, onUpdate, onReset }) {
  const config = CONFIG[type];
  const result = calculateProduct(config, data);
  const isProfit = result.actualProfit >= 0;
  const profitLabel = getProfitLabel(result.profitPercent, result.actualProfit);

  return (
    <section className={`calcCard ${config.accent}`} id={type}>
      <div className="cardTop">
        <div className="titleBlock">
          <p className="eyebrow">Palicious Product Calculator</p>
          <h2>
            <span className="emojiBubble">{config.emoji}</span>
            {config.title}
          </h2>
          <p>
            Calculate product principal cost, printing packet cost, margin, and
            real selling profit.
          </p>
        </div>

        <div className="cardActions">
          <div className={isProfit ? "status good" : "status bad"}>
            {profitLabel}
          </div>

          <button className="miniResetBtn" type="button" onClick={onReset}>
            Reset this section
          </button>
        </div>
      </div>

      <div className="quickStats">
        <StatPill label="Selected quantity" value={`${data.unitMl} ml`} />
        <StatPill label="Packet size" value={`${data.packetMl} ml`} />
        <StatPill label="Cost base" value={money(data.baseCost)} />
        <StatPill label="Selling price" value={money(result.sellingPrice)} />
      </div>

      <div className="formGrid">
        <SelectField
          label="Product quantity"
          value={data.unitMl}
          options={config.unitOptions}
          onChange={(value) => onUpdate({ unitMl: Number(value) })}
        />

        <SelectField
          label="Printing packet size"
          value={data.packetMl}
          options={config.packetOptions}
          onChange={(value) => onUpdate({ packetMl: Number(value) })}
        />

        <Field
          label={config.costLabel}
          value={data.baseCost}
          onChange={(value) => onUpdate({ baseCost: value })}
          hint="Enter your raw milk/curd principal cost"
        />

        <Field
          label="Packet / printing press cost"
          value={data.packetCost}
          onChange={(value) => onUpdate({ packetCost: value })}
          hint="Packet, label, sticker, or pouch printing cost"
        />

        <Field
          label="Extra cost"
          value={data.extraCost}
          onChange={(value) => onUpdate({ extraCost: value })}
          hint="Delivery / labour / wastage / handling"
        />

        <Field
          label="Desired margin"
          value={data.marginPercent}
          onChange={(value) => onUpdate({ marginPercent: value })}
          suffix="%"
          hint="Margin you want above principal cost"
        />

        <Field
          label="Actual selling price"
          value={data.sellingPrice}
          onChange={(value) => onUpdate({ sellingPrice: value })}
          hint="Final customer price"
        />
      </div>

      <div className="formulaNote">
        <strong>Formula:</strong> Principal cost + packet cost + extra cost +
        margin = suggested selling price.
      </div>

      <div className="resultGrid">
        <ResultBox
          label="Product principal cost"
          value={money(result.productPrincipalCost)}
        />

        <ResultBox label="Packet cost" value={money(result.packetPrintingCost)} />

        <ResultBox
          label="Total principal cost"
          value={money(result.totalPrincipalCost)}
        />

        <ResultBox label="Margin cost" value={money(result.marginCost)} />

        <ResultBox
          label="Suggested selling price"
          value={money(result.suggestedSellingPrice)}
          type="highlight"
        />

        <ResultBox
          label={isProfit ? "Actual profit" : "Actual loss"}
          value={money(result.actualProfit)}
          sub={`${result.profitPercent.toFixed(2)}%`}
          type={isProfit ? "profit" : "loss"}
        />
      </div>
    </section>
  );
}

function UniversalCalculator({ data, onUpdate, onReset }) {
  const result = useMemo(() => calculateUniversal(data), [data]);
  const isProfit = result.actualProfit >= 0;
  const profitLabel = getProfitLabel(result.profitPercent, result.actualProfit);

  return (
    <section className="calcCard universal" id="universal">
      <div className="cardTop">
        <div className="titleBlock">
          <p className="eyebrow">Universal Palicious Tool</p>
          <h2>
            <span className="emojiBubble">📊</span>
            Margin + Profit Calculator
          </h2>
          <p>
            Use this for ghee, paneer, buttermilk, combo packs, bottles, labels,
            or any future Palicious product.
          </p>
        </div>

        <div className="cardActions">
          <div className={isProfit ? "status good" : "status bad"}>
            {profitLabel}
          </div>

          <button className="miniResetBtn" type="button" onClick={onReset}>
            Reset this section
          </button>
        </div>
      </div>

      <div className="formGrid universalGrid">
        <Field
          label="Total principal cost"
          value={data.principalCost}
          onChange={(value) => onUpdate({ principalCost: value })}
          hint="Total product cost before profit"
        />

        <Field
          label="Desired margin"
          value={data.marginPercent}
          onChange={(value) => onUpdate({ marginPercent: value })}
          suffix="%"
          hint="Your target margin percentage"
        />

        <Field
          label="Actual selling price"
          value={data.sellingPrice}
          onChange={(value) => onUpdate({ sellingPrice: value })}
          hint="Price charged to customer"
        />
      </div>

      <div className="resultGrid universalResults">
        <ResultBox label="Margin cost" value={money(result.marginCost)} />

        <ResultBox
          label="Suggested selling price"
          value={money(result.suggestedSellingPrice)}
          type="highlight"
        />

        <ResultBox
          label={isProfit ? "Actual profit" : "Actual loss"}
          value={money(result.actualProfit)}
          sub={`${result.profitPercent.toFixed(2)}%`}
          type={isProfit ? "profit" : "loss"}
        />
      </div>
    </section>
  );
}

function App() {
  const [products, setProducts] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (!saved) return DEFAULT_PRODUCTS;

      const parsed = JSON.parse(saved);
      return parsed.products || DEFAULT_PRODUCTS;
    } catch {
      return DEFAULT_PRODUCTS;
    }
  });

  const [universal, setUniversal] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (!saved) return DEFAULT_UNIVERSAL;

      const parsed = JSON.parse(saved);
      return parsed.universal || DEFAULT_UNIVERSAL;
    } catch {
      return DEFAULT_UNIVERSAL;
    }
  });

  const totals = useMemo(() => {
    const productResults = Object.keys(products).map((key) =>
      calculateProduct(CONFIG[key], products[key])
    );

    const principal = productResults.reduce(
      (sum, item) => sum + item.totalPrincipalCost,
      0
    );

    const profit = productResults.reduce(
      (sum, item) => sum + item.actualProfit,
      0
    );

    const suggested = productResults.reduce(
      (sum, item) => sum + item.suggestedSellingPrice,
      0
    );

    return {
      principal,
      profit,
      suggested,
      products: productResults.length,
    };
  }, [products]);

  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        products,
        universal,
      })
    );
  }, [products, universal]);

  function updateProduct(type, partial) {
    setProducts((prev) => ({
      ...prev,
      [type]: {
        ...prev[type],
        ...partial,
      },
    }));
  }

  function resetProduct(type) {
    const confirmReset = window.confirm(`Reset ${CONFIG[type].title} values?`);
    if (!confirmReset) return;

    setProducts((prev) => ({
      ...prev,
      [type]: DEFAULT_PRODUCTS[type],
    }));
  }

  function resetUniversal() {
    const confirmReset = window.confirm("Reset Universal calculator values?");
    if (!confirmReset) return;

    setUniversal(DEFAULT_UNIVERSAL);
  }

  function resetAll() {
    const confirmReset = window.confirm(
      "Reset all Palicious calculator values?"
    );
    if (!confirmReset) return;

    setProducts(DEFAULT_PRODUCTS);
    setUniversal(DEFAULT_UNIVERSAL);
    localStorage.removeItem(STORAGE_KEY);
  }

  return (
    <main className="app">
      <header className="hero">
        <div className="heroContent">
          <p className="brandTag">Palicious Internal Business Tool</p>
          <h1>Milk Delivery Pricing Calculator</h1>
          <p>
            Premium calculator for buffalo milk, cow milk, curd, packet printing
            cost, principal cost, margin, suggested price, and real profit.
          </p>

          <div className="heroButtons">
            <a href="#buffalo">Buffalo</a>
            <a href="#cow">Cow</a>
            <a href="#curd">Curd</a>
            <a href="#universal">Universal</a>
          </div>
        </div>

        <div className="heroPanel">
          <span>Today’s pricing overview</span>
          <strong>{money(totals.profit)}</strong>
          <small>Total sample profit from active product cards</small>

          <button className="resetBtn" type="button" onClick={resetAll}>
            Reset all values
          </button>
        </div>
      </header>

      <section className="summaryStrip">
        <div>
          <span>Products</span>
          <strong>{totals.products}</strong>
          <small>Milk + curd sections</small>
        </div>

        <div>
          <span>Total principal</span>
          <strong>{money(totals.principal)}</strong>
          <small>Combined sample cost</small>
        </div>

        <div>
          <span>Suggested total</span>
          <strong>{money(totals.suggested)}</strong>
          <small>Recommended price total</small>
        </div>

        <div>
          <span>Sample profit</span>
          <strong>{money(totals.profit)}</strong>
          <small>Based on selling price</small>
        </div>
      </section>

      <ProductCalculator
        type="buffalo"
        data={products.buffalo}
        onUpdate={(partial) => updateProduct("buffalo", partial)}
        onReset={() => resetProduct("buffalo")}
      />

      <ProductCalculator
        type="cow"
        data={products.cow}
        onUpdate={(partial) => updateProduct("cow", partial)}
        onReset={() => resetProduct("cow")}
      />

      <ProductCalculator
        type="curd"
        data={products.curd}
        onUpdate={(partial) => updateProduct("curd", partial)}
        onReset={() => resetProduct("curd")}
      />

      <UniversalCalculator
        data={universal}
        onUpdate={(partial) =>
          setUniversal((prev) => ({
            ...prev,
            ...partial,
          }))
        }
        onReset={resetUniversal}
      />

      <footer className="footer">
        <strong>Palicious</strong>
        <span>Farm fresh dairy pricing and profit system</span>
      </footer>
    </main>
  );
}

export default App;