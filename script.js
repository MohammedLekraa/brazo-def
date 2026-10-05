document.addEventListener('DOMContentLoaded', () => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const store = { get: k => { try { return localStorage.getItem(k); } catch { return null; } }, set: (k, v) => { try { localStorage.setItem(k, v); } catch {} } };
  let lang = store.get('lang') === 'es' ? 'es' : 'en', theme = store.get('theme') === 'dark' ? 'dark' : 'light';
  const T = (a) => a[lang === 'es' ? 1 : 0];
  const UI = { title: ['Robotic Arm Control Using a Sensor Glove | ML Portfolio', 'Control de un brazo robótico mediante un guante sensorizado | ML Portfolio'], night: ['Night view', 'Vista nocturna'], day: ['Day view', 'Vista diurna'], search: ['Search a component by name', 'Busca un componente por nombre'], all: ['All', 'Todos'], none: ['No component matches the search.', 'Ningún componente coincide con la búsqueda.'] };

  /* Imágenes que faltan y vídeo */
  $$('img').forEach(i => { const m = () => i.setAttribute('data-missing', ''); i.addEventListener('error', m); if (i.complete && !i.naturalWidth && i.getAttribute('src')) m(); });
  const vs = $('.vwrap source'); if (vs) vs.addEventListener('error', () => { $('.vmiss').hidden = false; });

  /* Progreso, flecha de scroll e índice */
  const bar = $('#progress'), hint = $('.scrollhint');
  const onScroll = () => { const h = document.documentElement.scrollHeight - innerHeight; bar.style.width = (h > 0 ? scrollY / h * 100 : 0) + '%'; hint.classList.toggle('gone', scrollY > 80); };
  addEventListener('scroll', onScroll, { passive: true }); onScroll();
  const links = $$('.side-in a');
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) links.forEach(l => l.classList.toggle('active', l.getAttribute('href') === '#' + e.target.id)); }), { rootMargin: '-30% 0px -60% 0px' });
  $$('section[id]').forEach(s => io.observe(s));

  /* Aparición escalonada */
  $$('section > *').forEach(el => el.classList.add('rv'));
  const rv = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return; rv.unobserve(e.target); e.target.classList.add('in');
    [...e.target.children].forEach((c, i) => { c.style.transitionDelay = Math.min(i, 8) * 70 + 'ms'; c.classList.add('in'); });
  }), { threshold: .04 });
  $$('section').forEach(s => rv.observe(s));

  /* Acordeones, pestañas y pasos */
  $$('.acc-h').forEach(b => b.addEventListener('click', () => b.parentElement.classList.toggle('open')));
  const tabs = root => {
    const bs = $$(':scope > .tabs .tab', root), ps = $$(':scope > .tp', root);
    const go = k => { bs.forEach(b => b.classList.toggle('on', b.dataset.k === k)); ps.forEach(p => p.classList.toggle('on', p.dataset.p === k)); };
    bs.forEach(b => b.addEventListener('click', () => go(b.dataset.k))); return go;
  };
  const tabGo = $$('[data-tabs]').map(tabs);
  const stepper = root => {
    const nav = $$('.st-nav button', root), ps = $$('.st-p', root), fill = $('.st-bar i', root), prev = $('.st-prev', root), next = $('.st-next', root); let i = 0;
    const go = k => {
      i = Math.max(0, Math.min(ps.length - 1, k));
      nav.forEach((b, j) => { b.classList.toggle('on', j === i); b.classList.toggle('done', j < i); });
      ps.forEach((p, j) => p.classList.toggle('on', j === i));
      fill.style.width = (i + 1) / ps.length * 100 + '%'; prev.disabled = i === 0; next.disabled = i === ps.length - 1;
    };
    nav.forEach((b, j) => b.addEventListener('click', () => go(j))); prev.addEventListener('click', () => go(i - 1)); next.addEventListener('click', () => go(i + 1)); go(0);
  };
  stepper($('#imu-st'));

  /* PCB: del diseño a la placa soldada */
  const PCB = {
    g: [
      [['Connection diagram', 'Esquema de conexiones'], ['First the circuit was assembled on a breadboard and drawn in Fritzing: the five flex sensors, each with its 47 kΩ resistor, and the IMU wired to the Wemos.', 'Primero se montó el circuito en una protoboard y se dibujó en Fritzing: los cinco sensores de flexión, cada uno con su resistencia de 47 kΩ, y la IMU conectada a la Wemos.'], 'img/fritzing-guante.jpg'],
      [['Schematic in KiCad', 'Esquema eléctrico en KiCad'], ['The diagram was moved to KiCad. It shows the five voltage dividers, the sensor connectors and the nine-pin connector to the Wemos.', 'El esquema se pasó a KiCad. Muestra los cinco divisores de tensión, los conectores de los sensores y el conector de nueve pines hacia la Wemos.'], 'img/kicad-esq-guante.jpg'],
      [['Track routing', 'Enrutado de pistas'], ['Footprints are assigned and the tracks between connectors and resistors are routed, looking for the simplest connections. In the second version the tracks are wider.', 'Se asignan los footprints y se trazan las pistas entre conectores y resistencias, buscando las conexiones más simples. En la segunda versión las pistas son más anchas.'], 'img/kicad-guante.jpg'],
      [['Fabricated and soldered board', 'Placa fabricada y soldada'], ['The board was fabricated and the resistors and connectors were hand-soldered. This is the final board with the wires attached.', 'Se fabricó la placa y se soldaron a mano las resistencias y los conectores. Es la placa definitiva, con los cables conectados.'], 'img/pcb-guante.jpg']
    ],
    b: [
      [['Connection diagram', 'Esquema de conexiones'], ['In Fritzing, each servo goes to a PWM pin of the Wemos, the servo power is common and all grounds are joined. A breadboard distributes power and signals.', 'En Fritzing, cada servo va a un pin PWM de la Wemos, la alimentación de los servos es común y todas las masas están unidas. Una protoboard distribuye la alimentación y las señales.'], 'img/fritzing-brazo.jpg'],
      [['Schematic in KiCad', 'Esquema eléctrico en KiCad'], ['The six servos share power and ground, and each PWM signal goes to a Wemos output. A decoupling capacitor is added.', 'Los seis servos comparten alimentación y masa, y la señal PWM de cada uno va a una salida de la Wemos. Se añade un condensador de desacoplo.'], 'img/kicad-esq-brazo.jpg'],
      [['Track routing', 'Enrutado de pistas'], ['Power and ground tracks are common to the six servos, and the control lines leave from the Wemos connector.', 'Las pistas de alimentación y masa son comunes a los seis servos, y las líneas de control salen del conector de la Wemos.'], 'img/kicad-brazo.jpg'],
      [['Fabricated and soldered board', 'Placa fabricada y soldada'], ['Final board with the six servo connectors, the capacitor and the power terminal, connected to the Wemos.', 'Placa final con los conectores de los seis servos, el condensador y la borna de alimentación, conectada a la Wemos.'], 'img/pcb-brazo-2.jpg']
    ]
  };
  const renderPCB = () => Object.entries(PCB).forEach(([k, st]) => {
    const r = $('#pcb-' + k), pre = lang === 'es' ? 'Paso' : 'Step';
    r.innerHTML = `<div class="st-nav">${st.map((s, i) => `<button>${i + 1} ${T(s[0])}</button>`).join('')}</div><div class="st-bar"><i></i></div>` +
      st.map((s, i) => `<div class="st-p"><div class="pcbs"><figure class="fig" style="margin:0"><img class="zoom" src="${s[2]}" alt="${T(s[0])}"></figure><div><h4>${pre} ${i + 1}: ${T(s[0])}</h4><p>${T(s[1])}</p></div></div></div>`).join('') +
      `<div class="st-ctl"><button class="btn st-prev">&larr; ${lang === 'es' ? 'Anterior' : 'Previous'}</button><button class="btn st-next">${lang === 'es' ? 'Siguiente' : 'Next'} &rarr;</button></div>`;
    $$('img', r).forEach(i => i.addEventListener('error', () => i.setAttribute('data-missing', ''))); stepper(r);
  });

  /* Diseño mecánico */
  const MD = [
    { t: ['InMoov forearm', 'Antebrazo InMoov'], h: [
      '<p>Existing 3D models were used as a starting point, a common rapid-prototyping strategy that shortens development and lets the effort focus on integration. Among the open arm designs on repositories such as Thingiverse, InMoov stood out for its detail, documentation and a structure meant for experimental projects.</p><p>The forearm is solid, with housings for the servos, internal channels for the threads that move the fingers and a joint that allows wrist rotation. The original hand, however, is very complex: many parts and a delicate assembly. According to other students and the university association URBots, it is hard to assemble and loosens with prolonged use.</p>',
      '<p>Se partió de modelos 3D ya existentes, una estrategia habitual en prototipado rápido que reduce el tiempo de desarrollo y permite centrar el esfuerzo en la integración. Entre los diseños de brazos de repositorios abiertos como Thingiverse, InMoov destacó por su detalle, su documentación y una estructura pensada para proyectos experimentales.</p><p>El antebrazo es sólido, con alojamientos para los servos, pasos internos para los hilos que mueven los dedos y una articulación que permite girar la muñeca. La mano original, en cambio, es muy compleja: muchas piezas y un montaje delicado. Según otros estudiantes y la asociación universitaria URBots, es difícil de montar y se desajusta con el uso prolongado.</p>'],
      im: [['img/inmoov.jpg', ['InMoov parts', 'Piezas de InMoov']], ['img/muneca.jpg', ['InMoov wrist rotation mechanism', 'Mecanismo de rotación de la muñeca de InMoov']]] },
    { t: ['FlexyHand hand', 'Mano FlexyHand'], h: [
      '<p>As an alternative, a hand with simpler construction and fewer parts was chosen, easier to assemble and maintain. It is inspired by FlexyHand and relies on flexible hinges (<i>living hinges</i>) that let the fingers bend, plus a system that transmits the motion from the servos.</p><p>Its drawback: it has no working wrist rotation and is not designed to fit the InMoov forearm. Its base is flat, whereas InMoov uses a cylindrical joint with a through axis. They could not be joined without modifying the design.</p>',
      '<p>Como alternativa se eligió una mano de construcción más sencilla, con menos piezas, que facilita el montaje y el mantenimiento. Está inspirada en FlexyHand y se basa en bisagras flexibles (<i>living hinges</i>) que permiten flexionar los dedos, junto con un sistema que transmite el movimiento desde los servos.</p><p>Tiene un inconveniente: no incorpora una rotación de muñeca funcional y no está pensada para integrarse con el antebrazo de InMoov. Su base es plana, mientras que InMoov usa una unión cilíndrica con un eje pasante. No se podían unir directamente sin modificar el diseño.</p>'],
      im: [['img/brainyhand.jpg', ['FlexyHand printed', 'Mano FlexyHand impresa']]] },
    { t: ['Redesign in Fusion 360', 'Rediseño en Fusion 360'], h: [
      '<p>To solve the incompatibility, the joint was redesigned in Fusion 360 to integrate the hand with the forearm without losing wrist rotation.</p><ol><li>The size and geometry of the original InMoov wrist part were analysed: joining points, axis diameter and support spacing.</li><li>Those references were used as the basis to redesign the hand joining part.</li><li>A new base part for the hand was modelled, replicating distances, holes and volumes to fit the InMoov wrist.</li><li>The hand geometry was adapted to fit the new part, keeping orientation and ergonomics.</li></ol><p>The result is a hybrid part that joins both pieces robustly.</p>',
      '<p>Para resolver la incompatibilidad se rediseñó la unión con Fusion 360, para integrar la mano con el antebrazo sin perder la rotación de la muñeca.</p><ol><li>Se analizaron las dimensiones y la geometría de la pieza de muñeca original de InMoov: puntos de unión, diámetro del eje y separación entre soportes.</li><li>Se tomaron esas referencias como base para rediseñar la pieza de unión de la mano.</li><li>Se modeló una nueva pieza base para la mano, replicando distancias, orificios y volúmenes para acoplarse a la muñeca de InMoov.</li><li>Se adaptó la geometría de la mano para que encajara con la pieza nueva, manteniendo la orientación y la ergonomía.</li></ol><p>El resultado es una pieza híbrida que une de forma robusta las dos partes.</p>'],
      im: [['img/fusion.jpg', ['Original design (left) and modified with anchor (right)', 'Diseño original (izquierda) y modificado con anclaje (derecha)']]] },
    { t: ['Assembled arm', 'Brazo ensamblado'], h: [
      '<p>The redesigned parts were 3D printed and then adjusted by hand for fit and alignment. Almost the whole arm is PLA, a rigid, easy-to-print and stable material. The finger hinges were printed in TPU, and the fingers move with high-strength nylon thread.</p><p>The first TPU hinges were too stiff and the fingers did not close fully. Filaflex was too soft, and a harder TPU was expensive and still stiff. The problem was the infill: printing the TPU with low infill let the fingers close and return to their initial position.</p><p>Six DM996 digital servos of 15 kg·cm were used: five at the back of the forearm for the fingers and one at the wrist, which drives the rotation directly through gears.</p><dl class="specs"><div><dt>Structure</dt><dd>PLA</dd></div><div><dt>Hinges</dt><dd>TPU, low infill</dd></div><div><dt>Tendons</dt><dd>Nylon thread</dd></div><div><dt>Servos</dt><dd>6 × DM996 (15 kg·cm)</dd></div><div><dt>Printer</dt><dd>[Printer model]</dd></div></dl>',
      '<p>Las piezas rediseñadas se imprimieron en 3D y después se hicieron ajustes manuales de encaje y alineación. Casi todo el brazo es de PLA, un material rígido, fácil de imprimir y estable. Las bisagras de los dedos se imprimieron en TPU, y los dedos se mueven con hilo de nailon de alta resistencia.</p><p>Las primeras bisagras de TPU eran demasiado rígidas y los dedos no se cerraban del todo. Filaflex era demasiado blando, y un TPU más duro era caro y seguía siendo rígido. El problema era el relleno: imprimiendo el TPU con poco relleno se consiguió cerrar los dedos y que vuelvan a la posición inicial.</p><p>Se usaron seis servos digitales DM996 de 15 kg·cm: cinco en la parte posterior del antebrazo para los dedos y uno en la muñeca, que acciona la rotación directamente con engranajes.</p><dl class="specs"><div><dt>Estructura</dt><dd>PLA</dd></div><div><dt>Bisagras</dt><dd>TPU, poco relleno</dd></div><div><dt>Tendones</dt><dd>Hilo de nailon</dd></div><div><dt>Servos</dt><dd>6 × DM996 (15 kg·cm)</dd></div><div><dt>Impresora</dt><dd>[Modelo de impresora]</dd></div></dl>'],
      im: [['img/brazo.jpg', ['Assembled arm', 'Brazo ensamblado']], ['img/bisagras.jpg', ['Flexible finger hinges', 'Bisagras flexibles de los dedos']]] }
  ];
  let mi = 0; const mdet = $('#mdet');
  const showMech = i => {
    mi = i; $$('.mc').forEach((c, j) => c.classList.toggle('on', j === i)); const d = MD[i];
    mdet.innerHTML = `<div><h3>${T(d.t)}</h3>${T(d.h)}</div><div class="mimgs">${d.im.map(m => `<figure class="fig" style="margin:0;padding:0"><img class="zoom" src="${m[0]}" alt="${T(m[1])}"><figcaption class="mono">${T(m[1])}</figcaption></figure>`).join('')}</div>`;
    mdet.classList.remove('sw'); void mdet.offsetWidth; mdet.classList.add('sw');
    $$('img', mdet).forEach(im => im.addEventListener('error', () => im.setAttribute('data-missing', '')));
  };
  $$('.mc').forEach((c, i) => c.addEventListener('click', () => showMech(i)));

  /* Guante con flechas */
  const CO = [
    { k: 'flex', b: ['Flex sensors', 'Sensores de flexión'], t: ['Measure how much each finger bends.', 'Miden el grado de flexión de los dedos.'], x: 63, y: 2, w: 35, d: 'M815 98 C850 140 825 180 790 212' },
    { k: 'imu', b: ['MPU6050 IMU', 'IMU MPU6050'], t: ['Measures the wrist rotation.', 'Mide la rotación de la muñeca.'], x: 40, y: 83, w: 33, d: 'M590 428 C530 380 560 320 580 262' },
    { k: 'caixa', b: ['Electronics box', 'Caja de electrónica'], t: ['Microcontroller, battery and PCB.', 'Microcontrolador, pila y PCB.'], x: 2, y: 83, w: 33, d: 'M190 428 C190 395 225 360 262 336' }
  ];
  const g = $('#glove');
  g.insertAdjacentHTML('beforeend', `<svg viewBox="0 0 1000 520" aria-hidden="true"><defs><marker id="ah" markerWidth="12" markerHeight="12" refX="9" refY="6" orient="auto" markerUnits="userSpaceOnUse"><path d="M0,0 L12,6 L0,12 z" fill="#a8a49a"/></marker></defs>${CO.map(c => `<path data-k="${c.k}" d="${c.d}" marker-end="url(#ah)"/>`).join('')}</svg>`);
  CO.forEach(c => g.insertAdjacentHTML('beforeend', `<button class="cb" data-k="${c.k}" style="left:${c.x}%;top:${c.y}%;width:${c.w}%"></button>`));
  $$('path', g).forEach(p => p.style.setProperty('--l', Math.ceil(p.getTotalLength())));
  const hl = (k, on) => $$('[data-k]', g).forEach(e => e.classList.toggle('hl', on && e.dataset.k === k));
  $$('.cb', g).forEach(b => {
    b.addEventListener('mouseenter', () => hl(b.dataset.k, true)); b.addEventListener('mouseleave', () => hl(b.dataset.k, false));
    b.addEventListener('focus', () => hl(b.dataset.k, true)); b.addEventListener('blur', () => hl(b.dataset.k, false));
    b.addEventListener('click', () => tabGo[0](b.dataset.k));
  });
  const labelCO = () => $$('.cb', g).forEach((b, i) => b.innerHTML = `<b>${T(CO[i].b)}</b>${T(CO[i].t)}`);
  const gio = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { g.classList.add('in'); gio.disconnect(); } }), { threshold: .3 }); gio.observe(g);

  /* Gráficos (se reconstruyen al cambiar de tema o idioma) */
  let charts = [];
  const buildCharts = () => {
    if (!window.Chart) return; charts.forEach(c => c.destroy()); charts = [];
    const css = getComputedStyle(document.documentElement), ink = css.getPropertyValue('--ink').trim(), line = css.getPropertyValue('--line').trim(), mute = css.getPropertyValue('--mute').trim();
    Chart.defaults.font.family = "'JetBrains Mono',monospace"; Chart.defaults.font.size = 11; Chart.defaults.color = mute; Chart.defaults.borderColor = line;
    const ang = [0, 45, 90, 135, 180], X = T(['Finger angle (°)', 'Ángulo del dedo (°)']);
    const axis = (x, y) => ({ plugins: { legend: { display: false } }, scales: { x: { title: { display: true, text: x } }, y: { title: { display: true, text: y } } } });
    const add = (el, cfg) => charts.push(new Chart($(el), cfg));
    add('#chart', { type: 'line', data: { labels: ang, datasets: [{ data: [2317, 2143, 1993, 1824, 1633], borderColor: ink, backgroundColor: ink, tension: .2, pointRadius: 5 }] }, options: axis(X, T(['ADC reading', 'Lectura ADC'])) });
    const D = { r: [36066, 42811, 49570, 58518, 70860], v: [1.87, 1.73, 1.61, 1.47, 1.32] }, L = { r: 'Rflex (Ω)', v: 'Vout (V)' };
    const act = $('#ctabs .tab.on').dataset.k;
    add('#c-multi', { type: 'line', data: { labels: ang, datasets: [{ data: D[act], borderColor: ink, backgroundColor: ink, tension: .2, pointRadius: 5 }] }, options: axis(X, L[act]) });
    add('#c-rf', { type: 'bar', data: { labels: ['10 kΩ', '47 kΩ'], datasets: [{ data: [310, 700], backgroundColor: [line, ink] }] }, options: axis(T(['Fixed resistor', 'Resistencia fija']), T(['ADC reading variation', 'Variación de la lectura ADC'])) });
    add('#c-cal', { type: 'bar', data: { labels: T([['Thumb', 'Index', 'Middle', 'Ring', 'Little'], ['Pulgar', 'Índice', 'Corazón', 'Anular', 'Meñique']]), datasets: [{ data: [[1530, 2100], [1530, 2100], [1700, 2300], [1650, 2100], [1730, 2000]], backgroundColor: ink, borderSkipped: false }] },
      options: { indexAxis: 'y', plugins: { legend: { display: false } }, scales: { x: { min: 1400, max: 2400, title: { display: true, text: T(['ADC reading (minFlex to maxFlex)', 'Lectura ADC (de minFlex a maxFlex)']) } } } } });
  };
  $$('#ctabs .tab').forEach(b => b.addEventListener('click', () => { $$('#ctabs .tab').forEach(x => x.classList.toggle('on', x === b)); buildCharts(); }));
  const adc = $('#adc'), calc = () => { const x = +adc.value; $('#adc-v').textContent = x; $('#adc-a').textContent = Math.trunc((x - 1530) * (0 - 180) / (2100 - 1530)) + 180; };
  adc.addEventListener('input', calc); calc();

  /* Trama Bluetooth */
  const FN = [['thumb', 'pulgar'], ['index finger', 'índice'], ['middle finger', 'corazón'], ['ring finger', 'anular'], ['little finger', 'meñique']];
  const frame = $('#frame'); let fi = 0;
  frame.innerHTML = ['flex1', 'flex2', 'flex3', 'flex4', 'flex5', 'angle roll'].map((f, i) => `<button data-i="${i}">&lt;${f}&gt;</button>`).join('');
  const showF = i => {
    fi = i; $$('button', frame).forEach((b, j) => b.classList.toggle('on', j === i));
    $('#fdet').innerHTML = i < 5
      ? (lang === 'es' ? `<h4>Dedo ${FN[i][1]}</h4><p>Lectura del ADC del sensor del ${FN[i][1]} (media de 8 muestras, válida entre 1000 y 3000; si no lo es se repite el último valor correcto). En el brazo se convierte en ángulo con los valores de calibración de ese dedo.</p>`
        : `<h4>${FN[i][0][0].toUpperCase() + FN[i][0].slice(1)}</h4><p>ADC reading of the ${FN[i][0]} sensor (average of 8 samples, valid between 1000 and 3000; if not, the last valid value is repeated). At the arm it is converted into an angle with that finger's calibration values.</p>`)
      : (lang === 'es' ? '<h4>Rotación de la muñeca</h4><p>Ángulo de la muñeca calculado con la IMU y el filtro complementario, con el unwrapping aplicado. Llega ya limitado y escalado al rango del servo (0–180°), así que el brazo solo tiene que aplicarlo.</p>'
        : '<h4>Wrist rotation</h4><p>Wrist angle computed with the IMU and the complementary filter, with unwrapping applied. It arrives already limited and scaled to the servo range (0–180°), so the arm only has to apply it.</p>');
  };
  $$('button', frame).forEach((b, i) => b.addEventListener('click', () => showF(i)));

  /* Materiales: búsqueda, categorías y precios editables */
  const CAT = { el: ['Electronics', 'Electrónica'], ac: ['Actuation', 'Actuación'], pw: ['Power', 'Alimentación'], fa: ['Fabrication', 'Fabricación'] };
  const parts = [
    [['Wemos D1 R32 (ESP32)'], 'el', 2, 10.5], [['MPU6050 (GY-521)'], 'el', 1, 3.5], [['Flex sensor FS-L-0055-253-ST', 'Sensor de flexión FS-L-0055-253-ST'], 'el', 5, 14],
    [['47 kΩ resistor', 'Resistencia 47 kΩ'], 'el', 5, .05], [['Decoupling capacitor', 'Condensador de desacoplo'], 'el', 1, .3], [['Copper board for PCBs', 'Placa de cobre para PCB'], 'el', 2, 3],
    [['DM996 digital servo 15 kg·cm', 'Servo digital DM996 15 kg·cm'], 'ac', 6, 9], [['Nylon thread for tendons', 'Hilo de nailon para los tendones'], 'ac', 1, 4],
    [['18650 Li-ion battery', 'Batería Li-ion 18650'], 'pw', 2, 5], [['2 × 18650 battery holder', 'Portapilas 2 × 18650'], 'pw', 1, 1.5], [['5500 mAh Li-ion battery (glove)', 'Batería Li-ion 5500 mAh (guante)'], 'pw', 1, 15],
    [['Promax FAC-363B lab power supply', 'Fuente de laboratorio Promax FAC-363B'], 'pw', 1, 0], [['PLA filament (1 kg)', 'Filamento PLA (1 kg)'], 'fa', 1, 20], [['TPU filament (1 kg)', 'Filamento TPU (1 kg)'], 'fa', 1, 25], [['Glove', 'Guante'], 'fa', 1, 5]
  ];
  const nm = p => p[0][lang === 'es' && p[0][1] ? 1 : 0];
  let prices = null; try { prices = JSON.parse(store.get('prices')); } catch {}
  if (!Array.isArray(prices) || prices.length !== parts.length) prices = parts.map(p => p[3]);
  const norm = s => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  const eur = v => v.toLocaleString(lang === 'es' ? 'es-ES' : 'en-GB', { style: 'currency', currency: 'EUR' });
  let cat = 'all';
  const tb = $('#mt tbody');
  const renderParts = () => {
    $('#chips').innerHTML = [['all', T(UI.all)], ...Object.entries(CAT).map(([k, v]) => [k, T(v)])].map(([k, l]) => `<button class="chip${k === cat ? ' on' : ''}" data-c="${k}">${l}</button>`).join('');
    tb.innerHTML = parts.map((p, i) => `<tr data-i="${i}"><td>${nm(p)}</td><td><span class="pill">${T(CAT[p[1]])}</span></td><td>${p[2]}</td><td><input type="number" min="0" step="0.01" value="${prices[i]}" aria-label="${nm(p)}"></td><td class="sb"></td></tr>`).join('') + `<tr id="none" hidden><td colspan="5">${T(UI.none)}</td></tr>`;
    upd();
  };
  function upd() {
    const q = norm($('#q').value); let tot = 0, n = 0, all = 0;
    $$('tr[data-i]', tb).forEach(r => {
      const i = +r.dataset.i, p = parts[i], sub = p[2] * (+prices[i] || 0); all += sub; $('.sb', r).textContent = eur(sub);
      const show = (cat === 'all' || p[1] === cat) && norm(parts[i][0].join(' ') + ' ' + T(CAT[p[1]])).includes(q);
      r.hidden = !show; if (show) { tot += sub; n++; }
    });
    $('#none').hidden = n > 0; $('#tot').textContent = eur(tot); $('#grand').textContent = eur(all);
  }
  $('#q').addEventListener('input', upd);
  $('#chips').addEventListener('click', e => { const c = e.target.closest('.chip'); if (!c) return; cat = c.dataset.c; $$('.chip').forEach(x => x.classList.toggle('on', x === c)); upd(); });
  tb.addEventListener('input', e => { const r = e.target.closest('tr[data-i]'); if (!r) return; prices[+r.dataset.i] = e.target.value; store.set('prices', JSON.stringify(prices)); upd(); });
  addEventListener('keydown', e => { if (e.key === '/' && !['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) { e.preventDefault(); $('#q').focus(); } });

  /* Idioma y tema */
  const applyLang = l => {
    lang = l; store.set('lang', l); document.documentElement.lang = l; document.title = T(UI.title);
    $$('.seg button').forEach(b => b.classList.toggle('on', b.dataset.l === l));
    $$('[data-es]').forEach(e => { if (e.dataset.en === undefined) e.dataset.en = e.innerHTML; e.innerHTML = l === 'es' ? e.dataset.es : e.dataset.en; });
    $('#q').placeholder = T(UI.search); $('#theme').textContent = T(theme === 'dark' ? UI.day : UI.night);
    renderPCB(); showMech(mi); labelCO(); showF(fi); renderParts(); buildCharts();
  };
  const applyTheme = t => {
    theme = t; store.set('theme', t); document.documentElement.dataset.theme = t; $('#theme').textContent = T(t === 'dark' ? UI.day : UI.night); buildCharts();
  };
  $$('.seg button').forEach(b => b.addEventListener('click', () => applyLang(b.dataset.l)));
  $('#theme').addEventListener('click', () => applyTheme(theme === 'dark' ? 'light' : 'dark'));
  $('.scrollhint').addEventListener('click', e => { e.preventDefault(); $('#start').scrollIntoView({ behavior: 'smooth' }); });
  document.documentElement.dataset.theme = theme;
  applyLang(lang);

  /* Visor con zoom */
  const lb = $('#lb'), li = $('#lb-img'); let s = 1, x = 0, y = 0, drag = false, sx = 0, sy = 0;
  const draw = () => li.style.transform = `translate(${x}px,${y}px) scale(${s})`, close = () => lb.hidden = true;
  document.addEventListener('click', e => { const i = e.target.closest('img.zoom'); if (!i || i.hasAttribute('data-missing')) return; li.src = i.src; li.alt = i.alt; s = 1; x = y = 0; draw(); lb.hidden = false; });
  $('#lb-x').addEventListener('click', close); lb.addEventListener('click', e => { if (e.target === lb) close(); }); addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
  lb.addEventListener('wheel', e => { e.preventDefault(); s = Math.min(4, Math.max(1, s + (e.deltaY < 0 ? .2 : -.2))); if (s === 1) x = y = 0; draw(); }, { passive: false });
  li.addEventListener('pointerdown', e => { drag = true; sx = e.clientX - x; sy = e.clientY - y; li.setPointerCapture(e.pointerId); });
  li.addEventListener('pointermove', e => { if (drag) { x = e.clientX - sx; y = e.clientY - sy; draw(); } });
  li.addEventListener('pointerup', () => drag = false);
});
