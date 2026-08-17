/** Compact glossary: [fr, de, es, it, nl] */
export const LOCALES = ["fr", "de", "es", "it", "nl"];

const EXACT = {
  Mugs: ["Mugs", "Tassen", "Tazas", "Tazze", "Mokken"],
  Size: ["Taille", "Größe", "Tamaño", "Misura", "Maat"],
  Home: ["Accueil", "Start", "Inicio", "Home", "Home"],
  Towel: ["Serviette", "Handtuch", "Toalla", "Asciugamano", "Handdoek"],
  Frame: ["Cadre", "Rahmen", "Marco", "Cornice", "Lijst"],
  Color: ["Couleur", "Farbe", "Color", "Colore", "Kleur"],
  Title: ["Titre", "Titel", "Título", "Titolo", "Titel"],
  Model: ["Modèle", "Modell", "Modelo", "Modello", "Model"],
  Towels: ["Serviettes", "Handtücher", "Toallas", "Asciugamani", "Handdoeken"],
  Finish: ["Fini", "Finish", "Acabado", "Finitura", "Afwerking"],
  Format: ["Format", "Format", "Formato", "Formato", "Formaat"],
  Search: ["Recherche", "Suche", "Buscar", "Cerca", "Zoeken"],
  Orders: ["Commandes", "Bestellungen", "Pedidos", "Ordini", "Bestellingen"],
  Magnets: ["Magnets", "Magnete", "Imanes", "Magneti", "Magneten"],
  Jigsaws: ["Puzzles", "Puzzles", "Puzzles", "Puzzle", "Puzzels"],
  Posters: ["Posters", "Poster", "Pósters", "Poster", "Posters"],
  Contact: ["Contact", "Kontakt", "Contacto", "Contatto", "Contact"],
  FAQs: ["FAQ", "FAQ", "Preguntas frecuentes", "FAQ", "FAQ"],
  Catalog: ["Catalogue", "Katalog", "Catálogo", "Catalogo", "Catalogus"],
  Profile: ["Profil", "Profil", "Perfil", "Profilo", "Profiel"],
  "Bio case": ["Coque bio", "Bio-Hülle", "Funda bio", "Cover bio", "Bio hoes"],
  Stickers: ["Stickers", "Sticker", "Pegatinas", "Adesivi", "Stickers"],
  Cushions: ["Coussins", "Kissen", "Cojines", "Cuscini", "Kussens"],
  "Wall art": ["Déco murale", "Wandkunst", "Arte de pared", "Arte da parete", "Wandkunst"],
  Assembly: ["Assemblage", "Montage", "Montaje", "Montaggio", "Montage"],
  "Home page": ["Page d’accueil", "Startseite", "Inicio", "Home", "Startpagina"],
  "Tote bags": ["Sacs tote", "Stoffbeutel", "Bolsas tote", "Tote bag", "Tote bags"],
  Thickness: ["Épaisseur", "Dicke", "Grosor", "Spessore", "Dikte"],
  "Main menu": ["Menu principal", "Hauptmenü", "Menú principal", "Menu principale", "Hoofdmenu"],
  "Tough case": ["Coque renforcée", "Hardcase", "Funda resistente", "Cover rigida", "Stevige hoes"],
  "Hand towel": ["Serviette à main", "Handtuch", "Toalla de mano", "Asciugamano", "Handdoek"],
  "Wood Prints": ["Impressions bois", "Holzdrucke", "Impresiones en madera", "Stampe su legno", "Houtdrukken"],
  "Foam Square": ["Mousse carré", "Schaumstoff Quadrat", "Espuma cuadrada", "Schiuma quadrata", "Schuim vierkant"],
  "Photo tiles": ["Carreaux photo", "Fotokacheln", "Baldosas foto", "Piastrelle foto", "Fototegels"],
  "Beach towel": ["Serviette de plage", "Strandtuch", "Toalla de playa", "Telo mare", "Strandlaken"],
  "Wood prints": ["Impressions bois", "Holzdrucke", "Impresiones en madera", "Stampe su legno", "Houtdrukken"],
  "Foam prints": ["Impressions mousse", "Schaumstoffdrucke", "Impresiones en foam", "Stampe in foam", "Schuimdrukken"],
  "Phone cases": ["Coques", "Handyhüllen", "Fundas", "Cover", "Telefoonhoesjes"],
  Orientation: ["Orientation", "Ausrichtung", "Orientación", "Orientamento", "Oriëntatie"],
  "Footer menu": ["Menu pied de page", "Fußmenü", "Menú de pie", "Menu footer", "Voettekstmenu"],
  "Home & gifts": ["Maison & cadeaux", "Wohnen & Geschenke", "Hogar y regalos", "Casa e regali", "Wonen & cadeaus"],
  "Framed Canvas": ["Toile encadrée", "Gerahmte Leinwand", "Lienzo enmarcado", "Tela incorniciata", "Ingelijst canvas"],
  "Foam Portrait": ["Mousse portrait", "Schaumstoff Hochformat", "Espuma vertical", "Schiuma verticale", "Schuim staand"],
  "Acrylic Print": ["Impression acrylique", "Acryldruck", "Impresión acrílica", "Stampa acrilica", "Acryldruk"],
  "Acrylic prism": ["Prisme acrylique", "Acrylprisma", "Prisma acrílico", "Prisma acrilico", "Acrylprisma"],
  "Canvas Prints": ["Toiles", "Leinwanddrucke", "Lienzos", "Tele", "Canvas prints"],
  "Framed prints": ["Impressions encadrées", "Gerahmte Drucke", "Láminas enmarcadas", "Stampe incorniciate", "Ingelijste prints"],
  "Framed canvas": ["Toile encadrée", "Gerahmte Leinwand", "Lienzo enmarcado", "Tela incorniciata", "Ingelijst canvas"],
  "Water bottles": ["Gourdes", "Trinkflaschen", "Botellas", "Borracce", "Drinkflessen"],
  "Print Material": ["Support d’impression", "Druckmaterial", "Material de impresión", "Supporto di stampa", "Drukmateriaal"],
  "Foam Landscape": ["Mousse paysage", "Schaumstoff Querformat", "Espuma horizontal", "Schiuma orizzontale", "Schuim liggend"],
  "Aluminum Print": ["Impression aluminium", "Aluminiumdruck", "Impresión de aluminio", "Stampa alluminio", "Aluminiumdruk"],
  "Fridge magnets": ["Magnets frigo", "Kühlschrankmagnete", "Imanes de nevera", "Magneti da frigo", "Koelkastmagneten"],
  "Photo cushions": ["Coussins photo", "Fotokissen", "Cojines foto", "Cuscini foto", "Fotokussens"],
  "Jigsaw puzzles": ["Puzzles", "Puzzles", "Puzzles", "Puzzle", "Puzzels"],
  "Acrylic prints": ["Impressions acrylique", "Acryldrucke", "Impresiones acrílicas", "Stampe acriliche", "Acryldrukken"],
  "Acrylic prisms": ["Prismes acrylique", "Acrylprismen", "Prismas acrílicos", "Prismi acrilici", "Acrylprisma’s"],
  "Fine Art Poster": ["Poster beaux-arts", "Fine-Art-Poster", "Póster fine art", "Poster fine art", "Fine art poster"],
  "Slim case apple": ["Coque slim Apple", "Slim Case Apple", "Funda slim Apple", "Cover slim Apple", "Slim hoes Apple"],
  "11oz Ceramic Mug": ["Mug céramique 11 oz", "Keramiktasse 11 oz", "Taza cerámica 11 oz", "Tazza ceramica 11 oz", "Keramische mok 11 oz"],
  "Tough case Apple": ["Coque renforcée Apple", "Hardcase Apple", "Funda resistente Apple", "Cover rigida Apple", "Stevige hoes Apple"],
  "Clear case apple": ["Coque transparente Apple", "Klare Hülle Apple", "Funda transparente Apple", "Cover trasparente Apple", "Transparante hoes Apple"],
  "Flexi case apple": ["Coque flexi Apple", "Flexi Case Apple", "Funda flexi Apple", "Cover flexi Apple", "Flexi hoes Apple"],
  "Classic Tote Bag": ["Tote bag classique", "Klassischer Stoffbeutel", "Tote clásica", "Tote classica", "Klassieke tote bag"],
  "Premium Tote Bag": ["Tote bag premium", "Premium-Stoffbeutel", "Tote premium", "Tote premium", "Premium tote bag"],
  "Slim case samsung": ["Coque slim Samsung", "Slim Case Samsung", "Funda slim Samsung", "Cover slim Samsung", "Slim hoes Samsung"],
  "Kiss-cut stickers": ["Stickers kiss-cut", "Kiss-cut-Sticker", "Pegatinas kiss-cut", "Adesivi kiss-cut", "Kiss-cut stickers"],
  "Temporary tattoos": ["Tatouages temporaires", "Temporäre Tattoos", "Tatuajes temporales", "Tatuaggi temporanei", "Tijdelijke tattoos"],
  "Wall Hanger Color": ["Couleur de la barre", "Aufhängerfarbe", "Color del colgador", "Colore dell’asta", "Kleur ophanglat"],
  "Flexi case samsung": ["Coque flexi Samsung", "Flexi Case Samsung", "Funda flexi Samsung", "Cover flexi Samsung", "Flexi hoes Samsung"],
  "Framed photo tiles": ["Carreaux photo encadrés", "Gerahmte Fotokacheln", "Baldosas foto enmarcadas", "Piastrelle foto incorniciate", "Ingelijste fototegels"],
  "Orientation - Size": ["Orientation - taille", "Ausrichtung - Größe", "Orientación - tamaño", "Orientamento - misura", "Oriëntatie - maat"],
  "Acrylic photo prism": ["Prisme photo acrylique", "Acryl-Fotoprisma", "Prisma foto acrílico", "Prisma foto acrilico", "Acryl fotoprisma"],
  "Posters with hangers": ["Posters avec barres", "Poster mit Aufhängern", "Pósters con colgadores", "Poster con aste", "Posters met ophanglat"],
  "Your Privacy Choices": ["Vos choix de confidentialité", "Ihre Datenschutzoptionen", "Tus opciones de privacidad", "Le tue scelte sulla privacy", "Je privacykeuzes"],
  "White 12oz Enamel Mug": ["Mug émaillé blanc 12 oz", "Weiße Emaille-Tasse 12 oz", "Taza esmaltada blanca 12 oz", "Tazza smaltata bianca 12 oz", "Wit emaille mok 12 oz"],
  "Fine Art Framed Poster": ["Poster beaux-arts encadré", "Gerahmtes Fine-Art-Poster", "Póster fine art enmarcado", "Poster fine art incorniciato", "Ingelijst fine art poster"],
  "Brushed Aluminum Print": ["Impression alu brossé", "Gebürsteter Aluminiumdruck", "Impresión aluminio cepillado", "Stampa alluminio spazzolato", "Geborstelde aluminiumdruk"],
  "White 15oz Ceramic Mug": ["Mug céramique blanc 15 oz", "Weiße Keramiktasse 15 oz", "Taza cerámica blanca 15 oz", "Tazza ceramica bianca 15 oz", "Witte keramische mok 15 oz"],
  "White 11oz Ceramic Mug": ["Mug céramique blanc 11 oz", "Weiße Keramiktasse 11 oz", "Taza cerámica blanca 11 oz", "Tazza ceramica bianca 11 oz", "Witte keramische mok 11 oz"],
  "Magic 11oz Ceramic Mug": ["Mug magique 11 oz", "Magic-Tasse 11 oz", "Taza mágica 11 oz", "Tazza magica 11 oz", "Magische mok 11 oz"],
  "Canvas Prints | Pixora": ["Toiles | Pixora", "Leinwanddrucke | Pixora", "Lienzos | Pixora", "Tele | Pixora", "Canvas prints | Pixora"],
  "Metal / aluminium prints": ["Impressions métal / aluminium", "Metall- / Aluminiumdrucke", "Impresiones metal / aluminio", "Stampe metallo / alluminio", "Metaal- / aluminiumdrukken"],
  "Personalized Canvas Print": ["Toile personnalisée", "Personalisierter Leinwanddruck", "Lienzo personalizado", "Tela personalizzata", "Gepersonaliseerde canvasprint"],
  "Premium Matte Paper Poster": ["Poster papier mat premium", "Premium-Mattpapier-Poster", "Póster papel mate premium", "Poster carta opaca premium", "Premium mat papier poster"],
  "Customer account main menu": ["Menu compte client", "Kundenkonto-Menü", "Menú de cuenta", "Menu account cliente", "Klantaccountmenu"],
  "White Latte 17oz Ceramic Mug": ["Mug latte blanc 17 oz", "Weiße Latte-Tasse 17 oz", "Taza latte blanca 17 oz", "Tazza latte bianca 17 oz", "Witte latte mok 17 oz"],
  "White 10oz Porcelain Slim Mug": ["Mug porcelaine slim blanc 10 oz", "Schlanke Porzellantasse 10 oz", "Taza porcelana slim blanca 10 oz", "Tazza porcellana slim bianca 10 oz", "Wit porseleinen slim mok 10 oz"],
  "Classic Semi-Glossy Paper Poster": ["Poster papier semi-brillant classique", "Klassisches Semiglanz-Poster", "Póster papel satinado clásico", "Poster carta semilucida classica", "Klassiek halfglanzend papierposter"],
  "White 15oz Stainless Steel Travel Mug": ["Mug isotherme inox blanc 15 oz", "Weißer Edelstahl-Thermobecher 15 oz", "Mug de viaje acero blanco 15 oz", "Mug da viaggio acciaio bianco 15 oz", "Witte RVS reisbeker 15 oz"],
  "Premium Matte Paper Poster with Hanger": ["Poster papier mat premium avec barre", "Premium-Mattpapier-Poster mit Aufhänger", "Póster papel mate premium con colgador", "Poster carta opaca premium con asta", "Premium mat poster met ophanglat"],
  "Personalised framed prints from Pixora": ["Impressions encadrées personnalisées Pixora", "Personalisierte gerahmte Drucke von Pixora", "Láminas enmarcadas personalizadas de Pixora", "Stampe incorniciate personalizzate Pixora", "Gepersonaliseerde ingelijste prints van Pixora"],
  "White 17oz Stainless Steel Water Bottle": ["Gourde inox blanche 17 oz", "Weiße Edelstahlflasche 17 oz", "Botella de acero blanca 17 oz", "Borraccia acciaio bianca 17 oz", "Witte RVS drinkfles 17 oz"],
  "White 11oz Ceramic Mug with Color Inside": ["Mug céramique blanc 11 oz intérieur couleur", "Weiße Keramiktasse 11 oz mit Innenfarbe", "Taza cerámica blanca 11 oz interior de color", "Tazza ceramica bianca 11 oz interno colorato", "Witte keramische mok 11 oz met kleur binnenin"],
  "Classic Semi-Glossy Paper Metal Framed Poster": ["Poster semi-brillant classique cadre métal", "Klassisches Semiglanz-Poster mit Metallrahmen", "Póster satinado clásico con marco de metal", "Poster semilucido classico con cornice metallo", "Klassiek halfglanzend poster met metalen lijst"],
  "Personalised framed canvas prints from Pixora": ["Toiles encadrées personnalisées Pixora", "Personalisierte gerahmte Leinwände von Pixora", "Lienzos enmarcados personalizados de Pixora", "Tele incorniciate personalizzate Pixora", "Gepersonaliseerde ingelijste canvassen van Pixora"],
  "Premium Semi-Glossy Paper Wooden Framed Poster Premium": ["Poster semi-brillant premium cadre bois", "Premium-Semiglanz-Poster mit Holzrahmen", "Póster satinado premium con marco de madera", "Poster semilucido premium con cornice legno", "Premium halfglanzend poster met houten lijst"],
  "Classic Semi-Glossy Paper Wooden Framed Poster Bestseller": ["Poster semi-brillant classique cadre bois — best-seller", "Bestseller: Semiglanz-Poster mit Holzrahmen", "Póster satinado clásico con marco de madera — más vendido", "Poster semilucido classico con cornice legno — bestseller", "Klassiek halfglanzend poster met houten lijst — bestseller"],
  Vertical: ["Vertical", "Hochformat", "Vertical", "Verticale", "Staand"],
  Horizontal: ["Horizontal", "Querformat", "Horizontal", "Orizzontale", "Liggend"],
  "Wood frame": ["Cadre bois", "Holzrahmen", "Marco de madera", "Cornice in legno", "Houten lijst"],
  "Dark wood frame": ["Cadre bois foncé", "Dunkler Holzrahmen", "Marco de madera oscura", "Cornice legno scuro", "Donkere houten lijst"],
  "Black frame": ["Cadre noir", "Schwarzer Rahmen", "Marco negro", "Cornice nera", "Zwarte lijst"],
  "White frame": ["Cadre blanc", "Weißer Rahmen", "Marco blanco", "Cornice bianca", "Witte lijst"],
  "Ready-to-hang": ["Prêt à accrocher", "Aufhängfertig", "Listo para colgar", "Pronto da appendere", "Klaar om op te hangen"],
  "Not assembled": ["Non assemblé", "Nicht montiert", "Sin montar", "Non assemblato", "Niet gemonteerd"],
  Standard: ["Standard", "Standard", "Estándar", "Standard", "Standaard"],
  Express: ["Express", "Express", "Exprés", "Express", "Express"],
  "Standard international": ["Standard international", "International Standard", "Estándar internacional", "Standard internazionale", "Standaard internationaal"],
  "Shipping & delivery": ["Livraison", "Versand & Lieferung", "Envío y entrega", "Spedizione e consegna", "Verzending & levering"],
  "Flat Rate": ["tarif forfaitaire", "Pauschale", "tarifa plana", "tariffa fissa", "vast tarief"],
};

