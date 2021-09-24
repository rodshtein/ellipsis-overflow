<script>
  import ellipsis from './ellipsis.js'

  let headerText = 'Twenty Thousand Leagues Under the Sea';
  let txt1 = `
  The novel was originally serialized from March 1869 through June 1870 in Pierre-Jules Hetzel's fortnightly periodical, the Magasin d'éducation et de récréatioewq.213---323l..432./.n. A deluxe octavo .213---323l..edition, publi213---323l..,shed by Hetzel in Nov213---323l..,ember 1871, inc213---323l..,luded 111 illustr213---323l..,ations.213---323l..,,`;
  let txt22 = `
    The novel was originally serialized from March 1869 through June 1870 in Pierre-Jules Hetzel's fortnightly periodical, the Magasin d'éducation et de récréation. A deluxe octavo edition, published by Hetzel in November 1871, included 111 illustrations by Alphonse de Neuville and Édouard Riou.[1] The book was widely acclaimed on its release and remains so; it is regarded as one of the premiere adventure novels and one of Verne's greatest works, along with Around the World in Eighty Days and Journey to the Center of the Earth. Its depiction of Captain Nemo's underwater ship, the Nautilus, is regarded as ahead of its time, since it accurately describes many features of today's submarines, which in the 1860s were comparatively primitive vessels.`;
  let txt2 = `
    The title refers to the distance traveled under the various seas and not to any depth attained, since 20,000 leagues (80,000 km) is nearly twice the circumference of the Earth;[6] the greatest depth reached in the novel is four leagues. This distinction becomes clearer when the book's French title is correctly translated: rendered literally, it should read "Twenty Thousand Leagues Under the Seas" (not "Sea"). The book employs metric leagues, which are four kilometers each.`;
  let paintedText = txt1;
  let textNode;
  let headerNode;
  let state = 1;
  let headerSize = 21;
  let textFill = 100;
  let cardHeight = 380;
  let cardWidth = 184;
  let affectNode;

  function handler(){
    paintedText = state == 1 ? txt2 : txt1;
    // nodeEl.style.fontWeight = state == 1 ? '800' : '400';
    // nodeEl.style.fontSize = state == 1 ? '36px' : '28px';
    state = state == 1 ? 2 : 1;
  }

  let hideBtn = false;

  function eventHandler(e){
    if(e.detail.type == "overflow") {
      hideBtn = !e.detail.status;
    }
  }


</script>


<div>
  <div
    on:click = {handler}
    style="height:{cardHeight}px; width:{cardWidth}px"
    class='card'

    >
    <h2
      bind:this={headerNode}
      style="font-size:{headerSize}px"
    >
      { headerText }
    </h2>

    <p
      class='text'
      use:ellipsis={{ overflowBadge:'…', affectNode: affectNode }}
      bind:this={textNode}
      on:update={eventHandler}
    >
      { paintedText.substr(0, paintedText.length / 100 * textFill) }
    </p>

    <button
      bind:this={affectNode}
      style = "display:{hideBtn  ? 'none' : ''}"
    >
      Full article
    </button>
  </div>



  <div class='interface'>
    <label>
      Header Size {headerSize}
      <input
        type="range"
        min="12"
        max="60"
        bind:value={headerSize}
      >
    </label>
    <label>
      Text Fill {textFill}%
      <input
        type="range"
        min="1"
        max="100"
        step="1"
        bind:value={textFill}
      >
    </label>
    <label>
      Card Width {cardWidth}px
      <input
        type="range"
        min="150"
        max="450"
        step="1"
        bind:value={cardWidth}
      >
    </label>
    <label>
      Card Height {cardHeight}px
      <input
        type="range"
        min="250"
        max="600"
        step="1"
        bind:value={cardHeight}
      >
    </label>
  </div>
</div>

<style>
/* Base styles */
.card {
  display: grid;
  grid-auto-flow: row;
  justify-items: left;
  width: 208px;
  height: 380px;
  padding: 30px 15px 10px;
}

.card {
  background-color: rgb(245, 245, 233);
}

p {
  overflow: hidden;
}

/* Decoration styles */
h2 {
  font-weight: 900;
}

label {
  width: 100%;
  display: block;
}
input {
  display: block;
}
</style>
