export function createClashFx(): HTMLElement {
  const root = document.createElement('div');
  root.className = 'battlefield-combat-fx';
  for (const className of ['battle-road', 'battle-cross battle-cross--left', 'battle-cross battle-cross--right']) {
    const node = document.createElement('div');
    node.className = className;
    root.appendChild(node);
  }
  for (const className of ['battle-arc battle-arc--blue', 'battle-arc battle-arc--red', 'battle-arrow battle-arrow--blue', 'battle-arrow battle-arrow--red']) {
    const node = document.createElement('div');
    node.className = className;
    root.appendChild(node);
  }
  for (const className of ['battle-trail battle-trail--left', 'battle-trail battle-trail--right', 'battle-trail battle-trail--center', 'battle-clash-core']) {
    const node = document.createElement('div');
    node.className = className;
    root.appendChild(node);
  }
  const sparks = document.createElement('div');
  sparks.className = 'battle-sparks';
  for (const className of ['battle-spark battle-spark--a', 'battle-spark battle-spark--b', 'battle-spark battle-spark--c']) {
    const spark = document.createElement('span');
    spark.className = className;
    sparks.appendChild(spark);
  }
  root.appendChild(sparks);
  const damageEntries: Array<[string, string]> = [
    ['battle-damage battle-damage--blue', '-187'],
    ['battle-damage battle-damage--red', '-255'],
    ['battle-damage battle-damage--mid', '-96']
  ];
  for (const [className, text] of damageEntries) {
    const node = document.createElement('div');
    node.className = className;
    node.textContent = text;
    root.appendChild(node);
  }
  const title = document.createElement('h2');
  title.className = 'battle-center-title';
  title.textContent = '激突';
  root.appendChild(title);
  return root;
}