const PHRASES = [
  [
    "Personalised canvas prints from Pixora. Upload your photo, preview it on a live product mockup, and we print and ship gallery-quality canvas to your door.",
    [
      "Toiles personnalisées Pixora. Envoyez votre photo, prévisualisez-la sur un mockup, puis nous imprimons et livrons une toile de qualité galerie.",
      "Personalisierte Leinwanddrucke von Pixora. Laden Sie Ihr Foto hoch, sehen Sie die Vorschau am Produkt und wir drucken und liefern Galeriequalität.",
      "Lienzos personalizados de Pixora. Sube tu foto, previsualízala en el producto y la imprimimos y enviamos con calidad de galería.",
      "Tele personalizzate Pixora. Carica la tua foto, vedi l’anteprima sul prodotto e stampiamo e spediamo qualità da galleria.",
      "Gepersonaliseerde canvasprints van Pixora. Upload je foto, bekijk de preview op het product, wij drukken en verzenden galerijkwaliteit.",
    ],
  ],
  [
    "Personalised canvas prints made for your photos. Pick",
    [
      "Toiles personnalisées pour vos photos. Choisissez",
      "Personalisierte Leinwanddrucke für Ihre Fotos. Wählen Sie",
      "Lienzos personalizados para tus fotos. Elige",
      "Tele personalizzate per le tue foto. Scegli",
      "Gepersonaliseerde canvasprints voor je foto’s. Kies",
    ],
  ],
  [
    "then select from 26 sizes and upload your image for a live product preview.",
    [
      "puis choisissez parmi 26 formats et envoyez votre image pour un aperçu en direct.",
      "wählen Sie dann aus 26 Größen und laden Sie Ihr Bild für eine Live-Vorschau hoch.",
      "luego elige entre 26 tamaños y sube tu imagen para una vista previa en vivo.",
      "poi scegli tra 26 formati e carica l’immagine per l’anteprima dal vivo.",
      "kies daarna uit 26 maten en upload je beeld voor een live preview.",
    ],
  ],
  [
    "Gallery-quality canvas on FSC-certified stretcher bars",
    [
      "Toile qualité galerie sur châssis certifié FSC",
      "Galeriequalität auf FSC-zertifizierten Keilrahmen",
      "Lienzo de calidad de galería sobre bastidor certificado FSC",
      "Tela qualità galleria su telaio certificato FSC",
      "Canvas van galerijkwaliteit op FSC-gecertificeerde spieramen",
    ],
  ],
  [
    "Slim (~2cm) and thick (~4cm) wrap",
    [
      "Châssis fin (~2 cm) et épais (~4 cm)",
      "Schlanker (~2 cm) und dicker (~4 cm) Keilrahmen",
      "Bastidor fino (~2 cm) y grueso (~4 cm)",
      "Telaio sottile (~2 cm) e spesso (~4 cm)",
      "Slimme (~2 cm) en dikke (~4 cm) spieraam",
    ],
  ],
  [
    "104 size / orientation / thickness combinations",
    [
      "104 combinaisons format / orientation / épaisseur",
      "104 Kombinationen aus Größe, Ausrichtung und Dicke",
      "104 combinaciones de tamaño / orientación / grosor",
      "104 combinazioni formato / orientamento / spessore",
      "104 combinaties van maat / oriëntatie / dikte",
    ],
  ],
  [
    "Printed and shipped on demand",
    [
      "Imprimé et expédié à la demande",
      "Druck und Versand auf Bestellung",
      "Impreso y enviado bajo demanda",
      "Stampato e spedito su richiesta",
      "Gedrukt en verzonden on demand",
    ],
  ],
  [
    "Upload your photo, preview it on a live product mockup, and we print and ship gallery-quality canvas to your door.",
    [
      "Envoyez votre photo, prévisualisez-la, puis nous imprimons et livrons une toile de qualité galerie.",
      "Laden Sie Ihr Foto hoch, sehen Sie die Vorschau und wir liefern Galeriequalität.",
      "Sube tu foto, previsualízala y enviamos un lienzo de calidad de galería.",
      "Carica la tua foto, vedi l’anteprima e spediamo una tela da galleria.",
      "Upload je foto, bekijk de preview en wij verzenden canvas van galerijkwaliteit.",
    ],
  ],
  [
    "Canvas, framed prints, metal, acrylic, posters and more.",
    [
      "Toiles, impressions encadrées, métal, acrylique, posters et plus.",
      "Leinwand, gerahmte Drucke, Metall, Acryl, Poster und mehr.",
      "Lienzos, láminas enmarcadas, metal, acrílico, pósters y más.",
      "Tele, stampe incorniciate, metallo, acrilico, poster e altro.",
      "Canvas, ingelijste prints, metaal, acryl, posters en meer.",
    ],
  ],
  [
    "Aluminum and brushed aluminum prints — vivid metal wall art.",
    [
      "Impressions aluminium et alu brossé — déco murale métal vive.",
      "Aluminium- und gebürstete Aluminiumdrucke — kräftige Metall-Wandkunst.",
      "Impresiones de aluminio liso y cepillado: arte de pared metálico.",
      "Stampe in alluminio liscio e spazzolato — arte da parete metallica.",
      "Aluminium- en geborstelde aluminiumdrukken — levendige metalen wandkunst.",
    ],
  ],
  [
    "Lightweight foam board prints — portrait, landscape or square.",
    [
      "Impressions mousse légères — portrait, paysage ou carré.",
      "Leichte Schaumstoffdrucke — Hochformat, Querformat oder Quadrat.",
      "Impresiones de foam ligeras: vertical, horizontal o cuadrado.",
      "Stampe in foam leggere — verticale, orizzontale o quadrato.",
      "Lichte schuimdrukken — staand, liggend of vierkant.",
    ],
  ],
  [
    "Personalised ceramic mugs — classic white or colour-inside styles.",
    [
      "Mugs céramique personnalisés — blanc classique ou intérieur couleur.",
      "Personalisierte Keramiktassen — klassisch weiß oder mit Innenfarbe.",
      "Tazas de cerámica personalizadas: blanco clásico o interior de color.",
      "Tazze in ceramica personalizzate — bianco classico o interno colorato.",
      "Gepersonaliseerde keramische mokken — klassiek wit of kleur binnenin.",
    ],
  ],
  [
    "Personalised mugs, bottles and more — gifts they’ll use every day.",
    [
      "Mugs, gourdes et plus — des cadeaux utilisés chaque jour.",
      "Tassen, Flaschen und mehr — Geschenke für jeden Tag.",
      "Tazas, botellas y más: regalos de uso diario.",
      "Tazze, borracce e altro — regali di tutti i giorni.",
      "Mokken, flessen en meer — cadeaus voor elke dag.",
    ],
  ],
  [
    "Natural wood grain prints — choose thickness, orientation and size.",
    [
      "Impressions sur bois naturel — choisissez épaisseur, orientation et format.",
      "Drucke auf Naturholz — Dicke, Ausrichtung und Größe wählen.",
      "Impresiones en veta de madera: elige grosor, orientación y tamaño.",
      "Stampe su legno naturale — scegli spessore, orientamento e formato.",
      "Drukken op natuurlijke houtlook — kies dikte, oriëntatie en maat.",
    ],
  ],
  [
    "Posters with wood hangers — pick hanger colour, orientation and size.",
    [
      "Posters avec barres bois — couleur, orientation et format.",
      "Poster mit Holzaufhängern — Farbe, Ausrichtung und Größe wählen.",
      "Pósters con colgadores de madera: color, orientación y tamaño.",
      "Poster con aste in legno — colore, orientamento e formato.",
      "Posters met houten ophanglat — kies kleur, oriëntatie en maat.",
    ],
  ],
  [
    "Personalised stainless steel water bottles — print your photo or design.",
    [
      "Gourdes inox personnalisées — imprimez votre photo ou motif.",
      "Personalisierte Edelstahlflaschen — Ihr Foto oder Design.",
      "Botellas de acero personalizadas: imprime tu foto o diseño.",
      "Borracce in acciaio personalizzate — stampa foto o grafica.",
      "Gepersonaliseerde RVS flessen — druk je foto of ontwerp.",
    ],
  ],
  [
    "Personalised tote bags — classic and premium styles with colour options.",
    [
      "Tote bags personnalisés — classiques et premium, plusieurs couleurs.",
      "Personalisierte Stoffbeutel — Classic und Premium, mit Farboptionen.",
      "Tote bags personalizadas: clásica y premium, con colores.",
      "Tote bag personalizzate — classiche e premium, con colori.",
      "Gepersonaliseerde tote bags — classic en premium, met kleuren.",
    ],
  ],
  [
    "Faux suede throw cushions with a single-sided photo print and fibre fill.",
    [
      "Coussins suédine, impression photo d’un côté, garnissage fibres.",
      "Wildlederoptik-Kissen mit einseitigem Fotodruck und Faserfüllung.",
      "Cojines de ante sintético con foto a un lado y relleno de fibra.",
      "Cuscini in scamosciato con stampa foto su un lato e imbottitura in fibra.",
      "Kussens van imitatiesuède met foto aan één kant en vezelvulling.",
    ],
  ],
  [
    "Glossy acrylic wall prints — choose orientation and size, then personalize.",
    [
      "Impressions acrylique brillantes — orientation, format, puis personnalisez.",
      "Glänzende Acryl-Wanddrucke — Ausrichtung und Größe, dann personalisieren.",
      "Impresiones acrílicas brillantes: orientación, tamaño y personaliza.",
      "Stampe acriliche lucide — orientamento, formato, poi personalizza.",
      "Glanzende acrylwanddrukken — kies oriëntatie en maat, personaliseer daarna.",
    ],
  ],
  [
    "Personalised canvas prints — portrait, landscape, square, slim and thick wrap, 26 sizes.",
    [
      "Toiles personnalisées — portrait, paysage, carré, châssis fin ou épais, 26 formats.",
      "Personalisierte Leinwände — Hoch-/Querformat, Quadrat, schmal/dick, 26 Größen.",
      "Lienzos personalizados: vertical, horizontal, cuadrado, fino o grueso, 26 tamaños.",
      "Tele personalizzate — verticale, orizzontale, quadrato, sottile o spesso, 26 formati.",
      "Gepersonaliseerde canvassen — staand, liggend, vierkant, slim of dik, 26 maten.",
    ],
  ],
  [
    "Paper posters in multiple finishes. Pick a finish, then choose size and personalize.",
    [
      "Posters papier, plusieurs finitions. Choisissez la finition, le format, puis personnalisez.",
      "Papierposter in mehreren Oberflächen. Finish wählen, Größe, dann personalisieren.",
      "Pósters de papel con varios acabados. Elige acabado, tamaño y personaliza.",
      "Poster di carta con più finiture. Scegli finitura, formato e personalizza.",
      "Papieren posters in meerdere afwerkingen. Kies afwerking, maat en personaliseer.",
    ],
  ],
  [
    "Canvas prints in a tray frame - choose frame colour, orientation and size, then personalize.",
    [
      "Toiles en caisse américaine — couleur du cadre, orientation, format, puis personnalisez.",
      "Leinwand im Schattenfugenrahmen — Rahmenfarbe, Ausrichtung, Größe, dann personalisieren.",
      "Lienzos en marco bandeja: color, orientación, tamaño y personaliza.",
      "Tele in cornice a cassetta — colore, orientamento, formato, poi personalizza.",
      "Canvas in baklijst — kies lijstkleur, oriëntatie en maat, personaliseer daarna.",
    ],
  ],
  [
    "Personalised framed prints - choose frame colour, size and orientation, then upload your photo.",
    [
      "Impressions encadrées personnalisées — couleur du cadre, format, orientation, puis photo.",
      "Personalisierte gerahmte Drucke — Rahmenfarbe, Größe, Ausrichtung, dann Foto hochladen.",
      "Láminas enmarcadas personalizadas: color de marco, tamaño, orientación y sube tu foto.",
      "Stampe incorniciate personalizzate — colore cornice, formato, orientamento, poi carica la foto.",
      "Gepersonaliseerde ingelijste prints — lijstkleur, maat, oriëntatie, daarna foto uploaden.",
    ],
  ],
  [
    "No minimum orders, printed and shipped on demand.",
    [
      "Pas de commande minimum, imprimé et expédié à la demande.",
      "Keine Mindestbestellung, Druck und Versand auf Bestellung.",
      "Sin pedido mínimo: se imprime y envía bajo demanda.",
      "Nessun ordine minimo: stampato e spedito su richiesta.",
      "Geen minimumbestelling: gedrukt en verzonden on demand.",
    ],
  ],
  [
    "No minimum orders, printed and shipped on demand to guarantee freshness and customization for every order.",
    [
      "Pas de commande minimum : imprimé et expédié à la demande pour chaque commande.",
      "Keine Mindestbestellung: Druck und Versand auf Bestellung für jede Bestellung.",
      "Sin pedido mínimo: se imprime y envía bajo demanda en cada pedido.",
      "Nessun ordine minimo: stampato e spedito su richiesta per ogni ordine.",
      "Geen minimumbestelling: gedrukt en verzonden on demand voor elke bestelling.",
    ],
  ],
  [
    "This product is made on demand. No minimums.",
    [
      "Ce produit est fabriqué à la demande. Pas de minimum.",
      "Dieses Produkt wird auf Bestellung gefertigt. Keine Mindestmenge.",
      "Este producto se fabrica bajo demanda. Sin mínimos.",
      "Questo prodotto è realizzato su richiesta. Nessun minimo.",
      "Dit product wordt on demand gemaakt. Geen minimum.",
    ],
  ],
  [
    "Printed and shipped on demand. No minimum order.",
    [
      "Imprimé et expédié à la demande. Pas de commande minimum.",
      "Druck und Versand auf Bestellung. Keine Mindestbestellung.",
      "Impreso y enviado bajo demanda. Sin pedido mínimo.",
      "Stampato e spedito su richiesta. Nessun ordine minimo.",
      "Gedrukt en verzonden on demand. Geen minimumbestelling.",
    ],
  ],
  [
    "printed and shipped on demand",
    [
      "imprimé et expédié à la demande",
      "Druck und Versand auf Bestellung",
      "impreso y enviado bajo demanda",
      "stampato e spedito su richiesta",
      "gedrukt en verzonden on demand",
    ],
  ],
  [
    "We’ll mock up and confirm before dispatch — we won’t print the stock photo.",
    [
      "Nous préparons une maquette et la confirmons avant l’expédition — nous n’imprimerons pas la photo d’exemple.",
      "Wir erstellen ein Mockup und bestätigen es vor dem Versand — wir drucken nicht das Beispielbild.",
      "Haremos una maqueta y la confirmaremos antes del envío: no imprimiremos la foto de ejemplo.",
      "Prepariamo un mockup e lo confermiamo prima della spedizione — non stamperemo la foto di esempio.",
      "We maken een mock-up en bevestigen die vóór verzending — we drukken niet de voorbeeldfoto.",
    ],
  ],
  [
    "We’ll mock up and confirm before dispatch.",
    [
      "Nous préparons une maquette et la confirmons avant l’expédition.",
      "Wir erstellen ein Mockup und bestätigen es vor dem Versand.",
      "Haremos una maqueta y la confirmaremos antes del envío.",
      "Prepariamo un mockup e lo confermiamo prima della spedizione.",
      "We maken een mock-up en bevestigen die vóór verzending.",
    ],
  ],
  [
    "We’ll print from your artwork — not the stock photo.",
    [
      "Nous imprimerons votre fichier — pas la photo d’exemple.",
      "Wir drucken Ihre Datei — nicht das Beispielbild.",
      "Imprimiremos tu archivo, no la foto de ejemplo.",
      "Stamperemo il tuo file — non la foto di esempio.",
      "We drukken jouw bestand — niet de voorbeeldfoto.",
    ],
  ],
  [
    "Use Personalize design to upload a JPG or PNG.",
    [
      "Utilisez Personnaliser le design pour envoyer un JPG ou un PNG.",
      "Laden Sie über Design personalisieren ein JPG oder PNG hoch.",
      "Usa Personalizar diseño para subir un JPG o PNG.",
      "Usa Personalizza design per caricare un JPG o PNG.",
      "Gebruik Ontwerp personaliseren om een JPG of PNG te uploaden.",
    ],
  ],
  [
    "Upload a JPG or PNG.",
    [
      "Envoyez un JPG ou un PNG.",
      "Laden Sie ein JPG oder PNG hoch.",
      "Sube un JPG o PNG.",
      "Carica un JPG o PNG.",
      "Upload een JPG of PNG.",
    ],
  ],
  [
    "Upload your photo or artwork after checkout. Printed on demand and shipped in plain packaging.",
    [
      "Envoyez votre photo après le paiement. Impression à la demande, colis discret.",
      "Laden Sie Ihr Foto nach dem Checkout hoch. Druck auf Bestellung, neutrale Verpackung.",
      "Sube tu foto después del pago. Impresión bajo demanda y envío en embalaje discreto.",
      "Carica la tua foto dopo il pagamento. Stampa su richiesta e spedizione in confezione neutra.",
      "Upload je foto na het afrekenen. On-demand druk en neutrale verpakking.",
    ],
  ],
  [
    "Learn about paper types and their unique textures and finishes",
    [
      "En savoir plus sur les types de papier, textures et finitions",
      "Mehr zu Papiertypen, Texturen und Oberflächen",
      "Más sobre tipos de papel, texturas y acabados",
      "Scopri i tipi di carta, texture e finiture",
      "Meer over papiertypes, texturen en afwerkingen",
    ],
  ],
  ["here", ["ici", "hier", "aquí", "qui", "hier"]],
  ["learn more here", ["en savoir plus", "mehr erfahren", "más información", "scopri di più", "meer info"]],
  ["learn more", ["en savoir plus", "mehr erfahren", "más información", "scopri di più", "meer info"]],
  ["Paper Finishing:", ["Finition papier :", "Papieroberfläche:", "Acabado del papel:", "Finitura carta:", "Papierafwerking:"]],
  ["Paper Weight:", ["Grammage :", "Papiergewicht:", "Gramaje:", "Grammatura:", "Papiergewicht:"]],
  ["Sustainable Paper:", ["Papier durable :", "Nachhaltiges Papier:", "Papel sostenible:", "Carta sostenibile:", "Duurzaam papier:"]],
  ["Available Sizes:", ["Formats :", "Verfügbare Größen:", "Tamaños disponibles:", "Formati disponibili:", "Beschikbare maten:"]],
  ["Hanging Kit:", ["Kit d’accrochage :", "Aufhängeset:", "Kit de colgar:", "Kit per appendere:", "Ophangset:"]],
  ["Canvas Material:", ["Toile :", "Leinwandmaterial:", "Material del lienzo:", "Materiale tela:", "Canvasmateriaal:"]],
  ["Frame Material:", ["Matériau du cadre :", "Rahmenmaterial:", "Material del marco:", "Materiale cornice:", "Lijstmateriaal:"]],
  ["Frame Color:", ["Couleur du cadre :", "Rahmenfarbe:", "Color del marco:", "Colore cornice:", "Lijstkleur:"]],
  ["Frame Measurements:", ["Dimensions du cadre :", "Rahmenmaße:", "Medidas del marco:", "Misure cornice:", "Lijstmaten:"]],
  ["Ready-to-hang:", ["Prêt à accrocher :", "Aufhängfertig:", "Listo para colgar:", "Pronto da appendere:", "Klaar om op te hangen:"]],
  ["Material:", ["Matière :", "Material:", "Material:", "Materiale:", "Materiaal:"]],
  ["Thickness:", ["Épaisseur :", "Dicke:", "Grosor:", "Spessore:", "Dikte:"]],
  ["Printing:", ["Impression :", "Druck:", "Impresión:", "Stampa:", "Druk:"]],
  ["Finish:", ["Fini :", "Finish:", "Acabado:", "Finitura:", "Afwerking:"]],
  ["Sizes:", ["Formats :", "Größen:", "Tamaños:", "Formati:", "Maten:"]],
  ["Protection:", ["Protection :", "Schutz:", "Protección:", "Protezione:", "Bescherming:"]],
  ["Color Vibrancy:", ["Vivacité des couleurs :", "Farbbrillanz:", "Viveza del color:", "Vividezza dei colori:", "Kleurbelichting:"]],
  ["Eco-Friendly Materials:", ["Matières éco-responsables :", "Umweltfreundliche Materialien:", "Materiales ecológicos:", "Materiali eco-friendly:", "Milieuvriendelijke materialen:"]],
  ["Hanger Material:", ["Matériau de la barre :", "Aufhängermaterial:", "Material del colgador:", "Materiale asta:", "Materiaal ophanglat:"]],
  ["Paper Finish:", ["Finition papier :", "Papierfinish:", "Acabado del papel:", "Finitura carta:", "Papierafwerking:"]],
  ["Recommended Use:", ["Usage conseillé :", "Empfohlene Nutzung:", "Uso recomendado:", "Uso consigliato:", "Aanbevolen gebruik:"]],
  ["Size Options:", ["Formats :", "Größenoptionen:", "Opciones de tamaño:", "Opzioni formato:", "Maatopties:"]],
  ["Frame Colors:", ["Couleurs de cadre :", "Rahmenfarben:", "Colores de marco:", "Colori cornice:", "Lijstkleuren:"]],
  ["Sustainable Wood:", ["Bois durable :", "Nachhaltiges Holz:", "Madera sostenible:", "Legno sostenibile:", "Duurzaam hout:"]],
  ["High-Quality Printing:", ["Impression haute qualité :", "Hochwertiger Druck:", "Impresión de alta calidad:", "Stampa di alta qualità:", "Hoogwaardige druk:"]],
  ["Frame Dimensions:", ["Dimensions du cadre :", "Rahmenmaße:", "Dimensiones del marco:", "Dimensioni cornice:", "Lijstafmetingen:"]],
  ["Canvas frame:", ["Cadre de toile :", "Leinwandrahmen:", "Marco del lienzo:", "Telaio della tela:", "Canvaslijst:"]],
  ["Color Options:", ["Options de couleur :", "Farboptionen:", "Opciones de color:", "Opzioni colore:", "Kleuropties:"]],
  ["Texture & Finish:", ["Texture et fini :", "Textur & Finish:", "Textura y acabado:", "Texture e finitura:", "Textuur & afwerking:"]],
  ["Packaging:", ["Emballage :", "Verpackung:", "Embalaje:", "Imballaggio:", "Verpakking:"]],
  ["Printing & Shipping:", ["Impression et livraison :", "Druck & Versand:", "Impresión y envío:", "Stampa e spedizione:", "Druk & verzending:"]],
  ["Features:", ["Caractéristiques :", "Merkmale:", "Características:", "Caratteristiche:", "Kenmerken:"]],
  ["Design:", ["Design :", "Design:", "Diseño:", "Design:", "Ontwerp:"]],
  ["Care instructions", ["Entretien", "Pflegehinweise", "Instrucciones de cuidado", "Istruzioni di cura", "Onderhoudsinstructies"]],
  ["Size guide", ["Guide des tailles", "Größentabelle", "Guía de tallas", "Guida alle taglie", "Maattabel"]],
  ["Dishwasher and microwave safe", ["Lave-vaisselle et micro-ondes", "Spülmaschinen- und mikrowellengeeignet", "Apto para lavavajillas y microondas", "Lavastoviglie e microonde", "Vaatwasser- en magnetronbestendig"]],
  ["NOT dishwasher or microwave safe", ["PAS lave-vaisselle ni micro-ondes", "NICHT spülmaschinen- oder mikrowellengeeignet", "NO apto para lavavajillas ni microondas", "NON adatto a lavastoviglie o microonde", "NIET vaatwasser- of magnetronbestendig"]],
  ["Handwash only", ["Lavage à la main uniquement", "Nur von Hand waschen", "Solo lavado a mano", "Solo lavaggio a mano", "Alleen handwas"]],
  ["Not microwave safe", ["Pas micro-ondes", "Nicht mikrowellengeeignet", "No apto para microondas", "Non adatto al microonde", "Niet magnetronbestendig"]],
  ["portrait", ["portrait", "Hochformat", "vertical", "verticale", "staand"]],
  ["landscape", ["paysage", "Querformat", "horizontal", "orizzontale", "liggend"]],
  ["square", ["carré", "Quadrat", "cuadrado", "quadrato", "vierkant"]],
  ["slim", ["fin", "slim", "fino", "sottile", "slim"]],
  ["thick", ["épais", "dick", "grueso", "spesso", "dik"]],
  ["rest of the world", ["reste du monde", "Rest der Welt", "resto del mundo", "resto del mondo", "rest van de wereld"]],
  ["varies by country", ["selon le pays", "je nach Land", "según el país", "varia per paese", "verschilt per land"]],
  ["varies by fulfillment country", ["selon le pays d’expédition", "je nach Versandland", "según el país de envío", "varia per paese di evasione", "verschilt per verzendland"]],
  ["Included", ["Inclus", "Enthalten", "Incluido", "Incluso", "Inbegrepen"]],
  ["For indoor display", ["Pour un usage intérieur", "Für den Innenbereich", "Para uso interior", "Per uso interno", "Voor binnengebruik"]],
];

