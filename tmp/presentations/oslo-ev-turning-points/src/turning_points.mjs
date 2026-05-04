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
  rule,
  fill,
  hug,
  fixed,
  wrap,
  grow,
  fr,
} from "@oai/artifact-tool";
import { paint, stroke } from "@oai/artifact-tool/presentation-jsx";
import { Canvas } from "skia-canvas";
import { drawSlideToCtx } from "@oai/artifact-tool";

const W = 1920;
const H = 1080;
const root = path.resolve(".");
const asset = (name) => path.join(root, "scratch", "assets", name);
const out = (name) => path.join(root, "output", name);
const scratch = (name) => path.join(root, "scratch", name);

const C = {
  canvas: "#F4F7F7",
  ink: "#102027",
  muted: "#5D6A70",
  teal: "#00A6A6",
  blue: "#2F6FBB",
  coral: "#E45A46",
  amber: "#F2B705",
  green: "#4E9F3D",
  pale: "#DCE8E6",
  white: "#FFFFFF",
};

const font = {
  body: "Avenir Next",
  number: "DIN Alternate",
};

const presentation = Presentation.create({ slideSize: { width: W, height: H } });

function imageSource(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const contentType = ext === ".png" ? "image/png" : "image/jpeg";
  return {
    dataUrl: `data:${contentType};base64,${fs.readFileSync(filePath).toString("base64")}`,
    contentType,
  };
}

function tx(value, opts = {}) {
  return text(value, {
    name: opts.name,
    width: opts.width ?? fill,
    height: opts.height ?? hug,
    style: {
      fontFamily: opts.family ?? font.body,
      fontSize: opts.size ?? 28,
      color: opts.color ?? C.ink,
      bold: opts.bold ?? false,
      alignment: opts.align,
      verticalAlignment: opts.valign,
      lineSpacingMultiple: opts.line ?? 1.02,
    },
  });
}

function base(slide, children, source) {
  slide.compose(
    layers({ width: fill, height: fill }, [
      shape({ width: fill, height: fill, fill: paint(C.canvas), line: stroke("transparent") }),
      column({ width: fill, height: fill, padding: { x: 64, y: 46 }, gap: 20 }, [
        ...children,
        source ? tx(source, { size: 12, color: "#748287", width: fill }) : tx(" ", { size: 1, color: C.canvas }),
      ]),
    ]),
    { frame: { left: 0, top: 0, width: W, height: H }, baseUnit: 8 },
  );
}

function title(head, sub) {
  return column({ width: fill, height: hug, gap: 10 }, [
    tx(head, { size: 50, bold: true, line: 0.95 }),
    sub ? tx(sub, { size: 28, color: C.muted, width: wrap(1520), line: 1.06 }) : tx(" ", { size: 1 }),
  ]);
}

function notes(slide, value) {
  slide.speakerNotes.setText(value.trim());
}

function compareCell(head, rows, color) {
  return column({ width: fill, height: fill, gap: 12 }, [
    tx(head, { size: 32, bold: true, color }),
    rule({ width: fill, stroke: color, weight: 5 }),
    ...rows.map((r) => tx(r, { size: 24, color: C.ink, width: fill, line: 1.05 })),
  ]);
}

function timeline(items) {
  return row({ width: fill, height: fixed(112), gap: 8, alignItems: "center" }, items.flatMap((item, i) => {
    const color = [C.teal, C.blue, C.coral, C.green][i];
    const block = column({ width: grow(1), height: fixed(112), gap: 8, justifyContent: "center" }, [
      tx(item.year, { size: 31, bold: true, color, align: "center", family: font.number }),
      shape({ width: fill, height: fixed(6), fill: paint(color), line: stroke("transparent") }),
      tx(item.label, { size: 17, bold: true, align: "center", width: fill, line: 1.0 }),
    ]);
    return i < items.length - 1
      ? [block, tx("->", { width: fixed(38), size: 31, bold: true, color: C.muted, align: "center" })]
      : [block];
  }));
}

function evidenceCol(head, lines, bottom, color) {
  return column({ width: fill, height: fill, gap: 12 }, [
    tx(head, { size: 33, bold: true, color }),
    rule({ width: fill, stroke: color, weight: 5 }),
    ...lines.map((line) => tx(line, { size: 25, color: C.ink, width: fill, line: 1.06 })),
    tx(bottom, { size: 25, bold: true, color, width: fill, line: 1.04 }),
  ]);
}

