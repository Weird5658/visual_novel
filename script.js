/* ═══════════════════════════════════════════════════════════════
   LE LIVRE SANS TITRE — Visual Novel Engine v1.0
   ═══════════════════════════════════════════════════════════════

   ARCHITECTURE:
   ─ GameEngine   : core state machine, rendering, typewriter
   ─ Script       : full story data (scenes, dialogue, choices)
   ─ RainCanvas   : animated rain for title screen
   ─ AudioManager : music/sfx stubs (hook in your own files)

   ASSET PATHS (replace PNGs in assets/ folder):
   ─ assets/backgrounds/  : school.png, temple.png, station.png,
                            club_room_rain.png, street_evening.png
   ─ assets/characters/   : mei.png, ren.png, kaito.png, aoi.png
                            (each with _dim / _speak variants optional)
   ═══════════════════════════════════════════════════════════════ */

'use strict';

/* ══════════════════════════════════════════════════════
   RAIN CANVAS (Title Screen)
══════════════════════════════════════════════════════ */
class RainCanvas {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx    = canvas.getContext('2d');
    this.drops  = [];
    this.resize();
    this.init();
    window.addEventListener('resize', () => this.resize());
    this.animate();
  }

  resize() {
    this.canvas.width  = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  init() {
    const count = Math.floor(this.canvas.width / 5);
    this.drops = [];
    for (let i = 0; i < count; i++) {
      this.drops.push({
        x:     Math.random() * this.canvas.width,
        y:     Math.random() * this.canvas.height,
        len:   Math.random() * 55 + 15,
        speed: Math.random() * 3.5 + 1.5,
        opacity: Math.random() * 0.25 + 0.05,
        width: Math.random() < 0.3 ? 1.5 : 0.8,
      });
    }
  }

  animate() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    for (const d of this.drops) {
      ctx.beginPath();
      ctx.moveTo(d.x, d.y);
      ctx.lineTo(d.x - d.len * 0.15, d.y + d.len);
      ctx.strokeStyle = `rgba(160, 190, 220, ${d.opacity})`;
      ctx.lineWidth   = d.width;
      ctx.stroke();

      d.y += d.speed;
      if (d.y > this.canvas.height + d.len) {
        d.y = -d.len;
        d.x = Math.random() * this.canvas.width;
      }
    }
    requestAnimationFrame(() => this.animate());
  }
}

/* ══════════════════════════════════════════════════════
   AUDIO MANAGER
   Place your OGG/MP3 files in assets/audio/
   e.g. assets/audio/pluie_tatami.mp3
══════════════════════════════════════════════════════ */
class AudioManager {
  constructor() {
    this.tracks = {};
    this.current = null;
    this.volume = 0.6;
  }

  load(id, src) {
    const audio = new Audio(src);
    audio.loop  = true;
    audio.volume = this.volume;
    this.tracks[id] = audio;
  }

  play(id, fadeDuration = 1500) {
    if (this.current && this.current !== this.tracks[id]) {
      this._fadeOut(this.current, fadeDuration);
    }
    const track = this.tracks[id];
    if (!track) return;
    track.volume = 0;
    track.play().catch(() => {});
    this._fadeIn(track, fadeDuration);
    this.current = track;
  }

  stop(fadeDuration = 1500) {
    if (this.current) this._fadeOut(this.current, fadeDuration);
    this.current = null;
  }

  setVolume(v) {
    this.volume = v / 100;
    if (this.current) this.current.volume = this.volume;
  }

  _fadeIn(audio, duration) {
    const target = this.volume;
    const step   = target / (duration / 50);
    const interval = setInterval(() => {
      audio.volume = Math.min(target, audio.volume + step);
      if (audio.volume >= target) clearInterval(interval);
    }, 50);
  }

  _fadeOut(audio, duration) {
    const step = audio.volume / (duration / 50);
    const interval = setInterval(() => {
      audio.volume = Math.max(0, audio.volume - step);
      if (audio.volume <= 0) { audio.pause(); audio.currentTime = 0; clearInterval(interval); }
    }, 50);
  }
}

