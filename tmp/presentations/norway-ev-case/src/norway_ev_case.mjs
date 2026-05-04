import fs from "node:fs";
import path from "node:path";
import {
  Presentation,
  PresentationFile,
  row,
  column,
  grid,
  layers,
  panel,
  text,
  image,
  shape,
  chart,
  rule,
  fill,
  hug,
  fixed,
  wrap,
  grow,
  fr,
  auto,
} from "@oai/artifact-tool";
import { Canvas } from "skia-canvas";
import { paint, stroke } from "@oai/artifact-tool/presentation-jsx";
import { drawSlideToCtx } from "@oai/artifact-tool";

const W = 1920;
const H = 1080;
const root = path.resolve(".");
const asset = (name) => path.join(root, "scratch", "assets", name);
const out = (name) => path.join(root, "output", name);
const scratch = (name) => path.join(root, "scratch", name);

function imageSource(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const contentType = ext === ".png" ? "image/png" : "image/jpeg";
  const data = fs.readFileSync(filePath).toString("base64");
  return { dataUrl: `data:${contentType};base64,${data}`, contentType };
}

const C = {
  canvas: "#F4F7F7",
  ink: "#102027",
  muted: "#59666D",
  teal: "#00A6A6",
  blue: "#2F6FBB",
  coral: "#E45A46",
  amber: "#F2B705",
  green: "#4E9F3D",
  pale: "#DDE8E6",
  white: "#FFFFFF",
  dark: "#071318",
};

const font = {
  display: "Avenir Next",
  body: "Avenir Next",
  number: "DIN Alternate",
};

const presentation = Presentation.create({ slideSize: { width: W, height: H } });

function p(hex) {
  return paint(hex);
}

function s(hex, weight = 1) {
  return stroke({ color: hex, weight });
}

function tx(value, opts = {}) {
  return text(value, {
    width: opts.width ?? fill,
    height: opts.height ?? hug,
    name: opts.name,
    style: {
      fontFamily: opts.family ?? font.body,
      fontSize: opts.size ?? 30,
      color: opts.color ?? C.ink,
      bold: opts.bold ?? false,
      italic: opts.italic ?? false,
      alignment: opts.align,
      verticalAlignment: opts.valign,
      lineSpacingMultiple: opts.line ?? 0.95,
    },
  });
}

function title(value, subtitle, source) {
  const kids = [
    tx(value, { name: "slide-title", size: 52, bold: true, width: fill, line: 0.95 }),
  ];
  if (subtitle) kids.push(tx(subtitle, { name: "subtitle", size: 29, color: C.muted, width: wrap(1540), line: 1.08 }));
  return column({ name: "title-stack", width: fill, height: hug, gap: 14 }, kids);
}

function sourceLine(value) {
  return tx(value, { name: "source", size: 12, color: "#718086", width: fill });
}

function slideBase(slide, children, source) {
  slide.compose(
    layers({ width: fill, height: fill }, [
      shape({ width: fill, height: fill, fill: p(C.canvas), line: stroke("transparent") }),
      column({ width: fill, height: fill, padding: { x: 68, y: 50 }, gap: 24 }, [
        ...children,
        source ? sourceLine(source) : tx(" ", { size: 1, color: C.canvas }),
      ]),
    ]),
    { frame: { left: 0, top: 0, width: W, height: H }, baseUnit: 8 },
  );
}

function notes(slide, value) {
  slide.speakerNotes.setText(value.trim());
}

function bar(label, value, color, width = 620) {
  return row({ width: fill, height: fixed(46), gap: 18 }, [
    tx(label, { width: fixed(190), size: 19, color: C.ink, bold: true }),
    layers({ width: fixed(width), height: fixed(38) }, [
      shape({ width: fill, height: fixed(14), fill: p("#D3DFDC"), line: stroke("transparent") }),
      row({ width: fill, height: fixed(14) }, [
        shape({ width: fixed(Math.max(8, (width * value) / 100)), height: fixed(14), fill: p(color), line: stroke("transparent") }),
        shape({ width: fill, height: fixed(14), fill: p("rgba(255,255,255,0)"), line: stroke("transparent") }),
      ]),
    ]),
    tx(`${value}%`, { width: fixed(74), size: 22, bold: true, color }),
  ]);
}

function stackBar(label, segments) {
  return column({ width: fill, height: hug, gap: 14 }, [
    row({ width: fill, height: fixed(42), gap: 16 }, [
      tx(label, { width: fixed(118), size: 30, bold: true }),
      row({ width: fixed(1260), height: fixed(34), gap: 0 }, segments.map((seg) =>
        shape({ width: fixed(seg.value * 12.6), height: fixed(34), fill: p(seg.color), line: stroke("transparent") }),
      )),
    ]),
    row({ width: fill, height: fixed(32), gap: 18 }, [
      shape({ width: fixed(118), height: fixed(1), fill: p("rgba(255,255,255,0)"), line: stroke("transparent") }),
      ...segments.map((seg) => tx(`${seg.name} ${seg.value}%`, { width: fixed(Math.max(145, seg.value * 12.6)), size: 17, color: C.muted })),
    ]),
  ]);
}

