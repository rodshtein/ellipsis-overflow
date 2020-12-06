const visibilityHidden = `
  position:absolute;
  left:0;
  top:-100%;
  border:none;
  opacity:0;
  visibility:hidden;
  pointer-events:none;`

const fillStyle = `
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;`

export function ellipsis(node, {
  cutLength = 0,
  overflowBadge = '…'
}={} ) {
  let text = '';
  let firstInit = true;
  let viewportWidth;
  let viewportHeight;

  // Make Shadow
  let shadowParagraph = node.cloneNode(true);
  document.body.append(shadowParagraph)

  function getParagraphMargins(){
    let margin = 'margin:' + getComputedStyle(node).margin + ';';
    let padding = 'padding' + getComputedStyle(node).padding + ';';
    return margin + padding;
  }

  // create new paragraph
  let ellipsisParagraph = node.cloneNode(true);
  ellipsisParagraph.setAttribute('ariaHidden', true)
  ellipsisParagraph.style.position = 'unset';
  node.before(ellipsisParagraph)
  node.parentNode.style.position = 'relative';
  node.style.cssText = visibilityHidden

  // create and set tester node
  let sizeHolder = document.createElement('span');

  // Height tester
  function measureSize() {
    text = node.textContent
    ellipsisParagraph.append(sizeHolder)
    sizeHolder.style.cssText = fillStyle + getParagraphMargins()
    viewportWidth = sizeHolder.clientWidth
    viewportHeight = sizeHolder.clientHeight
    shadowParagraph.style.width = viewportWidth + 'px'
    calc()
  }

  function calc(){
    let overflowRatio = viewportHeight / ( node.clientHeight / 100);
    shadowParagraph.innerText = text
    if(shadowParagraph.clientHeight <= viewportHeight && firstInit ){
      firstInit = false
      // revert
      // event
    } else {
      sliceString(Math.round(text.length / 100 * overflowRatio))
    }
  }

  function sliceString(length, prevOverflow) {
    let string = text.substr(0, length) + overflowBadge;
    let textHeight;

    shadowParagraph.innerText = string
    textHeight = shadowParagraph.clientHeight

    // for string decrease
    if( textHeight > viewportHeight ){
      if( prevOverflow == false ){
        addShortText(--length)
      } else {
        sliceString(--length, true)
      }
    }

    // for string increase
    if( textHeight <= viewportHeight ){
      if( prevOverflow == true ) {
        addShortText(length)
      } else {
        sliceString(++length, false)
      }
    }
  }

  function addShortText(length){
    ellipsisParagraph.innerText = text.substr(0, length - cutLength) + overflowBadge;
  }

  // resizeObserver(node)
  let isThrottle = false;
  let queue = false;

  let ro = new ResizeObserver(() => {
    if (!isThrottle){
      measureSize()
      isThrottle = true

      setTimeout(()=>{
        if (queue) {
          measureSize()
          console.log('ЗАЕБАЛА!!!')
          queue = false
        }
        isThrottle = false
      }, 300)
    } else {
      queue = true
    }
  })

  let mo = new MutationObserver(measureSize)

  // measureSize()
  ro.observe(ellipsisParagraph);
  mo.observe(node, {
    attributes: true,
    characterData: true,
    subtree: true,
  });

  return {
    destroy() {
      // 	node.removeEventListener('touchstart', onDown);
    }
  };
}


function throttle(func, ms) {

  let isThrottled = false,
    savedArgs,
    savedThis;

  function wrapper() {

    if (isThrottled) {
      // запоминаем последние аргументы для вызова после задержки
      savedArgs = arguments;
      savedThis = this;
      return;
    }

    // в противном случае переходим в состояние задержки
    func.apply(this, arguments);

    isThrottled = true;

    // настройка сброса isThrottled после задержки
    setTimeout(function() {
      isThrottled = false;
      if (savedArgs) {
        // если были вызовы, savedThis/savedArgs хранят последний из них
        // рекурсивный вызов запускает функцию и снова устанавливает время задержки
        wrapper.apply(savedThis, savedArgs);
        savedArgs = savedThis = null;
      }
    }, ms);
  }

  return wrapper;
}

function resizeObserver(node, handler){
  let frame = document.createElement('iframe');
  frame.style.cssText = `
    position:absolute;
    left:0;
    top:-100%;
    width:100%;
    height:100%;
    margin:1px 0 0;
    border:none;
    opacity:0;
    visibility:hidden;
    pointer-events:none;`;
  frame.setAttribute('aria-hidden', true)
  frame.setAttribute('tabindex', '-1')
  frame.setAttribute('src', 'about:blank')
  node.appendChild(frame)

  console.log('height: ' + frame.clientHeight)

  frame.contentWindow.onresize = () => {
    console.log('height: ' + frame.clientHeight)
    // 		handler.call(node.parentNode)
  };
}