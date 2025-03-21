document.addEventListener('DOMContentLoaded', function() {
  const colors = ['#F7F2FA', '#E8DFF5', '#CBB7E6', '#A18CD1'];
  for (let i = 0; i < 11; i++) {
    const circle = document.createElement('div');
    circle.className = 'deco-circle';
    circle.style.width = Math.random() * 200 + 100 + 'px';
    circle.style.height = circle.style.width;
    circle.style.left = Math.random() * 90 + '%';
    circle.style.top = Math.random() * 90 + '%';
    circle.style.background = colors[Math.floor(Math.random() * colors.length)];
    document.body.appendChild(circle);
    animateCircle(circle);
  }

  function animateCircle(circle) {
    let x = 0;
    let y = 0;
    let speedX = Math.random() * 2 - 1;
    let speedY = Math.random() * 2 - 1;
    function animate() {
      x += speedX;
      y += speedY;
      circle.style.left = x + 'px';
      circle.style.top = y + 'px';
      if (x < 0 || x > window.innerWidth) speedX = -speedX;
      if (y < 0 || y > window.innerHeight) speedY = -speedY;
      requestAnimationFrame(animate);
    }
    animate();
  }
});