function pill(label, color = C.teal) {
  return panel({ width: hug, height: hug, padding: { x: 18, y: 8 }, fill: p(color), borderRadius: "rounded-full" },
    tx(label, { width: hug, size: 17, bold: true, color: C.white }));
}

function personCard(name, role, imgPath) {
  return row({ width: fill, height: fixed(138), gap: 20 }, [
    image({ ...imageSource(imgPath), width: fixed(104), height: fixed(138), fit: "cover", alt: name, borderRadius: 8 }),
    column({ width: fill, height: fill, gap: 4, justifyContent: "center" }, [
      tx(name, { size: 27, bold: true }),
      tx(role, { size: 20, color: C.muted, line: 1.05 }),
    ]),
  ]);
}

function addSlide1() {
  const slide = presentation.slides.add();
  slide.compose(
    layers({ width: fill, height: fill }, [
      image({ ...imageSource(asset("oslo_ev_summit.jpg")), width: fill, height: fill, fit: "cover", alt: "Electric vehicle in Oslo" }),
      shape({ width: fill, height: fill, fill: p("rgba(3,10,14,0.52)"), line: stroke("transparent") }),
      column({ width: fill, height: fill, padding: { x: 92, y: 76 }, justifyContent: "space-between" }, [
        column({ width: wrap(1020), height: hug, gap: 22 }, [
          tx("Oslo's EV Paradox", { size: 82, bold: true, color: C.white, width: wrap(1040), line: 0.92 }),
          tx("When climate policy becomes a transport governance problem", { size: 34, color: "#D7E8E5", width: wrap(980), line: 1.05 }),
          tx("Electric vehicles helped Norway and Oslo become global leaders in transport decarbonization. But once EVs became mainstream, the same policies began to create fiscal and mobility governance problems.", { size: 29, color: "#D7E8E5", width: wrap(1120), line: 1.08 }),
        ]),
        tx("Teaching case deck | Oslo and national EV policy", { size: 19, color: "#D7E8E5", width: fill }),
      ]),
    ]),
    { frame: { left: 0, top: 0, width: W, height: H }, baseUnit: 8 },
  );
  notes(slide, "Today, I do not want to present Oslo's EV policy as a simple success story. My focus is on what happens after a climate policy succeeds so well that electric vehicles become mainstream. The central question is not whether EVs are good or bad. It is whether EVs should continue to receive special treatment once they have become ordinary cars.");
}

function addSlide2() {
  const slide = presentation.slides.add();
  const data = norwayData();
  slideBase(slide, [
    grid({ width: fill, height: fill, columns: [fr(0.8), fr(1.25)], rows: [auto, fr(1)], columnGap: 58, rowGap: 20 }, [
      title("The Case Begins After Success", "By the mid-2020s, Norway had largely achieved what most countries were still struggling to do: making EVs the dominant choice in new car sales.", null),
      tx(" ", { size: 1 }),
      column({ width: fill, height: fill, gap: 28 }, [
        tx("The policy question had changed from how to promote EVs to how to govern EVs after they became mainstream.", { size: 36, bold: true, color: C.ink, width: wrap(670), line: 1.02 }),
        pill("success creates the next decision", C.coral),
      ]),
      chart({
        name: "norway-ev-share-line",
        chartType: "line",
        width: fill,
        height: fill,
        config: {
          categories: data.map((d) => String(d.year)),
          series: [{ name: "Electric share of new car sales", values: data.map((d) => d.value) }],
          yAxis: { min: 0, max: 100, numberFormatCode: "0%" },
          title: "Share of new cars sold that are electric",
        },
      }),
    ]),
  ], "Source: Our World in Data, electric-car-sales-share grapher, Norway, 2010-2024.");
  notes(slide, "I am framing the case in a way that resembles the HKS case structure. The point is not to begin with a long history, but to begin after the system has already succeeded and has started to reveal new problems. The Hubway case begins after rapid growth creates problems of expansion and rebalancing. The TransMilenio case places Mayor Garzón directly inside the political decision about whether to continue BRT expansion. My Oslo case works the same way: it begins after success, when success itself creates a governance dilemma.");
}

