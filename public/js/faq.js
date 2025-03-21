document.querySelectorAll('.faq-question h5').forEach(question => {
  question.addEventListener('click', (e) => {
    const faqQuestion = e.currentTarget.parentElement;
    const answer = faqQuestion.querySelector('.faq-answer');
    const isActive = faqQuestion.classList.contains('active');
    
    if (isActive) {
      answer.style.maxHeight = null;
    } else {
      answer.style.maxHeight = answer.scrollHeight + 'px';
    }
    
    if (!isActive) {
      requestAnimationFrame(() => {
        faqQuestion.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
          inline: 'nearest'
        });
      });
    }
    
    faqQuestion.classList.toggle('active');
  });
});