export function translateValue(source, locale) {
  if (!source || typeof source !== "string") return source;
  const idx = LOCALES.indexOf(locale);
  if (idx < 0) return source;
  if (EXACT[source]) return EXACT[source][idx];

  let out = source;
  const phrases = [...PHRASES].sort((a, b) => b[0].length - a[0].length);
  for (const [en, arr] of phrases) {
    if (!en) continue;
    out = out.split(en).join(arr[idx]);
  }
  for (const [en, arr] of Object.entries(EXACT)) {
    if (en.length < 4) continue;
    out = out.split(en).join(arr[idx]);
  }
  out = out.replace(/\bFlat Rate\b/g, EXACT["Flat Rate"][idx]);
  return out;
}

export const SHIPPING_TITLE = "Shipping & delivery";

export const SHIPPING_HTML = {
  en: `<h2>How delivery works</h2>
<p>Every Pixora order is printed after you buy it, then shipped to your door. Times below are typical, not guaranteed — busy periods can add a few days. Checkout shows the shipping rate for your address.</p>
<h3>Wall art, posters, mugs, bottles, phone cases and tote bags</h3>
<p>Printed close to you. Production is usually 1–3 business days, then shipping:</p>
<ul>
<li>United Kingdom: typically 3–7 business days in total</li>
<li>European Union: typically 4–10 business days in total</li>
<li>United States &amp; Canada: typically 5–12 business days in total</li>
<li>Australia: typically 5–12 business days in total</li>
</ul>
<h3>Stickers, temporary tattoos, magnets, photo tiles, cushions, acrylic prisms and jigsaws</h3>
<p>We mock up your design and confirm it with you first, then print and ship. Typically 5–14 business days depending on destination.</p>
<h3>Towels</h3>
<p>We mock up your design and confirm it with you first, then print and ship. Typically 7–16 business days depending on destination.</p>
<p>You will get a tracking email when the order ships. We never print the stock product photo — only the artwork you upload or confirm.</p>
<h2>How to track your order</h2>
<p>You can check out as a guest — no account needed. After you pay, we email you a link to view the order. When it ships, a second email includes tracking.</p>
<p>To see all your orders in one place, use <strong>Sign in</strong> in the header. We’ll send a code to your email — no password. At checkout you can also choose to save your details for next time.</p>`,
  fr: `<h2>Comment fonctionne la livraison</h2>
<p>Chaque commande Pixora est imprimée après votre achat, puis envoyée chez vous. Les délais ci-dessous sont indicatifs, non garantis — les périodes chargées peuvent ajouter quelques jours. Le paiement affiche le tarif pour votre adresse.</p>
<h3>Déco murale, posters, mugs, gourdes, coques et tote bags</h3>
<p>Imprimé près de chez vous. Production généralement 1–3 jours ouvrés, puis expédition :</p>
<ul>
<li>Royaume-Uni : généralement 3–7 jours ouvrés au total</li>
<li>Union européenne : généralement 4–10 jours ouvrés au total</li>
<li>États-Unis et Canada : généralement 5–12 jours ouvrés au total</li>
<li>Australie : généralement 5–12 jours ouvrés au total</li>
</ul>
<h3>Stickers, tatouages temporaires, magnets, carreaux photo, coussins, prismes acrylique et puzzles</h3>
<p>Nous préparons une maquette, vous la confirmez, puis nous imprimons et expédions. Généralement 5–14 jours ouvrés selon la destination.</p>
<h3>Serviettes</h3>
<p>Nous préparons une maquette, vous la confirmez, puis nous imprimons et expédions. Généralement 7–16 jours ouvrés selon la destination.</p>
<p>Vous recevez un e-mail de suivi à l’expédition. Nous n’imprimons jamais la photo d’exemple — uniquement le visuel que vous envoyez ou confirmez.</p>
<h2>Suivre votre commande</h2>
<p>Vous pouvez payer en invité — pas besoin de compte. Après le paiement, nous envoyons un lien pour voir la commande. À l’expédition, un second e-mail contient le suivi.</p>
<p>Pour voir toutes vos commandes, utilisez <strong>Connexion</strong> dans l’en-tête. Nous envoyons un code par e-mail — pas de mot de passe. Au paiement, vous pouvez aussi enregistrer vos coordonnées pour la prochaine fois.</p>`,
  de: `<h2>So funktioniert die Lieferung</h2>
<p>Jede Pixora-Bestellung wird nach dem Kauf gedruckt und zu Ihnen geschickt. Die Zeiten sind Richtwerte, keine Garantie — in Stoßzeiten kann es länger dauern. An der Kasse sehen Sie den Versandpreis für Ihre Adresse.</p>
<h3>Wandkunst, Poster, Tassen, Flaschen, Handyhüllen und Stoffbeutel</h3>
<p>Nah bei Ihnen gedruckt. Produktion meist 1–3 Werktage, danach Versand:</p>
<ul>
<li>Vereinigtes Königreich: in der Regel 3–7 Werktage insgesamt</li>
<li>Europäische Union: in der Regel 4–10 Werktage insgesamt</li>
<li>USA &amp; Kanada: in der Regel 5–12 Werktage insgesamt</li>
<li>Australien: in der Regel 5–12 Werktage insgesamt</li>
</ul>
<h3>Sticker, temporäre Tattoos, Magnete, Fotokacheln, Kissen, Acrylprismen und Puzzles</h3>
<p>Wir erstellen ein Mockup, Sie bestätigen es, dann drucken und versenden wir. Typisch 5–14 Werktage je nach Ziel.</p>
<h3>Handtücher</h3>
<p>Wir erstellen ein Mockup, Sie bestätigen es, dann drucken und versenden wir. Typisch 7–16 Werktage je nach Ziel.</p>
<p>Sie erhalten eine Tracking-E-Mail beim Versand. Wir drucken nie das Beispielbild — nur Ihre hochgeladene oder bestätigte Datei.</p>
<h2>Bestellung verfolgen</h2>
<p>Sie können als Gast bezahlen — kein Konto nötig. Nach der Zahlung senden wir einen Link zur Bestellung. Beim Versand folgt eine zweite E-Mail mit Tracking.</p>
<p>Alle Bestellungen sehen Sie unter <strong>Anmelden</strong> in der Kopfzeile. Wir schicken einen Code per E-Mail — kein Passwort. An der Kasse können Sie Ihre Daten für das nächste Mal speichern.</p>`,
  es: `<h2>Cómo funciona el envío</h2>
<p>Cada pedido de Pixora se imprime después de comprarlo y se envía a tu puerta. Los plazos son orientativos, no garantizados: en temporadas altas pueden sumarse unos días. El pago muestra la tarifa para tu dirección.</p>
<h3>Arte de pared, pósters, tazas, botellas, fundas y tote bags</h3>
<p>Impreso cerca de ti. Producción habitual de 1–3 días laborables y luego envío:</p>
<ul>
<li>Reino Unido: normalmente 3–7 días laborables en total</li>
<li>Unión Europea: normalmente 4–10 días laborables en total</li>
<li>Estados Unidos y Canadá: normalmente 5–12 días laborables en total</li>
<li>Australia: normalmente 5–12 días laborables en total</li>
</ul>
<h3>Pegatinas, tatuajes temporales, imanes, baldosas foto, cojines, prismas acrílicos y puzzles</h3>
<p>Hacemos una maqueta, la confirmas y luego imprimimos y enviamos. Normalmente 5–14 días laborables según destino.</p>
<h3>Toallas</h3>
<p>Hacemos una maqueta, la confirmas y luego imprimimos y enviamos. Normalmente 7–16 días laborables según destino.</p>
<p>Recibirás un correo de seguimiento al enviarse. Nunca imprimimos la foto de ejemplo: solo el archivo que subes o confirmas.</p>
<h2>Seguir tu pedido</h2>
<p>Puedes pagar como invitado, sin cuenta. Tras el pago te enviamos un enlace para ver el pedido. Al enviarse, un segundo correo incluye el seguimiento.</p>
<p>Para ver todos tus pedidos, usa <strong>Iniciar sesión</strong> en la cabecera. Te enviamos un código por correo, sin contraseña. En el pago también puedes guardar tus datos para la próxima vez.</p>`,
  it: `<h2>Come funziona la spedizione</h2>
<p>Ogni ordine Pixora viene stampato dopo l’acquisto e spedito a casa tua. I tempi sono indicativi, non garantiti — nei periodi di punta possono allungarsi. Il checkout mostra la tariffa per il tuo indirizzo.</p>
<h3>Arte da parete, poster, tazze, borracce, cover e tote bag</h3>
<p>Stampati vicino a te. Produzione di solito 1–3 giorni lavorativi, poi spedizione:</p>
<ul>
<li>Regno Unito: in genere 3–7 giorni lavorativi in totale</li>
<li>Unione europea: in genere 4–10 giorni lavorativi in totale</li>
<li>Stati Uniti e Canada: in genere 5–12 giorni lavorativi in totale</li>
<li>Australia: in genere 5–12 giorni lavorativi in totale</li>
</ul>
<h3>Adesivi, tatuaggi temporanei, magneti, piastrelle foto, cuscini, prismi acrilici e puzzle</h3>
<p>Prepariamo un mockup, lo confermi e poi stampiamo e spediamo. In genere 5–14 giorni lavorativi a seconda della destinazione.</p>
<h3>Asciugamani</h3>
<p>Prepariamo un mockup, lo confermi e poi stampiamo e spediamo. In genere 7–16 giorni lavorativi a seconda della destinazione.</p>
<p>Riceverai un’email di tracking alla spedizione. Non stampiamo mai la foto di esempio — solo il file che carichi o confermi.</p>
<h2>Traccia il tuo ordine</h2>
<p>Puoi pagare come ospite, senza account. Dopo il pagamento ti inviamo un link per vedere l’ordine. Alla spedizione una seconda email include il tracking.</p>
<p>Per vedere tutti gli ordini usa <strong>Accedi</strong> in alto. Ti inviamo un codice via email — niente password. Al checkout puoi anche salvare i dati per la prossima volta.</p>`,
  nl: `<h2>Hoe verzending werkt</h2>
<p>Elke Pixora-bestelling wordt na aankoop gedrukt en naar je deur gestuurd. De tijden zijn richtlijnen, geen garantie — in drukke periodes kan het langer duren. Bij het afrekenen zie je het tarief voor je adres.</p>
<h3>Wandkunst, posters, mokken, flessen, hoesjes en tote bags</h3>
<p>Dichtbij jou gedrukt. Productie meestal 1–3 werkdagen, daarna verzending:</p>
<ul>
<li>Verenigd Koninkrijk: meestal 3–7 werkdagen in totaal</li>
<li>Europese Unie: meestal 4–10 werkdagen in totaal</li>
<li>Verenigde Staten &amp; Canada: meestal 5–12 werkdagen in totaal</li>
<li>Australië: meestal 5–12 werkdagen in totaal</li>
</ul>
<h3>Stickers, tijdelijke tattoos, magneten, fototegels, kussens, acrylprisma’s en puzzels</h3>
<p>We maken een mock-up, jij bevestigt die, daarna drukken en verzenden we. Meestal 5–14 werkdagen afhankelijk van de bestemming.</p>
<h3>Handdoeken</h3>
<p>We maken een mock-up, jij bevestigt die, daarna drukken en verzenden we. Meestal 7–16 werkdagen afhankelijk van de bestemming.</p>
<p>Je krijgt een track-and-trace-mail bij verzending. We drukken nooit de voorbeeldfoto — alleen het bestand dat je uploadt of bevestigt.</p>
<h2>Je bestelling volgen</h2>
<p>Je kunt als gast afrekenen — geen account nodig. Na betaling mailen we een link naar de order. Bij verzending volgt een tweede mail met tracking.</p>
<p>Al je orders zie je via <strong>Inloggen</strong> in de header. We sturen een code naar je e-mail — geen wachtwoord. Bij het afrekenen kun je je gegevens ook bewaren voor de volgende keer.</p>`,
};

