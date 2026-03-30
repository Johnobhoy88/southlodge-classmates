(function(){
  function escapeHtml(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function csvEscape(value) {
    const text = String(value == null ? '' : value);
    if (/[",\n]/.test(text)) {
      return '"' + text.replace(/"/g, '""') + '"';
    }
    return text;
  }

  function getReportDateLabel() {
    return new Date().toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  }

  function buildPupilReportHtml(name) {
    const detail = ClassmatesTeacherSummary.getPupilDetail(name);
    const schoolName = ClassmatesSettings.getSchoolName();
    const recommendation = detail.recommendedNextStep;
    const statHtml = detail.reportStats.map(function(stat){
      return '<div class="stat"><span class="stat-v">' + escapeHtml(stat.value) + '</span><span class="stat-l">' + escapeHtml(stat.label) + '</span></div>';
    }).join('');
    const recommendationHtml = recommendation
      ? '<div style="margin-top:16px;padding:12px 16px;border-radius:12px;background:#eefbf5;border:1px solid #c8ead5"><div style="font-size:0.75rem;font-weight:700;color:#11998e;margin-bottom:4px">Next Best Step</div><div style="font-size:1rem;font-weight:700;color:#2d3436">' + escapeHtml(recommendation.summaryText) + '</div><div style="margin-top:4px;color:#636e72;font-size:0.8rem">Status: ' + escapeHtml(recommendation.status) + ' · Trend: ' + escapeHtml(recommendation.recentTrend) + ' · ' + escapeHtml(recommendation.supportText) + '</div></div>'
      : '';

    return '<!DOCTYPE html><html><head><title>Pupil Report</title><style>@page{margin:20mm}body{font-family:Arial,sans-serif}h1{color:#11998e;font-size:1.3rem}h2{font-size:1rem;color:#2d3436;border-bottom:1px solid #ddd;padding-bottom:4px}.meta{color:#636e72;font-size:0.9rem}.stat{display:inline-block;background:#f0f0f0;padding:8px 16px;border-radius:8px;margin:4px;text-align:center}.stat-v{font-size:1.5rem;font-weight:800;color:#11998e;display:block}.stat-l{font-size:0.7rem;color:#888}</style></head><body><h1>' + escapeHtml(schoolName) + '</h1><p class="meta">Progress Report — ' + escapeHtml(getReportDateLabel()) + '</p><h2>' + escapeHtml(detail.name) + '</h2><div>' + statHtml + '</div>' + recommendationHtml + '</body></html>';
  }

  function buildClassReportHtml() {
    const schoolName = ClassmatesSettings.getSchoolName();
    const headers = ClassmatesTeacherSummary.getProgressHeaders();
    const rows = ClassmatesTeacherSummary.listProgressRows();
    const recommendations = ClassmatesTeacherSummary.listRecommendedNextSteps(5);
    let tableHtml = '<p>No pupils registered.</p>';
    let recommendationHtml = '';

    if (rows.length > 0) {
      const headerHtml = headers.map(function(header){
        return '<th>' + escapeHtml(header) + '</th>';
      }).join('');

      const bodyHtml = rows.map(function(row){
        return '<tr><td>' + escapeHtml(row.name) + '</td><td>' + escapeHtml(row.cells[1]) + '</td><td>' + escapeHtml(row.cells[2]) + '</td><td>' + escapeHtml(row.cells[3]) + ' words</td><td>' + escapeHtml(row.cells[4]) + ' questions</td><td>' + escapeHtml(row.cells[5]) + '</td><td>' + escapeHtml(row.cells[6]) + '</td><td>' + escapeHtml(row.cells[7]) + '</td><td>' + escapeHtml(row.cells[8]) + ' days</td><td>' + escapeHtml(row.cells[9]) + '</td></tr>';
      }).join('');

      tableHtml = '<table border="1" cellpadding="6" cellspacing="0" style="border-collapse:collapse;width:100%;font-size:0.85rem"><thead><tr style="background:#11998e;color:white">' + headerHtml + '</tr></thead><tbody>' + bodyHtml + '</tbody></table>';
    }

    if (recommendations.length > 0) {
      recommendationHtml = '<div style="margin:16px 0;padding:12px 16px;border-radius:12px;background:#eefbf5;border:1px solid #c8ead5"><div style="font-size:0.8rem;font-weight:700;color:#11998e;margin-bottom:8px">Recommended Next Steps</div>' + recommendations.map(function(item){
        return '<div style="padding:4px 0 8px;border-bottom:1px solid #d7efe0"><div style="display:flex;justify-content:space-between;gap:12px;font-size:0.82rem"><div><span style="font-weight:700;color:#2d3436">' + escapeHtml(item.pupilName) + '</span><span style="color:#636e72"> — ' + escapeHtml(item.packTitle) + '</span></div><div style="color:#11998e;font-weight:700;text-align:right">' + escapeHtml(item.actionLabel) + '</div></div><div style="font-size:0.72rem;color:#636e72;margin-top:4px">' + escapeHtml(item.summaryText) + '</div></div>';
      }).join('') + '</div>';
    }

    return '<!DOCTYPE html><html><head><title>Progress Report</title><style>@page{size:landscape;margin:20mm}body{font-family:Arial,sans-serif}h1{color:#11998e;font-size:1.5rem}.meta{color:#636e72;font-size:0.9rem;margin-bottom:16px}table{margin-top:16px}th,td{text-align:left}</style></head><body><h1>' + escapeHtml(schoolName) + ' — Classmates Progress Report</h1><p class="meta">' + escapeHtml(getReportDateLabel()) + '</p>' + recommendationHtml + tableHtml + '</body></html>';
  }

  function buildProgressCsv() {
    const rows = [
      ['Name', 'Stars', 'Games', 'Streak', 'Spelling Correct', 'Maths Correct', 'Tables Completed', 'Stories Read', 'Badges Earned', 'Last Active']
    ];
    const progressRows = ClassmatesTeacherSummary.listProgressRows();

    progressRows.forEach(function(row){
      rows.push(row.csvCells.slice());
    });

    if (progressRows.length === 0) {
      rows.push(['No pupils', '', '', '', '', '', '', '', '', '']);
    }

    return rows.map(function(row){
      return row.map(csvEscape).join(',');
    }).join('\n');
  }

  function createCsvFileName() {
    return 'classmates-progress-' + new Date().toISOString().slice(0, 10) + '.csv';
  }

  window.ClassmatesTeacherReports = {
    buildPupilReportHtml: buildPupilReportHtml,
    buildClassReportHtml: buildClassReportHtml,
    buildProgressCsv: buildProgressCsv,
    createCsvFileName: createCsvFileName
  };
})();