function addSlide3() {
  const slide = presentation.slides.add();
  slideBase(slide, [
    title("Who Faces the Decision?", "The decision now sits between national fiscal policy and Oslo's urban transport governance.", null),
    grid({ width: fill, height: fill, columns: [fr(1), fr(1)], rows: [auto, fr(1)], columnGap: 56, rowGap: 22 }, [
      row({ width: fill, height: hug, gap: 12 }, [pill("National government", C.blue)]),
      row({ width: fill, height: hug, gap: 12 }, [pill("Oslo city government", C.green)]),
      column({ width: fill, height: fill, gap: 26 }, [
        personCard("Jonas Gahr Støre", "Prime Minister: reducing EV privileges without slowing decarbonization", asset("store_conv.jpg")),
        personCard("Jens Stoltenberg", "Finance Minister: VAT, purchase tax, tax expenditures, and budget pressure", asset("stoltenberg_conv.jpg")),
        personCard("Jon-Ivar Nygård", "Transport Minister: tolls, road use, bus lanes, and vehicle governance", asset("nygard_conv.jpg")),
      ]),
      column({ width: fill, height: fill, gap: 42 }, [
        personCard("Eirik Lae Solberg", "Governing Mayor: local consequences for streets, parking, and budgets", asset("eirik.jpg")),
        personCard("Marit Vea", "Vice Mayor for Environment and Transport: buses, parking, tolls, and climate budgeting", asset("marit.jpg")),
        tx("The case is a multi-level governance problem, not only an EV problem.", { size: 34, bold: true, color: C.ink, width: wrap(820), line: 1.02 }),
      ]),
    ]),
  ], "Sources: Government.no member pages; City of Oslo city government pages.");
  notes(slide, "This case cannot be solved by one agency alone. At the national level, the Støre government faces climate targets, the tax structure, and the stability of the EV market. The finance minister has to look at VAT, purchase taxes, tax expenditures, and the budget. The transport minister has to look at tolls, road use, bus lanes, and vehicle regulation. At the city level, Oslo faces the most concrete spatial consequences: whether buses are affected, how parking and street space are allocated, and whether the toll ring can still manage traffic and finance public transport.");
}

function addSlide4() {
  const slide = presentation.slides.add();
  slideBase(slide, [
    column({ width: fill, height: fill, justifyContent: "center", gap: 18 }, [
      tx("Problem 1: Fiscal Problem", { size: 44, bold: true, color: C.muted }),
      tx("NOK 28 billion", { size: 160, bold: true, color: C.coral, family: font.number, line: 0.9 }),
      tx("estimated 2024 EV-related tax expenditures in Norway", { size: 35, width: wrap(980), color: C.ink, line: 1.0 }),
      rule({ width: fixed(360), stroke: C.coral, weight: 6 }),
      tx("When EVs were rare, tax exemptions were politically easy because the revenue loss was small. By 2024, EV success made incentive phase-out unavoidable.", { size: 34, color: C.muted, width: wrap(1250), line: 1.06 }),
    ]),
  ], "Source: Norway's first Biennial Transparency Report under the Paris Agreement, 2024.");
  notes(slide, "The first problem is fiscal. In the early period, EVs were rare, so exempting them from purchase tax, VAT, and tolls did not look like a major budget issue. But once EVs became mainstream, the incentive package was no longer a small climate-support measure. It became a national budget problem. Norway's official transparency report estimated EV-related tax expenditures at NOK 28 billion in 2024. This number matters because it shows that EV success itself made the original policy tools increasingly expensive.");
}

function addSlide5() {
  const slide = presentation.slides.add();
  slideBase(slide, [
    title("Problem 2: Mobility Problem", "EVs are cleaner, but they are still cars.", null),
    column({ width: fill, height: fill, gap: 28, justifyContent: "center" }, [
      tx("EVs reduce tailpipe emissions, but they still use road space, parking space, toll infrastructure, and sometimes bus lanes.", { size: 34, bold: true, width: wrap(1380), line: 1.05 }),
      stackBar("2009", [
        { name: "Public transport", value: 28, color: C.blue },
        { name: "Car", value: 35, color: C.coral },
        { name: "Other / walk / bike", value: 37, color: "#A9B8B5" },
      ]),
      stackBar("2018", [
        { name: "Walk", value: 27, color: C.green },
        { name: "Public transport", value: 34, color: C.blue },
        { name: "Bike", value: 6, color: C.amber },
        { name: "Car", value: 27, color: C.coral },
        { name: "Other", value: 6, color: "#A9B8B5" },
      ]),
      tx("This creates a deeper question for Oslo: can electrification support sustainable mobility, or does it preserve automobile dependency?", { size: 32, bold: true, width: wrap(1420), line: 1.05 }),
    ]),
  ], "Source: City of Oslo, Travel agent distribution, 2009 and 2018 shares.");
  notes(slide, "The second problem is mobility. EVs do reduce tailpipe emissions, but they are still cars. They still occupy road space and parking space, they still use the toll system, and they may still enter bus lanes. This matters especially in Oslo, because Oslo does not only want cleaner cars. It also wants more trips to shift toward public transport, walking, and cycling. Official Oslo statistics show that in 2018, 34 percent of daily trips used public transport, 27 percent were walking, 6 percent were cycling, and cars accounted for 27 percent. Compared with 2009, the car share fell from 35 percent to 27 percent. This shows that Oslo's transport goal is not simply vehicle substitution. It is also reducing car dependency.");
}

