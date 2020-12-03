const visibilityHidden = `
  position:absolute;
  left:0;
  top:-100%;
  margin:1px 0 0;
  border:none;
  opacity:0;
  visibility:hidden;
  pointer-events:none;`

export function ellipsis(node, {
  cutLenght = 0,
  overflowBadge = '…'
}={} ) {
  const text = node.innerText;
  const textLenght = text.length;

  let cls = node.getAttribute('class');
  let textHeight = node.clientHeight;
  let viewportWidth = node.clientWidth;

  // Make Shadow
  let shadowParagraph = node.cloneNode(true);
  shadowParagraph.style.width = viewportWidth + 'px';
  document.body.append(shadowParagraph)
  shadowParagraph.innerText = text

  // Wrapper
  let wrap = document.createElement('div');
  wrap.style.height = '100%';
  node.before(wrap)
  wrap.append(node)


  function calc(){
    // Define container height;
    let viewportHeight = wrap.clientHeight;
    let overflowRatio = viewportHeight / ( textHeight / 100);

      console.log(wrap)
      console.log(shadowParagraph)
      console.log(shadowParagraph.clientHeight)
      console.log(viewportHeight)

    if(shadowParagraph.clientHeight <= viewportHeight){
      // revert
      // event
    } else {
      let sliceLenght = Math.round(textLenght / 100 * overflowRatio);

      sliceString(sliceLenght)
    }
  }

  function sliceString(lenght, prevOverflow) {
    let viewportHeight = wrap.clientHeight;
    let string = text.substr(0, lenght) + overflowBadge;
    let textHeight;

    shadowParagraph.innerText = string
    textHeight = shadowParagraph.clientHeight

    // for strin decrease
    if( textHeight > viewportHeight ){
      if( prevOverflow == false ){
        cutText(--lenght)
      } else {
        sliceString(--lenght, true)
      }
    }

    // for string increase
    if( textHeight <= viewportHeight ){
      if( prevOverflow == true ) {
        cutText(lenght)
      } else {
        sliceString(++lenght, false)
      }
    }
  }

  function cutText(lenght){
    let string = text.substr(0, lenght - cutLenght) + overflowBadge;
    node.innerText = string

    let ellipsisParagraph = document.createElement('p');
    ellipsisParagraph.innerText = string
    ellipsisParagraph.setAttribute('class', cls);
    wrap.append(ellipsisParagraph)
  }

  // resizeObserver(node)
  // console.log(node.clientHeight)
  let ro = new ResizeObserver(() => calc())

  ro.observe(wrap);

  return {
    destroy() {
      // 	node.removeEventListener('touchstart', onDown);
    }
  };
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

