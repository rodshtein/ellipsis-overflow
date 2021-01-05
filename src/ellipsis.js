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
  let paragraphRuler, clone;
  let sizeRuler = document.createElement('span');
  let sliceCycle = 0;
  let resizeObserverBlankRun = true;

  // Prepare parent node
  node.parentNode.style.position = 'relative';

  // Observers
  let resizeObserver = new ResizeObserver(resizeReCalc)
  let mutationObserver = new MutationObserver(mutationReCalc)

  // init node container
  let nodesContainer = window.__ellipsisNodeContainer;
  if(!nodesContainer){
    nodesContainer = document.createElement('div')
    nodesContainer.setAttribute('ariaHidden', true)
    nodesContainer.setAttribute('id', 'ellipsisNodeContainer')
    nodesContainer.style.cssText = visibilityHidden
    document.body.append(nodesContainer)
    window.__ellipsisNodeContainer = nodesContainer
  }

  // First init stack
  cloneNode()
  setSizeRuler()
  setParagraphRuler()
  calc()


  // Create ellipsis paragraph
  function cloneNode(){
    let _clone = node.cloneNode(true);
    _clone.style.position = 'unset';

    if(typeof clone == 'object') {
      clone.before(_clone)
      clone.remove();
      clone = _clone;
    } else {
      clone = _clone;
      node.before(clone)
      nodesContainer.append(node)
    }
  }


  // Set Size Ruler
  function setSizeRuler(){
    sizeRuler.style.cssText = fillStyle + getParagraphMargins(node)
    clone.append(sizeRuler)
  }


  // Set height calc paragraph
  function setParagraphRuler(){
    if(typeof paragraphRuler == 'object') paragraphRuler.remove()
    paragraphRuler = node.cloneNode(true);
    nodesContainer.append(paragraphRuler)
  }


  // Calc init
  function calc(){
    // We subtract one pixel because chrome
    // always round client* sizes upwards
    // but for paragraph height calc it use real sizes
    paragraphRuler.style.width = sizeRuler.clientWidth - 1 + 'px'

    // We always reset text to measure the height difference
    paragraphRuler.textContent = node.textContent

    if(sizeRuler.clientHeight < paragraphRuler.clientHeight) {
      let ratio = sizeRuler.clientHeight / ( clone.clientHeight / 100);
      sliceString(Math.round(clone.textContent.length / 100 * ratio))
    }
  }


  // Recursive calc function
  function sliceString(length, isOverflow, currCycle = false) {
    currCycle = currCycle ? currCycle : ++sliceCycle;

    let string = node.textContent.substr(0, length) + overflowBadge;
    let textHeight;

    // kill slicer if we have new cycle
    if(currCycle != sliceCycle)  return

    paragraphRuler.textContent = string
    textHeight = paragraphRuler.clientHeight

    // for string decrease
    if( textHeight > sizeRuler.clientHeight ){
      if( isOverflow == false ){
        addShortText(--length)
      } else {
        sliceString(--length, true, currCycle)
      }
    }

    // for string increase
    if( textHeight <= sizeRuler.clientHeight ){
      if( isOverflow == true ) {
        addShortText(length)
      } else {
        sliceString(++length, false, currCycle)
      }
    }
  }

  // Finish painter
  function addShortText(length){
    clone.textContent = node.textContent.substr(0, length - cutLength) + overflowBadge;
    setSizeRuler()
    setResizeObserver(sizeRuler)
  }

  // Mutation recalc stack
  function mutationReCalc(){
    cloneNode()
    setSizeRuler()
    setParagraphRuler()
    calc()
  }

  // Observer init wrapper for prevent blank run stack scripts
  function setResizeObserver(target){
    resizeObserverBlankRun = true;
    resizeObserver.observe(target);
  }


  // Resize Observer
  let resizeDebounce = false;
  function resizeReCalc(){
    // Prevent blank run that initiated by an observer
    if(resizeObserverBlankRun){
      resizeObserverBlankRun = false;
    } else {
      if (!resizeDebounce){
        resizeDebounce = true
        setTimeout(()=>{
          calc()
          resizeDebounce = false
        }, 300)
      }
    }
  }


  mutationObserver.observe(node, {
    attributes: true,
    characterData: true,
    subtree: true,
  });

  return {
    destroy() { }
  };
}


function getParagraphMargins(paragraph){
  let margin = 'margin:' + getComputedStyle(paragraph).margin + ';';
  let padding = 'padding' + getComputedStyle(paragraph).padding + ';';
  return margin + padding;
}