function addSlide6() {
  const slide = presentation.slides.add();
  slideBase(slide, [
    title("Core Teaching Question", "Should Oslo continue prioritizing rapid electrification through EV adoption, or should it shift more strongly toward reducing car dependency through public transport, walking, cycling, and street-space reallocation?", null),
    grid({ width: fill, height: fill, columns: [fr(1), auto, fr(1)], columnGap: 30 }, [
      column({ width: fill, height: fill, justifyContent: "center", gap: 18 }, [
        tx("Cleaner Cars", { size: 64, bold: true, color: C.teal, align: "center" }),
        tx("Continue prioritizing rapid electrification through EV adoption.", { size: 34, width: fill, align: "center", color: C.muted, line: 1.05 }),
      ]),
      column({ width: fixed(240), height: fill, justifyContent: "center", gap: 12 }, [
        shape({ width: fixed(6), height: fixed(190), fill: p(C.ink), line: stroke("transparent") }),
        tx("Oslo's\ndilemma", { size: 34, bold: true, align: "center", width: fixed(240), line: 0.95 }),
        shape({ width: fixed(6), height: fixed(190), fill: p(C.ink), line: stroke("transparent") }),
      ]),
      column({ width: fill, height: fill, justifyContent: "center", gap: 18 }, [
        tx("Fewer Cars", { size: 64, bold: true, color: C.coral, align: "center" }),
        tx("Shift more strongly toward public transport, walking, cycling, and street-space reallocation.", { size: 34, width: fill, align: "center", color: C.muted, line: 1.05 }),
      ]),
    ]),
  ], "");
  notes(slide, "The core teaching question is this: should Oslo continue to prioritize EV adoption, or should it begin to treat EVs more like ordinary cars within urban transport governance? In other words, should the future city be built around cleaner cars, or around fewer cars? This question will guide the three-phase analysis that follows.");
}

function addSlide7() {
  const slide = presentation.slides.add();
  slideBase(slide, [
    grid({ width: fill, height: fill, columns: [fr(0.9), fr(1.1)], columnGap: 58 }, [
      column({ width: fill, height: fill, justifyContent: "center", gap: 18 }, [
        tx("Phase 1: 1990s-2010", { size: 42, bold: true, color: C.muted }),
        tx("EV policy began as a low-risk experiment for a tiny market.", { size: 50, bold: true, width: wrap(690), line: 0.98 }),
        tx("In the early 1990s, EVs were rare, expensive, and technologically uncertain. Because the market was tiny, generous incentives created little immediate fiscal cost or transport conflict.", { size: 31, color: C.muted, width: wrap(690), line: 1.08 }),
      ]),
      image({ ...imageSource(asset("think_city.jpg")), width: fill, height: fill, fit: "cover", alt: "Think City electric car", borderRadius: 8 }),
    ]),
  ], "Image source: Wikimedia Commons, Think City electric car, CC BY 2.0.");
  notes(slide, "Phase 1 runs from the 1990s to around 2010. At this stage, EVs were not yet a mature market. They were a very small experiment. Figenbaum's research is important because it shows that Norway's EV market was not the result of a complete master plan. It developed through limited information and learning by doing. When the registration tax exemption was introduced in 1990, Norway had only about five BEVs, so the fiscal impact was almost negligible. This detail is important: because EVs were so marginal, the government could offer very generous incentives.");
}

function addSlide8() {
  const slide = presentation.slides.add();
  const events = [
    ["1990", "Purchase tax\nexemption"],
    ["1997", "Toll-road\nexemption"],
    ["1999", "Free municipal\nparking"],
    ["2001", "VAT zero-rate\nfor purchases"],
    ["2005", "Access to\nbus lanes"],
  ];
  slideBase(slide, [
    title("Phase 1 Policy Package", "The first policy package made EVs cheaper to buy, cheaper to use, and more visible in daily life.", null),
    tx("Norway exempted EVs from purchase and import taxes, reduced annual taxes, removed toll charges, offered free municipal parking, introduced VAT exemption, and later allowed EVs into bus lanes.", { size: 31, color: C.ink, width: wrap(1540), line: 1.06 }),
    row({ width: fill, height: fixed(360), alignItems: "center", gap: 20 }, events.map(([year, label], i) =>
      column({ width: grow(1), height: fixed(300), gap: 18, justifyContent: "center", alignItems: "center" }, [
        tx(year, { size: 56, bold: true, color: [C.teal, C.blue, C.green, C.coral, C.amber][i], family: font.number, align: "center" }),
        shape({ width: fill, height: fixed(7), fill: p([C.teal, C.blue, C.green, C.coral, C.amber][i]), line: stroke("transparent") }),
        tx(label, { size: 26, bold: true, align: "center", width: fill, line: 1.0 }),
      ]),
    )),
    tx("These policies did not only reduce emissions; they changed the relative convenience of driving an EV.", { size: 34, bold: true, width: wrap(1500), line: 1.04 }),
  ], "Source: Norwegian EV Association, Norwegian EV policy timeline.");
  notes(slide, "This policy package was not a single policy. It was a bundle of incentives that changed user behavior. Purchase and import tax exemptions and VAT exemption reduced the cost of buying an EV. Annual tax reductions reduced the cost of ownership. Free tolls reduced commuting costs. Free parking reduced the cost of using an EV in the city. Bus-lane access even reduced time costs. The key point is that these policies did not only reduce emissions. They changed the relative convenience and economic attractiveness of driving an EV.");
}

