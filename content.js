// =====================================================================
// GROW TRACKER CONTENT FILE
// All grow knowledge lives here so it can be refreshed on a schedule
// without touching the app logic. Bump CONTENT.version when editing.
// =====================================================================
const CONTENT = {
  version: "1.0.0",
  lastReviewed: "2026-10-16",

  // ---------------------------------------------------------------
  // FoxFarm SOIL feeding chart (teaspoons per gallon of water).
  // Source: FoxFarm soil feeding schedule (as reproduced by
  // mattshydroponics.com/pages/foxfarm-feed-chart). Weeks 1-4 = veg
  // (18/6), weeks 5-12 = flower (12/12). "Recommendations only."
  // ---------------------------------------------------------------
  foxfarm: {
    products: {
      bigBloom:   { name: "Big Bloom",      npk: "0.01-0.3-0.7", color: "#7a4fc9", note: "Organic, gentle. Used the whole grow." },
      growBig:    { name: "Grow Big",       npk: "6-4-4",        color: "#2f9e44", note: "Nitrogen for leafy growth. Runs hot if overdone." },
      tigerBloom: { name: "Tiger Bloom",    npk: "2-8-4",        color: "#e8590c", note: "Flowering P&K. Can burn if overdone." },
      openSesame: { name: "Open Sesame",    npk: "5-45-10",      color: "#f08c00", note: "Soluble powder. Kicks off early flowering." },
      beastie:    { name: "Beastie Bloomz", npk: "0-50-30",      color: "#c2255c", note: "Soluble powder. Mid-flower bud building. Very concentrated." },
      chaChing:   { name: "Cha Ching",      npk: "8-60-20",      color: "#d4a20b", note: "Soluble powder. Late flower bulking." },
      sledge:     { name: "Sledgehammer",   npk: "flush",        color: "#495057", note: "Flushing agent. Use at label rate with plain water." }
    },
    // amounts in tsp/gal; null = not used that week
    chart: [
      { key: "seedling", label: "Seedlings & cuttings", phase: "seedling", light: "18/6", bigBloom: 6,  growBig: null, tigerBloom: null, openSesame: null,  beastie: null,  chaChing: null,  ec: "1.0–1.2" },
      { key: "w1",  label: "Veg week 1",    phase: "veg",    light: "18/6", bigBloom: 6, growBig: null, tigerBloom: null, openSesame: null, beastie: null, chaChing: null, ec: "1.1–1.3" },
      { key: "w2",  label: "Veg week 2",    phase: "veg",    light: "18/6", bigBloom: 6, growBig: 1,    tigerBloom: null, openSesame: null, beastie: null, chaChing: null, ec: "1.7–2.1" },
      { key: "w3",  label: "Veg week 3",    phase: "veg",    light: "18/6", bigBloom: 6, growBig: 2,    tigerBloom: null, openSesame: null, beastie: null, chaChing: null, ec: "2.6–3.0" },
      { key: "w4",  label: "Veg week 4 (repeat until flip)", phase: "veg", light: "18/6", bigBloom: 3, growBig: 2, tigerBloom: null, openSesame: 0.25, beastie: null, chaChing: null, ec: "2.4–2.8" },
      { key: "w5",  label: "Flower week 1 (chart wk 5)",  phase: "flower", light: "12/12", bigBloom: 3, growBig: 2, tigerBloom: 1, openSesame: 0.25, beastie: null, chaChing: null, ec: "2.5–2.9" },
      { key: "w6",  label: "Flower week 2 (chart wk 6)",  phase: "flower", light: "12/12", bigBloom: 3, growBig: 2, tigerBloom: 1, openSesame: 0.25, beastie: null, chaChing: null, ec: "2.5–2.9" },
      { key: "w7",  label: "Flower week 3 (chart wk 7)",  phase: "flower", light: "12/12", bigBloom: 3, growBig: 2, tigerBloom: 1, openSesame: null, beastie: 0.25, chaChing: null, ec: "2.6–3.0" },
      { key: "w8",  label: "Flower week 4 (chart wk 8)",  phase: "flower", light: "12/12", bigBloom: 3, growBig: 2, tigerBloom: 2, openSesame: null, beastie: 0.25, chaChing: null, ec: "3.4–3.8" },
      { key: "w9",  label: "Flower week 5 (chart wk 9)",  phase: "flower", light: "12/12", bigBloom: 3, growBig: 1, tigerBloom: 2, openSesame: null, beastie: null, chaChing: 0.25, ec: "3.0–3.4" },
      { key: "w10", label: "Flower week 6 (chart wk 10)", phase: "flower", light: "12/12", bigBloom: 3, growBig: null, tigerBloom: 2, openSesame: null, beastie: null, chaChing: 0.25, ec: "2.1–2.5" },
      { key: "w11", label: "Flower week 7 (chart wk 11)", phase: "flower", light: "12/12", bigBloom: 3, growBig: null, tigerBloom: 2, openSesame: null, beastie: null, chaChing: 0.25, ec: "1.8–2.2" },
      { key: "w12", label: "Flower week 8 (chart wk 12)", phase: "flower", light: "12/12", bigBloom: 3, growBig: null, tigerBloom: 1, openSesame: null, beastie: null, chaChing: 0.25, ec: "1.4–1.8" },
      { key: "flush", label: "Finish / flush", phase: "flush", light: "12/12", bigBloom: null, growBig: null, tigerBloom: null, openSesame: null, beastie: null, chaChing: null, ec: "plain water", sledge: true }
    ],
    rules: [
      "Mix order: fill with water FIRST, then add each product one at a time and stir between. Shake the liquid bottles hard (Grow Big and Tiger Bloom settle).",
      "Check pH AFTER mixing nutrients, then adjust. Target 6.3–6.8 going in for soil.",
      "FoxFarm says to feed up to twice a week, alternating with plain pH'd water. Feed → water → feed is a safe rhythm.",
      "Most growers find the full chart too strong. Start around 50% and work up only if the plant stays light green and the tips don't burn.",
      "Ocean Forest is a 'hot' soil with lots of nutrients already in it. Give plain pH'd water for roughly the first 3 weeks. Happy Frog is milder (about 2 weeks).",
      "Veg running longer than 4 weeks? Repeat the week 4 mix until the week before you flip.",
      "Flower going past 8 weeks? Repeat the week 12 (flower week 8) mix, or start finishing with plain water.",
      "Flush with plain water plus Sledgehammer (label rate) if you see salt build-up, nutrient burn or lockout, and before changing phases if your runoff PPM is climbing.",
      "Powders (Open Sesame, Beastie Bloomz, Cha Ching) are very concentrated. Use a 1/4 tsp measure and level it off. Don't eyeball it."
    ]
  },

  // ---------------------------------------------------------------
  // Environment targets (AC Infinity tent / controller)
  // ---------------------------------------------------------------
  environment: [
    { stage: "Seedling / clone", dayF: "72–77", nightF: "65–70", rh: "65–75%", vpd: "0.4–0.8", sweet: "75°F, 70% RH", light: "200–400 PPFD (DLI 13–26)" },
    { stage: "Vegetative",       dayF: "70–85", nightF: "65–75", rh: "55–70%", vpd: "0.8–1.2", sweet: "77°F, 60–65% RH", light: "400–600 PPFD (DLI 26–39 on 18/6)" },
    { stage: "Early flower (wk 1–3)", dayF: "68–80", nightF: "60–70", rh: "45–55%", vpd: "1.0–1.4", sweet: "75°F day / 65°F night, 50% RH", light: "600–900 PPFD" },
    { stage: "Mid–late flower (wk 4+)", dayF: "65–78", nightF: "58–68", rh: "40–50%", vpd: "1.2–1.6", sweet: "72°F day / 62°F night, 45% RH", light: "800–1000 PPFD (no CO2)" },
    { stage: "Last 1–2 weeks",  dayF: "65–75", nightF: "55–65", rh: "35–45%", vpd: "1.2–1.6", sweet: "68°F / 58°F, 40% RH", light: "Keep same; cooler nights can bring out color" },
    { stage: "Drying (lights off)", dayF: "60–65", nightF: "60–65", rh: "55–62%", vpd: "—", sweet: "60°F / 60% RH for 7–14 days", light: "Dark" }
  ],
  acInfinity: [
    "Controller 69 Pro / AI+: put the inline fan on VPD or Auto mode with a high-temp trigger about 2°F above your target day temp and a high-humidity trigger at the top of your stage RH range.",
    "Keep the clip fans on all the time so leaves move a little. Point them across the canopy, not straight down at the plants.",
    "Flower: set the humidity trigger lower (about 50% early, 45% late) so the inline fan pulls out moist air at lights-off. That's when RH spikes and bud rot starts.",
    "Use the light's 'sunrise/sunset' ramp (15–30 min) so the plants don't get a shock when the lights snap on.",
    "Use the app to log temp, RH and VPD trends. If RH jumps right after lights-off, add a dehumidifier trigger or raise the fan's minimum speed at night.",
    "Light height: start high, then lower until the top leaves hit the stage PPFD. If the top leaves bleach or taco, raise the light or dim it 10–15%.",
    "Passive intake: open the bottom vents opposite the fan and keep the tent walls slightly sucked in. That slight negative pressure keeps smell inside.",
    "Lights off in flower means TOTAL dark. Check for light leaks at the zippers and ports with the tent lights off and the room lights on."
  ],
  tentSizes: {
    "2x2": { sqft: 4,  plants: "1",   watts: "100–150" },
    "2x4": { sqft: 8,  plants: "1–2", watts: "200–300" },
    "3x3": { sqft: 9,  plants: "1–2", watts: "200–320" },
    "4x4": { sqft: 16, plants: "2–4", watts: "400–650" },
    "5x5": { sqft: 25, plants: "4–6", watts: "650–900" },
    "4x8": { sqft: 32, plants: "4–8", watts: "800–1300" }
  },

  // ---------------------------------------------------------------
  // Training playbook
  // ---------------------------------------------------------------
  training: {
    photo: [
      { when: "Day 14–21 (3–4 nodes)", title: "Start LST", body: "Gently bend the main stem sideways and tie it down to the pot rim with soft wire. Turn the pot so the top points away from the light a little. Bend; don't snap." },
      { when: "5–6 nodes (~day 21–30)", title: "Top (optional, best for big yields)", body: "Cut the main stem just above the 5th node. You get 2 main colas instead of 1. Give it 3–5 days to recover before any more stress." },
      { when: "Every 2–3 days in veg", title: "Keep training the canopy flat", body: "Pull new tops outward to fill the tent like a table top. Every top at the same height gets the same light, so you get more big buds and less popcorn." },
      { when: "When the canopy is ~50–60% of the space", title: "Flip to 12/12", body: "Plants usually grow 1.5–2× taller in the first 3 weeks of flower (the stretch), so flip before the tent is full. Keep LST going during the stretch." },
      { when: "Day before flip", title: "Defoliate + lollipop", body: "Remove big fan leaves that shade bud sites, and strip the weak growth on the bottom third that won't get light." },
      { when: "Flower day 21", title: "Second defoliation", body: "Once the stretch ends, clean up again: remove leaves blocking the tops and inner bud sites, and thin interior growth to improve airflow." },
      { when: "Flower week 4 onward", title: "Hands off", body: "No more heavy pruning. Only remove yellow or dead leaves. Support heavy colas with a trellis net or yo-yos." }
    ],
    auto: [
      { when: "Day 10–21", title: "Start LST early", body: "Autos can't spare recovery time. Start gentle tie-downs once there are 3–4 nodes, and keep it gentle." },
      { when: "Before day 21 (optional)", title: "Topping (only if very healthy)", body: "Most growers skip topping autos. If you do it, do it once at the 3rd–4th node before day 21. Otherwise just use LST." },
      { when: "Day 21–35", title: "Pre-flower stretch", body: "Keep tucking tops outward through the stretch. Remove only the leaves that fully shade bud sites. Don't do big defoliations." },
      { when: "Flower", title: "Light cleanup only", body: "Take off the tiny lower growth that won't get light. Remove a few fan leaves at a time, not big chunks." }
    ]
  },

  // ---------------------------------------------------------------
  // Stage tips (shown on the dashboard for the plant's current stage)
  // ---------------------------------------------------------------
  tips: {
    germination: [
      "Paper towel method: damp (not soaking) paper towel between two plates in a warm (75–80°F), dark spot. Most seeds pop within 24–72 hours.",
      "Plant when the taproot is about 1/4–1/2 inch long, root down, 1/4–1/2 inch deep. Don't touch the taproot.",
      "If a seed hasn't popped after 5 days, it probably won't. Older seeds sometimes take a full week."
    ],
    seedling: [
      "Water small amounts in a circle around the stem. Overwatering is the #1 killer of seedlings.",
      "Keep humidity high (65–75%) and the light gentle. A stretchy, leaning seedling means the light is too far away or too weak.",
      "No nutrients in Ocean Forest or Happy Frog yet. The soil already feeds the plant.",
      "Start a solo cup or small pot and transplant at 3–4 nodes. Roots grow faster in fresh soil."
    ],
    veg: [
      "Water until 10–20% drains out the bottom, then wait until the pot feels light before watering again (lift it to check).",
      "Check runoff pH and PPM once a week. Runoff PPM climbing far above what you feed means salt build-up, so feed lighter or flush.",
      "Transplant into the final pot (3–5 gal for autos, 5–7 gal for photos in a 4×4) at least 2 weeks before flip.",
      "Lots of light in veg plus a flat canopy = bigger yield. Train often and gently."
    ],
    flower: [
      "Weeks 1–3: the stretch. Keep LST going and raise the light as needed.",
      "Drop humidity as the buds get dense. Bud rot starts inside fat colas when RH stays high at night.",
      "Check for 'bananas' (yellow male parts sticking out of buds) from week 3 onward. Remove them right away with wet tweezers.",
      "Yellowing fan leaves in the last 2–3 weeks is normal. The plant is pulling stored nitrogen.",
      "Get a 60x jeweler's loupe or a clip-on phone macro lens to check trichomes. Don't judge harvest by the pistils alone."
    ],
    flush: [
      "Finish with plain pH'd water (optionally Sledgehammer at label rate) for the last 7–14 days if you want.",
      "Harvest window: mostly milky/cloudy trichomes with 10–30% amber. More clear = too early. More amber = heavier, couch-lock effect.",
      "Optional: 24–48 hours of darkness before the chop. Lots of growers swear by it, but there's little proof it helps."
    ],
    harvest: [
      "Weigh the WET weight right after the chop and log it. Dry weight usually comes out to about 20–25% of the wet weight.",
      "Hang whole branches in the dark at about 60°F and 60% RH for 7–14 days. Small stems should snap, not bend.",
      "Trim, then jar buds about 3/4 full with a 62% humidity pack. Burp the jars daily for 2 weeks, then weekly. Cure 4+ weeks for best flavor."
    ]
  },

  // ---------------------------------------------------------------
  // Photo library (openly licensed, Wikimedia Commons). Hotlinked.
  // ---------------------------------------------------------------
  photos: {
    seedling:   { src: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5b/Seedling_cannabis_plant.jpg/500px-Seedling_cannabis_plant.jpg", page: "https://commons.wikimedia.org/wiki/File:Seedling_cannabis_plant.jpg", credit: "My 420 Tours, CC BY-SA 4.0" },
    seedling7:  { src: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/67/Cannabis_seedling_-_seven_days.jpg/500px-Cannabis_seedling_-_seven_days.jpg", page: "https://commons.wikimedia.org/wiki/File:Cannabis_seedling_-_seven_days.jpg", credit: "Trav1085, CC BY-SA 3.0" },
    ledSeedling:{ src: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8c/Cannabis_LED_seedling_%2817026483132%29.jpg/500px-Cannabis_LED_seedling_%2817026483132%29.jpg", page: "https://commons.wikimedia.org/wiki/File:Cannabis_LED_seedling_(17026483132).jpg", credit: "Cannabis Pictures (Flickr), CC BY 2.0" },
    youngVeg:   { src: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f8/Small_cannabis_plant_growing.jpg/500px-Small_cannabis_plant_growing.jpg", page: "https://commons.wikimedia.org/wiki/File:Small_cannabis_plant_growing.jpg", credit: "almogaver, CC BY-SA 2.0" },
    vegPair:    { src: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/Two_hydroponic_cannabis_plants.jpg/500px-Two_hydroponic_cannabis_plants.jpg", page: "https://commons.wikimedia.org/wiki/File:Two_hydroponic_cannabis_plants.jpg", credit: "Plantlady223, CC BY-SA 4.0" },
    healthyLeaf:{ src: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/Cannabis_sativa_leaf.jpg/500px-Cannabis_sativa_leaf.jpg", page: "https://commons.wikimedia.org/wiki/File:Cannabis_sativa_leaf.jpg", credit: "Dominik Matus, CC BY-SA 3.0" },
    femalePreflower: { src: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/56/Cannabis_Plant_Showing_Early_Signs_of_Female_Sex.jpg/500px-Cannabis_Plant_Showing_Early_Signs_of_Female_Sex.jpg", page: "https://commons.wikimedia.org/wiki/File:Cannabis_Plant_Showing_Early_Signs_of_Female_Sex.jpg", credit: "Swankysweden, CC BY-SA 4.0" },
    pistils:    { src: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0b/Pistils_du_cannabis.JPG/500px-Pistils_du_cannabis.JPG", page: "https://commons.wikimedia.org/wiki/File:Pistils_du_cannabis.JPG", credit: "Egien, CC BY-SA 3.0" },
    pistil:     { src: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b7/Marijuana_Pistil.jpg/500px-Marijuana_Pistil.jpg", page: "https://commons.wikimedia.org/wiki/File:Marijuana_Pistil.jpg", credit: "Psychonaught, public domain" },
    male:       { src: "https://upload.wikimedia.org/wikipedia/commons/c/c0/Cannabis_male_flowers.JPG", page: "https://commons.wikimedia.org/wiki/File:Cannabis_male_flowers.JPG", credit: "Wikimedia Commons, CC BY-SA 3.0" },
    bud:        { src: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1d/Macro_cannabis_bud.jpg/500px-Macro_cannabis_bud.jpg", page: "https://commons.wikimedia.org/wiki/File:Macro_cannabis_bud.jpg", credit: "yogi Bushby via HighInBC, CC BY 2.5" },
    trichomes:  { src: "https://upload.wikimedia.org/wikipedia/commons/e/e8/Trichomes_Close_Cannabis.jpg", page: "https://commons.wikimedia.org/wiki/File:Trichomes_Close_Cannabis.jpg", credit: "Psychonaught, public domain" },
    trichomes2: { src: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/64/Cannabis_glandular_trichomes.jpg/500px-Cannabis_glandular_trichomes.jpg", page: "https://commons.wikimedia.org/wiki/File:Cannabis_glandular_trichomes.jpg", credit: "rodzief, CC BY 4.0" },
    drying:     { src: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c9/Drying_Cannabis_Buds.jpg/500px-Drying_Cannabis_Buds.jpg", page: "https://commons.wikimedia.org/wiki/File:Drying_Cannabis_Buds.jpg", credit: "Cannabis Training University, CC BY-SA 3.0" },
    indoorRoom: { src: "https://upload.wikimedia.org/wikipedia/commons/a/aa/Humboldt_County_Indoor_Grow_2020.jpg", page: "https://commons.wikimedia.org/wiki/File:Humboldt_County_Indoor_Grow_2020.jpg", credit: "Humboldt County Sheriff's Office, public domain" },
    yellowing:  { src: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/be/Cannabis_Nutrient_Deficiency.JPG/500px-Cannabis_Nutrient_Deficiency.JPG", page: "https://commons.wikimedia.org/wiki/File:Cannabis_Nutrient_Deficiency.JPG", credit: "Cannabis Training University, CC BY-SA 3.0" },
    spiderMite: { src: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9a/Tetranychus_urticae_with_silk_threads.jpg/500px-Tetranychus_urticae_with_silk_threads.jpg", page: "https://commons.wikimedia.org/wiki/File:Tetranychus_urticae_with_silk_threads.jpg", credit: "Gilles San Martin, CC BY-SA 2.0" },
    mildew:     { src: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/51/Powdery_mildew_9.jpg/500px-Powdery_mildew_9.jpg", page: "https://commons.wikimedia.org/wiki/File:Powdery_mildew_9.jpg", credit: "Dmitry Brant, CC BY-SA 4.0 (shown on a non-cannabis leaf)" },
    gnat:       { src: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/30/Fungus_gnat_%286917082337%29.jpg/500px-Fungus_gnat_%286917082337%29.jpg", page: "https://commons.wikimedia.org/wiki/File:Fungus_gnat_(6917082337).jpg", credit: "Andy Murray, CC BY-SA 2.0" }
  },

  healthy: [
    { photo: "seedling", title: "Healthy seedling", body: "Short, sturdy stem, cotyledons (round first leaves) bright green, first serrated leaves opening flat. Leaning or tall and thin = light too far away." },
    { photo: "ledSeedling", title: "Seedling under LED", body: "Compact spacing between nodes and leaves angled up toward the light is what you want." },
    { photo: "youngVeg", title: "Healthy early veg", body: "Even medium-to-dark green, leaves held flat or slightly up, no curling and no spots. New growth is a little lighter green, and that's normal." },
    { photo: "vegPair", title: "Vigorous veg", body: "Lots of leaf, tight node spacing, leaves 'praying' upward in the light. This is a plant that's ready to train hard." },
    { photo: "healthyLeaf", title: "Healthy fan leaf", body: "Uniform green, smooth edges, no burnt tips, no yellow between the veins. Compare your leaves to this." },
    { photo: "femalePreflower", title: "Female pre-flowers", body: "Little white hairs (pistils) coming out of a teardrop calyx where the branch meets the stem. Means female, keep it!" },
    { photo: "pistils", title: "Early flower pistils", body: "White hair clusters stacking at the tops in weeks 2–4 of flower. Healthy and on track." },
    { photo: "bud", title: "Healthy maturing bud", body: "Dense calyxes covered in frost (trichomes), pistils starting to darken and curl in." },
    { photo: "trichomes", title: "Trichomes up close", body: "Clear = not ready. Milky/cloudy = peak. Amber = degrading toward a heavier body effect. Harvest at mostly milky with 10–30% amber." },
    { photo: "trichomes2", title: "Glandular trichomes", body: "The mushroom-shaped heads are what you check with a loupe. Look at the bud, not the sugar leaves (leaves amber first)." },
    { photo: "drying", title: "Proper drying", body: "Hung in the dark with space between branches, ~60°F / 60% RH, about 7–14 days until small stems snap." }
  ],

  // ---------------------------------------------------------------
  // Problem guide. leaf = pattern key for the SVG illustration.
  // ---------------------------------------------------------------
  problems: [
    { id: "nitrogen", title: "Nitrogen (N) deficiency", where: "Lower/older leaves first", leaf: "uniformYellow", photo: "yellowing",
      look: "Lower leaves turn evenly pale yellow and then fall off. The yellowing moves up the plant.",
      fix: "Veg: raise Grow Big a little (stay inside the chart). Late flower: normal fade, leave it. Check pH first, because low pH locks out N.",
      foxfarm: "Grow Big" },
    { id: "phosphorus", title: "Phosphorus (P) deficiency", where: "Older leaves", leaf: "darkPurple",
      look: "Leaves go dark, dull blue-green with purple/bronze patches and dark spots. Red stems can go with it, though some strains are purple naturally.",
      fix: "Flower: make sure Tiger Bloom / Open Sesame / Beastie are going in. Check for cold roots (under 60°F) and pH above 7.",
      foxfarm: "Tiger Bloom, Beastie Bloomz" },
    { id: "potassium", title: "Potassium (K) deficiency", where: "Older/middle leaves", leaf: "brownEdges",
      look: "Leaf edges and tips turn yellow, then crispy brown. It can look like burn but starts on the edges and works inward.",
      fix: "Check runoff pH. Make sure Big Bloom / Tiger Bloom are in the mix. Don't overdo powders (excess P can block K).",
      foxfarm: "Big Bloom, Tiger Bloom" },
    { id: "calcium", title: "Calcium (Ca) deficiency", where: "New/middle growth", leaf: "brownSpots",
      look: "Random rusty brown spots with a yellow halo, plus twisted or slow new growth.",
      fix: "Usually a pH or watering problem in soil. Keep input pH 6.3–6.8. If you use RO or filtered water, add a Cal-Mag supplement (FoxFarm makes one).",
      foxfarm: "Cal-Mag (FoxFarm)" },
    { id: "magnesium", title: "Magnesium (Mg) deficiency", where: "Older/middle leaves", leaf: "interveinalOld",
      look: "Yellow BETWEEN the veins while the veins stay green. Can turn rusty and crispy if left alone.",
      fix: "Check pH (low pH locks out Mg). A Cal-Mag supplement fixes it fast.",
      foxfarm: "Cal-Mag (FoxFarm)" },
    { id: "iron", title: "Iron (Fe) deficiency", where: "Newest growth at the top", leaf: "interveinalNew",
      look: "Brand-new leaves come in bright yellow between green veins.",
      fix: "Almost always pH too high (over 7) in soil. Fix the pH and new growth comes in green.",
      foxfarm: "Fix pH; FoxFarm trio has micronutrients" },
    { id: "burn", title: "Nutrient burn (overfeeding)", where: "Leaf tips, all over", leaf: "burntTips",
      look: "Tips turn yellow, then brown and crispy, and the leaf often curls down at the tip ('claw'). Very dark green leaves = too much N.",
      fix: "Drop to 50% strength or skip a feeding. Flush with plain water + Sledgehammer if it spreads. Burnt tips won't heal; watch new growth.",
      foxfarm: "Sledgehammer flush" },
    { id: "lockout", title: "pH lockout", where: "Multiple random symptoms", leaf: "mixed",
      look: "Several deficiencies at once even though you're feeding. Runoff pH far from 6.2–6.8.",
      fix: "Flush with 3× pot volume of pH'd water (6.5) + Sledgehammer, then restart at 50% strength. Test pH every feed after.",
      foxfarm: "Sledgehammer flush" },
    { id: "overwater", title: "Overwatering", where: "Whole plant", leaf: "droopy",
      look: "Leaves droop down but feel firm and puffy. The pot stays heavy for days. Often fungus gnats too.",
      fix: "Let it dry until the pot feels light. Water in smaller amounts. Use fabric pots and make sure there's drainage.",
      foxfarm: "—" },
    { id: "underwater", title: "Underwatering", where: "Whole plant", leaf: "limp",
      look: "Leaves hang limp and papery thin. Soil is pulling away from the pot edge and the pot feels very light.",
      fix: "Water slowly in stages until 10–20% runs out. Very dry soil can repel water, so pour slowly.",
      foxfarm: "—" },
    { id: "light", title: "Light burn / bleaching", where: "Top leaves only, closest to light", leaf: "bleached",
      look: "Top leaves and buds turn yellow-white while the lower plant stays green. Leaves may taco (fold up).",
      fix: "Raise the light or dim 10–20%. Check PPFD against the stage target.",
      foxfarm: "—" },
    { id: "heat", title: "Heat stress", where: "Top canopy", leaf: "taco",
      look: "Leaf edges curl up into a taco or canoe shape. Buds can foxtail (spiky towers) in flower.",
      fix: "Keep day temp under ~82°F. Raise the inline fan's high-temp trigger speed on the AC Infinity controller and add canopy airflow.",
      foxfarm: "—" },
    { id: "mites", title: "Spider mites", where: "Undersides of leaves", photo: "spiderMite",
      look: "Tiny white/yellow dots (stippling) on leaves, specks moving underneath, fine webbing in bad cases.",
      fix: "Act FAST. Spray leaf undersides in veg (insecticidal soap or a labeled miticide) and repeat every 3 days for 2 weeks. Predatory mites are a great prevention. Never spray buds in flower.",
      foxfarm: "Bush Doctor Force of Nature (veg only, per label)" },
    { id: "pm", title: "Powdery mildew (PM)", where: "Leaf tops", photo: "mildew",
      look: "White, flour-like powdery spots that wipe off and come back.",
      fix: "Lower humidity, increase airflow, defoliate the dense areas. In veg, treat with a labeled fungicide. If it gets on buds in flower, those buds are ruined.",
      foxfarm: "—" },
    { id: "gnats", title: "Fungus gnats", where: "Soil surface", photo: "gnat",
      look: "Tiny black flies hopping around the soil. Larvae eat roots.",
      fix: "Let the top inch dry between waterings, use yellow sticky traps, and use BTi (mosquito bits) in the water.",
      foxfarm: "—" },
    { id: "rot", title: "Bud rot (botrytis)", where: "Inside dense colas, late flower", leaf: "rot",
      look: "One sugar leaf turns yellow/brown out of nowhere and the inside of the bud is grey-brown mush.",
      fix: "Cut it out at least 1 inch below the rot with clean scissors, bag it, and drop the humidity under 45%. Check every big cola daily in the last 3 weeks.",
      foxfarm: "—" },
    { id: "male", title: "Male plant / herm 'bananas'", where: "Nodes / inside buds", photo: "male",
      look: "Males: little ball clusters (pollen sacs) hanging off the nodes. Herms: yellow banana-shaped nubs poking out of buds.",
      fix: "Remove male plants right away. For a few bananas, pluck them with wet tweezers. Check for light leaks and stress.",
      foxfarm: "—" }
  ],

  sources: [
    { name: "FoxFarm feeding schedules (official)", url: "https://foxfarm.com/feeding-schedules" },
    { name: "FoxFarm soil chart reproduction – Matt's Hydroponics", url: "https://mattshydroponics.com/pages/foxfarm-feed-chart" },
    { name: "HTG Supply – FoxFarm nutrient guide", url: "https://www.htgsupply.com/informationcenter/learn-about-nutrients/guide-to-fox-farm-nutrient/" },
    { name: "Trimleaf – grow room temp & humidity chart", url: "https://trimleaf.com/blogs/articles/grow-room-temp-and-humidity-chart-for-perfect-climate-control" },
    { name: "Happy Hydro – Controller 69 Pro automation guide", url: "https://happyhydro.com/blogs/gardening/automations-unlocked-a-guide-to-setting-up-the-controller-69-pro" },
    { name: "Photos – Wikimedia Commons (licenses on each photo)", url: "https://commons.wikimedia.org/" }
  ]
};
