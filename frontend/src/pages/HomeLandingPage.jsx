// Public landing page for BoxTrack, served at /home.
// Markup ported from the approved landing-page design: plain HTML with
// inline styles (as authored), rendered once - no per-visit data, no state.
const LANDING_HTML = `
<header style="border-bottom: 1px solid #262a2a">
  <div style="max-width: 1200px; margin: 0 auto; padding: 18px 24px; display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 16px">
    <a href="#top" style="display: flex; align-items: center; gap: 10px; text-decoration: none; color: #f3f3ed">
      <span style="width: 36px; height: 36px; border-radius: 8px; background: #ff792f; display: flex; align-items: center; justify-content: center">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#111212" stroke-width="2.4" stroke-linecap="round" aria-hidden="true"><path d="M3 9v6M6 6v12M18 6v12M21 9v6M6 12h12"></path></svg>
      </span>
      <span style="font-family: 'Barlow Condensed', sans-serif; font-weight: 800; font-size: 28px; letter-spacing: 1px">BOXTRACK</span>
    </a>
    <nav aria-label="Navigation principale" style="display: flex; flex-wrap: wrap; align-items: center; gap: 8px 24px; font-size: 15px">
      <a href="#projet" style="color: #d6d7d5; text-decoration: none">Le projet</a>
      <a href="#ecrans" style="color: #d6d7d5; text-decoration: none">Les 3 écrans</a>
      <a href="#fonctions" style="color: #d6d7d5; text-decoration: none">Fonctionnalités</a>
      <a href="#stack" style="color: #d6d7d5; text-decoration: none">Stack</a>
      <a href="/login" style="color: #111212; background: #f3f3ed; text-decoration: none; font-weight: 600; padding: 10px 18px; border-radius: 8px; min-height: 44px; box-sizing: border-box; display: inline-flex; align-items: center">Espace coach</a>
    </nav>
  </div>
</header>

<section id="top" style="max-width: 1200px; margin: 0 auto; padding: 72px 24px 64px; display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 460px), 1fr)); gap: 56px; align-items: center">
  <div style="display: flex; flex-direction: column; gap: 24px">
    <p style="margin: 0; font-size: 14px; font-weight: 600; letter-spacing: 2px; text-transform: uppercase; color: #ff9b63">Conçu pour CrossFit LAB · Toulouse</p>
    <h1 style="margin: 0; font-family: 'Barlow Condensed', sans-serif; font-weight: 800; font-size: clamp(56px, 8vw, 104px); line-height: 0.92; text-transform: uppercase; letter-spacing: 0.5px">Prépare.<br>Publie.<br><span style="color: #ff792f">Affiche.</span></h1>
    <p style="margin: 0; font-size: 20px; color: #c9cac8; max-width: 540px">Les coachs préparent la séance depuis leur téléphone. Les adhérents la consultent sans créer de compte. La TV de la salle l'affiche toute seule.</p>
    <div style="display: flex; flex-wrap: wrap; gap: 12px; padding-top: 8px">
      <a href="/screen" style="background: #ff792f; color: #111212; text-decoration: none; font-weight: 700; padding: 14px 26px; border-radius: 10px; min-height: 48px; box-sizing: border-box; display: inline-flex; align-items: center; gap: 10px">Voir la vue TV
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"></path></svg></a>
      <a href="#ecrans" style="border: 1px solid #3a3f3f; color: #f3f3ed; text-decoration: none; font-weight: 600; padding: 14px 26px; border-radius: 10px; min-height: 48px; box-sizing: border-box; display: inline-flex; align-items: center">Comment ça marche</a>
    </div>
  </div>

  <figure class="dots" aria-label="Maquette de la vue TV" style="position: relative; margin: 0; border: 1px solid #262a2a; border-radius: 16px; padding: 36px 28px 44px">
    <figcaption style="display: flex; justify-content: space-between; align-items: center; gap: 12px; font-size: 12px; color: #adafae; padding-bottom: 8px">
      <span style="display: flex; align-items: center; gap: 6px"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" aria-hidden="true"><path d="M8 3v18M16 3v18M3 8h18M3 16h18"></path></svg>Vue TV — /screen</span>
      <span>1920 × 1080 · TvProgramme</span>
    </figcaption>
    <div style="position: relative; outline: 1.5px solid #4f8cff; outline-offset: 0; container-type: inline-size">
      <span aria-hidden="true" style="position: absolute; left: -5px; top: -5px; width: 8px; height: 8px; background: #ffffff; border: 1.5px solid #4f8cff; z-index: 2"></span>
      <span aria-hidden="true" style="position: absolute; right: -5px; top: -5px; width: 8px; height: 8px; background: #ffffff; border: 1.5px solid #4f8cff; z-index: 2"></span>
      <span aria-hidden="true" style="position: absolute; left: -5px; bottom: -5px; width: 8px; height: 8px; background: #ffffff; border: 1.5px solid #4f8cff; z-index: 2"></span>
      <span aria-hidden="true" style="position: absolute; right: -5px; bottom: -5px; width: 8px; height: 8px; background: #ffffff; border: 1.5px solid #4f8cff; z-index: 2"></span>
      <div role="img" aria-label="Vue TV de BoxTrack : WOD du jour en AMRAP, échauffement et force, horloge et progression du créneau" style="aspect-ratio: 16 / 9; overflow: hidden; box-sizing: border-box; display: grid; grid-template-rows: minmax(0, 7.31cqw) minmax(0, 1fr) minmax(0, 4.22cqw); gap: 1.01cqw; padding: 1.29cqw 2.4cqw 1.13cqw; color: #f8f7f2; font-family: Arial, Helvetica, sans-serif; border-top: 0.5cqw solid #ff7335; background: radial-gradient(circle at 82% 8%, #2b211c 0, transparent 27%), repeating-linear-gradient(90deg, transparent 0, transparent 11.9cqw, #ffffff05 12cqw), #0b0d0e">

        <div style="display: grid; grid-template-columns: minmax(0, 0.85fr) minmax(0, 1.5fr) minmax(0, 0.8fr); align-items: center; gap: 2cqw; min-width: 0; border-bottom: 1px solid #474847; padding-bottom: 0.79cqw">
          <div style="display: flex; gap: 1cqw; align-items: center; min-width: 0">
            <span style="font-family: 'Barlow Condensed', sans-serif; font-weight: 700; font-size: 4.1cqw; letter-spacing: -0.07em; line-height: 0.9">LAB<span style="color: #ff7335">+</span></span>
            <span style="display: flex; flex-direction: column; gap: 0.3cqw">
              <span style="font-family: 'Barlow Condensed', sans-serif; font-weight: 700; font-size: 1.05cqw; letter-spacing: 0.16em">CROSSFIT LAB</span>
              <span style="font-size: 0.59cqw; letter-spacing: 0.13em; color: #aaa9a5">BOXTRACK / PROGRAMME DU JOUR</span>
            </span>
          </div>
          <div style="min-width: 0; padding-left: 2cqw; border-left: 1px solid #494b4b">
            <span style="display: flex; align-items: center; gap: 0.55cqw; color: #ffaf87; font-size: 0.67cqw; font-weight: 700; letter-spacing: 0.18em"><span style="width: 0.5cqw; height: 0.5cqw; border-radius: 50%; background: #ff7335; box-shadow: 0 0 0 0.3cqw #ff733526"></span>EN COURS</span>
            <span style="display: block; margin: 0.31cqw 0 0.14cqw; font-family: 'Barlow Condensed', sans-serif; font-weight: 700; font-size: 2.15cqw; line-height: 1">Squat Day</span>
            <span style="display: block; color: #b4b4ae; font-size: 0.95cqw; font-variant-numeric: tabular-nums">18:00 – 19:00</span>
          </div>
          <div style="display: flex; flex-direction: column; align-items: flex-end; min-width: 0">
            <span style="color: #bcbcb6; font-size: 0.95cqw">Lundi 9 novembre</span>
            <span aria-hidden="true" style="display: flex; align-items: center; gap: 0.2cqw; margin-top: 0.3cqw; font-family: 'Barlow Condensed', sans-serif; font-weight: 700; font-size: 2.9cqw; line-height: 1; font-variant-numeric: tabular-nums">
              <span style="background: #1c2021; border: 1px solid #2f3434; border-radius: 0.3cqw; padding: 0.2cqw 0.35cqw">1</span>
              <span style="background: #1c2021; border: 1px solid #2f3434; border-radius: 0.3cqw; padding: 0.2cqw 0.35cqw">8</span>
              <span style="color: #ff7335">:</span>
              <span style="background: #1c2021; border: 1px solid #2f3434; border-radius: 0.3cqw; padding: 0.2cqw 0.35cqw">2</span>
              <span style="background: #1c2021; border: 1px solid #2f3434; border-radius: 0.3cqw; padding: 0.2cqw 0.35cqw">4</span>
            </span>
            <span style="margin-top: 0.28cqw; color: #898e8d; font-size: 0.53cqw; letter-spacing: 0.17em">EUROPE / PARIS</span>
          </div>
        </div>

        <div style="min-width: 0; min-height: 0; display: grid; grid-template-columns: minmax(0, 62fr) minmax(0, 38fr); gap: 1.2cqw">
          <div style="min-width: 0; min-height: 0; display: flex; flex-direction: column; overflow: hidden; background: #181b1d; border: 1px solid #49413a; box-shadow: 0 1.24cqw 1.97cqw #0006">
            <div style="display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 0.42fr); align-items: end; gap: 1.5cqw; min-height: 10cqw; box-sizing: border-box; padding: 1.18cqw 1.8cqw 1.13cqw; background: #ff7335; color: #0b0d0e">
              <div>
                <span style="display: block; font-family: 'Barlow Condensed', sans-serif; font-weight: 700; font-size: 4.4cqw; line-height: 0.9; text-transform: uppercase; white-space: nowrap">WOD du jour</span>
                <span style="display: block; margin-top: 0.39cqw; color: #402014; font-family: 'Barlow Condensed', sans-serif; font-size: 2cqw; font-weight: 800; letter-spacing: 0.08em">AMRAP</span>
              </div>
              <div style="text-align: right; padding-bottom: 0.08cqw">
                <span style="display: block; color: #462416; font-size: 0.64cqw; font-weight: 800; letter-spacing: 0.17em">OBJECTIF</span>
                <span style="display: block; margin-top: 0.34cqw; font-family: 'Barlow Condensed', sans-serif; font-weight: 700; font-size: 2.5cqw; line-height: 1">12 min</span>
              </div>
            </div>
            <div style="flex: 1; min-height: 0; overflow: hidden; margin: 0 1.8cqw; font-size: 2cqw; line-height: 1.3">
              <div style="padding-top: 0.5em">
                <div style="display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 0.48fr); align-items: center; gap: 0.3em; padding: 0.33em 0; border-bottom: 1px solid #4c4e4d"><span style="font-family: 'Barlow Condensed', sans-serif; font-weight: 700; font-size: 1.37em; line-height: 1.02">Wall balls</span><span style="text-align: right; color: #d3d3cd; font-size: 0.75em">10 reps · 9/6 kg</span></div>
                <div style="display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 0.48fr); align-items: center; gap: 0.3em; padding: 0.33em 0; border-bottom: 1px solid #4c4e4d"><span style="font-family: 'Barlow Condensed', sans-serif; font-weight: 700; font-size: 1.37em; line-height: 1.02">Box jumps</span><span style="text-align: right; color: #d3d3cd; font-size: 0.75em">10 reps · 60/50 cm</span></div>
                <div style="display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 0.48fr); align-items: center; gap: 0.3em; padding: 0.33em 0; border-bottom: 1px solid #4c4e4d"><span style="font-family: 'Barlow Condensed', sans-serif; font-weight: 700; font-size: 1.37em; line-height: 1.02">Kettlebell swings</span><span style="text-align: right; color: #d3d3cd; font-size: 0.75em">10 reps · 24/16 kg</span></div>
                <div style="margin-top: 0.85em; padding: 0.55em 0.7em; background: #2d2b28; border-left: 0.12em solid #ff7335"><span style="display: block; margin-bottom: 0.4em; color: #ffb694; font-size: 0.35em; letter-spacing: 0.17em">LE MOT DU COACH</span><span style="display: block; color: #ededeb; font-size: 0.62em; line-height: 1.25">Rythme régulier dès le premier tour, pas de pause.</span></div>
              </div>
            </div>
            <div style="display: flex; align-items: center; margin: 0 1.8cqw; min-height: 2.42cqw; border-top: 1px solid #464748; color: #e6e7e3; font-size: 1.08cqw">Un maximum de tours dans le temps imparti</div>
          </div>
          <div style="min-width: 0; min-height: 0; display: grid; grid-template-rows: minmax(0, 1.1fr) minmax(0, 0.9fr); gap: 0.68cqw">
            <div style="min-height: 0; overflow: hidden; display: flex; flex-direction: column; padding: 0.84cqw 1.35cqw; background: #232627; border: 1px solid #444647">
              <span style="display: block; margin-bottom: 0.45cqw; padding-bottom: 0.56cqw; border-bottom: 1px solid #555858; font-family: 'Barlow Condensed', sans-serif; font-weight: 700; font-size: 2.6cqw; line-height: 1">Échauffement</span>
              <div style="font-size: 1.6cqw; line-height: 1.26">
                <span style="display: block; margin: 0.2em 0 0.4em; color: #ff9867; font-family: 'Barlow Condensed', sans-serif; font-weight: 700; font-size: 0.58em; letter-spacing: 0.15em">GÉNÉRAL</span>
                <span style="display: block">400 m rameur, 2 tours</span>
                <span style="display: block; margin: 0.7em 0 0.4em; color: #ff9867; font-family: 'Barlow Condensed', sans-serif; font-weight: 700; font-size: 0.58em; letter-spacing: 0.15em">SPÉCIFIQUE</span>
                <span style="display: block">10 air squats, 10 PVC pass-through</span>
              </div>
            </div>
            <div style="min-height: 0; overflow: hidden; display: flex; flex-direction: column; padding: 0.84cqw 1.35cqw; background: #151819; border: 1px solid #444647">
              <span style="display: block; margin-bottom: 0.45cqw; padding-bottom: 0.56cqw; border-bottom: 1px solid #555858; font-family: 'Barlow Condensed', sans-serif; font-weight: 700; font-size: 2.6cqw; line-height: 1">Force</span>
              <div style="font-size: 1.6cqw; line-height: 1.3">
                <span style="display: block; font-family: 'Barlow Condensed', sans-serif; font-weight: 700; font-size: 1.15em; line-height: 1.02">Back squat</span>
                <span style="display: block; color: #d3d3cd; font-size: 0.78em">5 × 5 @ 75 %</span>
                <span style="display: block; margin-top: 0.6em; padding-left: 0.7em; border-left: 2px solid #ff9867; color: #d0d0cb; font-size: 0.78em">Repos 2 min entre les séries.</span>
              </div>
            </div>
          </div>
        </div>

        <div style="display: grid; grid-template-columns: minmax(0, 1.3fr) minmax(0, 1fr); align-items: center; gap: 2cqw; min-width: 0; color: #b8b8b1; font-size: 0.7cqw; letter-spacing: 0.11em">
          <div style="min-width: 0">
            <div style="display: flex; justify-content: space-between; gap: 1cqw; margin-bottom: 1.9cqw"><span style="color: #ff9867; font-weight: 700">SÉANCE EN COURS</span><span style="font-variant-numeric: tabular-nums">18:00 – 19:00 <span style="color: #ffac69; font-weight: 700">· ENCORE 36 MIN</span></span></div>
            <div style="position: relative; height: 0.34cqw; margin-inline: 0.8cqw; background: #3c4040">
              <span style="display: block; width: 40%; height: 100%; background: linear-gradient(90deg, #b64b22, #ff7335); box-shadow: 0 0 12px #ff713944"></span>
            </div>
          </div>
          <span style="color: #ededeb; text-align: right">À SUIVRE · 19:00 – 20:00</span>
        </div>
      </div>
    </div>
  </figure>
</section>

<section aria-label="Le problème" style="border-top: 1px solid #262a2a; border-bottom: 1px solid #262a2a; background: #141616">
  <div style="max-width: 1200px; margin: 0 auto; padding: 40px 24px; display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 24px">
    <p style="margin: 0; font-family: 'Barlow Condensed', sans-serif; font-weight: 700; font-size: 32px; text-transform: uppercase; line-height: 1.1">Fini les infos dispersées.</p>
    <div style="display: flex; flex-wrap: wrap; gap: 12px">
      <span style="border: 1px solid #3a3f3f; border-radius: 99px; padding: 8px 16px; font-size: 15px; color: #adafae; text-decoration: line-through">Groupe WhatsApp</span>
      <span style="border: 1px solid #3a3f3f; border-radius: 99px; padding: 8px 16px; font-size: 15px; color: #adafae; text-decoration: line-through">Tableau blanc</span>
      <span style="border: 1px solid #3a3f3f; border-radius: 99px; padding: 8px 16px; font-size: 15px; color: #adafae; text-decoration: line-through">Google Sheets</span>
      <span style="background: #ff792f; color: #111212; border-radius: 99px; padding: 8px 16px; font-size: 15px; font-weight: 700">Une seule app</span>
    </div>
  </div>
</section>

<section id="projet" style="max-width: 1200px; margin: 0 auto; padding: 96px 24px 0; display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 440px), 1fr)); gap: 48px; align-items: start">
  <div style="display: flex; flex-direction: column; gap: 16px">
    <p style="margin: 0; font-size: 14px; font-weight: 600; letter-spacing: 2px; text-transform: uppercase; color: #ff9b63">Le projet en bref</p>
    <h2 style="margin: 0; font-family: 'Barlow Condensed', sans-serif; font-weight: 800; font-size: clamp(40px, 5vw, 60px); line-height: 1; text-transform: uppercase">Une vraie commande, pour une vraie box</h2>
    <p style="margin: 0; color: #c9cac8">CrossFit LAB, une salle de CrossFit à Toulouse, communiquait ses séances par WhatsApp, au tableau blanc et dans des tableurs. Son owner, Timothé Garde, voulait un seul outil : simple pour les coachs, accessible aux adhérents, et affichable sur la TV de la salle.</p>
    <p style="margin: 0; color: #c9cac8">BoxTrack est notre réponse : une application web qui centralise la préparation, la consultation et l'affichage des séances, utilisable sans formation.</p>
  </div>
  <dl style="margin: 0; display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 1px; background: #262a2a; border: 1px solid #262a2a; border-radius: 16px; overflow: hidden">
    <div style="background: #191c1c; padding: 24px; display: flex; flex-direction: column; gap: 6px">
      <dt style="font-size: 13px; font-weight: 600; letter-spacing: 1px; text-transform: uppercase; color: #adafae">Client</dt>
      <dd style="margin: 0; font-weight: 600">CrossFit LAB, Toulouse</dd>
    </div>
    <div style="background: #191c1c; padding: 24px; display: flex; flex-direction: column; gap: 6px">
      <dt style="font-size: 13px; font-weight: 600; letter-spacing: 1px; text-transform: uppercase; color: #adafae">Commanditaire</dt>
      <dd style="margin: 0; font-weight: 600">Timothé Garde, owner</dd>
    </div>
    <div style="background: #191c1c; padding: 24px; display: flex; flex-direction: column; gap: 6px">
      <dt style="font-size: 13px; font-weight: 600; letter-spacing: 1px; text-transform: uppercase; color: #adafae">Front-end &amp; UX</dt>
      <dd style="margin: 0; font-weight: 600">Panaki Gillot</dd>
    </div>
    <div style="background: #191c1c; padding: 24px; display: flex; flex-direction: column; gap: 6px">
      <dt style="font-size: 13px; font-weight: 600; letter-spacing: 1px; text-transform: uppercase; color: #adafae">Back-end &amp; données</dt>
      <dd style="margin: 0; font-weight: 600">Kevin Rigal</dd>
    </div>
    <div style="background: #191c1c; padding: 24px; display: flex; flex-direction: column; gap: 6px">
      <dt style="font-size: 13px; font-weight: 600; letter-spacing: 1px; text-transform: uppercase; color: #adafae">Cadre</dt>
      <dd style="margin: 0; font-weight: 600">Projet de fin d'année, Holberton School Toulouse</dd>
    </div>
    <div style="background: #191c1c; padding: 24px; display: flex; flex-direction: column; gap: 6px">
      <dt style="font-size: 13px; font-weight: 600; letter-spacing: 1px; text-transform: uppercase; color: #adafae">Objectif</dt>
      <dd style="margin: 0; font-weight: 600">Livrer l'app déployée et la présenter au Demoday</dd>
    </div>
  </dl>
</section>

<section id="ecrans" style="max-width: 1200px; margin: 0 auto; padding: 96px 24px; display: flex; flex-direction: column; gap: 48px">
  <div style="display: flex; flex-direction: column; gap: 12px; max-width: 640px">
    <p style="margin: 0; font-size: 14px; font-weight: 600; letter-spacing: 2px; text-transform: uppercase; color: #ff9b63">Une séance, trois écrans</p>
    <h2 style="margin: 0; font-family: 'Barlow Condensed', sans-serif; font-weight: 800; font-size: clamp(40px, 5vw, 60px); line-height: 1; text-transform: uppercase">Chacun voit ce dont il a besoin</h2>
  </div>
  <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 320px), 1fr)); gap: 20px">
    <article style="background: #191c1c; border: 1px solid #262a2a; border-radius: 16px; padding: 28px; display: flex; flex-direction: column; gap: 16px">
      <span style="width: 48px; height: 48px; border-radius: 12px; background: #2a1c13; display: flex; align-items: center; justify-content: center">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ff9b63" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="6" y="2" width="12" height="20" rx="2"></rect><path d="M10 6h4M12 11v6M9 14h6"></path></svg>
      </span>
      <h3 style="margin: 0; font-family: 'Barlow Condensed', sans-serif; font-weight: 700; font-size: 30px; text-transform: uppercase">Le coach</h3>
      <p style="margin: 0; color: #c9cac8">Il crée la séance depuis son téléphone : Warm-Up, Skill ou Strength, WOD. Suggestions de mouvements, aperçu TV en direct, brouillon gardé en cas de souci.</p>
      <p style="margin: 0; margin-top: auto; font-size: 14px; font-weight: 600; color: #ff9b63">Espace coach protégé</p>
    </article>
    <article style="background: #191c1c; border: 1px solid #262a2a; border-radius: 16px; padding: 28px; display: flex; flex-direction: column; gap: 16px">
      <span style="width: 48px; height: 48px; border-radius: 12px; background: #2a1c13; display: flex; align-items: center; justify-content: center">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ff9b63" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="7" r="4"></circle><path d="M4 21c1-4 4.5-6 8-6s7 2 8 6"></path></svg>
      </span>
      <h3 style="margin: 0; font-family: 'Barlow Condensed', sans-serif; font-weight: 700; font-size: 30px; text-transform: uppercase">L'adhérent</h3>
      <p style="margin: 0; color: #c9cac8">Il ouvre le lien de la box et voit la séance du jour, les prochaines et les précédentes. Pas de compte, pas d'application à installer.</p>
      <p style="margin: 0; margin-top: auto; font-size: 14px; font-weight: 600; color: #ff9b63">Accès libre, sur mobile</p>
    </article>
    <article style="background: #191c1c; border: 1px solid #262a2a; border-radius: 16px; padding: 28px; display: flex; flex-direction: column; gap: 16px">
      <span style="width: 48px; height: 48px; border-radius: 12px; background: #2a1c13; display: flex; align-items: center; justify-content: center">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ff9b63" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="2" y="4" width="20" height="13" rx="2"></rect><path d="M8 21h8M12 17v4"></path></svg>
      </span>
      <h3 style="margin: 0; font-family: 'Barlow Condensed', sans-serif; font-weight: 700; font-size: 30px; text-transform: uppercase">La TV de la salle</h3>
      <p style="margin: 0; color: #c9cac8">Une adresse dédiée, en plein écran, lisible depuis le fond de la salle. Elle se met à jour toute seule et garde la séance affichée si le réseau coupe.</p>
      <p style="margin: 0; margin-top: auto; font-size: 14px; font-weight: 600; color: #ff9b63">Aucune manipulation en classe</p>
    </article>
  </div>
</section>

<section id="seance" style="background: #141616; border-top: 1px solid #262a2a; border-bottom: 1px solid #262a2a">
  <div style="max-width: 1200px; margin: 0 auto; padding: 96px 24px; display: flex; flex-direction: column; gap: 48px">
    <div style="display: flex; flex-direction: column; gap: 12px; max-width: 680px">
      <p style="margin: 0; font-size: 14px; font-weight: 600; letter-spacing: 2px; text-transform: uppercase; color: #ff9b63">Anatomie d'une séance</p>
      <h2 style="margin: 0; font-family: 'Barlow Condensed', sans-serif; font-weight: 800; font-size: clamp(40px, 5vw, 60px); line-height: 1; text-transform: uppercase">Trois phases, toujours dans le même ordre</h2>
    </div>
    <ol style="margin: 0; padding: 0; list-style: none; display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 300px), 1fr)); gap: 20px">
      <li style="border-top: 4px solid #3a3f3f; padding-top: 20px; display: flex; flex-direction: column; gap: 10px">
        <span style="font-family: 'Barlow Condensed', sans-serif; font-weight: 800; font-size: 56px; line-height: 1; color: #3a3f3f">01</span>
        <h3 style="margin: 0; font-family: 'Barlow Condensed', sans-serif; font-weight: 700; font-size: 28px; text-transform: uppercase">Warm-Up</h3>
        <p style="margin: 0; color: #c9cac8">L'échauffement général puis spécifique, avec son objectif pour préparer le corps à la suite.</p>
      </li>
      <li style="border-top: 4px solid #6b4a36; padding-top: 20px; display: flex; flex-direction: column; gap: 10px">
        <span style="font-family: 'Barlow Condensed', sans-serif; font-weight: 800; font-size: 56px; line-height: 1; color: #6b4a36">02</span>
        <h3 style="margin: 0; font-family: 'Barlow Condensed', sans-serif; font-weight: 700; font-size: 28px; text-transform: uppercase">Skill / Strength</h3>
        <p style="margin: 0; color: #c9cac8">Le travail technique ou de force : mouvements, séries, répétitions, charges et consignes.</p>
      </li>
      <li style="border-top: 4px solid #ff792f; padding-top: 20px; display: flex; flex-direction: column; gap: 10px">
        <span style="font-family: 'Barlow Condensed', sans-serif; font-weight: 800; font-size: 56px; line-height: 1; color: #ff792f">03</span>
        <h3 style="margin: 0; font-family: 'Barlow Condensed', sans-serif; font-weight: 700; font-size: 28px; text-transform: uppercase">WOD</h3>
        <p style="margin: 0; color: #c9cac8">Le Workout Of the Day : format, mouvements, durée ou objectif, et les remarques du coach.</p>
      </li>
    </ol>
    <div style="display: flex; flex-direction: column; gap: 14px">
      <p style="margin: 0; font-size: 15px; font-weight: 600; color: #adafae">Les 6 formats de WOD pris en charge</p>
      <div style="display: flex; flex-wrap: wrap; gap: 10px">
        <span style="font-family: 'Barlow Condensed', sans-serif; font-weight: 700; font-size: 22px; letter-spacing: 1px; padding: 8px 18px; border: 1px solid #3a3f3f; border-radius: 8px">AMRAP</span>
        <span style="font-family: 'Barlow Condensed', sans-serif; font-weight: 700; font-size: 22px; letter-spacing: 1px; padding: 8px 18px; border: 1px solid #3a3f3f; border-radius: 8px">FOR TIME</span>
        <span style="font-family: 'Barlow Condensed', sans-serif; font-weight: 700; font-size: 22px; letter-spacing: 1px; padding: 8px 18px; border: 1px solid #3a3f3f; border-radius: 8px">EMOM</span>
        <span style="font-family: 'Barlow Condensed', sans-serif; font-weight: 700; font-size: 22px; letter-spacing: 1px; padding: 8px 18px; border: 1px solid #3a3f3f; border-radius: 8px">TABATA</span>
        <span style="font-family: 'Barlow Condensed', sans-serif; font-weight: 700; font-size: 22px; letter-spacing: 1px; padding: 8px 18px; border: 1px solid #3a3f3f; border-radius: 8px">CHIPPER</span>
        <span style="font-family: 'Barlow Condensed', sans-serif; font-weight: 700; font-size: 22px; letter-spacing: 1px; padding: 8px 18px; border: 1px solid #3a3f3f; border-radius: 8px">STRENGTH</span>
      </div>
    </div>
  </div>
</section>

<section id="fonctions" style="max-width: 1200px; margin: 0 auto; padding: 96px 24px; display: flex; flex-direction: column; gap: 48px">
  <div style="display: flex; flex-direction: column; gap: 12px; max-width: 640px">
    <p style="margin: 0; font-size: 14px; font-weight: 600; letter-spacing: 2px; text-transform: uppercase; color: #ff9b63">Fonctionnalités</p>
    <h2 style="margin: 0; font-family: 'Barlow Condensed', sans-serif; font-weight: 800; font-size: clamp(40px, 5vw, 60px); line-height: 1; text-transform: uppercase">Simple pour la box, solide pendant la classe</h2>
  </div>
  <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 340px), 1fr)); gap: 1px; background: #262a2a; border: 1px solid #262a2a; border-radius: 16px; overflow: hidden">
    <div style="background: #101212; padding: 28px; display: flex; flex-direction: column; gap: 10px">
      <h3 style="margin: 0; font-size: 19px; font-weight: 700">Une séance en moins de 5 minutes</h3>
      <p style="margin: 0; color: #adafae; font-size: 16px">Un formulaire en sections, pensé pour le téléphone, utilisable sans formation.</p>
    </div>
    <div style="background: #101212; padding: 28px; display: flex; flex-direction: column; gap: 10px">
      <h3 style="margin: 0; font-size: 19px; font-weight: 700">Lisible à 8 mètres</h3>
      <p style="margin: 0; color: #adafae; font-size: 16px">Vue TV en 16:9, fond sombre, grandes typographies, phases bien séparées.</p>
    </div>
    <div style="background: #101212; padding: 28px; display: flex; flex-direction: column; gap: 10px">
      <h3 style="margin: 0; font-size: 19px; font-weight: 700">Toujours à jour</h3>
      <p style="margin: 0; color: #adafae; font-size: 16px">La TV se rafraîchit toute seule : une correction du coach apparaît pendant la classe.</p>
    </div>
    <div style="background: #101212; padding: 28px; display: flex; flex-direction: column; gap: 10px">
      <h3 style="margin: 0; font-size: 19px; font-weight: 700">Jamais d'écran blanc</h3>
      <p style="margin: 0; color: #adafae; font-size: 16px">Si le réseau coupe, la dernière séance reçue reste affichée.</p>
    </div>
    <div style="background: #101212; padding: 28px; display: flex; flex-direction: column; gap: 10px">
      <h3 style="margin: 0; font-size: 19px; font-weight: 700">Annonces de la box</h3>
      <p style="margin: 0; color: #adafae; font-size: 16px">Événements, horaires, nouveautés : publiés une fois, visibles sur mobile et sur la TV, partageables par lien.</p>
    </div>
    <div style="background: #101212; padding: 28px; display: flex; flex-direction: column; gap: 10px">
      <h3 style="margin: 0; font-size: 19px; font-weight: 700">QR codes utiles</h3>
      <p style="margin: 0; color: #adafae; font-size: 16px">Réservation, réseaux sociaux, avis : des liens configurables, projetés en QR codes sur l'écran.</p>
    </div>
  </div>
</section>

<section id="stack" style="background: #141616; border-top: 1px solid #262a2a; border-bottom: 1px solid #262a2a">
  <div style="max-width: 1200px; margin: 0 auto; padding: 96px 24px; display: flex; flex-direction: column; gap: 48px">
    <div style="display: flex; flex-direction: column; gap: 12px; max-width: 680px">
      <p style="margin: 0; font-size: 14px; font-weight: 600; letter-spacing: 2px; text-transform: uppercase; color: #ff9b63">Stack technique</p>
      <h2 style="margin: 0; font-family: 'Barlow Condensed', sans-serif; font-weight: 800; font-size: clamp(40px, 5vw, 60px); line-height: 1; text-transform: uppercase">Ce qui fait tourner BoxTrack</h2>
      <p style="margin: 0; color: #c9cac8">Une application web en trois couches : une interface React, une API Node.js et une base PostgreSQL, déployées en HTTPS.</p>
    </div>
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 260px), 1fr)); gap: 20px">
      ${[
        {
          title: 'Front-end',
          items: [
            { mark: 'Re', name: 'React 19', role: 'Interface en composants' },
            { mark: 'Vi', name: 'Vite 7', role: 'Serveur de dev et build' },
            { mark: 'RR', name: 'React Router 7', role: 'Une URL par écran' },
            { mark: 'JS', name: 'JavaScript + CSS', role: 'Langage et style faits main' },
          ],
        },
        {
          title: 'Back-end',
          items: [
            { mark: 'No', name: 'Node.js', role: 'JavaScript côté serveur' },
            { mark: 'Ex', name: 'Express', role: 'API REST en JSON' },
            { mark: 'bc', name: 'bcrypt', role: 'Mots de passe hachés' },
          ],
        },
        {
          title: 'Données',
          items: [
            { mark: 'Pg', name: 'PostgreSQL', role: 'Base relationnelle' },
            { mark: 'SQL', name: 'SQL + migrations', role: 'Schéma et contraintes' },
          ],
        },
        {
          title: 'Qualité & déploiement',
          items: [
            { mark: 'Je', name: 'Jest + Supertest', role: "Tests de l'API" },
            { mark: 'Pw', name: 'Playwright', role: 'Tests dans le navigateur' },
            { mark: 'GH', name: 'Git, GitHub Actions', role: 'Versions et tests auto' },
            { mark: 'Ve', name: 'Vercel', role: 'Mise en ligne en HTTPS' },
          ],
        },
      ]
        .map(
          (group) => `
      <div style="background: #191c1c; border: 1px solid #262a2a; border-radius: 16px; padding: 24px; display: flex; flex-direction: column; gap: 18px">
        <h3 style="margin: 0; font-family: 'Barlow Condensed', sans-serif; font-weight: 700; font-size: 26px; text-transform: uppercase; color: #ff792f">${group.title}</h3>
        <ul style="margin: 0; padding: 0; list-style: none; display: flex; flex-direction: column; gap: 14px">
          ${group.items
            .map(
              (tech) => `
          <li style="display: flex; align-items: center; gap: 14px">
            <span style="flex: none; width: 48px; height: 48px; border-radius: 10px; background: #101212; border: 1px solid #2c3030; display: flex; align-items: center; justify-content: center; font-family: 'Barlow Condensed', sans-serif; font-weight: 800; font-size: 18px; color: #f3f3ed">${tech.mark}</span>
            <span style="display: flex; flex-direction: column; line-height: 1.3">
              <span style="font-weight: 700; font-size: 16px">${tech.name}</span>
              <span style="font-size: 14px; color: #adafae">${tech.role}</span>
            </span>
          </li>`,
            )
            .join('')}
        </ul>
      </div>`,
        )
        .join('')}
    </div>
  </div>
</section>

<section aria-label="Commencer" style="max-width: 1200px; margin: 0 auto; padding: 96px 24px">
  <div style="background: #191c1c; border: 1px solid #262a2a; border-radius: 20px; padding: 48px 40px; display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 32px">
    <div style="display: flex; flex-direction: column; gap: 16px; max-width: 560px">
      <h2 style="margin: 0; font-family: 'Barlow Condensed', sans-serif; font-weight: 800; font-size: clamp(40px, 5vw, 64px); line-height: 1; text-transform: uppercase">Prêt pour le <span style="color: #ff792f">WOD</span> ?</h2>
      <p style="margin: 0; color: #c9cac8">Ouvre la vue TV pour voir la séance du moment, ou connecte-toi à l'espace coach pour préparer la prochaine.</p>
      <div style="display: flex; flex-wrap: wrap; gap: 12px; padding-top: 8px">
        <a href="/screen" style="background: #ff792f; color: #111212; text-decoration: none; font-weight: 700; padding: 14px 26px; border-radius: 10px; min-height: 48px; box-sizing: border-box; display: inline-flex; align-items: center">Voir la vue TV</a>
        <a href="/login" style="border: 1px solid #3a3f3f; color: #f3f3ed; text-decoration: none; font-weight: 600; padding: 14px 26px; border-radius: 10px; min-height: 48px; box-sizing: border-box; display: inline-flex; align-items: center">Espace coach</a>
      </div>
    </div>
  </div>
</section>

<footer style="border-top: 1px solid #262a2a">
  <div style="max-width: 1200px; margin: 0 auto; padding: 28px 24px; display: flex; flex-wrap: wrap; justify-content: space-between; gap: 12px; font-size: 14px; color: #adafae">
    <span><strong style="font-family: 'Barlow Condensed', sans-serif; font-size: 18px; letter-spacing: 1px; color: #f3f3ed">BOXTRACK</strong> · Projet de fin d'année, Holberton School Toulouse</span>
    <span>Panaki Gillot &amp; Kevin Rigal · 2026</span>
  </div>
</footer>
`

export default function HomeLandingPage() {
  return (
    <div
      className="landing-page"
      style={{ fontFamily: "Inter, system-ui, sans-serif", fontSize: 17, lineHeight: 1.55 }}
      dangerouslySetInnerHTML={{ __html: LANDING_HTML }}
    />
  )
}
