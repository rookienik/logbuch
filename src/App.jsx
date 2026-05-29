import { useState, useEffect, useCallback, useMemo } from "react";
import { createClient } from "@supabase/supabase-js";

// ─── SUPABASE CLIENT ──────────────────────────────────────────────────────────
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

// ─── CATALOG DATA ─────────────────────────────────────────────────────────────

// Chirurgie and Hand: flat sections → items (unchanged structure)
// Ortho: sections → regions → items (3-level)

const CATALOG = {
  chirurgie: {
    label: "Chirurgie",
    color: "#60a5fa",
    type: "flat",
    sections: [
      {
        id: "notfall", label: "Notfallchirurgie", min: 85,
        items: [
          { id: "c_schockraum", label: "Schockraummanagement", min: 10 },
          { id: "c_reposition", label: "Reposition Luxation/Frakturen, konservative Frakturbehandlung", min: 15 },
          { id: "c_wunde", label: "Wundversorgungen", min: 30 },
          { id: "c_fixateur", label: "Anlage Fixateur externe", min: 5 },
          { id: "c_thorax", label: "Thoraxdrainagen", min: 15 },
          { id: "c_zerviko", label: "Zervikotomien / Tracheafreilegung", min: 5 },
          { id: "c_cystofix", label: "Cystofixeinlage", min: 5 },
        ]
      },
      {
        id: "allgemein", label: "Allgemeinchirurgie", min: 260,
        items: [
          { id: "c_laparotomie", label: "Laparotomie", min: 15 },
          { id: "c_laparoskopie", label: "Laparoskopie (diagnostisch/Zugang)", min: 15 },
          { id: "c_appendektomie", label: "Appendektomie", min: 30 },
          { id: "c_cholezyst", label: "Cholezystektomie", min: 30 },
          { id: "c_hernie", label: "Hernienoperationen (inguinal/umbilical)", min: 40 },
          { id: "c_duenndarm", label: "Dünndarmeingriffe, Stoma", min: 20 },
          { id: "c_prokto", label: "Proktologische Eingriffe", min: 20 },
          { id: "c_klein", label: "Kleinchirurgische Eingriffe", min: 40 },
          { id: "c_venen", label: "Veneneingriffe (Varizen, Port/Pacemaker)", min: 30 },
          { id: "c_weitere", label: "Weitere (Thorax, Uro, Gefässe, Endoskopie, Mamma)", min: 20 },
        ]
      },
      {
        id: "viszeral", label: "Modul Viszeralchirurgie", min: 165, optional: true,
        items: [
          { id: "v_lap", label: "Laparoskopie / Laparotomie", min: 40 },
          { id: "v_abdhern", label: "Abdominalhernien (Narbenhernien, videoskopisch)", min: 25 },
          { id: "v_magen", label: "Mageneingriffe", min: 7 },
          { id: "v_duenn", label: "Dünndarmeingriffe (Resektion, Adhäsiolyse)", min: 25 },
          { id: "v_kolore", label: "Kolorektal (Segment-/Teilresektion)", min: 10 },
          { id: "v_hepato", label: "Hepatobiliär / Leber / Pankreas / Bariatrisch", min: 5 },
          { id: "v_endokrin", label: "Endokrine Chirurgie (Thyreoidektomie etc.)", min: 10 },
          { id: "v_prokto", label: "Proktologie (inkl. Rektoskopie)", min: 35 },
          { id: "v_splen", label: "Splenektomie", min: 3 },
          { id: "v_stoma", label: "Dickdarmstoma", min: 5 },
        ]
      },
      {
        id: "trauma_c", label: "Modul Traumatologie", min: 165, optional: true,
        items: [
          { id: "ct_me", label: "Metallentfernungen, Spickungen", min: 30 },
          { id: "ct_repo", label: "Repositionen (Frakturen, Luxationen)", min: 25 },
          { id: "ct_sehnen", label: "Eingriffe Sehnen/Ligamente", min: 15 },
          { id: "ct_arthro", label: "Arthroskopie", min: 10 },
          { id: "ct_amp_k", label: "Amputationen klein", min: 5 },
          { id: "ct_amp_g", label: "Amputationen gross", min: 5 },
          { id: "ct_osteo_s", label: "Osteosynthese Schaftfrakturen", min: 15 },
          { id: "ct_osteo_g", label: "Osteosynthese gelenksnahe Frakturen", min: 40 },
          { id: "ct_komplex", label: "Komplexe Frakturen", min: 5 },
          { id: "ct_hand", label: "Handchirurgie (exkl. Wundversorgung)", min: 15 },
        ]
      },
    ]
  },

  ortho: {
    label: "Orthopädie / Traumatologie",
    color: "#a78bfa",
    type: "hierarchical",
    // sections → regions → items  (3 levels)
    sections: [
      {
        id: "o_prothetik", label: "Teil 1 – Prothetik", min: 30,
        note: "Min. 30, Max. 90 gesamt · Max. 30 Assistenzen",
        regions: [
          {
            id: "op_gr1", label: "Gruppe 1 – Grosse Gelenke",
            note: "Hüfte, Knie, Schulter, Wirbelsäule · Max. 60",
            items: [
              { id: "o_p1_huefte", label: "Primäre Totalprothese Hüfte", min: 0, max: 60 },
              { id: "o_p1_knie", label: "Primäre Totalprothese Knie (inkl. unikompartimental)", min: 0, max: 60 },
              { id: "o_p1_schulter", label: "Primäre Totalprothese Schulter (inkl. invers)", min: 0, max: 60 },
              { id: "o_p1_ws", label: "Diskusprothese Wirbelsäule", min: 0, max: 60 },
            ]
          },
          {
            id: "op_gr2", label: "Gruppe 2 – Kleine Gelenke",
            note: "Ellbogen, Handgelenk, Finger, OSG, Zehengelenke · Max. 10",
            items: [
              { id: "o_p2_ellbogen", label: "Primäre Totalprothese Ellbogen", min: 0, max: 10 },
              { id: "o_p2_hg", label: "Primäre Totalprothese Handgelenk", min: 0, max: 10 },
              { id: "o_p2_finger", label: "Primäre Totalprothese Fingergelenk", min: 0, max: 10 },
              { id: "o_p2_osg", label: "Primäre Totalprothese OSG", min: 0, max: 10 },
              { id: "o_p2_zehe", label: "Primäre Totalprothese Zehengelenk", min: 0, max: 10 },
            ]
          },
          {
            id: "op_gr3", label: "Gruppe 3 – Kopfprothesen",
            note: "Hüfte, Knie (sekundär Patella/femoropatellar), Schulter · Max. 10",
            items: [
              { id: "o_p3_huefte", label: "Kopfprothese Hüfte", min: 0, max: 10 },
              { id: "o_p3_knie", label: "Sekundäre Patellaprothese / femoropatelläre Prothese Knie", min: 0, max: 10 },
              { id: "o_p3_schulter", label: "Kopfprothese Schulter", min: 0, max: 10 },
            ]
          },
          {
            id: "op_gr4", label: "Gruppe 4 – Wechsel & Revision",
            note: "Alle Regionen · Min. 1, Max. 10",
            items: [
              { id: "o_p4_wechsel", label: "Prothesenwechsel (alle Regionen)", min: 1, max: 10 },
              { id: "o_p4_konversion", label: "Prothesenkonversion (Hemi→Total, Standard→Invers)", min: 0, max: 10 },
              { id: "o_p4_ausbau", label: "Prothesenausbau / Girdlestone / Spacereinbau", min: 0, max: 10 },
              { id: "o_p4_spacer", label: "Spacerwechsel / Prothesenwiedereinbau", min: 0, max: 10 },
            ]
          },
        ]
      },
      {
        id: "o_osteo", label: "Teil 2 – Osteotomien & Arthrodesen", min: 15,
        note: "Min. 15, Max. 50 gesamt · Max. 15 Assistenzen",
        regions: [
          {
            id: "oo_becken", label: "Becken / Hüfte",
            note: "Max. 20",
            items: [
              { id: "o_o1_pao", label: "Periazetabuläre Osteotomie", min: 0, max: 20 },
              { id: "o_o1_triple", label: "Triple-Osteotomie", min: 0, max: 20 },
              { id: "o_o1_salter", label: "Salter / Pemberton", min: 0, max: 20 },
              { id: "o_o1_femur", label: "Intertrochantäre Femurosteotomie (alle Korrekturarten)", min: 0, max: 20 },
            ]
          },
          {
            id: "oo_knienahe", label: "Knienahe Achskorrektur",
            note: "Femur distal, Tibia proximal · Min. 3, Max. 10",
            items: [
              { id: "o_o2_femur", label: "Distale Femurosteotomie (Achsenkorrektur)", min: 0, max: 10 },
              { id: "o_o2_tibia", label: "Proximale Tibiaosteotomie (Achsenkorrektur)", min: 0, max: 10 },
              { id: "o_o2_korrektur", label: "Korrekturosteotomie posttraumatisch/angeboren/erworben (Knie)", min: 0, max: 10 },
            ]
          },
          {
            id: "oo_hand_fuss", label: "Hand / Fuss",
            note: "Min. 5, Max. 10",
            items: [
              { id: "o_o3_hallux", label: "Osteotomie bei Hallux valgus", min: 0, max: 10 },
              { id: "o_o3_hand", label: "Korrekturosteotomie Hand (posttraumatisch, angeboren)", min: 0, max: 10 },
              { id: "o_o3_fuss", label: "Korrekturosteotomie Fuss (posttraumatisch, angeboren)", min: 0, max: 10 },
            ]
          },
          {
            id: "oo_arthrodesen", label: "Arthrodesen",
            note: "Alle Techniken, alle Regionen · Min. 1, Max. 10",
            items: [
              { id: "o_o4_alle", label: "Arthrodese (alle Techniken, alle Regionen)", min: 1, max: 10 },
            ]
          },
        ]
      },
      {
        id: "o_rekon", label: "Teil 3 – Rekonstruktive Eingriffe", min: 70,
        note: "Min. 70, Max. 140 gesamt · Max. 70 Assistenzen",
        regions: [
          {
            id: "or_ws", label: "Wirbelsäule",
            note: "Min. 10 gesamt Gruppe 1, Max. 40",
            items: [
              { id: "o_r_laminektomie", label: "Laminektomie", min: 0, max: 40 },
              { id: "o_r_diskus", label: "OP bei Diskushernie", min: 0, max: 40 },
              { id: "o_r_spondylodese", label: "Spondylodese", min: 0, max: 40 },
              { id: "o_r_skoliose", label: "Korrektur bei Skoliose / Kyphose", min: 0, max: 40 },
            ]
          },
          {
            id: "or_huefte", label: "Hüfte",
            note: "Min. 10 gesamt Gruppe 1, Max. 40",
            items: [
              { id: "o_r_fai", label: "OP bei femoroazetabulärem Impingement (FAI)", min: 0, max: 40 },
              { id: "o_r_epiphysio", label: "OP bei Epiphysiolyse", min: 0, max: 40 },
            ]
          },
          {
            id: "or_knie", label: "Knie",
            note: "Gr.1: Min. 10 / Gr.2: Min. 30",
            items: [
              { id: "o_r_vkb", label: "VKB-Rekonstruktion / -Naht", min: 0, max: 40 },
              { id: "o_r_hkb", label: "HKB-Rekonstruktion / -Naht", min: 0, max: 40 },
              { id: "o_r_meniskusnaht", label: "Meniskusnaht", min: 0, max: 40 },
              { id: "o_r_patella", label: "OP bei Patella-Maltracking", min: 0, max: 40 },
              { id: "o_r_meniskektomie", label: "Meniskektomie", min: 0, max: 60 },
              { id: "o_r_knorpel", label: "Knorpelrekonstruktion / Microfracture", min: 0, max: 60 },
              { id: "o_r_streckapparat", label: "Naht / Rekonstruktion Streckapparat", min: 0, max: 60 },
            ]
          },
          {
            id: "or_schulter", label: "Schulter",
            note: "Gr.1: Rotatorenmanschette / Stabilisation",
            items: [
              { id: "o_r_rmc_naht", label: "Rotatorenmanschettennaht", min: 0, max: 40 },
              { id: "o_r_rmc_rekon", label: "Rotatorenmanschetten-Rekonstruktion", min: 0, max: 40 },
              { id: "o_r_schulter_stab", label: "Schulterstabilisation (glenohumeral / AC-Gelenk)", min: 0, max: 40 },
              { id: "o_r_akromio", label: "Akromioplastik / AC-Resektion", min: 0, max: 60 },
              { id: "o_r_subakro", label: "Subakromiale Dekompression", min: 0, max: 60 },
              { id: "o_r_bizeps", label: "Bizeps-Sehnenchirurgie", min: 0, max: 60 },
            ]
          },
          {
            id: "or_ellbogen", label: "Ellbogen",
            items: [
              { id: "o_r_ell_band", label: "Bandnaht / -Rekonstruktion Ellbogen", min: 0, max: 60 },
              { id: "o_r_epikondylitis", label: "Epikondylitis-OP", min: 0, max: 60 },
            ]
          },
          {
            id: "or_fuss", label: "Fuss",
            items: [
              { id: "o_r_fuss_sehne", label: "Sehnenchirurgie Fuss", min: 0, max: 60 },
              { id: "o_r_osg_instab", label: "OSG-Instabilität", min: 0, max: 60 },
              { id: "o_r_hallux_wt", label: "Hallux valgus (nur Weichteile)", min: 0, max: 60 },
              { id: "o_r_hohmann", label: "Hohmann-OP", min: 0, max: 60 },
              { id: "o_r_ganglion", label: "Ganglion", min: 0, max: 60 },
              { id: "o_r_exostose", label: "Exostosen-Resektion", min: 0, max: 60 },
            ]
          },
          {
            id: "or_hand_hg", label: "Handgelenk / Hand",
            items: [
              { id: "o_r_hg_sehne", label: "Sehnenchirurgie Handgelenk/Hand", min: 0, max: 60 },
              { id: "o_r_hg_band", label: "Bandchirurgie Handgelenk", min: 0, max: 60 },
              { id: "o_r_tfcc", label: "TFCC-Chirurgie", min: 0, max: 60 },
              { id: "o_r_dupuytren", label: "Dupuytren-OP", min: 0, max: 60 },
              { id: "o_r_hg_ganglion", label: "Ganglion Handgelenk", min: 0, max: 60 },
            ]
          },
          {
            id: "or_lappen", label: "Lappenplastiken / Hauttransplantation",
            note: "Min. 5, Max. 40",
            items: [
              { id: "o_r_lappen_frei", label: "Freie Lappenplastik", min: 0, max: 40 },
              { id: "o_r_lappen_gestielt", label: "Gestielte Hautlappen", min: 0, max: 40 },
              { id: "o_r_hauttransplantat", label: "Hauttransplantation", min: 0, max: 40 },
            ]
          },
          {
            id: "or_arthro", label: "Arthroskopie",
            note: "Min. 40, Max. 60 – alle Regionen",
            items: [
              { id: "o_r_arthro_knie", label: "Arthroskopie Knie", min: 0, max: 60 },
              { id: "o_r_arthro_schulter", label: "Arthroskopie Schulter", min: 0, max: 60 },
              { id: "o_r_arthro_huefte", label: "Arthroskopie Hüfte", min: 0, max: 60 },
              { id: "o_r_arthro_osg", label: "Arthroskopie OSG", min: 0, max: 60 },
              { id: "o_r_arthro_ell", label: "Arthroskopie Ellbogen", min: 0, max: 60 },
              { id: "o_r_arthro_hg", label: "Arthroskopie Handgelenk", min: 0, max: 60 },
            ]
          },
        ]
      },
      {
        id: "o_synthese", label: "Teil 4 – Osteosynthesen", min: 65,
        note: "Min. 65, Max. 240 gesamt · Max. 65 Assistenzen",
        regions: [
          {
            id: "os_dia_gr1", label: "Diametaphysär – Gruppe 1 (lange Röhrenknochen)",
            note: "AO Segment 2, Seg. 1+3 nur Gruppe A · Min. 20, Max. 70",
            items: [
              { id: "o_s1_femur", label: "Femur – Platte / Marknagel / Fixateur externe", min: 0, max: 70 },
              { id: "o_s1_tibia", label: "Tibia – Platte / Marknagel / Fixateur externe", min: 0, max: 70 },
              { id: "o_s1_humerus", label: "Humerus – Platte / Marknagel / Fixateur externe", min: 0, max: 70 },
              { id: "o_s1_radius", label: "Radius – Platte / Marknagel / Fixateur externe", min: 0, max: 70 },
              { id: "o_s1_ulna", label: "Ulna – Platte / Marknagel / Fixateur externe", min: 0, max: 70 },
            ]
          },
          {
            id: "os_dia_gr2", label: "Diametaphysär – Gruppe 2 (kurze Knochen)",
            note: "Min. 10, Max. 40",
            items: [
              { id: "o_s2_clavicula", label: "Clavicula – alle Fixationstechniken", min: 0, max: 40 },
              { id: "o_s2_scapula", label: "Scapula – alle Fixationstechniken", min: 0, max: 40 },
              { id: "o_s2_ac", label: "AC-Luxation – alle Fixationstechniken", min: 0, max: 40 },
              { id: "o_s2_sc", label: "SC-Luxation – alle Fixationstechniken", min: 0, max: 40 },
              { id: "o_s2_mc", label: "Hand MC / P1 / P2 – alle Fixationstechniken", min: 0, max: 40 },
              { id: "o_s2_mt", label: "Fuss MT / P1 / P2 – alle Fixationstechniken", min: 0, max: 40 },
            ]
          },
          {
            id: "os_art_gr3", label: "Artikulär – Gruppe 3 (grosse Gelenke)",
            note: "AO Seg. 1+3 Gruppen B+C · Min. 20, Max. 70",
            items: [
              { id: "o_s3_femur", label: "Femur artikulär – alle Fixationstechniken", min: 0, max: 70 },
              { id: "o_s3_patella", label: "Patella – alle Fixationstechniken", min: 0, max: 70 },
              { id: "o_s3_tibia", label: "Tibia artikulär – alle Fixationstechniken", min: 0, max: 70 },
              { id: "o_s3_glenoid", label: "Glenoid – alle Fixationstechniken", min: 0, max: 70 },
              { id: "o_s3_humerus", label: "Humerus artikulär – alle Fixationstechniken", min: 0, max: 70 },
              { id: "o_s3_radius", label: "Radius artikulär – alle Fixationstechniken", min: 0, max: 70 },
              { id: "o_s3_ulna", label: "Ulna artikulär – alle Fixationstechniken", min: 0, max: 70 },
            ]
          },
          {
            id: "os_art_gr4", label: "Artikulär – Gruppe 4 (kleine Gelenke)",
            note: "Min. 10, Max. 40",
            items: [
              { id: "o_s4_malleolus", label: "Malleolarfraktur – alle Fixationstechniken", min: 0, max: 40 },
              { id: "o_s4_fusswurzel", label: "Fusswurzel / Fuss – alle Fixationstechniken", min: 0, max: 40 },
              { id: "o_s4_handwurzel", label: "Handwurzel / Hand – alle Fixationstechniken", min: 0, max: 40 },
            ]
          },
          {
            id: "os_stamm", label: "Stammskelett",
            note: "Acetabulum / Beckenring / Wirbelsäule · Min. 2, Max. 20",
            items: [
              { id: "o_s5_acetabulum", label: "Acetabulum – alle Fixationstechniken", min: 0, max: 20 },
              { id: "o_s5_becken", label: "Beckenring – alle Fixationstechniken (inkl. C-Clamp, Fixateur)", min: 0, max: 20 },
              { id: "o_s5_ws", label: "Wirbelsäule – alle Fixationstechniken / WK-Ersatz / Vertebroplastik", min: 0, max: 20 },
            ]
          },
        ]
      },
      {
        id: "o_div", label: "Teil 5 – Diverses", min: 20,
        note: "Min. 20, Max. 260 gesamt · Max. 20 Assistenzen",
        regions: [
          {
            id: "od_tumor", label: "Tumorchirurgie",
            note: "Max. 30",
            items: [
              { id: "o_d1_maligne", label: "Exzision maligner Tumor", min: 0, max: 30 },
              { id: "o_d1_benigne", label: "Exzision benigner Tumor", min: 0, max: 30 },
              { id: "o_d1_metastase", label: "OP bei Knochenmetastase", min: 0, max: 30 },
              { id: "o_d1_biopsie", label: "Biopsie", min: 0, max: 30 },
            ]
          },
          {
            id: "od_infekt", label: "Infektchirurgie",
            note: "Min. 5, Max. 20",
            items: [
              { id: "o_d2_gelenk", label: "OP bei Gelenkinfekt (Débridement, arthroskopische Spülung)", min: 0, max: 20 },
              { id: "o_d2_weichteile", label: "Weichteil-Débridement / Spüldrainage", min: 0, max: 20 },
              { id: "o_d2_knochen", label: "Knocheninfekt (Débridement, Sequesterektomie)", min: 0, max: 20 },
            ]
          },
          {
            id: "od_nerven", label: "Nervenchirurgie",
            note: "Min. 5, Max. 50",
            items: [
              { id: "o_d3_ulnaris", label: "Ulnarisverlagerung", min: 0, max: 50 },
              { id: "o_d3_medianus", label: "Dekompression N. medianus (Hand)", min: 0, max: 50 },
              { id: "o_d3_tibialis", label: "Dekompression N. tibialis (Fuss)", min: 0, max: 50 },
              { id: "o_d3_naht", label: "Nervennaht / -Rekonstruktion (alle Regionen)", min: 0, max: 50 },
            ]
          },
          {
            id: "od_knochen", label: "Knochen / Weichteile / Amputation",
            note: "Min. 5, Max. 30",
            items: [
              { id: "o_d4_pseudarthrose", label: "Pseudarthrosenbehandlung / Knochenentnahme", min: 0, max: 20 },
              { id: "o_d4_kompartment", label: "Kompartmentspaltung", min: 0, max: 20 },
              { id: "o_d4_bursa", label: "Bursektomie", min: 0, max: 20 },
              { id: "o_d4_amputation", label: "Amputation", min: 0, max: 10 },
            ]
          },
          {
            id: "od_zugang", label: "Zugang / Metallentfernung",
            note: "Max. 100 anrechenbar",
            items: [
              { id: "o_d5_zugang", label: "Zugang mit oder ohne Metallentfernung", min: 0, max: 100 },
            ]
          },
        ]
      },
      {
        id: "o_region", label: "Nebenkriterium – Anatomische Region", min: 175,
        note: "Wird automatisch aus Teil 4 Osteosynthesen berechnet (nur Rolle V)",
        regional: true,
        regions: [
          {
            id: "oreg_obere", label: "Obere Extremität",
            items: [
              { id: "r_schulterguertel", label: "Schultergürtel (Clavicula, Scapula, AC-/SC-Gelenk)", min: 5 },
              { id: "r_schultergelenk", label: "Schultergelenk", min: 10 },
              { id: "r_oberarm", label: "Oberarm", min: 5 },
              { id: "r_ellbogen", label: "Ellbogengelenk", min: 10 },
              { id: "r_vorderarm", label: "Vorderarm", min: 10 },
              { id: "r_handgelenk", label: "Handgelenk / Karpus", min: 20 },
              { id: "r_hand", label: "Hand MC, P1–3", min: 20 },
            ]
          },
          {
            id: "oreg_rumpf", label: "Rumpf / Becken",
            items: [
              { id: "r_acetabulum", label: "Acetabulum / Beckenring / Wirbelsäule", min: 2 },
            ]
          },
          {
            id: "oreg_untere", label: "Untere Extremität",
            items: [
              { id: "r_hueft", label: "Hüftgelenk", min: 15 },
              { id: "r_oberschenkel", label: "Oberschenkel", min: 10 },
              { id: "r_knie", label: "Kniegelenk", min: 30 },
              { id: "r_unterschenkel", label: "Unterschenkel", min: 10 },
              { id: "r_osg", label: "OSG / USG / Tarsus", min: 10 },
              { id: "r_fuss", label: "Fuss MT, P1–3", min: 15 },
            ]
          },
        ]
      },
    ]
  },

  hand: {
    label: "Handchirurgie",
    color: "#fb923c",
    type: "flat",
    sections: [
      {
        id: "h_nichtop", label: "Nicht-operative Therapie", min: 159,
        items: [
          { id: "h_n1", label: "Primäre Behandlung Handverletzungen", min: 100 },
          { id: "h_n2", label: "Abklärung Rheuma-/Systemerkrankungen", min: 10 },
          { id: "h_n3", label: "Interdisziplinäres Konzept bösartige Tumore", min: 5 },
          { id: "h_n4", label: "Konservative Behandlung Infektionen", min: 5 },
          { id: "h_n5", label: "Beurteilung angeborene Fehlbildungen", min: 5 },
          { id: "h_n6", label: "Behandlung CRPS", min: 10 },
          { id: "h_n7", label: "Konservative Behandlung degenerativer Pathologien", min: 20 },
          { id: "h_n8", label: "Konservative Behandlung Epicondylitis", min: 4 },
        ]
      },
      {
        id: "h_infekt", label: "Operative – Infektionen & Dupuytren", min: 61,
        items: [
          { id: "h_i1", label: "Wundinfektion obere Extremität", min: 10 },
          { id: "h_i2", label: "Paronychie, Panaritium", min: 20 },
          { id: "h_i3", label: "Beugesehneninfektion (Empyem)", min: 10 },
          { id: "h_i4", label: "Dupuytren operative Erstbehandlung", min: 15 },
          { id: "h_i5", label: "Dupuytren interventionell (Fasziotomie, enzymatisch)", min: 6 },
        ]
      },
      {
        id: "h_weich", label: "Operative – Weichteile & Tumore", min: 69,
        items: [
          { id: "h_w1", label: "Tendovaginitis de Quervain", min: 10 },
          { id: "h_w2", label: "Tendovaginitis stenosans", min: 20 },
          { id: "h_w3", label: "Sehnenscheidenganglion", min: 5 },
          { id: "h_w4", label: "Carpale Ganglien", min: 10 },
          { id: "h_w5", label: "Tumore Weichteile (benigne/maligne, exkl. Ganglien)", min: 10 },
          { id: "h_w6", label: "Tumore Knochen/Gelenke", min: 4 },
          { id: "h_w7", label: "Resektion tumorähnlicher Veränderungen (Gicht)", min: 10 },
        ]
      },
      {
        id: "h_nerven", label: "Operative – Nerven", min: 96,
        items: [
          { id: "h_nerv1", label: "Naht Nervenast", min: 20 },
          { id: "h_nerv2", label: "Naht Nervenstamm", min: 4 },
          { id: "h_nerv3", label: "Transplantation Nervenast", min: 2 },
          { id: "h_nerv4", label: "Transplantation Nervenstamm (nur A)", min: 0, assistOnly: true },
          { id: "h_nerv5", label: "Dekompression N. medianus (CTS)", min: 40 },
          { id: "h_nerv6", label: "Dekompression N. ulnaris Sulcus ulnaris", min: 6 },
          { id: "h_nerv7", label: "Andere Kompressionsneuropathien", min: 4 },
          { id: "h_nerv8", label: "Neurolyse (exkl. CTS)", min: 10 },
          { id: "h_nerv9", label: "Nervenersatzoperation motorisch (Sehnentransfer)", min: 2 },
          { id: "h_nerv10", label: "Schmerzhaftes Neurom", min: 8 },
          { id: "h_nerv11", label: "Plexus brachialis (nur A)", min: 0, assistOnly: true },
        ]
      },
      {
        id: "h_haut", label: "Operative – Haut, Gefässe, Trauma", min: 68,
        items: [
          { id: "h_h1", label: "Freies Hauttransplantat (Spalthaut, Vollhaut, Nagelbett)", min: 10 },
          { id: "h_h2", label: "Lokale Lappenplastik", min: 12 },
          { id: "h_h3", label: "Axial gestielt / frei / mikrovaskulär", min: 4 },
          { id: "h_h4", label: "Mikrochirurgische Anastomose Arterie/Vene", min: 16 },
          { id: "h_h5", label: "Replantation / Revaskularisation bei Ischämie", min: 4 },
          { id: "h_h6", label: "Andere Gefässeingriffe (nur A)", min: 0, assistOnly: true },
          { id: "h_h7", label: "Amputation / Stumpfbildung / Revision", min: 12 },
          { id: "h_h8", label: "Verbrennung / Verätzung / Stromverletzung / Kompartment", min: 10 },
        ]
      },
      {
        id: "h_sehnen", label: "Operative – Sehnen", min: 71,
        items: [
          { id: "h_s1", label: "Naht Beugesehne Digitalkanal Zone 2", min: 16 },
          { id: "h_s2", label: "Naht Strecksehne / Beugesehne ausserhalb Digitalkanal", min: 30 },
          { id: "h_s3", label: "Tenolyse Beuge-/Strecksehne", min: 10 },
          { id: "h_s4", label: "Sehnenrekonstruktion (inkl. Transfer/Interponat)", min: 10 },
          { id: "h_s5", label: "Andere Sehnenrekonstruktionen (Swan-Neck, Boutonnière)", min: 5 },
        ]
      },
      {
        id: "h_knochen", label: "Operative – Knochen", min: 95,
        items: [
          { id: "h_k1", label: "Geschlossene op. Frakturbehandlung (perk. K-Draht, Fixateur)", min: 20 },
          { id: "h_k2", label: "Op. Frakturbehandlung Metacarpalia", min: 20 },
          { id: "h_k3", label: "Op. Frakturbehandlung Phalangen", min: 20 },
          { id: "h_k4", label: "Operation an Carpalia", min: 10 },
          { id: "h_k5", label: "Pseudarthrosen / Korrekturosteotomien", min: 5 },
          { id: "h_k6", label: "Op. Versorgung Radiusfrakturen (extra-/intraartikulär)", min: 15 },
          { id: "h_k7", label: "Vorderarmfraktur / Radius-Ulna / Kombinationsverletzungen", min: 5 },
        ]
      },
      {
        id: "h_gelenke", label: "Operative – Gelenke", min: 101,
        items: [
          { id: "h_g1", label: "Bandnaht/-reinsertion carpal (SL, LT)", min: 5 },
          { id: "h_g2", label: "TFCC-Naht/Refixation/Rekonstruktion", min: 5 },
          { id: "h_g3", label: "Bandnaht/-refixation/-rekonstruktion Hand (übrige)", min: 12 },
          { id: "h_g4", label: "Arthrolysen / Synovektomien", min: 15 },
          { id: "h_g5", label: "CMC I – Arthrose (Trapezektomie etc.)", min: 15 },
          { id: "h_g6", label: "Arthroplastik Hand / Handgelenk (exkl. CMC I)", min: 5 },
          { id: "h_g7", label: "Arthrodesen Phalangen", min: 10 },
          { id: "h_g8", label: "Arthrodese Handgelenk / Proximal Row Carpectomy", min: 5 },
          { id: "h_g9", label: "Op. Behandlung Luxation (Finger, Handgelenk)", min: 4 },
          { id: "h_g10", label: "Denervation (Finger, Handgelenk, Ellbogen)", min: 5 },
          { id: "h_g11", label: "Arthroskopie Hand und Handgelenk", min: 20 },
        ]
      },
    ]
  }
};

