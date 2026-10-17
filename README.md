# 🌱 GrowLog: seed-to-harvest grow tracker

A phone- and desktop-friendly web app (bottom tabs on phones, sidebar on computers) for tracking an indoor soil grow in an AC Infinity tent with **FoxFarm nutrients only**.

## Features
- **Today dashboard**: each plant's stage, day/week count, this week's FoxFarm mix (in tsp **and** mL), and a to-do list
- **Week by week**: tap any week to see the feed, training, tent targets, what to check and a reference photo. Your current week is marked 📍
- **Grow calendar**: logged milestones (germination started, seed popped, planted, sprouted, topped, LST, flip, pistils, harvest, dry, jar, cure), waterings, and projected future dates
- **FoxFarm soil schedule**: Big Bloom, Grow Big, Tiger Bloom, Open Sesame, Beastie Bloomz, Cha Ching, Sledgehammer, with a strength slider and batch-size calculator. Handles Ocean Forest / Happy Frog "hot soil" weeks and squeezes the chart into an autoflower timeline
- **Training playbooks** for photoperiods and autoflowers (LST, topping, defoliation timing)
- **Tents & lights**: save multiple tents (AC Infinity CLOUDLAB presets or custom sizes) and lights (IONFRAME EVO presets or any light by wattage), switch lights per tent, assign plants to tents. Includes watts/sq ft checks, temperature, humidity, VPD and PPFD targets per stage, a VPD calculator, and AC Infinity controller tips
- **Healthy vs problems** photo guide, with leaf-pattern drawings for deficiencies, burn, pH lockout, pests, mold and herms
- **Testing reminders** for input pH, weekly runoff pH/PPM, and automatic warnings when readings are out of range
- **Yield tracker**: wet/dry weight, g/watt, g/sq ft, and estimates before harvest
- **Strain library + auto-fill**: type a strain and GrowLog fills in autoflower vs photoperiod, time to bud (flower weeks or seed-to-harvest days) and typical THC from `strains.js`. Unknown strains get a look-up link and are added on the next scheduled update
- **THC / CBD**: breeder-listed THC and CBD per plant, plus lab-tested THC after harvest. Shown on cards, reports and CSV exports
- **My plants**: add and name as many plants as you want, with where each came from, planted date, day/week count, flower date and weight
- **Print / Export**: a printable one-page report per plant (planted date, source, nutrients added with totals, weights, flower date, days and weeks, milestones and the feeding log). Save it as a PDF, or export CSV spreadsheets
- **Back up to phone**: saves a backup file (optionally with photos) through the phone's share sheet (Files, iCloud Drive, Google Drive) or to Downloads. Includes restore, a weekly backup reminder, and a request for protected storage
- **Cloud sync**: optional sync to your own **private** GitHub repo (`GrowLog-data`) using a fine-grained token with Contents read/write on that repo only. Plants, logs, gear and photos sync across devices automatically. The token stays on each device and is never uploaded
- Installable to the Home Screen and works offline
- Photo journal, dark mode

## Files
| File | Purpose |
|---|---|
| `index.html` | Page + styles |
| `app.js` | App logic |
| `content.js` | All grow knowledge (feeding chart, tips, photos, problems, gear presets). Updated on a schedule |
| `strains.js` | Strain database (type, flower time, THC). Updated on a schedule |
| `sw.js` | Offline support |

## Sources
FoxFarm feeding schedules; Matt's Hydroponics FoxFarm chart reproduction; HTG Supply; Trimleaf environment chart; Happy Hydro AC Infinity guide. Photos are from Wikimedia Commons, with the license credited under each photo.

*FoxFarm calls its charts "recommendations only." Watch your plants and adjust. Grow laws vary by state, so know the rules where you live.*
