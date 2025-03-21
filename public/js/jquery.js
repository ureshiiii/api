$(document).ready(function() {
  $(".faq-question h5").click(function() {
    $(this).parent().toggleClass('active');
    $(this).next('.faq-answer').slideToggle('fast');
  });
});