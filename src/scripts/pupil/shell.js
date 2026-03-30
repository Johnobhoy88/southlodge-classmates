(function(){
  function escapeHtml(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function renderHomeHeader(model) {
    const container = document.getElementById('pupilNameBar');
    if (!container) return;
    if (!model || !model.pupilName) {
      container.textContent = '';
      return;
    }
    container.innerHTML = model.avatarMarkup + ' <span style="vertical-align:middle"><strong>' + escapeHtml(model.greeting) + ', ' + escapeHtml(model.pupilName) + '!</strong><br><span style="font-size:0.7rem;color:rgba(255,255,255,0.4)">' + escapeHtml(model.dayMessage) + '</span></span> <button onclick="openAvatarBuilder()" style="background:none;border:none;color:#11998e;cursor:pointer;font-size:0.7rem;vertical-align:middle">Edit</button>';
  }

  function renderLeaderboard(options) {
    const section = document.getElementById('leaderboardSection');
    const list = document.getElementById('leaderboard');
    if (!section || !list) return;
    const pupils = Array.isArray(options.pupils) ? options.pupils.slice() : [];
    if (pupils.length < 2) {
      section.style.display = 'none';
      list.innerHTML = '';
      return;
    }

    const data = pupils.map(function(name){
      const pupilState = options.loadPupilState(name) || {};
      return {
        name: name,
        stars: pupilState.stars || 0
      };
    }).sort(function(left, right){
      return right.stars - left.stars;
    }).slice(0, 5);

    if (!data.length || data[0].stars === 0) {
      section.style.display = 'none';
      list.innerHTML = '';
      return;
    }

    const medals = ['\u{1F947}', '\u{1F948}', '\u{1F949}', '4', '5'];
    section.style.display = 'block';
    list.innerHTML = '';
    data.forEach(function(entry, index){
      const row = document.createElement('div');
      row.style.display = 'flex';
      row.style.alignItems = 'center';
      row.style.gap = '8px';
      row.style.padding = '6px 12px';
      row.style.background = entry.name === options.currentPupil ? '#e8fff5' : '#f8f8f8';
      row.style.borderRadius = '10px';
      row.style.marginBottom = '4px';
      row.style.fontSize = '0.85rem';
      row.innerHTML = '<span style="width:24px;text-align:center">' + medals[index] + '</span><span style="flex:1;font-weight:700;color:#2d3436">' + escapeHtml(entry.name) + '</span><span style="color:#FFD93D;font-weight:800">' + entry.stars + ' &#x2B50;</span>';
      list.appendChild(row);
    });
  }

  function renderPupilGrid(options) {
    const grid = document.getElementById('pupilGrid');
    if (!grid) return false;
    const pupils = Array.isArray(options.pupils) ? options.pupils : [];
    grid.innerHTML = '';

    pupils.forEach(function(name){
      const avatar = options.getAvatarData(name);
      const card = document.createElement('div');
      card.className = 'pupil-profile';

      const avatarWrap = document.createElement('div');
      avatarWrap.className = 'pp-avatar';
      avatarWrap.innerHTML = options.renderAvatarSVG(avatar, 100);

      const nameLabel = document.createElement('div');
      nameLabel.className = 'pp-name';
      nameLabel.textContent = name;

      const editButton = document.createElement('button');
      editButton.className = 'pp-edit';
      editButton.textContent = options.hasAvatar(avatar) ? 'Edit Avatar' : 'Create Avatar!';
      editButton.onclick = function(event){
        event.stopPropagation();
        options.onEditAvatar(name);
      };

      const playButton = document.createElement('button');
      playButton.className = 'pp-go';
      playButton.textContent = "Let's Go!";
      playButton.onclick = function(event){
        event.stopPropagation();
        options.onStartPupil(name);
      };

      card.appendChild(avatarWrap);
      card.appendChild(nameLabel);
      card.appendChild(editButton);
      card.appendChild(playButton);
      grid.appendChild(card);
    });

    const guestCard = document.createElement('div');
    guestCard.className = 'pupil-profile';
    guestCard.style.borderStyle = 'dashed';
    guestCard.style.borderColor = '#ddd';
    guestCard.innerHTML = '<div class="pp-avatar" style="display:flex;align-items:center;justify-content:center;width:100px;height:100px;margin:0 auto 10px;background:#f8f8f8;border-radius:50%;font-size:2.5rem;color:#ccc;border:3px dashed #ddd">+</div><div class="pp-name" style="color:#b2bec3">Guest</div>';

    const guestButton = document.createElement('button');
    guestButton.className = 'pp-go';
    guestButton.style.background = '#e0e0e0';
    guestButton.style.boxShadow = '0 3px 0 #ccc';
    guestButton.style.color = '#636e72';
    guestButton.textContent = 'Play as Guest';
    guestButton.onclick = function(event){
      event.stopPropagation();
      options.onPlayGuest();
    };

    guestCard.appendChild(guestButton);
    grid.appendChild(guestCard);
    return true;
  }

  function renderPupilSelect(options) {
    if (renderPupilGrid(options)) return true;
    const area = document.getElementById('pupilSelectArea');
    if (!area) return false;
    const pupils = Array.isArray(options.pupils) ? options.pupils : [];
    if (!pupils.length) {
      area.innerHTML = '';
      return true;
    }

    const wrapper = document.createElement('div');
    wrapper.className = 'pupil-select';

    const title = document.createElement('div');
    title.className = 'pupil-select-title';
    title.textContent = 'Who are you today?';
    wrapper.appendChild(title);

    const list = document.createElement('div');
    list.className = 'pupil-list';
    pupils.forEach(function(name){
      const chip = document.createElement('div');
      chip.className = 'pupil-chip' + (options.currentPupil === name ? ' selected' : '');
      chip.textContent = name;
      chip.onclick = function(){
        options.onSelectPupil(name);
      };
      list.appendChild(chip);
    });

    wrapper.appendChild(list);
    area.innerHTML = '';
    area.appendChild(wrapper);
    return true;
  }

  const pupilShellApi = Object.freeze({
    renderHomeHeader: renderHomeHeader,
    renderLeaderboard: renderLeaderboard,
    renderPupilGrid: renderPupilGrid,
    renderPupilSelect: renderPupilSelect
  });

  window.ClassmatesPupilShell = pupilShellApi;
  if (window.ClassmatesPlatform && typeof window.ClassmatesPlatform.registerModule === 'function') {
    window.ClassmatesPlatform.registerModule('pupil', 'shell', {
      owner: 'pupil',
      exports: ['ClassmatesPupilShell', 'renderHomeHeader', 'renderLeaderboard', 'renderPupilGrid', 'renderPupilSelect']
    });
  }
  if (window.ClassmatesPlatform && typeof window.ClassmatesPlatform.registerService === 'function') {
    window.ClassmatesPlatform.registerService('pupilShell', pupilShellApi);
  }
})();
