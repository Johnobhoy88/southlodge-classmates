(function initClassmatesPlatform(global){
  const moduleRegistry = Object.create(null);
  const serviceRegistry = Object.create(null);
  let moduleManifest = Object.freeze({});
  let booted = false;
  let bootResult = null;

  function normalizeKey(value) {
    return String(value == null ? '' : value).trim();
  }

  function freezeDeep(value) {
    if (!value || typeof value !== 'object' || Object.isFrozen(value)) {
      return value;
    }
    Object.getOwnPropertyNames(value).forEach(function(key){
      freezeDeep(value[key]);
    });
    return Object.freeze(value);
  }

  function registerModule(group, name, metadata) {
    const groupKey = normalizeKey(group);
    const moduleKey = normalizeKey(name);
    if (!groupKey || !moduleKey) {
      throw new Error('Classmates module registration requires a group and name.');
    }

    const groupRegistry = moduleRegistry[groupKey] || (moduleRegistry[groupKey] = Object.create(null));
    const record = freezeDeep(Object.assign({}, metadata || {}));
    groupRegistry[moduleKey] = record;
    return record;
  }

  function getModule(group, name) {
    const groupKey = normalizeKey(group);
    const moduleKey = normalizeKey(name);
    if (!groupKey || !moduleKey) return null;
    return moduleRegistry[groupKey] && moduleRegistry[groupKey][moduleKey] ? moduleRegistry[groupKey][moduleKey] : null;
  }

  function listModules(group) {
    const groupKey = normalizeKey(group);
    if (!groupKey || !moduleRegistry[groupKey]) return [];
    return Object.keys(moduleRegistry[groupKey]);
  }

  function registerService(name, api) {
    const serviceKey = normalizeKey(name);
    if (!serviceKey) {
      throw new Error('Classmates service registration requires a name.');
    }
    const record = freezeDeep(Object.assign({}, api || {}));
    serviceRegistry[serviceKey] = record;
    return record;
  }

  function getService(name) {
    const serviceKey = normalizeKey(name);
    if (!serviceKey) return null;
    return serviceRegistry[serviceKey] || null;
  }

  function hasService(name) {
    return !!getService(name);
  }

  function requireService(name) {
    const service = getService(name);
    if (!service) {
      throw new Error('Missing Classmates runtime service: ' + normalizeKey(name) + '.');
    }
    return service;
  }

  function requireServices(names) {
    const list = Array.isArray(names) ? names : [names];
    const missing = list
      .map(normalizeKey)
      .filter(Boolean)
      .filter(function(name){
        return !serviceRegistry[name];
      });

    if (missing.length) {
      throw new Error('Missing Classmates runtime services: ' + missing.join(', ') + '.');
    }

    return list.map(function(name){
      return serviceRegistry[normalizeKey(name)];
    });
  }

  function setModuleManifest(manifest) {
    moduleManifest = freezeDeep(manifest || {});
    return moduleManifest;
  }

  function getModuleManifest() {
    return moduleManifest;
  }

  function createContext(appName) {
    return Object.freeze({
      appName: normalizeKey(appName),
      getModule: getModule,
      getModuleManifest: getModuleManifest,
      getService: getService,
      hasService: hasService,
      listModules: listModules,
      moduleRegistry: moduleRegistry,
      requireService: requireService,
      requireServices: requireServices,
      registerModule: registerModule,
      registerService: registerService,
      serviceRegistry: serviceRegistry
    });
  }

  function bootstrap(appName, bootFn) {
    if (booted) return bootResult;
    booted = true;
    if (typeof bootFn !== 'function') {
      throw new Error('Classmates bootstrap requires a function.');
    }
    bootResult = bootFn(createContext(appName));
    return bootResult;
  }

  const api = {
    bootstrap: bootstrap,
    createContext: createContext,
    getModule: getModule,
    getModuleManifest: getModuleManifest,
    getService: getService,
    hasService: hasService,
    listModules: listModules,
    registerModule: registerModule,
    registerService: registerService,
    requireService: requireService,
    requireServices: requireServices,
    setModuleManifest: setModuleManifest,
    modules: moduleRegistry,
    services: serviceRegistry
  };

  global.ClassmatesPlatform = Object.freeze(api);
})(window);