// ─── FLAT ITEM LOOKUP ─────────────────────────────────────────────────────────

const ALL_ITEMS = {};
Object.entries(CATALOG).forEach(([spId, sp]) => {
  sp.sections.forEach(sec => {
    const items = sp.type === "hierarchical"
      ? sec.regions.flatMap(r => r.items)
      : sec.items;
    items.forEach(item => {
      ALL_ITEMS[item.id] = { ...item, specialty: spId, sectionId: sec.id, sectionLabel: sec.label, specialtyLabel: sp.label };
    });
  });
});

// ─── OSTEOSYNTHESE → ANATOMISCHE REGION MAPPING ──────────────────────────────
// Only Teil 4 Osteosynthese items (o_s*) count toward the regional nebenkriterium.
// Only role V counts (per SIWF: "als Operateur").
// One case can cover multiple regions if multiple bones tagged.
// Bilateral = two separate case entries by the user.

const OSTEO_TO_REGION = {
  // Diametaphysär Gr.1 – lange Röhrenknochen
  o_s1_femur:    "r_oberschenkel",
  o_s1_tibia:    "r_unterschenkel",
  o_s1_humerus:  "r_oberarm",
  o_s1_radius:   "r_vorderarm",
  o_s1_ulna:     "r_vorderarm",
  // Diametaphysär Gr.2 – kurze Knochen
  o_s2_clavicula: "r_schulterguertel",
  o_s2_scapula:   "r_schulterguertel",
  o_s2_ac:        "r_schulterguertel",
  o_s2_sc:        "r_schulterguertel",
  o_s2_mc:        "r_hand",
  o_s2_mt:        "r_fuss",
  // Artikulär Gr.3 – grosse Gelenke
  o_s3_femur:    "r_hueft",       // proximal femur = Hüftgelenk
  o_s3_patella:  "r_knie",
  o_s3_tibia:    "r_knie",        // proximal tibia = Kniegelenk
  o_s3_glenoid:  "r_schultergelenk",
  o_s3_humerus:  "r_schultergelenk", // proximal humerus = Schultergelenk
  o_s3_radius:   "r_handgelenk",  // distal radius = Handgelenk/Karpus
  o_s3_ulna:     "r_ellbogen",    // olecranon = Ellbogengelenk
  // Artikulär Gr.4 – kleine Gelenke
  o_s4_malleolus:   "r_osg",
  o_s4_fusswurzel:  "r_osg",      // Tarsus/OSG region
  o_s4_handwurzel:  "r_handgelenk",
  // Stammskelett
  o_s5_acetabulum: "r_acetabulum",
  o_s5_becken:     "r_acetabulum",
  o_s5_ws:         "r_acetabulum", // Wirbelsäule → same region bucket
};