function addSlide9() {
  const slide = presentation.slides.add();
  slideBase(slide, [
    title("Phase 1 Interesting Detail", "Early EV policy was shaped by activism, industry pressure, and small political windows.", null),
    grid({ width: fill, height: fill, columns: [fr(1), fr(1), fr(1)], columnGap: 34 }, [
      storyStep("A-ha + Bellona", "Environmental activists and the pop group A-ha used EVs in Oslo and challenged toll and parking charges.", C.teal),
      storyStep("THINK / PIVCO", "Policymakers also wanted to support the domestic THINK/PIVCO electric vehicle experiment.", C.green),
      storyStep("VAT lobbying", "The 2001 VAT exemption entered the agenda when the estimated tax loss was still only about NOK 10 million.", C.coral),
    ]),
  ], "Sources: Figenbaum EVS36 paper; Bellona EV success story.");
  notes(slide, "This slide is meant to bring out the story rather than just list policies. Early EV policy was not only technocratic design. Bellona and A-ha were part of early EV activism. They used EVs in Oslo and challenged toll and parking charges, creating public attention. At the same time, policymakers wanted to support domestic industry experiments such as THINK and PIVCO. The 2001 VAT exemption was not simply a natural outcome of tax reform. It entered the policy agenda through lobbying by the EV Association and Bellona, and at the time the estimated tax loss from 250 BEV sales was only about NOK 10 million.");
}

function storyStep(head, body, color) {
  return column({ width: fill, height: fill, justifyContent: "center", gap: 20 }, [
    tx(head, { size: 46, bold: true, color, align: "center" }),
    shape({ width: fixed(120), height: fixed(8), fill: p(color), line: stroke("transparent") }),
    tx(body, { size: 27, color: C.muted, width: fill, align: "center", line: 1.08 }),
  ]);
}

function addSlide10() {
  const slide = presentation.slides.add();
  const steps = [
    ["Tiny EV market", C.teal],
    ["Low fiscal loss", C.blue],
    ["Low transport conflict", C.green],
    ["Generous incentives survive", C.coral],
  ];
  slideBase(slide, [
    title("Phase 1 Takeaway", "The early incentives looked harmless because EVs had not yet become a transport system issue.", null),
    tx("The same benefits that seemed small in the 1990s would become much harder to defend once EVs became common.", { size: 34, bold: true, width: wrap(1480), line: 1.05 }),
    row({ width: fill, height: fixed(330), alignItems: "center", gap: 16 }, steps.flatMap(([label, color], i) => {
      const item = column({ width: grow(1), height: fixed(300), gap: 14, justifyContent: "center", alignItems: "center" }, [
        shape({ width: fixed(74), height: fixed(74), geometry: "ellipse", fill: p(color), line: stroke("transparent") }),
        tx(label, { size: 28, bold: true, align: "center", width: fill, line: 1.0 }),
      ]);
      return i < steps.length - 1 ? [item, tx("->", { width: fixed(50), size: 42, bold: true, color: C.muted, align: "center" })] : [item];
    })),
    tx("Tax exemptions, toll exemptions, parking benefits, and bus-lane access would all become harder to defend once EVs were common.", { size: 34, color: C.muted, width: wrap(1500), line: 1.05 }),
  ], "");
  notes(slide, "The Phase 1 takeaway is that these policies looked reasonable because EVs were so rare. They were not expensive fiscally, and they did not yet create visible problems for bus lanes, parking, or toll revenue. But this is also the beginning of the paradox. If a privilege system designed for a niche technology does not adjust as the market matures, it can later become a system-level problem.");
}

function addSlide11() {
  const slide = presentation.slides.add();
  const data = norwayData().filter((d) => d.year >= 2011 && d.year <= 2019);
  slideBase(slide, [
    grid({ width: fill, height: fill, columns: [fr(1.3), fr(0.7)], columnGap: 54 }, [
      chart({
        name: "phase2-adoption-curve",
        chartType: "line",
        width: fill,
        height: fill,
        config: {
          categories: data.map((d) => String(d.year)),
          series: [{ name: "EV share", values: data.map((d) => d.value) }],
          yAxis: { min: 0, max: 60, numberFormatCode: "0%" },
          title: "Norway EV share, 2011-2019",
        },
      }),
      column({ width: fill, height: fill, justifyContent: "center", gap: 18 }, [
        tx("Phase 2: 2011-2019", { size: 38, bold: true, color: C.muted }),
        tx("EV policy moved from experimentation to national climate strategy.", { size: 46, bold: true, width: wrap(590), line: 0.98 }),
        tx("By the 2010s, EV adoption was no longer just about early adopters. Incentives were repeatedly extended, and EV ownership became an economically rational choice for ordinary households.", { size: 28, color: C.muted, width: wrap(590), line: 1.08 }),
        tx("2010: about 3,000 BEVs. By 2023: about 690,000 BEVs, roughly 24% of the passenger-car fleet.", { size: 25, color: C.ink, width: wrap(590), line: 1.06 }),
      ]),
    ]),
  ], "Source: Our World in Data, electric-car-sales-share grapher, Norway, 2011-2019.");
  notes(slide, "Phase 2 runs from 2011 to 2019. In this period, EV policy moved from experimentation to national climate strategy. In 2010, Norway had only about 3,000 BEVs, but growth accelerated quickly after that. By the end of 2023, Norway had about 690,000 BEVs, representing roughly 24 percent of the passenger-car fleet. This growth shows that the policy was no longer only helping early adopters. It was reshaping the entire new-car market.");
}

