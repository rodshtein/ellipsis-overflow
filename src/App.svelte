<script>
	import { ellipsis } from './ellipsis.js'
	let state = 1;
	let txt1 = `"Landlord," said I, going up to him as cool as Mt. Hecla in a snow-storm,—" landlord, stop whittling. You and I must understand one another, and that too without delay. I come to your house and want a bed; you tell me you can only give me half a one; that the other half belongs to a certain harpooner. And about this harpooner, whom I have not yet seen, you persist in telling me the most mystifying and exasperating stories, tending to beget in me an uncomfortable feeling towards the man who you design for my bedfellow—a sort of connection, landlord, which is an intimate and confidential one in the highest degree. I now demand of you to speak out and tell me who and what this harpooner is, and whether I shall be in all respects safe to spend the night with him. And in the first place, you will be so good as to unsay that story about selling his head, which if true I take to be good evidence that this harpooner is stark mad, and I've no idea of sleeping with a madman; and you, sir, you I mean, landlord, you, sir, by trying to induce me to do so knowingly, would thereby render yourself liable to a criminal prosecution."`
	let txt2 = `But there was no time for shuddering, for now the savage went about something that completely fascinated my attention, and convinced me that he must indeed be a heathen. Going to his heavy grego, or wrapall, or dreadnaught, which he had previously hung on a chair, he fumbled in the pockets, and produced at length a curious little deformed image with a hunch on its back, and exactly the colour of a three days' old Congo baby. Remembering the embalmed head, at first I almost thought that this black manikin was a real baby preserved in some similar manner. But seeing that it was not at all limber, and that it this little hunchbacked image, like a tenpin, between the andirons. The chimney jambs and all the bricks inside were very sooty, so that I thought this fireplace made a very appropriate little shrine or chapel for his Congo idol. I now screwed my eyes hard towards the half hidden image, feeling but ill at ease meantime—to see what was next to follow. First he takes about a double handful of shavings out of his grego pocket, and places them carefully before the idol; then laying a bit of ship biscuit on top and applying the flame from the lamp, he kindled the shavings into a sacrificial blaze. Presently, after many hasty snatches into the fire, and still hastier withdrawals of his fingers (whereby he seemed to be scorching them badly), he at last succeeded in drawing out the biscuit; then blowing off the heat and ashes a little, he made a polite offer of it to the little negro. But the little devil did not seem to fancy such dry sort of fare at all; he never moved his lips. All these strange antics were accompanied by still stranger guttural noises from the devotee, who seemed to be praying in a singsong or else singing some pagan psalmody or other, during which his face twitched about in the most unnatural manner. At last extinguishing the fire, he took the idol up very unceremoniously, and bagged it again in his grego pocket as carelessly as if he were a sportsman bagging a dead woodcock.`
	let text = txt1;
	let nodeEl;
	function handler(){
		console.log('click')
		text = state == 1 ? txt2 : txt1;
		nodeEl.style.fontWeight = state == 1 ? '800' : '400';
		nodeEl.style.fontSize = state == 1 ? '36px' : '28px';
		state = state == 1 ? 2 : 1;
	}
</script>
<div class='group'>
	<div class='section' on:click = {handler}>
		<p use:ellipsis bind:this = {nodeEl} >
			{text}
		</p>
	</div>
	<!-- <div class='section'>
		<p use:ellipsis >
			{text}
		</p>
	</div> -->
</div>


<style>
	.group {
		display: grid;
		grid-template-columns: 1fr 1fr;
	}
	.section {
		/* max-height: 243px; */
		height: 200px;
		overflow: hidden;
		background: beige;
	}
	p {
		margin: 0;
		padding: 0;
		font-size: 28px;
		position: relative;
		display: inline-block;
	}
</style>