/* ══════════════════════════════════════════════════════
   SCRIPT — Full story data
══════════════════════════════════════════════════════ */
const SCRIPT = {

  // ── Character definitions ─────────────────────────────
  characters: {

    narrator: {
      name: '',
      tag: 'Narration',
      cssClass: 'char-narrator',
      sprite: null,
      expressions: {}
    },

    inner: {
      name: 'Voix Intérieure',
      tag: 'Pensée',
      cssClass: 'char-narrator',
      sprite: null,
      expressions: {}
    },

    // ── MEI SHIRASAGI ── dossier: characters/characters/Mei_Shirasagi/
    // Fichiers : 1_default, 1_comeon, 1_doubt, 1_hmph, 1_sad,
    //            1_sadsmile, 1_talking, 1_argue, 1_argue2
    mei: {
      name: 'Mei Shirasagi',
      tag: 'Club · Vice-présidente',
      cssClass: 'char-mei',
      sprite: 'characters/characters/Mei_Shirasagi/1_default.png',
      expressions: {
        default:  'characters/characters/Mei_Shirasagi/1_default.png',
        comeon:   'characters/characters/Mei_Shirasagi/1_comeon.png',
        doubt:    'characters/characters/Mei_Shirasagi/1_doubt.png',
        hmph:     'characters/characters/Mei_Shirasagi/1_hmph.png',
        sad:      'characters/characters/Mei_Shirasagi/1_sad.png',
        sadsmile: 'characters/characters/Mei_Shirasagi/1_sadsmile.png',
        talking:  'characters/characters/Mei_Shirasagi/1_talking.png',
        argue:    'characters/characters/Mei_Shirasagi/1_argue.png',
        argue2:   'characters/characters/Mei_Shirasagi/1_argue2.png',
      }
    },

    // ── REN TAKAMURA ── dossier: characters/characters/Ren_Takamura/
    // Fichiers : 3_normal, 3_talk, 3_argue, 3_argue2,
    //            3_ee, 3_ee2, 3_ugh, 3_ugh2
    ren: {
      name: 'Ren Takamura',
      tag: 'Club · Matériel',
      cssClass: 'char-ren',
      sprite: 'characters/characters/Ren_Takamura/3_normal.png',
      expressions: {
        normal: 'characters/characters/Ren_Takamura/3_normal.png',
        talk:   'characters/characters/Ren_Takamura/3_talk.png',
        argue:  'characters/characters/Ren_Takamura/3_argue.png',
        argue2: 'characters/characters/Ren_Takamura/3_argue2.png',
        ee:     'characters/characters/Ren_Takamura/3_ee.png',
        ee2:    'characters/characters/Ren_Takamura/3_ee2.png',
        ugh:    'characters/characters/Ren_Takamura/3_ugh.png',
        ugh2:   'characters/characters/Ren_Takamura/3_ugh2.png',
      }
    },

    // ── KAITO HOSHINO ── dossier: characters/characters/Kaito_Hoshino/
    // Fichiers : 5_normal, 5_smile, 5_smile2, 5_aha, 5_thinking,
    //            5_mysterious, 5_provoke, 5_disagree, 5_disagree2,
    //            5_mad smile, 5_sad, 5_sad2, 5_sad smile, 5_giveup
    kaito: {
      name: 'Kaito Hoshino',
      tag: 'Club · Président',
      cssClass: 'char-kaito',
      sprite: 'characters/characters/Kaito_Hoshino/5_normal.png',
      expressions: {
        normal:    'characters/characters/Kaito_Hoshino/5_normal.png',
        smile:     'characters/characters/Kaito_Hoshino/5_smile.png',
        smile2:    'characters/characters/Kaito_Hoshino/5_smile2.png',
        aha:       'characters/characters/Kaito_Hoshino/5_aha.png',
        thinking:  'characters/characters/Kaito_Hoshino/5_thinking.png',
        mysterious:'characters/characters/Kaito_Hoshino/5_mysterious.png',
        provoke:   'characters/characters/Kaito_Hoshino/5_provoke.png',
        disagree:  'characters/characters/Kaito_Hoshino/5_disagree.png',
        disagree2: 'characters/characters/Kaito_Hoshino/5_disagree2.png',
        madsmile:  'characters/characters/Kaito_Hoshino/5_mad smile.png',
        sad:       'characters/characters/Kaito_Hoshino/5_sad.png',
        sad2:      'characters/characters/Kaito_Hoshino/5_sad2.png',
        sadsmile:  'characters/characters/Kaito_Hoshino/5_sad smile.png',
        giveup:    'characters/characters/Kaito_Hoshino/5_giveup.png',
      }
    },

    // ── AOI MIYAZONO ── dossier: characters/characters/Aoi_Miyazono/
    // Fichiers réellement présents sur le disque :
    //   2_mad3.png, 2_sad.png, 2_talk.png, 2_cry2.png, 2_haha.png,
    //   2_mad silent.png, 2_normal smile.png, 2_sad smile.png
    // (les anciens chemins 2_default/2_ahaha/2_hmm/2_mad/2_mad2/2_worry/2_worry2
    //  ne correspondaient à AUCUN fichier existant → c'est pour ça qu'Aoi
    //  ne s'affichait pas : les images pointaient dans le vide.)
    aoi: {
      name: 'Aoi Miyazono',
      tag: 'Club · Archiviste',
      cssClass: 'char-aoi',
      sprite: 'characters/characters/Aoi_Miyazono/2_normal smile.png',
      expressions: {
        default:  'characters/characters/Aoi_Miyazono/2_normal smile.png',
        ahaha:    'characters/characters/Aoi_Miyazono/2_haha.png',
        hmm:      'characters/characters/Aoi_Miyazono/2_normal smile.png',
        talk:     'characters/characters/Aoi_Miyazono/2_talk.png',
        mad:      'characters/characters/Aoi_Miyazono/2_mad silent.png',
        mad2:     'characters/characters/Aoi_Miyazono/2_mad silent.png',
        mad3:     'characters/characters/Aoi_Miyazono/2_mad3.png',
        worry:    'characters/characters/Aoi_Miyazono/2_cry2.png',
        worry2:   'characters/characters/Aoi_Miyazono/2_sad.png',
        sad:      'characters/characters/Aoi_Miyazono/2_sad.png',
        sadsmile: 'characters/characters/Aoi_Miyazono/2_sad smile.png',
      }
    },

  },


  // ── Backgrounds ────────────────────────────────────────s
  backgrounds: {
    club_rain:      'Background/club_room_rain.png',
    club_day:       'Background/club_room_day.png',
    station:        'Background/station_night.png',
    temple:         'Background/temple_yanaka.png',
    street_evening: 'Background/street_evening.png',
    black:          'Background/Train_Tunnel.png',
  },

  // ── Scene list ─────────────────────────────────────────
  scenes: {

    /* ╔═══════════════════════════════════════╗
       ║  PROLOGUE — Une Réunion Presque Normale ║
       ╚═══════════════════════════════════════╝ */
    prologue: {
      label: 'Prologue — Une Réunion Presque Normale',
      music: 'pluie_tatami',
      rain:  true,
      steps: [
        { type: 'monologue', text: '« On ne devient pas soi-même en découvrant une identité cachée,\nmais en décidant ce que l’on accepte de faire\nde ce qui nous a façonnés. »\n— Idée inspirée de Friedrich Nietzsche' },

        { type: 'bg', bg: 'club_rain' },
        { type: 'chapter', text: 'Prologue · Une Réunion Presque Normale' },

        { type: 'sprite', pos: 'left',   char: 'mei',   active: true, expr: 'default' },
        { type: 'sprite', pos: 'center', char: 'ren',   active: true, expr: 'normal' },
        { type: 'sprite', pos: 'right',  char: 'kaito', active: true, expr: 'normal' },

        { type: 'narrate', text: 'Salle du club de lecture, fin d’après-midi. La pluie frappe les fenêtres. Des piles de livres partout, une étagère à moitié vide.' },

        { type: 'dialogue', char: 'kaito', speaking: 'right', expr: 'normal',
          text: 'Bien. Avant que quelqu’un ne trouve une nouvelle excuse pour partir, on range la salle.' },

        { type: 'dialogue', char: 'ren', speaking: 'center', expr: 'talk',
          text: 'Je tiens à signaler que déplacer trois cartons de vieux magazines ne constitue pas une activité littéraire.' },

        { type: 'dialogue', char: 'mei', speaking: 'left', expr: 'hmph',
          text: 'Tu dis ça depuis vingt minutes, mais tu n’as pas posé un seul carton.' },

        { type: 'dialogue', char: 'ren', speaking: 'center', expr: 'argue',
          text: 'Je supervise. C’est une compétence rare.' },

        { type: 'sprite', pos: 'left', char: 'aoi', active: true, expr: 'hmm' },
        { type: 'dialogue', char: 'aoi', speaking: 'left', expr: 'hmm',
          text: 'Tu es assis sur le carton que Kaito cherche.' },

        { type: 'dialogue', char: 'ren', speaking: 'center', expr: 'ugh',
          text: '...Je supervisais de très près.' },

        { type: 'choice',
          label: 'Comment Kaito réagit-il ?',
          options: [
            { tag: 'A', text: '« Ren, lève-toi et aide-nous. »', next: 'reaction_autorite', affinity: { kaito: 10 } },
            { tag: 'B', text: '« On peut faire une pause de cinq minutes avant de ranger. »', next: 'reaction_pause', affinity: { kaito: 5, mei: 5 } },
            { tag: 'C', text: '« Aoi, tu peux vérifier les archives pendant qu’on s’occupe du reste ? »', next: 'reaction_confiance', affinity: { aoi: 15, kaito: 5 } },
          ]
        },
      ]
    },

    reaction_autorite: {
      label: 'Prologue — Autorité',
      music: 'pluie_tatami', rain: true,
      steps: [
        { type: 'sprite', pos: 'right', char: 'kaito', active: true, speaking: true, expr: 'disagree' },
        { type: 'dialogue', char: 'kaito', speaking: 'right', expr: 'disagree', text: '« Ren, lève-toi et aide-nous. »' },
        { type: 'sprite', pos: 'center', char: 'ren', active: true, expr: 'ugh' },
        { type: 'narrate', text: 'Kaito affirme son autorité. Ren obéit avec un soupir, mais il garde une certaine distance.' },
        { type: 'goto', scene: 'decouverte_livre' },
      ]
    },

    reaction_pause: {
      label: 'Prologue — Souplesse',
      music: 'pluie_tatami', rain: true,
      steps: [
        { type: 'sprite', pos: 'right', char: 'kaito', active: true, speaking: true, expr: 'smile' },
        { type: 'dialogue', char: 'kaito', speaking: 'right', expr: 'smile', text: '« On peut faire une pause de cinq minutes avant de ranger. »' },
        { type: 'sprite', pos: 'left', char: 'mei', active: true, expr: 'sadsmile' },
        { type: 'narrate', text: 'Kaito se montre plus souple. Mei sourit, et Ren accepte sans plaisanter.' },
        { type: 'goto', scene: 'decouverte_livre' },
      ]
    },

    reaction_confiance: {
      label: 'Prologue — Confiance',
      music: 'pluie_tatami', rain: true,
      steps: [
        { type: 'sprite', pos: 'right', char: 'kaito', active: true, speaking: true, expr: 'smile2' },
        { type: 'dialogue', char: 'kaito', speaking: 'right', expr: 'smile2', text: '« Aoi, tu peux vérifier les archives pendant qu’on s’occupe du reste ? »' },
        { type: 'sprite', pos: 'left', char: 'aoi', active: true, expr: 'ahaha' },
        { type: 'narrate', text: 'Aoi relève les yeux, surprise que Kaito lui fasse confiance. Cette décision renforce son lien avec lui.' },
        { type: 'goto', scene: 'decouverte_livre' },
      ]
    },

    /* ╔═══════════════════════════════════════╗
       ║  DÉCOUVERTE DU LIVRE                  ║
       ╚═══════════════════════════════════════╝ */
    decouverte_livre: {
      label: 'Prologue — Le Livre Sans Titre',
      music: 'pluie_tatami', rain: true,
      steps: [
        { type: 'transition' },
        { type: 'bg', bg: 'club_rain' },
        { type: 'chapter', text: 'Prologue · Le Livre Sans Titre' },

        { type: 'sprite', pos: 'left', char: 'aoi', active: true, expr: 'hmm' },
        { type: 'narrate', text: 'Après quelques minutes, Aoi ouvre l’armoire basse située derrière les anciennes étagères. Une pile de livres tombe au sol. Parmi eux se trouve un volume relié de noir, sans auteur, sans titre et sans aucune indication sur la couverture. Le cuir est usé aux coins, mais presque tiède, comme s’il venait d’être reposé après avoir été tenu longtemps entre des mains.' },

        { type: 'dialogue', char: 'aoi', speaking: 'left', expr: 'hmm', text: '« Celui-ci n’était pas dans l’inventaire. »' },

        { type: 'sprite', pos: 'right', char: 'kaito', active: true, expr: 'aha' },
        { type: 'dialogue', char: 'kaito', speaking: 'right', expr: 'aha', text: '« Un livre sans titre ? »' },

        { type: 'sprite', pos: 'center', char: 'ren', active: true, expr: 'talk' },
        { type: 'dialogue', char: 'ren', speaking: 'center', expr: 'talk', text: '« C’est peut-être le premier livre honnête de la bibliothèque. Il ne promet rien. »' },

        { type: 'sprite', pos: 'left', char: 'mei', active: true, expr: 'doubt' },
        { type: 'dialogue', char: 'mei', speaking: 'left', expr: 'doubt', text: '« Il est vraiment vieux... mais la couverture n’a presque pas de poussière. »' },

        { type: 'narrate', text: 'Kaito ramasse le livre. Au moment où ses doigts touchent la reliure, les lumières de la salle clignotent. La pluie s’arrête brusquement. Dans le silence, une phrase apparaît sur la couverture, comme si elle avait été gravée sous l’encre :' },

        { type: 'book', text: '<blockquote>QUI CHOISIT LORSQUE PERSONNE NE REGARDE ?</blockquote>' },

        { type: 'narrate', text: 'Le texte disparaît aussitôt.' },

        { type: 'choice',
          label: 'Que faire du livre ?',
          options: [
            { tag: 'A', text: 'Le remettre immédiatement dans l’armoire.', next: 'livre_range', affinity: { mei: 5 } },
            { tag: 'B', text: 'Demander à Aoi de chercher son origine dans les archives.', next: 'livre_archives', affinity: { aoi: 15 } },
            { tag: 'C', text: 'L’ouvrir pour vérifier s’il contient vraiment du texte.', next: 'livre_ouvert', affinity: { kaito: 10 } },
            { tag: 'D', text: 'Le déchirer ou le jeter.', next: 'livre_dechire', affinity: { ren: 10 } },
          ]
        },
      ]
    },

    livre_range: {
      label: 'Prologue — Refuser',
      music: 'pluie_tatami', rain: true,
      steps: [
        { type: 'narrate', text: 'Le livre tombe de lui-même au sol et s’ouvre à une page blanche. Une nouvelle phrase apparaît :' },
        { type: 'book', text: '« Refuser de choisir est encore une manière de choisir. »' },
        { type: 'narrate', text: 'La porte du club se verrouille.' },
        { type: 'goto', scene: 'pause1_lecture' },
      ]
    },

    livre_archives: {
      label: 'Prologue — Les Archives',
      music: 'pluie_tatami', rain: true,
      steps: [
        { type: 'sprite', pos: 'left', char: 'aoi', active: true, expr: 'worry' },
        { type: 'narrate', text: 'Aoi trouve une photographie ancienne portant la date de 1987. Quatre membres du club y tiennent un livre identique.' },
        { type: 'dialogue', char: 'aoi', speaking: 'left', expr: 'worry', text: '« Leurs visages... ont été soigneusement grattés. »' },
        { type: 'goto', scene: 'pause1_lecture' },
      ]
    },

    livre_ouvert: {
      label: 'Prologue — L’Ouverture',
      music: 'pluie_tatami', rain: true,
      steps: [
        { type: 'narrate', text: 'Les pages sont blanches jusqu’à ce que chacun pose une main sur la couverture. Des mots apparaissent lentement, écrits avec quatre encres différentes.' },
        { type: 'goto', scene: 'pause1_lecture' },
      ]
    },

    livre_dechire: {
      label: 'Prologue — Le Refus',
      music: 'pluie_tatami', rain: true,
      steps: [
        { type: 'sprite', pos: 'center', char: 'ren', active: true, expr: 'ugh' },
        { type: 'narrate', text: 'Le livre résiste. Une coupure fine apparaît sur le doigt de Ren, alors qu’il n’a pas encore touché la page.' },
        { type: 'dialogue', char: 'ren', speaking: 'center', expr: 'ugh', text: '« ...Je n’ai rien fait. »' },
        { type: 'narrate', text: 'Le sang tombe sur le papier et fait apparaître le début d’une histoire.' },
        { type: 'goto', scene: 'pause1_lecture' },
      ]
    },

    /* ╔═══════════════════════════════════════╗
       ║  CHAPITRE I — Le Choix de Lire        ║
       ╚═══════════════════════════════════════╝ */
    pause1_lecture: {
      label: 'Chapitre I — Le Choix de Lire',
      music: 'pluie_tatami', rain: true,
      steps: [
        { type: 'transition' },
        { type: 'bg', bg: 'club_rain' },
        { type: 'chapter', text: 'Chapitre I · Le Choix de Lire' },

        { type: 'narrate', text: 'Quelle que soit la décision, les quatre élèves finissent par rester dans la salle. La porte ne s’ouvre plus. Dehors, la pluie a repris, mais elle tombe maintenant en silence, comme une image sans le son.' },

        { type: 'book', text: '« Vous êtes libres de fermer ce livre. Vous ne serez pas libres de prétendre que vous ne l’avez jamais ouvert. »' },

        { type: 'sprite', pos: 'left', char: 'mei', active: true, expr: 'argue' },
        { type: 'dialogue', char: 'mei', speaking: 'left', expr: 'argue', text: '« C’est absurde. Un objet ne peut pas nous rendre responsables de quelque chose que nous ne comprenons pas. »' },

        { type: 'sprite', pos: 'center', char: 'ren', active: true, expr: 'talk' },
        { type: 'dialogue', char: 'ren', speaking: 'center', expr: 'talk', text: '« Pourquoi pas ? Les adultes font ça tout le temps. »' },

        { type: 'sprite', pos: 'right', char: 'aoi', active: true, expr: 'talk' },
        { type: 'dialogue', char: 'aoi', speaking: 'right', expr: 'talk', text: '« Sartre dirait probablement que la liberté ne disparaît pas parce qu’elle est inconfortable. Elle devient seulement plus difficile à supporter. »' },

        { type: 'sprite', pos: 'right', char: 'kaito', active: true, expr: 'thinking' },
        { type: 'dialogue', char: 'kaito', speaking: 'right', expr: 'thinking', text: '« Et si nous ne choisissons pas ? »' },

        { type: 'sprite', pos: 'left', char: 'aoi', active: true, expr: 'talk' },
        { type: 'dialogue', char: 'aoi', speaking: 'left', expr: 'talk', text: '« Alors quelqu’un choisira à notre place. Ou bien nous laisserons les circonstances choisir. »' },

        { type: 'sprite', pos: 'right', char: 'kaito', active: true, expr: 'sad' },
        { type: 'dialogue', char: 'kaito', speaking: 'right', expr: 'sad', text: '(plus bas) « Je déteste ne pas savoir quoi décider. »' },

        { type: 'sprite', pos: 'left', char: 'mei', active: true, expr: 'hmph' },
        { type: 'dialogue', char: 'mei', speaking: 'left', expr: 'hmph', text: '« Depuis quand tu détestes ça ? Tu décides toujours pour tout le monde. »' },

        { type: 'dialogue', char: 'kaito', speaking: 'right', expr: 'giveup', text: '« Justement. »' },

        { type: 'book',
          text: '<blockquote>«&nbsp;L’homme est responsable de ce qu’il fait de ce qu’on a fait de lui.&nbsp;»</blockquote>— Jean-Paul Sartre<span class="book-sub">Nous ne choisissons pas toujours notre passé, notre famille ou nos blessures, mais nous devons décider de la réponse que nous leur donnons. Même le refus de choisir reste, d’une certaine manière, un choix : on ne peut pas sortir du jeu simplement en fermant les yeux.</span>' },

        { type: 'choice',
          label: 'Décision collective',
          options: [
            { tag: 'A', text: 'Kaito propose de lire une seule page.', next: 'lecture_page', affinity: { kaito: 10 } },
            { tag: 'B', text: 'Ren exige que chacun vote à bulletin secret.', next: 'lecture_vote', affinity: { ren: 10 } },
            { tag: 'C', text: 'Mei demande à chacun d’expliquer sa peur avant de décider.', next: 'lecture_peur', affinity: { mei: 10 } },
            { tag: 'D', text: 'Aoi pose une question au livre : « Que veux-tu de nous ? »', next: 'lecture_question', affinity: { aoi: 10 } },
          ]
        },
      ]
    },

    lecture_page: {
      label: 'Chapitre I — Une Seule Page',
      music: 'pluie_tatami', rain: true,
      steps: [
        { type: 'sprite', pos: 'right', char: 'kaito', active: true, expr: 'thinking' },
        { type: 'dialogue', char: 'kaito', speaking: 'right', expr: 'thinking', text: '« Une seule page. Si l’un de nous veut arrêter, la lecture s’interrompt. »' },
        { type: 'narrate', text: 'Le groupe accepte cette règle.' },
        { type: 'goto', scene: 'recit_noir' },
      ]
    },

    lecture_vote: {
      label: 'Chapitre I — Le Vote',
      music: 'pluie_tatami', rain: true,
      steps: [
        { type: 'narrate', text: 'Le vote donne deux voix pour et deux voix contre. Pourtant, une cinquième feuille apparaît dans l’urne, avec le mot CONTINUEZ.' },
        { type: 'goto', scene: 'recit_noir' },
      ]
    },

    lecture_peur: {
      label: 'Chapitre I — Nommer sa Peur',
      music: 'pluie_tatami', rain: true,
      steps: [
        { type: 'narrate', text: 'Le groupe se rapproche. Les pages restent blanches pendant plusieurs secondes, comme si le livre attendait une réponse sincère.' },
        { type: 'goto', scene: 'recit_noir' },
      ]
    },

    lecture_question: {
      label: 'Chapitre I — La Question',
      music: 'pluie_tatami', rain: true,
      steps: [
        { type: 'sprite', pos: 'left', char: 'aoi', active: true, expr: 'hmm' },
        { type: 'dialogue', char: 'aoi', speaking: 'left', expr: 'hmm', text: '« Que veux-tu de nous ? »' },
        { type: 'book', text: '« Je ne veux rien. Je montre seulement ce que vous êtes prêts à faire. »' },
        { type: 'goto', scene: 'recit_noir' },
      ]
    },

    /* ╔═══════════════════════════════════════╗
       ║  CHAPITRE II — La Chambre des Futurs  ║
       ╚═══════════════════════════════════════╝ */
    recit_noir: {
      label: 'Chapitre II — La Chambre des Futurs',
      music: 'pluie_tatami', rain: true,
      steps: [
        { type: 'transition' },
        { type: 'bg', bg: 'club_rain' },
        { type: 'chapter', text: 'Chapitre II · La Chambre des Futurs' },

        { type: 'narrate', text: 'Kaito ouvre finalement le livre. Le récit commence. Il raconte l’histoire d’un homme appelé Noir, un ancien soldat capable de voir plusieurs futurs lorsqu’il prend une substance nommée Lumen.' },

        { type: 'sprite', pos: 'right', char: 'kaito', active: true, speaking: true, expr: 'thinking' },
        { type: 'book', text: '«&nbsp;Noir n’est pas un héros. Il ne cherche pas la rédemption. Il n’a presque plus de passé auquel se raccrocher — seulement des missions, une nuit après l’autre. Mais Noir possède une chose que les autres assassins n’ont pas : il peut voir, l’espace d’un battement de cœur, plusieurs futurs possibles, et choisir celui dans lequel il survit. Une question le suit partout, silencieuse : si je connais déjà ce qui va arriver, suis-je encore libre de le choisir ?&nbsp;»' },

        { type: 'narrate', text: 'Le texte continue, plus loin, en racontant la guerre. Noir faisait partie d’un bataillon entier de soldats sous Lumen. Quand la guerre a pris fin, on les a simplement laissés partir, avec leur dépendance pour seul souvenir du service rendu.' },

        { type: 'sprite', pos: 'left', char: 'mei', active: true, speaking: true, expr: 'talking' },
        { type: 'book', text: '«&nbsp;Noir consulte régulièrement une praticienne qui lui fournit son traitement. Ses rendez-vous ressemblent à une aide médicale. En réalité, ils servent aussi à le maintenir dans un état où il peut continuer à fonctionner comme une arme. Il n’est pas vraiment soigné. Il est entretenu.&nbsp;»' },

        { type: 'dialogue', char: 'kaito', speaking: 'right', expr: 'aha', text: '« Noir posa la main sur la poignée. Il se demanda s’il était encore libre de l’ouvrir. »' },

        { type: 'sprite', pos: 'center', char: 'ren', active: true, expr: 'talk' },
        { type: 'dialogue', char: 'ren', speaking: 'center', expr: 'talk', text: '« C’est exactement ce que j’ai dit tout à l’heure. »' },

        { type: 'dialogue', char: 'mei', speaking: 'left', expr: 'hmph', text: '« Non. Tu as dit que le livre était probablement pourri. »' },

        { type: 'dialogue', char: 'ren', speaking: 'center', expr: 'ee', text: '« C’était ma façon poétique de poser la question. »' },

        { type: 'sprite', pos: 'left', char: 'aoi', active: true, expr: 'hmm' },
        { type: 'dialogue', char: 'aoi', speaking: 'left', expr: 'hmm', text: '« Continue. »' },

        { type: 'narrate', text: 'Une illustration apparaît au milieu de la page : quatre silhouettes assises autour d’une table. L’une tient un livre. Les silhouettes ressemblent aux quatre élèves.' },

        { type: 'choice',
          label: 'Faut-il poursuivre la lecture ?',
          options: [
            { tag: 'A', text: 'Kaito continue malgré la peur.', next: 'suite_kaito', affinity: { kaito: 15 } },
            { tag: 'B', text: 'Mei prend le livre des mains de Kaito.', next: 'suite_mei', affinity: { mei: 15 } },
            { tag: 'C', text: 'Ren ferme le livre.', next: 'suite_ren', affinity: { ren: 15 } },
            { tag: 'D', text: 'Aoi demande à lire la page suivante.', next: 'suite_aoi', affinity: { aoi: 15 } },
          ]
        },
      ]
    },

    suite_kaito: {
      label: 'Chapitre II — La Voix du Père',
      music: 'pluie_tatami', rain: true,
      steps: [
        { type: 'sprite', pos: 'right', char: 'kaito', active: true, expr: 'sad' },
        { type: 'narrate', text: 'Les murs de la salle changent brièvement. Les étagères deviennent celles d’une pièce inconnue. Kaito entend la voix de son père lui dire :' },
        { type: 'dialogue', char: 'kaito', speaking: 'right', expr: 'sad2', text: '« Si tu ne contrôles pas tout, tu seras responsable de tout ce qui arrivera. »' },
        { type: 'goto', scene: 'futurs_possibles' },
      ]
    },

    suite_mei: {
      label: 'Chapitre II — Le Téléphone qui Sonne',
      music: 'pluie_tatami', rain: true,
      steps: [
        { type: 'sprite', pos: 'left', char: 'mei', active: true, expr: 'sad' },
        { type: 'narrate', text: 'Mei lit une scène où une jeune fille reste immobile devant un téléphone qui sonne. La scène ressemble à la journée de l’accident qu’elle refuse de raconter.' },
        { type: 'goto', scene: 'futurs_possibles' },
      ]
    },

    suite_ren: {
      label: 'Chapitre II — Les Horloges Arrêtées',
      music: 'pluie_tatami', rain: false,
      steps: [
        { type: 'bg', bg: 'black' },
        { type: 'narrate', text: 'Toutes les horloges du lycée s’arrêtent. Une seule continue : celle du couloir, dont les aiguilles reculent.' },
        { type: 'goto', scene: 'futurs_possibles' },
      ]
    },

    suite_aoi: {
      label: 'Chapitre II — Ton Écriture',
      music: 'pluie_tatami', rain: true,
      steps: [
        { type: 'sprite', pos: 'left', char: 'aoi', active: true, expr: 'worry' },
        { type: 'narrate', text: 'Aoi découvre une phrase écrite dans son écriture :' },
        { type: 'book', text: '« Tu sais déjà comment cette histoire se termine. »' },
        { type: 'goto', scene: 'futurs_possibles' },
      ]
    },

    /* ╔═══════════════════════════════════════╗
       ║  CHAPITRE III — Les Futurs Possibles  ║
       ╚═══════════════════════════════════════╝ */
    futurs_possibles: {
      label: 'Chapitre III — Les Futurs Possibles',
      music: 'pluie_tatami', rain: true,
      steps: [
        { type: 'transition' },
        { type: 'bg', bg: 'club_rain' },
        { type: 'chapter', text: 'Chapitre III · Les Futurs Possibles' },

        { type: 'narrate', text: 'Noir arrive devant trois portes. Derrière la première, quelqu’un l’attend. Derrière la deuxième, il entend une voix d’enfant. Derrière la troisième, il n’y a qu’un miroir.' },

        { type: 'book', text: '«&nbsp;Le Lumen crée un paradoxe que Noir n’a jamais réussi à résoudre. S’il connaît l’avenir, il peut le modifier. S’il peut le modifier, c’est qu’il ne le connaissait pas vraiment. Son pouvoir ne lui donne donc pas un contrôle absolu sur le temps — seulement l’illusion d’un contrôle absolu.&nbsp;»' },

        { type: 'sprite', pos: 'right', char: 'kaito', active: true, speaking: true, expr: 'thinking' },
        { type: 'dialogue', char: 'kaito', speaking: 'right', expr: 'thinking', text: '« La première. Une histoire doit avancer vers un conflit. »' },

        { type: 'sprite', pos: 'left', char: 'mei', active: true, expr: 'sadsmile' },
        { type: 'dialogue', char: 'mei', speaking: 'left', expr: 'sadsmile', text: '« La deuxième. Une voix qui appelle mérite au moins qu’on l’écoute. »' },

        { type: 'sprite', pos: 'center', char: 'ren', active: true, expr: 'talk' },
        { type: 'dialogue', char: 'ren', speaking: 'center', expr: 'talk', text: '« La troisième. Le miroir ne prétend pas être autre chose que ce qu’il est. »' },

        { type: 'sprite', pos: 'left', char: 'aoi', active: true, expr: 'hmm' },
        { type: 'dialogue', char: 'aoi', speaking: 'left', expr: 'hmm', text: '« Vous supposez tous que les portes mènent à des endroits différents. »' },

        { type: 'dialogue', char: 'kaito', speaking: 'right', expr: 'disagree', text: '« Ce n’est pas le cas ? »' },

        { type: 'dialogue', char: 'aoi', speaking: 'left', expr: 'hmm', text: '« Peut-être qu’elles montrent la même chose à des moments différents. »' },

        { type: 'book',
          text: '<blockquote>«&nbsp;Le temps vécu n’est pas une suite de secondes identiques.&nbsp;»</blockquote>— Henri Bergson<span class="book-sub">Pour Bergson, le temps de la conscience n’est pas celui d’une horloge. Une minute d’attente peut sembler interminable, tandis qu’une journée heureuse disparaît en un instant. Les trois portes ne sont peut-être pas trois lieux, mais trois manières différentes de ressentir le même instant.</span>' },

        { type: 'choice',
          label: 'La porte choisie',
          options: [
            { tag: 'A', text: 'La porte de la mission.', next: 'porte_mission', affinity: { kaito: 10 } },
            { tag: 'B', text: 'La porte de l’enfant.', next: 'porte_enfant', affinity: { mei: 10 } },
            { tag: 'C', text: 'La porte du miroir.', next: 'porte_miroir', affinity: { ren: 10 } },
            { tag: 'D', text: 'Refuser les trois portes.', next: 'porte_refus', affinity: { aoi: 10 } },
          ]
        },
      ]
    },

    porte_mission: {
      label: 'Chapitre III — La Porte de la Mission',
      music: 'pluie_tatami', rain: true,
      steps: [
        { type: 'narrate', text: 'Noir reçoit une cible, mais le visage de cette cible change selon la personne qui lit. Pour Kaito, c’est son père. Pour Mei, c’est elle-même. Pour Ren, c’est le proviseur. Pour Aoi, c’est Noir.' },
        { type: 'goto', scene: 'quinze_scene' },
      ]
    },

    porte_enfant: {
      label: 'Chapitre III — La Porte de l’Enfant',
      music: 'pluie_tatami', rain: true,
      steps: [
        { type: 'narrate', text: 'Une petite voix demande :' },
        { type: 'book', text: '« Si tu savais que tu allais me perdre, me parlerais-tu quand même ? »' },
        { type: 'sprite', pos: 'left', char: 'mei', active: true, expr: 'sad' },
        { type: 'narrate', text: 'Mei commence à pleurer sans s’en rendre compte.' },
        { type: 'goto', scene: 'quinze_scene' },
      ]
    },

    porte_miroir: {
      label: 'Chapitre III — La Porte du Miroir',
      music: 'pluie_tatami', rain: true,
      steps: [
        { type: 'narrate', text: 'Le reflet de Noir ne bouge pas en même temps que lui.' },
        { type: 'book', text: '« Tu ne fais pas ce que tu veux. Tu veux ce que tu as appris à vouloir. »' },
        { type: 'goto', scene: 'quinze_scene' },
      ]
    },

    porte_refus: {
      label: 'Chapitre III — La Quatrième Porte',
      music: 'pluie_tatami', rain: false,
      steps: [
        { type: 'bg', bg: 'black' },
        { type: 'narrate', text: 'Le livre devient complètement noir. Une quatrième porte apparaît, mais elle est dessinée sur la page avec l’empreinte de la main du joueur.' },
        { type: 'goto', scene: 'quinze_scene' },
      ]
    },

    quinze_scene: {
      label: 'Chapitre III — Quinze',
      music: 'pluie_tatami', rain: true,
      steps: [
        { type: 'transition' },
        { type: 'bg', bg: 'club_rain' },
        { type: 'chapter', text: 'Chapitre III · Quinze' },

        { type: 'narrate', text: 'Plus loin dans le récit, Noir croise un autre porteur de Lumen, un homme que tout le monde appelle simplement Quinze. Contrairement à Noir, Quinze ne cherche pas à survivre à tout prix : il cherche à comprendre le système qui les a créés tous les deux.' },

        { type: 'book', text: 'Noir : «&nbsp;Je dois survivre.&nbsp;»<span class="book-sub">Quinze : «&nbsp;Je dois comprendre.&nbsp;»</span>' },

        { type: 'sprite', pos: 'center', char: 'ren', active: true, expr: 'ugh' },
        { type: 'narrate', text: 'Ren, en lisant ce passage, reste silencieux plus longtemps que d’habitude.' },

        { type: 'dialogue', char: 'ren', speaking: 'center', expr: 'ugh2', text: '(très bas) ...Il y a des jours où je ne sais même plus laquelle de ces deux phrases je préférerais dire.' },

        { type: 'goto', scene: 'pause2_liberte' },
      ]
    },

    /* ╔═══════════════════════════════════════╗
       ║  CHAPITRE IV — Sommes-nous Libres ?   ║
       ╚═══════════════════════════════════════╝ */
    pause2_liberte: {
      label: 'Chapitre IV — Sommes-nous Réellement Libres ?',
      music: 'pluie_tatami', rain: true,
      steps: [
        { type: 'transition' },
        { type: 'bg', bg: 'club_rain' },
        { type: 'chapter', text: 'Chapitre IV · Sommes-nous Réellement Libres ?' },

        { type: 'narrate', text: 'La salle revient à la normale. Pourtant, personne ne se souvient d’avoir quitté sa chaise.' },

        { type: 'sprite', pos: 'center', char: 'ren', active: true, speaking: true, expr: 'argue' },
        { type: 'dialogue', char: 'ren', speaking: 'center', expr: 'argue', text: '« Si le livre connaît déjà nos réactions, ça veut dire qu’il nous contrôle. »' },

        { type: 'sprite', pos: 'left', char: 'aoi', active: true, expr: 'talk' },
        { type: 'dialogue', char: 'aoi', speaking: 'left', expr: 'talk', text: '« Pas nécessairement. Il peut connaître nos habitudes sans connaître nos décisions. »' },

        { type: 'sprite', pos: 'right', char: 'kaito', active: true, expr: 'thinking' },
        { type: 'dialogue', char: 'kaito', speaking: 'right', expr: 'thinking', text: '« Quelle différence ? »' },

        { type: 'dialogue', char: 'aoi', speaking: 'left', expr: 'talk', text: '« Une habitude nous influence. Elle ne nous excuse pas toujours. »' },

        { type: 'sprite', pos: 'right', char: 'mei', active: true, expr: 'sad' },
        { type: 'dialogue', char: 'mei', speaking: 'right', expr: 'sad', text: '« Et si nos habitudes viennent de blessures ? Est-ce qu’on peut nous reprocher de nous défendre comme on a appris à le faire ? »' },

        { type: 'book',
          text: '<blockquote>«&nbsp;On ne devient pas libre en échappant aux causes, mais en les comprenant suffisamment pour ne plus leur obéir aveuglément.&nbsp;»</blockquote>— Baruch Spinoza & Arthur Schopenhauer<span class="book-sub">Spinoza soutient que nous nous croyons libres parce que nous connaissons nos désirs, mais pas les causes qui les produisent. Schopenhauer ajoutait : nous pouvons faire ce que nous voulons, mais nous ne choisissons pas toujours ce que nous voulons.</span>' },

        { type: 'narrate', text: 'Le silence qui suit est long. Cette fois, le livre n’écrit rien. Il attend que les élèves parlent sans être guidés.' },

        { type: 'choice',
          label: 'Confession personnelle',
          options: [
            { tag: 'A', text: 'Kaito avoue qu’il veut toujours décider pour éviter de perdre quelqu’un.', next: 'confession_kaito', affinity: { kaito: 20 } },
            { tag: 'B', text: 'Mei raconte enfin l’accident de son amie.', next: 'confession_mei', affinity: { mei: 20 } },
            { tag: 'C', text: 'Ren révèle que son avenir a été choisi par sa famille.', next: 'confession_ren', affinity: { ren: 20 } },
            { tag: 'D', text: 'Aoi explique qu’elle se souvient d’une autre réunion.', next: 'confession_aoi', affinity: { aoi: 20 } },
          ]
        },
      ]
    },

    confession_kaito: {
      label: 'Chapitre IV — La Confession de Kaito',
      music: 'pluie_tatami', rain: true,
      steps: [
        { type: 'sprite', pos: 'right', char: 'kaito', active: true, speaking: true, expr: 'sad' },
        { type: 'dialogue', char: 'kaito', speaking: 'right', expr: 'sad', text: '« Je veux toujours décider... pour éviter de perdre quelqu’un. »' },
        { type: 'sprite', pos: 'left', char: 'mei', active: true, expr: 'doubt' },
        { type: 'dialogue', char: 'mei', speaking: 'left', expr: 'doubt', text: '« Est-ce que tu protèges réellement les autres, Kaito ? Ou est-ce que tu cherches seulement à ne plus ressentir ta culpabilité ? »' },
        { type: 'goto', scene: 'systeme_livre' },
      ]
    },

    confession_mei: {
      label: 'Chapitre IV — La Confession de Mei',
      music: 'pluie_tatami', rain: true,
      steps: [
        { type: 'sprite', pos: 'left', char: 'mei', active: true, speaking: true, expr: 'sad' },
        { type: 'dialogue', char: 'mei', speaking: 'left', expr: 'sad', text: '« J’avais reçu un appel ce jour-là. Je n’ai pas répondu, parce qu’on s’était disputées. J’ignore encore si elle voulait s’excuser. »' },
        { type: 'narrate', text: 'Un silence, presque tendre, s’installe.' },
        { type: 'goto', scene: 'systeme_livre' },
      ]
    },

    confession_ren: {
      label: 'Chapitre IV — La Confession de Ren',
      music: 'pluie_tatami', rain: true,
      steps: [
        { type: 'sprite', pos: 'center', char: 'ren', active: true, speaking: true, expr: 'ugh' },
        { type: 'dialogue', char: 'ren', speaking: 'center', expr: 'ugh', text: '« Je devais entrer dans une école précise, suivre une carrière précise, ne jamais faire de vagues. Le club de lecture est le seul endroit où j’ai l’impression d’exister par choix. »' },
        { type: 'goto', scene: 'systeme_livre' },
      ]
    },

    confession_aoi: {
      label: 'Chapitre IV — La Confession d’Aoi',
      music: 'pluie_tatami', rain: true,
      steps: [
        { type: 'sprite', pos: 'left', char: 'aoi', active: true, speaking: true, expr: 'worry2' },
        { type: 'dialogue', char: 'aoi', speaking: 'left', expr: 'worry2', text: '« Je ne sais pas si c’est un souvenir, un rêve ou une histoire lue autrefois. Dans cette autre réunion... un des quatre élèves n’est jamais rentré chez lui. »' },
        { type: 'goto', scene: 'systeme_livre' },
      ]
    },

    /* ╔═══════════════════════════════════════╗
       ║  CHAPITRE V — Le Système              ║
       ╚═══════════════════════════════════════╝ */
    systeme_livre: {
      label: 'Chapitre V — Le Système Derrière le Livre',
      music: 'pluie_tatami', rain: true,
      steps: [
        { type: 'transition' },
        { type: 'bg', bg: 'club_rain' },
        { type: 'chapter', text: 'Chapitre V · Le Système Derrière le Livre' },

        { type: 'narrate', text: 'Aoi retrouve dans les archives plusieurs comptes rendus du club de lecture. Ils sont tous incomplets. Chaque année, quatre élèves se réunissent dans la même salle et découvrent un livre sans titre.' },

        { type: 'sprite', pos: 'center', char: 'ren', active: true, speaking: true, expr: 'argue2' },
        { type: 'dialogue', char: 'ren', speaking: 'center', expr: 'argue2', text: '« Donc le lycée nous étudie ? »' },

        { type: 'sprite', pos: 'left', char: 'mei', active: true, expr: 'doubt' },
        { type: 'dialogue', char: 'mei', speaking: 'left', expr: 'doubt', text: '« Qui ferait ça ? »' },

        { type: 'sprite', pos: 'right', char: 'aoi', active: true, expr: 'hmm' },
        { type: 'dialogue', char: 'aoi', speaking: 'right', expr: 'hmm', text: '« Une institution n’a pas besoin d’être dirigée par une personne pour exercer un contrôle. Il suffit parfois que tout le monde obéisse à des règles dont personne ne se rappelle l’origine. »' },

        { type: 'book',
          text: '<blockquote>«&nbsp;Une discipline douce, presque invisible.&nbsp;»</blockquote>— Michel Foucault<span class="book-sub">Les institutions peuvent discipliner les individus sans violence visible : elles organisent les espaces, les horaires, les comportements. On finit par se surveiller soi-même, même lorsque personne ne nous surveille directement.</span>' },

        { type: 'bg', bg: 'black' },
        { type: 'narrate', text: 'La cloche du lycée sonne, alors que les cours sont terminés depuis longtemps. Sur le tableau, une consigne apparaît :' },

        { type: 'book', text: '<blockquote>UN SEUL LECTEUR DOIT ÊTRE SACRIFIÉ POUR QUE LES AUTRES SORTENT.</blockquote>' },

        { type: 'choice',
          label: 'Réagir à la consigne',
          options: [
            { tag: 'A', text: 'Kaito propose de se sacrifier.', next: 'sacrifice_kaito', affinity: { kaito: 15 } },
            { tag: 'B', text: 'Mei refuse de sacrifier qui que ce soit.', next: 'sacrifice_mei', affinity: { mei: 15 } },
            { tag: 'C', text: 'Ren déchire la consigne.', next: 'sacrifice_ren', affinity: { ren: 15 } },
            { tag: 'D', text: 'Aoi demande à chacun de voter, sans se regarder.', next: 'sacrifice_aoi', affinity: { aoi: 15 } },
          ]
        },
      ]
    },

    sacrifice_kaito: {
      label: 'Chapitre V — Se Sacrifier',
      music: 'pluie_tatami', rain: false,
      steps: [
        { type: 'bg', bg: 'black' },
        { type: 'book', text: '« Celui qui choisit pour les autres ne se sacrifie pas. Il les prive d’une décision. »' },
        { type: 'goto', scene: 'pause3_doute' },
      ]
    },

    sacrifice_mei: {
      label: 'Chapitre V — Refuser',
      music: 'pluie_tatami', rain: false,
      steps: [
        { type: 'bg', bg: 'black' },
        { type: 'narrate', text: 'Les fenêtres s’ouvrent sur un couloir entièrement noir. Une voix demande combien de temps elle tiendra cette position.' },
        { type: 'goto', scene: 'pause3_doute' },
      ]
    },

    sacrifice_ren: {
      label: 'Chapitre V — Déchirer',
      music: 'pluie_tatami', rain: false,
      steps: [
        { type: 'bg', bg: 'black' },
        { type: 'narrate', text: 'Le papier se reconstitue, mais le nom de Ren est maintenant inscrit au-dessus du mot SACRIFIÉ.' },
        { type: 'goto', scene: 'pause3_doute' },
      ]
    },

    sacrifice_aoi: {
      label: 'Chapitre V — Le Vote',
      music: 'pluie_tatami', rain: false,
      steps: [
        { type: 'bg', bg: 'black' },
        { type: 'narrate', text: 'Le résultat dépend des choix précédents. Si la confiance est élevée, les quatre bulletins portent le même mot : PERSONNE.' },
        { type: 'goto', scene: 'pause3_doute' },
      ]
    },

    /* ╔═══════════════════════════════════════╗
       ║  CHAPITRE VI — Le Doute et la Réalité ║
       ╚═══════════════════════════════════════╝ */
    pause3_doute: {
      label: 'Chapitre VI — Le Doute et la Réalité',
      music: 'pluie_tatami', rain: true,
      steps: [
        { type: 'transition' },
        { type: 'bg', bg: 'club_rain' },
        { type: 'chapter', text: 'Chapitre VI · Le Doute et la Réalité' },

        { type: 'narrate', text: 'Le livre présente ensuite quatre versions de la même soirée. Dans la première, le club existe réellement. Dans la deuxième, les élèves sont des souvenirs. Dans la troisième, ils sont des personnages écrits par un ancien lecteur. Dans la dernière, ils sont des lecteurs qui imaginent être des personnages.' },

        { type: 'sprite', pos: 'right', char: 'kaito', active: true, speaking: true, expr: 'disagree' },
        { type: 'dialogue', char: 'kaito', speaking: 'right', expr: 'disagree', text: '« Il doit bien y avoir une version vraie. »' },

        { type: 'sprite', pos: 'center', char: 'ren', active: true, expr: 'ee2' },
        { type: 'dialogue', char: 'ren', speaking: 'center', expr: 'ee2', text: '« Pourquoi ? Parce que tu as besoin que le monde soit bien rangé ? »' },

        { type: 'dialogue', char: 'kaito', speaking: 'right', expr: 'sad', text: '« Parce que si rien n’est vrai, nos décisions ne servent à rien. »' },

        { type: 'sprite', pos: 'left', char: 'aoi', active: true, expr: 'talk' },
        { type: 'dialogue', char: 'aoi', speaking: 'left', expr: 'talk', text: '« Descartes aurait commencé par douter de tout. Mais le doute ne signifie pas que rien n’existe. Il signifie qu’il faut examiner ce que l’on croit savoir. »' },

        { type: 'book',
          text: '<blockquote>«&nbsp;Je pense, donc je suis.&nbsp;»</blockquote>— René Descartes<span class="book-sub">Le doute méthodique ne prouve pas que le monde extérieur est réel — il révèle seulement une présence : celle de celui qui doute. Même si l’histoire est truquée, la manière d’y répondre peut encore avoir une signification.</span>' },

        { type: 'choice',
          label: 'Ce que les personnages décident de croire',
          options: [
            { tag: 'A', text: 'Kaito choisit de croire aux faits vérifiables.', next: 'croyance_kaito', affinity: { kaito: 15 } },
            { tag: 'B', text: 'Mei choisit de croire aux émotions ressenties.', next: 'croyance_mei', affinity: { mei: 15 } },
            { tag: 'C', text: 'Ren choisit de ne croire personne, pas même lui-même.', next: 'croyance_ren', affinity: { ren: 15 } },
            { tag: 'D', text: 'Aoi choisit de croire aux contradictions.', next: 'croyance_aoi', affinity: { aoi: 15 } },
          ]
        },
      ]
    },

    croyance_kaito: {
      label: 'Chapitre VI — Les Faits',
      music: 'pluie_tatami', rain: true,
      steps: [
        { type: 'narrate', text: 'Kaito compare les archives, les horloges et les pages pour reconstruire une chronologie.' },
        { type: 'goto', scene: 'verite_livre' },
      ]
    },

    croyance_mei: {
      label: 'Chapitre VI — Les Émotions',
      music: 'pluie_tatami', rain: true,
      steps: [
        { type: 'sprite', pos: 'left', char: 'mei', active: true, expr: 'sadsmile' },
        { type: 'dialogue', char: 'mei', speaking: 'left', expr: 'sadsmile', text: '« Une douleur n’est pas fausse simplement parce qu’elle apparaît dans une histoire. »' },
        { type: 'goto', scene: 'verite_livre' },
      ]
    },

    croyance_ren: {
      label: 'Chapitre VI — Ne Croire Personne',
      music: 'pluie_tatami', rain: true,
      steps: [
        { type: 'narrate', text: 'Ren devient plus difficile à manipuler, mais il risque de s’isoler du groupe.' },
        { type: 'goto', scene: 'verite_livre' },
      ]
    },

    croyance_aoi: {
      label: 'Chapitre VI — Les Contradictions',
      music: 'pluie_tatami', rain: true,
      steps: [
        { type: 'sprite', pos: 'left', char: 'aoi', active: true, expr: 'hmm' },
        { type: 'dialogue', char: 'aoi', speaking: 'left', expr: 'hmm', text: '« Les incohérences du livre sont peut-être les traces laissées par les lecteurs précédents. »' },
        { type: 'goto', scene: 'verite_livre' },
      ]
    },

    /* ╔═══════════════════════════════════════╗
       ║  CHAPITRE VII — La Vérité             ║
       ╚═══════════════════════════════════════╝ */
    verite_livre: {
      label: 'Chapitre VII — La Vérité sur le Livre',
      music: 'pluie_tatami', rain: true,
      steps: [
        { type: 'transition' },
        { type: 'bg', bg: 'club_rain' },
        { type: 'chapter', text: 'Chapitre VII · La Vérité sur le Livre' },

        { type: 'narrate', text: 'Au fond de l’ouvrage, les quatre élèves découvrent une page signée par une ancienne présidente du club, morte plusieurs années auparavant. Elle raconte que le livre a été créé par un professeur de philosophie qui voulait démontrer que les êtres humains confondent souvent liberté et absence de contraintes.' },

        { type: 'narrate', text: 'Mais l’expérience a échappé à son créateur. Le livre a commencé à conserver les décisions des lecteurs. Il ne prédit pas l’avenir : il compare les nouveaux lecteurs aux anciens et les pousse subtilement à répéter les mêmes choix.' },

        { type: 'bg', bg: 'black' },
        { type: 'narrate', text: 'La dernière page contient pourtant un détail impossible : le nom des quatre élèves est écrit avant même qu’ils ne soient entrés dans la salle.' },

        { type: 'sprite', pos: 'left', char: 'mei', active: true, speaking: true, expr: 'sad' },
        { type: 'dialogue', char: 'mei', speaking: 'left', expr: 'sad', text: '« Alors tout était décidé depuis le début ? »' },

        { type: 'sprite', pos: 'center', char: 'ren', active: true, expr: 'ugh' },
        { type: 'dialogue', char: 'ren', speaking: 'center', expr: 'ugh', text: '« Ou bien quelqu’un nous a simplement écrits dans le livre après nous avoir observés. »' },

        { type: 'sprite', pos: 'right', char: 'kaito', active: true, expr: 'sad2' },
        { type: 'dialogue', char: 'kaito', speaking: 'right', expr: 'sad2', text: '« Dans les deux cas, on nous a manipulés. »' },

        { type: 'sprite', pos: 'left', char: 'aoi', active: true, expr: 'hmm' },
        { type: 'dialogue', char: 'aoi', speaking: 'left', expr: 'hmm', text: '« Peut-être. Mais être influencé n’est pas la même chose qu’être entièrement déterminé. »' },

        { type: 'book',
          text: '<blockquote>«&nbsp;On ne voit jamais directement un lien de cause à effet — on le suppose, à force d’habitude.&nbsp;»</blockquote>— David Hume<span class="book-sub">Notre volonté s’inscrit dans une chaîne de causes : les habitudes, les souvenirs et les événements antérieurs influencent nos actions. Pourtant, réfléchir à ces causes peut modifier notre conduite.</span>' },

        { type: 'goto', scene: 'choix_final' },
      ]
    },

    /* ╔═══════════════════════════════════════╗
       ║  CHAPITRE VIII — Le Choix Final       ║
       ╚═══════════════════════════════════════╝ */
    choix_final: {
      label: 'Chapitre VIII — Le Choix Final',
      music: 'pluie_tatami', rain: true,
      steps: [
        { type: 'transition' },
        { type: 'bg', bg: 'club_rain' },
        { type: 'chapter', text: 'Chapitre VIII · Le Choix Final' },

        { type: 'narrate', text: 'Le livre s’ouvre sur une page divisée en trois parties. La salle du club commence à disparaître autour des personnages. Kaito, Mei, Ren et Aoi comprennent qu’ils doivent décider ensemble de ce qu’ils feront de l’ouvrage.' },

        { type: 'choice',
          label: 'Le destin du Livre sans titre',
          options: [
            { tag: 'A', text: 'Le brûler.', next: 'fin_page_blanche', affinity: { ren: 10 } },
            { tag: 'B', text: 'Le conserver et continuer l’expérience.', next: 'fin_lecteurs_systeme', affinity: { kaito: 10 } },
            { tag: 'C', text: 'Le réécrire.', next: 'fin_nous_ecrivons', affinity: { mei: 10, aoi: 10 } },
            { tag: 'D', text: 'Le refermer sans choisir.', next: 'fin_livre_qui_ecoute', affinity: { mei: 5, ren: 5, kaito: 5, aoi: 5 } },
          ]
        },
      ]
    },

    /* ╔═══════════════════════════════════════╗
       ║  FIN I — La Page Blanche              ║
       ╚═══════════════════════════════════════╝ */
    fin_page_blanche: {
      label: 'Fin I — La Page Blanche',
      music: 'pluie_tatami', rain: false,
      steps: [
        { type: 'transition' },
        { type: 'bg', bg: 'club_day' },
        { type: 'chapter', text: 'Fin I · La Page Blanche' },

        { type: 'narrate', text: 'Le livre brûle sans produire de fumée. Lorsque les flammes disparaissent, la porte de la salle s’ouvre.' },
        { type: 'narrate', text: 'Au matin, aucun élève du lycée ne se souvient de l’existence du club de lecture. Les archives sont vides.' },

        { type: 'sprite', pos: 'left', char: 'mei', active: true, speaking: true, expr: 'sad' },
        { type: 'dialogue', char: 'mei', speaking: 'left', expr: 'sad', text: '« Est-ce que tout cela a vraiment eu lieu ? »' },

        { type: 'sprite', pos: 'right', char: 'kaito', active: true, expr: 'sad2' },
        { type: 'dialogue', char: 'kaito', speaking: 'right', expr: 'sad2', text: '« Je ne sais pas. »' },

        { type: 'sprite', pos: 'center', char: 'ren', active: true, expr: 'ee' },
        { type: 'dialogue', char: 'ren', speaking: 'center', expr: 'ee', text: '« Pour une fois, ça me va. »' },

        { type: 'sprite', pos: 'left', char: 'aoi', active: true, expr: 'sadsmile' },
        { type: 'narrate', text: 'Aoi trouve une page blanche dans sa poche. Elle y écrit les quatre noms, puis ajoute une cinquième ligne :' },
        { type: 'book', text: '« Nous ne savons pas encore ce que cette histoire fera de nous. »' },

        { type: 'book', text: '<blockquote>Continuer à vivre, aimer et choisir malgré l’incertitude peut constituer une forme de révolte.</blockquote>— Albert Camus' },

        { type: 'sprite', pos: 'left', char: null },
        { type: 'monologue', text: 'La page était vide.\nPour la première fois,\ncela ne ressemblait pas à une menace.' },
        { type: 'end', label: 'FIN I · La Page Blanche', next: 'title' },
      ]
    },

    /* ╔═══════════════════════════════════════╗
       ║  FIN II — Les Lecteurs du Système     ║
       ╚═══════════════════════════════════════╝ */
    fin_lecteurs_systeme: {
      label: 'Fin II — Les Lecteurs du Système',
      music: 'pluie_tatami', rain: true,
      steps: [
        { type: 'transition' },
        { type: 'bg', bg: 'club_rain' },
        { type: 'chapter', text: 'Fin II · Les Lecteurs du Système' },

        { type: 'narrate', text: 'Un an plus tard, quatre nouveaux élèves ouvrent le livre. Les anciens les observent derrière la porte vitrée. Ils se disent qu’ils pourront intervenir si les choses vont trop loin.' },

        { type: 'sprite', pos: 'left', char: 'aoi', active: true, speaking: true, expr: 'worry' },
        { type: 'dialogue', char: 'aoi', speaking: 'left', expr: 'worry', text: '« Nous n’avons pas arrêté le système. »' },

        { type: 'sprite', pos: 'center', char: 'ren', active: true, expr: 'ugh' },
        { type: 'dialogue', char: 'ren', speaking: 'center', expr: 'ugh', text: '« Non. Nous avons seulement appris à mieux y travailler. »' },

        { type: 'sprite', pos: 'right', char: 'kaito', active: true, expr: 'thinking' },
        { type: 'dialogue', char: 'kaito', speaking: 'right', expr: 'thinking', text: '« Alors nous devons le changer de l’intérieur. »' },

        { type: 'sprite', pos: 'left', char: 'mei', active: true, expr: 'doubt' },
        { type: 'dialogue', char: 'mei', speaking: 'left', expr: 'doubt', text: '« Et si c’est exactement ce que le livre voulait que nous disions ? »' },

        { type: 'narrate', text: 'Personne ne répond. La cloche sonne. Sur la première page du nouveau volume, un titre apparaît enfin :' },

        { type: 'book', text: '<blockquote>LE CLUB DES LECTEURS</blockquote><span class="book-sub">Comprendre un système ne suffit pas toujours à s’en libérer. La connaissance peut devenir une nouvelle forme de pouvoir, et celui qui surveille peut finir par reproduire la surveillance qu’il voulait combattre. — Michel Foucault</span>' },

        { type: 'sprite', pos: 'left', char: null },
        { type: 'sprite', pos: 'center', char: null },
        { type: 'sprite', pos: 'right', char: null },
        { type: 'monologue', text: 'Ils avaient appris à lire entre les lignes.\nIls n’avaient pas remarqué\nque les lignes les lisaient aussi.' },
        { type: 'end', label: 'FIN II · Les Lecteurs du Système', next: 'title' },
      ]
    },

    /* ╔═══════════════════════════════════════╗
       ║  FIN III — Nous Écrivons la Suite     ║
       ╚═══════════════════════════════════════╝ */
    fin_nous_ecrivons: {
      label: 'Fin III — Nous Écrivons la Suite',
      music: 'pluie_tatami', rain: true,
      steps: [
        { type: 'transition' },
        { type: 'bg', bg: 'club_rain' },
        { type: 'chapter', text: 'Fin III · Nous Écrivons la Suite' },

        { type: 'narrate', text: 'Les quatre personnages se font confiance, confessent leurs blessures et réécrivent ensemble la dernière partie du livre. Ils refusent de choisir un chef, une victime ou une vérité unique. Chacun écrit une page, puis laisse volontairement une partie inachevée.' },

        { type: 'book', text: '« Qui êtes-vous, si personne ne vous raconte ? »' },

        { type: 'sprite', pos: 'right', char: 'kaito', active: true, speaking: true, expr: 'smile' },
        { type: 'dialogue', char: 'kaito', speaking: 'right', expr: 'smile', text: '« Je suis celui qui apprend à ne pas décider pour tout le monde. »' },

        { type: 'sprite', pos: 'left', char: 'mei', active: true, expr: 'sadsmile' },
        { type: 'dialogue', char: 'mei', speaking: 'left', expr: 'sadsmile', text: '« Je suis celle qui peut se souvenir sans rester prisonnière de ce souvenir. »' },

        { type: 'sprite', pos: 'center', char: 'ren', active: true, expr: 'talk' },
        { type: 'dialogue', char: 'ren', speaking: 'center', expr: 'talk', text: '« Je suis celui qui choisit, même quand son choix n’a rien de spectaculaire. »' },

        { type: 'sprite', pos: 'left', char: 'aoi', active: true, expr: 'ahaha' },
        { type: 'dialogue', char: 'aoi', speaking: 'left', expr: 'ahaha', text: '« Je suis celle qui peut écrire sa propre page, même si elle ne sait pas encore comment se termine le livre. »' },

        { type: 'narrate', text: 'La salle revient entièrement à la normale. Le livre est toujours là, mais il n’a plus de texte. Sur sa couverture, les quatre élèves écrivent un titre :' },

        { type: 'book', text: '<blockquote>À NOUS DE CHOISIR</blockquote><span class="book-sub">Se libérer ne signifie pas devenir quelqu’un qui n’a jamais été influencé. Cela signifie transformer ses influences en matière de création plutôt qu’en prison. — Friedrich Nietzsche</span>' },

        { type: 'sprite', pos: 'left', char: null },
        { type: 'sprite', pos: 'center', char: null },
        { type: 'sprite', pos: 'right', char: null },
        { type: 'monologue', text: 'Ils ne savaient pas si la liberté les attendait\nau bout de l’histoire.\nAlors ils décidèrent de commencer\npar écrire une phrase qui leur appartenait.' },
        { type: 'end', label: 'FIN III · Nous Écrivons la Suite', next: 'title' },
      ]
    },

    /* ╔═══════════════════════════════════════╗
       ║  FIN CACHÉE — Le Livre qui Écoute     ║
       ╚═══════════════════════════════════════╝ */
    fin_livre_qui_ecoute: {
      label: 'Fin Cachée — Le Livre qui Écoute',
      music: 'pluie_tatami', rain: true,
      steps: [
        { type: 'transition' },
        { type: 'bg', bg: 'club_rain' },
        { type: 'chapter', text: 'Fin Cachée · Le Livre qui Écoute' },

        { type: 'narrate', text: 'Les quatre élèves laissent le livre ouvert sur la table, puis quittent la salle ensemble. La porte se ferme derrière eux.' },
        { type: 'book', text: '« Une histoire ne devient pas vraie parce qu’elle était écrite d’avance. Elle devient vraie lorsque quelqu’un accepte d’en répondre. »' },

        { type: 'transition' },
        { type: 'bg', bg: 'club_day' },
        { type: 'chapter', text: 'Fin Cachée · Le Lendemain' },

        { type: 'narrate', text: 'Le lendemain, les élèves reviennent dans la salle. Le livre est toujours là, mais il contient les dialogues qu’ils ont eus après être sortis. Il ne raconte plus leurs choix : il raconte leurs conséquences.' },

        { type: 'sprite', pos: 'left', char: 'aoi', active: true, speaking: true, expr: 'hmm' },
        { type: 'dialogue', char: 'aoi', speaking: 'left', expr: 'hmm', text: '« Il ne nous demandait peut-être pas de choisir la bonne fin. »' },

        { type: 'sprite', pos: 'right', char: 'mei', active: true, expr: 'doubt' },
        { type: 'dialogue', char: 'mei', speaking: 'right', expr: 'doubt', text: '« Alors que voulait-il ? »' },

        { type: 'dialogue', char: 'aoi', speaking: 'left', expr: 'talk', text: '« Que nous comprenions qu’une fin n’efface jamais ce qui l’a précédée. »' },

        { type: 'sprite', pos: 'center', char: 'kaito', active: true, expr: 'smile' },
        { type: 'narrate', text: 'Kaito prend un stylo et écrit sous la dernière ligne :' },
        { type: 'dialogue', char: 'kaito', speaking: 'center', expr: 'smile', text: '« Nous continuerons à nous relire. »' },

        { type: 'narrate', text: 'La page reste blanche. Cette fois, le livre ne cherche pas à les corriger.' },

        { type: 'sprite', pos: 'left', char: null },
        { type: 'sprite', pos: 'center', char: null },
        { type: 'sprite', pos: 'right', char: null },
        { type: 'monologue', text: 'Une fin ne devient pas vraie\nparce qu’elle était écrite d’avance.\nElle devient vraie\nlorsque quelqu’un accepte d’en répondre.' },
        { type: 'end', label: 'FIN CACHÉE · Le Livre qui Écoute', next: 'title' },
      ]
    },

  } // end scenes
}; // end SCRIPT

