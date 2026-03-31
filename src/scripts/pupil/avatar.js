(function(){
  const DEFAULT_AVATAR = {
    skin: 0,
    hair: 0,
    hairColor: 0,
    eyes: 0,
    mouth: 0,
    outfit: 0,
    accessory: 0,
    premade: null,
    equipped: { hat: null, pet: null, effect: null, frame: null }
  };

  // Store items that render on the avatar
  const STORE_HATS = {
    crown: { name: 'Gold Crown', svg: '<path d="M15,8 L18,3 L21,7 L25,2 L29,7 L32,3 L35,8 L35,14 L15,14 Z" fill="#FFD700" stroke="#d4a520" stroke-width="0.5"/>', cost: 30 },
    wizard: { name: 'Wizard Hat', svg: '<path d="M14,16 L25,0 L36,16 Z" fill="#6c5ce7"/><circle cx="25" cy="5" r="2" fill="#FFD700"/>', cost: 40 },
    pirate: { name: 'Pirate Hat', svg: '<path d="M12,14 Q25,2 38,14 Z" fill="#2c3e50"/><path d="M22,10 L25,7 L28,10" fill="none" stroke="white" stroke-width="1"/>', cost: 35 },
    flower: { name: 'Flower Crown', svg: '<circle cx="17" cy="10" r="3" fill="#e84393"/><circle cx="25" cy="8" r="3" fill="#fdcb6e"/><circle cx="33" cy="10" r="3" fill="#00b894"/><path d="M14,12 Q25,8 36,12" fill="none" stroke="#2ecc71" stroke-width="1"/>', cost: 25 },
    beanie: { name: 'Cosy Beanie', svg: '<path d="M14,14 Q14,6 25,5 Q36,6 36,14 Z" fill="#e74c3c"/><circle cx="25" cy="5" r="2.5" fill="#e74c3c"/>', cost: 20 },
    headphones: { name: 'Headphones', svg: '<path d="M13,18 Q13,6 25,5 Q37,6 37,18" fill="none" stroke="#2c3e50" stroke-width="2.5"/><circle cx="13" cy="18" r="3" fill="#2c3e50"/><circle cx="37" cy="18" r="3" fill="#2c3e50"/>', cost: 45 },
    tophat: { name: 'Top Hat', svg: '<rect x="17" y="4" width="16" height="12" rx="2" fill="#2c3e50"/><rect x="13" y="14" width="24" height="3" rx="1" fill="#2c3e50"/><rect x="17" y="12" width="16" height="2" fill="#d4a520"/>', cost: 50 },
    viking: { name: 'Viking Helmet', svg: '<path d="M14,16 Q14,8 25,7 Q36,8 36,16 Z" fill="#8d6e63"/><path d="M12,12 Q10,6 14,10" fill="#e0e0e0" stroke="#bdbdbd" stroke-width="0.5"/><path d="M38,12 Q40,6 36,10" fill="#e0e0e0" stroke="#bdbdbd" stroke-width="0.5"/>', cost: 55 },
  };

  const STORE_PETS = {
    cat: { name: 'Kitten', svg: '<g transform="translate(38,32) scale(0.3)"><circle cx="10" cy="10" r="8" fill="#FFB347"/><path d="M4,4 L6,8 M16,4 L14,8" stroke="#FFB347" stroke-width="2"/><circle cx="7" cy="9" r="1" fill="#333"/><circle cx="13" cy="9" r="1" fill="#333"/><path d="M9,12 L10,11 L11,12" fill="none" stroke="#333" stroke-width="0.5"/></g>', cost: 60 },
    dog: { name: 'Puppy', svg: '<g transform="translate(38,32) scale(0.3)"><circle cx="10" cy="10" r="8" fill="#D2691E"/><ellipse cx="6" cy="5" rx="3" ry="4" fill="#8B4513"/><ellipse cx="14" cy="5" rx="3" ry="4" fill="#8B4513"/><circle cx="7" cy="9" r="1" fill="#333"/><circle cx="13" cy="9" r="1" fill="#333"/><circle cx="10" cy="12" r="1.5" fill="#333"/></g>', cost: 60 },
    owl: { name: 'Wise Owl', svg: '<g transform="translate(38,30) scale(0.3)"><ellipse cx="10" cy="10" rx="7" ry="8" fill="#8B7355"/><circle cx="7" cy="8" r="3" fill="white"/><circle cx="13" cy="8" r="3" fill="white"/><circle cx="7" cy="8" r="1.5" fill="#333"/><circle cx="13" cy="8" r="1.5" fill="#333"/><path d="M9,13 L10,12 L11,13" fill="#F4A460"/></g>', cost: 75 },
    dragon: { name: 'Baby Dragon', svg: '<g transform="translate(38,30) scale(0.3)"><ellipse cx="10" cy="10" rx="7" ry="8" fill="#27ae60"/><circle cx="7" cy="8" r="2" fill="#fdcb6e"/><circle cx="13" cy="8" r="2" fill="#fdcb6e"/><circle cx="7" cy="8" r="1" fill="#333"/><circle cx="13" cy="8" r="1" fill="#333"/><path d="M3,6 L5,3 L7,6" fill="#27ae60"/><path d="M13,6 L15,3 L17,6" fill="#27ae60"/></g>', cost: 100 },
    unicorn: { name: 'Unicorn', svg: '<g transform="translate(38,30) scale(0.3)"><circle cx="10" cy="10" r="7" fill="white"/><path d="M10,2 L10,-3" stroke="#FFD700" stroke-width="1.5"/><circle cx="7" cy="9" r="1" fill="#6c5ce7"/><circle cx="13" cy="9" r="1" fill="#e84393"/><path d="M8,13 Q10,15 12,13" fill="none" stroke="#e84393" stroke-width="0.5"/></g>', cost: 120 },
  };

  const STORE_EFFECTS = {
    sparkle: { name: 'Sparkle', cost: 40 },
    rainbow: { name: 'Rainbow Glow', cost: 65 },
    stars: { name: 'Star Aura', cost: 50 },
  };

  const STORE_FRAMES = {
    gold: { name: 'Gold Frame', stroke: '#FFD700', width: 2.5, cost: 30 },
    silver: { name: 'Silver Frame', stroke: '#C0C0C0', width: 2, cost: 20 },
    diamond: { name: 'Diamond Frame', stroke: '#87CEEB', width: 2.5, cost: 80 },
    hearts: { name: 'Hearts Frame', stroke: '#e84393', width: 2, cost: 45 },
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
    var equip = av.equipped && typeof av.equipped === 'object' ? av.equipped : {};
    var hatSvg = '';
    var petSvg = '';
    var frameSvg = '';
    if (equip.hat && STORE_HATS[equip.hat]) hatSvg = STORE_HATS[equip.hat].svg;
    if (equip.pet && STORE_PETS[equip.pet]) petSvg = STORE_PETS[equip.pet].svg;
    if (equip.frame && STORE_FRAMES[equip.frame]) {
      var fr = STORE_FRAMES[equip.frame];
      frameSvg = '<rect x="0.5" y="0.5" width="49" height="49" rx="25" fill="none" stroke="' + fr.stroke + '" stroke-width="' + fr.width + '"/>';
    }
    return '<svg viewBox="0 0 50 50" width="' + svgSize + '" height="' + svgSize + '" class="avatar-svg">' + frameSvg + '<rect x="0" y="0" width="50" height="50" fill="' + skin + '" rx="25"/><rect x="10" y="38" width="30" height="14" fill="' + outfit + '" rx="6"/>' + (hair.d ? '<path d="' + hair.d + '" fill="' + hairColor + '"/>' : '') + '<path d="' + eyes.d + '" fill="#2c3e50" stroke="#2c3e50" stroke-width="1.5" fill-rule="evenodd"/><path d="' + mouth.d + '" fill="none" stroke="#2c3e50" stroke-width="1.5" stroke-linecap="round"/>' + accessorySvg + hatSvg + petSvg + '</svg>';
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

  function equipItem(pupilName, category, itemId) {
    if (!hasNamedPupil(pupilName)) return null;
    var av = getAvatarData(pupilName);
    if (!av.equipped) av.equipped = { hat: null, pet: null, effect: null, frame: null };
    av.equipped[category] = itemId;
    saveAvatarData(pupilName, av);
    return av;
  }

  function getStoreItems() {
    return {
      hats: STORE_HATS,
      pets: STORE_PETS,
      effects: STORE_EFFECTS,
      frames: STORE_FRAMES
    };
  }

  window.ClassmatesAvatar = {
    createDefaultAvatar: createDefaultAvatar,
    equipItem: equipItem,
    getAvatarData: getAvatarData,
    getCurrentAvatar: getCurrentAvatar,
    getStoreItems: getStoreItems,
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