export const FAQ_TITLE = "FAQs";

export const FAQ_HTML = {
  en: `<h2>How does personalise work?</h2>
<p>Upload a photo, preview it on the product, then add it to your basket. For some products we confirm a mockup with you before we print. We never print the stock product photo — only the artwork you upload or confirm.</p>
<h2>What file types can I use?</h2>
<p>JPG or PNG, under 15 MB. Use the highest quality photo you have. We can crop and fit it on the product in the preview.</p>
<h2>How long does it take?</h2>
<p>Every order is printed after you buy it. Wall art, posters, mugs, bottles, cases and totes are typically 3–12 business days depending on destination. Stickers, tattoos, magnets, tiles, cushions, prisms and jigsaws are typically 5–14. Towels are typically 7–16. Checkout shows shipping for your address. See <a href="/pages/shipping">Shipping &amp; delivery</a> for more detail.</p>
<h2>How do I track my order?</h2>
<p>We email a link after you pay, then a second email with tracking when it ships. You can also use <strong>Sign in / Register</strong> in the header — we’ll send a code to your email, no password — then open <strong>Your orders</strong>.</p>
<h2>What if the print is wrong?</h2>
<p>If it arrives damaged, faulty, or not as described, contact us within 14 days with your order number and photos. We’ll offer a reprint or refund as appropriate. Use the <a href="/pages/contact">contact form</a> or the chat button.</p>
<h2>Can I return a personalised item?</h2>
<p>Personalised prints are made for you, so we can’t accept returns because you changed your mind. Faulty or damaged items are covered — see our <a href="/policies/refund-policy">refund policy</a>.</p>
<h2>Do I need an account?</h2>
<p>No. You can check out as a guest. An account is optional and lets you see all your orders in one place with an email code.</p>
<h2>How do I contact you?</h2>
<p>Use the <a href="/pages/contact">contact form</a> or the chat button on the shop. Include your order number if you have one. We don’t publish a phone number or a public email.</p>
<h2>Will you print the example photo on the product page?</h2>
<p>No. That image is only a mockup of the product. We print from your upload or the mockup you confirm.</p>
<h2>Where do I find my order number?</h2>
<p>It’s in your confirmation email, and in <strong>Your orders</strong> if you signed in. Add it to the contact form so we can find your print faster.</p>`,
  fr: `<h2>Comment fonctionne la personnalisation ?</h2>
<p>Envoyez une photo, prévisualisez-la sur le produit, puis ajoutez-le au panier. Pour certains articles, nous confirmons une maquette avant d’imprimer. Nous n’imprimons jamais la photo d’exemple — uniquement le visuel que vous envoyez ou confirmez.</p>
<h2>Quels fichiers puis-je utiliser ?</h2>
<p>JPG ou PNG, moins de 15 Mo. Utilisez la meilleure photo possible. Vous pouvez recadrer et ajuster dans l’aperçu.</p>
<h2>Quels sont les délais ?</h2>
<p>Chaque commande est imprimée après l’achat. Déco, posters, mugs, gourdes, coques et totes : généralement 3–12 jours ouvrés selon la destination. Stickers, tatouages, magnets, carreaux, coussins, prismes et puzzles : 5–14. Serviettes : 7–16. Le paiement affiche la livraison pour votre adresse. Voir <a href="/pages/shipping">Livraison</a>.</p>
<h2>Comment suivre ma commande ?</h2>
<p>Nous envoyons un lien après le paiement, puis un e-mail de suivi à l’expédition. Vous pouvez aussi utiliser <strong>Connexion / Inscription</strong> — un code par e-mail, sans mot de passe — puis <strong>Vos commandes</strong>.</p>
<h2>Et si l’impression est incorrecte ?</h2>
<p>Si l’article arrive abîmé, défectueux ou non conforme, contactez-nous sous 14 jours avec le numéro de commande et des photos. Nous proposons une réimpression ou un remboursement. Utilisez le <a href="/pages/contact">formulaire</a> ou le chat.</p>
<h2>Puis-je renvoyer un article personnalisé ?</h2>
<p>Les impressions personnalisées sont faites pour vous : pas de retour pour changement d’avis. Les articles défectueux ou abîmés sont couverts — voir la <a href="/policies/refund-policy">politique de remboursement</a>.</p>
<h2>Faut-il un compte ?</h2>
<p>Non. Vous pouvez payer en invité. Un compte est facultatif pour voir toutes vos commandes avec un code e-mail.</p>
<h2>Comment vous contacter ?</h2>
<p>Utilisez le <a href="/pages/contact">formulaire de contact</a> ou le bouton de chat. Indiquez le numéro de commande si vous l’avez. Pas de téléphone ni d’e-mail public.</p>
<h2>Imprimez-vous la photo d’exemple ?</h2>
<p>Non. C’est uniquement une maquette du produit. Nous imprimons à partir de votre fichier ou de la maquette confirmée.</p>
<h2>Où trouver mon numéro de commande ?</h2>
<p>Dans l’e-mail de confirmation, et dans <strong>Vos commandes</strong> si vous êtes connecté. Ajoutez-le au formulaire pour que nous retrouvions votre impression plus vite.</p>`,
  de: `<h2>Wie funktioniert die Personalisierung?</h2>
<p>Foto hochladen, auf dem Produkt prüfen, in den Warenkorb. Bei manchen Produkten bestätigen wir ein Mockup vor dem Druck. Wir drucken nie das Beispielbild — nur Ihre Datei oder das bestätigte Mockup.</p>
<h2>Welche Dateien kann ich verwenden?</h2>
<p>JPG oder PNG, unter 15 MB. Nutzen Sie das beste Foto. Im Vorschau-Fenster können Sie zuschneiden und anpassen.</p>
<h2>Wie lange dauert es?</h2>
<p>Jede Bestellung wird nach dem Kauf gedruckt. Wandkunst, Poster, Tassen, Flaschen, Hüllen und Beutel: meist 3–12 Werktage je nach Ziel. Sticker, Tattoos, Magnete, Kacheln, Kissen, Prismen und Puzzles: 5–14. Handtücher: 7–16. An der Kasse sehen Sie den Versand. Mehr unter <a href="/pages/shipping">Versand &amp; Lieferung</a>.</p>
<h2>Wie verfolge ich meine Bestellung?</h2>
<p>Nach der Zahlung senden wir einen Link, beim Versand eine Tracking-E-Mail. Oder <strong>Anmelden / Registrieren</strong> — Code per E-Mail, kein Passwort — dann <strong>Ihre Bestellungen</strong>.</p>
<h2>Was, wenn der Druck falsch ist?</h2>
<p>Bei Schaden, Mangel oder Abweichung innerhalb von 14 Tagen mit Bestellnummer und Fotos melden. Wir bieten Nachdruck oder Erstattung. Nutzen Sie das <a href="/pages/contact">Kontaktformular</a> oder den Chat.</p>
<h2>Kann ich personalisierte Artikel zurückgeben?</h2>
<p>Personalisierte Drucke werden für Sie gemacht — keine Rückgabe wegen Meinungsänderung. Mangelhafte oder beschädigte Artikel sind abgedeckt — siehe <a href="/policies/refund-policy">Rückerstattungsrichtlinie</a>.</p>
<h2>Brauche ich ein Konto?</h2>
<p>Nein. Gastkauf ist möglich. Ein Konto ist optional und zeigt alle Bestellungen mit E-Mail-Code.</p>
<h2>Wie erreiche ich Sie?</h2>
<p>Über das <a href="/pages/contact">Kontaktformular</a> oder den Chat. Bitte Bestellnummer angeben. Keine Telefonnummer und keine öffentliche E-Mail.</p>
<h2>Drucken Sie das Beispielbild?</h2>
<p>Nein. Das ist nur ein Mockup. Wir drucken von Ihrem Upload oder dem bestätigten Mockup.</p>
<h2>Wo finde ich meine Bestellnummer?</h2>
<p>In der Bestätigungs-E-Mail und unter <strong>Ihre Bestellungen</strong>, wenn Sie angemeldet sind. Im Formular angeben, damit wir den Druck schneller finden.</p>`,
  es: `<h2>¿Cómo funciona la personalización?</h2>
<p>Sube una foto, previsualízala en el producto y añádelo a la cesta. En algunos productos confirmamos una maqueta antes de imprimir. Nunca imprimimos la foto de ejemplo: solo el archivo que subes o confirmas.</p>
<h2>¿Qué archivos puedo usar?</h2>
<p>JPG o PNG, menos de 15 MB. Usa la mejor foto que tengas. En la vista previa puedes recortar y ajustar.</p>
<h2>¿Cuánto tarda?</h2>
<p>Cada pedido se imprime después de comprarlo. Arte de pared, pósters, tazas, botellas, fundas y totes: normalmente 3–12 días laborables según destino. Pegatinas, tatuajes, imanes, baldosas, cojines, prismas y puzzles: 5–14. Toallas: 7–16. El pago muestra el envío. Más en <a href="/pages/shipping">Envío y entrega</a>.</p>
<h2>¿Cómo sigo mi pedido?</h2>
<p>Enviamos un enlace tras el pago y otro con seguimiento al enviarse. También <strong>Iniciar sesión / Registrarse</strong> — código por correo, sin contraseña — y luego <strong>Tus pedidos</strong>.</p>
<h2>¿Y si la impresión sale mal?</h2>
<p>Si llega dañado, defectuoso o no coincide, escríbenos en 14 días con el número de pedido y fotos. Ofrecemos reimpresión o reembolso. Usa el <a href="/pages/contact">formulario</a> o el chat.</p>
<h2>¿Puedo devolver un artículo personalizado?</h2>
<p>Las impresiones personalizadas se hacen para ti: no hay devolución por cambio de opinión. Los artículos defectuosos o dañados sí están cubiertos — ver la <a href="/policies/refund-policy">política de reembolso</a>.</p>
<h2>¿Necesito una cuenta?</h2>
<p>No. Puedes pagar como invitado. La cuenta es opcional para ver todos tus pedidos con un código por correo.</p>
<h2>¿Cómo os contacto?</h2>
<p>Usa el <a href="/pages/contact">formulario de contacto</a> o el botón de chat. Incluye el número de pedido si lo tienes. No publicamos teléfono ni correo.</p>
<h2>¿Imprimís la foto de ejemplo?</h2>
<p>No. Es solo una maqueta del producto. Imprimimos desde tu archivo o la maqueta confirmada.</p>
<h2>¿Dónde está mi número de pedido?</h2>
<p>En el correo de confirmación y en <strong>Tus pedidos</strong> si has iniciado sesión. Añádelo al formulario para encontrar tu impresión antes.</p>`,
  it: `<h2>Come funziona la personalizzazione?</h2>
<p>Carica una foto, vedila sul prodotto e aggiungilo al carrello. Per alcuni articoli confermiamo un mockup prima di stampare. Non stampiamo mai la foto di esempio — solo il file che carichi o confermi.</p>
<h2>Quali file posso usare?</h2>
<p>JPG o PNG, sotto i 15 MB. Usa la foto migliore. Nell’anteprima puoi ritagliare e adattare.</p>
<h2>Quanto tempo ci vuole?</h2>
<p>Ogni ordine viene stampato dopo l’acquisto. Arte da parete, poster, tazze, borracce, cover e tote: di solito 3–12 giorni lavorativi in base alla destinazione. Adesivi, tatuaggi, magneti, piastrelle, cuscini, prismi e puzzle: 5–14. Asciugamani: 7–16. Il checkout mostra la spedizione. Vedi <a href="/pages/shipping">Spedizione e consegna</a>.</p>
<h2>Come traccio l’ordine?</h2>
<p>Inviamo un link dopo il pagamento e una seconda email con il tracking alla spedizione. Oppure <strong>Accedi / Registrati</strong> — codice via email, senza password — poi <strong>I tuoi ordini</strong>.</p>
<h2>E se la stampa è sbagliata?</h2>
<p>Se arriva danneggiato, difettoso o non conforme, contattaci entro 14 giorni con numero d’ordine e foto. Offriamo ristampa o rimborso. Usa il <a href="/pages/contact">modulo</a> o la chat.</p>
<h2>Posso restituire un articolo personalizzato?</h2>
<p>Le stampe personalizzate sono fatte per te: niente reso per ripensamento. Articoli difettosi o danneggiati sono coperti — vedi la <a href="/policies/refund-policy">politica di rimborso</a>.</p>
<h2>Serve un account?</h2>
<p>No. Puoi pagare come ospite. L’account è facoltativo per vedere tutti gli ordini con un codice email.</p>
<h2>Come vi contatto?</h2>
<p>Usa il <a href="/pages/contact">modulo di contatto</a> o il pulsante chat. Includi il numero d’ordine se ce l’hai. Niente telefono né email pubblica.</p>
<h2>Stampate la foto di esempio?</h2>
<p>No. È solo un mockup del prodotto. Stampiamo dal tuo file o dal mockup confermato.</p>
<h2>Dov’è il numero d’ordine?</h2>
<p>Nell’email di conferma e in <strong>I tuoi ordini</strong> se hai effettuato l’accesso. Inseriscilo nel modulo per trovare la stampa più in fretta.</p>`,
  nl: `<h2>Hoe werkt personaliseren?</h2>
<p>Upload een foto, bekijk die op het product en voeg toe aan je mandje. Bij sommige producten bevestigen we eerst een mock-up. We drukken nooit de voorbeeldfoto — alleen het bestand dat je uploadt of bevestigt.</p>
<h2>Welke bestanden kan ik gebruiken?</h2>
<p>JPG of PNG, onder 15 MB. Gebruik de beste foto die je hebt. In de preview kun je bijsnijden en passend maken.</p>
<h2>Hoe lang duurt het?</h2>
<p>Elke bestelling wordt na aankoop gedrukt. Wandkunst, posters, mokken, flessen, hoesjes en totes: meestal 3–12 werkdagen afhankelijk van de bestemming. Stickers, tattoos, magneten, tegels, kussens, prisma’s en puzzels: 5–14. Handdoeken: 7–16. Afrekenen toont verzending. Zie <a href="/pages/shipping">Verzending &amp; levering</a>.</p>
<h2>Hoe volg ik mijn bestelling?</h2>
<p>Na betaling mailen we een link, bij verzending een tweede mail met tracking. Of gebruik <strong>Inloggen / Registreren</strong> — code per e-mail, geen wachtwoord — daarna <strong>Je bestellingen</strong>.</p>
<h2>Wat als de print fout is?</h2>
<p>Bij schade, defect of afwijking binnen 14 dagen contact met ordernummer en foto’s. We bieden herdruk of terugbetaling. Gebruik het <a href="/pages/contact">contactformulier</a> of de chat.</p>
<h2>Kan ik een gepersonaliseerd item retourneren?</h2>
<p>Gepersonaliseerde prints worden voor jou gemaakt: geen retour bij bedenktijd. Defecte of beschadigde items wel — zie het <a href="/policies/refund-policy">terugbetalingsbeleid</a>.</p>
<h2>Heb ik een account nodig?</h2>
<p>Nee. Je kunt als gast afrekenen. Een account is optioneel om al je orders te zien met een e-mailcode.</p>
<h2>Hoe neem ik contact op?</h2>
<p>Via het <a href="/pages/contact">contactformulier</a> of de chatknop. Vermeld je bestelnummer als je die hebt. Geen telefoonnummer en geen openbaar e-mailadres.</p>
<h2>Drukken jullie de voorbeeldfoto?</h2>
<p>Nee. Dat is alleen een mock-up van het product. We drukken van jouw upload of de bevestigde mock-up.</p>
<h2>Waar vind ik mijn bestelnummer?</h2>
<p>In de bevestigingsmail en in <strong>Je bestellingen</strong> als je bent ingelogd. Zet het in het formulier zodat we je print sneller vinden.</p>`,
};