/* ══════════════════════════════════════════════════════
   GAME ENGINE
══════════════════════════════════════════════════════ */
class GameEngine {
  constructor() {
    // ── State ────────────────────────────────────────
    this.currentScene    = null;
    this.currentStep     = 0;
    this.isTyping        = false;
    this.isAnimating     = false;
    this.autoMode        = false;
    this.autoTimer       = null;
    this.textSpeedMs     = 35;
    this.typingTimeout   = null;
    this.log             = [];
    this.affinity        = { mei: 0, ren: 0, kaito: 0, aoi: 0 };
    this.awaitingChoice  = false;

    // ── DOM refs ─────────────────────────────────────
    this.elBg          = document.getElementById('bg-image');
    this.elBgOverlay   = document.getElementById('bg-overlay');
    this.elRainFx      = document.getElementById('rain-effect');
    this.elSpeakerName = document.getElementById('speaker-name');
    this.elSpeakerTag  = document.getElementById('speaker-tag');
    this.elDialogText  = document.getElementById('dialogue-text');
    this.elTextCursor  = document.getElementById('text-cursor');
    this.elChoicesPanel= document.getElementById('choices-panel');
    this.elChoicesList = document.getElementById('choices-list');
    this.elMonoOverlay = document.getElementById('monologue-overlay');
    this.elMonoText    = document.getElementById('monologue-text');
    this.elBookOverlay = document.getElementById('book-overlay');
    this.elBookText    = document.getElementById('book-text');
    this.elTransition  = document.getElementById('transition-overlay');
    this.elChapter     = document.getElementById('chapter-label');
    this.elDialogBox   = document.getElementById('dialogue-box');
    this.sprites       = {
      left:   document.getElementById('sprite-left'),
      center: document.getElementById('sprite-center'),
      right:  document.getElementById('sprite-right'),
    };
    this.elGameScreen  = document.getElementById('game-screen');

    // ── Audio ─────────────────────────────────────────
    this.audio = new AudioManager();
    // Preload your audio files here:
    // this.audio.load('pluie_tatami',   'assets/audio/pluie_tatami.mp3');
    // this.audio.load('gare_minuit',    'assets/audio/gare_minuit.mp3');
    // this.audio.load('temple_brume',   'assets/audio/temple_brume.mp3');
    // this.audio.load('silence_clinique','assets/audio/silence_clinique.mp3');

    // ── Event bindings ────────────────────────────────
    this.elDialogBox.addEventListener('click', () => this.handleClick());
    this.elBookOverlay.addEventListener('click', () => this.hideBook());

    // Keyboard
    document.addEventListener('keydown', (e) => {
      if (e.code === 'Space' || e.code === 'Enter') this.handleClick();
      if (e.code === 'Escape') this.openMenu();
    });
  }

