(function initClassmatesModuleManifest(global){
  const MODULE_MANIFEST = Object.freeze({
    platform: Object.freeze({
      owner: 'platform',
      modules: Object.freeze(['runtime', 'module-manifest', 'storage', 'shell', 'app-state', 'app-shell', 'bootstrap'])
    }),
    domain: Object.freeze({
      owner: 'domain',
      modules: Object.freeze([
        'settings',
        'pupils',
        'assignments',
        'custom-quiz',
        'attempts',
        'mastery',
        'southlodge-racers-packs'
      ])
    }),
    teacher: Object.freeze({
      owner: 'teacher',
      modules: Object.freeze(['summary', 'reports', 'authoring', 'tools'])
    }),
    pupil: Object.freeze({
      owner: 'pupil',
      modules: Object.freeze(['avatar', 'shell'])
    }),
    flagship: Object.freeze({
      owner: 'flagship',
      modules: Object.freeze(['southlodge-racers-admin', 'teacher-dashboard', 'southlodge-racers'])
    })
  });

  global.ClassmatesModuleManifest = MODULE_MANIFEST;
  if (global.ClassmatesPlatform && typeof global.ClassmatesPlatform.setModuleManifest === 'function') {
    global.ClassmatesPlatform.setModuleManifest(MODULE_MANIFEST);
  }
})(window);