// Derive regional counts from osteosynthese tags (V only)
function computeRegionalCounts(cases) {
  const regional = {};
  cases.forEach(c => {
    if (c.role !== "V") return; // only Verantwortlich counts
    c.tags.forEach(tag => {
      const region = OSTEO_TO_REGION[tag];
      if (region) {
        regional[region] = (regional[region] || 0) + 1;
      }
    });
  });
  return regional;
}

// ─── STORAGE (Supabase) ───────────────────────────────────────────────────────

async function loadCases() {
  try {
    const { data, error } = await supabase
      .from("cases")
      .select("*")
      .order("date", { ascending: false });
    if (error) throw error;
    // tags is stored as JSON string in DB, parse it back
    return (data || []).map(row => ({
      ...row,
      tags: typeof row.tags === "string" ? JSON.parse(row.tags) : (row.tags || [])
    }));
  } catch (e) {
    console.error("Load error:", e);
    return [];
  }
}

async function insertCase(entry) {
  try {
    const { error } = await supabase
      .from("cases")
      .insert([{ ...entry, tags: JSON.stringify(entry.tags) }]);
    if (error) throw error;
  } catch (e) { console.error("Insert error:", e); }
}

async function deleteCase(id) {
  try {
    const { error } = await supabase
      .from("cases")
      .delete()
      .eq("id", id);
    if (error) throw error;
  } catch (e) { console.error("Delete error:", e); }
}