  /* ── Screen management ─────────────────────────── */
  showScreen(id) {
    document.querySelectorAll('.screen').forEach(s => {
      s.classList.remove('active');
      s.style.display = 'none';
      s.style.opacity = '0';
    });
    const screen = document.getElementById(id);
    screen.style.display = 'flex';
    requestAnimationFrame(() => {
      screen.classList.add('active');
      screen.style.opacity = '1';
    });
  }

  /* ── Start game ────────────────────────────────── */
  startGame() {
    this.showScreen('game-screen');
    this.clearAll();
    this.loadScene('prologue');
  }

  /* ── Load scene ────────────────────────────────── */
  loadScene(sceneId) {
    const scene = SCRIPT.scenes[sceneId];
    if (!scene) { console.error('Scene not found:', sceneId); return; }

    this.currentScene = scene;
    this.currentStep  = 0;
    this.awaitingChoice = false;

    // Music
    if (scene.music) this.audio.play(scene.music);

    // Rain
    if (scene.rain) this.elRainFx.classList.remove('hidden');
    else            this.elRainFx.classList.add('hidden');

    this.processStep();
  }

  /* ── Process current step ──────────────────────── */
  processStep() {
    if (this.awaitingChoice) return;
    const scene = this.currentScene;
    if (!scene || this.currentStep >= scene.steps.length) return;

    const step = scene.steps[this.currentStep];
    this.currentStep++;

    switch (step.type) {
      case 'bg':
        this.setBackground(step.bg);
        this.processStep();
        break;

      case 'rain':
        if (step.on) this.elRainFx.classList.remove('hidden');
        else         this.elRainFx.classList.add('hidden');
        this.processStep();
        break;

      case 'chapter':
        this.elChapter.textContent = step.text;
        this.processStep();
        break;

      case 'sprite':
        this.setSprite(step.pos, step.char, step.active, step.speaking, step.expr);
        this.processStep();
        break;

      case 'transition':
        this.doTransition(() => this.processStep());
        break;

      case 'goto':
        this.loadScene(step.scene);
        break;

      case 'narrate':
        this.showDialogue(null, step.text);
        break;

      case 'inner':
        this.showDialogue('inner', step.text);
        break;

      case 'dialogue':
        this.showDialogue(step.char, step.text, step.speaking, step.expr);
        break;

      case 'choice':
        this.showChoices(step);
        break;

      case 'book':
        this.showBook(step.text);
        break;

      case 'monologue':
        this.showMonologue(step.text);
        break;

      case 'end':
        this.showEnd(step.label, step.next);
        break;

      default:
        this.processStep();
    }
  }

