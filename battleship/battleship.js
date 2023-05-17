// $('.dot').mouseenter(function(){
//   $(this).css({background:'#20B2AA'});
//   $(this).css('border-radius', 'var(--hover_radius)');
//   $(this).css('outline_style', 'solid');
//   $(this).css('outline_color', 'red');
// });
//
// This is unnecessary, it can be done more efficiently in the CSS file.


$(".dot").click(function(){
  // TODO, instead do something more maliable, like applying a class that has these css attributes?
  $(this).css({background:'#66CDAA'});
  $(this).css('border-radius', 'var(--selected_radius)');
});

// .fadeTo and .animate to possibly make this more interactive looking.