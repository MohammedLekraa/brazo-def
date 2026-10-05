document.addEventListener('DOMContentLoaded', () => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');

  /* Imatges que falten: es marquen en lloc de mostrar la icona trencada */
  $$('img').forEach(i => {
    const mark = () => i.setAttribute('data-missing', '');
    i.addEventListener('error', mark);
    if (i.complete && !i.naturalWidth && i.getAttribute('src')) mark();
  });

  /* Vídeo: avís si falta el fitxer */
  const vsrc = $('.vwrap source');
  if (vsrc) vsrc.addEventListener('error', () => { $('.vmiss').hidden = false; });

  /* Barra de progrés */
  const bar = $('#progress');
  const onScroll = () => {
    const h = document.documentElement.scrollHeight - innerHeight;
    bar.style.width = (h > 0 ? scrollY / h * 100 : 0) + '%';
  };
  addEventListener('scroll', onScroll, { passive: true }); onScroll();

  /* Índex lateral */
  const links = $$('.side-in a');
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) links.forEach(l => l.classList.toggle('active', l.getAttribute('href') === '#' + e.target.id));
  }), { rootMargin: '-30% 0px -60% 0px' });
  $$('section[id]').forEach(s => io.observe(s));

  /* Aparició escalonada de cada apartat */
  $$('section > *').forEach(el => el.classList.add('rv'));
  const rv = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return;
    rv.unobserve(e.target);
    e.target.classList.add('in');
    [...e.target.children].forEach((c, i) => { c.style.transitionDelay = Math.min(i, 8) * 70 + 'ms'; c.classList.add('in'); });
  }), { threshold: .04 });
  $$('section').forEach(s => rv.observe(s));

  /* Acordions */
  $$('.acc-h').forEach(b => b.addEventListener('click', () => b.parentElement.classList.toggle('open')));

  /* Pestanyes genèriques */
  const tabs = root => {
    const bs = $$(':scope > .tabs .tab', root), ps = $$(':scope > .tp', root);
    const go = k => { bs.forEach(b => b.classList.toggle('on', b.dataset.k === k)); ps.forEach(p => p.classList.toggle('on', p.dataset.p === k)); };
    bs.forEach(b => b.addEventListener('click', () => go(b.dataset.k)));
    return go;
  };
  const tabRoots = $$('[data-tabs]');
  const tabGo = tabRoots.map(tabs);

  /* Passos (stepper) */
  const stepper = root => {
    const nav = $$('.st-nav button', root), ps = $$('.st-p', root), fill = $('.st-bar i', root), prev = $('.st-prev', root), next = $('.st-next', root);
    let i = 0;
    const go = k => {
      i = Math.max(0, Math.min(ps.length - 1, k));
      nav.forEach((b, j) => { b.classList.toggle('on', j === i); b.classList.toggle('done', j < i); });
      ps.forEach((p, j) => p.classList.toggle('on', j === i));
      fill.style.width = (i + 1) / ps.length * 100 + '%';
      prev.disabled = i === 0; next.disabled = i === ps.length - 1;
    };
    nav.forEach((b, j) => b.addEventListener('click', () => go(j)));
    prev.addEventListener('click', () => go(i - 1)); next.addEventListener('click', () => go(i + 1));
    go(0);
  };
  stepper($('#imu-st'));

  /* PCB: del disseny a la placa soldada */
  const PCB = {
    g: [
      ['Esquema de connexions', "Primer es va muntar el circuit en una protoboard i es va dibuixar a Fritzing: els cinc flex sensors, cadascun amb la seva resistència de 47 kΩ, i la IMU connectada a la Wemos.", 'img/fritzing-guante.jpg'],
      ['Esquema elèctric a KiCad', "L'esquema es va passar a KiCad. Mostra els cinc divisors de tensió, els connectors dels sensors i el connector de nou pins cap a la Wemos.", 'img/kicad-esq-guante.jpg'],
      ['Enrutat de pistes', "S'assignen els footprints i es tracen les pistes entre connectors i resistències, buscant les connexions més simples. A la segona versió les pistes són més amples.", 'img/kicad-guante.jpg'],
      ['Placa fabricada i soldada', "Es va fabricar la placa i es van soldar a mà les resistències i els connectors. És la placa definitiva, amb els cables connectats.", 'img/pcb-guante.jpg']
    ],
    b: [
      ['Esquema de connexions', "A Fritzing, cada servo va a un pin PWM de la Wemos, l'alimentació dels servos és comuna i totes les masses estan unides. Una protoboard distribueix l'alimentació i els senyals.", 'img/fritzing-brazo.jpg'],
      ['Esquema elèctric a KiCad', "Els sis servos comparteixen alimentació i massa, i la senyal PWM de cadascun va a una sortida de la Wemos. S'hi afegeix un condensador de desacoblament.", 'img/kicad-esq-brazo.jpg'],
      ['Enrutat de pistes', "Les pistes d'alimentació i massa són comunes als sis servos, i les línies de control surten del connector de la Wemos.", 'img/kicad-brazo.jpg'],
      ['Placa fabricada i soldada', "Placa final amb els connectors dels sis servos, el condensador i la borna d'alimentació, connectada a la Wemos.", 'img/pcb-brazo-2.jpg']
    ]
  };
  Object.entries(PCB).forEach(([k, steps]) => {
    const root = $('#pcb-' + k);
    root.innerHTML = `<div class="st-nav">${steps.map((s, i) => `<button>${i + 1} ${s[0]}</button>`).join('')}</div><div class="st-bar"><i></i></div>` +
      steps.map((s, i) => `<div class="st-p"><div class="pcbs"><figure class="fig" style="margin:0"><img class="zoom" src="${s[2]}" alt="${s[0]}"></figure><div><h4>Pas ${i + 1}: ${s[0]}</h4><p>${s[1]}</p></div></div></div>`).join('') +
      '<div class="st-ctl"><button class="btn st-prev">&larr; Anterior</button><button class="btn st-next">Següent &rarr;</button></div>';
    stepper(root);
  });

  /* Diseny mecànic: targetes i detall */
  const MD = [
    { t: 'Antebraç InMoov', h: "<p>Es va partir de models 3D ja existents, una estratègia habitual en prototipatge ràpid que redueix el temps de desenvolupament i permet centrar l'esforç en la integració. Entre els dissenys de braços antropomòrfics de repositoris oberts com Thingiverse, InMoov va destacar pel detall, la documentació i una estructura pensada per a projectes experimentals.</p><p>L'antebraç té una estructura sòlida, amb allotjaments per als servomotors, passos interns per als fils que mouen els dits i una articulació que permet girar el canell. La mà original, en canvi, és molt complexa: moltes peces i un muntatge delicat. Segons l'experiència d'altres estudiants i de l'associació universitària URBots, és difícil de muntar i es desajusta amb l'ús prolongat.</p>", im: [['img/inmoov.jpg', "Peces d'InMoov"], ['img/muneca.jpg', "Mecanisme de rotació del canell d'InMoov"]] },
    { t: 'Mà FlexyHand', h: "<p>Com a alternativa es va escollir una mà de construcció més senzilla, amb menys peces, que facilita el muntatge i el manteniment. Està inspirada en FlexyHand i es basa en frontisses flexibles (<i>living hinges</i>) que permeten flexionar els dits, juntament amb un sistema de transmissió del moviment des dels servos.</p><p>Té un inconvenient: no incorpora una rotació de canell funcional i no està pensada per integrar-se amb l'antebraç d'InMoov. La seva base és plana, mentre que InMoov usa una unió cilíndrica amb un eix passant que permet la rotació. No es podien unir directament sense modificar el disseny.</p>", im: [['img/brainyhand.jpg', 'Mà FlexyHand impresa']] },
    { t: 'Redisseny a Fusion 360', h: "<p>Per resoldre la incompatibilitat es va redissenyar la unió amb Fusion 360, per integrar la mà amb l'antebraç sense perdre la rotació del canell.</p><ol><li>Es van analitzar les dimensions i la geometria de la peça de canell original d'InMoov: punts d'unió, diàmetre de l'eix i separació entre suports.</li><li>Es van prendre aquestes referències com a base per redissenyar la peça d'unió de la mà.</li><li>Es va modelar una nova peça base per a la mà, replicant distàncies, forats i volums per acoblar-se al canell d'InMoov.</li><li>Es va adaptar la geometria de la mà perquè encaixés amb la peça nova, mantenint l'orientació i l'ergonomia.</li></ol><p>El resultat és una peça híbrida que uneix de manera robusta les dues parts.</p>", im: [['img/fusion.jpg', 'Disseny original (esquerra) i modificat amb ancoratge (dreta)']] },
    { t: 'Braç ensamblat', h: "<p>Les peces redissenyades es van imprimir en 3D i després es van fer ajustos manuals d'encaix i alineació. Gairebé tot el braç és de PLA, un material rígid, fàcil d'imprimir i estable. Les frontisses dels dits es van imprimir en TPU, i els dits es mouen amb fil de niló d'alta resistència.</p><p>Les primeres frontisses de TPU eren massa rígides i els dits no es tancaven del tot. Es van provar Filaflex, massa tou, i un TPU més dur, car i encara rígid. El problema era el farciment: imprimint el TPU amb farciment baix es va aconseguir tancar els dits i que tornin a la posició inicial.</p><p>Es van usar sis servos digitals DM996 de 15 kg·cm, cinc a la part posterior de l'avantbraç per als dits i un al canell, que acciona la rotació directament amb engranatges.</p><dl class=\"specs\"><div><dt>Estructura</dt><dd>PLA</dd></div><div><dt>Frontisses</dt><dd>TPU, farciment baix</dd></div><div><dt>Tendons</dt><dd>Fil de niló</dd></div><div><dt>Servos</dt><dd>6 × DM996 (15 kg·cm)</dd></div><div><dt>Impressora</dt><dd>[Model d'impressora]</dd></div></dl>", im: [['img/brazo.jpg', 'Braç ensamblat'], ['img/bisagras.jpg', 'Frontisses flexibles dels dits']] }
  ];
  const mdet = $('#mdet');
  const showMech = i => {
    $$('.mc').forEach((c, j) => c.classList.toggle('on', j === i));
    const d = MD[i];
    mdet.innerHTML = `<div><h3>${d.t}</h3>${d.h}</div><div class="mimgs">${d.im.map(m => `<figure class="fig" style="margin:0;padding:0"><img class="zoom" src="${m[0]}" alt="${m[1]}"><figcaption class="mono">${m[1]}</figcaption></figure>`).join('')}</div>`;
    mdet.classList.remove('sw'); void mdet.offsetWidth; mdet.classList.add('sw');
    $$('img', mdet).forEach(im => im.addEventListener('error', () => im.setAttribute('data-missing', '')));
  };
  $$('.mc').forEach((c, i) => c.addEventListener('click', () => showMech(i)));
  showMech(0);

  /* Guant amb fletxes i etiquetes */
  const CO = [
    { k: 'flex', b: 'Sensors de flexió', t: 'Mesura del grau de flexió dels dits.', x: 63, y: 2, w: 35, d: 'M815 98 C850 140 825 180 790 212' },
    { k: 'imu', b: 'IMU MPU6050', t: 'Mesura de la rotació del canell.', x: 40, y: 83, w: 33, d: 'M590 428 C530 380 560 320 580 262' },
    { k: 'caixa', b: "Caixa d'electrònica", t: 'Microcontrolador, pila i PCB.', x: 2, y: 83, w: 33, d: 'M190 428 C190 395 225 360 262 336' }
  ];
  const g = $('#glove');
  g.insertAdjacentHTML('beforeend', `<svg viewBox="0 0 1000 520" aria-hidden="true"><defs><marker id="ah" markerWidth="12" markerHeight="12" refX="9" refY="6" orient="auto" markerUnits="userSpaceOnUse"><path d="M0,0 L12,6 L0,12 z" fill="#a8a49a"/></marker></defs>${CO.map(c => `<path data-k="${c.k}" d="${c.d}" marker-end="url(#ah)"/>`).join('')}</svg>`);
  CO.forEach(c => g.insertAdjacentHTML('beforeend', `<button class="cb" data-k="${c.k}" style="left:${c.x}%;top:${c.y}%;width:${c.w}%"><b>${c.b}</b>${c.t}</button>`));
  $$('path', g).forEach(p => { const l = Math.ceil(p.getTotalLength()); p.style.setProperty('--l', l); });
  const hl = (k, on) => $$('[data-k]', g).forEach(e => e.classList.toggle('hl', on && e.dataset.k === k));
  $$('.cb', g).forEach(b => {
    b.addEventListener('mouseenter', () => hl(b.dataset.k, true)); b.addEventListener('mouseleave', () => hl(b.dataset.k, false));
    b.addEventListener('focus', () => hl(b.dataset.k, true)); b.addEventListener('blur', () => hl(b.dataset.k, false));
    b.addEventListener('click', () => tabGo[0](b.dataset.k));
  });

  /* Gràfics del sensor de flexió */
  if (window.Chart) {
    Chart.defaults.font.family = "'JetBrains Mono',monospace"; Chart.defaults.font.size = 11; Chart.defaults.color = '#6b675c'; Chart.defaults.borderColor = '#e5e3dc';
    const ink = '#141414', sand = '#cfc8b8', ang = [0, 45, 90, 135, 180];
    const axis = (x, y) => ({ plugins: { legend: { display: false } }, scales: { x: { title: { display: true, text: x } }, y: { title: { display: true, text: y } } } });
    new Chart($('#chart'), { type: 'line', data: { labels: ang, datasets: [{ data: [2317, 2143, 1993, 1824, 1633], borderColor: ink, backgroundColor: ink, tension: .2, pointRadius: 5 }] }, options: axis('Angle del dit (°)', 'Lectura ADC') });
    const D = { r: [36066, 42811, 49570, 58518, 70860], v: [1.87, 1.73, 1.61, 1.47, 1.32] }, L = { r: 'Rflex (Ω)', v: 'Vout (V)' };
    const multi = new Chart($('#c-multi'), { type: 'line', data: { labels: ang, datasets: [{ data: D.r, borderColor: ink, backgroundColor: ink, tension: .2, pointRadius: 5 }] }, options: axis('Angle del dit (°)', L.r) });
    $$('#ctabs .tab').forEach(b => b.addEventListener('click', () => {
      $$('#ctabs .tab').forEach(x => x.classList.toggle('on', x === b));
      multi.data.datasets[0].data = D[b.dataset.k]; multi.options.scales.y.title.text = L[b.dataset.k]; multi.update();
    }));
    new Chart($('#c-rf'), { type: 'bar', data: { labels: ['10 kΩ', '47 kΩ'], datasets: [{ data: [310, 700], backgroundColor: [sand, ink] }] }, options: axis('Resistència fixa', 'Variació de la lectura ADC') });
    new Chart($('#c-cal'), { type: 'bar', data: { labels: ['Polze', 'Índex', 'Cor', 'Anular', 'Menyic'], datasets: [{ data: [[1530, 2100], [1530, 2100], [1700, 2300], [1650, 2100], [1730, 2000]], backgroundColor: ink, borderSkipped: false }] },
      options: { indexAxis: 'y', plugins: { legend: { display: false } }, scales: { x: { min: 1400, max: 2400, title: { display: true, text: 'Lectura ADC (de minFlex a maxFlex)' } } } } });
  }

  /* Calculadora map() */
  const adc = $('#adc');
  const calc = () => { const x = +adc.value; $('#adc-v').textContent = x; $('#adc-a').textContent = Math.trunc((x - 1530) * (0 - 180) / (2100 - 1530)) + 180; };
  adc.addEventListener('input', calc); calc();

  /* Trama Bluetooth */
  const F = [
    ['flex1', 'Dit polze', "Lectura de l'ADC del sensor del polze. Cada valor és la mitjana de 8 mostres i només s'envia si és vàlid (entre 1000 i 3000); si no ho és, es repeteix l'últim valor correcte."],
    ['flex2', 'Dit índex', "Lectura de l'ADC del sensor de l'índex, amb el mateix tractament. Al braç es converteix en angle amb els valors de calibratge d'aquest dit."],
    ['flex3', 'Dit cor', "Lectura de l'ADC del sensor del dit cor. Cada dit té el seu propi rang de calibratge perquè els sensors no es comporten igual."],
    ['flex4', 'Dit anular', "Lectura de l'ADC del sensor de l'anular. El receptor la limita entre 0° i 180° abans de moure el servo."],
    ['flex5', 'Dit menyic', "Lectura de l'ADC del sensor del menyic. Els cinc valors de flexió ocupen les cinc primeres posicions de la trama."],
    ['angle roll', 'Rotació del canell', "Angle del canell calculat amb la IMU i el filtre complementari, amb l'unwrapping aplicat. Ja arriba limitat i escalat al rang del servo (0–180°), de manera que el braç només l'ha d'aplicar."]
  ];
  const fr = $('#frame');
  fr.innerHTML = F.map((f, i) => `<button data-i="${i}">&lt;${f[0]}&gt;</button>`).join('');
  const showF = i => {
    $$('button', fr).forEach((b, j) => b.classList.toggle('on', j === i));
    $('#fdet').innerHTML = `<h4>${F[i][1]}</h4><p>${F[i][2]}</p>`;
  };
  $$('button', fr).forEach((b, i) => b.addEventListener('click', () => showF(i)));
  showF(0);

  /* Materials: cerca, categories i preus editables */
  const parts = [
    ['Wemos D1 R32 (ESP32)', 'Electrònica', 2, 10.5], ['MPU6050 (GY-521)', 'Electrònica', 1, 3.5],
    ['Flex sensor FS-L-0055-253-ST', 'Electrònica', 5, 14], ['Resistència 47 kΩ', 'Electrònica', 5, .05],
    ['Condensador de desacoblament', 'Electrònica', 1, .3], ['Placa de coure per a PCB', 'Electrònica', 2, 3],
    ['Servo digital DM996 15 kg·cm', 'Actuació', 6, 9], ['Fil de niló per als tendons', 'Actuació', 1, 4],
    ['Bateria Li-ion 18650', 'Alimentació', 2, 5], ['Portabateries 2 × 18650', 'Alimentació', 1, 1.5],
    ['Bateria Li-ion 5500 mAh (guant)', 'Alimentació', 1, 15], ['Font de laboratori Promax FAC-363B', 'Alimentació', 1, 0],
    ['Filament PLA (1 kg)', 'Fabricació', 1, 20], ['Filament TPU (1 kg)', 'Fabricació', 1, 25], ['Guant', 'Fabricació', 1, 5]
  ];
  let prices = null; try { prices = JSON.parse(localStorage.getItem('prices')); } catch {}
  if (!Array.isArray(prices) || prices.length !== parts.length) prices = parts.map(p => p[3]);
  const norm = s => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  const eur = v => v.toLocaleString('ca-ES', { style: 'currency', currency: 'EUR' });
  let cat = 'Totes';
  $('#chips').innerHTML = ['Totes', ...new Set(parts.map(p => p[1]))].map(c => `<button class="chip${c === cat ? ' on' : ''}">${c}</button>`).join('');
  const tb = $('#mt tbody');
  tb.innerHTML = parts.map((p, i) => `<tr data-i="${i}"><td>${esc(p[0])}</td><td><span class="pill">${p[1]}</span></td><td>${p[2]}</td><td><input type="number" min="0" step="0.01" value="${prices[i]}" aria-label="Preu de ${esc(p[0])}"></td><td class="sb"></td></tr>`).join('') + '<tr id="none" hidden><td colspan="5">Cap component coincideix amb la cerca.</td></tr>';
  const rows = $$('tr[data-i]', tb);
  function upd() {
    const q = norm($('#q').value); let tot = 0, n = 0, all = 0;
    rows.forEach(r => {
      const i = +r.dataset.i, p = parts[i], sub = p[2] * (+prices[i] || 0); all += sub;
      $('.sb', r).textContent = eur(sub);
      const show = (cat === 'Totes' || p[1] === cat) && norm(p[0] + ' ' + p[1]).includes(q);
      r.hidden = !show; if (show) { tot += sub; n++; }
    });
    $('#none').hidden = n > 0; $('#tot').textContent = eur(tot); $('#grand').textContent = eur(all);
  }
  $('#q').addEventListener('input', upd);
  $('#chips').addEventListener('click', e => { if (!e.target.matches('.chip')) return; cat = e.target.textContent; $$('.chip').forEach(c => c.classList.toggle('on', c === e.target)); upd(); });
  tb.addEventListener('input', e => {
    const r = e.target.closest('tr[data-i]'); if (!r) return;
    prices[+r.dataset.i] = e.target.value; try { localStorage.setItem('prices', JSON.stringify(prices)); } catch {} upd();
  });
  addEventListener('keydown', e => { if (e.key === '/' && !['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) { e.preventDefault(); $('#q').focus(); } });
  upd();

  /* Visor amb zoom i arrossegament */
  const lb = $('#lb'), li = $('#lb-img');
  let s = 1, x = 0, y = 0, drag = false, sx = 0, sy = 0;
  const draw = () => li.style.transform = `translate(${x}px,${y}px) scale(${s})`;
  const close = () => lb.hidden = true;
  document.addEventListener('click', e => { const i = e.target.closest('img.zoom'); if (!i || i.hasAttribute('data-missing')) return; li.src = i.src; li.alt = i.alt; s = 1; x = y = 0; draw(); lb.hidden = false; });
  $('#lb-x').addEventListener('click', close);
  lb.addEventListener('click', e => { if (e.target === lb) close(); });
  addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
  lb.addEventListener('wheel', e => {
    e.preventDefault();
    s = Math.min(4, Math.max(1, s + (e.deltaY < 0 ? .2 : -.2)));
    if (s === 1) x = y = 0;
    draw();
  }, { passive: false });
  li.addEventListener('pointerdown', e => { drag = true; sx = e.clientX - x; sy = e.clientY - y; li.setPointerCapture(e.pointerId); });
  li.addEventListener('pointermove', e => { if (drag) { x = e.clientX - sx; y = e.clientY - sy; draw(); } });
  li.addEventListener('pointerup', () => drag = false);
});