  /* ── Background ────────────────────────────────── */
  setBackground(bgKey) {
    const src = SCRIPT.backgrounds[bgKey] || '';
    if (src) {
      this.elBg.style.opacity = '0';
      setTimeout(() => {
        this.elBg.src = src;
        this.elBg.style.opacity = '1';
      }, 300);
    } else {
      this.elBg.src = '';
      this.elBg.style.opacity = '0';
    }
  }

  /* ── Sprite source resolver ────────────────────── */
  // Returns the PNG path for charId + optional expression key.
  // Falls back to char.sprite (default image) if expr is absent or unknown.
  getSpriteSrc(charId, expr) {
    const char = SCRIPT.characters[charId];
    if (!char) return '';
    if (expr && char.expressions && char.expressions[expr]) {
      return char.expressions[expr];
    }
    return char.sprite || '';
  }

  /* ── Sprites ───────────────────────────────────── */
  // expr: optional expression key (e.g. 'argue', 'sad', 'thinking')
  setSprite(pos, charId, active = true, speaking = false, expr = null) {
    const el = this.sprites[pos];
    if (!el) return;

    // Reset all speaking states
    Object.values(this.sprites).forEach(s => s.classList.remove('speaking'));

    if (!charId || !active) {
      el.classList.remove('active', 'speaking');
      el.src = '';
      return;
    }

    const src = this.getSpriteSrc(charId, expr);
    if (!src) return;

    el.src = src;
    el.classList.add('active');

    if (speaking) {
      Object.values(this.sprites).forEach(s => s.classList.remove('speaking'));
      el.classList.add('speaking');
    }
  }