// ─── HELPERS ─────────────────────────────────────────────────────────────────

function today() { return new Date().toISOString().slice(0, 10); }
function formatDate(iso) {
  if (!iso) return "";
  const [y, m, d] = iso.split("-");
  return `${d}.${m}.${y}`;
}
function computeCounts(cases) {
  const counts = {};
  cases.forEach(c => {
    c.tags.forEach(tag => {
      if (!counts[tag]) counts[tag] = { V: 0, I: 0, A: 0 };
      counts[tag][c.role] = (counts[tag][c.role] || 0) + 1;
    });
  });
  return counts;
}
function effectiveCount(counts, itemId) {
  const c = counts[itemId] || { V: 0, I: 0, A: 0 };
  return c.V + c.I;
}

// ─── SHARED STYLES ────────────────────────────────────────────────────────────

const ROLE_COLORS = { V: "#22c55e", I: "#f59e0b", A: "#64748b" };
const ROLE_LABELS = { V: "Verantwortlich", I: "Instruierend", A: "Assistenz" };

const labelStyle = {
  display: "block", fontSize: 11, fontWeight: 600, letterSpacing: "0.06em",
  textTransform: "uppercase", color: "#475569", marginBottom: 6
};
const inputStyle = {
  width: "100%", padding: "11px 12px", borderRadius: 8,
  border: "1px solid #1e293b", background: "#0d1829",
  color: "#e2e8f0", fontSize: 14, outline: "none", boxSizing: "border-box",
  fontFamily: "inherit"
};
const primaryBtn = (color, disabled) => ({
  flex: 1, padding: "13px 0", borderRadius: 8, border: "none",
  background: disabled ? "#1e293b" : color,
  color: disabled ? "#334155" : "#0f172a",
  cursor: disabled ? "not-allowed" : "pointer",
  fontSize: 14, fontWeight: 700, transition: "all 0.2s", width: "100%"
});

