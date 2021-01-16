import { tick } from 'svelte';
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
  overflowBadge = '…',
  affectNode = null
}={} ) {
  let paragraphRuler, clone;
  let sliceCycle = 0;
  let resizeObserverBlankRun = true;

  // Store initial affect node style
  let affectNodeStyle = affectNode ? affectNode.style.display : null;
  let affectNodeIsHidden = false;

  // Observers
  let resizeObserver = new ResizeObserver(resizeReCalc)
  let mutationObserver = new MutationObserver(mutationReCalc)

  // Events
  let event = (data) => new CustomEvent( "update", { detail: data });

  // init hidden nodes container
  let nodesContainer = window.__ellipsisNodesContainer;

  function createHiddenContainer(){
    if(!nodesContainer){
      nodesContainer = document.createElement('div')
      nodesContainer.setAttribute('ariaHidden', true)
      nodesContainer.setAttribute('id', 'ellipsisNodesContainer')
      // nodesContainer.style.cssText = visibilityHidden
      document.body.append(nodesContainer)
      window.__ellipsisNodesContainer = nodesContainer
    }
  }

  // First init stack
  init()


  // Main stack runner
  async function init(){
    let overflow = checkOverflow();
    overflow.then((state) => {
      if(state){
        console.log('launched')
        createHiddenContainer()
        cloneNode()
        setParagraphRuler()
        runCalc()
      } else {
        console.log('waiting for overflow')
        setResizeObserver()
        setMutationObserver()
      }
    })
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


  async function dispatchEvent(type, status){
    await tick();
    node.dispatchEvent(event({type, status}));
  }

  async function checkOverflow() {
    console.log('overflow check')
    let target;

    if(typeof clone == 'object') {
      target = clone
      clone.textContent = node.textContent
    } else {
      target = node
    }

    if( target.clientHeight < target.scrollHeight ) {
      console.log('overflow true')
      // If is overflow we try to remove affected node

      if( affectNode ) {
        affectNode.style.display = 'none'
        if( target.clientHeight < target.scrollHeight ) {
          // After check we always set affect Node visible back
          affectNode.style.display = affectNodeStyle
          console.log('overflow true 1')
          dispatchEvent( 'overflow', true );
          return true
        } else {
          // After check we always set affect Node visible back
          affectNodeIsHidden = true;
          console.log('affected')
          dispatchEvent( 'affected', true );
          return false
        }
      } else {
        console.log('overflow true 2')
        dispatchEvent( 'overflow', true );
        return true
      }

    } else {
      console.log('overflow false')
      dispatchEvent( 'overflow', false );
      return false
    }
  }


  // Check that we have enough space for one line
  function checkSafeLineHeight(){
    // Set tester text and store size
    paragraphRuler.textContent = `Lg`
    return clone.clientHeight >= paragraphRuler.clientHeight
  }


  // Calc init
  function runCalc(){
    console.log('runCalc')
    // If we have enough space for one line
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
    console.log(currCycle)

    paragraphRuler.textContent = string
    textHeight = paragraphRuler.clientHeight

    // for string decrease
    if( textHeight > clone.clientHeight ){
      if( isOverflow == false ){
        addShortText(--length)
      } else {
        setTimeout(()=>sliceString(--length, true, currCycle), 30)
        // sliceString(--length, true, currCycle)
      }
    }

    // for string increase
    if( textHeight <= clone.clientHeight ){
      if( isOverflow == true ) {
        addShortText(length)
      } else {
        setTimeout(()=>sliceString(++length, false, currCycle), 30)
        // sliceString(++length, false, currCycle)
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
    update(props) {
      if(props.affectNode) affectNode = props.affectNode
    },

    destroy() {
      resizeObserver.disconnect()
      mutationObserver.disconnect()
      //TODO need to clean up nodes container, clones, and rulers
     }

  };
}