function addSlide14() {
  const slide = presentation.slides.add();
  base(slide, [
    title(
      "Turning Point I: The Bus Lane Revealed the First Mobility Conflict",
      "Bus-lane access was originally a powerful reward for early EV adopters, but as EV numbers increased, the same privilege began to compete with public transport priority.",
    ),
    grid({ width: fill, height: fill, columns: [fr(0.92), fr(1.08)], columnGap: 36 }, [
      column({ width: fill, height: fill, gap: 16 }, [
        tx("In 2003, EVs were allowed into selected bus lanes in the greater Oslo region; in 2005, the privilege became national.", { size: 27, color: C.ink, width: fill, line: 1.06 }),
        tx("The incentive worked because it offered something more valuable than abstract climate symbolism: time savings.", { size: 28, bold: true, color: C.ink, width: fill, line: 1.05 }),
        tx("For commuters on congested corridors into Oslo, driving an EV could mean bypassing traffic.", { size: 25, color: C.muted, width: fill, line: 1.06 }),
        tx("Aasness and Odeck found adverse effects, including transit-lane delay and a sizable toll-revenue loss; they identified toll exemption as the most serious adverse effect.", { size: 25, color: C.ink, width: fill, line: 1.06 }),
        panel({ width: fill, height: hug, padding: { x: 20, y: 14 }, fill: paint("#E7F1EF"), borderRadius: 8 },
          tx("Takeaway: The bus lane was where EV policy stopped being only a climate incentive and became a street-space conflict.", { size: 29, bold: true, color: C.ink, width: fill, line: 1.05 })),
      ]),
      column({ width: fill, height: fill, gap: 18 }, [
        image({ ...imageSource(asset("bus_lane_ev.jpg")), width: fill, height: fixed(360), fit: "cover", alt: "Norwegian public transport lane sign allowing EVs", borderRadius: 8 }),
        grid({ width: fill, height: fixed(210), columns: [fr(1), fr(1)], columnGap: 24 }, [
          compareCell("Early stage", ["Few EVs", "Bus-lane access rewards adoption", "Climate incentive"], C.green),
          compareCell("Mass stage", ["Many EVs", "Bus-lane access competes with buses", "Street-space conflict"], C.coral),
        ]),
        timeline([
          { year: "2003", label: "Oslo-region test" },
          { year: "2005", label: "national access" },
          { year: "2015", label: "restrictions begin" },
          { year: "2024", label: "Oslo/Akershus ban" },
        ]),
        tx("EV access to public transport lanes was revoked on national and European highways in Oslo and Akershus from May 6, 2024.", { size: 18, color: C.muted, width: fill, line: 1.05 }),
      ]),
    ]),
  ], "Sources: Aasness & Odeck; TØI report 2064/2024 summary; Norwegian EV Association policy timeline.");
  notes(slide, "This slide is the first turning point in the case. So far, we have seen how EV policy made electric cars cheaper, more convenient, and more predictable. But the bus lane shows us for the first time that EV policy was no longer only vehicle policy. It was beginning to affect urban road space.\n\nAt the beginning, this policy was very smart. There were few EVs, so allowing EVs into bus lanes did not seriously delay buses, but it gave early adopters a very direct benefit: saving commuting time. For commuters around Oslo, that was more attractive than abstract environmental symbolism.\n\nThe problem emerged after EV numbers grew. When more private EVs used the bus lane, the policy shifted from a climate incentive into competition with public transport priority. Aasness and Odeck clearly point out that EV incentives reduced CO2 emissions, but also produced adverse effects, including transit-lane delay and toll-revenue loss. The most important point is not that the bus lane was the only problem. It is that the bus lane made policymakers see that EVs are cleaner, but they are still cars.");
}

