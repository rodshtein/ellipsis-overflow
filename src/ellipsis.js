import { tick } from 'svelte';
const visibilityHidden = `
  position:absolute;
  left:0;
  top:-100%;
  border:none;
  opacity:0;
  visibility:hidden;
  pointer-events:none;`

export default function ellipsis(node, {
  cutLength = 0,
  overflowBadge = '…',
  affectNode = null,
  sliceAfter = /\p{Letter}/u // only after any letter
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
      nodesContainer.style.cssText = visibilityHidden
      document.body.append(nodesContainer)
      window.__ellipsisNodesContainer = nodesContainer
    }
  }

  // First init stack
  init()


  // Main stack runner
  async function init(){
    if(await checkOverflow()){
      createHiddenContainer()
      cloneNode()
      setParagraphRuler()
      runCalc()
    } else {
      setResizeObserver()
      setMutationObserver()
    }
  }


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

  function affectNodeControl(action){
    if(action == 'hide') {
      affectNode.style.display = 'none'
      affectNodeIsHidden = true
    }

    if(action == 'show') {
      affectNode.style.display = affectNodeStyle
      affectNodeIsHidden = false
    }
  }

  async function checkOverflow() {
    let target;

    // If it's second launch we already have next clone
    if(typeof clone == 'object') {
      target = clone
      clone.textContent = node.textContent
    } else {
      target = node
    }

    // Before check set overflow
    if(affectNodeIsHidden) affectNodeControl('show')

    if( target.clientHeight < target.scrollHeight ) {
      // If is overflow we try to remove affected node
      if( affectNode ) {
        affectNodeControl('hide')
        if( target.clientHeight < target.scrollHeight ) {
          // If affected node hiding is no affected
          // set is visible back
          affectNodeControl('show')
          dispatchEvent( 'overflow', true );
          return true
        } else {
          // If affected node hiding is affected
          dispatchEvent( 'overflow', false );
          return false
        }

      } else {
        dispatchEvent( 'overflow', true );
        return true
      }

    } else {
      // If is no overflow
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
    // kill slicer if we have new cycle
    if(currCycle != sliceCycle)  return

    let string = node.textContent.substr(0, length) + overflowBadge;
    paragraphRuler.textContent = string

    // for string decrease
    if( paragraphRuler.clientHeight > clone.clientHeight ){
      if( isOverflow == false ){
        addShortText(--length)
      } else {
        setTimeout(()=>sliceString(--length, true, currCycle), 20)
        // sliceString(--length, true, currCycle)
      }
    }

    // for string increase
    if( paragraphRuler.clientHeight <= clone.clientHeight ){
      if( isOverflow == true ) {
        addShortText(length)
      } else {
        // setTimeout(()=>sliceString(++length, false, currCycle), 20)
        sliceString(++length, false, currCycle)
      }
    }
  }



  // Finish painter
  function addShortText(length){
    // slice last symbol by pattern
    while (!sliceAfter.test(node.textContent[length -1])) { --length }
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
        setTimeout(async ()=>{
          // We start script all only if text node have overflow
          // We have two strategies based on is it launched or not
          // Check for launched
          if(typeof clone == 'object'){
            // Always set max content for expand paragraph to max size
            // Before that remove resize observer because it can make cycle
            resizeObserver.disconnect()

            if(await checkOverflow()) {
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