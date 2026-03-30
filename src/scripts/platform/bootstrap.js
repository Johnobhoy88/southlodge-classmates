(function initClassmatesBootstrap(global){
  const REQUIRED_SERVICES = [
    'storage',
    'shell',
    'appState',
    'pupilShell',
    'teacherSummary',
    'teacherDashboard',
    'teacherTools',
    'southlodgeRacers'
  ];

  function verifyPlatform() {
    const platform = global.ClassmatesPlatform;
    if (!platform) {
      throw new Error('ClassmatesPlatform runtime is missing.');
    }
    if (!global.ClassmatesModuleManifest) {
      throw new Error('Classmates module manifest is missing.');
    }
    platform.requireServices(REQUIRED_SERVICES);
  }

  function boot() {
    verifyPlatform();
    return global.ClassmatesPlatform.bootstrap('classmates', function(runtime){
      if (typeof global.ClassmatesAppBootstrap !== 'function') {
        throw new Error('ClassmatesAppBootstrap is missing.');
      }
      return global.ClassmatesAppBootstrap(runtime);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot, { once: true });
  } else {
    boot();
  }
})(window);
