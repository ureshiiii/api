fetch("https://api.ureshii.my.id/server-stat")
  .then(response => response.json())
  .then(data => {
    const totalRequest = data.summary?.totalRequests || 0;
    const totalVisitor = data.visitors?.length || 0;
    const totalEndpoint = data.endpoints?.total || 0;
    const dailyRequest = Array.isArray(data.dailyRequests) ? data.dailyRequests.length : 0;
    const statsMenus = document.querySelectorAll('.hero-stats-menu b');
    if (statsMenus.length >= 4) {
      statsMenus[0].textContent = totalRequest;
      statsMenus[1].textContent = totalVisitor;
      statsMenus[2].textContent = totalEndpoint;
      statsMenus[3].textContent = dailyRequest;
    }
  })
  .catch(error => {
    document.querySelectorAll('.hero-stats-menu b').forEach(el => el.textContent = 0);
  });