  /* ── Dialogue ──────────────────────────────────── */
  // expr: optional expression key — changes the sprite image of the speaking character
  showDialogue(charId, text, speakingPos = null, expr = null) {
    // Reset cursor
    this.elTextCursor.classList.remove('visible');

    if (charId === null || charId === undefined) {
      // Narration
      this.elSpeakerName.textContent = '';
      this.elSpeakerTag.textContent  = 'Narration';
      this.elSpeakerName.className   = 'char-narrator';
    } else {
      const char = SCRIPT.characters[charId];
      if (char) {
        this.elSpeakerName.textContent = char.name;
        this.elSpeakerTag.textContent  = char.tag;
        this.elSpeakerName.className   = char.cssClass;
      }
    }

    // Update speaking sprite + swap expression image if provided
    if (speakingPos) {
      Object.values(this.sprites).forEach(s => s.classList.remove('speaking'));
      const el = this.sprites[speakingPos];
      if (el) {
        el.classList.add('speaking');
        if (expr && charId) {
          const src = this.getSpriteSrc(charId, expr);
          if (src) el.src = src;
        }
      }
    }

    // Log
    const speakerLabel = charId ? (SCRIPT.characters[charId]?.name || 'Narration') : 'Narration';
    this.log.push({ speaker: speakerLabel, text });

    // Typewriter
    this.typewrite(text);
  }

