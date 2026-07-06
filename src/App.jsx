import { useState, useEffect, useCallback, useMemo } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

// ─── CATALOG ──────────────────────────────────────────────────────────────────

const CATALOG = {
  chirurgie: {
    label: "Chirurgie", color: "#60a5fa", type: "flat",
    sections: [
      { id: "notfall", label: "A – Notfallchirurgie", min: 85, items: [
        { id: "c_schockraum", label: "Schockraummanagement", min: 10 },
        { id: "c_reposition", label: "Reposition Luxation/Frakturen, konservative Frakturbehandlung", min: 15 },
        { id: "c_wunde", label: "Wundversorgungen", min: 30 },
        { id: "c_fixateur", label: "Anlage Fixateur externe", min: 5 },
        { id: "c_thorax", label: "Thoraxdrainagen", min: 15 },
        { id: "c_zerviko", label: "Zervikotomien / Tracheafreilegung", min: 5 },
        { id: "c_cystofix", label: "Cystofixeinlage", min: 5 },
      ]},
      { id: "allgemein", label: "B – Allgemeinchirurgie", min: 260, items: [
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
      ]},
      { id: "viszeral", label: "Wahlmodul Viszeralchirurgie", min: 165, optional: true, items: [
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
      ]},
      { id: "trauma_c", label: "Wahlmodul Traumatologie", min: 165, optional: true, items: [
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
      ]},
    ]
  },

  ortho: {
    label: "Orthopädie / Traumatologie", color: "#a78bfa", type: "hierarchical",
    sections: [
      { id: "o_prothetik", label: "Teil 1 – Prothetik", sectionMin: 30, sectionMax: 90,
        note: "Min. 30 · Max. 90 · Assistenz max. 30",
        regions: [
          { id: "op_gr1", label: "Gr. 1 – Primäre Totalprothese grosse Gelenke",
            note: "Hüfte · Knie (inkl. unikompartimental) · Schulter (inkl. invers) · Wirbelsäule (Diskusprothese)",
            items: [{ id: "o_p1", label: "Primäre Totalprothese: Hüfte / Knie / Schulter / Wirbelsäule", min: 20, max: 60 }] },
          { id: "op_gr2", label: "Gr. 2 – Primäre Totalprothese kleine Gelenke",
            note: "Ellbogen · Handgelenk · Fingergelenke · OSG · Zehengelenke",
            items: [{ id: "o_p2", label: "Primäre Totalprothese: Ellbogen / Handgelenk / Finger / OSG / Zehen", min: 0, max: 10 }] },
          { id: "op_gr3", label: "Gr. 3 – Kopfprothesen",
            note: "Hüfte · Knie (sekundäre Patella / femoropatellar) · Schulter",
            items: [{ id: "o_p3", label: "Kopfprothese: Hüfte / Knie / Schulter", min: 0, max: 10 }] },
          { id: "op_gr4", label: "Gr. 4 – Prothesenwechsel & Revision",
            note: "Alle Regionen · Wechsel · Konversion · Ausbau / Girdlestone · Spacer · Wiedereinbau",
            items: [{ id: "o_p4", label: "Prothesenwechsel / Konversion / Spacer / Girdlestone / Wiedereinbau", min: 1, max: 10 }] },
        ]
      },
      { id: "o_osteo_art", label: "Teil 2 – Osteotomien & Arthrodesen", sectionMin: 15, sectionMax: 50,
        note: "Min. 15 · Max. 50 · Assistenz max. 15",
        regions: [
          { id: "oo_gr1", label: "Gr. 1 – Becken / Hüfte",
            note: "Periazetabuläre OT · Triple · Salter/Pemberton · Femur intertrochantär",
            items: [{ id: "o_o1", label: "Becken/Hüfte: Periazetabuläre OT / Triple / Salter/Pemberton / Femur intertrochantär", min: 0, max: 20 }] },
          { id: "oo_gr2", label: "Gr. 2 – Knienahe Achskorrektur",
            note: "Femur distal · Tibia proximal · Korrekturosteotomien (alle ausser Hand/Fuss)",
            items: [{ id: "o_o2", label: "Achsenkorrektur knienahe: Femur distal / Tibia proximal / Korrekturosteotomie", min: 3, max: 10 }] },
          { id: "oo_gr3", label: "Gr. 3 – Hand / Fuss",
            note: "Korrekturosteotomie · Osteotomie bei Hallux valgus",
            items: [{ id: "o_o3", label: "Hand/Fuss: Korrekturosteotomie / Hallux valgus-Osteotomie", min: 5, max: 10 }] },
          { id: "oo_gr4", label: "Gr. 4 – Arthrodesen",
            note: "Alle Techniken · Alle Regionen",
            items: [{ id: "o_o4", label: "Arthrodese (alle Techniken, alle Regionen)", min: 1, max: 10 }] },
        ]
      },
      { id: "o_rekon", label: "Teil 3 – Rekonstruktive Eingriffe", sectionMin: 70, sectionMax: 140,
        note: "Min. 70 · Max. 140 · Assistenz max. 70",
        regions: [
          { id: "or_gr1", label: "Gr. 1 – WS / Hüfte / Knie / Schulter (komplex)",
            note: "WS: Laminektomie/Diskushernie/Spondylodese/Skoliose · Hüfte: FAI/Epiphysiolyse · Knie: VKB/HKB/Meniskusnaht/Patella-Maltracking · Schulter: RMC-Naht/Rekonstruktion/Stabilisation",
            items: [{ id: "o_r1", label: "Gr.1: Wirbelsäule / Hüfte / Knie (VKB, HKB, Meniskusnaht) / Schulter (RMC, Stabilisation)", min: 10, max: 40 }] },
          { id: "or_gr2", label: "Gr. 2 – Knie / Fuss / Schulter / Ellbogen / Handgelenk",
            note: "Knie: Meniskektomie/Knorpel/Streckapparat · Fuss: Sehnenchir./OSG-Instab./Hallux/Hohmann/Ganglion/Exostosen · Schulter: Akromioplastik/Dekompression/Bizeps · Ellbogen: Bandnaht/Epikondylitis · HG/Hand: Sehnenchir./Bandchir./TFCC/Dupuytren/Ganglion",
            items: [{ id: "o_r2", label: "Gr.2: Knie / Fuss / Schulter (Akromio, Dekompression) / Ellbogen / Handgelenk/Hand", min: 30, max: 60 }] },
          { id: "or_gr3", label: "Gr. 3 – Lappenplastiken / Hauttransplantation",
            note: "Alle Regionen · Freie Lappenplastik · Gestielte Hautlappen · Hauttransplantation",
            items: [{ id: "o_r3", label: "Freie Lappenplastik / Hautlappen gestielt / Hauttransplantation", min: 5, max: 40 }] },
          { id: "or_gr4", label: "Gr. 4 – Arthroskopie",
            note: "Alle Regionen",
            items: [{ id: "o_r4", label: "Arthroskopie (alle Regionen)", min: 40, max: 60 }] },
        ]
      },
      { id: "o_synthese", label: "Teil 4 – Osteosynthesen", sectionMin: 65, sectionMax: 240,
        note: "Min. 65 · Max. 240 · Assistenz max. 65",
        regions: [
          { id: "os_gr1", label: "Diametaphysär Gr. 1 – Femur · Tibia · Humerus · Radius · Ulna",
            note: "AO Segment 2, Seg. 1+3 nur Gruppe A · Platte / Marknagel / Fixateur externe",
            items: [{ id: "o_s1", label: "Diametaphysär Gr.1: Femur / Tibia / Humerus / Radius / Ulna", min: 20, max: 70 }] },
          { id: "os_gr2", label: "Diametaphysär Gr. 2 – Clavicula · Scapula · AC · SC · Hand · Fuss",
            note: "Clavicula · Scapula · AC-Luxation · SC-Luxation · Hand MC/P1/P2 · Fuss MT/P1/P2",
            items: [{ id: "o_s2", label: "Diametaphysär Gr.2: Clavicula / Scapula / AC / SC / Hand MC-P / Fuss MT-P", min: 10, max: 40 }] },
          { id: "os_gr3", label: "Artikulär Gr. 3 – Femur · Patella · Tibia · Glenoid · Humerus · Radius · Ulna",
            note: "AO Seg. 1+3 nur Gruppen B+C",
            items: [{ id: "o_s3", label: "Artikulär Gr.3: Femur / Patella / Tibia / Glenoid / Humerus / Radius / Ulna", min: 20, max: 70 }] },
          { id: "os_gr4", label: "Artikulär Gr. 4 – Malleolus · Fusswurzel · Handwurzel",
            note: "Malleolarfraktur · Fusswurzel/Fuss · Handwurzel/Hand",
            items: [{ id: "o_s4", label: "Artikulär Gr.4: Malleolus / Fusswurzel / Handwurzel", min: 10, max: 40 }] },
          { id: "os_gr5", label: "Stammskelett Gr. 5 – Acetabulum · Beckenring · Wirbelsäule",
            note: "Alle Frakturtypen · inkl. C-Clamp · WK-Ersatz · Vertebro-/Kyphoplastik",
            items: [{ id: "o_s5", label: "Stammskelett: Acetabulum / Beckenring / Wirbelsäule", min: 2, max: 20 }] },
          { id: "os_impl", label: "Implantat-Mindestmengen (quer über alle Gruppen)",
            note: "Separat erfassen nach Implantationstyp",
            items: [
              { id: "o_impl_nagel", label: "Marknagel (alle Knochen)", min: 10 },
              { id: "o_impl_platte", label: "Platte (alle Knochen)", min: 20 },
              { id: "o_impl_fixateur", label: "Fixateur externe / K-Draht", min: 10 },
            ]
          },
        ]
      },
      { id: "o_div", label: "Teil 5 – Diverses", sectionMin: 15, sectionMax: 260,
        note: "Min. 15 · Max. 260 · Assistenz max. 20",
        regions: [
          { id: "od_gr1", label: "Gr. 1 – Tumorchirurgie",
            note: "Max. 30 · Exzision maligne/benigne · Knochenmetastase · Biopsie",
            items: [{ id: "o_d1", label: "Tumorchirurgie: Exzision maligne/benigne / Knochenmetastase / Biopsie", min: 0, max: 30 }] },
          { id: "od_gr2", label: "Gr. 2 – Infektchirurgie",
            note: "Min. 5 · Max. 20 · Débridement / Spüldrainage / arthroskopische Spülung",
            items: [{ id: "o_d2", label: "Infektchirurgie: Débridement / Spüldrainage / arthroskopische Spülung", min: 5, max: 20 }] },
          { id: "od_gr3", label: "Gr. 3 – Nervenchirurgie",
            note: "Min. 5 · Max. 50 · Ulnarisverlagerung / Dekompression Medianus/Tibialis / Nervennaht",
            items: [{ id: "o_d3", label: "Nervenchirurgie: Ulnarisverlagerung / Dekompression / Nervennaht/-rekonstruktion", min: 5, max: 50 }] },
          { id: "od_gr4", label: "Gr. 4 – Knochen · Weichteile · Amputation",
            note: "Separate Minima: Pseudarthrose/Knochen Min. 5 · Kompartment/Bursa Min. 5 · Amputation kein Min.",
            items: [
              { id: "o_d4a", label: "Pseudarthrosenbehandlung / Knochenentnahme", min: 5, max: 10 },
              { id: "o_d4b", label: "Kompartmentspaltung / Bursektomie", min: 5, max: 20 },
              { id: "o_d4c", label: "Amputation", min: 0, max: 10 },
            ]
          },
          { id: "od_gr5", label: "Gr. 5 – Zugang / Metallentfernung",
            note: "Max. 100 anrechenbar",
            items: [{ id: "o_d5", label: "Zugang mit oder ohne Metallentfernung", min: 0, max: 100 }] },
        ]
      },
      { id: "o_region", label: "Nebenkriterium – Anatomische Region", sectionMin: 175,
        note: "Automatisch aus Teil 4 Osteosynthesen berechnet (nur Rolle V)",
        regional: true,
        regions: [
          { id: "oreg_rumpf", label: "Rumpf / Becken",
            items: [{ id: "r_acetabulum", label: "Acetabulum / Beckenring / Wirbelsäule", min: 2 }] },
          { id: "oreg_obere", label: "Obere Extremität",
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
          { id: "oreg_untere", label: "Untere Extremität",
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
    label: "Handchirurgie", color: "#fb923c", type: "flat",
    sections: [
      { id: "h_nichtop", label: "Nicht-operative Therapie", min: 159, items: [
        { id: "h_n1", label: "Primäre Behandlung Handverletzungen", min: 100 },
        { id: "h_n2", label: "Abklärung Rheuma-/Systemerkrankungen", min: 10 },
        { id: "h_n3", label: "Interdisziplinäres Konzept bösartige Tumore", min: 5 },
        { id: "h_n4", label: "Konservative Behandlung Infektionen", min: 5 },
        { id: "h_n5", label: "Beurteilung angeborene Fehlbildungen", min: 5 },
        { id: "h_n6", label: "Behandlung CRPS", min: 10 },
        { id: "h_n7", label: "Konservative Behandlung degenerativer Pathologien", min: 20 },
        { id: "h_n8", label: "Konservative Behandlung Epicondylitis", min: 4 },
      ]},
      { id: "h_infekt", label: "Operative – Infektionen & Dupuytren", min: 61, items: [
        { id: "h_i1", label: "Wundinfektion obere Extremität", min: 10 },
        { id: "h_i2", label: "Paronychie, Panaritium", min: 20 },
        { id: "h_i3", label: "Beugesehneninfektion (Empyem)", min: 10 },
        { id: "h_i4", label: "Dupuytren operative Erstbehandlung", min: 15 },
        { id: "h_i5", label: "Dupuytren interventionell (Fasziotomie, enzymatisch)", min: 6 },
      ]},
      { id: "h_weich", label: "Operative – Weichteile & Tumore", min: 69, items: [
        { id: "h_w1", label: "Tendovaginitis de Quervain", min: 10 },
        { id: "h_w2", label: "Tendovaginitis stenosans", min: 20 },
        { id: "h_w3", label: "Sehnenscheidenganglion", min: 5 },
        { id: "h_w4", label: "Carpale Ganglien", min: 10 },
        { id: "h_w5", label: "Tumore Weichteile (benigne/maligne, exkl. Ganglien)", min: 10 },
        { id: "h_w6", label: "Tumore Knochen/Gelenke", min: 4 },
        { id: "h_w7", label: "Resektion tumorähnlicher Veränderungen (Gicht)", min: 10 },
      ]},
      { id: "h_nerven", label: "Operative – Nerven", min: 96, items: [
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
      ]},
      { id: "h_haut", label: "Operative – Haut, Gefässe, Trauma", min: 68, items: [
        { id: "h_h1", label: "Freies Hauttransplantat (Spalthaut, Vollhaut, Nagelbett)", min: 10 },
        { id: "h_h2", label: "Lokale Lappenplastik", min: 12 },
        { id: "h_h3", label: "Axial gestielt / frei / mikrovaskulär", min: 4 },
        { id: "h_h4", label: "Mikrochirurgische Anastomose Arterie/Vene", min: 16 },
        { id: "h_h5", label: "Replantation / Revaskularisation bei Ischämie", min: 4 },
        { id: "h_h6", label: "Andere Gefässeingriffe (nur A)", min: 0, assistOnly: true },
        { id: "h_h7", label: "Amputation / Stumpfbildung / Revision", min: 12 },
        { id: "h_h8", label: "Verbrennung / Verätzung / Stromverletzung / Kompartment", min: 10 },
      ]},
      { id: "h_sehnen", label: "Operative – Sehnen", min: 71, items: [
        { id: "h_s1", label: "Naht Beugesehne Digitalkanal Zone 2", min: 16 },
        { id: "h_s2", label: "Naht Strecksehne / Beugesehne ausserhalb Digitalkanal", min: 30 },
        { id: "h_s3", label: "Tenolyse Beuge-/Strecksehne", min: 10 },
        { id: "h_s4", label: "Sehnenrekonstruktion (inkl. Transfer/Interponat)", min: 10 },
        { id: "h_s5", label: "Andere Sehnenrekonstruktionen (Swan-Neck, Boutonnière)", min: 5 },
      ]},
      { id: "h_knochen", label: "Operative – Knochen", min: 95, items: [
        { id: "h_k1", label: "Geschlossene op. Frakturbehandlung (perk. K-Draht, Fixateur)", min: 20 },
        { id: "h_k2", label: "Op. Frakturbehandlung Metacarpalia", min: 20 },
        { id: "h_k3", label: "Op. Frakturbehandlung Phalangen", min: 20 },
        { id: "h_k4", label: "Operation an Carpalia", min: 10 },
        { id: "h_k5", label: "Pseudarthrosen / Korrekturosteotomien", min: 5 },
        { id: "h_k6", label: "Op. Versorgung Radiusfrakturen (extra-/intraartikulär)", min: 15 },
        { id: "h_k7", label: "Vorderarmfraktur / Radius-Ulna / Kombinationsverletzungen", min: 5 },
      ]},
      { id: "h_gelenke", label: "Operative – Gelenke", min: 101, items: [
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
      ]},
    ]
  },

  gefaess: {
    label: "Gefässchirurgie", color: "#f43f5e", type: "gefaess",
    dualRole: true,
    roleNote: "V + I zählen als Operateur (O) · A = 1. Hand Assistenz · * = kompensierbar · ** = 50% endovaskulär",
    sections: [
      { id: "gf_A", label: "A – Offene Chirurgie der Arterien",
        groups: [
          { id: "gf_1", label: "1 – Chirurgie der supraaortalen Äste", minO: 20, minA: 25, selectable: true,
            subs: [
              { id: "gf_1a", label: "a – Thrombendarterektomie / Eversionsendarterektomie Karotis-Bifurkation", descOnly: true },
              { id: "gf_1b", label: "b – Rekonstruktion der A. carotis communis", descOnly: true },
              { id: "gf_1c", label: "c – Eingriffe an der A. vertebralis", descOnly: true },
              { id: "gf_1d", label: "d – Eingriffe bei symptomatischem Verschluss A. subclavia / Truncus brachiocephalicus", descOnly: true },
            ]
          },
          { id: "gf_2", label: "2 – Arterielle Durchblutungsstörungen obere Extremitäten **", minO: 10, minA: 10, selectable: true, subs: [] },
          { id: "gf_3", label: "3 – Zugangswegechirurgie für Hämodialyse-Patienten", minO: 20, minA: 10, selectable: true,
            subs: [
              { id: "gf_3a", label: "a – Radio-cephale Fistel (Cimino-Brescia Fistel)", descOnly: true },
              { id: "gf_3b", label: "b – Tabatière", descOnly: true },
              { id: "gf_3c", label: "c – Brachio-cephale Fistel / Kunststoff- oder Bioprothese / autologes Veneninterponat", descOnly: true },
              { id: "gf_3d", label: "d – Andere Zugangswege (inkl. tunnelierte Dauerkatheter)", descOnly: true },
            ]
          },
          { id: "gf_4", label: "4 – Eingriffe der Aorta sowie der Viszeral- und Beckenarterien", minO: 36, minA: 44, selectable: false,
            subs: [
              { id: "gf_4a", label: "a – Thorako-abdominales Aneurysma", minO: 0, minA: 3 },
              { id: "gf_4b", label: "b – Viszerale Gefässoperationen (Pfortader nicht inbegriffen)", minO: 0, minA: 3 },
              { id: "gf_4c", label: "c – Eingriffe an den Nierenarterien *", minO: 3, minA: 5 },
              { id: "gf_4d", label: "d – Bauchaortenaneurysma elektiv (AAA)", minO: 20, minA: 20 },
              { id: "gf_4e", label: "e – Bauchaortenaneurysma rupturiert", minO: 5, minA: 5 },
              { id: "gf_4f", label: "f – AAA + Beckenarterienaneurysma", minO: 5, minA: 5 },
              { id: "gf_4g", label: "g – Aorto-iliakale Verschlusskrankheit **", minO: 8, minA: 8 },
            ]
          },
          { id: "gf_5", label: "5 – Rekonstruktive Eingriffe im Bereich der Leiste", minO: 30, minA: 25, selectable: false,
            subs: [
              { id: "gf_5a", label: "a – Extra-anatomische Umleitung", minO: 5, minA: 5 },
              { id: "gf_5b", label: "b – Rekonstruktionen im Bereich der Femoralisgabel", note: "TEA · retrograde iliakale Ringdesobliteration · Profundaplastik", minO: 25, minA: 20 },
            ]
          },
          { id: "gf_6", label: "6 – Infrainguinale Rekonstruktionen bei PAVK **", minO: 30, minA: 30, selectable: false,
            subs: [
              { id: "gf_6a", label: "a – Femoro-poplitealer Bypass supragenual (max. 5 anrechenbar)", minO: 5, minA: 5 },
              { id: "gf_6b", label: "b – Femoro-poplitealer Bypass infragenual", minO: 10, minA: 10 },
              { id: "gf_6c", label: "c – Femoro-infrapoplitealer / cruraler Bypass", minO: 10, minA: 10 },
              { id: "gf_6d", label: "d – Popliteo-distaler / cruraler / pedaler Bypass", note: "in situ · reversed · prothetisch mit Cuff", minO: 5, minA: 5 },
            ]
          },
          { id: "gf_7", label: "7 – Revaskularisation bei akuten arteriellen Verschlüssen **", minO: 20, minA: 20, selectable: true, subs: [] },
          { id: "gf_8", label: "8 – Varia", minO: 10, minA: 15, selectable: false,
            subs: [
              { id: "gf_8a", label: "a – Fasziotomie", minO: 5, minA: 5 },
              { id: "gf_8b", label: "b – Aneurysmachirurgie der unteren Extremitäten", minO: 5, minA: 5 },
              { id: "gf_8c", label: "c – Septische Gefässchirurgie (mykotische Aneurysmen, infizierte Prothesen)", minO: 0, minA: 5 },
            ]
          },
        ]
      },
      { id: "gf_B", label: "B – Chirurgie der Venen",
        groups: [
          { id: "gf_9", label: "9 – Venöse Thrombektomie untere Extremitäten *", minO: 5, minA: 5, selectable: true,
            subs: [
              { id: "gf_9a", label: "a – Ilio-femorale Thrombektomie", descOnly: true },
              { id: "gf_9b", label: "b – Vieretagenthrombektomie", descOnly: true },
              { id: "gf_9c", label: "c – Temporäre arterio-venöse Fistel", descOnly: true },
            ]
          },
          { id: "gf_10", label: "10 – Rekonstruktive Eingriffe am tiefen Venensystem **", minO: 5, minA: 5, selectable: true,
            subs: [
              { id: "gf_10a", label: "a – Cross-over Bypass bei Beckenvenensperre (Palma-Esperon / Cockett)", descOnly: true },
              { id: "gf_10b", label: "b – Rekonstruktion von Klappen am tiefen Venensystem", descOnly: true },
              { id: "gf_10c", label: "c – Transplantation / Transfer klappentragender Venensegmente", descOnly: true },
              { id: "gf_10d", label: "d – Venen-Transposition", descOnly: true },
              { id: "gf_10e", label: "e – Behandlung traumatischer Venenläsionen", descOnly: true },
            ]
          },
          { id: "gf_11", label: "11 – Varizenchirurgie", minO: 60, minA: 20, selectable: false,
            subs: [
              { id: "gf_11a", label: "a – Crossektomie", descOnly: true },
              { id: "gf_11b", label: "b – Varizenkonvolutausräumung", descOnly: true },
              { id: "gf_11c", label: "c – Stripping der V. saphena magna und/oder parva", descOnly: true },
              { id: "gf_11d", label: "d – Perforantenunterbrechung", descOnly: true },
              { id: "gf_11e", label: "e – Kombination von a–d", descOnly: true },
              { id: "gf_11f", label: "f – Endovenöse Varizeneingriffe", minO: 10, minA: 0 },
            ]
          },
          { id: "gf_12", label: "12 – Eingriffe bei postthrombotischem Syndrom", minO: 5, minA: 5, selectable: true,
            subs: [
              { id: "gf_12a", label: "a – Ulcusexzision mit Fasziektomie und plastischer Deckung", descOnly: true },
              { id: "gf_12b", label: "b – Endoskopische Ligatur von Vv. Perforantes", descOnly: true },
              { id: "gf_12c", label: "c – Endoskopische paratibiale Fasziotomie", descOnly: true },
            ]
          },
        ]
      },
      { id: "gf_C", label: "C – Besondere Eingriffe",
        groups: [
          { id: "gf_13", label: "13 – Amputationen", minO: 10, minA: 5, selectable: true,
            subs: [
              { id: "gf_13a", label: "a – Kleine Amputationen (Zehen, Mittelfuss)", descOnly: true },
              { id: "gf_13b", label: "b – Grosse Amputationen (Unterschenkel / Oberschenkel)", descOnly: true },
            ]
          },
          { id: "gf_14", label: "14 – Indirekt hyperämisierende Massnahmen – Sympathektomien", minO: 0, minA: 0, selectable: true,
            subs: [
              { id: "gf_14a", label: "a – Thorakale Sympathektomie", descOnly: true },
              { id: "gf_14b", label: "b – Lumbale Sympathektomie", descOnly: true },
            ]
          },
          { id: "gf_15", label: "15 – Operationen bei Kompressionssyndromen *", minO: 2, minA: 4, selectable: true,
            subs: [
              { id: "gf_15a", label: "a – Thoracic outlet syndrome", descOnly: true },
              { id: "gf_15b", label: "b – Entrapment syndrome", descOnly: true },
            ]
          },
          { id: "gf_16", label: "16 – Eingriffe bei Angiodysplasie", minO: 0, minA: 0, selectable: true, subs: [] },
          { id: "gf_17", label: "17 – Operative Behandlung bei Erkrankungen des Lymphabflusses", minO: 0, minA: 0, selectable: true, subs: [] },
        ]
      },
      { id: "gf_D", label: "D – Endovaskuläre Eingriffe",
        note: "Auch bei Kombinationseingriffen anrechenbar",
        groups: [
          { id: "gf_18", label: "18 – Angiographie (arteriell u. venös)", minO: 30, minA: 20, selectable: true, subs: [] },
          { id: "gf_19", label: "19 – Angioplastie / Stent / Katheterthrombektomie / Lyse / Hybrid-Eingriffe", minO: 30, minA: 20, selectable: true, subs: [] },
          { id: "gf_20", label: "20 – Stent-Graft in der Aorta", minO: 10, minA: 10, selectable: true, subs: [] },
        ]
      },
    ]
  }

};

// ─── FLAT ITEM LOOKUP ─────────────────────────────────────────────────────────

const ALL_ITEMS = {};
Object.entries(CATALOG).forEach(([spId, sp]) => {
  sp.sections.forEach(sec => {
    let items = [];
    if (sp.type === "hierarchical") {
      items = sec.regions.flatMap(r => r.items);
    } else if (sp.type === "gefaess") {
      // gefaess: group IDs are the primary taggable items; subs are for display only
      items = sec.groups.map(g => ({ id: g.id, label: g.label, minO: g.minO, minA: g.minA, note: g.note }));
    } else {
      items = sec.items;
    }
    items.forEach(item => {
      ALL_ITEMS[item.id] = { ...item, specialty: spId, sectionId: sec.id, sectionLabel: sec.label, specialtyLabel: sp.label, dualRole: !!sp.dualRole };
    });
  });
});

// ─── OSTEOSYNTHESE → REGION OPTIONS ──────────────────────────────────────────
// When a user tags an Osteosynthese group, a follow-up region picker appears
// so the r_* tags get added automatically. This drives the Nebenkriterium.
// Only role V is counted for regional totals.

const OSTEO_GROUP_REGIONS = {
  o_s1: [
    // Diametaphysär Gr.1: Femur/Tibia/Humerus/Radius/Ulna
    { id: "r_oberschenkel",  label: "Femur → Oberschenkel" },
    { id: "r_unterschenkel", label: "Tibia → Unterschenkel" },
    { id: "r_oberarm",       label: "Humerus → Oberarm" },
    { id: "r_vorderarm",     label: "Radius/Ulna → Vorderarm" },
  ],
  o_s2: [
    // Diametaphysär Gr.2: Clavicula/Scapula/AC/SC/Hand/Fuss
    { id: "r_schulterguertel", label: "Clavicula / Scapula / AC / SC → Schultergürtel" },
    { id: "r_hand",            label: "Hand MC / P1–2 → Hand MC, P1–3" },
    { id: "r_fuss",            label: "Fuss MT / P1–2 → Fuss MT, P1–3" },
  ],
  o_s3: [
    // Artikulär Gr.3: Femur/Patella/Tibia/Glenoid/Humerus/Radius/Ulna
    { id: "r_hueft",          label: "Femur proximal → Hüftgelenk" },
    { id: "r_knie",           label: "Patella / Tibia proximal → Kniegelenk" },
    { id: "r_schultergelenk", label: "Glenoid / Humerus proximal → Schultergelenk" },
    { id: "r_handgelenk",     label: "Radius distal → Handgelenk / Karpus" },
    { id: "r_ellbogen",       label: "Ulna proximal (Olekranon) → Ellbogengelenk" },
  ],
  o_s4: [
    // Artikulär Gr.4: Malleolus/Fusswurzel/Handwurzel
    { id: "r_osg",       label: "Malleolus / Fusswurzel → OSG / USG / Tarsus" },
    { id: "r_handgelenk", label: "Handwurzel / Karpus → Handgelenk / Karpus" },
  ],
  o_s5: [
    // Stammskelett: Acetabulum/Beckenring/Wirbelsäule
    { id: "r_acetabulum", label: "Acetabulum / Beckenring / Wirbelsäule" },
  ],
};

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

function computeRegionalCounts(cases) {
  const regional = {};
  cases.forEach(c => {
    if (c.role !== "V") return;
    c.tags.forEach(tag => {
      if (tag.startsWith("r_")) {
        regional[tag] = (regional[tag] || 0) + 1;
      }
    });
  });
  return regional;
}

function effectiveCount(counts, itemId) {
  const c = counts[itemId] || { V: 0, I: 0, A: 0 };
  return c.V + c.I;
}

// ─── STORAGE ──────────────────────────────────────────────────────────────────

async function loadCases() {
  try {
    const { data, error } = await supabase.from("cases").select("*").order("date", { ascending: false });
    if (error) throw error;
    return (data || []).map(row => ({
      ...row,
      tags: typeof row.tags === "string" ? JSON.parse(row.tags) : (row.tags || [])
    }));
  } catch (e) { console.error("Load error:", e); return []; }
}

async function insertCase(entry) {
  try {
    const { error } = await supabase.from("cases").insert([{ ...entry, tags: JSON.stringify(entry.tags) }]);
    if (error) throw error;
  } catch (e) { console.error("Insert error:", e); }
}

async function deleteCase(id) {
  try {
    const { error } = await supabase.from("cases").delete().eq("id", id);
    if (error) throw error;
  } catch (e) { console.error("Delete error:", e); }
}

async function updateCase(entry) {
  try {
    const { error } = await supabase
      .from("cases")
      .update({ fallnr: entry.fallnr, date: entry.date, role: entry.role, note: entry.note, tags: JSON.stringify(entry.tags) })
      .eq("id", entry.id);
    if (error) throw error;
  } catch (e) { console.error("Update error:", e); }
}

// ─── HELPERS ─────────────────────────────────────────────────────────────────

function today() { return new Date().toISOString().slice(0, 10); }
function formatDate(iso) {
  if (!iso) return "";
  const [y, m, d] = iso.split("-");
  return `${d}.${m}.${y}`;
}

// ─── DESIGN SYSTEM – VARIANT C (Warm Light) ──────────────────────────────────

const ROLE_COLORS = { V: "#16a34a", I: "#d97706", A: "#94a3b8", O: "#16a34a" };
const ROLE_LABELS = { V: "Verantwortlich", I: "Instruierend", A: "Assistenz", O: "Operateur" };

// Warm light design — off-white bg, dark charcoal text, clean minimal
const DS = {
  bg:        "#f5f4f0",
  surface:   "#ffffff",
  surface2:  "#eeede8",
  border:    "#d8d6cf",
  border2:   "#c4c2ba",
  text:      "#111110",        // darker for max legibility
  textMuted: "#4a4845",        // was #6b6860 — much more readable
  textDim:   "#8a8780",        // was #a8a59d
};

const inputStyle = {
  width: "100%", padding: "12px 14px", borderRadius: 10,
  border: `1.5px solid ${DS.border}`, background: DS.surface,
  color: DS.text, fontSize: 15, outline: "none",
  boxSizing: "border-box", fontFamily: "inherit",
  WebkitAppearance: "none",
};

const labelStyle = {
  display: "block", fontSize: 11, fontWeight: 700,
  letterSpacing: "0.08em", textTransform: "uppercase",
  color: DS.textMuted, marginBottom: 8,
};

function RolePill({ role }) {
  return (
    <span style={{
      padding: "2px 8px", borderRadius: 20, fontSize: 11, fontWeight: 700,
      background: ROLE_COLORS[role] + "20", color: ROLE_COLORS[role],
      border: `1px solid ${ROLE_COLORS[role]}40`,
      fontFamily: "ui-monospace, monospace",
    }}>{role}</span>
  );
}

function Bar({ value, min, max, color, alwaysShow }) {
  if (!min && !max && !alwaysShow) return null;
  const target = min || max;
  const pct = Math.min(100, target > 0 ? Math.round((value / target) * 100) : 0);
  const done = min ? value >= min : false;
  const capped = max && value > max;
  const fillColor = done ? "#16a34a" : capped ? "#dc2626" : color;
  const textColor = done ? "#16a34a" : capped ? "#dc2626" : DS.textMuted;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4 }}>
      <div style={{ flex: 1, height: 6, borderRadius: 3, background: DS.border2, overflow: "hidden" }}>
        <div style={{
          width: `${pct}%`, height: "100%", borderRadius: 3,
          background: fillColor,
          transition: "width 0.35s ease",
        }} />
      </div>
      <span style={{
        fontSize: 11, minWidth: 52, textAlign: "right",
        color: textColor,
        fontFamily: "ui-monospace, monospace", fontWeight: 700,
      }}>
        {value}{min ? `/${min}` : ""}{max && !min ? `  ≤${max}` : ""}
      </span>
    </div>
  );
}

// ─── TAG ITEM ─────────────────────────────────────────────────────────────────

function TagItem({ item, selected, onToggle, color }) {
  return (
    <button onClick={() => onToggle(item.id)} style={{
      display: "flex", alignItems: "flex-start", gap: 10,
      width: "100%", textAlign: "left",
      padding: "10px 12px", marginBottom: 4, borderRadius: 8,
      border: `1.5px solid ${selected ? color : DS.border}`,
      background: selected ? color + "12" : DS.surface,
      color: selected ? DS.text : DS.text,
      cursor: "pointer", fontSize: 13, transition: "all 0.12s",
    }}>
      <span style={{
        width: 17, height: 17, borderRadius: 4, flexShrink: 0, marginTop: 1,
        border: `2px solid ${selected ? color : DS.border2}`,
        background: selected ? color : "transparent",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 10, color: "#fff", transition: "all 0.12s",
      }}>{selected ? "✓" : ""}</span>
      <span style={{ flex: 1, lineHeight: 1.4 }}>
        {item.label}
        {(item.note || item.groupNote) && (
          <span style={{ display: "block", fontSize: 11, color: DS.textMuted, marginTop: 2 }}>
            {item.note || item.groupNote}
          </span>
        )}
        {item.assistOnly && <span style={{ fontSize: 10, color: DS.textDim }}> (nur A)</span>}
      </span>
    </button>
  );
}

// ─── HIERARCHICAL PICKER (Ortho) ──────────────────────────────────────────────

function OrthoTagPicker({ sp, tags, onToggle, search }) {
  const [openSec, setOpenSec] = useState(null);
  const [openReg, setOpenReg] = useState(null);
  const color = sp.color;

  const filteredSections = useMemo(() => {
    if (!search) return sp.sections.filter(s => !s.regional);
    const q = search.toLowerCase();
    return sp.sections.filter(s => !s.regional).map(sec => ({
      ...sec,
      regions: sec.regions.map(reg => ({
        ...reg,
        items: reg.items.filter(i =>
          i.label.toLowerCase().includes(q) ||
          reg.label.toLowerCase().includes(q) ||
          sec.label.toLowerCase().includes(q)
        )
      })).filter(r => r.items.length > 0)
    })).filter(s => s.regions.length > 0);
  }, [search, sp.sections]);

  if (search) {
    return (
      <div>
        {filteredSections.map(sec => (
          <div key={sec.id} style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color, marginBottom: 8, letterSpacing: "0.1em", textTransform: "uppercase" }}>{sec.label}</div>
            {sec.regions.map(reg => (
              <div key={reg.id} style={{ marginBottom: 8, paddingLeft: 8 }}>
                <div style={{ fontSize: 11, color: DS.textMuted, marginBottom: 5 }}>{reg.label}</div>
                {reg.items.map(item => <TagItem key={item.id} item={{ ...item, note: item.note || reg.note }} selected={tags.includes(item.id)} onToggle={onToggle} color={color} />)}
              </div>
            ))}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div>
      {filteredSections.map(sec => {
        const isSecOpen = openSec === sec.id;
        const selCount = sec.regions.flatMap(r => r.items).filter(i => tags.includes(i.id)).length;
        return (
          <div key={sec.id} style={{ marginBottom: 4 }}>
            <button onClick={() => { setOpenSec(isSecOpen ? null : sec.id); setOpenReg(null); }} style={{
              width: "100%", padding: "11px 14px", borderRadius: 10,
              border: `1px solid ${isSecOpen ? color + "60" : DS.border}`,
              background: isSecOpen ? color + "12" : DS.surface,
              color: isSecOpen ? DS.text : "#94a3b8",
              cursor: "pointer", textAlign: "left",
              display: "flex", justifyContent: "space-between", alignItems: "center",
              transition: "all 0.15s"
            }}>
              <span style={{ fontSize: 13, fontWeight: 700 }}>{sec.label}</span>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                {selCount > 0 && (
                  <span style={{ fontSize: 11, background: color + "30", color, borderRadius: 10, padding: "1px 8px", fontFamily: "ui-monospace, monospace", fontWeight: 700 }}>
                    {selCount}
                  </span>
                )}
                <span style={{ color: DS.textMuted, fontSize: 13 }}>{isSecOpen ? "▾" : "▸"}</span>
              </div>
            </button>

            {isSecOpen && (
              <div style={{ paddingLeft: 10, paddingTop: 4, paddingBottom: 4 }}>
                {sec.regions.map(reg => {
                  const isRegOpen = openReg === reg.id;
                  const regSel = reg.items.filter(i => tags.includes(i.id)).length;
                  const singleItem = reg.items.length === 1;

                  // Single item: skip accordion, render directly
                  if (singleItem) {
                    const item = reg.items[0];
                    return (
                      <div key={reg.id} style={{ marginBottom: 3 }}>
                        <TagItem
                          item={{ ...item, label: reg.label, note: reg.note }}
                          selected={tags.includes(item.id)}
                          onToggle={() => onToggle(item.id)}
                          color={color}
                        />
                      </div>
                    );
                  }

                  return (
                    <div key={reg.id} style={{ marginBottom: 3 }}>
                      <button onClick={() => setOpenReg(isRegOpen ? null : reg.id)} style={{
                        width: "100%", padding: "9px 12px", borderRadius: 8,
                        border: `1px solid ${isRegOpen ? color + "40" : DS.border2}`,
                        background: isRegOpen ? color + "0d" : DS.surface2,
                        color: isRegOpen ? "#cbd5e1" : DS.textMuted,
                        cursor: "pointer", textAlign: "left",
                        display: "flex", justifyContent: "space-between", alignItems: "flex-start",
                        transition: "all 0.12s"
                      }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 12, fontWeight: 600 }}>{reg.label}</div>
                          {reg.note && <div style={{ fontSize: 10, color: DS.textDim, marginTop: 2 }}>{reg.note}</div>}
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 6, marginLeft: 8, flexShrink: 0 }}>
                          {regSel > 0 && (
                            <span style={{ fontSize: 10, background: color + "25", color, borderRadius: 8, padding: "1px 5px", fontFamily: "ui-monospace, monospace" }}>
                              {regSel}
                            </span>
                          )}
                          <span style={{ color: DS.textDim, fontSize: 11 }}>{isRegOpen ? "▾" : "▸"}</span>
                        </div>
                      </button>

                      {isRegOpen && (
                        <div style={{ paddingLeft: 10, paddingTop: 4, paddingBottom: 2 }}>
                          {reg.items.map(item => (
                            <TagItem key={item.id} item={{ ...item, groupNote: reg.note }} selected={tags.includes(item.id)} onToggle={onToggle} color={color} />
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


// ─── GEFÄSSCHIRURGIE TAG PICKER (3 levels: Section → Group → Sub-items) ──────

function GefaessTagPicker({ sp, tags, onToggle, search }) {
  const [openSec, setOpenSec] = useState(null);
  const [openGrp, setOpenGrp] = useState(null);
  const color = sp.color;

  const filteredSections = useMemo(() => {
    if (!search) return sp.sections;
    const q = search.toLowerCase();
    return sp.sections.map(sec => ({
      ...sec,
      groups: sec.groups.map(grp => ({
        ...grp,
        subs: (grp.subs || []).filter(s =>
          s.label.toLowerCase().includes(q) ||
          grp.label.toLowerCase().includes(q) ||
          sec.label.toLowerCase().includes(q)
        ),
        _matches: grp.label.toLowerCase().includes(q) || sec.label.toLowerCase().includes(q)
      })).filter(grp => grp._matches || grp.subs.length > 0)
    })).filter(sec => sec.groups.length > 0);
  }, [search, sp.sections]);

  if (search) {
    return (
      <div>
        {filteredSections.map(sec => (
          <div key={sec.id} style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color, marginBottom: 8, letterSpacing: "0.1em", textTransform: "uppercase" }}>{sec.label}</div>
            {sec.groups.map(grp => {
              const selected = tags.includes(grp.id);
              return (
                <div key={grp.id} style={{ marginBottom: 8, paddingLeft: 8 }}>
                  <button onClick={() => onToggle(grp.id)} style={{
                    display: "flex", alignItems: "baseline", gap: 10,
                    width: "100%", textAlign: "left", padding: "9px 12px", marginBottom: 4,
                    borderRadius: 8, border: `1.5px solid ${selected ? color : DS.border}`,
                    background: selected ? color + "12" : DS.surface,
                    color: DS.text, cursor: "pointer", fontSize: 13, transition: "all 0.12s",
                  }}>
                    <span style={{ width: 16, height: 16, borderRadius: 4, flexShrink: 0,
                      border: `2px solid ${selected ? color : DS.border2}`,
                      background: selected ? color : "transparent",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 9, color: "#fff" }}>{selected ? "✓" : ""}</span>
                    <span style={{ fontWeight: 600 }}>{grp.label}</span>
                  </button>
                  {grp.subs.map(sub => (
                    <div key={sub.id} style={{ paddingLeft: 28, marginBottom: 2,
                      fontSize: 12, color: DS.textMuted }}>• {sub.label}</div>
                  ))}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div>
      {sp.sections.map(sec => {
        const isSecOpen = openSec === sec.id;
        const selCount = sec.groups.filter(g => tags.includes(g.id)).length;
        return (
          <div key={sec.id} style={{ marginBottom: 4 }}>
            {/* Level 1: Section (A/B/C/D) */}
            <button onClick={() => { setOpenSec(isSecOpen ? null : sec.id); setOpenGrp(null); }} style={{
              width: "100%", padding: "11px 14px", borderRadius: 10,
              border: `1px solid ${isSecOpen ? color + "60" : DS.border}`,
              background: isSecOpen ? color + "12" : DS.surface,
              color: isSecOpen ? DS.text : DS.textMuted,
              cursor: "pointer", textAlign: "left",
              display: "flex", justifyContent: "space-between", alignItems: "center",
              transition: "all 0.15s"
            }}>
              <span style={{ fontSize: 13, fontWeight: 700 }}>{sec.label}</span>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                {selCount > 0 && (
                  <span style={{ fontSize: 11, background: color + "30", color, borderRadius: 10, padding: "1px 8px", fontFamily: "ui-monospace, monospace", fontWeight: 700 }}>
                    {selCount}
                  </span>
                )}
                <span style={{ color: DS.textMuted, fontSize: 13 }}>{isSecOpen ? "▾" : "▸"}</span>
              </div>
            </button>

            {isSecOpen && (
              <div style={{ paddingLeft: 10, paddingTop: 4, paddingBottom: 4 }}>
                {sec.groups.map(grp => {
                  const isGrpOpen = openGrp === grp.id;
                  const selected = tags.includes(grp.id);
                  const hasSubs = grp.subs && grp.subs.length > 0;
                  return (
                    <div key={grp.id} style={{ marginBottom: 3 }}>
                      {/* Level 2: Numbered item */}
                      {grp.selectable !== false ? (
                        // SELECTABLE GROUP — checkbox + label, descOnly subs shown inline
                        <div>
                          <div style={{ display: "flex", gap: 6, alignItems: "stretch" }}>
                            <button onClick={() => onToggle(grp.id)} style={{
                              width: 36, flexShrink: 0, borderRadius: 8,
                              border: `1.5px solid ${selected ? color : DS.border}`,
                              background: selected ? color + "15" : DS.surface2,
                              cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                              transition: "all 0.12s",
                            }}>
                              <span style={{ width: 16, height: 16, borderRadius: 4,
                                border: `2px solid ${selected ? color : DS.border2}`,
                                background: selected ? color : "transparent",
                                display: "flex", alignItems: "center", justifyContent: "center",
                                fontSize: 9, color: "#fff" }}>{selected ? "✓" : ""}</span>
                            </button>
                            <div style={{
                              flex: 1, padding: "9px 10px", borderRadius: 8,
                              border: `1px solid ${selected ? color + "40" : DS.border2}`,
                              background: selected ? color + "0a" : DS.surface2,
                            }}>
                              <span style={{ fontSize: 12, fontWeight: 600, color: DS.text }}>{grp.label}</span>
                              {grp.note && <div style={{ fontSize: 10, color: DS.textDim, marginTop: 2 }}>{grp.note}</div>}
                              <div style={{ display: "flex", gap: 8, marginTop: 3 }}>
                                {grp.minO > 0 && <span style={{ fontSize: 10, color: "#16a34a", fontFamily: "ui-monospace, monospace", fontWeight: 700 }}>O:{grp.minO}</span>}
                                {grp.minA > 0 && <span style={{ fontSize: 10, color: "#2563eb", fontFamily: "ui-monospace, monospace", fontWeight: 700 }}>A:{grp.minA}</span>}
                              </div>
                              {/* descOnly subs shown inline as a simple list */}
                              {hasSubs && grp.subs.every(s => s.descOnly) && (
                                <div style={{ marginTop: 6, paddingTop: 5, borderTop: `1px solid ${DS.border}` }}>
                                  {grp.subs.map(sub => (
                                    <div key={sub.id} style={{ fontSize: 11, color: DS.textMuted, lineHeight: 1.5 }}>
                                      {sub.label}
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                          {/* Mixed subs: some selectable — show those with checkboxes below */}
                          {hasSubs && !grp.subs.every(s => s.descOnly) && (
                            <div style={{ paddingLeft: 46, paddingTop: 4, paddingBottom: 2 }}>
                              {grp.subs.map(sub => {
                                if (sub.descOnly) {
                                  return (
                                    <div key={sub.id} style={{
                                      padding: "5px 8px", marginBottom: 2, borderRadius: 6,
                                      background: DS.surface2, border: `1px solid ${DS.border}`,
                                      fontSize: 12, color: DS.textMuted,
                                    }}>{sub.label}</div>
                                  );
                                }
                                const subSelected = tags.includes(sub.id);
                                return (
                                  <button key={sub.id} onClick={() => onToggle(sub.id)} style={{
                                    display: "flex", alignItems: "baseline", gap: 10,
                                    width: "100%", textAlign: "left",
                                    padding: "8px 10px", marginBottom: 3, borderRadius: 8,
                                    border: `1.5px solid ${subSelected ? color : DS.border}`,
                                    background: subSelected ? color + "12" : DS.surface,
                                    color: DS.text, cursor: "pointer", fontSize: 12, transition: "all 0.12s",
                                  }}>
                                    <span style={{ width: 15, height: 15, borderRadius: 3, flexShrink: 0,
                                      border: `2px solid ${subSelected ? color : DS.border2}`,
                                      background: subSelected ? color : "transparent",
                                      display: "flex", alignItems: "center", justifyContent: "center",
                                      fontSize: 8, color: "#fff" }}>{subSelected ? "✓" : ""}</span>
                                    <span style={{ flex: 1 }}>{sub.label}</span>
                                    <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                                      {sub.minO > 0 && <span style={{ fontSize: 10, color: "#16a34a", fontFamily: "ui-monospace, monospace", fontWeight: 700 }}>O:{sub.minO}</span>}
                                      {sub.minA > 0 && <span style={{ fontSize: 10, color: "#2563eb", fontFamily: "ui-monospace, monospace", fontWeight: 700 }}>A:{sub.minA}</span>}
                                    </div>
                                  </button>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      ) : (
                        // NON-SELECTABLE GROUP — header only, sub-items are individually selectable
                        <button onClick={() => setOpenGrp(isGrpOpen ? null : grp.id)} style={{
                          width: "100%", padding: "9px 12px", borderRadius: 8,
                          border: `1px solid ${isGrpOpen ? color + "60" : DS.border2}`,
                          background: isGrpOpen ? color + "0a" : DS.surface2,
                          color: DS.text, textAlign: "left", cursor: "pointer",
                          display: "flex", justifyContent: "space-between", alignItems: "baseline",
                          transition: "all 0.12s",
                        }}>
                          <div style={{ flex: 1 }}>
                            <span style={{ fontSize: 12, fontWeight: 700 }}>{grp.label}</span>
                            <div style={{ display: "flex", gap: 8, marginTop: 3 }}>
                              <span style={{ fontSize: 10, color: "#16a34a", fontFamily: "ui-monospace, monospace", fontWeight: 700 }}>O:{grp.minO} total</span>
                              <span style={{ fontSize: 10, color: "#2563eb", fontFamily: "ui-monospace, monospace", fontWeight: 700 }}>A:{grp.minA} total</span>
                            </div>
                          </div>
                          <span style={{ color: DS.textDim, fontSize: 11, flexShrink: 0, marginLeft: 8 }}>{isGrpOpen ? "▾" : "▸"}</span>
                        </button>
                      )}

                      {/* Level 3 sub-items for NON-SELECTABLE groups only */}
                      {grp.selectable === false && isGrpOpen && hasSubs && (
                        <div style={{ paddingLeft: grp.selectable !== false ? 46 : 12, paddingTop: 4, paddingBottom: 4 }}>
                          {grp.subs.map(sub => {
                            if (sub.descOnly) {
                              // Descriptive only — no checkbox
                              return (
                                <div key={sub.id} style={{
                                  padding: "5px 8px", marginBottom: 2, borderRadius: 6,
                                  background: DS.surface2, border: `1px solid ${DS.border}`,
                                  fontSize: 12, color: DS.textMuted,
                                }}>
                                  {sub.label}
                                </div>
                              );
                            }
                            // Selectable sub-item
                            const subSelected = tags.includes(sub.id);
                            return (
                              <button key={sub.id} onClick={() => onToggle(sub.id)} style={{
                                display: "flex", alignItems: "baseline", gap: 10,
                                width: "100%", textAlign: "left",
                                padding: "8px 10px", marginBottom: 3, borderRadius: 8,
                                border: `1.5px solid ${subSelected ? color : DS.border}`,
                                background: subSelected ? color + "12" : DS.surface,
                                color: DS.text, cursor: "pointer", fontSize: 12, transition: "all 0.12s",
                              }}>
                                <span style={{ width: 15, height: 15, borderRadius: 3, flexShrink: 0,
                                  border: `2px solid ${subSelected ? color : DS.border2}`,
                                  background: subSelected ? color : "transparent",
                                  display: "flex", alignItems: "center", justifyContent: "center",
                                  fontSize: 8, color: "#fff" }}>{subSelected ? "✓" : ""}</span>
                                <span style={{ flex: 1 }}>{sub.label}</span>
                                <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                                  {sub.minO > 0 && <span style={{ fontSize: 10, color: "#16a34a", fontFamily: "ui-monospace, monospace", fontWeight: 700 }}>O:{sub.minO}</span>}
                                  {sub.minA > 0 && <span style={{ fontSize: 10, color: "#2563eb", fontFamily: "ui-monospace, monospace", fontWeight: 700 }}>A:{sub.minA}</span>}
                                </div>
                              </button>
                            );
                          })}
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

// ─── FLAT PICKER (Chirurgie / Hand) ───────────────────────────────────────────

function FlatTagPicker({ sp, tags, onToggle, search }) {
  const [openSec, setOpenSec] = useState(null);
  const color = sp.color;

  const filteredSections = useMemo(() => {
    if (!search) return sp.sections;
    const q = search.toLowerCase();
    return sp.sections.map(sec => ({
      ...sec,
      items: sec.items.filter(i => i.label.toLowerCase().includes(q) || sec.label.toLowerCase().includes(q))
    })).filter(s => s.items.length > 0);
  }, [search, sp.sections]);

  if (search) {
    return (
      <div>
        {filteredSections.map(sec => (
          <div key={sec.id} style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color, marginBottom: 8, letterSpacing: "0.1em", textTransform: "uppercase" }}>{sec.label}</div>
            {sec.items.map(item => <TagItem key={item.id} item={item} selected={tags.includes(item.id)} onToggle={onToggle} color={color} />)}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div>
      {filteredSections.map(sec => {
        const isOpen = openSec === sec.id;
        const selCount = sec.items.filter(i => tags.includes(i.id)).length;
        return (
          <div key={sec.id} style={{ marginBottom: 4 }}>
            <button onClick={() => setOpenSec(isOpen ? null : sec.id)} style={{
              width: "100%", padding: "11px 14px", borderRadius: 10,
              border: `1px solid ${isOpen ? color + "60" : DS.border}`,
              background: isOpen ? color + "12" : DS.surface,
              color: isOpen ? DS.text : "#94a3b8",
              cursor: "pointer", textAlign: "left",
              display: "flex", justifyContent: "space-between", alignItems: "center",
              transition: "all 0.15s"
            }}>
              <div>
                <span style={{ fontSize: 13, fontWeight: 700 }}>{sec.label}</span>
                {sec.optional && <span style={{ fontSize: 10, color: DS.textMuted, marginLeft: 8 }}>Wahlmodul</span>}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                {selCount > 0 && (
                  <span style={{ fontSize: 11, background: color + "30", color, borderRadius: 10, padding: "1px 8px", fontFamily: "ui-monospace, monospace", fontWeight: 700 }}>
                    {selCount}
                  </span>
                )}
                <span style={{ color: DS.textMuted, fontSize: 13 }}>{isOpen ? "▾" : "▸"}</span>
              </div>
            </button>
            {isOpen && (
              <div style={{ paddingLeft: 10, paddingTop: 4, paddingBottom: 4 }}>
                {sec.items.map(item => <TagItem key={item.id} item={item} selected={tags.includes(item.id)} onToggle={onToggle} color={color} />)}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── REGION FOLLOW-UP PICKER ─────────────────────────────────────────────────
// Shown automatically when any Osteosynthese group (o_s1–o_s5) is tagged.
// Lets the user pick which anatomical region(s) were operated on,
// which silently adds the r_* tags used for the Nebenkriterium.

function RegionFollowUpPicker({ tags, onToggle }) {
  // Find which osteo groups are currently tagged
  const activeGroups = Object.keys(OSTEO_GROUP_REGIONS).filter(g => tags.includes(g));
  if (activeGroups.length === 0) return null;

  // Collect all region options from active groups, deduplicated
  const seen = new Set();
  const regionOptions = [];
  activeGroups.forEach(g => {
    OSTEO_GROUP_REGIONS[g].forEach(r => {
      if (!seen.has(r.id)) {
        seen.add(r.id);
        regionOptions.push(r);
      }
    });
  });

  const selectedRegions = regionOptions.filter(r => tags.includes(r.id));

  return (
    <div style={{
      margin: "12px 0 4px",
      padding: "12px 14px",
      borderRadius: 10,
      background: "#f59e0b12",
      border: "1px solid #f59e0b40",
    }}>
      <div style={{
        fontSize: 11, fontWeight: 700, letterSpacing: "0.08em",
        textTransform: "uppercase", color: "#f59e0b", marginBottom: 10,
        display: "flex", justifyContent: "space-between", alignItems: "center"
      }}>
        <span>Anatomische Region (Nebenkriterium)</span>
        <span style={{ fontFamily: "ui-monospace, monospace", fontSize: 11 }}>
          {selectedRegions.length} gewählt
        </span>
      </div>
      <p style={{ fontSize: 11, color: DS.textMuted, margin: "0 0 10px", lineHeight: 1.5 }}>
        Welche Region(en) wurden operiert? Zählt nur für Rolle V.
      </p>
      {regionOptions.map(r => {
        const selected = tags.includes(r.id);
        return (
          <button key={r.id} onClick={() => onToggle(r.id)} style={{
            display: "flex", alignItems: "center", gap: 10,
            width: "100%", textAlign: "left",
            padding: "9px 11px", marginBottom: 4, borderRadius: 8,
            border: `1px solid ${selected ? "#f59e0b80" : DS.border}`,
            background: selected ? "#f59e0b18" : DS.surface,
            color: selected ? DS.text : "#94a3b8",
            cursor: "pointer", fontSize: 12, transition: "all 0.12s",
          }}>
            <span style={{
              width: 16, height: 16, borderRadius: 4, flexShrink: 0,
              border: `2px solid ${selected ? "#f59e0b" : DS.border2}`,
              background: selected ? "#f59e0b" : "transparent",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 9, color: "#0b0f1a", transition: "all 0.12s",
            }}>{selected ? "✓" : ""}</span>
            {r.label}
          </button>
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

  const toggleTag = useCallback((id) => {
    setTags(prev => prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]);
  }, []);

  const handleSave = () => {
    if (!date || tags.length === 0) return;
    onSave({ id: Date.now().toString(), fallnr, date, role, note, tags });
    setSaved(true);
    setTimeout(() => {
      setFallnr(""); setDate(today()); setRole("V");
      setNote(""); setTags([]); setSearch(""); setStep(1); setSaved(false);
    }, 800);
  };

  const spSelCounts = useMemo(() => {
    const result = {};
    Object.entries(CATALOG).forEach(([spId, sp]) => {
      const allItems = sp.type === "hierarchical"
        ? sp.sections.flatMap(s => s.regions?.flatMap(r => r.items) || [])
        : sp.sections.flatMap(s => s.items);
      const tagIds = sp.type === "gefaess"
        ? sp.sections.flatMap(s => s.groups.map(g => g.id))
        : allItems.map(i => i.id);
      result[spId] = tagIds.filter(id => tags.includes(id)).length;
    });
    return result;
  }, [tags]);

  return (
    <div style={{ maxWidth: 560, margin: "0 auto", padding: "0 16px 100px" }}>
      {/* Step indicator */}
      <div style={{ display: "flex", gap: 6, marginTop: 8, marginBottom: 24 }}>
        {[1, 2].map(s => (
          <div key={s} onClick={() => setStep(s)} style={{
            flex: 1, height: 3, borderRadius: 2, cursor: "pointer",
            background: step >= s ? "#2563eb" : DS.border2, transition: "background 0.2s"
          }} />
        ))}
      </div>

      {step === 1 && (
        <div>
          <h2 style={{ margin: "0 0 22px", fontSize: 20, fontWeight: 700, color: DS.text }}>Eingriff erfassen</h2>

          <div style={{ marginBottom: 18 }}>
            <label style={labelStyle}>Fallnummer</label>
            <input value={fallnr} onChange={e => setFallnr(e.target.value)}
              placeholder="z.B. 13224607" style={inputStyle} />
          </div>

          <div style={{ marginBottom: 18 }}>
            <label style={labelStyle}>Datum</label>
            <input type="date" value={date} onChange={e => setDate(e.target.value)} style={inputStyle} />
          </div>

          <div style={{ marginBottom: 22 }}>
            <label style={labelStyle}>Funktion</label>
            <div style={{ display: "flex", gap: 8 }}>
              {["V", "I", "A"].map(r => (
                <button key={r} onClick={() => setRole(r)} style={{
                  flex: 1, padding: "14px 0", borderRadius: 10, border: "none", cursor: "pointer",
                  fontWeight: 700, fontSize: 15,
                  background: role === r ? ROLE_COLORS[r] + "25" : DS.surface2,
                  color: role === r ? ROLE_COLORS[r] : DS.textMuted,
                  outline: role === r ? `2px solid ${ROLE_COLORS[r]}80` : "none",
                  transition: "all 0.15s"
                }}>
                  {r}
                  <div style={{ fontSize: 10, fontWeight: 400, marginTop: 3, opacity: 0.7 }}>
                    {ROLE_LABELS[r].slice(0, 12)}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: 24 }}>
            <label style={labelStyle}>Freitext (optional)</label>
            <textarea value={note} onChange={e => setNote(e.target.value)}
              placeholder="z.B. Diagnose, Besonderheiten…" rows={2}
              style={{ ...inputStyle, resize: "none" }} />
          </div>

          <button onClick={() => setStep(2)} style={{
            width: "100%", padding: "14px", borderRadius: 10, border: "none",
            background: "#2563eb", color: "#ffffff", cursor: "pointer",
            fontSize: 15, fontWeight: 700,
          }}>
            Kategorien auswählen →
          </button>
        </div>
      )}

      {step === 2 && (
        <div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
            <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: DS.text }}>Kategorien</h2>
            <span style={{ fontSize: 12, color: "#60a5fa", fontFamily: "ui-monospace, monospace", fontWeight: 600 }}>
              {tags.length} gewählt
            </span>
          </div>
          <p style={{ fontSize: 12, color: DS.textMuted, margin: "0 0 14px", lineHeight: 1.5 }}>
            Einem Eingriff können Kategorien aus mehreren Fachgebieten zugewiesen werden.
          </p>

          {/* Specialty tabs */}
          <div style={{ display: "flex", gap: 6, marginBottom: 12 }}>
            {Object.entries(CATALOG).map(([id, s]) => (
              <button key={id} onClick={() => setActiveSpec(id)} style={{
                flex: 1, padding: "8px 4px", borderRadius: 8, border: "none", cursor: "pointer",
                fontWeight: 600, fontSize: 11,
                background: activeSpec === id ? s.color + "25" : DS.surface2,
                color: activeSpec === id ? s.color : DS.textMuted,
                outline: activeSpec === id ? `1.5px solid ${s.color}60` : "none",
                transition: "all 0.15s", position: "relative"
              }}>
                {s.label.split(" / ")[0]}
                {spSelCounts[id] > 0 && (
                  <span style={{
                    position: "absolute", top: -5, right: -2,
                    background: s.color, color: "#0b0f1a",
                    borderRadius: 8, fontSize: 9, fontWeight: 800,
                    padding: "1px 5px", fontFamily: "ui-monospace, monospace"
                  }}>{spSelCounts[id]}</span>
                )}
              </button>
            ))}
          </div>

          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Suchen…" style={{ ...inputStyle, marginBottom: 10 }} />

          <div style={{ maxHeight: "38vh", overflowY: "auto", paddingRight: 2, touchAction: "pan-y" }}>
            {CATALOG[activeSpec].type === "hierarchical"
              ? <OrthoTagPicker sp={CATALOG[activeSpec]} tags={tags} onToggle={toggleTag} search={search} />
              : CATALOG[activeSpec].type === "gefaess"
              ? <GefaessTagPicker sp={CATALOG[activeSpec]} tags={tags} onToggle={toggleTag} search={search} />
              : <FlatTagPicker sp={CATALOG[activeSpec]} tags={tags} onToggle={toggleTag} search={search} />
            }
          </div>

          {/* Auto region picker — appears when any Osteosynthese group is tagged */}
          <RegionFollowUpPicker tags={tags} onToggle={toggleTag} />

          <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
            <button onClick={() => setStep(1)} style={{
              flex: 1, padding: "14px", borderRadius: 10,
              border: `1px solid ${DS.border}`, background: "transparent",
              color: DS.textMuted, cursor: "pointer", fontSize: 14, fontWeight: 600
            }}>← Zurück</button>
            <button onClick={handleSave} disabled={tags.length === 0} style={{
              flex: 2, padding: "14px", borderRadius: 10, border: "none",
              background: saved ? "#16a34a" : tags.length === 0 ? DS.surface2 : "#2563eb",
              color: tags.length === 0 ? DS.textDim : "#ffffff",
              cursor: tags.length === 0 ? "not-allowed" : "pointer",
              fontSize: 15, fontWeight: 700, transition: "all 0.2s"
            }}>
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

  const getCount = useCallback((item, isRegional) =>
    isRegional ? (regionalCounts[item.id] || 0) : effectiveCount(counts, item.id),
    [counts, regionalCounts]
  );

  return (
    <div style={{ maxWidth: 600, margin: "0 auto", padding: "0 16px 100px" }}>
      {/* Specialty tabs */}
      <div style={{ display: "flex", gap: 6, marginTop: 8, marginBottom: 20 }}>
        {Object.entries(CATALOG).map(([id, s]) => (
          <button key={id} onClick={() => setActiveSpec(id)} style={{
            flex: 1, padding: "8px 6px", borderRadius: 20, border: "none", cursor: "pointer",
            fontWeight: 600, fontSize: 11,
            background: activeSpec === id ? s.color : DS.surface,
            color: activeSpec === id ? "#0b0f1a" : DS.textMuted,
            transition: "all 0.15s"
          }}>{s.label.split(" / ")[0]}</button>
        ))}
      </div>

      {sp.roleNote && (
        <div style={{ fontSize: 11, color: DS.textMuted, marginBottom: 12, padding: "8px 12px", background: DS.surface, borderRadius: 8, border: `1px solid ${DS.border}` }}>
          <strong style={{ color: DS.text }}>Rollen:</strong> {sp.roleNote}
        </div>
      )}
      {sp.sections.map(sec => {
        const isRegional = !!sec.regional;
        const allItems = sp.type === "hierarchical"
          ? sec.regions.flatMap(r => r.items)
          : sp.type === "gefaess"
          ? sec.groups
          : sec.items;
        const secMin = sec.sectionMin || sec.min || 0;
        const secTotal = sp.type === "gefaess"
          ? allItems.reduce((s, g) => s + (counts[g.id] ? counts[g.id].V + counts[g.id].I : 0), 0)
          : allItems.reduce((s, i) => s + getCount(i, isRegional), 0);
        const secDone = secMin ? secTotal >= secMin : false;
        const secColor = isRegional ? "#f59e0b" : sp.color;

        return (
          <div key={sec.id} style={{
            background: DS.surface, borderRadius: 12, marginBottom: 10, overflow: "hidden",
            border: `1px solid ${secDone ? secColor + "50" : DS.border}`,
          }}>
            {/* Section header */}
            <div style={{ padding: "12px 14px 10px", borderBottom: `2px solid ${secColor}` }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: secMin ? 8 : 0 }}>
                <div>
                  <span style={{ fontSize: 13, fontWeight: 700, color: secDone ? secColor : DS.text }}>
                    {secDone ? "✓ " : ""}{sec.label}
                  </span>
                  {sec.optional && <span style={{ fontSize: 10, color: DS.textMuted, marginLeft: 8 }}>Wahlmodul</span>}
                  {isRegional && <span style={{ fontSize: 10, color: "#f59e0b80", marginLeft: 8 }}>auto · nur V</span>}
                  {sec.note && <div style={{ fontSize: 10, color: DS.textDim, marginTop: 2 }}>{sec.note}</div>}
                </div>
                {secMin && (
                  <span style={{ fontSize: 12, fontFamily: "ui-monospace, monospace", fontWeight: 700, flexShrink: 0, marginLeft: 10, color: secDone ? secColor : DS.textMuted }}>
                    {secTotal}/{secMin}
                  </span>
                )}
              </div>
              {secMin && (
                <div style={{ height: 6, borderRadius: 3, background: DS.border2, overflow: "hidden" }}>
                  <div style={{
                    height: "100%", borderRadius: 3, transition: "width 0.4s ease",
                    width: `${Math.min(100, secMin > 0 ? Math.round((secTotal / secMin) * 100) : 0)}%`,
                    background: secDone ? "#22c55e" : secColor,
                  }} />
                </div>
              )}
            </div>

            {/* Items */}
            <div style={{ padding: "10px 14px 12px" }}>
              {sp.type === "gefaess"
                ? sec.groups.map(grp => {
                  // For non-selectable groups, aggregate counts from selectable subs
                  const selectableSubs = (grp.subs || []).filter(s => !s.descOnly);
                  const rawC = grp.selectable !== false
                    ? (counts[grp.id] || { V: 0, I: 0, A: 0 })
                    : selectableSubs.reduce((acc, sub) => {
                        const c = counts[sub.id] || { V: 0, I: 0, A: 0 };
                        return { V: acc.V + c.V, I: acc.I + c.I, A: acc.A + c.A };
                      }, { V: 0, I: 0, A: 0 });
                  const cntO = rawC.V + rawC.I;
                  const cntA = rawC.A;
                  const doneO = grp.minO > 0 ? cntO >= grp.minO : true;
                  const doneA = grp.minA > 0 ? cntA >= grp.minA : true;
                  const done = doneO && doneA;
                  return (
                    <div key={grp.id} style={{ marginBottom: 14 }}>
                      {/* Group header */}
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 8, marginBottom: 4 }}>
                        <span style={{ fontSize: 13, color: done ? DS.textMuted : DS.text, fontWeight: 600, lineHeight: 1.4, flex: 1 }}>
                          {grp.label}
                        </span>
                        <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                          {grp.minO > 0 && <span style={{ fontSize: 11, fontFamily: "ui-monospace, monospace", fontWeight: 700, color: doneO ? "#16a34a" : DS.textMuted }}>O:{cntO}/{grp.minO}</span>}
                          {grp.minA > 0 && <span style={{ fontSize: 11, fontFamily: "ui-monospace, monospace", fontWeight: 700, color: doneA ? "#2563eb" : DS.textMuted }}>A:{cntA}/{grp.minA}</span>}
                        </div>
                      </div>
                      {grp.note && <div style={{ fontSize: 11, color: DS.textDim, marginBottom: 4 }}>{grp.note}</div>}
                      {/* Dual bars — always show */}
                      <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <span style={{ fontSize: 10, color: "#16a34a", minWidth: 14, fontWeight: 800, fontFamily: "ui-monospace, monospace" }}>O</span>
                          <div style={{ flex: 1, height: 6, borderRadius: 3, background: DS.border2, overflow: "hidden" }}>
                            <div style={{ width: `${grp.minO > 0 ? Math.min(100, Math.round((cntO/grp.minO)*100)) : 0}%`, height: "100%", borderRadius: 3, background: doneO ? "#16a34a" : sp.color, transition: "width 0.35s" }} />
                          </div>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <span style={{ fontSize: 10, color: "#2563eb", minWidth: 14, fontWeight: 800, fontFamily: "ui-monospace, monospace" }}>A</span>
                          <div style={{ flex: 1, height: 6, borderRadius: 3, background: DS.border2, overflow: "hidden" }}>
                            <div style={{ width: `${grp.minA > 0 ? Math.min(100, Math.round((cntA/grp.minA)*100)) : 0}%`, height: "100%", borderRadius: 3, background: doneA ? "#2563eb" : "#93c5fd", transition: "width 0.35s" }} />
                          </div>
                        </div>
                      </div>
                      {/* Sub-items in progress view */}
                      {grp.subs && grp.subs.length > 0 && (
                        <div style={{ marginTop: 8, paddingLeft: 16, borderLeft: `2px solid ${DS.border}` }}>
                          {grp.subs.map(sub => {
                            if (sub.descOnly) {
                              return (
                                <div key={sub.id} style={{ fontSize: 11, color: DS.textDim, padding: "2px 0" }}>
                                  {sub.label}
                                </div>
                              );
                            }
                            // Selectable sub — show its own dual bars
                            const subRaw = counts[sub.id] || { V: 0, I: 0, A: 0 };
                            const subCntO = subRaw.V + subRaw.I;
                            const subCntA = subRaw.A;
                            const subDoneO = sub.minO > 0 ? subCntO >= sub.minO : true;
                            const subDoneA = sub.minA > 0 ? subCntA >= sub.minA : true;
                            return (
                              <div key={sub.id} style={{ marginBottom: 8, paddingTop: 4 }}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 3 }}>
                                  <span style={{ fontSize: 12, color: (subDoneO && subDoneA) ? DS.textMuted : DS.text, fontWeight: 500 }}>{sub.label}</span>
                                  <div style={{ display: "flex", gap: 6, flexShrink: 0, marginLeft: 8 }}>
                                    {sub.minO > 0 && <span style={{ fontSize: 10, fontFamily: "ui-monospace, monospace", fontWeight: 700, color: subDoneO ? "#16a34a" : DS.textMuted }}>O:{subCntO}/{sub.minO}</span>}
                                    {sub.minA > 0 && <span style={{ fontSize: 10, fontFamily: "ui-monospace, monospace", fontWeight: 700, color: subDoneA ? "#2563eb" : DS.textMuted }}>A:{subCntA}/{sub.minA}</span>}
                                  </div>
                                </div>
                                <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                                  {sub.minO > 0 && (
                                    <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                                      <span style={{ fontSize: 9, color: "#16a34a", minWidth: 12, fontWeight: 800, fontFamily: "ui-monospace, monospace" }}>O</span>
                                      <div style={{ flex: 1, height: 5, borderRadius: 2, background: DS.border2, overflow: "hidden" }}>
                                        <div style={{ width: `${Math.min(100, sub.minO > 0 ? Math.round((subCntO/sub.minO)*100) : 0)}%`, height: "100%", borderRadius: 2, background: subDoneO ? "#16a34a" : sp.color }} />
                                      </div>
                                    </div>
                                  )}
                                  {sub.minA > 0 && (
                                    <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                                      <span style={{ fontSize: 9, color: "#2563eb", minWidth: 12, fontWeight: 800, fontFamily: "ui-monospace, monospace" }}>A</span>
                                      <div style={{ flex: 1, height: 5, borderRadius: 2, background: DS.border2, overflow: "hidden" }}>
                                        <div style={{ width: `${Math.min(100, sub.minA > 0 ? Math.round((subCntA/sub.minA)*100) : 0)}%`, height: "100%", borderRadius: 2, background: subDoneA ? "#2563eb" : "#93c5fd" }} />
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })
                : sp.type === "hierarchical"
                ? sec.regions.map(reg => {
                  const regItems = reg.items;
                  const regTotal = regItems.reduce((s, i) => s + getCount(i, isRegional), 0);
                  const regMin = regItems.reduce((s, i) => s + (i.min || 0), 0);
                  const regDone = regMin > 0 && regTotal >= regMin;
                  const singleItem = regItems.length === 1;

                  return (
                    <div key={reg.id} style={{ marginBottom: singleItem ? 10 : 14 }}>
                      {/* Only show region subheader when there are multiple items */}
                      {!singleItem && (
                        <div style={{ marginBottom: 6 }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: regMin > 0 ? 4 : 0 }}>
                            <span style={{ fontSize: 12, fontWeight: 700, color: regDone ? DS.textMuted : DS.text }}>
                              {reg.label}
                            </span>
                            {regMin > 0 && (
                              <span style={{ fontSize: 10, fontFamily: "ui-monospace, monospace", color: regDone ? "#22c55e" : DS.textDim, flexShrink: 0, marginLeft: 8 }}>
                                {regTotal}/{regMin}
                              </span>
                            )}
                          </div>
                          {reg.note && <div style={{ fontSize: 10, color: DS.textDim, marginBottom: 4 }}>{reg.note}</div>}
                          {regMin > 0 && (
                            <div style={{ height: 3, borderRadius: 2, background: DS.border2, overflow: "hidden" }}>
                              <div style={{
                                height: "100%", borderRadius: 2,
                                width: `${Math.min(100, Math.round((regTotal / regMin) * 100))}%`,
                                background: regDone ? "#22c55e" : sp.color + "70",
                                transition: "width 0.3s"
                              }} />
                            </div>
                          )}
                        </div>
                      )}

                      {regItems.map(item => {
                        const cnt = getCount(item, isRegional);
                        const rawC = counts[item.id] || { V: 0, I: 0, A: 0 };
                        const done = item.min && cnt >= item.min;
                        // When single item: use region note as subtitle, no indent
                        return (
                          <div key={item.id} style={{ marginBottom: 8, paddingLeft: singleItem ? 0 : 8 }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 8 }}>
                              <div style={{ flex: 1 }}>
                                <span style={{ fontSize: 13, color: done ? DS.textMuted : DS.text, lineHeight: 1.4, fontWeight: 500 }}>
                                  {singleItem ? reg.label : item.label}
                                </span>
                                {singleItem && reg.note && (
                                  <div style={{ fontSize: 10, color: DS.textDim, marginTop: 2 }}>{reg.note}</div>
                                )}
                              </div>
                              <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>
                                {isRegional
                                  ? cnt > 0 && <span style={{ fontSize: 10, fontFamily: "ui-monospace, monospace", color: "#f59e0baa" }}>V:{cnt}</span>
                                  : ["V", "I", "A"].map(r => rawC[r] > 0 && (
                                    <span key={r} style={{ fontSize: 10, fontFamily: "ui-monospace, monospace", color: ROLE_COLORS[r], fontWeight: 700 }}>{r}:{rawC[r]}</span>
                                  ))
                                }
                              </div>
                            </div>
                            <Bar value={cnt} min={item.min} max={item.max} color={isRegional ? "#f59e0b" : sp.color} />
                          </div>
                        );
                      })}
                    </div>
                  );
                })
                : sec.items.map(item => {
                  const cnt = getCount(item, false);
                  const rawC = counts[item.id] || { V: 0, I: 0, A: 0 };
                  const isDual = item.dualRole;
                  const cntO = rawC.V + rawC.I; // O = Verantwortlich + Instruierend
                  const cntA = rawC.A;
                  const doneO = isDual ? (item.minO ? cntO >= item.minO : true) : (item.min && cnt >= item.min);
                  const doneA = isDual ? (item.minA ? cntA >= item.minA : true) : true;
                  const done = isDual ? (doneO && doneA) : doneO;
                  return (
                    <div key={item.id} style={{ marginBottom: 12 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 8, marginBottom: 3 }}>
                        <div style={{ flex: 1 }}>
                          <span style={{ fontSize: 13, color: done ? DS.textMuted : DS.text, lineHeight: 1.4, fontWeight: 500 }}>
                            {item.label}
                            {item.assistOnly && <span style={{ fontSize: 10, color: DS.textMuted }}> (nur A)</span>}
                          </span>
                          {item.note && <div style={{ fontSize: 11, color: DS.textDim, marginTop: 2 }}>{item.note}</div>}
                        </div>
                        <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>
                          {isDual ? (
                            <>
                              {(item.minO > 0 || cntO > 0) && <span style={{ fontSize: 11, fontFamily: "ui-monospace, monospace", fontWeight: 700, color: doneO ? "#16a34a" : DS.textMuted }}>O:{cntO}{item.minO ? `/${item.minO}` : ""}</span>}
                              {(item.minA > 0 || cntA > 0) && <span style={{ fontSize: 11, fontFamily: "ui-monospace, monospace", fontWeight: 700, color: doneA ? "#2563eb" : DS.textMuted }}>A:{cntA}{item.minA ? `/${item.minA}` : ""}</span>}
                            </>
                          ) : (
                            ["V", "I", "A"].map(r => rawC[r] > 0 && (
                              <span key={r} style={{ fontSize: 11, fontFamily: "ui-monospace, monospace", fontWeight: 700, color: ROLE_COLORS[r] }}>{r}:{rawC[r]}</span>
                            ))
                          )}
                        </div>
                      </div>
                      {isDual ? (
                        <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                          {item.minO > 0 && (
                            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                              <span style={{ fontSize: 10, color: "#16a34a", minWidth: 14, fontWeight: 700 }}>O</span>
                              <div style={{ flex: 1, height: 6, borderRadius: 3, background: DS.border2, overflow: "hidden" }}>
                                <div style={{ width: `${Math.min(100, item.minO > 0 ? Math.round((cntO/item.minO)*100) : 0)}%`, height: "100%", borderRadius: 3, background: doneO ? "#16a34a" : sp.color, transition: "width 0.35s" }} />
                              </div>
                            </div>
                          )}
                          {item.minA > 0 && (
                            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                              <span style={{ fontSize: 10, color: "#2563eb", minWidth: 14, fontWeight: 700 }}>A</span>
                              <div style={{ flex: 1, height: 6, borderRadius: 3, background: DS.border2, overflow: "hidden" }}>
                                <div style={{ width: `${Math.min(100, item.minA > 0 ? Math.round((cntA/item.minA)*100) : 0)}%`, height: "100%", borderRadius: 3, background: doneA ? "#2563eb" : "#93c5fd", transition: "width 0.35s" }} />
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        <Bar value={cnt} min={item.min} max={item.max} color={sp.color} />
                      )}
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

// ─── CSV EXPORT ───────────────────────────────────────────────────────────────

function exportCSV(cases) {
  // Build header
  const headers = ["Datum", "Fallnummer", "Funktion", "Freitext", "Kategorien", "Fachgebiete"];

  const rows = [...cases]
    .sort((a, b) => a.date.localeCompare(b.date))
    .map(c => {
      const tagLabels = c.tags
        .map(t => ALL_ITEMS[t]?.label || t)
        .filter(Boolean)
        .join(" | ");

      const specialties = [...new Set(
        c.tags
          .map(t => ALL_ITEMS[t]?.specialtyLabel)
          .filter(Boolean)
      )].join(" | ");

      return [
        formatDate(c.date),
        c.fallnr || "",
        c.role,
        c.note || "",
        tagLabels,
        specialties,
      ].map(val => `"${String(val).replace(/"/g, '""')}"`).join(",");
    });

  const csv = [headers.join(","), ...rows].join("\n");
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" }); // BOM for Excel
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  const dateStr = new Date().toISOString().slice(0, 10);
  a.href = url;
  a.download = `logbuch_${dateStr}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}


// ─── EDIT SHEET ───────────────────────────────────────────────────────────────

function EditSheet({ caseEntry, onSave, onClose }) {
  const [step, setStep] = useState(1);
  const [fallnr, setFallnr] = useState(caseEntry.fallnr || "");
  const [date, setDate] = useState(caseEntry.date || today());
  const [role, setRole] = useState(caseEntry.role || "V");
  const [note, setNote] = useState(caseEntry.note || "");
  const [tags, setTags] = useState(caseEntry.tags || []);
  const [search, setSearch] = useState("");
  const [activeSpec, setActiveSpec] = useState("chirurgie");
  const [saving, setSaving] = useState(false);

  const toggleTag = useCallback((id) => {
    setTags(prev => prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]);
  }, []);

  const handleSave = async () => {
    setSaving(true);
    await onSave({ ...caseEntry, fallnr, date, role, note, tags });
    setSaving(false);
    onClose();
  };

  const spSelCounts = useMemo(() => {
    const result = {};
    Object.entries(CATALOG).forEach(([spId, sp]) => {
      const allItems = sp.type === "hierarchical"
        ? sp.sections.flatMap(s => s.regions?.flatMap(r => r.items) || [])
        : sp.type === "gefaess"
        ? sp.sections.flatMap(s => s.groups.map(g => ({ id: g.id })))
        : sp.sections.flatMap(s => s.items);
      const tagIds = sp.type === "gefaess"
        ? sp.sections.flatMap(s => s.groups.map(g => g.id))
        : allItems.map(i => i.id);
      result[spId] = tagIds.filter(id => tags.includes(id)).length;
    });
    return result;
  }, [tags]);

  return (
    <>
      {/* Backdrop */}
      <div onClick={onClose} style={{
        position: "fixed", inset: 0, background: "rgba(0,0,0,0.35)",
        zIndex: 50, backdropFilter: "blur(2px)"
      }} />

      {/* Sheet */}
      <div style={{
        position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 51,
        background: DS.surface, borderRadius: "18px 18px 0 0",
        boxShadow: "0 -4px 40px rgba(0,0,0,0.15)",
        maxHeight: "92vh", display: "flex", flexDirection: "column",
      }}>
        {/* Handle */}
        <div style={{ display: "flex", justifyContent: "center", padding: "10px 0 0" }}>
          <div style={{ width: 36, height: 4, borderRadius: 2, background: DS.border2 }} />
        </div>

        {/* Header */}
        <div style={{
          display: "flex", justifyContent: "space-between", alignItems: "center",
          padding: "10px 20px 12px", borderBottom: `1px solid ${DS.border}`
        }}>
          <span style={{ fontSize: 16, fontWeight: 700, color: DS.text }}>Eingriff bearbeiten</span>
          <button onClick={onClose} style={{
            background: DS.surface2, border: "none", borderRadius: "50%",
            width: 30, height: 30, cursor: "pointer", fontSize: 16,
            color: DS.textMuted, display: "flex", alignItems: "center", justifyContent: "center"
          }}>×</button>
        </div>

        {/* Step tabs */}
        <div style={{ display: "flex", gap: 6, padding: "10px 20px 0" }}>
          {[1, 2].map(s => (
            <div key={s} onClick={() => setStep(s)} style={{
              flex: 1, height: 3, borderRadius: 2, cursor: "pointer",
              background: step >= s ? "#2563eb" : DS.border2, transition: "background 0.2s"
            }} />
          ))}
        </div>

        {/* Content */}
        <div style={{ overflowY: "auto", flex: 1, padding: "16px 20px 32px" }}>
          {step === 1 && (
            <div>
              <div style={{ marginBottom: 16 }}>
                <label style={labelStyle}>Fallnummer</label>
                <input value={fallnr} onChange={e => setFallnr(e.target.value)}
                  placeholder="z.B. 13224607" style={inputStyle} />
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
                      flex: 1, padding: "12px 0", borderRadius: 10, border: "none", cursor: "pointer",
                      fontWeight: 700, fontSize: 14,
                      background: role === r ? ROLE_COLORS[r] + "25" : DS.surface2,
                      color: role === r ? ROLE_COLORS[r] : DS.textMuted,
                      outline: role === r ? `2px solid ${ROLE_COLORS[r]}80` : "none",
                      transition: "all 0.15s"
                    }}>
                      {r}
                      <div style={{ fontSize: 10, fontWeight: 400, marginTop: 2, opacity: 0.7 }}>
                        {ROLE_LABELS[r].slice(0, 12)}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
              <div style={{ marginBottom: 20 }}>
                <label style={labelStyle}>Freitext (optional)</label>
                <textarea value={note} onChange={e => setNote(e.target.value)}
                  placeholder="z.B. Diagnose, Besonderheiten…" rows={2}
                  style={{ ...inputStyle, resize: "none" }} />
              </div>
              <button onClick={() => setStep(2)} style={{
                width: "100%", padding: "13px", borderRadius: 10, border: "none",
                background: "#2563eb", color: "#fff", cursor: "pointer",
                fontSize: 14, fontWeight: 700,
              }}>Kategorien bearbeiten →</button>
            </div>
          )}

          {step === 2 && (
            <div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                <span style={{ fontSize: 14, fontWeight: 700, color: DS.text }}>Kategorien</span>
                <span style={{ fontSize: 12, color: "#2563eb", fontFamily: "ui-monospace, monospace", fontWeight: 600 }}>
                  {tags.length} gewählt
                </span>
              </div>

              {/* Specialty tabs */}
              <div style={{ display: "flex", gap: 6, marginBottom: 10, flexWrap: "wrap" }}>
                {Object.entries(CATALOG).map(([id, s]) => (
                  <button key={id} onClick={() => setActiveSpec(id)} style={{
                    flex: 1, minWidth: 70, padding: "7px 4px", borderRadius: 8, border: "none", cursor: "pointer",
                    fontWeight: 600, fontSize: 11,
                    background: activeSpec === id ? s.color + "25" : DS.surface2,
                    color: activeSpec === id ? s.color : DS.textMuted,
                    outline: activeSpec === id ? `1.5px solid ${s.color}60` : "none",
                    transition: "all 0.15s", position: "relative"
                  }}>
                    {s.label.split(" / ")[0]}
                    {spSelCounts[id] > 0 && (
                      <span style={{
                        position: "absolute", top: -5, right: -2,
                        background: s.color, color: "#fff",
                        borderRadius: 8, fontSize: 9, fontWeight: 800,
                        padding: "1px 5px", fontFamily: "ui-monospace, monospace"
                      }}>{spSelCounts[id]}</span>
                    )}
                  </button>
                ))}
              </div>

              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Suchen…" style={{ ...inputStyle, marginBottom: 10 }} />

              <div style={{ maxHeight: "35vh", overflowY: "auto", touchAction: "pan-y" }}>
                {CATALOG[activeSpec].type === "hierarchical"
                  ? <OrthoTagPicker sp={CATALOG[activeSpec]} tags={tags} onToggle={toggleTag} search={search} />
                  : CATALOG[activeSpec].type === "gefaess"
                  ? <GefaessTagPicker sp={CATALOG[activeSpec]} tags={tags} onToggle={toggleTag} search={search} />
                  : <FlatTagPicker sp={CATALOG[activeSpec]} tags={tags} onToggle={toggleTag} search={search} />
                }
              </div>
              <RegionFollowUpPicker tags={tags} onToggle={toggleTag} />

              <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
                <button onClick={() => setStep(1)} style={{
                  flex: 1, padding: "13px", borderRadius: 10,
                  border: `1px solid ${DS.border}`, background: "transparent",
                  color: DS.textMuted, cursor: "pointer", fontSize: 14, fontWeight: 600
                }}>← Zurück</button>
                <button onClick={handleSave} disabled={saving} style={{
                  flex: 2, padding: "13px", borderRadius: 10, border: "none",
                  background: saving ? DS.surface2 : "#2563eb",
                  color: saving ? DS.textDim : "#fff",
                  cursor: saving ? "not-allowed" : "pointer",
                  fontSize: 14, fontWeight: 700, transition: "all 0.2s"
                }}>
                  {saving ? "Speichert…" : "Speichern"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}


// ─── SWIPEABLE CARD ───────────────────────────────────────────────────────────

function SwipeableCard({ c, onEdit, onDelete }) {
  const [swiped, setSwiped] = useState(false);
  const startX = useRef(null);

  const handleTouchStart = (e) => {
    startX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e) => {
    if (startX.current === null) return;
    const dx = e.changedTouches[0].clientX - startX.current;
    startX.current = null;
    if (dx < -50) setSwiped(true);
    else if (dx > 20) setSwiped(false);
  };

  return (
    <div style={{ position: "relative", marginBottom: 8, borderRadius: 12, overflow: "hidden" }}>
      {/* Action buttons behind the card */}
      <div style={{
        position: "absolute", right: 0, top: 0, bottom: 0,
        display: "flex", alignItems: "stretch",
      }}>
        <button onClick={() => { setSwiped(false); onEdit(c); }} style={{
          background: "#2563eb", border: "none", cursor: "pointer",
          padding: "0 20px", color: "#fff", fontSize: 13, fontWeight: 700,
        }}>✎ Edit</button>
        <button onClick={() => { setSwiped(false); onDelete(c.id); }} style={{
          background: "#dc2626", border: "none", cursor: "pointer",
          padding: "0 16px", color: "#fff", fontSize: 18,
        }}>×</button>
      </div>

      {/* Card */}
      <div
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onClick={() => swiped && setSwiped(false)}
        style={{
          background: DS.surface, border: `1px solid ${DS.border}`,
          borderRadius: 12, padding: "13px 14px",
          transform: swiped ? "translateX(-116px)" : "translateX(0)",
          transition: "transform 0.2s ease",
          position: "relative", zIndex: 1,
          userSelect: "none",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 6 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 14, fontWeight: 700, color: DS.text, fontFamily: "ui-monospace, monospace" }}>
              {c.fallnr || "—"}
            </span>
            <span style={{ fontSize: 12, color: DS.textMuted }}>{formatDate(c.date)}</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <RolePill role={c.role} />
            <button onClick={e => { e.stopPropagation(); onEdit(c); }} title="Bearbeiten" style={{
              background: "none", border: "none", color: DS.textMuted,
              cursor: "pointer", fontSize: 14, padding: "2px 4px", lineHeight: 1,
            }}>✎</button>
            <button onClick={e => { e.stopPropagation(); onDelete(c.id); }} style={{
              background: "none", border: "none", color: DS.textDim,
              cursor: "pointer", fontSize: 18, padding: "0 2px", lineHeight: 1,
            }}>×</button>
          </div>
        </div>
        {c.note && <div style={{ fontSize: 12, color: DS.textMuted, marginBottom: 7 }}>{c.note}</div>}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
          {c.tags.map(t => {
            const item = ALL_ITEMS[t];
            if (!item) return null;
            const color = CATALOG[item.specialty]?.color || "#60a5fa";
            return (
              <span key={t} style={{
                fontSize: 10, padding: "3px 8px", borderRadius: 6,
                background: color + "18", color, border: `1px solid ${color}30`,
                lineHeight: 1.4
              }}>{item.label}</span>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── CASES VIEW ───────────────────────────────────────────────────────────────

function CasesView({ cases, onDelete, onEdit }) {
  const [filter, setFilter] = useState("");
  const [editingCase, setEditingCase] = useState(null);

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
    <div style={{ maxWidth: 600, margin: "0 auto", padding: "0 16px 100px" }}>
      {/* Search + export row */}
      <div style={{ display: "flex", gap: 8, marginTop: 8, marginBottom: 12 }}>
        <input value={filter} onChange={e => setFilter(e.target.value)}
          placeholder="Suchen…" style={{ ...inputStyle, flex: 1, marginTop: 0, marginBottom: 0 }} />
        <button
          onClick={() => exportCSV(cases)}
          disabled={cases.length === 0}
          title="CSV exportieren"
          style={{
            padding: "0 16px", borderRadius: 10, border: `1px solid ${DS.border}`,
            background: DS.surface, color: cases.length === 0 ? DS.textDim : "#22c55e",
            cursor: cases.length === 0 ? "not-allowed" : "pointer",
            fontSize: 18, flexShrink: 0, display: "flex", alignItems: "center",
            transition: "all 0.15s",
          }}>
          ↓
        </button>
      </div>
      <div style={{ fontSize: 12, color: DS.textMuted, marginBottom: 12 }}>
        {filtered.length} Eingriffe{cases.length > 0 && ` · `}
        {cases.length > 0 && (
          <span
            onClick={() => exportCSV(cases)}
            style={{ color: "#22c55e", cursor: "pointer", textDecoration: "underline" }}>
            CSV exportieren ({cases.length} total)
          </span>
        )}
      </div>
      {filtered.length === 0 && (
        <div style={{ color: DS.textDim, fontSize: 14, textAlign: "center", padding: "48px 0" }}>
          Noch keine Eingriffe erfasst
        </div>
      )}
      {filtered.map(c => (
        <SwipeableCard
          key={c.id}
          c={c}
          onEdit={setEditingCase}
          onDelete={onDelete}
        />
      ))}

      {/* Edit sheet */}
      {editingCase && (
        <EditSheet
          caseEntry={editingCase}
          onSave={onEdit}
          onClose={() => setEditingCase(null)}
        />
      )}
    </div>
  );
}

// ─── ROOT ─────────────────────────────────────────────────────────────────────

export default function App() {
  const [cases, setCases] = useState([]);
  const [view, setView] = useState("add");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCases().then(c => { setCases(c); setLoading(false); });
  }, []);

  const handleSave = useCallback(async (entry) => {
    await insertCase(entry);
    setCases(prev => [entry, ...prev]);
  }, []);

  const handleDelete = useCallback(async (id) => {
    await deleteCase(id);
    setCases(prev => prev.filter(c => c.id !== id));
  }, []);

  const handleUpdate = useCallback(async (entry) => {
    await updateCase(entry);
    setCases(prev => prev.map(c => c.id === entry.id ? entry : c));
  }, []);

  if (loading) return (
    <div style={{ minHeight: "100vh", background: DS.bg, display: "flex", alignItems: "center", justifyContent: "center", color: DS.textMuted }}>
      Lade…
    </div>
  );

  const NAV = [
    { id: "add", icon: "＋", label: "Erfassen" },
    { id: "progress", icon: "◎", label: "Fortschritt" },
    { id: "cases", icon: "≡", label: `Eingriffe${cases.length ? ` (${cases.length})` : ""}` },
  ];

  return (
    <div style={{ minHeight: "100vh", background: DS.bg, color: DS.text, fontFamily: "'Inter', system-ui, sans-serif" }}>
      {/* Header */}
      <div style={{
        padding: "16px 20px 14px", background: DS.bg,
        borderBottom: `1px solid ${DS.border}`,
        position: "sticky", top: 0, zIndex: 10,
        display: "flex", justifyContent: "space-between", alignItems: "center"
      }}>
        <div>
          <div style={{ fontSize: 10, letterSpacing: "0.2em", color: "#3b82f6", textTransform: "uppercase", fontWeight: 800, marginBottom: 2 }}>SIWF</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: DS.text }}>Operationslogbuch</div>
        </div>
        <div style={{ fontSize: 12, color: DS.textMuted, textAlign: "right" }}>
          <span style={{ fontSize: 20, fontWeight: 700, color: "#2563eb", display: "block", lineHeight: 1 }}>{cases.length}</span>
          Eingriffe
        </div>
      </div>

      {/* Content */}
      <div style={{ paddingTop: 16 }}>
        {view === "add" && <AddCaseView onSave={handleSave} />}
        {view === "progress" && <ProgressView cases={cases} />}
        {view === "cases" && <CasesView cases={cases} onDelete={handleDelete} onEdit={handleUpdate} />}
      </div>

      {/* Bottom nav */}
      <div style={{
        position: "fixed", bottom: 0, left: 0, right: 0,
        background: DS.surface, borderTop: `1px solid ${DS.border}`,
        display: "flex",
        paddingBottom: "max(8px, env(safe-area-inset-bottom))",
        paddingTop: 8,
      }}>
        {NAV.map(tab => (
          <button key={tab.id} onClick={() => setView(tab.id)} style={{
            flex: 1, background: "none", border: "none", cursor: "pointer",
            display: "flex", flexDirection: "column", alignItems: "center", gap: 3, padding: "4px 0"
          }}>
            <span style={{
              fontSize: 20, lineHeight: 1,
              color: view === tab.id ? "#2563eb" : DS.textMuted,
              transition: "color 0.15s"
            }}>{tab.icon}</span>
            <span style={{
              fontSize: 10, fontWeight: 600, letterSpacing: "0.04em",
              color: view === tab.id ? "#60a5fa" : DS.textDim,
            }}>{tab.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