function addSlide12() {
  const slide = presentation.slides.add();
  const stairs = [
    ["2012", "Incentives kept to\n50,000 BEVs / 2015"],
    ["2015", "VAT expanded to\nleasing + batteries"],
    ["2017", "2025 zero-emission\nnew-car target"],
    ["2018", "Apartment residents'\nright to charge"],
  ];
  slideBase(slide, [
    title("Phase 2 Policy Reinforcement", "The government reinforced market confidence by extending incentives and setting long-term targets.", null),
    tx("Incentives were kept beyond the early-market stage, VAT benefits were expanded to leasing and batteries, Norway adopted a 2025 zero-emission target, and charging rights made city EV ownership more practical.", { size: 31, color: C.ink, width: wrap(1560), line: 1.06 }),
    row({ width: fill, height: fill, alignItems: "end", gap: 28 }, stairs.map(([year, label], i) =>
      column({ width: grow(1), height: fixed(240 + i * 95), gap: 14, justifyContent: "end" }, [
        tx(year, { size: 48, bold: true, family: font.number, color: [C.blue, C.teal, C.green, C.coral][i] }),
        tx(label, { size: 28, bold: true, line: 1.0 }),
        shape({ width: fill, height: fixed(18 + i * 20), fill: p([C.blue, C.teal, C.green, C.coral][i]), line: stroke("transparent") }),
      ]),
    )),
  ], "Sources: Norwegian EV Association policy page; case outline.");
  notes(slide, "This slide is about policy reinforcement. In 2012, incentives were kept until 50,000 BEVs or 2015. Later they were extended again to 2017 and then to 2020. In 2015, VAT exemption expanded to leasing and battery replacement. In 2017, Norway set the target that all new passenger cars and light vans should be zero-emission by 2025. In 2018, the policy agenda also strengthened the right to charge for apartment residents. This detail matters because it shows that EV policy was no longer only for people with private garages. It began to address urban residents' practical charging needs.");
}

function addSlide13() {
  const slide = presentation.slides.add();
  slideBase(slide, [
    column({ width: fill, height: fill, justifyContent: "center", alignItems: "center", gap: 18 }, [
      tx("Phase 2: Why It Worked", { size: 44, bold: true, color: C.muted, align: "center" }),
      tx("84%", { size: 196, bold: true, color: C.teal, family: font.number, align: "center", line: 0.86 }),
      tx("of Norwegian BEV owners said VAT and purchase-tax exemptions alone were sufficient reasons to buy a BEV.", { size: 35, width: wrap(1200), align: "center", line: 1.02 }),
      tx("The incentives worked because they changed household economics, not only environmental attitudes.", { size: 32, color: C.muted, align: "center" }),
    ]),
  ], "Source: Bjerkan et al. incentive study, cited in Figenbaum / World Electric Vehicle Journal literature.");
  notes(slide, "This is the key data point for Phase 2. We should not explain Norway's EV adoption only by saying that Norwegians are environmentally minded. Bjerkan, Nørbech, and Nordtømme found that purchase tax and VAT exemptions were the most important incentives. For 84 percent of BEV owners, VAT and purchase-tax exemptions alone were sufficient reasons to buy a BEV. This means the policy changed household economics. EVs were not only an environmental choice. They became the more economically rational choice.");
}

function addSlide14() {
  const slide = presentation.slides.add();
  slideBase(slide, [
    grid({ width: fill, height: fill, columns: [fr(0.85), fr(1.15)], columnGap: 54 }, [
      column({ width: fill, height: fill, justifyContent: "center", gap: 24 }, [
        tx("Phase 2 Turning Point", { size: 44, bold: true }),
        compareLine("Early stage", "Bus-lane access was originally a symbolic and practical reward for early adopters.", C.green),
        compareLine("Mass stage", "As EV numbers grew, the same privilege began to compete with public transport priority and street-space allocation.", C.coral),
        tx("Greater Oslo surveys later found rising opposition to toll exemptions, no-passenger bus-lane access, and free parking.", { size: 26, color: C.muted, width: wrap(660), line: 1.05 }),
      ]),
      image({ ...imageSource(asset("bus_lane_ev.jpg")), width: fill, height: fill, fit: "cover", alt: "Norwegian bus/taxi lane sign allowing EVs", borderRadius: 8 }),
    ]),
  ], "Image/source: Norwegian EV Association article on EV access and bus-lane signage.");
  notes(slide, "The bus lane is the turning point because it makes the urban mobility problem visible. In the early stage, bus-lane access was a smart incentive: it gave early adopters a visible reward, and because EV numbers were low, buses were not delayed. But as EV numbers grew, the same incentive changed its meaning. It was no longer just a climate incentive. It became street-space allocation. Aasness and Odeck argued in 2015 that EV incentives promoted EV use and emission reductions, but also created adverse effects, including sizable toll revenue loss and possible impacts on bus efficiency. Later surveys in Greater Oslo from 2014 to 2020 found rising opposition to toll exemptions, bus-lane access without passengers, and free public parking, with a sample of 6,363 people.");
}

