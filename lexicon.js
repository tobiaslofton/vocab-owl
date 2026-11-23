// Frequency-banded English lexicon (Bands 1..12) + plausible pseudoword foils.
// Each real word includes a part-of-speech, short definition, and 3 distractors for sanity checks.

window.VOCAB_OWL_DATA = {
  bands: [
    { band: 1, approxVocab: 2500, label: "Everyday Core" },
    { band: 2, approxVocab: 5500, label: "Fluent Conversational" },
    { band: 3, approxVocab: 9000, label: "Sharp Generalist" },
    { band: 4, approxVocab: 13000, label: "Avid Reader" },
    { band: 5, approxVocab: 17500, label: "Editorial Mind" },
    { band: 6, approxVocab: 22500, label: "Precision Wordsmith" },
    { band: 7, approxVocab: 28000, label: "Lexicon Heavyweight" },
    { band: 8, approxVocab: 33500, label: "Literary Archivist" },
    { band: 9, approxVocab: 39000, label: "Scholarly Rare" },
    { band: 10, approxVocab: 45000, label: "Living Dictionary" }
  ],

  realWords: [
    // Band 1 (2.5k)
    { w: "abundant", b: 1, pos: "adj", d: "existing in large quantities", x: ["difficult to locate", "barely audible", "strictly temporary"] },
    { w: "reluctant", b: 1, pos: "adj", d: "unwilling and hesitant", x: ["eager to volunteer", "deeply nostalgic", "physically exhausted"] },
    { w: "fragile", b: 1, pos: "adj", d: "easily broken or damaged", x: ["heavily reinforced", "brightly polished", "slowly expanding"] },
    { w: "generous", b: 1, pos: "adj", d: "showing readiness to give more than expected", x: ["secretly resentful", "cautiously frugal", "quietly observant"] },
    { w: "genuine", b: 1, pos: "adj", d: "truly what it is said to be; authentic", x: ["hastily assembled", "partially hidden", "mildly irritating"] },

    // Band 2 (5.5k)
    { w: "pragmatic", b: 2, pos: "adj", d: "dealing with things sensibly and realistically", x: ["driven by pure fantasy", "overly ceremonial", "chronically indecisive"] },
    { w: "ambiguous", b: 2, pos: "adj", d: "open to more than one interpretation", x: ["mathematically exact", "fiercely loyal", "completely silent"] },
    { w: "resilient", b: 2, pos: "adj", d: "able to recover quickly from difficulty", x: ["prone to sudden panic", "easily distracted", "strictly ornamental"] },
    { w: "candid", b: 2, pos: "adj", d: "truthful and straightforward", x: ["deliberately deceptive", "overly dramatic", "quietly envious"] },
    { w: "meticulous", b: 2, pos: "adj", d: "showing great attention to detail", x: ["carelessly rushed", "openly hostile", "wildly unpredictable"] },

    // Band 3 (9k)
    { w: "ephemeral", b: 3, pos: "adj", d: "lasting for a very short time", x: ["carved permanently in stone", "unusually heavy", "strictly confidential"] },
    { w: "ubiquitous", b: 3, pos: "adj", d: "present, appearing, or found everywhere", x: ["seen once a century", "confined to oceans", "impossible to measure"] },
    { w: "mitigate", b: 3, pos: "verb", d: "make less severe, serious, or painful", x: ["deliberately escalate", "permanently ban", "publicly ridicule"] },
    { w: "lucid", b: 3, pos: "adj", d: "expressed clearly; easy to understand", x: ["hopelessly tangled", "dimly lit", "emotionally detached"] },
    { w: "tenacious", b: 3, pos: "adj", d: "holding firmly to something; persistent", x: ["quick to surrender", "easily bribed", "strangely absent"] },

    // Band 4 (13k)
    { w: "ostentatious", b: 4, pos: "adj", d: "characterized by vulgar or pretentious display", x: ["modestly understated", "deeply scholarly", "physically fragile"] },
    { w: "cacophony", b: 4, pos: "noun", d: "a harsh, discordant mixture of sounds", x: ["a soothing lullaby", "an ancient map", "a sudden drought"] },
    { w: "equivocate", b: 4, pos: "verb", d: "use ambiguous language to conceal the truth", x: ["speak with blunt clarity", "divide equally", "celebrate loudly"] },
    { w: "parsimonious", b: 4, pos: "adj", d: "unwilling to spend money or use resources", x: ["recklessly extravagant", "warmly hospitable", "loudly argumentative"] },
    { w: "sanguine", b: 4, pos: "adj", d: "optimistic, especially in a difficult situation", x: ["bitterly cynical", "pale with fear", "utterly indifferent"] },

    // Band 5 (17.5k)
    { w: "laconic", b: 5, pos: "adj", d: "using very few words", x: ["rambling endlessly", "deeply melodic", "visually cluttered"] },
    { w: "pernicious", b: 5, pos: "adj", d: "having a harmful effect in a gradual or subtle way", x: ["remarkably nutritious", "mildly amusing", "entirely harmless"] },
    { w: "enervate", b: 5, pos: "verb", d: "cause someone to feel drained of energy", x: ["rapidly energize", "tightly fasten", "formally pardon"] },
    { w: "obfuscate", b: 5, pos: "verb", d: "render obscure, unclear, or unintelligible", x: ["illuminate brightly", "summarize neatly", "verify legally"] },
    { w: "sycophant", b: 5, pos: "noun", d: "a person who acts obsequiously toward someone powerful", x: ["a stubborn rebel", "a wandering monk", "a strict referee"] },

    // Band 6 (22.5k)
    { w: "perspicacious", b: 6, pos: "adj", d: "having a ready insight into and understanding of things", x: ["easily fooled", "sweating profusely", "stubbornly ignorant"] },
    { w: "recalcitrant", b: 6, pos: "adj", d: "obstinately uncooperative toward authority", x: ["eagerly obedient", "quietly repentant", "chemically inert"] },
    { w: "vicissitude", b: 6, pos: "noun", d: "a change of circumstances or fortune, typically unwelcome", x: ["a permanent truce", "a geometric ratio", "a festive parade"] },
    { w: "inimical", b: 6, pos: "adj", d: "tending to obstruct or harm; unfriendly", x: ["deeply supportive", "almost identical", "easily imitated"] },
    { w: "propinquity", b: 6, pos: "noun", d: "nearness in place, time, or relationship", x: ["extreme altitude", "total isolation", "rapid decay"] },

    // Band 7 (28k)
    { w: "mendacious", b: 7, pos: "adj", d: "not telling the truth; lying", x: ["scrupulously honest", "overly charitable", "quietly devout"] },
    { w: "ineluctable", b: 7, pos: "adj", d: "unable to be resisted or avoided; inescapable", x: ["easily postponed", "barely noticeable", "mildly profitable"] },
    { w: "apotheosis", b: 7, pos: "noun", d: "the highest point in the development of something; culmination", x: ["a humiliating defeat", "an early rough draft", "a minor footnote"] },
    { w: "jejune", b: 7, pos: "adj", d: "naive, simplistic, and superficial", x: ["profoundly wise", "exotically spiced", "dangerously sharp"] },
    { w: "truculent", b: 7, pos: "adj", d: "eager or quick to argue or fight; aggressively defiant", x: ["peacefully yielding", "sleepily calm", "politely detached"] },

    // Band 8 (33.5k)
    { w: "sesquipedalian", b: 8, pos: "adj", d: "characterized by long words; long-winded", x: ["strictly monosyllabic", "measured in inches", "written in code"] },
    { w: "limerence", b: 8, pos: "noun", d: "an involuntary state of obsessive romantic infatuation", x: ["a legal easement", "a coastal fog", "a mineral deposit"] },
    { w: "inspissate", b: 8, pos: "verb", d: "thicken or congeal", x: ["evaporate instantly", "shatter cleanly", "polish to a shine"] },
    { w: "pusillanimous", b: 8, pos: "adj", d: "showing a lack of courage or determination; timid", x: ["heroically fearless", "generous to a fault", "unnaturally tall"] },
    { w: "defenestrate", b: 8, pos: "verb", d: "throw someone or something out of a window", x: ["remove from office quietly", "seal airtight", "paint with gold leaf"] },

    // Band 9 (39k)
    { w: "usufruct", b: 9, pos: "noun", d: "the legal right to use and derive profit from property owned by another", x: ["a spoiled harvest", "an ancient coin", "a boundary dispute"] },
    { w: "parrhesia", b: 9, pos: "noun", d: "boldness or freedom of speech, especially speaking truth to power", x: ["a sudden memory lapse", "a ceremonial bow", "a whispered rumor"] },
    { w: "eleemosynary", b: 9, pos: "adj", d: "relating to or dependent on charity", x: ["powered by steam", "strictly military", "geologically ancient"] },
    { w: "velleity", b: 9, pos: "noun", d: "a wish or inclination not strong enough to lead to action", x: ["a violent outburst", "a binding contract", "a rapid descent"] },
    { w: "tatterdemalion", b: 9, pos: "noun", d: "a person in ragged or tattered clothing", x: ["a royal herald", "a precision clock", "a rare butterfly"] },

    // Band 10 (45k)
    { w: "callipygian", b: 10, pos: "adj", d: "having well-shaped buttocks", x: ["having a raspy voice", "blooming at midnight", "carved from marble"] },
    { w: "opsimath", b: 10, pos: "noun", d: "a person who begins to learn or study late in life", x: ["a child prodigy", "a mapmaker", "a chronic insomniac"] },
    { w: "chrestomathy", b: 10, pos: "noun", d: "a selection of passages from authors compiled to help learn a language", x: ["a treatise on fungi", "a naval blockade", "a bone fracture"] },
    { w: "zugzwang", b: 10, pos: "noun", d: "a situation where any move a player makes worsens their position", x: ["a sudden windfall", "a tiebreaker round", "a flanking maneuver"] },
    { w: "ultracrepidarian", b: 10, pos: "adj", d: "expressing opinions on matters outside one's knowledge", x: ["walking across glaciers", "obsessed with footwear", "speaking three dialects"] }
  ],

  foils: [
    { w: "cravulate", pos: "verb" },
    { w: "morphent", pos: "adj" },
    { w: "plinthary", pos: "noun" },
    { w: "stridulous", pos: "adj" },
    { w: "belvicate", pos: "verb" },
    { w: "quandarious", pos: "adj" },
    { w: "trellicate", pos: "verb" },
    { w: "vermiscent", pos: "adj" },
    { w: "faldory", pos: "noun" },
    { w: "glimorate", pos: "verb" },
    { w: "sornic", pos: "adj" },
    { w: "prembulate", pos: "verb" },
    { w: "corybantize", pos: "verb" },
    { w: "luctation", pos: "noun" },
    { w: "ostravent", pos: "adj" },
    { w: "bramulate", pos: "verb" },
    { w: "noctilucentic", pos: "adj" },
    { w: "drivocate", pos: "verb" }
  ]
};
