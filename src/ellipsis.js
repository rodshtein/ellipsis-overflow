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
    // nodesContainer.style.cssText = visibilityHidden
    document.body.append(nodesContainer)
    window.__ellipsisNodesContainer = nodesContainer
  }

  // First init stack
  init()

  // Main stack runner
  function init(){
    if(checkOverflow()){
      console.log('launched')
      cloneNode()
      setParagraphRuler()
      runCalc()
    } else {
      console.log('waiting for overflow')
      setResizeObserver()
      setMutationObserver()
    }
  }


  // Create ellipsis paragraph
  function cloneNode(){
    let _clone = node.cloneNode(true);
    _clone.style.position = 'unset';

    if(typeof clone == 'object') {
      console.log('replace clone')
      clone.before(_clone)
      clone.remove();
      clone = _clone;
    } else {
      console.log('clone node')
      clone = _clone;
      node.before(clone)
      nodesContainer.append(node)
      setMutationObserver()
    }
  }


  // Set height calc paragraph
  function setParagraphRuler(){
    if(typeof paragraphRuler == 'object') paragraphRuler.remove()
    paragraphRuler = node.cloneNode(true)
    nodesContainer.append(paragraphRuler)
  }


  // Check for is only one line
  function OLD_oneLineCheck(){
    // We need to set pre-line whitespace for make two line paragraph
    // Before that let's store inline whitespace style
    let spaceStyle = paragraphRuler.style.whiteSpace;
    paragraphRuler.style.whiteSpace = 'pre-line'
    paragraphRuler.textContent = `1\n2`

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


  function checkOverflow() {
    console.log("checkOverflow")
    let target;

    if(typeof clone == 'object') {
      target = clone
      clone.textContent = node.textContent
    } else {
      target = node
    }

    return target.clientHeight < target.scrollHeight
  }

  function checkSafeLineHeight(){
    // Set tester text and store size
    paragraphRuler.textContent = `Lg`
    return clone.clientHeight >= paragraphRuler.clientHeight
  }


  // Calc init
  function runCalc(){
    console.log('runCalc')
    if(checkSafeLineHeight()) {
      let ratio = clone.clientHeight / ( clone.scrollHeight / 100);

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

      sliceString(Math.round(node.textContent.length / 100 * ratio))
    } else {
      setResizeObserver()
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


  // Set Mutation Observer
  function setMutationObserver(){
    mutationObserver.observe(node, {
      attributes: true,
      characterData: true,
      subtree: true,
    });
  }


  // Observer init wrapper for prevent blank run stack scripts
  function setResizeObserver(){
    resizeObserverBlankRun = true
    resizeObserver.observe(typeof clone == 'object' ? clone : node)
  }


  // Mutation re calc stack
  let mutationDebounce = false;
  function mutationReCalc(){
    if (!mutationDebounce){
      mutationDebounce = true
      setTimeout(()=>{
        console.log('mutationReCalc')
        // We don't check launched like in resizeObserver
        // because anyway run init (one strategy)

        // By any mutation we replace old clone
        // and ruler as it easy way to set right styles and sizes
        // Before that remove resize & mutation observers
        // because it can make cycle
        resizeObserver.disconnect()
        // mutationObserver.disconnect()
        init()
        mutationDebounce = false
      }, 300)
    }
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
          // We start script all only if text node have overflow
          // We have two strategies based on is it launched or not
          // Check for launched
          if(typeof clone == 'object'){
            // Always set max content for expand paragraph to max size
            // Before that remove resize observer because it can make cycle
            resizeObserver.disconnect()
            if(checkOverflow()) {
              runCalc()
            } else {
              // If it has no overflow set observer back
              setResizeObserver()
            }
          } else {
            init()
          }
          resizeDebounce = false
        }, 300)
      }
    }
  }



  return {
    destroy() {
      resizeObserver.disconnect()
      mutationObserver.disconnect()
      //TODO need to clean up nodes container, clones, and rulers
     }
  };
}