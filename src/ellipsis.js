const visibilityHidden = `
  position:absolute;
  left:0;
  top:-100%;
  border:none;
  opacity:0;
  visibility:hidden;
  pointer-events:none;`

export function ellipsis(node, {
  cutLength = 0,
  overflowBadge = '…'
}={} ) {
  let paragraphRuler, clone;
  let sliceCycle = 0;
  let resizeObserverBlankRun = true;

  // Observers
  let resizeObserver = new ResizeObserver(resizeReCalc)
  let mutationObserver = new MutationObserver(mutationReCalc)

  // Events
  let event = (data) => new CustomEvent( "update", { detail: data });

  // init hidden nodes container
  let nodesContainer = window.__ellipsisNodesContainer;
  if(!nodesContainer){
    nodesContainer = document.createElement('div')
    nodesContainer.setAttribute('ariaHidden', true)
    nodesContainer.setAttribute('id', 'ellipsisNodesContainer')
    nodesContainer.style.cssText = visibilityHidden
    document.body.append(nodesContainer)
    window.__ellipsisNodesContainer = nodesContainer
  }

  // First init stack
  cloneNode()
  setParagraphRuler()
  if(oneLineCheck()) calc()


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


  // Set height calc paragraph
  function setParagraphRuler(){
    if(typeof paragraphRuler == 'object') paragraphRuler.remove()
    paragraphRuler = node.cloneNode(true)
    nodesContainer.append(paragraphRuler)
  }

  // Check for is only one line
  function oneLineCheck(){
    // We need to set pre-line whitespace for make two line paragraph
    // Before that let's store inline whitespace style
    let spaceStyle = paragraphRuler.style.whiteSpace;
    paragraphRuler.style.whiteSpace = 'pre-line'
    paragraphRuler.textContent = `1\n2`

    console.log(paragraphRuler.clientHeight)
    console.log(clone.clientHeight)

    if(paragraphRuler.clientHeight > clone.clientHeight){
      node.dispatchEvent(event({type: "overflow", status: false}));
      return false
    } else {
      node.dispatchEvent(event({type: "overflow", status: true}));
      // Reset inline style back
      paragraphRuler.style.whiteSpace = spaceStyle
      return true
    }
  }

  // Calc init
  function calc(){
    // Set clone width to 100% for measure all available space
    // before that remember inline styles
    let cloneStyleWidth = clone.style.width;
    clone.style.width = '100%'
    // We subtract one pixel because chrome
    // always round client* sizes upwards
    // but for paragraph height calc it use real sizes
    paragraphRuler.style.width = clone.clientWidth - 1 + 'px'
    // restore styles
    clone.style.width = cloneStyleWidth


    // We always reset text to measure the height difference
    paragraphRuler.textContent = node.textContent

    if(clone.clientHeight < clone.scrollHeight) {
      let ratio = clone.clientHeight / ( clone.scrollHeight / 100);
      sliceString(Math.round(node.textContent.length / 100 * ratio))
    }
  }


  // Recursive calc function
  function sliceString(length, isOverflow, currCycle = false) {
    currCycle = currCycle ? currCycle : ++sliceCycle;

    let string = node.textContent.substr(0, length) + overflowBadge;
    let textHeight;

    // kill slicer if we have new cycle
    if(currCycle != sliceCycle)  return
    // console.log(currCycle)

    paragraphRuler.textContent = string
    textHeight = paragraphRuler.clientHeight

    // for string decrease
    if( textHeight > clone.clientHeight ){
      if( isOverflow == false ){
        addShortText(--length)
      } else {
        // setTimeout(()=>sliceString(--length, true, currCycle), 30)
        sliceString(--length, true, currCycle)
      }
    }

    // for string increase
    if( textHeight <= clone.clientHeight ){
      if( isOverflow == true ) {
        addShortText(length)
      } else {
        // setTimeout(()=>sliceString(++length, false, currCycle), 30)
        sliceString(++length, false, currCycle)
      }
    }
  }

  // Finish painter
  function addShortText(length){
    clone.textContent = node.textContent.substr(0, length - cutLength) + overflowBadge;
    setResizeObserver()
  }

  // Mutation re calc stack
  let mutationDebounce = false;
  function mutationReCalc(){
    if (!mutationDebounce){
      mutationDebounce = true
      setTimeout(()=>{
        // By any mutation we replace old clone
        // and ruler as it easy way to set right styles and sizes
        // Before that remove resize observer because it can make cycle
        resizeObserver.disconnect()
        cloneNode()
        setParagraphRuler()
        if(oneLineCheck()) calc()
        mutationDebounce = false
      }, 300)
    }
  }

  // Observer init wrapper for prevent blank run stack scripts
  function setResizeObserver(){
    resizeObserverBlankRun = true
    resizeObserver.observe(clone)
  }


  // Resize Observer Function
  let resizeDebounce = false;
  function resizeReCalc(){
    // Prevent blank run that initiated by an observer
    if(resizeObserverBlankRun){
      resizeObserverBlankRun = false;
    } else {
      if (!resizeDebounce){
        resizeDebounce = true
        setTimeout(()=>{
          // Always set max content for expand paragraph to max size
          // Before that remove resize observer because it can make cycle
          resizeObserver.disconnect()
          clone.textContent = node.textContent
          calc()
          resizeDebounce = false
        }, 300)
      }
    }
  }

  // Set Mutation Observer
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