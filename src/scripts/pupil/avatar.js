(function(){
  const DEFAULT_AVATAR = {
    skin: 0,
    hair: 0,
    hairColor: 0,
    eyes: 0,
    mouth: 0,
    outfit: 0,
    accessory: 0,
    premade: null
  };

  let currentAvatar = createDefaultAvatar();

  function createDefaultAvatar() {
    return Object.assign({}, DEFAULT_AVATAR);
  }

  function cloneAvatar(avatar) {
    return Object.assign(createDefaultAvatar(), avatar && typeof avatar === 'object' ? avatar : {});
  }

  function getAvatarKey(pupilName) {
    return 'classmates_avatar_' + String(pupilName || '');
  }

  function hasNamedPupil(pupilName) {
    return String(pupilName || '').trim().length > 0;
  }

  function getCurrentAvatar() {
    return cloneAvatar(currentAvatar);
  }

  function setCurrentAvatar(avatar) {
    currentAvatar = cloneAvatar(avatar);
    return getCurrentAvatar();
  }

  function getAvatarData(pupilName) {
    if (!hasNamedPupil(pupilName)) return createDefaultAvatar();
    return cloneAvatar(storageGetJson(getAvatarKey(pupilName), null));
  }

  function saveAvatarData(pupilName, avatar) {
    const next = cloneAvatar(avatar);
    if (!hasNamedPupil(pupilName)) return next;
    storageSetJson(getAvatarKey(pupilName), next);
    return next;
  }

  function prepareAvatarForPupil(pupilName) {
    return setCurrentAvatar(getAvatarData(pupilName));
  }

  function hasAvatar(avatar) {
    const value = cloneAvatar(avatar);
    return value.premade !== null && value.premade !== undefined || !!(value.skin || value.hair || value.eyes || value.mouth || value.outfit || value.accessory);
  }

  function renderAvatarSVG(avatar, size) {
    const av = cloneAvatar(avatar);
    const svgSize = size || 50;
    if (av.premade !== null && av.premade !== undefined && AV_PREMADE[av.premade]) {
      const premade = AV_PREMADE[av.premade];
      return premade.svg.replace('viewBox="0 0 50 50"', 'viewBox="0 0 50 50" width="' + svgSize + '" height="' + svgSize + '" class="avatar-svg"');
    }
    const skin = AV_SKINS[av.skin] || AV_SKINS[0];
    const hair = AV_HAIRS[av.hair] || AV_HAIRS[0];
    const hairColor = AV_HAIR_COLORS[av.hairColor] || AV_HAIR_COLORS[0];
    const eyes = AV_EYES[av.eyes] || AV_EYES[0];
    const mouth = AV_MOUTHS[av.mouth] || AV_MOUTHS[0];
    const outfit = AV_OUTFITS[av.outfit] || AV_OUTFITS[0];
    const accessory = AV_ACCESSORIES[av.accessory || 0] || AV_ACCESSORIES[0];
    let accessorySvg = '';
    if (accessory.d) {
      if (accessory.stroke) {
        accessorySvg = '<path d="' + accessory.d + '" fill="none" stroke="' + accessory.stroke + '" stroke-width="2" stroke-linecap="round"/>';
      } else {
        accessorySvg = '<path d="' + accessory.d + '" fill="' + (accessory.fill || '#FFD700') + '"/>';
      }
    }
    return '<svg viewBox="0 0 50 50" width="' + svgSize + '" height="' + svgSize + '" class="avatar-svg"><rect x="0" y="0" width="50" height="50" fill="' + skin + '" rx="25"/><rect x="10" y="38" width="30" height="14" fill="' + outfit + '" rx="6"/>' + (hair.d ? '<path d="' + hair.d + '" fill="' + hairColor + '"/>' : '') + '<path d="' + eyes.d + '" fill="#2c3e50" stroke="#2c3e50" stroke-width="1.5" fill-rule="evenodd"/><path d="' + mouth.d + '" fill="none" stroke="#2c3e50" stroke-width="1.5" stroke-linecap="round"/>' + accessorySvg + '</svg>';
  }

  function renderAvatarPreview() {
    const preview = document.getElementById('avatarPreviewLg');
    if (preview) preview.innerHTML = renderAvatarSVG(currentAvatar, 140);
  }

  function renderSelectionGrid(containerId, items, selectedIndex, renderItem, onSelect) {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = '';
    items.forEach(function(item, index){
      const option = document.createElement('div');
      option.className = 'av-option' + (selectedIndex === index ? ' selected' : '');
      option.innerHTML = renderItem(item, index);
      option.onclick = function(){
        onSelect(index);
      };
      container.appendChild(option);
    });
  }

  function renderAvatarBuilder() {
    renderAvatarPreview();
    if (currentAvatar.premade !== null && currentAvatar.premade !== undefined) {
      document.querySelectorAll('.av-tab').forEach(function(tab, index){
        tab.classList.toggle('active', index === 0);
      });
      document.getElementById('avPremade').style.display = '';
      document.getElementById('avCustom').style.display = 'none';
      renderPremadeGrid();
    } else {
      document.querySelectorAll('.av-tab').forEach(function(tab, index){
        tab.classList.toggle('active', index === 1);
      });
      document.getElementById('avPremade').style.display = 'none';
      document.getElementById('avCustom').style.display = '';
    }

    [
      { id: 'avSkin', items: AV_SKINS, key: 'skin' },
      { id: 'avHairColor', items: AV_HAIR_COLORS, key: 'hairColor' },
      { id: 'avOutfit', items: AV_OUTFITS, key: 'outfit' }
    ].forEach(function(section){
      renderSelectionGrid(
        section.id,
        section.items,
        currentAvatar[section.key],
        function(color){
          return '<div class="av-color" style="background:' + color + '"></div>';
        },
        function(index){
          currentAvatar.premade = null;
          currentAvatar[section.key] = index;
          renderAvatarBuilder();
        }
      );
    });

    renderSelectionGrid(
      'avHair',
      AV_HAIRS,
      currentAvatar.hair,
      function(_, index){
        return renderAvatarSVG(Object.assign({}, currentAvatar, { hair: index, premade: null }), 40);
      },
      function(index){
        currentAvatar.premade = null;
        currentAvatar.hair = index;
        renderAvatarBuilder();
      }
    );

    renderSelectionGrid(
      'avEyes',
      AV_EYES,
      currentAvatar.eyes,
      function(_, index){
        return renderAvatarSVG(Object.assign({}, currentAvatar, { eyes: index, premade: null }), 40);
      },
      function(index){
        currentAvatar.premade = null;
        currentAvatar.eyes = index;
        renderAvatarBuilder();
      }
    );

    renderSelectionGrid(
      'avMouth',
      AV_MOUTHS,
      currentAvatar.mouth,
      function(_, index){
        return renderAvatarSVG(Object.assign({}, currentAvatar, { mouth: index, premade: null }), 40);
      },
      function(index){
        currentAvatar.premade = null;
        currentAvatar.mouth = index;
        renderAvatarBuilder();
      }
    );

    renderSelectionGrid(
      'avAccessory',
      AV_ACCESSORIES,
      currentAvatar.accessory || 0,
      function(_, index){
        return renderAvatarSVG(Object.assign({}, currentAvatar, { accessory: index, premade: null }), 40);
      },
      function(index){
        currentAvatar.premade = null;
        currentAvatar.accessory = index;
        renderAvatarBuilder();
      }
    );
  }

  function showTab(tab, button) {
    document.querySelectorAll('.av-tab').forEach(function(element){
      element.classList.remove('active');
    });
    if (button) button.classList.add('active');
    document.getElementById('avPremade').style.display = tab === 'premade' ? '' : 'none';
    document.getElementById('avCustom').style.display = tab === 'custom' ? '' : 'none';
    if (tab === 'premade') renderPremadeGrid();
  }

  function renderPremadeGrid() {
    const container = document.getElementById('avPremade');
    if (!container) return;
    const categories = ['animals', 'characters', 'sports'];
    const labels = {
      animals: '\uD83D\uDC3E Animals',
      characters: '\uD83E\uDDB8 Characters',
      sports: '\u26BD Sports'
    };
    let html = '';
    categories.forEach(function(category){
      html += '<div class="av-category-label">' + labels[category] + '</div><div class="av-premade-grid">';
      AV_PREMADE.forEach(function(premade, index){
        if (premade.category !== category) return;
        const selected = currentAvatar.premade === index ? ' selected' : '';
        html += '<div class="av-premade-item' + selected + '" onclick="selectPremade(' + index + ')">' + premade.svg.replace('viewBox="0 0 50 50"', 'viewBox="0 0 50 50" width="60" height="60"') + '<div class="av-premade-name">' + premade.name + '</div></div>';
      });
      html += '</div>';
    });
    container.innerHTML = html;
  }

  function selectPremade(index) {
    currentAvatar.premade = index;
    renderAvatarPreview();
    renderPremadeGrid();
    return getCurrentAvatar();
  }

  window.ClassmatesAvatar = {
    createDefaultAvatar: createDefaultAvatar,
    getAvatarData: getAvatarData,
    getCurrentAvatar: getCurrentAvatar,
    hasAvatar: hasAvatar,
    prepareAvatarForPupil: prepareAvatarForPupil,
    renderAvatarBuilder: renderAvatarBuilder,
    renderAvatarSVG: renderAvatarSVG,
    saveAvatarData: saveAvatarData,
    selectPremade: selectPremade,
    setCurrentAvatar: setCurrentAvatar,
    showTab: showTab
  };
})();