function compareLine(head, body, color) {
  return row({ width: fill, height: hug, gap: 18 }, [
    shape({ width: fixed(12), height: fixed(112), fill: p(color), line: stroke("transparent") }),
    column({ width: fill, height: hug, gap: 4 }, [
      tx(head, { size: 30, bold: true, color }),
      tx(body, { size: 27, color: C.muted, width: wrap(670), line: 1.08 }),
    ]),
  ]);
}

function addSlide15() {
  const slide = presentation.slides.add();
  slideBase(slide, [
    column({ width: fill, height: fill, justifyContent: "center", gap: 20 }, [
      tx("Phase 3: 2020-Present", { size: 44, bold: true, color: C.muted }),
      tx("88.9% -> 95.9%", { size: 148, bold: true, color: C.green, family: font.number, line: 0.86 }),
      tx("fully electric share of new car sales in Norway, 2024 to 2025.", { size: 38, width: wrap(1120), line: 1.0 }),
      rule({ width: fixed(420), stroke: C.green, weight: 6 }),
      tx("Once EVs became normal, special treatment became harder to justify. At this stage, EVs were no longer a fragile niche technology, but a mainstream part of the car market.", { size: 34, bold: true, color: C.ink, width: wrap(1380), line: 1.05 }),
    ]),
  ], "Sources: Reuters / OFV, 2024 figure; OFV, 2025 annual registrations.");
  notes(slide, "Phase 3 runs from 2020 to the present. At this point, the policy problem changes fundamentally. In 2024, 88.9 percent of new passenger cars sold in Norway were fully electric. In 2025, the share reached 95.9 percent. This means EVs are no longer a niche technology. They are the mainstream of the new-car market. Policy can no longer assume that EVs are a fragile technology that needs permanent special protection.");
}

function addSlide16() {
  const slide = presentation.slides.add();
  const events = [
    ["2023", "25% VAT above\nNOK 500,000"],
    ["2023", "Weight-based\npurchase tax"],
    ["2023+", "EV tolls may reach\n70% of ICEV rates"],
    ["2024+", "Ownership benefits\nscaled back"],
  ];
  slideBase(slide, [
    title("Phase 3 Policy Changes", "Norway began to normalize EVs through taxes, tolls, and benefit reductions.", null),
    tx("From 2023, EVs began paying 25% VAT on the portion of the purchase price above NOK 500,000, a weight-based purchase tax was introduced, toll benefits were reduced, and several ownership-related advantages were scaled back.", { size: 31, color: C.ink, width: wrap(1560), line: 1.06 }),
    row({ width: fill, height: fill, alignItems: "center", gap: 22 }, events.map(([year, label], i) =>
      column({ width: grow(1), height: fixed(390), justifyContent: "center", gap: 16, alignItems: "center" }, [
        tx(year, { size: 52, bold: true, color: [C.coral, C.amber, C.blue, C.muted][i], family: font.number, align: "center" }),
        shape({ width: fill, height: fixed(8), fill: p([C.coral, C.amber, C.blue, C.muted][i]), line: stroke("transparent") }),
        tx(label, { size: 27, bold: true, align: "center", width: fill, line: 1.0 }),
      ]),
    )),
  ], "Source: Norwegian EV Association policy page; EAFO summaries of incentives and legislation.");
  notes(slide, "This slide shows the concrete policy changes. From 2023, EVs were no longer fully exempt from VAT. The portion of the purchase price above NOK 500,000 became subject to 25 percent VAT. The same year, Norway introduced a weight-based purchase tax. The Norwegian EV Association policy table also shows that the era of free toll roads is over. From 2018 to 2022, EV toll charges could reach up to 50 percent of the rate for internal-combustion vehicles, and after 2023 they could rise to 70 percent. These changes do not mean the government is anti-EV. They show that the government is beginning to normalize EVs and make them bear more fiscal and road-use costs.");
}