function RoleBadge({ role, small }) {
  return (
    <span style={{
      display: "inline-block", padding: small ? "1px 6px" : "2px 8px",
      borderRadius: 4, fontSize: small ? 10 : 11, fontWeight: 700,
      background: ROLE_COLORS[role] + "22", color: ROLE_COLORS[role],
      border: `1px solid ${ROLE_COLORS[role]}44`,
      fontFamily: "'JetBrains Mono', monospace", letterSpacing: "0.05em"
    }}>{role}</span>
  );
}

function MiniBar({ value, min, color }) {
  if (!min) return null;
  const pct = Math.min(100, Math.round((value / min) * 100));
  const done = value >= min;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
      <div style={{ flex: 1, height: 4, borderRadius: 2, background: "#1e293b" }}>
        <div style={{ width: `${pct}%`, height: "100%", borderRadius: 2, background: done ? "#22c55e" : color, transition: "width 0.3s" }} />
      </div>
      <span style={{ fontSize: 10, minWidth: 36, textAlign: "right", color: done ? "#22c55e" : "#64748b", fontFamily: "'JetBrains Mono', monospace" }}>
        {value}/{min}
      </span>
    </div>
  );
}

// ─── HIERARCHICAL TAG PICKER (Ortho) ─────────────────────────────────────────