  /* ── Typewriter effect ─────────────────────────── */
  typewrite(text) {
    this.elDialogText.textContent = '';
    this.isTyping = true;
    this.elTextCursor.classList.remove('visible');

    let i = 0;
    const tick = () => {
      if (i < text.length) {
        this.elDialogText.textContent += text[i];
        i++;
        this.typingTimeout = setTimeout(tick, this.textSpeedMs);
      } else {
        this.isTyping = false;
        this.elTextCursor.classList.add('visible');
        if (this.autoMode) {
          this.autoTimer = setTimeout(() => this.handleClick(), 2200);
        }
      }
    };
    tick();
  }

  /* ── Skip typing ───────────────────────────────── */
  skipTyping(text) {
    clearTimeout(this.typingTimeout);
    this.elDialogText.textContent = text;
    this.isTyping = false;
    this.elTextCursor.classList.add('visible');
    if (this.autoMode) {
      this.autoTimer = setTimeout(() => this.handleClick(), 2200);
    }
  }

  /* ── Handle click / advance ────────────────────── */
  handleClick() {
    if (this.awaitingChoice) return;
    if (this.isAnimating) return;

    clearTimeout(this.autoTimer);

    // If book overlay is open — handled by its own click
    if (!this.elBookOverlay.classList.contains('hidden')) return;

    // If monologue is showing — dismiss and continue
    if (!this.elMonoOverlay.classList.contains('hidden')) {
      this.elMonoOverlay.classList.add('hidden');
      this.processStep();
      return;
    }

    if (this.isTyping) {
      // Finish typing instantly
      const scene = this.currentScene;
      if (!scene) return;
      const prevStep = scene.steps[this.currentStep - 1];
      if (prevStep && prevStep.text) {
        this.skipTyping(prevStep.text);
      }
      return;
    }

    this.processStep();
  }

