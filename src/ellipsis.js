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
  content: '';
  display: block;
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

  let cls = node.getAttribute('class');
  let textHeight = node.clientHeight;
  let textIndents = () => {
    let margin = 'margin:' + getComputedStyle(node).margin + ';';
    let padding = 'padding' + getComputedStyle(node).padding + ';';
    return margin + padding;
  }

  // tester node
  let tester = document.createElement('span');
  let viewportWidth;
  let viewportHeight;

  // Make Shadow
  let shadowParagraph = node.cloneNode(true);
  document.body.append(shadowParagraph)
  shadowParagraph.innerText = node.innerText

  // Height tester
  function measureSize() {
    node.append(tester)
    tester.style.cssText = fillStyle + textIndents()

    viewportWidth = tester.clientWidth
    viewportHeight = tester.clientHeight


    shadowParagraph.style.width = viewportWidth + 'px'

    calc()
  }


  // define styles
  node.style.position = 'unset';
  node.parentNode.style.position = 'relative';


  function calc(){

    let overflowRatio = viewportHeight / ( textHeight / 100);

    if(shadowParagraph.clientHeight <= viewportHeight){
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
    let string = node.innerText.substr(0, lenght - cutLenght) + overflowBadge;

    let ellipsisParagraph = document.createElement('p');
    ellipsisParagraph.innerText = string
    ellipsisParagraph.setAttribute('class', cls);
    ellipsisParagraph.setAttribute('ariaHidden', true)
    node.style.cssText = visibilityHidden
    node.after(ellipsisParagraph)
  }

  // resizeObserver(node)
  // console.log(node.clientHeight)
  let ro = new ResizeObserver(() => measureSize())

  ro.observe(node);

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

