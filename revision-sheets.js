/* ============================================================
   📚 EDUVA QUICK REVISION SHEETS — high-yield exam material
   Class 10/12 Maths+Science+Physics+Chem+Bio — ready notes
   ============================================================ */
(function () {
    'use strict';
    function $(id) { return document.getElementById(id); }
    function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }

    var SHEETS = [
        {
            icon: '📐', title: 'Class 10 Maths — Complete Formula Sheet', tag: 'Boards • 15 chapters',
            body: '➕ REAL NUMBERS: HCF × LCM = a × b • √2, √3 irrational proofs (contradiction)\n\n'
                + '🔢 POLYNOMIALS: α+β = −b/a | αβ = c/a • α²+β² = (α+β)²−2αβ • α³+β³ = (α+β)³−3αβ(α+β)\n\n'
                + '📈 QUADRATIC: x = [−b ± √(b²−4ac)] / 2a • D>0: 2 real roots | D=0: equal | D<0: no real roots\n\n'
                + '📊 AP: aₙ = a+(n−1)d • Sₙ = n/2(a+l) = n/2[2a+(n−1)d]\n\n'
                + '📍 COORDINATE: d=√[(x₂−x₁)²+(y₂−y₁)²] • Section: [(mx₂+nx₁)/(m+n), (my₂+ny₁)/(m+n)] • Area = ½|x₁(y₂−y₃)+x₂(y₃−y₁)+x₃(y₁−y₂)|\n\n'
                + '🔺 TRIGONOMETRY: sin²θ+cos²θ=1 | 1+tan²θ=sec²θ | 1+cot²θ=cosec²θ • sin(90−θ)=cosθ • tan(90−θ)=cotθ\n'
                + 'Values: sin30=½, sin45=1/√2, sin60=√3/2 | cos उल्टा | tan30=1/√3, tan45=1, tan60=√3\n\n'
                + '⭕ CIRCLES: Tangent ⊥ radius (touch point par) • Bahar ke point se dono tangents barabar: PA = PB\n\n'
                + '📦 MENSURATION: Cylinder CSA=2πrh, TSA=2πr(r+h), V=πr²h • Cone CSA=πrl, V=⅓πr²h • Sphere SA=4πr², V=4/3πr³ • Hemisphere TSA=3πr², V=2/3πr³ • Sector area = (θ/360)×πr²\n\n'
                + '📉 STATISTICS: Mean = Σfx/Σf • Mode = 3 Median − 2 Mean • Median class: cf ≥ n/2\n\n'
                + '🎲 PROBABILITY: P(E) = favourable/total • 0 ≤ P ≤ 1 • P(E) + P(not E) = 1'
        },
        {
            icon: '🔬', title: 'Class 10 Science — Rapid Revision Sheet', tag: 'Phy + Chem + Bio',
            body: '⚡ PHYSICS:\n'
                + 'Mirror: 1/v + 1/u = 2/R = 1/f | Magnification m = −v/u = h\'/h\n'
                + 'Lens: 1/v − 1/u = 1/f | Power P = 1/f(m) dioptre\n'
                + 'Ohm: V = IR • Series: R = R₁+R₂ • Parallel: 1/R = 1/R₁+1/R₂\n'
                + 'Heat: H = I²Rt (Joule) • Electric power P = VI = I²R\n'
                + 'Magnetic: Fleming Left hand (motor) — Forefinger(Field), Centre(Current), Thumb(Motion) • Right hand (generator)\n\n'
                + '🧪 CHEMISTRY:\n'
                + 'pH: <7 acid | 7 neutral | >7 base • Universal indicator colours yaad rakho\n'
                + 'Reactivity: K > Na > Ca > Mg > Al > Zn > Fe > Pb > H > Cu > Hg > Ag > Au\n'
                + 'Important: Zn + H₂SO₄ → ZnSO₄ + H₂↑ • CaO + H₂O → Ca(OH)₂ • 2H₂ + O₂ → 2H₂O\n'
                + 'Rusting: Fe + O₂ + H₂O → hydrated iron oxide (prevention: painting, galvanization)\n\n'
                + '🧬 BIOLOGY ONE-LINERS:\n'
                + 'Photosynthesis: 6CO₂ + 6H₂O →(sunlight/chlorophyll) C₆H₁₂O₆ + 6O₂\n'
                + 'Heart: 4 chambers (2 atria + 2 ventricles) • Double circulation\n'
                + 'Nephron = kidney ka filter unit • Alveoli = gas exchange unit\n'
                + 'Reflex arc: Receptor → Sensory neuron → Spinal cord → Motor neuron → Effector\n'
                + 'DNA double helix (Watson & Crick) • Genes = DNA ke segments'
        },
        {
            icon: '⚡', title: 'Class 12 Physics — Formula Sheet', tag: 'Boards + JEE/NEET base',
            body: '🔌 CURRENT ELECTRICITY: I = Q/t • V = IR • R = ρl/A • Series/Parallel rules • P = VI = I²R = V²/R • Cells: EMF series E = E₁+E₂, internal r = r₁+r₂\n\n'
                + '🧲 MAGNETISM: F = qvB sinθ • r = mv/qB • Cyclotron frequency f = qB/2πm • Force on wire F = BIL sinθ • Torque τ = NIAB sinθ\n\n'
                + '🌀 EMI: ε = −dΦ/dt • Φ = BA cosθ • Generator: ε = ε₀ sin ωt • Transformer: Vₛ/Vₚ = Nₛ/Nₚ\n\n'
                + '🔦 RAY OPTICS: Mirror 1/v+1/u=1/f • Lens 1/v−1/u=1/f • Power P=1/f • Magnification • TIR: i > critical angle (sin C = 1/n₂ when n₁>n₂)\n\n'
                + '🌈 WAVE OPTICS: YDSE fringe width β = λD/d • Diffraction minima: d sinθ = nλ • Brewster: tan iₚ = n₂/n₁\n\n'
                + '⚛️ MODERN: E = hν = hc/λ • Photoelectric: hν = φ + KEₘₐₓ • de Broglie λ = h/mv • Rydberg: 1/λ = R(1/n₁² − 1/n₂²) • Nucleus: N = N₀(½)^(t/T½) • E = mc²'
        },
        {
            icon: '🧮', title: 'Class 12 Maths — Key Formulas', tag: 'Boards + JEE',
            body: '📈 CALCULUS: d/dx(xⁿ)=nxⁿ⁻¹ | d(sin x)=cos x | d(cos x)=−sin x | d(eˣ)=eˣ | d(ln x)=1/x | Product: (uv)\' = u\'v+uv\' | Chain: dy/dx = dy/du × du/dx\n\n'
                + '∫xⁿdx = xⁿ⁺¹/(n+1) | ∫sin x = −cos x | ∫cos x = sin x | ∫eˣ = eˣ | ∫1/x = ln|x| | ∫dx/(a²+x²) = (1/a)tan⁻¹(x/a) | Parts: ∫u dv = uv − ∫v du\n\n'
                + '📦 MATRICES: (AB)ᵀ = BᵀAᵀ • |Aᵀ| = |A| • |AB| = |A||B| • A⁻¹ = adj(A)/|A| (|A|≠0)\n\n'
                + '🎯 VECTORS: a·b = |a||b|cosθ • a×b = |a||b|sinθ n̂ • Section, projection formulas\n\n'
                + '📊 PROBABILITY: P(A∪B) = P(A)+P(B)−P(A∩B) • Independent: P(A∩B)=P(A)P(B) • Bayes: P(A|B) = P(B|A)P(A)/P(B)\n\n'
                + '🔺 3D: Direction cosines l²+m²+n²=1 • Line: (x−x₁)/a=(y−y₁)/b=(z−z₁)/c • Plane: ax+by+cz+d=0, distance = |ax₁+by₁+cz₁+d|/√(a²+b²+c²)'
        },
        {
            icon: '🧬', title: 'NEET Biology — 40 Rapid Facts', tag: 'High-yield one-liners',
            body: '1. Cell wall = cellulose (plants) | peptidoglycan (bacteria)\n2. Mitochondria = powerhouse • own DNA + 70S ribosomes\n3. Ribosomes: 80S (euk) | 70S (prok, mito, chloro)\n4. Lysosome = suicide bag • Golgi = packaging unit\n5. Photosynthesis: light rxn → grana | dark rxn → stroma\n6. C₄ plants: sugarcane, maize, sorghum\n7. Glycolysis: cytoplasm mein • Krebs: mitochondria matrix\n8. ETS/oxidative phosphorylation → inner mitochondrial membrane\n9. Heart: SA node = pacemaker • AV node delay\n10. Normal BP: 120/80 mmHg\n11. Nephron: glomerulus → Bowman capsule → tubules\n12. Myelin sheath: Schwann cells\n13. Insulin: pancreas (beta cells) • Diabetes = insulin kam\n14. Thyroid: T3, T4 • Goitre = iodine ki kami\n15. Growth hormone: pituitary (dwarfism/gigantism)\n16. DNA: A-T (2 H-bonds) | G-C (3 H-bonds)\n17. mRNA: codons (3 bases) • tRNA: anticodon\n18. Replication: semiconservative • Enzyme: DNA polymerase\n19. Transcription: DNA→mRNA | Translation: mRNA→protein\n20. Mendel: pea plant • Dominance, segregation, independent assortment\n21. Blood group: IA, IB codominant • O recessive\n22. Rh-negative mother + Rh+ baby = erythroblastosis fetalis\n23. Testes: testosterone • Ovary: estrogen/progesterone\n24. Menstrual cycle: 28 days approx • Ovulation day 14\n25. Placenta: exchange b/w mother-fetus\n26. AIDS: HIV (retrovirus) • attacks CD4 (T-helper)\n27. Antibodies: B-lymphocytes • IgG sabse common\n28. Vaccine: attenuated/killed pathogen → memory cells\n29. Ecology: 10% law (energy transfer)\n30. Biomagnification: DDT jaise toxins upar badhte hain\n31. BOD zyada = zyada pollution\n32. Eutrophication: nutrients → algal bloom → O₂ kam\n33. Ozone hole: CFC • O₃ = UV filter (stratosphere)\n34. PCR: DNA amplify (Taq polymerase)\n35. rDNA: restriction enzymes + ligase\n36. Bt cotton: cry gene (Bacillus thuringiensis)\n37. Insulin (recombinant): E. coli mein banaya\n38. Test-tube baby: IVF + ZIFT\n39. Stem cells: totipotent > pluripotent\n40. Angiosperm: double fertilization (triple fusion → endosperm)'
        },
        {
            icon: '🧪', title: 'Class 12 Chemistry — Named Reactions + Key Points', tag: 'Boards + NEET/JEE',
            body: '⚗️ ORGANIC (named reactions):\n'
                + '1. Wurtz: 2RX + 2Na → R-R (dry ether)\n2. Friedel-Crafts: Benzene + RCl/RCOCl (AlCl₃) → alkyl/acyl benzene\n3. Williamson: RONa + R\'X → R-O-R\' (ether)\n4. Aldol: 2 aldehydes (dil. NaOH) → β-hydroxy aldehyde\n5. Cannizzaro: aldehyde bina α-H (conc. NaOH) → acid + alcohol\n6. Clemmensen: C=O → CH₂ (Zn-Hg/HCl)\n7. Wolff-Kishner: C=O → CH₂ (NH₂NH₂, KOH)\n8. Hoffmann bromamide: amide → amine (1 C kam) (Br₂/KOH)\n9. Gabriel phthalimide: phthalimide → primary amine\n10. Sandmeyer: ArN₂⁺ → ArCl/ArBr/ArCN (CuCl/CuBr/CuCN)\n11. Gattermann: ArN₂⁺ → ArCl/ArBr (Cu powder)\n12. Reimer-Tiemann: phenol + CHCl₃ (NaOH) → salicylaldehyde\n13. Kolbe: phenol + NaOH + CO₂ → salicylic acid\n14. HVZ: carboxylic acid α-H halogenation (X₂/red P)\n15. Rosenmund: RCOCl → RCHO (H₂/Pd-BaSO₄)\n\n'
                + '📌 PHYSICAL: Arrhenius k = Ae^(−Ea/RT) • First order t½ = 0.693/k • osmotic π = CRT • ΔG = ΔH − TΔS\n'
                + '📌 INORGANIC tricks: 3d series oxidation states • KMnO₄: acidic → Mn²⁺ | neutral → MnO₂ | basic → manganate • K₂Cr₂O₇ acidic mein Cr³⁺'
        }
,
        {
            icon: '🧬', title: 'Class 10 Science NCERT — Chapter-wise Notes', tag: 'All 13 chapters rapid',
            body: `⚗️ CHEMICAL REACTIONS: Balancing steps • Types: combo/decomp/displacement/double displacement/redox • Corrosion & rancidity\n\n'
                + '🧂 ACIDS/BASES/SALTS: pH scale • Indicators (litmus, phenolphthalein) • Neutralization: acid+base→salt+water • Common salts: NaCl, Na₂CO₃, baking soda NaHCO₃, washing soda Na₂CO₃·10H₂O, plaster of Paris CaSO₄·½H₂O, gypsum CaSO₄·2H₂O\n\n'
                + '⚙️ METALS/NON-METALS: Reactivity series • Extraction: roasting/calcination • Alloy examples: brass(Cu+Zn), bronze(Cu+Sn), solder(Pb+Sn), stainless steel • Ionic compounds: high mp, conduct in molten\n\n'
                + '💎 CARBON COMPOUNDS: Covalent bonding • Catenation • Homologous series • Functional groups: -OH alcohol, -COOH acid, -CHO aldehyde, -CO- ketone • Ethanol, ethanoic acid reactions • Soap vs detergent\n\n'
                + '❤️ LIFE PROCESSES: Nutrition (auto/hetero) • Respiration (aerobic/anaerobic) • Transportation (xylem/phloem, heart double circulation) • Excretion (nephron)\n\n'
                + '🧠 CONTROL & COORDINATION: Neuron structure • Reflex arc • Brain parts (cerebrum/cerebellum/medulla) • Plant hormones: auxin, gibberellin, cytokinin, abscisic acid\n\n'
                + '🔄 REPRODUCTION: Fission, budding, regeneration, spore • Human reproductive systems • Fertilization internal • Contraception methods\n\n'
                + '🧬 HEREDITY & EVOLUTION: Mendel\'s 3 laws • Dominant/recessive • Sex determination XY • Evolution evidence: fossils, homologous/vestigial organs\n\n'
                + '🔦 LIGHT: Laws of reflection/refraction • Mirror/lens formulas • Power of lens • Atmospheric refraction (twinkling, advanced sunrise)\n\n'
                + '👁️ HUMAN EYE: Parts (cornea, iris, pupil, lens, retina) • Defects: myopia (concave), hypermetropia (convex), presbyopia • Persistence of vision\n\n'
                + '⚡ ELECTRICITY: Ohm\'s law • Resistance factors • Series/parallel • Heating effect • Power ratings\n\n'
                + '🧲 MAGNETIC EFFECTS: Field lines (N→S outside) • Fleming LHR (motor), RHR (generator) • Domestic circuits: live(red), neutral(black), earth(green) • MCB vs fuse`
        },
        {
            icon: '📐', title: 'Class 10 Maths NCERT — Chapter-wise Key Points', tag: '15 chapters • 2-min each',
            body: `1. Real Numbers: Euclid division lemma • Fundamental Theorem of Arithmetic • HCF×LCM = product
'
                + '2. Polynomials: Zeroes-graph relation • α,β formulas • Division algorithm
'
                + '3. Linear Eqns (2 var): Graphical • Substitution/elimination/cross-multiplication • a₁/a₂≠b₁/b₂ → unique solution
'
                + '4. Quadratic: Factorization/formula/completing square • Nature by D
'
                + '5. AP: nth term • Sum formulas • Word problems
'
                + '6. Triangles: Similarity (AAA, SSS, SAS) • Areas ratio = (sides ratio)² • Pythagoras + converse
'
                + '7. Coordinate: All 4 formulas • Collinearity check
'
                + '8. Trigonometry: Ratios • Identities • Complementary angles • Values 0/30/45/60/90
'
                + '9. Heights-Distances: Angle of elevation/depression • tanθ = h/d
'
                + '10. Circles: Tangent theorems • Construction-based Qs
'
                + '11. Constructions: Division of line segment • Similar triangle • Tangents
'
                + '12. Areas-Circles: Sector/segment formulas • Combinations of figures
'
                + '13. Surface-Volumes: All 6 solids • Conversion (frustum)
'
                + '14. Statistics: Mean (3 methods) • Mode • Median (cumulative freq) • Ogives
'
                + '15. Probability: Empirical • Complementary events • Dice/cards/coins`
        },
        {
            icon: '🗺️', title: 'Class 10 SST — Dates + Maps + Key Terms', tag: 'History + Geo + Civics + Econ',
            body: `📜 HISTORY DATES: 1830s: Romanticism/Greek struggle • 1848: Revolutions of liberals • 1871: German unification (Prussia) • 1914-18: WWI • 1933: Hitler Chancellor • 1945: WWII end • 1947: India/Pakistan freedom • 1971: Bangladesh\n\n'
                + '🇮🇳 NATIONALISM INDIA: 1919: Rowlatt, Jallianwala • 1920: Non-cooperation • 1930: Dandi March (Gandhi-Irwin Pact 1931) • 1942: Quit India • 1940: Pakistan resolution • 1946: Cabinet Mission\n\n'
                + '🌍 GEOGRAPHY: Resources types (natural/human) • Soil types: alluvial (N plains), black (Deccan cotton), red-laterite, arid, forest • Crops: kharif (rice, maize, cotton) vs rabi (wheat, gram) • Industries: cotton (Maharashtra/Gujarat), iron-steel (Jamshedpur, Bokaro) • Dams: Hirakud, Bhakra-Nangal, Tehri\n\n'
                + '🏛️ POLITICAL SCIENCE: Power sharing types (horizontal/vertical) • Federalism: 3 lists (Union/State/Concurrent) • Political parties: national (6) vs regional • Democracy outcomes\n\n'
                + '💰 ECONOMICS: Sectors: primary/secondary/tertiary • GDP = goods + services value • Money: barter → currency • Credit: formal (banks) vs informal • Globalization: MNCs, WTO`
        },
        {
            icon: '📖', title: 'Hindi Vyakaran — Class 9-10 Rapid', tag: 'संधि • समास • अलंकार • मुहावरे',
            body: `🔗 संधि (3 main): स्वर — देव + इंद्र = देवेंद्र (दीर्घ), तत् + पुरुष = तत्पुरुष (गुण) • व्यंजन — सत् + जन = सज्जन • विसर्ग — निः + चय = निश्चय\n\n'
                + '🏗️ समास (6 types): द्वंद्व — माता-पिता = मातापिता • तत्पुरुष — राजपुरुष (करण-तत्पुरुष) • कर्मधारय — नीलकमल • बहुव्रीहि — दशानन (रावण) • द्विगु — त्रिभुवन • अव्ययीभाव — यथाशक्ति\n\n'
                + '✨ अलंकार: उपमा — जैसे/सा शब्द (कamal si aankhein) • रूपक — direct saman (चरण-कamal) • अनुप्रास — vyanjan repetition • यमक — shabd do baar alag arth • उत्प्रेक्षा — ऐसा प्रतीत होता है • अतिशयोक्ति — अत्य ध且 (बाल सिन्दूर etc)\n\n'
                + '🗣️ मुहावरे (high-yield): आँखों का तारा (बहुत प्रिय) • नौ दो ग्यारह होना (भाग जाना) • अंगूठा दिखाना (मना करना) • ईद का चाँद होना (बहुत दिनों बाद दिखना) • कान भरना (चुगली) • दाल न गलना (युक्ति सफल न होना)\n\n'
                + '🎭 रस: शृंगार (प्रेम), करुण (दुख), वीर (वीरता), हास्य (हंसी), रौद्र (क्रोध), भयानक (डर), बीभत्स (घृणा), अद्भुत (आश्चर्य), शांत (शांति)\n\n'
                + '📝 पद परिचय वाले कवि: तulsidas (रामचरितमानस), सूरदास, रहीम, मीरा, प्रेमचंद (गोदान), महादेवी वर्मा (यामा)`
        },
        {
            icon: '🔤', title: 'English Grammar — Tenses + Voice + Narration', tag: 'Class 9-12 • scoring',
            body: `⏰ TENSES (12): Present: do/does (simp) | is/am/are+ing (cont) | has/have+III (perf) | has been+ing (perf cont) • Past: did | was/were+ing | had+III | had been+ing • Future: will/shall+V1 | will be+ing | will have+III | will have been+ing
'
                + 'Trick: Time words — since/for (perf) • when/while (past cont) • by tomorrow (future perf)\n\n'
                + '🔄 VOICE (Active→Passive): Object becomes subject • Verb: be+III (is/was/were/been+III) • By+agent (agar zaroori) • Tense map: does→is done | did→was done | will→will be done | has done→has been done
'
                + 'Imperative: Open the door → Let the door be opened / You are ordered to open\n\n'
                + '💬 NARRATION (Direct→Indirect): Say/said to → tell/told • Present→Past shift • Today→that day | now→then | here→there | this→that • Questions: asked + if/wh + subject+V (no did) • Commands: ordered/advised/requested + to+V • Exclamations: exclaimed with joy/sorrow\n\n'
                + '✏️ Common errors: One of my friend → friends • Neither of the boys are → is • Since 5 years → for 5 years (since 2020)`
        },
        {
            icon: '📐', title: 'Ganita Manjari (Class 9 New NCERT) — Ch 1-8 Notes', tag: 'Naya syllabus • pehla notes set!',
            body: `1️⃣ Coordinates: Quadrants (+,+ / −,+ / −,− / +,−) • Distance = √[(x₂−x₁)²+(y₂−y₁)²] • Midpoint = average of coords\n\n'
                + '2️⃣ Linear Polynomials (y = ax+b): Slope = a • y-intercept = b • Graph = straight line • Rise/run method\n\n'
                + '3️⃣ World of Numbers: Rational = p/q • Irrational = non-terminating non-repeating (√2, π) • √2 irrational proof (contradiction)\n\n'
                + '4️⃣ Algebraic Identities: (a±b)² = a²±2ab+b² • a²−b² = (a+b)(a−b) • (x+a)(x+b) = x²+(a+b)x+ab • Applications: 103×97 = (100+3)(100−3) = 9991\n\n'
                + '5️⃣ Circles (Up and Down, Round and Round): Center, radius, diameter, chord • Tangent ⊥ radius • Angle subtended by diameter = 90° (semicircle thm)\n\n'
                + '6️⃣ Perimeter & Area: s formula s=(a+b+c)/2, A=√[s(s−a)(s−b)(s−c)] • Rectangle/triangle/parallelogram combos\n\n'
                + '7️⃣ Probability: P = favourable/total • 0 to 1 • Empirical (observed) probability • Complementary: P(E)+P(notE)=1\n\n'
                + '8️⃣ Sequences & Progressions: AP: aₙ = a+(n−1)d • GP: aₙ = arⁿ⁻¹ • Next-term patterns • Triangular/square numbers`
        },
        {
            icon: '📊', title: 'JEE/NEET — PYQ Pattern Analysis (Last 5 Years)', tag: 'Repeat kaun karta hai',
            body: `🎯 JEE MAIN — hamesha repeated concepts:
'
                + 'Maths: Quadratic (D-based Q) • Definite integral by properties • Complex numbers (modulus) • Circles (family) • Matrices-determinants (2×2 inverse)
'
                + 'Physics: Projectile max range • Kirchhoff/cells • s double slit • Photoelectric equation • Rotational (torque, MI of rod/disc)
'
                + 'Chemistry: Coordination compounds (IUPAC) • Amines basicity order • Electrochemistry (Nernst) • Biomolecules (glucose/fructose structures)\n\n'
                + '🩺 NEET — guaranteed areas:
'
                + 'Biology (90 mein se ~25-30 Q): Human Physiology (heart, nephron, neural) • Genetics (Pedigree, crosses) • Ecology (pyramids, succession) • Plant Physiology (photosynthesis cycles)
'
                + 'Physics: Semi-conductors logic gates • Ray optics (lens combos) • Modern (Bohr model) • Units & dimensions
'
                + 'Chemistry: p-block trends • GOC (inductive/resonance) • Solutions (Raoult) • Polymers + Chemistry in Everyday Life (easy 4-5 Q!)\n\n'
                + '💡 Strategy: Pehle ye "fixed" chapters pakke karo — ye 40-45% paper cover karte hain har saal!`
        }
    ];

    function build() {
        if ($('view-sheets')) return;
        var main = document.querySelector('main');
        if (!main) return;
        var sec = document.createElement('section');
        sec.id = 'view-sheets';
        sec.className = 'hidden space-y-4 max-w-4xl mx-auto animate-fadeIn py-2';
        sec.innerHTML = '<div class="mb-2"><button type="button" class="eduva-back-btn" onclick="goBack()">←</button></div>'
            + '<div class="card-clean p-5 rounded-3xl bg-gradient-to-r from-emerald-600 to-teal-700 text-white">'
            + '<h2 class="text-lg font-black">📚 Quick Revision Sheets</h2>'
            + '<p class="text-xs opacity-90 mt-1">Exam se pehle ka asli material — formulas, reactions, facts. Sab offline bhi padh sakte ho (app mein hi save hai) 🔥</p></div>'
            + '<div class="space-y-3" id="sheets-list"></div>';
        main.appendChild(sec);
        var list = $('sheets-list');
        list.innerHTML = SHEETS.map(function (s, i) {
            return '<details class="card-clean p-4 rounded-2xl group">'
                + '<summary class="flex items-center gap-3 cursor-pointer list-none">'
                + '<span class="text-2xl">' + s.icon + '</span>'
                + '<span class="flex-1"><b class="text-sm text-slate-900">' + s.title + '</b><br><span class="text-[10px] font-bold text-emerald-600">' + s.tag + '</span></span>'
                + '<span class="text-slate-400 group-open:rotate-180 transition">▾</span></summary>'
                + '<div class="mt-3 p-3.5 bg-slate-50 rounded-xl text-[13px] leading-relaxed text-slate-800 whitespace-pre-wrap border border-slate-100">' + esc(s.body) + '</div>'
                + '<button onclick="window.__sheetDone()" class="mt-2 px-3 py-1.5 bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-black rounded-lg cursor-pointer">✅ Padh liya — count karo</button>'
                + '</details>';
        }).join('');
    }
    window.__sheetDone = function () {
        var s = getS(); s.read = (s.read || 0) + 1; saveS(s);
        try { if (typeof eduvaToast !== 'undefined') eduvaToast('📚 Sheet padhi! Total: ' + s.read + ' — Chhutti Nahi streak bhi green! 🎯'); } catch (e) {}
        try { if (typeof window.__nzdDone === 'function') window.__nzdDone('sheet'); } catch (e) {}
    };
    function getS() { try { return JSON.parse(localStorage.getItem('eduva_sheets_v1') || '{}'); } catch (e) { return {}; } }
    function saveS(s) { try { localStorage.setItem('eduva_sheets_v1', JSON.stringify(s)); } catch (e) {} }

    function injectEntry() {
        build();
        var slot = document.getElementById('revision-card-slot');
        if (slot && !document.getElementById('sheets-home-btn')) {
            var s = getS();
            var b = document.createElement('button');
            b.id = 'sheets-home-btn';
            b.className = 'w-full p-4 rounded-2xl flex items-center gap-3 text-left cursor-pointer transition hover:scale-[1.01] border-2 border-emerald-200 bg-gradient-to-r from-emerald-50 to-teal-50';
            b.innerHTML = '<div class="w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white flex items-center justify-center text-xl shrink-0">📚</div>'
                + '<div class="flex-1"><p class="text-sm font-black text-slate-900">Quick Revision Sheets — asli material yahan hai</p>'
                + '<p class="text-[11px] font-bold text-slate-500">Class 10/12 formulas • Science rapid • NEET 40 facts • Chemistry reactions • <b>' + (s.read || 0) + ' sheets padhi</b></p></div><span class="text-emerald-500 text-lg">›</span>';
            b.onclick = function () { try { switchTab('sheets'); } catch (e) {} };
            slot.insertAdjacentElement('afterend', b);
        }
    }
    function init() { try { injectEntry(); } catch (e) {} setTimeout(injectEntry, 2000); setTimeout(injectEntry, 5000); }
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
    else init();
    console.log('📚 EDUVA Revision Sheets loaded');
})();