function addSlide15() {
  const slide = presentation.slides.add();
  base(slide, [
    title(
      "Turning Point II: EV Privileges Began to Affect Oslo's Transport Governance Tools",
      "The bus lane was only the most visible conflict. By the late 2010s, EV privileges were also affecting toll roads, parking policy, and public acceptance.",
    ),
    grid({ width: fill, height: fixed(530), columns: [fr(1), fr(1), fr(1)], columnGap: 28 }, [
      evidenceCol("Toll roads", [
        "Free or discounted tolls helped EV adoption.",
        "But they weakened a major transport-finance and congestion-management tool.",
        "Aasness and Odeck described toll exemption as the most serious adverse effect because it caused a sizable loss of toll revenue.",
      ], "Fiscal + transport pricing conflict", C.blue),
      evidenceCol("Parking / curb space", [
        "Free municipal parking made EVs attractive in cities.",
        "But it also made private car access easier while cities were trying to manage limited curb and street space.",
      ], "Spatial conflict", C.green),
      evidenceCol("Public acceptance", [
        "A Greater Oslo survey from 2014-2020 found growing disagreement with EV benefits.",
        "Residents became more critical of toll exemptions, bus-lane access without passengers, and free public parking.",
      ], "Political conflict", C.coral),
    ]),
    tx("From clean-vehicle incentive -> urban transport governance problem", { size: 44, bold: true, color: C.ink, width: fill, align: "center" }),
  ], "Sources: Aasness & Odeck; Greater Oslo EV-benefit attitude survey, 2014-2020.");
  notes(slide, "This slide shows that the bus lane was not an isolated issue. It was simply the most visible conflict. By the late part of Phase 2, EV privileges were affecting several core tools that Oslo and Norway used to manage transport.\n\nFirst, toll roads. Free or discounted tolls were effective because they reduced the daily cost of using an EV. But the toll system is not only a payment system. It is also a transport-governance and public-transport-finance tool. Aasness and Odeck considered toll exemption the most serious adverse effect of EV incentives because it caused a sizable loss of toll revenue.\n\nSecond, parking and street access. Free municipal parking helped encourage EV adoption in the early stage. But in city centers, parking spaces and curb space are scarce resources. Once EVs became common, free parking was not only a climate incentive. It continued to lower the cost of private car access.\n\nThird, public legitimacy. The Greater Oslo survey from 2014 to 2020 shows growing disagreement with EV benefits such as toll exemptions, access to bus lanes without passengers, and free public parking. In other words, the public image of EV policy was changing. It moved from climate leadership toward something that some residents saw as private car privilege.\n\nThe core point is that EV policy succeeded in changing the vehicle market, but it was also reshaping the rules of urban transport.");
}

function addSlide16() {
  const slide = presentation.slides.add();
  base(slide, [
    title(
      "Why This Became a Broader Mobility Problem for Oslo",
      "These conflicts mattered because Oslo was not only trying to electrify cars. It was also trying to reduce the dominance of private cars in the city.",
    ),
    grid({ width: fill, height: fill, columns: [fr(0.95), fr(1.05)], columnGap: 42 }, [
      column({ width: fill, height: fill, gap: 18 }, [
        tx("Oslo's Climate Budget sets a 2030 goal of reducing direct greenhouse gas emissions by 95% compared with 2009, and treats the climate budget as an integrated governance tool within the financial budget.", { size: 30, color: C.ink, width: fill, line: 1.06 }),
        tx("At the same time, Oslo's transport strategy directs investment toward public transport, walking, and cycling. The 2024 Climate Budget states that Oslo Package 3 funds pedestrian, bicycle, and public transport measures, including subway, tram, and public-transport upgrades.", { size: 28, color: C.ink, width: fill, line: 1.06 }),
      ]),
      column({ width: fill, height: fill, gap: 20, justifyContent: "center" }, [
        tx("Policy contradiction", { size: 42, bold: true, color: C.coral }),
        grid({ width: fill, height: fixed(250), columns: [fr(1), fr(1)], columnGap: 24 }, [
          column({ width: fill, height: fill, gap: 14 }, [
            tx("EV incentives", { size: 32, bold: true, color: C.teal }),
            tx("made electric driving cheaper and more convenient.", { size: 28, color: C.ink, width: fill, line: 1.06 }),
          ]),
          column({ width: fill, height: fill, gap: 14 }, [
            tx("Oslo's mobility agenda", { size: 32, bold: true, color: C.blue }),
            tx("tried to make private car use less dominant.", { size: 28, color: C.ink, width: fill, line: 1.06 }),
          ]),
        ]),
        rule({ width: fixed(420), stroke: C.coral, weight: 6 }),
        tx("The issue was not whether EVs were cleaner. They were.", { size: 34, bold: true, color: C.ink, width: fill }),
        tx("The issue was whether cleaner cars should continue receiving privileges that make car use more attractive.", { size: 34, bold: true, color: C.ink, width: fill, line: 1.04 }),
      ]),
    ]),
  ], "Sources: Oslo Climate Budget 2024; City of Oslo climate-budget materials.");
  notes(slide, "This became a broader mobility problem because Oslo was not only trying to electrify cars. It was also trying to reduce the dominance of private cars in the city.\n\nOslo's Climate Budget sets a 2030 goal of reducing direct greenhouse gas emissions by 95 percent compared with 2009. It also treats the climate budget as an integrated governance tool within the financial budget, not just as a climate report.\n\nAt the same time, Oslo's transport strategy directs investment toward public transport, walking, and cycling. The 2024 Climate Budget states that Oslo Package 3 funds pedestrian, bicycle, and public transport measures, including subway, tram, and public-transport upgrades.\n\nThis created a policy contradiction. EV incentives made electric driving cheaper and more convenient, while Oslo's mobility agenda tried to make private car use less dominant.\n\nThe issue was not whether EVs were cleaner. They were. The issue was whether cleaner cars should continue receiving privileges that make car use more attractive.");
}

addSlide14();
addSlide15();
addSlide16();

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
