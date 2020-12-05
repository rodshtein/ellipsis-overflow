const visibilityHidden = `
  position:absolute;
  left:0;
  top:-100%;
  margin:1px 0 0;
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
  cutLenght = 0,
  overflowBadge = '…'
}={} ) {
  let firstInit = true;

  let text = node.innerText;
  let paragraphHeight = node.clientHeight;
  let paragraphMargins = 'margin:' + getComputedStyle(node).margin + ';';
  let viewportWidth;
  let viewportHeight;

  // create and set tester node
  let tester = document.createElement('span');
  node.append(tester)
  node.style.position = 'unset';
  node.parentNode.style.position = 'relative';

  // Make Shadow
  let shadowParagraph = node.cloneNode(true);
  document.body.append(shadowParagraph)
  shadowParagraph.innerText = text

  // Height tester
  function measureSize() {
    tester.style.cssText = fillStyle + paragraphMargins
    viewportWidth = tester.clientWidth
    viewportHeight = tester.clientHeight
    shadowParagraph.style.width = viewportWidth + 'px'
    calc()
  }

  function calc(){
    let overflowRatio = viewportHeight / ( paragraphHeight / 100);
    if(shadowParagraph.clientHeight <= viewportHeight && firstInit ){
      // revert
      // event
    } else {
      let sliceLenght = Math.round(node.innerText.length / 100 * overflowRatio);

      sliceString(sliceLenght)
    }
  }

  function sliceString(lenght, prevOverflow) {
    let string = node.innerText.substr(0, lenght) + overflowBadge;
    let textHeight;

    shadowParagraph.innerText = string
    textHeight = shadowParagraph.clientHeight

    // for strin decrease
    if( textHeight > viewportHeight ){
      if( prevOverflow == false ){
        addShortText(--lenght)
      } else {
        sliceString(--lenght, true)
      }
    }

    // for string increase
    if( textHeight <= viewportHeight ){
      if( prevOverflow == true ) {
        addShortText(lenght)
      } else {
        sliceString(++lenght, false)
      }
    }
  }

  function addShortText(lenght){
    console.log('add')
    let string = node.innerText.substr(0, lenght - cutLenght) + overflowBadge;
    node.innerText = string
    firstInit = false;
  }

  measureSize()

  // resizeObserver(node)
  let isThrottle = false;
  let queue = false;

  let ro = new ResizeObserver(() => {
    if (!isThrottle){
      measureSize()
      console.log('throttle')
      isThrottle = true
      queue = false
      setTimeout(()=>{
        if (queue) measureSize()
      }, 300)
    } else {
      console.log('queue')
      queue = true
    }
  })


  // ro.observe(node);

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