# FLOCK
**Člani skupine:** Žiga Modrić, Timotej Robavs

## Setup

1. Install dependencies

   ```bash
   npm install
   ```

2. Setup environment variables

   Create a `.env.development` or `.env.production` file in the root directory based on the .env.sample file.


3. Start the app in development mode (with development settings)

   ```bash
    npm run start-development
   ```
4. Start the app in production mode (with production settings)

   ```bash
    npm run start-production
   ```
Note for running production mode you will need the production environment variables set up in the `.env.production` file.
Same goes for development mode with the `.env.development` file.
   
## Opis:

Aplikacija omogoča enostavno organizacijo vaj, izletov, dopustov in drugih dogodkov, pri čemer udeležencem omogoča izbiro terminov, ki jim najbolj ustrezajo. Namesto vnaprej določenih fiksnih datumov, aplikacija ponuja dinamično načrtovanje, kjer povabljeni izberejo med predlaganimi dnevi in urami, kar omogoča izbiro termina, ki ustreza večini.

## Ogrodje in razvojno okolje:

Pri projektu bomo uporabili **Android Studio** in **Rider (web API)**.

## Funkcionalnosti:

1. **Prijava uporabnikov:** Vsak uporabnik lahko ustvari svoj račun z uporabniškim imenom, e-poštnim naslovom in geslom ali pa se prijavi s pomočjo Google računa.

2. **Ustvarjanje dogodkov:** Uporabnik lahko ustvari nov dogodek, pri čemer vnese ime, trajanje, opis ter po potrebi doda lokacijo in obvezno opremo. Poleg tega določi časovni razpon dni, v katerih je dogodek mogoče izvesti, ter izbere ure za vsak dan znotraj tega obdobja. Uporabnik lahko tudi označi, da se dogodek ponovi na X dni/tednov/mesecov.

3. **Ustvarjanje skupine:** Ob ustvarjanju dogodka se ustvari tudi skupina, v kateri uporabnik izbere prijatelje, ki jih želi povabiti. Izbrani prijatelji prejmejo obvestilo, da so bili dodani k dogodku.

4. **Dodajanje prijateljev:** Uporabnik lahko doda prijatelje z iskanjem po njihovem uporabniškem imenu ali e-poštnem naslovu. Povabljeni prijatelj lahko prošnjo sprejme ali zavrne.

5. **Vnos ustreznih terminov:** Udeleženci skupine oziroma dogodka lahko vnesejo dan in uro, ki jim ustrezata, ali določijo razpon dni in ur, ko so na voljo. Prav tako lahko zavrnejo udeležbo na dogodku, če se ga ne morejo udeležiti.

6. **Pregled dogodka:** Med potekom dogodka lahko uporabniki spremljajo termine, ki so jih izbrali drugi udeleženci, čas, ki ostaja do zaključka izbora, ter splošne informacije o dogodku, vključno z imenom, opisom, lokacijo in časovnimi podatki (datum, ura ali časovni razpon).

7. **Obvestila in posodobitve:** Uporabniki so obveščeni, ko jih nekdo doda med prijatelje, ko so povabljeni na dogodek, ob zaključku glasovanja za dogodek (skupaj z izbranim terminom) in z opomnikom, če še niso oddali svojega glasu. Prav tako prejmejo opomnik o prihajajočem dogodku, na primer en dan pred začetkom.

8. **Samodejno določanje najbolj ustreznega termina:** Aplikacija samodejno izbere najboljši termin za dogodek glede na prisotnost uporabnikov.

9. **Izvoz dogodka v koledar:** Uporabnik lahko po zaključku glasovanja izvozi dogodek v svoj koledar.

## Primeri uporabe:

1. **Dogovarjanje za družabni dogodek s prijatelji:** Skupina prijateljev želi organizirati družabno srečanje, vendar imajo vsi različne urnike. Eden izmed prijateljev ustvari dogodek, vpiše možnosti terminov in doda lokacijo. Povabljeni prijatelji izberejo dneve in ure, ki jim najbolj ustrezajo. Aplikacija določi termin z največjim številom prisotnih in pošlje obvestilo o dogovoru.

2. **Načrtovanje družinskega izleta:** Organizator načrtuje vikend izlet in želi vključiti vse člane družine. Ustvari dogodek z opisom, predlaga nekaj možnosti terminov čez vikend ter povabi družinske člane. Vsak označi, kdaj je prost, aplikacija pa določi najboljši termin in obvesti vse člane. Dan pred izletom aplikacija pošlje opomnik.

3. **Sestanki za študijski projekt:** Skupina študentov dela na projektu in potrebuje redne sestanke. En član skupine ustvari dogodek za tedenski sestanek, doda predlagane termine ter povabi sošolce. Ko vsi izberejo svoje možnosti, aplikacija določi termin, ki ustreza večini, in ga doda v koledar vsakega člana.

4. **Načrtovanje teambuildinga v podjetju:** Za učinkovito organizacijo teambuildinga v podjetju aplikacija omogoča preprosto usklajevanje terminov. Vodja ustvari dogodek za teambuilding in določi razpoložljive dni ter ure. Zaposleni v aplikacijo vpišejo svoje preferenčne termine glede razpoložljivosti, nato pa aplikacija samodejno izbere termin, ki ustreza največ zaposlenim, in pošlje vsem obvestilo o potrjenem datumu.

5. **Organizacija tedenskih vaj za športni klub:** Trener ustvarja dogodek za tedenske vaje. Določi časovni razpon več dni in ur ter povabi člane kluba, ki izberejo termine, ki jim najbolj ustrezajo. Aplikacija nato samodejno izbere termin z največjo prisotnostjo, uporabniki pa prejmejo obvestilo in lahko dogodek izvozijo v svoj koledar.

6. **Planiranje občasnih sestankov znotraj društva:** Predsednik društva načrtuje redne mesečne sestanke. Za vsak mesec ustvari dogodek z več termini in povabi člane društva. Ti izberejo, kdaj so prosti, aplikacija pa določi najboljši termin za mesečni sestanek in pošlje vsa obvestila ter omogoči izvoz dogodka v koledar.

7. **Načrtovanje delavnic za tečaj:** Inštruktor želi organizirati delavnice za tečaj in omogoča, da udeleženci glasujejo o terminih. Določi nekaj predlaganih datumov in ur, povabi vse udeležence, ki označijo svoje možnosti. Aplikacija na podlagi prisotnosti določi termin, ki ustreza večini, udeleženci pa prejmejo opomnik in možnost izvoza v koledar.

