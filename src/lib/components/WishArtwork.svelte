<script lang="ts">
 let {wish,title}=$props<{wish:number;title:string}>();
</script>
<svg viewBox="0 0 320 250" role="img" aria-label={title} class="wish-artwork" data-wish-art={wish}>
 <defs><radialGradient id={'wish-glow-'+wish}><stop stop-color="#b78c50"/><stop offset="1" stop-color="#17313f"/></radialGradient></defs>
 <rect width="320" height="250" fill={'url(#wish-glow-'+wish+')'}/><ellipse cx="160" cy="221" rx="106" ry="13" fill="#10212b" opacity=".5"/>
 <g stroke="#503d2e" stroke-width="3" stroke-linejoin="round">
 {#if wish>=7}
 <g transform="rotate(-9 160 135)"><path d="M67 83H253V206H67Z" fill="#e8ce98"/><path d="M67 83 160 155 253 83M67 206 133 143M253 206 190 143" fill="none"/><path d="M90 100V47H230V100L160 149Z" fill="#f7e8bb"/><path d="M109 65H209M109 79H201M109 93H178" stroke="#99784f" stroke-width="3"/>{#if wish===8}<path d="M160 190C118 164 146 148 160 163C174 148 202 164 160 190Z" fill="#a34348" stroke="#813a3e"/>{:else}<circle cx="160" cy="178" r="17" fill="#88a593"/><path d="m149 178 8 7 15-18" fill="none" stroke="#f8edcc"/>{/if}</g>
 {:else if wish===2}
 <path d="M76 146Q160 122 244 146V203Q160 224 76 203Z" fill="#c38c63"/><ellipse cx="160" cy="146" rx="84" ry="24" fill="#f7e4b9"/><path d="M76 146v22q10 18 22 0q10-13 22 1q10 18 23 0q10-13 23 1q10 18 23-1q10-13 23 0q17 16 32-1v-22" fill="#f7e4b9"/><path d="M115 123V83H126V123M154 119V79H165V119M194 123V83H205V123" fill="#9aaeb7"/><path d="M120 79q-14-12 0-28q14 16 0 28M159 75q-14-12 0-28q14 16 0 28M199 79q-14-12 0-28q14 16 0 28" fill="#ffc561" stroke="#d19345"/>
 {:else if wish===3||wish===4}
 <g transform="rotate(-13 160 140)"><path d="M92 57H232V211H92Q77 210 77 197V72Q77 57 92 57" fill={wish===3?'#3e465e':'#79464a'}/><path d="M96 65H222V198H96Z" fill={wish===3?'#333b50':'#6a343b'}/><path d="M93 201H229V213H93Q80 211 84 203Z" fill="#e4cda1"/><path d="M100 81H209M100 180H209" stroke="#ccab66"/>{#if wish===3}<path d="m160 93 14 30 33 4-24 22 7 32-30-16-30 16 7-32-24-22 33-4Z" fill="none" stroke="#d6b977"/>{:else}<path d="M160 166C105 134 137 106 160 128C183 106 215 134 160 166Z" fill="#d6b977"/>{/if}</g>
 {:else}
 <path d="M137 59H183V102Q216 121 216 153V203Q160 222 104 203V153Q104 121 137 102Z" fill={wish===1?'#91623e':wish===5?'#739c91':'#8697ae'}/><path d="M134 51H186V72H134Z" fill="#c29b65"/><path d="M111 153Q161 161 209 153V199Q160 211 111 199Z" fill={wish===1?'#b77a3e':wish===5?'#537c70':'#596e91'} stroke="none"/><path d="M119 135H201V185H119Z" fill="#ebd7a4"/>{#if wish===1}<path d="M146 147H174V164Q160 181 146 164ZM160 174V183M149 183H171" fill="#9b5939"/>{:else if wish===5}<path d="M160 144V176M144 160H176" stroke="#57796a" stroke-width="8"/>{:else}<path d="M160 143q-27 24 0 35q27-11 0-35Z" fill="#72819e"/>{/if}<path d="M126 111Q114 130 116 143" fill="none" stroke="#f1deb3" opacity=".7"/>
 {/if}
 </g>
</svg>
<style>.wish-artwork{width:100%;height:100%;display:block}</style>