function addSlide17() {
  const slide = presentation.slides.add();
  slideBase(slide, [
    grid({ width: fill, height: fill, columns: [fr(0.65), fr(1.35)], columnGap: 50 }, [
      column({ width: fill, height: fill, justifyContent: "center", gap: 18 }, [
        tx("Phase 3 Dilemma", { size: 42, bold: true, color: C.muted }),
        tx("Recalibration is necessary, but removing incentives too quickly also creates risk.", { size: 40, bold: true, width: wrap(590), line: 0.98 }),
        tx("A TØI report for the City of Oslo found that full VAT or full toll rates for EVs could make some households choose combustion cars instead.", { size: 28, color: C.muted, width: wrap(590), line: 1.05 }),
      ]),
      chart({
        name: "toi-scenario-bars",
        chartType: "bar",
        width: fill,
        height: fill,
        config: {
          categories: ["Full VAT", "Full toll", "70% toll + purchase taxes"],
          series: [{ name: "2030 emissions increase", values: [25, 29, 22] }],
          yAxis: { min: 0, max: 35, numberFormatCode: "0%" },
          title: "Selected TØI scenarios: 2030 emissions effect",
        },
      }),
    ]),
  ], "Source: TØI report 1986/2023 summary, Figure S.1 and scenario text.");
  notes(slide, "This slide is important because it prevents the case from becoming a simple argument that EV privileges should just be removed. A TØI report commissioned by the City of Oslo found that if full VAT or full toll rates increase the cost of owning and using an EV, some households may choose internal-combustion cars instead. As a result, passenger-car emissions in 2030 could be higher than the baseline. Full VAT could increase emissions by about 25 percent, and full toll rates by almost 29 percent. This is the real policy dilemma: keeping benefits too long creates fiscal and mobility problems, but removing them too quickly may slow decarbonization.");
}

function addSlide18() {
  const slide = presentation.slides.add();
  slideBase(slide, [
    title("Final Decision", "Oslo's decision is not simply whether to support EVs, but which EV privileges still serve public value.", null),
    grid({ width: fill, height: fixed(570), columns: [fr(1), fr(1), fr(1)], columnGap: 28 }, [
      decisionCol("Keep strong support", "Protect rapid decarbonization and avoid slowing ICE replacement.", "Risk: fiscal pressure and private car dependency.", C.green),
      decisionCol("Normalize EVs", "Treat EVs as ordinary cars for taxes, tolls, parking, and street space.", "Risk: adoption slows and emissions rebound.", C.coral),
      decisionCol("Differentiate by public value", "Support taxis, freight, apartment charging, and affordable EVs.", "Remove privileges that reinforce private car dependency.", C.teal),
    ]),
    tx("Final question: Should Oslo's future be built around cleaner cars, or fewer cars?", { size: 38, bold: true, width: wrap(1380), line: 1.02 }),
  ], "");
  notes(slide, "The final decision is not simply pro-EV or anti-EV. EVs have already succeeded. The question is how to govern the next stage. One option is to keep strong EV support in order to protect rapid decarbonization, but the risk is fiscal pressure and continued car dependency. A second option is to normalize EVs as ordinary cars, which supports fairness and transport discipline, but may slow replacement of internal-combustion vehicles. A third option, which I think is the most useful for classroom discussion, is to differentiate incentives by public value: continue supporting taxis, freight, apartment charging, and affordable EVs, while gradually removing private-EV privileges in tolls, parking, and bus lanes that reinforce car dependency. In this framing, Oslo's question changes from how to promote electric cars to how cleaner cars can fit into a less car-dependent city.");
}

function decisionCol(head, body, foot, color) {
  return column({ width: fill, height: fill, gap: 18 }, [
    shape({ width: fill, height: fixed(10), fill: p(color), line: stroke("transparent") }),
    tx(head, { size: 35, bold: true, color }),
    tx(body, { size: 29, color: C.ink, width: fill, line: 1.05 }),
    tx(foot, { size: 25, color: C.muted, width: fill, line: 1.05 }),
  ]);
}

function norwayData() {
  return [
    { year: 2010, value: 0.28 },
    { year: 2011, value: 1.4 },
    { year: 2012, value: 3.1 },
    { year: 2013, value: 5.8 },
    { year: 2014, value: 15.0 },
    { year: 2015, value: 22.0 },
    { year: 2016, value: 29.0 },
    { year: 2017, value: 39.0 },
    { year: 2018, value: 49.0 },
    { year: 2019, value: 56.0 },
    { year: 2020, value: 75.0 },
    { year: 2021, value: 86.0 },
    { year: 2022, value: 89.0 },
    { year: 2023, value: 90.0 },
    { year: 2024, value: 92.0 },
  ];
}

[
  addSlide1,
  addSlide2,
  addSlide3,
  addSlide4,
  addSlide5,
  addSlide6,
  addSlide7,
  addSlide8,
  addSlide9,
  addSlide10,
  addSlide11,
  addSlide12,
  addSlide13,
  addSlide14,
  addSlide15,
  addSlide16,
  addSlide17,
  addSlide18,
].forEach((fn) => fn());

const pptxBlob = await PresentationFile.exportPptx(presentation);
await pptxBlob.save(out("output.pptx"));

fs.mkdirSync(scratch("previews"), { recursive: true });
for (const [i, slide] of presentation.slides.items.entries()) {
  const canvas = new Canvas(W, H);
  const ctx = canvas.getContext("2d");
  await drawSlideToCtx(slide, presentation, ctx, null, null, null, null, null, null, null, {});
  await canvas.toFile(scratch(`previews/slide-${String(i + 1).padStart(2, "0")}.png`));
}

console.log(JSON.stringify({
  pptx: out("output.pptx"),
  preview_dir: scratch("previews"),
  slide_count: presentation.slides.items.length,
}, null, 2));