  /* ── Choices ───────────────────────────────────── */
  showChoices(step) {
    this.awaitingChoice = true;
    this.elChoicesList.innerHTML = '';
    document.getElementById('choices-label').textContent =
      step.label || '— Choisissez votre réponse —';

    step.options.forEach((opt, idx) => {
      const btn = document.createElement('button');
      btn.className = 'choice-btn';
      btn.innerHTML = `<span class="choice-tag">${opt.tag || idx+1}</span>${opt.text}`;
      btn.addEventListener('click', () => this.selectChoice(opt));
      this.elChoicesList.appendChild(btn);
    });

    this.elChoicesPanel.classList.remove('hidden');
  }

  selectChoice(opt) {
    this.elChoicesPanel.classList.add('hidden');
    this.awaitingChoice = false;

    // Apply affinity
    if (opt.affinity) {
      for (const [char, delta] of Object.entries(opt.affinity)) {
        this.affinity[char] = Math.min(100, Math.max(0, (this.affinity[char] || 0) + delta));
      }
      this.updateAffinityUI();
    }

    // Navigate
    if (opt.next) {
      this.loadScene(opt.next);
    } else {
      this.processStep();
    }
  }

  /* ── Affinity UI ───────────────────────────────── */
  updateAffinityUI() {
    for (const [char, val] of Object.entries(this.affinity)) {
      const fill = document.querySelector(`#aff-${char} .aff-fill`);
      if (fill) fill.style.width = `${val}%`;
    }
  }

  /* ── Book overlay ──────────────────────────────── */
  showBook(html) {
    this.elBookText.innerHTML = html;
    this.elBookOverlay.classList.remove('hidden');
    // Pause normal flow — click on book dismisses it
  }

  hideBook() {
    this.elBookOverlay.classList.add('hidden');
    this.processStep();
  }

  /* ── Monologue overlay ─────────────────────────── */
  showMonologue(text) {
    this.elMonoText.innerHTML = text.replace(/\n/g, '<br>');
    this.elMonoOverlay.classList.remove('hidden');
    // Click anywhere to dismiss (handled in handleClick)
  }

  /* ── Transition ────────────────────────────────── */
  doTransition(callback) {
    this.isAnimating = true;
    this.elTransition.classList.add('fade-in');
    setTimeout(() => {
      this.elTransition.classList.remove('fade-in');
      this.elTransition.classList.add('fade-out');
      if (callback) callback();
      setTimeout(() => {
        this.elTransition.classList.remove('fade-out');
        this.isAnimating = false;
      }, 600);
    }, 500);
  }

  /* ── End scene ─────────────────────────────────── */
  showEnd(label, next) {
    this.elSpeakerName.textContent = '';
    this.elSpeakerTag.textContent  = '';
    this.elDialogText.textContent  = '';
    this.elTextCursor.classList.remove('visible');

    // Clear sprites
    Object.values(this.sprites).forEach(s => {
      s.classList.remove('active', 'speaking');
      s.src = '';
    });

    // Show end monologue
    this.elMonoText.innerHTML = `<em>${label}</em>`;
    this.elMonoOverlay.classList.remove('hidden');

    setTimeout(() => {
      this.elMonoOverlay.classList.add('hidden');
      if (next === 'title') {
        setTimeout(() => this.backToTitle(), 800);
      }
    }, 4500);
  }

  /* ── Clear all UI ──────────────────────────────── */
  clearAll() {
    this.elDialogText.textContent = '';
    this.elSpeakerName.textContent = '';
    this.elSpeakerTag.textContent = '';
    this.elTextCursor.classList.remove('visible');
    this.elChoicesPanel.classList.add('hidden');
    this.elBookOverlay.classList.add('hidden');
    this.elMonoOverlay.classList.add('hidden');
    Object.values(this.sprites).forEach(s => {
      s.classList.remove('active','speaking');
      s.src = '';
    });
    this.elBg.src = '';
    this.elBg.style.opacity = '0';
    this.elRainFx.classList.add('hidden');
  }

  /* ── HUD controls ──────────────────────────────── */
  toggleAuto() {
    this.autoMode = !this.autoMode;
    document.getElementById('btn-auto').classList.toggle('active', this.autoMode);
    if (this.autoMode && !this.isTyping && !this.awaitingChoice) {
      this.autoTimer = setTimeout(() => this.handleClick(), 2200);
    } else {
      clearTimeout(this.autoTimer);
    }
  }

  skip() {
    clearTimeout(this.typingTimeout);
    clearTimeout(this.autoTimer);
    if (this.awaitingChoice) return;
    if (this.isTyping) {
      const scene = this.currentScene;
      const prevStep = scene?.steps[this.currentStep - 1];
      if (prevStep?.text) this.skipTyping(prevStep.text);
    } else {
      this.processStep();
    }
  }

  /* ── Menu ──────────────────────────────────────── */
  openMenu()  { document.getElementById('pause-menu').classList.remove('hidden'); }
  closeMenu() { document.getElementById('pause-menu').classList.add('hidden'); }

  /* ── Log ───────────────────────────────────────── */
  showLog() {
    const list = document.getElementById('log-list');
    list.innerHTML = '';
    this.log.slice(-60).forEach(entry => {
      const div = document.createElement('div');
      div.className = 'log-entry';
      div.innerHTML = `<span class="log-speaker">${entry.speaker}</span><span class="log-text">${entry.text}</span>`;
      list.appendChild(div);
    });
    list.scrollTop = list.scrollHeight;
    document.getElementById('log-panel').classList.remove('hidden');
  }
  hideLog() { document.getElementById('log-panel').classList.add('hidden'); }

  /* ── Config ─────────────────────────────────────── */
  showConfig()  { document.getElementById('config-panel').classList.remove('hidden'); }
  hideConfig()  { document.getElementById('config-panel').classList.add('hidden'); }
  setTextSpeed(v) { this.textSpeedMs = parseInt(v); }
  setMusicVol(v)  { this.audio.setVolume(parseInt(v)); }

  /* ── Save / Load ────────────────────────────────── */
  saveGame() {
    const saveData = {
      scene:    this.currentScene ? Object.keys(SCRIPT.scenes).find(k => SCRIPT.scenes[k] === this.currentScene) : null,
      step:     this.currentStep,
      affinity: this.affinity,
      log:      this.log.slice(-100),
    };
    try {
      localStorage.setItem('lvp_save', JSON.stringify(saveData));
      this.showToast('Partie sauvegardée.');
    } catch(e) {
      this.showToast('Erreur de sauvegarde.');
    }
    this.closeMenu();
  }

  loadGame() {
    try {
      const raw = localStorage.getItem('lvp_save');
      if (!raw) { this.showToast('Aucune sauvegarde trouvée.'); return; }
      const data = JSON.parse(raw);
      this.affinity = data.affinity || { mei:0, ren:0, kaito:0, aoi:0 };
      this.log      = data.log || [];
      this.updateAffinityUI();
      this.closeMenu();
      this.showScreen('game-screen');
      this.clearAll();
      if (data.scene && SCRIPT.scenes[data.scene]) {
        this.loadScene(data.scene);
      }
    } catch(e) {
      this.showToast('Erreur de chargement.');
    }
  }

  backToTitle() {
    this.closeMenu();
    this.audio.stop();
    this.clearAll();
    this.showScreen('title-screen');
    this.currentScene = null;
    this.currentStep  = 0;
    this.affinity     = { mei: 0, ren: 0, kaito: 0, aoi: 0 };
  }

  /* ── Toast notification ─────────────────────────── */
  showToast(msg) {
    let toast = document.getElementById('vn-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'vn-toast';
      toast.style.cssText = `
        position:fixed; bottom:2rem; left:50%; transform:translateX(-50%);
        background:rgba(10,10,18,0.92); border:1px solid rgba(200,168,106,0.3);
        color:var(--paper-warm); font-family:var(--font-sans); font-size:0.75rem;
        padding:0.6rem 1.5rem; letter-spacing:0.1em; z-index:200;
        opacity:0; transition:opacity 0.3s ease;
      `;
      document.body.appendChild(toast);
    }
    toast.textContent = msg;
    toast.style.opacity = '1';
    setTimeout(() => toast.style.opacity = '0', 2500);
  }
}

/* ══════════════════════════════════════════════════════
   INIT
══════════════════════════════════════════════════════ */
let game;

document.addEventListener('DOMContentLoaded', () => {
  // Start rain canvas on title screen
  // Rain canvas disabled — title uses clean gradient background
  // const canvas = document.getElementById('rain-canvas');
  // if (canvas) new RainCanvas(canvas);

  // Boot engine
  game = new GameEngine();

  // Fade in title
  const titleScreen = document.getElementById('title-screen');
  titleScreen.style.display = 'flex';
  requestAnimationFrame(() => {
    titleScreen.classList.add('active');
    titleScreen.style.opacity = '1';
  });
});