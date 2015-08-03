// Sourced from: 
// https://github.com/programminghistorian/jekyll/blob/gh-pages/js/codeblocks.js

$(document).ready(function() {
   $('.highlight').each(function() {
      var ts = Date.now();
      var btn = document.createElement('button');
      btn.setAttribute('type', 'button');
      btn.setAttribute('class', 'btn-code-select');
      btn.setAttribute('id', ts);
      
      // for Firefox
      btn.setAttribute('onclick', 'selectElementContents(this.nextSibling);');

      // for IE
      btn.onclick = function() {selectElementContents(this.nextSibling)};
      
      btn.innerHTML = 'Select <i class="fa fa-file-code-o fa-2x"></i>';
      this.insertBefore(btn, this.firstChild);
   });
});

// http://stackoverflow.com/a/8024509/1848454
function selectElementContents(el) {
  if (window.getSelection && document.createRange) {
    // IE 9 and non-IE
    var range = document.createRange();
    range.selectNodeContents(el);
    var sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
  } else if (document.body.createTextRange) {
    // IE < 9
    var textRange = document.body.createTextRange();
    textRange.moveToElementText(el);
    textRange.select();
  }
}