function OrthoTagPicker({ sp, tags, onToggle, search }) {
  const [openSection, setOpenSection] = useState(null);
  const [openRegion, setOpenRegion] = useState(null);
  const color = sp.color;

  // if searching, flatten everything and show matching items only
  if (search) {
    const q = search.toLowerCase();
    return (
      <div>
        {sp.sections.filter(sec => !sec.regional).map(sec => {
          const matchingRegions = sec.regions
            .map(reg => ({
              ...reg,
              items: reg.items.filter(item => item.label.toLowerCase().includes(q) || sec.label.toLowerCase().includes(q) || reg.label.toLowerCase().includes(q))
            }))
            .filter(reg => reg.items.length > 0);
          if (!matchingRegions.length) return null;
          return (
            <div key={sec.id} style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color, marginBottom: 6, letterSpacing: "0.08em", textTransform: "uppercase" }}>{sec.label}</div>
              {matchingRegions.map(reg => (
                <div key={reg.id} style={{ marginBottom: 6, paddingLeft: 8 }}>
                  <div style={{ fontSize: 11, color: "#475569", marginBottom: 4 }}>{reg.label}</div>
                  {reg.items.map(item => <TagItem key={item.id} item={item} selected={tags.includes(item.id)} onToggle={onToggle} color={color} />)}
                </div>
              ))}
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div>
      {sp.sections.filter(sec => !sec.regional).map(sec => {
        const isSecOpen = openSection === sec.id;
        const secSelectedCount = sec.regions.flatMap(r => r.items).filter(i => tags.includes(i.id)).length;

        return (
          <div key={sec.id} style={{ marginBottom: 4 }}>
            {/* Level 1: Teil */}
            <button onClick={() => {
              setOpenSection(isSecOpen ? null : sec.id);
              setOpenRegion(null);
            }} style={{
              width: "100%", padding: "10px 12px", borderRadius: 8,
              border: `1px solid ${isSecOpen ? color + "66" : "#1e293b"}`,
              background: isSecOpen ? color + "12" : "#0d1829",
              color: isSecOpen ? "#e2e8f0" : "#94a3b8",
              cursor: "pointer", textAlign: "left",
              display: "flex", justifyContent: "space-between", alignItems: "center",
              transition: "all 0.15s"
            }}>
              <div>
                <span style={{ fontSize: 13, fontWeight: 700 }}>{sec.label}</span>
                {sec.note && <span style={{ fontSize: 10, color: "#475569", marginLeft: 8 }}>{sec.note}</span>}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                {secSelectedCount > 0 && (
                  <span style={{ fontSize: 11, background: color + "33", color, borderRadius: 10, padding: "1px 7px", fontFamily: "'JetBrains Mono', monospace" }}>
                    {secSelectedCount}
                  </span>
                )}
                <span style={{ color: "#475569", fontSize: 12 }}>{isSecOpen ? "▾" : "▸"}</span>
              </div>
            </button>

            {isSecOpen && (
              <div style={{ paddingLeft: 12, paddingTop: 4, paddingBottom: 4 }}>
                {sec.regions.map(reg => {
                  const isRegOpen = openRegion === reg.id;
                  const regSelectedCount = reg.items.filter(i => tags.includes(i.id)).length;

                  return (
                    <div key={reg.id} style={{ marginBottom: 3 }}>
                      {/* Level 2: Region */}
                      <button onClick={() => setOpenRegion(isRegOpen ? null : reg.id)} style={{
                        width: "100%", padding: "8px 10px", borderRadius: 6,
                        border: `1px solid ${isRegOpen ? color + "44" : "#1a2a3a"}`,
                        background: isRegOpen ? color + "0a" : "#0a1520",
                        color: isRegOpen ? "#cbd5e1" : "#64748b",
                        cursor: "pointer", textAlign: "left",
                        display: "flex", justifyContent: "space-between", alignItems: "center",
                        transition: "all 0.15s"
                      }}>
                        <div>
                          <span style={{ fontSize: 12, fontWeight: 600 }}>{reg.label}</span>
                          {reg.note && <span style={{ fontSize: 10, color: "#334155", marginLeft: 6 }}>{reg.note}</span>}
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
                          {regSelectedCount > 0 && (
                            <span style={{ fontSize: 10, background: color + "22", color, borderRadius: 8, padding: "1px 5px", fontFamily: "'JetBrains Mono', monospace" }}>
                              {regSelectedCount}
                            </span>
                          )}
                          <span style={{ color: "#334155", fontSize: 11 }}>{isRegOpen ? "▾" : "▸"}</span>
                        </div>
                      </button>

                      {isRegOpen && (
                        <div style={{ paddingLeft: 10, paddingTop: 4, paddingBottom: 2 }}>
                          {/* Level 3: Eingriff */}
                          {reg.items.map(item => (
                            <TagItem key={item.id} item={item} selected={tags.includes(item.id)} onToggle={onToggle} color={color} indent />
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function TagItem({ item, selected, onToggle, color, indent }) {
  return (
    <button onClick={() => onToggle(item.id)} style={{
      display: "flex", alignItems: "center", gap: 8,
      width: "100%", textAlign: "left",
      padding: indent ? "7px 10px" : "8px 12px",
      marginBottom: 3, borderRadius: 6,
      border: selected ? `1px solid ${color}` : "1px solid #1e293b",
      background: selected ? color + "18" : "#0f172a",
      color: selected ? "#f1f5f9" : "#94a3b8",
      cursor: "pointer", fontSize: 12, transition: "all 0.1s",
    }}>
      <span style={{
        width: 15, height: 15, borderRadius: 3, flexShrink: 0,
        border: selected ? `2px solid ${color}` : "2px solid #334155",
        background: selected ? color : "transparent",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 9, color: "#fff", lineHeight: 1
      }}>{selected ? "✓" : ""}</span>
      <span style={{ flex: 1 }}>{item.label}</span>
      {item.assistOnly && <span style={{ fontSize: 10, color: "#334155", flexShrink: 0 }}>nur A</span>}
    </button>
  );
}

// ─── FLAT TAG PICKER (Chirurgie / Hand) ───────────────────────────────────────

function FlatTagPicker({ sp, tags, onToggle, search }) {
  const [openSection, setOpenSection] = useState(null);
  const color = sp.color;

  if (search) {
    const q = search.toLowerCase();
    return (
      <div>
        {sp.sections.map(sec => {
          const items = sec.items.filter(i => i.label.toLowerCase().includes(q) || sec.label.toLowerCase().includes(q));
          if (!items.length) return null;
          return (
            <div key={sec.id} style={{ marginBottom: 10 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color, marginBottom: 6, letterSpacing: "0.08em", textTransform: "uppercase" }}>{sec.label}</div>
              {items.map(item => <TagItem key={item.id} item={item} selected={tags.includes(item.id)} onToggle={onToggle} color={color} />)}
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div>
      {sp.sections.map(sec => {
        const isOpen = openSection === sec.id;
        const selCount = sec.items.filter(i => tags.includes(i.id)).length;
        return (
          <div key={sec.id} style={{ marginBottom: 4 }}>
            <button onClick={() => setOpenSection(isOpen ? null : sec.id)} style={{
              width: "100%", padding: "10px 12px", borderRadius: 8,
              border: `1px solid ${isOpen ? color + "66" : "#1e293b"}`,
              background: isOpen ? color + "12" : "#0d1829",
              color: isOpen ? "#e2e8f0" : "#94a3b8",
              cursor: "pointer", textAlign: "left",
              display: "flex", justifyContent: "space-between", alignItems: "center",
              transition: "all 0.15s"
            }}>
              <div>
                <span style={{ fontSize: 13, fontWeight: 700 }}>{sec.label}</span>
                {sec.optional && <span style={{ fontSize: 10, color: "#475569", marginLeft: 8 }}>Wahlmodul</span>}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                {selCount > 0 && (
                  <span style={{ fontSize: 11, background: color + "33", color, borderRadius: 10, padding: "1px 7px", fontFamily: "'JetBrains Mono', monospace" }}>
                    {selCount}
                  </span>
                )}
                <span style={{ color: "#475569", fontSize: 12 }}>{isOpen ? "▾" : "▸"}</span>
              </div>
            </button>
            {isOpen && (
              <div style={{ paddingLeft: 12, paddingTop: 4, paddingBottom: 4 }}>
                {sec.items.map(item => <TagItem key={item.id} item={item} selected={tags.includes(item.id)} onToggle={onToggle} color={color} />)}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── ADD CASE VIEW ────────────────────────────────────────────────────────────

function AddCaseView({ onSave }) {
  const [step, setStep] = useState(1);
  const [fallnr, setFallnr] = useState("");
  const [date, setDate] = useState(today());
  const [role, setRole] = useState("V");
  const [note, setNote] = useState("");
  const [tags, setTags] = useState([]);
  const [search, setSearch] = useState("");
  const [activeSpec, setActiveSpec] = useState("chirurgie");
  const [saved, setSaved] = useState(false);

  const toggleTag = (id) => setTags(prev => prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]);

  const handleSave = () => {
    if (!date) return;
    onSave({ id: Date.now().toString(), fallnr, date, role, note, tags });
    setSaved(true);
    setTimeout(() => {
      setFallnr(""); setDate(today()); setRole("V");
      setNote(""); setTags([]); setSearch(""); setStep(1); setSaved(false);
    }, 900);
  };

  const totalSelected = tags.length;

  return (
    <div style={{ maxWidth: 560, margin: "0 auto", padding: "0 16px 80px" }}>
      {/* Step bar */}
      <div style={{ display: "flex", gap: 8, marginBottom: 24, marginTop: 8 }}>
        {[1, 2].map(s => (
          <div key={s} onClick={() => setStep(s)} style={{
            flex: 1, height: 3, borderRadius: 2, cursor: "pointer",
            background: step >= s ? "#60a5fa" : "#1e293b", transition: "background 0.2s"
          }} />
        ))}
      </div>

      {step === 1 && (
        <div>
          <h2 style={{ margin: "0 0 20px", fontSize: 18, fontWeight: 700, color: "#f1f5f9" }}>Eingriff erfassen</h2>
          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}>Fallnummer</label>
            <input value={fallnr} onChange={e => setFallnr(e.target.value)} placeholder="z.B. 13224607" style={inputStyle} />
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}>Datum</label>
            <input type="date" value={date} onChange={e => setDate(e.target.value)} style={inputStyle} />
          </div>
          <div style={{ marginBottom: 20 }}>
            <label style={labelStyle}>Funktion</label>
            <div style={{ display: "flex", gap: 8 }}>
              {["V", "I", "A"].map(r => (
                <button key={r} onClick={() => setRole(r)} style={{
                  flex: 1, padding: "12px 0", borderRadius: 8, border: "none", cursor: "pointer",
                  fontWeight: 700, fontSize: 14,
                  background: role === r ? ROLE_COLORS[r] + "22" : "#1e293b",
                  color: role === r ? ROLE_COLORS[r] : "#475569",
                  outline: role === r ? `2px solid ${ROLE_COLORS[r]}` : "none",
                  transition: "all 0.15s"
                }}>
                  {r}
                  <div style={{ fontSize: 10, fontWeight: 400, marginTop: 2, opacity: 0.7 }}>{ROLE_LABELS[r].slice(0, 10)}</div>
                </button>
              ))}
            </div>
          </div>
          <div style={{ marginBottom: 24 }}>
            <label style={labelStyle}>Freitext / Operation (optional)</label>
            <textarea value={note} onChange={e => setNote(e.target.value)} placeholder="z.B. Laparoskopische Appendektomie..." rows={2} style={{ ...inputStyle, resize: "none" }} />
          </div>
          <button onClick={() => setStep(2)} style={primaryBtn("#60a5fa")}>
            Kategorien auswählen →
          </button>
        </div>
      )}

      {step === 2 && (
        <div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
            <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: "#f1f5f9" }}>Kategorien</h2>
            <span style={{ fontSize: 12, color: "#60a5fa", fontFamily: "'JetBrains Mono', monospace" }}>{totalSelected} gewählt</span>
          </div>
          <p style={{ fontSize: 12, color: "#64748b", margin: "0 0 12px" }}>
            Ein Eingriff kann mehreren Fachgebieten und Kategorien zugeordnet werden.
          </p>

          {/* Specialty tabs */}
          <div style={{ display: "flex", gap: 6, marginBottom: 12 }}>
            {Object.entries(CATALOG).map(([id, s]) => {
              const selCount = s.type === "hierarchical"
                ? s.sections.flatMap(sec => sec.regions.flatMap(r => r.items)).filter(i => tags.includes(i.id)).length
                : s.sections.flatMap(sec => sec.items).filter(i => tags.includes(i.id)).length;
              return (
                <button key={id} onClick={() => setActiveSpec(id)} style={{
                  flex: 1, padding: "7px 4px", borderRadius: 8, border: "none", cursor: "pointer",
                  fontWeight: 600, fontSize: 11,
                  background: activeSpec === id ? s.color + "22" : "#1e293b",
                  color: activeSpec === id ? s.color : "#475569",
                  outline: activeSpec === id ? `1px solid ${s.color}` : "none",
                  transition: "all 0.15s", position: "relative"
                }}>
                  {s.label.split(" / ")[0]}
                  {selCount > 0 && (
                    <span style={{
                      position: "absolute", top: -4, right: -2,
                      background: s.color, color: "#0f172a",
                      borderRadius: 8, fontSize: 9, fontWeight: 700,
                      padding: "1px 4px", fontFamily: "'JetBrains Mono', monospace"
                    }}>{selCount}</span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Search */}
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Suchen…" style={{ ...inputStyle, marginBottom: 10 }} />

          {/* Picker */}
          <div style={{ maxHeight: "42vh", overflowY: "auto", paddingRight: 2 }}>
            {CATALOG[activeSpec].type === "hierarchical"
              ? <OrthoTagPicker sp={CATALOG[activeSpec]} tags={tags} onToggle={toggleTag} search={search} />
              : <FlatTagPicker sp={CATALOG[activeSpec]} tags={tags} onToggle={toggleTag} search={search} />
            }
          </div>

          <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
            <button onClick={() => setStep(1)} style={{
              flex: 1, padding: "13px 0", borderRadius: 8, border: "1px solid #1e293b",
              background: "transparent", color: "#64748b", cursor: "pointer", fontSize: 14, fontWeight: 600
            }}>← Zurück</button>
            <button onClick={handleSave} disabled={tags.length === 0} style={primaryBtn(saved ? "#22c55e" : "#60a5fa", tags.length === 0)}>
              {saved ? "✓ Gespeichert" : "Speichern"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── PROGRESS VIEW ────────────────────────────────────────────────────────────

function ProgressView({ cases }) {
  const [activeSpec, setActiveSpec] = useState("chirurgie");
  const counts = useMemo(() => computeCounts(cases), [cases]);
  const regionalCounts = useMemo(() => computeRegionalCounts(cases), [cases]);
  const sp = CATALOG[activeSpec];

  return (
    <div style={{ maxWidth: 600, margin: "0 auto", padding: "0 16px 80px" }}>
      <div style={{ display: "flex", gap: 6, marginTop: 8, marginBottom: 20, flexWrap: "wrap" }}>
        {Object.entries(CATALOG).map(([id, s]) => (
          <button key={id} onClick={() => setActiveSpec(id)} style={{
            padding: "7px 14px", borderRadius: 20, border: "none", cursor: "pointer",
            fontWeight: 600, fontSize: 12,
            background: activeSpec === id ? s.color : "#1e293b",
            color: activeSpec === id ? "#0f172a" : "#64748b",
            transition: "all 0.15s"
          }}>{s.label}</button>
        ))}
      </div>

      {sp.sections.map(sec => {
        // Regional section: use derived counts, not manual tags
        const isRegional = sec.regional === true;

        const items = sp.type === "hierarchical"
          ? sec.regions.flatMap(r => r.items)
          : sec.items;

        const getCount = (item) => isRegional
          ? (regionalCounts[item.id] || 0)
          : effectiveCount(counts, item.id);

        const secTotal = items.reduce((s, i) => s + getCount(i), 0);
        const secDone = sec.min ? secTotal >= sec.min : items.every(i => !i.min || getCount(i) >= i.min);

        return (
          <div key={sec.id} style={{
            background: "#0d1829", border: `1px solid ${secDone ? sp.color + "44" : "#1e293b"}`,
            borderRadius: 10, marginBottom: 12, overflow: "hidden"
          }}>
            <div style={{
              padding: "10px 14px 8px", background: "#111f35",
              borderBottom: `2px solid ${sec.regional ? "#f59e0b" : sp.color}`,
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: sec.min ? 7 : 0 }}>
                <div>
                  <span style={{ fontSize: 12, fontWeight: 700, color: secDone ? (sec.regional ? "#f59e0b" : sp.color) : "#cbd5e1" }}>
                    {secDone ? "✓ " : ""}{sec.label}
                  </span>
                  {sec.regional && (
                    <span style={{ fontSize: 10, color: "#f59e0b55", marginLeft: 6 }}>
                      auto · nur V
                    </span>
                  )}
                  {sec.optional && <span style={{ fontSize: 10, color: "#475569", marginLeft: 6 }}>Wahlmodul</span>}
                  {sec.note && <div style={{ fontSize: 10, color: "#334155", marginTop: 1 }}>{sec.note}</div>}
                </div>
                {sec.min ? (
                  <span style={{ fontSize: 11, fontFamily: "'JetBrains Mono', monospace", flexShrink: 0, marginLeft: 12,
                    color: secDone ? (sec.regional ? "#f59e0b" : sp.color) : "#475569" }}>
                    {secTotal} / {sec.min}
                  </span>
                ) : null}
              </div>
              {sec.min ? (
                <div style={{ height: 5, borderRadius: 3, background: "#0d1829", overflow: "hidden" }}>
                  <div style={{
                    height: "100%", borderRadius: 3,
                    width: `${Math.min(100, Math.round((secTotal / sec.min) * 100))}%`,
                    background: secDone ? "#22c55e" : (sec.regional ? "#f59e0b" : sp.color),
                    transition: "width 0.4s ease"
                  }} />
                </div>
              ) : null}
            </div>
            <div style={{ padding: "8px 14px 10px" }}>
              {sp.type === "hierarchical"
                ? sec.regions.map(reg => {
                  const regTotal = reg.items.reduce((s, i) => s + getCount(i), 0);
                  const regMin = reg.items.reduce((s, i) => s + (i.min || 0), 0);
                  const regDone = regMin > 0 && regTotal >= regMin;
                  return (
                  <div key={reg.id} style={{ marginBottom: 12 }}>
                    <div style={{ marginBottom: 5, paddingBottom: 5, borderBottom: "1px solid #0f1f35" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: regMin ? 4 : 0 }}>
                        <span style={{ fontSize: 11, color: regDone ? "#64748b" : "#475569", fontWeight: 600 }}>
                          {reg.label}
                        </span>
                        {regMin > 0 && (
                          <span style={{ fontSize: 10, fontFamily: "'JetBrains Mono', monospace", flexShrink: 0, marginLeft: 8,
                            color: regDone ? "#22c55e" : "#334155" }}>
                            {regTotal}/{regMin}
                          </span>
                        )}
                      </div>
                      {regMin > 0 && (
                        <div style={{ height: 3, borderRadius: 2, background: "#0a1520", overflow: "hidden" }}>
                          <div style={{
                            height: "100%", borderRadius: 2,
                            width: `${Math.min(100, Math.round((regTotal / regMin) * 100))}%`,
                            background: regDone ? "#22c55e" : sp.color + "88",
                            transition: "width 0.3s"
                          }} />
                        </div>
                      )}
                      {reg.note && <div style={{ fontSize: 10, color: "#1e2d40", marginTop: 3 }}>{reg.note}</div>}
                    </div>
                    {reg.items.map(item => {
                      const cnt = getCount(item);
                      const rawC = counts[item.id] || { V: 0, I: 0, A: 0 };
                      const done = !item.min || cnt >= item.min;
                      return (
                        <div key={item.id} style={{ marginBottom: 7 }}>
                          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 2, gap: 8 }}>
                            <span style={{ fontSize: 11, color: done ? "#475569" : "#94a3b8", flex: 1 }}>{item.label}</span>
                            <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>
                              {isRegional
                                ? cnt > 0 && <span style={{ fontSize: 10, fontFamily: "'JetBrains Mono', monospace", color: "#f59e0bcc" }}>V:{cnt}</span>
                                : ["V", "I", "A"].map(r => rawC[r] > 0 && (
                                  <span key={r} style={{ fontSize: 10, fontFamily: "'JetBrains Mono', monospace", color: ROLE_COLORS[r] + "cc" }}>{r}:{rawC[r]}</span>
                                ))
                              }
                            </div>
                          </div>
                          <MiniBar value={cnt} min={item.min} color={sec.regional ? "#f59e0b" : sp.color} />
                        </div>
                      );
                    })}
                  </div>
                  );
                })
                : sec.items.map(item => {
                  const cnt = getCount(item);
                  const rawC = counts[item.id] || { V: 0, I: 0, A: 0 };
                  const done = !item.min || cnt >= item.min;
                  return (
                    <div key={item.id} style={{ marginBottom: 8 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3, gap: 8 }}>
                        <span style={{ fontSize: 12, color: done ? "#64748b" : "#cbd5e1", flex: 1 }}>
                          {item.label}{item.assistOnly && <span style={{ fontSize: 10, color: "#475569" }}> (nur A)</span>}
                        </span>
                        <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>
                          {["V", "I", "A"].map(r => rawC[r] > 0 && (
                            <span key={r} style={{ fontSize: 10, fontFamily: "'JetBrains Mono', monospace", color: ROLE_COLORS[r] + "cc" }}>{r}:{rawC[r]}</span>
                          ))}
                        </div>
                      </div>
                      <MiniBar value={cnt} min={item.min} color={sp.color} />
                    </div>
                  );
                })
              }
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── CASES VIEW ───────────────────────────────────────────────────────────────

function CasesView({ cases, onDelete }) {
  const [filter, setFilter] = useState("");
  const sorted = useMemo(() => [...cases].sort((a, b) => b.date.localeCompare(a.date)), [cases]);
  const filtered = useMemo(() => {
    if (!filter) return sorted;
    const q = filter.toLowerCase();
    return sorted.filter(c =>
      c.fallnr?.toLowerCase().includes(q) ||
      c.note?.toLowerCase().includes(q) ||
      c.tags.some(t => ALL_ITEMS[t]?.label.toLowerCase().includes(q))
    );
  }, [sorted, filter]);

  return (
    <div style={{ maxWidth: 600, margin: "0 auto", padding: "0 16px 80px" }}>
      <input value={filter} onChange={e => setFilter(e.target.value)} placeholder="Suchen…" style={{ ...inputStyle, marginTop: 8, marginBottom: 12 }} />
      <div style={{ fontSize: 12, color: "#475569", marginBottom: 12 }}>{filtered.length} Eingriffe</div>
      {filtered.length === 0 && (
        <div style={{ color: "#334155", fontSize: 14, textAlign: "center", padding: "40px 0" }}>Noch keine Eingriffe erfasst</div>
      )}
      {filtered.map(c => (
        <div key={c.id} style={{ background: "#0d1829", border: "1px solid #1e293b", borderRadius: 10, padding: "12px 14px", marginBottom: 8 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
            <div>
              <span style={{ fontSize: 13, fontWeight: 700, color: "#e2e8f0", fontFamily: "'JetBrains Mono', monospace" }}>{c.fallnr || "—"}</span>
              <span style={{ fontSize: 12, color: "#475569", marginLeft: 10 }}>{formatDate(c.date)}</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <RoleBadge role={c.role} small />
              <button onClick={() => onDelete(c.id)} style={{ background: "none", border: "none", color: "#334155", cursor: "pointer", fontSize: 16, padding: "0 2px" }}>×</button>
            </div>
          </div>
          {c.note && <div style={{ fontSize: 12, color: "#64748b", marginBottom: 6 }}>{c.note}</div>}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
            {c.tags.map(t => {
              const item = ALL_ITEMS[t];
              if (!item) return null;
              const color = CATALOG[item.specialty]?.color || "#60a5fa";
              return (
                <span key={t} style={{ fontSize: 10, padding: "2px 7px", borderRadius: 4, background: color + "18", color, border: `1px solid ${color}33` }}>
                  {item.label}
                </span>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── ROOT ─────────────────────────────────────────────────────────────────────

export default function App() {
  const [cases, setCases] = useState([]);
  const [view, setView] = useState("add");
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadCases().then(c => { setCases(c); setLoading(false); }); }, []);

  const handleSave = useCallback(async (entry) => {
    await insertCase(entry);
    setCases(prev => [entry, ...prev]);
  }, []);

  const handleDelete = useCallback(async (id) => {
    await deleteCase(id);
    setCases(prev => prev.filter(c => c.id !== id));
  }, []);

  if (loading) return (
    <div style={{ minHeight: "100vh", background: "#020c1b", display: "flex", alignItems: "center", justifyContent: "center", color: "#334155", fontSize: 14 }}>Lade…</div>
  );

  return (
    <div style={{ minHeight: "100vh", background: "#020c1b", color: "#e2e8f0", fontFamily: "'IBM Plex Sans', system-ui, sans-serif" }}>
      <div style={{ padding: "16px 20px 12px", background: "#020c1b", borderBottom: "1px solid #0f1f35", position: "sticky", top: 0, zIndex: 10 }}>
        <div style={{ fontSize: 10, letterSpacing: "0.2em", color: "#1d4ed8", textTransform: "uppercase", fontWeight: 700, marginBottom: 2 }}>SIWF</div>
        <div style={{ fontSize: 17, fontWeight: 700, color: "#f1f5f9" }}>Operationslogbuch</div>
      </div>
      <div style={{ paddingTop: 16 }}>
        {view === "add" && <AddCaseView onSave={handleSave} />}
        {view === "progress" && <ProgressView cases={cases} />}
        {view === "cases" && <CasesView cases={cases} onDelete={handleDelete} />}
      </div>
      <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: "#020c1b", borderTop: "1px solid #0f1f35", display: "flex", padding: "8px 0 max(8px, env(safe-area-inset-bottom))" }}>
        {[
          { id: "add", icon: "＋", label: "Erfassen" },
          { id: "progress", icon: "◎", label: "Fortschritt" },
          { id: "cases", icon: "≡", label: `Eingriffe${cases.length ? ` (${cases.length})` : ""}` },
        ].map(tab => (
          <button key={tab.id} onClick={() => setView(tab.id)} style={{ flex: 1, background: "none", border: "none", cursor: "pointer", padding: "6px 0", display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
            <span style={{ fontSize: 18, lineHeight: 1, color: view === tab.id ? "#60a5fa" : "#334155", transition: "color 0.15s" }}>{tab.icon}</span>
            <span style={{ fontSize: 10, fontWeight: 600, color: view === tab.id ? "#60a5fa" : "#334155", letterSpacing: "0.04em" }}>{tab.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
