(function(){
  const SCHOOL_KEY = 'classmates_school';
  const STAFF_PASSWORD_KEY = 'classmates_staff_pwd';
  const DEFAULT_SCHOOL_NAME = 'South Lodge Primary';
  const DEFAULT_STAFF_PASSWORD = 'classmates2026';

  function normalizeName(name) {
    return String(name || '').trim();
  }

  function getSchoolName() {
    return storageGetItem(SCHOOL_KEY) || DEFAULT_SCHOOL_NAME;
  }

  function setSchoolName(name) {
    const normalized = normalizeName(name);
    if (!normalized) return getSchoolName();
    storageSetItem(SCHOOL_KEY, normalized);
    return normalized;
  }

  function getStaffPassword() {
    return storageGetItem(STAFF_PASSWORD_KEY) || DEFAULT_STAFF_PASSWORD;
  }

  function updateStaffPassword(currentPassword, nextPassword) {
    if (currentPassword !== getStaffPassword()) {
      return { ok: false, error: 'Current password incorrect' };
    }

    if (String(nextPassword || '').length < 4) {
      return { ok: false, error: 'New password too short' };
    }

    storageSetItem(STAFF_PASSWORD_KEY, String(nextPassword));
    return { ok: true, password: String(nextPassword) };
  }

  window.ClassmatesSettings = {
    DEFAULT_SCHOOL_NAME: DEFAULT_SCHOOL_NAME,
    DEFAULT_STAFF_PASSWORD: DEFAULT_STAFF_PASSWORD,
    getSchoolName: getSchoolName,
    setSchoolName: setSchoolName,
    getStaffPassword: getStaffPassword,
    updateStaffPassword: updateStaffPassword
  };
})();
