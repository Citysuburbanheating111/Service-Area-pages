/* Mobile menu for the shared header (.site-head.rsp). Desktop dropdowns are pure CSS (hover + focus). */
(function(){
  document.querySelectorAll('.site-head').forEach(function(head){
    var burger=head.querySelector('.burger');
    if(burger){
      burger.addEventListener('click',function(){
        var open=!head.classList.contains('open');
        head.classList.toggle('open',open);
        burger.setAttribute('aria-expanded',open);
      });
    }
    head.querySelectorAll('.subtog').forEach(function(btn){
      btn.addEventListener('click',function(){
        var li=btn.parentNode,open=!li.classList.contains('open');
        li.classList.toggle('open',open);
        btn.setAttribute('aria-expanded',open);
      });
    });
    document.addEventListener('keydown',function(e){
      if(e.key==='Escape'&&head.classList.contains('open')){head.classList.remove('open');if(burger){burger.setAttribute('aria-expanded','false');burger.focus();}}
    });
  });
})();
